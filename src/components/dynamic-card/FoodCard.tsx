"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { CiHeart } from "react-icons/ci";
import { FaHeart, FaStar, FaStore } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";

import type { CatalogMenuItem } from "@/types/catalog-menu-item";

/* =========================================================
   TYPES
========================================================= */

type FoodCardProps = {
  food: CatalogMenuItem;
};

type MediaAccessData = {
  uuid?: string;
  url?: string;
  expiresAt?: string;
};

type MediaAccessResponse = {
  success?: boolean;

  uuid?: string;
  url?: string;
  expiresAt?: string;

  data?: MediaAccessData;
  payload?: MediaAccessData;
};

type DietaryDisplayItem = {
  code: string;
  name: string;
};

/* =========================================================
   CONSTANTS
========================================================= */

const FAVORITES_STORAGE_KEY = "foodhub-favorite-menu-items";

const DEFAULT_FOOD_IMAGE = "/Image/default-food.png";

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
   MEDIA
========================================================= */

/**
 * Extract UUID from paths such as:
 *
 * /api/v1/media/ef62859e-2048-4ca4-9afd-dfeb566dd2cd
 *
 * /api/media/ef62859e-2048-4ca4-9afd-dfeb566dd2cd
 *
 * /media/ef62859e-2048-4ca4-9afd-dfeb566dd2cd
 */
function extractMediaUuid(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const match = value.match(/\/media\/([0-9a-fA-F-]{36})(?:\/|$)/);

  return match?.[1] ?? null;
}

/**
 * Support all of these backend responses:
 *
 * {
 *   "url": "..."
 * }
 *
 * {
 *   "data": {
 *     "url": "..."
 *   }
 * }
 *
 * {
 *   "payload": {
 *     "url": "..."
 *   }
 * }
 */
function getMediaUrl(response: MediaAccessResponse): string | null {
  const media = response.payload ?? response.data ?? response;

  if (typeof media.url === "string" && media.url.trim().length > 0) {
    return media.url.trim();
  }

  return null;
}

/* =========================================================
   DIETARY TYPES
========================================================= */

function getDietaryTypes(food: CatalogMenuItem): DietaryDisplayItem[] {
  if (!Array.isArray(food.dietaryTypes)) {
    return [];
  }

  return food.dietaryTypes.flatMap((item) => {
    if (typeof item !== "object" || item === null) {
      return [];
    }

    const diet = item as Record<string, unknown>;

    /*
     * Current backend response:
     *
     * {
     *   dietaryTypeUuid: "...",
     *   dietaryTypeName: "Halal"
     * }
     */
    if (
      typeof diet.dietaryTypeUuid === "string" &&
      typeof diet.dietaryTypeName === "string"
    ) {
      return [
        {
          code: diet.dietaryTypeUuid,
          name: diet.dietaryTypeName,
        },
      ];
    }

    /*
     * Backward-compatible response:
     *
     * {
     *   code: "HALAL",
     *   name: "Halal"
     * }
     */
    if (typeof diet.code === "string" && typeof diet.name === "string") {
      return [
        {
          code: diet.code,
          name: diet.name,
        },
      ];
    }

    return [];
  });
}

/* =========================================================
   COMPONENT
========================================================= */

