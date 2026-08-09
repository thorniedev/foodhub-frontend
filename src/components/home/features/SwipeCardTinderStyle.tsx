"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { IoMdArrowBack, IoMdArrowForward, IoMdTime } from "react-icons/io";
import { FaStar, FaStore } from "react-icons/fa";
import { MdDeliveryDining, MdSwipe } from "react-icons/md";
import { CiHeart } from "react-icons/ci";

import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { EffectCards } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-cards";

import type { MenuItem } from "@/types/manu";

type SwipeCardTinderStyleProps = {
  foods: MenuItem[];
};

export default function SwipeCardTinderStyle({
  foods,
}: SwipeCardTinderStyleProps) {
  const swiperRef = useRef<SwiperInstance | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const [pulseKey, setPulseKey] = useState(0);

  const total = foods.length;

  const markInteracted = () => {
    setPulseKey((current) => current + 1);
  };

  if (total === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        មិនមានមុខម្ហូបណែនាំទេ
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 px-4 py-10">
      <div className="relative mx-auto h-[390px] w-[285px]">
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
          cardsEffect={{
            slideShadows: false,
            perSlideOffset: 10,
            perSlideRotate: 3,
            rotate: true,
          }}
          modules={[EffectCards]}
          className="h-full w-full"
        >
          {foods.map((food) => (
            <SwiperSlide
              key={food.uuid}
              className="overflow-hidden rounded-[24px]"
            >
              <SwipeFoodCard food={food} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="flex items-center gap-2 text-center text-sm text-gray-400">
        <motion.span
          key={pulseKey}
          animate={{
            x: [0, -8, 8, -5, 5, 0],
          }}
          transition={{
            duration: 1,
            ease: "easeInOut",
            delay: 3,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          className="inline-flex shrink-0"
        >
          <MdSwipe className="text-lg text-primary-600" />
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
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-primary-700 shadow-sm transition-all hover:bg-primary-50 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IoMdArrowBack className="text-2xl" />
        </button>

        <p className="w-14 text-center text-sm tabular-nums text-gray-500">
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
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-primary-700 shadow-sm transition-all hover:bg-primary-50 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IoMdArrowForward className="text-2xl" />
        </button>
      </div>
    </div>
  );
}

type SwipeFoodCardProps = {
  food: MenuItem;
};

function SwipeFoodCard({ food }: SwipeFoodCardProps) {
  const matchPercentage = Math.round(food.recommendation.finalScore * 100);

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: food.currencyCode,
    minimumFractionDigits: 2,
  }).format(food.price);

  return (
    // swipe card tinder style
    <Link
      href={`/food/${food.uuid}`}
      draggable={false}
      className="flex h-full w-full flex-col gap-3 rounded-[24px] border border-gray-200 bg-white p-2.5 shadow-sm"
    >
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[14px]">
        <Image
          fill
          src={food.thumbnail}
          alt={food.localName || food.name}
          draggable={false}
          sizes="285px"
          className="pointer-events-none object-cover"
        />

        {/* <span className="absolute left-2 top-2 rounded-full bg-primary-800 px-3 py-1 text-base font-medium text-white">
          {matchPercentage}% Match
        </span> */}

        <button
          type="button"
          aria-label="Save to favorites"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          className="absolute right-2 top-2 z-10"
        >
          <CiHeart className="rounded-full bg-primary-800 p-2 text-4xl font-bold text-white" />
        </button>
      </div>

      <div className="flex shrink-0 flex-col gap-2">
        <div className="flex items-center gap-2 text-secondary-400">
          <FaStore className="shrink-0" />

          <p className="truncate text-sm">{food.store.localName}</p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="line-clamp-1 min-w-0 text-[22px] font-medium text-primary-900">
            {food.localName}
          </p>

          <p className="shrink-0 text-[22px] font-medium text-primary-800">
            {formattedPrice}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-accent-400">
            <FaStar />

            <span>{food.store.averageRating}</span>
          </div>

          <div className="flex items-center gap-1.5 text-primary-400">
            <IoMdTime />

            <span>{food.preparationTimeMinutes} min</span>
          </div>

          <div className="flex items-center gap-1.5 text-primary-400">
            <MdDeliveryDining className="text-lg" />

            <span>{food.distanceKm} km</span>
          </div>
        </div>
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
        {/* <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
          {food.dietaryTypes.map((diet) => (
            <span
              key={diet.code}
              className="shrink-0 whitespace-nowrap rounded-full bg-primary-800 px-3 py-1 text-base text-white"
            >
              {diet.name}
            </span>
          ))}
        </div> */}
      </div>
    </Link>
  );
}
