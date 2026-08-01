import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface KeycloakTokenResponse {
  access_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  refresh_token?: string;
  token_type?: string;
  id_token?: string;
  session_state?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

function normalizeUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

export async function GET(request: NextRequest) {
  const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
  const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM;
  const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;

  // Only needed when Keycloak "Client authentication" is enabled
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

  if (!keycloakUrl || !realm || !clientId) {
    return NextResponse.json(
      {
        message: "Keycloak configuration is missing",
      },
      {
        status: 500,
      },
    );
  }

  const searchParams = request.nextUrl.searchParams;

  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const returnedIssuer = searchParams.get("iss");

  const keycloakError = searchParams.get("error");
  const keycloakErrorDescription = searchParams.get("error_description");

  if (keycloakError) {
    console.error("Keycloak authorization error:", {
      error: keycloakError,
      description: keycloakErrorDescription,
    });

    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(keycloakError)}`,
        request.nextUrl.origin,
      ),
    );
  }

  if (!code || !returnedState) {
    return NextResponse.json(
      {
        message: "Missing authorization code or state",
      },
      {
        status: 400,
      },
    );
  }

  const savedState = request.cookies.get("oauth_state")?.value;
  const codeVerifier = request.cookies.get("pkce_verifier")?.value;

  const savedReturnTo =
    request.cookies.get("auth_return_to")?.value ?? "/dashboard";

  if (!savedState || returnedState !== savedState) {
    return NextResponse.json(
      {
        message: "Invalid OAuth state",
      },
      {
        status: 400,
      },
    );
  }

  if (!codeVerifier) {
    return NextResponse.json(
      {
        message: "PKCE code verifier cookie is missing",
      },
      {
        status: 400,
      },
    );
  }

  // Optional issuer validation
  const expectedIssuer = normalizeUrl(
    new URL(`/realms/${realm}`, keycloakUrl).toString(),
  );

  if (returnedIssuer && normalizeUrl(returnedIssuer) !== expectedIssuer) {
    return NextResponse.json(
      {
        message: "Invalid Keycloak issuer",
      },
      {
        status: 400,
      },
    );
  }

  const redirectUri = new URL(
    "/api/auth/callback",
    request.nextUrl.origin,
  ).toString();

  const tokenEndpoint = new URL(
    `/realms/${realm}/protocol/openid-connect/token`,
    keycloakUrl,
  );

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  // Include this only for a confidential Keycloak client
  if (clientSecret) {
    body.set("client_secret", clientSecret);
  }

  try {
    const tokenResponse = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    });

    const tokenData = (await tokenResponse.json()) as KeycloakTokenResponse;

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Keycloak token exchange failed:", tokenData);

      return NextResponse.json(
        {
          message: "Unable to exchange authorization code",
          error:
            tokenData.error_description ??
            tokenData.error ??
            "Unknown Keycloak error",
        },
        {
          status: tokenResponse.status || 500,
        },
      );
    }

    const safeReturnTo = savedReturnTo.startsWith("/dashboard")
      ? savedReturnTo
      : "/dashboard";

    const response = NextResponse.redirect(
      new URL(safeReturnTo, request.nextUrl.origin),
    );

    const baseCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    response.cookies.set("access_token", tokenData.access_token, {
      ...baseCookieOptions,
      maxAge: tokenData.expires_in ?? 300,
    });

    if (tokenData.refresh_token) {
      response.cookies.set("refresh_token", tokenData.refresh_token, {
        ...baseCookieOptions,
        maxAge: tokenData.refresh_expires_in ?? 1800,
      });
    }

    if (tokenData.id_token) {
      response.cookies.set("id_token", tokenData.id_token, {
        ...baseCookieOptions,
        maxAge: tokenData.expires_in ?? 300,
      });
    }

    // Remove temporary OAuth cookies
    response.cookies.set("pkce_verifier", "", {
      ...baseCookieOptions,
      maxAge: 0,
    });

    response.cookies.set("oauth_state", "", {
      ...baseCookieOptions,
      maxAge: 0,
    });

    response.cookies.set("auth_return_to", "", {
      ...baseCookieOptions,
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Keycloak callback request failed:", error);

    return NextResponse.json(
      {
        message: "Unable to connect to Keycloak",
      },
      {
        status: 500,
      },
    );
  }
}
