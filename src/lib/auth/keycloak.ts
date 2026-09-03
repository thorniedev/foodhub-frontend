import { createHash, randomBytes } from "crypto";
import type { NextResponse } from "next/server";

export const AUTH_COOKIES = {
  accessToken: "foodhub_access_token",
  refreshToken: "foodhub_refresh_token",
  idToken: "foodhub_id_token",

  oauthState: "foodhub_oauth_state",
  codeVerifier: "foodhub_code_verifier",
  returnTo: "foodhub_return_to",
} as const;

export interface KeycloakTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  token_type?: string;
  scope?: string;
}

function safeEnv(name: string, fallback = ""): string {
  const value = process.env[name]?.trim();
  return value || fallback;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getAuthConfig() {
  const appUrl = trimTrailingSlash(
    safeEnv("APP_URL", process.env.NEXT_PUBLIC_SITE_URL || "https://mhoubahar.store"),
  );
  const rawBackendUrl = trimTrailingSlash(
    safeEnv("BACKEND_API_URL", "https://api.mhoubahar.store"),
  );
  const backendApiUrl = /\/api\/v1$/i.test(rawBackendUrl)
    ? rawBackendUrl
    : `${rawBackendUrl}/api/v1`;
  const keycloakUrl = trimTrailingSlash(
    safeEnv("KEYCLOAK_URL", "https://auth.mhoubahar.store"),
  );
  const realm = safeEnv("KEYCLOAK_REALM", "foodhub");
  const clientId = safeEnv("KEYCLOAK_CLIENT_ID", "mhoubahar-web");
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET?.trim() || "";

  return {
    appUrl,
    backendApiUrl,
    keycloakUrl,
    realm,
    clientId,
    clientSecret,
  };
}

export function getKeycloakEndpoints() {
  const config = getAuthConfig();

  const realmUrl = `${config.keycloakUrl}/realms/${encodeURIComponent(
    config.realm,
  )}`;

  return {
    authorization: `${realmUrl}/protocol/openid-connect/auth`,
    token: `${realmUrl}/protocol/openid-connect/token`,
    logout: `${realmUrl}/protocol/openid-connect/logout`,
  };
}

export function createOAuthState() {
  return randomBytes(32).toString("base64url");
}

export function createCodeVerifier() {
  return randomBytes(64).toString("base64url");
}

export function createCodeChallenge(codeVerifier: string) {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

export function safeReturnTo(
  value: string | null | undefined,
  fallback = "/",
) {
  if (!value) {
    return fallback;
  }

  if (!value.startsWith("/")) {
    return fallback;
  }

  if (value.startsWith("//")) {
    return fallback;
  }

  return value;
}

/**
 * Auth cookies must be visible on whichever host the browser is actually on
 * ("mhoubahar.store" or "www.mhoubahar.store") — without an explicit Domain
 * attribute a cookie is scoped to the exact host that set it, so a login
 * started on "www." sets foodhub_oauth_state there, but the OAuth
 * redirect_uri built from APP_URL always points at the bare apex domain.
 * Keycloak's redirect back then lands on a host that never saw the cookie,
 * and the callback's state-match check fails ("invalid_state" / "Session
 * expired"). Scoping to the leading-dot apex domain makes the cookie
 * visible on both. Skipped outside production since localhost has no
 * meaningful apex/subdomain split.
 */
function getCookieDomain(): string | undefined {
  if (process.env.NODE_ENV !== "production") {
    return undefined;
  }

  try {
    const hostname = new URL(getAuthConfig().appUrl).hostname;
    const apexDomain = hostname.replace(/^www\./i, "");
    return `.${apexDomain}`;
  } catch {
    return undefined;
  }
}

export function getAuthCookieOptions() {
  const domain = getCookieDomain();

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(domain ? { domain } : {}),
  };
}

/**
 * PKCE login cookies (state, codeVerifier, returnTo) are set during the
 * /api/auth/login redirect and must survive the round-trip through
 * auth.mhoubahar.store → mhoubahar.store. On production, Keycloak performs a
 * top-level GET redirect (HTTP 302), so SameSite=lax is fine. However, we
 * must NOT set the domain to the apex (.mhoubahar.store) because that would
 * expose the cookies to all subdomains. We set no domain so they are scoped
 * to the exact host (mhoubahar.store) which is exactly where the callback
 * lands.
 */
export const ONE_WEEK_SECONDS = 7 * 24 * 60 * 60; // 604,800 seconds (7 days)

export function getLoginCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  const domain = getCookieDomain();

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 10 * 60, // 10 minutes
    ...(domain ? { domain } : {}),
  };
}

export function setAuthCookies(
  response: NextResponse,
  tokens: KeycloakTokenResponse,
) {
  const options = getAuthCookieOptions();

  response.cookies.set(AUTH_COOKIES.accessToken, tokens.access_token, {
    ...options,
    maxAge: tokens.expires_in ?? 300,
  });

  const refreshMaxAge = Math.max(tokens.refresh_expires_in ?? 0, ONE_WEEK_SECONDS);

  if (tokens.refresh_token) {
    response.cookies.set(AUTH_COOKIES.refreshToken, tokens.refresh_token, {
      ...options,
      maxAge: refreshMaxAge,
    });
  }

  if (tokens.id_token) {
    response.cookies.set(AUTH_COOKIES.idToken, tokens.id_token, {
      ...options,
      maxAge: refreshMaxAge,
    });
  }
}

export function clearLoginCookies(response: NextResponse) {
  // Must use getLoginCookieOptions (no domain) to match the original cookie
  // attributes. A cookie can only be cleared by a Set-Cookie header with
  // matching Path + Domain attributes.
  const options = getLoginCookieOptions();

  for (const name of [
    AUTH_COOKIES.oauthState,
    AUTH_COOKIES.codeVerifier,
    AUTH_COOKIES.returnTo,
  ]) {
    response.cookies.set(name, "", {
      ...options,
      maxAge: 0,
    });
  }
}

export function clearAuthCookies(response: NextResponse) {
  const options = getAuthCookieOptions();

  for (const name of [
    AUTH_COOKIES.accessToken,
    AUTH_COOKIES.refreshToken,
    AUTH_COOKIES.idToken,
  ]) {
    response.cookies.set(name, "", {
      ...options,
      maxAge: 0,
    });
  }
}

export function clearAllAuthCookies(response: NextResponse) {
  clearAuthCookies(response);
  clearLoginCookies(response);
}

export async function refreshKeycloakTokens(
  refreshToken: string,
): Promise<KeycloakTokenResponse | null> {
  if (!refreshToken) return null;

  try {
    const config = getAuthConfig();
    const endpoints = getKeycloakEndpoints();

    const body = new URLSearchParams();
    body.set("grant_type", "refresh_token");
    body.set("client_id", config.clientId);
    if (config.clientSecret) {
      body.set("client_secret", config.clientSecret);
    }
    body.set("refresh_token", refreshToken);

    const tokenResponse = await fetch(endpoints.token, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body,
      cache: "no-store",
    });

    if (!tokenResponse.ok) {
      return null;
    }

    const tokens = (await tokenResponse.json()) as KeycloakTokenResponse;
    if (!tokens.access_token) {
      return null;
    }

    return tokens;
  } catch (err) {
    console.error("[KEYCLOAK REFRESH HELPER ERROR]", err);
    return null;
  }
}
