import { baseApi } from "@/app/store/baseApi";

import type { CurrentUser } from "@/types/user/current-user";

export interface UpdateCurrentUserRequest {
  firstName: string;
  lastName: string;
}

interface CurrentUserSessionResponse {
  authenticated: boolean;
  user: CurrentUser;
}

export const currentUserApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query<CurrentUser, void>({
      query: () => ({
        url: "/auth/session",
        method: "GET",
      }),

      transformResponse: (response: CurrentUserSessionResponse) =>
        response.user,

      providesTags: ["User"],
    }),

    updateCurrentUser: builder.mutation<CurrentUser, UpdateCurrentUserRequest>({
      query: (body) => ({
        url: "/users/me",
        method: "PATCH",
        body,
      }),

      invalidatesTags: ["User"],
    }),
  }),

  overrideExisting: false,
});

export const { useGetCurrentUserQuery, useUpdateCurrentUserMutation } =
  currentUserApi;
