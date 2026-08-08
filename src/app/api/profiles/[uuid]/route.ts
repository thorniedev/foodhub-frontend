import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    uuid: string;
  }>;
}

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

async function parseBackendResponse(
  response: Response,
): Promise<unknown> {
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

function getBackendApiUrl(): string | null {
  const backendApiUrl =
    process.env.BACKEND_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!backendApiUrl) {
    return null;
  }

  return normalizeBaseUrl(backendApiUrl);
}

function getAccessToken(request: NextRequest): string | null {
  return (
    request.cookies.get("foodhub_access_token")?.value ??
    null
  );
}

function configurationError() {
  return NextResponse.json(
    {
      source: "next-route-handler",
      message: "Backend API URL is not configured.",
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
    },
    {
      status: 401,
    },
  );
}

function invalidUuidError() {
  return NextResponse.json(
    {
      source: "next-route-handler",
      message: "A valid profile UUID is required.",
    },
    {
      status: 400,
    },
  );
}

async function getProfileUuid(
  context: RouteContext,
): Promise<string | null> {
  const { uuid } = await context.params;

  if (
    !uuid ||
    uuid === "undefined" ||
    uuid === "null"
  ) {
    return null;
  }

  return uuid;
}

/**
 * GET /api/profiles/{uuid}
 */
export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  const backendApiUrl = getBackendApiUrl();
  const accessToken = getAccessToken(request);
  const uuid = await getProfileUuid(context);

  if (!backendApiUrl) {
    return configurationError();
  }

  if (!accessToken) {
    return authenticationError();
  }

  if (!uuid) {
    return invalidUuidError();
  }

  const backendUrl =
    `${backendApiUrl}/profiles/${encodeURIComponent(uuid)}`;

  try {
    console.log("GET PROFILE DETAIL REQUEST:", {
      uuid,
      url: backendUrl,
    });

    const backendResponse = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    const responseData =
      await parseBackendResponse(backendResponse);

    if (!backendResponse.ok) {
      console.error("GET PROFILE DETAIL ERROR:", {
        uuid,
        url: backendUrl,
        status: backendResponse.status,
        response: responseData,
      });
    }

    return NextResponse.json(responseData, {
      status: backendResponse.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(
      "GET PROFILE DETAIL CONNECTION ERROR:",
      {
        error,
        uuid,
        url: backendUrl,
      },
    );

    return NextResponse.json(
      {
        source: "next-route-handler",
        message:
          "Could not connect to the profile service.",
      },
      {
        status: 502,
      },
    );
  }
}

/**
 * DELETE /api/profiles/{uuid}
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  const backendApiUrl = getBackendApiUrl();
  const accessToken = getAccessToken(request);
  const uuid = await getProfileUuid(context);

  if (!backendApiUrl) {
    return configurationError();
  }

  if (!accessToken) {
    return authenticationError();
  }

  if (!uuid) {
    return invalidUuidError();
  }

  const backendUrl =
    `${backendApiUrl}/profiles/${encodeURIComponent(uuid)}`;

  try {
    console.log("DELETE PROFILE REQUEST:", {
      uuid,
      url: backendUrl,
    });

    const backendResponse = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    const responseData =
      await parseBackendResponse(backendResponse);

    if (!backendResponse.ok) {
      console.error("DELETE PROFILE BACKEND ERROR:", {
        uuid,
        url: backendUrl,
        status: backendResponse.status,
        response: responseData,
      });
    }

    if (backendResponse.status === 204) {
      return new NextResponse(null, {
        status: 204,
      });
    }

    return NextResponse.json(responseData, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error(
      "DELETE PROFILE CONNECTION ERROR:",
      {
        error,
        uuid,
        url: backendUrl,
      },
    );

    return NextResponse.json(
      {
        source: "next-route-handler",
        message:
          "Could not connect to the profile service.",
      },
      {
        status: 502,
      },
    );
  }
}