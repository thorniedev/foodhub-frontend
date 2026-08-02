import { baseApi } from "../baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/api/auth/logout",
        method: "POST",
      }),
    }),

    refreshToken: builder.mutation<void, void>({
      query: () => ({
        url: "/api/auth/refresh",
        method: "POST",
      }),
    }),
  }),
});

export const { useLogoutMutation, useRefreshTokenMutation } = authApi;
