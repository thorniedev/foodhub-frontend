"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import {
  IoChevronBack,
  IoChevronForward,
  IoLocationOutline,
  IoNavigateOutline,
  IoTimeOutline,
  IoSearchOutline,
} from "react-icons/io5";

import type { FoodStore } from "@/types/store-page";

import Link from "next/link";

import StoreCard, { StoreImage } from "./StoreCard";

import {
  formatStoreDistance,
  getBackendDistanceKm,
  getStoreOpenNowLabel,
} from "./store-page-utils";

type StoreGridProps = {
  stores: FoodStore[];
  onReset: () => void;
  distanceByStoreUuid?: Record<string, number>;
};

const AUTO_PLAY_DELAY = 5000;
const MAX_FEATURED_STORES = 6;
const ITEMS_PER_PAGE = 9;

function getRating(store: FoodStore): number {
  return Number.isFinite(store.averageRating) ? store.averageRating : 0;
}

function getNearestFeaturedStores(
  stores: FoodStore[],
  distanceByStoreUuid?: Record<string, number>,
): FoodStore[] {
  const hasDistances =
    distanceByStoreUuid &&
    Object.values(distanceByStoreUuid).some((d) => Number.isFinite(d));

  return [...stores]
    .sort((first, second) => {
      if (hasDistances) {
        const d1 =
          distanceByStoreUuid?.[first.uuid] ??
          getBackendDistanceKm(first) ??
          Infinity;
        const d2 =
          distanceByStoreUuid?.[second.uuid] ??
          getBackendDistanceKm(second) ??
          Infinity;

        // If one has valid distance and the other does not
        if (Number.isFinite(d1) && !Number.isFinite(d2)) return -1;
        if (!Number.isFinite(d1) && Number.isFinite(d2)) return 1;

        // If distance difference is significant (> 0.2km), closer store ranks first
        if (Math.abs(d1 - d2) > 0.2) {
          return d1 - d2;
        }

        // For stores at roughly the same distance, open store comes first
        const openNowDifference =
          Number(second.isOpenNow) - Number(first.isOpenNow);
        if (openNowDifference !== 0) {
          return openNowDifference;
        }

        if (d1 !== d2) {
          return d1 - d2;
        }
      } else {
        // Fallback when user location is not active: open stores first
        const openNowDifference =
          Number(second.isOpenNow) - Number(first.isOpenNow);
        if (openNowDifference !== 0) {
          return openNowDifference;
        }
      }

      const ratingDifference = getRating(second) - getRating(first);
      if (ratingDifference !== 0) {
        return ratingDifference;
      }

      return Number(second.totalReviews ?? 0) - Number(first.totalReviews ?? 0);
    })
    .slice(0, MAX_FEATURED_STORES);
}

function getDisplayName(store: FoodStore): string {
  return store.storeName?.trim() || "Food store";
}

function getAddressLabel(store: FoodStore): string {
  const values = [store.addressLine, store.city, store.province]
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);

  return Array.from(new Set(values)).join(", ") || "មិនមានអាសយដ្ឋាន";
}

