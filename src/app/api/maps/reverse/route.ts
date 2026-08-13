import { NextRequest, NextResponse } from "next/server";

import type {
  LocationReverseResponse,
  LocationSearchResult,
} from "@/types/location-search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface GeoapifyReverseResult {
  place_id?: string;

  name?: string;
  formatted?: string;

  address_line1?: string;
  address_line2?: string;

  city?: string;
  district?: string;
  suburb?: string;
  county?: string;
  state?: string;
  postcode?: string;

  country?: string;
  country_code?: string;

  lat?: number | string;
  lon?: number | string;

  result_type?: string;
}

interface GeoapifyJsonResponse {
  results?: GeoapifyReverseResult[];
}

interface GeoapifyGeoJsonFeature {
  properties?: GeoapifyReverseResult;
}

interface GeoapifyGeoJsonResponse {
  features?: GeoapifyGeoJsonFeature[];
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function isValidCoordinatePair(latitude: number, longitude: number): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function buildAddress(result: GeoapifyReverseResult): string {
  return (
    result.formatted?.trim() ||
    [result.address_line1, result.address_line2].filter(Boolean).join(", ") ||
    result.name?.trim() ||
    [result.city, result.district, result.state, result.country]
      .filter(Boolean)
      .join(", ") ||
    "Selected location"
  );
}

function buildName(result: GeoapifyReverseResult, address: string): string {
  return (
    result.name?.trim() ||
    result.address_line1?.trim() ||
    result.city?.trim() ||
    result.district?.trim() ||
    result.suburb?.trim() ||
    result.state?.trim() ||
    address
  );
}

function normalizeReverseResult(
  result: GeoapifyReverseResult,
  requestedLatitude: number,
  requestedLongitude: number,
): LocationSearchResult {
  const responseLatitude = toFiniteNumber(result.lat);

  const responseLongitude = toFiniteNumber(result.lon);

  const latitude =
    responseLatitude !== null && Number.isFinite(responseLatitude)
      ? responseLatitude
      : requestedLatitude;

  const longitude =
    responseLongitude !== null && Number.isFinite(responseLongitude)
      ? responseLongitude
      : requestedLongitude;

  const address = buildAddress(result);
  const name = buildName(result, address);

  return {
    id:
      result.place_id?.trim() ||
      `reverse-${latitude.toFixed(7)}-${longitude.toFixed(7)}`,

    name,
    address,

    addressLine1: result.address_line1 ?? null,

    addressLine2: result.address_line2 ?? null,

    city: result.city ?? null,

    district: result.district ?? result.suburb ?? null,

    county: result.county ?? null,

    state: result.state ?? null,

    postcode: result.postcode ?? null,

    country: result.country ?? null,

    countryCode: result.country_code?.trim().toLowerCase() ?? null,

    latitude,
    longitude,

    type: result.result_type ?? null,
  };
}

function createCoordinateFallbackPlace(
  latitude: number,
  longitude: number,
): LocationSearchResult {
  const coordinateLabel = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

  return {
    id: `coordinate-${latitude.toFixed(7)}-${longitude.toFixed(7)}`,

    name: "ទីតាំងដែលបានជ្រើស",
    address: coordinateLabel,

    addressLine1: null,
    addressLine2: null,

    city: null,
    district: null,
    county: null,
    state: null,
    postcode: null,

    country: null,
    countryCode: null,

    latitude,
    longitude,

    type: "coordinates",
  };
}

function extractResults(data: unknown): GeoapifyReverseResult[] {
  if (typeof data !== "object" || data === null) {
    return [];
  }

  const record = data as Record<string, unknown>;

  /*
   * format=json:
   * {
   *   results: [...]
   * }
   */
  if (Array.isArray(record.results)) {
    return record.results.filter(
      (value): value is GeoapifyReverseResult =>
        typeof value === "object" && value !== null,
    );
  }

  /*
   * GeoJSON/default compatibility:
   * {
   *   features: [
   *     { properties: {...} }
   *   ]
   * }
   */
  if (Array.isArray(record.features)) {
    return record.features.flatMap((feature) => {
      if (typeof feature !== "object" || feature === null) {
        return [];
      }

      const properties = (feature as Record<string, unknown>).properties;

      return typeof properties === "object" && properties !== null
        ? [properties as GeoapifyReverseResult]
        : [];
    });
  }

  return [];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const latitude = Number(searchParams.get("lat"));

  /*
   * Frontend currently sends `lng`.
   * Geoapify itself expects `lon`.
   *
   * Accept both at our internal API
   * boundary to avoid frontend coupling.
   */
  const longitude = Number(searchParams.get("lng") ?? searchParams.get("lon"));

  if (!isValidCoordinatePair(latitude, longitude)) {
    return NextResponse.json(
      {
        place: null,
        message: "កូអរដោនេទីតាំងមិនត្រឹមត្រូវ។",
      } satisfies LocationReverseResponse,
      {
        status: 400,
      },
    );
  }

  const apiKey = process.env.GEOAPIFY_API_KEY?.trim();

  if (!apiKey) {
    console.error("[MAP REVERSE] GEOAPIFY_API_KEY is missing");

    return NextResponse.json(
      {
        place: createCoordinateFallbackPlace(latitude, longitude),
        message: "GEOAPIFY_API_KEY is not configured. Using coordinates only.",
      } satisfies LocationReverseResponse,
      {
        /*
         * Coordinate selection is still
         * valid even without a label.
         */
        status: 200,
      },
    );
  }

  const geoapifyParams = new URLSearchParams({
    lat: String(latitude),

    /*
     * IMPORTANT:
     * Geoapify parameter is `lon`,
     * not `lng`.
     */
    lon: String(longitude),

    format: "json",

    /*
     * Khmer address labels where
     * supported by Geoapify.
     */
    lang: "km",

    limit: "1",

    apiKey,
  });

  const geoapifyUrl = `https://api.geoapify.com/v1/geocode/reverse?${geoapifyParams.toString()}`;

  try {
    const geoapifyResponse = await fetch(geoapifyUrl, {
      method: "GET",

      headers: {
        Accept: "application/json",
      },

      cache: "no-store",
    });

    const responseText = await geoapifyResponse.text();

    if (!geoapifyResponse.ok) {
      console.error("[GEOAPIFY REVERSE ERROR]", {
        status: geoapifyResponse.status,

        statusText: geoapifyResponse.statusText,

        response: responseText,
      });

      /*
       * Reverse geocoding is only
       * enrichment. The coordinates
       * themselves remain usable.
       */
      return NextResponse.json(
        {
          place: createCoordinateFallbackPlace(latitude, longitude),

          message: "មិនអាចរកឈ្មោះអាសយដ្ឋានបានទេ។ កំពុងប្រើកូអរដោនេដែលបានជ្រើស។",
        } satisfies LocationReverseResponse,
        {
          status: 200,
        },
      );
    }

    let parsed: unknown;

    try {
      parsed = responseText.trim() ? JSON.parse(responseText) : {};
    } catch (error) {
      console.error("[MAP REVERSE] Invalid Geoapify JSON", {
        response: responseText,
        error,
      });

      return NextResponse.json({
        place: createCoordinateFallbackPlace(latitude, longitude),

        message:
          "មិនអាចអានព័ត៌មានអាសយដ្ឋានបានទេ។ កំពុងប្រើកូអរដោនេដែលបានជ្រើស។",
      } satisfies LocationReverseResponse);
    }

    const results = extractResults(parsed);

    const firstResult = results[0];

    if (!firstResult) {
      /*
       * This is NOT an application error.
       * A map coordinate can be perfectly
       * valid even when no nearby address
       * exists in the geocoder.
       */
      return NextResponse.json({
        place: createCoordinateFallbackPlace(latitude, longitude),

        message:
          "រកមិនឃើញឈ្មោះអាសយដ្ឋានជាក់លាក់។ កំពុងប្រើកូអរដោនេដែលបានជ្រើស។",
      } satisfies LocationReverseResponse);
    }

    const place = normalizeReverseResult(firstResult, latitude, longitude);

    console.log("[MAP REVERSE SUCCESS]", {
      requested: {
        latitude,
        longitude,
      },

      place: {
        name: place.name,
        country: place.country,
        countryCode: place.countryCode,
      },
    });

    return NextResponse.json({
      place,
      message: null,
    } satisfies LocationReverseResponse);
  } catch (error) {
    console.error("[MAP REVERSE CONNECTION ERROR]", error);

    /*
     * A temporary Geoapify/network
     * problem should not stop the user
     * from selecting a valid point.
     */
    return NextResponse.json({
      place: createCoordinateFallbackPlace(latitude, longitude),

      message:
        "សេវាអាសយដ្ឋានមិនអាចប្រើបានបណ្ដោះអាសន្ន។ កំពុងប្រើកូអរដោនេដែលបានជ្រើស។",
    } satisfies LocationReverseResponse);
  }
}
