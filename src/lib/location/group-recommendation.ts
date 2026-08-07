import type { LocationStore } from "@/types/location-store";
import type { MenuItem } from "@/types/manu";
import type { Coordinates, LocationFiltersState } from "@/types/location";
import type {
  GroupLocationMember,
  GroupLocationVote,
  GroupRecommendedStore,
} from "@/types/group-location";

import {
  calculateGroupDistanceKm,
  isValidGroupCoordinates,
} from "@/lib/location/group-geo";

type MenuStoreReference = {
  uuid?: string;
};

type MenuDietaryReference = {
  code?: string;
};

type MenuAllergenReference = {
  code?: string;
};

type LocationStoreWithLocalName = LocationStore & {
  localName?: string | null;
};

type BuildGroupStoresInput = {
  sourceStores: LocationStore[];
  menuItems: MenuItem[];
  midpoint: Coordinates | null;
  members: GroupLocationMember[];
  votes?: GroupLocationVote[];
};

type FilterGroupStoresInput = {
  stores: GroupRecommendedStore[];
  filters: LocationFiltersState;
  searchQuery?: string;
};

type CompatibilityResult = {
  matchingMenuCount: number;
  safeForAllMembers: boolean;
  hasMealsForEveryone: boolean;
  coverageCount: number;
  memberCount: number;
};

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKC");
}

function getMenuStoreUuid(menuItem: MenuItem): string | null {
  const store =
    (
      menuItem as unknown as {
        store?: MenuStoreReference;
      }
    ).store ?? {};

  return typeof store.uuid === "string" && store.uuid.length > 0
    ? store.uuid
    : null;
}

function getDietaryCodes(menuItem: MenuItem): string[] {
  const dietaryTypes =
    (
      menuItem as unknown as {
        dietaryTypes?: MenuDietaryReference[];
      }
    ).dietaryTypes ?? [];

  return dietaryTypes
    .map((item) => item.code)
    .filter((code): code is string => typeof code === "string");
}

function getAllergenCodes(menuItem: MenuItem): string[] {
  const allergens =
    (
      menuItem as unknown as {
        allergenDeclarations?: MenuAllergenReference[];
      }
    ).allergenDeclarations ?? [];

  return allergens
    .map((item) => item.code)
    .filter((code): code is string => typeof code === "string");
}

function isMenuItemCompatible(
  menuItem: MenuItem,
  member: GroupLocationMember,
): boolean {
  const dietaryCodes = new Set(getDietaryCodes(menuItem));
  const allergenCodes = new Set(getAllergenCodes(menuItem));

  const meetsDietaryRequirements =
    member.requiredDietaryCodes.length === 0 ||
    member.requiredDietaryCodes.every((code) => dietaryCodes.has(code));

  const containsBlockedAllergen = member.blockedAllergenCodes.some((code) =>
    allergenCodes.has(code),
  );

  return meetsDietaryRequirements && !containsBlockedAllergen;
}

function calculateCompatibility(
  storeMenuItems: MenuItem[],
  members: GroupLocationMember[],
): CompatibilityResult {
  const readyMembers = members.filter(
    (member) =>
      member.locationStatus === "ready" &&
      isValidGroupCoordinates(member.coordinates),
  );

  if (storeMenuItems.length === 0) {
    return {
      matchingMenuCount: 0,
      safeForAllMembers: false,
      hasMealsForEveryone: false,
      coverageCount: 0,
      memberCount: readyMembers.length,
    };
  }

  if (readyMembers.length === 0) {
    return {
      matchingMenuCount: storeMenuItems.length,
      safeForAllMembers: true,
      hasMealsForEveryone: true,
      coverageCount: 0,
      memberCount: 0,
    };
  }

  const matchingMenuItems = storeMenuItems.filter((menuItem) =>
    readyMembers.every((member) => isMenuItemCompatible(menuItem, member)),
  );

  const coverageCount = readyMembers.filter((member) =>
    storeMenuItems.some((menuItem) => isMenuItemCompatible(menuItem, member)),
  ).length;

  return {
    matchingMenuCount: matchingMenuItems.length,
    safeForAllMembers: matchingMenuItems.length > 0,
    hasMealsForEveryone: coverageCount === readyMembers.length,
    coverageCount,
    memberCount: readyMembers.length,
  };
}

function calculateRecommendationScore(input: {
  midpointDistanceKm: number;
  maximumMemberDistanceKm: number;
  averageRating: number;
  menuCount: number;
  matchingMenuCount: number;
  coverageCount: number;
  memberCount: number;
}): number {
  const midpointScore = Math.max(0, 100 - input.midpointDistanceKm * 14);
  const fairnessScore = Math.max(0, 100 - input.maximumMemberDistanceKm * 9);

  const ratingScore =
    input.averageRating > 0
      ? Math.min(100, (input.averageRating / 5) * 100)
      : 50;

  const menuAvailabilityScore = Math.min(100, input.menuCount * 8);

  const commonMealRatio =
    input.menuCount > 0 ? input.matchingMenuCount / input.menuCount : 0;

  const memberCoverageRatio =
    input.memberCount > 0 ? input.coverageCount / input.memberCount : 1;

  const preferenceScore = Math.min(
    100,
    memberCoverageRatio * 75 + commonMealRatio * 25,
  );

  return Math.round(
    midpointScore * 0.3 +
      fairnessScore * 0.3 +
      preferenceScore * 0.2 +
      ratingScore * 0.1 +
      menuAvailabilityScore * 0.1,
  );
}

