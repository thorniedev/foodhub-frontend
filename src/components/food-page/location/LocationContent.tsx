"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useGetStoresQuery } from "@/app/store/locationApi";
import { useUserLocation } from "@/hooks/useUserLocation";

import type { MenuItem } from "@/types/manu";
import type {
  Coordinates,
  LocationFiltersState,
  LocationPermissionStatus,
  RecommendationMode,
} from "@/types/location";

import { DEFAULT_LOCATION_FILTERS } from "@/types/location";

import LocationFilters from "./LocationFilters";

import LocationHeader, {
  type LocationSource,
  type LocationStatus as HeaderLocationStatus,
} from "./LocationHeader";

import SingleRecommendation from "./single/SingleRecommendation";
import GroupRecommendation from "./group/GroupRecommendation";

interface LocationContentProps {
  menuItems: MenuItem[];
  searchQuery?: string;
}

function convertLocationStatus(
  status: LocationPermissionStatus,
): HeaderLocationStatus {
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

function getLocationSource(
  coordinates: Coordinates | null,
  status: LocationPermissionStatus,
): LocationSource {
  if (!coordinates) {
    return "fallback";
  }

  if (status === "granted") {
    return "live";
  }

  return "saved";
}

export default function LocationContent({
  menuItems,
  searchQuery = "",
}: LocationContentProps) {
  const [mode, setMode] = useState<RecommendationMode>("single");

  const [filters, setFilters] = useState<LocationFiltersState>(
    DEFAULT_LOCATION_FILTERS,
  );

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [resultCount, setResultCount] = useState(0);

  /*
   * Browser location
   */
  const { coordinates, status, error, refreshLocation } = useUserLocation();

  /*
   * Restaurant mock data from:
   * public/data/stores.json
   */
  const {
    data: stores = [],
    isLoading: isStoresLoading,
    isFetching: isStoresFetching,
    isError: isStoresError,
    refetch: refetchStores,
  } = useGetStoresQuery();

  const headerLocationStatus = convertLocationStatus(status);

  const locationSource = getLocationSource(coordinates, status);

  const isRefreshing = status === "requesting" || isStoresFetching;

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

  const handleModeChange = (nextMode: RecommendationMode) => {
    setMode(nextMode);
    setResultCount(0);

    setFilters((currentFilters) => ({
      ...currentFilters,
      sortBy: nextMode === "single" ? "recommended" : "fairest-distance",
    }));
  };

  const handleFiltersChange = (nextFilters: LocationFiltersState) => {
    setFilters(nextFilters);
  };

  const handleRefresh = () => {
    refreshLocation();
    void refetchStores();
  };

  return (
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
      className="
        mt-6 min-w-0
        xl:h-[calc(100dvh-10rem)]
        xl:overflow-hidden
      "
    >
      <div
        className="
          flex min-w-0 flex-col gap-6
          xl:h-full
          xl:min-h-0
          xl:flex-row
          xl:items-stretch
          xl:gap-8
        "
      >
        {/* Desktop fixed filter sidebar */}
        <div className="hidden h-full min-h-0 shrink-0 xl:block">
          <LocationFilters
            mode={mode}
            filters={filters}
            onModeChange={handleModeChange}
            onChange={handleFiltersChange}
          />
        </div>

        {/* Only this area scrolls on desktop */}
        <main
          className="
            min-w-0 flex-1
            xl:h-full
            xl:min-h-0
            xl:overflow-y-auto
            xl:overscroll-contain
            xl:pr-2
            xl:[scrollbar-width:thin]
            xl:[scrollbar-color:#d1d5db_transparent]
            xl:[&::-webkit-scrollbar]:w-1.5
            xl:[&::-webkit-scrollbar-track]:bg-transparent
            xl:[&::-webkit-scrollbar-thumb]:rounded-full
            xl:[&::-webkit-scrollbar-thumb]:bg-gray-300
            xl:hover:[&::-webkit-scrollbar-thumb]:bg-primary-700
          "
        >
          <LocationHeader
            mode={mode}
            storeCount={resultCount}
            radiusKm={filters.radiusKm}
            locationStatus={headerLocationStatus}
            locationSource={locationSource}
            locationError={error}
            isRefreshing={isRefreshing}
            onModeChange={handleModeChange}
            onRefresh={handleRefresh}
            onOpenFilters={() => setFiltersOpen(true)}
          />

          <div className="mt-6 pb-8">
            {isStoresLoading ? (
              <StoresLoadingState />
            ) : isStoresError ? (
              <StoresErrorState
                onRetry={() => {
                  void refetchStores();
                }}
              />
            ) : mode === "single" ? (
              <SingleRecommendation
                menuItems={menuItems}
                stores={stores}
                userLocation={coordinates}
                filters={filters}
                searchQuery={searchQuery}
                onOpenFilters={() => setFiltersOpen(true)}
                onResultCountChange={setResultCount}
              />
            ) : (
              <GroupRecommendation
                menuItems={menuItems}
                stores={stores}
                userLocation={coordinates}
                filters={filters}
                searchQuery={searchQuery}
                onOpenFilters={() => setFiltersOpen(true)}
                onResultCountChange={setResultCount}
              />
            )}
          </div>
        </main>
      </div>

      {/* Mobile and tablet filter drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            key="location-filter-drawer"
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
            className="fixed inset-0 z-[100] xl:hidden"
          >
            <motion.button
              type="button"
              aria-label="Close location filters"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() => setFiltersOpen(false)}
              className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-[2px]"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Location filters"
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
                h-[88dvh] overflow-hidden
                rounded-t-[30px] bg-white shadow-2xl

                md:bottom-auto
                md:left-0
                md:right-auto
                md:top-0
                md:h-full
                md:w-[370px]
                md:rounded-none
                md:rounded-r-[30px]
              "
            >
              <LocationFilters
                mode={mode}
                filters={filters}
                onModeChange={handleModeChange}
                onChange={handleFiltersChange}
                onClose={() => setFiltersOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function StoresLoadingState() {
  return (
    <div className="space-y-4">
      <div className="h-[180px] animate-pulse rounded-[24px] bg-gray-100" />

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-[230px] animate-pulse rounded-[24px] bg-gray-100"
          />
        ))}
      </div>
    </div>
  );
}

interface StoresErrorStateProps {
  onRetry: () => void;
}

function StoresErrorState({ onRetry }: StoresErrorStateProps) {
  return (
    <div className="rounded-[24px] border border-red-100 bg-white px-5 py-12 text-center shadow-sm">
      <h2 className="text-[20px] font-semibold text-primary-900">
        មិនអាចទាញយកទិន្នន័យហាងបានទេ
      </h2>

      <p className="mx-auto mt-2 max-w-lg text-[16px] leading-7 text-gray-500">
        សូមពិនិត្យថាឯកសារ{" "}
        <span className="font-medium text-gray-700">
          public/data/stores.json
        </span>{" "}
        មានទីតាំងត្រឹមត្រូវ។
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 min-h-11 rounded-full bg-primary-800 px-6 text-[16px] font-semibold text-white transition hover:bg-primary-700"
      >
        ព្យាយាមម្តងទៀត
      </button>
    </div>
  );
}
