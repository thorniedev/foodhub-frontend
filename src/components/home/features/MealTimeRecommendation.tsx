"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { TypingAnimation } from "@/components/ui/typing-animation";
import FoodCard from "@/components/dynamic-card/FoodCard";

import { useGetMenuItemsQuery } from "@/app/store/menuApi";

import { EMPTY_FILTERS, type FilterState } from "@/types/food";
import type { CatalogMenuItem } from "@/types/catalog-menu-item";

import { addToHistory } from "@/lib/history/recentlyViewed";
import Link from "next/link";

type TabId = "all" | "breakfast" | "lunch" | "dinner";

const tabs: { id: TabId; label: string }[] = [
  {
    id: "all",
    label: "ទាំងអស់",
  },
  {
    id: "breakfast",
    label: "អាហារពេលព្រឹក",
  },
  {
    id: "lunch",
    label: "អាហារពេលថ្ងៃ",
  },
  {
    id: "dinner",
    label: "អាហារពេលល្ងាច",
  },
];

function getMealTimeByHour(hour: number): TabId {
  if (hour >= 5 && hour < 11) {
    return "breakfast";
  }

  if (hour >= 11 && hour < 17) {
    return "lunch";
  }

  return "dinner";
}

function normalizeText(value?: string | null): string {
  return (value ?? "").trim().toLowerCase().normalize("NFKC");
}

function matchesQuery(food: CatalogMenuItem, query?: string): boolean {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return true;
  }

  const searchableValues = [
    food.name,
    food.localName,
    food.food?.canonicalName,
    food.description,

    food.store.name,

    food.food?.category?.name,
    food.food?.category?.code,

    food.food?.cuisine?.name,
    food.food?.cuisine?.code,

    ...(food.food?.mealTypes ?? []).map((item) => item.name),

    ...(food.food?.mealTypes ?? []).map((item) => item.code),

    ...(food.food?.ageGroups ?? []).map((item) => item.name),

    ...(food.food?.ageGroups ?? []).map((item) => item.code),
  ];

  return searchableValues.some((value) =>
    normalizeText(value).includes(normalizedQuery),
  );
}

function matchesGroup(itemValues: string[], selected?: Set<string>): boolean {
  if (!selected || selected.size === 0) {
    return true;
  }

  const normalizedItemValues = itemValues.map(normalizeText);

  return [...selected].some((selectedValue) =>
    normalizedItemValues.includes(normalizeText(selectedValue)),
  );
}

type RecommandSectionProps = {
  filters?: FilterState;
};

