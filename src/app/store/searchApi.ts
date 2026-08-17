import { baseApi } from "./baseApi";
import type {
  PublicSearchParams,
  PublicSearchResponse,
  DiscoverySearchRequest,
  DiscoverySearchResponse,
  AdminSearchParams,
  AdminSearchResponse,
  ReindexResponse,
} from "@/types/search";

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Public Search
     * GET /api/v1/search?q=...&limit=...&offset=...
     * No authentication required. Searches active/approved menu items and stores.
     */
    publicSearch: builder.query<PublicSearchResponse, PublicSearchParams>({
      query: ({ q, limit = 10, offset = 0 }) => ({
        url: "/search",
        method: "GET",
        params: {
          q,
          limit,
          offset,
        },
      }),
      providesTags: ["MenuItem", "Food"],
    }),

    /**
     * Discovery Search
     * POST /api/v1/discovery/menu-items/search
     * No authentication required. Evaluates profile safety rules (allergies, exclusions).
     */
    discoverySearch: builder.mutation<
      DiscoverySearchResponse,
      DiscoverySearchRequest
    >({
      query: (body) => ({
        url: "/discovery/menu-items/search",
        method: "POST",
        body,
      }),
      invalidatesTags: ["MenuItem"],
    }),

    /**
     * Admin Search
     * GET /api/v1/admin/search?q=...&limit=...&offset=...
     * Requires ADMIN role. Unfiltered access to pending, rejected, inactive, sold out, or soft-deleted records.
     */
    adminSearch: builder.query<AdminSearchResponse, AdminSearchParams>({
      query: ({ q, limit = 10, offset = 0 }) => ({
        url: "/admin/search",
        method: "GET",
        params: {
          q,
          limit,
          offset,
        },
      }),
    }),

    /**
     * Admin Re-index Search
     * POST /api/v1/admin/search/reindex
     * Requires ADMIN role. Manually triggers Meilisearch re-indexing.
     */
    reindexSearch: builder.mutation<ReindexResponse, void>({
      query: () => ({
        url: "/admin/search/reindex",
        method: "POST",
      }),
    }),
  }),

  overrideExisting: false,
});

export const {
  usePublicSearchQuery,
  useLazyPublicSearchQuery,
  useDiscoverySearchMutation,
  useAdminSearchQuery,
  useLazyAdminSearchQuery,
  useReindexSearchMutation,
} = searchApi;
