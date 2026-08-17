import type { LocationStore } from "@/types/location-store";
import type { MenuItem } from "@/types/manu";
import type {
  LocationFoodFilterState,
  LocationFoodPriceTier,
} from "@/types/location-food-filter";
import { DEFAULT_LOCATION_FOOD_FILTERS } from "@/types/location-food-filter";

type RecommendationContextOption = {
  code?: string;
  name?: string;
  localName?: string;
  reasonText?: string;
};

type ProvincePopularity = {
  provinceCode?: string;
  provinceName?: string;
  provinceLocalName?: string;
  reasonText?: string;
};

type FoodOrigin = {
  provinceCode?: string | null;
  provinceName?: string | null;
  provinceLocalName?: string | null;
};

type MenuItemWithContext = MenuItem & {
  origin?: FoodOrigin;
  recommendationContext?: {
    seasons?: RecommendationContextOption[];
    events?: RecommendationContextOption[];
    provincePopularity?: ProvincePopularity[];
    suitableWeather?: RecommendationContextOption[];
  };
};

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKC");
}

function matchesPriceTier(price: number, tier: LocationFoodPriceTier): boolean {
  if (!tier) return true;
  if (tier === "$") return price < 3;
  if (tier === "$$") return price >= 3 && price < 6;
  return price >= 6;
}

function matchesSearch(food: MenuItem, query: string): boolean {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) return true;

  const contextFood = food as MenuItemWithContext;
  const context = contextFood.recommendationContext;

  const searchableValues: unknown[] = [
    food.name,
    food.localName,
    food.description,
    food.localDescription,
    food.source,
    food.price,
    `${food.price}`,
    `$${food.price}`,
    food.currencyCode,
    food.preparationTimeMinutes,
    `${food.preparationTimeMinutes} min`,
    food.distanceKm,
    `${food.distanceKm} km`,
    food.nutrition?.calories,
    food.nutrition?.protein,
    food.store?.averageRating,
    food.store?.name,
    food.store?.localName,
    food.store?.addressLine,
    food.store?.district,
    food.store?.city,
    food.store?.operatingStatus,
    food.food?.canonicalName,
    food.food?.category?.code,
    food.food?.category?.name,
    food.food?.cuisine?.code,
    food.food?.cuisine?.name,
    ...(food.ingredients ?? []),
    ...(food.beveragePairings ?? []),
    ...(food.mealTypes ?? []).flatMap((item) => [item.code, item.name]),
    ...(food.dietaryTypes ?? []).flatMap((item) => [
      item.code,
      item.name,
      item.verificationStatus,
    ]),
    ...(food.allergenDeclarations ?? []).flatMap((item) => [
      item.code,
      item.name,
      item.declarationType,
      item.riskLevel,
      item.verificationStatus,
    ]),
    ...(food.food?.ageGroups ?? []).flatMap((item) => [item.code, item.name]),
    ...(context?.seasons ?? []).flatMap((item) => [
      item.code,
      item.name,
      item.localName,
      item.reasonText,
    ]),
    ...(context?.events ?? []).flatMap((item) => [
      item.code,
      item.name,
      item.localName,
      item.reasonText,
    ]),
    ...(context?.provincePopularity ?? []).flatMap((item) => [
      item.provinceCode,
      item.provinceName,
      item.provinceLocalName,
      item.reasonText,
    ]),
    ...(context?.suitableWeather ?? []).flatMap((item) => [
      item.code,
      item.name,
      item.localName,
      item.reasonText,
    ]),
    contextFood.origin?.provinceCode,
    contextFood.origin?.provinceName,
    contextFood.origin?.provinceLocalName,
    food.recommendation?.reasonText,
    food.recommendation?.candidateSource,
    food.recommendation?.safetyStatus,
    ...(food.recommendation?.reasonCodes ?? []),
  ];

  return searchableValues.some((value) =>
    normalizeText(value).includes(normalizedQuery),
  );
}

