import type {
  MeetupActionResponse,
  MeetupGroupResponse,
  MeetupMeetingPointResponse,
  MeetupParticipantResponse,
  MeetupRecommendationItem,
  MeetupRecommendationSessionResponse,
  MeetupRecommendationStatus,
  MeetupResultResponse,
  MeetupVoteResponse,
  MeetupVoteTallyResponse,
  MeetupVotesResponse,
  MeetupWinningCardResponse,
} from "@/types/meetup-api";

type UnknownRecord = Record<string, unknown>;

const ENVELOPE_KEYS = ["data", "payload", "result"] as const;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapEnvelope(value: unknown): unknown {
  let current: unknown = value;

  for (let depth = 0; depth < 4; depth += 1) {
    if (!isRecord(current)) {
      break;
    }

    const record: UnknownRecord = current;

    let nextValue: unknown = undefined;
    let foundEnvelope = false;

    for (const key of ENVELOPE_KEYS) {
      if (record[key] !== undefined) {
        nextValue = record[key];
        foundEnvelope = true;
        break;
      }
    }

    if (!foundEnvelope) {
      break;
    }
    current = nextValue;
  }
  return current;
}

function getString(
  record: UnknownRecord,
  keys: readonly string[],
): string | null {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value;
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

function getBoolean(
  record: UnknownRecord,
  keys: readonly string[],
): boolean | undefined {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "boolean") {
      return value;
    }
  }

  return undefined;
}

