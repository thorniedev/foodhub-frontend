import type { MenuItem } from "./manu";

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export type RecommendationMode = "single" | "group";

export type LocationViewMode = "list" | "map";

export type LocationPermissionStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable"
  | "unsupported";

export type StoreOperatingStatus =
  | "OPEN"
  | "CLOSED"
  | "TEMPORARILY_CLOSED"
  | "PERMANENTLY_CLOSED"
  | "UNKNOWN";

export type LocationSort =
  | "recommended"
  | "nearest"
  | "name-asc"
  | "highest-rated"
  | "most-reviewed"
  | "most-voted"
  | "fairest-distance";

export interface LocationFiltersState {
  radiusKm: number;

  selectedProvince: string;
  selectedCity: string;
  selectedDistrict: string;

  openNow: boolean;

  deliveryAvailable: boolean;
  pickupAvailable: boolean;

  minimumRating: number;

  safeForAllMembers: boolean;
  hasMealsForEveryone: boolean;

  sortBy: LocationSort;
}

export const DEFAULT_LOCATION_FILTERS: LocationFiltersState = {
  radiusKm: 5,

  selectedProvince: "",
  selectedCity: "",
  selectedDistrict: "",

  openNow: false,

  deliveryAvailable: false,
  pickupAvailable: false,

  minimumRating: 0,

  safeForAllMembers: false,
  hasMealsForEveryone: false,

  sortBy: "recommended",
};

export interface RecommendedStore {
  uuid: string;

  name: string;
  localName: string | null;
  description: string;

  addressLine: string;
  commune: string;
  district: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  phoneNumber: string | null;
  email: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  logoMediaUuid?: string | null;
  coverMediaUuid?: string | null;
  priceLevel: number | string | null;
  averageRating: number;
  totalReviews: number;
  operatingStatus: StoreOperatingStatus;
  isOpenNow: boolean;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  menuItems: MenuItem[];
  menuCount: number;
  matchingMenuCount: number;
  distanceKm: number;
  recommendationScore: number;
  voteCount: number;
  averageMemberDistanceKm?: number;
  maximumMemberDistanceKm?: number;
  groupCoverageCount?: number;
  groupMemberCount?: number;
  safeForAllMembers?: boolean;
  hasMealsForEveryone?: boolean;
}
