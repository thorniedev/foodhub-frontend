import { describe, it, expect } from "vitest";
import type {
  BookmarkResponse,
  CreateBookmarkRequest,
  InteractionEventResponse,
  RecordInteractionRequest,
  PageResponse,
} from "@/types/interaction";

describe("Bookmarks and Interaction Telemetry Data Contracts", () => {
  it("validates dish BookmarkResponse structure with profile scope", () => {
    const bookmark: BookmarkResponse = {
      uuid: "bm-dish-01",
      profileUuid: "prof-lyta-01",
      foodUuid: null,
      menuItemUuid: "item-macchiato-14188",
      storeUuid: null,
      sourceRecommendationItemUuid: "rec-item-01",
      notes: "Must try this dessert macchiato",
      createdAt: "2026-08-24T13:00:00",
    };

    expect(bookmark.profileUuid).toBe("prof-lyta-01");
    expect(bookmark.menuItemUuid).toBe("item-macchiato-14188");
    expect(bookmark.notes).toContain("dessert");
  });

  it("validates store BookmarkResponse structure", () => {
    const storeBookmark: BookmarkResponse = {
      uuid: "bm-store-02",
      profileUuid: "prof-dara-02",
      foodUuid: null,
      menuItemUuid: null,
      storeUuid: "store-croissant-955",
      sourceRecommendationItemUuid: null,
      notes: "Best bakery in Phnom Penh",
      createdAt: "2026-08-24T13:05:00",
    };

    expect(storeBookmark.storeUuid).toBe("store-croissant-955");
    expect(storeBookmark.menuItemUuid).toBeNull();
  });

  it("validates RecordInteractionRequest format for automatic VIEW telemetry", () => {
    const nowIso = "2026-08-24T14:00:00";
    const telemetry: RecordInteractionRequest = {
      clientEventId: "550e8400-e29b-41d4-a716-446655440000",
      profileUuid: "prof-lyta-01",
      menuItemUuid: "item-macchiato-14188",
      storeUuid: "store-croissant-955",
      eventType: "VIEW",
      dwellTimeMs: 4200,
      occurredAt: nowIso,
    };

    expect(telemetry.eventType).toBe("VIEW");
    expect(telemetry.dwellTimeMs).toBe(4200);
    expect(telemetry.occurredAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
  });

  it("validates LIKE reaction interaction event response", () => {
    const reaction: InteractionEventResponse = {
      uuid: "evt-like-999",
      clientEventId: "client-uuid-12345",
      profileUuid: "prof-lyta-01",
      menuItemUuid: "item-macchiato-14188",
      storeUuid: null,
      foodUuid: null,
      eventType: "LIKE",
      dwellTimeMs: null,
      occurredAt: "2026-08-24T14:01:00",
      receivedAt: "2026-08-24T14:01:01",
    };

    expect(reaction.eventType).toBe("LIKE");
    expect(reaction.profileUuid).toBe("prof-lyta-01");
  });

  it("validates paginated PageResponse wrapper for bookmarks", () => {
    const page: PageResponse<BookmarkResponse> = {
      contents: [
        {
          uuid: "bm-01",
          profileUuid: "prof-01",
          foodUuid: null,
          menuItemUuid: "item-01",
          storeUuid: null,
          sourceRecommendationItemUuid: null,
          notes: null,
          createdAt: "2026-08-24T12:00:00",
        },
      ],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    };

    expect(page.contents).toHaveLength(1);
    expect(page.first).toBe(true);
    expect(page.totalPages).toBe(1);
  });
});
