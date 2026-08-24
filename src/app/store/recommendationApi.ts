import { baseApi } from "./baseApi";
import { normalizeArrayPayload, normalizePayload } from "./utils/normalize";

import type {
  CreateRecommendationSessionRequest,
  RecommendationItem,
  RecommendationSession,
} from "@/types/recommendation";

/**
 * Recommendation session API. Goes through the Next BFF proxy
 * (`/recommendations/*` -> `<backend>/api/v1/recommendations/*`), which
 * attaches the access token server-side.
 *
 * Implements the 2-step recommendation flow:
 *   1. POST /api/v1/recommendations/sessions -> creates session (items: null)
 *   2. GET /api/v1/recommendations/sessions/{uuid}/items -> retrieves ranked items
 */
export const recommendationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createRecommendationSession: builder.mutation<
      RecommendationSession,
      CreateRecommendationSessionRequest
    >({
      async queryFn(body, _queryApi, _extraOptions, fetchWithBQ) {
        // Step 1: Create session
        const createResult = await fetchWithBQ({
          url: "/recommendations/sessions",
          method: "POST",
          body,
        });

        if (createResult.error) {
          return { error: createResult.error };
        }

        const session = normalizePayload<RecommendationSession>(
          createResult.data,
          {} as RecommendationSession,
        );

        if (!session || !session.uuid) {
          return { data: session };
        }

        // If items are already populated, return directly
        if (Array.isArray(session.items) && session.items.length > 0) {
          return { data: session };
        }

        // Step 2: Fetch all ranked recommendation items for this session
        const limit = body.requestedLimit || 50;
        const itemsResult = await fetchWithBQ({
          url: `/recommendations/sessions/${encodeURIComponent(session.uuid)}/items?limit=${limit}`,
          method: "GET",
        });

        if (itemsResult.error) {
          return {
            data: {
              ...session,
              items: [],
            },
          };
        }

        const items = normalizeArrayPayload<RecommendationItem>(itemsResult.data);

        const normalizedItems: RecommendationItem[] = items.map((it: any) => ({
          ...it,
          isExploration: it.isExploration ?? it.exploration ?? false,
        }));

        return {
          data: {
            ...session,
            items: normalizedItems,
          },
        };
      },
    }),
  }),

  overrideExisting: false,
});

export const { useCreateRecommendationSessionMutation } = recommendationApi;

