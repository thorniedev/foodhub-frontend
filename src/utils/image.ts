/**
 * Image URL Resolver for FoodHub Web / PWA
 * Resolves relative media paths (e.g. "/api/v1/media/{uuid}/file") to full URLs
 * or proxy paths, with placeholder fallbacks.
 */
export function resolveImageUrl(imagePath?: string | null): string {
  if (!imagePath || !imagePath.trim()) {
    return "/images/banner-placeholder.webp";
  }

  const trimmed = imagePath.trim();

  // Already an absolute URL or data/blob URI
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.BACKEND_API_URL ||
    "https://api.mhoubahar.store";

  // Remove trailing slashes and redundant /api/v1 suffix if present on base
  const cleanBaseUrl = baseUrl.replace(/\/api\/v1\/?$/i, "").replace(/\/+$/, "");

  // If path starts with /
  const formattedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  return `${cleanBaseUrl}${formattedPath}`;
}
