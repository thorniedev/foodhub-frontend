"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import Link from "next/link";

import { AnimatePresence, motion } from "framer-motion";

import {
  IoChevronBack,
  IoChevronDown,
  IoChevronForward,
  IoNutritionOutline,
  IoPricetagOutline,
  IoRefresh,
  IoSearchOutline,
  IoSwapVerticalOutline,
  IoTimeOutline,
} from "react-icons/io5";

import { FaFire, FaStar } from "react-icons/fa";

import { MdOutlineCategory } from "react-icons/md";

import FoodNavTabs from "@/components/Foodnavtabs";
import FoodCard from "@/components/dynamic-card/FoodCard";

import { useGetMenuItemsQuery } from "@/app/store/menuApi";

import type { MenuItem } from "@/types/manu";
import LocationContent from "@/components/food-page/LocationContent";
import StoreContent from "@/components/food-page/StoreContent";
import { FoodPageTab } from "@/components/food-page/FoodNavTabs";

type SortBy =
  | "recommended"
  | "popular"
  | "rating"
  | "fastest"
  | "nearest"
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

  availabilityOnly: boolean;
  recommendedOnly: boolean;

  priceTier: PriceTier;
};

type FilterOption = {
  code: string;
  name: string;
  count: number;
};

const DEFAULT_FILTERS: FilterState = {
  query: "",
  sortBy: "recommended",

  categoryCodes: [],
  cuisineCodes: [],
  mealTypeCodes: [],
  dietaryTypeCodes: [],
  ageGroupCodes: [],

  availabilityOnly: true,
  recommendedOnly: false,

  priceTier: null,
};

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
function normalizeText(value?: string | null): string {
  return (value ?? "").trim().toLowerCase().normalize("NFKC");
}
function matchesSearch(food: MenuItem, query: string): boolean {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return true;
  }

  const searchableValues = [
    // Food information
    food.name,
    food.localName,
    food.description,
    food.localDescription,
    food.source,

    // Store information
    food.store.name,
    food.store.localName,
    food.store.addressLine,
    food.store.district,
    food.store.city,
    food.store.operatingStatus,

    // Category and cuisine
    food.food.canonicalName,
    food.food.category.code,
    food.food.category.name,
    food.food.cuisine.code,
    food.food.cuisine.name,

    // Ingredients and drinks
    ...food.ingredients,
    ...food.beveragePairings,

    // Meal types
    ...food.mealTypes.flatMap((mealType) => [mealType.code, mealType.name]),

    // Dietary types
    ...food.dietaryTypes.flatMap((dietaryType) => [
      dietaryType.code,
      dietaryType.name,
      dietaryType.verificationStatus,
    ]),

    // Allergens
    ...food.allergenDeclarations.flatMap((allergen) => [
      allergen.code,
      allergen.name,
      allergen.declarationType,
      allergen.riskLevel,
      allergen.verificationStatus,
    ]),

    // Age groups
    ...food.food.ageGroups.flatMap((ageGroup) => [
      ageGroup.code,
      ageGroup.name,
    ]),

    // Recommendation information
    food.recommendation.reasonText,
    food.recommendation.candidateSource,
    food.recommendation.safetyStatus,
    ...food.recommendation.reasonCodes,
  ];

  return searchableValues.some((value) =>
    normalizeText(value).includes(normalizedQuery),
  );
}

function getUniqueOptions(
  values: {
    code: string;
    name: string;
  }[],
): FilterOption[] {
  const optionMap = new Map<string, FilterOption>();

  values.forEach((item) => {
    const existing = optionMap.get(item.code);

    if (existing) {
      existing.count += 1;
      return;
    }

    optionMap.set(item.code, {
      code: item.code,
      name: item.name,
      count: 1,
    });
  });

  return Array.from(optionMap.values()).sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}

function applyFilters(foods: MenuItem[], filters: FilterState): MenuItem[] {
  const filteredFoods = foods.filter((food) => {
    if (filters.availabilityOnly && food.availabilityStatus !== "AVAILABLE") {
      return false;
    }

    if (filters.recommendedOnly && !food.recommendation.isRecommended) {
      return false;
    }

    if (!matchesSearch(food, filters.query)) {
      return false;
    }

    if (
      filters.categoryCodes.length > 0 &&
      !filters.categoryCodes.includes(food.food.category.code)
    ) {
      return false;
    }

    if (
      filters.cuisineCodes.length > 0 &&
      !filters.cuisineCodes.includes(food.food.cuisine.code)
    ) {
      return false;
    }

    if (
      filters.mealTypeCodes.length > 0 &&
      !food.mealTypes.some((mealType) =>
        filters.mealTypeCodes.includes(mealType.code),
      )
    ) {
      return false;
    }

    if (
      filters.dietaryTypeCodes.length > 0 &&
      !food.dietaryTypes.some((dietaryType) =>
        filters.dietaryTypeCodes.includes(dietaryType.code),
      )
    ) {
      return false;
    }

    if (
      filters.ageGroupCodes.length > 0 &&
      !food.food.ageGroups.some((ageGroup) =>
        filters.ageGroupCodes.includes(ageGroup.code),
      )
    ) {
      return false;
    }

    if (!matchesPriceTier(food.price, filters.priceTier)) {
      return false;
    }

    return true;
  });

  return [...filteredFoods].sort((first, second) => {
    switch (filters.sortBy) {
      case "popular":
        return second.store.totalReviews - first.store.totalReviews;

      case "rating":
        return second.store.averageRating - first.store.averageRating;

      case "fastest":
        return first.preparationTimeMinutes - second.preparationTimeMinutes;

      case "nearest":
        return first.distanceKm - second.distanceKm;

      case "price-low":
        return first.price - second.price;

      case "price-high":
        return second.price - first.price;

      case "recommended":
      default:
        return (
          second.recommendation.finalScore - first.recommendation.finalScore
        );
    }
  });
}

