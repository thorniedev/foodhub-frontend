"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import { AnimatePresence, motion } from "framer-motion";

import {
  IoChevronBack,
  IoChevronDown,
  IoFilterOutline,
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
import DiscoveryFilterSheet from "@/components/discovery/DiscoveryFilterSheet";

import { useGetMenuItemsQuery } from "@/app/store/menuApi";
import { useDiscoverySearchMutation } from "@/app/store/searchApi";
import type { CustomerSearchRequest, MenuItemDiscoveryResponse, SafetyStatusType } from "@/types/search";
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

  seasonCodes: string[];
  eventCodes: string[];
  weatherCodes: string[];
  originCountryCodes: string[];

  excludedAllergenCodes: string[];
  storeIds: string[];
  ingredientNames: string[];
  spiceLevels: number[];

  availabilityOnly: boolean;
  featuredOnly: boolean;
  traditionalOnly: boolean;

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
    label: "10 នាទី ឬតិច",
  },
  {
    value: 20,
    label: "20 នាទី ឬតិច",
  },
  {
    value: 30,
    label: "30 នាទី ឬតិច",
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

  seasonCodes: [],
  eventCodes: [],
  weatherCodes: [],
  originCountryCodes: [],

  excludedAllergenCodes: [],
  storeIds: [],
  ingredientNames: [],
  spiceLevels: [],

  availabilityOnly: true,
  featuredOnly: false,
  traditionalOnly: false,

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
  return Array.isArray(food.food?.mealTypes) ? food.food.mealTypes : [];
}

function getAgeGroups(food: CatalogMenuItem): CatalogCodeName[] {
  return Array.isArray(food.food?.ageGroups) ? food.food.ageGroups : [];
}

function getDietaryTypes(food: CatalogMenuItem): CatalogCodeName[] {
  return Array.isArray(food.food?.dietaryTypes)
    ? food.food.dietaryTypes.map((item) => ({
        code: item.code,
        name: item.name,
      }))
    : [];
}

function getSeasons(food: CatalogMenuItem): CatalogCodeName[] {
  return Array.isArray(food.food?.seasons)
    ? food.food.seasons.map((item) => ({
        code: item.code,
        name: item.name,
      }))
    : [];
}

function getEvents(food: CatalogMenuItem): CatalogCodeName[] {
  return Array.isArray(food.food?.events)
    ? food.food.events.map((item) => ({
        code: item.code,
        name: item.name,
      }))
    : [];
}

function getSuitableWeather(food: CatalogMenuItem): CatalogCodeName[] {
  return Array.isArray(food.food?.suitableWeather)
    ? food.food.suitableWeather.map((item) => ({
        code: item.code,
        name: item.name,
      }))
    : [];
}

/**
 * The current response now proves allergen objects such as:
 *
 * {
 *   code: "ត្រី",
 *   name: "ត្រី",
 *   declarationType: "CONTAINS",
 *   riskLevel: "HIGH",
 *   verificationStatus: "VERIFIED"
 * }
 *
 * CatalogMenuItem still safely allows unknown[] here, so we narrow at runtime.
 */
