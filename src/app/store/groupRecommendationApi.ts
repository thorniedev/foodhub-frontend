import { baseApi } from "./baseApi";
import {
  normalizeArrayPayload,
  normalizePageResponse,
  normalizePayload,
} from "./utils/normalize";

import {
  normalizeMeetupActionResponse,
  normalizeMeetupGroupResponse,
  normalizeMeetupParticipantResponse,
  normalizeMeetupResultResponse,
  normalizeMeetupVoteTallyResponse,
  normalizeMeetupVotesResponse,
  normalizeMeetupVoteResponse,
  normalizeMeetupWinningCardResponse,
} from "@/lib/meetup/meetup-adapter";

import type {
  CreateMeetupRequest,
  JoinMeetupParticipantRequest,
  LeaveMeetupParticipantArgs,
  MeetupActionResponse,
  MeetupGroupResponse,
  MeetupParticipantResponse,
  MeetupResultResponse,
  MeetupVoteResponse,
  MeetupVoteTallyResponse,
  MeetupVotesResponse,
  RemoveMeetupParticipantArgs,
  RetractMeetupVoteArgs,
  SubmitMeetupVoteRequest,
  UpdateMeetupGroupArgs,
  UpdateMeetupParticipantLocationArgs,
  MeetupWinningCardResponse,
} from "@/types/meetup-api";
import type { RecommendationItem } from "@/types/recommendation";

function toCreateMeetupBody(body: CreateMeetupRequest) {
  return {
    title: body.title,
    audienceMode: body.audienceMode,
    locationMode: body.locationMode,
    targetAreaName: body.targetAreaName,
    targetCity: body.targetCity,
    targetProvince: body.targetProvince,
    targetLat: body.targetLat,
    targetLng: body.targetLng,
    votingMethod: body.votingMethod,
    searchRadiusKm: body.searchRadiusKm,
    timezone: body.timezone,
    meetingPointLat: body.meetingPointLat,
    meetingPointLng: body.meetingPointLng,
    expiresAt: body.expiresAt,
    durationMinutes: body.durationMinutes,
    guestAllowed: body.guestAllowed,
    maxParticipants: body.maxParticipants,
    expectedGuestCount: body.expectedGuestCount,
    friendUserUuids: body.friendUserUuids,
  };
}

function toJoinMeetupBody(body: JoinMeetupParticipantRequest) {
  const locationInputType =
    body.locationInputType ?? (body.locationMode === "PIN" ? "MANUAL_PIN" : undefined);

  return {
    meetupUuid: body.meetupUuid,
    shareToken: body.shareToken,
    profileId: body.profileId,
    profileUuid: body.profileUuid,
    nickname: body.nickname ?? body.guestNickname,
    locationInputType,
    mapsLink: body.mapsLink,
    locationLat: body.locationLat,
    locationLng: body.locationLng,
    locationAreaName: body.locationAreaName ?? body.targetAreaName,
    locationCity: body.locationCity ?? body.targetCity,
    locationProvince: body.locationProvince ?? body.targetProvince,
    allergies: body.allergies,
    dietaryTypes: body.dietaryTypes,
    budgetMin: body.budgetMin,
    budgetMax: body.budgetMax,
  };
}

function toUpdateParticipantLocationBody(
  body: UpdateMeetupParticipantLocationArgs["body"],
) {
  const locationInputType =
    body.locationInputType ??
    (body.locationLat !== undefined || body.locationLng !== undefined
      ? "MANUAL_PIN"
      : undefined);

  return {
    locationInputType,
    locationLat: body.locationLat,
    locationLng: body.locationLng,
    mapsLink: body.mapsLink,
    locationAreaName: body.locationAreaName ?? body.targetAreaName,
    locationCity: body.locationCity ?? body.targetCity,
    locationProvince: body.locationProvince ?? body.targetProvince,
  };
}

