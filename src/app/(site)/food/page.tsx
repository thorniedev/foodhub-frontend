"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoSearchOutline,
  IoLocationOutline,
  IoOptionsOutline,
  IoChevronForward,
  IoChevronBack,
  IoChevronDown,
  IoSwapVerticalOutline,
  IoTimeOutline,
  IoPricetagOutline,
  IoNutritionOutline,
  IoPeopleOutline,
} from "react-icons/io5";
import { IoMdTime } from "react-icons/io";
import { FaStar, FaStore } from "react-icons/fa";
import { CiHeart } from "react-icons/ci";
import { MdDeliveryDining } from "react-icons/md";

import FoodCardComponent from "@/components/FoodCardComponent";

import FoodNavTabs, { FoodTabId } from "@/components/Foodnavtabs";

import { useGetMenuItemsQuery } from "@/redux/api/fooodApi";
import { FoodItem } from "@/types/food";
import Link from "next/link";
import LocationPanel from "@/components/food/LocationPanel";
import StorePanel from "@/components/food/StorePanel";

/* -------------------------------------------------------------------- */
/* Types                                                                */
/* -------------------------------------------------------------------- */

type SortBy = "popular" | "rating" | "fastest";

// Shape used by the local mock-filtering helpers below (applyFilters /
// FoodSection). Replace/remove once filtering runs against live `foods`.
type ListedFood = {
  id: string | number;
  mealTime: string;
  store: string;
  name: string;
  description: string;
  rating: number;
  time: string;
  distance: string;
  price: string;
  tags: string[];
  foodTypes: string[];
  dietTypes: string[];
  ageGroups: string[];
  province: string;
  image: string;
};

type FilterState = {
  sortBy: SortBy;

  // when user eats
  mealTimes: string[];

  // what food category
  categories: string[];

  // health preference
  dietTypes: string[];

  // age recommendation
  ageGroups: string[];

  // country/cuisine
  cuisines: string[];

  // special occasions
  specialTypes: string[];

  // food type search section
  foodTypes: string[];
  foodTypeQuery: string;

  // province (popular-in-province)
  provinces: string[];
  provinceQuery: string;

  // price
  priceTier: "$" | "$$" | "$$$" | null;

  searchQuery: string;
};

const DEFAULT_FILTERS: FilterState = {
  sortBy: "popular",

  mealTimes: [],
  categories: [],
  dietTypes: [],
  ageGroups: [],
  cuisines: [],
  specialTypes: [],

  foodTypes: [],
  foodTypeQuery: "",

  provinces: [],
  provinceQuery: "",

  priceTier: null,
  searchQuery: "",
};

/* -------------------------------------------------------------------- */
/* Category Tabs — Main Food Categories                                 */
/* -------------------------------------------------------------------- */

const CATEGORY_TABS = [
  "ទាំងអស់",

  // Food
  "ចំណីអាហារ",
  "អាហារខ្មែរ",
  "អាហារសមុទ្រ",
  "សាច់អាំង",
  "ស៊ុប",
  "បាយ",
  "មី",
  "បន្លែ",

  // International Food
  "អាហារចិន",
  "អាហារកូរ៉េ",
  "អាហារជប៉ុន",
  "អាហារថៃ",
  "អាហារវៀតណាម",
  "អាហារបារាំង",

  // Fast Food
  "Fast Food",
  "Pizza",
  "Burger",
  "Chicken",
  "BBQ",

  // Drink & Dessert
  "ភេសជ្ជៈ",
  "Coffee",
  "Milk Tea",
  "Smoothie",
  "បង្អែម",
];

/* -------------------------------------------------------------------- */
/* Diet & Health Preferences — User Goal Based Filters                 */
/* -------------------------------------------------------------------- */

