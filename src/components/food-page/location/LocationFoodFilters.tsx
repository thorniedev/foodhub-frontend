"use client";

import { useMemo, useState, type ReactNode } from "react";

import { AnimatePresence, motion } from "framer-motion";

import {
  IoChevronBack,
  IoChevronDown,
  IoCloseOutline,
  IoLocationOutline,
  IoNutritionOutline,
  IoPricetagOutline,
  IoSearchOutline,
  IoSwapVerticalOutline,
  IoTimeOutline,
} from "react-icons/io5";

import { FaFire, FaLeaf, FaStar } from "react-icons/fa";

import { MdOutlineCategory, MdOutlineRestaurant } from "react-icons/md";

import type { MenuItem } from "@/types/manu";

import type {
  LocationFoodFilterOption,
  LocationFoodFilterState,
  LocationFoodSort,
} from "@/types/location-food-filter";

import { DEFAULT_LOCATION_FOOD_FILTERS } from "@/types/location-food-filter";
import { isDrinkCategory, isFoodCategory, type CategoryFilterType } from "@/lib/category-filter";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

interface LocationFoodFiltersProps {
  menuItems: MenuItem[];

  filters: LocationFoodFilterState;

  onChange: (filters: LocationFoodFilterState) => void;

  /**
   * When this exists, the filter is being
   * displayed inside the mobile/tablet drawer.
   */
  onClose?: () => void;
}

interface NumericOption {
  value: number;
  label: string;
}

interface FilterSectionProps {
  title: string;

  icon: ReactNode;

  isOpen: boolean;

  onToggle: () => void;

  children: ReactNode;
}

interface CheckboxOptionProps {
  label: string;

  count?: number;

  checked: boolean;

  onChange: () => void;
}

interface SingleChoiceProps<T extends string | number> {
  options: Array<{
    value: T;
    label: string;
  }>;

  selected: T | null;

  onChange: (value: T | null) => void;
}

interface RecommendationContextOption {
  code: string;

  name: string;

  localName?: string | null;
}

interface ProvincePopularityOption {
  provinceCode: string;

  provinceName: string;

  provinceLocalName?: string | null;
}

interface FoodOriginContext {
  provinceCode?: string | null;

  provinceName?: string | null;

  provinceLocalName?: string | null;
}

type ContextMenuItem = MenuItem & {
  origin?: FoodOriginContext;

  recommendationContext?: {
    seasons?: RecommendationContextOption[];

    events?: RecommendationContextOption[];

    provincePopularity?: ProvincePopularityOption[];

    suitableWeather?: RecommendationContextOption[];
  };
};

/* -------------------------------------------------------------------------- */
/*                                   OPTIONS                                  */
/* -------------------------------------------------------------------------- */

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
  {
    value: 30,
    label: "ក្រោម 30 នាទី",
  },
];

const DISTANCE_OPTIONS: NumericOption[] = [
  {
    value: 1,
    label: "ក្រោម 1 km",
  },
  {
    value: 2,
    label: "ក្រោម 2 km",
  },
  {
    value: 3,
    label: "ក្រោម 3 km",
  },
  {
    value: 5,
    label: "ក្រោម 5 km",
  },
  {
    value: 10,
    label: "ក្រោម 10 km",
  },
  {
    value: 20,
    label: "ក្រោម 20 km",
  },
];

const RATING_OPTIONS: NumericOption[] = [
  {
    value: 4,
    label: "4.0 ឡើងទៅ",
  },
  {
    value: 4.5,
    label: "4.5 ឡើងទៅ",
  },
  {
    value: 4.7,
    label: "4.7 ឡើងទៅ",
  },
  {
    value: 4.8,
    label: "4.8 ឡើងទៅ",
  },
];

const MATCH_SCORE_OPTIONS: NumericOption[] = [
  {
    value: 0.8,
    label: "80% ឡើងទៅ",
  },
  {
    value: 0.9,
    label: "90% ឡើងទៅ",
  },
  {
    value: 0.95,
    label: "95% ឡើងទៅ",
  },
];

const SORT_OPTIONS: Array<{
  value: LocationFoodSort;
  label: string;
}> = [
  {
    value: "recommended",
    label: "ការណែនាំល្អបំផុត",
  },
  {
    value: "popular",
    label: "ពេញនិយមបំផុត",
  },
  {
    value: "rating",
    label: "ការវាយតម្លៃខ្ពស់",
  },
  {
    value: "fastest",
    label: "រៀបចំលឿនបំផុត",
  },
  {
    value: "nearest",
    label: "នៅជិតបំផុត",
  },
  {
    value: "price-low",
    label: "តម្លៃទាបទៅខ្ពស់",
  },
  {
    value: "price-high",
    label: "តម្លៃខ្ពស់ទៅទាប",
  },
];

