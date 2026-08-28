import { baseApi } from "./baseApi";
import { normalizeArrayPayload } from "./utils/normalize";
import type { BannerItem } from "@/types/banner";

function extractBannerPayload(response: unknown): BannerItem[] {
  if (Array.isArray(response)) {
    return response as BannerItem[];
  }
  if (
    response &&
    typeof response === "object" &&
    Array.isArray((response as Record<string, unknown>).payload)
  ) {
    return (response as { payload: BannerItem[] }).payload;
  }
  return [];
}

export const bannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // =========================================================
    // GET SEASON BANNERS
    // GET /api/v1/banners/public/season
    // =========================================================
    getSeasonBanners: builder.query<BannerItem[], void>({
      query: () => ({
        url: "/banners/public/season",
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeArrayPayload<BannerItem>(response),
      providesTags: [{ type: "Banner" as const, id: "SEASON" }],
    }),

    // =========================================================
    // GET POPULAR BANNERS
    // GET /api/v1/banners/public/popular
    // =========================================================
    getPopularBanners: builder.query<BannerItem[], void>({
      query: () => ({
        url: "/banners/public/popular",
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeArrayPayload<BannerItem>(response),
      providesTags: [{ type: "Banner" as const, id: "POPULAR" }],
    }),

    // =========================================================
    // GET MAIN BANNERS
    // GET /api/v1/banners/public/main
    // =========================================================
    getMainBanners: builder.query<BannerItem[], void>({
      query: () => ({
        url: "/banners/public/main",
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeArrayPayload<BannerItem>(response),
      providesTags: [{ type: "Banner" as const, id: "MAIN" }],
    }),

    // =========================================================
    // GET LOCATION BANNERS
    // GET /api/v1/banners/public/locations
    // =========================================================
    getLocationBanners: builder.query<BannerItem[], void>({
      query: () => ({
        url: "/banners/public/locations",
        method: "GET",
      }),
      transformResponse: (response: unknown) =>
        normalizeArrayPayload<BannerItem>(response),
      providesTags: [{ type: "Banner" as const, id: "LOCATIONS" }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetSeasonBannersQuery,
  useGetPopularBannersQuery,
  useGetMainBannersQuery,
  useGetLocationBannersQuery,
} = bannerApi;
