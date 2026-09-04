"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoRestaurantOutline,
  IoWineOutline,
} from "react-icons/io5";

import { TypingAnimation } from "@/components/ui/typing-animation";
import FoodCard from "@/components/dynamic-card/FoodCard";

import { useGetMenuItemsQuery, useGetMealTypesQuery } from "@/app/store/menuApi";
import { useGetMemberProfilesQuery } from "@/app/store/memberProfileApi";
import { useCreateRecommendationSessionMutation } from "@/app/store/recommendationApi";
import { useEnrichedRecommendationItems } from "@/hooks/useEnrichedRecommendationItems";

import type { CatalogMenuItem } from "@/types/catalog-menu-item";

const ITEMS_PER_PAGE = 8;

// Fetch just enough for 2 pages up front. The session paginates client-side,
// so 16 items = instant first render. Previously 100 caused 100 parallel
// getMenuItemByUuid calls before anything appeared.
const RECOMMENDATION_LIMIT = 16;

/* =========================================================
   TYPES
========================================================= */

type TabId = "all" | "MORNING" | "LUNCH" | "DINNER";
type RootCategoryFilter = "ALL" | "FOOD" | "DRINK";

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
    label: "ពេលព្រឹក",
  },
  {
    id: "LUNCH",
    label: "ពេលថ្ងៃ",
  },
  {
    id: "DINNER",
    label: "ពេលល្ងាច",
  },
];

