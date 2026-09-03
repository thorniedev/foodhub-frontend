"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IoChevronBack,
  IoChevronDown,
  IoCloseOutline,
  IoNutritionOutline,
  IoPricetagOutline,
  IoSearchOutline,
  IoSwapVerticalOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { FaFire, FaStar } from "react-icons/fa";
import { MdOutlineCategory } from "react-icons/md";

import type { MenuItem } from "@/types/manu";
import type {
  LocationFoodFilterState,
  LocationFoodSort,
} from "@/types/location-food-filter";
import { DEFAULT_LOCATION_FOOD_FILTERS } from "@/types/location-food-filter";
import { countActiveLocationFoodFilters } from "@/lib/location/location-food-filter";
import { isDrinkCategory, isFoodCategory, type CategoryFilterType } from "@/lib/category-filter";

type Props = {
  menuItems: MenuItem[];
  filters: LocationFoodFilterState;
  onChange: (filters: LocationFoodFilterState) => void;
  onClose?: () => void;
};

type FilterOption = {
  code: string;
  name: string;
  count: number;
};

type NumericOption = {
  value: number;
  label: string;
};

type FilterSectionProps = {
  title: string;
  icon: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
};

type CheckboxOptionProps = {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
};

type SingleChoiceProps<T extends string | number> = {
  options: Array<{ value: T; label: string }>;
  selected: T | null;
  onChange: (value: T | null) => void;
};

type ContextMenuItem = MenuItem & {
  origin?: {
    provinceCode?: string | null;
    provinceName?: string | null;
    provinceLocalName?: string | null;
  };
  recommendationContext?: {
    seasons?: Array<{ code: string; name: string; localName?: string }>;
    events?: Array<{ code: string; name: string; localName?: string }>;
    provincePopularity?: Array<{
      provinceCode: string;
      provinceName: string;
      provinceLocalName?: string;
    }>;
    suitableWeather?: Array<{
      code: string;
      name: string;
      localName?: string;
    }>;
  };
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
  { value: 5, label: "ក្រោម 5 km" },
  { value: 10, label: "ក្រោម 10 km" },
  { value: 20, label: "ក្រោម 20 km" },
];

const RATING_OPTIONS: NumericOption[] = [
  { value: 4.0, label: "4.0 ឡើងទៅ" },
  { value: 4.5, label: "4.5 ឡើងទៅ" },
  { value: 4.7, label: "4.7 ឡើងទៅ" },
  { value: 4.8, label: "4.8 ឡើងទៅ" },
];

const MATCH_SCORE_OPTIONS: NumericOption[] = [
  { value: 0.8, label: "80% ឡើងទៅ" },
  { value: 0.9, label: "90% ឡើងទៅ" },
  { value: 0.95, label: "95% ឡើងទៅ" },
];

const SORT_OPTIONS: Array<{ value: LocationFoodSort; label: string }> = [
  { value: "recommended", label: "ការណែនាំល្អបំផុត" },
  { value: "popular", label: "ពេញនិយមបំផុត" },
  { value: "rating", label: "ចំណាត់ថ្នាក់ខ្ពស់" },
  { value: "fastest", label: "រៀបចំលឿនបំផុត" },
  { value: "nearest", label: "នៅជិតបំផុត" },
  { value: "price-low", label: "តម្លៃទាបទៅខ្ពស់" },
  { value: "price-high", label: "តម្លៃខ្ពស់ទៅទាប" },
];

