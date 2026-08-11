"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { TypingAnimation } from "@/components/ui/typing-animation";
import FoodCard from "@/components/dynamic-card/FoodCard";

import { useGetMenuItemsQuery } from "@/app/store/menuApi";

import type { CatalogMenuItem } from "@/types/catalog-menu-item";

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

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKC");
}

function getMealTimeByHour(hour: number): TabId {
  if (hour >= 5 && hour < 11) {
    return "BREAKFAST";
  }

  if (hour >= 11 && hour < 17) {
    return "LUNCH";
  }

  return "DINNER";
}

/**
 * Safely get meal types from new API.
 */
function getMealTypes(menuItem: CatalogMenuItem) {
  return Array.isArray(menuItem.filterData?.mealTypes)
    ? menuItem.filterData.mealTypes
    : [];
}

/**
 * Safely get age groups from new API.
 */
function getAgeGroups(menuItem: CatalogMenuItem) {
  return Array.isArray(menuItem.filterData?.ageGroups)
    ? menuItem.filterData.ageGroups
    : [];
}

/**
 * dietaryTypes is currently unknown[] in
 * CatalogMenuItem because your sample response
 * had empty arrays.
 *
 * This helper safely reads code/name if the
 * backend later returns objects.
 */
function getDietaryValues(menuItem: CatalogMenuItem): string[] {
  if (!Array.isArray(menuItem.dietaryTypes)) {
    return [];
  }

  return menuItem.dietaryTypes.flatMap((item) => {
    if (typeof item !== "object" || item === null) {
      return [];
    }

    const value = item as Record<string, unknown>;

    const result: string[] = [];

    if (typeof value.code === "string") {
      result.push(value.code);
    }

    if (typeof value.name === "string") {
      result.push(value.name);
    }

    return result;
  });
}

function matchesQuery(menuItem: CatalogMenuItem, query?: string): boolean {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return true;
  }

  const mealTypes = getMealTypes(menuItem);

  const ageGroups = getAgeGroups(menuItem);

  const dietaryValues = getDietaryValues(menuItem);

  const searchableValues = [
    menuItem.name,
    menuItem.localName,
    menuItem.foodName,
    menuItem.description,

    menuItem.store?.name,

    menuItem.filterData?.category?.name,
    menuItem.filterData?.category?.code,

    menuItem.filterData?.cuisine?.name,
    menuItem.filterData?.cuisine?.code,

    ...mealTypes.flatMap((mealType) => [mealType.code, mealType.name]),

    ...ageGroups.flatMap((ageGroup) => [ageGroup.code, ageGroup.name]),

    ...dietaryValues,
  ];

  return searchableValues.some((value) =>
    normalizeText(value).includes(normalizedQuery),
  );
}

function matchesMealTime(menuItem: CatalogMenuItem, activeTab: TabId): boolean {
  if (activeTab === "all") {
    return true;
  }

  const mealTypes = getMealTypes(menuItem);

  return mealTypes.some(
    (mealType) =>
      String(mealType.code ?? "")
        .trim()
        .toUpperCase() === activeTab,
  );
}

function matchesDietaryTypes(
  menuItem: CatalogMenuItem,
  selected?: string[],
): boolean {
  if (!selected?.length) {
    return true;
  }

  const itemDietaryValues = getDietaryValues(menuItem).map(normalizeText);

  /**
   * If backend currently returns:
   *
   * dietaryTypes: []
   *
   * then selecting a dietary filter
   * correctly hides this item.
   */
  return selected.some((selectedValue) =>
    itemDietaryValues.includes(normalizeText(selectedValue)),
  );
}

function matchesAgeGroups(
  menuItem: CatalogMenuItem,
  selected?: string[],
): boolean {
  if (!selected?.length) {
    return true;
  }

  const ageGroups = getAgeGroups(menuItem);

  const values = ageGroups.flatMap((ageGroup) => [
    normalizeText(ageGroup.code),
    normalizeText(ageGroup.name),
  ]);

  return selected.some((selectedValue) =>
    values.includes(normalizeText(selectedValue)),
  );
}

function matchesCuisines(
  menuItem: CatalogMenuItem,
  selected?: string[],
): boolean {
  if (!selected?.length) {
    return true;
  }

  const cuisine = menuItem.filterData?.cuisine;

  if (!cuisine) {
    return false;
  }

  const cuisineValues = [
    normalizeText(cuisine.code),
    normalizeText(cuisine.name),
  ];

  return selected.some((selectedValue) =>
    cuisineValues.includes(normalizeText(selectedValue)),
  );
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
    refetch,
  } = useGetMenuItemsQuery();

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
    return menuItems
      .filter((menuItem) => menuItem.availabilityStatus === "AVAILABLE")

      .filter((menuItem) => matchesMealTime(menuItem, activeTab))

      .filter((menuItem) => matchesQuery(menuItem, filters.query))

      .filter((menuItem) => matchesDietaryTypes(menuItem, filters.dietaryTypes))

      .filter((menuItem) => matchesAgeGroups(menuItem, filters.ageGroups))

      .filter((menuItem) => matchesCuisines(menuItem, filters.cuisines));
  }, [menuItems, activeTab, filters]);

  return (
    <div className="w-full">
      {/* ==========================
          TITLE
      ========================== */}

      <section className="mb-10">
        <h2 className="text-center text-2xl font-bold text-primary-900 dark:text-white md:text-4xl">
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
        </h2>

        <p className="mt-5 text-center text-[16px] font-light text-gray-700 dark:text-gray-100 md:text-[20px] lg:text-[24px]">
          ស្វែងរកមុខម្ហូប និងហាងអាហារដែលសមនឹងអ្នក តាមរយៈ
          <br />
          ប្រព័ន្ធណែនាំឆ្លាតវៃ ដែលគិតគូរពីចំណូលចិត្ត អាឡែស៊ី របបអាហារ ជំនឿសាសនា
          និងទីតាំងរបស់អ្នក
        </p>
      </section>

      {/* ==========================
          TABS
      ========================== */}

      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex gap-8 overflow-x-auto border-b border-gray-200">
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
                className={`relative cursor-pointer whitespace-nowrap pb-4 text-lg font-semibold transition-colors md:text-xl ${
                  isActive
                    ? "text-primary-700 dark:text-[#22a447]"
                    : "text-gray-400 hover:text-gray-600 dark:text-gray-200 dark:hover:text-gray-400"
                }`}
              >
                {tab.label}

                {isActive && (
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
            );
          })}
        </div>
      </div>

      {/* ==========================
          FOOD GRID
      ========================== */}

      <div className="container mx-auto max-w-7xl px-4">
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {/* Loading */}

          {isLoading && (
            <p className="col-span-full py-10 text-center text-gray-400">
              កំពុងផ្ទុក...
            </p>
          )}

          {/* Error */}

          {isError && (
            <div className="col-span-full flex flex-col items-center gap-3 py-10">
              <p className="text-center text-red-500">
                មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ
              </p>

              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-full bg-primary-800 px-4 py-2 text-sm font-medium text-white"
              >
                ព្យាយាមម្តងទៀត
              </button>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {!isLoading && !isError && filteredFoods.length === 0 && (
              <motion.p
                key="empty"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
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
                    y: 14,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: 10,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  className="w-full"
                >
                  <FoodCard food={food} />
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
