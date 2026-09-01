"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { IoFilterOutline, IoRefreshOutline } from "react-icons/io5";

import { useGetStoresQuery } from "@/app/store/locationApi";
import { useGetMenuItemsQuery } from "@/app/store/menuApi";
import { usePublicSearchQuery } from "@/app/store/searchApi";

import { useUserLocation } from "@/hooks/useUserLocation";

import { calculateDistanceKm } from "@/lib/location/geo";

import type { CatalogMenuItem } from "@/types/catalog-menu-item";
import type { FoodStore, StorePageFilters } from "@/types/store-page";

import StoreFilters from "./StoreFilters";
import StoreGrid from "./StoreGrid";

import {
  DEFAULT_STORE_FILTERS,
  applyStoreFilters,
  countActiveStoreFilters,
  formatOperatingStatusLabel,
  getBackendDistanceKm,
  getStoreFilterOptions,
} from "./store-page-utils";

type StoreContentProps = {
  /*
   * Kept for compatibility with the current parent Food page.
   * Store data itself comes from the real /stores endpoint.
   */
  menuItems?: CatalogMenuItem[];

  searchQuery?: string;
  onClearSearch?: () => void;
};

export default function StoreContent({
  menuItems,
  searchQuery = "",
  onClearSearch,
}: StoreContentProps) {
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const [filters, setFilters] = useState<StorePageFilters>(
    DEFAULT_STORE_FILTERS,
  );

  const [filtersOpen, setFiltersOpen] = useState(false);

  const { coordinates } = useUserLocation();

  const {
    data: stores = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetStoresQuery();

  const { data: catalogMenuItems = [] } = useGetMenuItemsQuery();
  const effectiveMenuItems =
    menuItems && menuItems.length > 0 ? menuItems : catalogMenuItems;

  const validStoreUuidsWithItems = useMemo(() => {
    const set = new Set<string>();
    effectiveMenuItems.forEach((item) => {
      if (item?.store?.uuid) set.add(item.store.uuid);
      if ((item as any)?.storeUuid) set.add((item as any).storeUuid);
    });
    return set;
  }, [effectiveMenuItems]);

  const { data: searchResults } = usePublicSearchQuery(
    { q: deferredSearchQuery },
    { skip: !deferredSearchQuery.trim() },
  );

  // Strict rule: Only show stores that have at least 1 menu item
  const storeData = useMemo(() => {
    const rawStores = stores as FoodStore[];
    if (effectiveMenuItems.length === 0) {
      return rawStores;
    }
    return rawStores.filter((store) => validStoreUuidsWithItems.has(store.uuid));
  }, [stores, effectiveMenuItems, validStoreUuidsWithItems]);

  const cityOptions = useMemo(
    () => getStoreFilterOptions(storeData, (store) => store.city),
    [storeData],
  );

  const provinceOptions = useMemo(
    () => getStoreFilterOptions(storeData, (store) => store.province),
    [storeData],
  );

  const operatingStatusOptions = useMemo(
    () =>
      getStoreFilterOptions(
        storeData,
        (store) => store.operatingStatus,
        (value) => formatOperatingStatusLabel(value),
      ),
    [storeData],
  );

  const hasAverageRatingData = useMemo(
    () => storeData.some((store) => Number(store.averageRating ?? 0) > 0),
    [storeData],
  );

  /**
   * Distance is UI-derived from the user's current FoodHub location and
   * the real latitude/longitude returned by the Store endpoint.
   *
   * We compute it once here instead of recalculating inside every card.
   */
  const distanceByStoreUuid = useMemo<Record<string, number>>(() => {
    return storeData.reduce<Record<string, number>>((result, store) => {
      /**
       * Prefer distanceMeters from the list API when present.
       */
      const backendDistanceKm = getBackendDistanceKm(store);

      if (backendDistanceKm !== null) {
        result[store.uuid] = backendDistanceKm;

        return result;
      }

      /**
       * Current response returns distanceMeters: null,
       * so fall back to calculating from the user's position.
       */
      if (!coordinates) {
        return result;
      }

      const userLatitude = Number(coordinates.latitude);

      const userLongitude = Number(coordinates.longitude);

      const storeLatitude = Number(store.latitude);

      const storeLongitude = Number(store.longitude);

      if (
        !Number.isFinite(userLatitude) ||
        !Number.isFinite(userLongitude) ||
        !Number.isFinite(storeLatitude) ||
        !Number.isFinite(storeLongitude)
      ) {
        return result;
      }

      const distance = calculateDistanceKm(
        {
          latitude: userLatitude,
          longitude: userLongitude,
        },
        {
          latitude: storeLatitude,
          longitude: storeLongitude,
        },
      );

      if (Number.isFinite(distance)) {
        result[store.uuid] = distance;
      }

      return result;
    }, {});
  }, [coordinates, storeData]);

  const hasDistanceData = useMemo(
    () => Object.values(distanceByStoreUuid).some((d) => Number.isFinite(d)),
    [distanceByStoreUuid],
  );

  const filteredStores = useMemo(() => {
    // If backend public search returned matching store hits, filter by hit IDs/names
    if (deferredSearchQuery.trim() && searchResults?.stores?.items?.length) {
      const hitUuids = new Set(
        searchResults.stores.items.map((item) => item.uuid || item.id),
      );
      const matchedFromSearch = storeData.filter((store) =>
        hitUuids.has(store.uuid),
      );

      // If backend matches exist, apply active UI filters to them
      if (matchedFromSearch.length > 0) {
        return applyStoreFilters(
          matchedFromSearch,
          "",
          filters,
          distanceByStoreUuid,
        );
      }
    }

    return applyStoreFilters(
      storeData,
      deferredSearchQuery,
      filters,
      distanceByStoreUuid,
    );
  }, [storeData, deferredSearchQuery, filters, searchResults, distanceByStoreUuid]);

  const activeFilterCount = countActiveStoreFilters(filters);

  useEffect(() => {
    if (!filtersOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFiltersOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleEscape);
    };
  }, [filtersOpen]);

  const resetAll = () => {
    setFilters(DEFAULT_STORE_FILTERS);

    onClearSearch?.();
  };

  const filterProps = {
    filters,
    onChange: setFilters,
    cityOptions,
    provinceOptions,
    operatingStatusOptions,
    hasAverageRatingData,
    hasDistanceData,
  };

  if (isLoading || isFetching) {
    return (
      <div className="mt-6 flex min-w-0 flex-col gap-6 xl:flex-row xl:items-start xl:gap-8 container mx-auto max-w-7xl px-4">
        {/* Desktop Sidebar Skeleton */}
        <aside className="hidden shrink-0 self-start xl:block xl:w-[320px]">
          <div className="flex h-[600px] flex-col gap-5 rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="h-6 w-1/2 animate-pulse rounded-md bg-slate-200" />
            <div className="mt-4 h-4 w-3/4 animate-pulse rounded-md bg-slate-100" />
            <div className="h-4 w-2/3 animate-pulse rounded-md bg-slate-100" />
            <div className="h-4 w-5/6 animate-pulse rounded-md bg-slate-100" />
            
            <div className="mt-8 h-6 w-1/2 animate-pulse rounded-md bg-slate-200" />
            <div className="mt-4 h-4 w-full animate-pulse rounded-md bg-slate-100" />
            <div className="h-4 w-3/4 animate-pulse rounded-md bg-slate-100" />
            <div className="h-4 w-2/3 animate-pulse rounded-md bg-slate-100" />
          </div>
        </aside>

        {/* Grid Skeleton */}
        <main className="min-w-0 flex-1">
          {/* Mobile Filter Button Skeleton */}
          <div className="mb-4 flex items-center justify-between xl:hidden">
            <div className="h-6 w-24 animate-pulse rounded-md bg-slate-200" />
            <div className="h-11 w-28 animate-pulse rounded-full bg-slate-200" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 pb-10">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex h-[320px] flex-col overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm"
              >
                {/* Image Skeleton */}
                <div className="h-[180px] w-full animate-pulse bg-slate-100" />
                
                {/* Content Skeleton */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div className="space-y-3">
                    <div className="h-5 w-3/4 animate-pulse rounded-md bg-slate-200" />
                    <div className="flex gap-2">
                      <div className="h-4 w-1/3 animate-pulse rounded-md bg-slate-100" />
                      <div className="h-4 w-1/4 animate-pulse rounded-md bg-slate-100" />
                    </div>
                  </div>
                  
                  {/* Bottom Row */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="h-4 w-1/4 animate-pulse rounded-md bg-slate-200" />
                    <div className="h-8 w-8 animate-pulse rounded-full bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="
          mt-6
          rounded-[22px]
          border border-red-100
          bg-white
          px-5 py-12
          text-center
          shadow-sm
        "
      >
        <p
          className="
            text-[21px]
            font-semibold
            text-primary-900
          "
        >
          មិនអាចទាញយកទិន្នន័យហាងបានទេ
        </p>

        <p
          className="
            mx-auto mt-2
            max-w-lg
            text-[18px]
            leading-7
            text-gray-500
          "
        >
          សូមពិនិត្យថា FoodHub backend កំពុងដំណើរការ ហើយព្យាយាមម្តងទៀត។
        </p>

        <button
          type="button"
          onClick={() => void refetch()}
          className="
            mt-5
            inline-flex min-h-12
            items-center justify-center
            gap-2
            rounded-full
            bg-primary-800
            px-6
            text-[18px]
            font-semibold
            text-white
            transition
            hover:bg-primary-700
          "
        >
          <IoRefreshOutline className="text-[20px]" />
          ព្យាយាមម្តងទៀត
        </button>
      </div>
    );
  }

  return (
    <motion.section
      key="store-dashboard"
      initial={{
        opacity: 0,
        y: 14,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -14,
      }}
      transition={{
        duration: 0.24,
        ease: "easeOut",
      }}
      className="
        mt-6
        min-w-0
        container mx-auto max-w-7xl px-4
      "
    >
      <div
        className="
          flex min-w-0
          flex-col gap-6

          xl:flex-row
          xl:items-start
          xl:gap-8
        "
      >
        {/* Desktop filter */}
        <aside
          className="
            hidden
            shrink-0
            self-start

            xl:sticky
            xl:top-24
            xl:block
            xl:h-[calc(100dvh-7rem)]
            xl:max-h-[calc(100dvh-7rem)]
            xl:overflow-hidden
          "
        >
          <StoreFilters {...filterProps} />
        </aside>

        {/* Banner + store cards */}
        <main
          className="
            min-w-0
            flex-1
          "
        >
          {/* Compact mobile/tablet filter action */}
          <div
            className="
              mb-4
              flex items-center
              justify-between
              gap-3
              xl:hidden
            "
          >
            <p
              className="
                truncate
                text-[18px]
                font-medium
                text-gray-500
              "
            >
              {filteredStores.length} ហាង
            </p>

            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="
                inline-flex min-h-11
                shrink-0
                items-center justify-center
                gap-2
                rounded-full
                bg-primary-800
                px-4
                text-[18px]
                font-semibold
                text-white
                transition
                hover:bg-primary-700
                active:scale-95
              "
            >
              <IoFilterOutline className="text-[20px]" />
              តម្រង
              {activeFilterCount > 0 && (
                <span
                  className="
                    flex h-6 min-w-6
                    items-center justify-center
                    rounded-full
                    bg-secondary-500
                    px-1.5
                    text-[18px]
                    font-bold
                    text-white
                  "
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <div className="pb-10">
            <StoreGrid
              stores={filteredStores}
              onReset={resetAll}
              distanceByStoreUuid={distanceByStoreUuid}
            />
          </div>
        </main>
      </div>

      {/* Mobile/tablet filter drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            key="store-filter-drawer"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
            }}
            className="
              fixed inset-0
              z-[100]
              xl:hidden
            "
          >
            <motion.button
              type="button"
              aria-label="Close store filters"
              onClick={() => setFiltersOpen(false)}
              className="
                absolute inset-0
                cursor-default
                bg-black/45
                backdrop-blur-[2px]
              "
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Store filters"
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
                absolute
                inset-x-0 bottom-0
                h-[88dvh]
                overflow-hidden
                rounded-t-[28px]
                bg-white
                shadow-2xl

                md:bottom-auto
                md:left-0
                md:right-auto
                md:top-0
                md:h-full
                md:w-[370px]
                md:rounded-none
                md:rounded-r-[28px]
              "
            >
              <StoreFilters
                {...filterProps}
                onClose={() => setFiltersOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="sr-only">{activeFilterCount}</span>
    </motion.section>
  );
}
