"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { motion } from "framer-motion";

import { CiHeart } from "react-icons/ci";

import { FaHeart, FaStar, FaStore } from "react-icons/fa";

import { IoMdTime } from "react-icons/io";

import { IoLocationOutline } from "react-icons/io5";

import { MdDeliveryDining } from "react-icons/md";

import { DEFAULT_FOOD_IMAGE, toFrontendApiAssetUrl } from "@/lib/catalog-media";

import type { CatalogMenuItem } from "@/types/catalog-menu-item";

/* =========================================================
   TYPES
========================================================= */

type FoodCardProps = {
  food: CatalogMenuItem;

  /**
   * Used by Location page.
   *
   * Example:
   * onViewMap={(storeUuid) => {
   *   setSelectedStoreUuid(storeUuid);
   * }}
   */
  onViewMap?: (storeUuid: string) => void;

  /**
   * Makes the map button look active
   * when this food's store is currently
   * selected on the map.
   */
  isMapSelected?: boolean;
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

export default function FooodCard({
  food,
  onViewMap,
  isMapSelected = false,
}: FoodCardProps) {
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
   * Current backend response keeps
   * dietary types inside food.food.
   */
  const dietaryTypes = food.food?.dietaryTypes ?? [];

  const averageRating = Number(food.store?.averageRating ?? 0);

  const displayedRating = Number.isFinite(averageRating)
    ? averageRating.toFixed(1)
    : "0.0";

  const storeUuid = food.store?.uuid?.trim() || "";

  const storeName =
    food.store?.localName?.trim() ||
    food.store?.name?.trim() ||
    "Unknown store";

  const distanceKm =
    food.distanceKm !== null &&
    food.distanceKm !== undefined &&
    Number.isFinite(Number(food.distanceKm))
      ? Number(food.distanceKm)
      : null;

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
      className="
        relative
        flex
        h-full
        min-w-[300px]
        w-full
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
      {/* ==========================================
          IMAGE
      ========================================== */}

      <div className="relative overflow-hidden rounded-[14px]">
        <Link
          href={`/food/${food.uuid}`}
          className="block"
          aria-label={`View ${displayName}`}
        >
          <img
            src={thumbnailUrl}
            alt={displayName}
            width={485}
            height={370}
            draggable={false}
            onError={(event) => {
              const currentSrc = event.currentTarget.src;

              if (currentSrc.includes(DEFAULT_FOOD_IMAGE)) {
                return;
              }

              setThumbnailUrl(DEFAULT_FOOD_IMAGE);
            }}
            className="
              h-[190px]
              w-full
              rounded-[14px]
              object-cover
              transition-transform
              duration-300
              hover:scale-[1.02]
            "
          />
        </Link>

        {/* FAVORITE BUTTON */}

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
            right-2
            top-2
            z-20
            cursor-pointer
            rounded-full
            transition
            active:scale-95
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
      </div>

      {/* ==========================================
          CONTENT
      ========================================== */}

      <div className="flex flex-1 flex-col gap-2 pt-2">
        {/* STORE */}

        <div className="flex items-center gap-2 text-secondary-400">
          <FaStore />

          <p className="line-clamp-1 text-lg">{storeName}</p>
        </div>

        {/* NAME + PRICE */}

        <Link href={`/food/${food.uuid}`} className="group">
          <div className="flex items-center justify-between gap-2">
            <p
              className="
                min-w-0
                line-clamp-1
                text-[24px]
                font-medium
                text-primary-900
                transition
                group-hover:text-primary-700
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
                text-primary-800
                dark:text-primary-300
              "
            >
              {food.currencyCode === "USD"
                ? `$${food.price}`
                : `${food.price} ${food.currencyCode ?? ""}`}
            </p>
          </div>
        </Link>

        {/* ======================================
            RATING + TIME + DISTANCE
        ====================================== */}

        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <div className="flex items-center gap-2 text-accent-400">
            <FaStar />

            <span>{displayedRating}</span>
          </div>

          {food.preparationTimeMinutes !== null &&
            food.preparationTimeMinutes !== undefined && (
              <div className="flex items-center gap-2 text-primary-400">
                <IoMdTime />

                <span>{food.preparationTimeMinutes} min</span>
              </div>
            )}

          {distanceKm !== null && (
            <div className="flex items-center gap-2 text-primary-400">
              <MdDeliveryDining className="text-xl" />

              <span>{distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km</span>
            </div>
          )}
        </div>

        {/* ======================================
            DIETARY TAGS
        ====================================== */}

        {dietaryTypes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {dietaryTypes.map((diet) => (
              <span
                key={diet.code}
                className="
                    rounded-full
                    bg-primary-800
                    px-3
                    py-1
                    text-sm
                    text-gray-100
                  "
              >
                {diet.name}
              </span>
            ))}
          </div>
        )}

        {/* ======================================
            FALLBACK TAGS
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

        {/* ======================================
            ACTIONS

            onViewMap is optional:
            - Food page: only detail button
            - Location page: detail + map buttons
        ====================================== */}

        <div className="mt-auto flex items-center gap-2 pt-3">
          {/* <Link
            href={`/food/${food.uuid}`}
            className="
              flex
              min-h-11
              flex-1
              items-center
              justify-center
              rounded-xl
              border
              border-gray-200
              px-4
              text-[16px]
              font-medium
              text-primary-900
              transition
              hover:bg-gray-50
              dark:border-gray-700
              dark:text-white
              dark:hover:bg-gray-900
            "
          >
            មើលមុខម្ហូប
          </Link> */}

          {storeUuid && onViewMap && (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                onViewMap(storeUuid);
              }}
              className={`
                  flex
                  min-h-11
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  px-4
                  text-[16px]
                  font-semibold
                  transition
                  active:scale-[0.98]
                  ${
                    isMapSelected
                      ? "bg-primary-800 text-white shadow-sm"
                      : "bg-primary-50 text-primary-900 hover:bg-primary-100 dark:bg-primary-950 dark:text-primary-200"
                  }
                `}
              aria-pressed={isMapSelected}
              aria-label={`Show ${storeName} on map`}
            >
              <IoLocationOutline className="shrink-0 text-[19px]" />

              <span className="line-clamp-1">
                {isMapSelected ? "កំពុងបង្ហាញ" : "មើលលើផែនទី"}
              </span>
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
