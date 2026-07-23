"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoSearchOutline,
  IoLocationOutline,
  IoOptionsOutline,
  IoSunnyOutline,
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

import type { FoodItem } from "@/app/types/food";

/* -------------------------------------------------------------------- */
/*  Mock data — same FoodItem shape used across RecommandCardStack /
    SpinWheel, just extended with what this page's cards need           */
/* -------------------------------------------------------------------- */

type ListedFood = FoodItem & { pickup: string; badge: string };

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
  },
];

const POPULAR_FOODS: ListedFood[] = NEW_FOODS.slice(0, 3).map((f) => ({
  ...f,
  id: f.id + 100,
}));

const NAV_LINKS = ["ទំព័រដើម", "អំពីយើង", "មុខម្ហូប"];

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
  "អាហារប្រញាប់ញញេច",
  "អាហារភ្លាដល់ថ្នាំ",
  "អាហារធានាចំណេះដឹង",
  "អាហារសម្រាប់ថ្ងៃទុក",
  "អាហារសម្រាប់សម្រកទម្ងន់",
  "អាហារសម្រាប់ថែទាំសុខភាព",
];

const FOOD_TYPE_FILTERS = [
  "ចិន",
  "វៀតណាម",
  "ថៃ",
  "កូរ៉េ",
  "ភេសជ្ជៈ",
  "បង្អែម",
  "អាហារបារាំង",
  "ចំណីធម្មតា",
];

/* -------------------------------------------------------------------- */
/*  Header                                                               */
/* -------------------------------------------------------------------- */

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-3.5 lg:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-800 text-sm font-bold text-white">
            ខ
          </div>
          <span className="text-lg font-semibold text-primary-900">
            ខ្ញុំហូប
          </span>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link}
              href="#"
              className={`text-sm font-medium transition-colors ${
                i === 0
                  ? "text-primary-800"
                  : "text-gray-500 hover:text-primary-800"
              }`}
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-50 cursor-pointer"
          >
            <IoSunnyOutline className="text-lg" />
          </button>
          <button
            type="button"
            className="rounded-full bg-primary-800 px-5 py-2 text-sm font-medium text-white hover:bg-primary-900 transition-colors cursor-pointer"
          >
            បង្កើតគណនី
          </button>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------- */
/*  Search + location + sort row                                        */
/* -------------------------------------------------------------------- */

function SearchRow() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-6 pt-6 md:flex-row md:items-center lg:px-10">
      <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5">
        <IoSearchOutline className="text-lg text-gray-400" />
        <input
          type="text"
          placeholder="ស្វែងរកម្ហូបអ្វីមួយ..."
          className="w-full text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
        />
      </div>

      <button
        type="button"
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
      >
        <IoLocationOutline className="shrink-0 text-lg text-primary-700" />
        <span className="whitespace-nowrap">កំណត់ទីតាំងដើម្បីទទួលបានលទ្ធផលល្អ</span>
      </button>

      <button
        type="button"
        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
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

