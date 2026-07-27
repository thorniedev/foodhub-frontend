"use client";

import { IoMdTime } from "react-icons/io";
import { FaStar, FaStore } from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import { CiHeart } from "react-icons/ci";
import type { FoodItem } from "@/types/food";

type Props = {
  food: FoodItem;
};

export default function FoodCard({ food }: Props) {
  return (
    <div className="flex flex-col gap-4 bg-white border border-gray-100 shadow-sm rounded-[24px] p-2.5">
      <div className="relative">
        <img
          src={food.image}
          alt={food.name}
          className="rounded-[14px] w-full h-[240px] object-cover"
        />

        <div className="absolute left-3 top-3">
          <span className="bg-primary-800 text-white text-sm px-3 py-1 rounded-full">
            95% Match
          </span>
        </div>

        <button
          type="button"
          aria-label="Save to favorites"
          className="absolute top-0 right-0"
        >
          <CiHeart className="text-4xl p-2 bg-primary-800 rounded-full text-white" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex text-secondary-400 items-center gap-2">
          <FaStore />
          <p className="mt-1 text-[14px]">{food.store}</p>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-[24px] font-medium text-primary-900">
            {food.name}
          </p>

          <p className="text-[24px] font-medium text-primary-800">
            {food.price}$
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex gap-2 items-center text-accent-400">
            <FaStar />
            <p>{food.rating}</p>
          </div>

          <div className="flex gap-2 items-center text-primary-400">
            <IoMdTime />
            <p>{food.time}</p>
          </div>

          <div className="flex gap-2 items-center text-primary-400">
            <MdDeliveryDining className="text-xl" />
            <p>{food.distance}</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {food.tags.map((tag) => (
            <span
              key={tag}
              className="bg-primary-800 text-white px-3 py-1 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
