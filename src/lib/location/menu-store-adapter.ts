import type { LocationStore } from "@/types/location-store";
import type { MenuItem } from "@/types/manu";

function normalizeImagePath(value: string | null | undefined): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed;
  }

  return `/${trimmed}`;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Builds the Location tab store collection directly from MenuItem.store.
 *
 * This intentionally avoids a second GET /stores request in the Location tab.
 * The Store tab can continue using the public Store endpoint independently.
 */
export function buildLocationStoresFromMenuItems(
  menuItems: MenuItem[],
): LocationStore[] {
  const storesByUuid = new Map<string, LocationStore>();

  for (const menuItem of menuItems) {
    const source = menuItem.store;

    if (!source?.uuid || storesByUuid.has(source.uuid)) {
      continue;
    }

    const latitude = toFiniteNumber(source.latitude);
    const longitude = toFiniteNumber(source.longitude);

    if (latitude === null || longitude === null) {
      continue;
    }

    const operatingStatus = String(source.operatingStatus ?? "UNKNOWN");
    const isOpenNow = operatingStatus.toUpperCase() === "OPEN";

    const normalizedStore = {
      uuid: source.uuid,

      storeName: source.name,
      name: source.name,
      localName: source.localName || null,
      description: "",

      addressLine: source.addressLine ?? "",
      commune: null,
      district: source.district ?? "",
      city: source.city ?? "",
      province: source.city ?? "",
      countryCode: "KH",
      postalCode: null,
      timezone: "Asia/Phnom_Penh",

      latitude,
      longitude,

      phoneNumber: null,
      email: null,

      logoMediaUuid: (source as { logoMediaUuid?: string | null }).logoMediaUuid || null,
      coverMediaUuid: (source as { coverMediaUuid?: string | null }).coverMediaUuid || null,
      logoUrl: normalizeImagePath(source.logoUrl),
      coverImageUrl: normalizeImagePath(source.coverImageUrl),

      priceLevel: null,
      hygieneRating: null,

      averageRating: toFiniteNumber(source.averageRating) ?? 0,
      totalReviews: toFiniteNumber(source.totalReviews) ?? 0,

      reviewStatus: "APPROVED",
      accountStatus: "ACTIVE",
      operatingStatus,
      isOpenNow,

      deliveryAvailable: false,
      pickupAvailable: false,

      socialLinks: [],
      openingHours: [],
      externalSource: null,
    } as unknown as LocationStore;

    storesByUuid.set(source.uuid, normalizedStore);
  }

  return Array.from(storesByUuid.values());
}
