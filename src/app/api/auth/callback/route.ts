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

  return NextResponse.redirect(loginUrl);
}

function isSafeReturnPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//");
}

export async function GET(request: NextRequest) {
  const keycloakUrl = process.env.KEYCLOAK_URL;
  const realm = process.env.KEYCLOAK_REALM;
  const clientId = process.env.KEYCLOAK_CLIENT_ID;
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

  const appUrl = process.env.APP_URL ?? request.nextUrl.origin;

  if (!keycloakUrl || !realm || !clientId || !clientSecret) {
    console.error("Missing callback configuration:", {
      hasKeycloakUrl: Boolean(keycloakUrl),
      hasRealm: Boolean(realm),
      hasClientId: Boolean(clientId),
      hasClientSecret: Boolean(clientSecret),
    });

    return redirectToLogin(
      request,
      "server_configuration_error",
      "The Keycloak callback configuration is incomplete.",
    );
  }

  /*
   * Handle errors sent directly from Keycloak.
   */
  const authorizationError = request.nextUrl.searchParams.get("error");

  if (authorizationError) {
    const authorizationErrorDescription =
      request.nextUrl.searchParams.get("error_description");

    console.error("Keycloak authorization error:", {
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
   * inside /api/auth/login.
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

  const normalizedKeycloakUrl = keycloakUrl.replace(/\/$/, "");

  const redirectUri = `${appUrl}/api/auth/callback`;

  const tokenEndpoint =
    `${normalizedKeycloakUrl}` +
    `/realms/${realm}` +
    `/protocol/openid-connect/token`;

  const tokenRequestBody = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  let tokenResponse: Response;

  try {
    tokenResponse = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenRequestBody,
      cache: "no-store",
    });
  } catch (error) {
    console.error("Could not connect to Keycloak token endpoint:", error);

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
      // Keep the original response as a terminal log only.
    }

    console.error("KEYCLOAK TOKEN ERROR:", {
      status: tokenResponse.status,
      error: keycloakError.error,
      description: keycloakError.error_description,
      response: tokenResponseText,
      redirectUri,
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
    console.error("Invalid token response:", tokenResponseText);

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
  const backendApiUrl =
    process.env.BACKEND_API_URL ?? "http://localhost:7070/api/v1";

  try {
    const syncResponse = await fetch(`${backendApiUrl}/users/me/sync`, {
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
        response: syncResponseBody,
      });

      return redirectToLogin(
        request,
        "user_sync_failed",
        "Login succeeded, but the user could not be synchronized.",
      );
    }

    console.log("USER SYNC SUCCESS:", {
      status: syncResponse.status,
      response: syncResponseBody,
    });
  } catch (error) {
    console.error("USER SYNC CONNECTION ERROR:", error);

    return redirectToLogin(
      request,
      "user_sync_connection_failed",
      "Could not connect to the FoodHub backend.",
    );
  }

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
