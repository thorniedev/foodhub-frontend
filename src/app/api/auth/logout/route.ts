import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  AUTH_COOKIES,
  clearAllAuthCookies,
  getAuthConfig,
  getKeycloakEndpoints,
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

    const idToken =
      request.cookies.get(
        AUTH_COOKIES.idToken,
      )?.value;

    /*
     * If ID token is unavailable,
     * perform local logout.
     */
    if (!idToken) {
      const response =
        NextResponse.redirect(
          new URL(
            "/login",
            config.appUrl,
          ),
        );

      clearAllAuthCookies(
        response,
      );

      return response;
    }

    /*
     * Keycloak RP-Initiated Logout
     */
    const logoutUrl =
      new URL(
        endpoints.logout,
      );

    logoutUrl.searchParams.set(
      "client_id",
      config.clientId,
    );

    logoutUrl.searchParams.set(
      "id_token_hint",
      idToken,
    );

    logoutUrl.searchParams.set(
      "post_logout_redirect_uri",
      `${config.appUrl}/login`,
    );

    const response =
      NextResponse.redirect(
        logoutUrl,
      );

    /*
     * Delete FoodHub cookies immediately.
     */
    clearAllAuthCookies(
      response,
    );

    return response;
  } catch (error) {
    console.error(
      "[KEYCLOAK LOGOUT ERROR]",
      error,
    );

    const response =
      NextResponse.redirect(
        new URL(
          "/login",
          request.url,
        ),
      );

    clearAllAuthCookies(
      response,
    );

    return response;
  }
}

export async function POST(
  request: NextRequest,
) {
  return GET(request);
}