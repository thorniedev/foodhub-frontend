"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import { AnimatePresence, motion } from "framer-motion";

import {
  IoChevronBack,
  IoChevronDown,
  IoNutritionOutline,
  IoPricetagOutline,
  IoRefresh,
  IoSearchOutline,
  IoSwapVerticalOutline,
  IoTimeOutline,
} from "react-icons/io5";

import { FaFire, FaStar } from "react-icons/fa";
import { MdOutlineCategory } from "react-icons/md";

import FoodCard from "@/components/dynamic-card/FoodCard";
import FoodNavTabs, {
  type FoodPageTab,
} from "@/components/food-page/FoodNavTabs";

import LocationContent from "@/components/food-page/location/LocationContent";
import StoreContent from "@/components/food-page/store/StoreContent";

import { useGetMenuItemsQuery } from "@/app/store/menuApi";
import {
  useGetMemberProfileByIdQuery,
  useGetMemberProfilesQuery,
} from "@/app/store/memberProfileApi";
import {
  getProfileFoodScore,
  sortFoodsForProfile,
} from "@/lib/recommendation/profileFoodPreferences";

import type {
  CatalogCodeName,
  CatalogMenuItem,
} from "@/types/catalog-menu-item";
import type { MemberProfile } from "@/types/member-profile/member-profile";

/* =========================================================
   TYPES
========================================================= */

type SortBy =
  | "featured"
  | "rating"
  | "fastest"
  | "name"
  | "price-low"
  | "price-high";

type PriceTier = "$" | "$$" | "$$$" | null;

type FilterState = {
  query: string;
  sortBy: SortBy;

  categoryCodes: string[];
  cuisineCodes: string[];
  mealTypeCodes: string[];
  dietaryTypeCodes: string[];
  ageGroupCodes: string[];

  excludedAllergenCodes: string[];
  storeIds: string[];
  ingredientNames: string[];
  spiceLevels: number[];

  availabilityOnly: boolean;
  featuredOnly: boolean;

  priceTier: PriceTier;

  maximumPreparationMinutes: number | null;
  minimumRating: number | null;
};

type FilterOption = {
  code: string;
  name: string;
  count: number;
};

type StoreFilterOption = FilterOption;

type NumericOption = {
  value: number;
  label: string;
};

/* =========================================================
   CONSTANTS
========================================================= */

const SPICE_OPTIONS: NumericOption[] = [
  {
    value: 0,
    label: "មិនហឹរ",
  },
  {
    value: 1,
    label: "ហឹរតិច",
  },
  {
    value: 2,
    label: "ហឹរមធ្យម",
  },
  {
    value: 3,
    label: "ហឹរខ្លាំង",
  },
];

const PREPARATION_OPTIONS: NumericOption[] = [
  {
    value: 10,
    label: "ក្រោម 10 នាទី",
  },
  {
    value: 15,
    label: "ក្រោម 15 នាទី",
  },
  {
    value: 20,
    label: "ក្រោម 20 នាទី",
  },
];

const RATING_OPTIONS: NumericOption[] = [
  {
    value: 3,
    label: "3.0 ឡើងទៅ",
  },
  {
    value: 4,
    label: "4.0 ឡើងទៅ",
  },
  {
    value: 4.5,
    label: "4.5 ឡើងទៅ",
  },
];

const DEFAULT_FILTERS: FilterState = {
  query: "",
  sortBy: "featured",

  categoryCodes: [],
  cuisineCodes: [],
  mealTypeCodes: [],
  dietaryTypeCodes: [],
  ageGroupCodes: [],

  excludedAllergenCodes: [],
  storeIds: [],
  ingredientNames: [],
  spiceLevels: [],

  availabilityOnly: true,
  featuredOnly: false,

  priceTier: null,

  maximumPreparationMinutes: null,
  minimumRating: null,
};

/* =========================================================
   NEW CATALOG DATA HELPERS
========================================================= */

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKC");
}

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function matchesPriceTier(price: number, tier: PriceTier): boolean {
  if (!tier) {
    return true;
  }

  if (tier === "$") {
    return price < 3;
  }

  if (tier === "$$") {
    return price >= 3 && price < 6;
  }

  return price >= 6;
}

function getMealTypes(food: CatalogMenuItem): CatalogCodeName[] {
  return Array.isArray(food.filterData?.mealTypes)
    ? food.filterData.mealTypes
    : [];
}

function getAgeGroups(food: CatalogMenuItem): CatalogCodeName[] {
  return Array.isArray(food.filterData?.ageGroups)
    ? food.filterData.ageGroups
    : [];
}

/**
 * Current list type intentionally has unknown[] for these arrays,
 * because the API sample did not prove their inner shape.
 *
 * We only use entries that really contain string code + name.
 */
function getCodeNameUnknownArray(
  values: unknown[] | null | undefined,
): CatalogCodeName[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.flatMap((value) => {
    if (typeof value !== "object" || value === null) {
      return [];
    }

    const record = value as Record<string, unknown>;

    if (typeof record.code === "string" && typeof record.name === "string") {
      return [
        {
          code: record.code,
          name: record.name,
        },
      ];
    }

    return [];
  });
}

function getDietaryTypes(food: CatalogMenuItem): CatalogCodeName[] {
  return getCodeNameUnknownArray(food.dietaryTypes);
}

function getAllergens(food: CatalogMenuItem): CatalogCodeName[] {
  return getCodeNameUnknownArray(food.allergenDeclarations);
}

function getIngredientNames(food: CatalogMenuItem): string[] {
  if (!Array.isArray(food.ingredients)) {
    return [];
  }

  return food.ingredients.flatMap((value) => {
    if (typeof value === "string") {
      return [value];
    }

    if (typeof value === "object" && value !== null) {
      const record = value as Record<string, unknown>;

      const candidate = record.name ?? record.ingredientName;

      if (typeof candidate === "string") {
        return [candidate];
      }
    }

    return [];
  });
}

