import type { Coordinates } from "@/types/location";
import type { GroupLocationMember } from "@/types/group-location";

const EARTH_RADIUS_KM = 6371.0088;
const GEOMETRIC_MEDIAN_TOLERANCE_KM = 0.00001;
const GEOMETRIC_MEDIAN_MAX_ITERATIONS = 100;
const ZERO_DISTANCE_EPSILON_KM = 0.000001;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function toDegrees(value: number): number {
  return (value * 180) / Math.PI;
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

/** Haversine straight-line distance in kilometres. */
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

type PlanarPoint = {
  x: number;
  y: number;
};

/**
 * Converts nearby latitude/longitude points to a local equirectangular plane.
 * FoodHub group members are expected to be in the same city/region, so this is
 * accurate enough for the geometric-median iteration while keeping the final
 * recommendation distances Haversine-based.
 */
function toPlanarPoint(
  coordinates: Coordinates,
  referenceLatitudeRadians: number,
): PlanarPoint {
  return {
    x:
      EARTH_RADIUS_KM *
      toRadians(coordinates.longitude) *
      Math.cos(referenceLatitudeRadians),
    y: EARTH_RADIUS_KM * toRadians(coordinates.latitude),
  };
}

function toCoordinates(
  point: PlanarPoint,
  referenceLatitudeRadians: number,
): Coordinates {
  return {
    latitude: toDegrees(point.y / EARTH_RADIUS_KM),
    longitude: toDegrees(
      point.x / (EARTH_RADIUS_KM * Math.cos(referenceLatitudeRadians)),
    ),
  };
}

function planarDistance(first: PlanarPoint, second: PlanarPoint): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

/**
 * Calculates the geometric median for all ready group-member locations.
 *
 * This keeps the existing `calculateGroupMidpoint` public function name so no
 * UI components need to change, while matching the current Meetup API request
 * contract (`meetingPointMethod: "GEOMETRIC_MEDIAN"`).
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

  const averageLatitude =
    readyMembers.reduce(
      (total, member) => total + member.coordinates.latitude,
      0,
    ) / readyMembers.length;

  const referenceLatitudeRadians = toRadians(averageLatitude);

  const points = readyMembers.map((member) =>
    toPlanarPoint(member.coordinates, referenceLatitudeRadians),
  );

  let current: PlanarPoint = {
    x: points.reduce((total, point) => total + point.x, 0) / points.length,
    y: points.reduce((total, point) => total + point.y, 0) / points.length,
  };

  for (
    let iteration = 0;
    iteration < GEOMETRIC_MEDIAN_MAX_ITERATIONS;
    iteration += 1
  ) {
    const exactPoint = points.find(
      (point) => planarDistance(current, point) < ZERO_DISTANCE_EPSILON_KM,
    );

    if (exactPoint) {
      current = exactPoint;
      break;
    }

    let weightedX = 0;
    let weightedY = 0;
    let weightTotal = 0;

    for (const point of points) {
      const distance = planarDistance(current, point);
      const weight = 1 / Math.max(distance, ZERO_DISTANCE_EPSILON_KM);

      weightedX += point.x * weight;
      weightedY += point.y * weight;
      weightTotal += weight;
    }

    const next: PlanarPoint = {
      x: weightedX / weightTotal,
      y: weightedY / weightTotal,
    };

    if (planarDistance(current, next) <= GEOMETRIC_MEDIAN_TOLERANCE_KM) {
      current = next;
      break;
    }

    current = next;
  }

  return toCoordinates(current, referenceLatitudeRadians);
}
