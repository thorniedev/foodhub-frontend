// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import { IoChevronBack, IoChevronForward, IoSearchOutline } from "react-icons/io5";

// import { useGetMenuItemsQuery } from "@/app/store/menuApi";
// import FoodCard from "@/components/dynamic-card/FoodCard";
// import type { CatalogMenuItem } from "@/types/catalog-menu-item";
// import SortDropdown from "./SortDropdown";

// const ITEMS_PER_PAGE = 10;
// /* =========================================================
//    TYPES
// ========================================================= */

// type FilterGroupKey =
//   | "category"
//   | "cuisine"
//   | "dietary"
//   | "age"
//   | "mealType"
//   | "allergen"
//   | "preparationTime";

// type FilterOption = {
//   code: string;
//   name: string;
// };

// type ChipGroup = {
//   title: string;
//   key: FilterGroupKey;
//   options: FilterOption[];
//   description?: string;
// };

// type SortOption =
//   | "default"
//   | "price-asc"
//   | "price-desc"
//   | "preparation-asc"
//   | "preparation-desc"
//   | "rating-desc"
//   | "name-asc";

// type PreparationRangeCode = "UNDER_10" | "MIN_11_20" | "MIN_21_30" | "OVER_30";

// /* =========================================================
//    TEXT NORMALIZER
// ========================================================= */

// function normalizeText(value: unknown): string {
//   return String(value ?? "")
//     .trim()
//     .toLowerCase()
//     .normalize("NFKC")
//     .replace(/[_\-]+/g, " ")
//     .replace(/\s+/g, " ");
// }

// /**
//  * GLOBAL SEARCH
//  *
//  * This searches the ENTIRE menu item object returned by the backend,
//  * including nested values such as:
//  *
//  * name, localName, descriptions, price, currency, store information,
//  * category, cuisine, spice level, age groups, seasons, meal types,
//  * dietary types, events, weather, ingredients, allergens, nutrition,
//  * recommendation, origin, filterOption, source, status, etc.
//  *
//  * JSON.stringify also includes the property names, so a query such as
//  * "calories", "proteinGrams", "countryName", "rainy", "HALAL", etc.
//  * can match.
//  */
// function buildGlobalSearchText(food: CatalogMenuItem): string {
//   try {
//     return normalizeText(JSON.stringify(food));
//   } catch {
//     return normalizeText(
//       [
//         food.uuid,
//         food.name,
//         food.localName,
//         food.description,
//         food.localDescription,
//         food.price,
//         food.currencyCode,
//         food.store?.name,
//         food.food?.category?.name,
//         food.food?.cuisine?.name,
//       ].join(" "),
//     );
//   }
// }

// function matchesGlobalQuery(food: CatalogMenuItem, query: string): boolean {
//   const normalizedQuery = normalizeText(query);

//   if (!normalizedQuery) {
//     return true;
//   }

//   const searchableText = buildGlobalSearchText(food);

//   /**
//    * Multi-word search:
//    * "khmer halal rainy"
//    *
//    * Every word must exist somewhere in the full menu-item response.
//    */
//   const tokens = normalizedQuery
//     .split(" ")
//     .map((token) => token.trim())
//     .filter(Boolean);

//   return tokens.every((token) => searchableText.includes(token));
// }

// /* =========================================================
//    SAFE DATA HELPERS
// ========================================================= */

// function getCategory(food: CatalogMenuItem): FilterOption | null {
//   const category = food.food?.category;

//   if (!category?.code || !category?.name) {
//     return null;
//   }

//   return {
//     code: category.code,
//     name: category.name,
//   };
// }

// function getCuisine(food: CatalogMenuItem): FilterOption | null {
//   const cuisine = food.food?.cuisine;

//   if (!cuisine?.code || !cuisine?.name) {
//     return null;
//   }

//   return {
//     code: cuisine.code,
//     name: cuisine.name,
//   };
// }

// function getAgeGroups(food: CatalogMenuItem): FilterOption[] {
//   if (!Array.isArray(food.food?.ageGroups)) {
//     return [];
//   }

//   return food.food.ageGroups.flatMap((ageGroup) => {
//     if (!ageGroup?.code || !ageGroup?.name) {
//       return [];
//     }

//     return [
//       {
//         code: ageGroup.code,
//         name: ageGroup.name,
//       },
//     ];
//   });
// }

// function getMealTypes(food: CatalogMenuItem): FilterOption[] {
//   if (!Array.isArray(food.food?.mealTypes)) {
//     return [];
//   }

//   return food.food.mealTypes.flatMap((mealType) => {
//     if (!mealType?.code || !mealType?.name) {
//       return [];
//     }

//     return [
//       {
//         code: mealType.code,
//         name: mealType.name,
//       },
//     ];
//   });
// }

// function getDietaryOptions(food: CatalogMenuItem): FilterOption[] {
//   if (!Array.isArray(food.food?.dietaryTypes)) {
//     return [];
//   }

//   return food.food.dietaryTypes.flatMap((dietary) => {
//     if (!dietary?.code || !dietary?.name) {
//       return [];
//     }

//     return [
//       {
//         code: dietary.code,
//         name: dietary.name,
//       },
//     ];
//   });
// }

// /**
//  * allergenDeclarations is still unknown[] in your verified type because
//  * the response sample currently contains [].
//  *
//  * This helper safely supports common backend shapes without forcing
//  * a wrong TypeScript interface:
//  *
//  * { code, name }
//  * { allergenCode, allergenName }
//  * { allergen: { code, name } }
//  * "PEANUT"
//  */
// function getAllergenOptions(food: CatalogMenuItem): FilterOption[] {
//   if (!Array.isArray(food.allergenDeclarations)) {
//     return [];
//   }

//   return food.allergenDeclarations.flatMap((item, index) => {
//     if (typeof item === "string") {
//       const value = item.trim();

//       return value
//         ? [
//             {
//               code: value,
//               name: value,
//             },
//           ]
//         : [];
//     }

//     if (typeof item !== "object" || item === null) {
//       return [];
//     }

//     const record = item as Record<string, unknown>;

//     const nestedAllergen =
//       typeof record.allergen === "object" && record.allergen !== null
//         ? (record.allergen as Record<string, unknown>)
//         : null;

//     const codeCandidate =
//       record.code ??
//       record.allergenCode ??
//       record.allergenUuid ??
//       nestedAllergen?.code ??
//       nestedAllergen?.uuid;

//     const nameCandidate =
//       record.name ??
//       record.allergenName ??
//       record.localName ??
//       nestedAllergen?.name ??
//       nestedAllergen?.localName;

//     const code =
//       typeof codeCandidate === "string" && codeCandidate.trim()
//         ? codeCandidate.trim()
//         : typeof nameCandidate === "string" && nameCandidate.trim()
//           ? nameCandidate.trim()
//           : `allergen-${index}`;

//     const name =
//       typeof nameCandidate === "string" && nameCandidate.trim()
//         ? nameCandidate.trim()
//         : typeof codeCandidate === "string" && codeCandidate.trim()
//           ? codeCandidate.trim()
//           : null;

//     if (!name) {
//       return [];
//     }

//     return [
//       {
//         code,
//         name,
//       },
//     ];
//   });
// }

// /* =========================================================
//    UNIQUE OPTIONS
// ========================================================= */

// function getUniqueOptions(values: FilterOption[]): FilterOption[] {
//   const optionMap = new Map<string, FilterOption>();

//   values.forEach((item) => {
//     const code = item.code?.trim();
//     const name = item.name?.trim();

//     if (!code || !name) {
//       return;
//     }

//     const key = normalizeText(code);

//     if (!optionMap.has(key)) {
//       optionMap.set(key, {
//         code,
//         name,
//       });
//     }
//   });

//   return Array.from(optionMap.values()).sort((first, second) =>
//     first.name.localeCompare(second.name),
//   );
// }

// /* =========================================================
//    FILTER MATCH HELPERS
// ========================================================= */

// function hasSelectedValue(
//   itemValues: string[],
//   selectedValues: Set<string>,
// ): boolean {
//   if (selectedValues.size === 0) {
//     return true;
//   }

//   const normalizedItems = new Set(itemValues.map(normalizeText));

//   /**
//    * Multiple chips inside the same group use OR.
//    *
//    * Example:
//    * Cuisine = Khmer OR Thai
//    */
//   return [...selectedValues].some((selectedValue) =>
//     normalizedItems.has(normalizeText(selectedValue)),
//   );
// }

// function containsExcludedAllergen(
//   food: CatalogMenuItem,
//   excludedAllergens: Set<string>,
// ): boolean {
//   if (excludedAllergens.size === 0) {
//     return false;
//   }

//   const allergenOptions = getAllergenOptions(food);

//   const itemValues = allergenOptions.flatMap((allergen) => [
//     normalizeText(allergen.code),
//     normalizeText(allergen.name),
//   ]);

//   return [...excludedAllergens].some((selectedAllergen) => {
//     const normalizedSelected = normalizeText(selectedAllergen);

//     return itemValues.includes(normalizedSelected);
//   });
// }

// function matchesPreparationRange(
//   minutes: number | null,
//   selectedRanges: Set<string>,
// ): boolean {
//   if (selectedRanges.size === 0) {
//     return true;
//   }

//   if (minutes === null || !Number.isFinite(minutes)) {
//     return false;
//   }

//   return [...selectedRanges].some((range) => {
//     switch (range as PreparationRangeCode) {
//       case "UNDER_10":
//         return minutes <= 10;

//       case "MIN_11_20":
//         return minutes >= 11 && minutes <= 20;

//       case "MIN_21_30":
//         return minutes >= 21 && minutes <= 30;

//       case "OVER_30":
//         return minutes > 30;

//       default:
//         return true;
//     }
//   });
// }

// /* =========================================================
//    SORT
// ========================================================= */

// function sortFoods(
//   foods: CatalogMenuItem[],
//   sortBy: SortOption,
// ): CatalogMenuItem[] {
//   const sorted = [...foods];

//   switch (sortBy) {
//     case "price-asc":
//       return sorted.sort((a, b) => a.price - b.price);

//     case "price-desc":
//       return sorted.sort((a, b) => b.price - a.price);

//     case "preparation-asc":
//       return sorted.sort((a, b) => {
//         const first = a.preparationTimeMinutes ?? Number.POSITIVE_INFINITY;
//         const second = b.preparationTimeMinutes ?? Number.POSITIVE_INFINITY;

//         return first - second;
//       });

//     case "preparation-desc":
//       return sorted.sort((a, b) => {
//         const first = a.preparationTimeMinutes ?? Number.NEGATIVE_INFINITY;
//         const second = b.preparationTimeMinutes ?? Number.NEGATIVE_INFINITY;

//         return second - first;
//       });

//     case "rating-desc":
//       return sorted.sort(
//         (a, b) =>
//           Number(b.store?.averageRating ?? 0) -
//           Number(a.store?.averageRating ?? 0),
//       );

