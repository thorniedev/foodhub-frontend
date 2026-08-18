import { baseApi } from "./baseApi";

import type {
  CreateRecommendationSessionRequest,
  RecommendationSession,
} from "@/types/recommendation";

/**
 * Recommendation session API. Goes through the Next BFF proxy
 * (`/recommendations/*` -> `<backend>/api/v1/recommendations/*`), which
 * attaches the access token server-side. The browser never holds the backend
 * origin or token, and never calls the recommendation engine directly.
 */
export const recommendationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * POST /api/v1/recommendations/sessions
     * Creates a session (safety-filtered, ranked) and returns it with `items`.
     * The user prompt travels in `contextData.userPrompt`.
     */
    createRecommendationSession: builder.mutation<
      RecommendationSession,
      CreateRecommendationSessionRequest
    >({
      query: (body) => ({
        url: "/recommendations/sessions",
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown): RecommendationSession => {
        // Tolerate both the raw DTO and an `{ payload }` envelope.
        if (
          response &&
          typeof response === "object" &&
          "payload" in response &&
          (response as { payload?: unknown }).payload &&
          typeof (response as { payload?: unknown }).payload === "object"
        ) {
          return (response as { payload: RecommendationSession }).payload;
        }
        return response as RecommendationSession;
      },
    }),
  }),

  overrideExisting: false,
});

export const { useCreateRecommendationSessionMutation } = recommendationApi;
