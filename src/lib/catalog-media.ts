export const DEFAULT_FOOD_IMAGE = "/Image/default-food.webp";

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

// Images are fetched directly from the backend instead of through this
// app's own /api proxy. That proxy's route segment is `force-dynamic`
// (required for the user/auth JSON routes it also serves), which per
// Next's caching model forces every fetch() it makes to `no-store` --
// image bytes included, on every load, for every visitor, with no way to
// override it per-request. Going straight to the backend lets next/image's
// own optimizer (already configured with a 1-year cache in next.config.ts)
// actually cache the result. GET on these paths is public on the backend --
// see requiresAuthentication() in src/app/api/[...all]/route.ts -- so no
// auth needs to travel with the request.
const BACKEND_ASSET_ORIGIN = (
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://api.mhoubahar.store"
)
  .trim()
  .replace(/\/+$/, "");

function toBackendAssetUrl(backendV1Path: string): string {
  return `${BACKEND_ASSET_ORIGIN}/api/v1/${backendV1Path.replace(/^\/+/, "")}`;
}

/**
 * Resolves a backend-relative media/image reference to a URL the browser
 * (via next/image) can load directly from the backend.
 *
 * Example:
 *
 * Backend value:
 * /api/v1/catalog/menu-items/{uuid}/images/1
 *
 * Resolved value:
 * https://api.mhoubahar.store/api/v1/catalog/menu-items/{uuid}/images/1
 */
export function toFrontendApiAssetUrl(
  value: string | null | undefined,
  fallback = DEFAULT_FOOD_IMAGE,
): string {
  const source = value?.trim();

  if (!source) {
    return fallback;
  }

  if (
    source.startsWith("http://") ||
    source.startsWith("https://") ||
    source.startsWith("data:") ||
    source.startsWith("blob:")
  ) {
    return source;
  }

  // If raw media UUID is provided: e.g. "b7ccff1e-90ee-49ea-b713-dbd8151be3e4"
  if (UUID_REGEX.test(source)) {
    return toBackendAssetUrl(`media/${source}/file`);
  }

  if (source.startsWith("/api/v1/media/") && !source.endsWith("/file")) {
    const mediaUuid = source.slice("/api/v1/media/".length);
    return toBackendAssetUrl(`media/${mediaUuid}/file`);
  }

  if (source.startsWith("api/v1/media/") && !source.endsWith("/file")) {
    const mediaUuid = source.slice("api/v1/media/".length);
    return toBackendAssetUrl(`media/${mediaUuid}/file`);
  }

  if (source.startsWith("/api/v1/")) {
    return toBackendAssetUrl(source.slice("/api/v1/".length));
  }

  if (source.startsWith("api/v1/")) {
    return toBackendAssetUrl(source.slice("api/v1/".length));
  }

  if (source.startsWith("/api/")) {
    return toBackendAssetUrl(source.slice("/api/".length));
  }

  if (source.startsWith("api/")) {
    return toBackendAssetUrl(source.slice("api/".length));
  }

  // Local, frontend-hosted asset (e.g. "/Image/food-picture/x.jpg") --
  // not a backend path, leave as-is.
  if (source.startsWith("/")) {
    return source;
  }

  return `/${source}`;
}
