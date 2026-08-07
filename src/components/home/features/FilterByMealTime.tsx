"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import { TypingAnimation } from "@/components/ui/typing-animation";
import { useGetMenuItemsQuery } from "@/app/store/menuApi";

import FoodCard from "@/components/dynamic-card/FoodCard";
import { MealType, MenuItem } from "@/types/manu";

type TabId = "all" | "BREAKFAST" | "LUNCH" | "DINNER";

const tabs: {
  id: TabId;
  label: string;
}[] = [
  {
    id: "all",
    label: "ទាំងអស់",
  },
  {
    id: "BREAKFAST",
    label: "អាហារពេលព្រឹក",
  },
  {
    id: "LUNCH",
    label: "អាហារពេលថ្ងៃ",
  },
  {
    id: "DINNER",
    label: "អាហារពេលល្ងាច",
  },
];

type RecommendationFilters = {
  query?: string;
  dietaryTypes?: string[];
  ageGroups?: string[];
  cuisines?: string[];
};

type FilterByMealTimeProps = {
  filters?: RecommendationFilters;
};

const EMPTY_FILTERS: RecommendationFilters = {
  query: "",
  dietaryTypes: [],
  ageGroups: [],
  cuisines: [],
};

function getMealTimeByHour(hour: number): TabId {
  if (hour >= 5 && hour < 11) {
    return "BREAKFAST";
  }

  if (hour >= 11 && hour < 17) {
    return "LUNCH";
  }

  return "DINNER";
}

function matchesQuery(menuItem: MenuItem, query?: string): boolean {
  if (!query?.trim()) {
    return true;
  }

  const normalizedQuery = query.trim().toLowerCase();

  const searchableValues = [
    menuItem.name,
    menuItem.localName,
    menuItem.description,
    menuItem.localDescription,
    menuItem.store.name,
    menuItem.store.localName,
    menuItem.food.canonicalName,
    menuItem.food.category.name,
    menuItem.food.cuisine.name,
    ...menuItem.ingredients,
    ...menuItem.dietaryTypes.map((diet) => diet.name),
  ];

  return searchableValues.some((value) =>
    value.toLowerCase().includes(normalizedQuery),
  );
}

function matchesMealTime(mealTypes: MealType[], activeTab: TabId): boolean {
  if (activeTab === "all") {
    return true;
  }

  return mealTypes.some((mealType) => mealType.code === activeTab);
}

function matchesDietaryTypes(menuItem: MenuItem, selected?: string[]): boolean {
  if (!selected?.length) {
    return true;
  }

  const itemDietaryCodes = menuItem.dietaryTypes.map((diet) => diet.code);

  return selected.some((selectedCode) =>
    itemDietaryCodes.includes(selectedCode),
  );
}

function matchesAgeGroups(menuItem: MenuItem, selected?: string[]): boolean {
  if (!selected?.length) {
    return true;
  }

  const itemAgeGroupCodes = menuItem.food.ageGroups.map(
    (ageGroup) => ageGroup.code,
  );

  return selected.some((selectedCode) =>
    itemAgeGroupCodes.includes(selectedCode),
  );
}

function matchesCuisines(menuItem: MenuItem, selected?: string[]): boolean {
  if (!selected?.length) {
    return true;
  }

  return selected.includes(menuItem.food.cuisine.code);
}

