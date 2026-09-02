import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIES,
  refreshKeycloakTokens,
  setAuthCookies,
  type KeycloakTokenResponse,
} from "@/lib/auth/keycloak";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const configuredBackendUrl = (
  process.env.BACKEND_API_URL || "https://api.mhoubahar.store"
)
  .trim()
  .replace(/\/+$/, "");

const backendApiUrl = /\/api\/v1$/i.test(configuredBackendUrl)
  ? configuredBackendUrl
  : `${configuredBackendUrl}/api/v1`;

const allowedRoutes: Record<string, ReadonlySet<string>> = {
  "users/me": new Set(["GET", "PATCH", "DELETE"]),
  "users/me/sync": new Set(["PUT"]),
  users: new Set(["GET", "POST", "PATCH", "PUT", "DELETE"]),
  profiles: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  catalog: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  safety: new Set(["GET"]),
  stores: new Set(["GET", "POST", "PATCH", "DELETE"]),
  media: new Set(["GET", "POST", "DELETE"]),
  banners: new Set(["GET"]),
  "menu-items": new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  meetup: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  friends: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  "saved-locations": new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  search: new Set(["GET"]),
  discovery: new Set(["GET", "POST"]),
  recommendations: new Set(["GET", "POST", "PATCH"]),
  interactions: new Set(["GET", "POST"]),
  notifications: new Set(["GET", "POST", "PATCH", "DELETE"]),
  "notification-preferences": new Set(["GET", "PUT"]),
  "notification-types": new Set(["GET"]),
  "meal-reminder-settings": new Set(["GET", "PUT"]),
  admin: new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]),
};

