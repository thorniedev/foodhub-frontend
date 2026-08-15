"use client";

import dynamic from "next/dynamic";

import { useEffect, useMemo, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import {
  IoFilterOutline,
  IoLocationOutline,
  IoRestaurantOutline,
} from "react-icons/io5";

import FooodCard from "@/components/dynamic-card/FooodCard";

// IMPORTANT:
// Changed from "@/types/manu" to "@/types/manu1"
import type { MenuItem } from "@/types/manu1";

import type { LocationStore } from "@/types/location-store";

import type { LocationFoodSort } from "@/types/location-food-filter";

import type {
  Coordinates,
  LocationFiltersState,
  LocationViewMode,
} from "@/types/location";

import {
  buildRecommendedStores,
  filterAndSortRecommendedStores,
} from "@/lib/location/recommendation";

import MobileLocationToolbar from "../MobileLocationToolbar";

const FoodLocationMap = dynamic(() => import("../FoodLocationMap"), {
  ssr: false,

  loading: () => (
    <div
      className="
          h-[64dvh]
          min-h-[520px]
          w-full
          animate-pulse
          rounded-[26px]
          bg-gray-100
          sm:h-[650px]
          md:min-h-[600px]
          lg:h-[720px]
          2xl:h-[calc(100dvh-100px)]
          2xl:min-h-[620px]
          2xl:max-h-[900px]
        "
    />
  ),
});

interface SingleRecommendationProps {
  menuItems: MenuItem[];
  stores: LocationStore[];
  userLocation: Coordinates | null;
  filters: LocationFiltersState;
  foodSort?: LocationFoodSort;
  searchQuery: string;
  onOpenFilters: () => void;
  onResultCountChange: (count: number) => void;
}

/**
 * New catalog menu-item API contains:
 *
 * {
 *   storeId: 1,
 *   uuid: "...",
 *   name: "..."
 * }
 *
 * But the old MenuItem structure uses:
 *
 * {
 *   store: {
 *     uuid: "..."
 *   }
 * }
 *
 * We keep manu1 compatible with both structures.
 */
type CatalogMenuItem = MenuItem & {
  storeId?: number | string | null;
};

/**
 * Store API can contain numeric database ID in addition
 * to the UUID used by the location feature.
 */
type CatalogLocationStore = LocationStore & {
  id?: number | string | null;

  storeId?: number | string | null;

  legacyId?: number | string | null;

  storeName?: string;

  name?: string;

  localName?: string | null;

  averageRating?: number | string | null;

  totalReviews?: number | string | null;

  latitude?: number | string | null;

  longitude?: number | string | null;

  logoUrl?: string | null;

  coverImageUrl?: string | null;

  operatingStatus?: unknown;
};

function safeNumber(value: unknown): number {
  const parsedValue = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

/**
 * Get the numeric backend store ID.
 *
 * New menu item:
 * menuItem.storeId
 *
 * should match:
 * store.id
 */
function getBackendStoreId(store: LocationStore): string | null {
  const catalogStore = store as CatalogLocationStore;

  const value =
    catalogStore.id ?? catalogStore.storeId ?? catalogStore.legacyId;

  if (value === null || value === undefined || value === "") {
    return null;
  }

  return String(value);
}

/**
 * Sort food cards.
 */
function sortFoods(foods: MenuItem[], sortBy: LocationFoodSort): MenuItem[] {
  return [...foods].sort((first, second) => {
    switch (sortBy) {
      case "popular":
        return (
          safeNumber(second.store?.totalReviews) -
          safeNumber(first.store?.totalReviews)
        );

      case "rating":
        return (
          safeNumber(second.store?.averageRating) -
          safeNumber(first.store?.averageRating)
        );

      case "fastest":
        return (
          safeNumber(first.preparationTimeMinutes) -
          safeNumber(second.preparationTimeMinutes)
        );

      case "nearest":
        return safeNumber(first.distanceKm) - safeNumber(second.distanceKm);

      case "price-low":
        return safeNumber(first.price) - safeNumber(second.price);

      case "price-high":
        return safeNumber(second.price) - safeNumber(first.price);

      case "recommended":
      default:
        return (
          safeNumber(second.recommendation?.finalScore) -
          safeNumber(first.recommendation?.finalScore)
        );
    }
  });
}

export default function SingleRecommendation({
  menuItems,
  stores: sourceStores,
  userLocation,
  filters,
  foodSort = "recommended",
  searchQuery,
  onOpenFilters,
  onResultCountChange,
}: SingleRecommendationProps) {
  const [view, setView] = useState<LocationViewMode>("list");

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  /**
   * -----------------------------------------
   * STORE LOOKUP
   * -----------------------------------------
   *
   * Creates:
   *
   * store.id -> store
   *
   * Example:
   *
   * 12 -> {
   *   id: 12,
   *   uuid: "abc-123",
   *   storeName: "Malis"
   * }
   */
  const storeByBackendId = useMemo(() => {
    const map = new Map<string, LocationStore>();

    sourceStores.forEach((store) => {
      const backendId = getBackendStoreId(store);

      if (!backendId) {
        return;
      }

      map.set(backendId, store);
    });

    return map;
  }, [sourceStores]);

  const storeByUuid = useMemo(() => {
    const map = new Map<string, LocationStore>();

    sourceStores.forEach((store) => {
      if (store.uuid) {
        map.set(store.uuid, store);
      }
    });

    return map;
  }, [sourceStores]);

  /**
   * -----------------------------------------
   * NORMALIZE NEW MENU API
   * -----------------------------------------
   *
   * New API:
   *
   * {
   *   storeId: 12,
   *   name: "Fried Rice"
   * }
   *
   * becomes:
   *
   * {
   *   storeId: 12,
   *   name: "Fried Rice",
   *   store: {
   *     uuid: "store-uuid"
   *   }
   * }
   *
   * This allows your old location/map logic
   * to continue working.
   */
  const normalizedMenuItems = useMemo<MenuItem[]>(() => {
    return menuItems.map((food) => {
      /**
       * Old API already contains store.uuid.
       *
       * No conversion needed.
       */
      const catalogFood = food as CatalogMenuItem;

      const menuItemStoreId = catalogFood.storeId;
      const nestedStoreUuid = food.store?.uuid;

      /**
       * Menu item doesn't contain storeId.
       */
      if (
        !nestedStoreUuid &&
        (menuItemStoreId === null || menuItemStoreId === undefined)
      ) {
        return food;
      }

      /**
       * Match:
       *
       * menuItem.storeId
       *
       * with:
       *
       * store.id
       */
      const matchedStore =
        (nestedStoreUuid ? storeByUuid.get(nestedStoreUuid) : undefined) ??
        (menuItemStoreId === null || menuItemStoreId === undefined
          ? undefined
          : storeByBackendId.get(String(menuItemStoreId)));

      /**
       * Store wasn't found.
       */
      if (!matchedStore) {
        return food;
      }

      const catalogStore = matchedStore as CatalogLocationStore;

      /**
       * Add the old nested store object
       * needed by FoodCard and location logic.
       */
      const normalizedStore = {
        ...(food.store ?? {}),

        uuid: matchedStore.uuid,

        name: catalogStore.storeName ?? catalogStore.name ?? "",

        localName: catalogStore.localName ?? null,

        averageRating: safeNumber(catalogStore.averageRating),

        totalReviews: safeNumber(catalogStore.totalReviews),

        latitude: safeNumber(catalogStore.latitude),

        longitude: safeNumber(catalogStore.longitude),

        logoUrl: catalogStore.logoUrl ?? undefined,

        coverImageUrl: catalogStore.coverImageUrl ?? undefined,

        operatingStatus: catalogStore.operatingStatus,
      } as NonNullable<MenuItem["store"]>;

      return {
        ...food,

        store: normalizedStore,
      } as MenuItem;
    });
  }, [menuItems, storeByBackendId, storeByUuid]);

  /**
   * -----------------------------------------
   * BUILD STORE RECOMMENDATIONS
   * -----------------------------------------
   */
  const recommendedStores = useMemo(
    () =>
      buildRecommendedStores({
        // IMPORTANT:
        // use normalized data instead of raw menuItems
        menuItems: normalizedMenuItems,

        stores: sourceStores,

        referencePoint: userLocation,
      }),

    [normalizedMenuItems, sourceStores, userLocation],
  );

  /**
   * -----------------------------------------
   * FILTER STORES
   * -----------------------------------------
   */
  const filteredStores = useMemo(
    () =>
      filterAndSortRecommendedStores({
        stores: recommendedStores,

        filters,

        mode: "single",

        searchQuery,
      }),

    [filters, recommendedStores, searchQuery],
  );

  /**
   * -----------------------------------------
   * FOOD ITEMS NEAR USER
   * -----------------------------------------
   */
  const nearbyFoods = useMemo(() => {
    /**
     * Map:
     *
     * storeUuid -> distance
     */
    const distanceByStoreUuid = new Map<string, number>();

    filteredStores.forEach((store) => {
      distanceByStoreUuid.set(
        store.uuid,

        safeNumber(store.distanceKm),
      );
    });

    /**
     * IMPORTANT:
     *
     * Use normalizedMenuItems here,
     * NOT raw menuItems.
     */
    const foodsWithLiveDistance = normalizedMenuItems.flatMap((food) => {
      const storeUuid = food.store?.uuid;

      /**
       * If we still cannot find
       * the store, exclude it.
       */
      if (!storeUuid) {
        return [];
      }

      const liveDistance = distanceByStoreUuid.get(storeUuid);

      /**
       * Store is outside current
       * location/filter result.
       */
      if (liveDistance === undefined) {
        return [];
      }

      return [
        {
          ...food,

          distanceKm: Number(liveDistance.toFixed(1)),
        },
      ];
    });

    return sortFoods(
      foodsWithLiveDistance,

      foodSort,
    );
  }, [filteredStores, foodSort, normalizedMenuItems]);

  /**
   * Update result count.
   */
  useEffect(() => {
    onResultCountChange(nearbyFoods.length);
  }, [nearbyFoods.length, onResultCountChange]);

  /**
   * Clear selected store when the
   * selected store disappears after filtering.
   */
  useEffect(() => {
    if (!selectedStoreId) {
      return;
    }

    const selectedStoreStillVisible = filteredStores.some(
      (store) => store.uuid === selectedStoreId,
    );

    if (!selectedStoreStillVisible) {
      setSelectedStoreId(null);
    }
  }, [filteredStores, selectedStoreId]);

  /**
   * Open the selected store on the map only when
   * the user intentionally asks to see its location.
   *
   * Mobile/tablet:
   * switch from the list to the map.
   *
   * Desktop:
   * the split layout stays visible and the map can
   * focus the selected store.
   */
  const handleViewDestination = (storeUuid?: string | null) => {
    if (!storeUuid) {
      return;
    }

    setSelectedStoreId(storeUuid);
    setView("map");
  };

  /**
   * -----------------------------------------
   * FOOD LIST
   * -----------------------------------------
   */
  const list = (
    <div className="min-w-0">
      {nearbyFoods.length === 0 ? (
        <section className="rounded-[24px] border border-dashed border-gray-200 bg-white px-5 py-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <IoRestaurantOutline className="text-[30px]" />
          </div>

          <p
            role="heading"
            aria-level={2}
            className="mt-4 text-[21px] font-semibold text-primary-900"
          >
            មិនមានមុខម្ហូបនៅក្បែរទីតាំងនេះទេ
          </p>

          <p className="mx-auto mt-2 max-w-md text-[17px] leading-8 text-gray-500">
            សូមពង្រីកចម្ងាយស្វែងរក ឬកែតម្រងមុខម្ហូបរបស់អ្នក។
          </p>

          <button
            type="button"
            onClick={onOpenFilters}
            className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary-800 px-6 text-[17px] font-semibold text-white transition hover:bg-primary-700"
          >
            <IoFilterOutline className="text-[21px]" />
            កែតម្រងមុខម្ហូប
          </button>
        </section>
      ) : (
        <motion.div
          layout
          className="
            grid
            min-w-0
            grid-cols-1
            gap-x-5
            gap-y-4
            md:grid-cols-2
            2xl:grid-cols-1
            2xl:gap-y-4
          "
        >
          <AnimatePresence mode="popLayout">
            {nearbyFoods.map((food) => {
              const storeUuid = food.store?.uuid;

              const selected = Boolean(
                storeUuid && selectedStoreId === storeUuid,
              );

              return (
                <motion.div
                  layout
                  key={food.uuid}
                  initial={{
                    opacity: 0,
                    scale: 0.97,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.97,
                  }}
                  transition={{
                    duration: 0.22,
                  }}
                  className={`
        min-w-0
        rounded-[24px]
        transition-shadow
        ${selected ? "ring-2 ring-primary-300 ring-offset-2" : ""}
      `}
                >
                  <FooodCard
                    food={food as unknown as import("@/types/catalog-menu-item").CatalogMenuItem}
                    isMapSelected={selected}
                    onViewMap={handleViewDestination}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );

  /**
   * -----------------------------------------
   * MAP
   * -----------------------------------------
   */
  const map = (
    <FoodLocationMap
      mode="single"
      userLocation={userLocation}
      stores={filteredStores}
      selectedStoreId={selectedStoreId}
      radiusKm={filters.radiusKm}
      onSelectStore={setSelectedStoreId}
    />
  );

  /**
   * -----------------------------------------
   * PAGE
   * -----------------------------------------
   */
  return (
    <section className="min-w-0 text-[17px]">
      <MobileLocationToolbar
        view={view}
        onViewChange={setView}
        onOpenFilters={onOpenFilters}
      />

      <div className="2xl:hidden">{view === "list" ? list : map}</div>

      <div
        className="
          hidden
          min-w-0
          2xl:grid
          2xl:grid-cols-[minmax(320px,34%)_minmax(0,66%)]
          2xl:gap-2.5
        "
      >
        <div className="min-w-0">{list}</div>

        <div className="min-w-0">
          <div className="sticky top-20">{map}</div>
        </div>
      </div>
    </section>
  );
}
