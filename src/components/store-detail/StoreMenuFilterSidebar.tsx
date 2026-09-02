"use client";

import { useMemo, useState, type ReactNode } from "react";

import { AnimatePresence, motion } from "framer-motion";

import {
  IoChevronBack,
  IoChevronDown,
  IoNutritionOutline,
  IoPricetagOutline,
  IoSearchOutline,
  IoSwapVerticalOutline,
  IoTimeOutline,
} from "react-icons/io5";

import { FaFire } from "react-icons/fa";
import { MdOutlineCategory } from "react-icons/md";

import {
  DEFAULT_STORE_MENU_FILTERS,
  STORE_MENU_PREPARATION_OPTIONS,
  countActiveStoreMenuFilters,
  normalizeStoreMenuText,
  toggleStoreMenuFilterValue,
  toggleStoreMenuNumericFilterValue,
} from "@/lib/store-menu-filter";
import { isDrinkCategory, isFoodCategory, type CategoryFilterType } from "@/lib/category-filter";

import type {
  StoreMenuFilterOptions,
  StoreMenuFilterState,
  StoreMenuPriceTier,
  StoreMenuSortBy,
} from "@/types/store-menu-filter";

type StoreMenuFilterSidebarProps = {
  filters: StoreMenuFilterState;
  options: StoreMenuFilterOptions;

  onChange: (filters: StoreMenuFilterState) => void;

  onClose?: () => void;

  mobile?: boolean;
};

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
        <span className="flex items-center gap-2 text-[18px] font-semibold text-primary-900">
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
              duration: 0.24,
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

        <span className="truncate text-[18px] text-gray-600">{label}</span>
      </span>

      {typeof count === "number" && (
        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[16px] text-gray-500">
          {count}
        </span>
      )}
    </label>
  );
}

function OptionList({
  options,
  selected,
  onToggle,
}: {
  options: Array<{
    code: string;
    name: string;
    count: number;
  }>;

  selected: string[];

  onToggle: (value: string) => void;
}) {
  return (
    <div className="max-h-[240px] space-y-1 overflow-y-auto pr-1">
      {options.map((option) => (
        <CheckboxOption
          key={option.code}
          label={option.name}
          count={option.count}
          checked={selected.includes(option.code)}
          onChange={() => onToggle(option.code)}
        />
      ))}
    </div>
  );
}

