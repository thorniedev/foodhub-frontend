"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import {
  IoCheckmarkCircle,
  IoHeart,
  IoHeartOutline,
  IoLocationOutline,
  IoNavigateOutline,
  IoRestaurantOutline,
  IoStorefrontOutline,
} from "react-icons/io5";

import { FaStar } from "react-icons/fa";

import type { RecommendedStore,
  RecommendationMode,
} from "@/types/location";

interface NearbyStoreCardProps {
  store: RecommendedStore;
  /* Personal mode reuses the compact single-column layout. */
  mode?: RecommendationMode;
  selected: boolean;

  votingEnabled?: boolean;
  hasVoted?: boolean;
  isVoting?: boolean;

  onSelect: () => void;
  onVote?: () => void;
}

function getRecommendationPercentage(score: number): number {
  const normalizedScore = score <= 1 ? score * 100 : score;

  return Math.max(0, Math.min(100, Math.round(normalizedScore)));
}

function getStoreStatus(store: RecommendedStore) {
  if (store.isOpenNow === true || store.operatingStatus === "OPEN") {
    return {
      label: "កំពុងបើក",
      className: "bg-green-600 text-white",
    };
  }

  if (store.isOpenNow === false || store.operatingStatus === "CLOSED") {
    return {
      label: "បានបិទ",
      className: "bg-red-500 text-white",
    };
  }

  return {
    label: "មិនទាន់ដឹង",
    className: "bg-black/60 text-white",
  };
}

