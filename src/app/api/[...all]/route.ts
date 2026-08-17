import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const configuredBackendUrl = process.env.BACKEND_API_URL?.trim().replace(
  /\/+$/,
  "",
);

const backendApiUrl = configuredBackendUrl
  ? /\/api\/v1$/i.test(configuredBackendUrl)
    ? configuredBackendUrl
    : `${configuredBackendUrl}/api/v1`
  : null;

const allowedRoutes: Record<string, ReadonlySet<string>> = {
  "users/me": new Set(["GET", "PATCH", "DELETE"]),
  "users/me/sync": new Set(["PUT"]),
  users: new Set(["GET", "POST"]),
  profiles: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  catalog: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  safety: new Set(["GET"]),
  stores: new Set(["GET", "POST", "PATCH", "DELETE"]),
  media: new Set(["GET", "POST", "DELETE"]),
  "menu-items": new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  meetup: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  "saved-locations": new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
};

const nestedRoutePrefixes = new Set([
  "profiles",
  "catalog",
  "safety",
  "stores",
  "media",
  "menu-items",
  "meetup",
  "saved-locations",
]);

interface RouteContext {
  params: Promise<{
    all: string[];
  }>;
}

function resolveRouteRule(all: string[], backendPath: string) {
  const exactRule = allowedRoutes[backendPath];

  if (exactRule) {
    return exactRule;
  }

  const firstSegment = all[0];

  if (nestedRoutePrefixes.has(firstSegment)) {
    return allowedRoutes[firstSegment];
  }

  return undefined;
}

function requiresAuthentication(backendPath: string) {
  if (backendPath === "users/me" || backendPath === "users/me/sync") {
    return true;
  }

  if (backendPath === "profiles" || backendPath.startsWith("profiles/")) {
    return true;
  }

  if (
    backendPath === "saved-locations" ||
    backendPath.startsWith("saved-locations/")
  ) {
    return true;
  }

  // Media upload / delete requires auth
  if (backendPath === "media" || backendPath.startsWith("media/")) {
    return true;
  }

  return false;
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
  const routeRule = resolveRouteRule(all, backendPath);

  if (!routeRule) {
    console.error("[FOODHUB PROXY] Route not allowed:", backendPath);

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

  const safeBackendPath = all
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const targetUrl = new URL(`${backendApiUrl}/${safeBackendPath}`);
  targetUrl.search = request.nextUrl.search;

  const incomingAuthorization = request.headers.get("authorization");
  const accessToken = request.cookies.get("foodhub_access_token")?.value;

  if (
    requiresAuthentication(backendPath) &&
    !incomingAuthorization &&
    !accessToken
  ) {
    console.warn("[FOODHUB PROXY] Authentication required:", {
      path: backendPath,
    });

    return NextResponse.json(
      {
        status: 401,
        errorCode: "UNAUTHORIZED",
        message: "Authentication is required.",
      },
      {
        status: 401,
      },
    );
  }

  const requestHeaders = new Headers();

  requestHeaders.set(
    "Accept",
    request.headers.get("accept") ?? "application/json",
  );

  const contentType = request.headers.get("content-type");

  if (contentType) {
    requestHeaders.set("Content-Type", contentType);
  }

  if (incomingAuthorization) {
    requestHeaders.set("Authorization", incomingAuthorization);
  } else if (accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  const canHaveBody = request.method !== "GET" && request.method !== "HEAD";
  const requestBody = canHaveBody ? await request.arrayBuffer() : undefined;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);

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

    const responseBody =
      request.method === "HEAD" ? null : await backendResponse.arrayBuffer();

    const responseHeaders = new Headers();

    const responseContentType = backendResponse.headers.get("content-type");
    if (responseContentType) {
      responseHeaders.set("Content-Type", responseContentType);
    }

    const location = backendResponse.headers.get("location");
    if (location) {
      responseHeaders.set("Location", location);
    }

    const cacheControl = backendResponse.headers.get("cache-control");
    if (cacheControl) {
      responseHeaders.set("Cache-Control", cacheControl);
    }

    console.log("[FOODHUB PROXY RESPONSE]", {
      method: request.method,
      backendUrl: targetUrl.toString(),
      status: backendResponse.status,
    });

    if (!backendResponse.ok) {
      let errorText = "";

      if (responseBody) {
        try {
          errorText = new TextDecoder().decode(responseBody);
        } catch {
          errorText = "[Unable to decode backend response]";
        }
      }

      console.error("[FOODHUB BACKEND ERROR]", {
        status: backendResponse.status,
        backendUrl: targetUrl.toString(),
        response: errorText,
      });

      // RESILIENT RECOVERY: If backend catalog/menu-items hits broken entity in batch query
      if (backendPath === "catalog/menu-items" && request.method === "GET") {
        console.warn(
          "[FOODHUB PROXY RECOVERY] /catalog/menu-items encountered corrupted backend entity. Recovering valid items page-by-page...",
        );
        try {
          const validItems: unknown[] = [];
          for (let i = 0; i < 15; i++) {
            try {
              const singleUrl = new URL(`${backendApiUrl}/catalog/menu-items`);
              singleUrl.searchParams.set("page", String(i));
              singleUrl.searchParams.set("size", "1");
              const singleRes = await fetch(singleUrl, {
                headers: requestHeaders,
                cache: "no-store",
              });
              if (singleRes.ok) {
                const singleData = await singleRes.json();
                const items = singleData?.payload?.content || [];
                if (items.length > 0) {
                  validItems.push(...items);
                }
              }
            } catch {
              // continue
            }
          }

          if (validItems.length > 0) {
            return NextResponse.json({
              status: 200,
              message: "Menu items recovered successfully",
              payload: {
                content: validItems,
                totalElements: validItems.length,
                totalPages: 1,
                size: validItems.length,
                number: 0,
                first: true,
                last: true,
                empty: false,
              },
            });
          }
        } catch (recoveryErr) {
          console.error("[FOODHUB PROXY RECOVERY FAILED]", recoveryErr);
        }
      }
    }

    const status = backendResponse.status;

    const mustNotHaveBody =
      request.method === "HEAD" ||
      status === 204 ||
      status === 205 ||
      status === 304;

    return new Response(mustNotHaveBody ? null : responseBody, {
      status,
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
export const HEAD = forwardRequest;