const DIET_FILTERS = [
  "អាហារសុខភាព",
  "អាហារបួស",
  "អាហារ Vegan",
  "អាហារ Halal",

  // Nutrition Goal
  "អាហារមានប្រូតេអ៊ីនខ្ពស់",
  "អាហារសម្រាប់សម្រកទម្ងន់",
  "អាហារសម្រាប់ឡើងទម្ងន់",

  // Health Condition
  "អាហារគ្មានជាតិស្ករ",
  "អាហារគ្មានជាតិក្លុយតែន",
  "អាហារកាត់បន្ថយជាតិខ្លាញ់",
  "អាហារកាត់បន្ថយអំបិល",
];

/* -------------------------------------------------------------------- */
/* Age Group Recommendation — real-world life stages                    */
/* "young" is a parent group broken into infant/child sub-stages so a    */
/* user can pick, e.g., baby 0–6 months specifically.                    */
/* -------------------------------------------------------------------- */

type AgeOption = { label: string; value: string };
type AgeGroupCategory = {
  label: string;
  value: string;
  children?: AgeOption[];
};

const AGE_GROUPS: AgeGroupCategory[] = [
  {
    label: "កុមារ / យុវវ័យ",
    value: "young",
    children: [
      { label: "ទារក ០–៦ ខែ", value: "baby_0_6m" },
      { label: "ទារក ៦–១២ ខែ", value: "baby_6_12m" },
      { label: "កុមារតូច ១–៣ ឆ្នាំ", value: "toddler_1_3y" },
      { label: "កុមារមតេយ្យ ៣–៥ ឆ្នាំ", value: "preschool_3_5y" },
      { label: "កុមារ ៦–១២ ឆ្នាំ", value: "child_6_12y" },
      { label: "យុវវ័យ ១៣–១៧ ឆ្នាំ", value: "teen_13_17y" },
    ],
  },
  {
    label: "មនុស្សពេញវ័យ ១៨–៥៩ ឆ្នាំ",
    value: "adult_18_59y",
  },
  {
    label: "មនុស្សចាស់ ៦០+ ឆ្នាំ",
    value: "elderly_60y",
  },
];

/* -------------------------------------------------------------------- */
/* Meal Time Filters                                                     */
/* -------------------------------------------------------------------- */

const MEAL_TIME_FILTERS = [
  {
    label: "ពេលព្រឹក",
    value: "breakfast",
  },
  {
    label: "ពេលថ្ងៃ",
    value: "lunch",
  },
  {
    label: "ពេលល្ងាច",
    value: "dinner",
  },
  {
    label: "អាហារសម្រន់",
    value: "snack",
  },
];

// label -> value lookup, derived from MEAL_TIME_FILTERS. The sidebar stores
// the Khmer labels in filters.mealTimes; applyFilters maps them to values.
const MEAL_TIME_LABEL_TO_VALUE: Record<string, string> = Object.fromEntries(
  MEAL_TIME_FILTERS.map((m) => [m.label, m.value]),
);

/* -------------------------------------------------------------------- */
/* Cuisine / Country Filters                                             */
/* -------------------------------------------------------------------- */

const CUISINE_FILTERS = [
  "ខ្មែរ",
  "ចិន",
  "ជប៉ុន",
  "កូរ៉េ",
  "ថៃ",
  "វៀតណាម",
  "បារាំង",
  "អ៊ីតាលី",
  "អាមេរិក",
];

/* -------------------------------------------------------------------- */
/* Special Food Filters                                                  */
/* -------------------------------------------------------------------- */

const SPECIAL_FILTERS = [
  "អាហារតាមរដូវ",
  "អាហារពិធីបុណ្យ",
  "អាហារពេញនិយម",
  "អាហារថ្មីៗ",
  "ម្ហូបប្រចាំថ្ងៃ",
];

/* -------------------------------------------------------------------- */
/* Price Filter                                                          */
/* -------------------------------------------------------------------- */

const PRICE_FILTERS = [
  {
    label: "តម្លៃថោក",
    value: "$",
  },
  {
    label: "តម្លៃមធ្យម",
    value: "$$",
  },
  {
    label: "តម្លៃខ្ពស់",
    value: "$$$",
  },
];

