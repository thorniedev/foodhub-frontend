export type StoreMenuSortBy =
  | "featured"
  | "recommended"
  | "fastest"
  | "name"
  | "price-low"
  | "price-high";

export type StoreMenuPriceTier =
  | "$"
  | "$$"
  | "$$$"
  | null;

export interface StoreMenuFilterState {
  query: string;

  sortBy: StoreMenuSortBy;

  categoryCodes: string[];
  cuisineCodes: string[];

  mealTypeCodes: string[];
  dietaryTypeCodes: string[];
  ageGroupCodes: string[];

  seasonCodes: string[];
  eventCodes: string[];
  weatherCodes: string[];
  originCountryCodes: string[];

  excludedAllergenCodes: string[];
  ingredientNames: string[];

  spiceLevels: number[];

  availabilityOnly: boolean;
  featuredOnly: boolean;
  traditionalOnly: boolean;

  priceTier: StoreMenuPriceTier;

  maximumPreparationMinutes: number | null;
}

export interface StoreMenuFilterOption {
  code: string;
  name: string;
  count: number;
}

export interface StoreMenuFilterOptions {
  categories: StoreMenuFilterOption[];
  cuisines: StoreMenuFilterOption[];

  mealTypes: StoreMenuFilterOption[];
  dietaryTypes: StoreMenuFilterOption[];
  ageGroups: StoreMenuFilterOption[];

  seasons: StoreMenuFilterOption[];
  events: StoreMenuFilterOption[];
  weather: StoreMenuFilterOption[];
  originCountries: StoreMenuFilterOption[];

  allergens: StoreMenuFilterOption[];
  ingredients: StoreMenuFilterOption[];

  spiceLevels: Array<{
    value: number;
    label: string;
    count: number;
  }>;

  hasPreparationTimeData: boolean;
  hasTraditionalData: boolean;
  hasRecommendationData: boolean;
}