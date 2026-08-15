import type {
  FoodStore,
  StorePageFilters,
  StorePageOption,
} from "@/types/store-page";

export const DEFAULT_STORE_FILTERS: StorePageFilters = {
  cities: [],
  provinces: [],
  operatingStatuses: [],
  openNowOnly: false,
  minimumRating: null,
  sortBy: "default",
};

export function normalizeStoreText(value?: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKC");
}

export function toggleStoreFilterValue(
  values: string[],
  value: string,
): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function formatOperatingStatusLabel(value: string): string {
  switch (value.trim().toUpperCase()) {
    case "OPEN":
      return "បើក";
    case "CLOSED":
      return "បានបិទ";
    case "TEMPORARILY_CLOSED":
      return "បិទជាបណ្ដោះអាសន្ន";
    case "PERMANENTLY_CLOSED":
      return "បិទជាអចិន្ត្រៃយ៍";
    case "UNKNOWN":
      return "មិនទាន់ដឹង";
    default:
      return value;
  }
}

export function getStoreFilterOptions(
  stores: FoodStore[],
  getValue: (store: FoodStore) => string | number | null | undefined,
  getLabel?: (value: string, store: FoodStore) => string,
): StorePageOption[] {
  const optionMap = new Map<string, StorePageOption>();

  stores.forEach((store) => {
    const rawValue = getValue(store);

    if (
      rawValue === null ||
      rawValue === undefined ||
      String(rawValue).trim() === ""
    ) {
      return;
    }

    const code = String(rawValue).trim();
    const existing = optionMap.get(code);

    if (existing) {
      existing.count += 1;
      return;
    }

    optionMap.set(code, {
      code,
      name: getLabel?.(code, store) ?? code,
      count: 1,
    });
  });

  return Array.from(optionMap.values()).sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}

function matchesStoreSearch(store: FoodStore, searchQuery: string): boolean {
  const query = normalizeStoreText(searchQuery);

  if (!query) {
    return true;
  }

  const searchableText = [
    store.uuid,
    store.storeName,
    store.addressLine,
    store.city,
    store.province,
    store.latitude,
    store.longitude,
    store.distanceMeters,
    store.averageRating,
    store.totalReviews,
    store.operatingStatus,
    store.isOpenNow,
  ]
    .map(normalizeStoreText)
    .join(" ");

  return query
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .every((token) => searchableText.includes(token));
}

export function applyStoreFilters(
  stores: FoodStore[],
  searchQuery: string,
  filters: StorePageFilters,
): FoodStore[] {
  const filteredStores = stores.filter((store) => {
    if (!matchesStoreSearch(store, searchQuery)) {
      return false;
    }

    // Use isOpenNow for the real current-open state.
    if (filters.openNowOnly && store.isOpenNow !== true) {
      return false;
    }

    if (
      filters.cities.length > 0 &&
      (!store.city || !filters.cities.includes(store.city))
    ) {
      return false;
    }

    if (
      filters.provinces.length > 0 &&
      (!store.province || !filters.provinces.includes(store.province))
    ) {
      return false;
    }

    if (
      filters.operatingStatuses.length > 0 &&
      !filters.operatingStatuses.includes(store.operatingStatus)
    ) {
      return false;
    }

    if (
      filters.minimumRating !== null &&
      Number(store.averageRating ?? 0) < filters.minimumRating
    ) {
      return false;
    }

    return true;
  });

  return [...filteredStores].sort((first, second) => {
    switch (filters.sortBy) {
      case "name-asc":
        return first.storeName.localeCompare(second.storeName);
      case "rating":
        return (
          Number(second.averageRating ?? 0) - Number(first.averageRating ?? 0)
        );
      case "reviews":
        return (
          Number(second.totalReviews ?? 0) - Number(first.totalReviews ?? 0)
        );
      case "default":
      default:
        return 0;
    }
  });
}

