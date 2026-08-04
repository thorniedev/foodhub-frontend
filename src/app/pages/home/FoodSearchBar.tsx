"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdTime } from "react-icons/io";
import { FaStar, FaStore } from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import { CiHeart } from "react-icons/ci";

type ChipGroup = {
  title: string;
  key: "food" | "drink" | "age";
  options: string[];
};

const CHIP_GROUPS: ChipGroup[] = [
  {
    title: "ប្រភេទម្ហូប",
    key: "food",
    options: [
      "ម្ហូបខ្មែរ",
      "ម្ហូបចិន",
      ,
      "ម្ហូបលោកខាងលិច",
      "អាហារដុត/BBQ",
      "បង្អែម",
    ],
  },
  {
    title: "ភេសជ្ជៈ",
    key: "drink",
    options: ["កាហ្វេ", "តែ", "ទឹកផ្លែឈើ", "ស្រា/ បៀរ"],
  },
  {
    title: "ក្រុមអាយុ",
    key: "age",
    options: ["គ្រប់វ័យ", "កុមារ", "យុវជន", "មនុស្សពេញវ័យ"],
  },
];

// ---------- Mock data ----------
type FoodItem = {
  id: number;
  store: string;
  name: string;
  description: string;
  rating: number;
  time: string;
  distance: string;
  price: string;
  tags: string[];
  foodTypes: string[];
  drinkTypes: string[];
  ageGroups: string[];
  image: string;
};

const MOCK_FOODS: FoodItem[] = [
  {
    id: 1,
    store: "Kongfou Kitchen",
    name: "នំ Tacos",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    distance: "1.3km",
    price: "2",
    tags: ["ហាឡាល់", "អាហារបួស"],
    foodTypes: ["ម្ហូបលោកខាងលិច"],
    drinkTypes: ["កាហ្វេ"],
    ageGroups: ["គ្រប់វ័យ"],
    image: "/Image/card-img.png",
  },
  {
    id: 2,
    store: "Kongfou Kitchen",
    name: "គុយទាវខ្មែរ",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    distance: "1.3km",
    price: "2",
    tags: ["ហាឡាល់"],
    foodTypes: ["ម្ហូបខ្មែរ"],
    drinkTypes: ["ទឹកផ្លែឈើ"],
    ageGroups: ["គ្រប់វ័យ", "កុមារ"],
    image: "/Image/card-img.png",
  },
  {
    id: 3,
    store: "Kongfou Kitchen",
    name: "ជើងមាន់អាំង",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    distance: "1.3km",
    price: "2",
    tags: ["អាហារបួស"],
    foodTypes: ["អាហារដុត/BBQ"],
    drinkTypes: ["ស្រា/ បៀរ"],
    ageGroups: ["យុវជន", "មនុស្សពេញវ័យ"],
    image: "/Image/card-img.png",
  },
  {
    id: 4,
    store: "Kongfou Kitchen",
    name: "បបរសាច់មាន់",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    distance: "1.3km",
    price: "2",
    tags: ["ហាឡាល់"],
    foodTypes: ["ម្ហូបខ្មែរ"],
    drinkTypes: ["តែ"],
    ageGroups: ["គ្រប់វ័យ"],
    image: "/Image/card-img.png",
  },
  {
    id: 5,
    store: "Kongfou Kitchen",
    name: "មីឆាកូរ៉េ",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    distance: "1.3km",
    price: "2",
    tags: ["ហាឡាល់"],
    foodTypes: ["ម្ហូបចិន"],
    drinkTypes: ["តែ"],
    ageGroups: ["យុវជន"],
    image: "/Image/card-img.png",
  },
  {
    id: 6,
    store: "Kongfou Kitchen",
    name: "ស៊ុប Tom Yum",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    distance: "1.3km",
    price: "2",
    tags: ["ហាឡាល់"],
    foodTypes: ["ម្ហូបថៃ"],
    drinkTypes: ["ទឹកផ្លែឈើ"],
    ageGroups: ["មនុស្សពេញវ័យ"],
    image: "/Image/card-img.png",
  },
  {
    id: 7,
    store: "Kongfou Kitchen",
    name: "នំបុ័ង Croissant",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    distance: "1.3km",
    price: "2",
    tags: ["ហាឡាល់"],
    foodTypes: ["បង្អែម", "ម្ហូបលោកខាងលិច"],
    drinkTypes: ["កាហ្វេ"],
    ageGroups: ["គ្រប់វ័យ"],
    image: "/Image/card-img.png",
  },
  {
    id: 8,
    store: "Kongfou Kitchen",
    name: "សាច់អាំងសាច់គោ",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    distance: "1.3km",
    price: "2",
    tags: ["ហាឡាល់"],
    foodTypes: ["អាហារដុត/BBQ"],
    drinkTypes: ["ស្រា/ បៀរ"],
    ageGroups: ["មនុស្សពេញវ័យ"],
    image: "/Image/card-img.png",
  },
];

