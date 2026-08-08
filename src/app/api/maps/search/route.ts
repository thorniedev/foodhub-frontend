import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SearchLocationRequest {
  query?: unknown;
}

interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GoogleGeocodingResult {
  place_id: string;
  formatted_address: string;

  address_components?: GoogleAddressComponent[];

  geometry: {
    location: {
      lat: number;
      lng: number;
    };

    location_type?: string;
  };

  types?: string[];
  partial_match?: boolean;
}

interface GoogleGeocodingResponse {
  status: string;
  error_message?: string;
  results?: GoogleGeocodingResult[];
}

function isCambodiaResult(result: GoogleGeocodingResult): boolean {
  const countryComponent = result.address_components?.find((component) =>
    component.types.includes("country"),
  );

  /*
   * The request already contains country:KH.
   * Accept results without a country component, but reject
   * results that explicitly belong to another country.
   */
  if (!countryComponent) {
    return true;
  }

  return countryComponent.short_name.trim().toUpperCase() === "KH";
}

function isValidCoordinate(latitude: number, longitude: number): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          message: "GOOGLE_MAPS_API_KEY is not configured.",
          results: [],
        },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    let body: SearchLocationRequest;

    try {
      body = (await request.json()) as SearchLocationRequest;
    } catch {
      return NextResponse.json(
        {
          message: "The request body must be valid JSON.",
          results: [],
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const query = typeof body.query === "string" ? body.query.trim() : "";

    if (query.length < 2) {
      return NextResponse.json(
        {
          message: "Enter at least 2 characters to search.",
          results: [],
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    if (query.length > 160) {
      return NextResponse.json(
        {
          message: "The location search is too long.",
          results: [],
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const searchParameters = new URLSearchParams({
      address: query,

      /*
       * Restrict results to Cambodia.
       */
      components: "country:KH",

      /*
       * Give Cambodia additional regional priority.
       */
      region: "kh",

      /*
       * Google can still return English names when
       * a Khmer translation is unavailable.
       */
      language: "km",

      key: apiKey,
    });

    const googleResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${searchParameters.toString()}`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!googleResponse.ok) {
      return NextResponse.json(
        {
          message: "Google location search could not be reached.",
          results: [],
        },
        {
          status: 502,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const googleData = (await googleResponse.json()) as GoogleGeocodingResponse;

    if (googleData.status === "ZERO_RESULTS") {
      return NextResponse.json(
        {
          query,
          results: [],
          message: "No matching location was found in Cambodia.",
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    if (googleData.status !== "OK") {
      return NextResponse.json(
        {
          message:
            googleData.error_message ||
            `Google location search failed with status ${googleData.status}.`,

          results: [],
        },
        {
          status: googleData.status === "INVALID_REQUEST" ? 400 : 502,

          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const results = (googleData.results ?? [])
      .filter(isCambodiaResult)
      .flatMap((result) => {
        const latitude = Number(result.geometry?.location?.lat);

        const longitude = Number(result.geometry?.location?.lng);

        if (!isValidCoordinate(latitude, longitude)) {
          return [];
        }

        return [
          {
            placeId: result.place_id,

            label: result.formatted_address,

            latitude,
            longitude,

            locationType: result.geometry.location_type ?? null,

            types: result.types ?? [],

            partialMatch: result.partial_match === true,
          },
        ];
      })
      .slice(0, 6);

    return NextResponse.json(
      {
        query,
        results,

        message:
          results.length === 0
            ? "No matching location was found in Cambodia."
            : null,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("[CAMBODIA LOCATION SEARCH ERROR]", error);

    return NextResponse.json(
      {
        message: "An unexpected location search error occurred.",
        results: [],
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
