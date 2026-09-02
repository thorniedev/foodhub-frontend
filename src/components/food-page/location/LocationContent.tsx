"use client";

import { useEffect, useMemo, useState, type ComponentProps } from "react";

import { AnimatePresence, motion } from "framer-motion";

import {
  IoAlertCircleOutline,
  IoRestaurantOutline,
  IoSearchOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";

import {
  useGetStoresQuery,
  useGetNearbyStoresQuery,
} from "@/app/store/locationApi";
import { useGetMemberProfilesQuery } from "@/app/store/memberProfileApi";
import { useCreateRecommendationSessionMutation } from "@/app/store/recommendationApi";
import { useUserLocation } from "@/hooks/useUserLocation";
import {
  getRecommendationTargets,
  useRecommendationProfileSelection,
} from "@/hooks/useRecommendationProfileSelection";
import { useEnrichedRecommendationItems } from "@/hooks/useEnrichedRecommendationItems";
import { calculateDistanceKm } from "@/lib/location/geo";
import {
  buildLocationStoresForFoods,
  filterLocationMenuItems,
} from "@/lib/location/location-food-filter";


import type { LocationStore } from "@/types/location-store";
import type { MenuItem } from "@/types/manu";
import type { CatalogMenuItem } from "@/types/catalog-menu-item";
import type { MemberProfile } from "@/types/member-profile/member-profile";
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
import { ProfileMultiSelect } from "@/components/profile/ProfileMultiSelect";
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

function normalizeLocationAllergens(
  values: CatalogMenuItem["allergenDeclarations"],
): MenuItem["allergenDeclarations"] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.flatMap((value) => {
    if (typeof value !== "object" || value === null) {
      return [];
    }

    const record = value as Record<string, unknown>;

    const code = typeof record.code === "string" ? record.code.trim() : "";

    const name = typeof record.name === "string" ? record.name.trim() : code;

    if (!code || !name) {
      return [];
    }

    return [
      {
        ...record,
        code,
        name,
      },
    ];
  }) as MenuItem["allergenDeclarations"];
}

