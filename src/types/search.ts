export interface PublicSearchParams {
  q: string;
  limit?: number;
  offset?: number;
}

export interface MenuItemHit {
  id: string;
  uuid?: string;
  menuItemUuid?: string;
  menu_item_uuid?: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  storeUuid?: string;
  storeName?: string;
  availabilityStatus?: string;
  storeOperatingStatus?: string;
  deleted?: boolean;
}

export interface StoreHit {
  id: string;
  uuid?: string;
  storeUuid?: string;
  store_uuid?: string;
  storeName?: string;
  name?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  city?: string;
  averageRating?: number;
  priceLevel?: number;
  reviewStatus?: string;
  accountStatus?: string;
  deleted?: boolean;
}

export interface SearchHits<T> {
  estimatedTotalHits?: number;
  totalHits?: number;
  items: T[];
}

export interface PublicSearchResponse {
  query: string;
  available: boolean;
  limit: number;
  offset: number;
  menuItems: SearchHits<MenuItemHit>;
  stores: SearchHits<StoreHit>;
}

export interface FilterItemOption {
  uuid: string;
  code: string;
  name: string;
  localName?: string;
  minAge?: number | null;
  maxAge?: number | null;
  minimumAge?: number | null;
  maximumAge?: number | null;
  min_age?: number | null;
  max_age?: number | null;
}

export interface DiscoveryFilterOptionsResponse {
  categories: FilterItemOption[];
  cuisines: FilterItemOption[];
  mealTypes: FilterItemOption[];
  dietaryTypes: FilterItemOption[];
  allergens: FilterItemOption[];
  availabilityStatuses: string[];
  sortOptions: string[]; // ["DISTANCE_ASC", "PRICE_ASC", "PRICE_DESC", "FOODHUB_RATING_DESC", "NEWEST"]
  storePriceLevels: number[];
  provinces: string[];
  cities: string[];
  seasons: FilterItemOption[];
  events: FilterItemOption[];
  suitableWeather: FilterItemOption[];
  ageGroups: FilterItemOption[];
  spiceLevels: { min: number; max: number };
  priceRanges: { currency: string; min: number; max: number };
}

export interface CustomerSearchRequest {
  profileUuid?: string; // Optional user profile for safety evaluation
  query?: string;
  categoryUuids?: string[];
  cuisineUuids?: string[];
  mealTypeUuids?: string[];
  seasonUuids?: string[];
  eventUuids?: string[];
  weatherConditionUuids?: string[];
  ageGroupUuids?: string[];
  minimumPrice?: number;
  maximumPrice?: number;
  minimumSpiceLevel?: number;
  maximumSpiceLevel?: number;
  dietaryTypeUuids?: string[];
  excludeAllergenUuids?: string[];
  includeIngredientUuids?: string[];
  excludeIngredientUuids?: string[];
  storePriceLevels?: number[];
  provinces?: string[];
  cities?: string[];
  availabilityStatuses?: string[];
  featuredOnly?: boolean;
  minimumStoreRating?: number;
  openNow?: boolean;
  maxPreparationTimeMinutes?: number;
  latitude?: number;
  longitude?: number;
  sort?: string;
}

export type SafetyStatusType = "SAFE" | "WARNING" | "BLOCKED" | "NOT_EVALUATED";

export interface MenuItemDiscoveryResponse {
  menuItemUuid: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  currencyCode: string;
  availabilityStatus: string;
  safetyStatus: SafetyStatusType;
  safetyReasonCodes?: string[];
  distanceMeters?: number;
  store: {
    uuid: string;
    name: string;
    averageRating: number;
    priceLevel: number;
    operatingStatus: string;
    openNow: boolean;
  };
  food?: {
    canonicalName: string;
    localName?: string;
    defaultSpiceLevel?: number;
  };
}

export interface DiscoveryPaginatedResponse {
  content: MenuItemDiscoveryResponse[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  empty: boolean;
}

export interface AdminSearchParams {
  q: string;
  limit?: number;
  offset?: number;
}

export interface AdminSearchResponse {
  query: string;
  available: boolean;
  limit: number;
  offset: number;
  menuItems: SearchHits<MenuItemHit>;
  stores: SearchHits<StoreHit>;
}

export interface ReindexResponse {
  message: string;
  timestamp?: string;
}
