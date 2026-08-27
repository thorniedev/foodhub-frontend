import { baseApi } from "./baseApi";
import type { BannerItem } from "@/types/banner";

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
      providesTags: [{ type: "Banner" as const, id: "LOCATIONS" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSeasonBannersQuery,
  useGetPopularBannersQuery,
  useGetMainBannersQuery,
  useGetLocationBannersQuery,
} = bannerApi;
