// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import { AnimatePresence, motion } from "framer-motion";

// import { TypingAnimation } from "@/components/ui/typing-animation";
// import FoodCard from "@/components/dynamic-card/FoodCard";

// import { useGetMenuItemsQuery } from "@/app/store/menuApi";

// import type { CatalogMenuItem } from "@/types/catalog-menu-item";

// type TabId = "all" | "BREAKFAST" | "LUNCH" | "DINNER";

// const tabs: {
//   id: TabId;
//   label: string;
// }[] = [
//   {
//     id: "all",
//     label: "ទាំងអស់",
//   },
//   {
//     id: "BREAKFAST",
//     label: "អាហារពេលព្រឹក",
//   },
//   {
//     id: "LUNCH",
//     label: "អាហារពេលថ្ងៃ",
//   },
//   {
//     id: "DINNER",
//     label: "អាហារពេលល្ងាច",
//   },
// ];

// type RecommendationFilters = {
//   query?: string;
//   dietaryTypes?: string[];
//   ageGroups?: string[];
//   cuisines?: string[];
// };

// type FilterByMealTimeProps = {
//   filters?: RecommendationFilters;
// };

// const EMPTY_FILTERS: RecommendationFilters = {
//   query: "",
//   dietaryTypes: [],
//   ageGroups: [],
//   cuisines: [],
// };

// function normalizeText(value: unknown): string {
//   return String(value ?? "")
//     .trim()
//     .toLowerCase()
//     .normalize("NFKC");
// }

// function getMealTimeByHour(hour: number): TabId {
//   if (hour >= 5 && hour < 11) {
//     return "BREAKFAST";
//   }

//   if (hour >= 11 && hour < 17) {
//     return "LUNCH";
//   }

//   return "DINNER";
// }

// /**
//  * Safely get meal types from new API.
//  */
// function getMealTypes(menuItem: CatalogMenuItem) {
//   return Array.isArray(menuItem.filterData?.mealTypes)
//     ? menuItem.filterData.mealTypes
//     : [];
// }

// /**
//  * Safely get age groups from new API.
//  */
// function getAgeGroups(menuItem: CatalogMenuItem) {
//   return Array.isArray(menuItem.filterData?.ageGroups)
//     ? menuItem.filterData.ageGroups
//     : [];
// }

// /**
//  * dietaryTypes is currently unknown[] in
//  * CatalogMenuItem because your sample response
//  * had empty arrays.
//  *
//  * This helper safely reads code/name if the
//  * backend later returns objects.
//  */
// function getDietaryValues(menuItem: CatalogMenuItem): string[] {
//   if (!Array.isArray(menuItem.dietaryTypes)) {
//     return [];
//   }

//   return menuItem.dietaryTypes.flatMap((item) => {
//     if (typeof item !== "object" || item === null) {
//       return [];
//     }

//     const value = item as Record<string, unknown>;

//     const result: string[] = [];

//     if (typeof value.code === "string") {
//       result.push(value.code);
//     }

//     if (typeof value.name === "string") {
//       result.push(value.name);
//     }

//     return result;
//   });
// }

// function matchesQuery(menuItem: CatalogMenuItem, query?: string): boolean {
//   const normalizedQuery = normalizeText(query);

//   if (!normalizedQuery) {
//     return true;
//   }

//   const mealTypes = getMealTypes(menuItem);

//   const ageGroups = getAgeGroups(menuItem);

//   const dietaryValues = getDietaryValues(menuItem);

//   const searchableValues = [
//     menuItem.name,
//     menuItem.localName,
//     menuItem.foodName,
//     menuItem.description,

//     menuItem.store?.name,

//     menuItem.filterData?.category?.name,
//     menuItem.filterData?.category?.code,

//     menuItem.filterData?.cuisine?.name,
//     menuItem.filterData?.cuisine?.code,

//     ...mealTypes.flatMap((mealType) => [mealType.code, mealType.name]),

//     ...ageGroups.flatMap((ageGroup) => [ageGroup.code, ageGroup.name]),

//     ...dietaryValues,
//   ];

//   return searchableValues.some((value) =>
//     normalizeText(value).includes(normalizedQuery),
//   );
// }

// function matchesMealTime(menuItem: CatalogMenuItem, activeTab: TabId): boolean {
//   if (activeTab === "all") {
//     return true;
//   }

//   const mealTypes = getMealTypes(menuItem);