/* -------------------------------------------------------------------- */
/* Food Type Search                                                      */
/* -------------------------------------------------------------------- */

const FOOD_TYPE_FILTERS = [
  "ម្ហូបចិន",
  "ម្ហូបវៀតណាម",
  "ម្ហូបកូរ៉េ",
  "ភេសជ្ជៈ",
  "បង្អែម",
  "Fast Food",
];

/* -------------------------------------------------------------------- */
/* Province Filter — popular food by province                           */
/* -------------------------------------------------------------------- */

const PROVINCE_FILTERS = [
  "ភ្នំពេញ",
  "បាត់ដំបង",
  "សៀមរាប",
  "កំពត",
  "កែប",
  "ព្រះសីហនុ",
  "កំពង់ចាម",
  "ត្បូងឃ្មុំ",
  "កំពង់ស្ពឺ",
  "កំពង់ធំ",
  "កំពង់ឆ្នាំង",
  "តាកែវ",
  "កណ្ដាល",
  "ព្រៃវែង",
  "ស្វាយរៀង",
  "ពោធិ៍សាត់",
  "បន្ទាយមានជ័យ",
  "ក្រចេះ",
  "មណ្ឌលគិរី",
  "រតនគិរី",
  "ស្ទឹងត្រែង",
  "ព្រះវិហារ",
  "ឧត្តរមានជ័យ",
  "ប៉ៃលិន",
  "កោះកុង",
];

/* -------------------------------------------------------------------- */
/* Mock data — replace with live `foods` when wiring real filtering.    */
/* Left empty so the file compiles; applyFilters/FoodSection stay usable */
/* -------------------------------------------------------------------- */

const NEW_FOODS: ListedFood[] = [];
const POPULAR_FOODS: ListedFood[] = [];

