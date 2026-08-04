import type { MenuItem } from "@/types/manu";
import type { Store } from "@/types/store";

export type LocationViewMode = "list" | "map";

export type LocationSort =
  | "recommended"
  | "nearest"
  | "highest-rated"
  | "most-voted"
  | "fairest-distance";

export type LocationPermissionStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable"
  | "unsupported";

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export type RecommendationMode = "single" | "group";

export interface LocationFiltersState {
  radiusKm: number;
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
  openNow: false,
  deliveryAvailable: false,
  pickupAvailable: false,
  minimumRating: 0,
  safeForAllMembers: true,
  hasMealsForEveryone: true,
  sortBy: "recommended",
};

export interface RecommendedStore extends Store {
  menuItems: MenuItem[];
  menuCount: number;
  matchingMenuCount: number;
  distanceKm: number;
  averageMemberDistanceKm: number;
  maximumMemberDistanceKm: number;
  groupCoverageCount: number;
  groupMemberCount: number;
  safeForAllMembers: boolean;
  hasMealsForEveryone: boolean;
  recommendationScore: number;
  voteCount: number;
}