//     case "name-asc":
//       return sorted.sort((a, b) => {
//         const first = a.localName?.trim() || a.name;
//         const second = b.localName?.trim() || b.name;

//         return first.localeCompare(second);
//       });

//     case "default":
//     default:
//       return sorted;
//   }
// }

// /* =========================================================
//    ICONS
// ========================================================= */

// function GridIcon({ className }: { className?: string }) {
//   return (
//     <svg
//       className={className}
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth={2}
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <rect x="3" y="3" width="7" height="7" rx="1.5" />
//       <rect x="14" y="3" width="7" height="7" rx="1.5" />
//       <rect x="3" y="14" width="7" height="7" rx="1.5" />
//       <rect x="14" y="14" width="7" height="7" rx="1.5" />
//     </svg>
//   );
// }

// function ChevronIcon({ className }: { className?: string }) {
//   return (
//     <svg
//       className={className}
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth={2.5}
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <polyline points="6 9 12 15 18 9" />
//     </svg>
//   );
// }

// /* =========================================================
//    COMPONENT
// ========================================================= */

// export default function FoodSearchBar() {
//   const [searchInput, setSearchInput] = useState("");

//   const [isOpen, setIsOpen] = useState(false);

//   const [selected, setSelected] = useState<Set<string>>(new Set());

//   const [sortBy, setSortBy] = useState<SortOption>("default");

//   const wrapRef = useRef<HTMLDivElement>(null);

//   const {
//     data: menuItems = [],
//     isLoading,
//     isFetching,
//     isError,
//     refetch,
//   } = useGetMenuItemsQuery();

//   /* =======================================================
//      CLOSE FILTER WHEN CLICKING OUTSIDE
//   ======================================================= */

//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside);

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   /* =======================================================
//      BUILD FILTER OPTIONS FROM CURRENT API RESPONSE
//   ======================================================= */

//   const chipGroups = useMemo<ChipGroup[]>(() => {
//     const categories = getUniqueOptions(
//       menuItems.flatMap((item) => {
//         const category = getCategory(item);

//         return category ? [category] : [];
//       }),
//     );

//     const cuisines = getUniqueOptions(
//       menuItems.flatMap((item) => {
//         const cuisine = getCuisine(item);

//         return cuisine ? [cuisine] : [];
//       }),
//     );

//     const dietaryTypes = getUniqueOptions(
//       menuItems.flatMap((item) => getDietaryOptions(item)),
//     );

//     const ageGroups = getUniqueOptions(
//       menuItems.flatMap((item) => getAgeGroups(item)),
//     );

//     const mealTypes = getUniqueOptions(
//       menuItems.flatMap((item) => getMealTypes(item)),
//     );

//     const allergens = getUniqueOptions(
//       menuItems.flatMap((item) => getAllergenOptions(item)),
//     );

//     const preparationOptions: FilterOption[] = [
//       {
//         code: "UNDER_10",
//         name: "≤ 10 នាទី",
//       },
//       {
//         code: "MIN_11_20",
//         name: "11 - 20 នាទី",
//       },
//       {
//         code: "MIN_21_30",
//         name: "21 - 30 នាទី",
//       },
//       {
//         code: "OVER_30",
//         name: "> 30 នាទី",
//       },
//     ];

//     const groups: ChipGroup[] = [
//       {
//         title: "ប្រភេទម្ហូប",
//         key: "category",
//         options: categories,
//       },
//       {
//         title: "ម្ហូបតាមប្រទេស",
//         key: "cuisine",
//         options: cuisines,
//       },
//       {
//         title: "របបអាហារ",
//         key: "dietary",
//         options: dietaryTypes,
//       },
//       {
//         title: "ក្រុមអាយុ",
//         key: "age",
//         options: ageGroups,
//       },
//       {
//         title: "ពេលអាហារ",
//         key: "mealType",
//         options: mealTypes,
//       },
//       {
//         title: "ជៀសវាងអាឡែស៊ី",
//         key: "allergen",
//         options: allergens,
//         description: "មុខម្ហូបដែលមានអាឡែស៊ីដែលបានជ្រើសនឹងត្រូវដកចេញពីលទ្ធផល។",
//       },
//       {
//         title: "ពេលរៀបចំ",
//         key: "preparationTime",
//         options: preparationOptions,
//       },
//     ];

//     /**
//      * Dynamic backend groups are hidden when the API does not provide
//      * any values.
//      *
//      * Preparation time is always available because its ranges are local.
//      */
//     return groups.filter((group) => group.options.length > 0);
//   }, [menuItems]);

//   /* =======================================================
//      SELECTION HELPERS
//   ======================================================= */

//   function getSelectionKey(group: FilterGroupKey, code: string): string {
//     return `${group}::${code}`;
//   }

//   function toggleChip(group: FilterGroupKey, code: string) {
//     const value = getSelectionKey(group, code);

//     setSelected((previous) => {
//       const next = new Set(previous);

//       if (next.has(value)) {
//         next.delete(value);
//       } else {
//         next.add(value);
//       }

//       return next;
//     });
//   }

//   function clearAll() {
//     setSelected(new Set());
//     setSortBy("default");
//   }

//   /* =======================================================
//      GROUP SELECTED FILTERS
//   ======================================================= */

//   const groupedSelected = useMemo(() => {
//     const groups: Record<FilterGroupKey, Set<string>> = {
//       category: new Set<string>(),
//       cuisine: new Set<string>(),
//       dietary: new Set<string>(),
//       age: new Set<string>(),
//       mealType: new Set<string>(),
//       allergen: new Set<string>(),
//       preparationTime: new Set<string>(),
//     };

//     selected.forEach((value) => {
//       const separatorIndex = value.indexOf("::");

//       if (separatorIndex === -1) {
//         return;
//       }

//       const group = value.slice(0, separatorIndex) as FilterGroupKey;
//       const code = value.slice(separatorIndex + 2);

//       if (!code || !(group in groups)) {
//         return;
//       }

//       groups[group].add(code);
//     });

//     return groups;
//   }, [selected]);

//   /* =======================================================
//      FILTER + GLOBAL SEARCH + SORT
//   ======================================================= */

//   const filteredFoods = useMemo(() => {
//     const result = menuItems.filter((food) => {
//       const category = getCategory(food);
//       const cuisine = getCuisine(food);

//       const dietaryTypes = getDietaryOptions(food);
//       const ageGroups = getAgeGroups(food);
//       const mealTypes = getMealTypes(food);

//       const matchesCategory = hasSelectedValue(
//         category ? [category.code] : [],
//         groupedSelected.category,
//       );

//       const matchesCuisine = hasSelectedValue(
//         cuisine ? [cuisine.code] : [],
//         groupedSelected.cuisine,
//       );

//       const matchesDietary = hasSelectedValue(
//         dietaryTypes.map((diet) => diet.code),
//         groupedSelected.dietary,
//       );

//       const matchesAge = hasSelectedValue(
//         ageGroups.map((ageGroup) => ageGroup.code),
//         groupedSelected.age,
//       );

//       const matchesMealType = hasSelectedValue(
//         mealTypes.map((mealType) => mealType.code),
//         groupedSelected.mealType,
//       );

//       /**
//        * Allergy filters work as EXCLUSION filters.
//        *
//        * If user chooses PEANUT, foods declaring PEANUT are removed.
//        */
//       const containsAllergy = containsExcludedAllergen(
//         food,
//         groupedSelected.allergen,
//       );

//       const matchesPreparation = matchesPreparationRange(
//         food.preparationTimeMinutes,
//         groupedSelected.preparationTime,
//       );

//       return (
//         matchesGlobalQuery(food, searchInput) &&
//         matchesCategory &&
//         matchesCuisine &&
//         matchesDietary &&
//         matchesAge &&
//         matchesMealType &&
//         !containsAllergy &&
//         matchesPreparation
//       );
//     });

//     return sortFoods(result, sortBy);
//   }, [menuItems, searchInput, groupedSelected, sortBy]);

//   /* =======================================================
//      PAGINATION (10 items / page)
//   ======================================================= */

//   const [currentPage, setCurrentPage] = useState(1);

//   /* Reset page when filters or query change */
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchInput, groupedSelected, sortBy]);

//   const totalPages = Math.ceil(filteredFoods.length / ITEMS_PER_PAGE) || 1;

//   const paginatedFoods = useMemo(() => {
//     const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//     return filteredFoods.slice(startIndex, startIndex + ITEMS_PER_PAGE);
//   }, [filteredFoods, currentPage]);

//   const handlePageChange = (page: number) => {
//     if (page < 1 || page > totalPages || page === currentPage) return;
//     setCurrentPage(page);
//   };

//   const pageNumbers = useMemo(() => {
//     if (totalPages <= 5) {
//       return Array.from({ length: totalPages }, (_, i) => i + 1);
//     }
//     if (currentPage <= 3) {
//       return [1, 2, 3, 4, "...", totalPages];
//     }
//     if (currentPage >= totalPages - 2) {
//       return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
//     }
//     return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
//   }, [currentPage, totalPages]);

//   /* =======================================================
//      SELECTED LABELS
//   ======================================================= */

//   const selectedLabels = useMemo(() => {
//     const labels: string[] = [];

//     chipGroups.forEach((group) => {
//       group.options.forEach((option) => {
//         const key = getSelectionKey(group.key, option.code);

//         if (selected.has(key)) {
//           labels.push(option.name);
//         }
//       });
//     });

//     return labels;
//   }, [chipGroups, selected]);

//   const count = selected.size;

//   const label =
//     count === 0
//       ? "តម្រងអាហារ"
//       : selectedLabels.slice(0, 2).join(", ") +
//         (count > 2 ? ` +${count - 2}` : "");

//   /* =======================================================
//      UI
//   ======================================================= */

//   return (
//     <div className="container mx-auto w-full max-w-7xl pt-12.5 text-[#3d3d3a]">
//       {/* ===============================================
//           SEARCH + FILTER BAR
//       =============================================== */}

//       <div className="sticky top-18 z-50 mx-auto flex w-full max-w-7xl flex-wrap items-stretch gap-3.5 px-4 pb-6">
//         {/* SEARCH */}

//         <div className="flex min-h-[56px] w-full min-w-0 sm:min-h-[60px] sm:min-w-[280px] sm:flex-1 items-center gap-3 rounded-full border border-[#e7e6e1] bg-white px-[22px] shadow-sm transition focus-within:border-[#1c6b45] focus-within:ring-4 focus-within:ring-[#e8f3ec]">
//           <IoSearchOutline className="shrink-0 text-[22px] text-[#1c6b45]" />

//           <input
//             type="search"
//             value={searchInput}
//             onChange={(event) => setSearchInput(event.target.value)}
//             placeholder="ស្វែងរកគ្រប់ព័ត៌មានម្ហូប..."
//             className="h-full w-full bg-transparent text-[15px] outline-none placeholder:text-[#a3a29a]"
//           />

//           {searchInput && (
//             <button
//               type="button"
//               onClick={() => setSearchInput("")}
//               className="cursor-pointer text-sm text-gray-400 hover:text-gray-700"
//               aria-label="Clear search"
//             >
//               ✕
//             </button>
//           )}
//         </div>