//   return mealTypes.some(
//     (mealType) =>
//       String(mealType.code ?? "")
//         .trim()
//         .toUpperCase() === activeTab,
//   );
// }

// function matchesDietaryTypes(
//   menuItem: CatalogMenuItem,
//   selected?: string[],
// ): boolean {
//   if (!selected?.length) {
//     return true;
//   }

//   const itemDietaryValues = getDietaryValues(menuItem).map(normalizeText);

//   /**
//    * If backend currently returns:
//    *
//    * dietaryTypes: []
//    *
//    * then selecting a dietary filter
//    * correctly hides this item.
//    */
//   return selected.some((selectedValue) =>
//     itemDietaryValues.includes(normalizeText(selectedValue)),
//   );
// }

// function matchesAgeGroups(
//   menuItem: CatalogMenuItem,
//   selected?: string[],
// ): boolean {
//   if (!selected?.length) {
//     return true;
//   }

//   const ageGroups = getAgeGroups(menuItem);

//   const values = ageGroups.flatMap((ageGroup) => [
//     normalizeText(ageGroup.code),
//     normalizeText(ageGroup.name),
//   ]);

//   return selected.some((selectedValue) =>
//     values.includes(normalizeText(selectedValue)),
//   );
// }

// function matchesCuisines(
//   menuItem: CatalogMenuItem,
//   selected?: string[],
// ): boolean {
//   if (!selected?.length) {
//     return true;
//   }

//   const cuisine = menuItem.filterData?.cuisine;

//   if (!cuisine) {
//     return false;
//   }

//   const cuisineValues = [
//     normalizeText(cuisine.code),
//     normalizeText(cuisine.name),
//   ];

//   return selected.some((selectedValue) =>
//     cuisineValues.includes(normalizeText(selectedValue)),
//   );
// }

// export default function FilterByMealTime({
//   filters = EMPTY_FILTERS,
// }: FilterByMealTimeProps) {
//   const [activeTab, setActiveTab] = useState<TabId>("all");

//   const isManualOverride = useRef(false);

//   const {
//     data: menuItems = [],
//     isLoading,
//     isError,
//     refetch,
//   } = useGetMenuItemsQuery();
//   console.log("data from manuitem filter", menuItems);
//   useEffect(() => {
//     const applyTimeBasedTab = () => {
//       if (isManualOverride.current) {
//         return;
//       }

//       const currentHour = new Date().getHours();

//       const nextTab = getMealTimeByHour(currentHour);

//       setActiveTab((currentTab) =>
//         currentTab === nextTab ? currentTab : nextTab,
//       );
//     };

//     applyTimeBasedTab();

//     const intervalId = window.setInterval(applyTimeBasedTab, 60_000);

//     const handleVisibilityChange = () => {
//       if (document.visibilityState === "visible") {
//         applyTimeBasedTab();
//       }
//     };

//     document.addEventListener("visibilitychange", handleVisibilityChange);

//     window.addEventListener("focus", applyTimeBasedTab);

//     return () => {
//       window.clearInterval(intervalId);

//       document.removeEventListener("visibilitychange", handleVisibilityChange);

//       window.removeEventListener("focus", applyTimeBasedTab);
//     };
//   }, []);

//   const filteredFoods = useMemo(() => {
//     return menuItems
//       .filter((menuItem) => menuItem.availabilityStatus === "AVAILABLE")

//       .filter((menuItem) => matchesMealTime(menuItem, activeTab))

//       .filter((menuItem) => matchesQuery(menuItem, filters.query))

//       .filter((menuItem) => matchesDietaryTypes(menuItem, filters.dietaryTypes))

//       .filter((menuItem) => matchesAgeGroups(menuItem, filters.ageGroups))

//       .filter((menuItem) => matchesCuisines(menuItem, filters.cuisines));
//   }, [menuItems, activeTab, filters]);

//   return (
//     <div className="w-full">
//       {/* ==========================
//           TITLE
//       ========================== */}

//       <section className="mb-10">
//         <h2 className="text-center text-2xl font-bold text-primary-900 dark:text-white md:text-4xl">
//           បទពិសោធន៍ថ្មីក្នុង
//           <TypingAnimation
//             words={["ការស្វែងរកអាហារ", "ការស្វែងរកអាហារ"]}
//             blinkCursor
//             pauseDelay={2000}
//             loop
//             className="text-secondary-500 dark:text-orange-400"
//           >
//             ការស្វែងរកអាហារ
//           </TypingAnimation>
//         </h2>