function toggleInList(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

function matchesPriceTier(price: string, tier: FilterState["priceTier"]) {
  if (!tier) return true;
  const value = parseFloat(price);
  if (Number.isNaN(value)) return true;
  if (tier === "$") return value < 2;
  if (tier === "$$") return value >= 2 && value < 3;
  return value >= 3;
}

function parseMinutes(time: string) {
  const match = time.match(/\d+/);
  return match ? Number(match[0]) : Infinity;
}

function applyFilters(foods: ListedFood[], filters: FilterState) {
  const filtered = foods.filter((food) => {
    if (filters.mealTimes.length > 0) {
      const allowedValues = filters.mealTimes.map(
        (l) => MEAL_TIME_LABEL_TO_VALUE[l],
      );
      if (!allowedValues.includes(food.mealTime)) return false;
    }
    if (filters.foodTypes.length > 0) {
      const hasMatch = food.foodTypes.some((t) =>
        filters.foodTypes.includes(t),
      );
      if (!hasMatch) return false;
    }
    if (filters.dietTypes.length > 0) {
      const hasMatch = food.dietTypes.some((t) =>
        filters.dietTypes.includes(t),
      );
      if (!hasMatch) return false;
    }
    if (filters.ageGroups.length > 0) {
      const hasMatch = food.ageGroups.some((t) =>
        filters.ageGroups.includes(t),
      );
      if (!hasMatch) return false;
    }
    if (filters.provinces.length > 0) {
      if (!filters.provinces.includes(food.province)) return false;
    }
    if (!matchesPriceTier(food.price, filters.priceTier)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (filters.sortBy === "fastest")
      return parseMinutes(a.time) - parseMinutes(b.time);
    if (filters.sortBy === "rating") return b.rating - a.rating;
    return b.rating - a.rating; // "popular" — no real popularity metric yet, rating is the best proxy
  });

  return sorted;
}

/* -------------------------------------------------------------------- */
/*  Search + location + sort row                                        */
/* -------------------------------------------------------------------- */

function SearchRow() {
  return (
    <div className="mx-auto  flex max-w-7xl container flex-col gap-3 px-6 pt-6 md:flex-row md:items-center ">
      <div className="flex flex-1  items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5">
        <IoSearchOutline className="text-lg text-gray-400" />
        <input
          type="text"
          placeholder="ស្វែងរកម្ហូបអ្វីមួយ..."
          className="w-full text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
        />
      </div>

      <button
        type="button"
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
      >
        <IoLocationOutline className="shrink-0 text-lg text-primary-700" />
        <span className="whitespace-nowrap">
          កំណត់ទីតាំងដើម្បីទទួលបានលទ្ធផលល្អ
        </span>
      </button>

      <button
        type="button"
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
      >
        <IoOptionsOutline className="text-lg text-primary-700" />
        <span className="whitespace-nowrap">ប្រភេទអាហារ</span>
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/*  Filter sidebar — collapsible dashboard style, accordion sections    */
/* -------------------------------------------------------------------- */

function FilterPill({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={{ scale: 0.96 }}
      className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-colors duration-200 cursor-pointer ${
        active
          ? "border-primary-800 bg-primary-800 text-white"
          : "border-gray-200 text-gray-600 hover:border-primary-300"
      }`}
    >
      {label}
    </motion.button>
  );
}

type FilterSectionProps = {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
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
        className="flex w-full items-center justify-between text-sm font-medium text-gray-700 cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <span className="text-base text-primary-700">{icon}</span>
          {title}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="text-gray-400"
        >
          <IoChevronDown className="text-xs" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/*  Age group filter — nested life stages ("young" expands to sub-stages) */
/* -------------------------------------------------------------------- */

function AgeGroupFilter({
  selected,
  onToggleValue,
}: {
  selected: string[];
  onToggleValue: (value: string) => void;
}) {
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({
    young: true,
  });

  return (
    <div className="flex flex-col gap-2">
      {AGE_GROUPS.map((group) => {
        if (!group.children) {
          return (
            <FilterPill
              key={group.value}
              label={group.label}
              active={selected.includes(group.value)}
              onToggle={() => onToggleValue(group.value)}
            />
          );
        }

        const isOpen = openCats[group.value];
        const selectedCount = group.children.filter((c) =>
          selected.includes(c.value),
        ).length;

        return (
          <div key={group.value} className="rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() =>
                setOpenCats((prev) => ({
                  ...prev,
                  [group.value]: !prev[group.value],
                }))
              }
              className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-gray-700 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {group.label}
                {selectedCount > 0 && (
                  <span className="rounded-full bg-primary-800 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {selectedCount}
                  </span>
                )}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-gray-400"
              >
                <IoChevronDown className="text-xs" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="children"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-2 border-t border-gray-100 px-3 py-2.5">
                    {group.children.map((child) => (
                      <label
                        key={child.value}
                        className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selected.includes(child.value)}
                          onChange={() => onToggleValue(child.value)}
                          className="h-3.5 w-3.5 accent-primary-800"
                        />
                        {child.label}
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

const SIDEBAR_SECTIONS = [
  { key: "sort", label: "តម្រៀបតាម", icon: <IoSwapVerticalOutline /> },
  { key: "mealTime", label: "ពេលវេលាទទួលទាន", icon: <IoTimeOutline /> },
  { key: "foodType", label: "ប្រភេទចំណីអាហារ", icon: <IoSearchOutline /> },
  { key: "dietType", label: "របបអាហារ", icon: <IoNutritionOutline /> },
  { key: "ageGroup", label: "ក្រុមអាយុ", icon: <IoPeopleOutline /> },
  { key: "province", label: "ពេញនិយមតាមខេត្ត", icon: <IoLocationOutline /> },
  { key: "price", label: "ថ្លៃ", icon: <IoPricetagOutline /> },
] as const;

function FilterSidebar({
  filters,
  onChange,
}: {
  filters: FilterState;
  onChange: (next: FilterState) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sort: true,
    mealTime: true,
    foodType: false,
    dietType: false,
    ageGroup: false,
    province: false,
    price: true,
  });

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const visibleFoodTypes = FOOD_TYPE_FILTERS.filter((opt) =>
    opt.toLowerCase().includes(filters.foodTypeQuery.trim().toLowerCase()),
  );

  const visibleProvinces = PROVINCE_FILTERS.filter((opt) =>
    opt.toLowerCase().includes(filters.provinceQuery.trim().toLowerCase()),
  );

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 264 }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      className="sidebar-scroll sticky top-30 hidden max-h-[calc(100vh-6rem)] shrink-0 self-start overflow-y-auto overflow-x-hidden lg:block"
    >
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait" initial={false}>
            {!collapsed && (
              <motion.h2
                key="title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap text-base font-semibold text-primary-900"
              >
                Filter
              </motion.h2>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            whileTap={{ scale: 0.9 }}
            aria-label={collapsed ? "Expand filters" : "Collapse filters"}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-50 cursor-pointer ${
              collapsed ? "mx-auto" : ""
            }`}
          >
            <motion.span
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <IoChevronBack />
            </motion.span>
          </motion.button>
        </div>

        {collapsed && (
          <div className="mt-5 flex flex-col items-center gap-4">
            {SIDEBAR_SECTIONS.map((section) => (
              <motion.button
                key={section.key}
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setCollapsed(false);
                  setOpenSections((prev) => ({ ...prev, [section.key]: true }));
                }}
                aria-label={section.label}
                className="flex h-9 w-9 items-center justify-center rounded-full text-primary-700 hover:bg-primary-50 cursor-pointer"
              >
                {section.icon}
              </motion.button>
            ))}
          </div>
        )}

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="body"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => onChange(DEFAULT_FILTERS)}
                  className="text-xs text-secondary-500 hover:underline cursor-pointer"
                >
                  លុបចោលទាំងអស់
                </button>
              </div>

              <FilterSection
                title="តម្រៀបតាម"
                icon={<IoSwapVerticalOutline />}
                isOpen={openSections.sort}
                onToggle={() => toggleSection("sort")}
              >
                <div className="flex flex-col gap-2 text-sm text-gray-600">
                  {(
                    [
                      { label: "ពេញនិយម", value: "popular" },
                      { label: "ចំណាត់ថ្នាក់ខ្ពស់", value: "rating" },
                    ] as { label: string; value: SortBy }[]
                  ).map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="sort"
                        checked={filters.sortBy === opt.value}
                        onChange={() =>
                          onChange({ ...filters, sortBy: opt.value })
                        }
                        className="h-3.5 w-3.5 accent-primary-800"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection
                title="ពេលវេលាទទួលទាន"
                icon={<IoTimeOutline />}
                isOpen={openSections.mealTime}
                onToggle={() => toggleSection("mealTime")}
              >
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(MEAL_TIME_LABEL_TO_VALUE).map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 cursor-pointer hover:border-primary-300"
                    >
                      <input
                        type="checkbox"
                        checked={filters.mealTimes.includes(opt)}
                        onChange={() =>
                          onChange({
                            ...filters,
                            mealTimes: toggleInList(filters.mealTimes, opt),
                          })
                        }
                        className="h-3 w-3 accent-primary-800"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection
                title="ប្រភេទចំណីអាហារ"
                icon={<IoSearchOutline />}
                isOpen={openSections.foodType}
                onToggle={() => toggleSection("foodType")}
              >
                <div className="mb-2 flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                  <IoSearchOutline className="text-sm text-gray-400" />
                  <input
                    type="text"
                    value={filters.foodTypeQuery}
                    onChange={(e) =>
                      onChange({ ...filters, foodTypeQuery: e.target.value })
                    }
                    placeholder="ស្វែងរកប្រភេទចំណីអាហារ"
                    className="w-full text-xs text-gray-600 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  {visibleFoodTypes.length === 0 && (
                    <p className="text-xs text-gray-400">រកមិនឃើញប្រភេទនេះទេ</p>
                  )}
                  {visibleFoodTypes.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.foodTypes.includes(opt)}
                        onChange={() =>
                          onChange({
                            ...filters,
                            foodTypes: toggleInList(filters.foodTypes, opt),
                          })
                        }
                        className="h-3.5 w-3.5 accent-primary-800"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection
                title="របបអាហារ"
                icon={<IoNutritionOutline />}
                isOpen={openSections.dietType}
                onToggle={() => toggleSection("dietType")}
              >
                <div className="flex flex-col gap-2">
                  {DIET_FILTERS.map((label) => (
                    <FilterPill
                      key={label}
                      label={label}
                      active={filters.dietTypes.includes(label)}
                      onToggle={() =>
                        onChange({
                          ...filters,
                          dietTypes: toggleInList(filters.dietTypes, label),
                        })
                      }
                    />
                  ))}
                </div>
              </FilterSection>

              <FilterSection
                title="ក្រុមអាយុ"
                icon={<IoPeopleOutline />}
                isOpen={openSections.ageGroup}
                onToggle={() => toggleSection("ageGroup")}
              >
                <AgeGroupFilter
                  selected={filters.ageGroups}
                  onToggleValue={(value) =>
                    onChange({
                      ...filters,
                      ageGroups: toggleInList(filters.ageGroups, value),
                    })
                  }
                />
              </FilterSection>

              <FilterSection
                title="ពេញនិយមតាមខេត្ត"
                icon={<IoLocationOutline />}
                isOpen={openSections.province}
                onToggle={() => toggleSection("province")}
              >
                <div className="mb-2 flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                  <IoSearchOutline className="text-sm text-gray-400" />
                  <input
                    type="text"
                    value={filters.provinceQuery}
                    onChange={(e) =>
                      onChange({ ...filters, provinceQuery: e.target.value })
                    }
                    placeholder="ស្វែងរកខេត្ត/ក្រុង"
                    className="w-full text-xs text-gray-600 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
                <div className="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
                  {visibleProvinces.length === 0 && (
                    <p className="text-xs text-gray-400">រកមិនឃើញខេត្តនេះទេ</p>
                  )}
                  {visibleProvinces.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.provinces.includes(opt)}
                        onChange={() =>
                          onChange({
                            ...filters,
                            provinces: toggleInList(filters.provinces, opt),
                          })
                        }
                        className="h-3.5 w-3.5 accent-primary-800"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection
                title="ថ្លៃ"
                icon={<IoPricetagOutline />}
                isOpen={openSections.price}
                onToggle={() => toggleSection("price")}
              >
                <div className="flex gap-2">
                  {(["$", "$$", "$$$"] as const).map((tier) => (
                    <motion.button
                      key={tier}
                      type="button"
                      whileTap={{ scale: 0.94 }}
                      onClick={() =>
                        onChange({
                          ...filters,
                          priceTier: filters.priceTier === tier ? null : tier,
                        })
                      }
                      className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${
                        filters.priceTier === tier
                          ? "border-primary-800 bg-primary-800 text-white"
                          : "border-gray-200 text-gray-600 hover:border-primary-300"
                      }`}
                    >
                      {tier}
                    </motion.button>
                  ))}
                </div>
              </FilterSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(107, 114, 128, 0.4) transparent;
        }
        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(107, 114, 128, 0.4);
          border-radius: 9999px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background-color: rgba(107, 114, 128, 0.65);
        }
      `}</style>
    </motion.aside>
  );
}

/* -------------------------------------------------------------------- */
/*  Category tabs                                                       */
/* -------------------------------------------------------------------- */

function CategoryTabs() {
  const [active, setActive] = useState(0);
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <div className="flex flex-1 gap-3 overflow-x-auto">
        {CATEGORY_TABS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setActive(i)}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              active === i
                ? "border-primary-800 bg-primary-800 text-white"
                : "border-gray-200 text-gray-600 hover:border-primary-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        aria-label="See more categories"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer"
      >
        <IoChevronForward />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/*  Food card + grid section                                            */
/* -------------------------------------------------------------------- */

function FoodSection({
  title,
  foods,
  showLoadMore,
}: {
  title: string;
  foods: ListedFood[];
  showLoadMore?: boolean;
}) {
  return (
    <section className="mt-8">
      <h2 className="pb-12.5 text-center text-lg font-semibold text-primary-800 underline decoration-2 underline-offset-8">
        {title}
      </h2>

      {foods.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
          មិនមានលទ្ធផលត្រូវនឹងតម្រងដែលបានជ្រើសរើសទេ
        </div>
      ) : (
        <div className="max-w-4xl mx-auto grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {foods.map((food) => (
            <FoodCardComponent key={food.id} food={food} />
          ))}
        </div>
      )}

      {showLoadMore && foods.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-primary-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-900 transition-colors cursor-pointer"
          >
            មើលបន្ថែម
            <IoChevronForward className="text-base" />
          </button>
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------- */
/*  CTA banner                                                          */
/* -------------------------------------------------------------------- */

function CtaBanner() {
  return (
    <section className="mt-14 rounded-[28px] bg-primary-800 px-6 py-12 text-center">
      <p className="text-2xl font-semibold text-white md:text-3xl">
        បទពិសោធន៍ថ្មីក្នុងការ
      </p>
      <p className="text-2xl font-semibold text-accent-300 md:text-3xl">
        ស្វែងរកអាហារ
      </p>
    </section>
  );
}

// quick fade + slight slide so switching tabs feels smooth
const panelMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
};

