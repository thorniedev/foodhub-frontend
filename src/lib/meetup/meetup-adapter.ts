import type {
  MeetupActionResponse,
  MeetupGroupResponse,
  MeetupParticipantResponse,
  MeetupParticipantsResponse,
  MeetupVoteResponse,
  MeetupVotesResponse,
} from "@/types/meetup-api";

type UnknownRecord = Record<string, unknown>;

const ENVELOPE_KEYS = ["data", "payload", "result"] as const;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapEnvelope(value: unknown): unknown {
  let current = value;

  for (let depth = 0; depth < 4; depth += 1) {
    if (!isRecord(current)) {
      break;
    }

    const record = current;

    const nextKey = ENVELOPE_KEYS.find((key) => record[key] !== undefined);

    if (!nextKey) {
      break;
    }

    current = record[nextKey];
  }

  return current;
}

function getRecord(value: unknown): UnknownRecord {
  const unwrapped = unwrapEnvelope(value);

  if (!isRecord(unwrapped)) {
    return {};
  }

  for (const key of ["meetup", "group", "participant", "vote"] as const) {
    if (isRecord(unwrapped[key])) {
      return unwrapped[key] as UnknownRecord;
    }
  }

  return unwrapped;
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

function getArrayPayload(
  value: unknown,
  preferredKeys: readonly string[],
): unknown[] {
  const unwrapped = unwrapEnvelope(value);

  if (Array.isArray(unwrapped)) {
    return unwrapped;
  }

  if (!isRecord(unwrapped)) {
    return [];
  }

  for (const key of preferredKeys) {
    const candidate = unwrapped[key];

    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  for (const key of ["contents", "content", "items"] as const) {
    const candidate = unwrapped[key];

    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

export function normalizeMeetupGroupResponse(
  response: unknown,
): MeetupGroupResponse {
  const record = getRecord(response);

  return {
    uuid: getString(record, ["uuid", "meetupUuid", "groupUuid", "id"]),
    shareToken: getString(record, ["shareToken", "inviteCode"]),
    title: getString(record, ["title", "groupName", "name"]),
    status: getString(record, ["status", "meetupStatus"]),
    votingMethod: getString(record, ["votingMethod"]),
    searchRadiusKm: getNumber(record, ["searchRadiusKm", "radiusKm"]),
    timezone: getString(record, ["timezone"]),
    meetingPointLat: getNumber(record, [
      "meetingPointLat",
      "meetingPointLatitude",
    ]),
    meetingPointLng: getNumber(record, [
      "meetingPointLng",
      "meetingPointLongitude",
    ]),
    meetingPointMethod: getString(record, ["meetingPointMethod"]),
    expiresAt: getString(record, ["expiresAt"]),
    raw: response,
  };
}

export function normalizeMeetupParticipantResponse(
  response: unknown,
): MeetupParticipantResponse {
  const record = getRecord(response);

  return {
    uuid: getString(record, ["uuid", "participantUuid", "id"]),
    meetupUuid: getString(record, ["meetupUuid", "groupUuid"]),
    profileId: getNumber(record, ["profileId"]),
    nickname: getString(record, ["nickname", "name", "displayName"]),
    locationInputType: getString(record, ["locationInputType"]),
    mapsLink: getString(record, ["mapsLink", "mapUrl"]),
    locationLat: getNumber(record, ["locationLat", "latitude"]),
    locationLng: getNumber(record, ["locationLng", "longitude"]),
    status: getString(record, ["status", "participantStatus"]),
    raw: response,
  };
}

export function normalizeMeetupParticipantsResponse(
  response: unknown,
): MeetupParticipantsResponse {
  return {
    participants: getArrayPayload(response, ["participants"]).map(
      normalizeMeetupParticipantResponse,
    ),
    raw: response,
  };
}

export function normalizeMeetupVoteResponse(
  response: unknown,
): MeetupVoteResponse {
  const record = getRecord(response);

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
  return {
    votes: getArrayPayload(response, ["votes", "results"]).map(
      normalizeMeetupVoteResponse,
    ),
    raw: response,
  };
}

export function normalizeMeetupActionResponse(
  response: unknown,
): MeetupActionResponse {
  const record = getRecord(response);

  const explicitSuccess = record.success;

  return {
    success:
      typeof explicitSuccess === "boolean"
        ? explicitSuccess
        : getString(record, ["status"])?.toUpperCase() !== "FAILED",
    message: getString(record, ["message", "detail"]),
    raw: response,
  };
}