//         <p className="mt-5 text-center text-[16px] font-light text-gray-700 dark:text-gray-100 md:text-[20px] lg:text-[24px]">
//           ស្វែងរកមុខម្ហូប និងហាងអាហារដែលសមនឹងអ្នក តាមរយៈ
//           <br />
//           ប្រព័ន្ធណែនាំឆ្លាតវៃ ដែលគិតគូរពីចំណូលចិត្ត អាឡែស៊ី របបអាហារ ជំនឿសាសនា
//           និងទីតាំងរបស់អ្នក
//         </p>
//       </section>

//       {/* ==========================
//           TABS
//       ========================== */}

//       <div className="container mx-auto max-w-7xl px-4">
//         <div className="flex gap-8 overflow-x-auto border-b border-gray-200">
//           {tabs.map((tab) => {
//             const isActive = activeTab === tab.id;

//             return (
//               <button
//                 key={tab.id}
//                 type="button"
//                 onClick={() => {
//                   isManualOverride.current = true;

//                   setActiveTab(tab.id);
//                 }}
//                 className={`relative cursor-pointer whitespace-nowrap pb-4 text-lg font-semibold transition-colors md:text-xl ${
//                   isActive
//                     ? "text-primary-700 dark:text-[#22a447]"
//                     : "text-gray-400 hover:text-gray-600 dark:text-gray-200 dark:hover:text-gray-400"
//                 }`}
//               >
//                 {tab.label}

//                 {isActive && (
//                   <motion.div
//                     layoutId="active-meal-tab-underline"
//                     className="absolute -bottom-px left-0 right-0 h-[3px] rounded-full bg-primary-700"
//                     transition={{
//                       type: "spring",
//                       stiffness: 500,
//                       damping: 40,
//                     }}
//                   />
//                 )}
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* ==========================
//           FOOD GRID
//       ========================== */}

//       <div className="container mx-auto max-w-7xl px-4">
//         <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//           {/* Loading */}

//           {isLoading && (
//             <p className="col-span-full py-10 text-center text-gray-400">
//               កំពុងផ្ទុក...
//             </p>
//           )}

//           {/* Error */}

//           {isError && (
//             <div className="col-span-full flex flex-col items-center gap-3 py-10">
//               <p className="text-center text-red-500">
//                 មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ
//               </p>

//               <button
//                 type="button"
//                 onClick={() => refetch()}
//                 className="rounded-full bg-primary-800 px-4 py-2 text-sm font-medium text-white"
//               >
//                 ព្យាយាមម្តងទៀត
//               </button>
//             </div>
//           )}

//           <AnimatePresence mode="popLayout">
//             {!isLoading && !isError && filteredFoods.length === 0 && (
//               <motion.p
//                 key="empty"
//                 initial={{
//                   opacity: 0,
//                 }}
//                 animate={{
//                   opacity: 1,
//                 }}
//                 exit={{
//                   opacity: 0,
//                 }}
//                 className="col-span-full py-10 text-center text-gray-400"
//               >
//                 រកមិនឃើញលទ្ធផលដែលត្រូវនឹងតម្រង
//               </motion.p>
//             )}

//             {!isLoading &&
//               !isError &&
//               filteredFoods.map((food) => (
//                 <motion.div
//                   layout
//                   key={food.uuid}
//                   initial={{
//                     opacity: 0,
//                     y: 14,
//                   }}
//                   animate={{
//                     opacity: 1,
//                     y: 0,
//                   }}
//                   exit={{
//                     opacity: 0,
//                     y: 10,
//                   }}
//                   transition={{
//                     duration: 0.25,
//                   }}
//                   className="w-full"
//                 >
//                   <FoodCard food={food} />
//                 </motion.div>
//               ))}
//           </AnimatePresence>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

import { TypingAnimation } from "@/components/ui/typing-animation";
import FoodCard from "@/components/dynamic-card/FoodCard";

import { useGetMenuItemsQuery } from "@/app/store/menuApi";

import type { CatalogMenuItem } from "@/types/catalog-menu-item";

const ITEMS_PER_PAGE = 10;

/* =========================================================
   TYPES
========================================================= */

type TabId = "all" | "MORNING" | "LUNCH" | "DINNER";

type RecommendationFilters = {
  query?: string;
  dietaryTypes?: string[];
  ageGroups?: string[];
  cuisines?: string[];
};

type FilterByMealTimeProps = {
  filters?: RecommendationFilters;
};

/* =========================================================
   TABS
========================================================= */

