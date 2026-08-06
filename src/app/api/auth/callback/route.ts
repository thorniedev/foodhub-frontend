import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface KeycloakTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
  refresh_expires_in?: number;
  token_type: string;
  scope?: string;
}

interface KeycloakErrorResponse {
  error?: string;
  error_description?: string;
}

function redirectToLogin(
  request: NextRequest,
  error: string,
  description?: string,
) {
  const loginUrl = new URL("/login", request.url);

  loginUrl.searchParams.set("error", error);

  if (description) {
    loginUrl.searchParams.set("error_description", description);
  }

  const response = NextResponse.redirect(loginUrl);

  // Remove temporary OAuth cookies to prevent stale login state.
  response.cookies.delete("foodhub_oauth_state");
  response.cookies.delete("foodhub_code_verifier");
  response.cookies.delete("foodhub_return_to");

  return response;
}

function isSafeReturnPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//");
}

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

export async function GET(request: NextRequest) {
  /*
   * Server-side variables are preferred.
   * NEXT_PUBLIC variables are only used as fallback
   * for non-secret Keycloak configuration.
   */
  const keycloakUrl =
    process.env.KEYCLOAK_URL ?? process.env.NEXT_PUBLIC_KEYCLOAK_URL;

  const realm =
    process.env.KEYCLOAK_REALM ?? process.env.NEXT_PUBLIC_KEYCLOAK_REALM;

  const clientId =
    process.env.KEYCLOAK_CLIENT_ID ??
    process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;

  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
  const backendApiUrl = process.env.BACKEND_API_URL;
  const appUrl = process.env.APP_URL ?? request.nextUrl.origin;

  if (!keycloakUrl || !realm || !clientId || !clientSecret || !backendApiUrl) {
    console.error("Missing callback configuration:", {
      hasKeycloakUrl: Boolean(keycloakUrl),
      hasRealm: Boolean(realm),
      hasClientId: Boolean(clientId),
      hasClientSecret: Boolean(clientSecret),
      hasBackendApiUrl: Boolean(backendApiUrl),
      appUrl,
    });

    return redirectToLogin(
      request,
      "server_configuration_error",
      "The authentication server configuration is incomplete.",
    );
  }

  /*
   * Handle an authorization error returned directly by Keycloak.
   */
  const authorizationError = request.nextUrl.searchParams.get("error");

  if (authorizationError) {
    const authorizationErrorDescription =
      request.nextUrl.searchParams.get("error_description");

    console.error("KEYCLOAK AUTHORIZATION ERROR:", {
      error: authorizationError,
      description: authorizationErrorDescription,
    });

    return redirectToLogin(
      request,
      authorizationError,
      authorizationErrorDescription ?? undefined,
    );
  }

  const code = request.nextUrl.searchParams.get("code");
  const receivedState = request.nextUrl.searchParams.get("state");

  /*
   * These names must match the cookies created
   * by /api/auth/login.
   */
  const expectedState = request.cookies.get("foodhub_oauth_state")?.value;

  const codeVerifier = request.cookies.get("foodhub_code_verifier")?.value;

  const storedReturnTo =
    request.cookies.get("foodhub_return_to")?.value ?? "/dashboard";

  console.log("KEYCLOAK CALLBACK:", {
    hasCode: Boolean(code),
    hasReceivedState: Boolean(receivedState),
    hasExpectedState: Boolean(expectedState),
    stateMatches: Boolean(receivedState) && receivedState === expectedState,
    hasCodeVerifier: Boolean(codeVerifier),
    returnTo: storedReturnTo,
  });

  if (!code) {
    return redirectToLogin(
      request,
      "missing_authorization_code",
      "Keycloak did not return an authorization code.",
    );
  }

  if (!receivedState || !expectedState) {
    return redirectToLogin(
      request,
      "missing_oauth_state",
      "The login state cookie is missing or expired.",
    );
  }

  if (receivedState !== expectedState) {
    return redirectToLogin(
      request,
      "invalid_oauth_state",
      "The login state does not match.",
    );
  }

  if (!codeVerifier) {
    return redirectToLogin(
      request,
      "missing_code_verifier",
      "The PKCE verifier cookie is missing or expired.",
    );
  }

  const normalizedKeycloakUrl = normalizeBaseUrl(keycloakUrl);

  const normalizedBackendApiUrl = normalizeBaseUrl(backendApiUrl);

  const normalizedAppUrl = normalizeBaseUrl(appUrl);

  const redirectUri = `${normalizedAppUrl}/api/auth/callback`;

  const tokenEndpoint =
    `${normalizedKeycloakUrl}` +
    `/realms/${encodeURIComponent(realm)}` +
    `/protocol/openid-connect/token`;

  const tokenRequestBody = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  /*
   * Exchange the authorization code for Keycloak tokens.
   */
  let tokenResponse: Response;

  try {
    tokenResponse = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenRequestBody,
      cache: "no-store",
    });
  } catch (error) {
    console.error("KEYCLOAK TOKEN CONNECTION ERROR:", {
      error,
      tokenEndpoint,
    });

    return redirectToLogin(
      request,
      "keycloak_connection_failed",
      "Could not connect to the Keycloak server.",
    );
  }

  const tokenResponseText = await tokenResponse.text();

  if (!tokenResponse.ok) {
    let keycloakError: KeycloakErrorResponse = {};

    try {
      keycloakError = JSON.parse(tokenResponseText) as KeycloakErrorResponse;
    } catch {
      // The raw response is only printed in the server terminal.
    }

    console.error("KEYCLOAK TOKEN ERROR:", {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      error: keycloakError.error,
      description: keycloakError.error_description,
      response: tokenResponseText,
      redirectUri,
      tokenEndpoint,
    });

    return redirectToLogin(
      request,
      keycloakError.error ?? "token_exchange_failed",
      keycloakError.error_description ??
        "Keycloak could not exchange the authorization code.",
    );
  }

  let tokens: KeycloakTokenResponse;

  try {
    tokens = JSON.parse(tokenResponseText) as KeycloakTokenResponse;
  } catch {
    console.error("INVALID KEYCLOAK TOKEN RESPONSE:", tokenResponseText);

    return redirectToLogin(
      request,
      "invalid_token_response",
      "Keycloak returned an invalid token response.",
    );
  }

  if (!tokens.access_token) {
    return redirectToLogin(
      request,
      "missing_access_token",
      "Keycloak did not return an access token.",
    );
  }

  /*
   * Synchronize the authenticated Keycloak user
   * with the FoodHub backend.
   */
  const userSyncUrl = `${normalizedBackendApiUrl}/users/me/sync`;

  try {
    console.log("USER SYNC REQUEST:", {
      url: userSyncUrl,
    });

    const syncResponse = await fetch(userSyncUrl, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${tokens.access_token}`,
      },
      cache: "no-store",
    });

    const syncResponseBody = await syncResponse.text();

    if (!syncResponse.ok) {
      console.error("USER SYNC ERROR:", {
        status: syncResponse.status,
        statusText: syncResponse.statusText,
        response: syncResponseBody,
        url: userSyncUrl,
      });

      return redirectToLogin(
        request,
        "user_sync_failed",
        `Login succeeded, but user synchronization failed with status ${syncResponse.status}.`,
      );
    }

    console.log("USER SYNC SUCCESS:", {
      status: syncResponse.status,
      response: syncResponseBody || "No response body",
    });
  } catch (error) {
    console.error("USER SYNC CONNECTION ERROR:", {
      error,
      url: userSyncUrl,
    });

    return redirectToLogin(
      request,
      "user_sync_connection_failed",
      "Could not connect to the FoodHub backend.",
    );
  }

  /*
   * Validate the return path to prevent external redirects.
   */
  const safeReturnTo = isSafeReturnPath(storedReturnTo)
    ? storedReturnTo
    : "/dashboard";

  const response = NextResponse.redirect(new URL(safeReturnTo, request.url));

  const sessionCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  /*
   * Save the Keycloak tokens in HTTP-only cookies.
   */
  response.cookies.set("foodhub_access_token", tokens.access_token, {
    ...sessionCookieOptions,
    maxAge: tokens.expires_in,
  });

  if (tokens.refresh_token) {
    response.cookies.set("foodhub_refresh_token", tokens.refresh_token, {
      ...sessionCookieOptions,
      maxAge: tokens.refresh_expires_in ?? 30 * 60,
    });
  }

  if (tokens.id_token) {
    response.cookies.set("foodhub_id_token", tokens.id_token, {
      ...sessionCookieOptions,
      maxAge: tokens.expires_in,
    });
  }

  /*
   * Remove temporary OAuth cookies.
   */
  response.cookies.delete("foodhub_oauth_state");
  response.cookies.delete("foodhub_code_verifier");
  response.cookies.delete("foodhub_return_to");

  console.log("KEYCLOAK LOGIN SUCCESS:", {
    returnTo: safeReturnTo,
    tokenType: tokens.token_type,
    expiresIn: tokens.expires_in,
  });

  return response;
}
