import { NextRequest, NextResponse } from "next/server";

interface GooglePlace {
  id?: string;

  displayName?: {
    text?: string;
    languageCode?: string;
  };

  formattedAddress?: string;

  location?: {
    latitude?: number;
    longitude?: number;
  };

  primaryType?: string;

  types?: string[];
}

interface GooglePlacesResponse {
  places?: GooglePlace[];
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const query = typeof body?.query === "string" ? body.query.trim() : "";

    if (query.length < 2) {
      return NextResponse.json(
        {
          results: [],
          message: "Please enter at least 2 characters.",
        },
        {
          status: 400,
        },
      );
    }

    const apiKey = process.env.GOOGLE_MAP_KEY;

    if (!apiKey) {
      console.error("[MAP SEARCH] GOOGLE_MAPS_API_KEY is missing");

      return NextResponse.json(
        {
          results: [],
          message: "Google Maps API key is not configured.",
        },
        {
          status: 500,
        },
      );
    }

    // ===============================
    // GOOGLE PLACES TEXT SEARCH
    // ===============================
    const googleResponse = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          "X-Goog-Api-Key": apiKey,

          "X-Goog-FieldMask": [
            "places.id",
            "places.displayName",
            "places.formattedAddress",
            "places.location",
            "places.primaryType",
            "places.types",
          ].join(","),
        },

        body: JSON.stringify({
          textQuery: query,

          // Maximum results shown in your dropdown
          pageSize: 10,

          /*
           * IMPORTANT:
           *
           * No includedRegionCodes
           * No regionCode restriction
           * No Cambodia bounding box
           * No locationRestriction
           *
           * This allows worldwide search.
           */
        }),

        cache: "no-store",
      },
    );

    const data = (await googleResponse.json()) as GooglePlacesResponse;

    if (!googleResponse.ok) {
      console.error("[GOOGLE PLACES ERROR]", {
        status: googleResponse.status,
        response: data,
      });

      return NextResponse.json(
        {
          results: [],
          message: data?.error?.message || "Unable to search locations.",
        },
        {
          status: googleResponse.status,
        },
      );
    }

    const places = Array.isArray(data.places) ? data.places : [];

    const results = places
      .filter((place) => {
        const latitude = place.location?.latitude;

        const longitude = place.location?.longitude;

        return (
          typeof latitude === "number" &&
          typeof longitude === "number" &&
          Number.isFinite(latitude) &&
          Number.isFinite(longitude)
        );
      })
      .map((place) => {
        const name = place.displayName?.text?.trim() || "";

        const address = place.formattedAddress?.trim() || "";

        let label = name;

        if (address && address.toLowerCase() !== name.toLowerCase()) {
          label = name ? `${name}, ${address}` : address;
        }

        return {
          placeId: place.id ?? "",

          label: label || "Unknown location",

          latitude: place.location!.latitude!,

          longitude: place.location!.longitude!,

          locationType: place.primaryType ?? null,

          types: Array.isArray(place.types) ? place.types : [],

          partialMatch: false,
        };
      });

    return NextResponse.json({
      query,
      results,
      message: results.length === 0 ? "No locations found." : null,
    });
  } catch (error) {
    console.error("[MAP SEARCH ERROR]", error);

    return NextResponse.json(
      {
        results: [],
        message: "Unable to search locations right now.",
      },
      {
        status: 500,
      },
    );
  }
}