const tabs: {
  id: TabId;
  label: string;
}[] = [
  {
    id: "all",
    label: "ទាំងអស់",
  },
  {
    id: "MORNING",
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

/* =========================================================
   EMPTY FILTER
========================================================= */

const EMPTY_FILTERS: RecommendationFilters = {
  query: "",
  dietaryTypes: [],
  ageGroups: [],
  cuisines: [],
};

/* =========================================================
   TEXT NORMALIZER
========================================================= */

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKC");
}

/* =========================================================
   CURRENT MEAL TIME
========================================================= */

function getMealTimeByHour(hour: number): TabId {
  // 5:00 AM - 10:59 AM
  if (hour >= 5 && hour < 11) {
    return "MORNING";
  }

  // 11:00 AM - 4:59 PM
  if (hour >= 11 && hour < 17) {
    return "LUNCH";
  }

  // 5:00 PM - 4:59 AM
  return "DINNER";
}

/* =========================================================
   SAFE DATA HELPERS
========================================================= */

function getMealTypes(menuItem: CatalogMenuItem) {
  if (!Array.isArray(menuItem.food?.mealTypes)) {
    return [];
  }

  return menuItem.food.mealTypes;
}

function getAgeGroups(menuItem: CatalogMenuItem) {
  if (!Array.isArray(menuItem.food?.ageGroups)) {
    return [];
  }

  return menuItem.food.ageGroups;
}

function getDietaryValues(menuItem: CatalogMenuItem): string[] {
  if (!Array.isArray(menuItem.food?.dietaryTypes)) {
    return [];
  }

  return menuItem.food.dietaryTypes.flatMap((dietaryType) => [
    dietaryType.code,
    dietaryType.name,
  ]);
}

/* =========================================================
   SEARCH
========================================================= */

function matchesQuery(menuItem: CatalogMenuItem, query?: string): boolean {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return true;
  }

  const mealTypes = getMealTypes(menuItem);
  const ageGroups = getAgeGroups(menuItem);
  const dietaryValues = getDietaryValues(menuItem);

  const ingredients = Array.isArray(menuItem.ingredients)
    ? menuItem.ingredients
    : [];

  const searchableValues = [
    menuItem.name,
    menuItem.localName,
    menuItem.description,
    menuItem.localDescription,

    menuItem.store?.name,
    menuItem.store?.localName,

    menuItem.food?.canonicalName,

    menuItem.food?.category?.name,
    menuItem.food?.category?.code,

    menuItem.food?.cuisine?.name,
    menuItem.food?.cuisine?.code,

    ...mealTypes.flatMap((mealType) => [mealType.code, mealType.name]),

    ...ageGroups.flatMap((ageGroup) => [ageGroup.code, ageGroup.name]),

    ...dietaryValues,

    ...ingredients,
  ];

  return searchableValues.some((value) =>
    normalizeText(value).includes(normalizedQuery),
  );
}

/* =========================================================
   MEAL TIME FILTER
========================================================= */

function matchesMealTime(menuItem: CatalogMenuItem, activeTab: TabId): boolean {
  if (activeTab === "all") {
    return true;
  }

  const mealTypes = getMealTypes(menuItem);

  return mealTypes.some((mealType) => {
    const mealCode = String(mealType.code ?? "")
      .trim()
      .toUpperCase();

    return mealCode === activeTab;
  });
}

/* =========================================================
   DIETARY FILTER
========================================================= */

function matchesDietaryTypes(
  menuItem: CatalogMenuItem,
  selected?: string[],
): boolean {
  if (!selected?.length) {
    return true;
  }

  const itemDietaryValues = getDietaryValues(menuItem).map(normalizeText);

  return selected.some((selectedValue) =>
    itemDietaryValues.includes(normalizeText(selectedValue)),
  );
}

/* =========================================================
   AGE GROUP FILTER
========================================================= */

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

/* =========================================================
   CUISINE FILTER
========================================================= */

