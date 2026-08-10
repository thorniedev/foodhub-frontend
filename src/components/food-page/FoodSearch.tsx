"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import Fuse from "fuse.js";

import { AnimatePresence, motion } from "framer-motion";

import { IoClose, IoSearchOutline } from "react-icons/io5";

import { FaStar, FaStore } from "react-icons/fa";

import type { MenuItem } from "@/types/manu";

type FoodSearchProps = {
  menuItems: MenuItem[];
  value: string;
  onChange: (value: string) => void;
};

type ContextOption = {
  code: string;
  name: string;
  localName: string;
};

type SeasonalContext = ContextOption & {
  suitabilityScore: number;
  reasonText: string;
};

type EventContext = ContextOption & {
  relevanceScore: number;
  reasonText: string;
};

type ProvincePopularity = {
  provinceCode: string;
  provinceName: string;
  provinceLocalName: string;
  popularityScore: number;
  popularityRank?: number;
  isTraditionalToProvince: boolean;
  reasonText: string;
};

type WeatherContext = ContextOption & {
  suitabilityScore: number;
  reasonText: string;
};

type FoodOrigin = {
  countryCode: string;
  countryName: string;
  countryLocalName?: string;
  provinceCode?: string | null;
  provinceName?: string | null;
  provinceLocalName?: string | null;
  isTraditional: boolean;
};

type RecommendationContext = {
  seasons: SeasonalContext[];
  events: EventContext[];
  provincePopularity: ProvincePopularity[];
  suitableWeather: WeatherContext[];
};

type SearchableMenuItem = MenuItem & {
  origin?: FoodOrigin;
  recommendationContext?: RecommendationContext;
};

type SearchDocument = {
  food: SearchableMenuItem;

  uuid: string;
  name: string;
  localName: string;

  storeName: string;
  storeLocalName: string;

  category: string;
  cuisine: string;

  searchableText: string;
};

function normalizeSearchText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim().toLowerCase().normalize("NFKC");
}

function formatPriceSearchTerms(food: SearchableMenuItem): string[] {
  const price = food.price;

  return [
    String(price),
    price.toFixed(2),
    `$${price}`,
    `$${price.toFixed(2)}`,
    `${price} ${food.currencyCode}`,
    `${price.toFixed(2)} ${food.currencyCode}`,
    food.currencyCode,

    // Useful phrases
    `price ${price}`,
    `price ${price.toFixed(2)}`,
    `តម្លៃ ${price}`,
    `តម្លៃ ${price.toFixed(2)}`,
  ];
}