function toLocationMenuItem(item: CatalogMenuItem): MenuItem {
  const category = item.food?.category ?? {
    code: "",
    name: "",
  };

  const cuisine = item.food?.cuisine ?? {
    code: "",
    name: "",
  };

  const ageGroups = Array.isArray(item.food?.ageGroups)
    ? item.food.ageGroups
    : [];

  const mealTypes = Array.isArray(item.food?.mealTypes)
    ? item.food.mealTypes
    : [];

  const dietaryTypes = Array.isArray(item.food?.dietaryTypes)
    ? item.food.dietaryTypes
    : [];

  const ingredients = Array.isArray(item.ingredients)
    ? item.ingredients.filter(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    )
    : [];

  const recommendationScore = Number(item.recommendation?.finalScore ?? 0);

  const scoreBreakdown = item.recommendation?.scoreBreakdown;

  const converted = {
    uuid: item.uuid,
    legacyId: Number(item.legacyId ?? 0),

    name: item.name,
    localName: item.localName ?? item.name,

    description: item.description ?? "",
    localDescription: item.localDescription ?? item.description ?? "",

    thumbnail: item.thumbnail ?? "",
    gallery: Array.isArray(item.gallery) ? item.gallery : [],

    price: Number(item.price ?? 0),
    currencyCode: item.currencyCode,

    preparationTimeMinutes: item.preparationTimeMinutes ?? 0,

    availabilityStatus: item.availabilityStatus,
    isFeatured: Boolean(item.isFeatured),
    source: item.source,

    store: {
      uuid: item.store?.uuid ?? "",
      name: item.store?.name ?? "",
      localName: item.store?.localName ?? item.store?.name ?? "",
      logoUrl: item.store?.logoUrl ?? "",
      coverImageUrl: item.store?.coverImageUrl ?? "",
      addressLine: item.store?.addressLine ?? "",
      district: item.store?.district ?? "",
      city: item.store?.city ?? "",
      latitude: Number(item.store?.latitude) || 0,
      longitude: Number(item.store?.longitude) || 0,
      operatingStatus: item.store?.operatingStatus ?? "CLOSED",
      averageRating: Number(item.store?.averageRating) || 0,
      totalReviews: Number(item.store?.totalReviews) || 0,
    },

    food: {
      uuid: item.food?.uuid ?? item.uuid,
      canonicalName: item.food?.canonicalName ?? item.name,
      category,
      cuisine,
      spiceLevel: Number(item.food?.spiceLevel ?? 0),
      ageGroups,
    },

    /*
     * LocationFilter's legacy MenuItem model keeps these at top level.
     * The current CatalogMenuItem response keeps them under item.food.
     */
    mealTypes,
    dietaryTypes,

    allergenDeclarations: normalizeLocationAllergens(item.allergenDeclarations),

    ingredients,
    beveragePairings: [],

    nutrition: {
      calories: Number(item.nutrition?.calories ?? 0),
      protein: Number(item.nutrition?.proteinGrams ?? 0),
      carbohydrate: Number(item.nutrition?.carbsGrams ?? 0),
      fat: Number(item.nutrition?.fatGrams ?? 0),
      fiber: 0,
      sodium: 0,
    },

    distanceKm:
      item.distanceKm === null || item.distanceKm === undefined
        ? 0
        : Number(item.distanceKm),

    deliveryFee: 0,

    recommendation: {
      isRecommended:
        Number.isFinite(recommendationScore) && recommendationScore > 0,
      rankPosition: 0,
      finalScore: Number.isFinite(recommendationScore)
        ? recommendationScore
        : 0,
      safetyStatus: "SAFE",
      candidateSource: item.source,
      reasonCodes: item.recommendation?.reasonCodes ?? [],
      reasonText: item.recommendation?.reasonText ?? "",
      isExploration: false,
      scoreBreakdown: {
        mealMatch: Number(scoreBreakdown?.mealMatch ?? 0),
        cuisineMatch: Number(scoreBreakdown?.cuisineMatch ?? 0),
        budgetMatch: Number(scoreBreakdown?.budgetMatch ?? 0),
        distanceMatch: Number(scoreBreakdown?.distanceMatch ?? 0),
        popularity: Number(scoreBreakdown?.popularity ?? 0),
      },
    },

    /*
     * Context used by LocationFilters for season/event/weather/origin.
     * These are extra compatibility fields on top of the old MenuItem model.
     */
    origin: item.origin
      ? {
        provinceCode: item.origin.provinceCode,
        provinceName: item.origin.provinceName,
        provinceLocalName: item.origin.provinceLocalName,
      }
      : undefined,

    recommendationContext: {
      seasons: Array.isArray(item.food?.seasons) ? item.food.seasons : [],
      events: Array.isArray(item.food?.events) ? item.food.events : [],
      provincePopularity: [],
      suitableWeather: Array.isArray(item.food?.suitableWeather)
        ? item.food.suitableWeather
        : [],
    },

    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };

  return converted as MenuItem;
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
  const [mode, setMode] = useState<RecommendationMode>("me");

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
    provinces: [...DEFAULT_STORE_FILTERS.provinces],
    operatingStatuses: [...DEFAULT_STORE_FILTERS.operatingStatuses],
  });

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [locationPickerTab, setLocationPickerTab] = useState<"map" | "saved">("map");
  const [resultCount, setResultCount] = useState(0);
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(5);

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

  const hasCoordinates = hasValidCoordinates(coordinates);

  const {
    data: allStoresData = [],
    isFetching: isAllStoresFetching,
    refetch: refetchAllStores,
  } = useGetStoresQuery(undefined, { skip: hasCoordinates });

  const {
    data: nearbyStoresData = [],
    isFetching: isNearbyStoresFetching,
    refetch: refetchNearbyStores,
  } = useGetNearbyStoresQuery(
    {
      latitude: coordinates?.latitude ?? 0,
      longitude: coordinates?.longitude ?? 0,
    },
    { skip: !hasCoordinates },
  );

  const refetchStores = hasCoordinates ? refetchNearbyStores : refetchAllStores;
  const sourceStoreData = hasCoordinates ? nearbyStoresData : allStoresData;
  const isStoresFetching = hasCoordinates
    ? isNearbyStoresFetching
    : isAllStoresFetching;

  const sourceStores = useMemo<LocationStore[]>(
    () =>
      Array.isArray(sourceStoreData)
        ? (sourceStoreData as unknown as LocationStore[])
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
   * Safety-filtered + ranked recommendation session (PostgreSQL radius
   * filter, Java safety evaluator, deterministic scoring on the backend)
   * -> enrich ranked items with catalog detail -> preference filters ->
   * stores that sell them. This replaced a purely client-side sort over
   * the entire unauthenticated catalog, which never applied any profile
   * safety filtering at all.
   * ========================================================= */

  const effectiveFoodFilters = useMemo<LocationFoodFilterState>(
    () => ({
      ...foodFilters,
      query: searchQuery.trim() || foodFilters.query,
    }),
    [foodFilters, searchQuery],
  );

  const singleRadiusKm =
    effectiveFoodFilters.maximumDistanceKm ?? DEFAULT_LOCATION_FILTERS.radiusKm;

  const { data: profilesData, isLoading: isLoadingProfiles } =
    useGetMemberProfilesQuery();

  const activeProfiles = useMemo(() => {
    const list = Array.isArray(profilesData)
      ? profilesData
      : profilesData?.contents ?? [];
    return list.filter((profile) => profile.isActive !== false);
  }, [profilesData]);

  // Same selection the AI recommendation modal and the "គណនីសមាជិកគ្រួសារ"
  // dashboard toggle read/write, so picking a profile here (or there) stays
  // in sync everywhere.
  const {
    selectedUuids: selectedProfileUuids,
    toggleProfile: toggleProfileSelection,
    selectAll: selectAllProfileUuids,
  } = useRecommendationProfileSelection();

  const targetProfiles = useMemo(
    () => getRecommendationTargets(activeProfiles, selectedProfileUuids),
    [activeProfiles, selectedProfileUuids],
  );

  const targetProfileUuidsKey = useMemo(
    () => targetProfiles.map((profile) => profile.uuid).join(","),
    [targetProfiles],
  );

  const allActiveProfilesSelected =
    activeProfiles.length > 0 &&
    activeProfiles.every((profile) => selectedProfileUuids.includes(profile.uuid));

  const canRecommend = activeProfiles.length > 0;

  const [
    createRecommendationSession,
    {
      data: recommendationSession,
      isLoading: isRecommendationSessionLoading,
      error: recommendationSessionError,
    },
  ] = useCreateRecommendationSessionMutation();

  const recommendationSessionItems = useMemo(
    () => recommendationSession?.items ?? [],
    [recommendationSession],
  );

  const { enrichedItems: recommendedFoodsRaw, isEnriching } =
    useEnrichedRecommendationItems(
      recommendationSession,
      recommendationSessionItems,
    );

  // Re-run the safety-filtered recommendation whenever a meaningful input
  // changes: location, radius, which profile(s) are targeted, or the search
  // text (passed through as an AI prompt hint). Preference filters
  // (category, cuisine, dietary type, spice level, ...) do NOT retrigger a
  // new session — they narrow the already safety-correct, ranked result
  // client-side, the same way Advanced Filter narrows a candidate set.
  useEffect(() => {
    if (
      mode !== "me" ||
      !hasValidCoordinates(coordinates) ||
      !canRecommend ||
      targetProfiles.length === 0
    ) {
      return;
    }

    void createRecommendationSession({
      mode: targetProfiles.length > 1 ? "GROUP" : "SINGLE",
      requestSource: "DISCOVERY",
      requestedLimit: 50,
      searchRadiusKm: singleRadiusKm,
      contextData: searchQuery.trim()
        ? { userPrompt: searchQuery.trim() }
        : undefined,
      profiles: targetProfiles.map((profile, index) => ({
        profileId: profile.uuid,
        isPrimary: index === 0,
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mode,
    coordinates?.latitude,
    coordinates?.longitude,
    canRecommend,
    targetProfileUuidsKey,
    singleRadiusKm,
    searchQuery,
  ]);

  const handleToggleProfile = (profile: MemberProfile) => {
    toggleProfileSelection(profile.uuid);
  };

  const handleSelectAllProfiles = () => {
    if (allActiveProfilesSelected) {
      selectAllProfileUuids([]);
    } else {
      selectAllProfileUuids(activeProfiles.map((profile) => profile.uuid));
    }
  };

  const recommendedMenuItems = useMemo(() => {
    if (recommendedFoodsRaw.length > 0) {
      return recommendedFoodsRaw.map(toLocationMenuItem);
    }
    return menuItems;
  }, [recommendedFoodsRaw, menuItems]);

  const matchingFoods = useMemo(
    () => filterLocationMenuItems(recommendedMenuItems, effectiveFoodFilters),
    [effectiveFoodFilters, recommendedMenuItems],
  );

  const foodStores = useMemo(
    () => buildLocationStoresForFoods(matchingFoods, sourceStores),
    [matchingFoods, sourceStores],
  );

  const singleLocationFilters = useMemo(
    () => buildSingleLocationFilters(effectiveFoodFilters),
    [effectiveFoodFilters],
  );

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

  const provinceOptions = useMemo(
    () => getStoreFilterOptions(storePageStores, (store) => store.province),
    [storePageStores],
  );

  const operatingStatusOptions = useMemo(
    () =>
      getStoreFilterOptions(storePageStores, (store) => store.operatingStatus),
    [storePageStores],
  );

  const hasAverageRatingData = useMemo(
    () => storePageStores.some((store) => Number(store.averageRating ?? 0) > 0),
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
    mode === "me" ? singleRadiusKm : groupLocationFilters.radiusKm;

  /* Personal mode filters food; the meetup modes filter stores. */
  const usesFoodFilters = mode === "me";

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
    provinceOptions,
    operatingStatusOptions,
    hasAverageRatingData,
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
            {usesFoodFilters ? (
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
              radiusKm={selectedRadiusKm}
              locationStatus={headerLocationStatus}
              locationSource={source}
              locationError={error}
              locationLabel={activeLocationLabel}
              isRefreshing={isRefreshing}
              onModeChange={handleModeChange}
              onRefresh={handleRefresh}
              onOpenFilters={() => setFiltersOpen(true)}
              onUseCurrentLocation={handleUseCurrentLocation}
              onChooseLocation={() => {
                setLocationPickerTab("map");
                setLocationPickerOpen(true);
              }}
              onOpenSavedLocations={() => {
                setLocationPickerTab("saved");
                setLocationPickerOpen(true);
              }}
            />

            <div className="mt-6 pb-10">
              {mode === "me" ? (
                <>
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="min-w-0">
                      <p className="text-lg font-bold text-primary-900 dark:text-white">
                        គណនីដែលកំពុងប្រើ
                      </p>
                      <p className="mt-1 text-lg text-gray-500 dark:text-slate-400">
                        ការណែនាំគិតបញ្ចូលអាឡែស៊ី និងរបបអាហាររបស់គណនីដែលបានជ្រើស
                      </p>
                    </div>

                    <ProfileMultiSelect
                      profiles={activeProfiles}
                      targetProfiles={targetProfiles}
                      onToggle={handleToggleProfile}
                      onSelectAll={handleSelectAllProfiles}
                      allSelected={allActiveProfilesSelected}
                      emptyLabel="ជ្រើសរើសគណនីគ្រួសារ"
                      triggerClassName="flex min-h-12 items-center gap-2 rounded-full bg-primary-50 py-1.5 pl-2 pr-4 text-lg font-bold text-primary-800 transition hover:bg-primary-100 dark:bg-primary-950/40 dark:text-primary-300"
                    />
                  </div>

                  {/* Search Radius for "For Me" mode */}
                  <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
                    <div className="flex items-center justify-between text-lg font-bold text-primary-900 dark:text-slate-200">
                      <span className="font-bold">កាំស្វែងរកហាង</span>
                      <span className="text-primary-800 dark:text-emerald-400 font-bold">{singleRadiusKm} km</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button
                          type="button"
                          key={r}
                          onClick={() => {
                            setSelectedRadiusKm(r);
                            setFoodFilters((prev) => ({
                              ...prev,
                              maximumDistanceKm: r,
                            }));
                          }}
                          className={`rounded-xl py-2.5 text-lg font-bold transition ${
                            singleRadiusKm === r
                              ? "bg-primary-800 text-white shadow-xs dark:bg-emerald-700"
                              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {r} km
                        </button>
                      ))}
                    </div>
                  </div>

                  <SingleRecommendation
                    /* Same runtime shape, declared against @/types/manu1. */
                    menuItems={
                      matchingFoods as unknown as ComponentProps<
                        typeof SingleRecommendation
                      >["menuItems"]
                    }
                    stores={foodStores}
                    userLocation={coordinates}
                    filters={singleLocationFilters}
                    foodSort={foodFilters.sortBy}
                    searchQuery={searchQuery}
                    onOpenFilters={() => setFiltersOpen(true)}
                    onResultCountChange={setResultCount}
                    isLoading={isRecommendationSessionLoading || isEnriching}
                  />
                </>
              ) : (
                <GroupRecommendation
                  meetupMode={mode === "single" ? "friends" : "guest"}
                  menuItems={menuItems}
                  stores={groupFilteredStores}
                  userLocation={coordinates}
                  filters={groupLocationFilters}
                  searchQuery={searchQuery}
                  onOpenFilters={() => setFiltersOpen(true)}
                  onResultCountChange={setResultCount}
                  onRadiusChange={setSelectedRadiusKm}
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
                  usesFoodFilters ? "Close food filters" : "Close store filters"
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
                {usesFoodFilters ? (
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
        initialTab={locationPickerTab}
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
