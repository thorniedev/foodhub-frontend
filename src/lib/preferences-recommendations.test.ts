import { describe, expect, it } from "vitest";
import type {
  CuisinePreferenceItem,
  CuisinePreferenceLevel,
  PreferenceResponse,
  ProfileResponse,
  RecordInteractionPayload,
  RecommendationItemResponse,
  UpdatePreferencesPayload,
} from "@/types/foodhub";
import {
  getSpiceDescriptor,
  TASTE_OPTIONS,
  TEXTURE_OPTIONS,
  CUISINE_OPTIONS,
  PREFERENCE_LEVELS,
} from "@/app/(dashboard)/dashboard/family-profile/[uuid]/ProfileEditForm";

describe("Profile Preferences & Behavioral Integration", () => {
  describe("Type Contracts & Payload Serialization", () => {
    it("should correctly structure UpdatePreferencesPayload according to API contract", () => {
      const payload: UpdatePreferencesPayload = {
        spiceTolerance: 7,
        minimumPrice: 2.5,
        maximumPrice: 15.0,
        currencyCode: "USD",
        defaultSearchRadiusKm: 5.0,
        tastePreferences: {
          sweet: false,
          spicy: true,
          sour: false,
          savory: true,
          soup: true,
        },
        texturePreferences: {
          crispy: true,
          chewy: false,
        },
      };

      expect(payload.spiceTolerance).toBe(7);
      expect(payload.minimumPrice).toBe(2.5);
      expect(payload.maximumPrice).toBe(15.0);
      expect(payload.currencyCode).toBe("USD");
      expect(payload.defaultSearchRadiusKm).toBe(5.0);
      expect(payload.tastePreferences?.spicy).toBe(true);
      expect(payload.tastePreferences?.sweet).toBe(false);
      expect(payload.texturePreferences?.crispy).toBe(true);
    });

    it("should correctly structure CuisinePreferenceItem array with priority levels", () => {
      const cuisines: CuisinePreferenceItem[] = [
        {
          cuisineCode: "KHMER",
          preferenceLevel: "LOVE",
          priority: 1,
        },
        {
          cuisineCode: "JAPANESE",
          preferenceLevel: "LIKE",
          priority: 2,
        },
        {
          cuisineCode: "WESTERN",
          preferenceLevel: "AVOID",
          priority: 3,
        },
      ];

      expect(cuisines).toHaveLength(3);
      expect(cuisines[0].cuisineCode).toBe("KHMER");
      expect(cuisines[0].preferenceLevel).toBe("LOVE");
      expect(cuisines[0].priority).toBe(1);
      expect(cuisines[2].preferenceLevel).toBe("AVOID");
    });

    it("should guarantee non-null preferences on ProfileResponse", () => {
      const mockProfile: ProfileResponse = {
        uuid: "550e8400-e29b-41d4-a716-446655440000",
        profileName: "Sokha",
        relationship: "SELF",
        gender: "MALE",
        dateOfBirth: "1998-05-15",
        preferredLanguage: "km",
        avatarMediaUuid: null,
        ageGroup: {
          uuid: "age-1",
          code: "ADULT",
          name: "Adult",
          minAge: 18,
          maxAge: 60,
        },
        isDefault: true,
        isActive: true,
        allergies: [],
        dietaryTypes: [],
        medicalConditions: [],
        preferences: {
          cuisineCodes: ["KHMER", "JAPANESE"],
          tasteCodes: ["spicy", "savory", "soup"],
          textureCodes: ["crispy"],
          spiceLevel: "7",
          minimumBudget: 2.0,
          maximumBudget: 15.0,
          radiusMeters: 5000,
        },
        createdAt: "2026-08-01T10:00:00Z",
        updatedAt: "2026-08-26T15:00:00Z",
      };

      expect(mockProfile.preferences).toBeDefined();
      expect(mockProfile.preferences.cuisineCodes).toContain("KHMER");
      expect(mockProfile.preferences.spiceLevel).toBe("7");
      expect(mockProfile.preferences.radiusMeters).toBe(5000);
    });
  });

  describe("Spice Level & UI Helpers", () => {
    it("should return correct descriptors for spice levels", () => {
      expect(getSpiceDescriptor(0).labelKm).toContain("មិនហឹរ");
      expect(getSpiceDescriptor(3).labelKm).toContain("ហឹរតិចតួច");
      expect(getSpiceDescriptor(5).labelKm).toContain("ហឹរមធ្យម");
      expect(getSpiceDescriptor(7).labelKm).toContain("ហឹរខ្លាំង");
      expect(getSpiceDescriptor(10).labelKm).toContain("ហឹរខ្លាំងបំផុត");
    });

    it("should define standard Taste, Texture and Cuisine options", () => {
      expect(TASTE_OPTIONS.map((t) => t.key)).toEqual(
        expect.arrayContaining(["spicy", "savory", "soup", "sweet", "sour", "bitter"])
      );
      expect(TEXTURE_OPTIONS.map((t) => t.key)).toEqual(
        expect.arrayContaining(["crispy", "chewy", "creamy", "tender", "crunchy"])
      );
      expect(CUISINE_OPTIONS.map((c) => c.code)).toEqual(
        expect.arrayContaining(["KHMER", "JAPANESE", "CHINESE", "KOREAN", "VIETNAMESE"])
      );
      expect(PREFERENCE_LEVELS.map((p) => p.value)).toEqual(
        expect.arrayContaining(["LOVE", "LIKE", "NEUTRAL", "DISLIKE", "AVOID"])
      );
    });
  });

  describe("Behavioral Interactions Telemetry", () => {
    it("should format RecordInteractionPayload correctly", () => {
      const interaction: RecordInteractionPayload = {
        clientEventId: "770e8400-e29b-41d4-a716-446655440001",
        profileUuid: "550e8400-e29b-41d4-a716-446655440000",
        menuItemUuid: "menu-item-123",
        eventType: "LIKE",
        dwellTimeMs: 3500,
        occurredAt: "2026-08-26T15:10:00",
      };

      expect(interaction.eventType).toBe("LIKE");
      expect(interaction.dwellTimeMs).toBe(3500);
      expect(interaction.occurredAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("should support all required interaction event signal types", () => {
      const supportedEvents = [
        "LIKE",
        "ACCEPT",
        "BOOKMARK",
        "DISLIKE",
        "REJECT",
        "SKIP",
        "VIEW",
        "CLICK",
      ];

      supportedEvents.forEach((evt) => {
        const payload: RecordInteractionPayload = {
          clientEventId: "test-uuid",
          eventType: evt as any,
          occurredAt: new Date().toISOString(),
        };
        expect(payload.eventType).toBe(evt);
      });
    });
  });

  describe("Recommendation Engine Contract", () => {
    it("should validate RecommendationItemResponse structure", () => {
      const recItem: RecommendationItemResponse = {
        uuid: "rec-item-1",
        menuItemId: 101,
        menuItemUuid: "menu-item-101",
        menuItemName: "Num Banh Chok Samlor Khmer",
        storeId: 201,
        storeName: "Mhoub Khmer Original",
        rankPosition: 1,
        finalScore: 0.94,
        candidateSource: "CONTENT_BASED",
        priceSnapshot: 3.5,
        currencyCode: "USD",
        reasonText: "ត្រូវនឹងចំណូលចិត្តម្ហូបខ្មែរ និងកម្រិតហឹររបស់អ្នក",
        isExploration: false,
      };

      expect(recItem.rankPosition).toBe(1);
      expect(recItem.finalScore).toBeGreaterThan(0.9);
      expect(recItem.candidateSource).toBe("CONTENT_BASED");
      expect(recItem.reasonText).toContain("ខ្មែរ");
    });
  });
});