export function filterLocationMenuItems(
  foods: MenuItem[],
  filters: LocationFoodFilterState,
): MenuItem[] {
  const safeFoods = Array.isArray(foods) ? foods : [];

  const filteredFoods = safeFoods.filter((food) => {
    if (filters.availabilityOnly && food.availabilityStatus !== "AVAILABLE") {
      return false;
    }

    if (filters.recommendedOnly && !food.recommendation?.isRecommended) {
      return false;
    }

    if (filters.featuredOnly && !food.isFeatured) {
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
      !(food.mealTypes ?? []).some((item) =>
        filters.mealTypeCodes.includes(item.code),
      )
    ) {
      return false;
    }

    if (
      filters.dietaryTypeCodes.length > 0 &&
      !(food.dietaryTypes ?? []).some((item) =>
        filters.dietaryTypeCodes.includes(item.code),
      )
    ) {
      return false;
    }

    if (
      filters.ageGroupCodes.length > 0 &&
      !(food.food.ageGroups ?? []).some((item) =>
        filters.ageGroupCodes.includes(item.code),
      )
    ) {
      return false;
    }

    if (
      filters.excludedAllergenCodes.length > 0 &&
      (food.allergenDeclarations ?? []).some((item) =>
        filters.excludedAllergenCodes.includes(item.code),
      )
    ) {
      return false;
    }

    if (
      filters.storeIds.length > 0 &&
      !filters.storeIds.includes(food.store.uuid)
    ) {
      return false;
    }

    if (
      filters.ingredientNames.length > 0 &&
      !filters.ingredientNames.every((selectedIngredient) =>
        (food.ingredients ?? []).some((ingredient) =>
          normalizeText(ingredient).includes(normalizeText(selectedIngredient)),
        ),
      )
    ) {
      return false;
    }

    const contextFood = food as MenuItemWithContext;
    const context = contextFood.recommendationContext;

    if (
      filters.seasonCodes.length > 0 &&
      !(context?.seasons ?? []).some((item) =>
        item.code ? filters.seasonCodes.includes(item.code) : false,
      )
    ) {
      return false;
    }

    if (
      filters.eventCodes.length > 0 &&
      !(context?.events ?? []).some((item) =>
        item.code ? filters.eventCodes.includes(item.code) : false,
      )
    ) {
      return false;
    }

    if (
      filters.provinceCodes.length > 0 &&
      !(context?.provincePopularity ?? []).some((item) =>
        item.provinceCode
          ? filters.provinceCodes.includes(item.provinceCode)
          : false,
      )
    ) {
      return false;
    }

    if (
      filters.weatherCodes.length > 0 &&
      !(context?.suitableWeather ?? []).some((item) =>
        item.code ? filters.weatherCodes.includes(item.code) : false,
      )
    ) {
      return false;
    }

    if (
      filters.originProvinceCodes.length > 0 &&
      (!contextFood.origin?.provinceCode ||
        !filters.originProvinceCodes.includes(contextFood.origin.provinceCode))
    ) {
      return false;
    }

    if (
      filters.spiceLevels.length > 0 &&
      !filters.spiceLevels.includes(food.food.spiceLevel)
    ) {
      return false;
    }

    if (!matchesPriceTier(food.price, filters.priceTier)) {
      return false;
    }

    if (
      filters.maximumPreparationMinutes !== null &&
      food.preparationTimeMinutes > filters.maximumPreparationMinutes
    ) {
      return false;
    }

    if (
      filters.minimumRating !== null &&
      food.store.averageRating < filters.minimumRating
    ) {
      return false;
    }

    if (
      filters.minimumRecommendationScore !== null &&
      food.recommendation.finalScore < filters.minimumRecommendationScore
    ) {
      return false;
    }

    if (filters.lowCalorieOnly && food.nutrition.calories >= 400) {
      return false;
    }

    if (filters.highProteinOnly && food.nutrition.protein < 25) {
      return false;
    }

    if (filters.lowFatOnly && food.nutrition.fat >= 10) {
      return false;
    }

    if (filters.highFiberOnly && food.nutrition.fiber < 5) {
      return false;
    }

    if (filters.lowSodiumOnly && food.nutrition.sodium >= 600) {
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
        // SingleRecommendation re-sorts this using live location distance.
        return 0;

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

export function countActiveLocationFoodFilters(
  filters: LocationFoodFilterState,
): number {
  const defaults = DEFAULT_LOCATION_FOOD_FILTERS;

  return (
    filters.categoryCodes.length +
    filters.cuisineCodes.length +
    filters.mealTypeCodes.length +
    filters.dietaryTypeCodes.length +
    filters.ageGroupCodes.length +
    filters.excludedAllergenCodes.length +
    filters.storeIds.length +
    filters.ingredientNames.length +
    filters.spiceLevels.length +
    filters.seasonCodes.length +
    filters.eventCodes.length +
    filters.provinceCodes.length +
    filters.weatherCodes.length +
    filters.originProvinceCodes.length +
    (filters.priceTier ? 1 : 0) +
    (filters.maximumPreparationMinutes !== null ? 1 : 0) +
    (filters.maximumDistanceKm !== defaults.maximumDistanceKm ? 1 : 0) +
    (filters.minimumRating !== null ? 1 : 0) +
    (filters.minimumRecommendationScore !== null ? 1 : 0) +
    (filters.recommendedOnly ? 1 : 0) +
    (filters.featuredOnly ? 1 : 0) +
    (filters.lowCalorieOnly ? 1 : 0) +
    (filters.highProteinOnly ? 1 : 0) +
    (filters.lowFatOnly ? 1 : 0) +
    (filters.highFiberOnly ? 1 : 0) +
    (filters.lowSodiumOnly ? 1 : 0)
  );
}

function isFiniteCoordinate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function deriveStoreFromFood(food: MenuItem): LocationStore | null {
  const source = food.store;

  if (
    !source?.uuid ||
    !isFiniteCoordinate(source.latitude) ||
    !isFiniteCoordinate(source.longitude)
  ) {
    return null;
  }

  const displayName =
    source.localName?.trim() || source.name?.trim() || "Store";

  return {
    uuid: source.uuid,
    storeName: displayName,
    description: source.name ?? null,
    addressLine: source.addressLine ?? "",
    commune: null,
    district: source.district ?? null,
    city: source.city ?? "",
    province: source.city ?? "",
    countryCode: "KH",
    postalCode: null,
    timezone: "Asia/Phnom_Penh",
    latitude: source.latitude,
    longitude: source.longitude,
    phoneNumber: null,
    email: null,
    logoMediaUuid: (source as { logoMediaUuid?: string | null }).logoMediaUuid ?? null,
    coverMediaUuid: (source as { coverMediaUuid?: string | null }).coverMediaUuid ?? null,
    logoUrl: source.logoUrl ?? null,
    coverImageUrl: source.coverImageUrl ?? null,
    priceLevel: null,
    hygieneRating: null,
    averageRating: source.averageRating ?? 0,
    totalReviews: source.totalReviews ?? 0,
    reviewStatus: "APPROVED",
    operatingStatus: source.operatingStatus ?? "UNKNOWN",
    accountStatus: "ACTIVE",
    isOpenNow: null,
    socialLinks: [],
    openingHours: [],
    externalSource: null,
  } as LocationStore;
}

export function buildLocationStoresForFoods(
  foods: MenuItem[],
  sourceStores: LocationStore[],
): LocationStore[] {
  const safeFoods = Array.isArray(foods) ? foods : [];
  const safeStores = Array.isArray(sourceStores) ? sourceStores : [];

  const allowedStoreIds = new Set(
    safeFoods.map((food) => food.store?.uuid).filter(Boolean),
  );

  const result = new Map<string, LocationStore>();

  safeStores.forEach((store) => {
    if (!allowedStoreIds.has(store.uuid)) return;

    if (
      !Number.isFinite(Number(store.latitude)) ||
      !Number.isFinite(Number(store.longitude))
    ) {
      return;
    }

    result.set(store.uuid, store);
  });

  safeFoods.forEach((food) => {
    const uuid = food.store?.uuid;
    if (!uuid || result.has(uuid)) return;

    const derived = deriveStoreFromFood(food);
    if (derived) result.set(uuid, derived);
  });

  return Array.from(result.values());
}