/* =========================================================
   SEARCH
========================================================= */

function matchesSearch(food: CatalogMenuItem, query: string): boolean {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return true;
  }

  const mealTypes = getMealTypes(food);

  const ageGroups = getAgeGroups(food);

  const dietaryTypes = getDietaryTypes(food);

  const allergens = getAllergens(food);

  const ingredients = getIngredientNames(food);

  const searchableValues: unknown[] = [
    food.name,
    food.localName,
    food.foodName,
    food.description,
    food.source,

    food.price,
    food.currencyCode,

    food.preparationTimeMinutes,
    food.availabilityStatus,
    food.ingredientDataStatus,

    food.store?.name,
    food.store?.operatingStatus,
    food.store?.averageRating,

    food.filterData?.category?.code,
    food.filterData?.category?.name,

    food.filterData?.cuisine?.code,
    food.filterData?.cuisine?.name,

    food.filterData?.spiceLevel,

    ...mealTypes.flatMap((item) => [item.code, item.name]),

    ...ageGroups.flatMap((item) => [item.code, item.name]),

    ...dietaryTypes.flatMap((item) => [item.code, item.name]),

    ...allergens.flatMap((item) => [item.code, item.name]),

    ...ingredients,
  ];

  return searchableValues.some((value) =>
    normalizeText(value).includes(normalizedQuery),
  );
}

/* =========================================================
   FILTER OPTIONS
========================================================= */

function getUniqueOptions(
  values: {
    code: string;
    name: string;
  }[],
): FilterOption[] {
  const map = new Map<string, FilterOption>();

  values.forEach((value) => {
    if (!value.code) {
      return;
    }

    const existing = map.get(value.code);

    if (existing) {
      existing.count += 1;
      return;
    }

    map.set(value.code, {
      code: value.code,
      name: value.name || value.code,
      count: 1,
    });
  });

  return Array.from(map.values()).sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}

/* =========================================================
   FILTERING
========================================================= */

function applyFilters(
  foods: CatalogMenuItem[],
  filters: FilterState,
  profile?: MemberProfile | null,
): CatalogMenuItem[] {
  const filteredFoods = foods.filter((food) => {
    if (filters.availabilityOnly && food.availabilityStatus !== "AVAILABLE") {
      return false;
    }

    if (filters.featuredOnly && !food.isFeatured) {
      return false;
    }

    if (!matchesSearch(food, filters.query)) {
      return false;
    }

    const category = food.filterData?.category;

    if (
      filters.categoryCodes.length > 0 &&
      (!category || !filters.categoryCodes.includes(category.code))
    ) {
      return false;
    }

    const cuisine = food.filterData?.cuisine;

    if (
      filters.cuisineCodes.length > 0 &&
      (!cuisine || !filters.cuisineCodes.includes(cuisine.code))
    ) {
      return false;
    }

    const mealTypes = getMealTypes(food);

    if (
      filters.mealTypeCodes.length > 0 &&
      !mealTypes.some((item) => filters.mealTypeCodes.includes(item.code))
    ) {
      return false;
    }

    const dietaryTypes = getDietaryTypes(food);

    if (
      filters.dietaryTypeCodes.length > 0 &&
      !dietaryTypes.some((item) => filters.dietaryTypeCodes.includes(item.code))
    ) {
      return false;
    }

    const ageGroups = getAgeGroups(food);

    if (
      filters.ageGroupCodes.length > 0 &&
      !ageGroups.some((item) => filters.ageGroupCodes.includes(item.code))
    ) {
      return false;
    }

    const allergens = getAllergens(food);

    if (
      filters.excludedAllergenCodes.length > 0 &&
      allergens.some((item) =>
        filters.excludedAllergenCodes.includes(item.code),
      )
    ) {
      return false;
    }

    if (
      filters.storeIds.length > 0 &&
      !filters.storeIds.includes(food.store.uuid)
    ) {
      return false;
    }

    const ingredients = getIngredientNames(food);

    if (
      filters.ingredientNames.length > 0 &&
      !filters.ingredientNames.every((selectedIngredient) =>
        ingredients.some((ingredient) =>
          normalizeText(ingredient).includes(normalizeText(selectedIngredient)),
        ),
      )
    ) {
      return false;
    }

    if (
      filters.spiceLevels.length > 0 &&
      !filters.spiceLevels.includes(food.filterData?.spiceLevel ?? -1)
    ) {
      return false;
    }

    if (!matchesPriceTier(food.price, filters.priceTier)) {
      return false;
    }

    if (
      filters.maximumPreparationMinutes !== null &&
      (food.preparationTimeMinutes === null ||
        food.preparationTimeMinutes > filters.maximumPreparationMinutes)
    ) {
      return false;
    }

    if (
      filters.minimumRating !== null &&
      Number(food.store?.averageRating ?? 0) < filters.minimumRating
    ) {
      return false;
    }

    return true;
  });

  const profileSortedFoods = sortFoodsForProfile(filteredFoods, profile);

  return [...profileSortedFoods].sort((first, second) => {
    switch (filters.sortBy) {
      case "rating":
        return (
          Number(second.store?.averageRating ?? 0) -
          Number(first.store?.averageRating ?? 0)
        );

      case "fastest": {
        const firstTime =
          first.preparationTimeMinutes ?? Number.POSITIVE_INFINITY;

        const secondTime =
          second.preparationTimeMinutes ?? Number.POSITIVE_INFINITY;

        return firstTime - secondTime;
      }

      case "name":
        return normalizeText(first.localName || first.name).localeCompare(
          normalizeText(second.localName || second.name),
        );

      case "price-low":
        return first.price - second.price;

      case "price-high":
        return second.price - first.price;

      case "featured":
      default: {
        const profileScoreDifference =
          getProfileFoodScore(second, profile) -
          getProfileFoodScore(first, profile);

        if (profileScoreDifference !== 0) {
          return profileScoreDifference;
        }

        if (first.isFeatured !== second.isFeatured) {
          return first.isFeatured ? -1 : 1;
        }

        return (
          Number(second.store?.averageRating ?? 0) -
          Number(first.store?.averageRating ?? 0)
        );
      }
    }
  });
}

