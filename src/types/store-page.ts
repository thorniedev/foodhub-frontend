export type StoreOperatingStatus =
  | "OPEN"
  | "CLOSED"
  | "TEMPORARILY_CLOSED"
  | "PERMANENTLY_CLOSED"
  | "UNKNOWN"
  | string;

export type StoreSortBy =
  | "default"
  | "nearest"
  | "name-asc"
  | "rating"
  | "reviews";

export interface StoreOpeningHour {
  storeUuid: string;
  scheduleType: string;
  dayOfWeek: number | null;
  businessDate: string | null;
  openingTime: string | null;
  closingTime: string | null;
  intervalOrder: number;
  isClosed: boolean;
  reason: string | null;
}

/**
 * Store list/card item from GET /stores.
 *
 * The backend response is:
 * {
 *   contents: StoreListItem[],
 *   pageNumber,
 *   pageSize,
 *   totalElements,
 *   totalPages,
 *   first,
 *   last
 * }
 */
export interface StoreListItem {
  uuid: string;
  storeName: string;
  addressLine: string | null;
  city: string | null;
  province: string | null;
  latitude: number;
  longitude: number;
  distanceMeters: number | null;
  averageRating: number;
  totalReviews: number;
  operatingStatus: StoreOperatingStatus;
  isOpenNow: boolean;
  logoMediaUuid: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/** Keep the existing StoreCard/StoreGrid import name. */
export type FoodStore = StoreListItem;

export interface StoreListResponse {
  contents: StoreListItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/**
 * Store detail from GET /stores/{uuid}.
 * Detail-only fields are intentionally separated from StoreListItem.
 */
export interface FoodStoreDetail {
  uuid: string;
  storeName: string;
  description: string | null;
  addressLine: string | null;
  commune: string | null;
  district: string | null;
  city: string | null;
  province: string | null;
  countryCode: string | null;
  postalCode: string | null;
  timezone: string | null;
  latitude: number;
  longitude: number;
  phoneNumber: string | null;
  email: string | null;
  logoMediaUuid: string | null;
  coverMediaUuid: string | null;
  priceLevel: number | string | null;
  hygieneRating: number | null;
  averageRating: number;
  totalReviews: number;
  reviewStatus: string | null;
  operatingStatus: StoreOperatingStatus;
  accountStatus: string | null;
  isOpenNow: boolean;
  socialLinks: unknown[];
  openingHours: StoreOpeningHour[];
  createdAt: string;
  updatedAt: string;
}

export interface StorePageOption {
  code: string;
  name: string;
  count: number;
}

export interface StorePageFilters {
  cities: string[];
  provinces: string[];
  operatingStatuses: string[];
  openNowOnly: boolean;
  minimumRating: number | null;
  maxDistanceKm?: number | null;
  sortBy: StoreSortBy;
}
