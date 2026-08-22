import { baseApi } from "./baseApi";

import {
  normalizeMeetupActionResponse,
  normalizeMeetupGroupResponse,
  normalizeMeetupParticipantResponse,
  normalizeMeetupVotesResponse,
  normalizeMeetupVoteResponse,
} from "@/lib/meetup/meetup-adapter";

import type {
  CreateMeetupRequest,
  JoinMeetupParticipantRequest,
  LeaveMeetupParticipantArgs,
  MeetupActionResponse,
  MeetupGroupResponse,
  MeetupParticipantResponse,
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
        body,
      }),
      transformResponse: (response: unknown) =>
        normalizeMeetupGroupResponse(response),
      invalidatesTags: [{ type: "GroupRecommendation", id: "MEETUP_LIST" }],
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
        body,
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
        body,
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
          candidateUuid: body.candidateUuid || body.foodUuid,
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
      transformResponse: (response: unknown): MeetupVoteTallyResponse => {
        if (
          typeof response === "object" &&
          response !== null &&
          !Array.isArray(response)
        ) {
          const raw = response as Record<string, unknown>;
          return {
            meetupUuid:
              typeof raw.meetupUuid === "string" ? raw.meetupUuid : null,
            totalVotes:
              typeof raw.totalVotes === "number" ? raw.totalVotes : 0,
            tally: Array.isArray(raw.tally)
              ? (raw.tally as Array<Record<string, unknown>>).map((entry) => ({
                  candidateUuid:
                    typeof entry.candidateUuid === "string"
                      ? entry.candidateUuid
                      : "",
                  voteCount:
                    typeof entry.voteCount === "number" ? entry.voteCount : 0,
                }))
              : [],
          };
        }
        return { meetupUuid: null, totalVotes: 0, tally: [] };
      },
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
      transformResponse: (response: unknown): MeetupWinningCardResponse => {
        if (typeof response === "object" && response !== null) {
          const raw = response as Record<string, unknown>;
          const target = (raw.payload || raw.data || raw) as Record<string, unknown>;
          return {
            meetupUuid: typeof target.meetupUuid === "string" ? target.meetupUuid : "",
            title: typeof target.title === "string" ? target.title : "",
            winningCandidateId: typeof target.winningCandidateId === "number" ? target.winningCandidateId : 0,
            winningCandidateName: typeof target.winningCandidateName === "string" ? target.winningCandidateName : "Winner Choice",
            totalVotes: typeof target.totalVotes === "number" ? target.totalVotes : 0,
            meetingPointLat: typeof target.meetingPointLat === "number" ? target.meetingPointLat : 0,
            meetingPointLng: typeof target.meetingPointLng === "number" ? target.meetingPointLng : 0,
            mapsDirectionsUrl: typeof target.mapsDirectionsUrl === "string" ? target.mapsDirectionsUrl : "",
            decidedAt: typeof target.decidedAt === "string" ? target.decidedAt : new Date().toISOString(),
            storeName: typeof target.storeName === "string" ? target.storeName : undefined,
            foodName: typeof target.foodName === "string" ? target.foodName : undefined,
            foodPhotoUrl: typeof target.foodPhotoUrl === "string" ? target.foodPhotoUrl : undefined,
            rating: typeof target.rating === "number" ? target.rating : undefined,
            price: typeof target.price === "number" ? target.price : undefined,
            distanceKm: typeof target.distanceKm === "number" ? target.distanceKm : undefined,
          };
        }
        return {
          meetupUuid: "",
          title: "",
          winningCandidateId: 0,
          winningCandidateName: "",
          totalVotes: 0,
          meetingPointLat: 0,
          meetingPointLng: 0,
          mapsDirectionsUrl: "",
          decidedAt: new Date().toISOString(),
        };
      },
      invalidatesTags: (_result, _error, meetupUuid) => [
        { type: "GroupRecommendation", id: `MEETUP-${meetupUuid}` },
        { type: "GroupVoting", id: `MEETUP-${meetupUuid}` },
      ],
    }),

    /** GET /api/v1/meetup/groups/{uuid}/winning-card */
    getMeetupWinningCard: builder.query<MeetupWinningCardResponse, string>({
      query: (meetupUuid) => ({
        url: `/meetup/groups/${encodeURIComponent(meetupUuid)}/winning-card`,
        method: "GET",
      }),
      transformResponse: (response: unknown): MeetupWinningCardResponse => {
        if (typeof response === "object" && response !== null) {
          const raw = response as Record<string, unknown>;
          const target = (raw.payload || raw.data || raw) as Record<string, unknown>;
          return {
            meetupUuid: typeof target.meetupUuid === "string" ? target.meetupUuid : "",
            title: typeof target.title === "string" ? target.title : "",
            winningCandidateId: typeof target.winningCandidateId === "number" ? target.winningCandidateId : 0,
            winningCandidateName: typeof target.winningCandidateName === "string" ? target.winningCandidateName : "Winner Choice",
            totalVotes: typeof target.totalVotes === "number" ? target.totalVotes : 0,
            meetingPointLat: typeof target.meetingPointLat === "number" ? target.meetingPointLat : 0,
            meetingPointLng: typeof target.meetingPointLng === "number" ? target.meetingPointLng : 0,
            mapsDirectionsUrl: typeof target.mapsDirectionsUrl === "string" ? target.mapsDirectionsUrl : "",
            decidedAt: typeof target.decidedAt === "string" ? target.decidedAt : new Date().toISOString(),
            storeName: typeof target.storeName === "string" ? target.storeName : undefined,
            foodName: typeof target.foodName === "string" ? target.foodName : undefined,
            foodPhotoUrl: typeof target.foodPhotoUrl === "string" ? target.foodPhotoUrl : undefined,
            rating: typeof target.rating === "number" ? target.rating : undefined,
            price: typeof target.price === "number" ? target.price : undefined,
            distanceKm: typeof target.distanceKm === "number" ? target.distanceKm : undefined,
          };
        }
        return {
          meetupUuid: "",
          title: "",
          winningCandidateId: 0,
          winningCandidateName: "",
          totalVotes: 0,
          meetingPointLat: 0,
          meetingPointLng: 0,
          mapsDirectionsUrl: "",
          decidedAt: new Date().toISOString(),
        };
      },
      providesTags: (_result, _error, meetupUuid) => [
        { type: "GroupVoting", id: `MEETUP-${meetupUuid}` },
      ],
    }),
  }),

  overrideExisting: true,
});

export const {
  // Group
  useCreateMeetupMutation,
  useGetMeetupGroupQuery,
  useResolveMeetupShareTokenQuery,
  useUpdateMeetupGroupMutation,
  useDeleteMeetupGroupMutation,
  useCompleteMeetupVotingMutation,
  useGetMeetupWinningCardQuery,
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

