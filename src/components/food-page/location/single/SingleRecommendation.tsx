"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { IoFilterOutline, IoRestaurantOutline } from "react-icons/io5";

import FoodCard from "@/components/dynamic-card/FoodCard";

import type { MenuItem } from "@/types/manu";

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

function safeNumber(value: unknown): number {
  const parsedValue = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

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

  const foodCardElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  const recommendedStores = useMemo(
    () =>
      buildRecommendedStores({
        menuItems,

        stores: sourceStores,

        referencePoint: userLocation,
      }),
    [menuItems, sourceStores, userLocation],
  );

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

  const nearbyFoods = useMemo(() => {
    const distanceByStoreUuid = new Map<string, number>();

    filteredStores.forEach((store) => {
      distanceByStoreUuid.set(
        store.uuid,

        safeNumber(store.distanceKm),
      );
    });

    const foodsWithLiveDistance = menuItems.flatMap((food) => {
      const storeUuid = food.store?.uuid;

      if (!storeUuid) {
        return [];
      }

      const liveDistance = distanceByStoreUuid.get(storeUuid);

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

    return sortFoods(foodsWithLiveDistance, foodSort);
  }, [filteredStores, foodSort, menuItems]);

  useEffect(() => {
    onResultCountChange(nearbyFoods.length);
  }, [nearbyFoods.length, onResultCountChange]);

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

  const registerFoodCard = useCallback(
    (foodUuid: string, node: HTMLDivElement | null) => {
      if (node) {
        foodCardElementsRef.current.set(foodUuid, node);

        return;
      }

      foodCardElementsRef.current.delete(foodUuid);
    },
    [],
  );

  useEffect(() => {
    if (
      nearbyFoods.length === 0 ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter(
            (entry) => entry.isIntersecting && entry.intersectionRatio > 0,
          )
          .sort(
            (first, second) =>
              second.intersectionRatio - first.intersectionRatio,
          );

        const strongestEntry = visibleEntries[0];

        if (!strongestEntry) {
          return;
        }

        const storeId = strongestEntry.target.getAttribute(
          "data-location-store-id",
        );

        if (storeId) {
          setSelectedStoreId((current) =>
            current === storeId ? current : storeId,
          );
        }
      },
      {
        root: null,

        rootMargin: "-12% 0px -42% 0px",

        threshold: [0.15, 0.3, 0.5, 0.7, 0.9],
      },
    );

    const registeredElements = Array.from(foodCardElementsRef.current.values());

    registeredElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [nearbyFoods]);

  useEffect(() => {
    if (selectedStoreId || nearbyFoods.length === 0) {
      return;
    }

    const firstStoreUuid = nearbyFoods[0]?.store?.uuid;

    if (firstStoreUuid) {
      setSelectedStoreId(firstStoreUuid);
    }
  }, [nearbyFoods, selectedStoreId]);

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
                  ref={(node) => registerFoodCard(food.uuid, node)}
                  data-location-store-id={storeUuid ?? ""}
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
                  className={`min-w-0 rounded-[24px] transition-shadow ${
                    selected
                      ? "ring-2 ring-primary-100 ring-offset-2 ring-offset-transparent"
                      : ""
                  }`}
                  onMouseEnter={() => {
                    if (storeUuid) {
                      setSelectedStoreId(storeUuid);
                    }
                  }}
                >
                  <Link
                    href={`/food/${food.uuid}`}
                    className="block h-full w-full min-w-0"
                    onFocus={() => {
                      if (storeUuid) {
                        setSelectedStoreId(storeUuid);
                      }
                    }}
                  >
                    <FoodCard food={food} />
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );

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
