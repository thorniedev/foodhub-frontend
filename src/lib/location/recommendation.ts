import type { GroupMember, GroupVote } from "@/types/group-recommendation";
import type { MenuItem } from "@/types/manu";
import type {
  Coordinates,
  LocationFiltersState,
  RecommendationMode,
  RecommendedStore,
} from "@/types/location";
import type { Store } from "@/types/store";

import { calculateDistanceKm } from "./geo";

function normalizeCode(value: string): string {
  return value.trim().toLowerCase().replaceAll(" ", "_");
}

function extractCodes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") return normalizeCode(item);

      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        const candidate = record.code ?? record.name ?? record.label;

        return typeof candidate === "string" ? normalizeCode(candidate) : null;
      }

      return null;
    })
    .filter((item): item is string => Boolean(item));
}

function menuMatchesMember(menuItem: MenuItem, member: GroupMember): boolean {
  const rawItem = menuItem as unknown as Record<string, unknown>;
  const dietaryCodes = extractCodes(rawItem.dietaryTypes);
  const allergenCodes = extractCodes(rawItem.allergenDeclarations);

  const satisfiesDietaryRequirements = member.requiredDietaryCodes.every(
    (requiredCode) => dietaryCodes.includes(normalizeCode(requiredCode)),
  );

  const containsBlockedAllergen = member.blockedAllergenCodes.some(
    (blockedCode) => allergenCodes.includes(normalizeCode(blockedCode)),
  );

  return satisfiesDietaryRequirements && !containsBlockedAllergen;
}

function getMenuItemsForStore(
  menuItems: MenuItem[],
  storeUuid: string,
): MenuItem[] {
  return menuItems.filter((menuItem) => menuItem.store?.uuid === storeUuid);
}

function getFallbackDistance(items: MenuItem[]): number {
  const distances = items
    .map((item) => item.distanceKm)
    .filter(
      (distance): distance is number =>
        typeof distance === "number" && Number.isFinite(distance),
    );

  return distances.length > 0 ? Math.min(...distances) : 0;
}

export function buildRecommendedStores({
  menuItems,
  stores,
  referencePoint,
  groupMembers = [],
  votes = [],
}: {
  menuItems: MenuItem[];
  stores: Store[];
  referencePoint: Coordinates | null;
  groupMembers?: GroupMember[];
  votes?: GroupVote[];
}): RecommendedStore[] {
  const readyMembers = groupMembers.filter(
    (member): member is GroupMember & { coordinates: Coordinates } =>
      member.locationStatus === "ready" && member.coordinates !== null,
  );

  return stores.map((store) => {
    const items = getMenuItemsForStore(menuItems, store.uuid);
    const storeCoordinates: Coordinates = {
      latitude: store.latitude,
      longitude: store.longitude,
    };

    const distanceKm = referencePoint
      ? calculateDistanceKm(referencePoint, storeCoordinates)
      : getFallbackDistance(items);

    const memberDistances = readyMembers.map((member) =>
      calculateDistanceKm(member.coordinates, storeCoordinates),
    );

    const averageMemberDistanceKm = memberDistances.length
      ? memberDistances.reduce((total, distance) => total + distance, 0) /
        memberDistances.length
      : distanceKm;

    const maximumMemberDistanceKm = memberDistances.length
      ? Math.max(...memberDistances)
      : distanceKm;

    const groupCoverageCount = readyMembers.filter((member) =>
      items.some((item) => menuMatchesMember(item, member)),
    ).length;

    const matchingMenuCount = readyMembers.length
      ? items.filter((item) =>
          readyMembers.every((member) => menuMatchesMember(item, member)),
        ).length
      : items.length;

    const safeForAllMembers =
      readyMembers.length === 0 || groupCoverageCount === readyMembers.length;

    const ratingScore = Math.min(store.averageRating / 5, 1) * 28;
    const distanceScore = Math.max(0, 1 - distanceKm / 15) * 30;
    const menuScore = Math.min(items.length / 12, 1) * 12;
    const fairnessScore = Math.max(0, 1 - maximumMemberDistanceKm / 20) * 15;
    const coverageScore = readyMembers.length
      ? (groupCoverageCount / readyMembers.length) * 15
      : 15;

    return {
      ...store,
      menuItems: items,
      menuCount: items.length,
      matchingMenuCount,
      distanceKm,
      averageMemberDistanceKm,
      maximumMemberDistanceKm,
      groupCoverageCount,
      groupMemberCount: readyMembers.length,
      safeForAllMembers,
      recommendationScore: Math.round(
        ratingScore + distanceScore + menuScore + fairnessScore + coverageScore,
      ),
      voteCount: votes.filter((vote) => vote.storeUuid === store.uuid).length,
    };
  });
}

export function filterAndSortRecommendedStores({
  stores,
  filters,
  mode,
  searchQuery,
}: {
  stores: RecommendedStore[];
  filters: LocationFiltersState;
  mode: RecommendationMode;
  searchQuery: string;
}): RecommendedStore[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filtered = stores.filter((store) => {
    if (store.distanceKm > filters.radiusKm) return false;

    const openNow =
      store.isOpenNow === true || store.operatingStatus === "OPEN";

    if (filters.openNow && !openNow) return false;
    if (store.averageRating < filters.minimumRating) return false;

    if (filters.deliveryAvailable && store.deliveryAvailable !== true) {
      return false;
    }

    if (filters.pickupAvailable && store.pickupAvailable !== true) {
      return false;
    }

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
      store.groupMemberCount > 0 &&
      store.groupCoverageCount < store.groupMemberCount
    ) {
      return false;
    }

    if (!normalizedQuery) return true;

    const searchableValues = [
      store.name,
      store.localName,
      store.description,
      store.addressLine,
      store.commune,
      store.district,
      store.city,
      store.province,
      ...store.menuItems.flatMap((item) => [item.name, item.localName]),
    ];

    return searchableValues.some((value) =>
      (value ?? "").toLowerCase().includes(normalizedQuery),
    );
  });

  return [...filtered].sort((first, second) => {
    switch (filters.sortBy) {
      case "nearest":
        return first.distanceKm - second.distanceKm;
      case "highest-rated":
        return second.averageRating - first.averageRating;
      case "most-voted":
        return second.voteCount - first.voteCount;
      case "fairest-distance":
        return first.maximumMemberDistanceKm - second.maximumMemberDistanceKm;
      case "recommended":
      default:
        return second.recommendationScore - first.recommendationScore;
    }
  });
}
