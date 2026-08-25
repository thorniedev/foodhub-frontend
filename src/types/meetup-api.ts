export type MeetupVotingMethod =
  | "SINGLE_PICK"
  | "APPROVAL"
  | "RANKED"
  | "RANKED_CHOICE"
  | string;

export type MeetupMeetingPointMethod = "CENTROID" | string;

export type MeetupAudienceMode = "FRIENDS" | "GUESTS" | string;

export type MeetupLocationMode = "AREA" | "PIN" | string;

export type MeetupParticipantLocationInputType =
  | "MANUAL_PIN"
  | "MAPS_LINK"
  | string;

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
  title: string;
  votingMethod?: MeetupVotingMethod;
  audienceMode: "FRIENDS" | "GUESTS";
  guestAllowed: boolean;
  locationMode: "AREA" | "PIN";
  searchRadiusKm?: number;
  timezone?: string;
  expiresAt?: string;
  targetAreaName?: string | null;
  targetCity?: string | null;
  targetProvince?: string | null;
  targetLat?: number | null;
  targetLng?: number | null;
  meetingPointLat?: number | null;
  meetingPointLng?: number | null;
  candidateStoreUuids?: string[] | null;
  maximumBudgetPerPerson?: number;
  currencyCode?: string;
  minimumParticipants?: number;
  candidateLimit?: number;
  scheduledFor?: string;
  friendUserUuids?: string[];
  expectedGuestCount?: number;
  maxParticipants?: number;
  durationMinutes?: number;
  inviteMode?: "FRIENDS" | "GUEST_LINK" | "GUESTS";
}

export interface UpdateMeetupGroupRequest {
  title?: string;
  timezone?: string;
  searchRadiusKm?: number;
  status?: MeetupGroupStatus;
  targetAreaName?: string | null;
  targetCity?: string | null;
  targetProvince?: string | null;
  targetLat?: number | null;
  targetLng?: number | null;
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
  locationInputType?: MeetupParticipantLocationInputType | null;
  locationLat?: number | null;
  locationLng?: number | null;
  locationAreaName?: string | null;
  locationCity?: string | null;
  locationProvince?: string | null;
  targetAreaName?: string | null;
  targetCity?: string | null;
  targetProvince?: string | null;
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
  nickname?: string;
  guestNickname?: string;
  profileId?: number | null;
  profileUuid?: string | null;
  locationMode?: "AREA" | "PIN";
  locationInputType?: MeetupParticipantLocationInputType | null;
  locationLat?: number | null;
  locationLng?: number | null;
  locationAreaName?: string | null;
  locationCity?: string | null;
  locationProvince?: string | null;
  targetAreaName?: string | null;
  targetCity?: string | null;
  targetProvince?: string | null;
  mapsLink?: string | null;
  dietaryRestrictions?: string[];
  dietaryTypes?: string[];
  allergies?: string[];
  budgetMin?: number | null;
  budgetMax?: number | null;
  budgetRange?: string | null;
  contextData?: Record<string, unknown>;
  profileSnapshot?: Record<string, unknown>;
}

export interface MeetupVoteTallyEntry {
  candidateUuid: string;
  foodUuid?: string | null;
  candidateName?: string;
  foodName?: string | null;
  storeName?: string | null;
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
  profileUuid?: string | null;
  profileId: number | null;
  participantRole: "HOST" | "MEMBER";
  locationLat: number | null;
  locationLng: number | null;
  locationInputType?: MeetupParticipantLocationInputType | null;
  locationMode?: MeetupLocationMode | null;
  locationAreaName?: string | null;
  locationCity?: string | null;
  locationProvince?: string | null;
  targetAreaName?: string | null;
  targetCity?: string | null;
  targetProvince?: string | null;
  status: "ACTIVE" | "LEFT" | "REMOVED";
  guestToken?: string | null;
  dietaryTypes?: string[];
  dietaryRestrictions?: string[];
  allergies?: string[];
  budgetMin?: number | null;
  budgetMax?: number | null;
  budgetRange?: string | null;
  joinedAt?: string;
}

export interface MeetupParticipantResponse {
  id: number | null;
  uuid: string | null;
  meetupUuid: string | null;
  profileId: number | null;
  profileUuid: string | null;
  nickname: string | null;
  participantRole?: "HOST" | "MEMBER" | null;
  locationLat: number | null;
  locationLng: number | null;
  locationInputType?: MeetupParticipantLocationInputType | null;
  locationMode?: MeetupLocationMode | null;
  locationAreaName?: string | null;
  locationCity?: string | null;
  locationProvince?: string | null;
  targetAreaName?: string | null;
  targetCity?: string | null;
  targetProvince?: string | null;
  mapsLink: string | null;
  guestToken?: string | null;
  dietaryTypes?: string[];
  dietaryRestrictions?: string[];
  allergies?: string[];
  budgetMin?: number | null;
  budgetMax?: number | null;
  budgetRange?: string | null;
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
  audienceMode?: MeetupAudienceMode;
  locationMode?: MeetupLocationMode;
  searchRadiusKm: number;
  targetAreaName?: string | null;
  targetCity?: string | null;
  targetProvince?: string | null;
  targetLat?: number | null;
  targetLng?: number | null;
  meetingPointLat: number | null;
  meetingPointLng: number | null;
  winningCandidateId: number | null;
  expiresAt: string;
  decidedAt: string | null;
  participants: MeetupParticipantDto[];
  guestAllowed?: boolean;
  expectedGuestCount?: number | null;
  maxParticipants?: number | null;
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
  audienceMode: MeetupAudienceMode | null;
  locationMode: MeetupLocationMode | null;
  searchRadiusKm: number | null;
  timezone: string | null;
  targetAreaName: string | null;
  targetCity: string | null;
  targetProvince: string | null;
  targetLat: number | null;
  targetLng: number | null;
  meetingPointLat: number | null;
  meetingPointLng: number | null;
  meetingPointMethod: string | null;
  candidateStoreUuids?: string[] | null;
  participants: MeetupParticipantResponse[];
  winningCandidateId: number | null;
  winningCandidateUuid?: string | null;
  winningCandidateName?: string | null;
  guestAllowed?: boolean;
  expectedGuestCount?: number | null;
  maxParticipants?: number | null;
  expiresAt: string | null;
  decidedAt?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  raw: unknown;
}

export interface MeetupWinningCardResponse {
  meetupUuid: string;
  shareToken?: string | null;
  title: string;
  status?: MeetupGroupStatus | null;
  resultReady?: boolean;
  winningCandidateId: number | null;
  winningCandidateUuid?: string | null;
  winningCandidateName: string;
  totalVotes: number;
  meetingPointLat: number | null;
  meetingPointLng: number | null;
  mapsDirectionsUrl: string; // e.g. "https://www.google.com/maps/dir/?api=1&destination=11.5564,104.9282"
  decidedAt: string | null;
  storeName?: string;
  storeAddress?: string;
  foodName?: string;
  foodPhotoUrl?: string;
  rating?: number;
  price?: number;
  distanceKm?: number;
}

export interface MeetupResultResponse extends MeetupWinningCardResponse {
  tally: MeetupVoteTallyEntry[];
  message?: string | null;
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