export const groupRecommendationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ─────────────────────────────────────────────────────────
    // MEETUP GROUP
    // ─────────────────────────────────────────────────────────

    /** POST /api/v1/meetup/groups */
    createMeetup: builder.mutation<MeetupGroupResponse, CreateMeetupRequest>({
      query: (body) => ({
        url: "/meetup/groups",
        method: "POST",
        body: toCreateMeetupBody(body),
      }),
      transformResponse: (response: unknown) =>
        normalizeMeetupGroupResponse(response),
      invalidatesTags: [{ type: "GroupRecommendation", id: "MEETUP_LIST" }],
    }),

    /** GET /api/v1/meetup/groups/me */
    getMyMeetups: builder.query<
      { contents: MeetupGroupResponse[]; totalElements: number; totalPages: number },
      { page?: number; size?: number } | void
    >({
      query: (args) => ({
        url: `/meetup/groups/me?page=${args?.page ?? 0}&size=${args?.size ?? 20}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => {
        const page = normalizePageResponse<unknown>(response);

        return {
          contents: page.contents.map(normalizeMeetupGroupResponse),
          totalElements: page.totalElements,
          totalPages: page.totalPages,
        };
      },
      providesTags: [{ type: "GroupRecommendation", id: "MEETUP_LIST" }],
    }),

    /** POST /api/v1/meetup/groups/{uuid}/cancel */
    cancelMeetupGroup: builder.mutation<MeetupGroupResponse, string>({
      query: (meetupUuid) => ({
        url: `/meetup/groups/${encodeURIComponent(meetupUuid)}/cancel`,
        method: "POST",
      }),
      transformResponse: (response: unknown) =>
        normalizeMeetupGroupResponse(response),
      invalidatesTags: (_result, _error, meetupUuid) => [
        { type: "GroupRecommendation", id: `MEETUP-${meetupUuid}` },
        { type: "GroupRecommendation", id: "MEETUP_LIST" },
      ],
    }),

    /** GET /api/v1/meetup/groups/{uuid} */
    getMeetupGroup: builder.query<MeetupGroupResponse, string>({
      query: (meetupUuid) => ({
        url: `/meetup/groups/${encodeURIComponent(meetupUuid)}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeMeetupGroupResponse(response),
      providesTags: (_result, _error, meetupUuid) => [
        { type: "GroupRecommendation", id: `MEETUP-${meetupUuid}` },
      ],
    }),

    /** GET /api/v1/meetup/groups/share/{token} */
    resolveMeetupShareToken: builder.query<MeetupGroupResponse, string>({
      query: (shareToken) => ({
        url: `/meetup/groups/share/${encodeURIComponent(shareToken)}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeMeetupGroupResponse(response),
      providesTags: (result, _error, shareToken) => [
        {
          type: "GroupRecommendation",
          id: result?.uuid ? `MEETUP-${result.uuid}` : `SHARE-${shareToken}`,
        },
      ],
    }),

    /** PATCH /api/v1/meetup/groups/{uuid} */
    updateMeetupGroup: builder.mutation<MeetupGroupResponse, UpdateMeetupGroupArgs>({
      query: ({ meetupUuid, body }) => ({
        url: `/meetup/groups/${encodeURIComponent(meetupUuid)}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: unknown) =>
        normalizeMeetupGroupResponse(response),
      invalidatesTags: (_result, _error, { meetupUuid }) => [
        { type: "GroupRecommendation", id: `MEETUP-${meetupUuid}` },
      ],
    }),

    /** DELETE /api/v1/meetup/groups/{uuid} */
    deleteMeetupGroup: builder.mutation<MeetupActionResponse, string>({
      query: (meetupUuid) => ({
        url: `/meetup/groups/${encodeURIComponent(meetupUuid)}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) =>
        normalizeMeetupActionResponse(response),
      invalidatesTags: (_result, _error, meetupUuid) => [
        { type: "GroupRecommendation", id: `MEETUP-${meetupUuid}` },
        { type: "GroupRecommendation", id: "MEETUP_LIST" },
        { type: "GroupVoting", id: `MEETUP-${meetupUuid}` },
      ],
    }),

    // ─────────────────────────────────────────────────────────
    // MEETUP PARTICIPANTS
    // ─────────────────────────────────────────────────────────

    /** POST /api/v1/meetup/participants/join */
    joinMeetupParticipant: builder.mutation<
      MeetupParticipantResponse,
      JoinMeetupParticipantRequest
    >({
      query: (body) => ({
        url: "/meetup/participants/join",
        method: "POST",
        body: toJoinMeetupBody(body),
      }),
      transformResponse: (response: unknown) =>
        normalizeMeetupParticipantResponse(response),
    }),

    /** PATCH /api/v1/meetup/participants/{uuid}/location */
    updateMeetupParticipantLocation: builder.mutation<
      MeetupParticipantResponse,
      UpdateMeetupParticipantLocationArgs
    >({
      query: ({ participantUuid, body }) => ({
        url: `/meetup/participants/${encodeURIComponent(participantUuid)}/location`,
        method: "PATCH",
        body: toUpdateParticipantLocationBody(body),
      }),
      transformResponse: (response: unknown) =>
        normalizeMeetupParticipantResponse(response),
      invalidatesTags: (_result, _error, args) =>
        args.meetupUuid
          ? [{ type: "GroupRecommendation" as const, id: `MEETUP-${args.meetupUuid}` }]
          : [],
    }),

    /** POST /api/v1/meetup/participants/{uuid}/leave */
    leaveMeetupParticipant: builder.mutation<
      MeetupActionResponse,
      LeaveMeetupParticipantArgs
    >({
      query: ({ participantUuid }) => ({
        url: `/meetup/participants/${encodeURIComponent(participantUuid)}/leave`,
        method: "POST",
      }),
      transformResponse: (response: unknown) =>
        normalizeMeetupActionResponse(response),
      invalidatesTags: (_result, _error, args) =>
        args.meetupUuid
          ? [{ type: "GroupRecommendation" as const, id: `MEETUP-${args.meetupUuid}` }]
          : [],
    }),

    /** POST /api/v1/meetup/participants/{uuid}/remove */
    removeMeetupParticipant: builder.mutation<
      MeetupActionResponse,
      RemoveMeetupParticipantArgs
    >({
      query: ({ participantUuid }) => ({
        url: `/meetup/participants/${encodeURIComponent(participantUuid)}/remove`,
        method: "POST",
      }),
      transformResponse: (response: unknown) =>
        normalizeMeetupActionResponse(response),
      invalidatesTags: (_result, _error, args) =>
        args.meetupUuid
          ? [{ type: "GroupRecommendation" as const, id: `MEETUP-${args.meetupUuid}` }]
          : [],
    }),

    /** GET /api/v1/meetup/participants/{uuid} */
    getMeetupParticipant: builder.query<MeetupParticipantResponse, string>({
      query: (participantUuid) => ({
        url: `/meetup/participants/${encodeURIComponent(participantUuid)}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeMeetupParticipantResponse(response),
    }),

    /** GET /api/v1/meetup/participants/meetup/{meetupUuid} */
    getMeetupParticipants: builder.query<MeetupParticipantResponse[], string>({
      query: (meetupUuid) => ({
        url: `/meetup/participants/meetup/${encodeURIComponent(meetupUuid)}`,
        method: "GET",
      }),
      transformResponse: (response: unknown): MeetupParticipantResponse[] => {
        if (Array.isArray(response)) {
          return response.map(normalizeMeetupParticipantResponse);
        }
        if (typeof response === "object" && response !== null) {
          const raw = response as Record<string, unknown>;
          if (Array.isArray(raw.payload)) {
            return raw.payload.map(normalizeMeetupParticipantResponse);
          }
          if (Array.isArray(raw.participants)) {
            return raw.participants.map(normalizeMeetupParticipantResponse);
          }
        }
        return [];
      },
      providesTags: (_result, _error, meetupUuid) => [
        { type: "GroupRecommendation", id: `MEETUP-${meetupUuid}` },
      ],
    }),

    // ─────────────────────────────────────────────────────────
    // MEETUP VOTES
    // ─────────────────────────────────────────────────────────

    /** POST /api/v1/meetup/votes */
    submitMeetupVote: builder.mutation<MeetupVoteResponse, SubmitMeetupVoteRequest>({
      query: (body) => ({
        url: "/meetup/votes",
        method: "POST",
        body: {
          meetupUuid: body.meetupUuid,
          participantUuid: body.participantUuid,
          foodUuid: body.foodUuid || body.candidateUuid,
          rankChoice: body.rankChoice ?? 1,
        },
      }),
      transformResponse: (response: unknown) =>
        normalizeMeetupVoteResponse(response),
      invalidatesTags: (_result, _error, body) => [
        { type: "GroupVoting", id: `MEETUP-${body.meetupUuid}` },
      ],
    }),

    /** DELETE /api/v1/meetup/votes/{voteUuid} */
    retractMeetupVote: builder.mutation<MeetupActionResponse, RetractMeetupVoteArgs>({
      query: ({ voteUuid }) => ({
        url: `/meetup/votes/${encodeURIComponent(voteUuid)}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) =>
        normalizeMeetupActionResponse(response),
      invalidatesTags: (_result, _error, args) =>
        args.meetupUuid
          ? [{ type: "GroupVoting", id: `MEETUP-${args.meetupUuid}` }]
          : [],
    }),

    /** GET /api/v1/meetup/votes/meetup/{meetupUuid} */
    getMeetupVotes: builder.query<MeetupVotesResponse, string>({
      query: (meetupUuid) => ({
        url: `/meetup/votes/meetup/${encodeURIComponent(meetupUuid)}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeMeetupVotesResponse(response),
      providesTags: (_result, _error, meetupUuid) => [
        { type: "GroupVoting", id: `MEETUP-${meetupUuid}` },
      ],
    }),

    /** GET /api/v1/meetup/votes/meetup/{meetupUuid}/tally */
    getMeetupVoteTally: builder.query<MeetupVoteTallyResponse, string>({
      query: (meetupUuid) => ({
        url: `/meetup/votes/meetup/${encodeURIComponent(meetupUuid)}/tally`,
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeMeetupVoteTallyResponse(response),
      providesTags: (_result, _error, meetupUuid) => [
        { type: "GroupVoting", id: `MEETUP-${meetupUuid}` },
      ],
    }),
    /** POST /api/v1/meetup/groups/{uuid}/complete-voting */
    completeMeetupVoting: builder.mutation<MeetupWinningCardResponse, string>({
      query: (meetupUuid) => ({
        url: `/meetup/groups/${encodeURIComponent(meetupUuid)}/complete-voting`,
        method: "POST",
      }),
      transformResponse: (response: unknown) =>
        normalizeMeetupWinningCardResponse(response),
      invalidatesTags: (_result, _error, meetupUuid) => [
        { type: "GroupRecommendation", id: `MEETUP-${meetupUuid}` },
        { type: "GroupVoting", id: `MEETUP-${meetupUuid}` },
      ],
    }),

    /**
     * GET /api/v1/meetup/groups/share/{token}/candidates
     *
     * The meetup's own food slate. Resolved server-side against every
     * participating profile, so a guest — who cannot open a recommendation
     * session — gets the same group-safe list as everyone else.
     */
    getMeetupCandidates: builder.query<RecommendationItem[], string>({
      query: (shareToken) => ({
        url: `/meetup/groups/share/${encodeURIComponent(shareToken)}/candidates`,
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeArrayPayload<RecommendationItem>(response),
      providesTags: (_result, _error, shareToken) => [
        { type: "GroupRecommendation", id: `CANDIDATES-${shareToken}` },
      ],
    }),

    /** GET /api/v1/meetup/groups/share/{token}/result */
    getMeetupResult: builder.query<MeetupResultResponse, string>({
      query: (shareToken) => ({
        url: `/meetup/groups/share/${encodeURIComponent(shareToken)}/result`,
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeMeetupResultResponse(response),
      providesTags: (result, _error, shareToken) => [
        {
          type: "GroupVoting",
          id: result?.meetupUuid ? `MEETUP-${result.meetupUuid}` : `RESULT-${shareToken}`,
        },
      ],
    }),

    /** POST /api/v1/notifications/triggers/group-meetup-invite */
    triggerGroupMeetupInvite: builder.mutation<
      { message: string },
      { meetupUuid: string; inviteeProfileUuids: string[]; message?: string }
    >({
      query: (body) => ({
        url: "/notifications/triggers/group-meetup-invite",
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) =>
        normalizePayload(response, { message: "Invites sent successfully" }),
    }),
  }),

  overrideExisting: true,
});

export const {
  // Group
  useCreateMeetupMutation,
  useGetMyMeetupsQuery,
  useCancelMeetupGroupMutation,
  useGetMeetupGroupQuery,
  useResolveMeetupShareTokenQuery,
  useUpdateMeetupGroupMutation,
  useDeleteMeetupGroupMutation,
  useCompleteMeetupVotingMutation,
  useGetMeetupResultQuery,
  useGetMeetupCandidatesQuery,
  useTriggerGroupMeetupInviteMutation,
  // Participants
  useJoinMeetupParticipantMutation,
  useUpdateMeetupParticipantLocationMutation,
  useLeaveMeetupParticipantMutation,
  useRemoveMeetupParticipantMutation,
  useGetMeetupParticipantQuery,
  useGetMeetupParticipantsQuery,
  // Votes
  useSubmitMeetupVoteMutation,
  useRetractMeetupVoteMutation,
  useGetMeetupVotesQuery,
  useGetMeetupVoteTallyQuery,
} = groupRecommendationApi;
