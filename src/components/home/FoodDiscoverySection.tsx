"use client";

import { useState } from "react";
import FoodSearchBar from "./FoodSearchBar";
import RecommandSection from "./recommand";
import { EMPTY_FILTERS, type FilterState } from "@/types/food";

const FOOD_OPTIONS = [
  "ម្ហូបខ្មែរ",
  "ម្ហូបចិន",
  "ម្ហូបថៃ",
  "ម្ហូបលោកខាងលិច",
  "អាហារដុត/BBQ",
  "បង្អែម",
];
const DRINK_OPTIONS = ["កាហ្វេ", "តែ", "ទឹកផ្លែឈើ", "ស្រា/ បៀរ"];
const AGE_OPTIONS = ["គ្រប់វ័យ", "កុមារ", "យុវជន", "មនុស្សពេញវ័យ"];

export default function FoodDiscoverySection() {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  function toggleChip(value: string) {
    setFilters((prev) => {
      let group: keyof Omit<FilterState, "query"> | null = null;
      if (FOOD_OPTIONS.includes(value)) group = "food";
      else if (DRINK_OPTIONS.includes(value)) group = "drink";
      else if (AGE_OPTIONS.includes(value)) group = "age";
      if (!group) return prev;

      const set = new Set(prev[group]);
      set.has(value) ? set.delete(value) : set.add(value);
      return { ...prev, [group]: set };
    });
  }

  return (
    <div className="flex flex-col gap-10">
      <FoodSearchBar
        query={filters.query}
        onQueryChange={(query) => setFilters((prev) => ({ ...prev, query }))}
        selected={new Set([...filters.food, ...filters.drink, ...filters.age])}
        onToggleChip={toggleChip}
        onClearAll={() => setFilters(EMPTY_FILTERS)}
      />
      <RecommandSection filters={filters} />
    </div>
  );
}
