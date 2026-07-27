"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdTime } from "react-icons/io";
import { FaStar, FaStore } from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import { CiHeart } from "react-icons/ci";
import type { FoodItem, MealTime, FilterState } from "@/types/food";
import { EMPTY_FILTERS } from "@/types/food";

const tabs: { id: MealTime; label: string }[] = [
  { id: "breakfast", label: "អាហារពេលព្រឹក" },
  { id: "lunch", label: "អាហារពេលថ្ងៃ" },
  { id: "dinner", label: "អាហារពេលល្ងាច" },
];

const recommendedFoods: FoodItem[] = [
  {
    id: 1,
    mealTime: "breakfast",
    store: "Kongfou Kitchen",
    name: "នំ Tacos",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    distance: "1.3km",
    price: "2",
    tags: ["ហាឡាល់", "អាហារបួស"],
    foodTypes: ["ម្ហូបលោកខាងលិច"],
    drinkTypes: ["កាហ្វេ"],
    ageGroups: ["គ្រប់វ័យ"],
    image: "/Image/card-img.png",
  },
  {
    id: 2,
    mealTime: "lunch",
    store: "Kongfou Kitchen",
    name: "គុយទាវខ្មែរ",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    distance: "1.3km",
    price: "2",
    tags: ["ហាឡាល់"],
    foodTypes: ["ម្ហូបខ្មែរ"],
    drinkTypes: ["ទឹកផ្លែឈើ"],
    ageGroups: ["គ្រប់វ័យ", "កុមារ"],
    image: "/Image/card-img.png",
  },
  {
    id: 3,
    mealTime: "dinner",
    store: "Kongfou Kitchen",
    name: "ជើងមាន់អាំង",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    distance: "1.3km",
    price: "2",
    tags: ["អាហារបួស"],
    foodTypes: ["អាហារដុត/BBQ"],
    drinkTypes: ["ស្រា/ បៀរ"],
    ageGroups: ["យុវជន", "មនុស្សពេញវ័យ"],
    image: "/Image/card-img.png",
  },
  {
    id: 4,
    mealTime: "breakfast",
    store: "Kongfou Kitchen",
    name: "បបរសាច់មាន់",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    distance: "1.3km",
    price: "2",
    tags: ["ហាឡាល់"],
    foodTypes: ["ម្ហូបខ្មែរ"],
    drinkTypes: ["តែ"],
    ageGroups: ["គ្រប់វ័យ"],
    image: "/Image/card-img.png",
  },
  {
    id: 5,
    mealTime: "lunch",
    store: "Kongfou Kitchen",
    name: "មីឆាកូរ៉េ",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    distance: "1.3km",
    price: "2",
    tags: ["ហាឡាល់"],
    foodTypes: ["ម្ហូបចិន"],
    drinkTypes: ["តែ"],
    ageGroups: ["យុវជន"],
    image: "/Image/card-img.png",
  },
  {
    id: 6,
    mealTime: "dinner",
    store: "Kongfou Kitchen",
    name: "ស៊ុប Tom Yum",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    distance: "1.3km",
    price: "2",
    tags: ["ហាឡាល់"],
    foodTypes: ["ម្ហូបថៃ"],
    drinkTypes: ["ទឹកផ្លែឈើ"],
    ageGroups: ["មនុស្សពេញវ័យ"],
    image: "/Image/card-img.png",
  },
  {
    id: 7,
    mealTime: "breakfast",
    store: "Kongfou Kitchen",
    name: "នំបុ័ង Croissant",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    distance: "1.3km",
    price: "2",
    tags: ["ហាឡាល់"],
    foodTypes: ["បង្អែម", "ម្ហូបលោកខាងលិច"],
    drinkTypes: ["កាហ្វេ"],
    ageGroups: ["គ្រប់វ័យ"],
    image: "/Image/card-img.png",
  },
  {
    id: 8,
    mealTime: "lunch",
    store: "Kongfou Kitchen",
    name: "សាច់អាំងសាច់គោ",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    distance: "1.3km",
    price: "2",
    tags: ["ហាឡាល់"],
    foodTypes: ["អាហារដុត/BBQ"],
    drinkTypes: ["ស្រា/ បៀរ"],
    ageGroups: ["មនុស្សពេញវ័យ"],
    image: "/Image/card-img.png",
  },
  {
    id: 9,
    mealTime: "breakfast",
    store: "Kongfou Kitchen",
    name: "នំ Tacos",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    distance: "1.3km",
    price: "2",
    tags: ["ហាឡាល់"],
    foodTypes: ["ម្ហូបខ្មែរ"],
    drinkTypes: ["ទឹកផ្លែឈើ"],
    ageGroups: ["កុមារ"],
    image: "/Image/card-img.png",
  },
];

function matchesQuery(food: FoodItem, query?: string) {
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
  // No filter set, or nothing selected = don't filter this group.
  if (!selected || selected.size === 0) return true;
  // "គ្រប់វ័យ" (all ages) always passes the age group.
  if (itemValues.includes("គ្រប់វ័យ")) return true;
  return itemValues.some((v) => selected.has(v));
}

type RecommandSectionProps = {
  filters?: FilterState;
};

export default function RecommandSection({
  filters = EMPTY_FILTERS,
}: RecommandSectionProps) {
  const [activeTab, setActiveTab] = useState<MealTime>("breakfast");

  const filteredFoods = useMemo(
    () =>
      recommendedFoods.filter(
        (food) =>
          food.mealTime === activeTab &&
          matchesQuery(food, filters.query) &&
          matchesGroup(food.foodTypes, filters.food) &&
          matchesGroup(food.drinkTypes, filters.drink) &&
          matchesGroup(food.ageGroups, filters.age),
      ),
    [activeTab, filters],
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
              onClick={() => setActiveTab(tab.id)}
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
        <AnimatePresence mode="popLayout">
          {filteredFoods.length === 0 && (
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
            <motion.div
              key={food.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col w-fit gap-4 bg-white border border-gray-100 shadow-sm rounded-[24px] p-2.5"
            >
              <div className="relative">
                <img
                  src={food.image}
                  alt={food.name}
                  className="rounded-[14px] w-[350px] object-cover"
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
                {/* <p className="text-gray-500 text-[16px]">{food.description}</p> */}
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
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
