import type { Coordinates, RecommendedStore } from "@/types/location";

export type GroupLocationStatus = "waiting" | "ready";

export type GroupRecommendationStage =
  | "setup"
  | "recommendations"
  | "voting"
  | "completed";

export interface GroupLocationMember {
  uuid: string;
  name: string;
  coordinates: Coordinates | null;
  locationStatus: GroupLocationStatus;
  requiredDietaryCodes: string[];
  blockedAllergenCodes: string[];
  hasVoted: boolean;
}

export interface GroupLocationVote {
  memberUuid: string;
  storeUuid: string;
  createdAt: string;
}

/**
 * Group-only fields layered on top of the existing location RecommendedStore.
 * Keeping these types separate prevents the shared voting API types from
 * becoming coupled to the midpoint UI.
 */
export type GroupRecommendedStore = RecommendedStore & {
  deliveryAvailable: boolean;
  pickupAvailable: boolean;

  averageMemberDistanceKm: number;
  maximumMemberDistanceKm: number;

  menuCount: number;
  matchingMenuCount: number;

  safeForAllMembers: boolean;
  hasMealsForEveryone: boolean;

  recommendationScore: number;
  voteCount: number;
};