function matchesCuisines(
  menuItem: CatalogMenuItem,
  selected?: string[],
): boolean {
  if (!selected?.length) {
    return true;
  }

  const cuisine = menuItem.food?.cuisine;

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

/* =========================================================
   COMPONENT
========================================================= */

export default function FilterByMealTime({
  filters = EMPTY_FILTERS,
}: FilterByMealTimeProps) {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const isManualOverride = useRef(false);

  /* =========================================================
     FETCH MENU ITEMS
  ========================================================= */

  const {
    data: menuItems = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetMenuItemsQuery();

  /* =========================================================
     DEBUG
  ========================================================= */

  useEffect(() => {
    if (!isLoading) {
      console.log("Menu items from API:", menuItems);
    }
  }, [menuItems, isLoading]);

  /* =========================================================
     AUTOMATIC MEAL TIME
  ========================================================= */

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

    // Run immediately
    applyTimeBasedTab();

    // Recheck every minute
    const intervalId = window.setInterval(applyTimeBasedTab, 60_000);

    // Recheck when browser becomes visible
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

  /* =========================================================
     FILTER MENU ITEMS
  ========================================================= */

  const filteredFoods = useMemo(() => {
    return menuItems
      .filter((menuItem) => menuItem.availabilityStatus === "AVAILABLE")

      .filter((menuItem) => matchesMealTime(menuItem, activeTab))

      .filter((menuItem) => matchesQuery(menuItem, filters.query))

      .filter((menuItem) => matchesDietaryTypes(menuItem, filters.dietaryTypes))

      .filter((menuItem) => matchesAgeGroups(menuItem, filters.ageGroups))

      .filter((menuItem) => matchesCuisines(menuItem, filters.cuisines));
  }, [
    menuItems,
    activeTab,
    filters.query,
    filters.dietaryTypes,
    filters.ageGroups,
    filters.cuisines,
  ]);

  const [currentPage, setCurrentPage] = useState(1);

  /* Reset to first page whenever tab or filters change */
  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeTab,
    filters.query,
    filters.dietaryTypes,
    filters.ageGroups,
    filters.cuisines,
  ]);

  const totalPages = Math.ceil(filteredFoods.length / ITEMS_PER_PAGE) || 1;

  const paginatedFoods = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFoods.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredFoods, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
  };

  /* Helper to generate visible page numbers */
  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  }, [currentPage, totalPages]);

  /* =========================================================
     DEBUG FILTER
  ========================================================= */

  useEffect(() => {
    console.log("Active meal tab:", activeTab);

    console.log("Filtered foods:", filteredFoods);

    console.log(
      "Meal types:",
      menuItems.map((item) => ({
        name: item.name,
        mealTypes: item.food?.mealTypes ?? [],
      })),
    );
  }, [activeTab, filteredFoods, menuItems]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="w-full">
      {/* =====================================================
          TITLE
      ===================================================== */}

      <section className="mb-10">
        <h2 className="text-center text-2xl font-bold text-primary-900 dark:text-white md:text-4xl">
          បទពិសោធន៍ថ្មីក្នុង{" "}
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

      {/* =====================================================
          TABS
      ===================================================== */}

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

      {/* =====================================================
          FOOD GRID
      ===================================================== */}

      <div className="container mx-auto max-w-7xl px-4">
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {/* Loading */}

          {(isLoading || isFetching) && menuItems.length === 0 && (
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

          {/* Result */}

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
              paginatedFoods.map((food) => (
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

        {/* =====================================================
            PAGINATION CONTROLS (10 items / page)
        ===================================================== */}
        {!isLoading && !isError && filteredFoods.length > 0 && (
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row dark:border-gray-800">
            {/* Counter text */}
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              បង្ហាញ{" "}
              <span className="font-semibold text-primary-800 dark:text-primary-400">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              -{" "}
              <span className="font-semibold text-primary-800 dark:text-primary-400">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredFoods.length)}
              </span>{" "}
              នៃ{" "}
              <span className="font-semibold text-primary-800 dark:text-primary-400">
                {filteredFoods.length}
              </span>{" "}
              មុខម្ហូប
            </p>

            {/* Page buttons */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Prev button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  aria-label="ទំព័រមុន"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <IoChevronBack className="h-4 w-4" />
                </button>

                {/* Page numbers */}
                {pageNumbers.map((page, idx) => {
                  if (typeof page === "string") {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className="flex h-10 w-8 items-center justify-center text-sm font-bold text-gray-400"
                      >
                        ...
                      </span>
                    );
                  }

                  const isActive = page === currentPage;

                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => handlePageChange(page)}
                      className={`flex h-10 min-w-[40px] items-center justify-center rounded-full px-3 text-sm font-semibold transition ${
                        isActive
                          ? "bg-primary-800 text-white shadow-sm hover:bg-primary-700 dark:bg-primary-600"
                          : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                {/* Next button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  aria-label="ទំព័របន្ទាប់"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <IoChevronForward className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
