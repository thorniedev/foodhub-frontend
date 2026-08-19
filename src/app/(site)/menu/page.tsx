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
import { useDiscoverySearchMutation, useGetDiscoveryFiltersQuery } from "@/app/store/searchApi";
import type { CustomerSearchRequest, FilterItemOption, MenuItemDiscoveryResponse, SafetyStatusType } from "@/types/search";
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

function formatAgeGroupOptionLabel(a: FilterItemOption | any): string {
  const item = a as any;
  const min = item?.minAge ?? item?.minimumAge ?? item?.min_age;
  const max = item?.maxAge ?? item?.maximumAge ?? item?.max_age;

  if (min !== undefined && min !== null && max !== undefined && max !== null) {
    return `${a.name} (${min}-${max})`;
  }
  if (min !== undefined && min !== null && (max === undefined || max === null)) {
    return `${a.name} (${min}+)`;
  }
  if ((min === undefined || min === null) && max !== undefined && max !== null) {
    return `${a.name} (≤${max})`;
  }

  // Fallback ranges for standard FoodHub age groups if not returned from backend
  const key = `${a.name || ""} ${a.code || ""}`.toLowerCase();
  if (key.includes("កុមារតូច") || key.includes("toddler") || key.includes("infant")) {
    return `${a.name} (0-2)`;
  }
  if (key.includes("កុមារ") || key.includes("child") || key.includes("kid")) {
    return `${a.name} (3-12)`;
  }
  if (key.includes("យុវវ័យ") || key.includes("យុវជន") || key.includes("teen") || key.includes("youth")) {
    return `${a.name} (13-17)`;
  }
  if (key.includes("មនុស្សពេញវ័យ") || key.includes("adult")) {
    return `${a.name} (18-59)`;
  }
  if (key.includes("មនុស្សវ័យចំណាស់") || key.includes("វ័យចំណាស់") || key.includes("senior") || key.includes("elderly")) {
    return `${a.name} (60+)`;
  }

  return a.name;
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
      const matchesAge = ageGroups.some(
        (a) =>
          req.ageGroupUuids!.includes(a.code) ||
          req.ageGroupUuids!.some(
            (u) =>
              normalizeText(u) === normalizeText(a.name) ||
              normalizeText(u) === normalizeText(a.code),
          ),
      );
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
    : profileResponse?.contents ?? [];

  const [collapsed, setCollapsed] = useState(false);
  const [categoryQuery, setCategoryQuery] = useState("");

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

  const toggleNumberItem = (key: keyof CustomerSearchRequest, value: number) => {
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
    (customerSearchRequest.minimumPrice !== undefined || customerSearchRequest.maximumPrice !== undefined ? 1 : 0) +
    (customerSearchRequest.minimumSpiceLevel !== undefined || customerSearchRequest.maximumSpiceLevel !== undefined ? 1 : 0) +
    (customerSearchRequest.maxPreparationTimeMinutes !== undefined ? 1 : 0) +
    (customerSearchRequest.profileUuid ? 1 : 0);

  const categories = (filterOptions?.categories || []).filter((cat) =>
    normalizeText(cat.name).includes(normalizeText(categoryQuery)),
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
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                >
                  <div className="flex items-center gap-2">
                    <p className="text-[26px] font-semibold text-primary-900">
                      តម្រង
                    </p>

                    {activeFilterCount > 0 && (
                      <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-primary-800 px-2 text-[16px] font-semibold text-white">
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
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.9 }}
                aria-label={isCollapsed ? "Expand filters" : "Collapse filters"}
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-50 text-gray-500 transition hover:bg-primary-50 hover:text-primary-700"
              >
                <motion.span animate={{ rotate: isCollapsed ? 180 : 0 }}>
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
                onClick={() => onSearchRequestChange({ sort: "NEWEST" })}
                className="cursor-pointer text-[16px] font-medium text-secondary-500 transition hover:underline disabled:cursor-not-allowed disabled:opacity-40"
              >
                សម្អាតទាំងអស់
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Sections */}
        {!isCollapsed && (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-2 [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300">
            {/* PROFILE SAFETY EVALUATION */}
            {memberProfiles.length > 0 && (
              <FilterSection
                title="វាយតម្លៃសុវត្ថិភាពម្ហូប"
                icon={<IoNutritionOutline />}
                isOpen={openSections.profile}
                onToggle={() => toggleSection("profile")}
              >
                <p className="mb-2 text-[14px] text-gray-500">
                  ជ្រើសរើសប្រវត្តិរូបដើម្បីពិនិត្យអាលែហ្ស៊ី និងធាតុផ្សំដែលហាមឃាត់៖
                </p>
                <select
                  value={customerSearchRequest.profileUuid || ""}
                  onChange={(e) =>
                    onSearchRequestChange({
                      ...customerSearchRequest,
                      profileUuid: e.target.value || undefined,
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[15px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-700"
                >
                  <option value="">-- មិនជ្រើសរើសប្រវត្តិរូប --</option>
                  {memberProfiles.map((p) => (
                    <option key={p.uuid} value={p.uuid}>
                      👤 {p.profileName || (p as any).name} {p.relationship ? `(${p.relationship})` : ""}
                    </option>
                  ))}
                </select>
              </FilterSection>
            )}

            {/* SORT BY */}
            <FilterSection
              title="តម្រៀបតាម"
              icon={<IoSwapVerticalOutline />}
              isOpen={openSections.sort}
              onToggle={() => toggleSection("sort")}
            >
              <select
                value={customerSearchRequest.sort || "NEWEST"}
                onChange={(e) =>
                  onSearchRequestChange({
                    ...customerSearchRequest,
                    sort: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[15px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-700"
              >
                <option value="NEWEST">✨ ថ្មីបំផុត</option>
                <option value="DISTANCE_ASC">📍 ចំងាយជិតបំផុត</option>
                <option value="PRICE_ASC">💵 តម្លៃទាបទៅខ្ពស់</option>
                <option value="PRICE_DESC">💰 តម្លៃខ្ពស់ទៅទាប</option>
              </select>
            </FilterSection>

            {/* OPEN NOW */}
            <div className="my-4 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3">
              <span className="text-[16px] font-semibold text-gray-700">
                🏪 បើកដំណើរការឥឡូវនេះ
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
                className="h-5 w-5 accent-primary-800 rounded cursor-pointer"
              />
            </div>

            {/* CATEGORY */}
            {filterOptions?.categories && filterOptions.categories.length > 0 && (
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
                  {categories.map((cat) => (
                    <CheckboxOption
                      key={cat.uuid}
                      label={cat.name}
                      checked={Boolean(customerSearchRequest.categoryUuids?.includes(cat.uuid))}
                      onChange={() => toggleArrayItem("categoryUuids", cat.uuid)}
                    />
                  ))}
                </div>
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
                <div className="max-h-[230px] space-y-1 overflow-y-auto pr-2">
                  {filterOptions.cuisines.map((c) => (
                    <CheckboxOption
                      key={c.uuid}
                      label={c.name}
                      checked={Boolean(customerSearchRequest.cuisineUuids?.includes(c.uuid))}
                      onChange={() => toggleArrayItem("cuisineUuids", c.uuid)}
                    />
                  ))}
                </div>
              </FilterSection>
            )}

            {/* DIETARY TYPES */}
            {filterOptions?.dietaryTypes && filterOptions.dietaryTypes.length > 0 && (
              <FilterSection
                title="របបអាហារ"
                icon={<IoNutritionOutline />}
                isOpen={openSections.dietary}
                onToggle={() => toggleSection("dietary")}
              >
                <div className="space-y-1">
                  {filterOptions.dietaryTypes.map((d) => (
                    <CheckboxOption
                      key={d.uuid}
                      label={d.name}
                      checked={Boolean(customerSearchRequest.dietaryTypeUuids?.includes(d.uuid))}
                      onChange={() => toggleArrayItem("dietaryTypeUuids", d.uuid)}
                    />
                  ))}
                </div>
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
                <p className="mb-2 text-[14px] text-orange-600">
                  មុខម្ហូបដែលមានធាតុផ្សំអាឡែស៊ីដែលបានជ្រើសរើសនឹងត្រូវដកចេញ។
                </p>
                <div className="space-y-1">
                  {filterOptions.allergens.map((alg) => (
                    <CheckboxOption
                      key={alg.uuid}
                      label={`គ្មាន ${alg.name}`}
                      checked={Boolean(customerSearchRequest.excludeAllergenUuids?.includes(alg.uuid))}
                      onChange={() => toggleArrayItem("excludeAllergenUuids", alg.uuid)}
                    />
                  ))}
                </div>
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
                      minimumPrice: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[15px] text-gray-700 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="អតិបរមា ($)"
                  value={customerSearchRequest.maximumPrice ?? ""}
                  onChange={(e) =>
                    onSearchRequestChange({
                      ...customerSearchRequest,
                      maximumPrice: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[15px] text-gray-700 focus:outline-none"
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
                      className={`p-2 rounded-xl text-[14px] font-semibold border transition text-center ${
                        isSelected
                          ? "bg-primary-800 text-white border-primary-800"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      🔥 {spice.label}
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
                          customerSearchRequest.maxPreparationTimeMinutes === pt.val ? undefined : pt.val,
                      })
                    }
                    className={`flex-1 p-2 rounded-xl text-[14px] font-semibold border transition text-center ${
                      customerSearchRequest.maxPreparationTimeMinutes === pt.val
                        ? "bg-primary-800 text-white border-primary-800"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
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
                <div className="space-y-1">
                  {filterOptions.mealTypes.map((m) => (
                    <CheckboxOption
                      key={m.uuid}
                      label={m.name}
                      checked={Boolean(customerSearchRequest.mealTypeUuids?.includes(m.uuid))}
                      onChange={() => toggleArrayItem("mealTypeUuids", m.uuid)}
                    />
                  ))}
                </div>
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
                <div className="space-y-1">
                  {filterOptions.ageGroups.map((a) => (
                    <CheckboxOption
                      key={a.uuid}
                      label={formatAgeGroupOptionLabel(a)}
                      checked={Boolean(customerSearchRequest.ageGroupUuids?.includes(a.uuid))}
                      onChange={() => toggleArrayItem("ageGroupUuids", a.uuid)}
                    />
                  ))}
                </div>
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
                <div className="space-y-1">
                  {filterOptions.seasons.map((s) => (
                    <CheckboxOption
                      key={s.uuid}
                      label={s.name}
                      checked={Boolean(customerSearchRequest.seasonUuids?.includes(s.uuid))}
                      onChange={() => toggleArrayItem("seasonUuids", s.uuid)}
                    />
                  ))}
                </div>
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
                <div className="space-y-1">
                  {filterOptions.events.map((ev) => (
                    <CheckboxOption
                      key={ev.uuid}
                      label={ev.name}
                      checked={Boolean(customerSearchRequest.eventUuids?.includes(ev.uuid))}
                      onChange={() => toggleArrayItem("eventUuids", ev.uuid)}
                    />
                  ))}
                </div>
              </FilterSection>
            )}

            {/* SUITABLE WEATHER */}
            {filterOptions?.suitableWeather && filterOptions.suitableWeather.length > 0 && (
              <FilterSection
                title="អាកាសធាតុសមស្រប"
                icon={<MdOutlineCategory />}
                isOpen={openSections.weather}
                onToggle={() => toggleSection("weather")}
              >
                <div className="space-y-1">
                  {filterOptions.suitableWeather.map((w) => (
                    <CheckboxOption
                      key={w.uuid}
                      label={w.name}
                      checked={Boolean(customerSearchRequest.weatherConditionUuids?.includes(w.uuid))}
                      onChange={() => toggleArrayItem("weatherConditionUuids", w.uuid)}
                    />
                  ))}
                </div>
              </FilterSection>
            )}

            {/* STORE PRICE LEVEL */}
            {filterOptions?.storePriceLevels && filterOptions.storePriceLevels.length > 0 && (
              <FilterSection
                title="កម្រិតតម្លៃហាង"
                icon={<IoPricetagOutline />}
                isOpen={openSections.storePrice}
                onToggle={() => toggleSection("storePrice")}
              >
                <div className="flex flex-wrap gap-2">
                  {filterOptions.storePriceLevels.map((level) => {
                    const selected = customerSearchRequest.storePriceLevels?.includes(level);
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => toggleNumberItem("storePriceLevels", level)}
                        className={`rounded-full border px-4 py-2 text-[15px] font-semibold transition ${
                          selected
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
            {filterOptions?.availabilityStatuses && filterOptions.availabilityStatuses.length > 0 && (
              <FilterSection
                title="ស្ថានភាពលក់"
                icon={<MdOutlineCategory />}
                isOpen={openSections.availability}
                onToggle={() => toggleSection("availability")}
              >
                <div className="space-y-1">
                  {filterOptions.availabilityStatuses.map((status) => (
                    <CheckboxOption
                      key={status}
                      label={AVAILABILITY_LABELS[status] ?? status}
                      checked={Boolean(customerSearchRequest.availabilityStatuses?.includes(status))}
                      onChange={() => toggleArrayItem("availabilityStatuses", status)}
                    />
                  ))}
                </div>
              </FilterSection>
            )}

            {/* FEATURED ONLY */}
            <div className="my-4 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3">
              <span className="text-[16px] font-semibold text-gray-700">
                ⭐ តែមុខម្ហូបពិសេស
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
                <div className="max-h-[230px] space-y-1 overflow-y-auto pr-2">
                  {filterOptions.provinces.map((prov) => (
                    <CheckboxOption
                      key={prov}
                      label={prov}
                      checked={Boolean(customerSearchRequest.provinces?.includes(prov))}
                      onChange={() => toggleArrayItem("provinces", prov)}
                    />
                  ))}
                </div>
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
                <div className="max-h-[230px] space-y-1 overflow-y-auto pr-2">
                  {filterOptions.cities.map((city) => (
                    <CheckboxOption
                      key={city}
                      label={city}
                      checked={Boolean(customerSearchRequest.cities?.includes(city))}
                      onChange={() => toggleArrayItem("cities", city)}
                    />
                  ))}
                </div>
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

            {option.count > 0 && (
              <span className="ml-2 opacity-70">{option.count}</span>
            )}
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
    sort: "NEWEST",
  });

  const [executeDiscoverySearch, { data: discoveryResult, isLoading: isDiscoveryLoading }] =
    useDiscoverySearchMutation();

  const { data: discoveryFilterOptions } = useGetDiscoveryFiltersQuery();

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

  const memberProfiles: MemberProfile[] = useMemo(
    () =>
      Array.isArray(profileResponse)
        ? profileResponse
        : profileResponse?.contents ?? [],
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
    return (
      memberProfiles.find((p: MemberProfile) => p.isDefault) ?? null
    );
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

  const apiCategoryOptions: FilterOption[] = useMemo(
    () => {
      if (
        discoveryFilterOptions?.categories &&
        discoveryFilterOptions.categories.length > 0
      ) {
        return discoveryFilterOptions.categories.map((category) => ({
          code: category.uuid,
          name: category.name,
          count: 0,
        }));
      }
      return categoryOptions;
    },
    [discoveryFilterOptions, categoryOptions],
  );

  // If discovery returned items, display them. Otherwise fall back to filteredFoods
  // so all menu items are shown when no filter is active, and client filters work smoothly.
  const displayFoods =
    apiCatalogFoods.length > 0 ? apiCatalogFoods : filteredFoods;

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
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-global-search"))}
      className="flex min-h-[56px] flex-1 items-center justify-between gap-3 rounded-full border border-gray-200 bg-white px-5 text-left transition hover:border-primary-700 hover:bg-gray-50/80 focus:outline-none dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center gap-3 min-w-0">
        <IoSearchOutline className="shrink-0 text-[22px] text-primary-700 dark:text-emerald-400" />
        <span className="text-[16px] text-gray-500 dark:text-gray-400 truncate">
          {searchInput ? `ស្វែងរក: "${searchInput}"` : "ស្វែងរកហាង ឬ មុខម្ហូប..."}
        </span>
      </div>
      <kbd className="hidden sm:inline-block rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 dark:bg-slate-800 dark:text-gray-400">
        ⌘K
      </kbd>
    </button>
  );

  /* =======================================================
     RENDER
  ======================================================= */

  if (isLoading && menuItems.length === 0) {
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
            onClick={() => setMobileFiltersOpen(true)}
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
              lg:hidden
            "
            aria-label="Open food filters"
          >
            <IoFilterOutline className="text-[21px]" />
            <span>តម្រង</span>
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
                setCustomerSearchRequest({ sort: "NEWEST" });
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