function matchesQuery(food: FoodItem, query: string) {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return (
    food.name.toLowerCase().includes(q) ||
    food.store.toLowerCase().includes(q) ||
    food.description.toLowerCase().includes(q) ||
    food.tags.some((t) => t.toLowerCase().includes(q))
  );
}

function matchesGroup(itemValues: string[], selected: Set<string>) {
  if (selected.size === 0) return true;
  if (itemValues.includes("គ្រប់វ័យ")) return true;
  return itemValues.some((v) => selected.has(v));
}

// ---------- Icons ----------
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function FoodSearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleChip(value: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  }

  function clearAll() {
    setSelected(new Set());
  }

  // Split the flat `selected` set back into its groups for filtering
  const groupedSelected = useMemo(() => {
    const foodSet = new Set<string>();
    const drinkSet = new Set<string>();
    const ageSet = new Set<string>();
    for (const group of CHIP_GROUPS) {
      for (const option of group.options) {
        if (!selected.has(option)) continue;
        if (group.key === "food") foodSet.add(option);
        if (group.key === "drink") drinkSet.add(option);
        if (group.key === "age") ageSet.add(option);
      }
    }
    return { food: foodSet, drink: drinkSet, age: ageSet };
  }, [selected]);

  const filteredFoods = useMemo(
    () =>
      MOCK_FOODS.filter(
        (food) =>
          matchesQuery(food, query) &&
          matchesGroup(food.foodTypes, groupedSelected.food) &&
          matchesGroup(food.drinkTypes, groupedSelected.drink) &&
          matchesGroup(food.ageGroups, groupedSelected.age),
      ),
    [query, groupedSelected],
  );

  const count = selected.size;
  const label =
    count === 0
      ? "ប្រភេទអាហារ"
      : [...selected].slice(0, 2).join(", ") +
        (count > 2 ? ` +${count - 2}` : "");

  return (
    <div className="w-full max-w-7xl mx-auto text-[#3d3d3a]">
      <div className="flex flex-wrap items-stretch gap-3.5">
        {/* Search pill */}
        <div className="flex flex-1 min-w-[340px] items-center gap-2.5 h-[60px] rounded-full border border-[#e7e6e1] bg-white px-[22px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-150 focus-within:border-[#1c6b45] focus-within:shadow-[0_0_0_3px_#e8f3ec] hover:border-[#cfcec6]">
          <SearchIcon className="h-5 w-5 shrink-0 text-[#1c6b45]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ស្វែងរកម្ហូបអាហារ..."
            className="h-full w-full bg-transparent text-[15px] text-[#3d3d3a] placeholder:text-[#a3a29a] outline-none"
          />
        </div>

        {/* Location pill */}
        <button
          type="button"
          className="flex flex-1 min-w-[260px] items-center gap-2.5 h-[60px] rounded-full border border-[#e7e6e1] bg-white px-[22px] text-[15px] text-[#3d3d3a] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-150 hover:border-[#cfcec6] hover:shadow-[0_4px_14px_rgba(20,40,30,0.08)]"
        >
          <LocationIcon className="h-5 w-5 shrink-0 text-[#1c6b45]" />
          <span className="truncate">ទីតាំងហាងដែលនៅជិតអ្នក</span>
        </button>

        {/* Category dropdown */}
        <div ref={wrapRef} className="relative z-30 flex-none min-w-[220px]">
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className={`flex h-[60px] w-full items-center gap-2.5 rounded-full border bg-white px-[22px] text-[15px] text-[#3d3d3a] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-150 ${
              isOpen
                ? "border-[#1c6b45] shadow-[0_0_0_3px_#e8f3ec]"
                : "border-[#e7e6e1] hover:border-[#cfcec6]"
            }`}
          >
            <GridIcon className="h-5 w-5 shrink-0 text-[#1c6b45]" />
            <span className="flex-1 whitespace-nowrap text-left">{label}</span>
            {count > 0 && (
              <span className="rounded-full bg-[#1c6b45] px-2 py-0.5 text-xs font-semibold text-white">
                {count}
              </span>
            )}
            <ChevronIcon
              className={`h-4 w-4 shrink-0 text-[#1c6b45] transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown panel */}
          <div
            className={`absolute right-0 top-[calc(100%+10px)] z-20 w-[360px] max-w-[90vw] rounded-[18px] border border-[#e7e6e1] bg-white p-5 shadow-[0_12px_32px_rgba(20,40,30,0.14),0_2px_8px_rgba(20,40,30,0.06)] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isOpen
                ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                : "opacity-0 -translate-y-2 scale-[0.98] pointer-events-none"
            }`}
          >
            <div className="max-h-[70vh] overflow-y-auto">
              {CHIP_GROUPS.map((group, i) => (
                <div
                  key={group.key}
                  className={
                    i > 0 ? "mt-5 border-t border-[#e7e6e1] pt-[18px]" : ""
                  }
                >
                  <p className="mb-3 text-[13px] font-semibold text-[#a3a29a]">
                    {group.title}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((option) => {
                      const isSelected = selected.has(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleChip(option)}
                          className={`rounded-full border px-4 py-2 text-sm transition-all duration-150 ${
                            isSelected
                              ? "border-[#1c6b45] bg-[#1c6b45] text-white"
                              : "border-[#e7e6e1] bg-white text-[#3d3d3a] hover:border-[#1c6b45]"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[#e7e6e1] pt-4">
              <button
                type="button"
                onClick={clearAll}
                className="text-sm text-[#a3a29a] underline underline-offset-2 hover:text-[#3d3d3a]"
              >
                សម្អាតទាំងអស់
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-[#1c6b45] px-[22px] py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[#14502f] active:scale-[0.97]"
              >
                អនុវត្ត
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Result cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 place-items-center">
        <AnimatePresence mode="popLayout">
          {filteredFoods.length === 0 && (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full text-center text-gray-400 py-10"
            >
              រកមិនឃើញលទ្ធផលដែលត្រូវនឹងតម្រង
            </motion.p>
          )}
          {filteredFoods.map((food) => (
            <motion.div
              key={food.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col w-fit gap-4 bg-white border border-gray-100 shadow-sm rounded-[24px] p-2.5"
            >
              <div className="relative">
                <img
                  src={food.image}
                  alt={food.name}
                  className="rounded-[14px] w-[350px] object-cover"
                />
                <button
                  type="button"
                  aria-label="Save to favorites"
                  className="absolute top-0 right-0"
                >
                  <CiHeart className="text-4xl p-2 bg-[#1c6b45] font-bold rounded-full text-white" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex text-secondary-500 items-center gap-2">
                  <FaStore />
                  <p className="mt-1  text-[14px]">{food.store}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[24px] font-medium text-[#3d3d3a]">
                    {food.name}
                  </p>
                  <p className="text-[24px] font-medium text-[#1c6b45]">{`${food.price}$`}</p>
                </div>
                {/* <p className="text-gray-500 text-[16px]">{food.description}</p> */}
                <div className="flex gap-4">
                  <div className="flex gap-2 items-center text-amber-500">
                    <FaStar />
                    <p className="mt-1">{food.rating}</p>
                  </div>
                  <div className="flex gap-2 items-center text-[#1c6b45]">
                    <IoMdTime />
                    <p>{food.time}</p>
                  </div>
                  <div className="flex gap-2 items-center text-[#1c6b45]">
                    <MdDeliveryDining className="text-xl" />
                    <p>{food.distance}</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  {food.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-[#1c6b45] text-gray-100 w-fit px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
