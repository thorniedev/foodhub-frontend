"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { motion } from "framer-motion";

import { CiHeart } from "react-icons/ci";
import { FaHeart, FaStar, FaStore } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";

import type { CatalogMenuItem } from "@/types/catalog-menu-item";
import Image from "next/image";

type FoodCardProps = {
  food: CatalogMenuItem;
};

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

    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

/* =========================================================
   MEDIA
========================================================= */

type MediaAccessResponse = {
  uuid: string;
  url: string;
  expiresAt: string;
};

function extractMediaUuid(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const match = value.match(/\/media\/([0-9a-fA-F-]{36})/);

  return match?.[1] ?? null;
}

/* =========================================================
   DIETARY TYPES
========================================================= */

type DietaryDisplayItem = {
  code: string;
  name: string;
};

function getDietaryTypes(food: CatalogMenuItem): DietaryDisplayItem[] {
  if (!Array.isArray(food.dietaryTypes)) {
    return [];
  }

  return food.dietaryTypes.flatMap((item) => {
    if (typeof item !== "object" || item === null) {
      return [];
    }

    const diet = item as Record<string, unknown>;

    // Current Catalog response:
    // dietaryTypeUuid + dietaryTypeName
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

    // Backward-compatible fallback.
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
   CARD
========================================================= */

export default function FoodCard({ food }: FoodCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(
    "/Image/default-food.png",
  );

  useEffect(() => {
    setIsFavorite(getStoredFavoriteIds().includes(food.uuid));
  }, [food.uuid]);

  useEffect(() => {
    let cancelled = false;

    async function resolveThumbnail() {
      if (!food.thumbnail) {
        setThumbnailUrl("/Image/default-food.png");
        return;
      }

      // If the API ever returns a real image URL, use it directly.
      if (
        food.thumbnail.startsWith("http://") ||
        food.thumbnail.startsWith("https://")
      ) {
        setThumbnailUrl(food.thumbnail);
        return;
      }

      const mediaUuid = extractMediaUuid(food.thumbnail);

      if (!mediaUuid) {
        setThumbnailUrl("/Image/default-food.png");
        return;
      }

      try {
        const response = await fetch(`/api/media/${mediaUuid}/access-url`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to resolve media URL: ${response.status}`);
        }

        const data = (await response.json()) as MediaAccessResponse;

        if (!cancelled) {
          setThumbnailUrl(data.url || "/Image/default-food.png");
        }
      } catch (error) {
        console.error("[FOOD CARD MEDIA ERROR]", {
          thumbnail: food.thumbnail,
          error,
        });

        if (!cancelled) {
          setThumbnailUrl("/Image/default-food.png");
        }
      }
    }

    void resolveThumbnail();

    return () => {
      cancelled = true;
    };
  }, [food.thumbnail]);

  const toggleFavorite = () => {
    const currentIds = getStoredFavoriteIds();

    const nextIds = currentIds.includes(food.uuid)
      ? currentIds.filter((id) => id !== food.uuid)
      : [...currentIds, food.uuid];

    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextIds));

    setIsFavorite(nextIds.includes(food.uuid));

    window.dispatchEvent(new Event("foodhub-favorites-updated"));
  };

  const displayName =
    food.localName?.trim() || food.name || food.foodName || "Unnamed food";

  const dietaryTypes = getDietaryTypes(food);

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
          MAIN CARD
      ========================================== */}

      <Link
        href={`/food/${food.uuid}`}
        className="
          flex flex-col min-w-[300x] h-full  bg-white border border-gray-200 shadow-sm rounded-[24px] p-2.5
        "
      >
        {/* ========================================
            IMAGE
        ======================================== */}

        {/* <div className="relative flex-1 min-h-0">
          <Image
            src={thumbnail}
            alt={displayName}
            draggable={false}
            width={285}
            height={370}  
            className="
             rounded-[14px] w-full h-full object-cover pointer-events-none
            "
          />
        </div> */}
        <div className="relative  flex-1 min-h-0">
          <img
            width={485}
            height={370}
            src={thumbnailUrl}
            alt={displayName}
            draggable={false}
            onError={() => {
              setThumbnailUrl("/Image/default-food.png");
            }}
            className="rounded-[14px]  h-[190px]  object-cover pointer-events-none"
          />

          <button
            type="button"
            aria-label="Save food"
            className="absolute top-2 right-2"
          >
            <CiHeart className="text-4xl p-2 bg-primary-800 rounded-full text-white" />
          </button>
        </div>
        {/* ========================================
            CONTENT
        ======================================== */}

        <div className="flex shrink-0 flex-col gap-2">
          {/* STORE */}

          <div className="flex items-center gap-2 text-secondary-400">
            <FaStore />

            <p className="line-clamp-1 text-sm">
              {food.store?.name || "Unknown store"}
            </p>
          </div>

          {/* ======================================
              NAME + PRICE
          ====================================== */}

          <div className="flex items-center justify-between gap-2">
            <p
              className="
                line-clamp-1
                min-w-0
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
                text-primary-800
                dark:text-primary-300
              "
            >
              {food.currencyCode === "USD"
                ? `$${food.price}`
                : `${food.price} ${food.currencyCode}`}
            </p>
          </div>

          {/* ======================================
              RATING / TIME
          ====================================== */}

          <div className="flex flex-wrap gap-4">
            {/* RATING */}

            <div className="flex items-center gap-2 text-accent-400">
              <FaStar />

              <span>{Number(food.store?.averageRating ?? 0).toFixed(1)}</span>
            </div>

            {/* TIME */}

            {food.preparationTimeMinutes !== null && (
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
              FALLBACK TAGS

              Your current list API often has:
              dietaryTypes: []

              So use the API filter data when there
              are no dietary tags.
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
                    text-sm
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
                    text-sm
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
          FAVORITE

          Keep button OUTSIDE Link to avoid
          button-inside-anchor HTML problems.
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
