import { baseApi } from "./baseApi";

import type {
  GroupVotingResponse,
  SubmitGroupVoteRequest,
} from "@/types/group-recommendation";

export const groupRecommendationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGroupVoting: builder.query<GroupVotingResponse, string>({
      query: (groupId) => ({
        url: `/groups/${groupId}/votes`,
        method: "GET",
      }),

      providesTags: (_result, _error, groupId) => [
        {
          type: "GroupVoting",
          id: groupId,
        },
      ],
    }),

    submitGroupVote: builder.mutation<
      GroupVotingResponse,
      SubmitGroupVoteRequest
    >({
      query: ({ groupId, storeId }) => ({
        url: `/groups/${groupId}/votes`,
        method: "POST",
        body: {
          storeId,
        },
      }),

      invalidatesTags: (_result, _error, { groupId }) => [
        {
          type: "GroupVoting",
          id: groupId,
        },
      ],
    }),

    finishGroupVoting: builder.mutation<GroupVotingResponse, string>({
      query: (groupId) => ({
        url: `/groups/${groupId}/votes/finish`,
        method: "POST",
      }),

      invalidatesTags: (_result, _error, groupId) => [
        {
          type: "GroupVoting",
          id: groupId,
        },
      ],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetGroupVotingQuery,
  useSubmitGroupVoteMutation,
  useFinishGroupVotingMutation,
} = groupRecommendationApi;