function createSearchDocument(food: SearchableMenuItem): SearchDocument {
  const searchableValues: unknown[] = [
    // IDs
    food.uuid,
    food.legacyId,

    // Food names and descriptions
    food.name,
    food.localName,
    food.description,
    food.localDescription,
    food.source,

    // Price
    ...formatPriceSearchTerms(food),

    // General status
    food.availabilityStatus,
    food.isFeatured ? "featured recommended popular" : "",

    // Preparation
    food.preparationTimeMinutes,
    `${food.preparationTimeMinutes} min`,
    `${food.preparationTimeMinutes} minutes`,
    `${food.preparationTimeMinutes} នាទី`,
    `preparation ${food.preparationTimeMinutes}`,
    `time ${food.preparationTimeMinutes}`,

    // Distance
    food.distanceKm,
    `${food.distanceKm} km`,
    `${food.distanceKm} kilometer`,
    `distance ${food.distanceKm}`,
    `ចម្ងាយ ${food.distanceKm}`,

    // Store
    food.store.uuid,
    food.store.name,
    food.store.localName,
    food.store.addressLine,
    food.store.district,
    food.store.city,
    food.store.operatingStatus,
    food.store.averageRating,
    `${food.store.averageRating} rating`,
    `${food.store.averageRating} stars`,
    food.store.totalReviews,
    `${food.store.totalReviews} reviews`,
    food.store.latitude,
    food.store.longitude,

    // Food classification
    food.food.uuid,
    food.food.canonicalName,
    food.food.category.code,
    food.food.category.name,
    food.food.cuisine.code,
    food.food.cuisine.name,

    // Spice
    food.food.spiceLevel,
    `spice ${food.food.spiceLevel}`,
    `spice level ${food.food.spiceLevel}`,
    `កម្រិតហឹរ ${food.food.spiceLevel}`,

    // Ingredients and beverages
    ...food.ingredients,
    ...(food.beveragePairings ?? []),

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
    ...(food.food.ageGroups ?? []).flatMap((ageGroup) => [
      ageGroup.code,
      ageGroup.name,
    ]),

    // Nutrition
    food.nutrition?.calories,
    food.nutrition ? `${food.nutrition.calories} calories` : "",
    food.nutrition ? `${food.nutrition.calories} kcal` : "",
    food.nutrition ? `calories ${food.nutrition.calories}` : "",

    food.nutrition?.protein,
    food.nutrition ? `${food.nutrition.protein} protein` : "",
    food.nutrition ? `${food.nutrition.protein}g protein` : "",

    food.nutrition?.carbohydrate,
    food.nutrition ? `${food.nutrition.carbohydrate} carbohydrate` : "",
    food.nutrition ? `${food.nutrition.carbohydrate} carbs` : "",
    food.nutrition ? `${food.nutrition.carbohydrate}g carbs` : "",

    food.nutrition?.fat,
    food.nutrition ? `${food.nutrition.fat} fat` : "",
    food.nutrition ? `${food.nutrition.fat}g fat` : "",

    food.nutrition?.fiber,
    food.nutrition ? `${food.nutrition.fiber} fiber` : "",
    food.nutrition ? `${food.nutrition.fiber}g fiber` : "",

    food.nutrition?.sodium,
    food.nutrition ? `${food.nutrition.sodium} sodium` : "",
    food.nutrition ? `${food.nutrition.sodium}mg sodium` : "",

    // Recommendation
    food.recommendation.isRecommended ? "recommended AI recommendation" : "",

    food.recommendation.rankPosition,
    food.recommendation.finalScore,
    `${Math.round(food.recommendation.finalScore * 100)}% match`,

    food.recommendation.safetyStatus,
    food.recommendation.candidateSource,
    food.recommendation.reasonText,

    ...food.recommendation.reasonCodes,

    // Recommendation score breakdown
    food.recommendation.scoreBreakdown.mealMatch,

    food.recommendation.scoreBreakdown.cuisineMatch,

    food.recommendation.scoreBreakdown.budgetMatch,

    food.recommendation.scoreBreakdown.distanceMatch,

    food.recommendation.scoreBreakdown.popularity,

    // Food origin
    food.origin?.countryCode,
    food.origin?.countryName,
    food.origin?.countryLocalName,
    food.origin?.provinceCode,
    food.origin?.provinceName,
    food.origin?.provinceLocalName,
    food.origin?.isTraditional ? "traditional food ម្ហូបប្រពៃណី" : "",

    // Cambodian seasons
    ...(food.recommendationContext?.seasons ?? []).flatMap((season) => [
      season.code,
      season.name,
      season.localName,
      season.reasonText,
      season.suitabilityScore,
      `${Math.round(season.suitabilityScore * 100)}% season match`,
    ]),

    // Festivals and events
    ...(food.recommendationContext?.events ?? []).flatMap((event) => [
      event.code,
      event.name,
      event.localName,
      event.reasonText,
      event.relevanceScore,
      `${Math.round(event.relevanceScore * 100)}% event match`,
    ]),

    // Popularity by province
    ...(food.recommendationContext?.provincePopularity ?? []).flatMap(
      (province) => [
        province.provinceCode,
        province.provinceName,
        province.provinceLocalName,
        province.reasonText,
        province.popularityScore,
        province.popularityRank,
        province.isTraditionalToProvince
          ? "traditional in province ម្ហូបប្រពៃណីតាមខេត្ត"
          : "",
        `${Math.round(province.popularityScore * 100)}% province popularity`,
      ],
    ),

    // Suitable weather
    ...(food.recommendationContext?.suitableWeather ?? []).flatMap(
      (weather) => [
        weather.code,
        weather.name,
        weather.localName,
        weather.reasonText,
        weather.suitabilityScore,
        `${Math.round(weather.suitabilityScore * 100)}% weather match`,
      ],
    ),
  ];

  return {
    food,

    uuid: food.uuid,

    name: normalizeSearchText(food.name),

    localName: normalizeSearchText(food.localName),

    storeName: normalizeSearchText(food.store.name),

    storeLocalName: normalizeSearchText(
      food.store.localName ?? food.store.name,
    ),

    category: normalizeSearchText(food.food.category.name),

    cuisine: normalizeSearchText(food.food.cuisine.name),

    searchableText: searchableValues
      .map(normalizeSearchText)
      .filter(Boolean)
      .join(" "),
  };
}

