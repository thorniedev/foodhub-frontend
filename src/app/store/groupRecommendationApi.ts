import { baseApi } from "./baseApi";

import {
  normalizeMeetupActionResponse,
  normalizeMeetupGroupResponse,
  normalizeMeetupMeetingPointResponse,
  normalizeMeetupRecommendationSessionResponse,
  normalizeMeetupVoteResponse,
  normalizeMeetupVotesResponse,
  normalizeMeetupParticipantResponse,
} from "@/lib/meetup/meetup-adapter";

import type {
  CreateGroupSessionRequest,
  CreateGroupSessionResponse,
  FinishSharedVotingRequest,
  JoinGroupSessionRequest,
  JoinGroupSessionResponse,
  SharedGroupSession,
  SubmitSharedVoteRequest,
} from "@/types/group-recommendation";

import type {
  CreateMeetupRequest,
  LeaveMeetupParticipantArgs,
  MeetupActionResponse,
  MeetupGroupResponse,
  MeetupMeetingPointResponse,
  MeetupParticipantResponse,
  MeetupRecommendationSessionResponse,
  MeetupVoteResponse,
  MeetupVotesResponse,
  SubmitMeetupVoteRequest,
  UpdateMeetupGroupArgs,
  UpdateMeetupParticipantLocationArgs,
} from "@/types/meetup-api";

interface ApiErrorBody {
  message?: string;
}

async function requestJson<T>(
  url: string,
  init?: RequestInit,
): Promise<
  | { data: T }
  | {
      error: {
        status: number;
        data: ApiErrorBody;
      };
    }
> {
  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
      cache: "no-store",
    });

    const text = await response.text();

    const data = text ? (JSON.parse(text) as T | ApiErrorBody) : ({} as T);

    if (!response.ok) {
      return {
        error: {
          status: response.status,
          data: data as ApiErrorBody,
        },
      };
    }

    return {
      data: data as T,
    };
  } catch (error) {
    return {
      error: {
        status: 500,
        data: {
          message:
            error instanceof Error ? error.message : "Network request failed.",
        },
      },
    };
  }
}

