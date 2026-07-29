"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import { useGetMenuItemsQuery } from "@/app/store/menuApi";

import FoodCard from "@/components/dynamic-card/FoodCard";

import type { MenuItem } from "@/types/manu";

type FilterGroupKey = "category" | "cuisine" | "dietary" | "age";

type ChipGroup = {
  title: string;
  key: FilterGroupKey;
  options: FilterOption[];
};

type FilterOption = {
  code: string;
  name: string;
};

function matchesQuery(food: MenuItem, query: string): boolean {
  if (!query.trim()) {
    return true;
  }

  const normalizedQuery = query.trim().toLowerCase();

  const searchableValues = [
    food.name,
    food.localName,
    food.description,
    food.localDescription,
    food.store.name,
    food.store.localName,
    food.food.canonicalName,
    food.food.category.name,
    food.food.cuisine.name,
    ...food.ingredients,
    ...food.beveragePairings,
    ...food.dietaryTypes.map((diet) => diet.name),
  ];

  return searchableValues.some((value) =>
    value.toLowerCase().includes(normalizedQuery),
  );
}

function hasSelectedValue(
  itemValues: string[],
  selectedValues: Set<string>,
): boolean {
  if (selectedValues.size === 0) {
    return true;
  }

  return itemValues.some((value) => selectedValues.has(value));
}

