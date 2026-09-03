"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  IoSearchOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
} from "react-icons/io5";

import { useGetMenuItemsQuery } from "@/app/store/menuApi";
import { useGetDiscoveryFiltersQuery } from "@/app/store/searchApi";
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
  | "name-asc"
  | "name-desc";

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
    value: "name-asc",
    label: "ឈ្មោះ A → Z",
  },
  {
    value: "name-desc",
    label: "ឈ្មោះ Z → A",
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
    if (!ageGroup?.code && !ageGroup?.name) {
      return [];
    }

    return [
      {
        code: ageGroup.code || ageGroup.name,
        name: ageGroup.name || ageGroup.code,
      },
    ];
  });
}

function formatAgeGroupOptionLabel(a: FilterOption | any): string {
  const item = a as any;
  const key = `${a.name || ""} ${a.code || ""}`.toLowerCase();
  if (
    key.includes("ទារក") ||
    key.includes("infant") ||
    key.includes("baby")
  ) {
    return `${a.name || "ទារក"} (0-6)`;
  }
  const min = item?.minAge ?? item?.minimumAge ?? item?.min_age;
  const max = item?.maxAge ?? item?.maximumAge ?? item?.max_age;

  if (min !== undefined && min !== null && max !== undefined && max !== null) {
    return `${a.name} (${min}-${max})`;
  }
  if (
    min !== undefined &&
    min !== null &&
    (max === undefined || max === null)
  ) {
    return `${a.name} (${min}+)`;
  }
  if (
    (min === undefined || min === null) &&
    max !== undefined &&
    max !== null
  ) {
    return `${a.name} (≤${max})`;
  }

  // Fallback ranges for standard FoodHub age groups if not returned from backend
  if (
    key.includes("កុមារតូច") ||
    key.includes("toddler")
  ) {
    return `${a.name} (0-2)`;
  }
  if (key.includes("កុមារ") || key.includes("child") || key.includes("kid")) {
    return `${a.name} (3-12)`;
  }
  if (
    key.includes("យុវវ័យ") ||
    key.includes("យុវជន") ||
    key.includes("teen") ||
    key.includes("youth")
  ) {
    return `${a.name} (13-17)`;
  }
  if (key.includes("មនុស្សពេញវ័យ") || key.includes("adult")) {
    return `${a.name} (18-59)`;
  }
  if (
    key.includes("មនុស្សវ័យចំណាស់") ||
    key.includes("វ័យចំណាស់") ||
    key.includes("senior") ||
    key.includes("elderly")
  ) {
    return `${a.name} (60+)`;
  }

  return a.name;
}

function matchesAgeGroup(
  foodAgeGroups: FilterOption[],
  selectedAgeCodes: Set<string>,
): boolean {
  if (selectedAgeCodes.size === 0) return true;

  return [...selectedAgeCodes].some((selectedCode) => {
    const normSelected = normalizeText(selectedCode);

    return foodAgeGroups.some((ag) => {
      const aName = normalizeText(ag.name);
      const aCode = normalizeText(ag.code);

      if (normSelected === aCode || normSelected === aName) return true;
      if (aName.includes(normSelected) || aCode.includes(normSelected)) return true;

      if (
        (normSelected.includes("ទារក") ||
          normSelected.includes("0-6") ||
          normSelected.includes("0-1") ||
          normSelected.includes("0-2") ||
          normSelected.includes("infant") ||
          normSelected.includes("baby")) &&
        (aName.includes("ទារក") || aCode.includes("infant") || aCode.includes("baby"))
      ) {
        return true;
      }
      if (
        (normSelected.includes("យុវវ័យ") || normSelected.includes("13-17") || normSelected.includes("youth")) &&
        (aName.includes("យុវវ័យ") || aCode.includes("youth") || aCode.includes("teen"))
      ) {
        return true;
      }
      if (
        (normSelected.includes("កុមារតូច") || normSelected.includes("toddler")) &&
        (aName.includes("កុមារតូច") || aCode.includes("toddler"))
      ) {
        return true;
      }
      if (
        (normSelected.includes("កុមារ") || normSelected.includes("3-12") || normSelected.includes("child")) &&
        (aName.includes("កុមារ") || aCode.includes("child") || aCode.includes("children")) &&
        !normSelected.includes("តូច") &&
        !aName.includes("តូច")
      ) {
        return true;
      }
      if (
        (normSelected.includes("ពេញវ័យ") || normSelected.includes("18-59") || normSelected.includes("adult")) &&
        (aName.includes("ពេញវ័យ") || aCode.includes("adult"))
      ) {
        return true;
      }
      if (
        (normSelected.includes("ចំណាស់") || normSelected.includes("60+") || normSelected.includes("senior")) &&
        (aName.includes("ចំណាស់") || aCode.includes("senior") || aCode.includes("elderly"))
      ) {
        return true;
      }

      return false;
    });
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

    case "name-asc":
      return sorted.sort((a, b) => {
        const first = a.localName?.trim() || a.name;

        const second = b.localName?.trim() || b.name;

        return first.localeCompare(second);
      });

    case "name-desc":
      return sorted.sort((a, b) => {
        const first = a.localName?.trim() || a.name;

        const second = b.localName?.trim() || b.name;

        return second.localeCompare(first);
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

  const { data: discoveryFilters } = useGetDiscoveryFiltersQuery();

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
    ).filter((c) => {
      const name = normalizeText(c.name);
      const code = normalizeText(c.code);
      return !name.includes("ថៃ") && !code.includes("thai");
    });

    const dietaryTypes = getUniqueOptions(
      menuItems.flatMap((item) => getDietaryOptions(item)),
    );

    const rawAgeGroups = getUniqueOptions(
      menuItems.flatMap((item) => getAgeGroups(item)),
    );

    const hasInfant = rawAgeGroups.some(
      (a) =>
        normalizeText(a.name).includes("ទារក") ||
        (a.code && normalizeText(a.code).includes("infant")) ||
        (a.code && normalizeText(a.code).includes("baby")),
    );

    const fullAgeGroups = hasInfant
      ? rawAgeGroups
      : [
          {
            code: "INFANT",
            name: "ទារក",
          },
          ...rawAgeGroups,
        ];

    const ageGroups: FilterOption[] = fullAgeGroups.map((a) => ({
      code: a.code || a.name,
      name: formatAgeGroupOptionLabel(a),
    }));

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
    ];

    return groups.filter((group) => group.options.length > 0);
  }, [menuItems, discoveryFilters]);

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

      const matchesAge = matchesAgeGroup(
        getAgeGroups(food),
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
        matchesAge
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

            <label htmlFor="foodSearchInput" className="sr-only">
              ស្វែងរកមុខម្ហូប
            </label>
            <input
              id="foodSearchInput"
              name="search"
              type="search"
              aria-label="ស្វែងរកមុខម្ហូប"
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
