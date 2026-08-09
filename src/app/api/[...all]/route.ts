import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * Your env may be:
 *
 * NEXT_PUBLIC_API_BASE_URL=https://food.chanthorndev.site
 *
 * or:
 *
 * NEXT_PUBLIC_API_BASE_URL=https://food.chanthorndev.site/api/v1
 *
 * This handles both.
 */
const configuredBackendUrl = process.env.BACKEND_API_URL?.replace(/\/+$/, "");

const backendApiUrl = configuredBackendUrl
  ? /\/api\/v1$/i.test(configuredBackendUrl)
    ? configuredBackendUrl
    : `${configuredBackendUrl}/api/v1`
  : null;

/**
 * Backend paths that the Next.js proxy allows.
 *
 * Child routes automatically use the first path segment.
 *
 * Examples:
 *
 * /api/safety/allergens
 * -> safety
 *
 * /api/profiles/{uuid}/safety/allergies
 * -> profiles
 */
const allowedRoutes: Record<string, ReadonlySet<string>> = {
  "auth/register": new Set(["POST"]),
  "auth/login": new Set(["POST"]),
  "auth/logout": new Set(["POST"]),
  "auth/refresh": new Set(["POST"]),

  "users/me": new Set(["GET", "PATCH", "DELETE"]),

  "users/me/sync": new Set(["PUT"]),

  users: new Set(["GET", "POST"]),
  media: new Set(["GET"]),
  /*
   * We need all of these because profile child routes include:
   *
   * GET    /profiles/{uuid}
   * PATCH  /profiles/{uuid}
   * DELETE /profiles/{uuid}
   *
   * PUT /profiles/{uuid}/safety/allergies
   * PUT /profiles/{uuid}/safety/dietary-types
   * PUT /profiles/{uuid}/safety/medical-conditions
   * PUT /profiles/{uuid}/safety/ingredient-avoids
   */
  profiles: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  catalog: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  /*
   * Safety option endpoints:
   *
   * GET /safety/allergens
   * GET /safety/dietary-types
   * GET /safety/medical-conditions
   */
  safety: new Set(["GET"]),

  stores: new Set(["GET"]),

  "menu-items": new Set(["GET", "POST"]),
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
    console.error("[FOODHUB PROXY] NEXT_PUBLIC_API_BASE_URL is missing.");

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

  /*
   * First check exact route.
   *
   * Example:
   * users/me/sync
   *
   * Then use first segment for child routes.
   *
   * Example:
   * profiles/{uuid}/safety/allergies
   * uses "profiles"
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

  /*
   * Encode every individual path segment.
   */
  const safeBackendPath = all
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const targetUrl = new URL(`${backendApiUrl}/${safeBackendPath}`);

  /*
   * Preserve:
   *
   * ?page=0&size=100
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

  /*
   * First accept Authorization directly.
   *
   * Otherwise use the token stored by FoodHub login.
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

    /*
     * Helpful log when backend rejects the request.
     */
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