function getUniqueOptions(values: FilterOption[]): FilterOption[] {
  const optionMap = new Map<string, FilterOption>();

  values.forEach((item) => {
    if (!optionMap.has(item.code)) {
      optionMap.set(item.code, item);
    }
  });

  return Array.from(optionMap.values());
}

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

  const {
    data: menuItems = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMenuItemsQuery();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const chipGroups = useMemo<ChipGroup[]>(() => {
    const categories = getUniqueOptions(
      menuItems.map((item) => ({
        code: item.food.category.code,
        name: item.food.category.name,
      })),
    );

    const cuisines = getUniqueOptions(
      menuItems.map((item) => ({
        code: item.food.cuisine.code,
        name: item.food.cuisine.name,
      })),
    );

    const dietaryTypes = getUniqueOptions(
      menuItems.flatMap((item) =>
        item.dietaryTypes.map((diet) => ({
          code: diet.code,
          name: diet.name,
        })),
      ),
    );

    const ageGroups = getUniqueOptions(
      menuItems.flatMap((item) =>
        item.food.ageGroups.map((ageGroup) => ({
          code: ageGroup.code,
          name: ageGroup.name,
        })),
      ),
    );

    return [
      {
        title: "ប្រភេទម្ហូប",
        key: "category",
        options: categories,
      },
      {
        title: "ម្ហូបតាមប្រទេស",
        key: "cuisine",
        options: cuisines,
      },
      {
        title: "របបអាហារ",
        key: "dietary",
        options: dietaryTypes,
      },
      {
        title: "ក្រុមអាយុ",
        key: "age",
        options: ageGroups,
      },
    ];
  }, [menuItems]);

  function getSelectionKey(group: FilterGroupKey, code: string): string {
    return `${group}:${code}`;
  }

  function toggleChip(group: FilterGroupKey, code: string) {
    const value = getSelectionKey(group, code);

    setSelected((previous) => {
      const next = new Set(previous);

      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }

      return next;
    });
  }

  function clearAll() {
    setSelected(new Set());
  }

  const groupedSelected = useMemo(() => {
    const category = new Set<string>();

    const cuisine = new Set<string>();

    const dietary = new Set<string>();

    const age = new Set<string>();

    selected.forEach((value) => {
      const [group, code] = value.split(":");

      if (!code) {
        return;
      }

      if (group === "category") {
        category.add(code);
      }

      if (group === "cuisine") {
        cuisine.add(code);
      }

      if (group === "dietary") {
        dietary.add(code);
      }

      if (group === "age") {
        age.add(code);
      }
    });

    return {
      category,
      cuisine,
      dietary,
      age,
    };
  }, [selected]);

  const filteredFoods = useMemo(
    () =>
      menuItems.filter((food) => {
        if (food.availabilityStatus !== "AVAILABLE") {
          return false;
        }

        const matchesCategory = hasSelectedValue(
          [food.food.category.code],
          groupedSelected.category,
        );

        const matchesCuisine = hasSelectedValue(
          [food.food.cuisine.code],
          groupedSelected.cuisine,
        );

        const matchesDietary = hasSelectedValue(
          food.dietaryTypes.map((diet) => diet.code),
          groupedSelected.dietary,
        );

        const matchesAge = hasSelectedValue(
          food.food.ageGroups.map((ageGroup) => ageGroup.code),
          groupedSelected.age,
        );

        return (
          matchesQuery(food, query) &&
          matchesCategory &&
          matchesCuisine &&
          matchesDietary &&
          matchesAge
        );
      }),
    [menuItems, query, groupedSelected],
  );

  const selectedLabels = useMemo(() => {
    const labels: string[] = [];

    chipGroups.forEach((group) => {
      group.options.forEach((option) => {
        const key = getSelectionKey(group.key, option.code);

        if (selected.has(key)) {
          labels.push(option.name);
        }
      });
    });

    return labels;
  }, [chipGroups, selected]);

  const count = selected.size;

  const label =
    count === 0
      ? "ប្រភេទអាហារ"
      : selectedLabels.slice(0, 2).join(", ") +
        (count > 2 ? ` +${count - 2}` : "");

  return (
    <div className="mx-auto w-full max-w-7xl text-[#3d3d3a]">
      <div className="flex flex-wrap items-stretch gap-3.5">
        <div className="flex h-[60px] min-w-[280px] flex-1 items-center gap-2.5 rounded-full border border-[#e7e6e1] bg-white px-[22px] shadow-sm transition-all focus-within:border-[#1c6b45] focus-within:ring-4 focus-within:ring-[#e8f3ec] hover:border-[#cfcec6]">
          <SearchIcon className="h-5 w-5 shrink-0 text-[#1c6b45]" />

          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ស្វែងរកម្ហូបអាហារ..."
            className="h-full w-full bg-transparent text-[15px] text-[#3d3d3a] outline-none placeholder:text-[#a3a29a]"
          />
        </div>

        <div ref={wrapRef} className="relative z-30 min-w-[220px] flex-none">
          <button
            type="button"
            onClick={() => setIsOpen((previous) => !previous)}
            className={`flex h-[60px] w-full items-center gap-2.5 rounded-full border bg-white px-[22px] text-[15px] text-[#3d3d3a] shadow-sm transition-all ${
              isOpen
                ? "border-[#1c6b45] ring-4 ring-[#e8f3ec]"
                : "border-[#e7e6e1] hover:border-[#cfcec6]"
            }`}
          >
            <GridIcon className="h-5 w-5 shrink-0 text-[#1c6b45]" />

            <span className="flex-1 truncate text-left">{label}</span>

            {count > 0 && (
              <span className="rounded-full bg-[#1c6b45] px-2 py-0.5 text-xs font-semibold text-white">
                {count}
              </span>
            )}

            <ChevronIcon
              className={`h-4 w-4 shrink-0 text-[#1c6b45] transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={`absolute right-0 top-[calc(100%+10px)] z-20 w-[380px] max-w-[90vw] rounded-[18px] border border-[#e7e6e1] bg-white p-5 shadow-xl transition-all ${
              isOpen
                ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                : "pointer-events-none -translate-y-2 scale-[0.98] opacity-0"
            }`}
          >
            <div className="scrollbar-hide max-h-[70vh] overflow-y-auto">
              {chipGroups.map((group, index) => (
                <div
                  key={group.key}
                  className={
                    index > 0 ? "mt-5 border-t border-[#e7e6e1] pt-[18px]" : ""
                  }
                >
                  <p className="mb-3 text-[13px] font-semibold text-[#a3a29a]">
                    {group.title}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {group.options.map((option) => {
                      const selectionKey = getSelectionKey(
                        group.key,
                        option.code,
                      );

                      const isSelected = selected.has(selectionKey);

                      return (
                        <button
                          key={selectionKey}
                          type="button"
                          onClick={() => toggleChip(group.key, option.code)}
                          className={`rounded-full border px-4 py-2 text-sm transition-all ${
                            isSelected
                              ? "border-[#1c6b45] bg-[#1c6b45] text-white"
                              : "border-[#e7e6e1] bg-white text-[#3d3d3a] hover:border-[#1c6b45]"
                          }`}
                        >
                          {option.name}
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
                className="rounded-full bg-[#1c6b45] px-[22px] py-2.5 text-sm font-semibold text-white hover:bg-[#14502f] active:scale-[0.97]"
              >
                អនុវត្ត
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 place-items-center gap-4 px-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {isLoading && (
          <p className="col-span-full py-10 text-center text-gray-400">
            កំពុងផ្ទុក...
          </p>
        )}

        {isError && (
          <div className="col-span-full flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-red-500">មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ</p>

            <pre className="max-w-full overflow-auto text-xs text-red-500">
              {JSON.stringify(error, null, 2)}
            </pre>

            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-full bg-primary-800 px-4 py-2 text-white"
            >
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {!isLoading && !isError && filteredFoods.length === 0 && (
            <motion.p
              key="empty"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="col-span-full py-10 text-center text-gray-400"
            >
              រកមិនឃើញលទ្ធផលដែលត្រូវនឹងតម្រង
            </motion.p>
          )}

          {!isLoading &&
            !isError &&
            filteredFoods.map((food) => (
              <motion.div
                layout
                key={food.uuid}
                initial={{
                  opacity: 0,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.96,
                }}
                className="w-full"
              >
                <Link href={`/food/${food.uuid}`} className="block w-full">
                  <FoodCard food={food} />
                </Link>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
