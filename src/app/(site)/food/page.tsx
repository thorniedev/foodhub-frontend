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
} from "react-icons/io5";
import { IoMdTime } from "react-icons/io";
import { FaStar, FaStore } from "react-icons/fa";
import { CiHeart } from "react-icons/ci";
import { MdDeliveryDining } from "react-icons/md";

import FoodCardComponent from "@/components/FoodCardComponent";

import FoodNavTabs, { FoodTabId } from "@/components/Foodnavtabs";
import FoodCard from "@/components/FoodCard";
import { useGetMenuItemsQuery } from "@/redux/api/fooodApi";
import { FoodItem } from "@/types/food";
import Link from "next/link";
import LocationPanel from "@/components/food/LocationPanel";
import StorePanel from "@/components/food/StorePanel";

type ListedFood = FoodItem & {
  pickup: string;
  badge: string;
  dietTypes: string[];
};

const NEW_FOODS: ListedFood[] = [
  {
    id: 1,
    mealTime: "breakfast",
    store: "អាហារដ្ឋាន 99 (ឆាបួស)",
    name: "នំហ្គៅ និងសៀវម៉ែ",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    distance: "1.3km",
    price: "2",
    tags: ["ហាឡាល់"],
    foodTypes: ["ចិន"],
    drinkTypes: [],
    ageGroups: ["គ្រប់វ័យ"],
    image: "/Image/card-img.png",
    pickup: "ម្ចាស់បិទ ដល់ប្ដិ",
    badge: "Halal",
    dietTypes: ["អាហារភ្លាដល់ថ្នាំ"],
  },
  {
    id: 2,
    mealTime: "lunch",
    store: "Kongfou Kitchen",
    name: "បុសម្លៀងសម្រង់",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    distance: "1.5km",
    price: "2",
    tags: ["ហាឡាល់"],
    foodTypes: ["ខ្មែរ"],
    drinkTypes: [],
    ageGroups: ["គ្រប់វ័យ"],
    image: "/Image/card-img.png",
    pickup: "ម្ចាស់បិទ ដល់ប្ដិ",
    badge: "Halal",
    dietTypes: ["អាហារសុខភាព"],
  },
  {
    id: 3,
    mealTime: "lunch",
    store: "Kongfou Kitchen",
    name: "ណែមស្រស់សាច់បង្គា",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 3.3,
    time: "5min",
    distance: "1.5km",
    price: "2.75",
    tags: ["ហាឡាល់"],
    foodTypes: ["វៀតណាម"],
    drinkTypes: [],
    ageGroups: ["គ្រប់វ័យ"],
    image: "/Image/card-img.png",
    pickup: "ម្ចាស់បិទ ដល់ប្ដិ",
    badge: "Halal",
    dietTypes: ["អាហារប្រញាប់ញញេច"],
  },
  {
    id: 4,
    mealTime: "lunch",
    store: "Kongfou Kitchen",
    name: "មីគាត់ខ្ទេច",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "15min",
    distance: "2km",
    price: "2",
    tags: ["ហាឡាល់"],
    foodTypes: ["ខ្មែរ"],
    drinkTypes: [],
    ageGroups: ["គ្រប់វ័យ"],
    image: "/Image/card-img.png",
    pickup: "ម្ចាស់បិទ ដល់ប្ដិ",
    badge: "Halal",
    dietTypes: [],
  },
  {
    id: 5,
    mealTime: "lunch",
    store: "Kongfou Kitchen",
    name: "នំបុ័ងសាច់ជ្រូកខ្វៃ",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    distance: "1.5km",
    price: "1.5",
    tags: ["ជម្រើសបួស"],
    foodTypes: ["ខ្មែរ"],
    drinkTypes: [],
    ageGroups: ["គ្រប់វ័យ"],
    image: "/Image/card-img.png",
    pickup: "ម្ចាស់បិទ ដល់ប្ដិ",
    badge: "ជម្រើសបួស",
    dietTypes: ["អាហារបួស"],
  },
  {
    id: 6,
    mealTime: "breakfast",
    store: "ភោជនីយដ្ឋានអូឡាំពិក",
    name: "បាយឆាត្រកួន",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    distance: "7.3km",
    price: "2.5",
    tags: ["ហាឡាល់"],
    foodTypes: ["ខ្មែរ"],
    drinkTypes: [],
    ageGroups: ["គ្រប់វ័យ"],
    image: "/Image/card-img.png",
    pickup: "ម្ចាស់បិទ ដល់ប្ដិ",
    badge: "Halal",
    dietTypes: ["អាហារសម្រាប់សម្រកទម្ងន់"],
  },
  {
    id: 7,
    mealTime: "dinner",
    store: "Kongfou Kitchen",
    name: "បាយសាច់មាន់ដុតបំពង",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    distance: "1.5km",
    price: "1.25",
    tags: ["ហាឡាល់"],
    foodTypes: ["អាហារដុត"],
    drinkTypes: [],
    ageGroups: ["គ្រប់វ័យ"],
    image: "/Image/card-img.png",
    pickup: "ម្ចាស់បិទ ដល់ប្ដិ",
    badge: "Halal",
    dietTypes: [],
  },
  {
    id: 8,
    mealTime: "dinner",
    store: "Kongfou Kitchen",
    name: "បាយសាច់មាន់ដុតបំពង",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    distance: "1.5km",
    price: "1.25",
    tags: ["ហាឡាល់"],
    foodTypes: ["អាហារដុត"],
    drinkTypes: [],
    ageGroups: ["គ្រប់វ័យ"],
    image: "/Image/card-img.png",
    pickup: "ម្ចាស់បិទ ដល់ប្ដិ",
    badge: "Halal",
    dietTypes: ["អាហារធានាចំណេះដឹង"],
  },
  {
    id: 9,
    mealTime: "lunch",
    store: "Kongfou Kitchen",
    name: "ណែមស្រស់សាច់បង្គា",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 3.3,
    time: "5min",
    distance: "1.5km",
    price: "2.75",
    tags: ["ហាឡាល់"],
    foodTypes: ["វៀតណាម"],
    drinkTypes: [],
    ageGroups: ["គ្រប់វ័យ"],
    image: "/Image/card-img.png",
    pickup: "ម្ចាស់បិទ ដល់ប្ដិ",
    badge: "Halal",
    dietTypes: [],
  },
];

