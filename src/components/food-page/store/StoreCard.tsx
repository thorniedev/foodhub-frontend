"use client";

import { useState, type ReactNode } from "react";
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

import type { Store } from "@/types/store";

type StoreCardProps = {
  store: Store;
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

function getDisplayName(store: Store): string {
  return store.localName?.trim() || store.name?.trim() || "Food store";
}

function getTopLabel(store: Store): string {
  return (
    [store.district, store.city].filter(Boolean).join(", ") || "Restaurant"
  );
}

function getStatusLabel(store: Store): string {
  if (store.isOpenNow === true || store.operatingStatus === "OPEN") {
    return "បើកឥឡូវនេះ";
  }

  if (store.isOpenNow === false || store.operatingStatus === "CLOSED") {
    return "បានបិទ";
  }

  return "មិនទាន់ដឹង";
}

function getPriceLabel(priceLevel: number | null): string {
  if (priceLevel === null || !Number.isFinite(priceLevel) || priceLevel <= 0) {
    return "--";
  }

  return "$".repeat(Math.min(Math.max(Math.round(priceLevel), 1), 4));
}

function StoreImagePlaceholder({ displayName }: { displayName: string }) {
  return (
    <div
      role="img"
      aria-label={`${displayName} restaurant image placeholder`}
      className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4 text-center"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-primary-100 bg-white shadow-sm sm:h-[72px] sm:w-[72px]">
        <IoRestaurantOutline className="text-[36px] text-primary-400 sm:text-[40px]" />
      </span>

      <div className="min-w-0 max-w-full">
        <p className="line-clamp-1 text-[16px] font-bold text-primary-800">
          {displayName}
        </p>

        <p className="mt-1 text-[16px] text-slate-400">មិនមានរូបភាព</p>
      </div>
    </div>
  );
}

function StoreImage({ store }: { store: Store }) {
  const displayName = getDisplayName(store);

  const coverImageUrl = normalizeImageUrl(store.coverImageUrl);

  const logoImageUrl = normalizeImageUrl(store.logoUrl);

  /*
   * Try the cover image first, then the logo.
   * Duplicate URLs are removed.
   */
  const imageCandidates = Array.from(
    new Set(
      [coverImageUrl, logoImageUrl].filter((imageUrl): imageUrl is string =>
        Boolean(imageUrl),
      ),
    ),
  );

  const [failedImageUrls, setFailedImageUrls] = useState<string[]>([]);

  const currentImageUrl = imageCandidates.find(
    (imageUrl) => !failedImageUrls.includes(imageUrl),
  );

  if (!currentImageUrl) {
    return <StoreImagePlaceholder displayName={displayName} />;
  }

  return (
    <Image
      key={currentImageUrl}
      src={currentImageUrl}
      alt={`${displayName} restaurant cover`}
      fill
      unoptimized
      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
      onError={() => {
        setFailedImageUrls((currentFailedUrls) => {
          if (currentFailedUrls.includes(currentImageUrl)) {
            return currentFailedUrls;
          }

          return [...currentFailedUrls, currentImageUrl];
        });
      }}
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
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-800 text-white shadow-md transition hover:bg-primary-700 active:scale-90 sm:h-12 sm:w-12"
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
  children: ReactNode;
  outlined?: boolean;
}) {
  return (
    <span
      className={`inline-flex min-h-[42px] items-center rounded-full px-4 text-[16px] font-semibold ${
        outlined
          ? "border border-primary-700 bg-white text-primary-800"
          : "bg-primary-800 text-white"
      }`}
    >
      {children}
    </span>
  );
}

function GridStoreCard({ store }: { store: Store }) {
  const displayName = getDisplayName(store);
  const topLabel = getTopLabel(store);
  const priceLabel = getPriceLabel(store.priceLevel);
  const statusLabel = getStatusLabel(store);

  const averageRating = Number.isFinite(store.averageRating)
    ? store.averageRating
    : 0;

  const ratingText = averageRating > 0 ? averageRating.toFixed(1) : "ថ្មី";

  return (
    <motion.article
      layout
      initial={{
        opacity: 0,
        y: 16,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: 8,
        scale: 0.97,
      }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      className="group overflow-hidden rounded-[24px] border border-gray-200 bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md sm:rounded-[28px] sm:p-4"
    >
      <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px]">
        <div className="relative h-[200px] w-full bg-primary-50 sm:h-[160px]">
          <StoreImage store={store} />
        </div>

        <div className="absolute right-0 top-0">
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
            <h3 className="line-clamp-2 text-[20px] font-bold leading-tight text-primary-900 sm:text-[21px]">
              {displayName}
            </h3>
          </div>

          <span className="shrink-0 text-[21px] font-bold text-primary-900 sm:text-[22px]">
            {priceLabel}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[16px]">
          <span
            className={`inline-flex items-center gap-1.5 ${
              statusLabel === "បើកឥឡូវនេះ"
                ? "text-emerald-500"
                : statusLabel === "បានបិទ"
                  ? "text-red-500"
                  : "text-slate-400"
            }`}
          >
            <IoTimeOutline className="text-[18px]" />
            {statusLabel}
          </span>

          <span className="inline-flex min-w-0 items-center gap-1.5 text-emerald-500">
            <IoLocationOutline className="shrink-0 text-[18px]" />

            <span className="truncate">{store.city || "Unknown location"}</span>
          </span>

          {/* <span className="inline-flex items-center gap-1.5 text-yellow-500">
            <FaStar className="text-[14px]" />
            {ratingText}
          </span> */}
        </div>

        {/* <div className="mt-5 flex flex-wrap gap-3">
          <StoreInfoChip>
            {store.reviewStatus === "APPROVED"
              ? "បានផ្ទៀងផ្ទាត់"
              : "កំពុងពិនិត្យ"}
          </StoreInfoChip>

          <StoreInfoChip outlined>
            {store.accountStatus === "ACTIVE" ? "ហាងសកម្ម" : "មិនសកម្ម"}
          </StoreInfoChip>
        </div> */}
      </div>
    </motion.article>
  );
}

function FeaturedStoreCard({ store }: { store: Store }) {
  const displayName = getDisplayName(store);
  const topLabel = getTopLabel(store);

  const averageRating = Number.isFinite(store.averageRating)
    ? store.averageRating
    : 0;

  return (
    <motion.article
      layout
      initial={{
        opacity: 0,
        x: 14,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.97,
      }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      className="group flex w-[290px] shrink-0 snap-start gap-3 overflow-hidden rounded-[22px] border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md sm:w-[360px] sm:rounded-[24px]"
    >
      <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-[16px] bg-primary-50 sm:h-[104px] sm:w-[104px] sm:rounded-[18px]">
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

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[16px]">
          <span className="inline-flex min-w-0 items-center gap-1.5 text-emerald-500">
            <IoLocationOutline className="shrink-0 text-[18px]" />

            <span className="max-w-[120px] truncate">
              {store.city || "Unknown"}
            </span>
          </span>

          {averageRating > 0 && (
            <span className="inline-flex items-center gap-1.5 text-yellow-500">
              <FaStar className="text-[14px]" />
              {averageRating.toFixed(1)}
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
