import type {
  CatalogCodeName,
  CatalogMenuItem,
} from "@/types/catalog-menu-item";

import type {
  StoreMenuFilterOption,
  StoreMenuFilterOptions,
  StoreMenuFilterState,
  StoreMenuPriceTier,
} from "@/types/store-menu-filter";

export const DEFAULT_STORE_MENU_FILTERS: StoreMenuFilterState = {
  query: "",

  sortBy: "featured",

  categoryCodes: [],
  cuisineCodes: [],

  mealTypeCodes: [],
  dietaryTypeCodes: [],
  ageGroupCodes: [],

  seasonCodes: [],
  eventCodes: [],
  weatherCodes: [],
  originCountryCodes: [],

  excludedAllergenCodes: [],
  ingredientNames: [],

  spiceLevels: [],

  availabilityOnly: false,
  featuredOnly: false,
  traditionalOnly: false,

  priceTier: null,

  maximumPreparationMinutes: null,
};

export const STORE_MENU_PREPARATION_OPTIONS = [
  {
    value: 10,
    label: "10 នាទី ឬតិច",
  },
  {
    value: 20,
    label: "20 នាទី ឬតិច",
  },
  {
    value: 30,
    label: "30 នាទី ឬតិច",
  },
] as const;

export const STORE_MENU_SPICE_LABELS: Record<number, string> = {
  0: "មិនហឹរ",
  1: "ហឹរតិច",
  2: "ហឹរមធ្យម",
  3: "ហឹរខ្លាំង",
};

export function normalizeStoreMenuText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKC");
}

