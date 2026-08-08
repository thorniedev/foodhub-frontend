export type MeetupVotingMethod = "SINGLE_PICK" | string;

export type MeetupMeetingPointMethod = "GEOMETRIC_MEDIAN" | string;

export type MeetupLocationInputType = "MAPS_LINK" | string | null;

export interface CreateMeetupRequest {
  createdByUserId: number;
  title: string;
  votingMethod: MeetupVotingMethod;
  searchRadiusKm: number;
  timezone: string;
  meetingPointLat: number;
  meetingPointLng: number;
  meetingPointMethod: MeetupMeetingPointMethod;
  expiresAt: string;
}

export interface JoinMeetupParticipantRequest {
  meetupUuid: string;
  profileId: number;
  nickname: string;
  locationInputType: MeetupLocationInputType;
  mapsLink: string | null;
  locationLat: number | null;
  locationLng: number | null;
}

export interface LeaveMeetupParticipantArgs {
  participantUuid: string;
  meetupUuid?: string;
}

export interface SubmitMeetupVoteRequest {
  meetupUuid: string;
  participantUuid: string;
  candidateUuid: string;
  rankChoice?: number;
}


export interface MeetupGroupResponse {
  uuid: string | null;
  shareToken: string | null;
  title: string | null;
  status: string | null;
  votingMethod: string | null;
  searchRadiusKm: number | null;
  timezone: string | null;
  meetingPointLat: number | null;
  meetingPointLng: number | null;
  meetingPointMethod: string | null;
  expiresAt: string | null;
  raw: unknown;
}

export interface MeetupParticipantResponse {
  uuid: string | null;
  meetupUuid: string | null;
  profileId: number | null;
  nickname: string | null;
  locationInputType: string | null;
  mapsLink: string | null;
  locationLat: number | null;
  locationLng: number | null;
  status: string | null;
  raw: unknown;
}

export interface MeetupParticipantsResponse {
  participants: MeetupParticipantResponse[];
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
  raw: unknown;
}
