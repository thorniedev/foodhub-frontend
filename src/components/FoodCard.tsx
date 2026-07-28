"use client";

import { MenuItem } from "@/types/menu-item";
import { motion } from "framer-motion";
import Image from "next/image";
import { CiHeart } from "react-icons/ci";
import { FaStore, FaStar } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import { MdDeliveryDining } from "react-icons/md";

type Props = {
  food: MenuItem;
};

export default function FoodCard({ food }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col w-[305px] gap-4 bg-white border border-gray-100 shadow-sm rounded-[24px] p-2.5 overflow-hidden"
    >
      {/* Image */}
      <div className="relative">
        <Image
          width={285}
          height={370}
          src={food.thumbnail}
          alt={food.localName}
          className="rounded-[14px] md:w-[270px] md:h-[150px] lg:w-[285px] lg:h-[185px] object-cover"
        />

        <button className="absolute top-2 right-2">
          <CiHeart className="text-4xl p-2 bg-primary-800 rounded-full text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 min-w-0">
        {/* Store */}
        <div className="flex items-center gap-2 text-secondary-400">
          <FaStore />
          <p className="mt-1">{food.store.localName}</p>
        </div>

        {/* Name & Price */}
        <div className="flex justify-between items-center">
          <p className="text-[24px] font-medium text-primary-900 line-clamp-1">
            {food.localName}
          </p>

          <p className="text-[24px] font-medium text-primary-800">
            ${food.price}
          </p>
        </div>

        {/* Rating • Time • Distance */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-accent-400">
            <FaStar />
            <span>{food.store.averageRating}</span>
          </div>

          <div className="flex items-center gap-2 text-primary-400">
            <IoMdTime />
            <span>{food.preparationTimeMinutes} min</span>
          </div>

          <div className="flex items-center gap-2 text-primary-400">
            <MdDeliveryDining />
            <span>{food.distanceKm} km</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide ">
          {/* {food.mealTypes.map((meal) => (
            <span
              key={meal.code}
              className="bg-primary-800 text-white px-3 py-1 rounded-full text-sm"
            >
              {meal.name}
            </span>
          ))} */}

          {food.dietaryTypes.map((diet) => (
            <span
              key={diet.code}
              className="bg-primary-800 text-white px-3 py-1 rounded-full text-sm whitespace-nowrap shrink-0"
            >
              {diet.name}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