//         {/* SORT */}

//         <SortDropdown value={sortBy} onChange={setSortBy} />
//         {/* FILTER */}

//         <div ref={wrapRef} className="relative z-50 w-full min-w-0 sm:w-auto sm:min-w-[220px] flex-1 sm:flex-none">
//           <button
//             type="button"
//             onClick={() => setIsOpen((previous) => !previous)}
//             className={`flex h-[60px] w-full items-center gap-2.5 rounded-full border bg-white px-[22px] text-[15px] text-[#3d3d3a] shadow-sm transition-all ${
//               isOpen
//                 ? "border-[#1c6b45] ring-4 ring-[#e8f3ec]"
//                 : "border-[#e7e6e1] hover:border-[#cfcec6]"
//             }`}
//           >
//             <GridIcon className="h-5 w-5 shrink-0 text-[#1c6b45]" />

//             <span className="flex-1 truncate text-left">{label}</span>

//             {count > 0 && (
//               <span className="rounded-full bg-[#1c6b45] px-2 py-0.5 text-base font-semibold text-white">
//                 {count}
//               </span>
//             )}

//             <ChevronIcon
//               className={`h-4 w-4 shrink-0 text-[#1c6b45] transition-transform ${
//                 isOpen ? "rotate-180" : ""
//               }`}
//             />
//           </button>

//           {/* DROPDOWN */}

//           <div
//             className={`absolute right-0 top-[calc(100%+10px)] z-50 w-[420px] max-w-[90vw] rounded-[18px] border border-[#e7e6e1] bg-white p-5 shadow-xl transition-all ${
//               isOpen
//                 ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
//                 : "pointer-events-none -translate-y-2 scale-[0.98] opacity-0"
//             }`}
//           >
//             <div className="mb-3 flex items-center justify-between gap-3">
//               <p className="text-sm text-gray-400">ជ្រើសតម្រងច្រើនបាន</p>

//               {(count > 0 || sortBy !== "default") && (
//                 <button
//                   type="button"
//                   onClick={clearAll}
//                   className="cursor-pointer rounded-full bg-secondary-50 px-3 py-1 text-sm text-secondary-500 underline underline-offset-2 hover:text-secondary-800"
//                 >
//                   សម្អាតទាំងអស់
//                 </button>
//               )}
//             </div>

//             <div className="scrollbar-hide max-h-[70vh] overflow-y-auto">
//               {chipGroups.map((group, index) => (
//                 <div
//                   key={group.key}
//                   className={
//                     index > 0 ? "mt-5 border-t border-[#e7e6e1] pt-[18px]" : ""
//                   }
//                 >
//                   <p className="mb-1 text-xl font-semibold text-[#a3a29a]">
//                     {group.title}
//                   </p>

//                   {group.description && (
//                     <p className="mb-3 text-sm leading-6 text-gray-400">
//                       {group.description}
//                     </p>
//                   )}

//                   <div className="flex flex-wrap gap-2">
//                     {group.options.map((option) => {
//                       const selectionKey = getSelectionKey(
//                         group.key,
//                         option.code,
//                       );

//                       const isSelected = selected.has(selectionKey);

//                       return (
//                         <button
//                           key={selectionKey}
//                           type="button"
//                           onClick={() => toggleChip(group.key, option.code)}
//                           className={`cursor-pointer rounded-full border px-4 py-2 text-base transition-all ${
//                             isSelected
//                               ? group.key === "allergen"
//                                 ? "border-red-500 bg-red-500 text-white"
//                                 : "border-[#1c6b45] bg-[#1c6b45] text-white"
//                               : "border-[#e7e6e1] bg-white text-[#3d3d3a] hover:border-[#1c6b45]"
//                           }`}
//                         >
//                           {option.name}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               ))}

//               {chipGroups.length === 0 && (
//                 <p className="py-5 text-center text-sm text-gray-400">
//                   មិនមានទិន្នន័យតម្រង
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ===============================================
//           RESULT SUMMARY
//       =============================================== */}

//       {!isLoading && !isError && (
//         <div className="flex flex-wrap items-center gap-2 px-4 pb-3 text-base text-gray-400">
//           <span>រកឃើញ</span>

//           <span className="font-semibold text-primary-700">
//             {filteredFoods.length}
//           </span>

//           <span>មុខម្ហូប</span>

//           {searchInput.trim() && (
//             <>
//               <span>សម្រាប់</span>
//               <span className="max-w-[260px] truncate font-medium text-gray-600">
//                 “{searchInput.trim()}”
//               </span>
//             </>
//           )}
//         </div>
//       )}

//       {/* ===============================================
//           GRID
//       =============================================== */}

//       <div className="mt-3 grid grid-cols-1 place-items-center gap-4 px-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
//         {/* LOADING */}

//         {(isLoading || isFetching) && (
//           <p className="col-span-full py-10 text-center text-gray-400">
//             កំពុងផ្ទុក...
//           </p>
//         )}

//         {/* ERROR */}

//         {isError && (
//           <div className="col-span-full flex flex-col items-center gap-3 py-10 text-center">
//             <p className="text-red-500">មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ</p>

//             <button
//               type="button"
//               onClick={() => refetch()}
//               className="cursor-pointer rounded-full bg-primary-800 px-4 py-2 text-white"
//             >
//               ព្យាយាមម្តងទៀត
//             </button>
//           </div>
//         )}

//         <AnimatePresence mode="popLayout">
//           {!isLoading &&
//             !isFetching &&
//             !isError &&
//             filteredFoods.length === 0 && (
//               <motion.div
//                 key="empty"
//                 initial={{
//                   opacity: 0,
//                 }}
//                 animate={{
//                   opacity: 1,
//                 }}
//                 exit={{
//                   opacity: 0,
//                 }}
//                 className="col-span-full py-10 text-center text-gray-400"
//               >
//                 <IoSearchOutline className="mx-auto mb-4 text-[34px] text-gray-300" />

//                 <p>រកមិនឃើញលទ្ធផលដែលត្រូវនឹងការស្វែងរក និងតម្រង</p>
//               </motion.div>
//             )}

//           {!isLoading &&
//             !isFetching &&
//             !isError &&
//             paginatedFoods.map((food) => (
//               <motion.div
//                 layout
//                 key={food.uuid}
//                 initial={{
//                   opacity: 0,
//                   y: 10,
//                 }}
//                 animate={{
//                   opacity: 1,
//                   y: 0,
//                 }}
//                 exit={{
//                   opacity: 0,
//                   y: 10,
//                 }}
//                 transition={{
//                   duration: 0.2,
//                 }}
//                 className="w-full"
//               >
//                 <FoodCard food={food} />
//               </motion.div>
//             ))}
//         </AnimatePresence>
//       </div>

//       {/* ===============================================
//           PAGINATION CONTROLS (10 items / page)
//       =============================================== */}
//       {!isLoading && !isFetching && !isError && filteredFoods.length > 0 && (
//         <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-4 pt-6 sm:flex-row dark:border-gray-800">
//           <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
//             បង្ហាញ{" "}
//             <span className="font-semibold text-primary-800 dark:text-primary-400">
//               {(currentPage - 1) * ITEMS_PER_PAGE + 1}
//             </span>{" "}
//             -{" "}
//             <span className="font-semibold text-primary-800 dark:text-primary-400">
//               {Math.min(currentPage * ITEMS_PER_PAGE, filteredFoods.length)}
//             </span>{" "}
//             នៃ{" "}
//             <span className="font-semibold text-primary-800 dark:text-primary-400">
//               {filteredFoods.length}
//             </span>{" "}
//             មុខម្ហូប
//           </p>

//           {totalPages > 1 && (
//             <div className="flex items-center gap-1.5 sm:gap-2">
//               <button
//                 type="button"
//                 onClick={() => handlePageChange(currentPage - 1)}
//                 disabled={currentPage <= 1}
//                 aria-label="ទំព័រមុន"
//                 className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
//               >
//                 <IoChevronBack className="h-4 w-4" />
//               </button>

//               {pageNumbers.map((page, idx) => {
//                 if (typeof page === "string") {
//                   return (
//                     <span
//                       key={`ellipsis-search-${idx}`}
//                       className="flex h-10 w-8 items-center justify-center text-sm font-bold text-gray-400"
//                     >
//                       ...
//                     </span>
//                   );
//                 }

//                 const isActive = page === currentPage;

//                 return (
//                   <button
//                     key={page}
//                     type="button"
//                     onClick={() => handlePageChange(page)}
//                     className={`flex h-10 min-w-[40px] items-center justify-center rounded-full px-3 text-sm font-semibold transition ${
//                       isActive
//                         ? "bg-[#1c6b45] text-white shadow-sm hover:bg-[#155335]"
//                         : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
//                     }`}
//                   >
//                     {page}
//                   </button>
//                 );
//               })}

//               <button
//                 type="button"
//                 onClick={() => handlePageChange(currentPage + 1)}
//                 disabled={currentPage >= totalPages}
//                 aria-label="ទំព័របន្ទាប់"
//                 className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
//               >
//                 <IoChevronForward className="h-4 w-4" />
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import { IoSearchOutline } from "react-icons/io5";

// import { useGetMenuItemsQuery } from "@/app/store/menuApi";
// import FoodCard from "@/components/dynamic-card/FoodCard";
// import type { CatalogMenuItem } from "@/types/catalog-menu-item";
// import SortDropdown from "./SortDropdown";
// /* =========================================================
//    TYPES
// ========================================================= */

// type FilterGroupKey =
//   | "category"
//   | "cuisine"
//   | "dietary"
//   | "age"
//   | "mealType"
//   | "allergen"
//   | "preparationTime";

// type FilterOption = {
//   code: string;
//   name: string;
// };

// type ChipGroup = {
//   title: string;
//   key: FilterGroupKey;
//   options: FilterOption[];
//   description?: string;
// };

// type SortOption =
//   | "default"
//   | "price-asc"
//   | "price-desc"
//   | "preparation-asc"
//   | "preparation-desc"
//   | "rating-desc"
//   | "name-asc";

// type PreparationRangeCode = "UNDER_10" | "MIN_11_20" | "MIN_21_30" | "OVER_30";

// /* =========================================================
//    TEXT NORMALIZER
// ========================================================= */

// function normalizeText(value: unknown): string {
//   return String(value ?? "")
//     .trim()
//     .toLowerCase()
//     .normalize("NFKC")
//     .replace(/[_\-]+/g, " ")
//     .replace(/\s+/g, " ");
// }

