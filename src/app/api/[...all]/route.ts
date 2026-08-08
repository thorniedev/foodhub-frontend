import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

/**
 * Local development:
 *
 * BACKEND_API_URL=http://localhost:7070
 *
 * Production/deployed backend:
 *
 * BACKEND_API_URL=https://food.chanthorndev.site
 *
 * You can also continue using NEXT_PUBLIC_API_BASE_URL.
 */
const configuredBackendUrl = (
  process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL
)?.replace(/\/+$/, "");

const backendApiUrl = configuredBackendUrl
  ? /\/api\/v1$/i.test(configuredBackendUrl)
    ? configuredBackendUrl
    : `${configuredBackendUrl}/api/v1`
  : null;

/**
 * Backend routes that may pass through the Next.js proxy.
 *
 * Example:
 *
 * browser:
 * /api/meetup/groups
 *
 * Next proxy:
 * http://localhost:7070/api/v1/meetup/groups
 */
const allowedRoutes: Record<string, ReadonlySet<string>> = {
  "auth/register": new Set(["POST"]),

  "auth/login": new Set(["POST"]),

  "auth/logout": new Set(["POST"]),

  "auth/refresh": new Set(["POST"]),

  "users/me": new Set(["GET", "PATCH", "DELETE"]),

  "users/me/sync": new Set(["PUT"]),

  users: new Set(["GET", "POST"]),

  profiles: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),

  safety: new Set(["GET"]),

  stores: new Set(["GET", "POST"]),

  "menu-items": new Set(["GET", "PATCH", "DELETE"]),

  /**
   * Meetup routes currently required:
   *
   * POST  /meetup/groups
   * GET   /meetup/groups/share/{shareToken}
   * PATCH /meetup/groups/{meetupUuid}
   * POST  /meetup/groups/{meetupUuid}/cancel
   * POST  /meetup/groups/{meetupUuid}/meeting-point
   * POST  /meetup/groups/{meetupUuid}/recommendations
   * POST  /meetup/groups/{meetupUuid}/finish-voting
   *
   * PATCH /meetup/participants/{participantUuid}/location
   * POST  /meetup/participants/{participantUuid}/leave
   *
   * POST  /meetup/votes
   * GET   /meetup/votes/meetup/{meetupUuid}
   */
  meetup: new Set(["GET", "POST", "PATCH", "DELETE"]),
};

interface RouteContext {
  params: Promise<{
    all: string[];
  }>;
}

async function forwardRequest(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  if (!backendApiUrl) {
    console.error("[FOODHUB PROXY] Backend API URL is missing.");

    return NextResponse.json(
      {
        message: "Backend API URL is not configured.",
      },
      {
        status: 500,
      },
    );
  }

  const { all } = await context.params;

  if (!all?.length) {
    return NextResponse.json(
      {
        message: "API endpoint is required.",
      },
      {
        status: 400,
      },
    );
  }

  const backendPath = all.join("/");

  /**
   * Try an exact match first.
   *
   * Otherwise use first segment.
   *
   * Example:
   *
   * meetup/groups/abc/cancel
   *
   * resolves to:
   *
   * meetup
   */
  const routeRule = allowedRoutes[backendPath] ?? allowedRoutes[all[0]];

  if (!routeRule) {
    console.error("[FOODHUB PROXY] Route is not allowed:", backendPath);

    return NextResponse.json(
      {
        message: "FoodHub endpoint not found.",

        path: backendPath,
      },
      {
        status: 404,
      },
    );
  }

  if (!routeRule.has(request.method)) {
    console.error("[FOODHUB PROXY] Method not allowed:", {
      method: request.method,

      path: backendPath,
    });

    return NextResponse.json(
      {
        message: `${request.method} is not allowed for this endpoint.`,
      },
      {
        status: 405,

        headers: {
          Allow: [...routeRule].join(", "),
        },
      },
    );
  }

  const incomingUrl = new URL(request.url);

  /**
   * Encode every path segment independently.
   */
  const safeBackendPath = all
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const targetUrl = new URL(`${backendApiUrl}/${safeBackendPath}`);

  /**
   * Preserve query params.
   */
  targetUrl.search = incomingUrl.search;

  const requestHeaders = new Headers();

  requestHeaders.set(
    "Accept",
    request.headers.get("accept") ?? "application/json",
  );

  const contentType = request.headers.get("content-type");

  if (contentType) {
    requestHeaders.set("Content-Type", contentType);
  }

  /**
   * Forward bearer token.
   *
   * First use Authorization supplied directly.
   *
   * Otherwise use FoodHub login cookie.
   */
  const incomingAuthorization = request.headers.get("authorization");

  const accessToken = request.cookies.get("foodhub_access_token")?.value;

  if (incomingAuthorization) {
    requestHeaders.set("Authorization", incomingAuthorization);
  } else if (accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  const canHaveBody = request.method !== "GET" && request.method !== "HEAD";

  const requestBody = canHaveBody ? await request.arrayBuffer() : undefined;

  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 15_000);

  try {
    console.log("[FOODHUB PROXY REQUEST]", {
      method: request.method,

      frontendUrl: request.url,

      backendUrl: targetUrl.toString(),

      path: backendPath,

      hasAuthorization: requestHeaders.has("Authorization"),
    });

    const backendResponse = await fetch(targetUrl, {
      method: request.method,

      headers: requestHeaders,

      body: requestBody && requestBody.byteLength > 0 ? requestBody : undefined,

      cache: "no-store",

      redirect: "manual",

      signal: controller.signal,
    });

    const responseBody = await backendResponse.arrayBuffer();

    const responseHeaders = new Headers();

    const responseContentType = backendResponse.headers.get("content-type");

    if (responseContentType) {
      responseHeaders.set("Content-Type", responseContentType);
    }

    const location = backendResponse.headers.get("location");

    if (location) {
      responseHeaders.set("Location", location);
    }

    console.log("[FOODHUB PROXY RESPONSE]", {
      method: request.method,

      backendUrl: targetUrl.toString(),

      status: backendResponse.status,
    });

    if (!backendResponse.ok) {
      try {
        const errorText = new TextDecoder().decode(responseBody);

        console.error("[FOODHUB BACKEND ERROR]", {
          status: backendResponse.status,

          backendUrl: targetUrl.toString(),

          response: errorText,
        });
      } catch {
        console.error("[FOODHUB BACKEND ERROR]", {
          status: backendResponse.status,

          backendUrl: targetUrl.toString(),
        });
      }
    }

    return new Response(responseBody.byteLength > 0 ? responseBody : null, {
      status: backendResponse.status,

      headers: responseHeaders,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[FOODHUB PROXY TIMEOUT]", targetUrl.toString());

      return NextResponse.json(
        {
          message: "The backend request timed out.",
        },
        {
          status: 504,
        },
      );
    }

    console.error(
      `[FOODHUB PROXY ERROR] ${request.method} ${targetUrl}`,
      error,
    );

    return NextResponse.json(
      {
        message: "Could not connect to FoodHub backend.",
      },
      {
        status: 502,
      },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export const GET = forwardRequest;

export const POST = forwardRequest;

export const PUT = forwardRequest;

export const PATCH = forwardRequest;

export const DELETE = forwardRequest;
