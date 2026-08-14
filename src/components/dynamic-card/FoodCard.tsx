"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { CiHeart } from "react-icons/ci";
import { FaHeart, FaStar, FaStore } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";

import { DEFAULT_FOOD_IMAGE, toFrontendApiAssetUrl } from "@/lib/catalog-media";

import type { CatalogMenuItem } from "@/types/catalog-menu-item";

/* =========================================================
   TYPES
========================================================= */

type FoodCardProps = {
  food: CatalogMenuItem;
};

/* =========================================================
   CONSTANTS
========================================================= */

const FAVORITES_STORAGE_KEY = "foodhub-favorite-menu-items";

/* =========================================================
   FAVORITES
========================================================= */

function getStoredFavoriteIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(FAVORITES_STORAGE_KEY);

    if (!value) {
      return [];
    }

    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

/* =========================================================
   COMPONENT
========================================================= */

export default function FoodCard({ food }: FoodCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const [thumbnailUrl, setThumbnailUrl] = useState<string>(
    toFrontendApiAssetUrl(food.thumbnail),
  );

  /* =======================================================
     FAVORITE INITIAL STATE
  ======================================================= */

  useEffect(() => {
    const favoriteIds = getStoredFavoriteIds();

    setIsFavorite(favoriteIds.includes(food.uuid));
  }, [food.uuid]);

  /* =======================================================
     THUMBNAIL
  ======================================================= */

  useEffect(() => {
    setThumbnailUrl(toFrontendApiAssetUrl(food.thumbnail));
  }, [food.thumbnail]);

  /* =======================================================
     FAVORITE TOGGLE
  ======================================================= */

  const toggleFavorite = () => {
    const currentIds = getStoredFavoriteIds();

    const isAlreadyFavorite = currentIds.includes(food.uuid);

    const nextIds = isAlreadyFavorite
      ? currentIds.filter((id) => id !== food.uuid)
      : [...currentIds, food.uuid];

    try {
      window.localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(nextIds),
      );
    } catch (error) {
      console.warn(
        "[FOOD FAVORITE STORAGE]",
        error instanceof Error ? error.message : String(error),
      );
    }

    setIsFavorite(nextIds.includes(food.uuid));

    window.dispatchEvent(new Event("foodhub-favorites-updated"));
  };

  /* =======================================================
     DISPLAY VALUES
  ======================================================= */

  const displayName =
    food.localName?.trim() || food.name?.trim() || "Unnamed food";

  /**
   * IMPORTANT:
   * dietaryTypes is inside food.food in your current response.
   */
  const dietaryTypes = food.food?.dietaryTypes ?? [];

  const averageRating = Number(food.store?.averageRating ?? 0);

  const displayedRating = Number.isFinite(averageRating)
    ? averageRating.toFixed(1)
    : "0.0";

  /* =======================================================
     UI
  ======================================================= */

  return (
    <motion.article
      layout
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.25,
      }}
      className="relative h-full w-full"
    >
      {/* ==========================================
          CARD LINK
      ========================================== */}

      <Link
        href={`/food/${food.uuid}`}
        className="
          flex
          h-full
          min-w-[300px]
          flex-col
          rounded-[24px]
          border
          border-gray-200
          bg-white
          p-2.5
          shadow-sm
          transition
          duration-200
          hover:-translate-y-1
          hover:shadow-md
          dark:border-gray-800
          dark:bg-gray-950
        "
      >
        {/* ========================================
            IMAGE
        ======================================== */}

        <div className="relative min-h-0 flex-1">
          <img
            src={thumbnailUrl}
            alt={displayName}
            width={485}
            height={370}
            // draggable={false}
            // onError={(event) => {
            //   const currentSrc = event.currentTarget.src;

            //   if (currentSrc.includes(DEFAULT_FOOD_IMAGE)) {
            //     return;
            //   }

            //   setThumbnailUrl(DEFAULT_FOOD_IMAGE);
            // }}
            className="
              h-[190px]
              w-full
              rounded-[14px]
              object-cover
              pointer-events-none
            "
          />
        </div>

        {/* ========================================
            CONTENT
        ======================================== */}

        <div className="flex shrink-0 flex-col gap-2 pt-2">
          {/* STORE */}

          <div className="flex items-center gap-2 text-secondary-400">
            <FaStore />

            <p className="line-clamp-1 text-lg">
              {food.store?.name || "Unknown store"}
            </p>
          </div>

          {/* ======================================
              NAME + PRICE
          ====================================== */}

          <div className="flex items-center justify-between gap-2">
            <p
              className="
                min-w-0
                line-clamp-1
                text-[24px]
                font-medium
                text-primary-900
                dark:text-white
              "
            >
              {displayName}
            </p>

            <p
              className="
                shrink-0
                text-[24px]
                font-medium
                text-primary-800 dark:text-primary-dark
                dark:text-primary-300
              "
            >
              {food.currencyCode === "USD"
                ? `$${food.price}`
                : `${food.price} ${food.currencyCode ?? ""}`}
            </p>
          </div>

          {/* ======================================
              RATING + PREPARATION TIME
          ====================================== */}

          <div className="flex flex-wrap gap-4">
            {/* RATING */}

            <div className="flex items-center gap-2 text-accent-400">
              <FaStar />

              <span>{displayedRating}</span>
            </div>

            {/* PREPARATION TIME */}

            {food.preparationTimeMinutes !== null &&
              food.preparationTimeMinutes !== undefined && (
                <div className="flex items-center gap-2 text-primary-400">
                  <IoMdTime />

                  <span>{food.preparationTimeMinutes} min</span>
                </div>
              )}
          </div>

          {/* ======================================
              DIETARY TAGS
          ====================================== */}
          {/* ======================================
    DIETARY TAGS
====================================== */}

          {dietaryTypes.length > 0 && (
            <div className="flex items-center gap-2 overflow-hidden">
              {dietaryTypes.slice(0, 2).map((diet) => (
                <span
                  key={diet.code}
                  title={diet.name}
                  className="
         
          shrink-0
          truncate
          rounded-full
          bg-primary-800
          px-2
          py-1
          text-center
          text-sm
          text-gray-100
        "
                >
                  {diet.name}
                </span>
              ))}

              {dietaryTypes.length > 2 && (
                <span
                  className="
         w-8 h-8 justify-center
          shrink-0
          rounded-full
          bg-gray-100
          
          py-1
          text-center
          text-sm
          font-medium
          text-gray-600
          dark:bg-gray-800
          dark:text-gray-300
        "
                >
                  +{dietaryTypes.length - 2}
                </span>
              )}
            </div>
          )}

          {/* ======================================
              FALLBACK TAGS

              When dietaryTypes is empty,
              use category and cuisine from food.food.
          ====================================== */}

          {dietaryTypes.length === 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {food.food?.category && (
                <span
                  className="
                    rounded-full
                    bg-primary-800
                    px-3
                    py-1
                    text-lg
                    text-gray-100
                  "
                >
                  {food.food.category.name}
                </span>
              )}

              {food.food?.cuisine && (
                <span
                  className="
                    rounded-full
                    bg-primary-800
                    px-3
                    py-1
                    text-lg
                    text-gray-100
                  "
                >
                  {food.food.cuisine.name}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* ==========================================
          FAVORITE BUTTON

          Must stay OUTSIDE <Link>.
      ========================================== */}

      <button
        type="button"
        aria-label={
          isFavorite
            ? `Remove ${displayName} from favorites`
            : `Add ${displayName} to favorites`
        }
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();

          toggleFavorite();
        }}
        className="
          absolute
          right-[18px]
          top-[18px]
          z-20
          cursor-pointer
        "
      >
        {isFavorite ? (
          <FaHeart
            className="
              rounded-full
              bg-primary-800
              p-2
              text-4xl
              text-red-400
              shadow
            "
          />
        ) : (
          <CiHeart
            className="
              rounded-full
              bg-primary-800
              p-2
              text-4xl
              text-white
              shadow
            "
          />
        )}
      </button>
    </motion.article>
  );
}
