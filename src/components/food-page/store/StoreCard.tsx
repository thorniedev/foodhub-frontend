"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import { IoMdTime } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import {
  IoHeart,
  IoLocationOutline,
  IoRestaurantOutline,
} from "react-icons/io5";
import { FaStar, FaStore } from "react-icons/fa";

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

function getLocationLabel(store: FoodStore): string {
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
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-primary-100 bg-white shadow-sm">
        <IoRestaurantOutline className="text-[36px] text-primary-400" />
      </span>

      <p className="line-clamp-1 text-[16px] font-semibold text-primary-800">
        {displayName}
      </p>
    </div>
  );
}

function StoreImage({ store }: { store: FoodStore }) {
  const displayName = getDisplayName(store);

  const coverImageUrl = normalizeImageUrl(store.coverImageUrl);

  const logoImageUrl = normalizeImageUrl(store.logoUrl);

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
      className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-800 text-white shadow-md transition hover:bg-primary-700 active:scale-90"
    >
      {favorite ? (
        <IoHeart className="text-[21px]" />
      ) : (
        <CiHeart className="text-[28px]" />
      )}
    </button>
  );
}

function StoreTag({
  children,
  outlined = false,
}: {
  children: React.ReactNode;
  outlined?: boolean;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-[16px] font-medium ${
        outlined
          ? "border border-primary-700 bg-white text-primary-800"
          : "bg-primary-800 text-white"
      }`}
    >
      {children}
    </span>
  );
}

export default function StoreCard({ store, variant = "grid" }: StoreCardProps) {
  const displayName = getDisplayName(store);

  const locationLabel = getLocationLabel(store);

  const statusLabel = getStatusLabel(store);

  const priceLabel = getPriceLabel(store.priceLevel);

  const averageRating = Number.isFinite(store.averageRating)
    ? store.averageRating
    : 0;

  const isOpen = statusLabel === "បើកឥឡូវនេះ";

  const isClosed = statusLabel === "បានបិទ";

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
      className={`group flex h-full flex-col gap-4 rounded-[24px] border border-gray-200 bg-white p-2.5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md ${
        variant === "featured"
          ? "w-[290px] shrink-0 snap-start sm:w-[330px]"
          : "w-full"
      }`}
    >
      {/* Store image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[14px] bg-primary-50">
        <StoreImage store={store} />

        <div className="absolute right-2 top-2">
          <FavoriteButton storeName={displayName} />
        </div>
      </div>

      {/* Store information */}
      <div className="flex flex-1 flex-col gap-2 px-1 pb-1">
        {/* Store location */}
        <div className="flex min-w-0 items-center gap-2 text-secondary-400">
          <FaStore className="shrink-0 text-[17px]" />

          <p className="truncate text-[16px]">{locationLabel}</p>
        </div>

        {/* Store name and price level */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 min-w-0 flex-1 text-[22px] font-medium leading-tight text-primary-900">
            {displayName}
          </h3>

          <p className="shrink-0 text-[22px] font-medium text-primary-800">
            {priceLabel}
          </p>
        </div>

        {/* Rating, status and city */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[16px]">
          <div className="flex items-center gap-1.5 text-accent-400">
            <FaStar className="text-[15px]" />

            <span>{averageRating > 0 ? averageRating.toFixed(1) : "ថ្មី"}</span>
          </div>

          <div
            className={`flex items-center gap-1.5 ${
              isOpen
                ? "text-primary-400"
                : isClosed
                  ? "text-red-500"
                  : "text-gray-400"
            }`}
          >
            <IoMdTime className="text-[19px]" />

            <span>{statusLabel}</span>
          </div>

          <div className="flex min-w-0 items-center gap-1.5 text-primary-400">
            <IoLocationOutline className="shrink-0 text-[19px]" />

            <span className="max-w-[150px] truncate">
              {store.city || "Unknown location"}
            </span>
          </div>
        </div>

        {/* Store tags */}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          <StoreTag>
            {store.reviewStatus === "APPROVED"
              ? "បានផ្ទៀងផ្ទាត់"
              : "កំពុងពិនិត្យ"}
          </StoreTag>

          <StoreTag outlined>
            {store.accountStatus === "ACTIVE" ? "ហាងសកម្ម" : "មិនសកម្ម"}
          </StoreTag>
        </div>
      </div>
    </motion.article>
  );
}
