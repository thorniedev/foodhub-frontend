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

import { FaStar, FaStore } from "react-icons/fa";

import type {
  StorePageFilters,
  StorePageOption,
  StoreSortBy,
} from "@/types/store-page";

import {
  DEFAULT_STORE_FILTERS,
  countActiveStoreFilters,
  toggleStoreFilterValue,
} from "./store-page-utils";

type StoreFiltersProps = {
  filters: StorePageFilters;
  onChange: (filters: StorePageFilters) => void;

  cityOptions: StorePageOption[];
  provinceOptions: StorePageOption[];
  operatingStatusOptions: StorePageOption[];

  hasAverageRatingData: boolean;
  hasDistanceData?: boolean;

  onClose?: () => void;
};

type FilterSectionProps = {
  title: string;
  icon: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
};

const DISTANCE_OPTIONS: Array<{
  value: number | null;
  label: string;
}> = [
  {
    value: null,
    label: "ទាំងអស់",
  },
  {
    value: 2,
    label: "< 2 km",
  },
  {
    value: 5,
    label: "< 5 km",
  },
  {
    value: 10,
    label: "< 10 km",
  },
  {
    value: 20,
    label: "< 20 km",
  },
];

const RATING_OPTIONS: Array<{
  value: number | null;
  label: string;
}> = [
  {
    value: null,
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

const SORT_OPTIONS: Array<{
  value: StoreSortBy;
  label: string;
}> = [
  {
    value: "default",
    label: "លំដាប់ដើម",
  },
  {
    value: "nearest",
    label: "ចម្ងាយជិតបំផុត",
  },
  {
    value: "name-asc",
    label: "ឈ្មោះ A ដល់ Z",
  },
  {
    value: "rating",
    label: "ការវាយតម្លៃខ្ពស់",
  },
  {
    value: "reviews",
    label: "មតិច្រើនបំផុត",
  },
];

const OPEN_SECTION_DEFAULTS: Record<string, boolean> = {
  status: true,
  distance: true,
  city: false,
  province: false,
  operatingStatus: true,
  rating: false,
  sort: true,
};

/* -------------------------------------------------------------------------- */
/* Filter section                                                             */
/* -------------------------------------------------------------------------- */

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
        className="
          flex w-full cursor-pointer
          items-center justify-between
          gap-3 text-left
        "
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="shrink-0 text-[20px] text-primary-700">{icon}</span>

          <span className="truncate text-[18px] font-semibold text-primary-900">
            {title}
          </span>
        </span>

        <motion.span
          animate={{
            rotate: isOpen ? 180 : 0,
          }}
          transition={{
            duration: 0.2,
          }}
          className="shrink-0 text-gray-400"
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
              duration: 0.22,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Checkbox option                                                            */
/* -------------------------------------------------------------------------- */

function CheckboxOption({
  label,
  checked,
  onChange,
  count,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  count?: number;
}) {
  return (
    <label
      className={`
        flex min-h-[44px] cursor-pointer
        items-center justify-between
        gap-3 rounded-xl border
        px-3 py-2
        transition-colors duration-200

        ${
          checked
            ? "border-primary-200 bg-primary-50 text-primary-800 dark:text-primary-dark"
            : "border-transparent text-gray-600 hover:bg-gray-50"
        }
      `}
    >
      <span className="flex min-w-0 items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="
            h-[18px] w-[18px]
            shrink-0
            cursor-pointer
            accent-primary-800
          "
        />

        <span className="min-w-0 truncate text-[18px] leading-6">{label}</span>
      </span>

      {typeof count === "number" && (
        <span
          className={`
            flex h-8 min-w-8
            shrink-0 items-center
            justify-center rounded-full
            px-2 text-[18px] font-medium

            ${
              checked
                ? "bg-white text-primary-700"
                : "bg-gray-100 text-gray-500"
            }
          `}
        >
          {count}
        </span>
      )}
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Radio option                                                               */
/* -------------------------------------------------------------------------- */

function RadioOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`
        flex min-h-[44px]
        cursor-pointer items-center
        gap-3 rounded-xl border
        px-3 py-2
        transition-colors duration-200

        ${
          checked
            ? "border-primary-200 bg-primary-50 text-primary-800 dark:text-primary-dark"
            : "border-transparent text-gray-600 hover:bg-gray-50"
        }
      `}
    >
      <input
        type="radio"
        name="store-sort"
        checked={checked}
        onChange={onChange}
        className="
          h-[18px] w-[18px]
          shrink-0
          cursor-pointer
          accent-primary-800
        "
      />

      <span className="text-[18px] leading-6">{label}</span>
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Option list                                                                */
/* IMPORTANT: No scrollbar here.                                              */
/* Main StoreFilters container handles all scrolling.                         */
/* -------------------------------------------------------------------------- */

function OptionList({
  options,
  selectedValues,
  onToggle,
}: {
  options: StorePageOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}) {
  if (options.length === 0) {
    return (
      <p className="rounded-xl bg-gray-50 px-3 py-3 text-[18px] leading-7 text-gray-400">
        មិនមានទិន្នន័យសម្រាប់តម្រងនេះទេ។
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {options.map((option) => (
        <CheckboxOption
          key={option.code}
          label={option.name}
          count={option.count}
          checked={selectedValues.includes(option.code)}
          onChange={() => onToggle(option.code)}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Store filters                                                              */
/* -------------------------------------------------------------------------- */

export default function StoreFilters({
  filters,
  onChange,
  cityOptions,
  provinceOptions,
  operatingStatusOptions,
  hasAverageRatingData,
  onClose,
}: StoreFiltersProps) {
  const isDrawer = Boolean(onClose);

  const [collapsed, setCollapsed] = useState(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    OPEN_SECTION_DEFAULTS,
  );

  const activeFilterCount = countActiveStoreFilters(filters);

  const updateFilter = <Key extends keyof StorePageFilters>(
    key: Key,
    value: StorePageFilters[Key],
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

  const resetFilters = () => {
    onChange(DEFAULT_STORE_FILTERS);
  };

  const collapsedItems = [
    {
      key: "status",
      label: "បើកឥឡូវនេះ",
      icon: <FaStore />,
      visible: true,
    },
    {
      key: "distance",
      label: "ចម្ងាយ",
      icon: <IoNavigateOutline />,
      visible: true,
    },
    {
      key: "operatingStatus",
      label: "ស្ថានភាពហាង",
      icon: <FaStore />,
      visible: operatingStatusOptions.length > 0,
    },
    {
      key: "city",
      label: "ទីក្រុង",
      icon: <IoLocationOutline />,
      visible: cityOptions.length > 0,
    },
    {
      key: "province",
      label: "ខេត្ត",
      icon: <IoLocationOutline />,
      visible: provinceOptions.length > 0,
    },
    {
      key: "rating",
      label: "ការវាយតម្លៃ",
      icon: <FaStar />,
      visible: hasAverageRatingData,
    },
    {
      key: "sort",
      label: "តម្រៀប",
      icon: <IoSwapVerticalOutline />,
      visible: true,
    },
  ].filter((item) => item.visible);

  return (
    <motion.aside
      animate={
        isDrawer
          ? undefined
          : {
              width: collapsed ? 76 : 292,
            }
      }
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 34,
      }}
      className={isDrawer ? "h-full w-full" : "h-full shrink-0"}
    >
      <div
        className="
          flex h-full
          min-h-0 flex-col
          overflow-hidden
          rounded-[22px]
          border border-gray-100
          bg-white shadow-sm
        "
      >
        {/* ------------------------------------------------------------------ */}
        {/* Header                                                             */}
        {/* ------------------------------------------------------------------ */}

        <div
          className={`
            shrink-0
            border-b border-gray-100
            bg-white

            ${collapsed && !isDrawer ? "px-3 py-4" : "px-4 py-4 sm:px-5"}
          `}
        >
          <div
            className={`
              flex items-center gap-3

              ${collapsed && !isDrawer ? "justify-center" : "justify-between"}
            `}
          >
            <AnimatePresence mode="wait" initial={false}>
              {(!collapsed || isDrawer) && (
                <motion.div
                  key="store-filter-heading"
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
                  className="min-w-0"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-[23px] font-bold leading-tight text-primary-900">
                      តម្រង
                    </p>

                    {activeFilterCount > 0 && (
                      <span
                        className="
                          flex h-7 min-w-7
                          items-center justify-center
                          rounded-full
                          bg-secondary-500
                          px-2
                          text-[18px]
                          font-semibold text-white
                        "
                      >
                        {activeFilterCount}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-[18px] leading-7 text-gray-400">
                    ស្វែងរកហាងដែលសមនឹងអ្នក
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
                aria-label="Close store filters"
                className="
                  flex h-10 w-10
                  shrink-0 items-center
                  justify-center rounded-full
                  bg-gray-50 text-gray-500
                  transition-colors
                  hover:bg-primary-50
                  hover:text-primary-700
                "
              >
                <IoCloseOutline className="text-[24px]" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={() => setCollapsed((current) => !current)}
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                aria-label={
                  collapsed ? "Expand store filters" : "Collapse store filters"
                }
                className="
                  flex h-10 w-10
                  shrink-0 items-center
                  justify-center rounded-full
                  bg-gray-50 text-gray-500
                  transition-colors
                  hover:bg-primary-50
                  hover:text-primary-700
                "
              >
                <motion.span
                  animate={{
                    rotate: collapsed ? 180 : 0,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                >
                  <IoChevronBack className="text-[21px]" />
                </motion.span>
              </motion.button>
            )}
          </div>

          {(!collapsed || isDrawer) && (
            <div
              className="
                mt-3 flex
                items-center justify-between
                gap-3 rounded-xl
                bg-gray-50
                px-3 py-2.5
              "
            >
              <p className="min-w-0 text-[18px] text-gray-500">
                {activeFilterCount} តម្រងបានជ្រើស
              </p>

              <button
                type="button"
                disabled={activeFilterCount === 0}
                onClick={resetFilters}
                className="
                  shrink-0
                  text-[18px]
                  font-medium
                  text-secondary-500
                  transition
                  hover:underline
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                សម្អាត
              </button>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Collapsed desktop state                                            */}
        {/* ------------------------------------------------------------------ */}

        {collapsed && !isDrawer ? (
          <div
            className="
              flex min-h-0
              flex-1 flex-col
              items-center gap-2.5
              overflow-y-auto
              px-2 py-4

              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            {collapsedItems.map((item) => (
              <motion.button
                key={item.key}
                type="button"
                title={item.label}
                aria-label={item.label}
                whileHover={{
                  scale: 1.06,
                }}
                whileTap={{
                  scale: 0.92,
                }}
                onClick={() => openCollapsedSection(item.key)}
                className="
                  flex h-11 w-11
                  shrink-0 items-center
                  justify-center rounded-full
                  text-[21px]
                  text-primary-700
                  transition-colors
                  hover:bg-primary-50
                "
              >
                {item.icon}
              </motion.button>
            ))}
          </div>
        ) : (
          /* ---------------------------------------------------------------- */
          /* MAIN SCROLL AREA                                                 */
          /* This is the ONLY visible scrollbar in the filter.                */
          /* ---------------------------------------------------------------- */

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              overflow-x-hidden
              scroll-smooth
              overscroll-contain

              px-4
              pb-8
              pt-3

              sm:px-5

              [scrollbar-gutter:stable]
              [scrollbar-width:thin]
              [scrollbar-color:#cbd5e1_transparent]

              [&::-webkit-scrollbar]:w-[6px]
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb]:bg-gray-300
              [&::-webkit-scrollbar-thumb:hover]:bg-gray-400
            "
          >
            {/* -------------------------------------------------------------- */}
            {/* Open now                                                       */}
            {/* -------------------------------------------------------------- */}

            <FilterSection
              title="ស្ថានភាពឥឡូវនេះ"
              icon={<FaStore />}
              isOpen={openSections.status}
              onToggle={() => toggleSection("status")}
            >
              <div className="space-y-1">
                <CheckboxOption
                  label="បង្ហាញតែហាងដែលកំពុងបើកឥឡូវនេះ"
                  checked={filters.openNowOnly}
                  onChange={() =>
                    updateFilter("openNowOnly", !filters.openNowOnly)
                  }
                />
              </div>
            </FilterSection>

            {/* -------------------------------------------------------------- */}
            {/* Distance / Near Me                                             */}
            {/* -------------------------------------------------------------- */}

            <FilterSection
              title="ចម្ងាយពីទីតាំងអ្នក"
              icon={<IoNavigateOutline />}
              isOpen={openSections.distance}
              onToggle={() => toggleSection("distance")}
            >
              <div className="flex flex-wrap gap-2">
                {DISTANCE_OPTIONS.map((option) => {
                  const selected =
                    (filters.maxDistanceKm ?? null) === option.value;

                  return (
                    <button
                      key={String(option.value)}
                      type="button"
                      onClick={() =>
                        updateFilter("maxDistanceKm", option.value)
                      }
                      className={`
                        min-h-[42px]
                        rounded-full
                        border px-3.5 py-2
                        text-[18px]
                        font-medium
                        transition-colors

                        ${
                          selected
                            ? "border-primary-800 bg-primary-800 text-white"
                            : "border-gray-200 bg-white text-gray-600 hover:border-primary-200 hover:bg-primary-50"
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </FilterSection>

            {/* -------------------------------------------------------------- */}
            {/* Operating status                                               */}
            {/* -------------------------------------------------------------- */}

            {operatingStatusOptions.length > 0 && (
              <FilterSection
                title="ស្ថានភាពប្រតិបត្តិការ"
                icon={<FaStore />}
                isOpen={openSections.operatingStatus}
                onToggle={() => toggleSection("operatingStatus")}
              >
                <OptionList
                  options={operatingStatusOptions}
                  selectedValues={filters.operatingStatuses}
                  onToggle={(value) =>
                    updateFilter(
                      "operatingStatuses",
                      toggleStoreFilterValue(filters.operatingStatuses, value),
                    )
                  }
                />
              </FilterSection>
            )}

            {/* -------------------------------------------------------------- */}
            {/* City                                                           */}
            {/* -------------------------------------------------------------- */}

            {cityOptions.length > 0 && (
              <FilterSection
                title="ទីក្រុង"
                icon={<IoLocationOutline />}
                isOpen={openSections.city}
                onToggle={() => toggleSection("city")}
              >
                <OptionList
                  options={cityOptions}
                  selectedValues={filters.cities}
                  onToggle={(value) =>
                    updateFilter(
                      "cities",
                      toggleStoreFilterValue(filters.cities, value),
                    )
                  }
                />
              </FilterSection>
            )}

            {/* -------------------------------------------------------------- */}
            {/* Province                                                       */}
            {/* -------------------------------------------------------------- */}

            {provinceOptions.length > 0 && (
              <FilterSection
                title="ខេត្ត / រាជធានី"
                icon={<IoLocationOutline />}
                isOpen={openSections.province}
                onToggle={() => toggleSection("province")}
              >
                <OptionList
                  options={provinceOptions}
                  selectedValues={filters.provinces}
                  onToggle={(value) =>
                    updateFilter(
                      "provinces",
                      toggleStoreFilterValue(filters.provinces, value),
                    )
                  }
                />
              </FilterSection>
            )}

            {/* -------------------------------------------------------------- */}
            {/* Rating                                                         */}
            {/* -------------------------------------------------------------- */}

            {hasAverageRatingData && (
              <FilterSection
                title="ការវាយតម្លៃអប្បបរមា"
                icon={<FaStar />}
                isOpen={openSections.rating}
                onToggle={() => toggleSection("rating")}
              >
                <div className="flex flex-wrap gap-2">
                  {RATING_OPTIONS.map((option) => {
                    const selected = filters.minimumRating === option.value;

                    return (
                      <button
                        key={String(option.value)}
                        type="button"
                        onClick={() =>
                          updateFilter("minimumRating", option.value)
                        }
                        className={`
                            min-h-[42px]
                            rounded-full
                            border px-3.5 py-2
                            text-[18px]
                            font-medium
                            transition-colors

                            ${
                              selected
                                ? "border-primary-800 bg-primary-800 text-white"
                                : "border-gray-200 bg-white text-gray-600 hover:border-primary-200 hover:bg-primary-50"
                            }
                          `}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </FilterSection>
            )}

            {/* -------------------------------------------------------------- */}
            {/* Sort                                                           */}
            {/* -------------------------------------------------------------- */}

            <FilterSection
              title="តម្រៀបតាម"
              icon={<IoSwapVerticalOutline />}
              isOpen={openSections.sort}
              onToggle={() => toggleSection("sort")}
            >
              <div className="space-y-1">
                {SORT_OPTIONS.map((option) => (
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
