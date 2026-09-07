import { describe, expect, it } from "vitest";

import {
  buildMeetupSlate,
  collectMeetupProfileUuids,
  groupCandidatesByStore,
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
    storeUuid: null,
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

describe("groupCandidatesByStore", () => {
  function candidate(overrides: Partial<MeetupCandidate> = {}): MeetupCandidate {
    return {
      foodUuid: "food-1",
      menuItemUuid: "menu-1",
      storeUuid: "store-1",
      foodName: "Kuy Teav",
      storeName: "Noodle House",
      photoUrl: null,
      rating: 4.5,
      price: 3.5,
      currencyCode: "USD",
      distanceKm: 1.2,
      finalScore: 0.9,
      reasonText: null,
      reasonCodes: [],
      safetyStatus: "SAFE",
      dietaryTags: [],
      allergenTags: [],
      ...overrides,
    };
  }

  /*
   * The reason for store voting: two dishes at one restaurant used to be two
   * competing cards, so a restaurant everyone liked could lose to one nobody
   * agreed on.
   */
  it("collapses dishes from one store onto a single votable card", () => {
    const stores = groupCandidatesByStore([
      candidate({ foodUuid: "food-1", finalScore: 0.9 }),
      candidate({ foodUuid: "food-2", foodName: "Fish Amok", finalScore: 0.7 }),
    ]);

    expect(stores).toHaveLength(1);
    expect(stores[0].storeUuid).toBe("store-1");
    expect(stores[0].items.map((item) => item.foodName)).toEqual([
      "Kuy Teav",
      "Fish Amok",
    ]);
  });

  it("keeps separate stores apart and orders them by their best dish", () => {
    const stores = groupCandidatesByStore([
      candidate({ storeUuid: "store-a", storeName: "A", finalScore: 0.4 }),
      candidate({ storeUuid: "store-b", storeName: "B", finalScore: 0.95 }),
    ]);

    expect(stores.map((store) => store.storeName)).toEqual(["B", "A"]);
  });

  it("summarises a store from the dishes that survived safety", () => {
    const stores = groupCandidatesByStore([
      candidate({ foodUuid: "food-1", price: 6, distanceKm: 2.5, rating: 4.1 }),
      candidate({ foodUuid: "food-2", price: 3, distanceKm: 1.1, rating: 4.7 }),
    ]);

    /* Cheapest dish and nearest reading are what the card advertises. */
    expect(stores[0].minPrice).toBe(3);
    expect(stores[0].distanceKm).toBe(1.1);
    expect(stores[0].rating).toBe(4.7);
    expect(stores[0].bestScore).toBe(0.9);
  });

  /*
   * A guest's declared allergy hides a dish for that viewer only. The store
   * stays votable as long as something there is still safe for them.
   */
  it("drops only the hidden dish when a store still has a safe one", () => {
    const session = {
      allergies: ["peanut"],
    } as unknown as StoredMeetupSession;

    const slate = buildMeetupSlate(
      [
        makeItem({
          foodUuid: "food-1",
          storeUuid: "store-1",
          raw: { storeUuid: "store-1", allergens: ["peanut"] },
        }),
        makeItem({
          foodUuid: "food-2",
          storeUuid: "store-1",
          raw: { storeUuid: "store-1" },
        }),
      ],
      session,
    );

    const stores = groupCandidatesByStore(slate.candidates);

    expect(slate.hiddenForAllergies).toBe(1);
    expect(stores).toHaveLength(1);
    expect(stores[0].items).toHaveLength(1);
    expect(stores[0].items[0].foodUuid).toBe("food-2");
  });

  /*
   * If every dish at a store was hidden for this viewer, offering the store
   * would send them somewhere they cannot safely eat.
   */
  it("removes a store whose every dish was hidden for the viewer", () => {
    const session = {
      allergies: ["peanut"],
    } as unknown as StoredMeetupSession;

    const slate = buildMeetupSlate(
      [
        makeItem({
          foodUuid: "food-1",
          storeUuid: "store-1",
          raw: { storeUuid: "store-1", allergens: ["peanut"] },
        }),
      ],
      session,
    );

    expect(groupCandidatesByStore(slate.candidates)).toEqual([]);
  });

  /* The badge is a claim the backend made, so one unchecked dish withdraws it. */
  it("only calls a store verified safe when every dish was checked", () => {
    const mixed = groupCandidatesByStore([
      candidate({ foodUuid: "food-1", safetyStatus: "SAFE" }),
      candidate({ foodUuid: "food-2", safetyStatus: null }),
    ]);

    expect(mixed[0].isVerifiedSafe).toBe(false);

    const allChecked = groupCandidatesByStore([
      candidate({ foodUuid: "food-1", safetyStatus: "SAFE" }),
      candidate({ foodUuid: "food-2", safetyStatus: "SAFE" }),
    ]);

    expect(allChecked[0].isVerifiedSafe).toBe(true);
  });

  /* Falling back to the name keeps the dish rather than silently dropping it. */
  it("groups by store name when the item carries no store uuid", () => {
    const stores = groupCandidatesByStore([
      candidate({ storeUuid: null, storeName: "Nameless Uuid Cafe" }),
      candidate({
        storeUuid: null,
        storeName: "Nameless Uuid Cafe",
        foodUuid: "food-2",
      }),
    ]);

    expect(stores).toHaveLength(1);
    expect(stores[0].items).toHaveLength(2);
  });
});
