import type { LocationStore } from "@/types/location-store";

import type { MenuItem } from "@/types/manu";

import type {
  Coordinates,
  LocationFiltersState,
  RecommendationMode,
  RecommendedStore,
  StoreOperatingStatus,
} from "@/types/location";

import { calculateDistanceKm } from "./geo";

interface BuildRecommendedStoresInput {
  menuItems?: MenuItem[];
  stores?: LocationStore[];
  referencePoint: Coordinates | null;
}

interface FilterRecommendedStoresInput {
  stores?: RecommendedStore[];
  filters: LocationFiltersState;
  mode: RecommendationMode;

  searchQuery?: string;
}

interface OptionalStoreServices {
  deliveryAvailable?: unknown;
  pickupAvailable?: unknown;
}

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKC");
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      return null;
    }

    const parsedValue = Number(normalizedValue);

    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
}

function normalizeCoordinates(
  value:
    | {
        latitude?: unknown;
        longitude?: unknown;
      }
    | null
    | undefined,
): Coordinates | null {
  if (!value) {
    return null;
  }

  const latitude = toFiniteNumber(value.latitude);

  const longitude = toFiniteNumber(value.longitude);

  if (
    latitude === null ||
    longitude === null ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    latitude,
    longitude,
  };
}

function normalizeImagePath(
  imageUrl: string | null | undefined,
): string | null {
  const normalizedUrl = imageUrl?.trim();

  if (!normalizedUrl) {
    return null;
  }

  if (
    normalizedUrl.startsWith("/") ||
    normalizedUrl.startsWith("http://") ||
    normalizedUrl.startsWith("https://")
  ) {
    return normalizedUrl;
  }

  return `/${normalizedUrl}`;
}

function normalizeOperatingStatus(value: unknown): StoreOperatingStatus {
  if (value === true) {
    return "OPEN";
  }

  if (value === false) {
    return "CLOSED";
  }

  const normalizedValue = String(value ?? "")
    .trim()
    .toUpperCase();

  switch (normalizedValue) {
    case "OPEN":
    case "OPENED":
    case "ACTIVE":
      return "OPEN";

    case "CLOSED":
      return "CLOSED";

    case "TEMPORARILY_CLOSED":
    case "TEMPORARY_CLOSED":
      return "TEMPORARILY_CLOSED";

    case "PERMANENTLY_CLOSED":
      return "PERMANENTLY_CLOSED";

    case "UNKNOWN":
    default:
      return "UNKNOWN";
  }
}

function getOptionalService(
  store: LocationStore,
  key: "deliveryAvailable" | "pickupAvailable",
): boolean {
  const extendedStore = store as LocationStore & OptionalStoreServices;

  return extendedStore[key] === true;
}

function getMenuItemsForStore(
  menuItems: MenuItem[],
  storeUuid: string,
): MenuItem[] {
  return menuItems.filter((menuItem) => menuItem.store?.uuid === storeUuid);
}

function normalizeRating(value: unknown): number {
  const rating = toFiniteNumber(value);

  if (rating === null) {
    return 0;
  }

  return Math.min(5, Math.max(0, rating));
}

function normalizeCount(value: unknown): number {
  const count = toFiniteNumber(value);

  if (count === null || count < 0) {
    return 0;
  }

  return Math.floor(count);
}

function calculateRecommendationScore(input: {
  distanceKm: number;
  averageRating: number;
  menuCount: number;
}): number {
  const safeDistance = Number.isFinite(input.distanceKm)
    ? Math.max(0, input.distanceKm)
    : Number.POSITIVE_INFINITY;

  const safeRating = normalizeRating(input.averageRating);

  const safeMenuCount = Math.max(0, input.menuCount);

  const distanceScore = Number.isFinite(safeDistance)
    ? Math.max(0, 100 - safeDistance * 15)
    : 0;
  const ratingScore =
    safeRating > 0 ? Math.min(100, (safeRating / 5) * 100) : 50;

  const menuScore = Math.min(100, safeMenuCount * 10);

  const score = distanceScore * 0.65 + ratingScore * 0.2 + menuScore * 0.15;

  return Number.isFinite(score) ? Math.round(score) : 0;
}

