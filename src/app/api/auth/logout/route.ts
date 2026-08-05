import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const keycloakUrl = process.env.KEYCLOAK_URL;
  const realm = process.env.KEYCLOAK_REALM;
  const clientId = process.env.KEYCLOAK_CLIENT_ID;

  const appUrl = process.env.APP_URL ?? request.nextUrl.origin;

  const idToken = request.cookies.get("foodhub_id_token")?.value;

  const postLogoutRedirectUri = `${appUrl}/login?loggedOut=true`;

  let redirectUrl = new URL(postLogoutRedirectUri);

  /*
   * Log out from Keycloak SSO as well as FoodHub.
   */
  if (keycloakUrl && realm && clientId) {
    redirectUrl = new URL(
      `${keycloakUrl.replace(/\/$/, "")}` +
        `/realms/${realm}` +
        `/protocol/openid-connect/logout`,
    );

    redirectUrl.searchParams.set(
      "post_logout_redirect_uri",
      postLogoutRedirectUri,
    );

    redirectUrl.searchParams.set("client_id", clientId);

    /*
     * Supplying id_token_hint allows Keycloak
     * to identify the current login session.
     */
    if (idToken) {
      redirectUrl.searchParams.set("id_token_hint", idToken);
    }
  }

  const response = NextResponse.redirect(redirectUrl);

  const expiredCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };

  response.cookies.set("foodhub_access_token", "", expiredCookieOptions);

  response.cookies.set("foodhub_refresh_token", "", expiredCookieOptions);

  response.cookies.set("foodhub_id_token", "", expiredCookieOptions);

  response.cookies.set("foodhub_oauth_state", "", expiredCookieOptions);

  response.cookies.set("foodhub_code_verifier", "", expiredCookieOptions);

  response.cookies.set("foodhub_return_to", "", expiredCookieOptions);

  return response;
}
