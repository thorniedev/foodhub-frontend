/**
 * Types for the deterministic + AI recommendation API.
 *
 * Contract (backend, source of truth):
 *   POST /api/v1/recommendations/sessions  (auth required)
 *     body -> CreateRecommendationSessionRequest
 *     returns -> RecommendationSession (already includes `items`)
 *
 * The free-text user prompt is passed through `contextData.userPrompt`; the
 * backend AI strategy reads `session.contextData` as the "diner's request
 * context". GROUP mode across every owned profile yields the safety
 * intersection (an item must be safe for every selected profile).
 */

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
  menuItemName: string | null;
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
