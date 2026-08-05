import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const backendApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

/**
 * Explicitly list backend paths exposed through this proxy.
 * Add new endpoints when the frontend needs them.
 */
const allowedRoutes: Record<string, ReadonlySet<string>> = {
  "auth/register": new Set(["POST"]),
  "auth/login": new Set(["POST"]),
  "auth/logout": new Set(["POST"]),
  "auth/refresh": new Set(["POST"]),

  "users/me": new Set(["GET", "PATCH"]),
  "users/me/sync": new Set(["PUT"]),
  users: new Set(["GET", "POST"]),

  profiles: new Set(["GET", "POST", "DELETE"]),

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
    console.error("[FOODHUB PROXY] BACKEND_API_URL is missing.");

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
   * Support child routes such as:
   * users/{uuid}
   * stores/{uuid}
   */
  const routeRule = allowedRoutes[backendPath] ?? allowedRoutes[all[0]];

  if (!routeRule) {
    return NextResponse.json(
      {
        message: "FoodHub endpoint not found.",
      },
      {
        status: 404,
      },
    );
  }

  if (!routeRule.has(request.method)) {
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

  const safeBackendPath = all.map(encodeURIComponent).join("/");

  const targetUrl = new URL(`${backendApiUrl}/${safeBackendPath}`);

  // Preserve ?page=0&size=10 and other query parameters.
  targetUrl.search = incomingUrl.search;

  const requestHeaders = new Headers({
    Accept: request.headers.get("accept") ?? "application/json",
  });

  const contentType = request.headers.get("content-type");

  if (contentType) {
    requestHeaders.set("Content-Type", contentType);
  }

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
      publicUrl: request.url,
      backendUrl: targetUrl.toString(),
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

    return new Response(responseBody.byteLength > 0 ? responseBody : null, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
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
