import { baseApi } from "./baseApi";
import type {
  PublicSearchParams,
  PublicSearchResponse,
  DiscoveryFilterOptionsResponse,
  CustomerSearchRequest,
  MenuItemDiscoveryResponse,
  DiscoveryPaginatedResponse,
  AdminSearchParams,
  AdminSearchResponse,
  ReindexResponse,
} from "@/types/search";

export interface DiscoverySearchQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  request: CustomerSearchRequest;
}

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
      transformResponse: (res: any) => {
        return res?.payload ?? res;
      },
      providesTags: ["MenuItem", "Food"],
    }),

    /**
     * Discovery Filter Options
     * GET /api/v1/discovery/menu-items/filters
     * Returns available metadata for discovery search filters.
     */
    getDiscoveryFilters: builder.query<DiscoveryFilterOptionsResponse, void>({
      query: () => ({
        url: "/discovery/menu-items/filters",
        method: "GET",
      }),
      transformResponse: (res: any) => {
        return res?.payload ?? res;
      },
    }),

    /**
     * Discovery Search Mutation
     * POST /api/v1/discovery/menu-items/search?page=0&size=20&sort=FOODHUB_RATING_DESC
     * Evaluates safety against profileUuid and searches items using filter request body.
     */
    discoverySearch: builder.mutation<
      DiscoveryPaginatedResponse | MenuItemDiscoveryResponse[],
      DiscoverySearchQueryParams
    >({
      query: ({ page = 0, size = 20, sort = "FOODHUB_RATING_DESC", request }) => ({
        url: "/discovery/menu-items/search",
        method: "POST",
        params: {
          page,
          size,
          sort,
        },
        body: request,
      }),
      transformResponse: (res: any) => {
        return res?.payload ?? res;
      },
      invalidatesTags: ["MenuItem"],
    }),

    /**
     * Admin Search
     * GET /api/v1/admin/search?q=...&limit=...&offset=...
     * Requires ADMIN role.
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
      transformResponse: (res: any) => {
        return res?.payload ?? res;
      },
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
      transformResponse: (res: any) => {
        return res?.payload ?? res;
      },
    }),
  }),

  overrideExisting: true,
});

export const {
  usePublicSearchQuery,
  useLazyPublicSearchQuery,
  useGetDiscoveryFiltersQuery,
  useDiscoverySearchMutation,
  useAdminSearchQuery,
  useLazyAdminSearchQuery,
  useReindexSearchMutation,
} = searchApi;
