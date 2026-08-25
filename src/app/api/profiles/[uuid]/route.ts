import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    uuid: string;
  }>;
}

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function getBackendApiUrl(): string {
  const configuredBackendUrl =
    process.env.BACKEND_API_URL ||
    "https://api.mhoubahar.store";

  const normalizedUrl = normalizeBaseUrl(configuredBackendUrl);

  /*
   * Supports both:
   *
   * https://food.chanthorndev.site
   *
   * and:
   *
   * https://food.chanthorndev.site/api/v1
   */
  if (/\/api\/v1$/i.test(normalizedUrl)) {
    return normalizedUrl;
  }

  return `${normalizedUrl}/api/v1`;
}

function getAccessToken(request: NextRequest): string | null {
  return request.cookies.get("foodhub_access_token")?.value ?? null;
}

async function getProfileUuid(context: RouteContext): Promise<string | null> {
  const { uuid } = await context.params;

  if (!uuid || uuid === "undefined" || uuid === "null") {
    return null;
  }

  return uuid;
}

async function parseBackendResponse(response: Response): Promise<unknown> {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return {
      message: responseText,
    };
  }
}

async function syncUser(backendApiUrl: string, accessToken: string): Promise<boolean> {
  try {
    const syncUrl = `${backendApiUrl}/users/me/sync`;
    const res = await fetch(syncUrl, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*                                   ERRORS                                   */
/* -------------------------------------------------------------------------- */

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

/* ========================================================================== */
/*                                     GET                                    */
/* ========================================================================== */

/**
 * GET /api/profiles/{uuid}
 */
export async function GET(request: NextRequest, context: RouteContext) {
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

  const backendUrl = `${backendApiUrl}/profiles/${encodeURIComponent(uuid)}`;

  try {
    console.log("[GET PROFILE DETAIL REQUEST]", {
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

    const responseData = await parseBackendResponse(backendResponse);

    console.log("[GET PROFILE DETAIL RESPONSE]", {
      uuid,
      status: backendResponse.status,
    });

    if (!backendResponse.ok) {
      console.error("[GET PROFILE DETAIL ERROR]", {
        uuid,
        url: backendUrl,
        status: backendResponse.status,
        response: responseData,
      });

      if (backendResponse.status === 404) {
        const synced = await syncUser(backendApiUrl, accessToken);
        if (synced) {
          const retryResponse = await fetch(backendUrl, {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
          });
          const retryData = await parseBackendResponse(retryResponse);
          return NextResponse.json(retryData, {
            status: retryResponse.status,
            headers: { "Cache-Control": "no-store" },
          });
        }
      }
    }

    if (backendResponse.status === 204) {
      return new NextResponse(null, {
        status: 204,
      });
    }

    return NextResponse.json(responseData, {
      status: backendResponse.status,

      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[GET PROFILE DETAIL CONNECTION ERROR]", {
      error,
      uuid,
      url: backendUrl,
    });

    return NextResponse.json(
      {
        source: "next-route-handler",

        message: "Could not connect to the profile service.",
      },
      {
        status: 502,
      },
    );
  }
}

/* ========================================================================== */
/*                                    PATCH                                   */
/* ========================================================================== */

/**
 * PATCH /api/profiles/{uuid}
 *
 * Forward to:
 *
 * PATCH /api/v1/profiles/{uuid}
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
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

  const backendUrl = `${backendApiUrl}/profiles/${encodeURIComponent(uuid)}`;

  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json(
      {
        source: "next-route-handler",

        message: "Invalid JSON request body.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    console.log("[PATCH PROFILE REQUEST]", {
      uuid,
      url: backendUrl,
      body: requestBody,
    });

    const backendResponse = await fetch(backendUrl, {
      method: "PATCH",

      headers: {
        Accept: "application/json",

        "Content-Type": "application/json",

        Authorization: `Bearer ${accessToken}`,
      },

      body: JSON.stringify(requestBody),

      cache: "no-store",
    });

    const responseData = await parseBackendResponse(backendResponse);

    console.log("[PATCH PROFILE RESPONSE]", {
      uuid,
      status: backendResponse.status,
    });

    if (!backendResponse.ok) {
      console.error("[PATCH PROFILE BACKEND ERROR]", {
        uuid,
        url: backendUrl,

        status: backendResponse.status,

        request: requestBody,

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

      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[PATCH PROFILE CONNECTION ERROR]", {
      error,
      uuid,
      url: backendUrl,
    });

    return NextResponse.json(
      {
        source: "next-route-handler",

        message: "Could not connect to the profile service.",
      },
      {
        status: 502,
      },
    );
  }
}

/* ========================================================================== */
/*                                    DELETE                                  */
/* ========================================================================== */

/**
 * DELETE /api/profiles/{uuid}
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
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

  const backendUrl = `${backendApiUrl}/profiles/${encodeURIComponent(uuid)}`;

  try {
    console.log("[DELETE PROFILE REQUEST]", {
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

    const responseData = await parseBackendResponse(backendResponse);

    console.log("[DELETE PROFILE RESPONSE]", {
      uuid,
      status: backendResponse.status,
    });

    if (!backendResponse.ok) {
      console.error("[DELETE PROFILE BACKEND ERROR]", {
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

      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[DELETE PROFILE CONNECTION ERROR]", {
      error,
      uuid,
      url: backendUrl,
    });

    return NextResponse.json(
      {
        source: "next-route-handler",

        message: "Could not connect to the profile service.",
      },
      {
        status: 502,
      },
    );
  }
}
