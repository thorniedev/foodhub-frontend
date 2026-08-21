import { z } from "zod";
import type { BannerCategory, PublicBannerResponse } from "@/types/banner";

/**
 * Verified against kh.edu.istad.ite.foodhub.feature.banner.controller.PublicBannerController:
 * GET /api/v1/banners/public/main | popular | locations | season
 * No auth required; each endpoint returns published banners for one category
 * as a plain JSON array (no page/data envelope).
 */
const CATEGORY_PATH: Record<BannerCategory, string> = {
  MAIN: "main",
  POPULAR: "popular",
  LOCATION: "locations",
  SEASON: "season",
};

/**
 * Public banner content changes rarely (admin publish/unpublish actions).
 * 60s ISR balances freshness against hammering the backend on every request.
 * Each category also gets its own cache tag (banners:main, banners:popular,
 * ...) for future targeted revalidation; since foodhub-admin and
 * foodhub-frontend are separate deployments, admin mutations cannot call
 * revalidateTag() here directly, so the 60s window is the actual freshness
 * guarantee today.
 */
const CACHE_REVALIDATE_SECONDS = 60;

function getBackendApiBaseUrl(): string {
  const configured =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!configured) {
    throw new BannerApiError("Missing BACKEND_API_URL configuration");
  }

  const trimmed = configured.trim().replace(/\/+$/, "");
  return /\/api\/v1$/i.test(trimmed) ? trimmed : `${trimmed}/api/v1`;
}

const publicBannerResponseSchema = z.object({
  id: z.string(),
  image: z.string(),
  location: z.string().nullish(),
  title: z.string(),
  description: z.string().nullish(),
});

const publicBannerListSchema = z.array(publicBannerResponseSchema);

export class BannerApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "BannerApiError";
    this.status = status;
  }
}

/**
 * Fetches one published banner category directly from the FoodHub backend
 * (server-side only — BACKEND_API_URL is not a NEXT_PUBLIC_ variable and is
 * never sent to the browser). A non-2xx response or a response that fails
 * runtime shape validation both throw BannerApiError; callers must treat
 * that as a genuine failure, never silently substitute an empty array.
 */
async function fetchPublicBanners(
  category: BannerCategory,
): Promise<PublicBannerResponse[]> {
  const url = `${getBackendApiBaseUrl()}/banners/public/${CATEGORY_PATH[category]}`;

  let response: Response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    response = await fetch(url, {
      signal: controller.signal,
      next: {
        revalidate: CACHE_REVALIDATE_SECONDS,
        tags: [`banners:${category.toLowerCase()}`],
      },
    });
  } catch (error) {
    throw new BannerApiError(
      `Could not reach the FoodHub backend for ${category} banners`,
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    console.error(
      `[public-banner-api] ${category} request failed with status ${response.status}`,
    );
    throw new BannerApiError(`Failed to load ${category} banners`, response.status);
  }

  const json: unknown = await response.json();
  const parsed = publicBannerListSchema.safeParse(json);

  if (!parsed.success) {
    console.error(
      `[public-banner-api] ${category} response failed validation`,
      parsed.error.flatten(),
    );
    throw new BannerApiError(`Malformed ${category} banners response`);
  }

  return parsed.data;
}

export const publicBannerApi = {
  getMainBanners: (): Promise<PublicBannerResponse[]> =>
    fetchPublicBanners("MAIN"),
  getPopularBanners: (): Promise<PublicBannerResponse[]> =>
    fetchPublicBanners("POPULAR"),
  getLocationBanners: (): Promise<PublicBannerResponse[]> =>
    fetchPublicBanners("LOCATION"),
  getSeasonBanners: (): Promise<PublicBannerResponse[]> =>
    fetchPublicBanners("SEASON"),
};
