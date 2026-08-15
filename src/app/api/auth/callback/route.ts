import { NextRequest, NextResponse } from "next/server";

import {
  AUTH_COOKIES,
  clearAllAuthCookies,
  clearAuthCookies,
  clearLoginCookies,
  getAuthConfig,
  getKeycloakEndpoints,
  KeycloakTokenResponse,
  safeReturnTo,
  setAuthCookies,
} from "@/lib/auth/keycloak";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function createLoginErrorResponse(
  request: NextRequest,
  error: string,
  description: string,
) {
  const loginUrl = new URL("/login", request.url);

  loginUrl.searchParams.set("error", error);
  loginUrl.searchParams.set("error_description", description);

  const response = NextResponse.redirect(loginUrl);

  clearAllAuthCookies(response);

  return response;
}

export async function GET(request: NextRequest) {
  try {
    const config = getAuthConfig();
    const endpoints = getKeycloakEndpoints();
    const searchParams = request.nextUrl.searchParams;

    const keycloakError = searchParams.get("error");
    const keycloakErrorDescription = searchParams.get("error_description");

    if (keycloakError) {
      return createLoginErrorResponse(
        request,
        keycloakError,
        keycloakErrorDescription ?? "Authentication failed.",
      );
    }

    const code = searchParams.get("code");
    const receivedState = searchParams.get("state");

    const expectedState = request.cookies.get(AUTH_COOKIES.oauthState)?.value;
    const codeVerifier = request.cookies.get(AUTH_COOKIES.codeVerifier)?.value;

    const returnTo = safeReturnTo(
      request.cookies.get(AUTH_COOKIES.returnTo)?.value,
      "/dashboard",
    );

    console.log("[KEYCLOAK CALLBACK]", {
      hasCode: Boolean(code),
      hasReceivedState: Boolean(receivedState),
      hasExpectedState: Boolean(expectedState),
      stateMatches: Boolean(
        receivedState && expectedState && receivedState === expectedState,
      ),
      hasCodeVerifier: Boolean(codeVerifier),
      returnTo,
    });

    if (!code) {
      return createLoginErrorResponse(
        request,
        "missing_code",
        "Keycloak did not return an authorization code.",
      );
    }

    if (!receivedState || !expectedState || receivedState !== expectedState) {
      return createLoginErrorResponse(
        request,
        "invalid_state",
        "Authentication state validation failed.",
      );
    }

    if (!codeVerifier) {
      return createLoginErrorResponse(
        request,
        "missing_code_verifier",
        "PKCE code verifier is missing.",
      );
    }

    const redirectUri = `${config.appUrl}/api/auth/callback`;

    const tokenBody = new URLSearchParams();

    tokenBody.set("grant_type", "authorization_code");
    tokenBody.set("client_id", config.clientId);
    tokenBody.set("client_secret", config.clientSecret);
    tokenBody.set("code", code);
    tokenBody.set("redirect_uri", redirectUri);
    tokenBody.set("code_verifier", codeVerifier);

    let tokenResponse: Response;

    try {
      tokenResponse = await fetch(endpoints.token, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: tokenBody,
        cache: "no-store",
      });
    } catch (error) {
      console.error("[KEYCLOAK TOKEN CONNECTION ERROR]", error);

      return createLoginErrorResponse(
        request,
        "keycloak_connection_failed",
        "Could not communicate with Keycloak.",
      );
    }

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();

      console.error("[KEYCLOAK TOKEN ERROR]", {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        response: errorBody,
      });

      return createLoginErrorResponse(
        request,
        "token_exchange_failed",
        `Token exchange failed with status ${tokenResponse.status}.`,
      );
    }

    const tokens = (await tokenResponse.json()) as KeycloakTokenResponse;

    if (!tokens.access_token) {
      return createLoginErrorResponse(
        request,
        "missing_access_token",
        "Keycloak did not return an access token.",
      );
    }

    const syncUrl = `${config.backendApiUrl}/users/me/sync`;

    console.log("[USER SYNC REQUEST]", {
      url: syncUrl,
    });

    let syncResponse: Response;

    try {
      syncResponse = await fetch(syncUrl, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${tokens.access_token}`,
        },
        cache: "no-store",
      });
    } catch (error) {
      console.error("[USER SYNC CONNECTION ERROR]", {
        error,
        url: syncUrl,
      });

      return createLoginErrorResponse(
        request,
        "user_sync_connection_failed",
        "Login succeeded, but FoodHub could not create your local user account.",
      );
    }

    const syncText = await syncResponse.text();

    // Synchronization must succeed before the user enters the dashboard.
    if (!syncResponse.ok) {
      console.error("[USER SYNC ERROR]", {
        status: syncResponse.status,
        statusText: syncResponse.statusText,
        response: syncText,
        url: syncUrl,
      });

      return createLoginErrorResponse(
        request,
        "user_sync_failed",
        `Login succeeded, but FoodHub user synchronization failed with status ${syncResponse.status}.`,
      );
    }

    console.log("[USER SYNC SUCCESS]", {
      status: syncResponse.status,
      hasResponseBody: Boolean(syncText),
    });

    // Verify immediately that the local FoodHub user can be resolved.
    const currentUserUrl = `${config.backendApiUrl}/users/me`;

    let currentUserResponse: Response;

    try {
      currentUserResponse = await fetch(currentUserUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${tokens.access_token}`,
        },
        cache: "no-store",
      });
    } catch (error) {
      console.error("[CURRENT USER VERIFY CONNECTION ERROR]", {
        error,
        url: currentUserUrl,
      });

      return createLoginErrorResponse(
        request,
        "user_verification_failed",
        "FoodHub synchronized your login but could not verify your local account.",
      );
    }

    if (!currentUserResponse.ok) {
      const currentUserText = await currentUserResponse.text();

      console.error("[CURRENT USER VERIFY ERROR]", {
        status: currentUserResponse.status,
        statusText: currentUserResponse.statusText,
        response: currentUserText,
        url: currentUserUrl,
      });

      return createLoginErrorResponse(
        request,
        "user_verification_failed",
        `FoodHub could not verify your synchronized user account. Status ${currentUserResponse.status}.`,
      );
    }

    console.log("[CURRENT USER VERIFY SUCCESS]", {
      status: currentUserResponse.status,
    });

    const destination = new URL(returnTo, config.appUrl);
    const response = NextResponse.redirect(destination);

    clearAuthCookies(response);
    setAuthCookies(response, tokens);
    clearLoginCookies(response);

    console.log("[KEYCLOAK LOGIN SUCCESS]", {
      returnTo,
      tokenType: tokens.token_type,
      expiresIn: tokens.expires_in,
    });

    return response;
  } catch (error) {
    console.error("[KEYCLOAK CALLBACK ERROR]", error);

    return createLoginErrorResponse(
      request,
      "callback_failed",
      "Authentication callback failed.",
    );
  }
}