export function buildRecommendedStores({
  menuItems = [],
  stores = [],
  referencePoint,
}: BuildRecommendedStoresInput): RecommendedStore[] {
  const safeReferencePoint = normalizeCoordinates(referencePoint);

  if (!safeReferencePoint) {
    return [];
  }

  const safeMenuItems: MenuItem[] = Array.isArray(menuItems) ? menuItems : [];

  const safeStores: LocationStore[] = Array.isArray(stores) ? stores : [];

  return safeStores.reduce<RecommendedStore[]>((result, store) => {
    const storeCoordinates = normalizeCoordinates({
      latitude: store.latitude,

      longitude: store.longitude,
    });

    if (!storeCoordinates) {
      return result;
    }

    const distanceKm = calculateDistanceKm(
      safeReferencePoint,
      storeCoordinates,
    );

    if (!Number.isFinite(distanceKm)) {
      return result;
    }

    const items = getMenuItemsForStore(safeMenuItems, store.uuid);

    const averageRating = normalizeRating(store.averageRating);

    const recommendationScore = calculateRecommendationScore({
      distanceKm,
      averageRating,
      menuCount: items.length,
    });

    const operatingStatus = normalizeOperatingStatus(store.operatingStatus);

    const isOpenNow = store.isOpenNow === true || operatingStatus === "OPEN";

    const recommendedStore: RecommendedStore = {
      uuid: store.uuid,

      name: store.storeName?.trim() || "Food store",

      localName: store.storeName?.trim() || null,

      description: store.description ?? "",

      addressLine: store.addressLine ?? "",

      commune: store.commune ?? "",

      district: store.district ?? "",

      city: store.city ?? "",

      province: store.province ?? "",

      latitude: storeCoordinates.latitude,

      longitude: storeCoordinates.longitude,

      phoneNumber: store.phoneNumber ?? null,

      email: store.email ?? null,

      logoUrl: normalizeImagePath(store.logoUrl),

      coverImageUrl: normalizeImagePath(store.coverImageUrl),

      priceLevel: store.priceLevel ?? null,

      averageRating,

      totalReviews: normalizeCount(store.totalReviews),

      operatingStatus,

      isOpenNow,

      /*
       * The current JSON does not provide these fields.
       */
      deliveryAvailable: getOptionalService(store, "deliveryAvailable"),

      pickupAvailable: getOptionalService(store, "pickupAvailable"),

      menuItems: items,

      menuCount: items.length,

      matchingMenuCount: items.length,

      distanceKm,

      recommendationScore,

      voteCount: 0,
    };

    result.push(recommendedStore);

    return result;
  }, []);
}

function matchesSearch(store: RecommendedStore, searchQuery: string): boolean {
  const normalizedQuery = normalizeText(searchQuery);

  if (!normalizedQuery) {
    return true;
  }

  const menuItems = Array.isArray(store.menuItems) ? store.menuItems : [];

  const searchableValues = [
    store.name,
    store.localName,
    store.description,
    store.addressLine,
    store.commune,
    store.district,
    store.city,
    store.province,

    ...menuItems.flatMap((menuItem) => [menuItem.name, menuItem.localName]),
  ];

  return searchableValues.some((value) =>
    normalizeText(value).includes(normalizedQuery),
  );
}

function isStoreOpen(store: RecommendedStore): boolean {
  return store.isOpenNow === true || store.operatingStatus === "OPEN";
}

function getSafeSortableNumber(value: unknown, fallback: number): number {
  const parsedValue = toFiniteNumber(value);

  return parsedValue ?? fallback;
}

