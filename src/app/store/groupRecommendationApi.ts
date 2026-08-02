import { baseApi } from "./baseApi";

import type {
  CreateGroupSessionRequest,
  CreateGroupSessionResponse,
  FinishSharedVotingRequest,
  JoinGroupSessionRequest,
  JoinGroupSessionResponse,
  SharedGroupSession,
  SubmitSharedVoteRequest,
} from "@/types/group-recommendation";

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
  useCreateMockGroupSessionMutation,
  useGetMockGroupSessionQuery,
  useJoinMockGroupSessionMutation,
  useSubmitMockGroupVoteMutation,
  useFinishMockGroupVotingMutation,
} = groupRecommendationApi;