// /**
//  * GLOBAL SEARCH
//  *
//  * This searches the ENTIRE menu item object returned by the backend,
//  * including nested values such as:
//  *
//  * name, localName, descriptions, price, currency, store information,
//  * category, cuisine, spice level, age groups, seasons, meal types,
//  * dietary types, events, weather, ingredients, allergens, nutrition,
//  * recommendation, origin, filterOption, source, status, etc.
//  *
//  * JSON.stringify also includes the property names, so a query such as
//  * "calories", "proteinGrams", "countryName", "rainy", "HALAL", etc.
//  * can match.
//  */
// function buildGlobalSearchText(food: CatalogMenuItem): string {
//   try {
//     return normalizeText(JSON.stringify(food));
//   } catch {
//     return normalizeText(
//       [
//         food.uuid,
//         food.name,
//         food.localName,
//         food.description,
//         food.localDescription,
//         food.price,
//         food.currencyCode,
//         food.store?.name,
//         food.food?.category?.name,
//         food.food?.cuisine?.name,
//       ].join(" "),
//     );
//   }
// }

// function matchesGlobalQuery(food: CatalogMenuItem, query: string): boolean {
//   const normalizedQuery = normalizeText(query);

//   if (!normalizedQuery) {
//     return true;
//   }

//   const searchableText = buildGlobalSearchText(food);

//   /**
//    * Multi-word search:
//    * "khmer halal rainy"
//    *
//    * Every word must exist somewhere in the full menu-item response.
//    */
//   const tokens = normalizedQuery
//     .split(" ")
//     .map((token) => token.trim())
//     .filter(Boolean);

//   return tokens.every((token) => searchableText.includes(token));
// }

// /* =========================================================
//    SAFE DATA HELPERS
// ========================================================= */

// function getCategory(food: CatalogMenuItem): FilterOption | null {
//   const category = food.food?.category;

//   if (!category?.code || !category?.name) {
//     return null;
//   }

//   return {
//     code: category.code,
//     name: category.name,
//   };
// }

// function getCuisine(food: CatalogMenuItem): FilterOption | null {
//   const cuisine = food.food?.cuisine;

//   if (!cuisine?.code || !cuisine?.name) {
//     return null;
//   }

//   return {
//     code: cuisine.code,
//     name: cuisine.name,
//   };
// }

// function getAgeGroups(food: CatalogMenuItem): FilterOption[] {
//   if (!Array.isArray(food.food?.ageGroups)) {
//     return [];
//   }

//   return food.food.ageGroups.flatMap((ageGroup) => {
//     if (!ageGroup?.code || !ageGroup?.name) {
//       return [];
//     }

//     return [
//       {
//         code: ageGroup.code,
//         name: ageGroup.name,
//       },
//     ];
//   });
// }

// function getMealTypes(food: CatalogMenuItem): FilterOption[] {
//   if (!Array.isArray(food.food?.mealTypes)) {
//     return [];
//   }

//   return food.food.mealTypes.flatMap((mealType) => {
//     if (!mealType?.code || !mealType?.name) {
//       return [];
//     }

//     return [
//       {
//         code: mealType.code,
//         name: mealType.name,
//       },
//     ];
//   });
// }

// function getDietaryOptions(food: CatalogMenuItem): FilterOption[] {
//   if (!Array.isArray(food.food?.dietaryTypes)) {
//     return [];
//   }

//   return food.food.dietaryTypes.flatMap((dietary) => {
//     if (!dietary?.code || !dietary?.name) {
//       return [];
//     }

//     return [
//       {
//         code: dietary.code,
//         name: dietary.name,
//       },
//     ];
//   });
// }

// /**
//  * allergenDeclarations is still unknown[] in your verified type because
//  * the response sample currently contains [].
//  *
//  * This helper safely supports common backend shapes without forcing
//  * a wrong TypeScript interface:
//  *
//  * { code, name }
//  * { allergenCode, allergenName }
//  * { allergen: { code, name } }
//  * "PEANUT"
//  */
// function getAllergenOptions(food: CatalogMenuItem): FilterOption[] {
//   if (!Array.isArray(food.allergenDeclarations)) {
//     return [];
//   }

//   return food.allergenDeclarations.flatMap((item, index) => {
//     if (typeof item === "string") {
//       const value = item.trim();

//       return value
//         ? [
//             {
//               code: value,
//               name: value,
//             },
//           ]
//         : [];
//     }

//     if (typeof item !== "object" || item === null) {
//       return [];
//     }

//     const record = item as Record<string, unknown>;

//     const nestedAllergen =
//       typeof record.allergen === "object" && record.allergen !== null
//         ? (record.allergen as Record<string, unknown>)
//         : null;

//     const codeCandidate =
//       record.code ??
//       record.allergenCode ??
//       record.allergenUuid ??
//       nestedAllergen?.code ??
//       nestedAllergen?.uuid;

//     const nameCandidate =
//       record.name ??
//       record.allergenName ??
//       record.localName ??
//       nestedAllergen?.name ??
//       nestedAllergen?.localName;

//     const code =
//       typeof codeCandidate === "string" && codeCandidate.trim()
//         ? codeCandidate.trim()
//         : typeof nameCandidate === "string" && nameCandidate.trim()
//           ? nameCandidate.trim()
//           : `allergen-${index}`;

//     const name =
//       typeof nameCandidate === "string" && nameCandidate.trim()
//         ? nameCandidate.trim()
//         : typeof codeCandidate === "string" && codeCandidate.trim()
//           ? codeCandidate.trim()
//           : null;

//     if (!name) {
//       return [];
//     }

//     return [
//       {
//         code,
//         name,
//       },
//     ];
//   });
// }

// /* =========================================================
//    UNIQUE OPTIONS
// ========================================================= */

// function getUniqueOptions(values: FilterOption[]): FilterOption[] {
//   const optionMap = new Map<string, FilterOption>();

//   values.forEach((item) => {
//     const code = item.code?.trim();
//     const name = item.name?.trim();

//     if (!code || !name) {
//       return;
//     }

//     const key = normalizeText(code);

//     if (!optionMap.has(key)) {
//       optionMap.set(key, {
//         code,
//         name,
//       });
//     }
//   });

//   return Array.from(optionMap.values()).sort((first, second) =>
//     first.name.localeCompare(second.name),
//   );
// }

// /* =========================================================
//    FILTER MATCH HELPERS
// ========================================================= */

// function hasSelectedValue(
//   itemValues: string[],
//   selectedValues: Set<string>,
// ): boolean {
//   if (selectedValues.size === 0) {
//     return true;
//   }

//   const normalizedItems = new Set(itemValues.map(normalizeText));

//   /**
//    * Multiple chips inside the same group use OR.
//    *
//    * Example:
//    * Cuisine = Khmer OR Thai
//    */
//   return [...selectedValues].some((selectedValue) =>
//     normalizedItems.has(normalizeText(selectedValue)),
//   );
// }

// function containsExcludedAllergen(
//   food: CatalogMenuItem,
//   excludedAllergens: Set<string>,
// ): boolean {
//   if (excludedAllergens.size === 0) {
//     return false;
//   }

//   const allergenOptions = getAllergenOptions(food);

//   const itemValues = allergenOptions.flatMap((allergen) => [
//     normalizeText(allergen.code),
//     normalizeText(allergen.name),
//   ]);

//   return [...excludedAllergens].some((selectedAllergen) => {
//     const normalizedSelected = normalizeText(selectedAllergen);

//     return itemValues.includes(normalizedSelected);
//   });
// }

// function matchesPreparationRange(
//   minutes: number | null,
//   selectedRanges: Set<string>,
// ): boolean {
//   if (selectedRanges.size === 0) {
//     return true;
//   }

//   if (minutes === null || !Number.isFinite(minutes)) {
//     return false;
//   }

//   return [...selectedRanges].some((range) => {
//     switch (range as PreparationRangeCode) {
//       case "UNDER_10":
//         return minutes <= 10;

//       case "MIN_11_20":
//         return minutes >= 11 && minutes <= 20;

//       case "MIN_21_30":
//         return minutes >= 21 && minutes <= 30;

//       case "OVER_30":
//         return minutes > 30;

//       default:
//         return true;
//     }
//   });
// }

// /* =========================================================
//    SORT
// ========================================================= */

// function sortFoods(
//   foods: CatalogMenuItem[],
//   sortBy: SortOption,
// ): CatalogMenuItem[] {
//   const sorted = [...foods];

//   switch (sortBy) {
//     case "price-asc":
//       return sorted.sort((a, b) => a.price - b.price);

//     case "price-desc":
//       return sorted.sort((a, b) => b.price - a.price);

//     case "preparation-asc":
//       return sorted.sort((a, b) => {
//         const first = a.preparationTimeMinutes ?? Number.POSITIVE_INFINITY;
//         const second = b.preparationTimeMinutes ?? Number.POSITIVE_INFINITY;

//         return first - second;
//       });

//     case "preparation-desc":
//       return sorted.sort((a, b) => {
//         const first = a.preparationTimeMinutes ?? Number.NEGATIVE_INFINITY;
//         const second = b.preparationTimeMinutes ?? Number.NEGATIVE_INFINITY;

//         return second - first;
//       });

//     case "rating-desc":
//       return sorted.sort(
//         (a, b) =>
//           Number(b.store?.averageRating ?? 0) -
//           Number(a.store?.averageRating ?? 0),
//       );

//     case "name-asc":
//       return sorted.sort((a, b) => {
//         const first = a.localName?.trim() || a.name;
//         const second = b.localName?.trim() || b.name;

//         return first.localeCompare(second);
//       });

//     case "default":
//     default:
//       return sorted;
//   }
// }

// /* =========================================================
//    ICONS
// ========================================================= */

// function GridIcon({ className }: { className?: string }) {
//   return (
//     <svg
//       className={className}
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth={2}
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <rect x="3" y="3" width="7" height="7" rx="1.5" />
//       <rect x="14" y="3" width="7" height="7" rx="1.5" />
//       <rect x="3" y="14" width="7" height="7" rx="1.5" />
//       <rect x="14" y="14" width="7" height="7" rx="1.5" />
//     </svg>
//   );
// }

// function ChevronIcon({ className }: { className?: string }) {
//   return (
//     <svg
//       className={className}
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth={2.5}
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <polyline points="6 9 12 15 18 9" />
//     </svg>
//   );
// }

// /* =========================================================
//    COMPONENT
// ========================================================= */

// export default function FoodSearchBar() {
//   const [searchInput, setSearchInput] = useState("");

//   const [isOpen, setIsOpen] = useState(false);

//   const [selected, setSelected] = useState<Set<string>>(new Set());

//   const [sortBy, setSortBy] = useState<SortOption>("default");

//   const wrapRef = useRef<HTMLDivElement>(null);

//   const {
//     data: menuItems = [],
//     isLoading,
//     isFetching,
//     isError,
//     refetch,
//   } = useGetMenuItemsQuery();

//   /* =======================================================
//      CLOSE FILTER WHEN CLICKING OUTSIDE
//   ======================================================= */

//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside);

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   /* =======================================================
//      BUILD FILTER OPTIONS FROM CURRENT API RESPONSE
//   ======================================================= */

//   const chipGroups = useMemo<ChipGroup[]>(() => {
//     const categories = getUniqueOptions(
//       menuItems.flatMap((item) => {
//         const category = getCategory(item);

