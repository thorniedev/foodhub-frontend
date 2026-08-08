"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import { CiHeart } from "react-icons/ci";
import { FaHeart, FaStore } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import { MdDeliveryDining } from "react-icons/md";

import type { MenuItem } from "@/types/manu";

import { addToHistory } from "@/lib/history/recentlyViewed";

import {
  FAVORITES_UPDATED_EVENT,
  isFavorite,
  toggleFavorite,
} from "@/lib/favorites/favorites";

type FoodCardProps = {
  food: MenuItem;
};

export default function FoodCard({ food }: FoodCardProps) {
  const [favorite, setFavorite] = useState(false);

  /*
   * Check localStorage when card loads.
   */
  useEffect(() => {
    const updateFavoriteState = () => {
      setFavorite(isFavorite(food.uuid));
    };

    updateFavoriteState();

    /*
     * This keeps every FoodCard synchronized.
     *
     * Example:
     * user removes an item from Favorites page,
     * the heart on this card will update too.
     */
    window.addEventListener(FAVORITES_UPDATED_EVENT, updateFavoriteState);

    return () => {
      window.removeEventListener(FAVORITES_UPDATED_EVENT, updateFavoriteState);
    };
  }, [food.uuid]);

  /*
   * Card click = History
   */
  const handleCardClick = () => {
    addToHistory({
      uuid: food.uuid,
      name: food.name,
      localName: food.localName,
      thumbnail: food.thumbnail,
      price: food.price,
      currencyCode: food.currencyCode,
    });
  };

  /*
   * Heart click = Favorite
   */
  const handleFavoriteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    /*
     * Important:
     * clicking heart must NOT trigger card/history click.
     */
    event.preventDefault();
    event.stopPropagation();

    const nextState = toggleFavorite({
      id: food.uuid,

      imageUrl: food.thumbnail || "/Image/food/default-food.png",

      dishName: food.localName || food.name,

      restaurantName: food.store?.localName || food.store?.name || "FoodHub",

      categoryLabel: food.food?.category?.name || "អាហារ",

      rating: Number(food.store?.averageRating ?? 0),

      etaMinutes: Number(food.preparationTimeMinutes ?? 0),

      distanceKm: Number(food.distanceKm ?? 0),
    });

    setFavorite(nextState);
  };

  return (
    <motion.div
      onClick={handleCardClick}
      title={`${food.localName || food.name} from ${food.store?.localName || food.store?.name || "FoodHub"}`}
      layout
      initial={{
        opacity: 0,
        y: 16,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -16,
      }}
      transition={{
        duration: 0.3,
      }}
      className="flex lg:w-[300px] md:w-[230px] flex-col gap-2.5 rounded-[24px] border border-gray-100 bg-white p-2.5 shadow-sm"
    >
      {/* Image */}
      <div className="relative h-[220px] w-full overflow-hidden rounded-[18px]">
        <Image
          fill
          src={food.thumbnail}
          alt={food.localName || food.name}
          title={`${food.localName || food.name} from ${food.store?.localName || food.store?.name || "FoodHub"}`}
          sizes="285px"
          className="object-cover"
        />

        {/* Favorite button */}
        <button
          type="button"
          aria-label={favorite ? "Remove from favorites" : "Save to favorites"}
          onClick={handleFavoriteClick}
          className="absolute right-2 top-2 z-20 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/95 shadow-md transition duration-200 hover:scale-105"
        >
          {favorite ? (
            <FaHeart className="text-[24px] text-red-500" />
          ) : (
            <CiHeart className="text-[28px] text-primary-800" />
          )}
        </button>
      </div>

      {/* Food content */}
      <div className="flex min-w-0 flex-col gap-2">
        {/* Store */}
        <div className="flex items-center gap-2 text-secondary-400">
          <FaStore className="shrink-0" />

          <p className="truncate text-sm lg:text-[16px]">
            {food.store.localName}
          </p>
        </div>

        {/* Name + Price */}
        <div className="flex items-center justify-between gap-3">
          <p className="line-clamp-1 min-w-0 text-[24px] font-medium text-primary-900">
            {food.localName || food.name}
          </p>

          <p className="shrink-0 text-[24px] font-medium text-primary-800">
            ${food.price.toFixed(2)}
          </p>
        </div>

        {/* Time + Distance */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-primary-400">
            <IoMdTime />

            <span>{food.preparationTimeMinutes} min</span>
          </div>

          <div className="flex items-center gap-2 text-primary-400">
            <MdDeliveryDining />

            <span>{food.distanceKm} km</span>
          </div>
        </div>

        {/* Dietary tags */}
        <div className="flex items-center gap-2 overflow-hidden">
          {food.dietaryTypes.slice(0, 2).map((diet) => (
            <span
              key={diet.code}
              className="shrink-0 whitespace-nowrap rounded-full bg-primary-800 px-3 py-1 text-sm text-white lg:text-[16px]"
            >
              {diet.name}
            </span>
          ))}

          {food.dietaryTypes.length > 2 && (
            <span className="shrink-0 whitespace-nowrap rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 lg:text-[16px]">
              +{food.dietaryTypes.length - 2}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