export default function FoodSearch({
  menuItems,
  value,
  onChange,
}: FoodSearchProps) {
  const [isFocused, setIsFocused] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const searchDocuments = useMemo(
    () => (menuItems as SearchableMenuItem[]).map(createSearchDocument),
    [menuItems],
  );

  const fuse = useMemo(
    () =>
      new Fuse(searchDocuments, {
        includeScore: true,
        includeMatches: true,

        threshold: 0.35,
        ignoreLocation: true,
        minMatchCharLength: 1,

        keys: [
          {
            name: "localName",
            weight: 1,
          },
          {
            name: "name",
            weight: 1,
          },
          {
            name: "storeLocalName",
            weight: 0.9,
          },
          {
            name: "storeName",
            weight: 0.9,
          },
          {
            name: "category",
            weight: 0.8,
          },
          {
            name: "cuisine",
            weight: 0.8,
          },
          {
            name: "searchableText",
            weight: 0.65,
          },
        ],
      }),
    [searchDocuments],
  );

  const suggestions = useMemo(() => {
    const query = normalizeSearchText(value);

    if (!query) {
      return [];
    }

    return fuse
      .search(query)
      .slice(0, 8)
      .map((result) => ({
        food: result.item.food,
        score: result.score ?? 1,
      }));
  }, [fuse, value]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const showSuggestions = isFocused && value.trim().length > 0;

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <div className="flex min-h-[56px] items-center gap-3 rounded-full border border-gray-200 bg-white px-5 transition focus-within:border-primary-700 focus-within:ring-4 focus-within:ring-primary-50">
        <IoSearchOutline className="shrink-0 text-[22px] text-primary-700" />

        <input
          type="search"
          value={value}
          onFocus={() => setIsFocused(true)}
          onChange={(event) => onChange(event.target.value)}
          placeholder="ស្វែងរកម្ហូប តម្លៃ រដូវ បុណ្យ ខេត្ត អាកាសធាតុ ឬទីតាំង..."
          aria-label="Search all food information"
          autoComplete="off"
          className="w-full bg-transparent text-[16px] text-gray-700 dark:text-gray-100 outline-none placeholder:text-gray-400"
        />

        {/* {value && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              onChange("");
              setIsFocused(false);
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-red-50 hover:text-red-500"
          >
            <IoClose className="text-[20px]" />
          </button>
        )} */}
      </div>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -8,
              scale: 0.98,
            }}
            transition={{
              duration: 0.2,
            }}
            className="absolute left-0 right-0 top-[64px] z-50 overflow-hidden rounded-[22px] border border-gray-100 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.14)]"
          >
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="text-[16px] font-semibold text-primary-900">
                លទ្ធផលស្វែងរក
              </p>

              <p className="mt-1 text-[16px] text-gray-500">
                រកឃើញ {suggestions.length} ជម្រើសសម្រាប់ “{value}”
              </p>
            </div>

            {suggestions.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <IoSearchOutline className="mx-auto text-[34px] text-gray-300" />

                <p className="mt-3 text-[16px] font-medium text-gray-600">
                  រកមិនឃើញលទ្ធផល
                </p>

                <p className="mt-1 text-[16px] leading-7 text-gray-400">
                  សូមសាកល្បងឈ្មោះ តម្លៃ រដូវកាល បុណ្យ ខេត្ត អាកាសធាតុ
                  ឬទីតាំងផ្សេងទៀត។
                </p>
              </div>
            ) : (
              <div
                className="
                  max-h-[430px]
                  overflow-y-auto
                  p-2
                  [scrollbar-width:thin]
                  [scrollbar-color:#d1d5db_transparent]
                  [&::-webkit-scrollbar]:w-1.5
                  [&::-webkit-scrollbar-track]:bg-transparent
                  [&::-webkit-scrollbar-thumb]:rounded-full
                  [&::-webkit-scrollbar-thumb]:bg-gray-300
                "
              >
                {suggestions.map(({ food, score }) => (
                  <Link
                    key={food.uuid}
                    href={`/food/${food.uuid}`}
                    onClick={() => setIsFocused(false)}
                    className="flex items-center gap-3 rounded-[16px] p-3 transition hover:bg-primary-50"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[14px] bg-gray-100">
                      <Image
                        fill
                        src={food.thumbnail ?? "/images/placeholder-food.webp"}
                        alt={food.localName || food.name}
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[16px] font-semibold text-primary-900">
                            {food.localName || food.name}
                          </p>

                          <div className="mt-1 flex items-center gap-2 text-[16px] text-gray-500">
                            <FaStore className="shrink-0 text-secondary-500" />

                            <span className="truncate">
                              {food.store.localName ?? food.store.name}
                            </span>
                          </div>
                        </div>

                        <p className="shrink-0 text-[16px] dark:text-[#22a447] font-semibold text-primary-800 dark:text-primary-dark">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: food.currencyCode || "USD",
                          }).format(food.price)}
                        </p>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[16px]">
                        <span className="flex items-center gap-1 text-yellow-500">
                          <FaStar />

                          {food.store.averageRating}
                        </span>

                        <span className="text-gray-500">
                          {food.food.category.name}
                        </span>

                        <span className="text-gray-500">
                          {food.distanceKm} km
                        </span>

                        <span className="text-gray-400">
                          {Math.max(0, Math.round((1 - score) * 100))}% match
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}