//         return category ? [category] : [];
//       }),
//     );

//     const cuisines = getUniqueOptions(
//       menuItems.flatMap((item) => {
//         const cuisine = getCuisine(item);

//         return cuisine ? [cuisine] : [];
//       }),
//     );

//     const dietaryTypes = getUniqueOptions(
//       menuItems.flatMap((item) => getDietaryOptions(item)),
//     );

//     const ageGroups = getUniqueOptions(
//       menuItems.flatMap((item) => getAgeGroups(item)),
//     );

//     const mealTypes = getUniqueOptions(
//       menuItems.flatMap((item) => getMealTypes(item)),
//     );

//     const allergens = getUniqueOptions(
//       menuItems.flatMap((item) => getAllergenOptions(item)),
//     );

//     const preparationOptions: FilterOption[] = [
//       {
//         code: "UNDER_10",
//         name: "≤ 10 នាទី",
//       },
//       {
//         code: "MIN_11_20",
//         name: "11 - 20 នាទី",
//       },
//       {
//         code: "MIN_21_30",
//         name: "21 - 30 នាទី",
//       },
//       {
//         code: "OVER_30",
//         name: "> 30 នាទី",
//       },
//     ];

//     const groups: ChipGroup[] = [
//       {
//         title: "ប្រភេទម្ហូប",
//         key: "category",
//         options: categories,
//       },
//       {
//         title: "ម្ហូបតាមប្រទេស",
//         key: "cuisine",
//         options: cuisines,
//       },
//       {
//         title: "របបអាហារ",
//         key: "dietary",
//         options: dietaryTypes,
//       },
//       {
//         title: "ក្រុមអាយុ",
//         key: "age",
//         options: ageGroups,
//       },
//       {
//         title: "ពេលអាហារ",
//         key: "mealType",
//         options: mealTypes,
//       },
//       {
//         title: "ជៀសវាងអាឡែស៊ី",
//         key: "allergen",
//         options: allergens,
//         description: "មុខម្ហូបដែលមានអាឡែស៊ីដែលបានជ្រើសនឹងត្រូវដកចេញពីលទ្ធផល។",
//       },
//       {
//         title: "ពេលរៀបចំ",
//         key: "preparationTime",
//         options: preparationOptions,
//       },
//     ];

//     /**
//      * Dynamic backend groups are hidden when the API does not provide
//      * any values.
//      *
//      * Preparation time is always available because its ranges are local.
//      */
//     return groups.filter((group) => group.options.length > 0);
//   }, [menuItems]);

//   /* =======================================================
//      SELECTION HELPERS
//   ======================================================= */

//   function getSelectionKey(group: FilterGroupKey, code: string): string {
//     return `${group}::${code}`;
//   }

//   function toggleChip(group: FilterGroupKey, code: string) {
//     const value = getSelectionKey(group, code);

//     setSelected((previous) => {
//       const next = new Set(previous);

//       if (next.has(value)) {
//         next.delete(value);
//       } else {
//         next.add(value);
//       }

//       return next;
//     });
//   }

//   function clearAll() {
//     setSelected(new Set());
//     setSortBy("default");
//   }

//   /* =======================================================
//      GROUP SELECTED FILTERS
//   ======================================================= */

//   const groupedSelected = useMemo(() => {
//     const groups: Record<FilterGroupKey, Set<string>> = {
//       category: new Set<string>(),
//       cuisine: new Set<string>(),
//       dietary: new Set<string>(),
//       age: new Set<string>(),
//       mealType: new Set<string>(),
//       allergen: new Set<string>(),
//       preparationTime: new Set<string>(),
//     };

//     selected.forEach((value) => {
//       const separatorIndex = value.indexOf("::");

//       if (separatorIndex === -1) {
//         return;
//       }

//       const group = value.slice(0, separatorIndex) as FilterGroupKey;
//       const code = value.slice(separatorIndex + 2);

//       if (!code || !(group in groups)) {
//         return;
//       }

//       groups[group].add(code);
//     });

//     return groups;
//   }, [selected]);

//   /* =======================================================
//      FILTER + GLOBAL SEARCH + SORT
//   ======================================================= */

//   const filteredFoods = useMemo(() => {
//     const result = menuItems.filter((food) => {
//       const category = getCategory(food);
//       const cuisine = getCuisine(food);

//       const dietaryTypes = getDietaryOptions(food);
//       const ageGroups = getAgeGroups(food);
//       const mealTypes = getMealTypes(food);

//       const matchesCategory = hasSelectedValue(
//         category ? [category.code] : [],
//         groupedSelected.category,
//       );

//       const matchesCuisine = hasSelectedValue(
//         cuisine ? [cuisine.code] : [],
//         groupedSelected.cuisine,
//       );

//       const matchesDietary = hasSelectedValue(
//         dietaryTypes.map((diet) => diet.code),
//         groupedSelected.dietary,
//       );

//       const matchesAge = hasSelectedValue(
//         ageGroups.map((ageGroup) => ageGroup.code),
//         groupedSelected.age,
//       );

//       const matchesMealType = hasSelectedValue(
//         mealTypes.map((mealType) => mealType.code),
//         groupedSelected.mealType,
//       );

//       /**
//        * Allergy filters work as EXCLUSION filters.
//        *
//        * If user chooses PEANUT, foods declaring PEANUT are removed.
//        */
//       const containsAllergy = containsExcludedAllergen(
//         food,
//         groupedSelected.allergen,
//       );

//       const matchesPreparation = matchesPreparationRange(
//         food.preparationTimeMinutes,
//         groupedSelected.preparationTime,
//       );

//       return (
//         matchesGlobalQuery(food, searchInput) &&
//         matchesCategory &&
//         matchesCuisine &&
//         matchesDietary &&
//         matchesAge &&
//         matchesMealType &&
//         !containsAllergy &&
//         matchesPreparation
//       );
//     });

//     return sortFoods(result, sortBy);
//   }, [menuItems, searchInput, groupedSelected, sortBy]);

//   /* =======================================================
//      SELECTED LABELS
//   ======================================================= */

//   const selectedLabels = useMemo(() => {
//     const labels: string[] = [];

//     chipGroups.forEach((group) => {
//       group.options.forEach((option) => {
//         const key = getSelectionKey(group.key, option.code);

//         if (selected.has(key)) {
//           labels.push(option.name);
//         }
//       });
//     });

//     return labels;
//   }, [chipGroups, selected]);

//   const count = selected.size;

//   const label =
//     count === 0
//       ? "តម្រងអាហារ"
//       : selectedLabels.slice(0, 2).join(", ") +
//         (count > 2 ? ` +${count - 2}` : "");

//   /* =======================================================
//      UI
//   ======================================================= */

//   return (
//     <div className="container mx-auto w-full max-w-7xl pt-12.5 text-[#3d3d3a]">
//       {/* ===============================================
//           SEARCH + FILTER BAR
//       =============================================== */}

//       <div className="sticky top-18 z-50 mx-auto flex w-full max-w-7xl flex-wrap items-stretch gap-3.5 px-4 pb-6">
//         {/* SEARCH */}

//         <div className="flex min-h-[60px] min-w-[280px] flex-1 items-center gap-3 rounded-full border border-[#e7e6e1] bg-white px-[22px] shadow-sm transition focus-within:border-[#1c6b45] focus-within:ring-4 focus-within:ring-[#e8f3ec]">
//           <IoSearchOutline className="shrink-0 text-[22px] text-[#1c6b45]" />

//           <input
//             type="search"
//             value={searchInput}
//             onChange={(event) => setSearchInput(event.target.value)}
//             placeholder="ស្វែងរកគ្រប់ព័ត៌មានម្ហូប..."
//             className="h-full w-full bg-transparent text-[15px] outline-none placeholder:text-[#a3a29a]"
//           />

//           {searchInput && (
//             <button
//               type="button"
//               onClick={() => setSearchInput("")}
//               className="cursor-pointer text-sm text-gray-400 hover:text-gray-700"
//               aria-label="Clear search"
//             >
//               ✕
//             </button>
//           )}
//         </div>

//         {/* SORT */}

//         <SortDropdown value={sortBy} onChange={setSortBy} />
//         {/* FILTER */}

//         <div ref={wrapRef} className="relative z-50 min-w-[220px] flex-none">
//           <button
//             type="button"
//             onClick={() => setIsOpen((previous) => !previous)}
//             className={`flex h-[60px] w-full items-center gap-2.5 rounded-full border bg-white px-[22px] text-[15px] text-[#3d3d3a] shadow-sm transition-all ${
//               isOpen
//                 ? "border-[#1c6b45] ring-4 ring-[#e8f3ec]"
//                 : "border-[#e7e6e1] hover:border-[#cfcec6]"
//             }`}
//           >
//             <GridIcon className="h-5 w-5 shrink-0 text-[#1c6b45]" />

//             <span className="flex-1 truncate text-left">{label}</span>

//             {count > 0 && (
//               <span className="rounded-full bg-[#1c6b45] px-2 py-0.5 text-base font-semibold text-white">
//                 {count}
//               </span>
//             )}

//             <ChevronIcon
//               className={`h-4 w-4 shrink-0 text-[#1c6b45] transition-transform ${
//                 isOpen ? "rotate-180" : ""
//               }`}
//             />
//           </button>

//           {/* DROPDOWN */}

//           <div
//             className={`absolute right-0 top-[calc(100%+10px)] z-50 w-[420px] max-w-[90vw] rounded-[18px] border border-[#e7e6e1] bg-white p-5 shadow-xl transition-all ${
//               isOpen
//                 ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
//                 : "pointer-events-none -translate-y-2 scale-[0.98] opacity-0"
//             }`}
//           >
//             <div className="mb-3 flex items-center justify-between gap-3">
//               <p className="text-sm text-gray-400">ជ្រើសតម្រងច្រើនបាន</p>

//               {(count > 0 || sortBy !== "default") && (
//                 <button
//                   type="button"
//                   onClick={clearAll}
//                   className="cursor-pointer rounded-full bg-secondary-50 px-3 py-1 text-sm text-secondary-500 underline underline-offset-2 hover:text-secondary-800"
//                 >
//                   សម្អាតទាំងអស់
//                 </button>
//               )}
//             </div>

//             <div className="scrollbar-hide max-h-[70vh] overflow-y-auto">
//               {chipGroups.map((group, index) => (
//                 <div
//                   key={group.key}
//                   className={
//                     index > 0 ? "mt-5 border-t border-[#e7e6e1] pt-[18px]" : ""
//                   }
//                 >
//                   <p className="mb-1 text-xl font-semibold text-[#a3a29a]">
//                     {group.title}
//                   </p>

//                   {group.description && (
//                     <p className="mb-3 text-sm leading-6 text-gray-400">
//                       {group.description}
//                     </p>
//                   )}

//                   <div className="flex flex-wrap gap-2">
//                     {group.options.map((option) => {
//                       const selectionKey = getSelectionKey(
//                         group.key,
//                         option.code,
//                       );

//                       const isSelected = selected.has(selectionKey);

