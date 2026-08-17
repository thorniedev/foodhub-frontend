export type MeetupVotingMethod = "SINGLE_PICK" | "RANKED_CHOICE" | string;

export type MeetupMeetingPointMethod = "CENTROID" | string;

export type MeetupGroupStatus =
  | "COLLECTING"
  | "RECOMMENDING"
  | "VOTING"
  | "DECIDED"
  | string;

export type MeetupRecommendationStatus =
  | "PENDING"
  | "PROCESSING"
  | "READY"
  | "FAILED";

export interface CreateMeetupRequest {
  createdByUserId: number;
  title: string;
  votingMethod: MeetupVotingMethod;
  searchRadiusKm: number;
  timezone: string;
  expiresAt: string;
  maximumBudgetPerPerson?: number;
  currencyCode?: string;
  minimumParticipants?: number;
  candidateLimit?: number;
  scheduledFor?: string;
}

export interface UpdateMeetupGroupRequest {
  title?: string;

  timezone?: string;

  searchRadiusKm?: number;
}

export interface UpdateMeetupGroupArgs {
  meetupUuid: string;

  body: UpdateMeetupGroupRequest;
}

export interface LeaveMeetupParticipantArgs {
  participantUuid: string;

  meetupUuid?: string;
}

export interface UpdateMeetupParticipantLocationRequest {
  locationLat: number;

  locationLng: number;

  mapsLink?: string | null;
}

export interface UpdateMeetupParticipantLocationArgs {
  participantUuid: string;

  meetupUuid?: string;

  body: UpdateMeetupParticipantLocationRequest;
}

export interface SubmitMeetupVoteRequest {
  meetupUuid: string;
  participantUuid: string;
  candidateUuid: string;
  rankChoice?: number;
}

export interface JoinMeetupParticipantRequest {
  shareToken: string;
  nickname: string;
  locationLat?: number | null;
  locationLng?: number | null;
  mapsLink?: string | null;
}

export interface MeetupVoteTallyEntry {
  candidateUuid: string;
  voteCount: number;
}

export interface MeetupVoteTallyResponse {
  meetupUuid: string | null;
  totalVotes: number;
  tally: MeetupVoteTallyEntry[];
}

export interface MeetupParticipantResponse {
  id: number | null;
  uuid: string | null;
  meetupUuid: string | null;
  profileId: number | null;
  nickname: string | null;
  locationLat: number | null;
  locationLng: number | null;
  mapsLink: string | null;
  joinedAt: string | null;
  raw: unknown;
}

export interface MeetupGroupResponse {
  id: number | null;
  uuid: string | null;
  shareToken: string | null;
  createdByUserId: number | null;
  title: string | null;
  status: MeetupGroupStatus | null;
  votingMethod: string | null;
  searchRadiusKm: number | null;
  timezone: string | null;
  meetingPointLat: number | null;
  meetingPointLng: number | null;
  meetingPointMethod: string | null;
  participants: MeetupParticipantResponse[];
  winningCandidateId: number | null;
  expiresAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  raw: unknown;
}

export interface MeetupMeetingPointResponse {
  id: number | null;
  meetingPointLat: number | null;
  meetingPointLng: number | null;
  meetingPointMethod: MeetupMeetingPointMethod | null;
  raw: unknown;
}

export interface MeetupRecommendationItem {
  uuid: string | null;
  menuItemId: number | null;
  menuItemName: string | null;
  storeId: number | null;
  storeName: string | null;
  distanceKm: number | null;
  finalScore: number | null;
  priceSnapshot: number | null;
  currencyCode: string | null;
  raw: unknown;
}

export interface MeetupRecommendationSessionResponse {
  uuid: string | null;

  status: MeetupRecommendationStatus | null;

  requestedLimit: number | null;

  items: MeetupRecommendationItem[];

  raw: unknown;
}

export interface MeetupVoteResponse {
  uuid: string | null;

  meetupUuid: string | null;

  participantUuid: string | null;

  candidateUuid: string | null;

  rankChoice: number | null;

  createdAt: string | null;

  raw: unknown;
}

export interface MeetupVotesResponse {
  votes: MeetupVoteResponse[];

  raw: unknown;
}

export interface MeetupActionResponse {
  success: boolean;

  message: string | null;

  status: number | null;

  raw: unknown;
}

export interface RemoveMeetupParticipantArgs {
  participantUuid: string;
  meetupUuid?: string;
}

export interface RetractMeetupVoteArgs {
  voteUuid: string;
  meetupUuid?: string;
}

