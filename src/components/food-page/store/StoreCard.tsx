"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import {
  IoHeart,
  IoHeartOutline,
  IoLocationOutline,
  IoNavigateOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { FaStar, FaStore } from "react-icons/fa";

import type { FoodStore } from "@/types/store-page";

import {
  formatStoreDistance,
  getBackendDistanceKm,
  resolveStoreMediaUrl,
  getStoreOpenNowLabel,
} from "./store-page-utils";

type StoreCardProps = {
  store: FoodStore;
  distanceKm?: number | null;
  variant?: "featured" | "grid";
};

function getDisplayName(store: FoodStore): string {
  return store.storeName?.trim() || "Food store";
}

function getAddressLabel(store: FoodStore): string {
  const values = [store.addressLine, store.city, store.province]
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);

  return Array.from(new Set(values)).join(", ") || "មិនមានអាសយដ្ឋាន";
}

function formatReviewCount(totalReviews?: number): string | null {
  const value = Number(totalReviews ?? 0);

  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return `${Math.round(value)} review`;
}

function formatRating(averageRating?: number): string | null {
  const value = Number(averageRating ?? 0);

  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value.toFixed(1);
}

function StoreImagePlaceholder({ displayName }: { displayName: string }) {
  return (
    <div
      role="img"
      aria-label={`${displayName} store image`}
      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-primary-100 bg-white shadow-sm">
        <FaStore className="text-[28px] text-primary-400" />
      </span>
    </div>
  );
}

export function StoreImage({ store }: { store: FoodStore }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(Boolean(store.logoMediaUuid));
  const [imageFailed, setImageFailed] = useState(false);

  const displayName = getDisplayName(store);

  useEffect(() => {
    let cancelled = false;
    setImageFailed(false);

    if (!store.logoMediaUuid) {
      setImageUrl(null);
      setIsResolving(false);
      return;
    }

    setIsResolving(true);

    async function loadLogo() {
      if (!store.logoMediaUuid) {
        setIsResolving(false);
        return;
      }

      const resolvedUrl = await resolveStoreMediaUrl(store.logoMediaUuid);

      if (cancelled) {
        return;
      }

      setImageUrl(resolvedUrl);
      setIsResolving(false);
    }

    void loadLogo();

    return () => {
      cancelled = true;
    };
  }, [store.logoMediaUuid]);

  if (isResolving) {
    return <div className="h-full w-full animate-pulse bg-primary-50" />;
  }

  if (!imageUrl || imageFailed) {
    return <StoreImagePlaceholder displayName={displayName} />;
  }

  return (
    <Image
      src={imageUrl}
      alt={`${displayName} store logo`}
      fill
      sizes="(max-width: 640px) 100px, 140px"
      draggable={false}
      onError={() => setImageFailed(true)}
      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
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
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-800 text-white shadow-md transition hover:bg-primary-700 active:scale-90"
    >
      {favorite ? (
        <IoHeart className="text-[21px]" />
      ) : (
        <IoHeartOutline className="text-[21px]" />
      )}
    </button>
  );
}

function FeaturedStoreCard({
  store,
  distanceKm,
}: {
  store: FoodStore;
  distanceKm?: number | null;
}) {
  const displayName = getDisplayName(store);

  return (
    <motion.article
      layout
      className="group flex w-[300px] shrink-0 snap-start gap-3 overflow-hidden rounded-[20px] border border-gray-200 bg-white p-3 shadow-sm sm:w-[360px]"
    >
      <div className="relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-[16px] bg-primary-50">
        <StoreImage store={store} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <FaStore className="shrink-0 text-[18px] text-secondary-400" />
          <p className="truncate whitespace-nowrap text-[18px] font-bold text-primary-900">
            {displayName}
          </p>
        </div>

        <p className="mt-2 truncate whitespace-nowrap text-[18px] text-gray-500">
          {getAddressLabel(store)}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[18px]">
          {formatRating(store.averageRating) && (
            <span className="inline-flex items-center gap-1.5 text-accent-400">
              <FaStar className="text-[16px]" />
              {formatRating(store.averageRating)}
            </span>
          )}

          <span className="inline-flex items-center gap-1.5 text-primary-600">
            <IoNavigateOutline className="text-[18px]" />
            {formatStoreDistance(distanceKm ?? getBackendDistanceKm(store))}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

function GridStoreCard({
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
  const ratingLabel = formatRating(store.averageRating);
  const reviewCountLabel = formatReviewCount(store.totalReviews);

  const isOpen = store.isOpenNow === true;
  const isClosed = !isOpen;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="group overflow-hidden rounded-[22px] border border-gray-200 bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-3.5"
    >
      <div className="relative overflow-hidden rounded-[18px]">
        <div className="relative h-[185px] w-full bg-primary-50 sm:h-[195px] lg:h-[185px] 2xl:h-[175px]">
          <StoreImage store={store} />
        </div>
        {/* <div className="absolute line-clamp-1 right-2 top-2">
          <FavoriteButton storeName={displayName} />
        </div> */}
      </div>

      <div className="min-w-0 px-1 pb-1 pt-4">
        {/* Store name with icon */}
        <div className="flex min-w-0 items-center gap-2">
          <FaStore className="shrink-0 text-[18px] text-secondary-400" />
          <p className="min-w-0 flex-1 truncate whitespace-nowrap text-[20px] font-bold leading-7 text-primary-900">
            {displayName}
          </p>
        </div>

        {/* Address */}
        <div className="mt-3 flex min-w-0 items-center gap-2 text-gray-500">
          <IoLocationOutline className="shrink-0 text-[19px] text-primary-500" />
          <p className="min-w-0 flex-1 truncate whitespace-nowrap text-[18px]">
            {addressLabel}
          </p>
        </div>

        {/* Rating, distance, reviews */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[18px]">
          {ratingLabel && (
            <span className="inline-flex items-center gap-1.5 text-accent-400">
              <FaStar className="text-[16px]" />
              <span>{ratingLabel}</span>
            </span>
          )}

          <span className="inline-flex items-center gap-1.5 text-primary-600">
            <IoNavigateOutline className="text-[18px]" />
            <span>{distanceLabel}</span>
          </span>

          {reviewCountLabel && (
            <span className="truncate text-[18px] text-gray-500">
              {reviewCountLabel}
            </span>
          )}
        </div>

        {/* Status */}
        <div className="mt-3 flex min-w-0 items-center gap-2 border-t border-gray-100 pt-3">
          <IoTimeOutline
            className={`shrink-0 text-[19px] ${
              isOpen
                ? "text-emerald-600"
                : isClosed
                  ? "text-red-500"
                  : "text-gray-400"
            }`}
          />

          <p
            className={`truncate whitespace-nowrap text-[18px] ${
              isOpen
                ? "text-emerald-600"
                : isClosed
                  ? "text-red-500"
                  : "text-gray-400"
            }`}
          >
            {statusLabel}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

export default function StoreCard({
  store,
  distanceKm,
  variant = "grid",
}: StoreCardProps) {
  if (variant === "featured") {
    return <FeaturedStoreCard store={store} distanceKm={distanceKm} />;
  }

  return <GridStoreCard store={store} distanceKm={distanceKm} />;
}
