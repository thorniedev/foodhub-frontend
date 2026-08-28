// types/recommendation.ts

export interface ProfileSummary {
  uuid: string;
  profileName: string;
  relationship: string;
  gender: string;
  isDefault: boolean;
  avatarMediaUuid?: string;
}

export interface ProfileItemRequest {
  profileId: string; // Profile UUID
  isPrimary: boolean;
  budgetMin?: number;
  budgetMax?: number;
}

export interface CreateSessionRequest {
  mode: "SINGLE" | "GROUP";
  requestSource: "APP" | "WEB" | "HOMEPAGE_AUTO";
  mealTypeId?: number;
  searchRadiusKm?: number;
  maximumPrice?: number;
  currencyCode?: string;
  requestedLimit?: number;
  contextData?: Record<string, unknown>;
  profiles: ProfileItemRequest[];
}

export interface SessionResponse {
  uuid: string;
  mode: "SINGLE" | "GROUP";
  status: "PENDING" | "PROCESSING" | "READY" | "COMPLETED" | "FAILED";
  requestSource: string;
  searchRadiusKm?: number;
  maximumPrice?: number;
  currencyCode?: string;
  requestedLimit: number;
  candidateCount: number;
  eligibleCount: number;
  contextData?: Record<string, unknown>;
  startedAt: string;
  completedAt?: string;
}

export interface RecommendationItemDto {
  uuid: string;
  menuItemId: number;
  menuItemUuid?: string | null;
  foodUuid?: string | null;
  menuItemName: string;
  storeId: number;
  storeUuid?: string | null;
  storeName: string;
  rankPosition: number;
  finalScore: number;
  groupScore?: number;
  candidateSource: string;
  distanceKm?: number;
  priceSnapshot?: number;
  currencyCode?: string;
  scoreBreakdown?: Record<string, number>;
  reasonCodes?: string[];
  reasonText?: string;
  isExploration: boolean;
  createdAt: string;
}

/* ========================================================================== */
/* Backward Compatibility Types for Existing Codebase                         */
/* ========================================================================== */

export type RecommendationMode = "SINGLE" | "GROUP";

export interface RecommendationProfileRequest {
  /** Public profile UUID (never an internal id). */
  profileId: string;
  isPrimary?: boolean;
}

export interface CreateRecommendationSessionRequest {
  mode: RecommendationMode;
  requestSource: string;
  requestedLimit?: number;
  maximumPrice?: number;
  currencyCode?: string;
  searchRadiusKm?: number;
  /** Free-form request context, e.g. `{ userPrompt: "spicy noodles under $5" }`. */
  contextData?: Record<string, unknown>;
  profiles: RecommendationProfileRequest[];
}

export interface RecommendationItem {
  uuid: string;
  menuItemId?: number;
  menuItemUuid?: string | null;
  foodUuid?: string | null;
  menuItemName: string | null;
  storeId?: number;
  storeUuid?: string | null;
  storeName: string | null;
  rankPosition: number | null;
  finalScore: number | null;
  groupScore: number | null;
  candidateSource: string | null;
  distanceKm: number | null;
  priceSnapshot: number | null;
  currencyCode: string | null;
  /** Backend serializes this as a JSON array of stable codes; narrow at use. */
  reasonCodes: string[] | null;
  reasonText: string | null;
  /** Per-strategy contributions, e.g. { AI_JUDGMENT: 0.9, CONTENT_BASED: 0.8 }. */
  scoreBreakdown: Record<string, number> | null;
  isExploration: boolean;
  exploration?: boolean;
}

export interface RecommendationSession {
  uuid: string;
  mode: string;
  status: string;
  requestSource: string | null;
  candidateCount: number | null;
  eligibleCount: number | null;
  requestedLimit: number | null;
  items: RecommendationItem[];
}

/**
 * One profile's verdict on one menu item within a session.
 *
 * `profileId` is the internal numeric id, which is what meetup participants
 * also carry, so a blocked check can be traced back to the member it belongs
 * to. `reasons` is a free-form payload of stable reason codes.
 */
export interface SafetyCheckDto {
  uuid: string;
  profileId: number | null;
  menuItemId: number | null;
  menuItemName: string | null;
  result: "SAFE" | "WARNING" | "BLOCKED" | string;
  ruleVersion: string | null;
  reasons: unknown;
  checkDurationMs: number | null;
  checkedAt: string | null;
}
