"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import FoodSearch from "@/components/food-page/FoodSearch";
import Link from "next/link";

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

import { useGetMenuItemsQuery } from "@/app/store/menuApi";

import type { MenuItem } from "@/types/manu";
import LocationContent from "@/components/food-page/location/LocationContent";
import StoreContent from "@/components/food-page/store/StoreContent";
import FoodNavTabs, {
  type FoodPageTab,
} from "@/components/food-page/FoodNavTabs";

type SortBy =
  | "recommended"
  | "popular"
  | "rating"
  | "fastest"
  | "nearest"
  | "price-low"
  | "price-high";

type PriceTier = "$" | "$$" | "$$$" | null;

type RecommendationContextOption = {
  code: string;
  name: string;
  localName: string;
};

type SeasonalContext = RecommendationContextOption & {
  suitabilityScore: number;
  reasonText: string;
};

type EventContext = RecommendationContextOption & {
  relevanceScore: number;
  reasonText: string;
};

type ProvincePopularity = {
  provinceCode: string;
  provinceName: string;
  provinceLocalName: string;
  popularityScore: number;
  popularityRank?: number;
  isTraditionalToProvince: boolean;
  reasonText: string;
};

type WeatherContext = RecommendationContextOption & {
  suitabilityScore: number;
  reasonText: string;
};

type FoodOrigin = {
  countryCode: string;
  countryName: string;
  countryLocalName?: string;
  provinceCode?: string | null;
  provinceName?: string | null;
  provinceLocalName?: string | null;
  isTraditional: boolean;
};

type MenuItemWithContext = MenuItem & {
  origin?: FoodOrigin;
  recommendationContext?: {
    seasons: SeasonalContext[];
    events: EventContext[];
    provincePopularity: ProvincePopularity[];
    suitableWeather: WeatherContext[];
  };
};

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

  seasonCodes: string[];
  eventCodes: string[];
  provinceCodes: string[];
  weatherCodes: string[];
  originProvinceCodes: string[];

  availabilityOnly: boolean;
  recommendedOnly: boolean;
  featuredOnly: boolean;

  priceTier: PriceTier;

  maximumPreparationMinutes: number | null;
  maximumDistanceKm: number | null;

  minimumRating: number | null;
  minimumRecommendationScore: number | null;

  lowCalorieOnly: boolean;
  highProteinOnly: boolean;
  lowFatOnly: boolean;
  highFiberOnly: boolean;
  lowSodiumOnly: boolean;
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

const SPICE_OPTIONS: NumericOption[] = [
  { value: 0, label: "មិនហឹរ" },
  { value: 1, label: "ហឹរតិច" },
  { value: 2, label: "ហឹរមធ្យម" },
  { value: 3, label: "ហឹរខ្លាំង" },
];

const PREPARATION_OPTIONS: NumericOption[] = [
  { value: 10, label: "ក្រោម 10 នាទី" },
  { value: 15, label: "ក្រោម 15 នាទី" },
  { value: 20, label: "ក្រោម 20 នាទី" },
];

const DISTANCE_OPTIONS: NumericOption[] = [
  { value: 1, label: "ក្រោម 1 km" },
  { value: 2, label: "ក្រោម 2 km" },
  { value: 3, label: "ក្រោម 3 km" },
];

const RATING_OPTIONS: NumericOption[] = [
  { value: 4.7, label: "4.7 ឡើងទៅ" },
  { value: 4.8, label: "4.8 ឡើងទៅ" },
  { value: 4.9, label: "4.9 ឡើងទៅ" },
];

const MATCH_SCORE_OPTIONS: NumericOption[] = [
  { value: 0.8, label: "80% ឡើងទៅ" },
  { value: 0.9, label: "90% ឡើងទៅ" },
  { value: 0.95, label: "95% ឡើងទៅ" },
];

