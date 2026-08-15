export const DEFAULT_FOOD_IMAGE = "/Image/default-food.png";

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

  if (source.startsWith("/api/v1/")) {
    return `/api/${source.slice("/api/v1/".length)}`;
  }

  if (source.startsWith("api/v1/")) {
    return `/api/${source.slice("api/v1/".length)}`;
  }

  if (source.startsWith("/")) {
    return source;
  }

  return `/${source}`;
}
