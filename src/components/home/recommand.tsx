"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdTime } from "react-icons/io";
import { FaStar, FaStore } from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import { CiHeart } from "react-icons/ci";

import Link from "next/link";
import { useGetFoodsQuery } from "@/app/store/foodApi"; 
import Image from "next/image";

import { TypingAnimation } from "@/components/ui/typing-animation";
import FoodCardComponent from "../FoodCardComponent";
import { EMPTY_FILTERS, FilterState, MealTime } from "@/types/food";

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
      if (isManualOverride.current) return;
      const currentHour = new Date().getHours();
      setActiveTab((prev) => {
        const next = getMealTimeByHour(currentHour);
        return prev === next ? prev : next;
      });
    };

    applyTimeBasedTab(); // run immediately on mount
    hasAutoSelected.current = true;

    const intervalId = setInterval(applyTimeBasedTab, 1_000);

    document.addEventListener("visibilitychange", applyTimeBasedTab);
    window.addEventListener("focus", applyTimeBasedTab);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", applyTimeBasedTab);
      window.removeEventListener("focus", applyTimeBasedTab);
    };
  }, []);

  const {
    data: recommendedFoods = [],
    isLoading,
    isError,
    error,
  } = useGetFoodsQuery();
  console.log(recommendedFoods);
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

  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filters]);

  const totalPages = Math.ceil(filteredFoods.length / ITEMS_PER_PAGE) || 1;
  const paginatedFoods = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFoods.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredFoods, currentPage]);

  return (
    <div className="my-15 flex flex-col gap-12.5">
      <section className="flex flex-col items-center lg:pt-0 md:pt-4 justify-center md:gap-12.5 max-md:gap-6 container max-w-7xl mx-auto">
        <p className="lg:text-6xl  py-2 md:text-4xl max-md:text-2xl text-center dark:text-[#22a447] font-semibold text-primary-800 dark:text-primary-dark">
          បទពិសោធន៍ថ្មីក្នុង
          <TypingAnimation
            words={["ការស្វែងរកអាហារ","ការស្វែងរកអាហារ"]}
            blinkCursor={true}
            pauseDelay={2000}
            loop
            className="text-secondary-500"
          >
          Blinking cursor
          </TypingAnimation>
        </p>
        <p className="lg:text-[24px] md:text-[20px] text-center font-light text-gray-700 dark:text-gray-100 max-md:text-[16px]">
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
      <div className="lg:max-w-7xl md:max-w-3xl container items-center place-items-center mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 px-4">
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
          {paginatedFoods.map((food) => (
            <Link key={food.id} href={`/menu/${food.id}`}>
              <FoodCardComponent food={food} />
            </Link>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 pb-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-600 disabled:opacity-50 hover:border-primary-600 hover:text-primary-600 transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 rotate-90">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-gray-600">
            ទំព័រ {currentPage} នៃ {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-600 disabled:opacity-50 hover:border-primary-600 hover:text-primary-600 transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 -rotate-90">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
