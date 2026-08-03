import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUEST_TIMEOUT_MS = 12_000;
const MAX_URL_LENGTH = 4_096;

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface ResolveMapRequest {
  mapUrl?: unknown;
}

interface GoogleGeocodeResponse {
  status?: string;

  error_message?: string;

  results?: Array<{
    formatted_address?: string;

    geometry?: {
      location?: {
        lat?: number;
        lng?: number;
      };
    };
  }>;
}

function createErrorResponse(error: string, status: number) {
  return NextResponse.json(
    {
      error,
    },
    {
      status,
    },
  );
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

    const parsedValue = Number.parseFloat(normalizedValue);

    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
}

function normalizeCoordinates(
  latitudeValue: unknown,
  longitudeValue: unknown,
): Coordinates | null {
  const latitude = toFiniteNumber(latitudeValue);

  const longitude = toFiniteNumber(longitudeValue);

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

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseMapUrl(value: unknown): URL | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue || normalizedValue.length > MAX_URL_LENGTH) {
    return null;
  }

  try {
    const url = new URL(
      /^[a-z][a-z\d+\-.]*:\/\//i.test(normalizedValue)
        ? normalizedValue
        : `https://${normalizedValue}`,
    );

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    if (url.username || url.password) {
      return null;
    }

    // Always use HTTPS when contacting Google.
    url.protocol = "https:";

    return url;
  } catch {
    return null;
  }
}

function isAllowedGoogleMapsHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, "");

  return (
    host === "maps.app.goo.gl" ||
    host === "goo.gl" ||
    host === "google.com" ||
    host === "maps.google.com" ||
    host.endsWith(".google.com") ||
    /^google\.[a-z.]{2,20}$/.test(host) ||
    /^maps\.google\.[a-z.]{2,20}$/.test(host)
  );
}

function isAllowedGoogleMapsUrl(url: URL): boolean {
  return url.protocol === "https:" && isAllowedGoogleMapsHost(url.hostname);
}

function parseCoordinatePair(value: string): Coordinates | null {
  const normalizedValue = safeDecode(value).replace(/\+/g, " ").trim();

  const match = normalizedValue.match(
    /(-?\d{1,3}(?:\.\d+)?)\s*[,，]\s*(-?\d{1,3}(?:\.\d+)?)/,
  );

  if (!match) {
    return null;
  }

  return normalizeCoordinates(match[1], match[2]);
}

function extractCoordinatesFromUrl(url: URL): Coordinates | null {
  const decodedUrl = safeDecode(url.toString());

  const atCoordinates = decodedUrl.match(
    /@(-?\d{1,3}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)(?:,|\/|$)/,
  );

  if (atCoordinates) {
    const coordinates = normalizeCoordinates(
      atCoordinates[1],
      atCoordinates[2],
    );

    if (coordinates) {
      return coordinates;
    }
  }

  const dataCoordinates = decodedUrl.match(
    /!3d(-?\d{1,3}(?:\.\d+)?)!4d(-?\d{1,3}(?:\.\d+)?)/,
  );

  if (dataCoordinates) {
    const coordinates = normalizeCoordinates(
      dataCoordinates[1],
      dataCoordinates[2],
    );

    if (coordinates) {
      return coordinates;
    }
  }

  const coordinateParameters = [
    "query",
    "q",
    "ll",
    "center",
    "destination",
    "origin",
    "daddr",
    "saddr",
  ];

  for (const parameter of coordinateParameters) {
    const value = url.searchParams.get(parameter);

    if (!value) {
      continue;
    }

    const coordinates = parseCoordinatePair(value);

    if (coordinates) {
      return coordinates;
    }
  }

  /*
   * Some direction and search links contain the coordinate
   * directly inside the pathname.
   */
  const pathnameCoordinates = parseCoordinatePair(safeDecode(url.pathname));

  if (pathnameCoordinates) {
    return pathnameCoordinates;
  }

  return null;
}

function extractPlaceId(url: URL): string | null {
  const placeId =
    url.searchParams.get("query_place_id") ?? url.searchParams.get("place_id");

  return placeId?.trim() || null;
}

function cleanPlaceQuery(value: string): string {
  return safeDecode(value).replace(/\+/g, " ").replace(/\s+/g, " ").trim();
}

function extractPlaceQuery(url: URL): string | null {
  const queryParameters = ["query", "q", "destination"];

  for (const parameter of queryParameters) {
    const value = url.searchParams.get(parameter);

    if (!value || parseCoordinatePair(value)) {
      continue;
    }

    const cleanedValue = cleanPlaceQuery(value);

    if (cleanedValue && cleanedValue.toLowerCase() !== "current location") {
      return cleanedValue;
    }
  }

  const segments = url.pathname.split("/").filter(Boolean);

  const placeSegmentIndex = segments.findIndex(
    (segment) => segment === "place" || segment === "search",
  );

  if (placeSegmentIndex >= 0 && segments[placeSegmentIndex + 1]) {
    const candidate = cleanPlaceQuery(segments[placeSegmentIndex + 1]);

    if (
      candidate &&
      !candidate.startsWith("data=") &&
      !parseCoordinatePair(candidate)
    ) {
      return candidate;
    }
  }

  return null;
}

