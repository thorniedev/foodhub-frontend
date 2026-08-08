export type LocationFoodSort =
  | "recommended"
  | "popular"
  | "rating"
  | "fastest"
  | "nearest"
  | "price-low"
  | "price-high";

export type LocationFoodPriceTier = "$" | "$$" | "$$$" | null;

export interface LocationFoodFilterOption {
  code: string;
  name: string;
  count: number;
}

export interface LocationFoodFilterOptions {
  categories: LocationFoodFilterOption[];

  cuisines: LocationFoodFilterOption[];

  mealTypes: LocationFoodFilterOption[];

  dietaryTypes: LocationFoodFilterOption[];

  ageGroups: LocationFoodFilterOption[];

  allergens: LocationFoodFilterOption[];

  stores: LocationFoodFilterOption[];

  ingredients: LocationFoodFilterOption[];

  seasons: LocationFoodFilterOption[];

  events: LocationFoodFilterOption[];

  provinces: LocationFoodFilterOption[];

  weather: LocationFoodFilterOption[];

  originProvinces: LocationFoodFilterOption[];
}

export interface LocationFoodFilterState {
  query: string;

  sortBy: LocationFoodSort;

  categoryCodes: string[];

  cuisineCodes: string[];

  mealTypeCodes: string[];

  dietaryTypeCodes: string[];

  ageGroupCodes: string[];

  excludedAllergenCodes: string[];

  storeIds: string[];

  ingredientNames: string[];

  spiceLevels: number[];

  seasonCodes: string[];

  eventCodes: string[];

  provinceCodes: string[];

  weatherCodes: string[];

  originProvinceCodes: string[];

  availabilityOnly: boolean;

  recommendedOnly: boolean;

  featuredOnly: boolean;

  priceTier: LocationFoodPriceTier;

  maximumPreparationMinutes: number | null;

  maximumDistanceKm: number | null;

  minimumRating: number | null;

  minimumRecommendationScore: number | null;

  lowCalorieOnly: boolean;

  highProteinOnly: boolean;

  lowFatOnly: boolean;

  highFiberOnly: boolean;

  lowSodiumOnly: boolean;
}

export const DEFAULT_LOCATION_FOOD_FILTERS: LocationFoodFilterState = {
  query: "",

  sortBy: "recommended",

  categoryCodes: [],

  cuisineCodes: [],

  mealTypeCodes: [],

  dietaryTypeCodes: [],

  ageGroupCodes: [],

  excludedAllergenCodes: [],

  storeIds: [],

  ingredientNames: [],

  spiceLevels: [],

  seasonCodes: [],

  eventCodes: [],

  provinceCodes: [],

  weatherCodes: [],

  originProvinceCodes: [],

  availabilityOnly: true,

  recommendedOnly: false,

  featuredOnly: false,

  priceTier: null,

  maximumPreparationMinutes: null,
  maximumDistanceKm: 5,

  minimumRating: null,

  minimumRecommendationScore: null,

  lowCalorieOnly: false,

  highProteinOnly: false,

  lowFatOnly: false,

  highFiberOnly: false,

  lowSodiumOnly: false,
};
