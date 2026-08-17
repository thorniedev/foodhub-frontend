export interface PublicSearchParams {
  q: string;
  limit?: number;
  offset?: number;
}

export interface MenuItemHit {
  id: string;
  uuid?: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  storeUuid?: string;
  storeName?: string;
  availabilityStatus?: "AVAILABLE" | "UNAVAILABLE" | "SOLD_OUT";
  storeOperatingStatus?: string;
  deleted?: boolean;
}

export interface StoreHit {
  id: string;
  uuid?: string;
  storeName: string;
  name?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  reviewStatus?: "APPROVED" | "PENDING" | "REJECTED";
  accountStatus?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
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

export interface DiscoverySearchRequest {
  query?: string;
  profileUuid?: string;
  dietaryPreferences?: string[];
  ingredientExclusions?: string[];
  allergies?: string[];
  limit?: number;
  offset?: number;
}

export interface DiscoverySearchResponse {
  contents: MenuItemHit[];
  pageNumber: number;
  pageSize: number;
  hasNext: boolean;
  totalElements?: number;
  totalPages?: number;
  safetyEvaluated: boolean;
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