function countActiveFilters(filters: FilterState): number {
  return (
    filters.categoryCodes.length +
    filters.cuisineCodes.length +
    filters.mealTypeCodes.length +
    filters.dietaryTypeCodes.length +
    filters.ageGroupCodes.length +
    (filters.priceTier ? 1 : 0) +
    (filters.recommendedOnly ? 1 : 0)
  );
}

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
        <span className="flex items-center gap-2 text-[16px] font-semibold text-primary-900">
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

        <span className="truncate text-[16px] text-gray-600">{label}</span>
      </span>

      {typeof count === "number" && (
        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[16px] text-gray-500">
          {count}
        </span>
      )}
    </label>
  );
}

type FilterSidebarProps = {
  filters: FilterState;
  onChange: (filters: FilterState) => void;

  categoryOptions: FilterOption[];
  cuisineOptions: FilterOption[];
  mealTypeOptions: FilterOption[];
  dietaryTypeOptions: FilterOption[];
  ageGroupOptions: FilterOption[];
};

function FilterSidebar({
  filters,
  onChange,
  categoryOptions,
  cuisineOptions,
  mealTypeOptions,
  dietaryTypeOptions,
  ageGroupOptions,
}: FilterSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const [categoryQuery, setCategoryQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sort: true,
    category: true,
    cuisine: false,
    mealType: true,
    dietaryType: false,
    ageGroup: false,
    price: true,
    availability: true,
  });

  const activeFilterCount = countActiveFilters(filters);

  const toggleSection = (key: string) => {
    setOpenSections((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const visibleCategoryOptions = categoryOptions.filter((option) =>
    option.name.toLowerCase().includes(categoryQuery.trim().toLowerCase()),
  );

  return (
    // <motion.aside
    //   animate={{
    //     width: collapsed ? 78 : 286,
    //   }}
    //   transition={{
    //     type: "spring",
    //     stiffness: 320,
    //     damping: 34,
    //   }}
    //   className="sidebar-scroll sticky top-28 hidden max-h-[calc(100vh-8rem)] shrink-0 self-start overflow-y-auto overflow-x-hidden lg:block"
    // >
    //   <div className="rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm">
    //     <div className="flex items-center justify-between">
    //       <AnimatePresence mode="wait" initial={false}>
    //         {!collapsed && (
    //           <motion.div
    //             initial={{
    //               opacity: 0,
    //             }}
    //             animate={{
    //               opacity: 1,
    //             }}
    //             exit={{
    //               opacity: 0,
    //             }}
    //           >
    //             <div className="flex items-center gap-2">
    //               <p className="text-[28px] font-semibold text-primary-900">
    //                 តម្រង
    //               </p>

    //               {activeFilterCount > 0 && (
    //                 <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-secondary-500 px-1.5 text-[16px] font-semibold text-white">
    //                   {activeFilterCount}
    //                 </span>
    //               )}
    //             </div>

    //             <p className="mt-1 text-[16px] text-gray-400">
    //               ជ្រើសរើសតាមចំណូលចិត្ត
    //             </p>
    //           </motion.div>
    //         )}
    //       </AnimatePresence>

    //       <motion.button
    //         type="button"
    //         onClick={() => setCollapsed((previous) => !previous)}
    //         whileTap={{
    //           scale: 0.9,
    //         }}
    //         aria-label={collapsed ? "Expand filters" : "Collapse filters"}
    //         className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-50 text-gray-500 transition hover:bg-primary-50 hover:text-primary-700 ${
    //           collapsed ? "mx-auto" : ""
    //         }`}
    //       >
    //         <motion.span
    //           animate={{
    //             rotate: collapsed ? 180 : 0,
    //           }}
    //         >
    //           <IoChevronBack className="text-[20px]" />
    //         </motion.span>
    //       </motion.button>
    //     </div>

    //     {collapsed && (
    //       <div className="mt-5 flex flex-col items-center gap-3">
    //         {[
    //           <IoSwapVerticalOutline key="sort" />,
    //           <MdOutlineCategory key="category" />,
    //           <IoTimeOutline key="time" />,
    //           <IoNutritionOutline key="diet" />,
    //           <IoPricetagOutline key="price" />,
    //         ].map((icon, index) => (
    //           <motion.button
    //             key={index}
    //             type="button"
    //             whileTap={{
    //               scale: 0.9,
    //             }}
    //             onClick={() => setCollapsed(false)}
    //             className="flex h-10 w-10 items-center justify-center rounded-full text-[20px] text-primary-700 hover:bg-primary-50"
    //           >
    //             {icon}
    //           </motion.button>
    //         ))}
    //       </div>
    //     )}

    //     <AnimatePresence initial={false}>
    //       {!collapsed && (
    //         <motion.div
    //           initial={{
    //             opacity: 0,
    //             height: 0,
    //           }}
    //           animate={{
    //             opacity: 1,
    //             height: "auto",
    //           }}
    //           exit={{
    //             opacity: 0,
    //             height: 0,
    //           }}
    //           className="overflow-hidden"
    //         >
    //           <div className="mt-5 flex items-center justify-between">
    //             <p className="text-[16px] text-gray-400">
    //               {activeFilterCount} តម្រងបានជ្រើស
    //             </p>

    //             <button
    //               type="button"
    //               onClick={() => onChange(DEFAULT_FILTERS)}
    //               className="cursor-pointer text-[16px] font-medium text-secondary-500 hover:underline"
    //             >
    //               សម្អាតទាំងអស់
    //             </button>
    //           </div>

    //           <FilterSection
    //             title="តម្រៀបតាម"
    //             icon={<IoSwapVerticalOutline />}
    //             isOpen={openSections.sort}
    //             onToggle={() => toggleSection("sort")}
    //           >
    //             <div className="flex flex-col gap-3">
    //               {[
    //                 {
    //                   label: "ការណែនាំល្អបំផុត",
    //                   value: "recommended",
    //                 },
    //                 {
    //                   label: "ពេញនិយមបំផុត",
    //                   value: "popular",
    //                 },
    //                 {
    //                   label: "ចំណាត់ថ្នាក់ខ្ពស់",
    //                   value: "rating",
    //                 },
    //                 {
    //                   label: "រៀបចំលឿនបំផុត",
    //                   value: "fastest",
    //                 },
    //                 {
    //                   label: "នៅជិតបំផុត",
    //                   value: "nearest",
    //                 },
    //                 {
    //                   label: "តម្លៃទាបទៅខ្ពស់",
    //                   value: "price-low",
    //                 },
    //                 {
    //                   label: "តម្លៃខ្ពស់ទៅទាប",
    //                   value: "price-high",
    //                 },
    //               ].map((option) => (
    //                 <label
    //                   key={option.value}
    //                   className="flex cursor-pointer items-center gap-3 text-[16px] text-gray-600"
    //                 >
    //                   <input
    //                     type="radio"
    //                     name="food-sort"
    //                     checked={filters.sortBy === option.value}
    //                     onChange={() =>
    //                       onChange({
    //                         ...filters,
    //                         sortBy: option.value as SortBy,
    //                       })
    //                     }
    //                     className="h-4 w-4 accent-primary-800"
    //                   />

    //                   {option.label}
    //                 </label>
    //               ))}
    //             </div>
    //           </FilterSection>

    //           <FilterSection
    //             title="ប្រភេទម្ហូប"
    //             icon={<MdOutlineCategory />}
    //             isOpen={openSections.category}
    //             onToggle={() => toggleSection("category")}
    //           >
    //             <div className="mb-3 flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5">
    //               <IoSearchOutline className="shrink-0 text-[20px] text-gray-400" />

    //               <input
    //                 value={categoryQuery}
    //                 onChange={(event) => setCategoryQuery(event.target.value)}
    //                 placeholder="ស្វែងរកប្រភេទម្ហូប"
    //                 className="w-full bg-transparent text-[16px] text-gray-600 outline-none placeholder:text-gray-400"
    //               />
    //             </div>

    //             <div className="max-h-[240px] space-y-1 overflow-y-auto">
    //               {visibleCategoryOptions.map((option) => (
    //                 <CheckboxOption
    //                   key={option.code}
    //                   label={option.name}
    //                   count={option.count}
    //                   checked={filters.categoryCodes.includes(option.code)}
    //                   onChange={() =>
    //                     onChange({
    //                       ...filters,
    //                       categoryCodes: toggleInList(
    //                         filters.categoryCodes,
    //                         option.code,
    //                       ),
    //                     })
    //                   }
    //                 />
    //               ))}
    //             </div>
    //           </FilterSection>

    //           <FilterSection
    //             title="ម្ហូបតាមប្រទេស"
    //             icon={<MdOutlineCategory />}
    //             isOpen={openSections.cuisine}
    //             onToggle={() => toggleSection("cuisine")}
    //           >
    //             <div className="space-y-1">
    //               {cuisineOptions.map((option) => (
    //                 <CheckboxOption
    //                   key={option.code}
    //                   label={option.name}
    //                   count={option.count}
    //                   checked={filters.cuisineCodes.includes(option.code)}
    //                   onChange={() =>
    //                     onChange({
    //                       ...filters,
    //                       cuisineCodes: toggleInList(
    //                         filters.cuisineCodes,
    //                         option.code,
    //                       ),
    //                     })
    //                   }
    //                 />
    //               ))}
    //             </div>
    //           </FilterSection>

    //           <FilterSection
    //             title="ពេលទទួលទាន"
    //             icon={<IoTimeOutline />}
    //             isOpen={openSections.mealType}
    //             onToggle={() => toggleSection("mealType")}
    //           >
    //             <div className="space-y-1">
    //               {mealTypeOptions.map((option) => (
    //                 <CheckboxOption
    //                   key={option.code}
    //                   label={option.name}
    //                   count={option.count}
    //                   checked={filters.mealTypeCodes.includes(option.code)}
    //                   onChange={() =>
    //                     onChange({
    //                       ...filters,
    //                       mealTypeCodes: toggleInList(
    //                         filters.mealTypeCodes,
    //                         option.code,
    //                       ),
    //                     })
    //                   }
    //                 />
    //               ))}
    //             </div>
    //           </FilterSection>

    //           <FilterSection
    //             title="របបអាហារ"
    //             icon={<IoNutritionOutline />}
    //             isOpen={openSections.dietaryType}
    //             onToggle={() => toggleSection("dietaryType")}
    //           >
    //             <div className="space-y-1">
    //               {dietaryTypeOptions.map((option) => (
    //                 <CheckboxOption
    //                   key={option.code}
    //                   label={option.name}
    //                   count={option.count}
    //                   checked={filters.dietaryTypeCodes.includes(option.code)}
    //                   onChange={() =>
    //                     onChange({
    //                       ...filters,
    //                       dietaryTypeCodes: toggleInList(
    //                         filters.dietaryTypeCodes,
    //                         option.code,
    //                       ),
    //                     })
    //                   }
    //                 />
    //               ))}
    //             </div>
    //           </FilterSection>

    //           <FilterSection
    //             title="ក្រុមអាយុ"
    //             icon={<IoNutritionOutline />}
    //             isOpen={openSections.ageGroup}
    //             onToggle={() => toggleSection("ageGroup")}
    //           >
    //             <div className="space-y-1">
    //               {ageGroupOptions.map((option) => (
    //                 <CheckboxOption
    //                   key={option.code}
    //                   label={option.name}
    //                   count={option.count}
    //                   checked={filters.ageGroupCodes.includes(option.code)}
    //                   onChange={() =>
    //                     onChange({
    //                       ...filters,
    //                       ageGroupCodes: toggleInList(
    //                         filters.ageGroupCodes,
    //                         option.code,
    //                       ),
    //                     })
    //                   }
    //                 />
    //               ))}
    //             </div>
    //           </FilterSection>

    //           <FilterSection
    //             title="តម្លៃ"
    //             icon={<IoPricetagOutline />}
    //             isOpen={openSections.price}
    //             onToggle={() => toggleSection("price")}
    //           >
    //             <div className="grid grid-cols-3 gap-2">
    //               {(["$", "$$", "$$$"] as const).map((tier) => (
    //                 <button
    //                   key={tier}
    //                   type="button"
    //                   onClick={() =>
    //                     onChange({
    //                       ...filters,
    //                       priceTier: filters.priceTier === tier ? null : tier,
    //                     })
    //                   }
    //                   className={`rounded-xl border py-2.5 text-[16px] font-semibold transition ${
    //                     filters.priceTier === tier
    //                       ? "border-primary-800 bg-primary-800 text-white"
    //                       : "border-gray-200 text-gray-600 hover:border-primary-300"
    //                   }`}
    //                 >
    //                   {tier}
    //                 </button>
    //               ))}
    //             </div>

    //             <div className="mt-3 space-y-1 text-[16px] text-gray-400">
    //               <p>$: ក្រោម $3</p>
    //               <p>$$: $3 ដល់ក្រោម $6</p>
    //               <p>$$$: $6 ឡើងទៅ</p>
    //             </div>
    //           </FilterSection>

    //           <FilterSection
    //             title="ភាពអាចរកបាន"
    //             icon={<FaFire />}
    //             isOpen={openSections.availability}
    //             onToggle={() => toggleSection("availability")}
    //           >
    //             <div className="space-y-2">
    //               <CheckboxOption
    //                 label="បង្ហាញតែម្ហូបដែលមានលក់"
    //                 checked={filters.availabilityOnly}
    //                 onChange={() =>
    //                   onChange({
    //                     ...filters,
    //                     availabilityOnly: !filters.availabilityOnly,
    //                   })
    //                 }
    //               />

    //               <CheckboxOption
    //                 label="បង្ហាញតែម្ហូបដែល AI ណែនាំ"
    //                 checked={filters.recommendedOnly}
    //                 onChange={() =>
    //                   onChange({
    //                     ...filters,
    //                     recommendedOnly: !filters.recommendedOnly,
    //                   })
    //                 }
    //               />
    //             </div>
    //           </FilterSection>
    //         </motion.div>
    //       )}
    //     </AnimatePresence>
    //   </div>

    //   <style jsx>{`
    //     .sidebar-scroll {
    //       scrollbar-width: none;
    //     }

    //     .sidebar-scroll::-webkit-scrollbar {
    //       display: none;
    //     }
    //   `}</style>
    // </motion.aside>
    <motion.aside
      animate={{
        width: collapsed ? 78 : 300,
      }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 34,
      }}
      className="sticky top-28 hidden h-[calc(100vh-8rem)] shrink-0 self-start lg:block"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
        {/* Fixed header */}
        <div
          className={`shrink-0 border-b border-gray-100 bg-white ${
            collapsed ? "p-3" : "p-5"
          }`}
        >
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {!collapsed && (
                <motion.div
                  key="filter-heading"
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
                  transition={{
                    duration: 0.2,
                  }}
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
                    ជ្រើសរើសតាមចំណូលចិត្ត
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              onClick={() => setCollapsed((previous) => !previous)}
              whileHover={{
                scale: 1.06,
              }}
              whileTap={{
                scale: 0.9,
              }}
              aria-label={collapsed ? "Expand filters" : "Collapse filters"}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-50 text-gray-500 transition hover:bg-primary-50 hover:text-primary-700"
            >
              <motion.span
                animate={{
                  rotate: collapsed ? 180 : 0,
                }}
                transition={{
                  duration: 0.25,
                }}
              >
                <IoChevronBack className="text-[21px]" />
              </motion.span>
            </motion.button>
          </div>

          {!collapsed && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
              <p className="text-[16px] text-gray-500">
                {activeFilterCount} តម្រងបានជ្រើស
              </p>

              <button
                type="button"
                disabled={activeFilterCount === 0}
                onClick={() => onChange(DEFAULT_FILTERS)}
                className="cursor-pointer text-[16px] font-medium text-secondary-500 transition hover:underline disabled:cursor-not-allowed disabled:opacity-40"
              >
                សម្អាតទាំងអស់
              </button>
            </div>
          )}
        </div>

        {/* Collapsed navigation */}
        {collapsed ? (
          <div className="flex flex-1 flex-col items-center gap-3 overflow-y-auto px-3 py-4">
            {[
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
                key: "price",
                label: "តម្លៃ",
                icon: <IoPricetagOutline />,
              },
            ].map((item) => (
              <motion.button
                key={item.key}
                type="button"
                title={item.label}
                aria-label={item.label}
                whileHover={{
                  scale: 1.08,
                  backgroundColor: "rgb(240 253 244)",
                }}
                whileTap={{
                  scale: 0.9,
                }}
                onClick={() => {
                  setCollapsed(false);

                  setOpenSections((previous) => ({
                    ...previous,
                    [item.key]: true,
                  }));
                }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[21px] text-primary-700"
              >
                {item.icon}
              </motion.button>
            ))}
          </div>
        ) : (
          /* Only this part scrolls */
          <div
            className="min-h-0
    flex-1
    overflow-y-auto
    overscroll-contain
    pr-2
    px-5
    pb-6
    pt-2
    scrollbar-thin
    scrollbar-thumb-gray-300
    scrollbar-track-transparent
    hover:scrollbar-thumb-primary-700 "
          >
            <FilterSection
              title="តម្រៀបតាម"
              icon={<IoSwapVerticalOutline />}
              isOpen={openSections.sort}
              onToggle={() => toggleSection("sort")}
            >
              <div className="flex flex-col gap-2">
                {[
                  {
                    label: "ការណែនាំល្អបំផុត",
                    value: "recommended",
                  },
                  {
                    label: "ពេញនិយមបំផុត",
                    value: "popular",
                  },
                  {
                    label: "ចំណាត់ថ្នាក់ខ្ពស់",
                    value: "rating",
                  },
                  {
                    label: "រៀបចំលឿនបំផុត",
                    value: "fastest",
                  },
                  {
                    label: "នៅជិតបំផុត",
                    value: "nearest",
                  },
                  {
                    label: "តម្លៃទាបទៅខ្ពស់",
                    value: "price-low",
                  },
                  {
                    label: "តម្លៃខ្ពស់ទៅទាប",
                    value: "price-high",
                  },
                ].map((option) => {
                  const isSelected = filters.sortBy === option.value;

                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                        isSelected
                          ? "border-primary-200 bg-primary-50 text-primary-800"
                          : "border-transparent text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="food-sort"
                        checked={isSelected}
                        onChange={() =>
                          onChange({
                            ...filters,
                            sortBy: option.value as SortBy,
                          })
                        }
                        className="h-4 w-4 shrink-0 accent-primary-800"
                      />

                      <span className="text-[16px]">{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </FilterSection>

            <FilterSection
              title="ប្រភេទម្ហូប"
              icon={<MdOutlineCategory />}
              isOpen={openSections.category}
              onToggle={() => toggleSection("category")}
            >
              <div className="mb-3 flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 transition focus-within:border-primary-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-50">
                <IoSearchOutline className="shrink-0 text-[20px] text-gray-400" />

                <input
                  value={categoryQuery}
                  onChange={(event) => setCategoryQuery(event.target.value)}
                  placeholder="ស្វែងរកប្រភេទម្ហូប"
                  className="w-full bg-transparent text-[16px] text-gray-600 outline-none placeholder:text-gray-400"
                />
              </div>

              <div className="option-scroll max-h-[230px] space-y-1 overflow-y-auto pr-2">
                {visibleCategoryOptions.map((option) => (
                  <CheckboxOption
                    key={option.code}
                    label={option.name}
                    count={option.count}
                    checked={filters.categoryCodes.includes(option.code)}
                    onChange={() =>
                      onChange({
                        ...filters,
                        categoryCodes: toggleInList(
                          filters.categoryCodes,
                          option.code,
                        ),
                      })
                    }
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection
              title="ម្ហូបតាមប្រទេស"
              icon={<MdOutlineCategory />}
              isOpen={openSections.cuisine}
              onToggle={() => toggleSection("cuisine")}
            >
              <div className="space-y-1">
                {cuisineOptions.map((option) => (
                  <CheckboxOption
                    key={option.code}
                    label={option.name}
                    count={option.count}
                    checked={filters.cuisineCodes.includes(option.code)}
                    onChange={() =>
                      onChange({
                        ...filters,
                        cuisineCodes: toggleInList(
                          filters.cuisineCodes,
                          option.code,
                        ),
                      })
                    }
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection
              title="ពេលទទួលទាន"
              icon={<IoTimeOutline />}
              isOpen={openSections.mealType}
              onToggle={() => toggleSection("mealType")}
            >
              <div className="space-y-1">
                {mealTypeOptions.map((option) => (
                  <CheckboxOption
                    key={option.code}
                    label={option.name}
                    count={option.count}
                    checked={filters.mealTypeCodes.includes(option.code)}
                    onChange={() =>
                      onChange({
                        ...filters,
                        mealTypeCodes: toggleInList(
                          filters.mealTypeCodes,
                          option.code,
                        ),
                      })
                    }
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection
              title="របបអាហារ"
              icon={<IoNutritionOutline />}
              isOpen={openSections.dietaryType}
              onToggle={() => toggleSection("dietaryType")}
            >
              <div className="space-y-1">
                {dietaryTypeOptions.map((option) => (
                  <CheckboxOption
                    key={option.code}
                    label={option.name}
                    count={option.count}
                    checked={filters.dietaryTypeCodes.includes(option.code)}
                    onChange={() =>
                      onChange({
                        ...filters,
                        dietaryTypeCodes: toggleInList(
                          filters.dietaryTypeCodes,
                          option.code,
                        ),
                      })
                    }
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection
              title="ក្រុមអាយុ"
              icon={<IoNutritionOutline />}
              isOpen={openSections.ageGroup}
              onToggle={() => toggleSection("ageGroup")}
            >
              <div className="space-y-1">
                {ageGroupOptions.map((option) => (
                  <CheckboxOption
                    key={option.code}
                    label={option.name}
                    count={option.count}
                    checked={filters.ageGroupCodes.includes(option.code)}
                    onChange={() =>
                      onChange({
                        ...filters,
                        ageGroupCodes: toggleInList(
                          filters.ageGroupCodes,
                          option.code,
                        ),
                      })
                    }
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection
              title="តម្លៃ"
              icon={<IoPricetagOutline />}
              isOpen={openSections.price}
              onToggle={() => toggleSection("price")}
            >
              <div className="grid grid-cols-3 gap-2">
                {(["$", "$$", "$$$"] as const).map((tier) => {
                  const isSelected = filters.priceTier === tier;

                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() =>
                        onChange({
                          ...filters,
                          priceTier: isSelected ? null : tier,
                        })
                      }
                      className={`rounded-xl border py-2.5 text-[16px] font-semibold transition ${
                        isSelected
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

            <FilterSection
              title="ភាពអាចរកបាន"
              icon={<FaFire />}
              isOpen={openSections.availability}
              onToggle={() => toggleSection("availability")}
            >
              <div className="space-y-2">
                <CheckboxOption
                  label="បង្ហាញតែម្ហូបដែលមានលក់"
                  checked={filters.availabilityOnly}
                  onChange={() =>
                    onChange({
                      ...filters,
                      availabilityOnly: !filters.availabilityOnly,
                    })
                  }
                />

                <CheckboxOption
                  label="បង្ហាញតែម្ហូបដែល AI ណែនាំ"
                  checked={filters.recommendedOnly}
                  onChange={() =>
                    onChange({
                      ...filters,
                      recommendedOnly: !filters.recommendedOnly,
                    })
                  }
                />
              </div>
            </FilterSection>

            {/* Bottom spacing keeps the last option away from the edge */}
            <div className="h-4" />
          </div>
        )}
      </div>

      {/* <style jsx>{`
          .filter-scroll {
            scrollbar-width: thin;
            scrollbar-color: #9fbbae transparent;
            scrollbar-gutter: stable;
          }

          .filter-scroll::-webkit-scrollbar {
            width: 10px;
          }

          .filter-scroll::-webkit-scrollbar-track {
            background: transparent;
            margin-top: 10px;
            margin-bottom: 10px;
          }

          .filter-scroll::-webkit-scrollbar-thumb {
            background: #9fbbae;
            border: 3px solid white;
            border-radius: 9999px;
          }

          .filter-scroll::-webkit-scrollbar-thumb:hover {
            background: #1c6b45;
          }

          .option-scroll {
            scrollbar-width: thin;
            scrollbar-color: #cbd5cf transparent;
          }

          .option-scroll::-webkit-scrollbar {
            width: 6px;
          }

          .option-scroll::-webkit-scrollbar-track {
            background: transparent;
          }

          .option-scroll::-webkit-scrollbar-thumb {
            background: #cbd5cf;
            border-radius: 9999px;
          }

          .option-scroll::-webkit-scrollbar-thumb:hover {
            background: #9fbbae;
          }
        `}</style> */}
    </motion.aside>
  );
}

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

            <span className="ml-2 opacity-70">{option.count}</span>
          </button>
        );
      })}
    </div>
  );
}

type FoodGridProps = {
  foods: MenuItem[];
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
      className="grid grid-cols-1 gap-x-10 gap-y-3  sm:grid-cols-2 xl:grid-cols-3"
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
            <Link href={`/food/${food.uuid}`} className="block h-full w-full">
              <FoodCard food={food} />
            </Link>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

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
export default function FoodPage() {
  const [activePageTab, setActivePageTab] = useState<FoodPageTab>("food");

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const {
    data: menuItems = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetMenuItemsQuery();

  const categoryOptions = useMemo(
    () =>
      getUniqueOptions(
        menuItems.map((item) => ({
          code: item.food.category.code,
          name: item.food.category.name,
        })),
      ),
    [menuItems],
  );

  const cuisineOptions = useMemo(
    () =>
      getUniqueOptions(
        menuItems.map((item) => ({
          code: item.food.cuisine.code,
          name: item.food.cuisine.name,
        })),
      ),
    [menuItems],
  );

  const mealTypeOptions = useMemo(
    () =>
      getUniqueOptions(
        menuItems.flatMap((item) =>
          item.mealTypes.map((mealType) => ({
            code: mealType.code,
            name: mealType.name,
          })),
        ),
      ),
    [menuItems],
  );

  const dietaryTypeOptions = useMemo(
    () =>
      getUniqueOptions(
        menuItems.flatMap((item) =>
          item.dietaryTypes.map((dietaryType) => ({
            code: dietaryType.code,
            name: dietaryType.name,
          })),
        ),
      ),
    [menuItems],
  );

  const ageGroupOptions = useMemo(
    () =>
      getUniqueOptions(
        menuItems.flatMap((item) =>
          item.food.ageGroups.map((ageGroup) => ({
            code: ageGroup.code,
            name: ageGroup.name,
          })),
        ),
      ),
    [menuItems],
  );

  const filteredFoods = useMemo(
    () => applyFilters(menuItems, filters),
    [menuItems, filters],
  );

  const recommendedFoods = useMemo(
    () =>
      filteredFoods
        .filter((food) => food.recommendation.isRecommended)
        .slice(0, 6),
    [filteredFoods],
  );

  const activeFilterCount = countActiveFilters(filters);

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <div className="pt-15" />

      {/* Tabs stay on the same FoodPage */}
      <div className="sticky top-15 z-30 w-full border-b border-gray-100 bg-white/85 backdrop-blur-md">
        <FoodNavTabs activeTab={activePageTab} onTabChange={setActivePageTab} />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6">
        {isLoading || isFetching ? (
          <LoadingState />
        ) : isError ? (
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
        ) : (
          <AnimatePresence mode="wait">
            {/* FOOD TAB */}
            {activePageTab === "food" && (
              <motion.div
                key="food-tab"
                initial={{
                  opacity: 0,
                  x: -24,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: 24,
                }}
                transition={{
                  duration: 0.25,
                  ease: "easeOut",
                }}
              >
                {/* Search */}
                <section className="rounded-[26px] border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="flex min-h-[56px] flex-1 items-center gap-3 rounded-full border border-gray-200 px-5 transition focus-within:border-primary-700 focus-within:ring-4 focus-within:ring-primary-50">
                      <IoSearchOutline className="shrink-0 text-[22px] text-primary-700" />

                      <input
                        type="text"
                        value={filters.query}
                        onChange={(event) =>
                          setFilters((current) => ({
                            ...current,
                            query: event.target.value,
                          }))
                        }
                        placeholder="ស្វែងរកម្ហូប ហាង គ្រឿងផ្សំ ឬរបបអាហារ..."
                        className="w-full bg-transparent text-[16px] text-gray-700 outline-none placeholder:text-gray-400"
                      />

                      {filters.query && (
                        <button
                          type="button"
                          onClick={() =>
                            setFilters((current) => ({
                              ...current,
                              query: "",
                            }))
                          }
                          className="text-[16px] font-medium text-secondary-500"
                        >
                          សម្អាត
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-full bg-primary-50 px-5 py-3">
                      <FaStar className="text-[20px] text-yellow-500" />

                      <p className="text-[16px] text-primary-800">
                        រកឃើញ{" "}
                        <span className="font-semibold">
                          {filteredFoods.length}
                        </span>{" "}
                        មុខម្ហូប
                      </p>
                    </div>

                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setFilters(DEFAULT_FILTERS)}
                        className="rounded-full border border-secondary-200 px-5 py-3 text-[16px] font-semibold text-secondary-500 transition hover:bg-secondary-50"
                      >
                        សម្អាតតម្រង {activeFilterCount}
                      </button>
                    )}
                  </div>
                </section>

                <div className="mt-6 flex gap-8">
                  <FilterSidebar
                    filters={filters}
                    onChange={setFilters}
                    categoryOptions={categoryOptions}
                    cuisineOptions={cuisineOptions}
                    mealTypeOptions={mealTypeOptions}
                    dietaryTypeOptions={dietaryTypeOptions}
                    ageGroupOptions={ageGroupOptions}
                  />

                  <main className="min-w-0 flex-1">
                    <CategoryTabs
                      options={categoryOptions}
                      selectedCodes={filters.categoryCodes}
                      onChange={(categoryCodes) =>
                        setFilters((current) => ({
                          ...current,
                          categoryCodes,
                        }))
                      }
                    />

                    {recommendedFoods.length > 0 && (
                      <section className="mt-8">
                        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                          <div>
                            <p className="text-[16px] font-semibold text-secondary-500">
                              FoodHub AI
                            </p>

                            <h2 className="mt-1 text-[26px] font-bold text-primary-900">
                              មុខម្ហូបណែនាំសម្រាប់អ្នក
                            </h2>
                          </div>

                          <span className="rounded-full bg-primary-50 px-4 py-2 text-[16px] font-semibold text-primary-700">
                            {recommendedFoods.length} ជម្រើស
                          </span>
                        </div>

                        <FoodGrid foods={recommendedFoods} />
                      </section>
                    )}

                    <section className="mt-12">
                      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                        <div>
                          <p className="text-[16px] font-semibold text-secondary-500">
                            មុខម្ហូបទាំងអស់
                          </p>

                          <h2 className="mt-1 text-[26px] font-bold text-primary-900">
                            ស្វែងរកជម្រើសដែលអ្នកចូលចិត្ត
                          </h2>
                        </div>

                        <p className="text-[16px] text-gray-500">
                          បង្ហាញ {filteredFoods.length} ក្នុងចំណោម{" "}
                          {menuItems.length}
                        </p>
                      </div>

                      <FoodGrid foods={filteredFoods} />
                    </section>

                    <section className="mt-14 overflow-hidden rounded-[28px] bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-500 px-6 py-12 text-center text-white">
                      <p className="text-[28px] font-semibold md:text-[36px]">
                        បទពិសោធន៍ថ្មីក្នុងការស្វែងរកអាហារ
                      </p>

                      <p className="mx-auto mt-3 max-w-2xl text-[16px] leading-8 text-white/80">
                        ស្វែងរកមុខម្ហូបដែលសមនឹងចំណូលចិត្ត របបអាហារ អាឡែស៊ី ថវិកា
                        និងទីតាំងរបស់អ្នក។
                      </p>
                    </section>
                  </main>
                </div>
              </motion.div>
            )}

            {/* LOCATION TAB */}
            {activePageTab === "location" && (
              <LocationContent key="location-tab" menuItems={menuItems} />
            )}

            {/* STORE TAB */}
            {activePageTab === "store" && (
              <StoreContent key="store-tab" menuItems={menuItems} />
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
// export default function FoodPage() {
//   const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

//   const {
//     data: menuItems = [],
//     isLoading,
//     isFetching,
//     isError,
//     error,
//     refetch,
//   } = useGetMenuItemsQuery();

//   const categoryOptions = useMemo(
//     () =>
//       getUniqueOptions(
//         menuItems.map((item) => ({
//           code: item.food.category.code,
//           name: item.food.category.name,
//         })),
//       ),
//     [menuItems],
//   );

//   const cuisineOptions = useMemo(
//     () =>
//       getUniqueOptions(
//         menuItems.map((item) => ({
//           code: item.food.cuisine.code,
//           name: item.food.cuisine.name,
//         })),
//       ),
//     [menuItems],
//   );

//   const mealTypeOptions = useMemo(
//     () =>
//       getUniqueOptions(
//         menuItems.flatMap((item) =>
//           item.mealTypes.map((mealType) => ({
//             code: mealType.code,
//             name: mealType.name,
//           })),
//         ),
//       ),
//     [menuItems],
//   );

//   const dietaryTypeOptions = useMemo(
//     () =>
//       getUniqueOptions(
//         menuItems.flatMap((item) =>
//           item.dietaryTypes.map((dietaryType) => ({
//             code: dietaryType.code,
//             name: dietaryType.name,
//           })),
//         ),
//       ),
//     [menuItems],
//   );

//   const ageGroupOptions = useMemo(
//     () =>
//       getUniqueOptions(
//         menuItems.flatMap((item) =>
//           item.food.ageGroups.map((ageGroup) => ({
//             code: ageGroup.code,
//             name: ageGroup.name,
//           })),
//         ),
//       ),
//     [menuItems],
//   );

//   const filteredFoods = useMemo(
//     () => applyFilters(menuItems, filters),
//     [menuItems, filters],
//   );

//   const recommendedFoods = useMemo(
//     () =>
//       filteredFoods
//         .filter((food) => food.recommendation.isRecommended)
//         .slice(0, 6),
//     [filteredFoods],
//   );

//   const activeFilterCount = countActiveFilters(filters);

//   return (
//     <div className="min-h-screen bg-[#fafaf8]">
//       <div className="pt-15" />

//       <div className="sticky top-15 z-20 mx-auto w-full bg-white/70 backdrop-blur-md">
//         <FoodNavTabs />
//       </div>

//       <div className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6">
//         {/* Search */}
//         <section className="rounded-[26px] border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
//           <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
//             <div className="flex min-h-[56px] flex-1 items-center gap-3 rounded-full border border-gray-200 px-5 transition focus-within:border-primary-700 focus-within:ring-4 focus-within:ring-primary-50">
//               <IoSearchOutline className="shrink-0 text-[22px] text-primary-700" />

//               <input
//                 type="text"
//                 value={filters.query}
//                 onChange={(event) =>
//                   setFilters({
//                     ...filters,
//                     query: event.target.value,
//                   })
//                 }
//                 placeholder="ស្វែងរកម្ហូប ហាង គ្រឿងផ្សំ ឬរបបអាហារ..."
//                 className="w-full bg-transparent text-[16px] text-gray-700 outline-none placeholder:text-gray-400"
//               />

//               {filters.query && (
//                 <button
//                   type="button"
//                   onClick={() =>
//                     setFilters({
//                       ...filters,
//                       query: "",
//                     })
//                   }
//                   className="text-[16px] font-medium text-secondary-500"
//                 >
//                   សម្អាត
//                 </button>
//               )}
//             </div>

//             <div className="flex items-center justify-between gap-3 rounded-full bg-primary-50 px-5 py-3">
//               <FaStar className="text-[20px] text-yellow-500" />

//               <p className="text-[16px] text-primary-800">
//                 រកឃើញ{" "}
//                 <span className="font-semibold">{filteredFoods.length}</span>{" "}
//                 មុខម្ហូប
//               </p>
//             </div>

//             {activeFilterCount > 0 && (
//               <button
//                 type="button"
//                 onClick={() => setFilters(DEFAULT_FILTERS)}
//                 className="rounded-full border border-secondary-200 px-5 py-3 text-[16px] font-semibold text-secondary-500 transition hover:bg-secondary-50"
//               >
//                 សម្អាតតម្រង {activeFilterCount}
//               </button>
//             )}
//           </div>
//         </section>

//         <div className="mt-6 flex gap-8">
//           <FilterSidebar
//             filters={filters}
//             onChange={setFilters}
//             categoryOptions={categoryOptions}
//             cuisineOptions={cuisineOptions}
//             mealTypeOptions={mealTypeOptions}
//             dietaryTypeOptions={dietaryTypeOptions}
//             ageGroupOptions={ageGroupOptions}
//           />

//           <main className="min-w-0 flex-1">
//             <CategoryTabs
//               options={categoryOptions}
//               selectedCodes={filters.categoryCodes}
//               onChange={(categoryCodes) =>
//                 setFilters({
//                   ...filters,
//                   categoryCodes,
//                 })
//               }
//             />

//             {isLoading || isFetching ? (
//               <LoadingState />
//             ) : isError ? (
//               <div className="flex min-h-[500px] flex-col items-center justify-center gap-4 rounded-[24px] border border-red-100 bg-white px-5 text-center">
//                 <p className="text-[20px] font-semibold text-red-500">
//                   មិនអាចទាញយកមុខម្ហូបបានទេ
//                 </p>

//                 <p className="text-[16px] text-gray-500">
//                   សូមពិនិត្យការតភ្ជាប់ ហើយព្យាយាមម្តងទៀត។
//                 </p>

//                 <button
//                   type="button"
//                   onClick={() => refetch()}
//                   className="flex items-center gap-2 rounded-full bg-primary-800 px-5 py-3 text-[16px] font-semibold text-white"
//                 >
//                   <IoRefresh className="text-[20px]" />
//                   ព្យាយាមម្តងទៀត
//                 </button>

//                 <pre className="max-w-full overflow-auto whitespace-pre-wrap text-left text-[16px] text-red-400">
//                   {JSON.stringify(error, null, 2)}
//                 </pre>
//               </div>
//             ) : (
//               <>
//                 {recommendedFoods.length > 0 && (
//                   <section className="mt-8">
//                     <div className="mb-6 flex items-end justify-between gap-4">
//                       <div>
//                         <p className="text-[16px] font-semibold text-secondary-500">
//                           FoodHub AI
//                         </p>

//                         <h2 className="mt-1 text-[26px] font-bold text-primary-900">
//                           មុខម្ហូបណែនាំសម្រាប់អ្នក
//                         </h2>
//                       </div>

//                       <span className="rounded-full bg-primary-50 px-4 py-2 text-[16px] font-semibold text-primary-700">
//                         {recommendedFoods.length} ជម្រើស
//                       </span>
//                     </div>

//                     <FoodGrid foods={recommendedFoods} />
//                   </section>
//                 )}

//                 <section className="mt-12">
//                   <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
//                     <div>
//                       <p className="text-[16px] font-semibold text-secondary-500">
//                         មុខម្ហូបទាំងអស់
//                       </p>

//                       <h2 className="mt-1 text-[26px] font-bold text-primary-900">
//                         ស្វែងរកជម្រើសដែលអ្នកចូលចិត្ត
//                       </h2>
//                     </div>

//                     <p className="text-[16px] text-gray-500">
//                       បង្ហាញ {filteredFoods.length} ក្នុងចំណោម{" "}
//                       {menuItems.length}
//                     </p>
//                   </div>

//                   <FoodGrid foods={filteredFoods} />
//                 </section>
//               </>
//             )}

//             <section className="mt-14 overflow-hidden rounded-[28px] bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-500 px-6 py-12 text-center text-white">
//               <p className="text-[28px] font-semibold md:text-[36px]">
//                 បទពិសោធន៍ថ្មីក្នុងការស្វែងរកអាហារ
//               </p>

//               <p className="mx-auto mt-3 max-w-2xl text-[16px] leading-8 text-white/80">
//                 ស្វែងរកមុខម្ហូបដែលសមនឹងចំណូលចិត្ត របបអាហារ អាឡែស៊ី ថវិកា
//                 និងទីតាំងរបស់អ្នក។
//               </p>
//             </section>
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// }
