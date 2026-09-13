import { baseApi } from "./baseApi";
import { normalizePayload } from "./utils/normalize";
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

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(val: unknown): val is string {
  return typeof val === "string" && UUID_REGEX.test(val.trim());
}

function filterValidUuids(arr: unknown): string[] | undefined {
  if (!Array.isArray(arr)) return undefined;
  const valid = arr.filter(isValidUuid);
  return valid.length > 0 ? valid : undefined;
}

export function sanitizeCustomerSearchRequest(
  request?: CustomerSearchRequest,
): CustomerSearchRequest {
  if (!request) return {};
  const cleaned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(request)) {
    if (value === undefined || value === null) continue;

    if (key.endsWith("Uuids") || key.endsWith("Uuid")) {
      if (Array.isArray(value)) {
        const filtered = filterValidUuids(value);
        if (filtered) cleaned[key] = filtered;
      } else if (isValidUuid(value)) {
        cleaned[key] = (value as string).trim();
      }
      // Non-UUID strings are safely excluded so backend Jackson never throws 400
    } else if (Array.isArray(value)) {
      if (value.length > 0) cleaned[key] = value;
    } else if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) cleaned[key] = trimmed;
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned as CustomerSearchRequest;
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
        return normalizePayload<PublicSearchResponse>(res, res);
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
        return normalizePayload<DiscoveryFilterOptionsResponse>(res, res);
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
      query: ({ page = 0, size = 20, sort = "NEWEST", request }) => ({
        url: "/discovery/menu-items/search",
        method: "POST",
        params: {
          page,
          size,
          sort,
        },
        body: sanitizeCustomerSearchRequest(request),
      }),
      transformResponse: (res: any) => {
        return normalizePayload(res, res);
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
        return normalizePayload<AdminSearchResponse>(res, res);
      },
    }),

    /**
     * Trigger Catalog Reindex
     * POST /api/v1/admin/search/reindex
     * Requires ADMIN role.
     */
    reindexSearch: builder.mutation<ReindexResponse, void>({
      query: () => ({
        url: "/admin/search/reindex",
        method: "POST",
      }),
      transformResponse: (res: any) => {
        return normalizePayload<ReindexResponse>(res, res);
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
