"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { IoMdArrowBack, IoMdArrowForward, IoMdTime } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import { FaHeart, FaStar, FaStore } from "react-icons/fa";
import { MdDeliveryDining, MdSwipe } from "react-icons/md";

import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { EffectCards } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-cards";

import { DEFAULT_FOOD_IMAGE, toFrontendApiAssetUrl } from "@/lib/catalog-media";

import type {
  CatalogDietaryType,
  CatalogMenuItem,
} from "@/types/catalog-menu-item";

type SwipeCardTinderStyleProps = {
  foods?: CatalogMenuItem[];
};

type SwipeFoodCardProps = {
  food: CatalogMenuItem;
};

const FAVORITES_STORAGE_KEY = "foodhub-favorite-menu-items";

function getStoredFavoriteIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const value = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!value) return [];

    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function getDietaryTypes(food: CatalogMenuItem): CatalogDietaryType[] {
  return Array.isArray(food.food?.dietaryTypes) ? food.food.dietaryTypes : [];
}

function formatPrice(food: CatalogMenuItem): string {
  const currency = food.currencyCode?.trim() || "USD";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(food.price);
  } catch {
    return `${Number(food.price ?? 0).toFixed(2)} ${currency}`;
  }
}

function formatDistance(distanceKm: number | null): string {
  if (
    distanceKm === null ||
    distanceKm === undefined ||
    !Number.isFinite(distanceKm)
  ) {
    return "— km";
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}

export default function SwipeCardTinderStyle({
  foods = [],
}: SwipeCardTinderStyleProps) {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);

  const safeFoods = Array.isArray(foods) ? foods : [];
  const total = safeFoods.length;

  const markInteracted = () => {
    setPulseKey((current) => current + 1);
  };

  if (total === 0) {
    return (
      <p className="text-center text-lg text-gray-400">មិនមានមុខម្ហូបណែនាំទេ</p>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-5 py-5">
      <div className="h-[390px] w-[295px]">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => {
            markInteracted();
            setActiveIndex(swiper.realIndex);
          }}
          effect="cards"
          grabCursor
          loop={total > 1}
          preventClicks
          preventClicksPropagation
          cardsEffect={{
            slideShadows: false,
            perSlideOffset: 10,
            perSlideRotate: 3,
            rotate: true,
          }}
          modules={[EffectCards]}
          className="h-full w-full"
        >
          {safeFoods.map((food) => (
            <SwiperSlide key={food.uuid}>
              <SwipeFoodCard food={food} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="flex items-center gap-2 text-center text-gray-400">
        <motion.span
          key={pulseKey}
          animate={{ x: [0, -8, 8, -5, 5, 0] }}
          transition={{
            duration: 1,
            ease: "easeInOut",
            delay: 3,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          className="inline-flex shrink-0"
        >
          <MdSwipe className="text-xl text-primary-600" />
        </motion.span>

        <p className="text-xl">
          អូសកាតទៅឆ្វេង ឬស្តាំ ដើម្បីមើលមុខម្ហូបផ្សេងទៀត
        </p>
      </div>

      <div className="flex items-center gap-6">
        <button
          type="button"
          aria-label="Previous card"
          disabled={total <= 1}
          onClick={() => {
            markInteracted();
            swiperRef.current?.slidePrev();
          }}
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-primary-700 shadow-sm transition-all hover:border-primary-200 hover:bg-primary-50 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IoMdArrowBack className="text-2xl" />
        </button>

        <p className="w-16 text-center text-lg tabular-nums text-gray-500">
          {activeIndex + 1}/{total}
        </p>

        <button
          type="button"
          aria-label="Next card"
          disabled={total <= 1}
          onClick={() => {
            markInteracted();
            swiperRef.current?.slideNext();
          }}
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-primary-700 shadow-sm transition-all hover:border-primary-200 hover:bg-primary-50 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IoMdArrowForward className="text-2xl" />
        </button>
      </div>
    </div>
  );
}

function SwipeFoodCard({ food }: SwipeFoodCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const effectiveThumbnail =
    food.thumbnail ||
    (food.gallery && food.gallery.length > 0 ? food.gallery[0] : null) ||
    (food.uuid ? `/api/v1/catalog/menu-items/${food.uuid}/images/1` : null);

  const [thumbnailUrl, setThumbnailUrl] = useState<string>(
    toFrontendApiAssetUrl(effectiveThumbnail),
  );

  useEffect(() => {
    const syncFavoriteState = () => {
      const favoriteIds = getStoredFavoriteIds();
      setIsFavorite(favoriteIds.includes(food.uuid));
    };

    syncFavoriteState();

    window.addEventListener("foodhub-favorites-updated", syncFavoriteState);

    return () => {
      window.removeEventListener(
        "foodhub-favorites-updated",
        syncFavoriteState,
      );
    };
  }, [food.uuid]);

  useEffect(() => {
    const nextThumbnail =
      food.thumbnail ||
      (food.gallery && food.gallery.length > 0 ? food.gallery[0] : null) ||
      (food.uuid ? `/api/v1/catalog/menu-items/${food.uuid}/images/1` : null);

    setThumbnailUrl(toFrontendApiAssetUrl(nextThumbnail));
  }, [food.thumbnail, food.gallery, food.uuid]);

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

  const formattedPrice = formatPrice(food);

  const displayName =
    food.localName?.trim() || food.name?.trim() || "Unnamed food";

  const dietaryTypes = getDietaryTypes(food);
  const category = food.food?.category ?? null;
  const cuisine = food.food?.cuisine ?? null;

  const averageRating = Number(food.store?.averageRating ?? 0);
  const displayedRating = Number.isFinite(averageRating)
    ? averageRating.toFixed(1)
    : "0.0";

  const displayedDistance = formatDistance(food.distanceKm);

  return (
    <Link
      href={`/menu-items/${food.uuid}`}
      draggable={false}
      className="flex h-full w-full flex-col gap-3 rounded-[24px] border border-gray-200 bg-white p-2.5 shadow-sm"
    >
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[14px]">
        <img
          src={thumbnailUrl}
          alt={displayName}
          draggable={false}
          width={590}
          height={500}
          onError={(event) => {
            const currentSrc = event.currentTarget.src;

            if (currentSrc.includes(DEFAULT_FOOD_IMAGE)) {
              return;
            }

            setThumbnailUrl(DEFAULT_FOOD_IMAGE);
          }}
          className="pointer-events-none h-full w-full object-cover"
        />

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
          className="absolute right-2 top-2 z-10 cursor-pointer"
        >
          {isFavorite ? (
            <FaHeart className="rounded-full bg-primary-800 p-2 text-4xl text-red-400" />
          ) : (
            <CiHeart className="rounded-full bg-primary-800 p-2 text-4xl font-bold text-white" />
          )}
        </button>
      </div>

      <div className="flex shrink-0 flex-col gap-2">
        <div className="flex items-center gap-2 text-secondary-400">
          <FaStore className="shrink-0" />

          <p className="truncate text-base">
            {food.store?.localName?.trim() ||
              food.store?.name ||
              "Unknown store"}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="line-clamp-1 min-w-0 text-[22px] font-medium text-primary-900">
            {displayName}
          </p>

          <p className="shrink-0 text-[22px] font-medium text-primary-800 dark:text-primary-dark">
            {formattedPrice}
          </p>
        </div>

        <div className="flex items-center gap-4 text-base">
          <div className="flex items-center gap-1.5 text-primary-400">
            <IoMdTime />
            <span>
              {food.preparationTimeMinutes !== null
                ? `${food.preparationTimeMinutes} min`
                : "— min"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-primary-400">
            <MdDeliveryDining className="text-lg" />
            <span>{displayedDistance}</span>
          </div>
        </div>

        {dietaryTypes.length > 0 && (
          <div className="flex items-center gap-2 overflow-hidden">
            {dietaryTypes.slice(0, 2).map((diet) => (
              <span
                key={diet.code}
                className="shrink-0 whitespace-nowrap rounded-full bg-primary-800 px-3 py-1 text-base text-white"
              >
                {diet.name}
              </span>
            ))}

            {dietaryTypes.length > 2 && (
              <span className="shrink-0 whitespace-nowrap rounded-full bg-gray-100 px-3 py-1 text-base text-gray-600">
                +{dietaryTypes.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
