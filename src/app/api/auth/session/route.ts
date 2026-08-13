import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface KeycloakClaims {
  sub?: string;

  preferred_username?: string;

  email?: string;
  email_verified?: boolean;

  given_name?: string;
  family_name?: string;

  exp?: number;
}

function decodeJwt(token: string): KeycloakClaims | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload = Buffer.from(parts[1], "base64url").toString("utf8");

    return JSON.parse(payload) as KeycloakClaims;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const idToken = request.cookies.get("foodhub_id_token")?.value;

  const accessToken = request.cookies.get("foodhub_access_token")?.value;

  const token = idToken ?? accessToken;

  /*
   * IMPORTANT:
   * Logged out is a valid session state.
   *
   * Return 200, not 401.
   */
  if (!token) {
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
      },
      {
        status: 200,

        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const claims = decodeJwt(token);

  if (!claims) {
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
      },
      {
        status: 200,

        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  /*
   * Expired session
   */
  if (claims.exp && claims.exp * 1000 <= Date.now()) {
    return NextResponse.json(
      {
        authenticated: false,
        expired: true,
        user: null,
      },
      {
        status: 200,

        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  /*
   * Logged-in Keycloak user
   */
  const user = {
    uuid: claims.sub ?? "",

    username: claims.preferred_username ?? "",

    primaryEmail: claims.email ?? "",

    firstName: claims.given_name ?? null,

    lastName: claims.family_name ?? null,

    emailVerified: claims.email_verified ?? false,

    status: "ACTIVE",

    lastLoginAt: null,

    createdAt: null,

    updatedAt: null,

    avatarUrl: null,
  };

  return NextResponse.json(
    {
      authenticated: true,
      user,
    },
    {
      status: 200,

      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
