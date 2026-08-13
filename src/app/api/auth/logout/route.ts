import { NextRequest, NextResponse } from "next/server";

import {
  AUTH_COOKIES,
  clearAllAuthCookies,
  getAuthConfig,
  getKeycloakEndpoints,
} from "@/lib/auth/keycloak";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const config = getAuthConfig();
    const endpoints = getKeycloakEndpoints();

    const idToken = request.cookies.get(AUTH_COOKIES.idToken)?.value;

    /*
     * If we have an ID token,
     * logout from Keycloak too.
     */
    if (idToken) {
      const logoutUrl = new URL(endpoints.logout);

      logoutUrl.searchParams.set("client_id", config.clientId);

      logoutUrl.searchParams.set("id_token_hint", idToken);

      /*
       * After Keycloak logout,
       * return to landing page.
       */
      logoutUrl.searchParams.set(
        "post_logout_redirect_uri",
        `${config.appUrl}/`,
      );

      const response = NextResponse.redirect(logoutUrl);

      clearAllAuthCookies(response);

      return response;
    }

    /*
     * No Keycloak ID token.
     * Just clear local cookies
     * and go to landing page.
     */
    const response = NextResponse.redirect(new URL("/", config.appUrl));

    clearAllAuthCookies(response);

    return response;
  } catch (error) {
    console.error("[KEYCLOAK LOGOUT ERROR]", error);

    const response = NextResponse.redirect(new URL("/", request.url));

    clearAllAuthCookies(response);

    return response;
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
