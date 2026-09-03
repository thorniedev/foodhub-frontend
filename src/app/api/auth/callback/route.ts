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
export const maxDuration = 30;

// Cache in-flight code exchanges to avoid duplicate browser requests burning the single-use OAuth code
const inFlightExchanges = new Map<
  string,
  Promise<{
    ok: boolean;
    status: number;
    tokens?: KeycloakTokenResponse;
    errorText?: string;
  }>
>();

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

    // ============================================
    // KEYCLOAK ERROR
    // ============================================

    const keycloakError = searchParams.get("error");
    const keycloakErrorDescription = searchParams.get("error_description");

    if (keycloakError) {
      return createLoginErrorResponse(
        request,
        keycloakError,
        keycloakErrorDescription ?? "Authentication failed.",
      );
    }

    // ============================================
    // CALLBACK VALUES
    // ============================================

    const code = searchParams.get("code");
    const receivedState = searchParams.get("state");

    const expectedState = request.cookies.get(AUTH_COOKIES.oauthState)?.value;
    const codeVerifier = request.cookies.get(AUTH_COOKIES.codeVerifier)?.value;

    const returnTo = safeReturnTo(
      request.cookies.get(AUTH_COOKIES.returnTo)?.value,
      "/",
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

    // ============================================
    // VALIDATION
    // ============================================

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

    // ============================================
    // EXCHANGE CODE FOR TOKENS (WITH DEDUPLICATION)
    // ============================================

    const redirectUri = `${config.appUrl}/api/auth/callback`;

    let exchangePromise = inFlightExchanges.get(code);

    if (!exchangePromise) {
      exchangePromise = (async () => {
        const tokenBody = new URLSearchParams();
        tokenBody.set("grant_type", "authorization_code");
        tokenBody.set("client_id", config.clientId);
        if (config.clientSecret) {
          tokenBody.set("client_secret", config.clientSecret);
        }
        tokenBody.set("code", code);
        tokenBody.set("redirect_uri", redirectUri);
        tokenBody.set("code_verifier", codeVerifier);

        try {
          const res = await fetch(endpoints.token, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/json",
            },
            body: tokenBody,
            cache: "no-store",
          });

          if (!res.ok) {
            const errorText = await res.text();
            return { ok: false, status: res.status, errorText };
          }

          const tokens = (await res.json()) as KeycloakTokenResponse;
          return { ok: true, status: 200, tokens };
        } catch (fetchErr) {
          return {
            ok: false,
            status: 500,
            errorText:
              fetchErr instanceof Error ? fetchErr.message : "Connection failed",
          };
        } finally {
          setTimeout(() => inFlightExchanges.delete(code), 30_000);
        }
      })();

      inFlightExchanges.set(code, exchangePromise);
    }

    const exchangeResult = await exchangePromise;

    if (!exchangeResult.ok || !exchangeResult.tokens) {
      console.error("[KEYCLOAK TOKEN ERROR]", {
        status: exchangeResult.status,
        response: exchangeResult.errorText,
      });

      let detail = `Token exchange failed with status ${exchangeResult.status}.`;
      try {
        const parsed = JSON.parse(exchangeResult.errorText || "{}");
        if (parsed.error_description) {
          detail = `${parsed.error_description} (${parsed.error || exchangeResult.status})`;
        } else if (parsed.error) {
          detail = `${parsed.error} (${exchangeResult.status})`;
        }
      } catch {}

      return createLoginErrorResponse(
        request,
        "token_exchange_failed",
        detail,
      );
    }

    const tokens = exchangeResult.tokens;

    if (!tokens.access_token) {
      return createLoginErrorResponse(
        request,
        "missing_access_token",
        "Keycloak did not return an access token.",
      );
    }

    // ============================================
    // SYNC KEYCLOAK USER WITH FOODHUB BACKEND
    // ============================================

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
        "Could not connect to the FoodHub backend.",
      );
    }

    if (!syncResponse.ok) {
      const errorBody = await syncResponse.text();

      // 409 Conflict means the user is already registered/synced in the backend.
      // This is expected for returning users. Treat it as successful and let login proceed.
      if (syncResponse.status === 409) {
        console.log("[USER SYNC CONFLICT - OK]", {
          status: 409,
          message:
            "User already exists in backend (idempotent sync). Proceeding with login.",
          url: syncUrl,
        });
      } else {
        console.error("[USER SYNC ERROR]", {
          status: syncResponse.status,
          statusText: syncResponse.statusText,
          response: errorBody,
          url: syncUrl,
        });

        return createLoginErrorResponse(
          request,
          "user_sync_failed",
          `User synchronization failed with status ${syncResponse.status}.`,
        );
      }
    }

    const syncText = syncResponse.ok ? await syncResponse.text() : "";

    console.log("[USER SYNC PROCESSED]", {
      status: syncResponse.status,
      hasResponseBody: Boolean(syncText),
    });

    // ============================================
    // LOGIN SUCCESS
    // ============================================

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