export default function MealTimeRecommandSection({
  filters = EMPTY_FILTERS,
}: RecommandSectionProps) {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const isManualOverride = useRef(false);

  const {
    data: foods = [],
    isLoading,
    isError,
    error,
  } = useGetMenuItemsQuery();
  console.log("==> api data", foods);
  /**
   * Automatically select meal time.
   *
   * We don't need to check every second.
   * Once per minute is enough and is lighter
   * for the browser.
   */
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

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        applyTimeBasedTab();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    window.addEventListener("focus", applyTimeBasedTab);

    return () => {
      window.clearInterval(intervalId);

      document.removeEventListener("visibilitychange", handleVisibilityChange);

      window.removeEventListener("focus", applyTimeBasedTab);
    };
  }, []);

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      // ==========================================
      // MEAL TIME
      // New API:
      // food.food.mealTypes
      // ==========================================
      const mealMatch =
        activeTab === "all" ||
        (food.food?.mealTypes ?? []).some(
          (meal) => normalizeText(meal.code) === normalizeText(activeTab),
        );

      // ==========================================
      // CATEGORY
      // New API:
      // food.food.category
      // ==========================================
      const categoryMatch = matchesGroup(
        [food.food?.category?.name ?? "", food.food?.category?.code ?? ""],
        filters.food,
      );

      // ==========================================
      // AGE GROUP
      // New API:
      // food.food.ageGroups
      // ==========================================
      const ageMatch = matchesGroup(
        (food.food?.ageGroups ?? []).flatMap((item) => [item.name, item.code]),
        filters.age,
      );

      /**
       * Your new LIST response currently does not
       * provide a typed dietary/drink structure
       * that can safely replace:
       *
       * food.dietaryTypes.map(...)
       *
       * Therefore don't try to read `.name`
       * from `dietaryTypes` here yet.
       *
       * For now we allow the item through when
       * no drink filter is selected.
       */
      const drinkMatch = !filters.drink || filters.drink.size === 0;

      return (
        mealMatch &&
        matchesQuery(food, filters.query) &&
        categoryMatch &&
        drinkMatch &&
        ageMatch
      );
    });
  }, [foods, activeTab, filters]);

  const handleViewFood = (food: CatalogMenuItem) => {
    addToHistory({
      uuid: food.uuid,

      name: food.name || food.food?.canonicalName || "",

      localName: food.localName ?? food.name,

      thumbnail: food.thumbnail ?? "",
    });
  };

  return (
    <section className="w-full">
      {/* ==========================================
          TITLE
      ========================================== */}

      <div className="container mx-auto mb-10 max-w-7xl px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-900 md:text-4xl">
            ណែនាំសម្រាប់អ្នក
            <TypingAnimation
              words={["ការស្វែងរកអាហារ", "ការស្វែងរកអាហារ"]}
              blinkCursor
              pauseDelay={2000}
              loop
              className="text-secondary-500"
            />
          </h2>

          <p className="mx-auto mt-4 max-w-3xl leading-7 text-gray-500">
            ស្វែងរកមុខម្ហូប និងហាងអាហារ ដែលសមនឹងអ្នក តាមរយៈ ប្រព័ន្ធណែនាំឆ្លាតវៃ
            ដែលគិតគូរពីចំណូលចិត្ត អាឡែស៊ី របបអាហារ ជំនឿសាសនា និងទីតាំងរបស់អ្នក
          </p>
        </div>
      </div>

      {/* ==========================================
          MEAL TIME TABS
      ========================================== */}

      <div className="container mx-auto max-w-7xl px-4">
        <div className="scrollbar-hide flex gap-8 overflow-x-auto border-b border-gray-200">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  isManualOverride.current = true;

                  setActiveTab(tab.id);
                }}
                className={`relative cursor-pointer whitespace-nowrap pb-4 text-lg font-semibold transition-colors md:text-xl ${isActive
                    ? "text-primary-700"
                    : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                {tab.label}

                {isActive && (
                  <motion.div
                    layoutId="active-meal-tab-underline"
                    className="absolute -bottom-[1px] left-0 right-0 h-[3px] rounded-full bg-primary-700"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 40,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ==========================================
          FOOD GRID
      ========================================== */}

      <div className="container mx-auto mt-8 grid max-w-7xl grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6 px-4">
        {/* Loading */}
        {isLoading && (
          <div className="col-span-full py-16 text-center">
            <p className="text-gray-400">កំពុងផ្ទុក...</p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="col-span-full py-16 text-center">
            <p className="text-red-500">មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ</p>

            {process.env.NODE_ENV === "development" && (
              <pre className="mx-auto mt-3 max-w-xl overflow-auto text-left text-xs text-red-400">
                {JSON.stringify(error, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && filteredFoods.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <p className="text-gray-400">
              មិនមានមុខម្ហូបដែលត្រូវនឹងការស្វែងរកទេ
            </p>
          </div>
        )}

        {/* Foods */}
        <AnimatePresence mode="popLayout">
          {filteredFoods.map((food) => (
            <motion.div
              key={food.uuid}
              layout
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -8,
              }}
              transition={{
                duration: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div
                onClick={() => handleViewFood(food)}
                className="block h-full"
              >
                <FoodCard food={food} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