//                       return (
//                         <button
//                           key={selectionKey}
//                           type="button"
//                           onClick={() => toggleChip(group.key, option.code)}
//                           className={`cursor-pointer rounded-full border px-4 py-2 text-base transition-all ${
//                             isSelected
//                               ? group.key === "allergen"
//                                 ? "border-red-500 bg-red-500 text-white"
//                                 : "border-[#1c6b45] bg-[#1c6b45] text-white"
//                               : "border-[#e7e6e1] bg-white text-[#3d3d3a] hover:border-[#1c6b45]"
//                           }`}
//                         >
//                           {option.name}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               ))}

//               {chipGroups.length === 0 && (
//                 <p className="py-5 text-center text-sm text-gray-400">
//                   មិនមានទិន្នន័យតម្រង
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ===============================================
//           RESULT SUMMARY
//       =============================================== */}

//       {!isLoading && !isError && (
//         <div className="flex flex-wrap items-center gap-2 px-4 pb-3 text-base text-gray-400">
//           <span>រកឃើញ</span>

//           <span className="font-semibold text-primary-700">
//             {filteredFoods.length}
//           </span>

//           <span>មុខម្ហូប</span>

//           {searchInput.trim() && (
//             <>
//               <span>សម្រាប់</span>
//               <span className="max-w-[260px] truncate font-medium text-gray-600">
//                 “{searchInput.trim()}”
//               </span>
//             </>
//           )}
//         </div>
//       )}

//       {/* ===============================================
//           GRID
//       =============================================== */}

//       <div className="sm:px-4 max-sm:px-3 mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//         {/* LOADING */}

//         {(isLoading || isFetching) && (
//           <p className="col-span-full py-10 text-center text-gray-400">
//             កំពុងផ្ទុក...
//           </p>
//         )}

//         {/* ERROR */}

//         {isError && (
//           <div className="col-span-full flex flex-col items-center gap-3 py-10 text-center">
//             <p className="text-red-500">មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ</p>

//             <button
//               type="button"
//               onClick={() => refetch()}
//               className="cursor-pointer rounded-full bg-primary-800 px-4 py-2 text-white"
//             >
//               ព្យាយាមម្តងទៀត
//             </button>
//           </div>
//         )}

//         <AnimatePresence mode="popLayout">
//           {!isLoading &&
//             !isFetching &&
//             !isError &&
//             filteredFoods.length === 0 && (
//               <motion.div
//                 key="empty"
//                 initial={{
//                   opacity: 0,
//                 }}
//                 animate={{
//                   opacity: 1,
//                 }}
//                 exit={{
//                   opacity: 0,
//                 }}
//                 className="col-span-full py-10 text-center text-gray-400"
//               >
//                 <IoSearchOutline className="mx-auto mb-4 text-[34px] text-gray-300" />

//                 <p>រកមិនឃើញលទ្ធផលដែលត្រូវនឹងការស្វែងរក និងតម្រង</p>
//               </motion.div>
//             )}

//           {!isLoading &&
//             !isFetching &&
//             !isError &&
//             filteredFoods.map((food) => (
//               <motion.div
//                 layout
//                 key={food.uuid}
//                 initial={{
//                   opacity: 0,
//                   y: 10,
//                 }}
//                 animate={{
//                   opacity: 1,
//                   y: 0,
//                 }}
//                 exit={{
//                   opacity: 0,
//                   y: 10,
//                 }}
//                 transition={{
//                   duration: 0.2,
//                 }}
//                 className="w-full"
//               >
//                 <FoodCard food={food} />
//               </motion.div>
//             ))}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }

//new responsive

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IoSearchOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
} from "react-icons/io5";

import { useGetMenuItemsQuery } from "@/app/store/menuApi";
import FoodCard from "@/components/dynamic-card/FoodCard";
import type { CatalogMenuItem } from "@/types/catalog-menu-item";
import SortDropdown from "./SortDropdown";

/* =========================================================
   TYPES
========================================================= */

type FilterGroupKey =
  | "category"
  | "cuisine"
  | "dietary"
  | "age"
  | "mealType"
  | "allergen"
  | "preparationTime";

type FilterOption = {
  code: string;
  name: string;
};

type ChipGroup = {
  title: string;
  key: FilterGroupKey;
  options: FilterOption[];
  description?: string;
};

type SortOption =
  | "default"
  | "price-asc"
  | "price-desc"
  | "preparation-asc"
  | "preparation-desc"
  | "rating-desc"
  | "name-asc";

type PreparationRangeCode = "UNDER_10" | "MIN_11_20" | "MIN_21_30" | "OVER_30";

/* =========================================================
   SORT OPTIONS FOR MOBILE
========================================================= */

const mobileSortOptions: {
  value: SortOption;
  label: string;
}[] = [
  {
    value: "default",
    label: "លំនាំដើម",
  },
  {
    value: "price-asc",
    label: "តម្លៃ៖ ថោកទៅថ្លៃ",
  },
  {
    value: "price-desc",
    label: "តម្លៃ៖ ថ្លៃទៅថោក",
  },
  {
    value: "preparation-asc",
    label: "រៀបចំលឿនជាងគេ",
  },
  {
    value: "preparation-desc",
    label: "រៀបចំយូរជាងគេ",
  },
  {
    value: "rating-desc",
    label: "ការវាយតម្លៃខ្ពស់",
  },
  {
    value: "name-asc",
    label: "តម្រៀបតាមឈ្មោះ",
  },
];

/* =========================================================
   TEXT NORMALIZER
========================================================= */

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ");
}

/* =========================================================
   GLOBAL SEARCH
========================================================= */

function buildGlobalSearchText(food: CatalogMenuItem): string {
  try {
    return normalizeText(JSON.stringify(food));
  } catch {
    return normalizeText(
      [
        food.uuid,
        food.name,
        food.localName,
        food.description,
        food.localDescription,
        food.price,
        food.currencyCode,
        food.store?.name,
        food.food?.category?.name,
        food.food?.cuisine?.name,
      ].join(" "),
    );
  }
}

function matchesGlobalQuery(food: CatalogMenuItem, query: string): boolean {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return true;
  }

  const searchableText = buildGlobalSearchText(food);

  const tokens = normalizedQuery
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);

  return tokens.every((token) => searchableText.includes(token));
}

/* =========================================================
   SAFE DATA HELPERS
========================================================= */

function getCategory(food: CatalogMenuItem): FilterOption | null {
  const category = food.food?.category;

  if (!category?.code || !category?.name) {
    return null;
  }

  return {
    code: category.code,
    name: category.name,
  };
}

function getCuisine(food: CatalogMenuItem): FilterOption | null {
  const cuisine = food.food?.cuisine;

  if (!cuisine?.code || !cuisine?.name) {
    return null;
  }

  return {
    code: cuisine.code,
    name: cuisine.name,
  };
}

function getAgeGroups(food: CatalogMenuItem): FilterOption[] {
  if (!Array.isArray(food.food?.ageGroups)) {
    return [];
  }

  return food.food.ageGroups.flatMap((ageGroup) => {
    if (!ageGroup?.code || !ageGroup?.name) {
      return [];
    }

    return [
      {
        code: ageGroup.code,
        name: ageGroup.name,
      },
    ];
  });
}

function getMealTypes(food: CatalogMenuItem): FilterOption[] {
  if (!Array.isArray(food.food?.mealTypes)) {
    return [];
  }

  return food.food.mealTypes.flatMap((mealType) => {
    if (!mealType?.code || !mealType?.name) {
      return [];
    }

    return [
      {
        code: mealType.code,
        name: mealType.name,
      },
    ];
  });
}

function getDietaryOptions(food: CatalogMenuItem): FilterOption[] {
  if (!Array.isArray(food.food?.dietaryTypes)) {
    return [];
  }

  return food.food.dietaryTypes.flatMap((dietary) => {
    if (!dietary?.code || !dietary?.name) {
      return [];
    }

    return [
      {
        code: dietary.code,
        name: dietary.name,
      },
    ];
  });
}

function getAllergenOptions(food: CatalogMenuItem): FilterOption[] {
  if (!Array.isArray(food.allergenDeclarations)) {
    return [];
  }

  return food.allergenDeclarations.flatMap((item, index) => {
    if (typeof item === "string") {
      const value = item.trim();

      return value
        ? [
            {
              code: value,
              name: value,
            },
          ]
        : [];
    }

    if (typeof item !== "object" || item === null) {
      return [];
    }

    const record = item as Record<string, unknown>;

    const nestedAllergen =
      typeof record.allergen === "object" && record.allergen !== null
        ? (record.allergen as Record<string, unknown>)
        : null;

    const codeCandidate =
      record.code ??
      record.allergenCode ??
      record.allergenUuid ??
      nestedAllergen?.code ??
      nestedAllergen?.uuid;

    const nameCandidate =
      record.name ??
      record.allergenName ??
      record.localName ??
      nestedAllergen?.name ??
      nestedAllergen?.localName;

    const code =
      typeof codeCandidate === "string" && codeCandidate.trim()
        ? codeCandidate.trim()
        : typeof nameCandidate === "string" && nameCandidate.trim()
          ? nameCandidate.trim()
          : `allergen-${index}`;

    const name =
      typeof nameCandidate === "string" && nameCandidate.trim()
        ? nameCandidate.trim()
        : typeof codeCandidate === "string" && codeCandidate.trim()
          ? codeCandidate.trim()
          : null;

    if (!name) {
      return [];
    }

    return [
      {
        code,
        name,
      },
    ];
  });
}

/* =========================================================
   UNIQUE OPTIONS
========================================================= */

function getUniqueOptions(values: FilterOption[]): FilterOption[] {
  const optionMap = new Map<string, FilterOption>();

  values.forEach((item) => {
    const code = item.code?.trim();
    const name = item.name?.trim();

    if (!code || !name) {
      return;
    }

    const key = normalizeText(code);

    if (!optionMap.has(key)) {
      optionMap.set(key, {
        code,
        name,
      });
    }
  });

  return Array.from(optionMap.values()).sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}

/* =========================================================
   FILTER MATCH HELPERS
========================================================= */

function hasSelectedValue(
  itemValues: string[],
  selectedValues: Set<string>,
): boolean {
  if (selectedValues.size === 0) {
    return true;
  }

  const normalizedItems = new Set(itemValues.map(normalizeText));

  return [...selectedValues].some((selectedValue) =>
    normalizedItems.has(normalizeText(selectedValue)),
  );
}

function containsExcludedAllergen(
  food: CatalogMenuItem,
  excludedAllergens: Set<string>,
): boolean {
  if (excludedAllergens.size === 0) {
    return false;
  }

  const allergenOptions = getAllergenOptions(food);

  const itemValues = allergenOptions.flatMap((allergen) => [
    normalizeText(allergen.code),
    normalizeText(allergen.name),
  ]);

  return [...excludedAllergens].some((selectedAllergen) => {
    const normalizedSelected = normalizeText(selectedAllergen);

    return itemValues.includes(normalizedSelected);
  });
}

