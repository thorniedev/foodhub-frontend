import { NextRequest, NextResponse } from "next/server";

import type {
  LocationReverseResponse,
  LocationSearchResult,
} from "@/types/location-search";

interface GeoapifyResult {
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

interface GeoapifyResponse {
  results?: GeoapifyResult[];
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

function normalizeResult(item: GeoapifyResult): LocationSearchResult | null {
  const latitude = toFiniteNumber(item.lat);

  const longitude = toFiniteNumber(item.lon);

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

  const address =
    item.formatted?.trim() ||
    [item.address_line1, item.address_line2].filter(Boolean).join(", ") ||
    item.name ||
    "Selected location";

  const name =
    item.name?.trim() ||
    item.address_line1?.trim() ||
    item.city?.trim() ||
    item.district?.trim() ||
    item.suburb?.trim() ||
    item.state?.trim() ||
    item.country?.trim() ||
    address;

  return {
    id: item.place_id || `${latitude}-${longitude}`,

    name,

    address,

    addressLine1: item.address_line1 ?? null,

    addressLine2: item.address_line2 ?? null,

    city: item.city ?? null,

    district: item.district ?? item.suburb ?? null,

    county: item.county ?? null,

    state: item.state ?? null,

    postcode: item.postcode ?? null,

    country: item.country ?? null,

    countryCode: item.country_code ?? null,

    latitude,

    longitude,

    type: item.result_type ?? null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const latitude = Number(searchParams.get("lat"));

    const longitude = Number(searchParams.get("lng"));

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        {
          place: null,

          message: "Latitude or longitude is invalid.",
        } satisfies LocationReverseResponse,
        {
          status: 400,
        },
      );
    }

    const apiKey = process.env.GEOAPIFY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          place: null,

          message: "GEOAPIFY_API_KEY is not configured.",
        } satisfies LocationReverseResponse,
        {
          status: 500,
        },
      );
    }

    const params = new URLSearchParams({
      lat: String(latitude),

      lon: String(longitude),

      format: "json",

      limit: "1",

      apiKey,
    });

    const geoapifyResponse = await fetch(
      `https://api.geoapify.com/v1/geocode/reverse?${params.toString()}`,
      {
        method: "GET",

        headers: {
          Accept: "application/json",
        },

        cache: "no-store",
      },
    );

    if (!geoapifyResponse.ok) {
      const errorText = await geoapifyResponse.text();

      console.error("[GEOAPIFY REVERSE ERROR]", {
        status: geoapifyResponse.status,

        response: errorText,
      });

      return NextResponse.json(
        {
          place: null,

          message: "មិនអាចរកព័ត៌មានអាសយដ្ឋានទីតាំងនេះបានទេ។",
        } satisfies LocationReverseResponse,
        {
          status: geoapifyResponse.status,
        },
      );
    }

    const data = (await geoapifyResponse.json()) as GeoapifyResponse;

    const firstResult = Array.isArray(data.results)
      ? data.results[0]
      : undefined;

    if (!firstResult) {
      return NextResponse.json({
        place: null,

        message: "រកមិនឃើញព័ត៌មានអាសយដ្ឋានសម្រាប់ទីតាំងនេះ។",
      } satisfies LocationReverseResponse);
    }

    const place = normalizeResult(firstResult);

    return NextResponse.json({
      place,

      message: place ? null : "រកមិនឃើញព័ត៌មានអាសយដ្ឋានសម្រាប់ទីតាំងនេះ។",
    } satisfies LocationReverseResponse);
  } catch (error) {
    console.error("[LOCATION REVERSE ERROR]", error);

    return NextResponse.json(
      {
        place: null,

        message: "មានបញ្ហាក្នុងការរកព័ត៌មានអាសយដ្ឋាន។",
      } satisfies LocationReverseResponse,
      {
        status: 500,
      },
    );
  }
}