function getAllergens(food: CatalogMenuItem): CatalogCodeName[] {
  if (!Array.isArray(food.allergenDeclarations)) {
    return [];
  }

  return food.allergenDeclarations.flatMap((value) => {
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

function getIngredientNames(food: CatalogMenuItem): string[] {
  if (!Array.isArray(food.ingredients)) {
    return [];
  }

  return food.ingredients.filter(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  );
}

function getOriginCountry(food: CatalogMenuItem): CatalogCodeName | null {
  const origin = food.origin;

  if (!origin?.countryCode || !origin?.countryName) {
    return null;
  }

  return {
    code: origin.countryCode,
    name: origin.countryLocalName?.trim() || origin.countryName,
  };
}

/* =========================================================
   SEARCH
========================================================= */

function matchesSearch(food: CatalogMenuItem, query: string): boolean {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return true;
  }

  /**
   * Search the same complete CatalogMenuItem object that is passed to FoodCard.
   * This includes current nested category, cuisine, dietary, age group,
   * meal type, seasons, events, weather, ingredients, allergens,
   * nutrition, store, origin, price, preparation time, etc.
   */
  const searchableText = normalizeText(JSON.stringify(food));

  const tokens = normalizedQuery
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  return tokens.every((token) => searchableText.includes(token));
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

    const category = food.food?.category;

    if (
      filters.categoryCodes.length > 0 &&
      (!category || !filters.categoryCodes.includes(category.code))
    ) {
      return false;
    }

    const cuisine = food.food?.cuisine;

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

    const seasons = getSeasons(food);

    if (
      filters.seasonCodes.length > 0 &&
      !seasons.some((item) => filters.seasonCodes.includes(item.code))
    ) {
      return false;
    }

    const events = getEvents(food);

    if (
      filters.eventCodes.length > 0 &&
      !events.some((item) => filters.eventCodes.includes(item.code))
    ) {
      return false;
    }

    const suitableWeather = getSuitableWeather(food);

    if (
      filters.weatherCodes.length > 0 &&
      !suitableWeather.some((item) => filters.weatherCodes.includes(item.code))
    ) {
      return false;
    }

    const originCountry = getOriginCountry(food);

    if (
      filters.originCountryCodes.length > 0 &&
      (!originCountry ||
        !filters.originCountryCodes.includes(originCountry.code))
    ) {
      return false;
    }

    if (filters.traditionalOnly && !food.origin?.isTraditional) {
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
      !filters.spiceLevels.includes(food.food?.spiceLevel ?? -1)
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
    filters.seasonCodes.length +
    filters.eventCodes.length +
    filters.weatherCodes.length +
    filters.originCountryCodes.length +
    filters.excludedAllergenCodes.length +
    filters.storeIds.length +
    filters.ingredientNames.length +
    filters.spiceLevels.length +
    (filters.priceTier ? 1 : 0) +
    (filters.maximumPreparationMinutes !== null ? 1 : 0) +
    (filters.minimumRating !== null ? 1 : 0) +
    (filters.featuredOnly ? 1 : 0) +
    (filters.traditionalOnly ? 1 : 0)
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
        <span className="flex items-center gap-2 text-[18px] font-semibold text-primary-900">
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

        <span className="truncate text-[18px] text-gray-600">{label}</span>
      </span>

      {typeof count === "number" && (
        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[18px] text-gray-500">
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
            className={`rounded-full border px-3 py-2 text-[18px] transition ${
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

  seasonOptions: FilterOption[];
  eventOptions: FilterOption[];
  weatherOptions: FilterOption[];
  originCountryOptions: FilterOption[];

  allergenOptions: FilterOption[];
  storeOptions: StoreFilterOption[];
  ingredientOptions: FilterOption[];
  hasPositiveRatingData: boolean;

  /**
   * Desktop:
   * - sticky collapsible sidebar
   *
   * Mobile/tablet:
   * - full-height content inside drawer
   */
  mobile?: boolean;

  onClose?: () => void;
};

function FilterSidebar({
  filters,
  onChange,
  categoryOptions,
  cuisineOptions,
  mealTypeOptions,
  dietaryTypeOptions,
  ageGroupOptions,
  seasonOptions,
  eventOptions,
  weatherOptions,
  originCountryOptions,
  allergenOptions,
  storeOptions,
  ingredientOptions,
  hasPositiveRatingData,
  mobile = false,
  onClose,
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

    seasons: false,
    events: false,
    weather: false,
    origin: false,

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

  /**
   * Mobile filter drawer should always show
   * the complete filter UI. Collapse mode is
   * desktop-only.
   */
  const isCollapsed = mobile ? false : collapsed;

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
        width: mobile ? "100%" : isCollapsed ? 78 : 300,
      }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 34,
      }}
      className={
        mobile
          ? "h-full w-full"
          : "sticky top-28 hidden h-[calc(100vh-8rem)] shrink-0 self-start lg:block"
      }
    >
      <div
        className={`flex h-full flex-col overflow-hidden bg-white ${
          mobile ? "" : "rounded-[24px] border border-gray-100 shadow-sm"
        }`}
      >
        {/* Header */}

        <div
          className={`shrink-0 border-b border-gray-100 bg-white ${
            isCollapsed ? "p-3" : "p-5"
          }`}
        >
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {!isCollapsed && (
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

            {mobile ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close food filters"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50 text-[26px] leading-none text-gray-500 transition hover:bg-gray-100"
              >
                ×
              </button>
            ) : (
              <motion.button
                type="button"
                onClick={() => setCollapsed((previous) => !previous)}
                whileHover={{
                  scale: 1.06,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                aria-label={isCollapsed ? "Expand filters" : "Collapse filters"}
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-50 text-gray-500 transition hover:bg-primary-50 hover:text-primary-700"
              >
                <motion.span
                  animate={{
                    rotate: isCollapsed ? 180 : 0,
                  }}
                >
                  <IoChevronBack className="text-[21px]" />
                </motion.span>
              </motion.button>
            )}
          </div>

          {!isCollapsed && (
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

        {isCollapsed ? (
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
                  // {
                  //   label: "មុខម្ហូបពិសេស",
                  //   value: "featured",
                  // },
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

                      <span className="text-[18px]">{option.label}</span>
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
                  className="w-full bg-transparent text-[18px] text-gray-600 outline-none placeholder:text-gray-400"
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

            {/* SEASONS */}

            {seasonOptions.length > 0 && (
              <FilterSection
                title="រដូវកាល"
                icon={<IoTimeOutline />}
                isOpen={openSections.seasons}
                onToggle={() => toggleSection("seasons")}
              >
                <div className="space-y-1">
                  {seasonOptions.map((option) => (
                    <CheckboxOption
                      key={option.code}
                      label={option.name}
                      count={option.count}
                      checked={filters.seasonCodes.includes(option.code)}
                      onChange={() =>
                        onChange({
                          ...filters,
                          seasonCodes: toggleInList(
                            filters.seasonCodes,
                            option.code,
                          ),
                        })
                      }
                    />
                  ))}
                </div>
              </FilterSection>
            )}

            {/* EVENTS */}

            {eventOptions.length > 0 && (
              <FilterSection
                title="ឱកាស និងព្រឹត្តិការណ៍"
                icon={<MdOutlineCategory />}
                isOpen={openSections.events}
                onToggle={() => toggleSection("events")}
              >
                <div className="space-y-1">
                  {eventOptions.map((option) => (
                    <CheckboxOption
                      key={option.code}
                      label={option.name}
                      count={option.count}
                      checked={filters.eventCodes.includes(option.code)}
                      onChange={() =>
                        onChange({
                          ...filters,
                          eventCodes: toggleInList(
                            filters.eventCodes,
                            option.code,
                          ),
                        })
                      }
                    />
                  ))}
                </div>
              </FilterSection>
            )}

            {/* SUITABLE WEATHER */}

            {weatherOptions.length > 0 && (
              <FilterSection
                title="អាកាសធាតុសមស្រប"
                icon={<FaFire />}
                isOpen={openSections.weather}
                onToggle={() => toggleSection("weather")}
              >
                <div className="space-y-1">
                  {weatherOptions.map((option) => (
                    <CheckboxOption
                      key={option.code}
                      label={option.name}
                      count={option.count}
                      checked={filters.weatherCodes.includes(option.code)}
                      onChange={() =>
                        onChange({
                          ...filters,
                          weatherCodes: toggleInList(
                            filters.weatherCodes,
                            option.code,
                          ),
                        })
                      }
                    />
                  ))}
                </div>
              </FilterSection>
            )}

            {/* ORIGIN */}

            {originCountryOptions.length > 0 && (
              <FilterSection
                title="ប្រភពដើម"
                icon={<MdOutlineCategory />}
                isOpen={openSections.origin}
                onToggle={() => toggleSection("origin")}
              >
                <div className="space-y-1">
                  {originCountryOptions.map((option) => (
                    <CheckboxOption
                      key={option.code}
                      label={option.name}
                      count={option.count}
                      checked={filters.originCountryCodes.includes(option.code)}
                      onChange={() =>
                        onChange({
                          ...filters,
                          originCountryCodes: toggleInList(
                            filters.originCountryCodes,
                            option.code,
                          ),
                        })
                      }
                    />
                  ))}

                  <CheckboxOption
                    label="ម្ហូបប្រពៃណី"
                    checked={filters.traditionalOnly}
                    onChange={() =>
                      onChange({
                        ...filters,
                        traditionalOnly: !filters.traditionalOnly,
                      })
                    }
                  />
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
                <p className="mb-3 text-[18px] leading-7 text-orange-600">
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

            {hasPositiveRatingData && (
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
            )}

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
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isApiFilterSheetOpen, setIsApiFilterSheetOpen] = useState(false);

  const [customerSearchRequest, setCustomerSearchRequest] = useState<CustomerSearchRequest>({
    sort: "FOODHUB_RATING_DESC",
  });

  const [executeDiscoverySearch, { data: discoveryResult, isLoading: isDiscoveryLoading }] =
    useDiscoverySearchMutation();

  useEffect(() => {
    executeDiscoverySearch({
      page: 0,
      size: 50,
      sort: customerSearchRequest.sort || "FOODHUB_RATING_DESC",
      request: {
        ...customerSearchRequest,
        query: searchInput.trim() || undefined,
      },
    });
  }, [customerSearchRequest, searchInput, executeDiscoverySearch]);

  const discoveryItems = useMemo(() => {
    if (!discoveryResult) return [];
    if (Array.isArray(discoveryResult)) return discoveryResult;
    if ("content" in discoveryResult && Array.isArray((discoveryResult as any).content)) {
      return (discoveryResult as any).content as MenuItemDiscoveryResponse[];
    }
    return [];
  }, [discoveryResult]);

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
     OPTIONS FROM CURRENT API RESPONSE
  ======================================================= */

  const categoryOptions = useMemo(
    () =>
      getUniqueOptions(
        menuItems.flatMap((item) => {
          const category = item.food?.category;

          return category
            ? [
                {
                  code: category.code,
                  name:
                    category.code === "FOOD" || category.name === "Food"
                      ? "អាហារ"
                      : category.name,
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
          const cuisine = item.food?.cuisine;

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

  const seasonOptions = useMemo(
    () => getUniqueOptions(menuItems.flatMap((item) => getSeasons(item))),
    [menuItems],
  );

  const eventOptions = useMemo(
    () => getUniqueOptions(menuItems.flatMap((item) => getEvents(item))),
    [menuItems],
  );

  const weatherOptions = useMemo(
    () =>
      getUniqueOptions(menuItems.flatMap((item) => getSuitableWeather(item))),
    [menuItems],
  );

  const originCountryOptions = useMemo(
    () =>
      getUniqueOptions(
        menuItems.flatMap((item) => {
          const origin = getOriginCountry(item);

          return origin ? [origin] : [];
        }),
      ),
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

  const hasPositiveRatingData = useMemo(
    () => menuItems.some((item) => Number(item.store?.averageRating ?? 0) > 0),
    [menuItems],
  );

  /* =======================================================
     FILTERED FOOD
  ======================================================= */

  const filteredFoods = useMemo(
    () => applyFilters(menuItems, filters, memberProfile),
    [menuItems, filters, memberProfile],
  );

  const apiCatalogFoods = useMemo(() => {
    if (discoveryItems.length > 0) {
      return discoveryItems.map((item) => {
        const catalogItem: CatalogMenuItem & { safetyStatus?: SafetyStatusType; safetyReasonCodes?: string[] } = {
          uuid: item.menuItemUuid,
          legacyId: 0,
          name: item.name,
          localName: item.food?.localName || item.name,
          description: item.description || null,
          localDescription: null,
          thumbnail: item.imageUrl || null,
          gallery: item.imageUrl ? [item.imageUrl] : [],
          price: item.price,
          currencyCode: item.currencyCode || "USD",
          preparationTimeMinutes: item.food?.defaultSpiceLevel || null,
          availabilityStatus: (item.availabilityStatus as any) || "AVAILABLE",
          isFeatured: false,
          source: "DISCOVERY",
          store: {
            uuid: item.store?.uuid || "",
            name: item.store?.name || "Store",
            localName: item.store?.name || "Store",
            logoUrl: null,
            coverImageUrl: null,
            social: [],
            addressLine: null,
            district: null,
            city: null,
            latitude: 0,
            longitude: 0,
            operatingStatus: (item.store?.operatingStatus as any) || "OPEN",
            averageRating: item.store?.averageRating || 0,
            totalReviews: 0,
          },
          distanceKm: item.distanceMeters ? item.distanceMeters / 1000 : null,
          food: {
            uuid: item.menuItemUuid,
            canonicalName: item.food?.canonicalName || item.name,
            category: { code: "", name: "" },
            cuisine: { code: "", name: "" },
            spiceLevel: item.food?.defaultSpiceLevel || 0,
            ageGroups: [],
            mealTypes: [],
            seasons: [],
            dietaryTypes: [],
            events: [],
            suitableWeather: [],
          },
          allergenDeclarations: [],
          ingredients: [],
          beveragePairings: [],
          nutrition: { calories: 0, fatGrams: 0, carbsGrams: 0, proteinGrams: 0 },
          recommendation: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          origin: {
            countryCode: "KH",
            countryName: "Cambodia",
            countryLocalName: "កម្ពុជា",
            provinceCode: null,
            provinceName: null,
            provinceLocalName: null,
            isTraditional: false,
          },
          filterOption: {
            seasons: [],
            events: [],
            provincePopularity: [],
            suitableWeather: [],
          },
          safetyStatus: item.safetyStatus,
          safetyReasonCodes: item.safetyReasonCodes,
        };
        return catalogItem;
      });
    }
    return [];
  }, [discoveryItems]);

  const displayFoods = apiCatalogFoods.length > 0 ? apiCatalogFoods : filteredFoods;

  const activeFilterCount = countActiveFilters(filters);

  /* =======================================================
     MOBILE FILTER DRAWER
  ======================================================= */

  useEffect(() => {
    if (!mobileFiltersOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileFiltersOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileFiltersOpen]);

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

  /* =======================================================
     RENDER
  ======================================================= */

  if (isLoading || isFetching) {
    return <LoadingState />;
  }

  if (isError) {
    return (
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
    );
  }

  return (
    <>
      {/* SEARCH */}

      <section className="rounded-full border border-gray-100 bg-white p-1 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {renderSearch()}

          {/* Mobile / tablet Food filter button */}
          <button
            type="button"
            onClick={() => setIsApiFilterSheetOpen(true)}
            className="
              relative
              flex
              min-h-[56px]
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-full
              bg-primary-800
              px-5
              text-[16px]
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-primary-700
              active:scale-[0.98]
            "
            aria-label="Open food filters"
          >
            <IoFilterOutline className="text-[21px]" />

            <span>តម្រងស្វែងរក (Advanced Filters)</span>
          </button>

          <div className="flex items-center justify-between gap-3 rounded-full bg-primary-50 px-5 py-3">
            <FaStar className="text-[20px] text-yellow-500" />

            <p className="text-[16px] text-primary-800 dark:text-primary-dark">
              រកឃើញ
              <span className="font-semibold">{displayFoods.length}</span>
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
          seasonOptions={seasonOptions}
          eventOptions={eventOptions}
          weatherOptions={weatherOptions}
          originCountryOptions={originCountryOptions}
          allergenOptions={allergenOptions}
          storeOptions={storeOptions}
          ingredientOptions={ingredientOptions}
          hasPositiveRatingData={hasPositiveRatingData}
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

          {/* ALL FOODS */}

          <section className="mt-6">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mt-1 text-[26px] font-bold text-primary-900 dark:text-[#22a447]">
                  ស្វែងរកជម្រើសដែលអ្នកចូលចិត្ត
                </p>
              </div>

              <p className="text-[16px] text-gray-500 dark:text-gray-50">
                បង្ហាញ {displayFoods.length} មុខម្ហូប
              </p>
            </div>

            <FoodGrid foods={displayFoods} />
          </section>

          <section className="mt-14 overflow-hidden rounded-[28px] bg-gradient-to-br from-primary-900 to-primary-800 px-6 py-12 text-center text-white">
            <p className="text-[28px] font-semibold md:text-[36px]">
              បទពិសោធន៍ថ្មីក្នុងការស្វែងរកអាហារ
            </p>

            <p className="mx-auto mt-3 max-w-2xl text-[16px]  lg:text-xl leading-8 text-white/80">
              ស្វែងរកមុខម្ហូបដែលសមនឹងចំណូលចិត្ត តម្លៃ ពេលរៀបចំ ប្រភេទម្ហូប
              និងហាងដែលអ្នកចូលចិត្ត។
            </p>
          </section>
        </main>
      </div>

      <DiscoveryFilterSheet
        isOpen={isApiFilterSheetOpen}
        onClose={() => setIsApiFilterSheetOpen(false)}
        filters={customerSearchRequest}
        onApplyFilters={(newFilters) => setCustomerSearchRequest(newFilters)}
        onResetFilters={() => setCustomerSearchRequest({ sort: "FOODHUB_RATING_DESC" })}
      />

      {/* MOBILE / TABLET FOOD FILTER DRAWER */}

      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div
            key="food-mobile-filter-drawer"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
            }}
            className="fixed inset-0 z-[120] lg:hidden"
          >
            {/* Overlay */}

            <motion.button
              type="button"
              aria-label="Close food filters"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-[2px]"
            />

            {/* Drawer */}

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Food filters"
              initial={{
                y: "100%",
              }}
              animate={{
                y: 0,
              }}
              exit={{
                y: "100%",
              }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 32,
              }}
              className="
                  absolute
                  inset-x-0
                  bottom-0
                  h-[90dvh]
                  overflow-hidden
                  rounded-t-[30px]
                  bg-white
                  shadow-2xl

                  sm:left-auto
                  sm:right-0
                  sm:top-0
                  sm:h-full
                  sm:w-[390px]
                  sm:rounded-none
                  sm:rounded-l-[30px]
                "
            >
              <FilterSidebar
                mobile
                filters={filters}
                onChange={setFilters}
                categoryOptions={categoryOptions}
                cuisineOptions={cuisineOptions}
                mealTypeOptions={mealTypeOptions}
                dietaryTypeOptions={dietaryTypeOptions}
                ageGroupOptions={ageGroupOptions}
                seasonOptions={seasonOptions}
                eventOptions={eventOptions}
                weatherOptions={weatherOptions}
                originCountryOptions={originCountryOptions}
                allergenOptions={allergenOptions}
                storeOptions={storeOptions}
                ingredientOptions={ingredientOptions}
                hasPositiveRatingData={hasPositiveRatingData}
                onClose={() => setMobileFiltersOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