export default function FoodPage() {
  const [activeTab, setActiveTab] = useState<FoodTabId>("food");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Kept for when you wire filtering to real data. NEW_FOODS / POPULAR_FOODS
  // are currently empty stubs, so these return [].
  const filteredNewFoods = applyFilters(NEW_FOODS, filters);
  const filteredPopularFoods = applyFilters(POPULAR_FOODS, filters);

  const {
    data: foods = [],
    isLoading,
    isError,
    error,
  } = useGetMenuItemsQuery();

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <div className="pt-15" />

      <div className="sticky container mx-auto top-15 z-20 w-full bg-white/2 backdrop-blur-xs dark:bg-gray-600/5">
        <FoodNavTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="mx-auto max-w-7xl container px-6 pb-16 pt-6">
        <AnimatePresence mode="wait">
          {activeTab === "food" && (
            <motion.div key="food" {...panelMotion}>
              <div className="flex gap-8">
                <FilterSidebar filters={filters} onChange={setFilters} />
                <main className="min-w-0 flex-1">
                  <CategoryTabs />
                  <div className="grid-cols-3 pt-8 max-w-5xl grid place-content-center gap-2">
                    {/* {foods.map((food) => (
                      <Link key={food.uuid} href={`/food/${food.uuid}`}>
                        <FoodCardComponent food={food} />
                      </Link>
                    ))} */}
                  </div>
                  {/* <FoodSection
                    title="អាហារដែលទើបតែបញ្ចូលថ្មី"
                    foods={filteredNewFoods}
                    showLoadMore
                  />
                  <FoodSection
                    title="អាហារពេញនិយមបំផុត"
                    foods={filteredPopularFoods}
                  /> */}
                  <CtaBanner />
                </main>
              </div>
            </motion.div>
          )}

          {activeTab === "location" && (
            <motion.div>
              <LocationPanel />
            </motion.div>
          )}

          {activeTab === "store" && (
            <motion.div>
              <div className="flex gap-8">
                <FilterSidebar filters={filters} onChange={setFilters} />
                <main className="min-w-0 flex-1">
                  <StorePanel />
                </main>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
