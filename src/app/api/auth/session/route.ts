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

  realm_access?: {
    roles?: string[];
  };
  resource_access?: Record<
    string,
    {
      roles?: string[];
    }
  >;
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

function normalizeRole(role: unknown): string {
  if (typeof role !== "string") {
    return "";
  }

  const normalized = role.trim().toUpperCase();
  return normalized.startsWith("ROLE_")
    ? normalized.slice("ROLE_".length)
    : normalized;
}

function getRolesFromClaims(claims: KeycloakClaims | null): string[] {
  if (!claims) {
    return [];
  }

  const roles = [
    ...(claims.realm_access?.roles ?? []),
    ...Object.values(claims.resource_access ?? {}).flatMap((access) =>
      Array.isArray(access.roles) ? access.roles : [],
    ),
  ];

  return [...new Set(roles.map(normalizeRole).filter(Boolean))];
}

function getPrimaryRole(roles: string[]): string | null {
  if (roles.includes("SUPER_ADMIN")) return "SUPER_ADMIN";
  if (roles.includes("ADMIN")) return "ADMIN";
  if (roles.includes("USER")) return "USER";
  return roles[0] ?? null;
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
  const accessClaims = accessToken ? decodeJwt(accessToken) : claims;

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
  const roles = getRolesFromClaims(accessClaims);

  const user = {
    uuid: claims.sub ?? "",

    username: claims.preferred_username ?? "",

    primaryEmail: claims.email ?? "",

    firstName: claims.given_name ?? null,

    lastName: claims.family_name ?? null,

    emailVerified: claims.email_verified ?? false,

    role: getPrimaryRole(roles),

    roles,

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
