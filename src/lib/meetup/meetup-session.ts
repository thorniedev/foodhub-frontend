export interface StoredMeetupSession {
  participantUuid: string;
  guestToken?: string | null;
  profileUuid?: string | null;
  nickname?: string | null;
  joinMode: "FRIEND" | "GUEST";
  locationMode?: "AREA" | "PIN" | null;
  targetAreaName?: string | null;
  targetCity?: string | null;
  targetProvince?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  allergies?: string[];
  dietaryTypes?: string[];
  budgetMin?: number | null;
  budgetMax?: number | null;
  profileSnapshot?: Record<string, unknown>;
}

const sessionKey = (shareToken: string) =>
  `foodhub-meetup-session-${shareToken}`;

export function readStoredMeetupSession(
  shareToken: string,
): StoredMeetupSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(sessionKey(shareToken));

    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredMeetupSession>;

      if (typeof parsed.participantUuid === "string" && parsed.participantUuid) {
        return {
          participantUuid: parsed.participantUuid,
          guestToken: parsed.guestToken ?? null,
          profileUuid: parsed.profileUuid ?? null,
          nickname: parsed.nickname ?? null,
          joinMode: parsed.joinMode === "FRIEND" ? "FRIEND" : "GUEST",
          locationMode: parsed.locationMode ?? null,
          targetAreaName: parsed.targetAreaName ?? null,
          targetCity: parsed.targetCity ?? null,
          targetProvince: parsed.targetProvince ?? null,
          locationLat: parsed.locationLat ?? null,
          locationLng: parsed.locationLng ?? null,
          allergies: Array.isArray(parsed.allergies) ? parsed.allergies : [],
          dietaryTypes: Array.isArray(parsed.dietaryTypes)
            ? parsed.dietaryTypes
            : [],
          budgetMin:
            typeof parsed.budgetMin === "number" ? parsed.budgetMin : null,
          budgetMax:
            typeof parsed.budgetMax === "number" ? parsed.budgetMax : null,
          profileSnapshot: parsed.profileSnapshot ?? undefined,
        };
      }
    }

    const legacyParticipantUuid =
      window.localStorage.getItem(`fh_guest_token_${shareToken}`) ||
      window.localStorage.getItem("fh_participant_uuid");

    if (legacyParticipantUuid) {
      return {
        participantUuid: legacyParticipantUuid,
        guestToken: null,
        nickname: window.localStorage.getItem("fh_nickname"),
        joinMode: "GUEST",
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function saveStoredMeetupSession(
  shareToken: string,
  session: StoredMeetupSession,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(sessionKey(shareToken), JSON.stringify(session));

  if (session.joinMode === "GUEST") {
    window.localStorage.setItem(
      `fh_guest_token_${shareToken}`,
      session.participantUuid,
    );
    window.localStorage.setItem("fh_participant_uuid", session.participantUuid);

    if (session.nickname) {
      window.localStorage.setItem("fh_nickname", session.nickname);
    }
  }
}