async function followGoogleRedirect(originalUrl: URL): Promise<URL> {
  const controller = new AbortController();

  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(originalUrl, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,

      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "Mozilla/5.0 FoodHub-Map-Link-Resolver/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Google Maps returned ${response.status}.`);
    }

    const resolvedUrl = new URL(response.url || originalUrl.toString());

    if (!isAllowedGoogleMapsUrl(resolvedUrl)) {
      throw new Error("The link redirected outside Google Maps.");
    }

    return resolvedUrl;
  } finally {
    clearTimeout(timeout);
  }
}

async function geocodePlace(
  placeId: string | null,
  address: string | null,
): Promise<{
  coordinates: Coordinates;
  label: string;
} | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return null;
  }

  if (!placeId && !address) {
    return null;
  }

  const endpoint = new URL("https://maps.googleapis.com/maps/api/geocode/json");

  if (placeId) {
    endpoint.searchParams.set("place_id", placeId);
  } else if (address) {
    endpoint.searchParams.set("address", address);
  }

  endpoint.searchParams.set("key", apiKey);

  const controller = new AbortController();

  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as GoogleGeocodeResponse;

    if (data.status !== "OK" || !data.results?.length) {
      return null;
    }

    const firstResult = data.results[0];

    const coordinates = normalizeCoordinates(
      firstResult.geometry?.location?.lat,
      firstResult.geometry?.location?.lng,
    );

    if (!coordinates) {
      return null;
    }

    return {
      coordinates,
      label: firstResult.formatted_address || address || "Google Maps location",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  let body: ResolveMapRequest;

  try {
    body = (await request.json()) as ResolveMapRequest;
  } catch {
    return createErrorResponse("Invalid JSON request.", 400);
  }

  const originalUrl = parseMapUrl(body.mapUrl);

  if (!originalUrl) {
    return createErrorResponse("សូមបញ្ចូល Google Maps link ត្រឹមត្រូវ។", 400);
  }

  if (!isAllowedGoogleMapsUrl(originalUrl)) {
    return createErrorResponse("អាចប្រើបានតែ Google Maps link ប៉ុណ្ណោះ។", 400);
  }

  /*
   * Direct Google Maps URLs may already contain coordinates.
   */
  const originalCoordinates = extractCoordinatesFromUrl(originalUrl);

  if (originalCoordinates) {
    return NextResponse.json({
      coordinates: originalCoordinates,

      resolvedUrl: originalUrl.toString(),

      label: extractPlaceQuery(originalUrl) || "Google Maps location",

      source: "url",
    });
  }

  try {
    const resolvedUrl = await followGoogleRedirect(originalUrl);

    const resolvedCoordinates = extractCoordinatesFromUrl(resolvedUrl);

    if (resolvedCoordinates) {
      return NextResponse.json({
        coordinates: resolvedCoordinates,

        resolvedUrl: resolvedUrl.toString(),

        label: extractPlaceQuery(resolvedUrl) || "Google Maps location",

        source: "url",
      });
    }

    /*
     * Some links identify a Place ID or place name instead of
     * containing literal latitude and longitude values.
     */
    const placeId = extractPlaceId(resolvedUrl) ?? extractPlaceId(originalUrl);

    const placeQuery =
      extractPlaceQuery(resolvedUrl) ?? extractPlaceQuery(originalUrl);

    const geocodedLocation = await geocodePlace(placeId, placeQuery);

    if (geocodedLocation) {
      return NextResponse.json({
        coordinates: geocodedLocation.coordinates,

        resolvedUrl: resolvedUrl.toString(),

        label: geocodedLocation.label,

        source: "geocoding",
      });
    }

    const apiKeyConfigured = Boolean(process.env.GOOGLE_MAPS_API_KEY);

    return createErrorResponse(
      apiKeyConfigured
        ? "មិនអាចរកទីតាំងពី Google Maps link នេះបានទេ។ សូម Share ទីតាំងម្ដងទៀតពី Google Maps។"
        : "Link នេះមិនបង្ហាញ coordinates ដោយផ្ទាល់ទេ។ សូមកំណត់ GOOGLE_MAPS_API_KEY ឬ Share ទីតាំងថ្មីពី Google Maps។",
      422,
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to resolve the Google Maps link.";

    return createErrorResponse(
      `មិនអាចបើក Google Maps link បានទេ។ ${message}`,
      422,
    );
  }
}