export default function FoodCard({ food }: FoodCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const [thumbnailUrl, setThumbnailUrl] = useState<string>(DEFAULT_FOOD_IMAGE);

  /* =======================================================
     FAVORITE INITIAL STATE
  ======================================================= */

  useEffect(() => {
    const favoriteIds = getStoredFavoriteIds();

    setIsFavorite(favoriteIds.includes(food.uuid));
  }, [food.uuid]);

  /* =======================================================
     MEDIA RESOLVER
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function resolveThumbnail() {
      const thumbnail = food.thumbnail?.trim();

      /*
       * No thumbnail.
       */
      if (!thumbnail) {
        if (!cancelled) {
          setThumbnailUrl(DEFAULT_FOOD_IMAGE);
        }

        return;
      }

      /*
       * Backend already returned a full URL.
       *
       * Example:
       * https://storage.example.com/image.jpg
       */
      if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) {
        if (!cancelled) {
          setThumbnailUrl(thumbnail);
        }

        return;
      }

      /*
       * Try extracting a media UUID.
       */
      const mediaUuid = extractMediaUuid(thumbnail);

      /*
       * No media UUID means it is probably
       * a normal local/public image.
       *
       * Example:
       * /Image/food-picture/food.jpg
       */
      if (!mediaUuid) {
        if (!cancelled) {
          setThumbnailUrl(thumbnail);
        }

        return;
      }

      /*
       * Backend thumbnail:
       *
       * /api/v1/media/{uuid}
       *
       * Browser requests:
       *
       * /api/media/{uuid}/access-url
       *
       * Next.js proxy forwards:
       *
       * /api/v1/media/{uuid}/access-url
       */
      const apiUrl = `/api/media/${mediaUuid}/access-url`;

      try {
        const response = await fetch(apiUrl, {
          method: "GET",

          credentials: "include",

          headers: {
            Accept: "application/json",
          },

          cache: "no-store",
        });

        /*
         * Read text first.
         *
         * This lets us inspect:
         * JSON responses,
         * empty responses,
         * backend error text.
         */
        const responseText = await response.text();

        if (!response.ok) {
          console.warn(
            `[FOOD CARD MEDIA] Request failed: ${response.status} ${response.statusText}`,
          );

          console.warn(`[FOOD CARD MEDIA] Thumbnail: ${thumbnail}`);

          console.warn(`[FOOD CARD MEDIA] UUID: ${mediaUuid}`);

          console.warn(
            `[FOOD CARD MEDIA] Response: ${responseText || "empty response"}`,
          );

          if (!cancelled) {
            setThumbnailUrl(DEFAULT_FOOD_IMAGE);
          }

          return;
        }

        /*
         * Empty 200 response is still invalid
         * because we need the access URL.
         */
        if (!responseText.trim()) {
          console.warn(
            `[FOOD CARD MEDIA] Empty response for media ${mediaUuid}`,
          );

          if (!cancelled) {
            setThumbnailUrl(DEFAULT_FOOD_IMAGE);
          }

          return;
        }

        let result: MediaAccessResponse;

        try {
          result = JSON.parse(responseText) as MediaAccessResponse;
        } catch {
          console.warn(
            `[FOOD CARD MEDIA] Invalid JSON response for ${mediaUuid}`,
          );

          console.warn(`[FOOD CARD MEDIA] Response: ${responseText}`);

          if (!cancelled) {
            setThumbnailUrl(DEFAULT_FOOD_IMAGE);
          }

          return;
        }

        const resolvedUrl = getMediaUrl(result);

        if (!resolvedUrl) {
          console.warn(
            `[FOOD CARD MEDIA] Backend did not return a URL for ${mediaUuid}`,
          );

          console.warn(`[FOOD CARD MEDIA] Response: ${responseText}`);

          if (!cancelled) {
            setThumbnailUrl(DEFAULT_FOOD_IMAGE);
          }

          return;
        }

        if (!cancelled) {
          setThumbnailUrl(resolvedUrl);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        /*
         * Use console.warn instead of
         * console.error so Next.js dev overlay
         * doesn't make this look like a
         * React runtime error.
         */
        console.warn(
          `[FOOD CARD MEDIA] Could not resolve ${mediaUuid}: ${message}`,
        );

        if (!cancelled) {
          setThumbnailUrl(DEFAULT_FOOD_IMAGE);
        }
      }
    }

    void resolveThumbnail();

    return () => {
      cancelled = true;
    };
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

    /*
     * Allow Navbar/favorites page
     * to update its count.
     */
    window.dispatchEvent(new Event("foodhub-favorites-updated"));
  };

  /* =======================================================
     DISPLAY VALUES
  ======================================================= */

  const displayName =
    food.localName?.trim() ||
    food.name?.trim() ||
    food.foodName?.trim() ||
    "Unnamed food";

  const dietaryTypes = getDietaryTypes(food);

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
            draggable={false}
            onError={(event) => {
              /*
               * Do not repeatedly set the fallback
               * if the fallback itself fails.
               */
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
              FALLBACK FILTER TAGS

              When dietaryTypes is empty,
              use category and cuisine.
          ====================================== */}

          {dietaryTypes.length === 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {food.filterData?.category && (
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
                  {food.filterData.category.name}
                </span>
              )}

              {food.filterData?.cuisine && (
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
                  {food.filterData.cuisine.name}
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
