import { toFrontendApiAssetUrl } from "./catalog-media";

/**
 * Resolves full image URL for a banner item or raw image string.
 * Handles media UUIDs, /api/v1/media paths, external URLs, and local assets.
 */
export function resolveBannerImageUrl(
  bannerOrUrl:
    | {
        imageUrl?: string | null;
        image?: string | null;
        imageMediaUuid?: string | null;
        thumbnail?: string | null;
      }
    | string
    | null
    | undefined,
  fallback = "/Image/food-picture/card 4.jpg",
): string {
  if (!bannerOrUrl) return fallback;

  if (typeof bannerOrUrl === "string") {
    return toFrontendApiAssetUrl(bannerOrUrl, fallback);
  }

  const rawUrl =
    bannerOrUrl.imageUrl ||
    bannerOrUrl.image ||
    bannerOrUrl.thumbnail ||
    (bannerOrUrl.imageMediaUuid
      ? `/api/v1/media/${bannerOrUrl.imageMediaUuid}/file`
      : null);

  return toFrontendApiAssetUrl(rawUrl, fallback);
}
