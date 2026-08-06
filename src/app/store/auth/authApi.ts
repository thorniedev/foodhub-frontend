import { baseApi } from "../baseApi";

import type { RegisterRequest, RegisterResponse } from "@/types/auth";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),

      invalidatesTags: ["Auth"],
    }),
  }),

  overrideExisting: false,
});

export const { useRegisterMutation } = authApi;