function getArray(record: UnknownRecord, keys: readonly string[]): unknown[] {
  for (const key of keys) {
    const value = record[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function getEnvelopeRecord(response: unknown): UnknownRecord {
  const unwrapped = unwrapEnvelope(response);

  return isRecord(unwrapped) ? unwrapped : {};
}

function getOuterRecord(response: unknown): UnknownRecord {
  return isRecord(response) ? response : {};
}

function getNestedRecord(
  record: UnknownRecord,
  keys: readonly string[],
): UnknownRecord | null {
  for (const key of keys) {
    const value = record[key];

    if (isRecord(value)) {
      return value;
    }
  }

  return null;
}

function getStringArray(
  record: UnknownRecord,
  keys: readonly string[],
): string[] {
  return getArray(record, keys).flatMap((value) => {
    if (typeof value === "string" && value.trim()) {
      return [value.trim()];
    }

    if (isRecord(value)) {
      const label = getString(value, [
        "uuid",
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

export function normalizeMeetupParticipantResponse(
  response: unknown,
): MeetupParticipantResponse {
  const envelope = getEnvelopeRecord(response);

  const record = getNestedRecord(envelope, ["participant"]) ?? envelope;
  const locationLat = getNumber(record, ["locationLat", "latitude"]);
  const locationLng = getNumber(record, ["locationLng", "longitude"]);
  const locationAreaName = getString(record, [
    "locationAreaName",
    "targetAreaName",
    "areaName",
  ]);
  const locationCity = getString(record, ["locationCity", "targetCity", "city"]);
  const locationProvince = getString(record, [
    "locationProvince",
    "targetProvince",
    "province",
  ]);
  const locationInputType = getString(record, ["locationInputType"]);
  const inferredLocationMode =
    getString(record, ["locationMode"]) ??
    (locationLat !== null && locationLng !== null
      ? "PIN"
      : locationAreaName || locationCity || locationProvince
        ? "AREA"
        : null);

  return {
    id: getNumber(record, ["id"]),
    uuid: getString(record, ["uuid", "participantUuid"]),
    meetupUuid: getString(record, ["meetupUuid", "groupUuid"]),
    profileId: getNumber(record, ["profileId"]),
    profileUuid: getString(record, ["profileUuid", "profileUUID"]),
    nickname: getString(record, ["nickname", "name", "displayName"]),
    participantRole: getString(record, [
      "participantRole",
      "role",
    ]) as MeetupParticipantResponse["participantRole"],
    locationLat,
    locationLng,
    locationInputType,
    locationMode: inferredLocationMode,
    locationAreaName,
    locationCity,
    locationProvince,
    targetAreaName: locationAreaName,
    targetCity: locationCity,
    targetProvince: locationProvince,
    mapsLink: getString(record, ["mapsLink", "mapUrl"]),
    guestToken: getString(record, ["guestToken", "participantToken"]),
    dietaryTypes: getStringArray(record, ["dietaryTypes"]),
    dietaryRestrictions: getStringArray(record, ["dietaryRestrictions"]),
    allergies: getStringArray(record, ["allergies"]),
    budgetMin: getNumber(record, ["budgetMin", "minimumBudget"]),
    budgetMax: getNumber(record, ["budgetMax", "maximumBudget"]),
    budgetRange: getString(record, ["budgetRange"]),
    joinedAt: getString(record, ["joinedAt", "createdAt"]),
    raw: response,
  };
}

function normalizeParticipantRecord(value: unknown): MeetupParticipantResponse {
  return normalizeMeetupParticipantResponse(value);
}

export function normalizeMeetupGroupResponse(
  response: unknown,
): MeetupGroupResponse {
  const envelope = getEnvelopeRecord(response);

  const groupRecord =
    getNestedRecord(envelope, ["meetup", "group"]) ?? envelope;

  const participants = getArray(groupRecord, ["participants"]).map(
    normalizeParticipantRecord,
  );

  return {
    id: getNumber(groupRecord, ["id"]),

    uuid: getString(groupRecord, ["uuid", "meetupUuid", "groupUuid"]),

    shareToken:
      getString(envelope, ["shareToken", "inviteCode"]) ??
      getString(groupRecord, ["shareToken", "inviteCode"]),

    createdByUserId: getNumber(groupRecord, ["createdByUserId"]),

    title: getString(groupRecord, ["title", "groupName", "name"]),

    status: getString(groupRecord, ["status", "meetupStatus"]),

    votingMethod: getString(groupRecord, ["votingMethod"]),

    audienceMode: getString(groupRecord, ["audienceMode", "inviteMode"]),

    locationMode: getString(groupRecord, ["locationMode"]),

    searchRadiusKm: getNumber(groupRecord, ["searchRadiusKm", "radiusKm"]),

    timezone: getString(groupRecord, ["timezone"]),

    targetAreaName: getString(groupRecord, ["targetAreaName", "areaName"]),

    targetCity: getString(groupRecord, ["targetCity", "city"]),

    targetProvince: getString(groupRecord, ["targetProvince", "province"]),

    targetLat: getNumber(groupRecord, ["targetLat", "latitude"]),

    targetLng: getNumber(groupRecord, ["targetLng", "longitude"]),

    meetingPointLat: getNumber(groupRecord, [
      "meetingPointLat",
      "meetingPointLatitude",
    ]),

    meetingPointLng: getNumber(groupRecord, [
      "meetingPointLng",
      "meetingPointLongitude",
    ]),

    meetingPointMethod: getString(groupRecord, ["meetingPointMethod"]),

    candidateStoreUuids: getStringArray(groupRecord, ["candidateStoreUuids"]),

    participants,

    winningCandidateId: getNumber(groupRecord, ["winningCandidateId"]),

    winningCandidateUuid: getString(groupRecord, [
      "winningCandidateUuid",
      "winningCandidateUUID",
      "winningFoodUuid",
      "winningCandidate",
    ]),

    winningCandidateName: getString(groupRecord, [
      "winningCandidateName",
      "winningFoodName",
      "winnerName",
    ]),

    guestAllowed: getBoolean(groupRecord, ["guestAllowed"]),

    expectedGuestCount: getNumber(groupRecord, ["expectedGuestCount"]),

    maxParticipants: getNumber(groupRecord, [
      "maxParticipants",
      "maximumParticipants",
    ]),

    expiresAt: getString(groupRecord, ["expiresAt"]),

    decidedAt: getString(groupRecord, ["decidedAt"]),

    createdAt: getString(groupRecord, ["createdAt"]),

    updatedAt: getString(groupRecord, ["updatedAt"]),

    raw: response,
  };
}

export function normalizeMeetupMeetingPointResponse(
  response: unknown,
): MeetupMeetingPointResponse {
  const record = getEnvelopeRecord(response);

  return {
    id: getNumber(record, ["id"]),

    meetingPointLat: getNumber(record, [
      "meetingPointLat",
      "meetingPointLatitude",
    ]),

    meetingPointLng: getNumber(record, [
      "meetingPointLng",
      "meetingPointLongitude",
    ]),

    meetingPointMethod: getString(record, ["meetingPointMethod"]),

    raw: response,
  };
}

function normalizeRecommendationItem(
  response: unknown,
): MeetupRecommendationItem {
  const record = isRecord(response) ? response : {};

  return {
    uuid: getString(record, ["uuid", "candidateUuid"]),
    menuItemId: getNumber(record, ["menuItemId", "foodId"]),
    menuItemName: getString(record, ["menuItemName", "foodName", "name"]),
    storeId: getNumber(record, ["storeId"]),
    storeName: getString(record, ["storeName"]),
    distanceKm: getNumber(record, ["distanceKm"]),
    finalScore: getNumber(record, ["finalScore", "recommendationScore"]),
    priceSnapshot: getNumber(record, ["priceSnapshot", "price"]),
    currencyCode: getString(record, ["currencyCode"]),
    raw: response,
  };
}

export function normalizeMeetupRecommendationSessionResponse(
  response: unknown,
): MeetupRecommendationSessionResponse {
  const record = getEnvelopeRecord(response);

  const status = getString(record, ["status"]);

  return {
    uuid: getString(record, ["uuid", "sessionUuid"]),

    status: status as MeetupRecommendationStatus | null,

    requestedLimit: getNumber(record, ["requestedLimit", "candidateLimit"]),

    items: getArray(record, ["items", "recommendations", "candidates"]).map(
      normalizeRecommendationItem,
    ),

    raw: response,
  };
}

export function normalizeMeetupVoteResponse(
  response: unknown,
): MeetupVoteResponse {
  const envelope = getEnvelopeRecord(response);

  const record = getNestedRecord(envelope, ["vote"]) ?? envelope;

  return {
    uuid: getString(record, ["uuid", "voteUuid", "id"]),
    meetupUuid: getString(record, ["meetupUuid", "groupUuid"]),
    participantUuid: getString(record, ["participantUuid"]),
    candidateUuid: getString(record, ["candidateUuid", "storeCandidateUuid"]),
    foodUuid: getString(record, ["foodUuid", "menuItemUuid"]),
    rankChoice: getNumber(record, ["rankChoice", "rank"]),
    createdAt: getString(record, ["createdAt", "votedAt"]),
    raw: response,
  };
}

export function normalizeMeetupVotesResponse(
  response: unknown,
): MeetupVotesResponse {
  const unwrapped = unwrapEnvelope(response);

  if (Array.isArray(unwrapped)) {
    return {
      votes: unwrapped.map(normalizeMeetupVoteResponse),

      raw: response,
    };
  }

  const record = isRecord(unwrapped) ? unwrapped : {};

  return {
    votes: getArray(record, ["votes", "results", "content", "items"]).map(
      normalizeMeetupVoteResponse,
    ),

    raw: response,
  };
}

function normalizeTallyEntry(response: unknown) {
  const record = isRecord(response) ? response : {};

  return {
    candidateUuid:
      getString(record, ["candidateUuid", "foodUuid", "menuItemUuid"]) ?? "",
    foodUuid: getString(record, ["foodUuid", "menuItemUuid"]),
    candidateName:
      getString(record, ["candidateName", "foodName", "menuItemName"]) ??
      undefined,
    foodName: getString(record, ["foodName", "menuItemName"]),
    storeName: getString(record, ["storeName"]),
    voteCount: getNumber(record, ["voteCount", "votes", "count"]) ?? 0,
  };
}

export function normalizeMeetupVoteTallyResponse(
  response: unknown,
): MeetupVoteTallyResponse {
  const record = getEnvelopeRecord(response);

  return {
    meetupUuid: getString(record, ["meetupUuid", "groupUuid"]),
    totalVotes: getNumber(record, ["totalVotes", "voteCount", "votes"]) ?? 0,
    tally: getArray(record, ["tally", "results", "items"]).map(
      normalizeTallyEntry,
    ),
  };
}

export function normalizeMeetupWinningCardResponse(
  response: unknown,
): MeetupWinningCardResponse {
  const record = getEnvelopeRecord(response);

  return {
    meetupUuid: getString(record, ["meetupUuid", "groupUuid"]) ?? "",
    shareToken: getString(record, ["shareToken"]),
    title: getString(record, ["title", "meetupTitle", "groupName"]) ?? "",
    status: getString(record, ["status", "meetupStatus"]),
    resultReady:
      getBoolean(record, ["resultReady", "ready"]) ??
      (getString(record, ["status"])?.toUpperCase() === "DECIDED"),
    winningCandidateId: getNumber(record, ["winningCandidateId"]),
    winningCandidateUuid: getString(record, [
      "winningCandidateUuid",
      "winningFoodUuid",
      "foodUuid",
      "candidateUuid",
    ]),
    winningCandidateName:
      getString(record, [
        "winningCandidateName",
        "winningFoodName",
        "foodName",
        "candidateName",
        "storeName",
      ]) ?? "",
    totalVotes: getNumber(record, ["totalVotes", "voteCount"]) ?? 0,
    meetingPointLat: getNumber(record, ["meetingPointLat", "targetLat"]),
    meetingPointLng: getNumber(record, ["meetingPointLng", "targetLng"]),
    mapsDirectionsUrl:
      getString(record, ["mapsDirectionsUrl", "directionsUrl", "mapsLink"]) ??
      "",
    decidedAt: getString(record, ["decidedAt", "updatedAt"]),
    storeUuid: getString(record, ["storeUuid"]) ?? undefined,
    storeName: getString(record, ["storeName"]) ?? undefined,
    storeAddress: getString(record, ["storeAddress", "address"]) ?? undefined,
    storeLatitude: getNumber(record, ["storeLatitude"]) ?? undefined,
    storeLongitude: getNumber(record, ["storeLongitude"]) ?? undefined,
    foodName: getString(record, ["foodName", "menuItemName"]) ?? undefined,
    foodPhotoUrl: getString(record, ["foodPhotoUrl", "photoUrl", "imageUrl"]) ??
      undefined,
    rating: getNumber(record, ["rating", "averageRating"]) ?? undefined,
    price: getNumber(record, ["price", "priceSnapshot"]) ?? undefined,
    currencyCode: getString(record, ["currencyCode"]) ?? undefined,
    distanceKm: getNumber(record, ["distanceKm"]) ?? undefined,
  };
}

export function normalizeMeetupResultResponse(
  response: unknown,
): MeetupResultResponse {
  const record = getEnvelopeRecord(response);
  const winningCard = normalizeMeetupWinningCardResponse(response);
  const tally = getArray(record, ["tally", "results", "items"]).map(
    normalizeTallyEntry,
  );

  return {
    ...winningCard,
    resultReady:
      winningCard.resultReady ??
      Boolean(winningCard.winningCandidateId || winningCard.winningCandidateUuid),
    tally,
    message: getString(record, ["message", "detail"]),
    raw: response,
  };
}

export function normalizeMeetupActionResponse(
  response: unknown,
): MeetupActionResponse {
  const outer = getOuterRecord(response);

  const payload = getEnvelopeRecord(response);

  const explicitSuccess =
    typeof outer.success === "boolean"
      ? outer.success
      : typeof payload.success === "boolean"
        ? payload.success
        : null;

  const status =
    getNumber(outer, ["status", "statusCode"]) ??
    getNumber(payload, ["status", "statusCode"]);

  const textStatus =
    getString(payload, ["status"]) ?? getString(outer, ["status"]);

  return {
    success:
      explicitSuccess ??
      (status !== null
        ? status >= 200 && status < 300
        : textStatus?.toUpperCase() !== "FAILED"),

    message:
      getString(outer, ["message", "detail"]) ??
      getString(payload, ["message", "detail"]),

    status,

    raw: response,
  };
}
