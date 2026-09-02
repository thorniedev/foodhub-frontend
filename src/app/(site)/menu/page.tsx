"use client";

import { Suspense, useEffect, useMemo, useState, useRef, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

import { AnimatePresence, motion } from "framer-motion";

import {
  IoChevronBack,
  IoChevronDown,
  IoClose,
  IoFilterOutline,
  IoNutritionOutline,
  IoPricetagOutline,
  IoRefresh,
  IoSearchOutline,
  IoSwapVerticalOutline,
  IoTimeOutline,
  IoGridOutline,
} from "react-icons/io5";

import { FaFire, FaStar } from "react-icons/fa";
import { MdOutlineCategory } from "react-icons/md";
import { CustomSelect } from "@/components/shared/CustomSelect";

import FoodCard from "@/components/dynamic-card/FoodCard";
import DiscoveryFilterSheet from "@/components/discovery/DiscoveryFilterSheet";

import { useGetMenuItemsQuery } from "@/app/store/menuApi";
import {
  useDiscoverySearchMutation,
  useGetDiscoveryFiltersQuery,
} from "@/app/store/searchApi";
import {
  isDrinkCategory,
  isFoodCategory,
  type CategoryFilterType,
} from "@/lib/category-filter";
import type {
  CustomerSearchRequest,
  FilterItemOption,
  MenuItemDiscoveryResponse,
  SafetyStatusType,
} from "@/types/search";
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

const AVAILABILITY_LABELS: Record<string, string> = {
  AVAILABLE: "មាន (Available)",
  UNAVAILABLE: "អស់ (Unavailable)",
  SOLD_OUT: "អស់ស្តុក (Sold out)",
};

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
    .normalize("NFKC")
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ");
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

function formatAgeGroupOptionLabel(a: FilterItemOption | any): string {
  const item = a as any;
  const min = item?.minAge ?? item?.minimumAge ?? item?.min_age;
  const max = item?.maxAge ?? item?.maximumAge ?? item?.max_age;

  if (min !== undefined && min !== null && max !== undefined && max !== null) {
    return `${a.name} (${min}-${max})`;
  }
  if (
    min !== undefined &&
    min !== null &&
    (max === undefined || max === null)
  ) {
    return `${a.name} (${min}+)`;
  }
  if (
    (min === undefined || min === null) &&
    max !== undefined &&
    max !== null
  ) {
    return `${a.name} (≤${max})`;
  }

  // Fallback ranges for standard FoodHub age groups if not returned from backend
  const key = `${a.name || ""} ${a.code || ""}`.toLowerCase();
  if (
    key.includes("កុមារតូច") ||
    key.includes("toddler") ||
    key.includes("infant")
  ) {
    return `${a.name} (0-2)`;
  }
  if (key.includes("កុមារ") || key.includes("child") || key.includes("kid")) {
    return `${a.name} (3-12)`;
  }
  if (
    key.includes("យុវវ័យ") ||
    key.includes("យុវជន") ||
    key.includes("teen") ||
    key.includes("youth")
  ) {
    return `${a.name} (13-17)`;
  }
  if (key.includes("មនុស្សពេញវ័យ") || key.includes("adult")) {
    return `${a.name} (18-59)`;
  }
  if (
    key.includes("មនុស្សវ័យចំណាស់") ||
    key.includes("វ័យចំណាស់") ||
    key.includes("senior") ||
    key.includes("elderly")
  ) {
    return `${a.name} (60+)`;
  }

  return a.name;
}

function findMatchingAgeGroup(
  param: string,
  options?: FilterItemOption[],
): FilterItemOption | undefined {
  if (!param || !options || options.length === 0) return undefined;
  const decoded = decodeURIComponent(param).trim().toLowerCase();

  return options.find((opt) => {
    const optName = (opt.name || "").trim().toLowerCase();
    const optCode = (opt.code || "").trim().toLowerCase();
    const optUuid = (opt.uuid || "").trim().toLowerCase();

    if (optUuid === decoded || optCode === decoded || optName === decoded) {
      return true;
    }
    if (optName.includes(decoded) || decoded.includes(optName)) {
      return true;
    }
    if (
      decoded.includes("យុវវ័យ") &&
      (optName.includes("យុវវ័យ") ||
        optCode.includes("youth") ||
        decoded.includes("13-17"))
    ) {
      return true;
    }
    if (
      decoded.includes("កុមារតូច") &&
      (optName.includes("កុមារតូច") ||
        optCode.includes("toddler") ||
        decoded.includes("0-2"))
    ) {
      return true;
    }
    if (
      decoded.includes("កុមារ") &&
      (optName.includes("កុមារ") ||
        optCode.includes("child") ||
        optCode.includes("children") ||
        decoded.includes("3-12")) &&
      !decoded.includes("តូច") &&
      !optName.includes("តូច")
    ) {
      return true;
    }
    if (
      decoded.includes("ពេញវ័យ") &&
      (optName.includes("ពេញវ័យ") ||
        optCode.includes("adult") ||
        decoded.includes("18-59"))
    ) {
      return true;
    }
    if (
      (decoded.includes("ចំណាស់") || decoded.includes("60+")) &&
      (optName.includes("ចំណាស់") ||
        optCode.includes("senior") ||
        optCode.includes("elderly"))
    ) {
      return true;
    }
    return false;
  });
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
   GLOBAL SEARCH
========================================================= */

function buildGlobalSearchText(food: CatalogMenuItem): string {
  const extraTokens = [
    food.uuid,
    food.legacyId,
    food.name,
    food.localName,
    food.description,
    food.localDescription,
    food.price,
    food.currencyCode,
    food.food?.uuid,
    food.food?.canonicalName,
    food.food?.category?.code,
    food.food?.category?.name,
    food.food?.cuisine?.code,
    food.food?.cuisine?.name,
    food.store?.name,
    food.store?.localName,
    food.store?.city,
    food.store?.district,
    food.store?.addressLine,
    food.origin?.countryCode,
    food.origin?.countryName,
    food.origin?.countryLocalName,
    food.origin?.provinceName,
    food.origin?.provinceCode,
    ...(food.food?.mealTypes?.map((m) => `${m.code} ${m.name}`) ?? []),
    ...(food.food?.dietaryTypes?.map((d) => `${d.code} ${d.name}`) ?? []),
    ...(food.food?.ageGroups?.map((a) => `${a.code} ${a.name}`) ?? []),
    ...(food.food?.seasons?.map((s) => `${s.code} ${s.name}`) ?? []),
    ...(food.food?.events?.map((e) => `${e.code} ${e.name}`) ?? []),
    ...(food.food?.suitableWeather?.map((w) => `${w.code} ${w.name}`) ?? []),
    ...(Array.isArray(food.ingredients) ? food.ingredients : []),
    ...(Array.isArray(food.allergenDeclarations)
      ? food.allergenDeclarations.map((a: any) =>
          typeof a === "string" ? a : `${a?.code || ""} ${a?.name || ""}`,
        )
      : []),
  ]
    .filter(Boolean)
    .join(" ");

  try {
    return normalizeText(`${JSON.stringify(food)} ${extraTokens}`);
  } catch {
    return normalizeText(extraTokens);
  }
}

function matchesSearch(food: CatalogMenuItem, query: string): boolean {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return true;
  }

  const searchableText = buildGlobalSearchText(food);

  const tokens = normalizedQuery
    .split(" ")
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

function applyCustomerSearchFilters(
  foods: CatalogMenuItem[],
  req: CustomerSearchRequest,
  searchQuery: string,
  profile?: MemberProfile | null,
): CatalogMenuItem[] {
  const normalizedQuery = normalizeText(searchQuery);

  const filteredFoods = foods.filter((food) => {
    // 1. Search text
    if (normalizedQuery && !matchesSearch(food, normalizedQuery)) {
      return false;
    }

    // 2. Open Now
    if (req.openNow && food.store?.operatingStatus !== "OPEN") {
      return false;
    }

    // 3. Featured Only
    if (req.featuredOnly && !food.isFeatured) {
      return false;
    }

    // 4. Category
    if (req.categoryUuids && req.categoryUuids.length > 0) {
      const category = food.food?.category;
      const matchesCategory =
        category &&
        (req.categoryUuids.includes(category.code) ||
          req.categoryUuids.some(
            (u) =>
              normalizeText(u) === normalizeText(category.name) ||
              normalizeText(u) === normalizeText(category.code),
          ));
      if (!matchesCategory) return false;
    }

    // 5. Cuisine
    if (req.cuisineUuids && req.cuisineUuids.length > 0) {
      const cuisine = food.food?.cuisine;
      const matchesCuisine =
        cuisine &&
        (req.cuisineUuids.includes(cuisine.code) ||
          req.cuisineUuids.some(
            (u) =>
              normalizeText(u) === normalizeText(cuisine.name) ||
              normalizeText(u) === normalizeText(cuisine.code),
          ));
      if (!matchesCuisine) return false;
    }

    // 6. Meal Types
    if (req.mealTypeUuids && req.mealTypeUuids.length > 0) {
      const mealTypes = getMealTypes(food);
      const matchesMeal = mealTypes.some(
        (m) =>
          req.mealTypeUuids!.includes(m.code) ||
          req.mealTypeUuids!.some(
            (u) =>
              normalizeText(u) === normalizeText(m.name) ||
              normalizeText(u) === normalizeText(m.code),
          ),
      );
      if (!matchesMeal) return false;
    }

    // 7. Dietary Types
    if (req.dietaryTypeUuids && req.dietaryTypeUuids.length > 0) {
      const dietaryTypes = getDietaryTypes(food);
      const matchesDietary = dietaryTypes.some(
        (d) =>
          req.dietaryTypeUuids!.includes(d.code) ||
          req.dietaryTypeUuids!.some(
            (u) =>
              normalizeText(u) === normalizeText(d.name) ||
              normalizeText(u) === normalizeText(d.code),
          ),
      );
      if (!matchesDietary) return false;
    }

    // 8. Age Groups
    if (req.ageGroupUuids && req.ageGroupUuids.length > 0) {
      const ageGroups = getAgeGroups(food);
      const matchesAge = ageGroups.some((a) => {
        const aName = normalizeText(a.name);
        const aCode = normalizeText(a.code);
        return req.ageGroupUuids!.some((u) => {
          const normU = normalizeText(u);
          if (
            normU === aName ||
            normU === aCode ||
            (a.code && req.ageGroupUuids!.includes(a.code))
          ) {
            return true;
          }
          if (aName.includes(normU) || normU.includes(aName)) {
            return true;
          }
          if (
            (normU.includes("យុវវ័យ") || normU.includes("13-17")) &&
            (aName.includes("យុវវ័យ") || aCode.includes("youth"))
          ) {
            return true;
          }
          if (
            (normU.includes("កុមារតូច") || normU.includes("0-2")) &&
            (aName.includes("កុមារតូច") || aCode.includes("toddler"))
          ) {
            return true;
          }
          if (
            (normU.includes("កុមារ") || normU.includes("3-12")) &&
            (aName.includes("កុមារ") ||
              aCode.includes("child") ||
              aCode.includes("children")) &&
            !normU.includes("តូច") &&
            !aName.includes("តូច")
          ) {
            return true;
          }
          if (
            (normU.includes("ពេញវ័យ") || normU.includes("18-59")) &&
            (aName.includes("ពេញវ័យ") || aCode.includes("adult"))
          ) {
            return true;
          }
          if (
            (normU.includes("ចំណាស់") || normU.includes("60+")) &&
            (aName.includes("ចំណាស់") ||
              aCode.includes("senior") ||
              aCode.includes("elderly"))
          ) {
            return true;
          }
          return false;
        });
      });
      if (!matchesAge) return false;
    }

    // 9. Seasons
    if (req.seasonUuids && req.seasonUuids.length > 0) {
      const seasons = getSeasons(food);
      const matchesSeason = seasons.some(
        (s) =>
          req.seasonUuids!.includes(s.code) ||
          req.seasonUuids!.some(
            (u) =>
              normalizeText(u) === normalizeText(s.name) ||
              normalizeText(u) === normalizeText(s.code),
          ),
      );
      if (!matchesSeason) return false;
    }

    // 10. Events
    if (req.eventUuids && req.eventUuids.length > 0) {
      const events = getEvents(food);
      const matchesEvent = events.some(
        (e) =>
          req.eventUuids!.includes(e.code) ||
          req.eventUuids!.some(
            (u) =>
              normalizeText(u) === normalizeText(e.name) ||
              normalizeText(u) === normalizeText(e.code),
          ),
      );
      if (!matchesEvent) return false;
    }

    // 11. Weather
    if (req.weatherConditionUuids && req.weatherConditionUuids.length > 0) {
      const weather = getSuitableWeather(food);
      const matchesWeather = weather.some(
        (w) =>
          req.weatherConditionUuids!.includes(w.code) ||
          req.weatherConditionUuids!.some(
            (u) =>
              normalizeText(u) === normalizeText(w.name) ||
              normalizeText(u) === normalizeText(w.code),
          ),
      );
      if (!matchesWeather) return false;
    }

    // 12. Allergen Exclusions
    if (req.excludeAllergenUuids && req.excludeAllergenUuids.length > 0) {
      const allergens = getAllergens(food);
      const hasExcluded = allergens.some(
        (alg) =>
          req.excludeAllergenUuids!.includes(alg.code) ||
          req.excludeAllergenUuids!.some(
            (u) =>
              normalizeText(u) === normalizeText(alg.name) ||
              normalizeText(u) === normalizeText(alg.code),
          ),
      );
      if (hasExcluded) return false;
    }

    // 13. Price Range
    if (req.minimumPrice !== undefined && food.price < req.minimumPrice) {
      return false;
    }
    if (req.maximumPrice !== undefined && food.price > req.maximumPrice) {
      return false;
    }

    // 14. Spice Level
    if (
      req.minimumSpiceLevel !== undefined &&
      (food.food?.spiceLevel ?? 0) < req.minimumSpiceLevel
    ) {
      return false;
    }
    if (
      req.maximumSpiceLevel !== undefined &&
      (food.food?.spiceLevel ?? 0) > req.maximumSpiceLevel
    ) {
      return false;
    }

    // 15. Max Preparation Time
    if (
      req.maxPreparationTimeMinutes !== undefined &&
      (food.preparationTimeMinutes == null ||
        food.preparationTimeMinutes > req.maxPreparationTimeMinutes)
    ) {
      return false;
    }

    // 16. Availability Status
    if (
      req.availabilityStatuses &&
      req.availabilityStatuses.length > 0 &&
      !req.availabilityStatuses.includes(food.availabilityStatus)
    ) {
      return false;
    }

    // 17. Provinces
    if (
      req.provinces &&
      req.provinces.length > 0 &&
      (!food.origin?.provinceName ||
        !req.provinces.includes(food.origin.provinceName))
    ) {
      return false;
    }

    // 18. Cities
    if (
      req.cities &&
      req.cities.length > 0 &&
      (!food.store?.city || !req.cities.includes(food.store.city))
    ) {
      return false;
    }

    return true;
  });

  const profileSortedFoods = profile
    ? sortFoodsForProfile(filteredFoods, profile)
    : filteredFoods;

  return [...profileSortedFoods].sort((first, second) => {
    switch (req.sort) {
      case "PRICE_ASC":
        return first.price - second.price;

      case "PRICE_DESC":
        return second.price - first.price;

      case "DISTANCE_ASC":
        return (first.distanceKm ?? 0) - (second.distanceKm ?? 0);

      case "NEWEST":
      default: {
        if (profile) {
          const profileScoreDifference =
            getProfileFoodScore(second, profile) -
            getProfileFoodScore(first, profile);

          if (profileScoreDifference !== 0) {
            return profileScoreDifference;
          }
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
    <div className="border-t border-gray-100 dark:border-slate-800 py-4 first:border-t-0 first:pt-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 text-[18px] font-semibold text-primary-900 dark:text-slate-100">
          <span className="text-[20px] text-primary-700 dark:text-emerald-400">
            {icon}
          </span>

          {title}
        </span>

        <motion.span
          animate={{
            rotate: isOpen ? 180 : 0,
          }}
          transition={{
            duration: 0.2,
          }}
          className="text-gray-400 dark:text-slate-500"
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
              overflow: "hidden",
            }}
            animate={{
              height: "auto",
              opacity: 1,
              transitionEnd: {
                overflow: "visible",
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              overflow: "hidden",
            }}
            transition={{
              duration: 0.25,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CollapsibleList<T>({ items, limit = 6, renderItem, hideSearch = false }: { items: T[], limit?: number, renderItem: (item: T) => React.ReactNode, hideSearch?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(item => {
      let str = "";
      if (typeof item === 'string') {
        str = item;
      } else if (item && typeof item === 'object') {
        if ('name' in item) str = String(item.name);
        else if ('label' in item) str = String(item.label);
      }
      return str.toLowerCase().includes(q);
    });
  }, [items, query]);

  const visible = expanded || query ? filteredItems : filteredItems.slice(0, limit);
  const hiddenCount = filteredItems.length - limit;

  return (
    <div className="flex flex-col gap-3">
      {!hideSearch && items.length > limit && (
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/80">
          <IoSearchOutline className="text-[18px] text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ស្វែងរក..."
            className="w-full bg-transparent text-[14px] text-gray-700 outline-none placeholder:text-gray-400 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {visible.map(renderItem)}
        {!expanded && !query && hiddenCount > 0 && (
          <button type="button" onClick={() => setExpanded(true)} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 lg:px-4 lg:py-2 text-[14px] font-medium text-gray-500 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700">
            + {hiddenCount} ទៀត
          </button>
        )}
        {expanded && !query && hiddenCount > 0 && (
          <button type="button" onClick={() => setExpanded(false)} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 lg:px-4 lg:py-2 text-[14px] font-medium text-gray-500 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700">
            បង្រួម
          </button>
        )}
      </div>
    </div>
  );
}

function SortDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = [
    { value: "NEWEST", label: "ថ្មីបំផុត" },
    { value: "DISTANCE_ASC", label: "ចំងាយជិតបំផុត" },
    { value: "PRICE_ASC", label: "តម្លៃទាបទៅខ្ពស់" },
    { value: "PRICE_DESC", label: "តម្លៃខ្ពស់ទៅទាប" },
  ];

  const selectedOption = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[14px] font-medium text-gray-800 transition-colors hover:bg-gray-50 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
      >
        <span>{selectedOption.label}</span>
        <IoChevronDown
          className={`text-[16px] text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex flex-col py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2 text-left text-[14px] font-medium transition-colors ${value === option.value
                      ? "bg-primary-50 text-primary-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-700"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type PillOptionProps = {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
};

function PillOption({
  label,
  count,
  checked,
  onChange,
}: PillOptionProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 lg:px-4 lg:py-2 text-[14px] font-medium transition-colors border ${checked
          ? "bg-primary-800 text-white border-primary-800 dark:bg-emerald-600 dark:border-emerald-600 shadow-sm"
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
        }`}
    >
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className="opacity-70 text-[12px]">({count})</span>
      )}
      {checked && (
        <IoClose className="text-[12px] opacity-80 hover:opacity-100 transition-opacity" />
      )}
    </button>
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
            className={`rounded-full border px-3 py-2 text-[18px] transition ${isSelected
                ? "border-primary-800 bg-primary-800 text-white dark:bg-emerald-600 dark:border-emerald-600"
                : "border-gray-200 bg-white text-gray-600 hover:border-primary-500 hover:bg-primary-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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
  customerSearchRequest: CustomerSearchRequest;
  onSearchRequestChange: (req: CustomerSearchRequest) => void;
  mobile?: boolean;
  onClose?: () => void;
};

function FilterSidebar({
  customerSearchRequest,
  onSearchRequestChange,
  mobile = false,
  onClose,
}: FilterSidebarProps) {
  const { data: filterOptions } = useGetDiscoveryFiltersQuery();
  const { data: profileResponse } = useGetMemberProfilesQuery();

  const memberProfiles = Array.isArray(profileResponse)
    ? profileResponse
    : (profileResponse?.contents ?? []);

  const [collapsed, setCollapsed] = useState(false);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [categoryType, setCategoryType] = useState<CategoryFilterType>("ALL");

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    profile: true,
    sort: true,
    category: true,
    cuisine: false,
    mealType: false,
    dietary: false,
    allergens: false,
    price: true,
    storePrice: false,
    spice: false,
    preparation: false,
    ageGroup: false,
    season: false,
    event: false,
    weather: false,
    availability: false,
    province: false,
    city: false,
  });

  // Auto-expand age group section if ageGroup filter is active
  useEffect(() => {
    if (
      customerSearchRequest.ageGroupUuids &&
      customerSearchRequest.ageGroupUuids.length > 0
    ) {
      setOpenSections((previous) => ({
        ...previous,
        ageGroup: true,
      }));
    }
  }, [customerSearchRequest.ageGroupUuids]);

  const isCollapsed = mobile ? false : collapsed;

  const toggleSection = (key: string) => {
    setOpenSections((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const toggleArrayItem = (key: keyof CustomerSearchRequest, value: string) => {
    const currentArray = (customerSearchRequest[key] as string[]) || [];
    const exists = currentArray.includes(value);
    const updated = exists
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];

    onSearchRequestChange({
      ...customerSearchRequest,
      [key]: updated.length > 0 ? updated : undefined,
    });
  };

  const toggleNumberItem = (
    key: keyof CustomerSearchRequest,
    value: number,
  ) => {
    const currentArray = (customerSearchRequest[key] as number[]) || [];
    const exists = currentArray.includes(value);
    const updated = exists
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];

    onSearchRequestChange({
      ...customerSearchRequest,
      [key]: updated.length > 0 ? updated : undefined,
    });
  };

  const activeFilterCount =
    (customerSearchRequest.categoryUuids?.length || 0) +
    (customerSearchRequest.cuisineUuids?.length || 0) +
    (customerSearchRequest.mealTypeUuids?.length || 0) +
    (customerSearchRequest.ageGroupUuids?.length || 0) +
    (customerSearchRequest.seasonUuids?.length || 0) +
    (customerSearchRequest.eventUuids?.length || 0) +
    (customerSearchRequest.weatherConditionUuids?.length || 0) +
    (customerSearchRequest.dietaryTypeUuids?.length || 0) +
    (customerSearchRequest.excludeAllergenUuids?.length || 0) +
    (customerSearchRequest.storePriceLevels?.length || 0) +
    (customerSearchRequest.availabilityStatuses?.length || 0) +
    (customerSearchRequest.provinces?.length || 0) +
    (customerSearchRequest.cities?.length || 0) +
    (customerSearchRequest.featuredOnly ? 1 : 0) +
    (customerSearchRequest.openNow ? 1 : 0) +
    (customerSearchRequest.minimumPrice !== undefined ||
      customerSearchRequest.maximumPrice !== undefined
      ? 1
      : 0) +
    (customerSearchRequest.minimumSpiceLevel !== undefined ||
      customerSearchRequest.maximumSpiceLevel !== undefined
      ? 1
      : 0) +
    (customerSearchRequest.maxPreparationTimeMinutes !== undefined ? 1 : 0) +
    (customerSearchRequest.profileUuid ? 1 : 0);

  const categories = useMemo(() => {
    let list = filterOptions?.categories || [];
    if (categoryType === "FOOD") {
      list = list.filter((cat) => isFoodCategory(cat));
    } else if (categoryType === "DRINK") {
      list = list.filter((cat) => isDrinkCategory(cat));
    }
    if (categoryQuery.trim()) {
      const q = normalizeText(categoryQuery);
      list = list.filter((cat) => normalizeText(cat.name).includes(q));
    }
    return list;
  }, [filterOptions?.categories, categoryType, categoryQuery]);

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
        className={`flex h-full flex-col overflow-hidden bg-white dark:bg-slate-900 ${mobile
            ? ""
            : "rounded-[24px] border border-gray-100 dark:border-slate-800 shadow-sm"
          }`}
      >
        {/* Header */}
        <div
          className={`shrink-0 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 ${isCollapsed ? "p-3" : "p-5"
            }`}
        >
          <div
            className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"
              }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {!isCollapsed && (
                <motion.div
                  key="filter-heading"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                >
                  <div className="flex items-center gap-2">
                    <p className="text-[26px] font-semibold text-primary-900 dark:text-slate-100">
                      តម្រង
                    </p>

                    {activeFilterCount > 0 && (
                      <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-primary-800 dark:bg-emerald-600 px-2 text-[16px] font-semibold text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-[16px] leading-7 text-gray-400 dark:text-slate-400">
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
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50 dark:bg-slate-800 text-[26px] leading-none text-gray-500 dark:text-slate-300 transition hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                ×
              </button>
            ) : (
              <motion.button
                type="button"
                onClick={() => setCollapsed((previous) => !previous)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.9 }}
                aria-label={isCollapsed ? "Expand filters" : "Collapse filters"}
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-300 transition hover:bg-primary-50 dark:hover:bg-slate-700 hover:text-primary-700 dark:hover:text-emerald-400"
              >
                <motion.span animate={{ rotate: isCollapsed ? 180 : 0 }}>
                  <IoChevronBack className="text-[21px]" />
                </motion.span>
              </motion.button>
            )}
          </div>

          {!isCollapsed && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 dark:bg-slate-800/80 px-3 py-2.5">
              <p className="text-[16px] text-gray-500 dark:text-slate-300">
                {activeFilterCount} តម្រងបានជ្រើស
              </p>

              <button
                type="button"
                disabled={activeFilterCount === 0}
                onClick={() => onSearchRequestChange({ sort: "NEWEST" })}
                className="cursor-pointer text-[16px] font-medium text-secondary-500 dark:text-amber-400 transition hover:underline disabled:cursor-not-allowed disabled:opacity-40"
              >
                សម្អាតទាំងអស់
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Sections */}
        {!isCollapsed && (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-2 [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700">
            {/* PROFILE SAFETY EVALUATION (Hidden per request)
            {memberProfiles.length > 0 && (
              <FilterSection
                title="វាយតម្លៃសុវត្ថិភាពម្ហូប"
                icon={<IoNutritionOutline />}
                isOpen={openSections.profile}
                onToggle={() => toggleSection("profile")}
              >
                <p className="mb-2 text-[14px] text-gray-500 dark:text-slate-400">
                  ជ្រើសរើសប្រវត្តិរូបដើម្បីពិនិត្យអាលែហ្ស៊ី
                  និងធាតុផ្សំដែលហាមឃាត់៖
                </p>
                <CustomSelect
                  value={customerSearchRequest.profileUuid || ""}
                  onChange={(val) =>
                    onSearchRequestChange({
                      ...customerSearchRequest,
                      profileUuid: val || undefined,
                    })
                  }
                  options={[
                    { value: "", label: "-- មិនជ្រើសរើសប្រវត្តិរូប --" },
                    ...memberProfiles.map((p) => ({
                      value: p.uuid,
                      label: `${p.profileName || (p as any).name} ${p.relationship ? `(${p.relationship})` : ""}`,
                      icon: "👤",
                    })),
                  ]}
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-3 py-2 text-[15px] font-medium text-gray-800 dark:text-slate-100"
                />
              </FilterSection>
            )}
            */}

            {/* SORT BY */}
            <FilterSection
              title="តម្រៀបតាម"
              icon={<IoSwapVerticalOutline />}
              isOpen={openSections.sort}
              onToggle={() => toggleSection("sort")}
            >
              <SortDropdown
                value={customerSearchRequest.sort || "NEWEST"}
                onChange={(value) =>
                  onSearchRequestChange({
                    ...customerSearchRequest,
                    sort: value,
                  })
                }
              />
            </FilterSection>

            {/* OPEN NOW */}
            <div className="my-4 flex items-center justify-between rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 p-3">
              <span className="text-[16px] font-semibold text-gray-700 dark:text-slate-200">
                បើកដំណើរការឥឡូវនេះ
              </span>
              <input
                type="checkbox"
                checked={Boolean(customerSearchRequest.openNow)}
                onChange={(e) =>
                  onSearchRequestChange({
                    ...customerSearchRequest,
                    openNow: e.target.checked,
                  })
                }
                className="h-5 w-5 accent-primary-800 dark:accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            {/* CATEGORY */}
            {filterOptions?.categories &&
              filterOptions.categories.length > 0 && (
                <FilterSection
                  title="ប្រភេទម្ហូប និងភេសជ្ជៈ"
                  icon={<MdOutlineCategory />}
                  isOpen={openSections.category}
                  onToggle={() => toggleSection("category")}
                >
                  {/* Dynamic Type Selector (All / Food / Drink) */}
                  <div className="mb-3 flex items-center rounded-xl bg-gray-100 dark:bg-slate-800 p-1">
                    <button
                      type="button"
                      onClick={() => setCategoryType("ALL")}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${categoryType === "ALL"
                          ? "bg-white dark:bg-slate-700 text-primary-800 dark:text-white shadow-sm"
                          : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
                        }`}
                    >
                      ទាំងអស់
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryType("FOOD")}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${categoryType === "FOOD"
                          ? "bg-white dark:bg-slate-700 text-primary-800 dark:text-white shadow-sm"
                          : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
                        }`}
                    >
                      ម្ហូប
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryType("DRINK")}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${categoryType === "DRINK"
                          ? "bg-white dark:bg-slate-700 text-primary-800 dark:text-white shadow-sm"
                          : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
                        }`}
                    >
                      ភេសជ្ជៈ
                    </button>
                  </div>

                  {/* Keep Searchbox */}
                  <div className="mb-3 flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-3">
                    <IoSearchOutline className="shrink-0 text-[20px] text-gray-400 dark:text-slate-500" />
                    <input
                      value={categoryQuery}
                      onChange={(event) => setCategoryQuery(event.target.value)}
                      placeholder={
                        categoryType === "FOOD"
                          ? "ស្វែងរកប្រភេទម្ហូប"
                          : categoryType === "DRINK"
                            ? "ស្វែងរកប្រភេទភេសជ្ជៈ"
                            : "ស្វែងរកប្រភេទម្ហូប ឬភេសជ្ជៈ"
                      }
                      className="w-full bg-transparent text-[16px] text-gray-600 dark:text-slate-200 outline-none placeholder:text-gray-400 dark:placeholder:text-slate-500"
                    />
                  </div>

                  {categories.length > 0 ? (
                    <CollapsibleList
                      hideSearch={true}
                      items={categories}
                      renderItem={(cat) => (
                        <PillOption
                          key={cat.uuid}
                          label={cat.name}
                          checked={Boolean(
                            customerSearchRequest.categoryUuids?.includes(
                              cat.uuid,
                            ),
                          )}
                          onChange={() =>
                            toggleArrayItem("categoryUuids", cat.uuid)
                          }
                        />
                      )}
                    />
                  ) : (
                    <p className="py-2 text-center text-xs text-gray-400 dark:text-slate-500">
                      រកមិនឃើញប្រភេទដែលត្រូវគ្នា
                    </p>
                  )}
                </FilterSection>
              )}

            {/* CUISINE */}
            {filterOptions?.cuisines && filterOptions.cuisines.length > 0 && (
              <FilterSection
                title="ម្ហូបតាមតំបន់"
                icon={<MdOutlineCategory />}
                isOpen={openSections.cuisine}
                onToggle={() => toggleSection("cuisine")}
              >
                <CollapsibleList
                  items={filterOptions.cuisines}
                  renderItem={(c) => (
                    <PillOption
                      key={c.uuid}
                      label={c.name}
                      checked={Boolean(
                        customerSearchRequest.cuisineUuids?.includes(c.uuid),
                      )}
                      onChange={() => toggleArrayItem("cuisineUuids", c.uuid)}
                    />
                  )}
                />
              </FilterSection>
            )}

            {/* DIETARY TYPES */}
            {filterOptions?.dietaryTypes &&
              filterOptions.dietaryTypes.length > 0 && (
                <FilterSection
                  title="របបអាហារ"
                  icon={<IoNutritionOutline />}
                  isOpen={openSections.dietary}
                  onToggle={() => toggleSection("dietary")}
                >
                  <CollapsibleList
                    items={filterOptions.dietaryTypes}
                    renderItem={(d) => (
                      <PillOption
                        key={d.uuid}
                        label={d.name}
                        checked={Boolean(
                          customerSearchRequest.dietaryTypeUuids?.includes(
                            d.uuid,
                          ),
                        )}
                        onChange={() =>
                          toggleArrayItem("dietaryTypeUuids", d.uuid)
                        }
                      />
                    )}
                  />
                </FilterSection>
              )}

            {/* ALLERGEN EXCLUSIONS */}
            {filterOptions?.allergens && filterOptions.allergens.length > 0 && (
              <FilterSection
                title="ជៀសវាងអាលែហ្ស៊ី"
                icon={<IoNutritionOutline />}
                isOpen={openSections.allergens}
                onToggle={() => toggleSection("allergens")}
              >
                <p className="mb-2 text-[14px] text-orange-600 dark:text-orange-400">
                  មុខម្ហូបដែលមានធាតុផ្សំអាឡែស៊ីដែលបានជ្រើសរើសនឹងត្រូវដកចេញ។
                </p>
                <CollapsibleList
                  items={filterOptions.allergens}
                  renderItem={(alg) => (
                    <PillOption
                      key={alg.uuid}
                      label={`គ្មាន ${alg.name}`}
                      checked={Boolean(
                        customerSearchRequest.excludeAllergenUuids?.includes(
                          alg.uuid,
                        ),
                      )}
                      onChange={() =>
                        toggleArrayItem("excludeAllergenUuids", alg.uuid)
                      }
                    />
                  )}
                />
              </FilterSection>
            )}

            {/* PRICE RANGE */}
            <FilterSection
              title="កម្រិតតម្លៃ"
              icon={<IoPricetagOutline />}
              isOpen={openSections.price}
              onToggle={() => toggleSection("price")}
            >
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="អប្បបរមា ($)"
                  value={customerSearchRequest.minimumPrice ?? ""}
                  onChange={(e) =>
                    onSearchRequestChange({
                      ...customerSearchRequest,
                      minimumPrice: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-3 py-2 text-[15px] text-gray-700 dark:text-slate-200 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="អតិបរមា ($)"
                  value={customerSearchRequest.maximumPrice ?? ""}
                  onChange={(e) =>
                    onSearchRequestChange({
                      ...customerSearchRequest,
                      maximumPrice: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-3 py-2 text-[15px] text-gray-700 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </FilterSection>

            {/* SPICE LEVEL */}
            <FilterSection
              title="កម្រិតហឹរ"
              icon={<FaFire />}
              isOpen={openSections.spice}
              onToggle={() => toggleSection("spice")}
            >
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "ទាំងអស់", min: undefined, max: undefined },
                  { label: "មិនហឹរ (0)", min: 0, max: 0 },
                  { label: "ហឹរតិច (1-2)", min: 1, max: 2 },
                  { label: "ហឹរខ្លាំង (3+)", min: 3, max: 5 },
                ].map((spice, idx) => {
                  const isSelected =
                    customerSearchRequest.minimumSpiceLevel === spice.min &&
                    customerSearchRequest.maximumSpiceLevel === spice.max;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        onSearchRequestChange({
                          ...customerSearchRequest,
                          minimumSpiceLevel: spice.min,
                          maximumSpiceLevel: spice.max,
                        })
                      }
                      className={`p-2 rounded-xl text-[14px] font-semibold border transition text-center ${isSelected
                          ? "bg-primary-800 dark:bg-emerald-600 text-white border-primary-800 dark:border-emerald-600"
                          : "bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700"
                        }`}
                    >
                      {spice.label}
                    </button>
                  );
                })}
              </div>
            </FilterSection>

            {/* PREPARATION TIME */}
            <FilterSection
              title="ពេលរៀបចំ"
              icon={<IoTimeOutline />}
              isOpen={openSections.preparation}
              onToggle={() => toggleSection("preparation")}
            >
              <div className="flex gap-2">
                {[
                  { label: "15 នាទី", val: 15 },
                  { label: "30 នាទី", val: 30 },
                  { label: "45 នាទី", val: 45 },
                ].map((pt) => (
                  <button
                    key={pt.val}
                    type="button"
                    onClick={() =>
                      onSearchRequestChange({
                        ...customerSearchRequest,
                        maxPreparationTimeMinutes:
                          customerSearchRequest.maxPreparationTimeMinutes ===
                            pt.val
                            ? undefined
                            : pt.val,
                      })
                    }
                    className={`flex-1 p-2 rounded-xl text-[14px] font-semibold border transition text-center ${customerSearchRequest.maxPreparationTimeMinutes === pt.val
                        ? "bg-primary-800 dark:bg-emerald-600 text-white border-primary-800 dark:border-emerald-600"
                        : "bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700"
                      }`}
                  >
                    ⏱️ {pt.label}
                  </button>
                ))}
              </div>
            </FilterSection>

            {/* MEAL TYPES */}
            {filterOptions?.mealTypes && filterOptions.mealTypes.length > 0 && (
              <FilterSection
                title="ពេលវេលាអាហារ"
                icon={<IoTimeOutline />}
                isOpen={openSections.mealType}
                onToggle={() => toggleSection("mealType")}
              >
                <CollapsibleList
                  items={filterOptions.mealTypes}
                  renderItem={(m) => (
                    <PillOption
                      key={m.uuid}
                      label={m.name}
                      checked={Boolean(
                        customerSearchRequest.mealTypeUuids?.includes(m.uuid),
                      )}
                      onChange={() => toggleArrayItem("mealTypeUuids", m.uuid)}
                    />
                  )}
                />
              </FilterSection>
            )}

            {/* AGE GROUPS */}
            {filterOptions?.ageGroups && filterOptions.ageGroups.length > 0 && (
              <FilterSection
                title="ក្រុមអាយុ"
                icon={<IoNutritionOutline />}
                isOpen={openSections.ageGroup}
                onToggle={() => toggleSection("ageGroup")}
              >
                <CollapsibleList
                  items={filterOptions.ageGroups}
                  renderItem={(a) => {
                    const isChecked = Boolean(
                      customerSearchRequest.ageGroupUuids?.includes(a.uuid) ||
                      customerSearchRequest.ageGroupUuids?.includes(a.code) ||
                      customerSearchRequest.ageGroupUuids?.includes(a.name) ||
                      customerSearchRequest.ageGroupUuids?.some((u) => {
                        const normU = normalizeText(u);
                        const aName = normalizeText(a.name);
                        const aCode = normalizeText(a.code);
                        return (
                          normU === aName ||
                          normU === aCode ||
                          (normU.includes("យុវវ័យ") &&
                            (aName.includes("យុវវ័យ") ||
                              aCode.includes("youth"))) ||
                          (normU.includes("កុមារតូច") &&
                            (aName.includes("កុមារតូច") ||
                              aCode.includes("toddler"))) ||
                          (normU.includes("កុមារ") &&
                            (aName.includes("កុមារ") ||
                              aCode.includes("child")) &&
                            !normU.includes("តូច") &&
                            !aName.includes("តូច")) ||
                          (normU.includes("ពេញវ័យ") &&
                            (aName.includes("ពេញវ័យ") ||
                              aCode.includes("adult"))) ||
                          (normU.includes("ចំណាស់") &&
                            (aName.includes("ចំណាស់") ||
                              aCode.includes("senior")))
                        );
                      }),
                    );

                    return (
                      <PillOption
                        key={a.uuid}
                        label={formatAgeGroupOptionLabel(a)}
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            // Uncheck: remove all representations of this group
                            const current =
                              customerSearchRequest.ageGroupUuids || [];
                            const updated = current.filter(
                              (u) =>
                                u !== a.uuid &&
                                u !== a.code &&
                                u !== a.name &&
                                !normalizeText(u).includes(
                                  normalizeText(a.name),
                                ) &&
                                !normalizeText(a.name).includes(
                                  normalizeText(u),
                                ),
                            );
                            onSearchRequestChange({
                              ...customerSearchRequest,
                              ageGroupUuids:
                                updated.length > 0 ? updated : undefined,
                            });
                          } else {
                            toggleArrayItem("ageGroupUuids", a.uuid);
                          }
                        }}
                      />
                    );
                  }}
                />
              </FilterSection>
            )}

            {/* SEASONS */}
            {filterOptions?.seasons && filterOptions.seasons.length > 0 && (
              <FilterSection
                title="រដូវកាល"
                icon={<MdOutlineCategory />}
                isOpen={openSections.season}
                onToggle={() => toggleSection("season")}
              >
                <CollapsibleList
                  items={filterOptions.seasons}
                  renderItem={(s) => (
                    <PillOption
                      key={s.uuid}
                      label={s.name}
                      checked={Boolean(
                        customerSearchRequest.seasonUuids?.includes(s.uuid),
                      )}
                      onChange={() => toggleArrayItem("seasonUuids", s.uuid)}
                    />
                  )}
                />
              </FilterSection>
            )}

            {/* EVENTS */}
            {filterOptions?.events && filterOptions.events.length > 0 && (
              <FilterSection
                title="ព្រឹត្តិការណ៍"
                icon={<MdOutlineCategory />}
                isOpen={openSections.event}
                onToggle={() => toggleSection("event")}
              >
                <CollapsibleList
                  items={filterOptions.events}
                  renderItem={(ev) => (
                    <PillOption
                      key={ev.uuid}
                      label={ev.name}
                      checked={Boolean(
                        customerSearchRequest.eventUuids?.includes(ev.uuid),
                      )}
                      onChange={() => toggleArrayItem("eventUuids", ev.uuid)}
                    />
                  )}
                />
              </FilterSection>
            )}

            {/* SUITABLE WEATHER */}
            {filterOptions?.suitableWeather &&
              filterOptions.suitableWeather.length > 0 && (
                <FilterSection
                  title="អាកាសធាតុសមស្រប"
                  icon={<MdOutlineCategory />}
                  isOpen={openSections.weather}
                  onToggle={() => toggleSection("weather")}
                >
                  <CollapsibleList
                    items={filterOptions.suitableWeather}
                    renderItem={(w) => (
                      <PillOption
                        key={w.uuid}
                        label={w.name}
                        checked={Boolean(
                          customerSearchRequest.weatherConditionUuids?.includes(
                            w.uuid,
                          ),
                        )}
                        onChange={() =>
                          toggleArrayItem("weatherConditionUuids", w.uuid)
                        }
                      />
                    )}
                  />
                </FilterSection>
              )}

            {/* STORE PRICE LEVEL */}
            {filterOptions?.storePriceLevels &&
              filterOptions.storePriceLevels.length > 0 && (
                <FilterSection
                  title="កម្រិតតម្លៃហាង"
                  icon={<IoPricetagOutline />}
                  isOpen={openSections.storePrice}
                  onToggle={() => toggleSection("storePrice")}
                >
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.storePriceLevels.map((level) => {
                      const selected =
                        customerSearchRequest.storePriceLevels?.includes(level);
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() =>
                            toggleNumberItem("storePriceLevels", level)
                          }
                          className={`rounded-full border px-4 py-2 text-[15px] font-semibold transition ${selected
                              ? "border-primary-800 bg-primary-800 text-white"
                              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                          {"$".repeat(level)}
                        </button>
                      );
                    })}
                  </div>
                </FilterSection>
              )}

            {/* AVAILABILITY */}
            {filterOptions?.availabilityStatuses &&
              filterOptions.availabilityStatuses.length > 0 && (
                <FilterSection
                  title="ស្ថានភាពលក់"
                  icon={<MdOutlineCategory />}
                  isOpen={openSections.availability}
                  onToggle={() => toggleSection("availability")}
                >
                  <CollapsibleList
                    items={filterOptions.availabilityStatuses}
                    renderItem={(status) => (
                      <PillOption
                        key={status}
                        label={AVAILABILITY_LABELS[status] ?? status}
                        checked={Boolean(
                          customerSearchRequest.availabilityStatuses?.includes(
                            status,
                          ),
                        )}
                        onChange={() =>
                          toggleArrayItem("availabilityStatuses", status)
                        }
                      />
                    )}
                  />
                </FilterSection>
              )}

            {/* FEATURED ONLY */}
            <div className="my-4 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3">
              <span className="text-[16px] font-semibold text-gray-700">
                តែមុខម្ហូបពិសេស
              </span>
              <input
                type="checkbox"
                checked={Boolean(customerSearchRequest.featuredOnly)}
                onChange={(e) =>
                  onSearchRequestChange({
                    ...customerSearchRequest,
                    featuredOnly: e.target.checked || undefined,
                  })
                }
                className="h-5 w-5 accent-primary-800 rounded cursor-pointer"
              />
            </div>

            {/* PROVINCES */}
            {filterOptions?.provinces && filterOptions.provinces.length > 0 && (
              <FilterSection
                title="ខេត្ត"
                icon={<MdOutlineCategory />}
                isOpen={openSections.province}
                onToggle={() => toggleSection("province")}
              >
                <CollapsibleList
                  items={filterOptions.provinces}
                  renderItem={(prov) => (
                    <PillOption
                      key={prov}
                      label={prov}
                      checked={Boolean(
                        customerSearchRequest.provinces?.includes(prov),
                      )}
                      onChange={() => toggleArrayItem("provinces", prov)}
                    />
                  )}
                />
              </FilterSection>
            )}

            {/* CITIES */}
            {filterOptions?.cities && filterOptions.cities.length > 0 && (
              <FilterSection
                title="ទីក្រុង"
                icon={<MdOutlineCategory />}
                isOpen={openSections.city}
                onToggle={() => toggleSection("city")}
              >
                <CollapsibleList
                  items={filterOptions.cities}
                  renderItem={(city) => (
                    <PillOption
                      key={city}
                      label={city}
                      checked={Boolean(
                        customerSearchRequest.cities?.includes(city),
                      )}
                      onChange={() => toggleArrayItem("cities", city)}
                    />
                  )}
                />
              </FilterSection>
            )}
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [options]);

  return (
    <div className="relative group flex items-center">
      {/* Fade left */}
      <AnimatePresence>
        {canScrollLeft && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute left-0 top-0 bottom-2 w-16 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10"
          />
        )}
      </AnimatePresence>

      <div
        ref={containerRef}
        onScroll={checkScroll}
        className="scrollbar-hide flex gap-3 overflow-x-auto pb-2 relative z-0 w-full"
      >
        <button
          type="button"
          onClick={() => onChange([])}
          className={`shrink-0 rounded-full border px-4 py-1.5 text-[14px] md:px-5 md:py-2.5 md:text-[16px] font-semibold transition ${allSelected
              ? "border-primary-800 bg-primary-800 text-white dark:bg-emerald-600 dark:border-emerald-600"
              : "border-gray-200 bg-white text-gray-600 hover:border-primary-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700"
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
              className={`shrink-0 rounded-full border px-4 py-1.5 text-[14px] md:px-5 md:py-2.5 md:text-[16px] font-semibold transition ${isSelected
                  ? "border-primary-800 bg-primary-800 text-white dark:bg-emerald-600 dark:border-emerald-600"
                  : "border-gray-200 bg-white text-gray-600 hover:border-primary-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700"
                }`}
            >
              {option.name}

              {option.count > 0 && (
                <span className="ml-2 opacity-70">{option.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Fade right */}
      <AnimatePresence>
        {canScrollRight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   FOOD GRID
========================================================= */

type FoodGridProps = {
  foods: CatalogMenuItem[];
  isLoading?: boolean;
};

function FoodGrid({ foods, isLoading }: FoodGridProps) {
  if (isLoading && foods.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 w-full">
        {Array.from({ length: 9 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col w-full gap-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm rounded-[24px] p-2.5 animate-pulse"
          >
            <div className="rounded-[14px] w-full h-[150px] md:h-37.5 lg:h-46.25 bg-gray-200 dark:bg-gray-700" />
            <div className="flex flex-col gap-2 px-1 pb-2">
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
              <div className="flex justify-between items-center mt-2">
                <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-6 w-1/5 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

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
        className="flex min-h-[850px] lg:min-h-[900px] flex-col items-center justify-center rounded-[24px] border border-dashed border-gray-200 bg-white px-5 py-16 text-center"
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
      className={`grid grid-cols-2 gap-3 sm:gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 w-full min-h-[850px] lg:min-h-[900px] content-start transition-opacity duration-300 ${isLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}
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

function FoodPageContent() {
  const searchParams = useSearchParams();
  const rawAgeParam =
    searchParams.get("ageGroups") ||
    searchParams.get("ageGroup") ||
    searchParams.get("age") ||
    "";
  const rawQueryParam =
    searchParams.get("query") ||
    searchParams.get("q") ||
    searchParams.get("search") ||
    "";

  const [searchInput, setSearchInput] = useState(rawQueryParam);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isApiFilterSheetOpen, setIsApiFilterSheetOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [customerSearchRequest, setCustomerSearchRequest] =
    useState<CustomerSearchRequest>({
      sort: "NEWEST",
    });

  const [
    executeDiscoverySearch,
    { data: discoveryResult, isLoading: isDiscoveryLoading },
  ] = useDiscoverySearchMutation();

  const { data: discoveryFilterOptions } = useGetDiscoveryFiltersQuery();

  // Synchronize URL age group search params with customerSearchRequest and filters
  useEffect(() => {
    if (!rawAgeParam) return;
    const decoded = decodeURIComponent(rawAgeParam).trim();
    if (!decoded) return;

    if (
      discoveryFilterOptions?.ageGroups &&
      discoveryFilterOptions.ageGroups.length > 0
    ) {
      const matched = findMatchingAgeGroup(
        decoded,
        discoveryFilterOptions.ageGroups,
      );
      if (matched) {
        setCustomerSearchRequest((prev) => {
          if (prev.ageGroupUuids?.includes(matched.uuid)) return prev;
          return {
            ...prev,
            ageGroupUuids: [matched.uuid],
          };
        });
        setFilters((prev) => ({
          ...prev,
          ageGroupCodes: [matched.code || matched.name],
        }));
        return;
      }
    }

    // Fallback: set the decoded query value directly
    setCustomerSearchRequest((prev) => {
      if (prev.ageGroupUuids?.includes(decoded)) return prev;
      return {
        ...prev,
        ageGroupUuids: [decoded],
      };
    });
    setFilters((prev) => ({
      ...prev,
      ageGroupCodes: [decoded],
    }));
  }, [rawAgeParam, discoveryFilterOptions?.ageGroups]);

  // Synchronize search query param if provided
  useEffect(() => {
    if (rawQueryParam && rawQueryParam !== searchInput) {
      setSearchInput(rawQueryParam);
    }
  }, [rawQueryParam]);

  useEffect(() => {
    executeDiscoverySearch({
      page: 0,
      size: 50,
      sort: customerSearchRequest.sort || "NEWEST",
      request: {
        ...customerSearchRequest,
        query: searchInput.trim() || undefined,
      },
    });
    // Reset page to 1 when filters or search change
    setCurrentPage(1);
  }, [customerSearchRequest, searchInput, executeDiscoverySearch]);

  const discoveryItems = useMemo<MenuItemDiscoveryResponse[]>(() => {
    if (!discoveryResult) return [];
    if (Array.isArray(discoveryResult)) {
      return discoveryResult as MenuItemDiscoveryResponse[];
    }
    const record = discoveryResult as unknown as Record<string, unknown>;
    const container =
      (record.payload as Record<string, unknown> | undefined) ?? record;
    // Backend page envelope uses `contents` (plural); tolerate content/items too.
    const list =
      (Array.isArray(container.contents) && container.contents) ||
      (Array.isArray(container.content) && container.content) ||
      (Array.isArray(container.items) && container.items) ||
      [];
    return list as MenuItemDiscoveryResponse[];
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

  const memberProfiles: MemberProfile[] = useMemo(
    () =>
      Array.isArray(profileResponse)
        ? profileResponse
        : (profileResponse?.contents ?? []),
    [profileResponse],
  );

  const selectedProfile: MemberProfile | null = useMemo(() => {
    if (customerSearchRequest.profileUuid) {
      return (
        memberProfiles.find(
          (p: MemberProfile) => p.uuid === customerSearchRequest.profileUuid,
        ) ?? null
      );
    }
    return memberProfiles.find((p: MemberProfile) => p.isDefault) ?? null;
  }, [customerSearchRequest.profileUuid, memberProfiles]);

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

  function cleanKhmerLabel(label: string): string {
    if (!label) return "";
    return label.replace(/\s*\([A-Za-z0-9\s&,/-]+\)/g, "").trim();
  }

  const categoryOptions = useMemo(
    () =>
      getUniqueOptions(
        menuItems.flatMap((item) => {
          const category = item.food?.category;

          if (!category) return [];

          const rawName =
            category.code === "FOOD" || category.name === "Food"
              ? "អាហារ"
              : category.name;

          return [
            {
              code: category.code,
              name: cleanKhmerLabel(rawName),
            },
          ];
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
    () =>
      applyCustomerSearchFilters(
        menuItems,
        customerSearchRequest,
        searchInput,
        selectedProfile,
      ),
    [menuItems, customerSearchRequest, searchInput, selectedProfile],
  );

  const apiCatalogFoods = useMemo(() => {
    if (discoveryItems.length > 0) {
      return discoveryItems.map((item) => {
        const matchingCatalogItem = menuItems.find(
          (m) => m.uuid === item.menuItemUuid,
        );

        const thumbnail =
          item.imageUrl ||
          matchingCatalogItem?.thumbnail ||
          (matchingCatalogItem?.gallery && matchingCatalogItem.gallery[0]) ||
          (item.menuItemUuid
            ? `/api/v1/catalog/menu-items/${item.menuItemUuid}/images/1`
            : null);

        const catalogItem: CatalogMenuItem & {
          safetyStatus?: SafetyStatusType;
          safetyReasonCodes?: string[];
        } = {
          uuid: item.menuItemUuid,
          legacyId: matchingCatalogItem?.legacyId ?? 0,
          name: item.name || matchingCatalogItem?.name || "",
          localName:
            item.food?.localName || matchingCatalogItem?.localName || item.name,
          description:
            item.description || matchingCatalogItem?.description || null,
          localDescription: matchingCatalogItem?.localDescription || null,
          thumbnail: thumbnail || null,
          gallery: matchingCatalogItem?.gallery?.length
            ? matchingCatalogItem.gallery
            : thumbnail
              ? [thumbnail]
              : [],
          price: item.price ?? matchingCatalogItem?.price ?? 0,
          currencyCode:
            item.currencyCode || matchingCatalogItem?.currencyCode || "USD",
          preparationTimeMinutes:
            matchingCatalogItem?.preparationTimeMinutes ??
            item.food?.defaultSpiceLevel ??
            null,
          availabilityStatus:
            (item.availabilityStatus as any) ||
            matchingCatalogItem?.availabilityStatus ||
            "AVAILABLE",
          isFeatured: matchingCatalogItem?.isFeatured ?? false,
          source: "DISCOVERY",
          store: matchingCatalogItem?.store || {
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
          distanceKm: item.distanceMeters
            ? item.distanceMeters / 1000
            : (matchingCatalogItem?.distanceKm ?? null),
          food: matchingCatalogItem?.food || {
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
          allergenDeclarations: matchingCatalogItem?.allergenDeclarations || [],
          ingredients: matchingCatalogItem?.ingredients || [],
          beveragePairings: matchingCatalogItem?.beveragePairings || [],
          nutrition: matchingCatalogItem?.nutrition || {
            calories: 0,
            fatGrams: 0,
            carbsGrams: 0,
            proteinGrams: 0,
          },
          recommendation: matchingCatalogItem?.recommendation || null,
          createdAt: matchingCatalogItem?.createdAt || new Date().toISOString(),
          updatedAt: matchingCatalogItem?.updatedAt || new Date().toISOString(),
          origin: matchingCatalogItem?.origin || {
            countryCode: "KH",
            countryName: "Cambodia",
            countryLocalName: "កម្ពុជា",
            provinceCode: null,
            provinceName: null,
            provinceLocalName: null,
            isTraditional: false,
          },
          filterOption: matchingCatalogItem?.filterOption || {
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
  }, [discoveryItems, menuItems]);

  const apiCategoryOptions: FilterOption[] = useMemo(() => {
    if (
      discoveryFilterOptions?.categories &&
      discoveryFilterOptions.categories.length > 0
    ) {
      return discoveryFilterOptions.categories.map((category) => ({
        code: category.uuid,
        name: cleanKhmerLabel(category.name),
        count: 0,
      }));
    }
    return categoryOptions;
  }, [discoveryFilterOptions, categoryOptions]);

  // Display foods with real-time global search and filters over full catalog menuItems.
  const displayFoods =
    menuItems.length > 0
      ? filteredFoods
      : apiCatalogFoods.length > 0
        ? apiCatalogFoods
        : filteredFoods;

  const PAGE_SIZE = 9;
  const totalPages = Math.ceil(displayFoods.length / PAGE_SIZE);
  const paginatedFoods = displayFoods.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const activeFilterCount =
    (customerSearchRequest.categoryUuids?.length || 0) +
    (customerSearchRequest.cuisineUuids?.length || 0) +
    (customerSearchRequest.mealTypeUuids?.length || 0) +
    (customerSearchRequest.ageGroupUuids?.length || 0) +
    (customerSearchRequest.seasonUuids?.length || 0) +
    (customerSearchRequest.eventUuids?.length || 0) +
    (customerSearchRequest.weatherConditionUuids?.length || 0) +
    (customerSearchRequest.dietaryTypeUuids?.length || 0) +
    (customerSearchRequest.excludeAllergenUuids?.length || 0) +
    (customerSearchRequest.storePriceLevels?.length || 0) +
    (customerSearchRequest.availabilityStatuses?.length || 0) +
    (customerSearchRequest.provinces?.length || 0) +
    (customerSearchRequest.cities?.length || 0) +
    (customerSearchRequest.featuredOnly ? 1 : 0) +
    (customerSearchRequest.minimumStoreRating !== undefined ? 1 : 0) +
    (customerSearchRequest.openNow ? 1 : 0) +
    (customerSearchRequest.minimumPrice !== undefined ||
      customerSearchRequest.maximumPrice !== undefined
      ? 1
      : 0) +
    (customerSearchRequest.minimumSpiceLevel !== undefined ||
      customerSearchRequest.maximumSpiceLevel !== undefined
      ? 1
      : 0) +
    (customerSearchRequest.maxPreparationTimeMinutes !== undefined ? 1 : 0) +
    (customerSearchRequest.profileUuid ? 1 : 0);

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
    <div className="relative flex min-h-[56px] w-full flex-1 items-center gap-3 rounded-2xl lg:rounded-full border border-gray-200/80 bg-white px-4 shadow-sm transition-all focus-within:border-primary-700 focus-within:ring-2 focus-within:ring-primary-700/20 dark:border-slate-800 dark:bg-slate-900">
      <IoSearchOutline className="shrink-0 text-[22px] text-primary-700 dark:text-emerald-400" />
      <input
        type="search"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="ស្វែងរកមុខម្ហូប ឈ្មោះ កូដ ប្រភេទ ហាង..."
        className="w-full bg-transparent text-[16px] text-gray-800 placeholder-gray-400 focus:outline-none dark:text-slate-100 dark:placeholder-gray-500"
      />
      {searchInput && (
        <button
          type="button"
          onClick={() => setSearchInput("")}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition"
          aria-label="សម្អាតការស្វែងរក"
        >
          <IoClose className="text-[16px]" />
        </button>
      )}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("open-global-search"))}
        className="hidden sm:inline-flex items-center rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-400 dark:hover:bg-slate-700 transition"
        title="បើកផ្ទាំងស្វែងរកសកល (Global Search)"
      >
        ⌘K
      </button>
    </div>
  );

  /* =======================================================
     RENDER
  ======================================================= */

  // Loading state is now handled by FoodGrid instead of an early return

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

      <section className="lg:rounded-full lg:border lg:border-gray-100 dark:lg:border-slate-800 lg:bg-white dark:lg:bg-slate-900 lg:p-1 lg:shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {renderSearch()}

          {/* Mobile / tablet Action Buttons */}
          <div className="flex w-full items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white py-3.5 px-4 text-[16px] font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900 dark:text-gray-300"
              aria-label="Sort options"
            >
              <IoSwapVerticalOutline className="text-[20px] text-primary-700 dark:text-emerald-400" />
              <span>តម្រៀប</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white py-3.5 px-4 text-[16px] font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900 dark:text-gray-300"
              aria-label="Filter options"
            >
              <IoGridOutline className="text-[20px] text-primary-700 dark:text-emerald-400" />
              <span>តម្រង</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center justify-between gap-3 rounded-full bg-primary-50 dark:bg-slate-800 border border-primary-100/60 dark:border-slate-700 px-5 py-3">
            <FaStar className="text-[20px] text-yellow-500" />

            <p className="text-[16px] text-primary-800 dark:text-emerald-400">
              រកឃើញ
              <span className="font-semibold px-1">{displayFoods.length}</span>
              មុខម្ហូប
            </p>
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setCustomerSearchRequest({ sort: "NEWEST" });
                setFilters(DEFAULT_FILTERS);
              }}
              className="rounded-full border border-secondary-200 dark:border-slate-700 px-5 py-3 text-[16px] font-semibold text-secondary-500 dark:text-amber-400 transition hover:bg-secondary-50 dark:hover:bg-slate-800"
            >
              សម្អាតតម្រង {activeFilterCount}
            </button>
          )}
        </div>
      </section>

      <div className="mt-6 flex gap-8">
        <FilterSidebar
          customerSearchRequest={customerSearchRequest}
          onSearchRequestChange={setCustomerSearchRequest}
        />

        <main className="min-w-0 flex-1">
          <CategoryTabs
            options={apiCategoryOptions}
            selectedCodes={customerSearchRequest.categoryUuids ?? []}
            onChange={(categoryUuids) =>
              setCustomerSearchRequest((current) => ({
                ...current,
                categoryUuids: categoryUuids.length ? categoryUuids : undefined,
              }))
            }
          />

          {/* ALL FOODS */}

          <section className="mt-6">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="mt-1 text-[26px] font-bold text-primary-900 dark:text-[#22a447]">
                  ស្វែងរកជម្រើសដែលអ្នកចូលចិត្ត
                </h1>
              </div>

              <p className="text-[16px] text-gray-500 dark:text-gray-50">
                បង្ហាញ {displayFoods.length} មុខម្ហូប
              </p>
            </div>

            <FoodGrid foods={paginatedFoods} isLoading={(isLoading && menuItems.length === 0) || isDiscoveryLoading} />

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 400, behavior: "smooth" });
                  }}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <IoChevronBack /> មុន
                </button>
                
                <div className="flex items-center justify-center rounded-full bg-gray-50 px-5 py-2.5 text-[14px] font-medium text-gray-600 dark:bg-slate-800 dark:text-slate-300">
                  ទំព័រ {currentPage} នៃ {totalPages}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 400, behavior: "smooth" });
                  }}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  បន្ទាប់ <IoChevronBack className="rotate-180" />
                </button>
              </div>
            )}
          </section>

          <section className="mt-14 overflow-hidden rounded-[28px] bg-gradient-to-br from-primary-900 to-primary-800 px-6 py-12 text-center text-white">
            <h2 className="text-[28px] font-semibold md:text-[36px]">
              បទពិសោធន៍ថ្មីក្នុងការស្វែងរកអាហារ
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-[16px]  lg:text-xl leading-8 text-white/80">
              ស្វែងរកមុខម្ហូបដែលសមនឹងចំណូលចិត្ត តម្លៃ ពេលរៀបចំ ប្រភេទម្ហូប
              និងហាងដែលអ្នកចូលចិត្ត។
            </p>
          </section>
        </main>
      </div>

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
                customerSearchRequest={customerSearchRequest}
                onSearchRequestChange={setCustomerSearchRequest}
                onClose={() => setMobileFiltersOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function FoodPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <FoodPageContent />
    </Suspense>
  );
}