function compareStoreNames(
  first: RecommendedStore,
  second: RecommendedStore,
): number {
  const firstName = first.localName?.trim() || first.name.trim();

  const secondName = second.localName?.trim() || second.name.trim();

  return firstName.localeCompare(secondName, undefined, {
    sensitivity: "base",
    numeric: true,
  });
}

export function filterAndSortRecommendedStores({
  stores = [],
  filters,
  mode,
  searchQuery = "",
}: FilterRecommendedStoresInput): RecommendedStore[] {
  const safeStores = Array.isArray(stores) ? stores : [];

  const radiusKm = getSafeSortableNumber(filters.radiusKm, 0);

  const minimumRating = getSafeSortableNumber(filters.minimumRating, 0);

  const selectedProvince = normalizeText(filters.selectedProvince);

  const selectedCity = normalizeText(filters.selectedCity);

  const selectedDistrict = normalizeText(filters.selectedDistrict);

  const filteredStores = safeStores.filter((store) => {
    const coordinates = normalizeCoordinates({
      latitude: store.latitude,

      longitude: store.longitude,
    });

    if (!coordinates) {
      return false;
    }

    const distanceKm = getSafeSortableNumber(
      store.distanceKm,

      Number.POSITIVE_INFINITY,
    );

    const averageRating = getSafeSortableNumber(store.averageRating, 0);

    if (radiusKm > 0 && distanceKm > radiusKm) {
      return false;
    }

    if (
      selectedProvince &&
      normalizeText(store.province) !== selectedProvince
    ) {
      return false;
    }

    if (selectedCity && normalizeText(store.city) !== selectedCity) {
      return false;
    }

    if (
      selectedDistrict &&
      normalizeText(store.district) !== selectedDistrict
    ) {
      return false;
    }

    if (filters.openNow && !isStoreOpen(store)) {
      return false;
    }

    if (minimumRating > 0 && averageRating < minimumRating) {
      return false;
    }

    if (
      mode === "group" &&
      filters.safeForAllMembers &&
      store.safeForAllMembers === false
    ) {
      return false;
    }

    if (
      mode === "group" &&
      filters.hasMealsForEveryone &&
      store.hasMealsForEveryone === false
    ) {
      return false;
    }

    return matchesSearch(store, searchQuery);
  });

  return [...filteredStores].sort((first, second) => {
    const firstDistance = getSafeSortableNumber(
      first.distanceKm,

      Number.POSITIVE_INFINITY,
    );

    const secondDistance = getSafeSortableNumber(
      second.distanceKm,

      Number.POSITIVE_INFINITY,
    );

    const firstRating = getSafeSortableNumber(first.averageRating, 0);

    const secondRating = getSafeSortableNumber(second.averageRating, 0);

    const firstScore = getSafeSortableNumber(first.recommendationScore, 0);

    const secondScore = getSafeSortableNumber(second.recommendationScore, 0);

    const firstVoteCount = getSafeSortableNumber(first.voteCount, 0);

    const secondVoteCount = getSafeSortableNumber(second.voteCount, 0);

    const firstMaximumDistance = getSafeSortableNumber(
      first.maximumMemberDistanceKm,

      Number.POSITIVE_INFINITY,
    );

    const secondMaximumDistance = getSafeSortableNumber(
      second.maximumMemberDistanceKm,

      Number.POSITIVE_INFINITY,
    );

    switch (filters.sortBy) {
      case "nearest":
        return firstDistance - secondDistance;

      case "name-asc":
        return compareStoreNames(first, second);

      case "highest-rated":
        return secondRating - firstRating || firstDistance - secondDistance;

      case "most-voted":
        return (
          secondVoteCount - firstVoteCount ||
          secondScore - firstScore ||
          firstDistance - secondDistance
        );

      case "fairest-distance":
        return (
          firstMaximumDistance - secondMaximumDistance ||
          firstDistance - secondDistance
        );

      case "recommended":
      default:
        return secondScore - firstScore || firstDistance - secondDistance;
    }
  });
}