function FilterPill({ label }: { label: string }) {
  const [active, setActive] = useState(false);
  return (
    <motion.button
      type="button"
      onClick={() => setActive((a) => !a)}
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

function FilterSection({ title, icon, isOpen, onToggle, children }: FilterSectionProps) {
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

function FilterSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [priceTier, setPriceTier] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sort: true,
    mealTime: true,
    foodType: false,
    dietType: false,
    price: true,
  });

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 264 }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      className="sidebar-scroll sticky top-20 hidden max-h-[calc(100vh-6rem)] shrink-0 self-start overflow-y-auto overflow-x-hidden lg:block"
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
                ការត្រង
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

        {/* collapsed rail: icon-only shortcuts back into each section */}
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
                  {["ពេញនិយម", "ដឹកមកដល់លឿន", "ចំណាត់ថ្នាក់ខ្ពស់"].map((opt, i) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sort"
                        defaultChecked={i === 0}
                        className="h-3.5 w-3.5 accent-primary-800"
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
                  {["ព្រឹក", "ថ្ងៃ", "ល្ងាច", "សម្រន់"].map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 cursor-pointer hover:border-primary-300"
                    >
                      <input type="checkbox" className="h-3 w-3 accent-primary-800" />
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
                    placeholder="ស្វែងរកប្រភេទចំណីអាហារ"
                    className="w-full text-xs text-gray-600 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  {FOOD_TYPE_FILTERS.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"
                    >
                      <input type="checkbox" className="h-3.5 w-3.5 accent-primary-800" />
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
                    <FilterPill key={label} label={label} />
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
                  {["$", "$$", "$$$"].map((tier) => (
                    <motion.button
                      key={tier}
                      type="button"
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setPriceTier((p) => (p === tier ? null : tier))}
                      className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${
                        priceTier === tier
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

      {/* visible, thin scrollbar so overflowing filter content clearly
          shows there's more to scroll, instead of a default/invisible
          browser scrollbar */}
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

function FoodListCard({ food }: { food: ListedFood }) {
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-gray-100 bg-white p-2.5 shadow-sm">
      <div className="relative">
        <img
          src={food.image}
          alt={food.name}
          className="h-[150px] w-full rounded-[14px] object-cover"
        />
        <button
          type="button"
          aria-label="Save to favorites"
          className="absolute top-2 right-2"
        >
          <CiHeart className="rounded-full bg-primary-800 p-1.5 text-3xl font-bold text-white" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5 px-1">
        <div className="flex items-center gap-1.5 text-secondary-400">
          <FaStore className="text-xs" />
          <p className="truncate text-[12px]">{food.store}</p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[16px] font-medium text-primary-900">
            {food.name}
          </p>
          <p className="shrink-0 text-[16px] font-medium text-primary-800">
            {food.price}$
          </p>
        </div>

        <p className="truncate text-[12px] text-gray-400">
          {food.description}
        </p>

        <div className="flex items-center gap-3 text-[12px] text-primary-400">
          <span className="flex items-center gap-1 text-accent-400">
            <FaStar className="text-xs" />
            {food.rating}
          </span>
          <span className="flex items-center gap-1">
            <IoMdTime className="text-sm" />
            {food.time}
          </span>
          <span className="flex items-center gap-1">
            <MdDeliveryDining className="text-base" />
            {food.distance}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <IoLocationOutline />
          <span className="truncate">{food.pickup}</span>
        </div>

        <span className="w-fit rounded-full bg-primary-800 px-3 py-1 text-[11px] text-white">
          {food.badge}
        </span>
      </div>
    </div>
  );
}

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
      <h2 className="mb-5 text-center text-lg font-semibold text-primary-800 underline decoration-2 underline-offset-8">
        {title}
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {foods.map((food) => (
          <FoodListCard key={food.id} food={food} />
        ))}
      </div>

      {showLoadMore && (
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

/* -------------------------------------------------------------------- */
/*  Footer                                                               */
/* -------------------------------------------------------------------- */

function Footer() {
  return (
    <footer className="mt-14 bg-primary-900 text-white">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-primary-800">
              ខ
            </div>
            <span className="text-lg font-semibold">ខ្ញុំហូប</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-white/60">
            ជម្រើសម្ហូបល្អបំផុតជិតអ្នក ភ្ជាប់អ្នកជាមួយហាងអាហារដែលអ្នកចូលចិត្ត
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-white/80">ទំព័រ</p>
          <ul className="flex flex-col gap-2 text-sm text-white/60">
            {NAV_LINKS.map((link) => (
              <li key={link}>
                <a href="#" className="hover:text-white">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-white/80">ទំនាក់ទំនង</p>
          <ul className="flex flex-col gap-2 text-sm text-white/60">
            <li>foodhub@gmail.com</li>
            <li>+1 (555) 012-3456</li>
            <li>Phnom Penh, Cambodia</li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-white/80">ដៃគូ</p>
          <div className="flex flex-wrap gap-2">
            {["ក្រសួង", "CBRD Fund", "iSTAD"].map((partner) => (
              <span
                key={partner}
                className="rounded-md bg-white/10 px-3 py-1.5 text-xs text-white/70"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © 2026 ខ្ញុំហូប | រក្សាសិទ្ធិគ្រប់យ៉ាង
      </div>
    </footer>
  );
}



export default function FoodPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Header />
      <SearchRow />

      <div className="mx-auto flex max-w-[1400px] gap-8 px-6 pb-16 pt-6 lg:px-10">
        <FilterSidebar />

        <main className="min-w-0 flex-1">
          <CategoryTabs />
          <FoodSection title="អាហារដែលទើបតែបញ្ចូលថ្មី" foods={NEW_FOODS} showLoadMore />
          <FoodSection title="អាហារពេញនិយមបំផុត" foods={POPULAR_FOODS} />
          <CtaBanner />
        </main>
      </div>

      <Footer />
    </div>
  );
}