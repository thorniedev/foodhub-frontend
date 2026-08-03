"use client";

import { MenuItem } from "@/types/manu";
import { motion } from "framer-motion";
import Image from "next/image";

import { CiHeart } from "react-icons/ci";
import { FaStore, FaStar } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import { MdDeliveryDining } from "react-icons/md";

type FoodCardProps = {
  food: MenuItem;
};

export default function FoodCard({ food }: FoodCardProps) {
  const matchPercentage = Math.round(food.recommendation.finalScore * 100);

  return (
    <motion.div
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
      className="flex lg:w-[300px] md:w-[230px] flex-col gap-2.5 rounded-[24px] border border-gray-100 bg-white p-2.5 shadow-sm border border-gray-100"
    >
      <div className="relative lg:h-[185px] md:h-[140px]  w-full overflow-hidden rounded-[14px]">
        <Image
          fill
          src={food.thumbnail}
          alt={food.localName || food.name}
          sizes="285px"
          className="object-cover"
        />

        {/* <span className="absolute left-2 top-2 rounded-full bg-primary-800 px-3 py-1 text-sm text-white">
          {matchPercentage}% Match
        </span> */}

        <button
          type="button"
          aria-label="Save to favorites"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          className="absolute right-2 top-2"
        >
          <CiHeart className="rounded-full bg-primary-800 p-2 text-4xl text-white" />
        </button>
      </div>

      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex items-center gap-2 text-secondary-400">
          <FaStore className="shrink-0" />

          <p className="truncate lg:text-[16px] text-sm">
            {food.store.localName}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="line-clamp-1 min-w-0 text-[24px] font-medium text-primary-900">
            {food.localName}
          </p>

          <p className="shrink-0 text-[24px] font-medium text-primary-800">
            ${food.price.toFixed(2)}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {/* <div className="flex items-center gap-2 text-accent-400">
            <FaStar />
            <span>{food.store.averageRating}</span>
          </div> */}

          <div className="flex items-center gap-2 text-primary-400">
            <IoMdTime />
            <span>{food.preparationTimeMinutes} min</span>
          </div>

          <div className="flex items-center gap-2 text-primary-400">
            <MdDeliveryDining />
            <span>{food.distanceKm} km</span>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {food.dietaryTypes.map((diet) => (
            <span
              key={diet.code}
              className="shrink-0 lg:text-[16px] whitespace-nowrap rounded-full bg-primary-800 px-3 py-1 text-sm text-white"
            >
              {diet.name}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
