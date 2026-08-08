"use client";

import { useEffect, useMemo, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import {
  IoFilterOutline,
  IoRestaurantOutline,
  IoSearchOutline,
} from "react-icons/io5";

import { useUserLocation } from "@/hooks/useUserLocation";

import { calculateDistanceKm } from "@/lib/location/geo";

import {
  countActiveLocationFoodFilters,
  filterLocationMenuItems,
} from "@/lib/location/location-food-filter";

import { buildLocationStoresFromMenuItems } from "@/lib/location/menu-store-adapter";

import type { MenuItem } from "@/types/manu";

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

import LocationFilters from "./LocationFilters";

import LocationHeader, {
  type LocationStatus as HeaderLocationStatus,
} from "./LocationHeader";

import LocationPickerModal, {
  type PickedMapLocation,
} from "./picker/LocationPickerModal";

import SingleRecommendation from "./single/SingleRecommendation";

import GroupRecommendation from "./group/GroupRecommendation";

interface LocationContentProps {
  menuItems: MenuItem[];

  searchQuery?: string;
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

function mapFoodSortToLocationSort(
  foodSort: LocationFoodSort,
  mode: RecommendationMode,
): LocationSort {
  if (mode === "group") {
    return "fairest-distance";
  }

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

function buildLocationFilters(
  foodFilters: LocationFoodFilterState,
  mode: RecommendationMode,
): LocationFiltersState {
  return {
    ...DEFAULT_LOCATION_FILTERS,

    radiusKm:
      foodFilters.maximumDistanceKm ?? DEFAULT_LOCATION_FILTERS.radiusKm,

    /*
     * These old store filters are disabled.
     * The new flow filters FOOD instead.
     */
    openNow: false,

    deliveryAvailable: false,

    pickupAvailable: false,

    minimumRating: 0,

    safeForAllMembers: false,

    hasMealsForEveryone: false,

    sortBy: mapFoodSortToLocationSort(foodFilters.sortBy, mode),
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
  menuItems,
  searchQuery = "",
}: LocationContentProps) {
  const [mode, setMode] = useState<RecommendationMode>("single");

  const [foodFilters, setFoodFilters] = useState<LocationFoodFilterState>({
    ...DEFAULT_LOCATION_FOOD_FILTERS,
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

  /*
   * Top-level FoodSearch can also filter the
   * Location tab.
   *
   * When it is empty, use the search field
   * inside LocationFilters.
   */
  const effectiveFoodFilters = useMemo<LocationFoodFilterState>(
    () => ({
      ...foodFilters,

      query: searchQuery.trim() || foodFilters.query,
    }),
    [foodFilters, searchQuery],
  );

  /*
   * STEP 1
   *
   * Filter foods.
   */
  const matchingFoods = useMemo(
    () => filterLocationMenuItems(menuItems, effectiveFoodFilters),
    [effectiveFoodFilters, menuItems],
  );

  /*
   * STEP 2
   *
   * Every MenuItem already contains its store reference and coordinates.
   * Build unique Location stores directly from matchingFoods so the Location
   * tab does not make a second GET /stores request.
   */
  const foodStores = useMemo(
    () => buildLocationStoresFromMenuItems(matchingFoods),
    [matchingFoods],
  );

  /*
   * STEP 3
   *
   * Convert food filter distance to the
   * location recommendation radius.
   */
  const locationFilters = useMemo(
    () => buildLocationFilters(effectiveFoodFilters, mode),
    [effectiveFoodFilters, mode],
  );

  const effectiveRadiusKm =
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

      return Number.isFinite(distance) && distance <= effectiveRadiusKm;
    }).length;
  }, [coordinates, effectiveRadiusKm, foodStores]);

  const activeFilterCount = countActiveLocationFoodFilters(foodFilters);

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

  const isRefreshing = status === "requesting";

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

    setResultCount(0);
  };

  const handleRefresh = () => {
    refreshLocation();
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
    mode === "single" &&
    !noMatchingFood &&
    !noMatchingStore &&
    Boolean(coordinates) &&
    nearbyStoreCount === 0;

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
        {/*
         * No fixed height.
         * No LocationContent scrollbar.
         *
         * The normal page scrolls.
         */}
        <div className="flex min-w-0 items-start gap-7">
          {/* Desktop food filters */}
          <div className="sticky top-28 hidden shrink-0 self-start xl:block">
            <LocationFilters
              menuItems={menuItems}
              filters={foodFilters}
              onChange={setFoodFilters}
            />
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
              {!coordinates && mode === "single" ? (
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
                  description={`សូមពង្រីកចម្ងាយស្វែងរកលើស ${effectiveRadiusKm} km ឬជ្រើសទីតាំងផ្សេងលើផែនទី។`}
                  actionLabel="កែតម្រងមុខម្ហូប"
                  onAction={() => setFiltersOpen(true)}
                />
              ) : mode === "single" ? (
                <SingleRecommendation
                  /*
                   * ONLY matching foods.
                   */
                  menuItems={matchingFoods}
                  /*
                   * ONLY stores containing those foods.
                   */
                  stores={foodStores}
                  userLocation={coordinates}
                  filters={locationFilters}
                  foodSort={effectiveFoodFilters.sortBy}
                  /*
                   * Search has already been applied
                   * against FOOD, not store.
                   */
                  searchQuery=""
                  onOpenFilters={() => setFiltersOpen(true)}
                  onResultCountChange={setResultCount}
                />
              ) : (
                <GroupRecommendation
                  /*
                   * Same food-first flow is kept
                   * for group recommendations.
                   */
                  menuItems={matchingFoods}
                  stores={foodStores}
                  userLocation={coordinates}
                  filters={locationFilters}
                  searchQuery=""
                  onOpenFilters={() => setFiltersOpen(true)}
                  onResultCountChange={setResultCount}
                />
              )}
            </div>
          </main>
        </div>

        {/* Mobile / tablet food filter drawer */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              key="location-food-filter-drawer"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="fixed inset-0 z-[1000] xl:hidden"
            >
              <button
                type="button"
                aria-label="Close food filters"
                onClick={() => setFiltersOpen(false)}
                className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
              />

              <motion.div
                initial={{
                  y: "100%",
                }}
                animate={{
                  y: 0,
                }}
                exit={{
                  y: "100%",
                }}
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
                <LocationFilters
                  menuItems={menuItems}
                  filters={foodFilters}
                  onChange={setFoodFilters}
                  onClose={() => setFiltersOpen(false)}
                />
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
