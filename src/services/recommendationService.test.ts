import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchUserProfiles, getRecommendations } from "./recommendationService";
import type { CreateSessionRequest } from "@/types/recommendation";

describe("recommendationService", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("fetchUserProfiles", () => {
    it("fetches user profiles with auth headers and parses payload content", async () => {
      const mockProfiles = [
        {
          uuid: "prof-1",
          profileName: "Alice",
          relationship: "SELF",
          gender: "FEMALE",
          isDefault: true,
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          payload: {
            content: mockProfiles,
          },
        }),
      } as Response);

      const result = await fetchUserProfiles("mock-jwt-token");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.mhoubahar.store/api/v1/profiles?page=0&size=50",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer mock-jwt-token",
          },
        }
      );
      expect(result).toEqual(mockProfiles);
    });

    it("handles alternative response structures like data.content", async () => {
      const mockProfiles = [
        {
          uuid: "prof-2",
          profileName: "Bob",
          relationship: "CHILD",
          gender: "MALE",
          isDefault: false,
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          content: mockProfiles,
        }),
      } as Response);

      const result = await fetchUserProfiles();
      expect(result).toEqual(mockProfiles);
    });

    it("throws an error when fetch fails", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: "Unauthorized",
      } as Response);

      await expect(fetchUserProfiles("bad-token")).rejects.toThrow(
        "Failed to fetch profiles: Unauthorized"
      );
    });
  });

  describe("getRecommendations (2-step flow)", () => {
    const mockRequest: CreateSessionRequest = {
      mode: "SINGLE",
      requestSource: "WEB",
      searchRadiusKm: 5.0,
      currencyCode: "USD",
      requestedLimit: 20,
      profiles: [{ profileId: "prof-1", isPrimary: true }],
    };

    it("executes 2-step call: POST session -> GET session items", async () => {
      const mockSessionResponse = {
        uuid: "session-uuid-123",
        mode: "SINGLE",
        status: "READY",
        requestSource: "WEB",
        requestedLimit: 20,
        candidateCount: 15,
        eligibleCount: 2,
        startedAt: "2026-08-22T12:00:00Z",
      };

      const mockItemsResponse = [
        {
          uuid: "item-1",
          menuItemId: 101,
          menuItemName: "Num Banh Chok",
          storeId: 5,
          storeName: "Khmer Traditional Kitchen",
          rankPosition: 1,
          finalScore: 0.95,
          candidateSource: "AI_JUDGMENT",
          distanceKm: 1.2,
          priceSnapshot: 3.5,
          currencyCode: "USD",
          reasonText: "Matches preference and safe for dietary restrictions",
          isExploration: false,
          createdAt: "2026-08-22T12:00:00Z",
        },
      ];

      global.fetch = vi
        .fn()
        // Step 1: POST session
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSessionResponse,
        } as Response)
        // Step 2: GET items
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockItemsResponse,
        } as Response);

      const result = await getRecommendations(mockRequest, "mock-jwt-token", 20);

      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        "https://api.mhoubahar.store/api/v1/recommendations/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer mock-jwt-token",
          },
          body: JSON.stringify(mockRequest),
        }
      );

      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        "https://api.mhoubahar.store/api/v1/recommendations/sessions/session-uuid-123/items?limit=20",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer mock-jwt-token",
          },
        }
      );

      expect(result.session).toEqual(mockSessionResponse);
      expect(result.items).toEqual(mockItemsResponse);
    });

    it("handles payload-wrapped session and items responses", async () => {
      const mockSession = {
        uuid: "session-uuid-456",
        mode: "GROUP",
        status: "READY",
        requestSource: "WEB",
        requestedLimit: 20,
        candidateCount: 20,
        eligibleCount: 0,
        startedAt: "2026-08-22T12:00:00Z",
      };

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ payload: mockSession }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ payload: [] }),
        } as Response);

      const groupRequest: CreateSessionRequest = {
        mode: "GROUP",
        requestSource: "WEB",
        searchRadiusKm: 5.0,
        currencyCode: "USD",
        requestedLimit: 20,
        profiles: [
          { profileId: "prof-1", isPrimary: true },
          { profileId: "prof-2", isPrimary: false },
        ],
      };

      const result = await getRecommendations(groupRequest, "mock-token");

      expect(result.session).toEqual(mockSession);
      expect(result.items).toEqual([]);
    });

    it("throws error if Step 1 (create session) fails", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        statusText: "Bad Request",
        json: async () => ({ message: "Invalid profile UUID" }),
      } as Response);

      await expect(getRecommendations(mockRequest, "mock-token")).rejects.toThrow(
        "Invalid profile UUID"
      );
    });

    it("throws error if Step 2 (get items) fails", async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ uuid: "session-123", status: "READY" }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          statusText: "Internal Server Error",
        } as Response);

      await expect(getRecommendations(mockRequest, "mock-token")).rejects.toThrow(
        "Failed to fetch recommendation items: Internal Server Error"
      );
    });
  });
});
