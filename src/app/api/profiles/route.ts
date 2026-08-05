import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface BackendErrorResponse {
  message?: string;
  error?: string;
  [key: string]: unknown;
}

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

async function parseResponse(response: Response): Promise<unknown> {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    return {
      message: responseText,
    };
  }
}

export async function GET(request: NextRequest) {
  const backendApiUrl = process.env.BACKEND_API_URL;

  /*
   * This name must match the cookie created in:
   * /api/auth/callback
   */
  const accessToken = request.cookies.get("foodhub_access_token")?.value;

  console.log("GET PROFILES AUTH CHECK:", {
    hasAccessToken: Boolean(accessToken),
    hasBackendApiUrl: Boolean(backendApiUrl),
    cookieNames: request.cookies.getAll().map((cookie) => cookie.name),
  });

  if (!backendApiUrl) {
    console.error("GET PROFILES CONFIGURATION ERROR:", {
      message: "BACKEND_API_URL is missing.",
    });

    return NextResponse.json(
      {
        source: "next-route-handler",
        message: "BACKEND_API_URL is not configured.",
      },
      {
        status: 500,
      },
    );
  }

  if (!accessToken) {
    console.error("GET PROFILES AUTH ERROR:", {
      message: "foodhub_access_token cookie is missing.",
    });

    return NextResponse.json(
      {
        source: "next-route-handler",
        message: "You are not authenticated.",
        reason: "foodhub_access_token cookie is missing.",
      },
      {
        status: 401,
      },
    );
  }

  const normalizedBackendApiUrl = normalizeBaseUrl(backendApiUrl);

  const backendUrl = new URL(`${normalizedBackendApiUrl}/profiles`);

  /*
   * Forward all query parameters:
   * page, size, sort, search, etc.
   */
  request.nextUrl.searchParams.forEach((value, key) => {
    backendUrl.searchParams.append(key, value);
  });

  console.log("GET PROFILES REQUEST:", {
    url: backendUrl.toString(),
    hasAccessToken: true,
  });

  try {
    const backendResponse = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    const responseData = await parseResponse(backendResponse);

    if (!backendResponse.ok) {
      console.error("GET PROFILES BACKEND ERROR:", {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        response: responseData,
        url: backendUrl.toString(),
      });

      const backendError = (responseData ?? {}) as BackendErrorResponse;

      return NextResponse.json(
        {
          source: "foodhub-backend",
          message:
            backendError.message ??
            backendError.error ??
            "The backend rejected the profiles request.",
          backendStatus: backendResponse.status,
          backendResponse: responseData,
        },
        {
          status: backendResponse.status,
        },
      );
    }

    return NextResponse.json(responseData, {
      status: backendResponse.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("GET PROFILES CONNECTION ERROR:", {
      error,
      url: backendUrl.toString(),
    });

    return NextResponse.json(
      {
        source: "next-route-handler",
        message: "Could not connect to the FoodHub backend.",
      },
      {
        status: 502,
      },
    );
  }
}