const POPULAR_FOODS: ListedFood[] = NEW_FOODS.slice(0, 3).map((f) => ({
  ...f,
  id: f.id + 100,
}));

const NAV_LINKS = ["ទំព័រដើម", "មុខម្ហូប", "អំពីយើង"];

const CATEGORY_TABS = [
  "ចំណីអាហារ",
  "តេស្ត:",
  "បន្លែ",
  "អាហារតាមអង្រការ",
  "អាហារតាមអំបិល",
  "អាហារតាមហេតុផល",
  "អាហារតាមសម្រុទ",
];

const MEAL_TYPE_FILTERS = [
  "អាហារបួស",
  "អាហារសុខភាព",

  "អាហារសម្រាប់សម្រកទម្ងន់",
  "អាហារសម្រាប់ថែទាំសុខភាព",
];

const FOOD_TYPE_FILTERS = [
  "ចិន",
  "វៀតណាម",
  "កូរ៉េ",
  "ភេសជ្ជៈ",
  "បង្អែម",
  "អាហារបារាំង",
  "ចំណីធម្មតា",
];

/* -------------------------------------------------------------------- */
/*  Filter state — shared between the sidebar and the food grid          */
/* -------------------------------------------------------------------- */

// sidebar shows these Khmer labels, food data uses FoodItem's mealTime
// values — this bridges the two so the checkboxes actually match
const MEAL_TIME_LABEL_TO_VALUE: Record<string, string> = {
  ព្រឹក: "breakfast",
  ថ្ងៃ: "lunch",
  ល្ងាច: "dinner",
  សម្រន់: "snack",
};

// const AGE: Record<string, string> = {
//   ព្រឹក: "breakfast",
//   ថ្ងៃ: "lunch",
//   ល្ងាច: "dinner",
//   សម្រន់: "snack",
// };
type SortBy = "popular" | "fastest" | "rating";

