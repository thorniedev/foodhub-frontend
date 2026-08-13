export type CatalogOperatingStatus = "OPEN" | "CLOSED";

export type CatalogAvailabilityStatus = "AVAILABLE" | "UNAVAILABLE";

export interface CatalogCodeName {
  code: string;
  name: string;
}

export interface CatalogLocalizedCodeName extends CatalogCodeName {
  localName: string | null;
}

export interface CatalogMenuItemStore {
  uuid: string;
  name: string;
  localName: string | null;

  logoUrl: string | null;
  coverImageUrl: string | null;

  /**
   * The current sample response contains an empty array,
   * so the inner social-item shape is intentionally not guessed.
   */
  social: unknown[];

  addressLine: string | null;
  district: string | null;
  city: string | null;

  latitude: number;
  longitude: number;

  operatingStatus: CatalogOperatingStatus;

  averageRating: number;
  totalReviews: number;
}

export interface CatalogSeason {
  code: string;
  name: string;
  localName: string | null;
  suitabilityScore: number;
  reasonText: string | null;
}

export interface CatalogEvent {
  code: string;
  name: string;
  localName: string | null;
  relevanceScore: number;
  reasonText: string | null;
}

export interface CatalogSuitableWeather {
  code: string;
  name: string;
  localName: string | null;
  suitabilityScore: number;
  reasonText: string | null;
}

export interface CatalogDietaryType {
  code: string;
  name: string;
  verificationStatus: string;
}

export interface CatalogMenuItemFood {
  uuid: string;
  canonicalName: string;

  category: CatalogCodeName;
  cuisine: CatalogCodeName;

  spiceLevel: number;

  /**
   * Your previous frontend type already treated these as code/name values.
   * The current response sample contains empty arrays.
   */
  ageGroups: CatalogCodeName[];
  mealTypes: CatalogCodeName[];

  seasons: CatalogSeason[];
  dietaryTypes: CatalogDietaryType[];
  events: CatalogEvent[];
  suitableWeather: CatalogSuitableWeather[];
}

export interface CatalogNutrition {
  calories: number;
  fatGrams: number;
  carbsGrams: number;
  proteinGrams: number;
}

export interface CatalogRecommendationScoreBreakdown {
  mealMatch?: number;
  cuisineMatch?: number;
  budgetMatch?: number;
  distanceMatch?: number;
  popularity?: number;

  [key: string]: number | undefined;
}

/**
 * The list response you supplied currently returns recommendation: null.
 *
 * These fields are optional so the detail page can safely display a
 * personalized recommendation if the detail endpoint supplies one when
 * sessionUuid/latitude/longitude are provided.
 */
export interface CatalogRecommendation {
  finalScore?: number | null;
  reasonText?: string | null;
  reasonCodes?: string[] | null;
  scoreBreakdown?: CatalogRecommendationScoreBreakdown | null;
}

export interface CatalogOrigin {
  countryCode: string;
  countryName: string;
  countryLocalName: string | null;

  provinceCode: string | null;
  provinceName: string | null;
  provinceLocalName: string | null;

  isTraditional: boolean;
}

export interface CatalogFilterOption {
  seasons: CatalogSeason[];
  events: CatalogEvent[];

  /**
   * The supplied response contains [] only,
   * so the inner shape is intentionally not guessed.
   */
  provincePopularity: unknown[];

  suitableWeather: CatalogSuitableWeather[];
}

/**
 * Exact menu-item shape matching the response supplied in this chat.
 */
export interface CatalogMenuItem {
  uuid: string;
  legacyId: number;

  name: string;
  localName: string | null;

  description: string | null;
  localDescription: string | null;

  /**
   * Example:
   * /api/v1/catalog/menu-items/{uuid}/images/1
   */
  thumbnail: string | null;
  gallery: string[];

  price: number;
  currencyCode: string;
  preparationTimeMinutes: number | null;

  availabilityStatus: CatalogAvailabilityStatus;
  isFeatured: boolean;
  source: string;

  store: CatalogMenuItemStore;

  distanceKm: number | null;

  food: CatalogMenuItemFood;

  /**
   * The current response sample contains [] only.
   * Keep unknown instead of inventing an object shape.
   */
  allergenDeclarations: unknown[];

  ingredients: string[];

  /**
   * The current response sample contains [] only.
   */
  beveragePairings: unknown[];

  nutrition: CatalogNutrition;

  recommendation: CatalogRecommendation | null;

  createdAt: string;
  updatedAt: string;

  origin: CatalogOrigin;

  filterOption: CatalogFilterOption;
}

export interface CatalogPageSort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface CatalogPageable {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  sort: CatalogPageSort;
  unpaged: boolean;
}

export interface CatalogMenuItemsPayload {
  content: CatalogMenuItem[];

  empty: boolean;
  first: boolean;
  last: boolean;

  number: number;
  numberOfElements: number;

  pageable: CatalogPageable;

  size: number;
  sort: CatalogPageSort;

  totalElements: number;
  totalPages: number;
}

export interface CatalogMenuItemsResponse {
  status: number;
  message: string;
  payload: CatalogMenuItemsPayload;
  timestamp: string;
}
