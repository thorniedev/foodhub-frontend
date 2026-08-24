"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IoSearchOutline } from "react-icons/io5";

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

/**
 * GLOBAL SEARCH
 *
 * This searches the ENTIRE menu item object returned by the backend,
 * including nested values such as:
 *
 * name, localName, descriptions, price, currency, store information,
 * category, cuisine, spice level, age groups, seasons, meal types,
 * dietary types, events, weather, ingredients, allergens, nutrition,
 * recommendation, origin, filterOption, source, status, etc.
 *
 * JSON.stringify also includes the property names, so a query such as
 * "calories", "proteinGrams", "countryName", "rainy", "HALAL", etc.
 * can match.
 */
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

  /**
   * Multi-word search:
   * "khmer halal rainy"
   *
   * Every word must exist somewhere in the full menu-item response.
   */
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

/**
 * allergenDeclarations is still unknown[] in your verified type because
 * the response sample currently contains [].
 *
 * This helper safely supports common backend shapes without forcing
 * a wrong TypeScript interface:
 *
 * { code, name }
 * { allergenCode, allergenName }
 * { allergen: { code, name } }
 * "PEANUT"
 */
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

  /**
   * Multiple chips inside the same group use OR.
   *
   * Example:
   * Cuisine = Khmer OR Thai
   */
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

/* =========================================================
   COMPONENT
========================================================= */

export default function FoodSearchBar() {
  const [searchInput, setSearchInput] = useState("");

  const [isOpen, setIsOpen] = useState(false);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [sortBy, setSortBy] = useState<SortOption>("default");

  const wrapRef = useRef<HTMLDivElement>(null);

  const {
    data: menuItems = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetMenuItemsQuery();

  /* =======================================================
     CLOSE FILTER WHEN CLICKING OUTSIDE
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
     BUILD FILTER OPTIONS FROM CURRENT API RESPONSE
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

    /**
     * Dynamic backend groups are hidden when the API does not provide
     * any values.
     *
     * Preparation time is always available because its ranges are local.
     */
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
     FILTER + GLOBAL SEARCH + SORT
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

      /**
       * Allergy filters work as EXCLUSION filters.
       *
       * If user chooses PEANUT, foods declaring PEANUT are removed.
       */
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

  /* =======================================================
     SELECTED LABELS
  ======================================================= */

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
      ? "តម្រងអាហារ"
      : selectedLabels.slice(0, 2).join(", ") +
        (count > 2 ? ` +${count - 2}` : "");

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="container mx-auto w-full max-w-7xl pt-12.5 text-[#3d3d3a]">
      {/* ===============================================
          SEARCH + FILTER BAR
      =============================================== */}

      <div className="sticky top-18 z-50 mx-auto flex w-full max-w-7xl flex-wrap items-stretch gap-3.5 px-4 pb-6">
        {/* SEARCH */}

        <div className="flex min-h-[56px] w-full min-w-0 sm:min-h-[60px] sm:min-w-[280px] sm:flex-1 items-center gap-3 rounded-full border border-[#e7e6e1] bg-white px-[22px] shadow-sm transition focus-within:border-[#1c6b45] focus-within:ring-4 focus-within:ring-[#e8f3ec]">
          <IoSearchOutline className="shrink-0 text-[22px] text-[#1c6b45]" />

          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="ស្វែងរកគ្រប់ព័ត៌មានម្ហូប..."
            className="h-full w-full bg-transparent text-[15px] outline-none placeholder:text-[#a3a29a]"
          />

          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="cursor-pointer text-sm text-gray-400 hover:text-gray-700"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* SORT */}

        <SortDropdown value={sortBy} onChange={setSortBy} />
        {/* FILTER */}

        <div ref={wrapRef} className="relative z-50 w-full min-w-0 sm:w-auto sm:min-w-[220px] flex-1 sm:flex-none">
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
              <span className="rounded-full bg-[#1c6b45] px-2 py-0.5 text-base font-semibold text-white">
                {count}
              </span>
            )}

            <ChevronIcon
              className={`h-4 w-4 shrink-0 text-[#1c6b45] transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* DROPDOWN */}

          <div
            className={`absolute right-0 top-[calc(100%+10px)] z-50 w-[420px] max-w-[90vw] rounded-[18px] border border-[#e7e6e1] bg-white p-5 shadow-xl transition-all ${
              isOpen
                ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                : "pointer-events-none -translate-y-2 scale-[0.98] opacity-0"
            }`}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm text-gray-400">ជ្រើសតម្រងច្រើនបាន</p>

              {(count > 0 || sortBy !== "default") && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="cursor-pointer rounded-full bg-secondary-50 px-3 py-1 text-sm text-secondary-500 underline underline-offset-2 hover:text-secondary-800"
                >
                  សម្អាតទាំងអស់
                </button>
              )}
            </div>

            <div className="scrollbar-hide max-h-[70vh] overflow-y-auto">
              {chipGroups.map((group, index) => (
                <div
                  key={group.key}
                  className={
                    index > 0 ? "mt-5 border-t border-[#e7e6e1] pt-[18px]" : ""
                  }
                >
                  <p className="mb-1 text-xl font-semibold text-[#a3a29a]">
                    {group.title}
                  </p>

                  {group.description && (
                    <p className="mb-3 text-sm leading-6 text-gray-400">
                      {group.description}
                    </p>
                  )}

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
                          className={`cursor-pointer rounded-full border px-4 py-2 text-base transition-all ${
                            isSelected
                              ? group.key === "allergen"
                                ? "border-red-500 bg-red-500 text-white"
                                : "border-[#1c6b45] bg-[#1c6b45] text-white"
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

              {chipGroups.length === 0 && (
                <p className="py-5 text-center text-sm text-gray-400">
                  មិនមានទិន្នន័យតម្រង
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===============================================
          RESULT SUMMARY
      =============================================== */}

      {!isLoading && !isError && (
        <div className="flex flex-wrap items-center gap-2 px-4 pb-3 text-base text-gray-400">
          <span>រកឃើញ</span>

          <span className="font-semibold text-primary-700">
            {filteredFoods.length}
          </span>

          <span>មុខម្ហូប</span>

          {searchInput.trim() && (
            <>
              <span>សម្រាប់</span>
              <span className="max-w-[260px] truncate font-medium text-gray-600">
                “{searchInput.trim()}”
              </span>
            </>
          )}
        </div>
      )}

      {/* ===============================================
          GRID
      =============================================== */}

      <div className="mt-3 grid grid-cols-1 place-items-center gap-4 px-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {/* LOADING */}

        {(isLoading || isFetching) && (
          <p className="col-span-full py-10 text-center text-gray-400">
            កំពុងផ្ទុក...
          </p>
        )}

        {/* ERROR */}

        {isError && (
          <div className="col-span-full flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-red-500">មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ</p>

            <button
              type="button"
              onClick={() => refetch()}
              className="cursor-pointer rounded-full bg-primary-800 px-4 py-2 text-white"
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
                className="col-span-full py-10 text-center text-gray-400"
              >
                <IoSearchOutline className="mx-auto mb-4 text-[34px] text-gray-300" />

                <p>រកមិនឃើញលទ្ធផលដែលត្រូវនឹងការស្វែងរក និងតម្រង</p>
              </motion.div>
            )}

          {!isLoading &&
            !isFetching &&
            !isError &&
            filteredFoods.map((food) => (
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
                className="w-full"
              >
                <FoodCard food={food} />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
