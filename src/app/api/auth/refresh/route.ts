import { NextRequest, NextResponse } from "next/server";

import {
  AUTH_COOKIES,
  clearAuthCookies,
  getAuthConfig,
  getKeycloakEndpoints,
  KeycloakTokenResponse,
  setAuthCookies,
} from "@/lib/auth/keycloak";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get(AUTH_COOKIES.refreshToken)?.value;

    if (!refreshToken) {
      const response = NextResponse.json(
        {
          authenticated: false,

          message: "Refresh token is missing.",
        },
        {
          status: 401,
        },
      );

      clearAuthCookies(response);

      return response;
    }

    const config = getAuthConfig();

    const endpoints = getKeycloakEndpoints();

    const body = new URLSearchParams();

    body.set("grant_type", "refresh_token");

    body.set("client_id", config.clientId);

    body.set("client_secret", config.clientSecret);

    body.set("refresh_token", refreshToken);

    let tokenResponse: Response;

    try {
      tokenResponse = await fetch(endpoints.token, {
        method: "POST",

        headers: {
          "Content-Type": "application/x-www-form-urlencoded",

          Accept: "application/json",
        },

        body,

        cache: "no-store",
      });
    } catch (error) {
      console.error("[KEYCLOAK REFRESH CONNECTION ERROR]", error);

      return NextResponse.json(
        {
          message: "Could not communicate with authentication server.",
        },
        {
          status: 502,
        },
      );
    }

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();

      console.error("[KEYCLOAK REFRESH ERROR]", {
        status: tokenResponse.status,

        response: errorBody,
      });

      const response = NextResponse.json(
        {
          authenticated: false,

          message: "Session expired.",
        },
        {
          status: 401,
        },
      );

      clearAuthCookies(response);

      return response;
    }

    const tokens = (await tokenResponse.json()) as KeycloakTokenResponse;

    if (!tokens.access_token) {
      const response = NextResponse.json(
        {
          authenticated: false,

          message: "Refresh response did not contain an access token.",
        },
        {
          status: 401,
        },
      );

      clearAuthCookies(response);

      return response;
    }

    const response = NextResponse.json({
      authenticated: true,
      refreshed: true,
    });

    setAuthCookies(response, tokens);

    console.log("[KEYCLOAK TOKEN REFRESHED]", {
      expiresIn: tokens.expires_in,
    });

    return response;
  } catch (error) {
    console.error("[KEYCLOAK REFRESH ERROR]", error);

    return NextResponse.json(
      {
        message: "Could not refresh authentication session.",
      },
      {
        status: 500,
      },
    );
  }
}
