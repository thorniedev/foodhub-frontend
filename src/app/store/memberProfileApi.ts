import { baseApi } from "@/app/store/baseApi";

import type {
  GetMemberProfilesParams,
  MemberProfileResponse,
} from "@/types/member-profile/member-profile";

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
  }),
});

export const { useGetMemberProfilesQuery } = memberProfileApi;
