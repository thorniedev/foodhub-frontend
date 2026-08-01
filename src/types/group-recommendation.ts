import type { Coordinates, RecommendedStore } from "./location";

export type GroupStage =
  | "setup"
  | "waiting"
  | "recommendations"
  | "voting"
  | "completed";

export type GroupMemberLocationStatus = "ready" | "waiting" | "unavailable";

export interface GroupMember {
  uuid: string;
  name: string;
  avatarUrl?: string;
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

export interface GroupSession {
  uuid: string;
  name: string;
  inviteCode: string;
  leaderUuid: string;
  stage: GroupStage;
  members: GroupMember[];
  meetingPoint: Coordinates | null;
  votes: GroupVote[];
}

export interface VotingLeaderboardEntry {
  rank: number;
  store: RecommendedStore;
  voteCount: number;
  percentage: number;
}

export type VotingStoreResult = {
  storeId: string;
  voteCount: number;
};

export type GroupVotingResponse = {
  groupId: string;
  totalMembers: number;
  totalVotes: number;
  votingOpen: boolean;
  myVoteStoreId: string | null;
  stores: VotingStoreResult[];
};

export type SubmitGroupVoteRequest = {
  groupId: string;
  storeId: string;
};

export type VotingPanelStore = RecommendedStore & {
  averageMemberDistanceKm?: number;
  maximumMemberDistanceKm?: number;
};
