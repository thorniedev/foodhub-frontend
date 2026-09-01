import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  AUTH_COOKIES,
  createCodeChallenge,
  createCodeVerifier,
  createOAuthState,
  getAuthConfig,
  getLoginCookieOptions,
  getKeycloakEndpoints,
  safeReturnTo,
} from "@/lib/auth/keycloak";

export const runtime = "nodejs";

export const dynamic =
  "force-dynamic";

export async function GET(
  request: NextRequest,
) {
  try {
    const config =
      getAuthConfig();

    const endpoints =
      getKeycloakEndpoints();

    const returnTo =
      safeReturnTo(
        request.nextUrl.searchParams.get(
          "returnTo",
        ),
      );

    const state =
      createOAuthState();

    const codeVerifier =
      createCodeVerifier();

    const codeChallenge =
      createCodeChallenge(
        codeVerifier,
      );

    const redirectUri =
      `${config.appUrl}/api/auth/callback`;

    const authorizationUrl =
      new URL(
        endpoints.authorization,
      );

    authorizationUrl.searchParams.set(
      "client_id",
      config.clientId,
    );

    authorizationUrl.searchParams.set(
      "response_type",
      "code",
    );

    authorizationUrl.searchParams.set(
      "redirect_uri",
      redirectUri,
    );

    authorizationUrl.searchParams.set(
      "scope",
      "openid profile email",
    );

    authorizationUrl.searchParams.set(
      "state",
      state,
    );

    authorizationUrl.searchParams.set(
      "code_challenge",
      codeChallenge,
    );

    authorizationUrl.searchParams.set(
      "code_challenge_method",
      "S256",
    );

    const kcIdpHint = request.nextUrl.searchParams.get("kc_idp_hint");
    if (kcIdpHint) {
      authorizationUrl.searchParams.set("kc_idp_hint", kcIdpHint);
    }

    const response = NextResponse.redirect(authorizationUrl);
    // Use login-specific cookie options: no domain scoping, so the cookie
    // is tied to the exact host (mhoubahar.store). Keycloak redirects back
    // to the same host via a top-level GET, so SameSite=lax works correctly.
    const cookieOptions = getLoginCookieOptions();

    response.cookies.set(AUTH_COOKIES.oauthState, state, {
      ...cookieOptions,
      maxAge: 60 * 30, // 30 minutes
    });

    response.cookies.set(AUTH_COOKIES.codeVerifier, codeVerifier, {
      ...cookieOptions,
      maxAge: 60 * 30, // 30 minutes
    });

    response.cookies.set(AUTH_COOKIES.returnTo, returnTo, {
      ...cookieOptions,
      maxAge: 60 * 30, // 30 minutes
    });

    console.log(
      "[KEYCLOAK LOGIN START]",
      {
        returnTo,
        redirectUri,
      },
    );

    return response;
  } catch (error) {
    console.error(
      "[KEYCLOAK LOGIN ERROR]",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Could not start authentication.",
      },
      {
        status: 500,
      },
    );
  }
}