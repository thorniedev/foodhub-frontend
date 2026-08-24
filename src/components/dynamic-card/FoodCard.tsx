"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { CiHeart } from "react-icons/ci";
import { FaHeart, FaStore } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";

import { DEFAULT_FOOD_IMAGE, toFrontendApiAssetUrl } from "@/lib/catalog-media";

import SafetyStatusBadge from "@/components/discovery/SafetyStatusBadge";
import type { CatalogMenuItem } from "@/types/catalog-menu-item";
import type { SafetyStatusType } from "@/types/search";

/* =========================================================
   TYPES
========================================================= */

type FoodCardProps = {
  food: CatalogMenuItem & {
    safetyStatus?: SafetyStatusType;
    safetyReasonCodes?: string[];
  };
  safetyStatus?: SafetyStatusType;
  safetyReasonCodes?: string[];
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

function cleanKhmerLabel(label: string): string {
  if (!label) return "";
  return label.replace(/\s*\([A-Za-z0-9\s&,/-]+\)/g, "").trim();
}

/* =========================================================
   COMPONENT
========================================================= */

export default function FoodCard({ food, safetyStatus, safetyReasonCodes }: FoodCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const effectiveThumbnail =
    food.thumbnail ||
    (food.gallery && food.gallery.length > 0 ? food.gallery[0] : null) ||
    (food.uuid ? `/api/v1/catalog/menu-items/${food.uuid}/images/1` : null);

  const [thumbnailUrl, setThumbnailUrl] = useState<string>(
    toFrontendApiAssetUrl(effectiveThumbnail),
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
    const nextThumbnail =
      food.thumbnail ||
      (food.gallery && food.gallery.length > 0 ? food.gallery[0] : null) ||
      (food.uuid ? `/api/v1/catalog/menu-items/${food.uuid}/images/1` : null);

    setThumbnailUrl(toFrontendApiAssetUrl(nextThumbnail));
  }, [food.thumbnail, food.gallery, food.uuid]);

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
        href={`/menu-items/${food.uuid}`}
        className="
          flex
          h-full
          w-full
          min-w-0
          flex-col
          rounded-[24px]
          border
          border-gray-200
          bg-white
          p-3.5
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
            onError={() => {
              if (thumbnailUrl !== DEFAULT_FOOD_IMAGE) {
                setThumbnailUrl(DEFAULT_FOOD_IMAGE);
              }
            }}
            className="
              h-[190px]
              w-full
              rounded-[10px]
              border border-gray-100  
              object-cover
              pointer-events-none
            "
          />
          {(safetyStatus || food.safetyStatus) && (
            <div className="absolute top-2 left-2 z-10">
              <SafetyStatusBadge
                status={safetyStatus || food.safetyStatus}
                reasonCodes={safetyReasonCodes || food.safetyReasonCodes}
              />
            </div>
          )}
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
              PREPARATION TIME
          ====================================== */}

          {food.preparationTimeMinutes !== null &&
            food.preparationTimeMinutes !== undefined && (
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-primary-400">
                  <IoMdTime />

                  <span>{food.preparationTimeMinutes} min</span>
                </div>
              </div>
            )}

          {/* ======================================
              DIETARY TAGS (Blank if no dietaryTypes)
          ====================================== */}

          {dietaryTypes.length > 0 && (
            <div className="flex items-center gap-2 overflow-hidden">
              {dietaryTypes.slice(0, 2).map((diet) => (
                <span
                  key={diet.code}
                  title={cleanKhmerLabel(diet.name)}
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
                  {cleanKhmerLabel(diet.name)}
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
              text-accent-400
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
