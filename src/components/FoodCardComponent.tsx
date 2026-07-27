"use client";

import { FoodItem } from "@/types/food";
import { motion } from "framer-motion";
import Image from "next/image";
import { CiHeart } from "react-icons/ci";
import { FaStore, FaStar } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import { MdDeliveryDining } from "react-icons/md";


type Props = {
  food: FoodItem;
};

export default function FoodCardComponent({ food }: Props) {
  const { image, name, store, price, rating, time, distance, tags } = food;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col w-fit gap-4 bg-white border border-gray-100 shadow-sm rounded-[24px] p-2.5"
    >
      <div className="relative">
        <Image
          width={285}
          height={370}
          src={image}
          alt={name}
          className="rounded-[14px] md:w-67.5  md:h-37.5 lg:h-46.25 lg:w-71.25 object-cover"
        />

        <button className="absolute top-2 right-2">
          <CiHeart className="text-4xl p-2 bg-primary-800 rounded-full text-white" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-secondary-400">
          <FaStore />
          <p>{store}</p>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-[24px] font-medium text-primary-900 line-clamp-1">
            {name}
          </p>

          <p className="text-[24px] font-medium text-primary-800">${price}</p>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-accent-400">
            <FaStar />
            <span>{rating}</span>
          </div>

          <div className="flex items-center gap-2 text-primary-400">
            <IoMdTime />
            <span>{time}</span>
          </div>

          <div className="flex items-center gap-2 text-primary-400">
            <MdDeliveryDining />
            <span>{distance}</span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-primary-800 text-white px-3 py-1 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
