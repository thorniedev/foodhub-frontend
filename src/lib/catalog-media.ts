export const DEFAULT_FOOD_IMAGE = "/Image/default-food.png";

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const FALLBACK_BACKEND = "https://api.mhoubahar.store";
const BACKEND_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  FALLBACK_BACKEND
).replace(/\/+$/, "");

/**
 * We bypass the local Next.js proxy (/api/...) for images to prevent
 * Next.js Image optimizer bugs with ArrayBuffer streaming in proxy routes.
 * Using absolute URLs lets Next.js Image Optimizer fetch directly from the backend.
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
    return `${BACKEND_URL}/api/v1/media/${source}/file`;
  }

  // If it already has the backend path prefix but just missing the domain
  if (source.startsWith("/api/v1/")) {
    // If it's a media route but missing /file
    if (source.startsWith("/api/v1/media/") && !source.endsWith("/file")) {
      return `${BACKEND_URL}${source}/file`;
    }
    return `${BACKEND_URL}${source}`;
  }

  if (source.startsWith("api/v1/")) {
    if (source.startsWith("api/v1/media/") && !source.endsWith("/file")) {
      return `${BACKEND_URL}/${source}/file`;
    }
    return `${BACKEND_URL}/${source}`;
  }

  // If it's already an absolute path but using the frontend proxy pattern (/api/catalog/...)
  // We want to force it to use the direct backend path
  if (source.startsWith("/api/")) {
    return `${BACKEND_URL}/api/v1/${source.slice("/api/".length)}`;
  }

  if (source.startsWith("api/")) {
    return `${BACKEND_URL}/api/v1/${source.slice("api/".length)}`;
  }

  // Fallback for completely unknown paths
  if (source.startsWith("/")) {
    return `${BACKEND_URL}${source}`;
  }

  return `${BACKEND_URL}/${source}`;
}
