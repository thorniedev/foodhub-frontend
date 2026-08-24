export type InteractionEventType =
  | "VIEW"
  | "CLICK"
  | "SEARCH"
  | "LIKE"
  | "DISLIKE"
  | "SKIP"
  | "ACCEPT"
  | "REJECT"
  | "BOOKMARK"
  | "UNBOOKMARK"
  | "SHARE";

export interface PageResponse<T> {
  contents: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface BookmarkResponse {
  uuid: string;
  profileUuid: string;
  foodUuid: string | null;
  menuItemUuid: string | null;
  storeUuid: string | null;
  sourceRecommendationItemUuid: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateBookmarkRequest {
  menuItemUuid?: string;
  storeUuid?: string;
  foodUuid?: string;
  sourceRecommendationItemUuid?: string;
  notes?: string;
}

export interface RecordInteractionRequest {
  clientEventId: string;
  profileUuid?: string;
  recommendationSessionUuid?: string;
  recommendationItemUuid?: string;
  foodUuid?: string;
  menuItemUuid?: string;
  storeUuid?: string;
  notificationUuid?: string;
  eventType: InteractionEventType;
  dwellTimeMs?: number;
  occurredAt: string;
}

export interface InteractionEventResponse {
  uuid: string;
  clientEventId: string;
  profileUuid: string | null;
  menuItemUuid: string | null;
  storeUuid: string | null;
  foodUuid: string | null;
  eventType: InteractionEventType;
  dwellTimeMs: number | null;
  occurredAt: string;
  receivedAt: string;
}
