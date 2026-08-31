import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { CreateMemberProfileRequest } from "@/types/member-profile/member-profile";

export const dynamic = "force-dynamic";

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

async function parseBackendResponse(response: Response): Promise<unknown> {
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

function getAccessToken(request: NextRequest): string | null {
  return request.cookies.get("foodhub_access_token")?.value ?? null;
}

function getBackendApiUrl(): string {
  const configuredBackendUrl =
    process.env.BACKEND_API_URL ||
    "https://api.mhoubahar.store";

  const normalizedUrl = normalizeBaseUrl(configuredBackendUrl);

  if (/\/api\/v1$/i.test(normalizedUrl)) {
    return normalizedUrl;
  }

  return `${normalizedUrl}/api/v1`;
}

function configurationError() {
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

function authenticationError() {
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

function createBackendResponse(data: unknown, status: number) {
  if (data === null && status === 204) {
    return new NextResponse(null, {
      status,
    });
  }

  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

async function syncCurrentUser(
  backendApiUrl: string,
  accessToken: string,
): Promise<boolean> {
  try {
    const syncResponse = await fetch(`${backendApiUrl}/users/me/sync`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!syncResponse.ok) {
      console.error("PROFILE USER SYNC ERROR:", {
        status: syncResponse.status,
        response: await parseBackendResponse(syncResponse),
      });
    }

    return syncResponse.ok;
  } catch (error) {
    console.error("PROFILE USER SYNC CONNECTION ERROR:", error);
    return false;
  }
}

function shouldRetryAfterSync(status: number): boolean {
  return status === 404 || status >= 500;
}

/**
 * GET /api/profiles?page=0&size=20
 */
export async function GET(request: NextRequest) {
  const backendApiUrl = getBackendApiUrl();
  const accessToken = getAccessToken(request);

  console.log("GET PROFILES AUTH CHECK:", {
    hasAccessToken: Boolean(accessToken),
    hasBackendApiUrl: Boolean(backendApiUrl),
  });

  if (!backendApiUrl) {
    return configurationError();
  }

  if (!accessToken) {
    return authenticationError();
  }

  const backendUrl = new URL(`${backendApiUrl}/profiles`);

  request.nextUrl.searchParams.forEach((value, key) => {
    backendUrl.searchParams.append(key, value);
  });

  try {
    let backendResponse = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    let responseData = await parseBackendResponse(backendResponse);

    if (!backendResponse.ok && shouldRetryAfterSync(backendResponse.status)) {
      const synced = await syncCurrentUser(backendApiUrl, accessToken);

      if (synced) {
        backendResponse = await fetch(backendUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        });

        responseData = await parseBackendResponse(backendResponse);
      }
    }

    if (!backendResponse.ok) {
      console.error("GET PROFILES BACKEND ERROR:", {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        response: responseData,
        url: backendUrl.toString(),
      });

      // If user is valid but has no profiles created yet (404), return empty page list (200 OK)
      if (backendResponse.status === 404) {
        return createBackendResponse(
          {
            contents: [],
            totalElements: 0,
            totalPages: 0,
            page: 0,
            size: 20,
          },
          200,
        );
      }
    }

    return createBackendResponse(responseData, backendResponse.status);
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

/**
 * POST /api/profiles
 */
export async function POST(request: NextRequest) {
  const backendApiUrl = getBackendApiUrl();
  const accessToken = getAccessToken(request);

  console.log("CREATE PROFILE AUTH CHECK:", {
    hasAccessToken: Boolean(accessToken),
    hasBackendApiUrl: Boolean(backendApiUrl),
  });

  if (!backendApiUrl) {
    return configurationError();
  }

  if (!accessToken) {
    return authenticationError();
  }

  let requestBody: CreateMemberProfileRequest;

  try {
    requestBody = (await request.json()) as CreateMemberProfileRequest;
  } catch {
    return NextResponse.json(
      {
        source: "next-route-handler",
        message: "The request body is not valid JSON.",
      },
      {
        status: 400,
      },
    );
  }

  if (!requestBody.profileName?.trim()) {
    return NextResponse.json(
      {
        source: "next-route-handler",
        message: "Profile name is required.",
      },
      {
        status: 400,
      },
    );
  }

  if (!requestBody.relationship) {
    return NextResponse.json(
      {
        source: "next-route-handler",
        message: "Relationship is required.",
      },
      {
        status: 400,
      },
    );
  }

  if (!requestBody.gender) {
    return NextResponse.json(
      {
        source: "next-route-handler",
        message: "Gender is required.",
      },
      {
        status: 400,
      },
    );
  }

  if (!requestBody.dateOfBirth) {
    return NextResponse.json(
      {
        source: "next-route-handler",
        message: "Date of birth is required.",
      },
      {
        status: 400,
      },
    );
  }

  const backendUrl = `${backendApiUrl}/profiles`;

  const payload: CreateMemberProfileRequest = {
    profileName: requestBody.profileName.trim(),
    relationship: requestBody.relationship,
    gender: requestBody.gender,
    dateOfBirth: requestBody.dateOfBirth,
    preferredLanguage: requestBody.preferredLanguage || "km",
    avatarMediaUuid: requestBody.avatarMediaUuid ?? null,
    isDefault: requestBody.isDefault ?? false,
  };

  try {
    console.log("CREATE PROFILE REQUEST:", {
      url: backendUrl,
      profileName: payload.profileName,
      relationship: payload.relationship,
    });

    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const responseData = await parseBackendResponse(backendResponse);

    if (!backendResponse.ok) {
      console.error("CREATE PROFILE BACKEND ERROR:", {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        response: responseData,
        url: backendUrl,
      });
    }

    return createBackendResponse(responseData, backendResponse.status);
  } catch (error) {
    console.error("CREATE PROFILE CONNECTION ERROR:", {
      error,
      url: backendUrl,
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
