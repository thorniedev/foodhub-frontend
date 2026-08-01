"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  IoChevronBack,
  IoChevronDown,
  IoCloseOutline,
  IoLocationOutline,
  IoNavigateOutline,
  IoSwapVerticalOutline,
} from "react-icons/io5";

import { FaShieldAlt, FaStar, FaStore, FaTruck, FaUsers } from "react-icons/fa";

import type {
  LocationFiltersState,
  LocationSort,
  RecommendationMode,
} from "@/types/location";

import { DEFAULT_LOCATION_FILTERS } from "@/types/location";

type LocationFiltersProps = {
  mode: RecommendationMode;
  filters: LocationFiltersState;
  onModeChange: (mode: RecommendationMode) => void;
  onChange: (filters: LocationFiltersState) => void;

  /**
   * When provided, the filter is displayed inside the
   * mobile/tablet drawer.
   */
  onClose?: () => void;
};

type FilterSectionProps = {
  title: string;
  icon: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
};

type FilterOptionProps = {
  label: string;
  checked: boolean;
  onChange: () => void;
};

type SingleChoiceProps<T extends string | number> = {
  options: Array<{
    value: T;
    label: string;
  }>;
  selected: T;
  onChange: (value: T) => void;
};

const RADIUS_OPTIONS = [
  {
    value: 1,
    label: "ក្រោម 1 km",
  },
  {
    value: 3,
    label: "ក្រោម 3 km",
  },
  {
    value: 5,
    label: "ក្រោម 5 km",
  },
  {
    value: 10,
    label: "ក្រោម 10 km",
  },
  {
    value: 20,
    label: "ក្រោម 20 km",
  },
];

const RATING_OPTIONS = [
  {
    value: 0,
    label: "ទាំងអស់",
  },
  {
    value: 3.5,
    label: "3.5+",
  },
  {
    value: 4,
    label: "4.0+",
  },
  {
    value: 4.5,
    label: "4.5+",
  },
];

const OPEN_SECTION_DEFAULTS: Record<string, boolean> = {
  mode: true,
  distance: true,
  availability: true,
  rating: false,
  group: true,
  sort: true,
};

function getDefaultFilters(mode: RecommendationMode): LocationFiltersState {
  return {
    ...DEFAULT_LOCATION_FILTERS,
    sortBy: mode === "group" ? "fairest-distance" : "recommended",
  };
}

function countActiveLocationFilters(
  mode: RecommendationMode,
  filters: LocationFiltersState,
): number {
  const defaults = getDefaultFilters(mode);

  let count = 0;

  if (filters.radiusKm !== defaults.radiusKm) {
    count += 1;
  }

  if (filters.openNow !== defaults.openNow) {
    count += 1;
  }

  if (filters.deliveryAvailable !== defaults.deliveryAvailable) {
    count += 1;
  }

  if (filters.pickupAvailable !== defaults.pickupAvailable) {
    count += 1;
  }

  if (filters.minimumRating !== defaults.minimumRating) {
    count += 1;
  }

  if (filters.sortBy !== defaults.sortBy) {
    count += 1;
  }

  if (mode === "group") {
    if (filters.safeForAllMembers !== defaults.safeForAllMembers) {
      count += 1;
    }

    if (filters.hasMealsForEveryone !== defaults.hasMealsForEveryone) {
      count += 1;
    }
  }

  return count;
}

function FilterSection({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}: FilterSectionProps) {
  return (
    <section className="border-t border-gray-100 py-4 first:border-t-0 first:pt-0">
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
    </section>
  );
}

function CheckboxOption({ label, checked, onChange }: FilterOptionProps) {
  return (
    <label
      className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
        checked
          ? "border-primary-200 bg-primary-50 text-primary-800"
          : "border-transparent text-gray-600 hover:bg-gray-50"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 accent-primary-800"
      />

      <span className="text-[16px] leading-6">{label}</span>
    </label>
  );
}

