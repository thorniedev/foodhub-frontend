// types/foodhub.ts

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  payload: T;
}

export interface AgeGroupResponse {
  uuid: string;
  code: string;
  name: string;
  minAge: number;
  maxAge: number;
}

export interface PreferenceResponse {
  cuisineCodes: string[];
  tasteCodes: string[];
  textureCodes: string[];
  spiceLevel: string; // e.g. "5" or "7"
  minimumBudget: number | null;
  maximumBudget: number | null;
  radiusMeters: number;
}

export interface ProfileResponse {
  uuid: string;
  profileName: string;
  relationship: 'SELF' | 'CHILD' | 'PARENT' | 'SPOUSE' | 'FRIEND' | 'OTHER';
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY' | null;
  dateOfBirth: string | null;
  preferredLanguage: string;
  avatarMediaUuid: string | null;
  ageGroup: AgeGroupResponse | null;
  isDefault: boolean;
  isActive: boolean;
  allergies: any[];
  dietaryTypes: any[];
  medicalConditions: any[];
  preferences: PreferenceResponse; // NEVER NULL
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePreferencesPayload {
  spiceTolerance?: number; // 0 - 10
  minimumPrice?: number;
  maximumPrice?: number;
  currencyCode?: string; // "USD" | "KHR"
  defaultSearchRadiusKm?: number;
  tastePreferences?: Record<string, boolean>;
  texturePreferences?: Record<string, boolean>;
}

export type CuisinePreferenceLevel = 'LOVE' | 'LIKE' | 'NEUTRAL' | 'DISLIKE' | 'AVOID';

export interface CuisinePreferenceItem {
  cuisineCode: string;
  preferenceLevel: CuisinePreferenceLevel;
  priority?: number; // 1 (highest) to 10 (lowest)
}

export type InteractionSignalType =
  | 'LIKE'
  | 'ACCEPT'
  | 'BOOKMARK'
  | 'DISLIKE'
  | 'REJECT'
  | 'SKIP'
  | 'VIEW'
  | 'CLICK';

export interface RecordInteractionPayload {
  clientEventId: string; // crypto.randomUUID()
  profileUuid?: string;
  menuItemUuid?: string;
  storeUuid?: string;
  foodUuid?: string;
  eventType: InteractionSignalType;
  dwellTimeMs?: number;
  occurredAt: string; // new Date().toISOString()
}

export interface RecommendationItemResponse {
  uuid: string;
  menuItemId: number;
  menuItemUuid: string;
  menuItemName: string;
  storeId: number;
  storeName: string;
  rankPosition: number;
  finalScore: number;
  candidateSource: string;
  priceSnapshot: number | null;
  currencyCode: string | null;
  reasonText: string;
  isExploration: boolean;
}
