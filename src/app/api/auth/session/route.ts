import {
  NextRequest,
  NextResponse,
} from "next/server";

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

function decodeJwt(
  token: string,
): KeycloakClaims | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload = Buffer.from(
      parts[1],
      "base64url",
    ).toString("utf8");

    return JSON.parse(
      payload,
    ) as KeycloakClaims;
  } catch (error) {
    console.error(
      "[AUTH SESSION] Failed to decode token:",
      error,
    );

    return null;
  }
}

export async function GET(
  request: NextRequest,
) {
  const idToken =
    request.cookies.get(
      "foodhub_id_token",
    )?.value;

  const accessToken =
    request.cookies.get(
      "foodhub_access_token",
    )?.value;

  const token =
    idToken ?? accessToken;

  if (!token) {
    return NextResponse.json(
      {
        authenticated: false,
        message: "Not authenticated.",
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const claims =
    decodeJwt(token);

  if (!claims) {
    return NextResponse.json(
      {
        authenticated: false,
        message: "Invalid token.",
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  if (
    claims.exp &&
    claims.exp * 1000 <= Date.now()
  ) {
    return NextResponse.json(
      {
        authenticated: false,
        expired: true,
        message: "Token expired.",
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  if (!claims.sub) {
    return NextResponse.json(
      {
        authenticated: false,
        message:
          "Token does not contain a user ID.",
      },
      {
        status: 401,
      },
    );
  }

  const user = {
    uuid: claims.sub,

    username:
      claims.preferred_username ??
      "",

    primaryEmail:
      claims.email ?? "",

    firstName:
      claims.given_name ?? null,

    lastName:
      claims.family_name ?? null,

    emailVerified:
      claims.email_verified ?? false,

    /*
     * This means the Keycloak session
     * is currently authenticated.
     *
     * It is NOT the Spring Boot database
     * account status.
     */
    status: "ACTIVE",

    lastLoginAt: null,

    createdAt: null,

    updatedAt: null,

    avatarUrl: null,
  };

  console.log(
    "[FOODHUB SESSION USER]",
    {
      uuid: user.uuid,
      username: user.username,
      email: user.primaryEmail,
    },
  );

  return NextResponse.json(
    {
      authenticated: true,
      user,
    },
    {
      headers: {
        "Cache-Control":
          "no-store",
      },
    },
  );
}