export function toggleStoreMenuFilterValue(
  values: string[],
  value: string,
): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function toggleStoreMenuNumericFilterValue(
  values: number[],
  value: number,
): number[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function getMealTypes(item: CatalogMenuItem): CatalogCodeName[] {
  return Array.isArray(item.food?.mealTypes) ? item.food.mealTypes : [];
}

function getAgeGroups(item: CatalogMenuItem): CatalogCodeName[] {
  return Array.isArray(item.food?.ageGroups) ? item.food.ageGroups : [];
}

function getDietaryTypes(item: CatalogMenuItem): CatalogCodeName[] {
  return Array.isArray(item.food?.dietaryTypes)
    ? item.food.dietaryTypes.map((diet) => ({
        code: diet.code,
        name: diet.name,
      }))
    : [];
}

function getSeasons(item: CatalogMenuItem): CatalogCodeName[] {
  return Array.isArray(item.food?.seasons)
    ? item.food.seasons.map((season) => ({
        code: season.code,
        name: season.localName?.trim() || season.name,
      }))
    : [];
}

function getEvents(item: CatalogMenuItem): CatalogCodeName[] {
  return Array.isArray(item.food?.events)
    ? item.food.events.map((event) => ({
        code: event.code,
        name: event.localName?.trim() || event.name,
      }))
    : [];
}

function getSuitableWeather(item: CatalogMenuItem): CatalogCodeName[] {
  return Array.isArray(item.food?.suitableWeather)
    ? item.food.suitableWeather.map((weather) => ({
        code: weather.code,
        name: weather.localName?.trim() || weather.name,
      }))
    : [];
}

function getAllergens(item: CatalogMenuItem): CatalogCodeName[] {
  if (!Array.isArray(item.allergenDeclarations)) {
    return [];
  }

  return item.allergenDeclarations.flatMap((value) => {
    if (typeof value === "string") {
      const label = value.trim();

      return label
        ? [
            {
              code: label,
              name: label,
            },
          ]
        : [];
    }

    if (typeof value !== "object" || value === null) {
      return [];
    }

    const record = value as Record<string, unknown>;

    const nestedAllergen =
      typeof record.allergen === "object" && record.allergen !== null
        ? (record.allergen as Record<string, unknown>)
        : null;

    const codeCandidate =
      record.code ?? record.allergenCode ?? nestedAllergen?.code;

    const nameCandidate =
      record.name ??
      record.allergenName ??
      record.localName ??
      nestedAllergen?.name ??
      nestedAllergen?.localName;

    const code =
      typeof codeCandidate === "string"
        ? codeCandidate.trim()
        : typeof nameCandidate === "string"
          ? nameCandidate.trim()
          : "";

    const name =
      typeof nameCandidate === "string"
        ? nameCandidate.trim()
        : typeof codeCandidate === "string"
          ? codeCandidate.trim()
          : "";

    if (!code || !name) {
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

function getIngredients(item: CatalogMenuItem): string[] {
  if (!Array.isArray(item.ingredients)) {
    return [];
  }

  return item.ingredients.filter(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  );
}

function getOriginCountry(item: CatalogMenuItem): CatalogCodeName | null {
  const origin = item.origin;

  if (!origin?.countryCode || !origin?.countryName) {
    return null;
  }

  return {
    code: origin.countryCode,
    name: origin.countryLocalName?.trim() || origin.countryName,
  };
}

function matchesPriceTier(
  price: number,
  priceTier: StoreMenuPriceTier,
): boolean {
  if (!priceTier) {
    return true;
  }

  if (priceTier === "$") {
    return price < 3;
  }

  if (priceTier === "$$") {
    return price >= 3 && price < 6;
  }

  return price >= 6;
}

function matchesStoreMenuSearch(item: CatalogMenuItem, query: string): boolean {
  const normalizedQuery = normalizeStoreMenuText(query);

  if (!normalizedQuery) {
    return true;
  }

  let searchableText = "";

  try {
    searchableText = normalizeStoreMenuText(JSON.stringify(item));
  } catch {
    searchableText = normalizeStoreMenuText(
      [
        item.uuid,
        item.name,
        item.localName,
        item.description,
        item.localDescription,
        item.store?.name,
        item.food?.category?.name,
        item.food?.cuisine?.name,
        ...getIngredients(item),
      ].join(" "),
    );
  }

  const tokens = normalizedQuery
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  return tokens.every((token) => searchableText.includes(token));
}

function makeOptions(values: CatalogCodeName[]): StoreMenuFilterOption[] {
  const map = new Map<string, StoreMenuFilterOption>();

  values.forEach((value) => {
    const code = value.code?.trim();
    const name = value.name?.trim() || code;

    if (!code) {
      return;
    }

    const existing = map.get(code);

    if (existing) {
      existing.count += 1;
      return;
    }

    map.set(code, {
      code,
      name,
      count: 1,
    });
  });

  return Array.from(map.values()).sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}

export function getStoreMenuItems(
  menuItems: CatalogMenuItem[],
  storeUuid: string,
  storeName?: string | null,
): CatalogMenuItem[] {
  const normalizedStoreUuid = normalizeStoreMenuText(storeUuid);

  const normalizedStoreName = normalizeStoreMenuText(storeName);

  if (!normalizedStoreUuid) {
    return [];
  }

  const uuidMatches = menuItems.filter(
    (item) => normalizeStoreMenuText(item.store?.uuid) === normalizedStoreUuid,
  );

  if (uuidMatches.length > 0) {
    return uuidMatches;
  }

  if (!normalizedStoreName) {
    return [];
  }

  return menuItems.filter(
    (item) => normalizeStoreMenuText(item.store?.name) === normalizedStoreName,
  );
}

export function buildStoreMenuFilterOptions(
  menuItems: CatalogMenuItem[],
): StoreMenuFilterOptions {
  const categories = makeOptions(
    menuItems.flatMap((item) => {
      const category = item.food?.category;

      return category
        ? [
            {
              code: category.code,
              name: category.name,
            },
          ]
        : [];
    }),
  );

  const cuisines = makeOptions(
    menuItems.flatMap((item) => {
      const cuisine = item.food?.cuisine;

      return cuisine
        ? [
            {
              code: cuisine.code,
              name: cuisine.name,
            },
          ]
        : [];
    }),
  );

  const mealTypes = makeOptions(menuItems.flatMap(getMealTypes));

  const dietaryTypes = makeOptions(menuItems.flatMap(getDietaryTypes));

  const ageGroups = makeOptions(menuItems.flatMap(getAgeGroups));

  const seasons = makeOptions(menuItems.flatMap(getSeasons));

  const events = makeOptions(menuItems.flatMap(getEvents));

  const weather = makeOptions(menuItems.flatMap(getSuitableWeather));

  const originCountries = makeOptions(
    menuItems.flatMap((item) => {
      const origin = getOriginCountry(item);

      return origin ? [origin] : [];
    }),
  );

  const allergens = makeOptions(menuItems.flatMap(getAllergens));

  const ingredients = makeOptions(
    menuItems.flatMap((item) =>
      getIngredients(item).map((ingredient) => ({
        code: ingredient,
        name: ingredient,
      })),
    ),
  );

  const spiceCount = new Map<number, number>();

  menuItems.forEach((item) => {
    const spiceLevel = item.food?.spiceLevel;

    if (typeof spiceLevel !== "number" || !Number.isFinite(spiceLevel)) {
      return;
    }

    spiceCount.set(spiceLevel, (spiceCount.get(spiceLevel) ?? 0) + 1);
  });

  const spiceLevels = Array.from(spiceCount.entries())
    .sort(([first], [second]) => first - second)
    .map(([value, count]) => ({
      value,
      label: STORE_MENU_SPICE_LABELS[value] ?? `កម្រិត ${value}`,
      count,
    }));

  return {
    categories,
    cuisines,

    mealTypes,
    dietaryTypes,
    ageGroups,

    seasons,
    events,
    weather,
    originCountries,

    allergens,
    ingredients,

    spiceLevels,

    hasPreparationTimeData: menuItems.some(
      (item) =>
        item.preparationTimeMinutes !== null &&
        Number.isFinite(Number(item.preparationTimeMinutes)),
    ),

    hasTraditionalData: menuItems.some(
      (item) => item.origin?.isTraditional === true,
    ),

    hasRecommendationData: menuItems.some(
      (item) => typeof item.recommendation?.finalScore === "number",
    ),
  };
}

export function applyStoreMenuFilters(
  menuItems: CatalogMenuItem[],
  filters: StoreMenuFilterState,
): CatalogMenuItem[] {
  const filtered = menuItems.filter((item) => {
    if (filters.availabilityOnly && item.availabilityStatus !== "AVAILABLE") {
      return false;
    }

    if (filters.featuredOnly && !item.isFeatured) {
      return false;
    }

    if (filters.traditionalOnly && item.origin?.isTraditional !== true) {
      return false;
    }

    if (!matchesStoreMenuSearch(item, filters.query)) {
      return false;
    }

    const category = item.food?.category;

    if (
      filters.categoryCodes.length > 0 &&
      (!category || !filters.categoryCodes.includes(category.code))
    ) {
      return false;
    }

    const cuisine = item.food?.cuisine;

    if (
      filters.cuisineCodes.length > 0 &&
      (!cuisine || !filters.cuisineCodes.includes(cuisine.code))
    ) {
      return false;
    }

    const mealTypes = getMealTypes(item);

    if (
      filters.mealTypeCodes.length > 0 &&
      !mealTypes.some((value) => filters.mealTypeCodes.includes(value.code))
    ) {
      return false;
    }

    const dietaryTypes = getDietaryTypes(item);

    if (
      filters.dietaryTypeCodes.length > 0 &&
      !dietaryTypes.some((value) =>
        filters.dietaryTypeCodes.includes(value.code),
      )
    ) {
      return false;
    }

    const ageGroups = getAgeGroups(item);

    if (
      filters.ageGroupCodes.length > 0 &&
      !ageGroups.some((value) => filters.ageGroupCodes.includes(value.code))
    ) {
      return false;
    }

    const seasons = getSeasons(item);

    if (
      filters.seasonCodes.length > 0 &&
      !seasons.some((value) => filters.seasonCodes.includes(value.code))
    ) {
      return false;
    }

    const events = getEvents(item);

    if (
      filters.eventCodes.length > 0 &&
      !events.some((value) => filters.eventCodes.includes(value.code))
    ) {
      return false;
    }

    const weather = getSuitableWeather(item);

    if (
      filters.weatherCodes.length > 0 &&
      !weather.some((value) => filters.weatherCodes.includes(value.code))
    ) {
      return false;
    }

    const originCountry = getOriginCountry(item);

    if (
      filters.originCountryCodes.length > 0 &&
      (!originCountry ||
        !filters.originCountryCodes.includes(originCountry.code))
    ) {
      return false;
    }

    const allergens = getAllergens(item);

    if (
      filters.excludedAllergenCodes.length > 0 &&
      allergens.some((allergen) =>
        filters.excludedAllergenCodes.includes(allergen.code),
      )
    ) {
      return false;
    }

    const ingredients = getIngredients(item);

    if (
      filters.ingredientNames.length > 0 &&
      !filters.ingredientNames.every((selectedIngredient) =>
        ingredients.some(
          (ingredient) =>
            normalizeStoreMenuText(ingredient) ===
            normalizeStoreMenuText(selectedIngredient),
        ),
      )
    ) {
      return false;
    }

    if (
      filters.spiceLevels.length > 0 &&
      !filters.spiceLevels.includes(item.food?.spiceLevel ?? -1)
    ) {
      return false;
    }

    if (
      filters.maximumPreparationMinutes !== null &&
      (item.preparationTimeMinutes === null ||
        item.preparationTimeMinutes > filters.maximumPreparationMinutes)
    ) {
      return false;
    }

    if (!matchesPriceTier(Number(item.price ?? 0), filters.priceTier)) {
      return false;
    }

    return true;
  });

  return [...filtered].sort((first, second) => {
    switch (filters.sortBy) {
      case "recommended": {
        const firstScore = Number(first.recommendation?.finalScore ?? -1);

        const secondScore = Number(second.recommendation?.finalScore ?? -1);

        return secondScore - firstScore;
      }

      case "fastest": {
        const firstMinutes =
          first.preparationTimeMinutes ?? Number.POSITIVE_INFINITY;

        const secondMinutes =
          second.preparationTimeMinutes ?? Number.POSITIVE_INFINITY;

        return firstMinutes - secondMinutes;
      }

      case "name":
        return (first.localName?.trim() || first.name).localeCompare(
          second.localName?.trim() || second.name,
        );

      case "price-low":
        return Number(first.price ?? 0) - Number(second.price ?? 0);

      case "price-high":
        return Number(second.price ?? 0) - Number(first.price ?? 0);

      case "featured":
      default:
        return (
          Number(second.isFeatured) - Number(first.isFeatured) ||
          (second.recommendation?.finalScore ?? 0) -
            (first.recommendation?.finalScore ?? 0) ||
          (first.localName?.trim() || first.name).localeCompare(
            second.localName?.trim() || second.name,
          )
        );
    }
  });
}

export function countActiveStoreMenuFilters(
  filters: StoreMenuFilterState,
): number {
  return (
    filters.categoryCodes.length +
    filters.cuisineCodes.length +
    filters.mealTypeCodes.length +
    filters.dietaryTypeCodes.length +
    filters.ageGroupCodes.length +
    filters.seasonCodes.length +
    filters.eventCodes.length +
    filters.weatherCodes.length +
    filters.originCountryCodes.length +
    filters.excludedAllergenCodes.length +
    filters.ingredientNames.length +
    filters.spiceLevels.length +
    (filters.availabilityOnly ? 1 : 0) +
    (filters.featuredOnly ? 1 : 0) +
    (filters.traditionalOnly ? 1 : 0) +
    (filters.priceTier ? 1 : 0) +
    (filters.maximumPreparationMinutes !== null ? 1 : 0) +
    (filters.sortBy !== "featured" ? 1 : 0)
  );
}