function normalizePublicImagePath(
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

export function buildGroupRecommendedStores({
  sourceStores,
  menuItems,
  midpoint,
  members,
  votes = [],
}: BuildGroupStoresInput): GroupRecommendedStore[] {
  if (!midpoint || !isValidGroupCoordinates(midpoint)) {
    return [];
  }

  const readyMembers = members.filter(
    (
      member,
    ): member is GroupLocationMember & {
      coordinates: Coordinates;
    } =>
      member.locationStatus === "ready" &&
      isValidGroupCoordinates(member.coordinates),
  );

  return sourceStores
    .filter(
      (store) =>
        Number.isFinite(store.latitude) && Number.isFinite(store.longitude),
    )
    .map((store) => {
      const storeCoordinates: Coordinates = {
        latitude: store.latitude,
        longitude: store.longitude,
      };

      const midpointDistanceKm = calculateGroupDistanceKm(
        midpoint,
        storeCoordinates,
      );

      const memberDistances = readyMembers.map((member) =>
        calculateGroupDistanceKm(member.coordinates, storeCoordinates),
      );

      const averageMemberDistanceKm =
        memberDistances.length > 0
          ? memberDistances.reduce((total, distance) => total + distance, 0) /
            memberDistances.length
          : midpointDistanceKm;

      const maximumMemberDistanceKm =
        memberDistances.length > 0
          ? Math.max(...memberDistances)
          : midpointDistanceKm;

      const storeMenuItems = menuItems.filter(
        (menuItem) => getMenuStoreUuid(menuItem) === store.uuid,
      );

      const compatibility = calculateCompatibility(
        storeMenuItems,
        readyMembers,
      );

      const voteCount = votes.filter(
        (vote) => vote.storeUuid === store.uuid,
      ).length;

      const recommendationScore = calculateRecommendationScore({
        midpointDistanceKm,
        maximumMemberDistanceKm,
        averageRating: store.averageRating ?? 0,
        menuCount: storeMenuItems.length,
        matchingMenuCount: compatibility.matchingMenuCount,
        coverageCount: compatibility.coverageCount,
        memberCount: compatibility.memberCount,
      });

      const storeWithLocalName = store as LocationStoreWithLocalName;

      return {
        uuid: store.uuid,

        name: store.storeName,
        localName: storeWithLocalName.localName ?? store.storeName,
        description: store.description ?? "",

        addressLine: store.addressLine,
        commune: store.commune ?? "",
        district: store.district ?? "",
        city: store.city,
        province: store.province ?? store.city,

        latitude: store.latitude,
        longitude: store.longitude,

        phoneNumber: store.phoneNumber ?? null,
        email: store.email ?? null,

        logoUrl: normalizePublicImagePath(store.logoUrl),
        coverImageUrl: normalizePublicImagePath(store.coverImageUrl),

        averageRating: store.averageRating ?? 0,
        totalReviews: store.totalReviews ?? 0,

        operatingStatus: store.operatingStatus,
        isOpenNow: store.isOpenNow,
        priceLevel: store.priceLevel,

        deliveryAvailable: store.deliveryAvailable === true,
        pickupAvailable: store.pickupAvailable === true,

        distanceKm: midpointDistanceKm,
        averageMemberDistanceKm,
        maximumMemberDistanceKm,

        menuItems: storeMenuItems,
        menuCount: storeMenuItems.length,
        matchingMenuCount: compatibility.matchingMenuCount,

        safeForAllMembers: compatibility.safeForAllMembers,
        hasMealsForEveryone: compatibility.hasMealsForEveryone,

        groupCoverageCount: compatibility.coverageCount,
        groupMemberCount: compatibility.memberCount,

        recommendationScore,
        voteCount,
      } as GroupRecommendedStore;
    })
    .filter(
      (store) =>
        store.menuCount > 0 &&
        store.hasMealsForEveryone &&
        store.groupCoverageCount === store.groupMemberCount,
    );
}

function matchesSearch(
  store: GroupRecommendedStore,
  searchQuery: string,
): boolean {
  const normalizedQuery = normalizeText(searchQuery);

  if (!normalizedQuery) {
    return true;
  }

  return [
    store.name,
    store.localName,
    store.description,
    store.addressLine,
    store.district,
    store.city,
  ].some((value) => normalizeText(value).includes(normalizedQuery));
}

function isStoreOpen(store: GroupRecommendedStore): boolean {
  return (
    store.isOpenNow === true || normalizeText(store.operatingStatus) === "open"
  );
}

export function filterAndSortGroupStores({
  stores,
  filters,
  searchQuery = "",
}: FilterGroupStoresInput): GroupRecommendedStore[] {
  const filteredStores = stores.filter((store) => {
    if (!matchesSearch(store, searchQuery)) {
      return false;
    }

    // Group candidates must be near the calculated group meeting point.
    if (filters.radiusKm > 0 && store.distanceKm > filters.radiusKm) {
      return false;
    }

    // This is a core Group rule, not an optional UI filter:
    // every ready member needs at least one compatible meal at the store.
    if (!store.hasMealsForEveryone) {
      return false;
    }

    if (filters.openNow && !isStoreOpen(store)) {
      return false;
    }

    if (filters.deliveryAvailable && !store.deliveryAvailable) {
      return false;
    }

    if (filters.pickupAvailable && !store.pickupAvailable) {
      return false;
    }

    if (
      filters.minimumRating > 0 &&
      store.averageRating < filters.minimumRating
    ) {
      return false;
    }

    if (filters.safeForAllMembers && !store.safeForAllMembers) {
      return false;
    }

    if (filters.hasMealsForEveryone && !store.hasMealsForEveryone) {
      return false;
    }

    return true;
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
          second.recommendationScore - first.recommendationScore
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
