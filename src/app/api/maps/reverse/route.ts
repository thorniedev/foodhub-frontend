import { NextRequest, NextResponse } from "next/server";
import type {
  LocationReverseResponse,
  LocationSearchResult,
} from "@/types/location-search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function buildFallbackResult(
  latitude: number,
  longitude: number,
): LocationSearchResult {
  return {
    id: `coord-${latitude.toFixed(6)}-${longitude.toFixed(6)}`,
    name: "ទីតាំងដែលបានជ្រើស",
    address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
    addressLine1: null,
    addressLine2: null,
    city: null,
    district: null,
    county: null,
    state: null,
    postcode: null,
    country: "Cambodia",
    countryCode: "kh",
    latitude,
    longitude,
    type: "coordinates",
  };
}

async function reverseWithNominatim(
  lat: number,
  lon: number,
): Promise<LocationSearchResult | null> {
  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      format: "jsonv2",
      addressdetails: "1",
      zoom: "18",
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "FoodHub-Cambodia-Reverse/1.0",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || !data.display_name) return null;

    const addr = data.address || {};
    const name =
      addr.amenity ||
      addr.shop ||
      addr.tourism ||
      addr.building ||
      addr.road ||
      addr.village ||
      addr.suburb ||
      addr.neighbourhood ||
      addr.quarter ||
      addr.town ||
      addr.city ||
      data.name ||
      "ទីតាំងដែលបានជ្រើស";

    return {
      id: `osm-rev-${lat.toFixed(6)}-${lon.toFixed(6)}`,
      name: String(name).trim() || data.display_name.split(",")[0],
      address: data.display_name,
      addressLine1: addr.road || null,
      addressLine2: addr.suburb || addr.village || null,
      city: addr.city || addr.town || null,
      district: addr.suburb || addr.county || null,
      county: addr.county || null,
      state: addr.state || null,
      postcode: addr.postcode || null,
      country: addr.country || "Cambodia",
      countryCode: addr.country_code || "kh",
      latitude: lat,
      longitude: lon,
      type: data.type || "place",
    };
  } catch (err) {
    console.error("[NOMINATIM REVERSE ERROR]", err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng") ?? searchParams.get("lon");

    if (latParam === null || lngParam === null) {
      return NextResponse.json(
        {
          place: buildFallbackResult(11.5564, 104.9282),
          message: "សូមបញ្ជាក់កូអរដោនេ latitude និង longitude។",
        } satisfies LocationReverseResponse,
        { status: 400 },
      );
    }

    const latitude = Number(latParam);
    const longitude = Number(lngParam);

    if (!isValidCoordinatePair(latitude, longitude)) {
      return NextResponse.json(
        {
          place: buildFallbackResult(11.5564, 104.9282),
          message: "កូអរដោនេមិនត្រឹមត្រូវ។",
        } satisfies LocationReverseResponse,
        { status: 400 },
      );
    }

    const resolvedPlace = await reverseWithNominatim(latitude, longitude);

    if (resolvedPlace) {
      return NextResponse.json({
        place: resolvedPlace,
        message: null,
      } satisfies LocationReverseResponse);
    }

    // Fallback to coordinates
    return NextResponse.json({
      place: buildFallbackResult(latitude, longitude),
      message: "មិនអាចរកឈ្មោះអាសយដ្ឋានបានទេ។ កំពុងប្រើកូអរដោនេដែលបានជ្រើស។",
    } satisfies LocationReverseResponse);
  } catch (error) {
    console.error("[MAP REVERSE ERROR]", error);
    return NextResponse.json(
      {
        place: buildFallbackResult(11.5564, 104.9282),
        message: "មានបញ្ហាក្នុងការស្វែងរកអាសយដ្ឋាន។",
      } satisfies LocationReverseResponse,
      { status: 500 },
    );
  }
}
