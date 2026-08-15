// import { createHash, randomBytes } from "node:crypto";
// import type { NextResponse } from "next/server";

// export const AUTH_COOKIES = {
//   accessToken: "foodhub_access_token",
//   refreshToken: "foodhub_refresh_token",
//   idToken: "foodhub_id_token",

//   oauthState: "foodhub_oauth_state",
//   codeVerifier: "foodhub_code_verifier",
//   returnTo: "foodhub_return_to",
// } as const;

// export interface KeycloakTokenResponse {
//   access_token: string;

//   refresh_token?: string;

//   id_token?: string;

//   expires_in?: number;

//   refresh_expires_in?: number;

//   token_type?: string;

//   scope?: string;
// }

// function requiredEnv(name: string): string {
//   const value = process.env[name]?.trim();

//   if (!value) {
//     throw new Error(`Missing required environment variable: ${name}`);
//   }

//   return value;
// }

// function trimTrailingSlash(value: string) {
//   return value.replace(/\/+$/, "");
// }

// export function getAuthConfig() {
//   const appUrl = trimTrailingSlash(requiredEnv("APP_URL"));

//   const backendApiUrl = trimTrailingSlash(requiredEnv("BACKEND_API_URL"));

//   const keycloakUrl = trimTrailingSlash(requiredEnv("KEYCLOAK_URL"));

//   const realm = requiredEnv("KEYCLOAK_REALM");

//   const clientId = requiredEnv("KEYCLOAK_CLIENT_ID");

//   const clientSecret = requiredEnv("KEYCLOAK_CLIENT_SECRET");

//   return {
//     appUrl,
//     backendApiUrl,
//     keycloakUrl,
//     realm,
//     clientId,
//     clientSecret,
//   };
// }

// export function getKeycloakEndpoints() {
//   const config = getAuthConfig();

//   const realmUrl = `${config.keycloakUrl}/realms/${encodeURIComponent(
//     config.realm,
//   )}`;

//   return {
//     authorization: `${realmUrl}/protocol/openid-connect/auth`,

//     token: `${realmUrl}/protocol/openid-connect/token`,

//     logout: `${realmUrl}/protocol/openid-connect/logout`,
//   };
// }

// export function createOAuthState() {
//   return randomBytes(32).toString("base64url");
// }

// export function createCodeVerifier() {
//   return randomBytes(64).toString("base64url");
// }

// export function createCodeChallenge(codeVerifier: string) {
//   return createHash("sha256").update(codeVerifier).digest("base64url");
// }

// export function safeReturnTo(
//   value: string | null | undefined,
//   fallback = "/dashboard",
// ) {
//   if (!value) {
//     return fallback;
//   }

//   if (!value.startsWith("/")) {
//     return fallback;
//   }

//   if (value.startsWith("//")) {
//     return fallback;
//   }

//   return value;
// }

// export function getAuthCookieOptions() {
//   return {
//     httpOnly: true,

//     secure: process.env.NODE_ENV === "production",

//     sameSite: "lax" as const,

//     path: "/",
//   };
// }

// export function setAuthCookies(
//   response: NextResponse,
//   tokens: KeycloakTokenResponse,
// ) {
//   const options = getAuthCookieOptions();

//   response.cookies.set(AUTH_COOKIES.accessToken, tokens.access_token, {
//     ...options,

//     maxAge: tokens.expires_in ?? 300,
//   });

//   if (tokens.refresh_token) {
//     response.cookies.set(AUTH_COOKIES.refreshToken, tokens.refresh_token, {
//       ...options,

//       maxAge: tokens.refresh_expires_in ?? 86_400,
//     });
//   }

//   if (tokens.id_token) {
//     response.cookies.set(AUTH_COOKIES.idToken, tokens.id_token, {
//       ...options,

//       maxAge: tokens.refresh_expires_in ?? 86_400,
//     });
//   }
// }

// export function clearLoginCookies(response: NextResponse) {
//   const options = getAuthCookieOptions();

//   for (const name of [
//     AUTH_COOKIES.oauthState,
//     AUTH_COOKIES.codeVerifier,
//     AUTH_COOKIES.returnTo,
//   ]) {
//     response.cookies.set(name, "", {
//       ...options,
//       maxAge: 0,
//     });
//   }
// }

// export function clearAuthCookies(response: NextResponse) {
//   const options = getAuthCookieOptions();

//   for (const name of [
//     AUTH_COOKIES.accessToken,
//     AUTH_COOKIES.refreshToken,
//     AUTH_COOKIES.idToken,
//   ]) {
//     response.cookies.set(name, "", {
//       ...options,
//       maxAge: 0,
//     });
//   }
// }

// export function clearAllAuthCookies(response: NextResponse) {
//   clearAuthCookies(response);

//   clearLoginCookies(response);
// }

import { createHash, randomBytes } from "node:crypto";
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

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getAuthConfig() {
  const appUrl = trimTrailingSlash(requiredEnv("APP_URL"));
  const backendApiUrl = trimTrailingSlash(requiredEnv("BACKEND_API_URL"));
  const keycloakUrl = trimTrailingSlash(requiredEnv("KEYCLOAK_URL"));
  const realm = requiredEnv("KEYCLOAK_REALM");
  const clientId = requiredEnv("KEYCLOAK_CLIENT_ID");
  const clientSecret = requiredEnv("KEYCLOAK_CLIENT_SECRET");

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
  fallback = "/dashboard",
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

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
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

  if (tokens.refresh_token) {
    response.cookies.set(AUTH_COOKIES.refreshToken, tokens.refresh_token, {
      ...options,
      maxAge: tokens.refresh_expires_in ?? 86_400,
    });
  }

  if (tokens.id_token) {
    response.cookies.set(AUTH_COOKIES.idToken, tokens.id_token, {
      ...options,
      maxAge: tokens.refresh_expires_in ?? 86_400,
    });
  }
}

export function clearLoginCookies(response: NextResponse) {
  const options = getAuthCookieOptions();

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