const DEFAULT_FILTERS: FilterState = {
  query: "",
  sortBy: "recommended",

  categoryCodes: [],
  cuisineCodes: [],
  mealTypeCodes: [],
  dietaryTypeCodes: [],
  ageGroupCodes: [],

  excludedAllergenCodes: [],
  storeIds: [],
  ingredientNames: [],
  spiceLevels: [],

  seasonCodes: [],
  eventCodes: [],
  provinceCodes: [],
  weatherCodes: [],
  originProvinceCodes: [],

  availabilityOnly: true,
  recommendedOnly: false,
  featuredOnly: false,

  priceTier: null,

  maximumPreparationMinutes: null,
  maximumDistanceKm: null,

  minimumRating: null,
  minimumRecommendationScore: null,

  lowCalorieOnly: false,
  highProteinOnly: false,
  lowFatOnly: false,
  highFiberOnly: false,
  lowSodiumOnly: false,
};

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
function normalizeText(value?: string | null): string {
  return (value ?? "").trim().toLowerCase().normalize("NFKC");
}
function matchesSearch(food: MenuItem, query: string): boolean {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return true;
  }

  const searchableValues = [
    // Food information
    food.name,
    food.localName,
    food.description,
    food.localDescription,
    food.source,
    String(food.price),
    food.price.toFixed(2),
    `$${food.price}`,
    `$${food.price.toFixed(2)}`,
    food.currencyCode,
    String(food.preparationTimeMinutes),
    `${food.preparationTimeMinutes} min`,
    String(food.distanceKm),
    `${food.distanceKm} km`,
    String(food.nutrition.calories),
    `${food.nutrition.calories} calories`,
    String(food.nutrition.protein),
    `${food.nutrition.protein} protein`,
    String(food.store.averageRating),
    `${food.store.averageRating} rating`,

    // Store information
    food.store.name,
    food.store.localName,
    food.store.addressLine,
    food.store.district,
    food.store.city,
    food.store.operatingStatus,

    // Category and cuisine
    food.food.canonicalName,
    food.food.category.code,
    food.food.category.name,
    food.food.cuisine.code,
    food.food.cuisine.name,

    // Ingredients and drinks
    ...food.ingredients,
    ...food.beveragePairings,

    // Meal types
    ...food.mealTypes.flatMap((mealType) => [mealType.code, mealType.name]),

    // Dietary types
    ...food.dietaryTypes.flatMap((dietaryType) => [
      dietaryType.code,
      dietaryType.name,
      dietaryType.verificationStatus,
    ]),

    // Allergens
    ...food.allergenDeclarations.flatMap((allergen) => [
      allergen.code,
      allergen.name,
      allergen.declarationType,
      allergen.riskLevel,
      allergen.verificationStatus,
    ]),

    // Age groups
    ...food.food.ageGroups.flatMap((ageGroup) => [
      ageGroup.code,
      ageGroup.name,
    ]),

    // Cambodian recommendation context
    ...(
      (food as MenuItemWithContext).recommendationContext?.seasons ?? []
    ).flatMap((season) => [
      season.code,
      season.name,
      season.localName,
      season.reasonText,
    ]),
    ...(
      (food as MenuItemWithContext).recommendationContext?.events ?? []
    ).flatMap((event) => [
      event.code,
      event.name,
      event.localName,
      event.reasonText,
    ]),
    ...(
      (food as MenuItemWithContext).recommendationContext?.provincePopularity ??
      []
    ).flatMap((province) => [
      province.provinceCode,
      province.provinceName,
      province.provinceLocalName,
      province.reasonText,
    ]),
    ...(
      (food as MenuItemWithContext).recommendationContext?.suitableWeather ?? []
    ).flatMap((weather) => [
      weather.code,
      weather.name,
      weather.localName,
      weather.reasonText,
    ]),
    (food as MenuItemWithContext).origin?.provinceCode,
    (food as MenuItemWithContext).origin?.provinceName,
    (food as MenuItemWithContext).origin?.provinceLocalName,

    // Recommendation information
    food.recommendation.reasonText,
    food.recommendation.candidateSource,
    food.recommendation.safetyStatus,
    ...food.recommendation.reasonCodes,
  ];

  return searchableValues.some((value) =>
    normalizeText(value).includes(normalizedQuery),
  );
}