export default function NearbyStoreCard({
  store,
  mode = "single",
  selected,
  votingEnabled = false,
  hasVoted = false,
  isVoting = false,
  onSelect,
  onVote,
}: NearbyStoreCardProps) {
  const [favorite, setFavorite] = useState(false);

  const displayName = store.localName?.trim() || store.name;

  const imageUrl =
    store.coverImageUrl || store.logoUrl || "/Image/store/default-store.png";

  const recommendationPercentage = getRecommendationPercentage(
    store.recommendationScore,
  );

  const status = getStoreStatus(store);

  const address = [store.addressLine, store.commune, store.district, store.city]
    .filter(Boolean)
    .join(", ");

  const hasRating = store.averageRating > 0;

  return (
    <motion.article
      layout
      onClick={onSelect}
      whileHover={{
        y: -3,
      }}
      transition={{
        duration: 0.2,
        ease: "easeOut",
      }}
      className={`
        group w-full cursor-pointer overflow-hidden
        rounded-[24px] border bg-white
        transition duration-300

        ${
          selected
            ? "border-primary-500 shadow-[0_14px_35px_rgba(20,83,45,0.14)] ring-2 ring-primary-100"
            : "border-gray-200 shadow-[0_8px_24px_rgba(15,23,42,0.07)] hover:border-primary-200 hover:shadow-[0_14px_35px_rgba(15,23,42,0.11)]"
        }
      `}
    >
      {/* Compact responsive image */}
      <div
        className="
          relative aspect-[16/9] w-full overflow-hidden
          bg-gray-100 bg-cover bg-center
        "
        style={{
          backgroundImage: `url("${imageUrl}")`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

        {/* Favorite */}
        <button
          type="button"
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          onClick={(event) => {
            event.stopPropagation();
            setFavorite((current) => !current);
          }}
          className="
            absolute right-3 top-3
            flex h-11 w-11 items-center justify-center
            rounded-full bg-white/95
            text-[24px] text-primary-800 dark:text-primary-dark
            shadow-md backdrop-blur-md
            transition hover:scale-105
          "
        >
          {favorite ? <IoHeart /> : <IoHeartOutline />}
        </button>

        {/* Store status */}
        <span
          className={`
            absolute left-3 top-3
            rounded-full px-3 py-2
            text-[17px] font-semibold
            shadow-sm backdrop-blur-md
            ${status.className}
          `}
        >
          {status.label}
        </span>

        {/* Recommendation score */}
        <div
          className="
            absolute bottom-3 left-3
            rounded-full border border-white/20
            bg-black/55 px-3 py-2
            text-[17px] font-semibold text-white
            backdrop-blur-md
          "
        >
          {recommendationPercentage}% សមស្រប
        </div>

        {selected && (
          <div
            className="
              absolute bottom-3 right-3
              flex h-11 w-11 items-center justify-center
              rounded-full bg-primary-700
              text-white shadow-md
            "
          >
            <IoCheckmarkCircle className="text-[25px]" />
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="p-4 sm:p-5">
        {/* Store title */}
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="
              mt-0.5 flex h-10 w-10 shrink-0
              items-center justify-center rounded-xl
              bg-secondary-50 text-secondary-500
            "
          >
            <IoStorefrontOutline className="text-[23px]" />
          </div>

          <div className="min-w-0">
            <h3
              className="
                line-clamp-2
                text-[21px] font-bold
                leading-[1.45] text-primary-900
                sm:text-[23px]
                lg:text-[25px]
              "
            >
              {displayName}
            </h3>

            {store.localName && store.localName !== store.name && (
              <p className="mt-1 truncate text-[17px] leading-7 text-gray-500">
                {store.name}
              </p>
            )}
          </div>
        </div>

        {/* Main information */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="flex items-center gap-2 text-[17px] font-semibold text-yellow-500">
            <FaStar className="text-[19px]" />

            <span>
              {hasRating ? store.averageRating.toFixed(1) : "ហាងថ្មី"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[17px] font-medium text-primary-600">
            <IoRestaurantOutline className="text-[21px]" />

            <span>{store.menuCount} មុខម្ហូប</span>
          </div>

          <div className="flex items-center gap-2 text-[17px] font-medium text-green-600">
            <IoLocationOutline className="text-[21px]" />

            <span>{store.distanceKm.toFixed(1)} km</span>
          </div>
        </div>

        {/* Address */}
        <div className="mt-4 flex min-w-0 items-start gap-2.5">
          <IoLocationOutline className="mt-1 shrink-0 text-[20px] text-gray-500" />

          <p className="line-clamp-2 min-w-0 text-[17px] leading-7 text-gray-500">
            {address || "មិនទាន់មានព័ត៌មានអាសយដ្ឋាន"}
          </p>
        </div>

        {/* Actions */}
        <div
          className={`
            mt-5 flex gap-3 border-t
            border-gray-100 pt-4

            ${mode === "group" ? "flex-col sm:flex-row" : "flex-row"}
          `}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onSelect();
            }}
            className={`
              flex min-h-11 flex-1
              items-center justify-center gap-2
              rounded-full border px-4
              text-[17px] font-semibold
              transition active:scale-[0.98]

              ${
                selected
                  ? "border-primary-200 bg-primary-50 text-primary-800 dark:text-primary-dark"
                  : "border-gray-200 bg-white text-gray-700 dark:text-gray-100 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800 dark:text-primary-dark"
              }
            `}
          >
            <IoNavigateOutline className="text-[21px]" />

            {selected ? "បានជ្រើសរើស" : "មើលលើផែនទី"}
          </button>

          {mode === "group" && (
            <button
              type="button"
              disabled={!votingEnabled || isVoting}
              onClick={(event) => {
                event.stopPropagation();
                onVote?.();
              }}
              className={`
                min-h-11 flex-1 rounded-full
                px-5 text-[17px] font-semibold
                transition active:scale-[0.98]

                ${
                  hasVoted
                    ? "border border-secondary-200 bg-secondary-50 text-secondary-600"
                    : "bg-secondary-500 text-white hover:bg-secondary-600"
                }

                disabled:cursor-not-allowed
                disabled:opacity-50
              `}
            >
              {isVoting
                ? "កំពុងដំណើរការ..."
                : hasVoted
                  ? "បានបោះឆ្នោត"
                  : votingEnabled
                    ? "បោះឆ្នោត"
                    : "មិនទាន់បើក"}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
