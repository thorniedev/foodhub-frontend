import { z } from "zod";
import type { BannerCategory, PublicBannerResponse } from "@/types/banner";

/**
 * Public Banner API Service for FoodHub Web / PWA Frontend
 * Endpoint mapping:
 * - MAIN     -> GET /api/v1/banners/public/main
 * - POPULAR  -> GET /api/v1/banners/public/popular
 * - LOCATION -> GET /api/v1/banners/public/locations
 * - SEASON   -> GET /api/v1/banners/public/season
 */

const CATEGORY_ENDPOINT: Record<BannerCategory, string> = {
  MAIN: "main",
  POPULAR: "popular",
  LOCATION: "locations",
  SEASON: "season",
};

const CACHE_REVALIDATE_SECONDS = 60;

function getApiBaseUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://api.mhoubahar.store";

  const trimmed = configured.trim().replace(/\/+$/, "");
  return /\/api\/v1$/i.test(trimmed) ? trimmed : `${trimmed}/api/v1`;
}

const publicBannerSchema = z.object({
  id: z.string(),
  image: z.string(),
  location: z.string().nullish(),
  title: z.string(),
  description: z.string().nullish(),
});

const publicBannerListSchema = z.array(publicBannerSchema);

export class BannerApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "BannerApiError";
    this.status = status;
  }
}

/**
 * Fetches published banners for a specific category.
 * Uses 60-second ISR caching with Next.js revalidate tags.
 */
export async function getBannersByCategory(
  category: BannerCategory,
): Promise<PublicBannerResponse[]> {
  const endpoint = CATEGORY_ENDPOINT[category];
  const url = `${getApiBaseUrl()}/banners/public/${endpoint}`;

  let response: Response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    response = await fetch(url, {
      signal: controller.signal,
      next: {
        revalidate: CACHE_REVALIDATE_SECONDS,
        tags: [`banners:${category.toLowerCase()}`],
      },
    });
  } catch (error) {
    console.error(`[bannerApi] Network error fetching ${category} banners:`, error);
    throw new BannerApiError(
      `Could not reach the backend for ${category} banners`,
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    console.error(
      `[bannerApi] ${category} banner request failed with status ${response.status}`,
    );
    throw new BannerApiError(`Failed to load ${category} banners`, response.status);
  }

  const json: unknown = await response.json();
  const parsed = publicBannerListSchema.safeParse(json);

  if (!parsed.success) {
    console.error(
      `[bannerApi] ${category} response failed validation:`,
      parsed.error.flatten(),
    );
    throw new BannerApiError(`Malformed ${category} banners response`);
  }

  return parsed.data;
}

export const bannerApi = {
  getBannersByCategory,
  getMainBanners: () => getBannersByCategory("MAIN"),
  getPopularBanners: () => getBannersByCategory("POPULAR"),
  getLocationBanners: () => getBannersByCategory("LOCATION"),
  getSeasonBanners: () => getBannersByCategory("SEASON"),
};

export const publicBannerApi = bannerApi;