const rootCategoryTabs: {
  id: RootCategoryFilter;
  label: string;
  icon: typeof IoRestaurantOutline;
}[] = [
  {
    id: "ALL",
    label: "ទាំងអស់",
    icon: IoRestaurantOutline,
  },
  {
    id: "FOOD",
    label: "អាហារ",
    icon: IoRestaurantOutline,
  },
  {
    id: "DRINK",
    label: "ភេសជ្ជៈ",
    icon: IoWineOutline,
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

  // No meal-time tag at all means "available anytime," not "excluded from
  // every tab" — most of the live catalog isn't tagged yet (measured ~40%
  // untagged), and treating a missing tag as exclusion made every specific
  // tab look almost empty. An item WITH tags must still match the active one.
  if (mealTypes.length === 0) {
    return true;
  }

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
  const [rootCategoryFilter, setRootCategoryFilter] =
    useState<RootCategoryFilter>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const sectionRef = useRef<HTMLDivElement>(null);

  const isManualOverride = useRef(false);

  /* =========================================================
     PERSONALIZATION: this session's own default profile only —
     never a "first active profile" fallback, and never another
     profile the user owns.
  ========================================================= */

  const { data: profilesData } = useGetMemberProfilesQuery();

  const defaultProfile = useMemo(() => {
    const list = Array.isArray(profilesData)
      ? profilesData
      : profilesData?.contents ?? [];
    return (
      list.find(
        (profile) => profile.isDefault && profile.isActive !== false,
      ) ?? null
    );
  }, [profilesData]);

  const isPersonalized = Boolean(defaultProfile);

  /* =========================================================
     REAL MEAL-TYPE IDS (tabs are hardcoded labels; the session
     request needs the backend's actual numeric ids)
  ========================================================= */

  const { data: mealTypes } = useGetMealTypesQuery();

  const activeMealTypeId = useMemo(() => {
    if (activeTab === "all") {
      return undefined;
    }
    return mealTypes?.find(
      (mealType) => mealType.code.trim().toUpperCase() === activeTab,
    )?.id;
  }, [mealTypes, activeTab]);

  const rootCategoryCode =
    rootCategoryFilter === "ALL" ? undefined : rootCategoryFilter;

  /* =========================================================
     PERSONALIZED SOURCE: a real, safety-checked recommendation
     session for the default profile, re-created whenever the meal
     tab or the food/drink filter changes.
  ========================================================= */

  const [createSession, { data: session, isLoading: isSessionLoading }] =
    useCreateRecommendationSessionMutation();

  useEffect(() => {
    if (!isPersonalized || !defaultProfile) {
      return;
    }

    void createSession({
      mode: "SINGLE",
      requestSource: "HOMEPAGE_AUTO",
      requestedLimit: RECOMMENDATION_LIMIT,
      mealTypeId: activeMealTypeId,
      rootCategoryCode,
      profiles: [
        {
          profileId: defaultProfile.uuid,
          isPrimary: true,
        },
      ],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPersonalized, defaultProfile?.uuid, activeMealTypeId, rootCategoryCode]);

  const sessionItems = useMemo(() => session?.items ?? [], [session]);

  const { enrichedItems: recommendedFoods, isEnriching } =
    useEnrichedRecommendationItems(session, sessionItems);

  /* =========================================================
     FALLBACK SOURCE: today's public catalog browse, used when
     there's no verified default profile to personalize for —
     never claims these items are personally safe.
  ========================================================= */

  const {
    data: catalogMenuItems = [],
    isLoading: isCatalogLoading,
    isFetching: isCatalogFetching,
    isError: isCatalogError,
    refetch,
  } = useGetMenuItemsQuery({ rootCategoryCode });

  /* =========================================================
     RESET PAGE ON FILTER CHANGE
  ========================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filters, rootCategoryFilter]);

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
     The meal-time tab is enforced here client-side even for the
     personalized source: the session's mealTypeId is only a
     ranking boost on the backend, not a hard filter, so without
     this the "Breakfast" tab could still show non-breakfast items.
  ========================================================= */

  const sourceItems = useMemo(() => {
    if (!isPersonalized) {
      return catalogMenuItems;
    }
    // When personalized, prefer recommendedFoods once loaded;
    // fall back to catalog items if recommendation has no items or is pending
    if (recommendedFoods.length > 0) {
      return recommendedFoods;
    }
    return catalogMenuItems;
  }, [isPersonalized, recommendedFoods, catalogMenuItems]);

  const filteredFoods = useMemo(() => {
    const seenUuids = new Set<string>();
    return sourceItems
      .filter((menuItem) => {
        if (!menuItem.uuid) return false;
        if (seenUuids.has(menuItem.uuid)) return false;
        seenUuids.add(menuItem.uuid);
        return true;
      })
      .filter(
        (menuItem) =>
          !menuItem.availabilityStatus ||
          menuItem.availabilityStatus === "AVAILABLE",
      )
      .filter((menuItem) => matchesMealTime(menuItem, activeTab))
      .filter((menuItem) => matchesQuery(menuItem, filters.query))
      .filter((menuItem) => matchesDietaryTypes(menuItem, filters.dietaryTypes))
      .filter((menuItem) => matchesAgeGroups(menuItem, filters.ageGroups))
      .filter((menuItem) => matchesCuisines(menuItem, filters.cuisines));
  }, [
    sourceItems,
    activeTab,
    filters.query,
    filters.dietaryTypes,
    filters.ageGroups,
    filters.cuisines,
  ]);

  // Show skeleton only while data is truly empty and loading
  const isLoading = isPersonalized
    ? isSessionLoading && recommendedFoods.length === 0 && catalogMenuItems.length === 0
    : isCatalogLoading;
  const isFetching = isPersonalized
    ? isSessionLoading
    : isCatalogFetching;
  const isError = isPersonalized ? false : isCatalogError;

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.max(1, Math.ceil(filteredFoods.length / ITEMS_PER_PAGE));

  const paginatedFoods = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFoods.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredFoods, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    if (sectionRef.current) {
      const top = sectionRef.current.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const visiblePages = useMemo(() => {
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
     RENDER
  ========================================================= */

  return (
    <div ref={sectionRef} className="w-full">
      {/* =====================================================
          TITLE
      ===================================================== */}

      <section className="mb-10">
        <p
          className=" text-center
        font-semibold
        text-primary-800

        lg:text-6xl  py-2
        md:text-5xl
        max-md:text-3xl leading-2 dark:text-primary-dark"
        >
          ណែនាំចំណីអាហារ<br className="sm:hidden max-sm:block" />
          <TypingAnimation
            words={["សម្រាប់អ្នក", "តាមពេលវេលា"]}
            blinkCursor
            pauseDelay={2000}
            loop
            className="text-secondary-500 dark:text-orange-400"
          >
            ការស្វែងរកអាហារ
          </TypingAnimation>
        </p>

        <p className="mt-5 max-sm:px-2 text-center text-[16px] font-light text-gray-700 dark:text-gray-100 md:text-[20px] lg:text-[24px]">
          ស្វែងរកមុខម្ហូប និងហាងអាហារដែលសមនឹងអ្នក តាមរយៈ
          <br />
          ប្រព័ន្ធណែនាំឆ្លាតវៃ ដែលគិតគូរពីចំណូលចិត្ត អាឡែស៊ី របបអាហារ ជំនឿសាសនា
          និងទីតាំងរបស់អ្នក
        </p>

        {isPersonalized && (
          <p className="mt-3 text-center text-[15px] font-medium text-primary-700 dark:text-emerald-400">
            ✓ ណែនាំសម្រាប់ប្រវត្តិរូបលំនាំដើមរបស់អ្នក ដោយឆ្លងកាត់ការត្រួតពិនិត្យសុវត្ថិភាព
          </p>
        )}
      </section>

      {/* =====================================================
          TABS
      ===================================================== */}

      <div className="sticky top-16 md:top-0 lg:top-16 z-30 w-full bg-white/90 backdrop-blur-md dark:bg-gray-950/90 pt-3 pb-1 transition-all duration-300">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:border-b sm:border-gray-200 sm:dark:border-slate-800">
          <div className="scrollbar-hide flex w-full sm:w-auto gap-5 sm:gap-8 overflow-x-auto border-b border-gray-200 dark:border-slate-800 sm:border-none">
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
                  className={`relative cursor-pointer whitespace-nowrap pb-3 sm:pb-4 text-[17px] font-semibold transition-colors md:text-xl ${
                    isActive
                      ? "text-primary-700 dark:text-emerald-400"
                      : "text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  {tab.label}

                  {isActive && (
                    <motion.div
                      layoutId="active-meal-tab-underline"
                      className="absolute -bottom-px left-0 right-0 h-[3px] rounded-full bg-primary-700 dark:bg-emerald-500"
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

          {/* Food / Drink switch — recommendation and catalog both mix
              food and drink items, so this is a real hard filter, not a
              cosmetic one. */}
          <div className="mt-3 sm:mt-0 mb-1 sm:mb-2 flex shrink-0 self-start sm:self-auto gap-1 rounded-full bg-gray-100 p-1 dark:bg-slate-800">
            {rootCategoryTabs.map((tab) => {
              const isActive = rootCategoryFilter === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRootCategoryFilter(tab.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-white text-primary-800 shadow-sm dark:bg-slate-900 dark:text-emerald-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className="text-base" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>

      {/* =====================================================
          FOOD GRID
      ===================================================== */}

      <div className="container mx-auto max-w-7xl sm:pb-6 sm:px-4 px-3.5">
        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {/* Loading */}

          {/* Skeleton: only while AI session call in flight and no items yet */}
          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`skeleton-fbm-${i}`}
                className="flex flex-col w-full gap-4 bg-white border border-gray-100 shadow-sm rounded-[24px] p-2.5 animate-pulse"
              >
                <div className="rounded-[14px] w-full h-[150px] md:h-37.5 lg:h-46.25 bg-gray-200 dark:bg-gray-700" />
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="flex gap-4">
                    <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  </div>
                </div>
              </div>
            ))}

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
            {!isLoading && !isEnriching && !isError && filteredFoods.length === 0 && (
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
                className="col-span-full py-10 text-center text-gray-400 dark:text-slate-500"
              >
                រកមិនឃើញលទ្ធផលដែលត្រូវនឹងតម្រង
              </motion.p>
            )}

            {!isLoading &&
              !isError &&
              paginatedFoods.map((food, index) => (
                <motion.div
                  layout
                  key={`${food.uuid}-${food.legacyId ?? index}`}
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
                  className="w-full self-center"
                >
                  <FoodCard food={food} />
                </motion.div>
              ))}
          </AnimatePresence>
        </div>

        {/* =====================================================
            PAGINATION CONTROLS
        ===================================================== */}

        {!isLoading && !isError && totalPages > 1 && (
          <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row border-t border-gray-100 dark:border-slate-800 pt-6">
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
              បង្ហាញ <span className="font-semibold text-primary-800 dark:text-emerald-400">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-semibold text-primary-800 dark:text-emerald-400">{Math.min(currentPage * ITEMS_PER_PAGE, filteredFoods.length)}</span> នៃ <span className="font-semibold text-primary-800 dark:text-emerald-400">{filteredFoods.length}</span> មុខម្ហូប
            </p>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 hover:border-primary-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-label="Previous page"
              >
                <IoChevronBackOutline className="text-[18px]" />
              </button>

              {visiblePages.map((page, idx) => {
                if (page === "...") {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="flex h-10 w-8 items-center justify-center text-sm font-semibold text-gray-400 dark:text-slate-500"
                    >
                      ...
                    </span>
                  );
                }

                const pageNum = Number(page);
                const isSelected = pageNum === currentPage;

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-sm font-bold transition ${
                      isSelected
                        ? "bg-primary-800 text-white shadow-sm dark:bg-emerald-600"
                        : "border border-gray-200 bg-white text-gray-700 hover:border-primary-700 hover:bg-primary-50/50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 hover:border-primary-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-label="Next page"
              >
                <IoChevronForwardOutline className="text-[18px]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