function getUniqueOptions(
  values: {
    code: string;
    name: string;
  }[],
): FilterOption[] {
  const optionMap = new Map<string, FilterOption>();

  values.forEach((item) => {
    const existing = optionMap.get(item.code);

    if (existing) {
      existing.count += 1;
      return;
    }

    optionMap.set(item.code, {
      code: item.code,
      name: item.name,
      count: 1,
    });
  });

  return Array.from(optionMap.values()).sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}

function applyFilters(foods: MenuItem[], filters: FilterState): MenuItem[] {
  const filteredFoods = foods.filter((food) => {
    if (filters.availabilityOnly && food.availabilityStatus !== "AVAILABLE") {
      return false;
    }

    if (filters.recommendedOnly && !food.recommendation.isRecommended) {
      return false;
    }

    if (filters.featuredOnly && !food.isFeatured) {
      return false;
    }

    if (!matchesSearch(food, filters.query)) {
      return false;
    }

    if (
      filters.categoryCodes.length > 0 &&
      !filters.categoryCodes.includes(food.food.category.code)
    ) {
      return false;
    }

    if (
      filters.cuisineCodes.length > 0 &&
      !filters.cuisineCodes.includes(food.food.cuisine.code)
    ) {
      return false;
    }

    if (
      filters.mealTypeCodes.length > 0 &&
      !food.mealTypes.some((mealType) =>
        filters.mealTypeCodes.includes(mealType.code),
      )
    ) {
      return false;
    }

    if (
      filters.dietaryTypeCodes.length > 0 &&
      !food.dietaryTypes.some((dietaryType) =>
        filters.dietaryTypeCodes.includes(dietaryType.code),
      )
    ) {
      return false;
    }

    if (
      filters.ageGroupCodes.length > 0 &&
      !food.food.ageGroups.some((ageGroup) =>
        filters.ageGroupCodes.includes(ageGroup.code),
      )
    ) {
      return false;
    }

    // Exclude foods containing selected allergens
    if (
      filters.excludedAllergenCodes.length > 0 &&
      food.allergenDeclarations.some((allergen) =>
        filters.excludedAllergenCodes.includes(allergen.code),
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

    // Requires every selected ingredient
    if (
      filters.ingredientNames.length > 0 &&
      !filters.ingredientNames.every((selectedIngredient) =>
        food.ingredients.some((ingredient) =>
          normalizeText(ingredient).includes(normalizeText(selectedIngredient)),
        ),
      )
    ) {
      return false;
    }

    const contextFood = food as MenuItemWithContext;
    const recommendationContext = contextFood.recommendationContext;

    if (
      filters.seasonCodes.length > 0 &&
      !recommendationContext?.seasons.some((season) =>
        filters.seasonCodes.includes(season.code),
      )
    ) {
      return false;
    }

    if (
      filters.eventCodes.length > 0 &&
      !recommendationContext?.events.some((event) =>
        filters.eventCodes.includes(event.code),
      )
    ) {
      return false;
    }

    if (
      filters.provinceCodes.length > 0 &&
      !recommendationContext?.provincePopularity.some((province) =>
        filters.provinceCodes.includes(province.provinceCode),
      )
    ) {
      return false;
    }

    if (
      filters.weatherCodes.length > 0 &&
      !recommendationContext?.suitableWeather.some((weather) =>
        filters.weatherCodes.includes(weather.code),
      )
    ) {
      return false;
    }

    if (
      filters.originProvinceCodes.length > 0 &&
      (!contextFood.origin?.provinceCode ||
        !filters.originProvinceCodes.includes(contextFood.origin.provinceCode))
    ) {
      return false;
    }

    if (
      filters.spiceLevels.length > 0 &&
      !filters.spiceLevels.includes(food.food.spiceLevel)
    ) {
      return false;
    }

    if (!matchesPriceTier(food.price, filters.priceTier)) {
      return false;
    }

    if (
      filters.maximumPreparationMinutes !== null &&
      food.preparationTimeMinutes > filters.maximumPreparationMinutes
    ) {
      return false;
    }

    if (
      filters.maximumDistanceKm !== null &&
      food.distanceKm > filters.maximumDistanceKm
    ) {
      return false;
    }

    if (
      filters.minimumRating !== null &&
      food.store.averageRating < filters.minimumRating
    ) {
      return false;
    }

    if (
      filters.minimumRecommendationScore !== null &&
      food.recommendation.finalScore < filters.minimumRecommendationScore
    ) {
      return false;
    }

    if (filters.lowCalorieOnly && food.nutrition.calories >= 400) {
      return false;
    }

    if (filters.highProteinOnly && food.nutrition.protein < 25) {
      return false;
    }

    if (filters.lowFatOnly && food.nutrition.fat >= 10) {
      return false;
    }

    if (filters.highFiberOnly && food.nutrition.fiber < 5) {
      return false;
    }

    if (filters.lowSodiumOnly && food.nutrition.sodium >= 600) {
      return false;
    }

    return true;
  });

  return [...filteredFoods].sort((first, second) => {
    switch (filters.sortBy) {
      case "popular":
        return second.store.totalReviews - first.store.totalReviews;

      case "rating":
        return second.store.averageRating - first.store.averageRating;

      case "fastest":
        return first.preparationTimeMinutes - second.preparationTimeMinutes;

      case "nearest":
        return first.distanceKm - second.distanceKm;

      case "price-low":
        return first.price - second.price;

      case "price-high":
        return second.price - first.price;

      case "recommended":
      default:
        return (
          second.recommendation.finalScore - first.recommendation.finalScore
        );
    }
  });
}

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
    filters.seasonCodes.length +
    filters.eventCodes.length +
    filters.provinceCodes.length +
    filters.weatherCodes.length +
    filters.originProvinceCodes.length +
    (filters.priceTier ? 1 : 0) +
    (filters.maximumPreparationMinutes !== null ? 1 : 0) +
    (filters.maximumDistanceKm !== null ? 1 : 0) +
    (filters.minimumRating !== null ? 1 : 0) +
    (filters.minimumRecommendationScore !== null ? 1 : 0) +
    (filters.recommendedOnly ? 1 : 0) +
    (filters.featuredOnly ? 1 : 0) +
    (filters.lowCalorieOnly ? 1 : 0) +
    (filters.highProteinOnly ? 1 : 0) +
    (filters.lowFatOnly ? 1 : 0) +
    (filters.highFiberOnly ? 1 : 0) +
    (filters.lowSodiumOnly ? 1 : 0)
  );
}

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
  options: { value: T; label: string }[];
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

  seasonOptions: FilterOption[];
  eventOptions: FilterOption[];
  provinceOptions: FilterOption[];
  weatherOptions: FilterOption[];
  originProvinceOptions: FilterOption[];
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
  seasonOptions,
  eventOptions,
  provinceOptions,
  weatherOptions,
  originProvinceOptions,
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
    distance: false,
    seasons: true,
    events: true,
    provinces: false,
    weather: false,
    originProvince: false,
    rating: false,
    matchScore: false,
    stores: false,
    ingredients: false,
    nutrition: false,

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
    option.name.toLowerCase().includes(categoryQuery.trim().toLowerCase()),
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
        {/* Fixed header */}
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
                  transition={{
                    duration: 0.2,
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
                transition={{
                  duration: 0.25,
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

        {/* Collapsed navigation */}
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
                  backgroundColor: "rgb(240 253 244)",
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
          /* Only this part scrolls */
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-2 [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-primary-700">
            <FilterSection
              title="តម្រៀបតាម"
              icon={<IoSwapVerticalOutline />}
              isOpen={openSections.sort}
              onToggle={() => toggleSection("sort")}
            >
              <div className="flex flex-col gap-2">
                {[
                  {
                    label: "ការណែនាំល្អបំផុត",
                    value: "recommended",
                  },
                  {
                    label: "ពេញនិយមបំផុត",
                    value: "popular",
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
                    label: "នៅជិតបំផុត",
                    value: "nearest",
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
                          ? "border-primary-200 bg-primary-50 text-primary-800"
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

            <FilterSection
              title="ប្រភេទម្ហូប"
              icon={<MdOutlineCategory />}
              isOpen={openSections.category}
              onToggle={() => toggleSection("category")}
            >
              <div className="mb-3 flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 transition focus-within:border-primary-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-50">
                <IoSearchOutline className="shrink-0 text-[20px] text-gray-400" />

                <input
                  value={categoryQuery}
                  onChange={(event) => setCategoryQuery(event.target.value)}
                  placeholder="ស្វែងរកប្រភេទម្ហូប"
                  className="w-full bg-transparent text-[16px] text-gray-600 outline-none placeholder:text-gray-400"
                />
              </div>

              <div className="max-h-[230px] space-y-1 overflow-y-auto pr-2 [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300">
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

            <FilterSection
              title="ចម្ងាយ"
              icon={<IoTimeOutline />}
              isOpen={openSections.distance}
              onToggle={() => toggleSection("distance")}
            >
              <SingleChoice
                options={DISTANCE_OPTIONS}
                selected={filters.maximumDistanceKm}
                onChange={(value) =>
                  onChange({
                    ...filters,
                    maximumDistanceKm: value,
                  })
                }
              />
            </FilterSection>

            <FilterSection
              title="រដូវកាលនៅកម្ពុជា"
              icon={<FaFire />}
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

            <FilterSection
              title="ពិធីបុណ្យ និងព្រឹត្តិការណ៍"
              icon={<FaStar />}
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

            <FilterSection
              title="ពេញនិយមតាមខេត្ត"
              icon={<MdOutlineCategory />}
              isOpen={openSections.provinces}
              onToggle={() => toggleSection("provinces")}
            >
              <div className="max-h-[230px] space-y-1 overflow-y-auto pr-2">
                {provinceOptions.map((option) => (
                  <CheckboxOption
                    key={option.code}
                    label={option.name}
                    count={option.count}
                    checked={filters.provinceCodes.includes(option.code)}
                    onChange={() =>
                      onChange({
                        ...filters,
                        provinceCodes: toggleInList(
                          filters.provinceCodes,
                          option.code,
                        ),
                      })
                    }
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection
              title="សមស្របតាមអាកាសធាតុ"
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

            {originProvinceOptions.length > 0 && (
              <FilterSection
                title="ប្រភពដើមតាមខេត្ត"
                icon={<MdOutlineCategory />}
                isOpen={openSections.originProvince}
                onToggle={() => toggleSection("originProvince")}
              >
                <div className="space-y-1">
                  {originProvinceOptions.map((option) => (
                    <CheckboxOption
                      key={option.code}
                      label={option.name}
                      count={option.count}
                      checked={filters.originProvinceCodes.includes(
                        option.code,
                      )}
                      onChange={() =>
                        onChange({
                          ...filters,
                          originProvinceCodes: toggleInList(
                            filters.originProvinceCodes,
                            option.code,
                          ),
                        })
                      }
                    />
                  ))}
                </div>
              </FilterSection>
            )}

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

            <FilterSection
              title="កម្រិតសមស្រប AI"
              icon={<FaStar />}
              isOpen={openSections.matchScore}
              onToggle={() => toggleSection("matchScore")}
            >
              <SingleChoice
                options={MATCH_SCORE_OPTIONS}
                selected={filters.minimumRecommendationScore}
                onChange={(value) =>
                  onChange({
                    ...filters,
                    minimumRecommendationScore: value,
                  })
                }
              />
            </FilterSection>

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

            <FilterSection
              title="អាហារូបត្ថម្ភ"
              icon={<IoNutritionOutline />}
              isOpen={openSections.nutrition}
              onToggle={() => toggleSection("nutrition")}
            >
              <div className="space-y-1">
                <CheckboxOption
                  label="កាឡូរីក្រោម 400"
                  checked={filters.lowCalorieOnly}
                  onChange={() =>
                    onChange({
                      ...filters,
                      lowCalorieOnly: !filters.lowCalorieOnly,
                    })
                  }
                />
                <CheckboxOption
                  label="ប្រូតេអ៊ីន 25g ឡើងទៅ"
                  checked={filters.highProteinOnly}
                  onChange={() =>
                    onChange({
                      ...filters,
                      highProteinOnly: !filters.highProteinOnly,
                    })
                  }
                />
                <CheckboxOption
                  label="ជាតិខ្លាញ់ក្រោម 10g"
                  checked={filters.lowFatOnly}
                  onChange={() =>
                    onChange({
                      ...filters,
                      lowFatOnly: !filters.lowFatOnly,
                    })
                  }
                />
                <CheckboxOption
                  label="Fiber 5g ឡើងទៅ"
                  checked={filters.highFiberOnly}
                  onChange={() =>
                    onChange({
                      ...filters,
                      highFiberOnly: !filters.highFiberOnly,
                    })
                  }
                />
                <CheckboxOption
                  label="Sodium ក្រោម 600mg"
                  checked={filters.lowSodiumOnly}
                  onChange={() =>
                    onChange({
                      ...filters,
                      lowSodiumOnly: !filters.lowSodiumOnly,
                    })
                  }
                />
              </div>
            </FilterSection>

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

            {/* <FilterSection
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
                  label="បង្ហាញតែម្ហូបដែល AI ណែនាំ"
                  checked={filters.recommendedOnly}
                  onChange={() =>
                    onChange({
                      ...filters,
                      recommendedOnly: !filters.recommendedOnly,
                    })
                  }
                />

                <CheckboxOption
                  label="បង្ហាញតែម្ហូបពិសេស"
                  checked={filters.featuredOnly}
                  onChange={() =>
                    onChange({
                      ...filters,
                      featuredOnly: !filters.featuredOnly,
                    })
                  }
                />
              </div>
            </FilterSection> */}

            {/* Bottom spacing keeps the last option away from the edge */}
            <div className="h-4" />
          </div>
        )}
      </div>
    </motion.aside>
  );
}

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

type FoodGridProps = {
  foods: MenuItem[];
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
      className="grid grid-cols-1 gap-x-10 gap-y-3 max-w-4xl sm:grid-cols-3 xl:grid-cols-3"
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
            <Link href={`/food/${food.uuid}`} className="block h-full w-full">
              <FoodCard food={food} />
            </Link>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

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
  const categoryOptions = useMemo(
    () =>
      getUniqueOptions(
        menuItems.map((item) => ({
          code: item.food.category.code,
          name: item.food.category.name,
        })),
      ),
    [menuItems],
  );

  const cuisineOptions = useMemo(
    () =>
      getUniqueOptions(
        menuItems.map((item) => ({
          code: item.food.cuisine.code,
          name: item.food.cuisine.name,
        })),
      ),
    [menuItems],
  );

  const mealTypeOptions = useMemo(
    () =>
      getUniqueOptions(
        menuItems.flatMap((item) =>
          item.mealTypes.map((mealType) => ({
            code: mealType.code,
            name: mealType.name,
          })),
        ),
      ),
    [menuItems],
  );

  const dietaryTypeOptions = useMemo(
    () =>
      getUniqueOptions(
        menuItems.flatMap((item) =>
          item.dietaryTypes.map((dietaryType) => ({
            code: dietaryType.code,
            name: dietaryType.name,
          })),
        ),
      ),
    [menuItems],
  );

  const ageGroupOptions = useMemo(
    () =>
      getUniqueOptions(
        menuItems.flatMap((item) =>
          item.food.ageGroups.map((ageGroup) => ({
            code: ageGroup.code,
            name: ageGroup.name,
          })),
        ),
      ),
    [menuItems],
  );

  const allergenOptions = useMemo(
    () =>
      getUniqueOptions(
        menuItems.flatMap((item) =>
          item.allergenDeclarations.map((allergen) => ({
            code: allergen.code,
            name: allergen.name,
          })),
        ),
      ),
    [menuItems],
  );

  const storeOptions = useMemo<StoreFilterOption[]>(() => {
    const map = new Map<string, StoreFilterOption>();

    menuItems.forEach((item) => {
      const existing = map.get(item.store.uuid);

      if (existing) {
        existing.count += 1;
        return;
      }

      map.set(item.store.uuid, {
        code: item.store.uuid,
        name: item.store.localName || item.store.name,
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
          item.ingredients.map((ingredient) => ({
            code: ingredient,
            name: ingredient,
          })),
        ),
      ),
    [menuItems],
  );

  const contextualMenuItems = menuItems as MenuItemWithContext[];

  const seasonOptions = useMemo(
    () =>
      getUniqueOptions(
        contextualMenuItems.flatMap((item) =>
          (item.recommendationContext?.seasons ?? []).map((season) => ({
            code: season.code,
            name: season.localName || season.name,
          })),
        ),
      ),
    [contextualMenuItems],
  );

  const eventOptions = useMemo(
    () =>
      getUniqueOptions(
        contextualMenuItems.flatMap((item) =>
          (item.recommendationContext?.events ?? []).map((event) => ({
            code: event.code,
            name: event.localName || event.name,
          })),
        ),
      ),
    [contextualMenuItems],
  );

  const provinceOptions = useMemo(
    () =>
      getUniqueOptions(
        contextualMenuItems.flatMap((item) =>
          (item.recommendationContext?.provincePopularity ?? []).map(
            (province) => ({
              code: province.provinceCode,
              name: province.provinceLocalName || province.provinceName,
            }),
          ),
        ),
      ),
    [contextualMenuItems],
  );

  const weatherOptions = useMemo(
    () =>
      getUniqueOptions(
        contextualMenuItems.flatMap((item) =>
          (item.recommendationContext?.suitableWeather ?? []).map(
            (weather) => ({
              code: weather.code,
              name: weather.localName || weather.name,
            }),
          ),
        ),
      ),
    [contextualMenuItems],
  );

  const originProvinceOptions = useMemo(
    () =>
      getUniqueOptions(
        contextualMenuItems.flatMap((item) => {
          const origin = item.origin;

          if (!origin?.provinceCode) {
            return [];
          }

          return [
            {
              code: origin.provinceCode,
              name:
                origin.provinceLocalName ||
                origin.provinceName ||
                origin.provinceCode,
            },
          ];
        }),
      ),
    [contextualMenuItems],
  );

  const filteredFoods = useMemo(
    () => applyFilters(menuItems, filters),
    [menuItems, filters],
  );

  const recommendedFoods = useMemo(
    () =>
      filteredFoods
        .filter((food) => food.recommendation.isRecommended)
        .slice(0, 6),
    [filteredFoods],
  );

  const activeFilterCount = countActiveFilters(filters);

  return (
    <div className="min-h-screen bg-[#fafaf8] dark:bg-black">
      <div className="pt-15" />

      {/* Tabs stay on the same FoodPage */}
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
            {/* FOOD TAB */}
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
                {/* Search */}
                <section className="rounded-full  border border-gray-100 bg-white p-4 shadow-sm sm:p-1">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    {/* <div className="flex min-h-[56px] flex-1 items-center gap-3 rounded-full border border-gray-200 px-5 transition focus-within:border-primary-700 focus-within:ring-4 focus-within:ring-primary-50">
                      <IoSearchOutline className="shrink-0 text-[22px] text-primary-700" />

                      <input
                        type="search"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="ស្វែងរកម្ហូប ហាង គ្រឿងផ្សំ ឬរបបអាហារ..."
                        aria-label="Search foods, stores, ingredients, and dietary types"
                        className="w-full bg-transparent text-[16px] text-gray-700 dark:text-gray-100 outline-none placeholder:text-gray-400"
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
                    </div> */}
                    <FoodSearch
                      menuItems={menuItems}
                      value={searchInput}
                      onChange={setSearchInput}
                    />
                    <div className="flex items-center justify-between gap-3 rounded-full bg-primary-50 px-5 py-3">
                      <FaStar className="text-[20px] text-yellow-500" />

                      <p className="text-[16px] text-primary-800">
                        រកឃើញ{" "}
                        <span className="font-semibold">
                          {filteredFoods.length}
                        </span>{" "}
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
                    seasonOptions={seasonOptions}
                    eventOptions={eventOptions}
                    provinceOptions={provinceOptions}
                    weatherOptions={weatherOptions}
                    originProvinceOptions={originProvinceOptions}
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

                    {recommendedFoods.length > 0 && (
                      <section className="mt-8">
                        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                          <div>
                            <p className="text-[16px] font-semibold text-secondary-500">
                              FoodHub AI
                            </p>

                            <p className="mt-1 dark:text-emerald-400 text-[26px] font-bold text-primary-900">
                              មុខម្ហូបណែនាំសម្រាប់អ្នក
                            </p>
                          </div>

                          <span className="rounded-full bg-primary-50 px-4 py-2 text-[16px] font-semibold text-primary-700">
                            {recommendedFoods.length} ជម្រើស
                          </span>
                        </div>

                        <FoodGrid foods={recommendedFoods} />
                      </section>
                    )}

                    <section className="mt-12">
                      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                        <div>
                          <p className="text-[16px] font-semibold text-secondary-500">
                            មុខម្ហូបទាំងអស់
                          </p>

                          <p className="mt-1 dark:text-emerald-400 text-[26px] font-bold text-primary-900">
                            ស្វែងរកជម្រើសដែលអ្នកចូលចិត្ត
                          </p>
                        </div>

                        <p className="text-[16px] dark:text-gray-50 text-gray-500">
                          បង្ហាញ {filteredFoods.length} ក្នុងចំណោម{" "}
                          {menuItems.length}
                        </p>
                      </div>

                      <FoodGrid foods={filteredFoods} />
                    </section>

                    <section className="mt-14 overflow-hidden rounded-[28px] bg-gradient-to-br from-primary-900  to-primary-500 px-6 py-12 text-center text-white">
                      <p className="text-[28px] font-semibold md:text-[36px]">
                        បទពិសោធន៍ថ្មីក្នុងការស្វែងរកអាហារ
                      </p>

                      <p className="mx-auto mt-3 max-w-2xl text-[16px] leading-8 text-white/80">
                        ស្វែងរកមុខម្ហូបដែលសមនឹងចំណូលចិត្ត របបអាហារ អាឡែស៊ី ថវិកា
                        និងទីតាំងរបស់អ្នក។
                      </p>
                    </section>
                  </main>
                </div>
              </motion.div>
            )}

            {/* LOCATION TAB */}
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
                <section className="rounded-full border border-gray-100 bg-white p-4 shadow-sm sm:p-1">
                  <FoodSearch
                    menuItems={menuItems}
                    value={searchInput}
                    onChange={setSearchInput}
                  />
                </section>

                <LocationContent
                  menuItems={menuItems}
                  searchQuery={searchInput}
                />
              </motion.div>
            )}

            {/* STORE TAB */}
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
                <section className="rounded-full border border-gray-100 bg-white p-4 shadow-sm sm:p-1">
                  <FoodSearch
                    menuItems={menuItems}
                    value={searchInput}
                    onChange={setSearchInput}
                  />
                </section>

                <StoreContent
                  menuItems={menuItems}
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
