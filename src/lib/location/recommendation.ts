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
  menuItems: MenuItem[];

  /**
   * Optional prevents a runtime crash while data is loading.
   */
  stores?: LocationStore[];

  referencePoint: Coordinates | null;
}

interface FilterRecommendedStoresInput {
  stores: RecommendedStore[];
  filters: LocationFiltersState;
  mode: RecommendationMode;
  searchQuery?: string;
}

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKC");
}

function normalizeImagePath(
  imageUrl: string | null | undefined,
): string | null {
  if (!imageUrl) {
    return null;
  }

  if (
    imageUrl.startsWith("/") ||
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  return `/${imageUrl}`;
}

function getMenuItemsForStore(
  menuItems: MenuItem[],
  storeUuid: string,
): MenuItem[] {
  return menuItems.filter((menuItem) => menuItem.store?.uuid === storeUuid);
}

function calculateRecommendationScore(input: {
  distanceKm: number;
  averageRating: number;
  menuCount: number;
}): number {
  const distanceScore = Math.max(0, 100 - input.distanceKm * 15);

  const ratingScore =
    input.averageRating > 0
      ? Math.min(100, (input.averageRating / 5) * 100)
      : 50;

  const menuScore = Math.min(100, input.menuCount * 10);

  return Math.round(
    distanceScore * 0.65 + ratingScore * 0.2 + menuScore * 0.15,
  );
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
  menuItems,
  stores = [],
  referencePoint,
}: BuildRecommendedStoresInput): RecommendedStore[] {
  if (!referencePoint) {
    return [];
  }

  return stores
    .filter(
      (store) =>
        Number.isFinite(store.latitude) && Number.isFinite(store.longitude),
    )
    .map((store) => {
      const items = getMenuItemsForStore(menuItems, store.uuid);

      const storeCoordinates: Coordinates = {
        latitude: store.latitude,
        longitude: store.longitude,
      };

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
    });
}

function matchesSearch(store: RecommendedStore, searchQuery: string): boolean {
  const normalizedQuery = normalizeText(searchQuery);

  if (!normalizedQuery) {
    return true;
  }

  const searchableValues = [
    store.name,
    store.localName,
    store.description,
    store.addressLine,
    store.commune,
    store.district,
    store.city,
    store.province,

    ...store.menuItems.flatMap((menuItem) => [
      menuItem.name,
      menuItem.localName,
    ]),
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

export function filterAndSortRecommendedStores({
  stores,
  filters,
  mode,
  searchQuery = "",
}: FilterRecommendedStoresInput): RecommendedStore[] {
  const filteredStores = stores.filter((store) => {
    if (filters.radiusKm > 0 && store.distanceKm > filters.radiusKm) {
      return false;
    }

    /*
     * These filters currently remain inactive because their test
     * values are false or zero.
     */
    if (filters.openNow && !isStoreOpen(store)) {
      return false;
    }

    if (
      filters.minimumRating > 0 &&
      store.averageRating < filters.minimumRating
    ) {
      return false;
    }

    if (filters.deliveryAvailable && store.deliveryAvailable !== true) {
      return false;
    }

    if (filters.pickupAvailable && store.pickupAvailable !== true) {
      return false;
    }

    /*
     * Normally not used here because group mode uses
     * group-recommendation.ts. Kept for type compatibility.
     */
    if (
      mode === "group" &&
      filters.safeForAllMembers &&
      !store.safeForAllMembers
    ) {
      return false;
    }

    if (
      mode === "group" &&
      filters.hasMealsForEveryone &&
      !store.hasMealsForEveryone
    ) {
      return false;
    }

    return matchesSearch(store, searchQuery);
  });

  return [...filteredStores].sort((first, second) => {
    switch (filters.sortBy) {
      case "nearest":
        return first.distanceKm - second.distanceKm;

      case "highest-rated":
        return (
          second.averageRating - first.averageRating ||
          first.distanceKm - second.distanceKm
        );

      case "most-voted":
        return (
          second.voteCount - first.voteCount ||
          first.distanceKm - second.distanceKm
        );

      case "fairest-distance":
        return (
          first.maximumMemberDistanceKm - second.maximumMemberDistanceKm ||
          first.distanceKm - second.distanceKm
        );

      case "recommended":
      default:
        return (
          second.recommendationScore - first.recommendationScore ||
          first.distanceKm - second.distanceKm
        );
    }
  });
}
