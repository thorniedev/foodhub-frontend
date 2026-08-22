export type MeetupVotingMethod =
  | "SINGLE_PICK"
  | "APPROVAL"
  | "RANKED"
  | "RANKED_CHOICE"
  | string;

export type MeetupMeetingPointMethod = "CENTROID" | string;

export type MeetupGroupStatus =
  | "COLLECTING"
  | "RECOMMENDING"
  | "VOTING"
  | "DECIDED"
  | "CANCELLED"
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
  timezone?: string;
  expiresAt?: string;
  meetingPointLat?: number | null;
  meetingPointLng?: number | null;
  candidateStoreUuids?: string[] | null;
  maximumBudgetPerPerson?: number;
  currencyCode?: string;
  minimumParticipants?: number;
  candidateLimit?: number;
  scheduledFor?: string;
  // Dual-mode flags
  guestAllowed?: boolean;
  friendUserUuids?: string[];
  durationMinutes?: number;
  inviteMode?: "FRIENDS" | "GUEST_LINK";
}

export interface UpdateMeetupGroupRequest {
  title?: string;
  timezone?: string;
  searchRadiusKm?: number;
  status?: MeetupGroupStatus;
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
  foodUuid?: string;
  candidateUuid?: string;
  rankChoice?: number;
}

export interface JoinMeetupParticipantRequest {
  meetupUuid?: string;
  shareToken?: string;
  nickname: string;
  profileId?: number | null;
  locationLat?: number | null;
  locationLng?: number | null;
  mapsLink?: string | null;
  dietaryRestrictions?: string[];
  allergies?: string[];
  budgetRange?: string;
}

export interface MeetupVoteTallyEntry {
  candidateUuid: string;
  candidateName?: string;
  voteCount: number;
}

export interface MeetupVoteTallyResponse {
  meetupUuid: string | null;
  totalVotes: number;
  tally: MeetupVoteTallyEntry[];
}

export interface MeetupParticipantDto {
  uuid: string;
  nickname: string;
  profileId: number | null;
  participantRole: "HOST" | "MEMBER";
  locationLat: number | null;
  locationLng: number | null;
  status: "ACTIVE" | "LEFT" | "REMOVED";
  dietaryRestrictions?: string[];
  allergies?: string[];
  budgetRange?: string;
  joinedAt?: string;
}

export interface MeetupParticipantResponse {
  id: number | null;
  uuid: string | null;
  meetupUuid: string | null;
  profileId: number | null;
  nickname: string | null;
  participantRole?: "HOST" | "MEMBER" | null;
  locationLat: number | null;
  locationLng: number | null;
  mapsLink: string | null;
  dietaryRestrictions?: string[];
  allergies?: string[];
  budgetRange?: string;
  joinedAt: string | null;
  raw: unknown;
}

export interface MeetupGroupDto {
  id: number;
  uuid: string;
  createdByUserId: number;
  title: string;
  status: "COLLECTING" | "VOTING" | "DECIDED" | "CANCELLED";
  votingMethod: "SINGLE_PICK" | "APPROVAL" | "RANKED";
  searchRadiusKm: number;
  meetingPointLat: number | null;
  meetingPointLng: number | null;
  winningCandidateId: number | null;
  expiresAt: string;
  decidedAt: string | null;
  participants: MeetupParticipantDto[];
  guestAllowed?: boolean;
  shareToken?: string;
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
  candidateStoreUuids?: string[] | null;
  participants: MeetupParticipantResponse[];
  winningCandidateId: number | null;
  winningCandidateName?: string | null;
  guestAllowed?: boolean;
  expiresAt: string | null;
  decidedAt?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  raw: unknown;
}

export interface MeetupWinningCardResponse {
  meetupUuid: string;
  title: string;
  winningCandidateId: number;
  winningCandidateName: string;
  totalVotes: number;
  meetingPointLat: number;
  meetingPointLng: number;
  mapsDirectionsUrl: string; // e.g. "https://www.google.com/maps/dir/?api=1&destination=11.5564,104.9282"
  decidedAt: string;
  storeName?: string;
  storeAddress?: string;
  foodName?: string;
  foodPhotoUrl?: string;
  rating?: number;
  price?: number;
  distanceKm?: number;
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
  photoUrl?: string | null;
  rating?: number | null;
  category?: string | null;
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
  foodUuid?: string | null;
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

export interface CompleteMeetupVotingArgs {
  meetupUuid: string;
}
