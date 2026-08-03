import type { Coordinates } from "@/types/location";
import type { GroupLocationMember } from "@/types/group-location";

const EARTH_RADIUS_KM = 6371.0088;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function isValidGroupCoordinates(
  coordinates: Coordinates | null | undefined,
): coordinates is Coordinates {
  if (!coordinates) {
    return false;
  }

  return (
    Number.isFinite(coordinates.latitude) &&
    Number.isFinite(coordinates.longitude) &&
    coordinates.latitude >= -90 &&
    coordinates.latitude <= 90 &&
    coordinates.longitude >= -180 &&
    coordinates.longitude <= 180
  );
}

/**
 * Haversine straight-line distance in kilometres.
 */
export function calculateGroupDistanceKm(
  first: Coordinates,
  second: Coordinates,
): number {
  const latitudeDifference = toRadians(second.latitude - first.latitude);

  const longitudeDifference = toRadians(second.longitude - first.longitude);

  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);

  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  const angularDistance =
    2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return EARTH_RADIUS_KM * angularDistance;
}

/**
 * Arithmetic geographic midpoint.
 *
 * This is suitable for members located within the same city.
 * Your two test coordinates return approximately:
 * 11.563950832590766, 104.90830600321041
 */
export function calculateGroupMidpoint(
  members: GroupLocationMember[],
): Coordinates | null {
  const readyMembers = members.filter(
    (
      member,
    ): member is GroupLocationMember & {
      coordinates: Coordinates;
    } =>
      member.locationStatus === "ready" &&
      isValidGroupCoordinates(member.coordinates),
  );

  if (readyMembers.length < 2) {
    return null;
  }

  const total = readyMembers.reduce(
    (result, member) => ({
      latitude: result.latitude + member.coordinates.latitude,
      longitude: result.longitude + member.coordinates.longitude,
    }),
    {
      latitude: 0,
      longitude: 0,
    },
  );

  return {
    latitude: total.latitude / readyMembers.length,
    longitude: total.longitude / readyMembers.length,
  };
}
