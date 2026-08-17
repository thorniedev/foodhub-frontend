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
            const target = (typeof raw.payload === "object" && raw.payload !== null
              ? raw.payload
              : typeof raw.data === "object" && raw.data !== null
              ? raw.data
              : raw) as Record<string, unknown>;

            const id =
              typeof target.id === "number"
                ? target.id
                : typeof target.id === "string" && Number.isFinite(Number(target.id))
                ? Number(target.id)
                : null;

            if (!id) {
              return null;
            }

            return {
              id,
              uuid: typeof target.uuid === "string" ? target.uuid : "",
              username: typeof target.username === "string" ? target.username : "",
              primaryEmail:
                typeof target.primaryEmail === "string" ? target.primaryEmail : null,
              firstName:
                typeof target.firstName === "string" ? target.firstName : null,
              lastName:
                typeof target.lastName === "string" ? target.lastName : null,
              status: typeof target.status === "string" ? target.status : null,
              createdAt:
                typeof target.createdAt === "string" ? target.createdAt : null,
              updatedAt:
                typeof target.updatedAt === "string" ? target.updatedAt : null,
            };
          },

          providesTags: ["User"],
        }),

      syncBackendUser: builder.mutation<BackendUser | null, void>({
        query: () => ({
          url: "/users/me/sync",
          method: "PUT",
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
          const target = (typeof raw.payload === "object" && raw.payload !== null
            ? raw.payload
            : typeof raw.data === "object" && raw.data !== null
            ? raw.data
            : raw) as Record<string, unknown>;

          const id =
            typeof target.id === "number"
              ? target.id
              : typeof target.id === "string" && Number.isFinite(Number(target.id))
              ? Number(target.id)
              : null;

          if (!id) return null;

          return {
            id,
            uuid: typeof target.uuid === "string" ? target.uuid : "",
            username: typeof target.username === "string" ? target.username : "",
            primaryEmail:
              typeof target.primaryEmail === "string" ? target.primaryEmail : null,
            firstName:
              typeof target.firstName === "string" ? target.firstName : null,
            lastName:
              typeof target.lastName === "string" ? target.lastName : null,
            status: typeof target.status === "string" ? target.status : null,
            createdAt:
              typeof target.createdAt === "string" ? target.createdAt : null,
            updatedAt:
              typeof target.updatedAt === "string" ? target.updatedAt : null,
          };
        },
        invalidatesTags: ["User"],
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

    overrideExisting: true,
  });

export const {
  useGetCurrentUserQuery,
  useGetBackendUserQuery,
  useSyncBackendUserMutation,
  useUpdateCurrentUserMutation,
} = currentUserApi;