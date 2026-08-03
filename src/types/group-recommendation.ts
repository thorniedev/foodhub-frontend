import type { Coordinates, RecommendedStore } from "@/types/location";

export type GroupStage =
  | "setup"
  | "waiting"
  | "recommendations"
  | "voting"
  | "completed";

export type GroupMemberLocationStatus = "waiting" | "ready" | "unavailable";

export interface GroupMember {
  uuid: string;
  name: string;
  coordinates: Coordinates | null;
  locationStatus: GroupMemberLocationStatus;
  requiredDietaryCodes: string[];
  blockedAllergenCodes: string[];
  hasVoted: boolean;
}

export interface GroupVote {
  memberUuid: string;
  storeUuid: string;
  createdAt: string;
}

export interface VotingLeaderboardEntry {
  rank: number;
  store: RecommendedStore;
  voteCount: number;
  percentage: number;
}

export type SharedGroupSessionStatus = "VOTING" | "COMPLETED";

export interface SharedGroupSession {
  inviteCode: string;
  groupName: string;
  status: SharedGroupSessionStatus;
  members: GroupMember[];
  stores: RecommendedStore[];
  votes: GroupVote[];
  winnerStoreUuid: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupSessionRequest {
  groupName: string;
  members: GroupMember[];
  stores: RecommendedStore[];
}

export interface CreateGroupSessionResponse {
  session: SharedGroupSession;
  ownerToken: string;
  participantToken: string;
  participantUuid: string;
}

export interface JoinGroupSessionRequest {
  inviteCode: string;
  name: string;
}

export interface JoinGroupSessionResponse {
  session: SharedGroupSession;
  participantToken: string;
  participantUuid: string;
}

export interface SubmitSharedVoteRequest {
  inviteCode: string;
  participantToken: string;
  storeUuid: string;
}

export interface FinishSharedVotingRequest {
  inviteCode: string;
  ownerToken: string;
}
