import { PublicBannerResponse, BannerCategory } from "@/types/publicBanner";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.BACKEND_API_URL ||
  "https://api.mhoubahar.store";

const CATEGORY_ENDPOINTS: Record<BannerCategory, string> = {
  MAIN: "/api/v1/banners/public/main",
  POPULAR: "/api/v1/banners/public/popular",
  LOCATION: "/api/v1/banners/public/locations",
  SEASON: "/api/v1/banners/public/season",
};

export const publicBannerApi = {
  /**
   * Fetch banners for a specific category
   * Uses 60-second ISR caching with Next.js revalidate tags
   */
  async getBannersByCategory(
    category: BannerCategory,
  ): Promise<PublicBannerResponse[]> {
    try {
      const cleanBaseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/i, "").replace(
        /\/+$/,
        "",
      );
      const endpoint = CATEGORY_ENDPOINTS[category];
      const url = `${cleanBaseUrl}${endpoint}`;

      const res = await fetch(url, {
        method: "GET",
        next: {
          revalidate: 60,
          tags: [`banners:${category.toLowerCase()}`],
        },
      });

      if (!res.ok) {
        console.error(`Failed to fetch ${category} banners:`, res.statusText);
        return [];
      }

      return res.json();
    } catch (error) {
      console.error(`Error fetching ${category} banners:`, error);
      return [];
    }
  },

  /**
   * Helper to build full image URL from MinIO media endpoint or external CDN
   */
  resolveImageUrl(relativeOrAbsoluteUrl?: string | null): string {
    if (!relativeOrAbsoluteUrl) return "/images/banner-placeholder.webp";
    if (
      relativeOrAbsoluteUrl.startsWith("http://") ||
      relativeOrAbsoluteUrl.startsWith("https://") ||
      relativeOrAbsoluteUrl.startsWith("data:") ||
      relativeOrAbsoluteUrl.startsWith("blob:")
    ) {
      return relativeOrAbsoluteUrl;
    }
    const cleanBaseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/i, "").replace(
      /\/+$/,
      "",
    );
    const formattedPath = relativeOrAbsoluteUrl.startsWith("/")
      ? relativeOrAbsoluteUrl
      : `/${relativeOrAbsoluteUrl}`;
    return `${cleanBaseUrl}${formattedPath}`;
  },

  getMainBanners(): Promise<PublicBannerResponse[]> {
    return this.getBannersByCategory("MAIN");
  },

  getPopularBanners(): Promise<PublicBannerResponse[]> {
    return this.getBannersByCategory("POPULAR");
  },

  getLocationBanners(): Promise<PublicBannerResponse[]> {
    return this.getBannersByCategory("LOCATION");
  },

  getSeasonBanners(): Promise<PublicBannerResponse[]> {
    return this.getBannersByCategory("SEASON");
  },
};

export const bannerApi = publicBannerApi;
export default publicBannerApi;
