import {
  baseApi,
} from "@/app/store/baseApi";

import type {
  CurrentUser,
} from "@/types/user/current-user";

interface AuthSessionResponse {
  authenticated: boolean;

  user: CurrentUser | null;
}

export interface UpdateCurrentUserRequest {
  firstName: string;
  lastName: string;
}

export const currentUserApi =
  baseApi.injectEndpoints({
    endpoints: (builder) => ({
      getCurrentUser:
        builder.query<
          CurrentUser | null,
          void
        >({
          query: () => ({
            url: "/auth/session",
            method: "GET",
          }),

          transformResponse: (
            response:
              AuthSessionResponse,
          ) => {
            return response.user;
          },

          providesTags: [
            "User",
          ],
        }),

      /*
       * Keep this only if your backend
       * PATCH /users/me works.
       */
      updateCurrentUser:
        builder.mutation<
          CurrentUser,
          UpdateCurrentUserRequest
        >({
          query: (body) => ({
            url: "/users/me",
            method: "PATCH",
            body,
          }),

          invalidatesTags: [
            "User",
          ],
        }),
    }),

    overrideExisting: false,
  });

export const {
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
} = currentUserApi;