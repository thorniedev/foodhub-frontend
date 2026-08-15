"use client";

import type { MenuItem } from "@/types/menu-item";
import { CiHeart } from "react-icons/ci";
import { FaStore, FaStar } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import { MdDeliveryDining } from "react-icons/md";
import MediaImage from "./home/features/MediaImage";

export default function FoodCard({ food }: { food: MenuItem }) {
  return (
    <div
      className="
      flex flex-col 
      w-full 
      h-full
      gap-4 
      bg-white 
      border 
      border-gray-200
      shadow-sm 
      rounded-[24px] 
      p-2.5
      "
    >
      {/* Image */}
      <div className="relative flex-1 min-h-0">
        {food.thumbnail && (
          <MediaImage
            thumbnail={food.thumbnail}
            alt={food.localName || food.name}
          />
        )}

        <button type="button" className="absolute top-2 right-2">
          <CiHeart
            className="
            text-4xl
            p-2
            bg-primary-800
            rounded-full
            text-white
            "
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 shrink-0">
        {/* Store */}
        <div className="flex items-center gap-2 text-secondary-400">
          <FaStore />

          <p className="text-shadow-lg">{food.store?.localName}</p>
        </div>

        {/* Name + Price */}
        <div className="flex justify-between items-center">
          <p
            className="
          text-[22px]
          font-medium
          text-primary-900
          line-clamp-1
          "
          >
            {food.localName}
          </p>

          <p
            className="
          text-[22px]
          font-medium
          text-primary-800 dark:text-primary-dark
          "
          >
            {food.price}
            {food.currencyCode}
          </p>
        </div>

        {/* Rating */}
        <div className="flex gap-4">
          <div
            className="
          flex 
          gap-2 
          items-center
          text-accent-400
          "
          >
            <FaStar />

            <span>{food.store?.averageRating ?? 0}</span>
          </div>

          <div
            className="
          flex
          gap-2
          items-center
          text-primary-400
          "
          >
            <IoMdTime />

            <span>{food.preparationTimeMinutes} min</span>
          </div>

          <div
            className="
          flex
          gap-2
          items-center
          text-primary-400
          "
          >
            <MdDeliveryDining />

            <span>{food.distanceKm} km</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 flex-wrap">
          {food.dietaryTypes?.map((diet) => (
            <span
              key={diet.code}
              className="
              bg-primary-800
              text-white
              px-3
              py-1
              rounded-full
              text-lg
              "
            >
              {diet.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