const OPEN_SECTION_DEFAULTS: Record<string, boolean> = {
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
};

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function toggleNumber(list: number[], value: number): number[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function getUniqueOptions(
  values: Array<{ code?: unknown; name?: unknown }>,
): FilterOption[] {
  const map = new Map<string, FilterOption>();

  values.forEach((item) => {
    if (!item) return;

    const code =
      typeof item.code === "string" || typeof item.code === "number"
        ? String(item.code).trim()
        : "";
    const name =
      typeof item.name === "string" || typeof item.name === "number"
        ? String(item.name).trim()
        : "";
    if (!code || !name) return;

    const existing = map.get(code);
    if (existing) {
      existing.count += 1;
      return;
    }

    map.set(code, { code, name, count: 1 });
  });

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

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
        className="flex w-full cursor-pointer items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 text-lg font-bold text-primary-900">
          <span className="text-[22px] text-primary-700">{icon}</span>
          {title}
        </span>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400"
        >
          <IoChevronDown className="text-[22px]" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
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
    <motion.label
      layout
      initial={{ opacity: 0, scale: 0.97, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.22 }}
      className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition hover:bg-primary-50"
    >
      <span className="flex min-w-0 items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 shrink-0 accent-primary-800"
        />
        <span className="truncate text-lg text-gray-700">{label}</span>
      </span>

      {typeof count === "number" && (
        <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-base font-semibold text-gray-500">
          {count}
        </span>
      )}
    </motion.label>
  );
}

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
            className={`rounded-full border px-4 py-2 text-lg font-semibold transition ${
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

export default function LocationFilters({
  menuItems,
  filters,
  onChange,
  onClose,
}: Props) {
  const isDrawer = Boolean(onClose);
  const [collapsed, setCollapsed] = useState(false);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [categoryType, setCategoryType] = useState<CategoryFilterType>("ALL");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    OPEN_SECTION_DEFAULTS,
  );

  const contextualItems = menuItems as ContextMenuItem[];

  const categoryOptions = useMemo(
    () =>
      getUniqueOptions(
        menuItems.flatMap((item) => {
          const category = item.food?.category;

          return category?.code && category?.name
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
          const cuisine = item.food?.cuisine;

          return cuisine?.code && cuisine?.name
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
    () =>
      getUniqueOptions(
        menuItems.flatMap((item) =>
          (item.mealTypes ?? []).map((option) => ({
            code: option.code,
            name: option.name,
          })),
        ),
      ),
    [menuItems],
  );

  const dietaryTypeOptions = useMemo(
    () =>
      getUniqueOptions(
        menuItems.flatMap((item) =>
          (item.dietaryTypes ?? []).map((option) => ({
            code: option.code,
            name: option.name,
          })),
        ),
      ),
    [menuItems],
  );

  const ageGroupOptions = useMemo(
    () =>
      getUniqueOptions(
        menuItems.flatMap((item) =>
          (item.food?.ageGroups ?? []).map((option) => ({
            code: option.code,
            name: option.name,
          })),
        ),
      ),
    [menuItems],
  );

  const allergenOptions = useMemo(
    () =>
      getUniqueOptions(
        menuItems.flatMap((item) =>
          (item.allergenDeclarations ?? []).flatMap((option) => {
            if (!option) {
              return [];
            }

            const code =
              typeof option.code === "string" ? option.code.trim() : "";

            const name =
              typeof option.name === "string" ? option.name.trim() : code;

            return code && name
              ? [
                  {
                    code,
                    name,
                  },
                ]
              : [];
          }),
        ),
      ),
    [menuItems],
  );

  const storeOptions = useMemo(() => {
    const map = new Map<string, FilterOption>();

    menuItems.forEach((item) => {
      const uuid = item.store?.uuid?.trim();
      const name =
        item.store?.localName?.trim() || item.store?.name?.trim() || "";

      if (!uuid || !name) {
        return;
      }

      const existing = map.get(uuid);

      if (existing) {
        existing.count += 1;
        return;
      }

      map.set(uuid, {
        code: uuid,
        name,
        count: 1,
      });
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [menuItems]);

  const ingredientOptions = useMemo(
    () =>
      getUniqueOptions(
        menuItems.flatMap((item) =>
          (item.ingredients ?? []).flatMap((ingredient) => {
            if (typeof ingredient !== "string") {
              return [];
            }

            const value = ingredient.trim();

            return value
              ? [
                  {
                    code: value,
                    name: value,
                  },
                ]
              : [];
          }),
        ),
      ),
    [menuItems],
  );

  const seasonOptions = useMemo(
    () =>
      getUniqueOptions(
        contextualItems.flatMap((item) =>
          (item.recommendationContext?.seasons ?? []).map((option) => ({
            code: option.code,
            name: option.localName || option.name,
          })),
        ),
      ),
    [contextualItems],
  );

  const eventOptions = useMemo(
    () =>
      getUniqueOptions(
        contextualItems.flatMap((item) =>
          (item.recommendationContext?.events ?? []).map((option) => ({
            code: option.code,
            name: option.localName || option.name,
          })),
        ),
      ),
    [contextualItems],
  );

  const provinceOptions = useMemo(
    () =>
      getUniqueOptions(
        contextualItems.flatMap((item) =>
          (item.recommendationContext?.provincePopularity ?? []).map(
            (option) => ({
              code: option.provinceCode,
              name: option.provinceLocalName || option.provinceName,
            }),
          ),
        ),
      ),
    [contextualItems],
  );

  const weatherOptions = useMemo(
    () =>
      getUniqueOptions(
        contextualItems.flatMap((item) =>
          (item.recommendationContext?.suitableWeather ?? []).map((option) => ({
            code: option.code,
            name: option.localName || option.name,
          })),
        ),
      ),
    [contextualItems],
  );

  const originProvinceOptions = useMemo(
    () =>
      getUniqueOptions(
        contextualItems.flatMap((item) => {
          const origin = item.origin;
          if (!origin?.provinceCode) return [];

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
    [contextualItems],
  );

  const visibleCategoryOptions = useMemo(() => {
    let list = categoryOptions;
    if (categoryType === "FOOD") {
      list = list.filter((opt) => isFoodCategory(opt));
    } else if (categoryType === "DRINK") {
      list = list.filter((opt) => isDrinkCategory(opt));
    }
    if (categoryQuery.trim()) {
      const q = categoryQuery.trim().toLowerCase();
      list = list.filter((opt) => opt.name.toLowerCase().includes(q));
    }
    return list;
  }, [categoryOptions, categoryType, categoryQuery]);

  const activeFilterCount = countActiveLocationFoodFilters(filters);

  const toggleSection = (key: string) => {
    setOpenSections((current) => ({ ...current, [key]: !current[key] }));
  };

  const openCollapsedSection = (key: string) => {
    setCollapsed(false);
    setOpenSections((current) => ({ ...current, [key]: true }));
  };

  const update = <K extends keyof LocationFoodFilterState>(
    key: K,
    value: LocationFoodFilterState[K],
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const collapsedItems = [
    { key: "sort", label: "តម្រៀបតាម", icon: <IoSwapVerticalOutline /> },
    { key: "category", label: "ប្រភេទម្ហូប", icon: <MdOutlineCategory /> },
    { key: "mealType", label: "ពេលទទួលទាន", icon: <IoTimeOutline /> },
    { key: "dietaryType", label: "របបអាហារ", icon: <IoNutritionOutline /> },
    { key: "distance", label: "ចម្ងាយ", icon: <IoTimeOutline /> },
    { key: "price", label: "តម្លៃ", icon: <IoPricetagOutline /> },
  ];

  return (
    <motion.aside
      animate={
        isDrawer
          ? undefined
          : {
              width: collapsed ? 78 : 300,
            }
      }
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      className={isDrawer ? "h-full w-full" : "h-[calc(100vh-8rem)] shrink-0"}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
        <div
          className={`shrink-0 border-b border-gray-100 bg-white ${
            collapsed && !isDrawer ? "p-3" : "p-5"
          }`}
        >
          <div
            className={`flex items-center ${
              collapsed && !isDrawer ? "justify-center" : "justify-between"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {(!collapsed || isDrawer) && (
                <motion.div
                  key="location-food-filter-heading"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
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
                    ជ្រើសរើសមុខម្ហូបតាមចំណូលចិត្ត
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {isDrawer ? (
              <motion.button
                type="button"
                onClick={onClose}
                whileTap={{ scale: 0.9 }}
                aria-label="Close food filters"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition hover:bg-primary-50 hover:text-primary-700"
              >
                <IoCloseOutline className="text-[24px]" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={() => setCollapsed((current) => !current)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.9 }}
                aria-label={
                  collapsed ? "Expand food filters" : "Collapse food filters"
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition hover:bg-primary-50 hover:text-primary-700"
              >
                <motion.span animate={{ rotate: collapsed ? 180 : 0 }}>
                  <IoChevronBack className="text-[21px]" />
                </motion.span>
              </motion.button>
            )}
          </div>

          {(!collapsed || isDrawer) && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
              <p className="text-lg font-medium text-gray-500">
                {activeFilterCount} តម្រងបានជ្រើស
              </p>
              <button
                type="button"
                disabled={activeFilterCount === 0}
                onClick={() => onChange({ ...DEFAULT_LOCATION_FOOD_FILTERS })}
                className="text-lg font-bold text-secondary-500 transition hover:underline disabled:cursor-not-allowed disabled:opacity-40"
              >
                សម្អាតទាំងអស់
              </button>
            </div>
          )}
        </div>

        {collapsed && !isDrawer ? (
          <div className="flex flex-1 flex-col items-center gap-3 overflow-y-auto px-3 py-4">
            {collapsedItems.map((item) => (
              <motion.button
                key={item.key}
                type="button"
                title={item.label}
                aria-label={item.label}
                whileHover={{
                  scale: 1.08,
                  backgroundColor: "rgb(240 253 244)",
                }}
                whileTap={{ scale: 0.9 }}
                onClick={() => openCollapsedSection(item.key)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[21px] text-primary-700"
              >
                {item.icon}
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-2 [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-primary-700">
            <FilterSection
              title="តម្រៀបតាម"
              icon={<IoSwapVerticalOutline />}
              isOpen={openSections.sort}
              onToggle={() => toggleSection("sort")}
            >
              <div className="flex flex-col gap-2">
                <AnimatePresence mode="popLayout">
                  {SORT_OPTIONS.map((option) => {
                    const selected = filters.sortBy === option.value;
                    return (
                      <motion.label
                        layout
                        initial={{ opacity: 0, scale: 0.97, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.22 }}
                        key={option.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
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
                          className="h-4 w-4 shrink-0 accent-primary-800"
                        />
                        <span className="text-lg font-medium">{option.label}</span>
                      </motion.label>
                    );
                  })}
                </AnimatePresence>
              </div>
            </FilterSection>

            <FilterSection
              title="ប្រភេទម្ហូប និងភេសជ្ជៈ"
              icon={<MdOutlineCategory />}
              isOpen={openSections.category}
              onToggle={() => toggleSection("category")}
            >
              {/* Category Type Selector */}
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
              <div className="mb-3 flex min-h-12 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 transition focus-within:border-primary-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-50">
                <IoSearchOutline className="shrink-0 text-[22px] text-gray-400" />
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
                  className="w-full bg-transparent text-lg text-gray-700 outline-none placeholder:text-gray-400"
                />
              </div>
              <div className="max-h-[230px] space-y-1 overflow-y-auto pr-2">
                <AnimatePresence mode="popLayout">
                  {visibleCategoryOptions.length > 0 ? (
                    visibleCategoryOptions.map((option) => (
                      <CheckboxOption
                        key={option.code}
                        label={option.name}
                        count={option.count}
                        checked={filters.categoryCodes.includes(option.code)}
                        onChange={() =>
                          update(
                            "categoryCodes",
                            toggleInList(filters.categoryCodes, option.code),
                          )
                        }
                      />
                    ))
                  ) : (
                    <motion.p
                      layout
                      initial={{ opacity: 0, scale: 0.97, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.22 }}
                      className="py-2 text-center text-xs text-gray-400"
                    >
                      រកមិនឃើញប្រភេទដែលត្រូវគ្នា
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </FilterSection>

            <FilterSection
              title="ម្ហូបតាមប្រទេស"
              icon={<MdOutlineCategory />}
              isOpen={openSections.cuisine}
              onToggle={() => toggleSection("cuisine")}
            >
              {cuisineOptions.map((option) => (
                <CheckboxOption
                  key={option.code}
                  label={option.name}
                  count={option.count}
                  checked={filters.cuisineCodes.includes(option.code)}
                  onChange={() =>
                    update(
                      "cuisineCodes",
                      toggleInList(filters.cuisineCodes, option.code),
                    )
                  }
                />
              ))}
            </FilterSection>

            <FilterSection
              title="ពេលទទួលទាន"
              icon={<IoTimeOutline />}
              isOpen={openSections.mealType}
              onToggle={() => toggleSection("mealType")}
            >
              {mealTypeOptions.map((option) => (
                <CheckboxOption
                  key={option.code}
                  label={option.name}
                  count={option.count}
                  checked={filters.mealTypeCodes.includes(option.code)}
                  onChange={() =>
                    update(
                      "mealTypeCodes",
                      toggleInList(filters.mealTypeCodes, option.code),
                    )
                  }
                />
              ))}
            </FilterSection>

            <FilterSection
              title="របបអាហារ"
              icon={<IoNutritionOutline />}
              isOpen={openSections.dietaryType}
              onToggle={() => toggleSection("dietaryType")}
            >
              {dietaryTypeOptions.map((option) => (
                <CheckboxOption
                  key={option.code}
                  label={option.name}
                  count={option.count}
                  checked={filters.dietaryTypeCodes.includes(option.code)}
                  onChange={() =>
                    update(
                      "dietaryTypeCodes",
                      toggleInList(filters.dietaryTypeCodes, option.code),
                    )
                  }
                />
              ))}
            </FilterSection>

            <FilterSection
              title="ក្រុមអាយុ"
              icon={<IoNutritionOutline />}
              isOpen={openSections.ageGroup}
              onToggle={() => toggleSection("ageGroup")}
            >
              {ageGroupOptions.map((option) => (
                <CheckboxOption
                  key={option.code}
                  label={option.name}
                  count={option.count}
                  checked={filters.ageGroupCodes.includes(option.code)}
                  onChange={() =>
                    update(
                      "ageGroupCodes",
                      toggleInList(filters.ageGroupCodes, option.code),
                    )
                  }
                />
              ))}
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
              {allergenOptions.map((option) => (
                <CheckboxOption
                  key={option.code}
                  label={`គ្មាន ${option.name}`}
                  count={option.count}
                  checked={filters.excludedAllergenCodes.includes(option.code)}
                  onChange={() =>
                    update(
                      "excludedAllergenCodes",
                      toggleInList(filters.excludedAllergenCodes, option.code),
                    )
                  }
                />
              ))}
            </FilterSection>

            <FilterSection
              title="កម្រិតហឹរ"
              icon={<FaFire />}
              isOpen={openSections.spice}
              onToggle={() => toggleSection("spice")}
            >
              {SPICE_OPTIONS.map((option) => (
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
                onChange={(value) => update("maximumPreparationMinutes", value)}
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
                onChange={(value) => update("maximumDistanceKm", value)}
              />
            </FilterSection>

            <FilterSection
              title="រដូវកាលនៅកម្ពុជា"
              icon={<FaFire />}
              isOpen={openSections.seasons}
              onToggle={() => toggleSection("seasons")}
            >
              {seasonOptions.map((option) => (
                <CheckboxOption
                  key={option.code}
                  label={option.name}
                  count={option.count}
                  checked={filters.seasonCodes.includes(option.code)}
                  onChange={() =>
                    update(
                      "seasonCodes",
                      toggleInList(filters.seasonCodes, option.code),
                    )
                  }
                />
              ))}
            </FilterSection>

            <FilterSection
              title="ពិធីបុណ្យ និងព្រឹត្តិការណ៍"
              icon={<FaStar />}
              isOpen={openSections.events}
              onToggle={() => toggleSection("events")}
            >
              {eventOptions.map((option) => (
                <CheckboxOption
                  key={option.code}
                  label={option.name}
                  count={option.count}
                  checked={filters.eventCodes.includes(option.code)}
                  onChange={() =>
                    update(
                      "eventCodes",
                      toggleInList(filters.eventCodes, option.code),
                    )
                  }
                />
              ))}
            </FilterSection>

            <FilterSection
              title="ពេញនិយមតាមខេត្ត"
              icon={<MdOutlineCategory />}
              isOpen={openSections.provinces}
              onToggle={() => toggleSection("provinces")}
            >
              <div className="max-h-[230px] overflow-y-auto pr-2">
                {provinceOptions.map((option) => (
                  <CheckboxOption
                    key={option.code}
                    label={option.name}
                    count={option.count}
                    checked={filters.provinceCodes.includes(option.code)}
                    onChange={() =>
                      update(
                        "provinceCodes",
                        toggleInList(filters.provinceCodes, option.code),
                      )
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
              {weatherOptions.map((option) => (
                <CheckboxOption
                  key={option.code}
                  label={option.name}
                  count={option.count}
                  checked={filters.weatherCodes.includes(option.code)}
                  onChange={() =>
                    update(
                      "weatherCodes",
                      toggleInList(filters.weatherCodes, option.code),
                    )
                  }
                />
              ))}
            </FilterSection>

            {originProvinceOptions.length > 0 && (
              <FilterSection
                title="ប្រភពដើមតាមខេត្ត"
                icon={<MdOutlineCategory />}
                isOpen={openSections.originProvince}
                onToggle={() => toggleSection("originProvince")}
              >
                {originProvinceOptions.map((option) => (
                  <CheckboxOption
                    key={option.code}
                    label={option.name}
                    count={option.count}
                    checked={filters.originProvinceCodes.includes(option.code)}
                    onChange={() =>
                      update(
                        "originProvinceCodes",
                        toggleInList(filters.originProvinceCodes, option.code),
                      )
                    }
                  />
                ))}
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
                onChange={(value) => update("minimumRating", value)}
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
                  update("minimumRecommendationScore", value)
                }
              />
            </FilterSection>

            <FilterSection
              title="ហាងអាហារ"
              icon={<MdOutlineCategory />}
              isOpen={openSections.stores}
              onToggle={() => toggleSection("stores")}
            >
              <div className="max-h-[230px] overflow-y-auto pr-2">
                {storeOptions.map((option) => (
                  <CheckboxOption
                    key={option.code}
                    label={option.name}
                    count={option.count}
                    checked={filters.storeIds.includes(option.code)}
                    onChange={() =>
                      update(
                        "storeIds",
                        toggleInList(filters.storeIds, option.code),
                      )
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
              <div className="max-h-[260px] overflow-y-auto pr-2">
                {ingredientOptions.map((option) => (
                  <CheckboxOption
                    key={option.code}
                    label={option.name}
                    count={option.count}
                    checked={filters.ingredientNames.includes(option.code)}
                    onChange={() =>
                      update(
                        "ingredientNames",
                        toggleInList(filters.ingredientNames, option.code),
                      )
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
                onChange={() => update("highFiberOnly", !filters.highFiberOnly)}
              />
              <CheckboxOption
                label="Sodium ក្រោម 600mg"
                checked={filters.lowSodiumOnly}
                onChange={() => update("lowSodiumOnly", !filters.lowSodiumOnly)}
              />
            </FilterSection>

            <FilterSection
              title="តម្លៃ"
              icon={<IoPricetagOutline />}
              isOpen={openSections.price}
              onToggle={() => toggleSection("price")}
            >
              <div className="grid grid-cols-3 gap-2">
                {(["$", "$$", "$$$"] as const).map((tier) => {
                  const selected = filters.priceTier === tier;
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() =>
                        update("priceTier", selected ? null : tier)
                      }
                      className={`rounded-xl border py-2.5 text-[16px] font-semibold transition ${
                        selected
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

            <div className="h-4" />
          </div>
        )}
      </div>
    </motion.aside>
  );
}