function FeaturedStoreBanner({
  store,
  distanceKm,
}: {
  store: FoodStore;
  distanceKm?: number | null;
}) {
  const displayName = getDisplayName(store);

  const addressLabel = getAddressLabel(store);

  const statusLabel = getStoreOpenNowLabel(store);

  const distanceLabel = formatStoreDistance(
    distanceKm ?? getBackendDistanceKm(store),
  );

  return (
    <Link
      href={`/store/${store.uuid}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-[32px]"
    >
      <motion.article
        key={store.uuid}
        initial={{
          opacity: 0,
          x: 26,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        exit={{
          opacity: 0,
          x: -26,
        }}
        transition={{
          duration: 0.34,
          ease: "easeOut",
        }}
        className="
          group
          cursor-pointer
          overflow-hidden
          rounded-[32px]
          border border-gray-100/60
          bg-white
          shadow-[0_8px_30px_rgb(0,0,0,0.06)]
          transition-all duration-300
          hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)]
          hover:-translate-y-1
        "
      >
        <div
          className="
            grid grid-cols-1

            md:grid-cols-[0.9fr_1.1fr]
          "
        >
          {/* Banner image */}
          <div
            className="
              relative
              h-[205px]
              bg-white

              sm:h-[230px]
              md:h-[270px]
            "
          >
            <StoreImage store={store} />
          </div>

          {/* Banner content */}
          <div
            className="
              flex min-w-0
              flex-col justify-center
              p-5

              sm:p-6
              lg:p-7
            "
          >
            <p
              className="
                text-[18px]
                font-semibold
                text-secondary-500
              "
            >
              ជម្រើសសម្រាប់អ្នក
            </p>

            <h2
              className="
                mt-1 truncate
                text-[24px]
                font-bold
                text-primary-900
                transition-colors
                group-hover:text-primary-700

                sm:text-[28px]
              "
            >
              {displayName}
            </h2>

            <div className="mt-3 flex items-start gap-2 text-gray-500">
              <IoLocationOutline className="mt-1 shrink-0 text-[19px] text-gray-400" />

              <p className="line-clamp-2 text-[18px] leading-6">{addressLabel}</p>
            </div>

            <div
              className="
                mt-4 flex
                flex-wrap items-center
                gap-x-5 gap-y-2
                text-[18px]
              "
            >
              <span className="inline-flex items-center gap-1.5 font-medium text-gray-600">
                <IoTimeOutline className="text-[20px] text-gray-400" />
                {statusLabel}
              </span>

              <span className="inline-flex items-center gap-1.5 font-medium text-primary-700">
                <IoNavigateOutline className="text-[20px]" />
                {distanceLabel}
              </span>
            </div>

            <div className="mt-5">
              <span
                className="
                  inline-flex min-h-11
                  items-center justify-center
                  rounded-full
                  bg-primary-800
                  px-5
                  text-[18px]
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  group-hover:bg-primary-700
                  active:scale-95
                "
              >
                ចូលមើលហាង
              </span>
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

export default function StoreGrid({
  stores,
  onReset,
  distanceByStoreUuid = {},
}: StoreGridProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const allStoresSectionRef = useRef<HTMLDivElement>(null);

  // Reset to page 1 when stores list changes (e.g. after filter change)
  useEffect(() => {
    setCurrentPage(1);
  }, [stores]);

  const hasUserDistance = useMemo(() => {
    return (
      distanceByStoreUuid &&
      Object.values(distanceByStoreUuid).some((d) => Number.isFinite(d))
    );
  }, [distanceByStoreUuid]);

  const featuredStores = useMemo(
    () => getNearestFeaturedStores(stores, distanceByStoreUuid),
    [stores, distanceByStoreUuid],
  );

  useEffect(() => {
    if (featuredStores.length <= 1 || isPaused) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) =>
        currentIndex === featuredStores.length - 1 ? 0 : currentIndex + 1,
      );
    }, AUTO_PLAY_DELAY);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [featuredStores.length, isPaused]);

  useEffect(() => {
    if (featuredStores.length === 0) {
      setActiveIndex(0);
      return;
    }

    if (activeIndex > featuredStores.length - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, featuredStores.length]);

  const goToPrevious = () => {
    if (featuredStores.length <= 1) {
      return;
    }

    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? featuredStores.length - 1 : currentIndex - 1,
    );
  };

  const goToNext = () => {
    if (featuredStores.length <= 1) {
      return;
    }

    setActiveIndex((currentIndex) =>
      currentIndex === featuredStores.length - 1 ? 0 : currentIndex + 1,
    );
  };

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.max(1, Math.ceil(stores.length / ITEMS_PER_PAGE));

  const paginatedStores = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return stores.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [stores, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    if (allStoresSectionRef.current) {
      const top =
        allStoresSectionRef.current.getBoundingClientRect().top +
        window.scrollY -
        90;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const visiblePages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  }, [currentPage, totalPages]);

  if (stores.length === 0) {
    return (
      <motion.div
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.22,
        }}
        className="
          rounded-[22px]
          border border-dashed border-gray-200
          bg-white
          px-5 py-14
          text-center
        "
      >
        <div
          className="
            mx-auto flex h-14 w-14
            items-center justify-center
            rounded-full
            bg-primary-50
            text-primary-700
          "
        >
          <IoSearchOutline className="text-[26px]" />
        </div>

        <p
          className="
            mt-4
            text-[21px]
            font-bold
            text-primary-900
          "
        >
          រកមិនឃើញហាងអាហារដែលត្រូវនឹងតម្រងទេ
        </p>

        <p
          className="
            mx-auto mt-2
            max-w-md
            text-[18px]
            leading-7
            text-gray-500
          "
        >
          សូមសាកល្បងផ្លាស់ប្តូរតម្រងស្វែងរក ឬសម្អាតតម្រងទាំងអស់ដើម្បីមើលហាងទាំងអស់ឡើងវិញ។
        </p>

        <button
          type="button"
          onClick={onReset}
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
            active:scale-95
          "
        >
          សម្អាតតម្រងទាំងអស់
        </button>
      </motion.div>
    );
  }

  return (
    <div className="min-w-0">
      {/* Featured store banner */}
      {featuredStores.length > 0 && (
        <section
          className="mb-8"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="
              mb-4
              flex flex-wrap
              items-end justify-between
              gap-3
            "
          >
            <div className="min-w-0">
              <p
                className="
                  text-[18px]
                  font-semibold
                  text-secondary-500
                  flex items-center gap-1.5
                "
              >
                <IoNavigateOutline className="text-[18px]" />
                {hasUserDistance ? "ហាងនៅជិតអ្នកបំផុត" : "ជម្រើសសម្រាប់អ្នក"}
              </p>

              <p
                className="
                  mt-1
                  text-[22px]
                  font-bold
                  text-primary-900

                  sm:text-[24px]
                "
              >
                {hasUserDistance
                  ? "ហាងអាហារនៅជិតអ្នកដែលគួរសាកល្បង"
                  : "ហាងអាហារដែលគួរសាកល្បង"}
              </p>
            </div>

            {featuredStores.length > 1 && (
              <div
                className="
                  flex shrink-0
                  items-center gap-2
                "
              >
                <button
                  type="button"
                  aria-label="Previous featured store"
                  onClick={goToPrevious}
                  className="
                    flex h-10 w-10
                    items-center justify-center
                    rounded-full
                    border border-gray-200
                    bg-white
                    text-primary-800 dark:text-primary-dark
                    shadow-sm
                    transition
                    hover:border-primary-300
                    hover:bg-primary-50
                    active:scale-90
                  "
                >
                  <IoChevronBack className="text-[21px]" />
                </button>

                <button
                  type="button"
                  aria-label="Next featured store"
                  onClick={goToNext}
                  className="
                    flex h-10 w-10
                    items-center justify-center
                    rounded-full
                    bg-primary-800
                    text-white
                    shadow-sm
                    transition
                    hover:bg-primary-700
                    active:scale-90
                  "
                >
                  <IoChevronForward className="text-[21px]" />
                </button>
              </div>
            )}
          </div>

          {(() => {
            const safeActiveIndex =
              activeIndex >= 0 && activeIndex < featuredStores.length
                ? activeIndex
                : 0;
            const currentFeaturedStore = featuredStores[safeActiveIndex] ?? null;

            if (!currentFeaturedStore) return null;

            return (
              <>
                <div className="relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    <FeaturedStoreBanner
                      key={currentFeaturedStore.uuid}
                      store={currentFeaturedStore}
                      distanceKm={
                        currentFeaturedStore.uuid
                          ? distanceByStoreUuid[currentFeaturedStore.uuid]
                          : undefined
                      }
                    />
                  </AnimatePresence>
                </div>

                {featuredStores.length > 1 && (
                  <div
                    className="
                      mt-3
                      flex items-center
                      justify-center
                      gap-2
                    "
                  >
                    {featuredStores.map((store, index) => (
                      <button
                        key={store.uuid}
                        type="button"
                        aria-label={`Go to featured store ${index + 1}`}
                        aria-current={
                          safeActiveIndex === index ? "true" : undefined
                        }
                        onClick={() => setActiveIndex(index)}
                        className={`
                            h-2
                            rounded-full
                            transition-all
                            duration-300

                            ${
                              safeActiveIndex === index
                                ? "w-7 bg-primary-800"
                                : "w-2 bg-primary-200 hover:bg-primary-400"
                            }
                          `}
                      />
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </section>
      )}

      {/* All stores */}
      <section ref={allStoresSectionRef}>
        <div
          className="
            mb-5
            flex flex-wrap
            items-end justify-between
            gap-3
          "
        >
          <div>
            <p
              className="
                text-[18px]
                font-semibold
                text-secondary-500
              "
            >
              ហាងអាហារទាំងអស់
            </p>

            <p
              className="
                mt-1
                text-[22px]
                font-bold
                text-primary-900

                sm:text-[24px]
              "
            >
              ស្វែងរកហាងដែលអ្នកចូលចិត្ត
            </p>
          </div>

          <span
            className="
              rounded-full
              border border-gray-200
              bg-white
              px-4 py-2
              text-[18px]
              font-semibold
              text-gray-600
              shadow-sm
            "
          >
            {stores.length} ហាង
          </span>
        </div>

        <motion.div
          layout
          className="
            grid grid-cols-1
            gap-5

            md:grid-cols-3
            2xl:grid-cols-3
          "
        >
          <AnimatePresence mode="popLayout">
            {paginatedStores.map((store) => (
              <Link
                key={store.uuid}
                href={`/store/${store.uuid}`}
                className="block"
              >
                <StoreCard
                  store={store}
                  distanceKm={distanceByStoreUuid[store.uuid]}
                  variant="grid"
                />
              </Link>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row dark:border-slate-800">
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
              បង្ហាញ <span className="font-semibold text-primary-800 dark:text-emerald-400">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-semibold text-primary-800 dark:text-emerald-400">{Math.min(currentPage * ITEMS_PER_PAGE, stores.length)}</span> នៃ <span className="font-semibold text-primary-800 dark:text-emerald-400">{stores.length}</span> ហាង
            </p>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:border-primary-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-label="Previous page"
              >
                <IoChevronBack className="text-[18px]" />
              </button>

              {visiblePages.map((page, idx) => {
                if (page === "...") {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="flex h-10 w-8 items-center justify-center text-sm font-semibold text-gray-400 dark:text-slate-500"
                    >
                      ...
                    </span>
                  );
                }

                const pageNum = Number(page);
                const isSelected = pageNum === currentPage;

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-sm font-bold transition ${
                      isSelected
                        ? "bg-primary-800 text-white shadow-sm dark:bg-emerald-600"
                        : "border border-gray-200 bg-white text-gray-700 hover:border-primary-700 hover:bg-primary-50/50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:border-primary-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-label="Next page"
              >
                <IoChevronForward className="text-[18px]" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
