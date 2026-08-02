import { randomUUID } from "node:crypto";

import type {
  CreateGroupSessionRequest,
  CreateGroupSessionResponse,
  GroupMember,
  GroupVote,
  JoinGroupSessionResponse,
  SharedGroupSession,
} from "@/types/group-recommendation";

interface MockGroupSessionRecord extends SharedGroupSession {
  ownerToken: string;
  participantTokens: Record<string, string>;
}

declare global {
  // eslint-disable-next-line no-var
  var __foodhubMockGroupSessions:
    | Map<string, MockGroupSessionRecord>
    | undefined;
}

const sessions =
  globalThis.__foodhubMockGroupSessions ??
  new Map<string, MockGroupSessionRecord>();

globalThis.__foodhubMockGroupSessions = sessions;

function nowIso(): string {
  return new Date().toISOString();
}

function createToken(prefix: string): string {
  return `${prefix}_${randomUUID().replaceAll("-", "")}`;
}

function createInviteCode(): string {
  let code = "";

  do {
    code = `FH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  } while (sessions.has(code));

  return code;
}

function cloneMember(member: GroupMember): GroupMember {
  return {
    ...member,
    coordinates: member.coordinates ? { ...member.coordinates } : null,
    requiredDietaryCodes: [...member.requiredDietaryCodes],
    blockedAllergenCodes: [...member.blockedAllergenCodes],
  };
}

function toPublicSession(record: MockGroupSessionRecord): SharedGroupSession {
  const votedMemberUuids = new Set(record.votes.map((vote) => vote.memberUuid));

  return {
    inviteCode: record.inviteCode,
    groupName: record.groupName,
    status: record.status,
    members: record.members.map((member) => ({
      ...cloneMember(member),
      hasVoted: votedMemberUuids.has(member.uuid),
    })),
    stores: record.stores.map((store) => ({
      ...store,
    })),
    votes: record.votes.map((vote) => ({
      ...vote,
    })),
    winnerStoreUuid: record.winnerStoreUuid,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function calculateWinnerStoreUuid(
  record: MockGroupSessionRecord,
): string | null {
  if (record.votes.length === 0) {
    return null;
  }

  const voteCounts = new Map<string, number>();

  record.votes.forEach((vote) => {
    voteCounts.set(vote.storeUuid, (voteCounts.get(vote.storeUuid) ?? 0) + 1);
  });

  const rankedStores = [...record.stores].sort((first, second) => {
    const firstVotes = voteCounts.get(first.uuid) ?? 0;
    const secondVotes = voteCounts.get(second.uuid) ?? 0;

    if (secondVotes !== firstVotes) {
      return secondVotes - firstVotes;
    }

    if (second.recommendationScore !== first.recommendationScore) {
      return second.recommendationScore - first.recommendationScore;
    }

    if (first.distanceKm !== second.distanceKm) {
      return first.distanceKm - second.distanceKm;
    }

    return second.averageRating - first.averageRating;
  });

  return rankedStores[0]?.uuid ?? null;
}

export function createMockGroupSession(
  request: CreateGroupSessionRequest,
): CreateGroupSessionResponse {
  if (request.members.length === 0) {
    throw new Error("A group session needs at least one member.");
  }

  if (request.stores.length === 0) {
    throw new Error("A group session needs at least one candidate store.");
  }

  const inviteCode = createInviteCode();
  const ownerToken = createToken("owner");
  const participantToken = createToken("participant");
  const participantUuid = request.members[0].uuid;
  const timestamp = nowIso();

  const record: MockGroupSessionRecord = {
    inviteCode,
    groupName: request.groupName.trim() || "FoodHub Group",
    status: "VOTING",
    members: request.members.map(cloneMember),
    stores: request.stores.map((store) => ({
      ...store,
    })),
    votes: [],
    winnerStoreUuid: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    ownerToken,
    participantTokens: {
      [participantToken]: participantUuid,
    },
  };

  sessions.set(inviteCode, record);

  return {
    session: toPublicSession(record),
    ownerToken,
    participantToken,
    participantUuid,
  };
}

export function getMockGroupSession(
  inviteCode: string,
): SharedGroupSession | null {
  const record = sessions.get(inviteCode.toUpperCase());

  return record ? toPublicSession(record) : null;
}

export function joinMockGroupSession(
  inviteCode: string,
  name: string,
): JoinGroupSessionResponse {
  const normalizedCode = inviteCode.toUpperCase();
  const record = sessions.get(normalizedCode);

  if (!record) {
    throw new Error("Voting session not found.");
  }

  if (record.status === "COMPLETED") {
    throw new Error("This voting session has already finished.");
  }

  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error("Please enter your name.");
  }

  const claimedMemberUuids = new Set(Object.values(record.participantTokens));

  let member = record.members.find(
    (item) =>
      item.name.trim().toLowerCase() === cleanName.toLowerCase() &&
      !claimedMemberUuids.has(item.uuid),
  );

  if (!member) {
    member = {
      uuid: `guest-${randomUUID()}`,
      name: cleanName,
      coordinates: null,
      locationStatus: "waiting",
      requiredDietaryCodes: [],
      blockedAllergenCodes: [],
      hasVoted: false,
    };

    record.members.push(member);
  }

  const participantToken = createToken("participant");

  record.participantTokens[participantToken] = member.uuid;
  record.updatedAt = nowIso();

  return {
    session: toPublicSession(record),
    participantToken,
    participantUuid: member.uuid,
  };
}

export function submitMockGroupVote(
  inviteCode: string,
  participantToken: string,
  storeUuid: string,
): SharedGroupSession {
  const normalizedCode = inviteCode.toUpperCase();
  const record = sessions.get(normalizedCode);

  if (!record) {
    throw new Error("Voting session not found.");
  }

  if (record.status !== "VOTING") {
    throw new Error("Voting is already closed.");
  }

  const memberUuid = record.participantTokens[participantToken];

  if (!memberUuid) {
    throw new Error("Your voting access is invalid. Join the session again.");
  }

  const storeExists = record.stores.some((store) => store.uuid === storeUuid);

  if (!storeExists) {
    throw new Error("The selected store is not part of this voting session.");
  }

  const nextVote: GroupVote = {
    memberUuid,
    storeUuid,
    createdAt: nowIso(),
  };

  const existingVoteIndex = record.votes.findIndex(
    (vote) => vote.memberUuid === memberUuid,
  );

  if (existingVoteIndex >= 0) {
    record.votes[existingVoteIndex] = nextVote;
  } else {
    record.votes.push(nextVote);
  }

  record.updatedAt = nowIso();

  return toPublicSession(record);
}

export function finishMockGroupVoting(
  inviteCode: string,
  ownerToken: string,
): SharedGroupSession {
  const normalizedCode = inviteCode.toUpperCase();
  const record = sessions.get(normalizedCode);

  if (!record) {
    throw new Error("Voting session not found.");
  }

  if (record.ownerToken !== ownerToken) {
    throw new Error("Only the group owner can finish voting.");
  }

  const winnerStoreUuid = calculateWinnerStoreUuid(record);

  if (!winnerStoreUuid) {
    throw new Error("At least one vote is required before finishing.");
  }

  record.status = "COMPLETED";
  record.winnerStoreUuid = winnerStoreUuid;
  record.updatedAt = nowIso();

  return toPublicSession(record);
}
