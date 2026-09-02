export const DEFAULT_FOOD_IMAGE = "/Image/default-food.png";

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Backend responses contain paths beginning with /api/v1/ but the browser
 * talks to your Next.js catch-all proxy under /api/.
 *
 * Example:
 *
 * Backend value:
 * /api/v1/catalog/menu-items/{uuid}/images/1
 *
 * Browser value:
 * /api/catalog/menu-items/{uuid}/images/1
 *
 * Your Next.js proxy then forwards that request to the real backend /api/v1.
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
    return `/api/media/${source}/file`;
  }

  if (source.startsWith("/api/v1/media/") && !source.endsWith("/file")) {
    const mediaUuid = source.slice("/api/v1/media/".length);
    return `/api/media/${mediaUuid}/file`;
  }

  if (source.startsWith("api/v1/media/") && !source.endsWith("/file")) {
    const mediaUuid = source.slice("api/v1/media/".length);
    return `/api/media/${mediaUuid}/file`;
  }

  if (source.startsWith("/api/v1/")) {
    return `/api/${source.slice("/api/v1/".length)}`;
  }

  if (source.startsWith("api/v1/")) {
    return `/api/${source.slice("api/v1/".length)}`;
  }

  if (source.startsWith("/api/")) {
    return source;
  }

  if (source.startsWith("api/")) {
    return `/${source}`;
  }

  if (source.startsWith("/")) {
    return source;
  }

  return `/${source}`;
}