function RadioOption({ label, checked, onChange }: FilterOptionProps) {
  return (
    <label
      className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
        checked
          ? "border-primary-200 bg-primary-50 text-primary-800"
          : "border-transparent text-gray-600 hover:bg-gray-50"
      }`}
    >
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 accent-primary-800"
      />

      <span className="text-[16px] leading-6">{label}</span>
    </label>
  );
}

function SingleChoice<T extends string | number>({
  options,
  selected,
  onChange,
}: SingleChoiceProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected === option.value;

        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full border px-3 py-2 text-[16px] transition ${
              isSelected
                ? "border-primary-800 bg-primary-800 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-primary-500 hover:bg-primary-50"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default function LocationFilters({
  mode,
  filters,
  onModeChange,
  onChange,
  onClose,
}: LocationFiltersProps) {
  const isDrawer = Boolean(onClose);

  const [collapsed, setCollapsed] = useState(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    OPEN_SECTION_DEFAULTS,
  );

  const activeFilterCount = countActiveLocationFilters(mode, filters);

  const updateFilter = <Key extends keyof LocationFiltersState>(
    key: Key,
    value: LocationFiltersState[Key],
  ) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleSection = (key: string) => {
    setOpenSections((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const openCollapsedSection = (key: string) => {
    setCollapsed(false);

    setOpenSections((current) => ({
      ...current,
      [key]: true,
    }));
  };

  const handleReset = () => {
    onChange(getDefaultFilters(mode));
  };

  const sortOptions: Array<{
    value: LocationSort;
    label: string;
  }> = [
    {
      value: "recommended",
      label: "ការណែនាំល្អបំផុត",
    },
    {
      value: "nearest",
      label: "នៅជិតបំផុត",
    },
    {
      value: "highest-rated",
      label: "ការវាយតម្លៃខ្ពស់បំផុត",
    },
    ...(mode === "group"
      ? [
          {
            value: "most-voted" as LocationSort,
            label: "សំឡេងឆ្នោតច្រើនបំផុត",
          },
          {
            value: "fairest-distance" as LocationSort,
            label: "ចម្ងាយសមរម្យសម្រាប់គ្រប់គ្នា",
          },
        ]
      : []),
  ];

  const collapsedItems = [
    {
      key: "mode",
      label: "របៀបណែនាំ",
      icon: <FaUsers />,
    },
    {
      key: "distance",
      label: "ចម្ងាយ",
      icon: <IoLocationOutline />,
    },
    {
      key: "availability",
      label: "ស្ថានភាពហាង",
      icon: <FaStore />,
    },
    {
      key: "rating",
      label: "ការវាយតម្លៃ",
      icon: <FaStar />,
    },
    {
      key: "sort",
      label: "តម្រៀបតាម",
      icon: <IoSwapVerticalOutline />,
    },
  ];

  return (
    <motion.aside
      animate={
        isDrawer
          ? undefined
          : {
              width: collapsed ? 78 : 300,
            }
      }
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 34,
      }}
      className={isDrawer ? "h-full w-full" : "h-full shrink-0"}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
        {/* Fixed header */}
        <header
          className={`shrink-0 border-b border-gray-100 bg-white ${
            collapsed && !isDrawer ? "p-3" : "p-5"
          }`}
        >
          <div
            className={`flex items-center ${
              collapsed && !isDrawer ? "justify-center" : "justify-between"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {(!collapsed || isDrawer) && (
                <motion.div
                  key="location-filter-heading"
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
                    {mode === "single"
                      ? "ស្វែងរកហាងនៅជិតអ្នក"
                      : "ស្វែងរកហាងសម្រាប់ក្រុម"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {isDrawer ? (
              <motion.button
                type="button"
                onClick={onClose}
                whileTap={{
                  scale: 0.9,
                }}
                aria-label="Close location filters"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition hover:bg-primary-50 hover:text-primary-700"
              >
                <IoCloseOutline className="text-[24px]" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={() => setCollapsed((current) => !current)}
                whileHover={{
                  scale: 1.06,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                aria-label={
                  collapsed
                    ? "Expand location filters"
                    : "Collapse location filters"
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition hover:bg-primary-50 hover:text-primary-700"
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
            )}
          </div>

          {(!collapsed || isDrawer) && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
              <p className="text-[16px] text-gray-500">
                {activeFilterCount} តម្រងបានជ្រើស
              </p>

              <button
                type="button"
                disabled={activeFilterCount === 0}
                onClick={handleReset}
                className="shrink-0 text-[16px] font-medium text-secondary-500 transition hover:underline disabled:cursor-not-allowed disabled:opacity-40"
              >
                សម្អាតទាំងអស់
              </button>
            </div>
          )}
        </header>

        {collapsed && !isDrawer ? (
          <div className="flex flex-1 flex-col items-center gap-3 overflow-y-auto px-3 py-4">
            {collapsedItems.map((item) => (
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
                onClick={() => openCollapsedSection(item.key)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[21px] text-primary-700"
              >
                {item.icon}
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-2 [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent] sm:px-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-primary-700">
            <FilterSection
              title="របៀបណែនាំ"
              icon={<FaUsers />}
              isOpen={openSections.mode}
              onToggle={() => toggleSection("mode")}
            >
              <div className="space-y-2">
                <RadioOption
                  label="ណែនាំសម្រាប់ខ្ញុំ"
                  checked={mode === "single"}
                  onChange={() => onModeChange("single")}
                />

                <RadioOption
                  label="ណែនាំសម្រាប់ក្រុម"
                  checked={mode === "group"}
                  onChange={() => onModeChange("group")}
                />
              </div>
            </FilterSection>

            <FilterSection
              title="ចម្ងាយ"
              icon={<IoLocationOutline />}
              isOpen={openSections.distance}
              onToggle={() => toggleSection("distance")}
            >
              <SingleChoice
                options={RADIUS_OPTIONS}
                selected={filters.radiusKm}
                onChange={(radiusKm) => updateFilter("radiusKm", radiusKm)}
              />
            </FilterSection>

            <FilterSection
              title="ស្ថានភាព និងសេវាកម្មហាង"
              icon={<FaStore />}
              isOpen={openSections.availability}
              onToggle={() => toggleSection("availability")}
            >
              <div className="space-y-1">
                <CheckboxOption
                  label="បង្ហាញតែហាងដែលកំពុងបើក"
                  checked={filters.openNow}
                  onChange={() => updateFilter("openNow", !filters.openNow)}
                />

                <CheckboxOption
                  label="មានសេវាដឹកជញ្ជូន"
                  checked={filters.deliveryAvailable}
                  onChange={() =>
                    updateFilter(
                      "deliveryAvailable",
                      !filters.deliveryAvailable,
                    )
                  }
                />

                <CheckboxOption
                  label="អាចមកយកដោយខ្លួនឯង"
                  checked={filters.pickupAvailable}
                  onChange={() =>
                    updateFilter("pickupAvailable", !filters.pickupAvailable)
                  }
                />
              </div>
            </FilterSection>

            <FilterSection
              title="ការវាយតម្លៃអប្បបរមា"
              icon={<FaStar />}
              isOpen={openSections.rating}
              onToggle={() => toggleSection("rating")}
            >
              <SingleChoice
                options={RATING_OPTIONS}
                selected={filters.minimumRating}
                onChange={(minimumRating) =>
                  updateFilter("minimumRating", minimumRating)
                }
              />
            </FilterSection>

            {mode === "group" && (
              <FilterSection
                title="ជម្រើសសម្រាប់ក្រុម"
                icon={<FaShieldAlt />}
                isOpen={openSections.group}
                onToggle={() => toggleSection("group")}
              >
                <div className="space-y-1">
                  <CheckboxOption
                    label="មានសុវត្ថិភាពសម្រាប់សមាជិកទាំងអស់"
                    checked={filters.safeForAllMembers}
                    onChange={() =>
                      updateFilter(
                        "safeForAllMembers",
                        !filters.safeForAllMembers,
                      )
                    }
                  />

                  <CheckboxOption
                    label="មានមុខម្ហូបសម្រាប់សមាជិកគ្រប់គ្នា"
                    checked={filters.hasMealsForEveryone}
                    onChange={() =>
                      updateFilter(
                        "hasMealsForEveryone",
                        !filters.hasMealsForEveryone,
                      )
                    }
                  />
                </div>
              </FilterSection>
            )}

            <FilterSection
              title="តម្រៀបតាម"
              icon={<IoSwapVerticalOutline />}
              isOpen={openSections.sort}
              onToggle={() => toggleSection("sort")}
            >
              <div className="space-y-2">
                {sortOptions.map((option) => (
                  <RadioOption
                    key={option.value}
                    label={option.label}
                    checked={filters.sortBy === option.value}
                    onChange={() => updateFilter("sortBy", option.value)}
                  />
                ))}
              </div>
            </FilterSection>

            <div className="h-4" />
          </div>
        )}
      </div>
    </motion.aside>
  );
}