type FilterState = {
  sortBy: SortBy;
  mealTimes: string[]; // Khmer labels, e.g. "ព្រឹក"
  foodTypes: string[];
  dietTypes: string[];
  priceTier: "$" | "$$" | "$$$" | null;
  foodTypeQuery: string;
};

const DEFAULT_FILTERS: FilterState = {
  sortBy: "popular",
  mealTimes: [],
  foodTypes: [],
  dietTypes: [],
  priceTier: null,
  foodTypeQuery: "",
};

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

const SIDEBAR_SECTIONS = [
  { key: "sort", label: "តម្រៀបតាម", icon: <IoSwapVerticalOutline /> },
  { key: "mealTime", label: "ពេលវេលាទទួលទាន", icon: <IoTimeOutline /> },
  { key: "foodType", label: "ប្រភេទចំណីអាហារ", icon: <IoSearchOutline /> },
  { key: "dietType", label: "របបអាហារ", icon: <IoNutritionOutline /> },
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
    price: true,
  });

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const visibleFoodTypes = FOOD_TYPE_FILTERS.filter((opt) =>
    opt.toLowerCase().includes(filters.foodTypeQuery.trim().toLowerCase()),
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
                  {MEAL_TYPE_FILTERS.map((label) => (
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
            // <FoodListCard key={food.id} food={food} />
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

// function LocationPanel({ foods }: { foods: ListedFood[] }) {
//   return (
//     <div className="flex flex-col gap-6 lg:flex-row">
//       <div className="lg:w-[46%]">
//         <h2 className="mb-4 text-lg font-semibold text-primary-800">
//           ទីតាំងជិតអ្នក
//         </h2>
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//           {foods.map((food) => (
//             <FoodCardComponent key={food.id} food={food} />
//           ))}
//         </div>
//       </div>

//       {/* swap this placeholder for your real Google Map */}
//       <div className="lg:w-[54%]">
//         <div className="sticky top-32 flex h-[70vh] items-center justify-center rounded-2xl border border-gray-200 bg-white">
//           <div className="flex flex-col items-center gap-2 text-gray-400">
//             <IoLocationOutline className="text-3xl text-primary-700" />
//             <p className="text-sm">ដាក់ Google Map នៅទីនេះ</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function StorePanel({ foods }: { foods: ListedFood[] }) {
//   const stores = Array.from(new Set(foods.map((f) => f.store)));
//   return (
//     <section>
//       <h2 className="mb-6 text-center text-lg font-semibold text-primary-800 underline decoration-2 underline-offset-8">
//         ហាងអាហារ
//       </h2>
//       <div className="grid grid-c ols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
//         {stores.map((store) => {
//           const sample = foods.find((f) => f.store === store)!;
//           const count = foods.filter((f) => f.store === store).length;
//           return (
//             <div
//               key={store}
//               className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
//             >
//               <img
//                 src={sample.image}
//                 alt={store}
//                 className="h-36 w-full object-cover"
//               />
//               <div className="flex flex-col gap-1 p-4">
//                 <div className="flex items-center gap-2 text-primary-900">
//                   <FaStore className="shrink-0 text-sm text-secondary-500" />
//                   <h3 className="truncate font-medium">{store}</h3>
//                 </div>
//                 <div className="flex items-center gap-3 text-xs text-primary-400">
//                   <span className="flex items-center gap-1 text-accent-400">
//                     <FaStar className="text-[10px]" />
//                     {sample.rating}
//                   </span>
//                   <span>{count} មុខម្ហូប</span>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </section>
//   );
// }
export default function FoodPage() {
  const [activeTab, setActiveTab] = useState<FoodTabId>("food");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

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
                  <div className="grid-cols-3 pt-8 max-w-5xl grid  place-content-center gap-2">
                    {foods.map((food) => (
                      <Link key={food.uuid} href={`/food/${food.uuid}`}>
                        <FoodCard food={food} />
                      </Link>
                    ))}
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
              {/* <LocationPanel foods={filteredNewFoods} /> */}
              <LocationPanel />
            </motion.div>
          )}

          {activeTab === "store" && (
            <motion.div>
              {/* <StorePanel foods={NEW_FOODS} /> */}
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
