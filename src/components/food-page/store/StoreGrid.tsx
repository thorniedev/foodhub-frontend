"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  IoChevronBack,
  IoChevronForward,
  IoLocationOutline,
  IoRestaurantOutline,
  IoSearchOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { FaStar } from "react-icons/fa";

import type { FoodStore } from "@/types/store-page";
import StoreCard from "./StoreCard";

type StoreGridProps = {
  stores: FoodStore[];
  onReset: () => void;
};

const AUTO_PLAY_DELAY = 5000;

function getFeaturedStores(stores: FoodStore[]): FoodStore[] {
  return [...stores]
    .filter(
      (store) =>
        store.accountStatus === "ACTIVE" && store.reviewStatus === "APPROVED",
    )
    .sort((first, second) => {
      const firstRating = Number.isFinite(first.averageRating)
        ? first.averageRating
        : 0;

      const secondRating = Number.isFinite(second.averageRating)
        ? second.averageRating
        : 0;

      if (secondRating !== firstRating) {
        return secondRating - firstRating;
      }

      return (second.totalReviews ?? 0) - (first.totalReviews ?? 0);
    })
    .slice(0, 6);
}

function normalizeImageUrl(value?: string | null): string | null {
  const imageUrl = value?.trim();

  if (!imageUrl) {
    return null;
  }

  if (
    imageUrl.startsWith("/") ||
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  return `/${imageUrl}`;
}

function getDisplayName(store: FoodStore): string {
  return store.storeName?.trim() || "Food store";
}

function getLocationLabel(store: FoodStore): string {
  return (
    [store.district, store.city].filter(Boolean).join(", ") ||
    store.province ||
    "Unknown location"
  );
}

function getStatusLabel(store: FoodStore): string {
  if (store.isOpenNow === true || store.operatingStatus === "OPEN") {
    return "បើកឥឡូវនេះ";
  }

  if (store.isOpenNow === false || store.operatingStatus === "CLOSED") {
    return "បានបិទ";
  }

  return "មិនទាន់ដឹង";
}

function getPriceLabel(priceLevel: number | null): string {
  if (!priceLevel || priceLevel <= 0) {
    return "--";
  }

  return "$".repeat(Math.min(Math.max(Math.round(priceLevel), 1), 4));
}

function FeaturedStoreBanner({ store }: { store: FoodStore }) {
  const displayName = getDisplayName(store);
  const locationLabel = getLocationLabel(store);
  const statusLabel = getStatusLabel(store);
  const priceLabel = getPriceLabel(store.priceLevel);
  const imageUrl =
    normalizeImageUrl(store.coverImageUrl) || normalizeImageUrl(store.logoUrl);

  const averageRating = Number.isFinite(store.averageRating)
    ? store.averageRating
    : 0;

  const isOpen = statusLabel === "បើកឥឡូវនេះ";
  const isClosed = statusLabel === "បានបិទ";

  return (
    <motion.div
      key={store.uuid}
      initial={{ opacity: 0, x: 40, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -40, scale: 0.98 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="overflow-hidden rounded-[28px] border border-primary-100 bg-white shadow-sm"
    >
      <div className="grid min-h-[320px] grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        {/* Image area */}
        <div className="relative min-h-[220px] bg-primary-50 lg:min-h-[320px]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${displayName} banner`}
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-primary-100 bg-white shadow-sm">
                <IoRestaurantOutline className="text-[44px] text-primary-400" />
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent" />

          <div className="absolute left-5 top-5">
            <span
              className={`rounded-full px-3 py-1.5 text-[14px] font-semibold shadow-sm ${
                isOpen
                  ? "bg-emerald-100 text-emerald-700"
                  : isClosed
                    ? "bg-red-100 text-red-600"
                    : "bg-white/90 text-gray-600"
              }`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Content area */}
        <div className="flex flex-col justify-center p-6 sm:p-8">
          <p className="text-[16px] font-semibold text-secondary-500">
            ជម្រើសសម្រាប់អ្នក
          </p>

          <h3 className="mt-2 text-[28px] font-bold leading-tight text-primary-900 sm:text-[34px]">
            {displayName}
          </h3>

          <p className="mt-3 line-clamp-3 text-[16px] leading-7 text-gray-500">
            {store.description ||
              "ហាងអាហារដែលមានគុណភាពល្អ ស្ថិតនៅទីតាំងងាយស្រួល និងសាកសមសម្រាប់អ្នក។"}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-[16px]">
            <div className="flex items-center gap-2 text-accent-400">
              <FaStar className="text-[15px]" />
              <span>
                {averageRating > 0 ? averageRating.toFixed(1) : "ថ្មី"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-primary-400">
              <IoLocationOutline className="text-[18px]" />
              <span>{locationLabel}</span>
            </div>

            <div className="flex items-center gap-2 text-primary-400">
              <IoTimeOutline className="text-[18px]" />
              <span>{statusLabel}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-primary-800 px-4 py-2 text-[15px] font-semibold text-white">
              {store.reviewStatus === "APPROVED"
                ? "បានផ្ទៀងផ្ទាត់"
                : "កំពុងពិនិត្យ"}
            </span>

            <span className="rounded-full border border-primary-700 px-4 py-2 text-[15px] font-semibold text-primary-800">
              {store.accountStatus === "ACTIVE" ? "ហាងសកម្ម" : "មិនសកម្ម"}
            </span>

            <span className="rounded-full bg-secondary-50 px-4 py-2 text-[15px] font-semibold text-secondary-500">
              តម្លៃ {priceLabel}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function StoreGrid({ stores, onReset }: StoreGridProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const featuredStores = useMemo(() => getFeaturedStores(stores), [stores]);

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
    if (activeIndex > featuredStores.length - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, featuredStores.length]);

  const goToPrevious = () => {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? featuredStores.length - 1 : currentIndex - 1,
    );
  };

  const goToNext = () => {
    setActiveIndex((currentIndex) =>
      currentIndex === featuredStores.length - 1 ? 0 : currentIndex + 1,
    );
  };

  if (stores.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
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

  return (
    <div className="min-w-0">
      {/* Featured banner carousel */}
      {featuredStores.length > 0 && (
        <section
          className="mb-10"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[16px] font-semibold text-secondary-500">
                ជម្រើសសម្រាប់អ្នក
              </p>

              <h2 className="mt-1 text-[24px] font-bold text-primary-900 sm:text-[28px]">
                ហាងអាហារដែលគួរសាកល្បង
              </h2>
            </div>

            {featuredStores.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous featured store"
                  onClick={goToPrevious}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-primary-800 shadow-sm transition hover:border-primary-300 hover:bg-primary-50 active:scale-90"
                >
                  <IoChevronBack className="text-[22px]" />
                </button>

                <button
                  type="button"
                  aria-label="Next featured store"
                  onClick={goToNext}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-800 text-white shadow-sm transition hover:bg-primary-700 active:scale-90"
                >
                  <IoChevronForward className="text-[22px]" />
                </button>
              </div>
            )}
          </div>

          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <FeaturedStoreBanner
                key={featuredStores[activeIndex].uuid}
                store={featuredStores[activeIndex]}
              />
            </AnimatePresence>
          </div>

          {featuredStores.length > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {featuredStores.map((store, index) => (
                <button
                  key={store.uuid}
                  type="button"
                  aria-label={`Go to featured store ${index + 1}`}
                  aria-current={activeIndex === index ? "true" : undefined}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeIndex === index
                      ? "w-8 bg-primary-800"
                      : "w-2 bg-primary-200 hover:bg-primary-400"
                  }`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* All stores */}
      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[16px] font-semibold text-secondary-500">
              ហាងអាហារទាំងអស់
            </p>

            <h2 className="mt-1 text-[24px] font-bold text-primary-900 sm:text-[28px]">
              ស្វែងរកហាងដែលអ្នកចូលចិត្ត
            </h2>
          </div>

          <span className="rounded-full border border-gray-200 bg-white px-4 py-2 text-[16px] font-semibold text-gray-600 shadow-sm">
            {stores.length} ហាង
          </span>
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3"
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
