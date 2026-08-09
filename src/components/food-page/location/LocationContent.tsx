"use client";

import { useEffect, useMemo, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { IoRestaurantOutline, IoSearchOutline } from "react-icons/io5";

import { useGetStoresQuery } from "@/app/store/locationApi";
import { useUserLocation } from "@/hooks/useUserLocation";
import { calculateDistanceKm } from "@/lib/location/geo";
import {
  buildLocationStoresForFoods,
  filterLocationMenuItems,
} from "@/lib/location/location-food-filter";

import type { LocationStore } from "@/types/location-store";
import type { MenuItem } from "@/types/manu";
import type { CatalogMenuItem } from "@/types/catalog-menu-item";
import type {
  Coordinates,
  LocationFiltersState,
  LocationPermissionStatus,
  LocationSort,
  RecommendationMode,
} from "@/types/location";
import { DEFAULT_LOCATION_FILTERS } from "@/types/location";
import type {
  LocationFoodFilterState,
  LocationFoodSort,
} from "@/types/location-food-filter";
import { DEFAULT_LOCATION_FOOD_FILTERS } from "@/types/location-food-filter";
import type {
  FoodStore,
  StorePageFilters,
  StoreSortBy,
} from "@/types/store-page";

import LocationFilters from "./LocationFilters";
import LocationHeader, {
  type LocationStatus as HeaderLocationStatus,
} from "./LocationHeader";
import LocationPickerModal, {
  type PickedMapLocation,
} from "./picker/LocationPickerModal";
import SingleRecommendation from "./single/SingleRecommendation";
import GroupRecommendation from "./group/GroupRecommendation";

import StoreFilters from "../store/StoreFilters";
import {
  DEFAULT_STORE_FILTERS,
  applyStoreFilters,
  getStoreFilterOptions,
} from "../store/store-page-utils";

interface LocationContentProps {
  menuItems: CatalogMenuItem[];
  searchQuery?: string;
}

function toLocationMenuItem(item: CatalogMenuItem): MenuItem {
  return {
    uuid: item.uuid,
    legacyId: item.id,
    name: item.name,
    localName: item.localName ?? item.name,
    description: item.description ?? "",
    localDescription: item.description ?? "",
    thumbnail: item.thumbnail ?? "",
    gallery: [],
    price: item.price,
    currencyCode: item.currencyCode,
    preparationTimeMinutes: item.preparationTimeMinutes ?? 0,
    availabilityStatus: item.availabilityStatus,
    isFeatured: item.isFeatured,
    source: item.source,
    store: {
      uuid: item.store?.uuid ?? "",
      name: item.store?.name ?? "",
      localName: item.store?.name ?? "",
      logoUrl: "",
      coverImageUrl: "",
      addressLine: "",
      district: "",
      city: "",
      latitude: Number(item.store?.latitude) || 0,
      longitude: Number(item.store?.longitude) || 0,
      operatingStatus: item.store?.operatingStatus ?? "CLOSED",
      averageRating: Number(item.store?.averageRating) || 0,
      totalReviews: 0,
    },
    food: {
      uuid: item.foodUuid ?? item.uuid,
      canonicalName: item.foodName ?? item.name,
      category: item.filterData?.category ?? { code: "", name: "" },
      cuisine: item.filterData?.cuisine ?? { code: "", name: "" },
      spiceLevel: item.filterData?.spiceLevel ?? 0,
      ageGroups: item.filterData?.ageGroups ?? [],
    },
    mealTypes: item.filterData?.mealTypes ?? [],
    dietaryTypes: item.dietaryTypes as MenuItem["dietaryTypes"],
    allergenDeclarations:
      item.allergenDeclarations as MenuItem["allergenDeclarations"],
    ingredients: item.ingredients as string[],
    beveragePairings: [],
    nutrition: {
      calories: 0,
      protein: 0,
      carbohydrate: 0,
      fat: 0,
      fiber: 0,
      sodium: 0,
    },
    distanceKm: 0,
    deliveryFee: 0,
    recommendation: {
      isRecommended: false,
      rankPosition: 0,
      finalScore: 0,
      safetyStatus: "SAFE",
      candidateSource: item.source,
      reasonCodes: [],
      reasonText: "",
      isExploration: false,
      scoreBreakdown: {
        mealMatch: 0,
        cuisineMatch: 0,
        budgetMatch: 0,
        distanceMatch: 0,
        popularity: 0,
      },
    },
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function convertLocationStatus(
  status: LocationPermissionStatus,
  activeCoordinates: Coordinates | null,
): HeaderLocationStatus {
  if (activeCoordinates) {
    return "ready";
  }

  switch (status) {
    case "requesting":
      return "loading";

    case "granted":
      return "ready";

    case "denied":
      return "denied";

    case "unavailable":
    case "unsupported":
      return "unavailable";

    case "idle":
    default:
      return "idle";
  }
}

function mapFoodSortToLocationSort(foodSort: LocationFoodSort): LocationSort {
  switch (foodSort) {
    case "nearest":
      return "nearest";

    case "rating":
      return "highest-rated";

    case "recommended":
    default:
      return "recommended";
  }
}

function mapStoreSortToLocationSort(storeSort: StoreSortBy): LocationSort {
  switch (storeSort) {
    case "name-asc":
      return "name-asc";

    case "rating":
      return "highest-rated";

    case "reviews":
      return "most-reviewed";

    case "default":
    default:
      /*
       * In Group mode the default ordering remains the fairest
       * midpoint result after the Store-page filters are applied.
       */
      return "fairest-distance";
  }
}

function buildSingleLocationFilters(
  foodFilters: LocationFoodFilterState,
): LocationFiltersState {
  return {
    ...DEFAULT_LOCATION_FILTERS,

    radiusKm:
      foodFilters.maximumDistanceKm ?? DEFAULT_LOCATION_FILTERS.radiusKm,

    /*
     * Single-user mode is FOOD first.
     * Store-page filters do not participate in this mode.
     */
    openNow: false,
    deliveryAvailable: false,
    pickupAvailable: false,
    minimumRating: 0,
    safeForAllMembers: false,
    hasMealsForEveryone: false,

    sortBy: mapFoodSortToLocationSort(foodFilters.sortBy),
  };
}

function buildGroupLocationFilters(
  storeFilters: StorePageFilters,
): LocationFiltersState {
  return {
    ...DEFAULT_LOCATION_FILTERS,

    /*
     * StoreFilters itself does not expose a distance control.
     * Group recommendation therefore keeps the existing default
     * midpoint radius (currently 5 km).
     */
    radiusKm: DEFAULT_LOCATION_FILTERS.radiusKm,

    /*
     * These two fields also get applied by applyStoreFilters().
     * Keeping them here makes the GroupRecommendation filtering
     * consistent after the midpoint models have been built.
     */
    openNow: storeFilters.openNowOnly,
    minimumRating: storeFilters.minimumRating ?? 0,

    deliveryAvailable: false,
    pickupAvailable: false,
    safeForAllMembers: false,
    hasMealsForEveryone: false,

    sortBy: mapStoreSortToLocationSort(storeFilters.sortBy),
  };
}

function hasValidCoordinates(
  value: Coordinates | null | undefined,
): value is Coordinates {
  if (!value) {
    return false;
  }

  return (
    Number.isFinite(Number(value.latitude)) &&
    Number.isFinite(Number(value.longitude))
  );
}

export default function LocationContent({
  menuItems: catalogMenuItems,
  searchQuery = "",
}: LocationContentProps) {
  const menuItems = useMemo(
    () => catalogMenuItems.map(toLocationMenuItem),
    [catalogMenuItems],
  );
  const [mode, setMode] = useState<RecommendationMode>("single");

  /*
   * IMPORTANT:
   * Keep the two filter states separate.
   *
   * Single -> Food filters
   * Group  -> Store filters
   *
   * Switching modes will not destroy the previous selections.
   */
  const [foodFilters, setFoodFilters] = useState<LocationFoodFilterState>({
    ...DEFAULT_LOCATION_FOOD_FILTERS,
  });

  const [groupStoreFilters, setGroupStoreFilters] = useState<StorePageFilters>({
    ...DEFAULT_STORE_FILTERS,
    cities: [...DEFAULT_STORE_FILTERS.cities],
    districts: [...DEFAULT_STORE_FILTERS.districts],
    provinces: [...DEFAULT_STORE_FILTERS.provinces],
    operatingStatuses: [...DEFAULT_STORE_FILTERS.operatingStatuses],
    priceLevels: [...DEFAULT_STORE_FILTERS.priceLevels],
  });

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [resultCount, setResultCount] = useState(0);

  const {
    coordinates,
    detectedCoordinates,
    selectedLocation,
    source,
    status,
    error,
    refreshLocation,
    selectManualLocation,
    useCurrentLocation,
  } = useUserLocation();

  const {
    data: sourceStoreData = [],
    isFetching: isStoresFetching,
    refetch: refetchStores,
  } = useGetStoresQuery();

  const sourceStores = useMemo<LocationStore[]>(
    () =>
      Array.isArray(sourceStoreData)
        ? (sourceStoreData as LocationStore[])
        : [],
    [sourceStoreData],
  );

  /*
   * The Store page and Location page read the same store endpoint.
   * This view is only used so we can reuse StoreFilters and
   * store-page-utils without creating a duplicate filter model.
   */
  const storePageStores = useMemo<FoodStore[]>(
    () =>
      Array.isArray(sourceStoreData) ? (sourceStoreData as FoodStore[]) : [],
    [sourceStoreData],
  );

  /* =========================================================
   * SINGLE USER MODE
   * Food filter -> matching foods -> stores that sell them.
   * ========================================================= */

  const effectiveFoodFilters = useMemo<LocationFoodFilterState>(
    () => ({
      ...foodFilters,
      query: searchQuery.trim() || foodFilters.query,
    }),
    [foodFilters, searchQuery],
  );

  const matchingFoods = useMemo(
    () => filterLocationMenuItems(menuItems, effectiveFoodFilters),
    [effectiveFoodFilters, menuItems],
  );

  const foodStores = useMemo(
    () => buildLocationStoresForFoods(matchingFoods, sourceStores),
    [matchingFoods, sourceStores],
  );

  const singleLocationFilters = useMemo(
    () => buildSingleLocationFilters(effectiveFoodFilters),
    [effectiveFoodFilters],
  );

  const singleRadiusKm =
    effectiveFoodFilters.maximumDistanceKm ?? DEFAULT_LOCATION_FILTERS.radiusKm;

  const nearbyStoreCount = useMemo(() => {
    if (!hasValidCoordinates(coordinates)) {
      return foodStores.length;
    }

    return foodStores.filter((store) => {
      if (
        !Number.isFinite(Number(store.latitude)) ||
        !Number.isFinite(Number(store.longitude))
      ) {
        return false;
      }

      const distance = calculateDistanceKm(coordinates, {
        latitude: Number(store.latitude),
        longitude: Number(store.longitude),
      });

      return Number.isFinite(distance) && distance <= singleRadiusKm;
    }).length;
  }, [coordinates, foodStores, singleRadiusKm]);

  /* =========================================================
   * GROUP MODE
   * All stores -> Store-page filters -> midpoint recommendation.
   * Food filters are NOT used to choose candidate stores.
   * ========================================================= */

  const cityOptions = useMemo(
    () => getStoreFilterOptions(storePageStores, (store) => store.city),
    [storePageStores],
  );

  const districtOptions = useMemo(
    () => getStoreFilterOptions(storePageStores, (store) => store.district),
    [storePageStores],
  );

  const provinceOptions = useMemo(
    () => getStoreFilterOptions(storePageStores, (store) => store.province),
    [storePageStores],
  );

  const operatingStatusOptions = useMemo(
    () =>
      getStoreFilterOptions(storePageStores, (store) => store.operatingStatus),
    [storePageStores],
  );

  const priceLevelOptions = useMemo(
    () => getStoreFilterOptions(storePageStores, (store) => store.priceLevel),
    [storePageStores],
  );

  const groupFilteredStores = useMemo<LocationStore[]>(() => {
    /*
     * In Group mode the top-level search is also STORE search.
     * applyStoreFilters() is exactly the same helper used by
     * the Store tab.
     */
    const filtered = applyStoreFilters(
      storePageStores,
      searchQuery,
      groupStoreFilters,
    );

    return filtered as unknown as LocationStore[];
  }, [groupStoreFilters, searchQuery, storePageStores]);

  const groupLocationFilters = useMemo(
    () => buildGroupLocationFilters(groupStoreFilters),
    [groupStoreFilters],
  );

  const effectiveRadiusKm =
    mode === "single" ? singleRadiusKm : groupLocationFilters.radiusKm;

  const headerLocationStatus = convertLocationStatus(status, coordinates);

  const activeLocationLabel =
    selectedLocation?.label ??
    (source === "live"
      ? "កំពុងប្រើទីតាំងបច្ចុប្បន្នរបស់អ្នក"
      : source === "saved"
        ? "កំពុងប្រើទីតាំងដែលបានរក្សាទុកចុងក្រោយ"
        : source === "saved-manual"
          ? "កំពុងប្រើទីតាំងដែលអ្នកបានជ្រើសពីមុន"
          : source === "manual"
            ? "កំពុងប្រើទីតាំងដែលអ្នកបានជ្រើសលើផែនទី"
            : "សូមប្រើទីតាំងបច្ចុប្បន្ន ឬជ្រើសទីតាំងលើផែនទី");

  const isRefreshing = status === "requesting" || isStoresFetching;

  useEffect(() => {
    if (!filtersOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFiltersOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [filtersOpen]);

  const handleModeChange = (nextMode: RecommendationMode) => {
    setMode(nextMode);
    setFiltersOpen(false);
    setResultCount(0);
  };

  const handleRefresh = () => {
    refreshLocation();
    void refetchStores();
  };

  const handleUseCurrentLocation = () => {
    useCurrentLocation();
    setResultCount(0);
  };

  const handleConfirmManualLocation = (pickedLocation: PickedMapLocation) => {
    selectManualLocation({
      latitude: pickedLocation.latitude,
      longitude: pickedLocation.longitude,
      label: pickedLocation.label || "ទីតាំងដែលបានជ្រើសលើផែនទី",
    });

    setLocationPickerOpen(false);
    setResultCount(0);
  };

  const resetFoodFilters = () => {
    setFoodFilters({
      ...DEFAULT_LOCATION_FOOD_FILTERS,
    });

    setResultCount(0);
  };

  const noMatchingFood = matchingFoods.length === 0;
  const noMatchingStore = !noMatchingFood && foodStores.length === 0;

  const noNearbyStore =
    !noMatchingFood &&
    !noMatchingStore &&
    Boolean(coordinates) &&
    nearbyStoreCount === 0;

  const groupStoreFilterProps = {
    filters: groupStoreFilters,
    onChange: setGroupStoreFilters,
    cityOptions,
    districtOptions,
    provinceOptions,
    operatingStatusOptions,
    priceLevelOptions,
  };

  return (
    <>
      <motion.section
        key="location-dashboard"
        initial={{
          opacity: 0,
          y: 16,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: -16,
        }}
        transition={{
          duration: 0.25,
          ease: "easeOut",
        }}
        className="mt-6 min-w-0 text-[17px]"
      >
        <div className="flex min-w-0 items-start gap-7">
          <div
            className="
    sticky top-28
    hidden
    h-[calc(100dvh-8rem)]
    min-h-0
    shrink-0
    self-start
    overflow-hidden
    xl:block
  "
          >
            {mode === "single" ? (
              <LocationFilters
                menuItems={menuItems}
                filters={foodFilters}
                onChange={setFoodFilters}
              />
            ) : (
              <StoreFilters {...groupStoreFilterProps} />
            )}
          </div>

          <main className="min-w-0 flex-1">
            <LocationHeader
              mode={mode}
              storeCount={resultCount}
              radiusKm={effectiveRadiusKm}
              locationStatus={headerLocationStatus}
              locationSource={source}
              locationError={error}
              locationLabel={activeLocationLabel}
              isRefreshing={isRefreshing}
              onModeChange={handleModeChange}
              onRefresh={handleRefresh}
              onOpenFilters={() => setFiltersOpen(true)}
              onUseCurrentLocation={handleUseCurrentLocation}
              onChooseLocation={() => setLocationPickerOpen(true)}
            />

            <div className="mt-6 pb-10">
              {mode === "single" ? (
                !coordinates ? (
                  <ReadableMessage
                    icon={<IoSearchOutline />}
                    title="សូមជ្រើសទីតាំងសម្រាប់ស្វែងរកហាង"
                    description="អ្នកអាចប្រើទីតាំងបច្ចុប្បន្នរបស់អ្នក ឬជ្រើសទីតាំងផ្សេងដោយផ្ទាល់លើផែនទី។"
                    actionLabel="ជ្រើសទីតាំងលើផែនទី"
                    onAction={() => setLocationPickerOpen(true)}
                  />
                ) : noMatchingFood ? (
                  <ReadableMessage
                    icon={<IoRestaurantOutline />}
                    title="រកមិនឃើញមុខម្ហូបដែលត្រូវនឹងជម្រើសរបស់អ្នក"
                    description="សូមកែតម្រងមុខម្ហូប ឬសាកល្បងជ្រើសប្រភេទ របបអាហារ គ្រឿងផ្សំ ឬតម្លៃផ្សេង។"
                    actionLabel="សម្អាតតម្រង"
                    onAction={resetFoodFilters}
                  />
                ) : noMatchingStore ? (
                  <ReadableMessage
                    icon={<IoRestaurantOutline />}
                    title="មានមុខម្ហូបដែលអ្នកចង់បាន ប៉ុន្តែមិនទាន់រកឃើញហាង"
                    description="មុខម្ហូបដែលបានជ្រើសមានក្នុងបញ្ជី FoodHub ប៉ុន្តែមិនទាន់មានព័ត៌មានទីតាំងហាងដែលអាចប្រើបាន។ សូមសាកល្បងមុខម្ហូបផ្សេង។"
                    actionLabel="កែតម្រងមុខម្ហូប"
                    onAction={() => setFiltersOpen(true)}
                  />
                ) : noNearbyStore ? (
                  <ReadableMessage
                    icon={<IoRestaurantOutline />}
                    title="មិនមានហាងដែលមានមុខម្ហូបទាំងនេះនៅក្បែរទីតាំងរបស់អ្នក"
                    description={`សូមពង្រីកចម្ងាយស្វែងរកលើស ${singleRadiusKm} km ឬជ្រើសទីតាំងផ្សេងលើផែនទី។`}
                    actionLabel="កែតម្រងមុខម្ហូប"
                    onAction={() => setFiltersOpen(true)}
                  />
                ) : (
                  <SingleRecommendation
                    /* FOOD-first data only. */
                    menuItems={matchingFoods}
                    stores={foodStores}
                    userLocation={coordinates}
                    filters={singleLocationFilters}
                    foodSort={effectiveFoodFilters.sortBy}
                    searchQuery=""
                    onOpenFilters={() => setFiltersOpen(true)}
                    onResultCountChange={setResultCount}
                  />
                )
              ) : (
                <GroupRecommendation
                  /*
                   * GROUP MODE IS STORE-FIRST.
                   *
                   * menuItems is still supplied so the recommendation
                   * engine can calculate group dietary/allergen compatibility,
                   * but food filters do NOT reduce the candidate stores.
                   */
                  menuItems={menuItems}
                  stores={groupFilteredStores}
                  userLocation={coordinates}
                  filters={groupLocationFilters}
                  /* Store search is already applied by applyStoreFilters(). */
                  searchQuery=""
                  onOpenFilters={() => setFiltersOpen(true)}
                  onResultCountChange={setResultCount}
                />
              )}
            </div>
          </main>
        </div>

        {/* MOBILE / TABLET FILTER DRAWER */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              key={`location-${mode}-filter-drawer`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] xl:hidden"
            >
              <button
                type="button"
                aria-label={
                  mode === "single"
                    ? "Close food filters"
                    : "Close store filters"
                }
                onClick={() => setFiltersOpen(false)}
                className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
              />

              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 32,
                }}
                className="
                  absolute inset-x-0 bottom-0
                  max-h-[92dvh]
                  overflow-y-auto
                  rounded-t-[30px]
                  bg-white
                  pb-8
                  shadow-2xl

                  [scrollbar-width:none]
                  [&::-webkit-scrollbar]:hidden

                  md:bottom-auto
                  md:left-0
                  md:right-auto
                  md:top-0
                  md:h-full
                  md:max-h-none
                  md:w-[390px]
                  md:rounded-none
                  md:rounded-r-[30px]
                "
              >
                {mode === "single" ? (
                  <LocationFilters
                    menuItems={menuItems}
                    filters={foodFilters}
                    onChange={setFoodFilters}
                    onClose={() => setFiltersOpen(false)}
                  />
                ) : (
                  <StoreFilters
                    {...groupStoreFilterProps}
                    onClose={() => setFiltersOpen(false)}
                  />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <LocationPickerModal
        open={locationPickerOpen}
        initialLocation={coordinates}
        detectedLocation={detectedCoordinates}
        onClose={() => setLocationPickerOpen(false)}
        onConfirm={handleConfirmManualLocation}
      />
    </>
  );
}

interface ReadableMessageProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

function ReadableMessage({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: ReadableMessageProps) {
  return (
    <section className="rounded-[26px] border border-orange-100 bg-orange-50 px-5 py-8 text-center sm:px-7 sm:py-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-[30px] text-secondary-500 shadow-sm">
        {icon}
      </div>

      <p
        role="heading"
        aria-level={2}
        className="mx-auto mt-5 max-w-2xl text-[21px] font-bold leading-8 text-primary-900 sm:text-[23px]"
      >
        {title}
      </p>

      <p className="mx-auto mt-2 max-w-2xl text-[17px] leading-8 text-gray-600">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 min-h-12 rounded-full bg-primary-800 px-6 text-[17px] font-semibold text-white transition hover:bg-primary-700"
        >
          {actionLabel}
        </button>
      )}
    </section>
  );
}