const DEFAULT_OPEN_SECTIONS: Record<string, boolean> = {
  sort: true,

  category: true,

  cuisine: false,

  mealType: true,

  dietaryType: false,

  ageGroup: false,

  allergens: false,

  spice: false,

  preparation: false,

  distance: true,

  seasons: false,

  events: false,

  provinces: false,

  weather: false,

  originProvince: false,

  rating: false,

  matchScore: false,

  stores: false,

  ingredients: false,

  nutrition: false,

  price: true,
};

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKC");
}

function toggleString(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function toggleNumber(values: number[], value: number): number[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function getUniqueOptions(
  values: Array<{
    code?: string | null;
    name?: string | null;
  }>,
): LocationFoodFilterOption[] {
  const optionMap = new Map<string, LocationFoodFilterOption>();

  values.forEach((item) => {
    const code = item.code?.trim();

    const name = item.name?.trim();

    if (!code || !name) {
      return;
    }

    const existing = optionMap.get(code);

    if (existing) {
      existing.count += 1;

      return;
    }

    optionMap.set(code, {
      code,
      name,
      count: 1,
    });
  });

  return Array.from(optionMap.values()).sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}

function searchFilterOptions(
  options: LocationFoodFilterOption[],
  query: string,
): LocationFoodFilterOption[] {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return options;
  }

  return options.filter((option: LocationFoodFilterOption) =>
    normalizeText(option.name).includes(normalizedQuery),
  );
}

function countActiveFilters(filters: LocationFoodFilterState): number {
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
    (filters.query.trim() ? 1 : 0) +
    (filters.priceTier ? 1 : 0) +
    (filters.maximumPreparationMinutes !== null ? 1 : 0) +
    (filters.maximumDistanceKm !== null &&
    filters.maximumDistanceKm !==
      DEFAULT_LOCATION_FOOD_FILTERS.maximumDistanceKm
      ? 1
      : 0) +
    (filters.minimumRating !== null ? 1 : 0) +
    (filters.minimumRecommendationScore !== null ? 1 : 0) +
    (filters.recommendedOnly ? 1 : 0) +
    (filters.featuredOnly ? 1 : 0) +
    (filters.lowCalorieOnly ? 1 : 0) +
    (filters.highProteinOnly ? 1 : 0) +
    (filters.lowFatOnly ? 1 : 0) +
    (filters.highFiberOnly ? 1 : 0) +
    (filters.lowSodiumOnly ? 1 : 0) +
    (filters.sortBy !== "recommended" ? 1 : 0)
  );
}

/* -------------------------------------------------------------------------- */
/*                              SMALL COMPONENTS                              */
/* -------------------------------------------------------------------------- */

