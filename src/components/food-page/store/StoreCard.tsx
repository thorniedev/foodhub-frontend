"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  IoHeart,
  IoHeartOutline,
  IoLocationOutline,
  IoRestaurantOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { FaStar } from "react-icons/fa";

import type { FoodStore } from "@/types/store-page";

type StoreCardProps = {
  store: FoodStore;
  variant?: "featured" | "grid";
};

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

function getTopLabel(store: FoodStore): string {
  return (
    [store.district, store.city].filter(Boolean).join(", ") || "Restaurant"
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
  if (priceLevel === null || priceLevel <= 0) {
    return "--";
  }

  return "$".repeat(Math.min(Math.round(priceLevel), 4));
}

function StoreImage({ store }: { store: FoodStore }) {
  const displayName = getDisplayName(store);

  const imageUrl =
    normalizeImageUrl(store.coverImageUrl) || normalizeImageUrl(store.logoUrl);

  if (!imageUrl) {
    return (
      <div
        role="img"
        aria-label={`${displayName} restaurant image placeholder`}
        className="flex h-full w-full items-center justify-center bg-primary-50"
      >
        <IoRestaurantOutline className="text-[54px] text-primary-300" />
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={`${displayName} restaurant cover`}
      fill
      unoptimized
      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
      className="object-cover transition duration-500 group-hover:scale-105"
    />
  );
}

function FavoriteButton({ storeName }: { storeName: string }) {
  const [favorite, setFavorite] = useState(false);

  return (
    <button
      type="button"
      aria-label={
        favorite
          ? `Remove ${storeName} from favorites`
          : `Add ${storeName} to favorites`
      }
      aria-pressed={favorite}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setFavorite((current) => !current);
      }}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-800 text-white shadow-md transition hover:bg-primary-700 active:scale-90"
    >
      {favorite ? (
        <IoHeart className="text-[22px]" />
      ) : (
        <IoHeartOutline className="text-[22px]" />
      )}
    </button>
  );
}

function StoreInfoChip({
  children,
  outlined = false,
}: {
  children: React.ReactNode;
  outlined?: boolean;
}) {
  return (
    <span
      className={`inline-flex min-h-[44px] items-center rounded-full px-4 text-[16px] font-semibold ${
        outlined
          ? "border border-primary-700 bg-white text-primary-800"
          : "bg-primary-800 text-white"
      }`}
    >
      {children}
    </span>
  );
}

function GridStoreCard({ store }: { store: FoodStore }) {
  const displayName = getDisplayName(store);
  const topLabel = getTopLabel(store);
  const priceLabel = getPriceLabel(store.priceLevel);
  const statusLabel = getStatusLabel(store);

  const ratingText =
    store.averageRating > 0 ? store.averageRating.toFixed(1) : "ថ្មី";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group overflow-hidden rounded-[28px] border border-gray-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative overflow-hidden rounded-[24px]">
        <div className="relative h-[220px] w-full bg-primary-50 sm:h-[240px]">
          <StoreImage store={store} />
        </div>

        <div className="absolute right-3 top-3">
          <FavoriteButton storeName={displayName} />
        </div>
      </div>

      <div className="mt-5">
        <div className="flex min-w-0 items-center gap-2">
          <IoRestaurantOutline className="shrink-0 text-[18px] text-secondary-500" />
          <p className="truncate text-[16px] font-medium text-secondary-500">
            {topLabel}
          </p>
        </div>

        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-[21px] font-bold leading-tight text-primary-900">
              {displayName}
            </h3>
          </div>

          <span className="shrink-0 text-[22px] font-bold text-primary-900">
            {priceLabel}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[16px]">
          <span className="inline-flex items-center gap-1.5 text-emerald-500">
            <IoTimeOutline className="text-[18px]" />
            {statusLabel}
          </span>

          <span className="inline-flex items-center gap-1.5 text-emerald-500">
            <IoLocationOutline className="text-[18px]" />
            {store.city}
          </span>

          <span className="inline-flex items-center gap-1.5 text-yellow-500">
            <FaStar className="text-[14px]" />
            {ratingText}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <StoreInfoChip>
            {store.reviewStatus === "APPROVED"
              ? "បានផ្ទៀងផ្ទាត់"
              : "កំពុងពិនិត្យ"}
          </StoreInfoChip>

          <StoreInfoChip outlined>
            {store.accountStatus === "ACTIVE" ? "ហាងសកម្ម" : "មិនសកម្ម"}
          </StoreInfoChip>
        </div>
      </div>
    </motion.article>
  );
}

function FeaturedStoreCard({ store }: { store: FoodStore }) {
  const displayName = getDisplayName(store);
  const topLabel = getTopLabel(store);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group flex w-[320px] shrink-0 snap-start gap-3 overflow-hidden rounded-[24px] border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md sm:w-[360px]"
    >
      <div className="relative h-[96px] w-[96px] shrink-0 overflow-hidden rounded-[18px] bg-primary-50">
        <StoreImage store={store} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <IoRestaurantOutline className="shrink-0 text-[18px] text-secondary-500" />
          <p className="truncate text-[16px] font-medium text-secondary-500">
            {topLabel}
          </p>
        </div>

        <h3 className="mt-2 line-clamp-2 text-[18px] font-bold leading-tight text-primary-900">
          {displayName}
        </h3>

        <div className="mt-3 flex items-center gap-3 text-[16px]">
          <span className="inline-flex items-center gap-1.5 text-emerald-500">
            <IoLocationOutline className="text-[18px]" />
            {store.city}
          </span>

          {store.averageRating > 0 && (
            <span className="inline-flex items-center gap-1.5 text-yellow-500">
              <FaStar className="text-[14px]" />
              {store.averageRating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function StoreCard({ store, variant = "grid" }: StoreCardProps) {
  if (variant === "featured") {
    return <FeaturedStoreCard store={store} />;
  }

  return <GridStoreCard store={store} />;
}
