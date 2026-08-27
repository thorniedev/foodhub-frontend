import type { RecommendationItem } from "@/types/recommendation";
import type { MeetupParticipantResponse } from "@/types/meetup-api";
import type { StoredMeetupSession } from "./meetup-session";

/**
 * A single dish a meetup can vote on.
 *
 * `foodUuid` is always a canonical Food uuid. The meetup vote endpoint resolves
 * the vote through the food catalog, so a menu-item uuid would be rejected as
 * "Food not found" — see {@link toMeetupCandidate}.
 */
export interface MeetupCandidate {
  foodUuid: string;
  menuItemUuid: string | null;
  foodName: string;
  storeName: string;
  photoUrl: string | null;
  rating: number | null;
  price: number | null;
  currencyCode: string;
  distanceKm: number | null;
  finalScore: number | null;
  reasonText: string | null;
  reasonCodes: string[];
  safetyStatus: string | null;
  dietaryTags: string[];
  allergenTags: string[];
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(
  record: UnknownRecord,
  keys: readonly string[],
): string | null {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getNumber(
  record: UnknownRecord,
  keys: readonly string[],
): number | null {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function readNestedRecord(
  record: UnknownRecord,
  keys: readonly string[],
): UnknownRecord {
  for (const key of keys) {
    const value = record[key];

    if (isRecord(value)) {
      return value;
    }
  }

  return {};
}

function getStringArray(
  record: UnknownRecord,
  keys: readonly string[],
): string[] {
  for (const key of keys) {
    const value = record[key];

    if (Array.isArray(value)) {
      return value.flatMap((entry) => {
        if (typeof entry === "string" && entry.trim()) {
          return [entry.trim()];
        }

        if (isRecord(entry)) {
          const label = getString(entry, [
            "code",
            "name",
            "localName",
            "allergenCode",
            "dietaryTypeCode",
          ]);

          return label ? [label] : [];
        }

        return [];
      });
    }
  }

  return [];
}

function getItemRaw(item: RecommendationItem): UnknownRecord {
  const candidate = item as RecommendationItem & { raw?: unknown };

  return isRecord(candidate.raw) ? candidate.raw : {};
}

/**
 * Maps a recommendation item onto a votable candidate.
 *
 * Returns `null` when the item carries no canonical food uuid: the meetup vote
 * endpoint looks the vote up in the food catalog, so an item that only has a
 * menu-item uuid can never be voted on and must stay out of the slate rather
 * than fail at vote time.
 */
export function toMeetupCandidate(
  item: RecommendationItem,
): MeetupCandidate | null {
  const raw = getItemRaw(item);
  const food = readNestedRecord(raw, ["food"]);
  const menuItem = readNestedRecord(raw, ["menuItem"]);
  const store = readNestedRecord(raw, ["store"]);
  const recommendation = readNestedRecord(raw, ["recommendation"]);

  const foodUuid =
    item.foodUuid ||
    getString(raw, ["foodUuid", "food_uuid"]) ||
    getString(food, ["uuid", "foodUuid"]);

  if (!foodUuid) {
    return null;
  }

  return {
    foodUuid,
    menuItemUuid:
      item.menuItemUuid ||
      getString(raw, ["menuItemUuid", "menu_item_uuid"]) ||
      getString(menuItem, ["uuid"]),
    foodName:
      item.menuItemName ||
      getString(raw, ["foodName", "menuItemName", "name"]) ||
      getString(food, ["name", "localName", "canonicalName"]) ||
      "FoodHub item",
    storeName:
      item.storeName ||
      getString(raw, ["storeName"]) ||
      getString(store, ["name", "storeName"]) ||
      "FoodHub store",
    photoUrl:
      getString(raw, ["photoUrl", "foodPhotoUrl", "imageUrl", "thumbnail"]) ||
      getString(food, ["imageUrl", "photoUrl", "thumbnail"]) ||
      getString(menuItem, ["imageUrl", "photoUrl", "thumbnail"]) ||
      null,
    rating:
      getNumber(raw, ["rating", "averageRating"]) ??
      getNumber(store, ["averageRating", "rating"]),
    price:
      item.priceSnapshot ??
      getNumber(raw, ["price", "priceSnapshot"]) ??
      getNumber(menuItem, ["price"]),
    currencyCode: item.currencyCode || getString(raw, ["currencyCode"]) || "USD",
    distanceKm: item.distanceKm ?? getNumber(raw, ["distanceKm"]),
    finalScore: item.finalScore ?? getNumber(raw, ["finalScore"]),
    reasonText:
      item.reasonText ||
      getString(raw, ["reasonText"]) ||
      getString(recommendation, ["reasonText"]),
    reasonCodes:
      item.reasonCodes ??
      getStringArray(raw, ["reasonCodes"]) ??
      getStringArray(recommendation, ["reasonCodes"]),
    safetyStatus:
      getString(raw, ["safetyStatus"]) ||
      getString(recommendation, ["safetyStatus"]),
    dietaryTags: [
      ...getStringArray(raw, ["dietaryTypes", "dietaryTags"]),
      ...getStringArray(food, ["dietaryTypes", "dietaryTags"]),
    ],
    allergenTags: [
      ...getStringArray(raw, ["allergenDeclarations", "allergens"]),
      ...getStringArray(food, ["allergenDeclarations", "allergens"]),
    ],
  };
}

/**
 * Every room member must vote on the same dishes, so the slate is derived from
 * the meetup itself — the profiles that joined it — and never from whoever
 * happens to be looking. The uuids are sorted so two clients build a request
 * the backend answers identically.
 */
export function collectMeetupProfileUuids(
  participants: readonly MeetupParticipantResponse[],
): string[] {
  const uuids = participants
    .filter((participant) => (participant.status ?? "ACTIVE") === "ACTIVE")
    .map((participant) => participant.profileUuid)
    .filter((profileUuid): profileUuid is string => Boolean(profileUuid));

  return Array.from(new Set(uuids)).sort();
}

function normalizeNeedles(values?: readonly string[] | null): string[] {
  return (values ?? [])
    .map((value) => value.toLowerCase().trim())
    .filter(Boolean);
}

/**
 * True when a dish is known to carry an allergen the viewer declared.
 *
 * Guests hold no FoodHub profile, so the backend safety engine never saw their
 * allergies. This is the only protection they have and it deliberately errs
 * toward hiding: an allergen match removes the dish from their slate.
 */
export function hasDeclaredAllergenConflict(
  candidate: MeetupCandidate,
  allergies: readonly string[] | null | undefined,
): boolean {
  const declared = normalizeNeedles(allergies);

  if (declared.length === 0) {
    return false;
  }

  const itemAllergens = normalizeNeedles(candidate.allergenTags);

  return itemAllergens.some((allergen) =>
    declared.some(
      (selected) => allergen.includes(selected) || selected.includes(allergen),
    ),
  );
}

export interface MeetupSlate {
  /** Dishes this viewer may vote on. */
  candidates: MeetupCandidate[];
  /** Dishes removed because they clash with the viewer's own allergies. */
  hiddenForAllergies: number;
}

/**
 * Splits the room's shared slate into what this viewer may see.
 *
 * Backend-blocked dishes drop for everyone. A viewer's declared allergies only
 * ever remove dishes for that viewer, and the count is reported so the UI can
 * explain the gap instead of silently showing a shorter list.
 */
export function buildMeetupSlate(
  items: readonly RecommendationItem[],
  session: StoredMeetupSession | null,
): MeetupSlate {
  const candidates: MeetupCandidate[] = [];
  let hiddenForAllergies = 0;

  for (const item of items) {
    const candidate = toMeetupCandidate(item);

    if (!candidate) {
      continue;
    }

    const safetyStatus = candidate.safetyStatus?.toUpperCase();

    if (
      safetyStatus === "BLOCKED" ||
      safetyStatus === "UNSAFE" ||
      safetyStatus === "DANGER"
    ) {
      continue;
    }

    if (hasDeclaredAllergenConflict(candidate, session?.allergies)) {
      hiddenForAllergies += 1;
      continue;
    }

    candidates.push(candidate);
  }

  return { candidates, hiddenForAllergies };
}
