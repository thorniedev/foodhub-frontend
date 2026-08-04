"use client";

import { useRef, type RefObject } from "react";

import { AnimatePresence, motion } from "framer-motion";

import {
  IoChevronBack,
  IoChevronForward,
  IoRestaurantOutline,
  IoSearchOutline,
} from "react-icons/io5";

import type { Store } from "@/types/store";

import StoreCard from "./StoreCard";

type StoreGridProps = {
  stores: Store[];
  onReset: () => void;
};

function getFeaturedStores(stores: Store[]): Store[] {
  return [...stores]
    .filter(
      (store) =>
        store.accountStatus === "ACTIVE" && store.reviewStatus === "APPROVED",
    )
    .sort((first, second) => {
      if (second.averageRating !== first.averageRating) {
        return second.averageRating - first.averageRating;
      }

      return second.totalReviews - first.totalReviews;
    })
    .slice(0, 8);
}

function scrollCarousel(
  ref: RefObject<HTMLDivElement | null>,
  direction: "left" | "right",
) {
  ref.current?.scrollBy({
    left: direction === "right" ? 380 : -380,
    behavior: "smooth",
  });
}

export default function StoreGrid({ stores, onReset }: StoreGridProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  if (stores.length === 0) {
    return (
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="rounded-[28px] border border-dashed border-gray-200 bg-white px-5 py-16 text-center shadow-sm"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
          <IoSearchOutline className="text-[30px] text-primary-700" />
        </div>

        <h3 className="mt-4 text-[21px] font-semibold text-primary-900">
          រកមិនឃើញហាងអាហារ
        </h3>

        <p className="mx-auto mt-2 max-w-md text-[16px] leading-7 text-gray-500">
          សូមសាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ឬសម្អាតតម្រងមួយចំនួន។
        </p>

        <button
          type="button"
          onClick={onReset}
          className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary-800 px-5 text-[16px] font-semibold text-white transition hover:bg-primary-700 active:scale-95"
        >
          <IoRestaurantOutline className="text-[20px]" />
          បង្ហាញហាងទាំងអស់
        </button>
      </motion.div>
    );
  }

  const featuredStores = getFeaturedStores(stores);

  return (
    <div className="min-w-0">
      {featuredStores.length > 0 && (
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[16px] font-semibold text-secondary-500">
                ជម្រើសសម្រាប់អ្នក
              </p>

              <p className="mt-1 text-[24px] font-bold text-primary-900 sm:text-[28px]">
                ហាងអាហារដែលគួរសាកល្បង
              </p>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                aria-label="Previous stores"
                onClick={() => scrollCarousel(carouselRef, "left")}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-primary-800 shadow-sm transition hover:border-primary-300 hover:bg-primary-50 active:scale-90"
              >
                <IoChevronBack className="text-[22px]" />
              </button>

              <button
                type="button"
                aria-label="Next stores"
                onClick={() => scrollCarousel(carouselRef, "right")}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-800 text-white shadow-sm transition hover:bg-primary-700 active:scale-90"
              >
                <IoChevronForward className="text-[22px]" />
              </button>
            </div>
          </div>

          <motion.div
            ref={carouselRef}
            layout
            className="
              scrollbar-hide flex min-w-0
              snap-x snap-mandatory gap-4
              overflow-x-auto pb-4
            "
          >
            <AnimatePresence mode="popLayout">
              {featuredStores.map((store) => (
                <StoreCard
                  key={`featured-${store.uuid}`}
                  store={store}
                  variant="featured"
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </section>
      )}

      <section className={featuredStores.length > 0 ? "mt-10" : ""}>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[16px] font-semibold text-secondary-500">
              ហាងអាហារទាំងអស់
            </p>

            <p className="mt-1 text-[24px] font-bold text-primary-900 sm:text-[28px]">
              ស្វែងរកហាងដែលអ្នកចូលចិត្ត
            </p>
          </div>

          <span className="rounded-full border border-gray-200 bg-white px-4 py-2 text-[16px] font-semibold text-gray-600 shadow-sm">
            {stores.length} ហាង
          </span>
        </div>

        <motion.div
          layout
          className="
            grid grid-cols-1 gap-5
            md:grid-cols-2
            2xl:grid-cols-3
          "
        >
          <AnimatePresence mode="popLayout">
            {stores.map((store) => (
              <StoreCard key={store.uuid} store={store} variant="grid" />
            ))}
          </AnimatePresence>
        </motion.div>
      </section>
    </div>
  );
}
