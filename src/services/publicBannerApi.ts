import { PublicBannerResponse, BannerCategory } from "@/types/publicBanner";

const CATEGORY_ENDPOINTS: Record<BannerCategory, string> = {
  MAIN: "/banners/public/main",
  POPULAR: "/banners/public/popular",
  LOCATION: "/banners/public/locations",
  SEASON: "/banners/public/season",
};

export const publicBannerApi = {
  /**
   * Fetch banners for a specific category
   * Uses client-safe /api proxy in browser to prevent CORS 403 blocks,
   * and direct backend endpoint on the server with 60-second ISR caching.
   */
  async getBannersByCategory(
    category: BannerCategory,
  ): Promise<PublicBannerResponse[]> {
    try {
      const isClient = typeof window !== "undefined";
      const endpoint = CATEGORY_ENDPOINTS[category];

      let url: string;
      if (isClient) {
        url = `/api${endpoint}`;
      } else {
        const rawBackendUrl = (
          process.env.BACKEND_API_URL ||
          process.env.NEXT_PUBLIC_API_URL ||
          "https://api.mhoubahar.store"
        )
          .trim()
          .replace(/\/+$/, "");

        const backendBase = /\/api\/v1$/i.test(rawBackendUrl)
          ? rawBackendUrl
          : `${rawBackendUrl}/api/v1`;

        url = `${backendBase}${endpoint}`;
      }

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        next: {
          revalidate: 60,
          tags: [`banners:${category.toLowerCase()}`],
        },
      });

      if (!res.ok) {
        console.error(
          `[publicBannerApi] Failed to fetch ${category} banners:`,
          res.status,
          res.statusText,
        );
        return [];
      }

      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`[publicBannerApi] Error fetching ${category} banners:`, error);
      return [];
    }
  },

  /**
   * Helper to build full image URL from MinIO media endpoint or external CDN
   */
  resolveImageUrl(relativeOrAbsoluteUrl?: string | null): string {
    if (!relativeOrAbsoluteUrl || !relativeOrAbsoluteUrl.trim()) {
      return "/images/banner-placeholder.webp";
    }
    const trimmed = relativeOrAbsoluteUrl.trim();
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("data:") ||
      trimmed.startsWith("blob:")
    ) {
      return trimmed;
    }
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    const rawBackendUrl = (
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.BACKEND_API_URL ||
      "https://api.mhoubahar.store"
    )
      .trim()
      .replace(/\/api\/v1\/?$/i, "")
      .replace(/\/+$/, "");

    return `${rawBackendUrl}${cleanPath}`;
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
