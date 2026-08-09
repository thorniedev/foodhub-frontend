// src/types/catalog-menu-item-detail.ts

export interface CatalogMenuItemDetailResponse {
  status: number;
  message: string;
  payload: CatalogMenuItemDetail;
  timestamp: string;
}

export interface CatalogMenuItemDetail {
  uuid: string;
  legacyId: number | null;

  name: string;
  localName: string | null;

  description: string | null;
  localDescription: string | null;

  thumbnail: string | null;
  gallery: string[];

  price: number;
  currencyCode: string;

  preparationTimeMinutes: number | null;

  availabilityStatus: string;

  isFeatured: boolean;
  source: string;

  store: CatalogMenuItemDetailStore;

  food: CatalogMenuItemDetailFood;

  mealTypes: CatalogMenuItemDetailCodeName[];

  dietaryTypes: CatalogMenuItemDetailDietaryType[];

  allergenDeclarations: CatalogMenuItemDetailAllergenDeclaration[];

  ingredients: string[];

  beveragePairings: string[];

  nutrition: Record<string, unknown>;

  distanceKm: number | null;

  recommendation: CatalogMenuItemDetailRecommendation | null;

  createdAt: string;
  updatedAt: string;

  origin: CatalogMenuItemDetailOrigin | null;

  recommendationContext: CatalogMenuItemRecommendationContext | null;
}

// ==============================
// STORE
// ==============================

export interface CatalogMenuItemDetailStore {
  uuid: string;

  name: string;
  localName: string | null;

  logoUrl: string | null;
  coverImageUrl: string | null;

  addressLine: string | null;
  district: string | null;
  city: string | null;

  latitude: number | null;
  longitude: number | null;

  operatingStatus: string;

  averageRating: number;

  totalReviews: number;
}

// ==============================
// FOOD
// ==============================

export interface CatalogMenuItemDetailFood {
  uuid: string;

  canonicalName: string;

  category: CatalogMenuItemDetailCodeName | null;

  cuisine: CatalogMenuItemDetailCodeName | null;

  spiceLevel: number | null;

  ageGroups: CatalogMenuItemDetailCodeName[];
}

export interface CatalogMenuItemDetailCodeName {
  code: string;
  name: string;
}

// ==============================
// DIETARY TYPE
// ==============================

export interface CatalogMenuItemDetailDietaryType {
  code: string;
  name: string;

  verificationStatus: string;
}

// ==============================
// ALLERGEN
// ==============================

export interface CatalogMenuItemDetailAllergenDeclaration {
  code: string;
  name: string;

  declarationType: string;

  riskLevel: string;

  verificationStatus: string;
}

// ==============================
// RECOMMENDATION
// ==============================

export interface CatalogMenuItemDetailRecommendation {
  isRecommended: boolean | null;

  rankPosition: number | null;

  finalScore: number | null;

  safetyStatus: string | null;

  candidateSource: string | null;

  reasonCodes: string[];

  reasonText: string | null;

  isExploration: boolean | null;

  scoreBreakdown: CatalogMenuItemDetailScoreBreakdown | null;
}

export interface CatalogMenuItemDetailScoreBreakdown {
  mealMatch: number | null;

  cuisineMatch: number | null;

  budgetMatch: number | null;

  distanceMatch: number | null;

  popularity: number | null;

  dietaryMatch: number | null;

  allergySafetyMatch: number | null;

  seasonMatch: number | null;

  eventMatch: number | null;

  provincePopularityMatch: number | null;

  weatherMatch: number | null;
}

// ==============================
// ORIGIN
// ==============================

export interface CatalogMenuItemDetailOrigin {
  countryCode: string | null;

  countryName: string | null;

  countryLocalName: string | null;

  provinceCode: string | null;

  provinceName: string | null;

  provinceLocalName: string | null;

  isTraditional: boolean | null;
}

// ==============================
// RECOMMENDATION CONTEXT
// ==============================

export interface CatalogMenuItemRecommendationContext {
  seasons: CatalogMenuItemSeason[];

  events: CatalogMenuItemEvent[];

  provincePopularity: CatalogMenuItemProvincePopularity[];

  suitableWeather: CatalogMenuItemWeather[];
}

// ==============================
// SEASON
// ==============================

export interface CatalogMenuItemSeason {
  code: string;

  name: string;

  localName: string | null;

  suitabilityScore: number | null;

  reasonText: string | null;
}

// ==============================
// EVENT
// ==============================

export interface CatalogMenuItemEvent {
  code: string;

  name: string;

  localName: string | null;

  relevanceScore: number | null;

  reasonText: string | null;
}

// ==============================
// PROVINCE POPULARITY
// ==============================

export interface CatalogMenuItemProvincePopularity {
  provinceCode: string;

  provinceName: string;

  provinceLocalName: string | null;

  popularityScore: number | null;

  popularityRank: number | null;

  isTraditionalToProvince: boolean | null;

  reasonText: string | null;
}

// ==============================
// WEATHER
// ==============================

export interface CatalogMenuItemWeather {
  code: string;

  name: string;

  localName: string | null;

  suitabilityScore: number | null;

  reasonText: string | null;
}

// ==============================
// QUERY PARAMS
// ==============================

export interface GetCatalogMenuItemDetailParams {
  uuid: string;

  sessionUuid?: string;

  latitude?: number;

  longitude?: number;
}