export default function FilterByMealTime({
  filters = EMPTY_FILTERS,
}: FilterByMealTimeProps) {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const isManualOverride = useRef(false);

  const {
    data: menuItems = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMenuItemsQuery();
  // console.log("manu foodcard data :", menuItems);
  useEffect(() => {
    const applyTimeBasedTab = () => {
      if (isManualOverride.current) {
        return;
      }

      const currentHour = new Date().getHours();

      const nextTab = getMealTimeByHour(currentHour);

      setActiveTab((currentTab) =>
        currentTab === nextTab ? currentTab : nextTab,
      );
    };

    applyTimeBasedTab();

    const intervalId = window.setInterval(applyTimeBasedTab, 60_000);

    document.addEventListener("visibilitychange", applyTimeBasedTab);

    window.addEventListener("focus", applyTimeBasedTab);

    return () => {
      window.clearInterval(intervalId);

      document.removeEventListener("visibilitychange", applyTimeBasedTab);

      window.removeEventListener("focus", applyTimeBasedTab);
    };
  }, []);

  const filteredFoods = useMemo(
    () =>
      menuItems
        .filter((menuItem) => menuItem.availabilityStatus === "AVAILABLE")
        .filter((menuItem) => matchesMealTime(menuItem.mealTypes, activeTab))
        .filter((menuItem) => matchesQuery(menuItem, filters.query))
        .filter((menuItem) =>
          matchesDietaryTypes(menuItem, filters.dietaryTypes),
        )
        .filter((menuItem) => matchesAgeGroups(menuItem, filters.ageGroups))
        .filter((menuItem) => matchesCuisines(menuItem, filters.cuisines))
        .sort(
          (firstItem, secondItem) =>
            secondItem.recommendation.finalScore -
            firstItem.recommendation.finalScore,
        ),
    [menuItems, activeTab, filters],
  );

  //   if (isError) {
  //     console.error("RTK Query error:", error);
  //   }

  return (
    <div className="my-15 flex flex-col gap-12.5">
      <section className="container mx-auto flex max-w-7xl flex-col items-center justify-center gap-6 px-4 pt-4 md:gap-12.5 lg:pt-0">
        <p className="text-center  text-2xl dark:text-[#22a447] font-semibold text-primary-800 md:text-4xl lg:text-5xl">
          បទពិសោធន៍ថ្មីក្នុង
          <TypingAnimation
            words={["ការស្វែងរកអាហារ", "ការស្វែងរកអាហារ"]}
            blinkCursor
            pauseDelay={2000}
            loop
            className="text-secondary-500 dark:text-orange-400"
          >
            ការស្វែងរកអាហារ
          </TypingAnimation>
        </p>

        <p className="text-center text-[16px] font-light text-gray-700 dark:text-gray-100 md:text-[20px] lg:text-[24px]">
          ស្វែងរកមុខម្ហូប និងហាងអាហារដែលសមនឹងអ្នក តាមរយៈ
          <br />
          ប្រព័ន្ធណែនាំឆ្លាតវៃ ដែលគិតគូរពីចំណូលចិត្ត អាឡែស៊ី របបអាហារ ជំនឿសាសនា
          និងទីតាំងរបស់អ្នក
        </p>
      </section>

      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex gap-8 overflow-x-auto border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                isManualOverride.current = true;

                setActiveTab(tab.id);
              }}
              className={`relative cursor-pointer whitespace-nowrap pb-4 text-lg font-semibold transition-colors md:text-xl ${
                activeTab === tab.id
                  ? "text-primary-700 dark:text-[#22a447]"
                  : "text-gray-400 dark:text-gray-200 hark:hover:text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}

              {activeTab === tab.id && (
                <motion.div
                  layoutId="active-meal-tab-underline"
                  className="absolute -bottom-px left-0 right-0 h-[3px] rounded-full bg-primary-700"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 40,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto lg:max-w-7xl   px-4 ">
        <div
          className="
      grid
      grid-cols-1
      lg:gap-4
      sm:grid-cols-2
      md:grid-cols-3
      lg:grid-cols-4
     
     md:
    
      lg:max-w-7xl
    "
        >
          {isLoading && (
            <p className="col-span-full py-10 text-center text-gray-400">
              កំពុងផ្ទុក...
            </p>
          )}

          <AnimatePresence mode="popLayout">
            {!isLoading && !isError && filteredFoods.length === 0 && (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full py-10 text-center text-gray-400"
              >
                រកមិនឃើញលទ្ធផលដែលត្រូវនឹងតម្រង
              </motion.p>
            )}

            {!isLoading &&
              !isError &&
              filteredFoods.map((food) => (
                <motion.div
                  layout
                  key={food.uuid}
                  initial={{
                    opacity: 0,
                    y: 20,
                    scale: 0.96,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: 20,
                    scale: 0.96,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  className="w-full"
                >
                  <Link
                    href={`/food/${food.uuid}`}
                    className="block h-full self-center place-items-center w-full"
                  >
                    <FoodCard food={food} />
                  </Link>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