export const groupRecommendationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createMeetup: builder.mutation<MeetupGroupResponse, CreateMeetupRequest>({
      query: (body) => ({
        url: "/meetup/groups",
        method: "POST",
        body,
      }),

      transformResponse: (response: unknown) =>
        normalizeMeetupGroupResponse(response),

      invalidatesTags: [
        {
          type: "GroupRecommendation",
          id: "MEETUP_LIST",
        },
      ],
    }),

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

    updateMeetupGroup: builder.mutation<
      MeetupGroupResponse,
      UpdateMeetupGroupArgs
    >({
      query: ({ meetupUuid, body }) => ({
        url: `/meetup/groups/${encodeURIComponent(meetupUuid)}`,
        method: "PATCH",
        body,
      }),

      transformResponse: (response: unknown) =>
        normalizeMeetupGroupResponse(response),

      invalidatesTags: (_result, _error, { meetupUuid }) => [
        {
          type: "GroupRecommendation",
          id: `MEETUP-${meetupUuid}`,
        },
      ],
    }),

    updateMeetupParticipantLocation: builder.mutation<
      MeetupParticipantResponse,
      UpdateMeetupParticipantLocationArgs
    >({
      query: ({ participantUuid, body }) => ({
        url: `/meetup/participants/${encodeURIComponent(
          participantUuid,
        )}/location`,
        method: "PATCH",
        body,
      }),

      transformResponse: (response: unknown) =>
        normalizeMeetupParticipantResponse(response),

      invalidatesTags: (_result, _error, args) =>
        args.meetupUuid
          ? [
              {
                type: "GroupRecommendation" as const,
                id: `MEETUP-${args.meetupUuid}`,
              },
            ]
          : [],
    }),

    calculateMeetupMeetingPoint: builder.mutation<
      MeetupMeetingPointResponse,
      string
    >({
      query: (meetupUuid) => ({
        url: `/meetup/groups/${encodeURIComponent(meetupUuid)}/meeting-point`,
        method: "POST",
      }),

      transformResponse: (response: unknown) =>
        normalizeMeetupMeetingPointResponse(response),

      invalidatesTags: (_result, _error, meetupUuid) => [
        {
          type: "GroupRecommendation",
          id: `MEETUP-${meetupUuid}`,
        },
      ],
    }),

    createMeetupRecommendations: builder.mutation<
      MeetupRecommendationSessionResponse,
      string
    >({
      query: (meetupUuid) => ({
        url: `/meetup/groups/${encodeURIComponent(meetupUuid)}/recommendations`,
        method: "POST",
      }),

      transformResponse: (response: unknown) =>
        normalizeMeetupRecommendationSessionResponse(response),

      invalidatesTags: (_result, _error, meetupUuid) => [
        {
          type: "GroupRecommendation",
          id: `MEETUP-${meetupUuid}`,
        },
      ],
    }),

    leaveMeetupParticipant: builder.mutation<
      MeetupActionResponse,
      LeaveMeetupParticipantArgs
    >({
      query: ({ participantUuid }) => ({
        url: `/meetup/participants/${encodeURIComponent(
          participantUuid,
        )}/leave`,
        method: "POST",
      }),

      transformResponse: (response: unknown) =>
        normalizeMeetupActionResponse(response),

      invalidatesTags: (_result, _error, args) =>
        args.meetupUuid
          ? [
              {
                type: "GroupRecommendation" as const,
                id: `MEETUP-${args.meetupUuid}`,
              },
            ]
          : [],
    }),

    cancelMeetup: builder.mutation<MeetupActionResponse, string>({
      query: (meetupUuid) => ({
        url: `/meetup/groups/${encodeURIComponent(meetupUuid)}/cancel`,
        method: "POST",
      }),

      transformResponse: (response: unknown) =>
        normalizeMeetupActionResponse(response),

      invalidatesTags: (_result, _error, meetupUuid) => [
        {
          type: "GroupRecommendation",
          id: `MEETUP-${meetupUuid}`,
        },
        {
          type: "GroupVoting",
          id: `MEETUP-${meetupUuid}`,
        },
      ],
    }),

    submitMeetupVote: builder.mutation<
      MeetupVoteResponse,
      SubmitMeetupVoteRequest
    >({
      query: (body) => ({
        url: "/meetup/votes",
        method: "POST",
        body: {
          ...body,
          rankChoice: body.rankChoice ?? 1,
        },
      }),

      transformResponse: (response: unknown) =>
        normalizeMeetupVoteResponse(response),

      invalidatesTags: (_result, _error, body) => [
        {
          type: "GroupVoting",
          id: `MEETUP-${body.meetupUuid}`,
        },
      ],
    }),

    getMeetupVotes: builder.query<MeetupVotesResponse, string>({
      query: (meetupUuid) => ({
        url: `/meetup/votes/meetup/${encodeURIComponent(meetupUuid)}`,
        method: "GET",
      }),

      transformResponse: (response: unknown) =>
        normalizeMeetupVotesResponse(response),

      providesTags: (_result, _error, meetupUuid) => [
        {
          type: "GroupVoting",
          id: `MEETUP-${meetupUuid}`,
        },
      ],
    }),

    finishMeetupVoting: builder.mutation<MeetupActionResponse, string>({
      query: (meetupUuid) => ({
        url: `/meetup/groups/${encodeURIComponent(meetupUuid)}/finish-voting`,
        method: "POST",
      }),

      transformResponse: (response: unknown) =>
        normalizeMeetupActionResponse(response),

      invalidatesTags: (_result, _error, meetupUuid) => [
        {
          type: "GroupRecommendation",
          id: `MEETUP-${meetupUuid}`,
        },
        {
          type: "GroupVoting",
          id: `MEETUP-${meetupUuid}`,
        },
      ],
    }),

    createMockGroupSession: builder.mutation<
      CreateGroupSessionResponse,
      CreateGroupSessionRequest
    >({
      queryFn: (body) =>
        requestJson<CreateGroupSessionResponse>("/api/mock/group-sessions", {
          method: "POST",
          body: JSON.stringify(body),
        }),

      invalidatesTags: [
        {
          type: "GroupVoting",
          id: "LIST",
        },
      ],
    }),

    getMockGroupSession: builder.query<SharedGroupSession, string>({
      queryFn: (inviteCode) =>
        requestJson<SharedGroupSession>(
          `/api/mock/group-sessions/${encodeURIComponent(inviteCode)}`,
        ),

      providesTags: (_result, _error, inviteCode) => [
        {
          type: "GroupVoting",
          id: inviteCode,
        },
      ],
    }),

    joinMockGroupSession: builder.mutation<
      JoinGroupSessionResponse,
      JoinGroupSessionRequest
    >({
      queryFn: ({ inviteCode, name }) =>
        requestJson<JoinGroupSessionResponse>(
          `/api/mock/group-sessions/${encodeURIComponent(inviteCode)}`,
          {
            method: "POST",
            body: JSON.stringify({
              action: "join",
              name,
            }),
          },
        ),

      invalidatesTags: (_result, _error, { inviteCode }) => [
        {
          type: "GroupVoting",
          id: inviteCode,
        },
      ],
    }),

    submitMockGroupVote: builder.mutation<
      SharedGroupSession,
      SubmitSharedVoteRequest
    >({
      queryFn: ({ inviteCode, participantToken, storeUuid }) =>
        requestJson<SharedGroupSession>(
          `/api/mock/group-sessions/${encodeURIComponent(inviteCode)}`,
          {
            method: "POST",
            body: JSON.stringify({
              action: "vote",
              participantToken,
              storeUuid,
            }),
          },
        ),

      invalidatesTags: (_result, _error, { inviteCode }) => [
        {
          type: "GroupVoting",
          id: inviteCode,
        },
      ],
    }),

    finishMockGroupVoting: builder.mutation<
      SharedGroupSession,
      FinishSharedVotingRequest
    >({
      queryFn: ({ inviteCode, ownerToken }) =>
        requestJson<SharedGroupSession>(
          `/api/mock/group-sessions/${encodeURIComponent(inviteCode)}`,
          {
            method: "POST",
            body: JSON.stringify({
              action: "finish",
              ownerToken,
            }),
          },
        ),

      invalidatesTags: (_result, _error, { inviteCode }) => [
        {
          type: "GroupVoting",
          id: inviteCode,
        },
      ],
    }),
  }),

  overrideExisting: true,
});

export const {
  useCreateMeetupMutation,
  useResolveMeetupShareTokenQuery,
  useUpdateMeetupGroupMutation,
  useUpdateMeetupParticipantLocationMutation,
  useCalculateMeetupMeetingPointMutation,
  useCreateMeetupRecommendationsMutation,
  useLeaveMeetupParticipantMutation,
  useCancelMeetupMutation,
  useSubmitMeetupVoteMutation,
  useGetMeetupVotesQuery,
  useFinishMeetupVotingMutation,
  useCreateMockGroupSessionMutation,
  useGetMockGroupSessionQuery,
  useJoinMockGroupSessionMutation,
  useSubmitMockGroupVoteMutation,
  useFinishMockGroupVotingMutation,
} = groupRecommendationApi;
