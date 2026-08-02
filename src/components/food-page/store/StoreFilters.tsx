"use client";

import { useState, type ReactNode } from "react";

import { AnimatePresence, motion } from "framer-motion";

import {
  IoChevronBack,
  IoChevronDown,
  IoCloseOutline,
  IoLocationOutline,
  IoPricetagOutline,
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
  districtOptions: StorePageOption[];
  provinceOptions: StorePageOption[];
  operatingStatusOptions: StorePageOption[];
  priceLevelOptions: StorePageOption[];

  onClose?: () => void;
};

type FilterSectionProps = {
  title: string;
  icon: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
};

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
  city: true,
  district: false,
  province: false,
  operatingStatus: false,
  rating: false,
  price: false,
  sort: true,
};

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
      className={`flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition ${
        checked
          ? "border-primary-200 bg-primary-50 text-primary-800"
          : "border-transparent text-gray-600 hover:bg-gray-50"
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 shrink-0 accent-primary-800"
        />

        <span className="truncate text-[16px] leading-6">{label}</span>
      </span>

      {typeof count === "number" && (
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[16px] ${
            checked ? "bg-white text-primary-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {count}
        </span>
      )}
    </label>
  );
}

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
      className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
        checked
          ? "border-primary-200 bg-primary-50 text-primary-800"
          : "border-transparent text-gray-600 hover:bg-gray-50"
      }`}
    >
      <input
        type="radio"
        name="store-sort"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 accent-primary-800"
      />

      <span className="text-[16px] leading-6">{label}</span>
    </label>
  );
}

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
      <p className="rounded-xl bg-gray-50 px-3 py-4 text-[16px] text-gray-400">
        មិនមានទិន្នន័យសម្រាប់តម្រងនេះទេ។
      </p>
    );
  }

  return (
    <div className="max-h-[240px] space-y-1 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300">
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

export default function StoreFilters({
  filters,
  onChange,
  cityOptions,
  districtOptions,
  provinceOptions,
  operatingStatusOptions,
  priceLevelOptions,
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

  const collapsedItems = [
    {
      key: "status",
      label: "ស្ថានភាព",
      icon: <FaStore />,
    },
    {
      key: "city",
      label: "ទីក្រុង",
      icon: <IoLocationOutline />,
    },
    {
      key: "district",
      label: "ខណ្ឌ ឬស្រុក",
      icon: <IoLocationOutline />,
    },
    {
      key: "rating",
      label: "ការវាយតម្លៃ",
      icon: <FaStar />,
    },
    {
      key: "price",
      label: "តម្លៃ",
      icon: <IoPricetagOutline />,
    },
    {
      key: "sort",
      label: "តម្រៀប",
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
                  collapsed ? "Expand store filters" : "Collapse store filters"
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition hover:bg-primary-50 hover:text-primary-700"
              >
                <motion.span
                  animate={{
                    rotate: collapsed ? 180 : 0,
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
                onClick={() => onChange(DEFAULT_STORE_FILTERS)}
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
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-2 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300">
            <FilterSection
              title="ស្ថានភាពហាង"
              icon={<FaStore />}
              isOpen={openSections.status}
              onToggle={() => toggleSection("status")}
            >
              <div className="space-y-1">
                <CheckboxOption
                  label="បង្ហាញតែហាងដែលកំពុងបើក"
                  checked={filters.openNowOnly}
                  onChange={() =>
                    updateFilter("openNowOnly", !filters.openNowOnly)
                  }
                />

                <CheckboxOption
                  label="បានអនុម័ត"
                  checked={filters.approvedOnly}
                  onChange={() =>
                    updateFilter("approvedOnly", !filters.approvedOnly)
                  }
                />

                <CheckboxOption
                  label="គណនីសកម្ម"
                  checked={filters.activeOnly}
                  onChange={() =>
                    updateFilter("activeOnly", !filters.activeOnly)
                  }
                />
              </div>
            </FilterSection>

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

            <FilterSection
              title="ខណ្ឌ ឬស្រុក"
              icon={<IoLocationOutline />}
              isOpen={openSections.district}
              onToggle={() => toggleSection("district")}
            >
              <OptionList
                options={districtOptions}
                selectedValues={filters.districts}
                onToggle={(value) =>
                  updateFilter(
                    "districts",
                    toggleStoreFilterValue(filters.districts, value),
                  )
                }
              />
            </FilterSection>

            <FilterSection
              title="ខេត្ត"
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
                      className={`rounded-full border px-3 py-2 text-[16px] transition ${
                        selected
                          ? "border-primary-800 bg-primary-800 text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-primary-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </FilterSection>

            <FilterSection
              title="កម្រិតតម្លៃ"
              icon={<IoPricetagOutline />}
              isOpen={openSections.price}
              onToggle={() => toggleSection("price")}
            >
              <OptionList
                options={priceLevelOptions}
                selectedValues={filters.priceLevels}
                onToggle={(value) =>
                  updateFilter(
                    "priceLevels",
                    toggleStoreFilterValue(filters.priceLevels, value),
                  )
                }
              />
            </FilterSection>

            <FilterSection
              title="តម្រៀបតាម"
              icon={<IoSwapVerticalOutline />}
              isOpen={openSections.sort}
              onToggle={() => toggleSection("sort")}
            >
              <div className="space-y-2">
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
