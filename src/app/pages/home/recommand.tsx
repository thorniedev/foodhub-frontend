"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdTime } from "react-icons/io";
import { FaStar, FaStore } from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import { CiHeart } from "react-icons/ci";
import type { MealTime, FilterState } from "@/app/types/food";
import { EMPTY_FILTERS } from "@/app/types/food";
import Link from "next/link";
import { useGetFoodsQuery } from "@/app/store/foodApi";
import Image from "next/image";

type TabId = MealTime | "all";

const tabs: { id: TabId; label: string }[] = [
  { id: "all", label: "ទាំងអស់" },
  { id: "breakfast", label: "អាហារពេលព្រឹក" },
  { id: "lunch", label: "អាហារពេលថ្ងៃ" },
  { id: "dinner", label: "អាហារពេលល្ងាច" },
];

function getMealTimeByHour(hour: number): TabId {
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 17) return "lunch";
  return "dinner";
}

function matchesQuery(
  food: { name: string; store: string; description: string; tags: string[] },
  query?: string,
) {
  if (!query || !query.trim()) return true;
  const q = query.trim().toLowerCase();
  return (
    food.name.toLowerCase().includes(q) ||
    food.store.toLowerCase().includes(q) ||
    food.description.toLowerCase().includes(q) ||
    food.tags.some((t) => t.toLowerCase().includes(q))
  );
}

function matchesGroup(itemValues: string[], selected?: Set<string>) {
  if (!selected || selected.size === 0) return true;
  if (itemValues.includes("គ្រប់វ័យ")) return true;
  return itemValues.some((v) => selected.has(v));
}

type RecommandSectionProps = {
  filters?: FilterState;
};

export default function RecommandSection({
  filters = EMPTY_FILTERS,
}: RecommandSectionProps) {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const hasAutoSelected = useRef(false);
  const isManualOverride = useRef(false);
  // useEffect(() => {
  //   if (!hasAutoSelected.current) {
  //     hasAutoSelected.current = true;
  //     const currentHour = new Date().getHours();
  //     setActiveTab(getMealTimeByHour(currentHour));
  //   }
  // }, []);
  useEffect(() => {
    const applyTimeBasedTab = () => {
      if (isManualOverride.current) return; // don't override user's manual click
      const currentHour = new Date().getHours();
      setActiveTab(getMealTimeByHour(currentHour));
    };

    applyTimeBasedTab(); // run immediately on mount
    hasAutoSelected.current = true;

    const intervalId = setInterval(applyTimeBasedTab, 5000); // check every 1 minute

    return () => clearInterval(intervalId);
  }, []);

  const {
    data: recommendedFoods = [],
    isLoading,
    isError,
    error,
  } = useGetFoodsQuery();

  if (error) {
    console.log("RTK Query error:", JSON.stringify(error, null, 2));
  }

  const filteredFoods = useMemo(
    () =>
      recommendedFoods.filter(
        (food) =>
          (activeTab === "all" || food.mealTime === activeTab) &&
          matchesQuery(food, filters.query) &&
          matchesGroup(food.foodTypes, filters.food) &&
          matchesGroup(food.drinkTypes, filters.drink) &&
          matchesGroup(food.ageGroups, filters.age),
      ),
    [recommendedFoods, activeTab, filters],
  );

  return (
    <div className="my-15 flex flex-col gap-12.5">
      <section className="flex flex-col items-center justify-center md:gap-12.5 max-md:gap-6 container max-w-7xl mx-auto">
        <p className="lg:text-5xl md:text-4xl max-md:text-2xl text-center font-semibold text-primary-800">
          បទពិសោធន៍ថ្មីក្នុង
          <span className="text-secondary-500">ការស្វែងរកអាហារ</span>
        </p>
        <p className="lg:text-[24px] md:text-[20px] text-center font-light text-gray-700 max-md:text-[16px]">
          ស្វែងរកមុខម្ហូប និងហាងអាហារដែលសមនឹងអ្នក តាមរយៈ
          <br />
          ប្រព័ន្ធណែនាំឆ្លាតវៃ ដែលគិតគូរពីចំណូលចិត្ត អាឡែស៊ី របបអាហារ ជំនឿសាសនា
          និងទីតាំងរបស់អ្នក
        </p>
      </section>

      {/* Meal-time tabs */}
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex gap-8 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                isManualOverride.current = true;
                setActiveTab(tab.id);
              }}
              className={`relative cursor-pointer pb-4 whitespace-nowrap text-lg md:text-xl font-semibold transition-colors ${
                activeTab === tab.id
                  ? "text-primary-700"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="active-meal-tab-underline"
                  className="absolute left-0 right-0 -bottom-[1px] h-[3px] bg-primary-700 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="lg:max-w-7xl md:max-w-3xl md:gap-4 container items-center place-items-center mx-auto grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 md:gap-4 max-md:gap-4 lg:gap-6">
        {isLoading && (
          <p className="col-span-full text-center text-gray-400 py-10">
            កំពុងផ្ទុក...
          </p>
        )}
        {isError && (
          <p className="col-span-full text-center text-red-400 py-10">
            មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ
          </p>
        )}
        <AnimatePresence mode="popLayout">
          {!isLoading && filteredFoods.length === 0 && (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full text-center text-gray-400 py-10"
            >
              រកមិនឃើញលទ្ធផលដែលត្រូវនឹងតម្រង
            </motion.p>
          )}
          {filteredFoods.map((food) => (
            <Link key={food.id} href={`/food/${food.id}`}>
              <motion.div
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex flex-col w-fit gap-4 bg-white border border-gray-100 shadow-sm rounded-[24px] p-2.5"
              >
                <div className="relative">
                  <Image
                    width={285}
                    height={370}
                    src={food.image}
                    alt={food.name}
                    className="rounded-[14px] h-46.25 w-87.5 object-cover"
                  />
                  <button
                    type="button"
                    aria-label="Save to favorites"
                    className="absolute top-0 right-0"
                  >
                    <CiHeart className="text-4xl p-2 bg-primary-800 font-bold rounded-full text-white" />
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
              </motion.div>
            </Link>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
