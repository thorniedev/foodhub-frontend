import { baseApi } from "@/app/store/baseApi";
import type { CurrentUser } from "@/types/user/current-user";

export interface UpdateCurrentUserRequest {
  firstName: string;
  lastName: string;
}

export const currentUserApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query<CurrentUser, void>({
      query: () => ({
        url: "/users/me",
        method: "GET",
      }),
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

    syncCurrentUser: builder.mutation<CurrentUser, void>({
      query: () => ({
        url: "/users/me/sync",
        method: "PUT",
      }),

      invalidatesTags: ["User"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
  useSyncCurrentUserMutation,
} = currentUserApi;
