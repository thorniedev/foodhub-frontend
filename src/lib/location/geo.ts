import type { GroupMember } from "@/types/group-recommendation";
import type { Coordinates } from "@/types/location";

const EARTH_RADIUS_KM = 6371.0088;

function degreesToRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function isValidCoordinates(
  coordinates: Coordinates | null | undefined,
): coordinates is Coordinates {
  if (!coordinates) {
    return false;
  }

  // (0, 0) / Null Island is not a valid store/user location and produces wildly wrong distances
  if (
    !Number.isFinite(coordinates.latitude) ||
    !Number.isFinite(coordinates.longitude) ||
    (coordinates.latitude === 0 && coordinates.longitude === 0)
  ) {
    return false;
  }

  return (
    coordinates.latitude >= -90 &&
    coordinates.latitude <= 90 &&
    coordinates.longitude >= -180 &&
    coordinates.longitude <= 180
  );
}


export function calculateDistanceKm(
  first: Coordinates,
  second: Coordinates,
): number {
  const latitudeDifference = degreesToRadians(second.latitude - first.latitude);

  const longitudeDifference = degreesToRadians(
    second.longitude - first.longitude,
  );

  const firstLatitude = degreesToRadians(first.latitude);
  const secondLatitude = degreesToRadians(second.latitude);

  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  const angularDistance =
    2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return EARTH_RADIUS_KM * angularDistance;
}

export function calculateGroupMidpoint(
  members: GroupMember[],
): Coordinates | null {
  const readyMembers = members.filter(
    (
      member,
    ): member is GroupMember & {
      coordinates: Coordinates;
    } =>
      member.locationStatus === "ready" &&
      isValidCoordinates(member.coordinates),
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

export function offsetCoordinates(
  origin: Coordinates,
  latitudeOffset: number,
  longitudeOffset: number,
): Coordinates {
  return {
    latitude: origin.latitude + latitudeOffset,
    longitude: origin.longitude + longitudeOffset,
  };
}
