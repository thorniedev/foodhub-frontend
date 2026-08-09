"use client";

import { IoMdTime } from "react-icons/io";
import { FaStar, FaStore } from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import { CiHeart } from "react-icons/ci";
import type { FoodItem } from "@/types/food";
import { MenuItem } from "@/types/menu-item";
import Link from "next/link";
import Image from "next/image";

type Props = {
  food: MenuItem[];
};

export default function FooodCard({ food }: { food: MenuItem }) {
  return (
    <Link
      href={`/food/${food.uuid}`}
      className="flex flex-col w-full h-full gap-4 bg-white border border-gray-200 shadow-sm rounded-[24px] p-2.5"
    >
      {/* Image */}
      <div className="relative flex-1 min-h-0">
        <Image
          width={285}
          height={370}
          src={food.thumbnail || "/Image/default-food.png"}
          alt={food.localName}
          draggable={false}
          className="rounded-[14px] w-full h-full object-cover pointer-events-none"
        />

        <button
          type="button"
          aria-label="Save food"
          className="absolute top-2 right-2"
        >
          <CiHeart className="text-4xl p-2 bg-primary-800 rounded-full text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 shrink-0">
        {/* Store */}
        <div className="flex items-center gap-2 text-secondary-400">
          <FaStore />
          <p className="text-sm">{food.store?.localName}</p>
        </div>

        {/* Name + Price */}
        <div className="flex justify-between items-center gap-2">
          <p className="text-[24px] font-medium text-primary-900 line-clamp-1">
            {food.localName}
          </p>

          <p className="text-[24px] font-medium text-primary-800">
            ${food.price}
          </p>
        </div>

        {/* Rating / Time / Distance */}
        <div className="flex gap-4">
          <div className="flex gap-2 items-center text-accent-400">
            <FaStar />
            <span>{food.store?.averageRating ?? 0}</span>
          </div>

          <div className="flex gap-2 items-center text-primary-400">
            <IoMdTime />
            <span>{food.preparationTimeMinutes} min</span>
          </div>

          <div className="flex gap-2 items-center text-primary-400">
            <MdDeliveryDining className="text-xl" />
            <span>{food.distanceKm} km</span>
          </div>
        </div>

        {/* Dietary tags */}
        <div className="flex gap-2 items-center flex-wrap">
          {food.dietaryTypes?.map((diet) => (
            <span
              key={diet.code}
              className="
              bg-primary-800 
              text-gray-100 
              px-3 
              py-1 
              rounded-full 
              text-sm
              "
            >
              {diet.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