function FilterSection({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}: FilterSectionProps) {
  return (
    <section className="border-t border-gray-100 py-4 first:border-t-0 first:pt-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between gap-3 text-left"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-[22px] text-primary-700">{icon}</span>

          <span className="text-[17px] font-semibold text-primary-900">
            {title}
          </span>
        </span>

        <motion.span
          animate={{
            rotate: isOpen ? 180 : 0,
          }}
          transition={{
            duration: 0.2,
          }}
          className="shrink-0 text-gray-400"
        >
          <IoChevronDown className="text-[22px]" />
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
              duration: 0.22,
            }}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function CheckboxOption({
  label,
  count,
  checked,
  onChange,
}: CheckboxOptionProps) {
  return (
    <label
      className={`flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl px-2.5 py-2.5 transition ${
        checked
          ? "bg-primary-50 text-primary-800 dark:text-primary-dark"
          : "text-gray-600 hover:bg-primary-50"
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-[18px] w-[18px] shrink-0 accent-primary-800"
        />

        <span className="min-w-0 break-words text-[17px] leading-7">
          {label}
        </span>
      </span>

      {typeof count === "number" && (
        <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[17px] text-gray-500">
          {count}
        </span>
      )}
    </label>
  );
}

function SingleChoice<T extends string | number>({
  options,
  selected,
  onChange,
}: SingleChoiceProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option: { value: T; label: string }) => {
        const isSelected = selected === option.value;

        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(isSelected ? null : option.value)}
            className={`min-h-11 rounded-full border px-3.5 py-2 text-[17px] font-medium transition ${
              isSelected
                ? "border-primary-800 bg-primary-800 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-primary-400 hover:bg-primary-50"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function OptionList({
  options,
  selected,
  onToggle,
  emptyMessage = "មិនទាន់មានជម្រើសសម្រាប់ផ្នែកនេះទេ។",
}: {
  options: LocationFoodFilterOption[];

  selected: string[];

  onToggle: (code: string) => void;

  emptyMessage?: string;
}) {
  if (options.length === 0) {
    return (
      <p className="rounded-xl bg-gray-50 px-3 py-3 text-[17px] leading-7 text-gray-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {options.map((option: LocationFoodFilterOption) => (
        <CheckboxOption
          key={option.code}
          label={option.name}
          count={option.count}
          checked={selected.includes(option.code)}
          onChange={() => onToggle(option.code)}
        />
      ))}
    </div>
  );
}

function FilterSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;

  onChange: (value: string) => void;

  placeholder: string;
}) {
  return (
    <div className="mb-3 flex min-h-12 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 transition focus-within:border-primary-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-50">
      <IoSearchOutline className="shrink-0 text-[22px] text-gray-400" />

      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[17px] text-gray-700 outline-none placeholder:text-gray-400"
      />

      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-white hover:text-gray-700"
        >
          <IoCloseOutline className="text-[22px]" />
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default function LocationFoodFilters({
  menuItems,
  filters,
  onChange,
  onClose,
}: LocationFoodFiltersProps) {
  const isDrawer = Boolean(onClose);

  const [collapsed, setCollapsed] = useState(false);

  const [categoryQuery, setCategoryQuery] = useState("");
  const [categoryType, setCategoryType] = useState<CategoryFilterType>("ALL");

  const [cuisineQuery, setCuisineQuery] = useState("");

  const [storeQuery, setStoreQuery] = useState("");

  const [ingredientQuery, setIngredientQuery] = useState("");

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    DEFAULT_OPEN_SECTIONS,
  );

  const contextualMenuItems = useMemo(
    () => menuItems as ContextMenuItem[],
    [menuItems],
  );

  /* ------------------------------------------------------------------------ */
  /* CATEGORY                                                                 */
  /* ------------------------------------------------------------------------ */

  const categoryOptions = useMemo<LocationFoodFilterOption[]>(
    () =>
      getUniqueOptions(
        menuItems.map((item: MenuItem) => ({
          code: item.food?.category?.code,

          name: item.food?.category?.name,
        })),
      ),
    [menuItems],
  );

  /* ------------------------------------------------------------------------ */
  /* CUISINE                                                                  */
  /* ------------------------------------------------------------------------ */

  const cuisineOptions = useMemo<LocationFoodFilterOption[]>(
    () =>
      getUniqueOptions(
        menuItems.map((item: MenuItem) => ({
          code: item.food?.cuisine?.code,

          name: item.food?.cuisine?.name,
        })),
      ),
    [menuItems],
  );

  /* ------------------------------------------------------------------------ */
  /* MEAL TYPE                                                                */
  /* ------------------------------------------------------------------------ */

  const mealTypeOptions = useMemo<LocationFoodFilterOption[]>(
    () =>
      getUniqueOptions(
        menuItems.flatMap((item: MenuItem) =>
          (item.mealTypes ?? []).map((option) => ({
            code: option.code,

            name: option.name,
          })),
        ),
      ),
    [menuItems],
  );

  /* ------------------------------------------------------------------------ */
  /* DIETARY TYPE                                                             */
  /* ------------------------------------------------------------------------ */

  const dietaryTypeOptions = useMemo<LocationFoodFilterOption[]>(
    () =>
      getUniqueOptions(
        menuItems.flatMap((item: MenuItem) =>
          (item.dietaryTypes ?? (item as any).food?.dietaryTypes ?? []).map((option: any) => ({
            code: option.code,

            name: option.name,
          })),
        ),
      ),
    [menuItems],
  );

  /* ------------------------------------------------------------------------ */
  /* AGE GROUP                                                                */
  /* ------------------------------------------------------------------------ */

  const ageGroupOptions = useMemo<LocationFoodFilterOption[]>(
    () =>
      getUniqueOptions(
        menuItems.flatMap((item: MenuItem) =>
          (item.food?.ageGroups ?? []).map((option) => ({
            code: option.code,

            name: option.name,
          })),
        ),
      ),
    [menuItems],
  );

  /* ------------------------------------------------------------------------ */
  /* ALLERGEN                                                                 */
  /* ------------------------------------------------------------------------ */

  const allergenOptions = useMemo<LocationFoodFilterOption[]>(
    () =>
      getUniqueOptions(
        menuItems.flatMap((item: MenuItem) =>
          (item.allergenDeclarations ?? []).map((option) => ({
            code: option.code,

            name: option.name,
          })),
        ),
      ),
    [menuItems],
  );

  /* ------------------------------------------------------------------------ */
  /* STORE                                                                    */
  /* ------------------------------------------------------------------------ */

  const storeOptions = useMemo<LocationFoodFilterOption[]>(() => {
    const map = new Map<string, LocationFoodFilterOption>();

    menuItems.forEach((item: MenuItem) => {
      const uuid = item.store?.uuid;

      if (!uuid) {
        return;
      }

      const existing = map.get(uuid);

      if (existing) {
        existing.count += 1;

        return;
      }

      map.set(uuid, {
        code: uuid,

        name: item.store?.localName || item.store?.name || "ហាងអាហារ",

        count: 1,
      });
    });

    return Array.from(map.values()).sort((first, second) =>
      first.name.localeCompare(second.name),
    );
  }, [menuItems]);

  /* ------------------------------------------------------------------------ */
  /* INGREDIENT                                                               */
  /* ------------------------------------------------------------------------ */

  const ingredientOptions = useMemo<LocationFoodFilterOption[]>(
    () =>
      getUniqueOptions(
        menuItems.flatMap((item: MenuItem) =>
          (item.ingredients ?? []).map((ingredient: string) => ({
            code: ingredient,

            name: ingredient,
          })),
        ),
      ),
    [menuItems],
  );

  /* ------------------------------------------------------------------------ */
  /* SEASONS                                                                  */
  /* ------------------------------------------------------------------------ */

  const seasonOptions = useMemo<LocationFoodFilterOption[]>(
    () =>
      getUniqueOptions(
        contextualMenuItems.flatMap((item: ContextMenuItem) =>
          (item.recommendationContext?.seasons ?? []).map(
            (option: RecommendationContextOption) => ({
              code: option.code,

              name: option.localName || option.name,
            }),
          ),
        ),
      ),
    [contextualMenuItems],
  );

  /* ------------------------------------------------------------------------ */
  /* EVENTS                                                                   */
  /* ------------------------------------------------------------------------ */

  const eventOptions = useMemo<LocationFoodFilterOption[]>(
    () =>
      getUniqueOptions(
        contextualMenuItems.flatMap((item: ContextMenuItem) =>
          (item.recommendationContext?.events ?? []).map(
            (option: RecommendationContextOption) => ({
              code: option.code,

              name: option.localName || option.name,
            }),
          ),
        ),
      ),
    [contextualMenuItems],
  );

  /* ------------------------------------------------------------------------ */
  /* PROVINCE                                                                 */
  /* ------------------------------------------------------------------------ */

  const provinceOptions = useMemo<LocationFoodFilterOption[]>(
    () =>
      getUniqueOptions(
        contextualMenuItems.flatMap((item: ContextMenuItem) =>
          (item.recommendationContext?.provincePopularity ?? []).map(
            (option: ProvincePopularityOption) => ({
              code: option.provinceCode,

              name: option.provinceLocalName || option.provinceName,
            }),
          ),
        ),
      ),
    [contextualMenuItems],
  );

  /* ------------------------------------------------------------------------ */
  /* WEATHER                                                                  */
  /* ------------------------------------------------------------------------ */

  const weatherOptions = useMemo<LocationFoodFilterOption[]>(
    () =>
      getUniqueOptions(
        contextualMenuItems.flatMap((item: ContextMenuItem) =>
          (item.recommendationContext?.suitableWeather ?? []).map(
            (option: RecommendationContextOption) => ({
              code: option.code,

              name: option.localName || option.name,
            }),
          ),
        ),
      ),
    [contextualMenuItems],
  );

  /* ------------------------------------------------------------------------ */
  /* ORIGIN PROVINCE                                                          */
  /* ------------------------------------------------------------------------ */

  const originProvinceOptions = useMemo<LocationFoodFilterOption[]>(
    () =>
      getUniqueOptions(
        contextualMenuItems.flatMap((item: ContextMenuItem) => {
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

  /* ------------------------------------------------------------------------ */
  /* SEARCH FILTER OPTIONS                                                    */
  /* ------------------------------------------------------------------------ */

  const visibleCategoryOptions = useMemo(() => {
    let list = categoryOptions;
    if (categoryType === "FOOD") {
      list = list.filter((opt) => isFoodCategory(opt));
    } else if (categoryType === "DRINK") {
      list = list.filter((opt) => isDrinkCategory(opt));
    }
    return searchFilterOptions(list, categoryQuery);
  }, [categoryOptions, categoryType, categoryQuery]);

  const visibleCuisineOptions = useMemo(
    () => searchFilterOptions(cuisineOptions, cuisineQuery),
    [cuisineOptions, cuisineQuery],
  );

  const visibleStoreOptions = useMemo(
    () => searchFilterOptions(storeOptions, storeQuery),
    [storeOptions, storeQuery],
  );

  const visibleIngredientOptions = useMemo(
    () => searchFilterOptions(ingredientOptions, ingredientQuery),
    [ingredientOptions, ingredientQuery],
  );

  const activeFilterCount = countActiveFilters(filters);

  /* ------------------------------------------------------------------------ */
  /* HANDLERS                                                                 */
  /* ------------------------------------------------------------------------ */

  const toggleSection = (key: string) => {
    setOpenSections((current) => ({
      ...current,

      [key]: !current[key],
    }));
  };

  const update = <Key extends keyof LocationFoodFilterState>(
    key: Key,

    value: LocationFoodFilterState[Key],
  ) => {
    onChange({
      ...filters,

      [key]: value,
    });
  };

  const resetFilters = () => {
    onChange({
      ...DEFAULT_LOCATION_FOOD_FILTERS,
    });

    setCategoryQuery("");

    setCuisineQuery("");

    setStoreQuery("");

    setIngredientQuery("");
  };

  const openCollapsedSection = (key: string) => {
    setCollapsed(false);

    setOpenSections((current) => ({
      ...current,

      [key]: true,
    }));
  };

  const collapsedItems: Array<{
    key: string;

    label: string;

    icon: ReactNode;
  }> = [
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
      key: "distance",

      label: "ចម្ងាយ",

      icon: <IoLocationOutline />,
    },

    {
      key: "price",

      label: "តម្លៃ",

      icon: <IoPricetagOutline />,
    },
  ];

  return (
    <motion.aside
      animate={
        isDrawer
          ? undefined
          : {
              width: collapsed ? 82 : 320,
            }
      }
      transition={{
        type: "spring",

        stiffness: 320,

        damping: 34,
      }}
      className={
        isDrawer
          ? "h-full w-full text-[17px]"
          : "w-full shrink-0 text-[17px] xl:w-auto"
      }
    >
      <div className="flex h-full w-full flex-col overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
        {/* HEADER */}

        <div
          className={`shrink-0 border-b border-gray-100 bg-white ${
            collapsed && !isDrawer ? "p-3" : "p-5"
          }`}
        >
          <div
            className={`flex items-start ${
              collapsed && !isDrawer
                ? "justify-center"
                : "justify-between gap-3"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {(!collapsed || isDrawer) && (
                <motion.div
                  key="filter-title"
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
                  className="min-w-0"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      role="heading"
                      aria-level={2}
                      className="text-[25px] font-semibold text-primary-900"
                    >
                      តម្រងមុខម្ហូប
                    </p>

                    {activeFilterCount > 0 && (
                      <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-secondary-500 px-2 text-[17px] font-semibold text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-[17px] leading-7 text-gray-500">
                    ជ្រើសមុខម្ហូបដែលអ្នកចង់បាន ហើយ FoodHub
                    នឹងស្វែងរកហាងនៅក្បែរអ្នកដែលមានមុខម្ហូបទាំងនោះ។
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {isDrawer ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close food filters"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition hover:bg-primary-50 hover:text-primary-700"
              >
                <IoCloseOutline className="text-[24px]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCollapsed((current) => !current)}
                aria-label={collapsed ? "Expand filters" : "Collapse filters"}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition hover:bg-primary-50 hover:text-primary-700"
              >
                <motion.span
                  animate={{
                    rotate: collapsed ? 180 : 0,
                  }}
                >
                  <IoChevronBack className="text-[22px]" />
                </motion.span>
              </button>
            )}
          </div>

          {(!collapsed || isDrawer) && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
              <p className="text-[17px] text-gray-500">
                {activeFilterCount} តម្រងបានជ្រើស
              </p>

              <button
                type="button"
                disabled={activeFilterCount === 0}
                onClick={resetFilters}
                className="shrink-0 text-[17px] font-medium text-secondary-500 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
              >
                សម្អាតទាំងអស់
              </button>
            </div>
          )}
        </div>

        {/* COLLAPSED */}

        {collapsed && !isDrawer ? (
          <div className="flex flex-col items-center gap-3 px-3 py-4">
            {collapsedItems.map(
              (item: { key: string; label: string; icon: ReactNode }) => (
                <button
                  key={item.key}
                  type="button"
                  title={item.label}
                  aria-label={item.label}
                  onClick={() => openCollapsedSection(item.key)}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-[22px] text-primary-700 transition hover:bg-primary-50"
                >
                  {item.icon}
                </button>
              ),
            )}
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* SORT */}

            <FilterSection
              title="តម្រៀបតាម"
              icon={<IoSwapVerticalOutline />}
              isOpen={openSections.sort}
              onToggle={() => toggleSection("sort")}
            >
              <div className="space-y-2">
                {SORT_OPTIONS.map(
                  (option: { value: LocationFoodSort; label: string }) => {
                    const selected = filters.sortBy === option.value;

                    return (
                      <label
                        key={option.value}
                        className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 ${
                          selected
                            ? "border-primary-200 bg-primary-50 text-primary-800 dark:text-primary-dark"
                            : "border-transparent text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="location-food-sort"
                          checked={selected}
                          onChange={() => update("sortBy", option.value)}
                          className="h-[18px] w-[18px] accent-primary-800"
                        />

                        <span className="text-[17px]">{option.label}</span>
                      </label>
                    );
                  },
                )}
              </div>
            </FilterSection>

            {/* CATEGORY */}

            <FilterSection
              title="ប្រភេទម្ហូប និងភេសជ្ជៈ"
              icon={<MdOutlineCategory />}
              isOpen={openSections.category}
              onToggle={() => toggleSection("category")}
            >
              {/* Category Type Pills */}
              <div className="mb-3 flex items-center rounded-xl bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setCategoryType("ALL")}
                  className={`flex-1 rounded-lg py-2 text-lg font-bold transition ${
                    categoryType === "ALL"
                      ? "bg-white text-primary-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  ទាំងអស់
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryType("FOOD")}
                  className={`flex-1 rounded-lg py-2 text-lg font-bold transition ${
                    categoryType === "FOOD"
                      ? "bg-white text-primary-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  ម្ហូប
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryType("DRINK")}
                  className={`flex-1 rounded-lg py-2 text-lg font-bold transition ${
                    categoryType === "DRINK"
                      ? "bg-white text-primary-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  ភេសជ្ជៈ
                </button>
              </div>

              {/* Keep Searchbox */}
              <FilterSearch
                value={categoryQuery}
                onChange={setCategoryQuery}
                placeholder={
                  categoryType === "FOOD"
                    ? "ស្វែងរកប្រភេទម្ហូប"
                    : categoryType === "DRINK"
                      ? "ស្វែងរកប្រភេទភេសជ្ជៈ"
                      : "ស្វែងរកប្រភេទម្ហូប ឬភេសជ្ជៈ"
                }
              />

              <OptionList
                options={visibleCategoryOptions}
                selected={filters.categoryCodes}
                onToggle={(code) =>
                  update(
                    "categoryCodes",
                    toggleString(filters.categoryCodes, code),
                  )
                }
              />
            </FilterSection>

            {/* CUISINE */}

            <FilterSection
              title="ម្ហូបតាមប្រទេស"
              icon={<MdOutlineCategory />}
              isOpen={openSections.cuisine}
              onToggle={() => toggleSection("cuisine")}
            >
              <FilterSearch
                value={cuisineQuery}
                onChange={setCuisineQuery}
                placeholder="ស្វែងរកម្ហូបតាមប្រទេស"
              />

              <OptionList
                options={visibleCuisineOptions}
                selected={filters.cuisineCodes}
                onToggle={(code) =>
                  update(
                    "cuisineCodes",
                    toggleString(filters.cuisineCodes, code),
                  )
                }
              />
            </FilterSection>

            {/* MEAL */}

            <FilterSection
              title="ពេលទទួលទាន"
              icon={<IoTimeOutline />}
              isOpen={openSections.mealType}
              onToggle={() => toggleSection("mealType")}
            >
              <OptionList
                options={mealTypeOptions}
                selected={filters.mealTypeCodes}
                onToggle={(code) =>
                  update(
                    "mealTypeCodes",
                    toggleString(filters.mealTypeCodes, code),
                  )
                }
              />
            </FilterSection>

            {/* DIET */}

            <FilterSection
              title="របបអាហារ"
              icon={<FaLeaf />}
              isOpen={openSections.dietaryType}
              onToggle={() => toggleSection("dietaryType")}
            >
              <OptionList
                options={dietaryTypeOptions}
                selected={filters.dietaryTypeCodes}
                onToggle={(code) =>
                  update(
                    "dietaryTypeCodes",
                    toggleString(filters.dietaryTypeCodes, code),
                  )
                }
              />
            </FilterSection>

            {/* AGE */}

            <FilterSection
              title="ក្រុមអាយុ"
              icon={<IoNutritionOutline />}
              isOpen={openSections.ageGroup}
              onToggle={() => toggleSection("ageGroup")}
            >
              <OptionList
                options={ageGroupOptions}
                selected={filters.ageGroupCodes}
                onToggle={(code) =>
                  update(
                    "ageGroupCodes",
                    toggleString(filters.ageGroupCodes, code),
                  )
                }
              />
            </FilterSection>

            {/* ALLERGEN */}

            <FilterSection
              title="អាឡែស៊ីដែលត្រូវជៀសវាង"
              icon={<IoNutritionOutline />}
              isOpen={openSections.allergens}
              onToggle={() => toggleSection("allergens")}
            >
              <p className="mb-3 text-[17px] leading-7 text-orange-600">
                មុខម្ហូបដែលមានអាឡែស៊ីដែលអ្នកជ្រើស នឹងមិនត្រូវបានបង្ហាញទេ។
              </p>

              <OptionList
                options={allergenOptions.map(
                  (option: LocationFoodFilterOption) => ({
                    ...option,

                    name: `គ្មាន ${option.name}`,
                  }),
                )}
                selected={filters.excludedAllergenCodes}
                onToggle={(code) =>
                  update(
                    "excludedAllergenCodes",
                    toggleString(filters.excludedAllergenCodes, code),
                  )
                }
              />
            </FilterSection>

            {/* SPICE */}

            <FilterSection
              title="កម្រិតហឹរ"
              icon={<FaFire />}
              isOpen={openSections.spice}
              onToggle={() => toggleSection("spice")}
            >
              <div className="space-y-1">
                {SPICE_OPTIONS.map((option: NumericOption) => (
                  <CheckboxOption
                    key={option.value}
                    label={option.label}
                    checked={filters.spiceLevels.includes(option.value)}
                    onChange={() =>
                      update(
                        "spiceLevels",
                        toggleNumber(filters.spiceLevels, option.value),
                      )
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
              <SingleChoice<number>
                options={PREPARATION_OPTIONS}
                selected={filters.maximumPreparationMinutes}
                onChange={(value) => update("maximumPreparationMinutes", value)}
              />
            </FilterSection>

            {/* DISTANCE */}

            <FilterSection
              title="ចម្ងាយពីទីតាំងរបស់អ្នក"
              icon={<IoLocationOutline />}
              isOpen={openSections.distance}
              onToggle={() => toggleSection("distance")}
            >
              <SingleChoice<number>
                options={DISTANCE_OPTIONS}
                selected={filters.maximumDistanceKm}
                onChange={(value) => update("maximumDistanceKm", value)}
              />

              <p className="mt-3 text-[17px] leading-7 text-gray-500">
                ចម្ងាយត្រូវបានគណនាពីទីតាំងបច្ចុប្បន្ន
                ឬទីតាំងដែលអ្នកបានជ្រើសលើផែនទី ទៅកាន់ហាងដែលមានមុខម្ហូប។
              </p>
            </FilterSection>

            {/* SEASON */}

            {seasonOptions.length > 0 && (
              <FilterSection
                title="រដូវកាលនៅកម្ពុជា"
                icon={<FaLeaf />}
                isOpen={openSections.seasons}
                onToggle={() => toggleSection("seasons")}
              >
                <OptionList
                  options={seasonOptions}
                  selected={filters.seasonCodes}
                  onToggle={(code) =>
                    update(
                      "seasonCodes",
                      toggleString(filters.seasonCodes, code),
                    )
                  }
                />
              </FilterSection>
            )}

            {/* EVENT */}

            {eventOptions.length > 0 && (
              <FilterSection
                title="ពិធីបុណ្យ និងព្រឹត្តិការណ៍"
                icon={<FaStar />}
                isOpen={openSections.events}
                onToggle={() => toggleSection("events")}
              >
                <OptionList
                  options={eventOptions}
                  selected={filters.eventCodes}
                  onToggle={(code) =>
                    update("eventCodes", toggleString(filters.eventCodes, code))
                  }
                />
              </FilterSection>
            )}

            {/* PROVINCE */}

            {provinceOptions.length > 0 && (
              <FilterSection
                title="ពេញនិយមតាមខេត្ត"
                icon={<IoLocationOutline />}
                isOpen={openSections.provinces}
                onToggle={() => toggleSection("provinces")}
              >
                <OptionList
                  options={provinceOptions}
                  selected={filters.provinceCodes}
                  onToggle={(code) =>
                    update(
                      "provinceCodes",
                      toggleString(filters.provinceCodes, code),
                    )
                  }
                />
              </FilterSection>
            )}

            {/* WEATHER */}

            {weatherOptions.length > 0 && (
              <FilterSection
                title="សមស្របតាមអាកាសធាតុ"
                icon={<FaLeaf />}
                isOpen={openSections.weather}
                onToggle={() => toggleSection("weather")}
              >
                <OptionList
                  options={weatherOptions}
                  selected={filters.weatherCodes}
                  onToggle={(code) =>
                    update(
                      "weatherCodes",
                      toggleString(filters.weatherCodes, code),
                    )
                  }
                />
              </FilterSection>
            )}

            {/* ORIGIN PROVINCE */}

            {originProvinceOptions.length > 0 && (
              <FilterSection
                title="ប្រភពដើមតាមខេត្ត"
                icon={<IoLocationOutline />}
                isOpen={openSections.originProvince}
                onToggle={() => toggleSection("originProvince")}
              >
                <OptionList
                  options={originProvinceOptions}
                  selected={filters.originProvinceCodes}
                  onToggle={(code) =>
                    update(
                      "originProvinceCodes",
                      toggleString(filters.originProvinceCodes, code),
                    )
                  }
                />
              </FilterSection>
            )}

            {/* RATING */}

            <FilterSection
              title="ការវាយតម្លៃ"
              icon={<FaStar />}
              isOpen={openSections.rating}
              onToggle={() => toggleSection("rating")}
            >
              <SingleChoice<number>
                options={RATING_OPTIONS}
                selected={filters.minimumRating}
                onChange={(value) => update("minimumRating", value)}
              />
            </FilterSection>

            {/* AI SCORE */}

            <FilterSection
              title="កម្រិតសមស្រប AI"
              icon={<FaStar />}
              isOpen={openSections.matchScore}
              onToggle={() => toggleSection("matchScore")}
            >
              <SingleChoice<number>
                options={MATCH_SCORE_OPTIONS}
                selected={filters.minimumRecommendationScore}
                onChange={(value) =>
                  update("minimumRecommendationScore", value)
                }
              />
            </FilterSection>

            {/* RESTAURANT */}

            <FilterSection
              title="ហាងអាហារ"
              icon={<MdOutlineRestaurant />}
              isOpen={openSections.stores}
              onToggle={() => toggleSection("stores")}
            >
              <FilterSearch
                value={storeQuery}
                onChange={setStoreQuery}
                placeholder="ស្វែងរកហាង"
              />

              <OptionList
                options={visibleStoreOptions}
                selected={filters.storeIds}
                onToggle={(code) =>
                  update("storeIds", toggleString(filters.storeIds, code))
                }
                emptyMessage="រកមិនឃើញហាងដែលត្រូវនឹងពាក្យស្វែងរក។"
              />
            </FilterSection>

            {/* INGREDIENT */}

            <FilterSection
              title="គ្រឿងផ្សំ"
              icon={<FaLeaf />}
              isOpen={openSections.ingredients}
              onToggle={() => toggleSection("ingredients")}
            >
              <FilterSearch
                value={ingredientQuery}
                onChange={setIngredientQuery}
                placeholder="ស្វែងរកគ្រឿងផ្សំ"
              />

              <OptionList
                options={visibleIngredientOptions}
                selected={filters.ingredientNames}
                onToggle={(code) =>
                  update(
                    "ingredientNames",
                    toggleString(filters.ingredientNames, code),
                  )
                }
                emptyMessage="រកមិនឃើញគ្រឿងផ្សំដែលត្រូវនឹងពាក្យស្វែងរក។"
              />
            </FilterSection>

            {/* NUTRITION */}

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
                    update("lowCalorieOnly", !filters.lowCalorieOnly)
                  }
                />

                <CheckboxOption
                  label="ប្រូតេអ៊ីន 25g ឡើងទៅ"
                  checked={filters.highProteinOnly}
                  onChange={() =>
                    update("highProteinOnly", !filters.highProteinOnly)
                  }
                />

                <CheckboxOption
                  label="ជាតិខ្លាញ់ក្រោម 10g"
                  checked={filters.lowFatOnly}
                  onChange={() => update("lowFatOnly", !filters.lowFatOnly)}
                />

                <CheckboxOption
                  label="Fiber 5g ឡើងទៅ"
                  checked={filters.highFiberOnly}
                  onChange={() =>
                    update("highFiberOnly", !filters.highFiberOnly)
                  }
                />

                <CheckboxOption
                  label="Sodium ក្រោម 600mg"
                  checked={filters.lowSodiumOnly}
                  onChange={() =>
                    update("lowSodiumOnly", !filters.lowSodiumOnly)
                  }
                />
              </div>
            </FilterSection>

            {/* PRICE */}

            <FilterSection
              title="តម្លៃ"
              icon={<IoPricetagOutline />}
              isOpen={openSections.price}
              onToggle={() => toggleSection("price")}
            >
              <div className="grid grid-cols-3 gap-2">
                {(["$", "$$", "$$$"] as const).map(
                  (tier: "$" | "$$" | "$$$") => {
                    const selected = filters.priceTier === tier;

                    return (
                      <button
                        key={tier}
                        type="button"
                        onClick={() =>
                          update("priceTier", selected ? null : tier)
                        }
                        className={`min-h-12 rounded-xl border py-2.5 text-[17px] font-semibold transition ${
                          selected
                            ? "border-primary-800 bg-primary-800 text-white shadow-sm"
                            : "border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:bg-primary-50"
                        }`}
                      >
                        {tier}
                      </button>
                    );
                  },
                )}
              </div>

              <div className="mt-3 space-y-1 rounded-xl bg-gray-50 p-3 text-[17px] leading-7 text-gray-500">
                <p>$: ក្រោម $3</p>

                <p>$$: $3 ដល់ក្រោម $6</p>

                <p>$$$: $6 ឡើងទៅ</p>
              </div>
            </FilterSection>

            <div className="h-4" />
          </div>
        )}
      </div>
    </motion.aside>
  );
}