function matchesPreparationRange(
  minutes: number | null,
  selectedRanges: Set<string>,
): boolean {
  if (selectedRanges.size === 0) {
    return true;
  }

  if (minutes === null || !Number.isFinite(minutes)) {
    return false;
  }

  return [...selectedRanges].some((range) => {
    switch (range as PreparationRangeCode) {
      case "UNDER_10":
        return minutes <= 10;

      case "MIN_11_20":
        return minutes >= 11 && minutes <= 20;

      case "MIN_21_30":
        return minutes >= 21 && minutes <= 30;

      case "OVER_30":
        return minutes > 30;

      default:
        return true;
    }
  });
}

/* =========================================================
   SORT
========================================================= */

function sortFoods(
  foods: CatalogMenuItem[],
  sortBy: SortOption,
): CatalogMenuItem[] {
  const sorted = [...foods];

  switch (sortBy) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);

    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);

    case "preparation-asc":
      return sorted.sort((a, b) => {
        const first = a.preparationTimeMinutes ?? Number.POSITIVE_INFINITY;

        const second = b.preparationTimeMinutes ?? Number.POSITIVE_INFINITY;

        return first - second;
      });

    case "preparation-desc":
      return sorted.sort((a, b) => {
        const first = a.preparationTimeMinutes ?? Number.NEGATIVE_INFINITY;

        const second = b.preparationTimeMinutes ?? Number.NEGATIVE_INFINITY;

        return second - first;
      });

    case "rating-desc":
      return sorted.sort(
        (a, b) =>
          Number(b.store?.averageRating ?? 0) -
          Number(a.store?.averageRating ?? 0),
      );

    case "name-asc":
      return sorted.sort((a, b) => {
        const first = a.localName?.trim() || a.name;

        const second = b.localName?.trim() || b.name;

        return first.localeCompare(second);
      });

    case "default":
    default:
      return sorted;
  }
}

/* =========================================================
   ICONS
========================================================= */

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

