// import { NextRequest, NextResponse } from "next/server";

// import {
//   AUTH_COOKIES,
//   clearAllAuthCookies,
//   clearAuthCookies,
//   clearLoginCookies,
//   getAuthConfig,
//   getKeycloakEndpoints,
//   KeycloakTokenResponse,
//   safeReturnTo,
//   setAuthCookies,
// } from "@/lib/auth/keycloak";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// function createLoginErrorResponse(
//   request: NextRequest,
//   error: string,
//   description: string,
// ) {
//   const loginUrl = new URL("/login", request.url);

//   loginUrl.searchParams.set("error", error);

//   loginUrl.searchParams.set("error_description", description);

//   const response = NextResponse.redirect(loginUrl);

//   clearAllAuthCookies(response);

//   return response;
// }

// export async function GET(request: NextRequest) {
//   try {
//     const config = getAuthConfig();

//     const endpoints = getKeycloakEndpoints();

//     const searchParams = request.nextUrl.searchParams;

//     // ============================================
//     // KEYCLOAK ERROR
//     // ============================================

//     const keycloakError = searchParams.get("error");

//     const keycloakErrorDescription = searchParams.get("error_description");

//     if (keycloakError) {
//       return createLoginErrorResponse(
//         request,
//         keycloakError,
//         keycloakErrorDescription ?? "Authentication failed.",
//       );
//     }

//     // ============================================
//     // CALLBACK VALUES
//     // ============================================

//     const code = searchParams.get("code");

//     const receivedState = searchParams.get("state");

//     const expectedState = request.cookies.get(AUTH_COOKIES.oauthState)?.value;

//     const codeVerifier = request.cookies.get(AUTH_COOKIES.codeVerifier)?.value;

//     const returnTo = safeReturnTo(
//       request.cookies.get(AUTH_COOKIES.returnTo)?.value,
//       "/dashboard",
//     );

//     console.log("[KEYCLOAK CALLBACK]", {
//       hasCode: Boolean(code),

//       hasReceivedState: Boolean(receivedState),

//       hasExpectedState: Boolean(expectedState),

//       stateMatches: Boolean(
//         receivedState && expectedState && receivedState === expectedState,
//       ),

//       hasCodeVerifier: Boolean(codeVerifier),

//       returnTo,
//     });

//     // ============================================
//     // VALIDATION
//     // ============================================

//     if (!code) {
//       return createLoginErrorResponse(
//         request,
//         "missing_code",
//         "Keycloak did not return an authorization code.",
//       );
//     }

//     if (!receivedState || !expectedState || receivedState !== expectedState) {
//       return createLoginErrorResponse(
//         request,
//         "invalid_state",
//         "Authentication state validation failed.",
//       );
//     }

//     if (!codeVerifier) {
//       return createLoginErrorResponse(
//         request,
//         "missing_code_verifier",
//         "PKCE code verifier is missing.",
//       );
//     }

//     // ============================================
//     // EXCHANGE CODE FOR TOKENS
//     // ============================================

//     const redirectUri = `${config.appUrl}/api/auth/callback`;

//     const tokenBody = new URLSearchParams();

//     tokenBody.set("grant_type", "authorization_code");

//     tokenBody.set("client_id", config.clientId);

//     tokenBody.set("client_secret", config.clientSecret);

//     tokenBody.set("code", code);

//     tokenBody.set("redirect_uri", redirectUri);

//     tokenBody.set("code_verifier", codeVerifier);

//     let tokenResponse: Response;

//     try {
//       tokenResponse = await fetch(endpoints.token, {
//         method: "POST",

//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",

//           Accept: "application/json",
//         },

//         body: tokenBody,

//         cache: "no-store",
//       });
//     } catch (error) {
//       console.error("[KEYCLOAK TOKEN CONNECTION ERROR]", error);

//       return createLoginErrorResponse(
//         request,
//         "keycloak_connection_failed",
//         "Could not communicate with Keycloak.",
//       );
//     }

//     if (!tokenResponse.ok) {
//       const errorBody = await tokenResponse.text();

//       console.error("[KEYCLOAK TOKEN ERROR]", {
//         status: tokenResponse.status,

//         statusText: tokenResponse.statusText,

//         response: errorBody,
//       });

//       return createLoginErrorResponse(
//         request,
//         "token_exchange_failed",
//         `Token exchange failed with status ${tokenResponse.status}.`,
//       );
//     }

//     const tokens = (await tokenResponse.json()) as KeycloakTokenResponse;

//     if (!tokens.access_token) {
//       return createLoginErrorResponse(
//         request,
//         "missing_access_token",
//         "Keycloak did not return an access token.",
//       );
//     }

//     // ============================================
//     // LOGIN SUCCESS
//     // ============================================

//     const destination = new URL(returnTo, config.appUrl);

//     const response = NextResponse.redirect(destination);

//     // Remove any old session
//     clearAuthCookies(response);

//     // Save new Keycloak session
//     setAuthCookies(response, tokens);

//     // Remove temporary OAuth cookies
//     clearLoginCookies(response);

//     console.log("[KEYCLOAK LOGIN SUCCESS]", {
//       returnTo,

//       tokenType: tokens.token_type,

//       expiresIn: tokens.expires_in,
//     });

//     return response;
//   } catch (error) {
//     console.error("[KEYCLOAK CALLBACK ERROR]", error);

//     return createLoginErrorResponse(
//       request,
//       "callback_failed",
//       "Authentication callback failed.",
//     );
//   }
// }
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
    // EXCHANGE CODE FOR TOKENS
    // ============================================

    const redirectUri = `${config.appUrl}/api/auth/callback`;

    const tokenBody = new URLSearchParams();

    tokenBody.set("grant_type", "authorization_code");
    tokenBody.set("client_id", config.clientId);
    if (config.clientSecret) {
      tokenBody.set("client_secret", config.clientSecret);
    }
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