/* =========================================================
   FILTER COUNT
========================================================= */

function countActiveFilters(filters: FilterState): number {
  return (
    filters.categoryCodes.length +
    filters.cuisineCodes.length +
    filters.mealTypeCodes.length +
    filters.dietaryTypeCodes.length +
    filters.ageGroupCodes.length +
    filters.excludedAllergenCodes.length +
    filters.storeIds.length +
    filters.ingredientNames.length +
    filters.spiceLevels.length +
    (filters.priceTier ? 1 : 0) +
    (filters.maximumPreparationMinutes !== null ? 1 : 0) +
    (filters.minimumRating !== null ? 1 : 0) +
    (filters.featuredOnly ? 1 : 0)
  );
}

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

type FilterSectionProps = {
  title: string;
  icon: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
};

function FilterSection({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}: FilterSectionProps) {
  return (
    <div className="border-t border-gray-100 py-4 first:border-t-0 first:pt-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 text-[16px] font-semibold text-primary-900">
          <span className="text-[20px] text-primary-700">{icon}</span>

          {title}
        </span>

        <motion.span
          animate={{
            rotate: isOpen ? 180 : 0,
          }}
          transition={{
            duration: 0.2,
          }}
          className="text-gray-400"
        >
          <IoChevronDown className="text-[20px]" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.25,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type CheckboxOptionProps = {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
};

function CheckboxOption({
  label,
  count,
  checked,
  onChange,
}: CheckboxOptionProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-2 py-2 transition hover:bg-primary-50">
      <span className="flex min-w-0 items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 shrink-0 accent-primary-800"
        />

        <span className="truncate text-[16px] text-gray-600">{label}</span>
      </span>

      {typeof count === "number" && (
        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[16px] text-gray-500">
          {count}
        </span>
      )}
    </label>
  );
}

type SingleChoiceProps<T extends string | number> = {
  options: {
    value: T;
    label: string;
  }[];

  selected: T | null;

  onChange: (value: T | null) => void;
};

function SingleChoice<T extends string | number>({
  options,
  selected,
  onChange,
}: SingleChoiceProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected === option.value;

        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(isSelected ? null : option.value)}
            className={`rounded-full border px-3 py-2 text-[16px] transition ${
              isSelected
                ? "border-primary-800 bg-primary-800 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-primary-500 hover:bg-primary-50"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   FILTER SIDEBAR
========================================================= */

type FilterSidebarProps = {
  filters: FilterState;

  onChange: (filters: FilterState) => void;

  categoryOptions: FilterOption[];
  cuisineOptions: FilterOption[];
  mealTypeOptions: FilterOption[];
  dietaryTypeOptions: FilterOption[];
  ageGroupOptions: FilterOption[];

  allergenOptions: FilterOption[];
  storeOptions: StoreFilterOption[];
  ingredientOptions: FilterOption[];
};

function FilterSidebar({
  filters,
  onChange,
  categoryOptions,
  cuisineOptions,
  mealTypeOptions,
  dietaryTypeOptions,
  ageGroupOptions,
  allergenOptions,
  storeOptions,
  ingredientOptions,
}: FilterSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const [categoryQuery, setCategoryQuery] = useState("");

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sort: true,
    category: true,
    cuisine: false,
    mealType: true,
    dietaryType: false,
    ageGroup: false,

    allergens: false,
    spice: false,
    preparation: false,
    rating: false,
    stores: false,
    ingredients: false,

    price: true,
    availability: true,
  });

  const activeFilterCount = countActiveFilters(filters);

  const toggleSection = (key: string) => {
    setOpenSections((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const visibleCategoryOptions = categoryOptions.filter((option) =>
    normalizeText(option.name).includes(normalizeText(categoryQuery)),
  );

  return (
    <motion.aside
      animate={{
        width: collapsed ? 78 : 300,
      }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 34,
      }}
      className="sticky top-28 hidden h-[calc(100vh-8rem)] shrink-0 self-start lg:block"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
        {/* Header */}

        <div
          className={`shrink-0 border-b border-gray-100 bg-white ${
            collapsed ? "p-3" : "p-5"
          }`}
        >
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {!collapsed && (
                <motion.div
                  key="filter-heading"
                  initial={{
                    opacity: 0,
                    x: -8,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -8,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <p className="text-[26px] font-semibold text-primary-900">
                      តម្រង
                    </p>

                    {activeFilterCount > 0 && (
                      <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-secondary-500 px-2 text-[16px] font-semibold text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-[16px] leading-7 text-gray-400">
                    ជ្រើសរើសតាមចំណូលចិត្ត
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              onClick={() => setCollapsed((previous) => !previous)}
              whileHover={{
                scale: 1.06,
              }}
              whileTap={{
                scale: 0.9,
              }}
              aria-label={collapsed ? "Expand filters" : "Collapse filters"}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-50 text-gray-500 transition hover:bg-primary-50 hover:text-primary-700"
            >
              <motion.span
                animate={{
                  rotate: collapsed ? 180 : 0,
                }}
              >
                <IoChevronBack className="text-[21px]" />
              </motion.span>
            </motion.button>
          </div>

          {!collapsed && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
              <p className="text-[16px] text-gray-500">
                {activeFilterCount} តម្រងបានជ្រើស
              </p>

              <button
                type="button"
                disabled={activeFilterCount === 0}
                onClick={() => onChange(DEFAULT_FILTERS)}
                className="cursor-pointer text-[16px] font-medium text-secondary-500 transition hover:underline disabled:cursor-not-allowed disabled:opacity-40"
              >
                សម្អាតទាំងអស់
              </button>
            </div>
          )}
        </div>

        {collapsed ? (
          <div className="flex flex-1 flex-col items-center gap-3 overflow-y-auto px-3 py-4">
            {[
              {
                key: "sort",
                label: "តម្រៀបតាម",
                icon: <IoSwapVerticalOutline />,
              },
              {
                key: "category",
                label: "ប្រភេទម្ហូប",
                icon: <MdOutlineCategory />,
              },
              {
                key: "mealType",
                label: "ពេលទទួលទាន",
                icon: <IoTimeOutline />,
              },
              {
                key: "dietaryType",
                label: "របបអាហារ",
                icon: <IoNutritionOutline />,
              },
              {
                key: "price",
                label: "តម្លៃ",
                icon: <IoPricetagOutline />,
              },
            ].map((item) => (
              <motion.button
                key={item.key}
                type="button"
                title={item.label}
                aria-label={item.label}
                whileHover={{
                  scale: 1.08,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                onClick={() => {
                  setCollapsed(false);

                  setOpenSections((previous) => ({
                    ...previous,
                    [item.key]: true,
                  }));
                }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[21px] text-primary-700"
              >
                {item.icon}
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-2 [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300">
            {/* SORT */}

            <FilterSection
              title="តម្រៀបតាម"
              icon={<IoSwapVerticalOutline />}
              isOpen={openSections.sort}
              onToggle={() => toggleSection("sort")}
            >
              <div className="flex flex-col gap-2">
                {[
                  {
                    label: "មុខម្ហូបពិសេស",
                    value: "featured",
                  },
                  {
                    label: "ចំណាត់ថ្នាក់ខ្ពស់",
                    value: "rating",
                  },
                  {
                    label: "រៀបចំលឿនបំផុត",
                    value: "fastest",
                  },
                  {
                    label: "តាមឈ្មោះ",
                    value: "name",
                  },
                  {
                    label: "តម្លៃទាបទៅខ្ពស់",
                    value: "price-low",
                  },
                  {
                    label: "តម្លៃខ្ពស់ទៅទាប",
                    value: "price-high",
                  },
                ].map((option) => {
                  const isSelected = filters.sortBy === option.value;

                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                        isSelected
                          ? "border-primary-200 bg-primary-50 text-primary-800 dark:text-primary-dark"
                          : "border-transparent text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="food-sort"
                        checked={isSelected}
                        onChange={() =>
                          onChange({
                            ...filters,
                            sortBy: option.value as SortBy,
                          })
                        }
                        className="h-4 w-4 shrink-0 accent-primary-800"
                      />

                      <span className="text-[16px]">{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </FilterSection>

            {/* CATEGORY */}

            <FilterSection
              title="ប្រភេទម្ហូប"
              icon={<MdOutlineCategory />}
              isOpen={openSections.category}
              onToggle={() => toggleSection("category")}
            >
              <div className="mb-3 flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3">
                <IoSearchOutline className="shrink-0 text-[20px] text-gray-400" />

                <input
                  value={categoryQuery}
                  onChange={(event) => setCategoryQuery(event.target.value)}
                  placeholder="ស្វែងរកប្រភេទម្ហូប"
                  className="w-full bg-transparent text-[16px] text-gray-600 outline-none placeholder:text-gray-400"
                />
              </div>

              <div className="max-h-[230px] space-y-1 overflow-y-auto pr-2">
                {visibleCategoryOptions.map((option) => (
                  <CheckboxOption
                    key={option.code}
                    label={option.name}
                    count={option.count}
                    checked={filters.categoryCodes.includes(option.code)}
                    onChange={() =>
                      onChange({
                        ...filters,

                        categoryCodes: toggleInList(
                          filters.categoryCodes,
                          option.code,
                        ),
                      })
                    }
                  />
                ))}
              </div>
            </FilterSection>

            {/* CUISINE */}

            {cuisineOptions.length > 0 && (
              <FilterSection
                title="ម្ហូបតាមប្រទេស"
                icon={<MdOutlineCategory />}
                isOpen={openSections.cuisine}
                onToggle={() => toggleSection("cuisine")}
              >
                <div className="space-y-1">
                  {cuisineOptions.map((option) => (
                    <CheckboxOption
                      key={option.code}
                      label={option.name}
                      count={option.count}
                      checked={filters.cuisineCodes.includes(option.code)}
                      onChange={() =>
                        onChange({
                          ...filters,

                          cuisineCodes: toggleInList(
                            filters.cuisineCodes,
                            option.code,
                          ),
                        })
                      }
                    />
                  ))}
                </div>
              </FilterSection>
            )}

            {/* MEAL TYPES */}

            {mealTypeOptions.length > 0 && (
              <FilterSection
                title="ពេលទទួលទាន"
                icon={<IoTimeOutline />}
                isOpen={openSections.mealType}
                onToggle={() => toggleSection("mealType")}
              >
                <div className="space-y-1">
                  {mealTypeOptions.map((option) => (
                    <CheckboxOption
                      key={option.code}
                      label={option.name}
                      count={option.count}
                      checked={filters.mealTypeCodes.includes(option.code)}
                      onChange={() =>
                        onChange({
                          ...filters,

                          mealTypeCodes: toggleInList(
                            filters.mealTypeCodes,
                            option.code,
                          ),
                        })
                      }
                    />
                  ))}
                </div>
              </FilterSection>
            )}

            {/* DIETARY */}

            {dietaryTypeOptions.length > 0 && (
              <FilterSection
                title="របបអាហារ"
                icon={<IoNutritionOutline />}
                isOpen={openSections.dietaryType}
                onToggle={() => toggleSection("dietaryType")}
              >
                <div className="space-y-1">
                  {dietaryTypeOptions.map((option) => (
                    <CheckboxOption
                      key={option.code}
                      label={option.name}
                      count={option.count}
                      checked={filters.dietaryTypeCodes.includes(option.code)}
                      onChange={() =>
                        onChange({
                          ...filters,

                          dietaryTypeCodes: toggleInList(
                            filters.dietaryTypeCodes,
                            option.code,
                          ),
                        })
                      }
                    />
                  ))}
                </div>
              </FilterSection>
            )}

            {/* AGE GROUP */}

            {ageGroupOptions.length > 0 && (
              <FilterSection
                title="ក្រុមអាយុ"
                icon={<IoNutritionOutline />}
                isOpen={openSections.ageGroup}
                onToggle={() => toggleSection("ageGroup")}
              >
                <div className="space-y-1">
                  {ageGroupOptions.map((option) => (
                    <CheckboxOption
                      key={option.code}
                      label={option.name}
                      count={option.count}
                      checked={filters.ageGroupCodes.includes(option.code)}
                      onChange={() =>
                        onChange({
                          ...filters,

                          ageGroupCodes: toggleInList(
                            filters.ageGroupCodes,
                            option.code,
                          ),
                        })
                      }
                    />
                  ))}
                </div>
              </FilterSection>
            )}

            {/* ALLERGENS */}

            {allergenOptions.length > 0 && (
              <FilterSection
                title="មិនរួមបញ្ចូលអាឡែស៊ី"
                icon={<IoNutritionOutline />}
                isOpen={openSections.allergens}
                onToggle={() => toggleSection("allergens")}
              >
                <p className="mb-3 text-[16px] leading-7 text-orange-600">
                  មុខម្ហូបដែលមានអាឡែស៊ីដែលបានជ្រើសនឹងត្រូវដកចេញ។
                </p>

                <div className="space-y-1">
                  {allergenOptions.map((option) => (
                    <CheckboxOption
                      key={option.code}
                      label={`គ្មាន ${option.name}`}
                      count={option.count}
                      checked={filters.excludedAllergenCodes.includes(
                        option.code,
                      )}
                      onChange={() =>
                        onChange({
                          ...filters,

                          excludedAllergenCodes: toggleInList(
                            filters.excludedAllergenCodes,
                            option.code,
                          ),
                        })
                      }
                    />
                  ))}
                </div>
              </FilterSection>
            )}

            {/* SPICE */}

            <FilterSection
              title="កម្រិតហឹរ"
              icon={<FaFire />}
              isOpen={openSections.spice}
              onToggle={() => toggleSection("spice")}
            >
              <div className="space-y-1">
                {SPICE_OPTIONS.map((option) => (
                  <CheckboxOption
                    key={option.value}
                    label={option.label}
                    checked={filters.spiceLevels.includes(option.value)}
                    onChange={() =>
                      onChange({
                        ...filters,

                        spiceLevels: filters.spiceLevels.includes(option.value)
                          ? filters.spiceLevels.filter(
                              (level) => level !== option.value,
                            )
                          : [...filters.spiceLevels, option.value],
                      })
                    }
                  />
                ))}
              </div>
            </FilterSection>

            {/* PREPARATION */}

            <FilterSection
              title="ពេលរៀបចំ"
              icon={<IoTimeOutline />}
              isOpen={openSections.preparation}
              onToggle={() => toggleSection("preparation")}
            >
              <SingleChoice
                options={PREPARATION_OPTIONS}
                selected={filters.maximumPreparationMinutes}
                onChange={(value) =>
                  onChange({
                    ...filters,

                    maximumPreparationMinutes: value,
                  })
                }
              />
            </FilterSection>

            {/* RATING */}

            <FilterSection
              title="ការវាយតម្លៃ"
              icon={<FaStar />}
              isOpen={openSections.rating}
              onToggle={() => toggleSection("rating")}
            >
              <SingleChoice
                options={RATING_OPTIONS}
                selected={filters.minimumRating}
                onChange={(value) =>
                  onChange({
                    ...filters,
                    minimumRating: value,
                  })
                }
              />
            </FilterSection>

            {/* STORES */}

            {storeOptions.length > 0 && (
              <FilterSection
                title="ហាងអាហារ"
                icon={<MdOutlineCategory />}
                isOpen={openSections.stores}
                onToggle={() => toggleSection("stores")}
              >
                <div className="max-h-[230px] space-y-1 overflow-y-auto pr-2">
                  {storeOptions.map((option) => (
                    <CheckboxOption
                      key={option.code}
                      label={option.name}
                      count={option.count}
                      checked={filters.storeIds.includes(option.code)}
                      onChange={() =>
                        onChange({
                          ...filters,

                          storeIds: toggleInList(filters.storeIds, option.code),
                        })
                      }
                    />
                  ))}
                </div>
              </FilterSection>
            )}

            {/* INGREDIENTS */}

            {ingredientOptions.length > 0 && (
              <FilterSection
                title="គ្រឿងផ្សំ"
                icon={<IoNutritionOutline />}
                isOpen={openSections.ingredients}
                onToggle={() => toggleSection("ingredients")}
              >
                <div className="max-h-[260px] space-y-1 overflow-y-auto pr-2">
                  {ingredientOptions.map((option) => (
                    <CheckboxOption
                      key={option.code}
                      label={option.name}
                      count={option.count}
                      checked={filters.ingredientNames.includes(option.code)}
                      onChange={() =>
                        onChange({
                          ...filters,

                          ingredientNames: toggleInList(
                            filters.ingredientNames,
                            option.code,
                          ),
                        })
                      }
                    />
                  ))}
                </div>
              </FilterSection>
            )}

            {/* PRICE */}

            <FilterSection
              title="តម្លៃ"
              icon={<IoPricetagOutline />}
              isOpen={openSections.price}
              onToggle={() => toggleSection("price")}
            >
              <div className="grid grid-cols-3 gap-2">
                {(["$", "$$", "$$$"] as const).map((tier) => {
                  const isSelected = filters.priceTier === tier;

                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() =>
                        onChange({
                          ...filters,

                          priceTier: isSelected ? null : tier,
                        })
                      }
                      className={`rounded-xl border py-2.5 text-[16px] font-semibold transition ${
                        isSelected
                          ? "border-primary-800 bg-primary-800 text-white shadow-sm"
                          : "border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:bg-primary-50"
                      }`}
                    >
                      {tier}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 space-y-1 rounded-xl bg-gray-50 p-3 text-[16px] leading-7 text-gray-500">
                <p>$: ក្រោម $3</p>
                <p>$$: $3 ដល់ក្រោម $6</p>
                <p>$$$: $6 ឡើងទៅ</p>
              </div>
            </FilterSection>

            {/* AVAILABILITY / FEATURED */}

            <FilterSection
              title="ភាពអាចរកបាន"
              icon={<FaFire />}
              isOpen={openSections.availability}
              onToggle={() => toggleSection("availability")}
            >
              <div className="space-y-2">
                <CheckboxOption
                  label="បង្ហាញតែម្ហូបដែលមានលក់"
                  checked={filters.availabilityOnly}
                  onChange={() =>
                    onChange({
                      ...filters,

                      availabilityOnly: !filters.availabilityOnly,
                    })
                  }
                />

                <CheckboxOption
                  label="បង្ហាញតែមុខម្ហូបពិសេស"
                  checked={filters.featuredOnly}
                  onChange={() =>
                    onChange({
                      ...filters,

                      featuredOnly: !filters.featuredOnly,
                    })
                  }
                />
              </div>
            </FilterSection>

            <div className="h-4" />
          </div>
        )}
      </div>
    </motion.aside>
  );
}

/* =========================================================
   CATEGORY TABS
========================================================= */

type CategoryTabsProps = {
  options: FilterOption[];

  selectedCodes: string[];

  onChange: (categoryCodes: string[]) => void;
};

function CategoryTabs({ options, selectedCodes, onChange }: CategoryTabsProps) {
  const allSelected = selectedCodes.length === 0;

  return (
    <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
      <button
        type="button"
        onClick={() => onChange([])}
        className={`shrink-0 rounded-full border px-5 py-2.5 text-[16px] font-semibold transition ${
          allSelected
            ? "border-primary-800 bg-primary-800 text-white"
            : "border-gray-200 bg-white text-gray-600 hover:border-primary-300"
        }`}
      >
        ទាំងអស់
      </button>

      {options.map((option) => {
        const isSelected = selectedCodes.includes(option.code);

        return (
          <button
            key={option.code}
            type="button"
            onClick={() =>
              onChange(
                isSelected
                  ? selectedCodes.filter((code) => code !== option.code)
                  : [...selectedCodes, option.code],
              )
            }
            className={`shrink-0 rounded-full border px-5 py-2.5 text-[16px] font-semibold transition ${
              isSelected
                ? "border-primary-800 bg-primary-800 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-primary-300"
            }`}
          >
            {option.name}

            <span className="ml-2 opacity-70">{option.count}</span>
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   FOOD GRID
========================================================= */

type FoodGridProps = {
  foods: CatalogMenuItem[];
};

function FoodGrid({ foods }: FoodGridProps) {
  if (foods.length === 0) {
    return (
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="rounded-[24px] border border-dashed border-gray-200 bg-white px-5 py-16 text-center"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
          <IoSearchOutline className="text-[30px] text-primary-700" />
        </div>

        <h3 className="mt-4 text-[20px] font-semibold text-primary-900">
          រកមិនឃើញមុខម្ហូប
        </h3>

        <p className="mx-auto mt-2 max-w-md text-[16px] leading-7 text-gray-500">
          សូមសាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ឬសម្អាតតម្រងមួយចំនួន។
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      className="grid place-items-center grid-cols-1  max-w-4xl gap-10 gap-y-3 sm:grid-cols-2 xl:grid-cols-3"
    >
      <AnimatePresence mode="popLayout">
        {foods.map((food) => (
          <motion.div
            layout
            key={food.uuid}
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 12,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
            }}
            transition={{
              duration: 0.25,
            }}
            className="w-full"
          >
            {/* FoodCard already contains its own Link */}
            <FoodCard food={food} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center gap-4">
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 0.9,
          repeat: Infinity,
          ease: "linear",
        }}
        className="h-12 w-12 rounded-full border-4 border-primary-100 border-t-primary-800"
      />

      <p className="text-[16px] text-gray-500">កំពុងផ្ទុកមុខម្ហូប...</p>
    </div>
  );
}

/* =========================================================
   FOOD PAGE
========================================================= */

export default function FoodPage() {
  const [activePageTab, setActivePageTab] = useState<FoodPageTab>("food");

  const [searchInput, setSearchInput] = useState("");

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const {
    data: menuItems = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetMenuItemsQuery();

  const { data: profileResponse } = useGetMemberProfilesQuery({
    page: 0,
    size: 100,
  });

  const defaultProfile = useMemo(
    () =>
      profileResponse?.contents.find((profile) => profile.isDefault) ?? null,
    [profileResponse],
  );

  const { data: memberProfile } = useGetMemberProfileByIdQuery(
    defaultProfile?.uuid ?? "",
    { skip: !defaultProfile?.uuid },
  );

  /* =======================================================
     SEARCH DEBOUNCE
  ======================================================= */

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setFilters((current) => ({
        ...current,
        query: searchInput,
      }));
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  /* =======================================================
     OPTIONS FROM NEW filterData
  ======================================================= */

  const categoryOptions = useMemo(
    () =>
      getUniqueOptions(
        menuItems.flatMap((item) => {
          const category = item.filterData?.category;

          return category
            ? [
                {
                  code: category.code,
                  name: category.name,
                },
              ]
            : [];
        }),
      ),
    [menuItems],
  );

  const cuisineOptions = useMemo(
    () =>
      getUniqueOptions(
        menuItems.flatMap((item) => {
          const cuisine = item.filterData?.cuisine;

          return cuisine
            ? [
                {
                  code: cuisine.code,
                  name: cuisine.name,
                },
              ]
            : [];
        }),
      ),
    [menuItems],
  );

  const mealTypeOptions = useMemo(
    () => getUniqueOptions(menuItems.flatMap((item) => getMealTypes(item))),
    [menuItems],
  );

  const dietaryTypeOptions = useMemo(
    () => getUniqueOptions(menuItems.flatMap((item) => getDietaryTypes(item))),
    [menuItems],
  );

  const ageGroupOptions = useMemo(
    () => getUniqueOptions(menuItems.flatMap((item) => getAgeGroups(item))),
    [menuItems],
  );

  const allergenOptions = useMemo(
    () => getUniqueOptions(menuItems.flatMap((item) => getAllergens(item))),
    [menuItems],
  );

  const storeOptions = useMemo<StoreFilterOption[]>(() => {
    const map = new Map<string, StoreFilterOption>();

    menuItems.forEach((item) => {
      const id = item.store.uuid;

      const existing = map.get(id);

      if (existing) {
        existing.count += 1;

        return;
      }

      map.set(id, {
        code: id,
        name: item.store.name || "Unknown store",
        count: 1,
      });
    });

    return Array.from(map.values()).sort((first, second) =>
      first.name.localeCompare(second.name),
    );
  }, [menuItems]);

  const ingredientOptions = useMemo(
    () =>
      getUniqueOptions(
        menuItems.flatMap((item) =>
          getIngredientNames(item).map((ingredient) => ({
            code: ingredient,
            name: ingredient,
          })),
        ),
      ),
    [menuItems],
  );

  /* =======================================================
     FILTERED FOOD
  ======================================================= */

  const filteredFoods = useMemo(
    () => applyFilters(menuItems, filters, memberProfile),
    [menuItems, filters, memberProfile],
  );

  /**
   * The current list response has no recommendation object.
   * The real supported highlight field is isFeatured.
   */
  const featuredFoods = useMemo(
    () => filteredFoods.filter((food) => food.isFeatured).slice(0, 6),
    [filteredFoods],
  );

  const activeFilterCount = countActiveFilters(filters);

  /* =======================================================
     SHARED SEARCH
  ======================================================= */

  const renderSearch = () => (
    <div className="flex min-h-[56px] flex-1 items-center gap-3 rounded-full border border-gray-200 bg-white px-5 transition focus-within:border-primary-700 focus-within:ring-4 focus-within:ring-primary-50">
      <IoSearchOutline className="shrink-0 text-[22px] text-primary-700" />

      <input
        type="search"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        placeholder="ស្វែងរកម្ហូប ហាង ប្រភេទម្ហូប..."
        aria-label="Search foods"
        className="w-full bg-transparent text-[16px] text-gray-700 outline-none placeholder:text-gray-400 dark:text-gray-100"
      />

      {searchInput && (
        <button
          type="button"
          onClick={() => {
            setSearchInput("");

            setFilters((current) => ({
              ...current,
              query: "",
            }));
          }}
          className="shrink-0 text-[16px] font-medium text-secondary-500"
        >
          សម្អាត
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafaf8] dark:bg-black">
      <div className="pt-15" />

      {/* NAV TABS */}

      <div className="sticky top-16 z-30 w-full border-b border-gray-100 bg-white/85 backdrop-blur-md">
        <FoodNavTabs activeTab={activePageTab} onTabChange={setActivePageTab} />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6">
        {isLoading || isFetching ? (
          <LoadingState />
        ) : isError ? (
          <div className="flex min-h-[500px] flex-col items-center justify-center gap-4 rounded-[24px] border border-red-100 bg-white px-5 text-center">
            <p className="text-[20px] font-semibold text-red-500">
              មិនអាចទាញយកទិន្នន័យបានទេ
            </p>

            <p className="text-[16px] leading-7 text-gray-500">
              សូមពិនិត្យការតភ្ជាប់ ហើយព្យាយាមម្តងទៀត។
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="flex items-center gap-2 rounded-full bg-primary-800 px-5 py-3 text-[16px] font-semibold text-white transition hover:bg-primary-700 active:scale-95"
            >
              <IoRefresh className="text-[20px]" />
              ព្យាយាមម្តងទៀត
            </button>

            <details className="max-w-full">
              <summary className="cursor-pointer text-[16px] text-gray-400">
                ព័ត៌មានបច្ចេកទេស
              </summary>

              <pre className="mt-3 max-w-full overflow-auto whitespace-pre-wrap rounded-xl bg-red-50 p-3 text-left text-[16px] text-red-400">
                {JSON.stringify(error, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* =================================================
                FOOD TAB
            ================================================= */}

            {activePageTab === "food" && (
              <motion.div
                key="food-tab"
                initial={{
                  opacity: 0,
                  x: -24,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: 24,
                }}
                transition={{
                  duration: 0.25,
                  ease: "easeOut",
                }}
              >
                {/* SEARCH */}

                <section className="rounded-full border border-gray-100 bg-white p-1 shadow-sm">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    {renderSearch()}

                    <div className="flex items-center justify-between gap-3 rounded-full bg-primary-50 px-5 py-3">
                      <FaStar className="text-[20px] text-yellow-500" />

                      <p className="text-[16px] text-primary-800 dark:text-primary-dark">
                        រកឃើញ
                        <span className="font-semibold">
                          {filteredFoods.length}
                        </span>
                        មុខម្ហូប
                      </p>
                    </div>

                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchInput("");

                          setFilters(DEFAULT_FILTERS);
                        }}
                        className="rounded-full border border-secondary-200 px-5 py-3 text-[16px] font-semibold text-secondary-500 transition hover:bg-secondary-50"
                      >
                        សម្អាតតម្រង {activeFilterCount}
                      </button>
                    )}
                  </div>
                </section>

                <div className="mt-6 flex gap-8">
                  <FilterSidebar
                    filters={filters}
                    onChange={setFilters}
                    categoryOptions={categoryOptions}
                    cuisineOptions={cuisineOptions}
                    mealTypeOptions={mealTypeOptions}
                    dietaryTypeOptions={dietaryTypeOptions}
                    ageGroupOptions={ageGroupOptions}
                    allergenOptions={allergenOptions}
                    storeOptions={storeOptions}
                    ingredientOptions={ingredientOptions}
                  />

                  <main className="min-w-0 flex-1">
                    <CategoryTabs
                      options={categoryOptions}
                      selectedCodes={filters.categoryCodes}
                      onChange={(categoryCodes) =>
                        setFilters((current) => ({
                          ...current,
                          categoryCodes,
                        }))
                      }
                    />

                    {/* FEATURED */}

                    {featuredFoods.length > 0 && (
                      <section className="mt-8">
                        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                          <div>
                            <p className="text-[16px] font-semibold text-secondary-500">
                              FoodHub
                            </p>

                            <p className="mt-1 text-[26px] font-bold text-primary-900 dark:text-[#22a447]">
                              មុខម្ហូបពិសេស
                            </p>
                          </div>

                          <span className="rounded-full bg-primary-50 px-4 py-2 text-[16px] font-semibold text-primary-700">
                            {featuredFoods.length} ជម្រើស
                          </span>
                        </div>

                        <FoodGrid foods={featuredFoods} />
                      </section>
                    )}

                    {/* ALL FOODS */}

                    <section className="mt-12">
                      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                        <div>
                          <p className="text-[16px] font-semibold text-secondary-500">
                            មុខម្ហូបទាំងអស់
                          </p>

                          <p className="mt-1 text-[26px] font-bold text-primary-900 dark:text-[#22a447]">
                            ស្វែងរកជម្រើសដែលអ្នកចូលចិត្ត
                          </p>
                        </div>

                        <p className="text-[16px] text-gray-500 dark:text-gray-50">
                          បង្ហាញ {filteredFoods.length} ក្នុងចំណោម
                          {menuItems.length}
                        </p>
                      </div>

                      <FoodGrid foods={filteredFoods} />
                    </section>

                    <section className="mt-14 overflow-hidden rounded-[28px] bg-gradient-to-br from-primary-900 to-primary-800 px-6 py-12 text-center text-white">
                      <p className="text-[28px] font-semibold md:text-[36px]">
                        បទពិសោធន៍ថ្មីក្នុងការស្វែងរកអាហារ
                      </p>

                      <p className="mx-auto mt-3 max-w-2xl text-[16px]  lg:text-xl leading-8 text-white/80">
                        ស្វែងរកមុខម្ហូបដែលសមនឹងចំណូលចិត្ត តម្លៃ ពេលរៀបចំ
                        ប្រភេទម្ហូប និងហាងដែលអ្នកចូលចិត្ត។
                      </p>
                    </section>
                  </main>
                </div>
              </motion.div>
            )}

            {/* =================================================
                LOCATION TAB

                IMPORTANT:
                Current LocationContent still expects the old
                "@/types/manu" MenuItem[] contract.

                Do NOT cast CatalogMenuItem[] into the old model.
                An empty compatibility array keeps this parent
                safe until LocationContent is migrated.
            ================================================= */}

            {activePageTab === "location" && (
              <motion.div
                key="location-tab"
                initial={{
                  opacity: 0,
                  x: 24,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -24,
                }}
                transition={{
                  duration: 0.25,
                  ease: "easeOut",
                }}
              >
                <section className="mb-4 rounded-full border border-gray-100 bg-white p-1 shadow-sm">
                  {renderSearch()}
                </section>

                <LocationContent
                  menuItems={menuItems}
                  searchQuery={searchInput}
                />
              </motion.div>
            )}

            {/* =================================================
                STORE TAB

                Same reason as LocationContent: do not force-cast
                the new CatalogMenuItem into the old MenuItem.
            ================================================= */}

            {activePageTab === "store" && (
              <motion.div
                key="store-tab"
                initial={{
                  opacity: 0,
                  x: 24,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -24,
                }}
                transition={{
                  duration: 0.25,
                  ease: "easeOut",
                }}
              >
                <section className="mb-4 rounded-full border border-gray-100 bg-white p-1 shadow-sm">
                  {renderSearch()}
                </section>

                <StoreContent
                  menuItems={[]}
                  searchQuery={searchInput}
                  onClearSearch={() => setSearchInput("")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
