import type {
  MeetupActionResponse,
  MeetupGroupResponse,
  MeetupMeetingPointResponse,
  MeetupParticipantResponse,
  MeetupRecommendationItem,
  MeetupRecommendationSessionResponse,
  MeetupRecommendationStatus,
  MeetupVoteResponse,
  MeetupVotesResponse,
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

export function normalizeMeetupParticipantResponse(
  response: unknown,
): MeetupParticipantResponse {
  const envelope = getEnvelopeRecord(response);

  const record = getNestedRecord(envelope, ["participant"]) ?? envelope;

  return {
    id: getNumber(record, ["id"]),
    uuid: getString(record, ["uuid", "participantUuid"]),
    meetupUuid: getString(record, ["meetupUuid", "groupUuid"]),
    profileId: getNumber(record, ["profileId"]),
    nickname: getString(record, ["nickname", "name", "displayName"]),
    locationLat: getNumber(record, ["locationLat", "latitude"]),
    locationLng: getNumber(record, ["locationLng", "longitude"]),
    mapsLink: getString(record, ["mapsLink", "mapUrl"]),
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

    searchRadiusKm: getNumber(groupRecord, ["searchRadiusKm", "radiusKm"]),

    timezone: getString(groupRecord, ["timezone"]),

    meetingPointLat: getNumber(groupRecord, [
      "meetingPointLat",
      "meetingPointLatitude",
    ]),

    meetingPointLng: getNumber(groupRecord, [
      "meetingPointLng",
      "meetingPointLongitude",
    ]),

    meetingPointMethod: getString(groupRecord, ["meetingPointMethod"]),

    participants,

    winningCandidateId: getNumber(groupRecord, ["winningCandidateId"]),

    expiresAt: getString(groupRecord, ["expiresAt"]),

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
    menuItemId: getNumber(record, ["menuItemId"]),
    menuItemName: getString(record, ["menuItemName"]),
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
