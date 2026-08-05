import { baseApi } from "@/app/store/baseApi";

import type {
  CreateMemberProfileRequest,
  GetMemberProfilesParams,
  MemberProfile,
  MemberProfileResponse,
} from "@/types/member-profile/member-profile";

interface DeleteMemberProfileRequest {
  uuid: string;
}

export const memberProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMemberProfiles: builder.query<
      MemberProfileResponse,
      GetMemberProfilesParams | void
    >({
      query: (params) => ({
        url: "/profiles",
        method: "GET",
        params: params ?? {
          page: 0,
          size: 20,
        },
      }),

      providesTags: ["MemberProfile"],
    }),

    getMemberProfileById: builder.query<MemberProfile, string>({
      query: (uuid) => ({
        url: `/profiles/${encodeURIComponent(uuid)}`,
        method: "GET",
      }),

      providesTags: ["MemberProfile"],
    }),

    createMemberProfile: builder.mutation<
      MemberProfile,
      CreateMemberProfileRequest
    >({
      query: (body) => ({
        url: "/profiles",
        method: "POST",
        body,
      }),

      invalidatesTags: ["MemberProfile"],
    }),

    deleteMemberProfile: builder.mutation<void, DeleteMemberProfileRequest>({
      query: ({ uuid }) => ({
        url: `/profiles/${encodeURIComponent(uuid)}`,
        method: "DELETE",
      }),

      invalidatesTags: ["MemberProfile"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetMemberProfilesQuery,
  useGetMemberProfileByIdQuery,
  useCreateMemberProfileMutation,
  useDeleteMemberProfileMutation,
} = memberProfileApi;
