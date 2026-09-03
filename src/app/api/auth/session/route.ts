import { NextRequest, NextResponse } from "next/server";

import {
  AUTH_COOKIES,
  refreshKeycloakTokens,
  setAuthCookies,
  type KeycloakTokenResponse,
} from "@/lib/auth/keycloak";

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

function isExpired(claims: KeycloakClaims | null): boolean {
  return Boolean(claims?.exp && claims.exp * 1000 <= Date.now());
}

function loggedOut(expired = false) {
  return NextResponse.json(
    {
      authenticated: false,
      ...(expired ? { expired: true } : {}),
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

export async function GET(request: NextRequest) {
  let idToken = request.cookies.get(AUTH_COOKIES.idToken)?.value;
  let accessToken = request.cookies.get(AUTH_COOKIES.accessToken)?.value;
  const refreshToken = request.cookies.get(AUTH_COOKIES.refreshToken)?.value;

  let token = idToken ?? accessToken;
  let claims = token ? decodeJwt(token) : null;

  /*
   * An access token lives about five minutes, and its cookie is set to expire
   * with it, so for almost all of a session's life this endpoint is asked about
   * a token that is missing or past its exp. Reporting "logged out" at that
   * point ends the session after minutes no matter how long Keycloak is
   * configured to keep it alive -- the refresh token sitting in the next cookie
   * is what defines the real session length.
   *
   * Refreshing here mirrors what the API proxy already does on a 401, so both
   * paths keep a session alive for as long as Keycloak allows.
   */
  let refreshedTokens: KeycloakTokenResponse | null = null;
  if (refreshToken && (!claims || isExpired(claims))) {
    refreshedTokens = await refreshKeycloakTokens(refreshToken);

    if (refreshedTokens?.access_token) {
      accessToken = refreshedTokens.access_token;
      idToken = refreshedTokens.id_token ?? idToken;
      token = idToken ?? accessToken;
      claims = decodeJwt(token);
    }
  }

  /*
   * IMPORTANT:
   * Logged out is a valid session state.
   *
   * Return 200, not 401.
   */
  if (!token || !claims) {
    return loggedOut();
  }

  // Still expired after a refresh attempt means the refresh token is gone too,
  // so the user genuinely has to sign in again.
  if (isExpired(claims)) {
    return loggedOut(true);
  }

  const accessClaims = accessToken ? decodeJwt(accessToken) : claims;

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

  const response = NextResponse.json(
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

  // Persist a rotated token set, otherwise the next call refreshes again -- and
  // with refresh token rotation enabled the token just used would already be
  // spent. The cookie lifetimes come from Keycloak's own expires_in /
  // refresh_expires_in, so session length stays a Keycloak setting.
  if (refreshedTokens) {
    setAuthCookies(response, refreshedTokens);
  }

  return response;
}
