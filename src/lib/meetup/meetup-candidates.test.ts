import { describe, expect, it } from "vitest";

import {
  buildMeetupSlate,
  collectMeetupProfileUuids,
  hasDeclaredAllergenConflict,
  toMeetupCandidate,
  type MeetupCandidate,
} from "./meetup-candidates";
import type { StoredMeetupSession } from "./meetup-session";
import type { MeetupParticipantResponse } from "@/types/meetup-api";
import type { RecommendationItem } from "@/types/recommendation";

function makeItem(
  overrides: Partial<RecommendationItem> & { raw?: unknown } = {},
): RecommendationItem {
  return {
    uuid: "item-uuid",
    menuItemUuid: "menu-item-uuid",
    foodUuid: "food-uuid",
    menuItemName: "Kuy Teav",
    storeName: "Noodle House",
    rankPosition: 1,
    finalScore: 0.9,
    groupScore: null,
    candidateSource: null,
    distanceKm: 1.2,
    priceSnapshot: 3.5,
    currencyCode: "USD",
    reasonCodes: null,
    reasonText: null,
    scoreBreakdown: null,
    isExploration: false,
    ...overrides,
  } as RecommendationItem;
}

function makeParticipant(
  overrides: Partial<MeetupParticipantResponse> = {},
): MeetupParticipantResponse {
  return {
    id: 1,
    uuid: "participant-uuid",
    meetupUuid: "meetup-uuid",
    profileId: 1,
    profileUuid: "profile-a",
    nickname: "Dara",
    participantRole: "MEMBER",
    locationLat: null,
    locationLng: null,
    status: "ACTIVE",
    resolveStatus: "RESOLVED",
    leftAt: null,
    mapsLink: null,
    joinedAt: null,
    raw: null,
    ...overrides,
  } as MeetupParticipantResponse;
}

function makeCandidate(
  overrides: Partial<MeetupCandidate> = {},
): MeetupCandidate {
  return {
    foodUuid: "food-uuid",
    menuItemUuid: "menu-item-uuid",
    foodName: "Kuy Teav",
    storeName: "Noodle House",
    photoUrl: null,
    rating: null,
    price: null,
    currencyCode: "USD",
    distanceKm: null,
    finalScore: null,
    reasonText: null,
    reasonCodes: [],
    safetyStatus: null,
    dietaryTags: [],
    allergenTags: [],
    ...overrides,
  };
}

describe("toMeetupCandidate", () => {
  it("keeps the canonical food uuid the vote endpoint resolves against", () => {
    const candidate = toMeetupCandidate(makeItem());

    expect(candidate?.foodUuid).toBe("food-uuid");
    expect(candidate?.menuItemUuid).toBe("menu-item-uuid");
  });

  it("drops an item that only has a menu-item uuid", () => {
    /* Voting on a menu-item uuid is rejected by the backend as "Food not found". */
    const candidate = toMeetupCandidate(
      makeItem({ foodUuid: null, uuid: "menu-item-uuid" }),
    );

    expect(candidate).toBeNull();
  });

  it("reads the food uuid out of a nested raw payload", () => {
    const candidate = toMeetupCandidate(
      makeItem({
        foodUuid: null,
        raw: { food: { uuid: "nested-food-uuid", name: "Fish Amok" } },
      }),
    );

    expect(candidate?.foodUuid).toBe("nested-food-uuid");
    expect(candidate?.foodName).toBe("Kuy Teav");
  });
});

describe("collectMeetupProfileUuids", () => {
  it("sorts and dedupes so every client builds the same slate request", () => {
    const uuids = collectMeetupProfileUuids([
      makeParticipant({ profileUuid: "profile-c" }),
      makeParticipant({ profileUuid: "profile-a" }),
      makeParticipant({ profileUuid: "profile-c" }),
    ]);

    expect(uuids).toEqual(["profile-a", "profile-c"]);
  });

  it("ignores departed participants and guests without a profile", () => {
    const uuids = collectMeetupProfileUuids([
      makeParticipant({ profileUuid: "profile-a" }),
      makeParticipant({ profileUuid: "profile-b", status: "LEFT" }),
      makeParticipant({ profileUuid: "profile-c", status: "REMOVED" }),
      makeParticipant({ profileUuid: null }),
    ]);

    expect(uuids).toEqual(["profile-a"]);
  });
});

describe("hasDeclaredAllergenConflict", () => {
  it("matches an allergen regardless of case or surrounding wording", () => {
    const candidate = makeCandidate({ allergenTags: ["Contains PEANUT"] });

    expect(hasDeclaredAllergenConflict(candidate, ["peanut"])).toBe(true);
  });

  it("does not flag a dish when the viewer declared no allergies", () => {
    const candidate = makeCandidate({ allergenTags: ["PEANUT"] });

    expect(hasDeclaredAllergenConflict(candidate, [])).toBe(false);
    expect(hasDeclaredAllergenConflict(candidate, null)).toBe(false);
  });
});

describe("buildMeetupSlate", () => {
  const guestWithAllergy = {
    participantUuid: "participant-uuid",
    joinMode: "GUEST",
    allergies: ["PEANUT"],
    dietaryTypes: [],
  } as StoredMeetupSession;

  it("removes backend-blocked dishes for everyone", () => {
    const slate = buildMeetupSlate(
      [
        makeItem({ foodUuid: "safe-food", raw: { safetyStatus: "SAFE" } }),
        makeItem({ foodUuid: "unsafe-food", raw: { safetyStatus: "BLOCKED" } }),
      ],
      null,
    );

    expect(slate.candidates.map((item) => item.foodUuid)).toEqual(["safe-food"]);
    expect(slate.hiddenForAllergies).toBe(0);
  });

  it("hides a viewer's allergen conflicts and reports how many", () => {
    const slate = buildMeetupSlate(
      [
        makeItem({ foodUuid: "plain-food" }),
        makeItem({
          foodUuid: "peanut-food",
          raw: { allergens: ["PEANUT"] },
        }),
      ],
      guestWithAllergy,
    );

    expect(slate.candidates.map((item) => item.foodUuid)).toEqual([
      "plain-food",
    ]);
    expect(slate.hiddenForAllergies).toBe(1);
  });

  it("gives two viewers the same slate when neither declared an allergy", () => {
    const items = [
      makeItem({ foodUuid: "food-a" }),
      makeItem({ foodUuid: "food-b" }),
    ];

    const host = buildMeetupSlate(items, null);
    const guest = buildMeetupSlate(items, {
      participantUuid: "other",
      joinMode: "GUEST",
      allergies: [],
      dietaryTypes: [],
    } as StoredMeetupSession);

    expect(host.candidates.map((item) => item.foodUuid)).toEqual([
      "food-a",
      "food-b",
    ]);
    expect(guest.candidates.map((item) => item.foodUuid)).toEqual([
      "food-a",
      "food-b",
    ]);
  });
});