function SingleChoice<T extends string | number>({
  options,
  selected,
  onChange,
}: {
  options: Array<{
    value: T;
    label: string;
  }>;

  selected: T | null;

  onChange: (value: T | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected === option.value;

        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(isSelected ? null : option.value)}
            className={`rounded-full border px-3 py-2 text-[18px] transition ${
              isSelected
                ? "border-primary-800 bg-primary-800 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-primary-400 hover:bg-primary-50"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default function StoreMenuFilterSidebar({
  filters,
  options,
  onChange,
  onClose,
  mobile = false,
}: StoreMenuFilterSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const [categoryQuery, setCategoryQuery] = useState("");
  const [categoryType, setCategoryType] = useState<CategoryFilterType>("ALL");

  const [ingredientQuery, setIngredientQuery] = useState("");

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sort: true,
    category: true,
    cuisine: false,
    mealType: true,
    dietary: false,
    age: false,
    allergens: false,
    spice: false,
    preparation: false,
    ingredients: false,
    price: true,
    context: false,
    availability: true,
  });

  const activeFilterCount = countActiveStoreMenuFilters(filters);

  const visibleCategories = useMemo(() => {
    let list = options.categories;
    if (categoryType === "FOOD") {
      list = list.filter((cat) => isFoodCategory(cat));
    } else if (categoryType === "DRINK") {
      list = list.filter((cat) => isDrinkCategory(cat));
    }
    if (categoryQuery.trim()) {
      const q = normalizeStoreMenuText(categoryQuery);
      list = list.filter((cat) => normalizeStoreMenuText(cat.name).includes(q));
    }
    return list;
  }, [categoryQuery, categoryType, options.categories]);

  const visibleIngredients = useMemo(
    () =>
      options.ingredients.filter((option) =>
        normalizeStoreMenuText(option.name).includes(
          normalizeStoreMenuText(ingredientQuery),
        ),
      ),
    [ingredientQuery, options.ingredients],
  );

  const toggleSection = (key: string) => {
    setOpenSections((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const content = (
    <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm">
      {/* Header */}

      <div
        className={`shrink-0 border-b border-gray-100 ${
          collapsed && !mobile ? "p-3" : "p-5"
        }`}
      >
        <div
          className={`flex items-center ${
            collapsed && !mobile ? "justify-center" : "justify-between"
          }`}
        >
          {(!collapsed || mobile) && (
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[26px] font-semibold text-primary-900">
                  តម្រងម្ហូប
                </p>

                {activeFilterCount > 0 && (
                  <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-secondary-500 px-2 text-[16px] font-semibold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </div>

              <p className="mt-1 text-[18px] leading-7 text-gray-400">
                ជ្រើសរើសម្ហូបក្នុងហាងនេះ
              </p>
            </div>
          )}

          {mobile ? (
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-[24px] text-gray-500"
              aria-label="Close food filters"
            >
              ×
            </button>
          ) : (
            <motion.button
              type="button"
              onClick={() => setCollapsed((previous) => !previous)}
              whileTap={{
                scale: 0.9,
              }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition hover:bg-primary-50 hover:text-primary-700"
              aria-label={collapsed ? "Expand filters" : "Collapse filters"}
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

        {(!collapsed || mobile) && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
            <p className="text-[18px] text-gray-500">
              {activeFilterCount} តម្រងបានជ្រើស
            </p>

            <button
              type="button"
              disabled={activeFilterCount === 0}
              onClick={() =>
                onChange({
                  ...DEFAULT_STORE_MENU_FILTERS,
                  query: filters.query,
                })
              }
              className="text-[18px] font-medium text-secondary-500 transition hover:underline disabled:cursor-not-allowed disabled:opacity-40"
            >
              សម្អាត
            </button>
          </div>
        )}
      </div>

      {collapsed && !mobile ? (
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
              key: "dietary",
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
              onClick={() => {
                setCollapsed(false);

                setOpenSections((previous) => ({
                  ...previous,
                  [item.key]: true,
                }));
              }}
              whileHover={{
                scale: 1.08,
              }}
              whileTap={{
                scale: 0.9,
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full text-[21px] text-primary-700"
            >
              {item.icon}
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-2 [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300">
          {/* Sort */}

          <FilterSection
            title="តម្រៀបតាម"
            icon={<IoSwapVerticalOutline />}
            isOpen={openSections.sort}
            onToggle={() => toggleSection("sort")}
          >
            <div className="flex flex-col gap-2">
              {[
                {
                  value: "featured",
                  label: "មុខម្ហូបពិសេស",
                },
                ...(options.hasRecommendationData
                  ? [
                      {
                        value: "recommended",
                        label: "ណែនាំសម្រាប់អ្នក",
                      },
                    ]
                  : []),
                {
                  value: "fastest",
                  label: "រៀបចំលឿនបំផុត",
                },
                {
                  value: "name",
                  label: "តាមឈ្មោះ",
                },
                {
                  value: "price-low",
                  label: "តម្លៃទាបទៅខ្ពស់",
                },
                {
                  value: "price-high",
                  label: "តម្លៃខ្ពស់ទៅទាប",
                },
              ].map((option) => {
                const selected = filters.sortBy === option.value;

                return (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                      selected
                        ? "border-primary-200 bg-primary-50 text-primary-800"
                        : "border-transparent text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={
                        mobile
                          ? "store-menu-sort-mobile"
                          : "store-menu-sort-desktop"
                      }
                      checked={selected}
                      onChange={() =>
                        onChange({
                          ...filters,
                          sortBy: option.value as StoreMenuSortBy,
                        })
                      }
                      className="h-4 w-4 accent-primary-800"
                    />

                    <span className="text-[18px]">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </FilterSection>

          {/* Category */}

          {options.categories.length > 0 && (
            <FilterSection
              title="ប្រភេទម្ហូប និងភេសជ្ជៈ"
              icon={<MdOutlineCategory />}
              isOpen={openSections.category}
              onToggle={() => toggleSection("category")}
            >
              {/* Category Type Pills */}
              <div className="mb-3 flex items-center rounded-xl bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setCategoryType("ALL")}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                    categoryType === "ALL"
                      ? "bg-white text-primary-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  ទាំងអស់
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryType("FOOD")}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                    categoryType === "FOOD"
                      ? "bg-white text-primary-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  ម្ហូប
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryType("DRINK")}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                    categoryType === "DRINK"
                      ? "bg-white text-primary-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  ភេសជ្ជៈ
                </button>
              </div>

              {/* Keep Searchbox */}
              <div className="mb-3 flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3">
                <IoSearchOutline className="shrink-0 text-[20px] text-gray-400" />

                <input
                  value={categoryQuery}
                  onChange={(event) => setCategoryQuery(event.target.value)}
                  placeholder={
                    categoryType === "FOOD"
                      ? "ស្វែងរកប្រភេទម្ហូប"
                      : categoryType === "DRINK"
                        ? "ស្វែងរកប្រភេទភេសជ្ជៈ"
                        : "ស្វែងរកប្រភេទម្ហូប ឬភេសជ្ជៈ"
                  }
                  className="w-full bg-transparent text-[18px] text-gray-600 outline-none placeholder:text-gray-400"
                />
              </div>

              <OptionList
                options={visibleCategories}
                selected={filters.categoryCodes}
                onToggle={(value) =>
                  onChange({
                    ...filters,
                    categoryCodes: toggleStoreMenuFilterValue(
                      filters.categoryCodes,
                      value,
                    ),
                  })
                }
              />
            </FilterSection>
          )}

          {/* Cuisine */}

          {options.cuisines.length > 0 && (
            <FilterSection
              title="ម្ហូបតាមប្រទេស"
              icon={<MdOutlineCategory />}
              isOpen={openSections.cuisine}
              onToggle={() => toggleSection("cuisine")}
            >
              <OptionList
                options={options.cuisines}
                selected={filters.cuisineCodes}
                onToggle={(value) =>
                  onChange({
                    ...filters,
                    cuisineCodes: toggleStoreMenuFilterValue(
                      filters.cuisineCodes,
                      value,
                    ),
                  })
                }
              />
            </FilterSection>
          )}

          {/* Meal Type */}

          {options.mealTypes.length > 0 && (
            <FilterSection
              title="ពេលទទួលទាន"
              icon={<IoTimeOutline />}
              isOpen={openSections.mealType}
              onToggle={() => toggleSection("mealType")}
            >
              <OptionList
                options={options.mealTypes}
                selected={filters.mealTypeCodes}
                onToggle={(value) =>
                  onChange({
                    ...filters,
                    mealTypeCodes: toggleStoreMenuFilterValue(
                      filters.mealTypeCodes,
                      value,
                    ),
                  })
                }
              />
            </FilterSection>
          )}

          {/* Dietary */}

          {options.dietaryTypes.length > 0 && (
            <FilterSection
              title="របបអាហារ"
              icon={<IoNutritionOutline />}
              isOpen={openSections.dietary}
              onToggle={() => toggleSection("dietary")}
            >
              <OptionList
                options={options.dietaryTypes}
                selected={filters.dietaryTypeCodes}
                onToggle={(value) =>
                  onChange({
                    ...filters,
                    dietaryTypeCodes: toggleStoreMenuFilterValue(
                      filters.dietaryTypeCodes,
                      value,
                    ),
                  })
                }
              />
            </FilterSection>
          )}

          {/* Age */}

          {options.ageGroups.length > 0 && (
            <FilterSection
              title="ក្រុមអាយុ"
              icon={<IoNutritionOutline />}
              isOpen={openSections.age}
              onToggle={() => toggleSection("age")}
            >
              <OptionList
                options={options.ageGroups}
                selected={filters.ageGroupCodes}
                onToggle={(value) =>
                  onChange({
                    ...filters,
                    ageGroupCodes: toggleStoreMenuFilterValue(
                      filters.ageGroupCodes,
                      value,
                    ),
                  })
                }
              />
            </FilterSection>
          )}

          {/* Allergens */}

          {options.allergens.length > 0 && (
            <FilterSection
              title="ជៀសវាងអាឡែស៊ី"
              icon={<IoNutritionOutline />}
              isOpen={openSections.allergens}
              onToggle={() => toggleSection("allergens")}
            >
              <p className="mb-3 text-[18px] leading-7 text-secondary-600">
                មុខម្ហូបដែលមានអាឡែស៊ីដែលអ្នកជ្រើសនឹងត្រូវដកចេញ។
              </p>

              <OptionList
                options={options.allergens}
                selected={filters.excludedAllergenCodes}
                onToggle={(value) =>
                  onChange({
                    ...filters,
                    excludedAllergenCodes: toggleStoreMenuFilterValue(
                      filters.excludedAllergenCodes,
                      value,
                    ),
                  })
                }
              />
            </FilterSection>
          )}

          {/* Spice */}

          {options.spiceLevels.length > 0 && (
            <FilterSection
              title="កម្រិតហឹរ"
              icon={<FaFire />}
              isOpen={openSections.spice}
              onToggle={() => toggleSection("spice")}
            >
              <div className="space-y-1">
                {options.spiceLevels.map((option) => (
                  <CheckboxOption
                    key={option.value}
                    label={option.label}
                    count={option.count}
                    checked={filters.spiceLevels.includes(option.value)}
                    onChange={() =>
                      onChange({
                        ...filters,
                        spiceLevels: toggleStoreMenuNumericFilterValue(
                          filters.spiceLevels,
                          option.value,
                        ),
                      })
                    }
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {/* Preparation */}

          {options.hasPreparationTimeData && (
            <FilterSection
              title="ពេលរៀបចំ"
              icon={<IoTimeOutline />}
              isOpen={openSections.preparation}
              onToggle={() => toggleSection("preparation")}
            >
              <SingleChoice
                options={[...STORE_MENU_PREPARATION_OPTIONS]}
                selected={filters.maximumPreparationMinutes}
                onChange={(value) =>
                  onChange({
                    ...filters,
                    maximumPreparationMinutes: value,
                  })
                }
              />
            </FilterSection>
          )}

          {/* Ingredients */}

          {options.ingredients.length > 0 && (
            <FilterSection
              title="គ្រឿងផ្សំ"
              icon={<IoNutritionOutline />}
              isOpen={openSections.ingredients}
              onToggle={() => toggleSection("ingredients")}
            >
              <div className="mb-3 flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3">
                <IoSearchOutline className="shrink-0 text-[20px] text-gray-400" />

                <input
                  value={ingredientQuery}
                  onChange={(event) => setIngredientQuery(event.target.value)}
                  placeholder="ស្វែងរកគ្រឿងផ្សំ"
                  className="w-full bg-transparent text-[18px] text-gray-600 outline-none placeholder:text-gray-400"
                />
              </div>

              <OptionList
                options={visibleIngredients}
                selected={filters.ingredientNames}
                onToggle={(value) =>
                  onChange({
                    ...filters,
                    ingredientNames: toggleStoreMenuFilterValue(
                      filters.ingredientNames,
                      value,
                    ),
                  })
                }
              />
            </FilterSection>
          )}

          {/* Price */}

          <FilterSection
            title="តម្លៃ"
            icon={<IoPricetagOutline />}
            isOpen={openSections.price}
            onToggle={() => toggleSection("price")}
          >
            <SingleChoice<Exclude<StoreMenuPriceTier, null>>
              options={[
                {
                  value: "$",
                  label: "$",
                },
                {
                  value: "$$",
                  label: "$$",
                },
                {
                  value: "$$$",
                  label: "$$$",
                },
              ]}
              selected={filters.priceTier}
              onChange={(value) =>
                onChange({
                  ...filters,
                  priceTier: value,
                })
              }
            />
          </FilterSection>

          {/* Contextual */}

          {(options.seasons.length > 0 ||
            options.events.length > 0 ||
            options.weather.length > 0 ||
            options.originCountries.length > 0 ||
            options.hasTraditionalData) && (
            <FilterSection
              title="បរិបទណែនាំ"
              icon={<MdOutlineCategory />}
              isOpen={openSections.context}
              onToggle={() => toggleSection("context")}
            >
              <div className="space-y-5">
                {options.seasons.length > 0 && (
                  <div>
                    <p className="mb-2 text-[18px] font-semibold text-gray-600">
                      រដូវកាល
                    </p>

                    <OptionList
                      options={options.seasons}
                      selected={filters.seasonCodes}
                      onToggle={(value) =>
                        onChange({
                          ...filters,
                          seasonCodes: toggleStoreMenuFilterValue(
                            filters.seasonCodes,
                            value,
                          ),
                        })
                      }
                    />
                  </div>
                )}

                {options.events.length > 0 && (
                  <div>
                    <p className="mb-2 text-[18px] font-semibold text-gray-600">
                      ឱកាស និងព្រឹត្តិការណ៍
                    </p>

                    <OptionList
                      options={options.events}
                      selected={filters.eventCodes}
                      onToggle={(value) =>
                        onChange({
                          ...filters,
                          eventCodes: toggleStoreMenuFilterValue(
                            filters.eventCodes,
                            value,
                          ),
                        })
                      }
                    />
                  </div>
                )}

                {options.weather.length > 0 && (
                  <div>
                    <p className="mb-2 text-[18px] font-semibold text-gray-600">
                      អាកាសធាតុសមស្រប
                    </p>

                    <OptionList
                      options={options.weather}
                      selected={filters.weatherCodes}
                      onToggle={(value) =>
                        onChange({
                          ...filters,
                          weatherCodes: toggleStoreMenuFilterValue(
                            filters.weatherCodes,
                            value,
                          ),
                        })
                      }
                    />
                  </div>
                )}

                {options.originCountries.length > 0 && (
                  <div>
                    <p className="mb-2 text-[18px] font-semibold text-gray-600">
                      ប្រភពដើម
                    </p>

                    <OptionList
                      options={options.originCountries}
                      selected={filters.originCountryCodes}
                      onToggle={(value) =>
                        onChange({
                          ...filters,
                          originCountryCodes: toggleStoreMenuFilterValue(
                            filters.originCountryCodes,
                            value,
                          ),
                        })
                      }
                    />
                  </div>
                )}

                {options.hasTraditionalData && (
                  <CheckboxOption
                    label="ម្ហូបប្រពៃណី"
                    checked={filters.traditionalOnly}
                    onChange={() =>
                      onChange({
                        ...filters,
                        traditionalOnly: !filters.traditionalOnly,
                      })
                    }
                  />
                )}
              </div>
            </FilterSection>
          )}

          {/* Availability */}

          <FilterSection
            title="ស្ថានភាព"
            icon={<IoNutritionOutline />}
            isOpen={openSections.availability}
            onToggle={() => toggleSection("availability")}
          >
            <div className="space-y-1">
              <CheckboxOption
                label="មានលក់បច្ចុប្បន្ន"
                checked={filters.availabilityOnly}
                onChange={() =>
                  onChange({
                    ...filters,
                    availabilityOnly: !filters.availabilityOnly,
                  })
                }
              />

              <CheckboxOption
                label="មុខម្ហូបពិសេស"
                checked={filters.featuredOnly}
                onChange={() =>
                  onChange({
                    ...filters,
                    featuredOnly: !filters.featuredOnly,
                  })
                }
              />
            </div>
          </FilterSection>
        </div>
      )}
    </div>
  );

  if (mobile) {
    return content;
  }

  return (
    <motion.aside
      animate={{
        width: collapsed ? 78 : 300,
      }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 34,
      }}
      className="sticky top-24 hidden h-[calc(100dvh-7rem)] shrink-0 self-start xl:block"
    >
      {content}
    </motion.aside>
  );
}
