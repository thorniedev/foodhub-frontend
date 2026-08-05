import type { LocationStore } from "@/types/location-store";
import type { MenuItem } from "@/types/manu";

import type {
  Coordinates,
  LocationFiltersState,
  RecommendationMode,
  RecommendedStore,
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

/**
 * Some properties may exist only on the group recommendation model.
 * This structural type lets this shared filter read them safely without
 * requiring them to exist on the base RecommendedStore interface.
 */
interface OptionalRecommendationFields {
  deliveryAvailable?: boolean;
  pickupAvailable?: boolean;

  safeForAllMembers?: boolean;
  hasMealsForEveryone?: boolean;

  maximumMemberDistanceKm?: number;
  averageMemberDistanceKm?: number;

  recommendationScore?: number;
  voteCount?: number;
}

interface MenuItemStoreReference {
  uuid?: unknown;
}

type RecommendedOperatingStatus = RecommendedStore["operatingStatus"];

type RecommendedPriceLevel = RecommendedStore["priceLevel"];

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKC");
}

function normalizeRequiredText(value: unknown, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalizedValue = value.trim();

  return normalizedValue || fallback;
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

function normalizeImagePath(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedUrl = value.trim();

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

function normalizeOperatingStatus(value: unknown): RecommendedOperatingStatus {
  const normalizedValue = String(value ?? "")
    .trim()
    .toUpperCase();

  switch (normalizedValue) {
    case "OPEN":
      return "OPEN" as RecommendedOperatingStatus;

    case "CLOSED":
      return "CLOSED" as RecommendedOperatingStatus;

    case "TEMPORARILY_CLOSED":
      return "TEMPORARILY_CLOSED" as RecommendedOperatingStatus;

    case "PERMANENTLY_CLOSED":
      return "PERMANENTLY_CLOSED" as RecommendedOperatingStatus;

    case "UNKNOWN":
    default:
      return "UNKNOWN" as RecommendedOperatingStatus;
  }
}

function normalizePriceLevel(value: unknown): RecommendedPriceLevel {
  const numericValue = toFiniteNumber(value);

  if (numericValue !== null && numericValue >= 1 && numericValue <= 4) {
    return Math.round(numericValue) as RecommendedPriceLevel;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim();

    const dollarLevelMap: Record<string, number> = {
      $: 1,
      $$: 2,
      $$$: 3,
      $$$$: 4,
    };

    const mappedValue = dollarLevelMap[normalizedValue];

    if (mappedValue !== undefined) {
      return mappedValue as RecommendedPriceLevel;
    }
  }

  /*
   * Zero means that the price level is unavailable.
   * Your UI can hide values lower than 1.
   */
  return 0 as RecommendedPriceLevel;
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

function getMenuItemStoreUuid(menuItem: MenuItem): string | null {
  const storeReference = (
    menuItem as unknown as {
      store?: MenuItemStoreReference | null;
    }
  ).store;

  const uuid = storeReference?.uuid;

  return typeof uuid === "string" && uuid.trim() ? uuid.trim() : null;
}

function getMenuItemsForStore(
  menuItems: MenuItem[],
  storeUuid: string,
): MenuItem[] {
  return menuItems.filter(
    (menuItem) => getMenuItemStoreUuid(menuItem) === storeUuid,
  );
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

  const safeMenuCount = Number.isFinite(input.menuCount)
    ? Math.max(0, input.menuCount)
    : 0;

  const distanceScore = Number.isFinite(safeDistance)
    ? Math.max(0, 100 - safeDistance * 15)
    : 0;

  const ratingScore =
    safeRating > 0 ? Math.min(100, (safeRating / 5) * 100) : 50;

  const menuScore = Math.min(100, safeMenuCount * 10);

  const score = distanceScore * 0.65 + ratingScore * 0.2 + menuScore * 0.15;

  return Number.isFinite(score) ? Math.round(score) : 0;
}

/**
 * Converts the backend LocationStore into the frontend
 * RecommendedStore model.
 *
 * The controlled cast is kept inside this adapter only. All values
 * are normalized before being returned.
 */
function mapLocationStoreToRecommendedStore(input: {
  store: LocationStore;
  menuItems: MenuItem[];
  referencePoint: Coordinates;
}): RecommendedStore | null {
  const { store, menuItems, referencePoint } = input;

  const storeCoordinates = normalizeCoordinates({
    latitude: store.latitude,
    longitude: store.longitude,
  });

  if (!storeCoordinates) {
    return null;
  }

  const distanceKm = calculateDistanceKm(referencePoint, storeCoordinates);

  if (!Number.isFinite(distanceKm)) {
    return null;
  }

  const uuid = normalizeRequiredText(store.uuid);

  if (!uuid) {
    return null;
  }

  const storeName = normalizeRequiredText(
    store.storeName,
    "Unknown restaurant",
  );

  const items = getMenuItemsForStore(menuItems, uuid);

  const averageRating = normalizeRating(store.averageRating);

  const recommendationScore = calculateRecommendationScore({
    distanceKm,
    averageRating,
    menuCount: items.length,
  });

  /*
   * Do not add commune, province, phoneNumber or email here unless
   * those fields are declared in RecommendedStore.
   *
   * LocationStore is a backend DTO. RecommendedStore is the
   * frontend view model used by the location UI.
   */
  const recommendedStore = {
    uuid,

    name: storeName,
    localName: storeName,

    description: normalizeRequiredText(store.description),

    addressLine: normalizeRequiredText(store.addressLine),

    district: normalizeRequiredText(store.district),

    city: normalizeRequiredText(store.city),

    latitude: storeCoordinates.latitude,
    longitude: storeCoordinates.longitude,

    logoUrl: normalizeImagePath(store.logoUrl),

    coverImageUrl: normalizeImagePath(store.coverImageUrl),

    priceLevel: normalizePriceLevel(store.priceLevel),

    averageRating,

    totalReviews: normalizeCount(store.totalReviews),

    operatingStatus: normalizeOperatingStatus(store.operatingStatus),

    isOpenNow: store.isOpenNow === true,

    deliveryAvailable: store.deliveryAvailable === true,

    pickupAvailable: store.pickupAvailable === true,

    menuItems: items,

    menuCount: items.length,

    matchingMenuCount: items.length,

    distanceKm,

    recommendationScore,

    voteCount: 0,
  };

  /*
   * The assertion is isolated at the boundary between the backend
   * LocationStore DTO and the frontend RecommendedStore model.
   */
  return recommendedStore as RecommendedStore;
}

function normalizeOperatingStatus(
  status: string,
): RecommendedStore["operatingStatus"] {
  switch (status) {
    case "OPEN":
    case "CLOSED":
    case "TEMPORARILY_CLOSED":
    case "UNKNOWN":
      return status;
    default:
      return "UNKNOWN";
  }
}

// export function buildRecommendedStores({
//   menuItems,
//   stores = [],
//   referencePoint,
// }: BuildRecommendedStoresInput): RecommendedStore[] {
//   /*
//    * Do not show every store with distance 0 while the user's location
//    * is still unavailable.
//    */
//   if (!referencePoint) {
//     return [];
//   }

//   return stores
//     .filter(
//       (store) =>
//         Number.isFinite(store.latitude) && Number.isFinite(store.longitude),
//     )
//     .map((store) => {
//       const items = getMenuItemsForStore(menuItems, store.uuid);

//       const storeCoordinates: Coordinates = {
//         latitude: store.latitude,
//         longitude: store.longitude,
//       };

//       const distanceKm = calculateDistanceKm(referencePoint, storeCoordinates);

//       const averageRating = store.averageRating ?? 0;

//       const recommendationScore = calculateRecommendationScore({
//         distanceKm,
//         averageRating,
//         menuCount: items.length,
//       });

//       return {
//         uuid: store.uuid,

//         name: store.storeName,
//         localName: store.storeName,
//         description: store.description ?? "",

//         addressLine: store.addressLine,
//         commune: store.commune ?? "",
//         district: store.district ?? "",
//         city: store.city,
//         province: store.province,

//         latitude: store.latitude,
//         longitude: store.longitude,

//         phoneNumber: store.phoneNumber,
//         email: store.email,

//         logoUrl: normalizeImagePath(store.logoUrl),

//         coverImageUrl: normalizeImagePath(store.coverImageUrl),

//         priceLevel: store.priceLevel,

//         averageRating,
//         totalReviews: store.totalReviews ?? 0,

//         operatingStatus: store.operatingStatus,

//         isOpenNow: store.isOpenNow,

//         deliveryAvailable: store.deliveryAvailable === true,

//         pickupAvailable: store.pickupAvailable === true,

//         menuItems: items,
//         menuCount: items.length,
//         matchingMenuCount: items.length,

//         distanceKm,

//         /*
//          * Neutral values used by shared store components.
//          * The real group values are calculated in
//          * group-recommendation.ts.
//          */
//         averageMemberDistanceKm: distanceKm,
//         maximumMemberDistanceKm: distanceKm,
//         groupCoverageCount: 0,
//         groupMemberCount: 0,
//         safeForAllMembers: true,
//         hasMealsForEveryone: true,

//         recommendationScore,
//         voteCount: 0,
//       } as RecommendedStore;
//     });
// }
export function buildRecommendedStores({
  menuItems = [],
  stores = [],
  referencePoint,
}: BuildRecommendedStoresInput): RecommendedStore[] {
<<<<<<< HEAD
  const safeReferencePoint = normalizeCoordinates(referencePoint);

  if (!safeReferencePoint) {
=======
  if (!referencePoint) {
>>>>>>> 8be8ac3b2e55d1ca43186738dce8858315c9f2c4
    return [];
  }

  const safeMenuItems: MenuItem[] = Array.isArray(menuItems) ? menuItems : [];

  const safeStores: LocationStore[] = Array.isArray(stores) ? stores : [];

<<<<<<< HEAD
  return safeStores.reduce<RecommendedStore[]>((result, store) => {
    const recommendedStore = mapLocationStoreToRecommendedStore({
      store,
      menuItems: safeMenuItems,
      referencePoint: safeReferencePoint,
=======
      const distanceKm = calculateDistanceKm(referencePoint, storeCoordinates);

      const averageRating = store.averageRating ?? 0;
      const storeLocalName = store.localName ?? store.storeName;

      const recommendationScore = calculateRecommendationScore({
        distanceKm,
        averageRating,
        menuCount: items.length,
      });

      const recommendedStore = {
        ...store,

        name: store.storeName,
        localName: storeLocalName,

        description: store.description ?? "",

        commune: store.commune ?? "",
        district: store.district ?? "",

        logoUrl: normalizeImagePath(store.logoUrl),
        coverImageUrl: normalizeImagePath(store.coverImageUrl),

        averageRating,
        totalReviews: store.totalReviews ?? 0,

        operatingStatus: normalizeOperatingStatus(store.operatingStatus),

        deliveryAvailable: store.deliveryAvailable === true,
        pickupAvailable: store.pickupAvailable === true,

        menuItems: items,
        menuCount: items.length,
        matchingMenuCount: items.length,

        distanceKm,

        averageMemberDistanceKm: distanceKm,
        maximumMemberDistanceKm: distanceKm,

        groupCoverageCount: 0,
        groupMemberCount: 0,

        safeForAllMembers: true,
        hasMealsForEveryone: true,

        recommendationScore,
        voteCount: 0,
      } satisfies RecommendedStore;

      return recommendedStore;
>>>>>>> 8be8ac3b2e55d1ca43186738dce8858315c9f2c4
    });

    if (recommendedStore) {
      result.push(recommendedStore);
    }

    return result;
  }, []);
}

function getOptionalRecommendationFields(
  store: RecommendedStore,
): OptionalRecommendationFields {
  return store as RecommendedStore & OptionalRecommendationFields;
}

function matchesSearch(store: RecommendedStore, searchQuery: string): boolean {
  const normalizedQuery = normalizeText(searchQuery);

  if (!normalizedQuery) {
    return true;
  }

  const menuItems: MenuItem[] = Array.isArray(store.menuItems)
    ? store.menuItems
    : [];

  const searchableValues: unknown[] = [
    store.name,
    store.localName,
    store.description,
    store.addressLine,
    store.district,
    store.city,

    ...menuItems.flatMap((menuItem) => [menuItem.name, menuItem.localName]),
  ];

  return searchableValues.some((value) =>
    normalizeText(value).includes(normalizedQuery),
  );
}

function isStoreOpen(store: RecommendedStore): boolean {
  return (
    store.isOpenNow === true || normalizeText(store.operatingStatus) === "open"
  );
}

function getSafeSortableNumber(value: unknown, fallback: number): number {
  const parsedValue = toFiniteNumber(value);

  return parsedValue ?? fallback;
}

export function filterAndSortRecommendedStores({
  stores = [],
  filters,
  mode,
  searchQuery = "",
}: FilterRecommendedStoresInput): RecommendedStore[] {
  const safeStores: RecommendedStore[] = Array.isArray(stores) ? stores : [];

  const radiusKm = getSafeSortableNumber(filters.radiusKm, 0);

  const minimumRating = getSafeSortableNumber(filters.minimumRating, 0);

  const filteredStores = safeStores.filter((store) => {
    const coordinates = normalizeCoordinates({
      latitude: store.latitude,
      longitude: store.longitude,
    });

    if (!coordinates) {
      return false;
    }

    if (!matchesSearch(store, searchQuery)) {
      return false;
    }

    const optionalFields = getOptionalRecommendationFields(store);

    const distanceKm = getSafeSortableNumber(
      store.distanceKm,
      Number.POSITIVE_INFINITY,
    );

    const averageRating = getSafeSortableNumber(store.averageRating, 0);

    if (radiusKm > 0 && distanceKm > radiusKm) {
      return false;
    }

    if (filters.openNow && !isStoreOpen(store)) {
      return false;
    }

    if (minimumRating > 0 && averageRating < minimumRating) {
      return false;
    }

    if (
      filters.deliveryAvailable &&
      optionalFields.deliveryAvailable !== true
    ) {
      return false;
    }

    if (filters.pickupAvailable && optionalFields.pickupAvailable !== true) {
      return false;
    }

    if (
      mode === "group" &&
      filters.safeForAllMembers &&
      optionalFields.safeForAllMembers !== true
    ) {
      return false;
    }

    if (
      mode === "group" &&
      filters.hasMealsForEveryone &&
      optionalFields.hasMealsForEveryone !== true
    ) {
      return false;
    }

    return true;
  });

  return [...filteredStores].sort((first, second) => {
    const firstOptionalFields = getOptionalRecommendationFields(first);

    const secondOptionalFields = getOptionalRecommendationFields(second);

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

    const firstScore = getSafeSortableNumber(
      firstOptionalFields.recommendationScore ?? first.recommendationScore,
      0,
    );

    const secondScore = getSafeSortableNumber(
      secondOptionalFields.recommendationScore ?? second.recommendationScore,
      0,
    );

    const firstVoteCount = getSafeSortableNumber(
      firstOptionalFields.voteCount,
      0,
    );

    const secondVoteCount = getSafeSortableNumber(
      secondOptionalFields.voteCount,
      0,
    );

    const firstMaximumMemberDistance = getSafeSortableNumber(
      firstOptionalFields.maximumMemberDistanceKm,
      firstDistance,
    );

    const secondMaximumMemberDistance = getSafeSortableNumber(
      secondOptionalFields.maximumMemberDistanceKm,
      secondDistance,
    );

    switch (filters.sortBy) {
      case "nearest":
        return firstDistance - secondDistance;

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
          firstMaximumMemberDistance - secondMaximumMemberDistance ||
          firstDistance - secondDistance
        );

      case "recommended":
      default:
        return secondScore - firstScore || firstDistance - secondDistance;
    }
  });
}
