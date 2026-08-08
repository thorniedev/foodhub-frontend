import { baseApi } from "./baseApi";

import {
  normalizeMeetupActionResponse,
  normalizeMeetupGroupResponse,
  normalizeMeetupParticipantResponse,
  normalizeMeetupParticipantsResponse,
  normalizeMeetupVoteResponse,
  normalizeMeetupVotesResponse,
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
  JoinMeetupParticipantRequest,
  LeaveMeetupParticipantArgs,
  MeetupActionResponse,
  MeetupGroupResponse,
  MeetupParticipantResponse,
  MeetupParticipantsResponse,
  MeetupVoteResponse,
  MeetupVotesResponse,
  SubmitMeetupVoteRequest,
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

    const data = (await response.json()) as T | ApiErrorBody;

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
      invalidatesTags: (_result, _error, body) => [
        {
          type: "GroupRecommendation",
          id: `PARTICIPANTS-${body.meetupUuid}`,
        },
      ],
    }),

    getMeetupParticipants: builder.query<MeetupParticipantsResponse, string>({
      query: (meetupUuid) => ({
        url: `/meetup/participants/meetup/${encodeURIComponent(meetupUuid)}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeMeetupParticipantsResponse(response),
      providesTags: (_result, _error, meetupUuid) => [
        {
          type: "GroupRecommendation",
          id: `PARTICIPANTS-${meetupUuid}`,
        },
      ],
    }),

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
          ? [
              {
                type: "GroupRecommendation" as const,
                id: `PARTICIPANTS-${args.meetupUuid}`,
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
          id: `PARTICIPANTS-${meetupUuid}`,
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
  useJoinMeetupParticipantMutation,
  useGetMeetupParticipantsQuery,
  useLeaveMeetupParticipantMutation,
  useCancelMeetupMutation,
  useSubmitMeetupVoteMutation,
  useGetMeetupVotesQuery,

  useCreateMockGroupSessionMutation,
  useGetMockGroupSessionQuery,
  useJoinMockGroupSessionMutation,
  useSubmitMockGroupVoteMutation,
  useFinishMockGroupVotingMutation,
} = groupRecommendationApi;
