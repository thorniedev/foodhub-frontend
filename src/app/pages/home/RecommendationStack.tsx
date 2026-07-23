"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { IoMdTime, IoMdArrowBack, IoMdArrowForward } from "react-icons/io";
import { FaStar, FaStore } from "react-icons/fa";
import { MdDeliveryDining, MdSwipe } from "react-icons/md";
import { CiHeart } from "react-icons/ci";
import { EffectCards } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css/effect-cards";
import "swiper/css";

import type { FoodItem } from "@/app/types/food";

type RecommendCardStackProps = {
  foods: FoodItem[];
};

export default function RecommendCardStack({ foods }: RecommendCardStackProps) {
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // bumping this key resets + restarts the idle hint below — every swipe
  // or button tap remounts it, so its 3s delay starts counting again
  const [pulseKey, setPulseKey] = useState(0);
  const total = foods.length;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        មិនមានមុខម្ហូបណែនាំទេ
      </div>
    );
  }

  const markInteracted = () => setPulseKey((k) => k + 1);

  return (
    <div className="flex flex-col items-center gap-5 py-10 px-4">
      <div className="relative w-[285px] h-[365.01px] mx-auto">
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
          loop
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
            <SwiperSlide key={food.id} className="rounded-[24px]">
              <FoodCard food={food} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* on-card notice: a floating badge that fades in over the top
            card itself, on the same 3s-idle / infinite cadence as the
            hint text below */}
        {/* <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <motion.div
            key={pulseKey}
            initial={{ opacity: 0, x: 0, scale: 0.85 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: [0, -32, 32, 0],
              scale: [0.85, 1, 1, 0.85],
            }}
            transition={{
              duration: 1.8,
              times: [0, 0.3, 0.7, 1],
              ease: "easeInOut",
              delay: 3,
              repeat: Infinity,
              repeatDelay: 3,
            }}
            className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white shadow-lg backdrop-blur-sm"
          >
            <MdSwipe className="text-sm" />
            <span>អូសដើម្បីមើលបន្ថែម</span>
          </motion.div>
        </div> */}
      </div>

      {/* affordance: nudges the user every ~3s of inactivity that the card
          is swipeable — resets and starts a fresh 3s countdown on every
          swipe or button tap, then keeps repeating indefinitely */}
      <div className="flex items-center gap-2 text-gray-400 text-sm">
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
          className="inline-flex"
        >
          <MdSwipe className="text-lg text-primary-600" />
        </motion.span>
        <p>អូសកាតទៅឆ្វេង ឬស្តាំ ដើម្បីមើលមុខម្ហូបផ្សេងទៀត</p>
      </div>

      {/* prev / next controls — same effect as swiping, loop back at the ends */}
      <div className="flex items-center gap-6">
        <button
          type="button"
          aria-label="Previous card"
          onClick={() => {
            markInteracted();
            swiperRef.current?.slidePrev();
          }}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm text-primary-700 hover:bg-primary-50 active:scale-90 transition-all cursor-pointer"
        >
          <IoMdArrowBack className="text-2xl" />
        </button>
        <p className="text-gray-500 text-sm w-12 text-center tabular-nums">
          {activeIndex + 1}/{total}
        </p>
        <button
          type="button"
          aria-label="Next card"
          onClick={() => {
            markInteracted();
            swiperRef.current?.slideNext();
          }}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm text-primary-700 hover:bg-primary-50 active:scale-90 transition-all cursor-pointer"
        >
          <IoMdArrowForward className="text-2xl" />
        </button>
      </div>
    </div>
  );
}

function FoodCard({ food }: { food: FoodItem }) {
  return (
    <div className="flex flex-col w-full h-full gap-4 bg-white border border-gray-200  shadow-sm rounded-[24px] p-2.5">
      <div className="relative bord flex-1 min-h-0">
        <img
          src={food.image}
          alt={food.name}
          draggable={false}
          className="rounded-[14px] w-full h-full object-cover pointer-events-none"
        />
        <button
          type="button"
          aria-label="Save to favorites"
          className="absolute top-0 right-0"
        >
          <CiHeart className="text-4xl p-2 bg-primary-800 font-bold rounded-full text-white" />
        </button>
      </div>

      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex text-secondary-400 items-center gap-2">
          <FaStore />
          <p className="mt-1 text-[14px]">{food.store}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-[24px] font-medium text-primary-900">
            {food.name}
          </p>
          <p className="text-[24px] font-medium text-primary-800">{`${food.price}$`}</p>
        </div>
        <div className="flex gap-4">
          <div className="flex gap-2 items-center text-accent-400">
            <FaStar />
            <p className="mt-1">{food.rating}</p>
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
        <div className="flex gap-2 items-center flex-wrap">
          {food.tags.map((tag) => (
            <span
              key={tag}
              className="bg-primary-800 text-gray-100 w-fit px-3 py-1 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
