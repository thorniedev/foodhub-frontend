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

/** Shape returned by the backend GET /api/v1/users/me */
export interface BackendUser {
  id: number;
  uuid: string;
  username: string;
  primaryEmail: string | null;
  firstName: string | null;
  lastName: string | null;
  status: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UpdateCurrentUserRequest {
  firstName: string;
  lastName: string;
}

export const currentUserApi =
  baseApi.injectEndpoints({
    endpoints: (builder) => ({
      /** Reads the Keycloak JWT session stored in cookies (no numeric id). */
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

      /**
       * Fetches the authenticated user from the real backend.
       * This is the only source that has the numeric `id` required
       * by endpoints such as POST /meetup/groups (createdByUserId).
       */
      getBackendUser:
        builder.query<
          BackendUser | null,
          void
        >({
          query: () => ({
            url: "/users/me",
            method: "GET",
          }),

          transformResponse: (response: unknown): BackendUser | null => {
            if (
              typeof response !== "object" ||
              response === null ||
              Array.isArray(response)
            ) {
              return null;
            }

            const raw = response as Record<string, unknown>;

            const id = typeof raw.id === "number" ? raw.id : null;

            if (!id) {
              return null;
            }

            return {
              id,
              uuid: typeof raw.uuid === "string" ? raw.uuid : "",
              username: typeof raw.username === "string" ? raw.username : "",
              primaryEmail:
                typeof raw.primaryEmail === "string" ? raw.primaryEmail : null,
              firstName:
                typeof raw.firstName === "string" ? raw.firstName : null,
              lastName:
                typeof raw.lastName === "string" ? raw.lastName : null,
              status: typeof raw.status === "string" ? raw.status : null,
              createdAt:
                typeof raw.createdAt === "string" ? raw.createdAt : null,
              updatedAt:
                typeof raw.updatedAt === "string" ? raw.updatedAt : null,
            };
          },

          providesTags: ["User"],
        }),

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
  useGetBackendUserQuery,
  useUpdateCurrentUserMutation,
} = currentUserApi;