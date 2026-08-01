import type { GroupMember } from "@/types/group-recommendation";
import type { Coordinates } from "@/types/location";

const EARTH_RADIUS_KM = 6371;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function toDegrees(value: number): number {
  return (value * 180) / Math.PI;
}

export function calculateDistanceKm(
  first: Coordinates,
  second: Coordinates,
): number {
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  const angularDistance =
    2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return EARTH_RADIUS_KM * angularDistance;
}

export function calculateGroupMidpoint(
  members: GroupMember[],
): Coordinates | null {
  const readyMembers = members.filter(
    (member): member is GroupMember & { coordinates: Coordinates } =>
      member.locationStatus === "ready" && member.coordinates !== null,
  );

  if (readyMembers.length === 0) {
    return null;
  }

  let x = 0;
  let y = 0;
  let z = 0;

  readyMembers.forEach(({ coordinates }) => {
    const latitude = toRadians(coordinates.latitude);
    const longitude = toRadians(coordinates.longitude);

    x += Math.cos(latitude) * Math.cos(longitude);
    y += Math.cos(latitude) * Math.sin(longitude);
    z += Math.sin(latitude);
  });

  x /= readyMembers.length;
  y /= readyMembers.length;
  z /= readyMembers.length;

  const longitude = Math.atan2(y, x);
  const hypotenuse = Math.sqrt(x * x + y * y);
  const latitude = Math.atan2(z, hypotenuse);

  return {
    latitude: toDegrees(latitude),
    longitude: toDegrees(longitude),
  };
}

export function calculateDistanceSummary(
  point: Coordinates,
  members: GroupMember[],
): { averageKm: number; maximumKm: number } {
  const distances = members
    .filter(
      (member): member is GroupMember & { coordinates: Coordinates } =>
        member.locationStatus === "ready" && member.coordinates !== null,
    )
    .map((member) => calculateDistanceKm(member.coordinates, point));

  if (distances.length === 0) {
    return { averageKm: 0, maximumKm: 0 };
  }

  return {
    averageKm:
      distances.reduce((total, distance) => total + distance, 0) /
      distances.length,
    maximumKm: Math.max(...distances),
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