export function countActiveStoreFilters(filters: StorePageFilters): number {
  return (
    filters.cities.length +
    filters.provinces.length +
    filters.operatingStatuses.length +
    (filters.openNowOnly ? 1 : 0) +
    (filters.minimumRating !== null ? 1 : 0) +
    (filters.sortBy !== "default" ? 1 : 0)
  );
}

/** Current-open label. This is separate from operatingStatus. */
export function getStoreOpenNowLabel(store: FoodStore): string {
  return store.isOpenNow ? "បើកឥឡូវនេះ" : "បានបិទឥឡូវនេះ";
}

export function formatStoreDistance(distanceKm?: number | null): string {
  if (
    distanceKm === null ||
    distanceKm === undefined ||
    !Number.isFinite(distanceKm)
  ) {
    return "មិនទាន់មានចម្ងាយ";
  }

  if (distanceKm < 1) {
    return `${Math.max(1, Math.round(distanceKm * 1000))} m`;
  }

  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`;
  }

  return `${Math.round(distanceKm)} km`;
}

export function getBackendDistanceKm(store: FoodStore): number | null {
  if (store.distanceMeters === null || store.distanceMeters === undefined) {
    return null;
  }

  const meters = Number(store.distanceMeters);

  if (!Number.isFinite(meters) || meters < 0) {
    return null;
  }

  return meters / 1000;
}

function readUrlCandidate(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const url = value.trim();

  return url.startsWith("http://") || url.startsWith("https://") ? url : null;
}

/**
 * Resolve logoMediaUuid / coverMediaUuid into the temporary signed storage URL.
 *
 * Frontend:
 *   GET /api/media/{uuid}/access-url
 *
 * Proxy forwards to:
 *   GET /api/v1/media/{uuid}/access-url
 *
 * The signed URL has X-Amz-Expires=300, so resolve it when the card loads.
 */
export async function resolveStoreMediaUrl(
  mediaUuid?: string | null,
): Promise<string | null> {
  const uuid = mediaUuid?.trim();

  if (!uuid) {
    return null;
  }

  const endpoint = `/api/media/${encodeURIComponent(uuid)}/access-url`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json, text/plain, */*",
      },
      cache: "no-store",
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.warn("[STORE MEDIA] access-url request failed", {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        response: responseText,
      });

      return null;
    }

    const trimmed = responseText.trim();

    if (!trimmed) {
      return null;
    }

    // Plain URL response.
    const directUrl = readUrlCandidate(trimmed);
    if (directUrl) {
      return directUrl;
    }

    try {
      const parsed: unknown = JSON.parse(trimmed);

      // JSON string: "https://storage..."
      const stringUrl = readUrlCandidate(parsed);
      if (stringUrl) {
        return stringUrl;
      }

      if (typeof parsed !== "object" || parsed === null) {
        return null;
      }

      const record = parsed as Record<string, unknown>;
      const payload =
        typeof record.payload === "object" && record.payload !== null
          ? (record.payload as Record<string, unknown>)
          : null;
      const data =
        typeof record.data === "object" && record.data !== null
          ? (record.data as Record<string, unknown>)
          : null;

      const candidates: unknown[] = [
        record.url,
        record.accessUrl,
        record.signedUrl,
        record.presignedUrl,
        typeof record.payload === "string" ? record.payload : null,
        payload?.url,
        payload?.accessUrl,
        payload?.signedUrl,
        payload?.presignedUrl,
        typeof record.data === "string" ? record.data : null,
        data?.url,
        data?.accessUrl,
        data?.signedUrl,
        data?.presignedUrl,
      ];

      for (const candidate of candidates) {
        const resolved = readUrlCandidate(candidate);
        if (resolved) {
          return resolved;
        }
      }
    } catch {
      console.warn("[STORE MEDIA] Unsupported access-url response", {
        endpoint,
        response: trimmed,
      });
    }

    return null;
  } catch (error) {
    console.warn("[STORE MEDIA] Could not resolve store media", {
      uuid,
      endpoint,
      error: error instanceof Error ? error.message : String(error),
    });

    return null;
  }
}