function SortIcon({ className }: { className?: string }) {
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
      <path d="M8 6h10" />
      <path d="M8 12h7" />
      <path d="M8 18h4" />
      <path d="M4 5v14" />
      <path d="m2 17 2 2 2-2" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
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
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

/* =========================================================
   COMPONENT
========================================================= */

const ITEMS_PER_PAGE = 10;

export default function FoodSearchBar() {
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isOpen, setIsOpen] = useState(false);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [sortBy, setSortBy] = useState<SortOption>("default");

  const wrapRef = useRef<HTMLDivElement>(null);

  // Reset to page 1 whenever filters or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchInput, selected, sortBy]);

  const {
    data: menuItems = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetMenuItemsQuery();

  /* =======================================================
     DESKTOP CLICK OUTSIDE
  ======================================================= */

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

  /* =======================================================
     LOCK BODY WHEN MOBILE SHEET IS OPEN
  ======================================================= */

  useEffect(() => {
    if (!isMobileFilterOpen && !isMobileSortOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileFilterOpen, isMobileSortOpen]);

  /* =======================================================
     BUILD FILTER OPTIONS
  ======================================================= */

  const chipGroups = useMemo<ChipGroup[]>(() => {
    const categories = getUniqueOptions(
      menuItems.flatMap((item) => {
        const category = getCategory(item);

        return category ? [category] : [];
      }),
    );

    const cuisines = getUniqueOptions(
      menuItems.flatMap((item) => {
        const cuisine = getCuisine(item);

        return cuisine ? [cuisine] : [];
      }),
    );

    const dietaryTypes = getUniqueOptions(
      menuItems.flatMap((item) => getDietaryOptions(item)),
    );

    const ageGroups = getUniqueOptions(
      menuItems.flatMap((item) => getAgeGroups(item)),
    );

    const mealTypes = getUniqueOptions(
      menuItems.flatMap((item) => getMealTypes(item)),
    );

    const allergens = getUniqueOptions(
      menuItems.flatMap((item) => getAllergenOptions(item)),
    );

    const preparationOptions: FilterOption[] = [
      {
        code: "UNDER_10",
        name: "≤ 10 នាទី",
      },
      {
        code: "MIN_11_20",
        name: "11 - 20 នាទី",
      },
      {
        code: "MIN_21_30",
        name: "21 - 30 នាទី",
      },
      {
        code: "OVER_30",
        name: "> 30 នាទី",
      },
    ];

    const groups: ChipGroup[] = [
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
      {
        title: "ពេលអាហារ",
        key: "mealType",
        options: mealTypes,
      },
      {
        title: "ជៀសវាងអាឡែស៊ី",
        key: "allergen",
        options: allergens,
        description: "មុខម្ហូបដែលមានអាឡែស៊ីដែលបានជ្រើសនឹងត្រូវដកចេញពីលទ្ធផល។",
      },
      {
        title: "ពេលរៀបចំ",
        key: "preparationTime",
        options: preparationOptions,
      },
    ];

    return groups.filter((group) => group.options.length > 0);
  }, [menuItems]);

  /* =======================================================
     SELECTION HELPERS
  ======================================================= */

  function getSelectionKey(group: FilterGroupKey, code: string): string {
    return `${group}::${code}`;
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

  function clearFilters() {
    setSelected(new Set());
  }

  function clearAll() {
    setSelected(new Set());
    setSortBy("default");
  }

  /* =======================================================
     GROUP SELECTED FILTERS
  ======================================================= */

  const groupedSelected = useMemo(() => {
    const groups: Record<FilterGroupKey, Set<string>> = {
      category: new Set<string>(),
      cuisine: new Set<string>(),
      dietary: new Set<string>(),
      age: new Set<string>(),
      mealType: new Set<string>(),
      allergen: new Set<string>(),
      preparationTime: new Set<string>(),
    };

    selected.forEach((value) => {
      const separatorIndex = value.indexOf("::");

      if (separatorIndex === -1) {
        return;
      }

      const group = value.slice(0, separatorIndex) as FilterGroupKey;

      const code = value.slice(separatorIndex + 2);

      if (!code || !(group in groups)) {
        return;
      }

      groups[group].add(code);
    });

    return groups;
  }, [selected]);

  /* =======================================================
     FILTER + SEARCH + SORT
  ======================================================= */

  const filteredFoods = useMemo(() => {
    const result = menuItems.filter((food) => {
      const category = getCategory(food);

      const cuisine = getCuisine(food);

      const dietaryTypes = getDietaryOptions(food);

      const ageGroups = getAgeGroups(food);

      const mealTypes = getMealTypes(food);

      const matchesCategory = hasSelectedValue(
        category ? [category.code] : [],
        groupedSelected.category,
      );

      const matchesCuisine = hasSelectedValue(
        cuisine ? [cuisine.code] : [],
        groupedSelected.cuisine,
      );

      const matchesDietary = hasSelectedValue(
        dietaryTypes.map((diet) => diet.code),
        groupedSelected.dietary,
      );

      const matchesAge = hasSelectedValue(
        ageGroups.map((ageGroup) => ageGroup.code),
        groupedSelected.age,
      );

      const matchesMealType = hasSelectedValue(
        mealTypes.map((mealType) => mealType.code),
        groupedSelected.mealType,
      );

      const containsAllergy = containsExcludedAllergen(
        food,
        groupedSelected.allergen,
      );

      const matchesPreparation = matchesPreparationRange(
        food.preparationTimeMinutes,
        groupedSelected.preparationTime,
      );

      return (
        matchesGlobalQuery(food, searchInput) &&
        matchesCategory &&
        matchesCuisine &&
        matchesDietary &&
        matchesAge &&
        matchesMealType &&
        !containsAllergy &&
        matchesPreparation
      );
    });

    return sortFoods(result, sortBy);
  }, [menuItems, searchInput, groupedSelected, sortBy]);

  const totalPages = Math.ceil(filteredFoods.length / ITEMS_PER_PAGE) || 1;

  const paginatedFoods = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFoods.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredFoods, currentPage]);

  const visiblePages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  }, [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
    if (wrapRef.current) {
      wrapRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const count = selected.size;

  /* =======================================================
     FILTER CONTENT
  ======================================================= */

  const filterContent = (
    <div>
      {chipGroups.map((group, index) => (
        <div
          key={group.key}
          className={index > 0 ? "mt-5 border-t border-gray-100 pt-5" : ""}
        >
          <p className="mb-1 text-lg font-semibold text-gray-800">
            {group.title}
          </p>

          {group.description && (
            <p className="mb-3 text-sm leading-6 text-gray-400">
              {group.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {group.options.map((option) => {
              const selectionKey = getSelectionKey(group.key, option.code);

              const isSelected = selected.has(selectionKey);

              return (
                <button
                  key={selectionKey}
                  type="button"
                  onClick={() => toggleChip(group.key, option.code)}
                  className={`
                        min-h-10
                        cursor-pointer
                        rounded-full
                        border
                        px-4
                        py-2
                        text-sm
                        font-medium
                        transition-all

                        ${
                          isSelected
                            ? group.key === "allergen"
                              ? "border-red-500 bg-red-500 text-white"
                              : "border-primary-700 bg-primary-700 text-white"
                            : "border-gray-200 bg-white text-gray-600 hover:border-primary-400 hover:text-primary-700"
                        }
                      `}
                >
                  {option.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {chipGroups.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-400">
          មិនមានទិន្នន័យតម្រង
        </p>
      )}
    </div>
  );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="mx-auto w-full max-w-7xl text-[#3d3d3a]">
      {/* ===================================================
          TOOLBAR
      =================================================== */}

      <div className="sticky top-16 z-40 border-b border-gray-100  lg:rounded-full backdrop-blur-xl">
        <div
          className="
    mx-auto
    w-full
    max-w-7xl
    p-2.5
  


gap-3
    lg:grid
  lg:grid-cols-4
    
    lg:items-center

  "
        >
          {/* ===============================================
              SEARCH
          =============================================== */}

          <div
            className="
              flex
              h-12
              min-w-0
              flex-1
              lg:col-span-2
              items-center
              gap-3
              rounded-xl
              border
              border-gray-200
              bg-white 
              px-4
              transition-all

              focus-within:border-primary-500
              focus-within:ring-2
              focus-within:ring-primary-100

              sm:h-14
              sm:rounded-full

              lg:h-[60px]
            "
          >
            <IoSearchOutline className="shrink-0 text-[21px] text-primary-700" />

            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="ស្វែងរកមុខម្ហូប..."
              className="
                h-full
              
                min-w-0
                flex-1
                bg-transparent
                text-base
                text-gray-700
                outline-none
                placeholder:text-gray-400
              "
            />

            {/* {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Clear search"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            )} */}
          </div>

          {/* ===============================================
              MOBILE BUTTONS
          =============================================== */}

          <div className="mt-2 grid grid-cols-2 gap-2 lg:hidden">
            {/* MOBILE SORT */}

            <button
              type="button"
              onClick={() => {
                setIsMobileFilterOpen(false);

                setIsMobileSortOpen(true);
              }}
              className={`
                flex
                h-12
                min-w-0
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                px-3
                text-base
                font-medium cursor-pointer
                transition

                ${
                  sortBy !== "default"
                    ? "border-primary-300 bg-primary-50 text-primary-700"
                    : "border-gray-200 bg-white text-gray-700"
                }
              `}
            >
              <SortIcon className="h-5 w-5 shrink-0 text-primary-700" />

              <span className="whitespace-nowrap">តម្រៀប</span>

              {sortBy !== "default" && (
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary-700" />
              )}
            </button>

            {/* MOBILE FILTER */}

            <button
              type="button"
              onClick={() => {
                setIsMobileSortOpen(false);

                setIsMobileFilterOpen(true);
              }}
              className={`
                flex
                h-12
                min-w-0
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                px-3
                text-base
                font-medium cursor-pointer
                transition

                ${
                  count > 0
                    ? "border-primary-300 bg-primary-50 text-primary-700"
                    : "border-gray-200 bg-white text-gray-700"
                }
              `}
            >
              <GridIcon className="h-5 w-5 shrink-0 text-primary-700" />

              <span className="whitespace-nowrap">តម្រង</span>

              {count > 0 && (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary-700 px-1.5 text-xs font-semibold text-white">
                  {count}
                </span>
              )}
            </button>
          </div>

          {/* ===============================================
              DESKTOP SORT
          =============================================== */}

          <div className="hidden  flex-none lg:block [&>*]:w-full">
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>

          {/* ===============================================
              DESKTOP FILTER
          =============================================== */}

          <div
            ref={wrapRef}
            className="relative z-50 hidden flex-none lg:block"
          >
            <button
              type="button"
              onClick={() => setIsOpen((previous) => !previous)}
              className={`
                flex
                h-[60px]
                w-full
                items-center
                gap-2.5
                rounded-full
                border
                bg-white
                px-5
                text-[15px]
                font-medium
                text-gray-700
                transition-all cursor-po

                ${
                  isOpen
                    ? "border-primary-500 ring-4 ring-primary-50"
                    : "border-gray-200 hover:border-primary-300"
                }
              `}
            >
              <GridIcon className="h-5 w-5 shrink-0 text-primary-700" />

              <span className="min-w-0 flex-1 truncate text-left">
                តម្រងអាហារ
              </span>

              {count > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary-700 px-1.5 text-xs font-semibold text-white">
                  {count}
                </span>
              )}

              <ChevronIcon
                className={`
                  h-4
                  w-4
                  shrink-0
                  text-primary-700
                  transition-transform

                  ${isOpen ? "rotate-180" : ""}
                `}
              />
            </button>

            <div
              className={`
                absolute
                right-0
                top-[calc(100%+10px)]
                z-50
                w-[420px]
                overflow-hidden
                rounded-2xl
                border
                border-gray-200
                bg-white
                shadow-xl
                transition-all

                ${
                  isOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-2 opacity-0"
                }
              `}
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    តម្រងអាហារ
                  </p>

                  <p className="mt-0.5 text-sm text-gray-400">
                    ជ្រើសតម្រងច្រើនបាន
                  </p>
                </div>

                {count > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-full bg-secondary-50 px-3 py-1.5 text-sm font-medium text-secondary-500 transition hover:bg-secondary-100 hover:text-secondary-600"
                  >
                    សម្អាត
                  </button>
                )}
              </div>

              <div className="scrollbar-hide max-h-[65vh] overflow-y-auto overscroll-contain p-5">
                {filterContent}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================
          RESULTS SUMMARY
      =================================================== */}

      {!isLoading && !isError && (
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 px-3 pb-1 pt-4 text-sm text-gray-400 sm:px-4 sm:text-base">
          <span>រកឃើញ</span>

          <span className="font-semibold text-primary-700">
            {filteredFoods.length}
          </span>

          <span>មុខម្ហូប</span>

          {searchInput.trim() && (
            <>
              <span>សម្រាប់</span>

              <span className="max-w-[180px] truncate font-medium text-gray-600 sm:max-w-[260px]">
                “{searchInput.trim()}”
              </span>
            </>
          )}

          {(count > 0 || sortBy !== "default") && (
            <button
              type="button"
              onClick={clearAll}
              className="ml-auto text-sm font-medium text-secondary-500 transition hover:text-secondary-600"
            >
              សម្អាតទាំងអស់
            </button>
          )}
        </div>
      )}

      {/* ===================================================
          FOOD GRID
      =================================================== */}

      <div
        className=" px-4
mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
        "
      >
        {(isLoading || isFetching) &&
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`skeleton-fsb-${i}`}
              className="flex flex-col w-full gap-4 bg-white border border-gray-100 shadow-sm rounded-[24px] p-2.5 animate-pulse"
            >
              <div className="rounded-[14px] w-full h-[150px] md:h-37.5 lg:h-46.25 bg-gray-200 dark:bg-gray-700" />
              <div className="flex flex-col gap-2">
                <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="flex justify-between items-center">
                  <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="flex gap-4">
                  <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
              </div>
            </div>
          ))}

        {isError && (
          <div className="col-span-full flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-red-500">មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ</p>

            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-full bg-primary-800 px-5 py-2.5 text-white transition hover:opacity-90"
            >
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {!isLoading &&
            !isFetching &&
            !isError &&
            filteredFoods.length === 0 && (
              <motion.div
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
                className="col-span-full px-4 py-12 text-center text-gray-400"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
                  <IoSearchOutline className="text-[30px] text-gray-300" />
                </div>

                <p className="mt-4 text-base font-medium text-gray-600">
                  រកមិនឃើញមុខម្ហូប
                </p>

                <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-gray-400">
                  សូមសាកល្បងការស្វែងរក ឬកែប្រែតម្រងរបស់អ្នក
                </p>

                {(count > 0 || searchInput || sortBy !== "default") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      clearAll();
                    }}
                    className="mt-4 rounded-full border border-primary-200 px-4 py-2 text-sm font-medium text-primary-700 transition hover:bg-primary-50"
                  >
                    សម្អាតការស្វែងរក
                  </button>
                )}
              </motion.div>
            )}

          {!isLoading &&
            !isFetching &&
            !isError &&
            paginatedFoods.map((food) => (
              <motion.div
                layout
                key={food.uuid}
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                }}
                transition={{
                  duration: 0.2,
                }}
                className="w-full min-w-0"
              >
                <FoodCard food={food} />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* ===================================================
          PAGINATION CONTROLS (10 items / page)
      =================================================== */}

      {!isLoading && !isFetching && !isError && filteredFoods.length > 0 && totalPages > 1 && (
        <div className="mt-10 flex flex-col items-center justify-between gap-4 px-4 sm:flex-row border-t border-gray-100 dark:border-slate-800 pt-6">
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
            បង្ហាញ{" "}
            <span className="font-semibold text-primary-800 dark:text-emerald-400">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            -{" "}
            <span className="font-semibold text-primary-800 dark:text-emerald-400">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredFoods.length)}
            </span>{" "}
            នៃ{" "}
            <span className="font-semibold text-primary-800 dark:text-emerald-400">
              {filteredFoods.length}
            </span>{" "}
            មុខម្ហូប
          </p>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 hover:border-primary-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Previous page"
            >
              <IoChevronBackOutline className="text-[18px]" />
            </button>

            {visiblePages.map((page, idx) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="flex h-10 w-8 items-center justify-center text-sm font-semibold text-gray-400 dark:text-slate-500"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = Number(page);
              const isSelected = pageNum === currentPage;

              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-sm font-bold transition ${
                    isSelected
                      ? "bg-primary-800 text-white shadow-sm dark:bg-emerald-600"
                      : "border border-gray-200 bg-white text-gray-700 hover:border-primary-700 hover:bg-primary-50/50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 hover:border-primary-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Next page"
            >
              <IoChevronForwardOutline className="text-[18px]" />
            </button>
          </div>
        </div>
      )}

      {/* ===================================================
          MOBILE SORT OVERLAY
      =================================================== */}

      <AnimatePresence>
        {isMobileSortOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.button
              type="button"
              aria-label="Close sort"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() => setIsMobileSortOpen(false)}
              className="absolute inset-0 bg-black/35"
            />

            <motion.div
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
                damping: 28,
                stiffness: 300,
              }}
              className="absolute inset-x-0 bottom-0 max-h-[75dvh] overflow-hidden rounded-t-[28px] bg-white shadow-2xl"
            >
              <div className="flex justify-center pt-3">
                <span className="h-1.5 w-12 rounded-full bg-gray-200" />
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 px-5 pb-4 pt-3">
                <div>
                  <p className="text-xl font-semibold text-gray-800">
                    តម្រៀបមុខម្ហូប
                  </p>

                  <p className="mt-1 text-sm text-gray-400">ជ្រើសរបៀបតម្រៀប</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileSortOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-500"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="scrollbar-hide max-h-[55dvh] overflow-y-auto px-4 py-3">
                {mobileSortOptions.map((option) => {
                  const active = sortBy === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSortBy(option.value);

                        setIsMobileSortOpen(false);
                      }}
                      className={`
                          mb-1
                          flex
                          min-h-14
                          w-full
                          items-center
                          justify-between
                          gap-4
                          rounded-xl
                          px-4
                          text-left
                          text-base
                          transition

                          ${
                            active
                              ? "bg-primary-50 font-medium text-primary-700"
                              : "text-gray-700 hover:bg-gray-50"
                          }
                        `}
                    >
                      <span>{option.label}</span>

                      {active && (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-700 text-white">
                          <CheckIcon className="h-4 w-4" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="h-[max(16px,env(safe-area-inset-bottom))]" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================
          MOBILE FILTER OVERLAY
      =================================================== */}

      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.button
              type="button"
              aria-label="Close filter"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/35"
            />

            <motion.div
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
                damping: 28,
                stiffness: 300,
              }}
              className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl"
            >
              <div className="flex justify-center pt-3">
                <span className="h-1.5 w-12 rounded-full bg-gray-200" />
              </div>

              <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 pb-4 pt-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-semibold text-gray-800">
                      តម្រងអាហារ
                    </p>

                    {count > 0 && (
                      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary-700 px-1.5 text-xs font-semibold text-white">
                        {count}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-gray-400">
                    ជ្រើសជម្រើសដែលអ្នកចង់បាន
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-500"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
                {filterContent}
              </div>

              <div className="shrink-0 border-t border-gray-100 bg-white px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
                <div className="grid grid-cols-[auto_1fr] gap-2">
                  <button
                    type="button"
                    onClick={clearFilters}
                    disabled={count === 0}
                    className="
                      h-12
                      rounded-xl
                      border
                      border-gray-200
                      px-4
                      text-base
                      font-medium
                      text-gray-600
                      transition

                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    សម្អាត
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="h-12 rounded-xl bg-primary-700 px-5 text-base font-medium text-white transition active:scale-[0.98]"
                  >
                    បង្ហាញ {filteredFoods.length} មុខម្ហូប
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