const nestedRoutePrefixes = new Set([
  "users",
  "profiles",
  "catalog",
  "safety",
  "stores",
  "media",
  "banners",
  "menu-items",
  "meetup",
  "friends",
  "saved-locations",
  "discovery",
  "recommendations",
  "interactions",
  "notifications",
  "notification-preferences",
  "notification-types",
  "meal-reminder-settings",
  "admin",
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

function requiresAuthentication(backendPath: string, method: string) {
  if (backendPath === "users/me" || backendPath === "users/me/sync") {
    return true;
  }

  if (backendPath === "users" || backendPath.startsWith("users/")) {
    return true;
  }

  if (backendPath === "profiles" || backendPath.startsWith("profiles/")) {
    return true;
  }

  if (backendPath === "friends" || backendPath.startsWith("friends/")) {
    return true;
  }

  if (
    backendPath === "interactions" ||
    backendPath.startsWith("interactions/")
  ) {
    return true;
  }

  if (
    backendPath === "saved-locations" ||
    backendPath.startsWith("saved-locations/")
  ) {
    return true;
  }

  if (
    backendPath === "notifications" ||
    backendPath.startsWith("notifications/")
  ) {
    return true;
  }

  if (
    backendPath === "notification-preferences" ||
    backendPath.startsWith("notification-preferences/")
  ) {
    return true;
  }

  if (backendPath === "meetup/groups" && method === "POST") {
    return true;
  }

  if (backendPath === "meetup/groups/me" && method === "GET") {
    return true;
  }

  if (
    backendPath.startsWith("meetup/groups/") &&
    (method === "POST" || method === "PATCH" || method === "DELETE") &&
    !backendPath.startsWith("meetup/groups/share/")
  ) {
    return true;
  }

  // Media upload / delete requires auth, but GET (fetching store logo / photos) is public!
  if (backendPath === "media" || backendPath.startsWith("media/")) {
    return method !== "GET";
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
        message: "FoodHub backend API is not configured.",
      },
      {
        status: 500,
      },
    );
  }

  const { all } = await context.params;

  if (!Array.isArray(all) || all.length === 0) {
    console.error("[FOODHUB PROXY] Empty catch-all route requested.");

    return NextResponse.json(
      {
        message: "No backend path was provided.",
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
  let accessToken = request.cookies.get("foodhub_access_token")?.value;
  const refreshToken = request.cookies.get("foodhub_refresh_token")?.value;
  let refreshedTokens: KeycloakTokenResponse | null = null;

  // 1. Silent Refresh if access token is missing but refresh token exists
  if (!accessToken && refreshToken && requiresAuthentication(backendPath, request.method)) {
    console.log("[FOODHUB PROXY] Access token missing. Attempting silent token refresh...");
    refreshedTokens = await refreshKeycloakTokens(refreshToken);
    if (refreshedTokens?.access_token) {
      accessToken = refreshedTokens.access_token;
      console.log("[FOODHUB PROXY] Silent token refresh succeeded!");
    }
  }

  if (
    requiresAuthentication(backendPath, request.method) &&
    !incomingAuthorization &&
    !accessToken
  ) {
    // Try refreshing once more if we have a refresh token
    if (refreshToken && !refreshedTokens) {
      refreshedTokens = await refreshKeycloakTokens(refreshToken);
      if (refreshedTokens?.access_token) {
        accessToken = refreshedTokens.access_token;
      }
    }

    if (!incomingAuthorization && !accessToken) {
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

  const isAiOrHeavyRoute =
    backendPath.startsWith("recommendations") ||
    backendPath.startsWith("discovery") ||
    backendPath.startsWith("search") ||
    backendPath.includes("/detail") ||
    backendPath.startsWith("catalog");

  const timeoutMs = isAiOrHeavyRoute ? 90_000 : 45_000;

  const canHaveBody = request.method !== "GET" && request.method !== "HEAD";
  const requestBody = canHaveBody ? await request.arrayBuffer() : undefined;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    console.log("[FOODHUB PROXY REQUEST]", {
      method: request.method,
      frontendUrl: request.url,
      backendUrl: targetUrl.toString(),
      path: backendPath,
      hasAuthorization: requestHeaders.has("Authorization"),
    });

    let backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers: requestHeaders,
      body: requestBody && requestBody.byteLength > 0 ? requestBody : undefined,
      cache: "no-store",
      redirect: "manual",
      signal: controller.signal,
    });

    // 2. If 401 received and we have a refresh token, perform silent refresh & retry once
    if (backendResponse.status === 401 && refreshToken && !refreshedTokens) {
      console.log("[FOODHUB PROXY] 401 returned from backend. Attempting silent token refresh & retry...");
      refreshedTokens = await refreshKeycloakTokens(refreshToken);
      if (refreshedTokens?.access_token) {
        accessToken = refreshedTokens.access_token;
        requestHeaders.set("Authorization", `Bearer ${accessToken}`);
        backendResponse = await fetch(targetUrl, {
          method: request.method,
          headers: requestHeaders,
          body: requestBody && requestBody.byteLength > 0 ? requestBody : undefined,
          cache: "no-store",
          redirect: "manual",
        });
      }
    }

    let responseBody =
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

      // RESILIENT RECOVERY: Auto-sync user if user is missing in backend (e.g. fresh Google login)
      const isUserMissingError =
        backendResponse.status === 404 &&
        (requiresAuthentication(backendPath, request.method) ||
          errorText.includes("User not found") ||
          errorText.includes("User"));

      if (isUserMissingError && accessToken) {
        console.log(
          "[FOODHUB PROXY RECOVERY] User not found (404). Attempting automatic user sync...",
        );
        try {
          const syncRes = await fetch(`${backendApiUrl}/users/me/sync`, {
            method: "PUT",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
          });

          if (syncRes.ok || syncRes.status === 409) {
            console.log(
              "[FOODHUB PROXY RECOVERY] User synced successfully! Retrying request:",
              targetUrl.toString(),
            );
            const retryRes = await fetch(targetUrl, {
              method: request.method,
              headers: requestHeaders,
              body:
                requestBody && requestBody.byteLength > 0
                  ? requestBody
                  : undefined,
              cache: "no-store",
            });

            if (retryRes.ok) {
              const retryBody =
                request.method === "HEAD"
                  ? null
                  : await retryRes.arrayBuffer();
              const nextResponse = new NextResponse(retryBody, {
                status: retryRes.status,
                headers: retryRes.headers,
              });
              if (refreshedTokens) {
                setAuthCookies(nextResponse, refreshedTokens);
              }
              return nextResponse;
            }
          }
        } catch (syncErr) {
          console.warn("[FOODHUB PROXY RECOVERY SYNC ERROR]", syncErr);
        }

        // If GET /profiles returns 404 for a newly synced user with no members yet, return empty list
        if (backendPath === "profiles" && request.method === "GET") {
          console.log(
            "[FOODHUB PROXY RECOVERY] Returning empty profile page for new user.",
          );
          const nextResponse = NextResponse.json(
            {
              contents: [],
              totalElements: 0,
              totalPages: 0,
              page: 0,
              size: 20,
            },
            {
              status: 200,
            },
          );
          if (refreshedTokens) {
            setAuthCookies(nextResponse, refreshedTokens);
          }
          return nextResponse;
        }
      }

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

      // RESILIENT RECOVERY: If notifications endpoints fail (e.g. fresh user with no notifications or backend error)
      if (backendPath === "notifications" && request.method === "GET") {
        console.warn(
          "[FOODHUB PROXY RECOVERY] /notifications returned error. Returning empty notification feed fallback.",
        );
        return NextResponse.json({
          data: [],
          meta: {
            page: 0,
            pageSize: 20,
            totalPages: 0,
            limit: 20,
            total: 0,
            unreadCount: 0,
          },
        }, { status: 200 });
      }

      if (backendPath === "notifications/unread-count" && request.method === "GET") {
        console.warn(
          "[FOODHUB PROXY RECOVERY] /notifications/unread-count returned error. Returning count: 0 fallback.",
        );
        return NextResponse.json({ count: 0 }, { status: 200 });
      }

      if (backendPath === "notifications/push-subscriptions" && request.method === "GET") {
        console.warn(
          "[FOODHUB PROXY RECOVERY] /notifications/push-subscriptions returned error. Returning empty subscriptions fallback.",
        );
        return NextResponse.json([], { status: 200 });
      }
    }

    const status = backendResponse.status;

    const mustNotHaveBody =
      request.method === "HEAD" ||
      status === 204 ||
      status === 205 ||
      status === 304;

    const finalResponse = new NextResponse(
      mustNotHaveBody ? null : responseBody,
      {
        status,
        headers: responseHeaders,
      },
    );

    if (refreshedTokens) {
      setAuthCookies(finalResponse, refreshedTokens);
    }

    return finalResponse;
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
