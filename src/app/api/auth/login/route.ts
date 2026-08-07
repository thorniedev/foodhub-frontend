// import crypto from "node:crypto";
// import { NextRequest, NextResponse } from "next/server";

// function createRandomValue(): string {
//   return crypto.randomBytes(32).toString("base64url");
// }

// export async function GET(request: NextRequest) {
//   const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
//   const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM;
//   const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;
//   const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

//   if (!keycloakUrl || !realm || !clientId) {
//     return NextResponse.json(
//       {
//         message: "Missing Keycloak environment configuration",
//         required: ["NEXT_PUBLIC_KEYCLOAK_URL", "NEXT_PUBLIC_KEYCLOAK_REALM", "NEXT_PUBLIC_KEYCLOAK_CLIENT_ID"],
//       },
//       { status: 500 },
//     );
//   }

//   const requestedReturnTo =
//     request.nextUrl.searchParams.get("returnTo") ?? "/dashboard";

//   // Prevent redirecting users to an external website.
//   const returnTo =
//     requestedReturnTo.startsWith("/") && !requestedReturnTo.startsWith("//")
//       ? requestedReturnTo
//       : "/dashboard";

//   const state = createRandomValue();
//   const codeVerifier = createRandomValue();

//   const codeChallenge = crypto
//     .createHash("sha256")
//     .update(codeVerifier)
//     .digest("base64url");

//   const redirectUri = `${appUrl}/api/auth/callback`;

//   const authorizationUrl = new URL(
//     `${keycloakUrl.replace(/\/$/, "")}/realms/${realm}/protocol/openid-connect/auth`,
//   );

//   authorizationUrl.searchParams.set("client_id", clientId);
//   authorizationUrl.searchParams.set("redirect_uri", redirectUri);
//   authorizationUrl.searchParams.set("response_type", "code");
//   authorizationUrl.searchParams.set("response_mode", "query");
//   authorizationUrl.searchParams.set("scope", "openid profile email");
//   authorizationUrl.searchParams.set("state", state);
//   authorizationUrl.searchParams.set("code_challenge", codeChallenge);
//   authorizationUrl.searchParams.set("code_challenge_method", "S256");

//   const response = NextResponse.redirect(authorizationUrl);
//   console.log("KEYCLOAK LOGIN:", {
//     clientId,
//     realm,
//     redirectUri,
//     authorizationUrl: authorizationUrl.toString(),
//   });
//   const temporaryCookieOptions = {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax" as const,
//     path: "/",
//     maxAge: 10 * 60,
//   };

//   response.cookies.set("foodhub_oauth_state", state, temporaryCookieOptions);

//   response.cookies.set(
//     "foodhub_code_verifier",
//     codeVerifier,
//     temporaryCookieOptions,
//   );

//   response.cookies.set("foodhub_return_to", returnTo, temporaryCookieOptions);

//   return response;
// }

import { createHash, randomBytes } from "crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function isSafeReturnPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//");
}

function generateCodeVerifier(): string {
  return randomBytes(64).toString("base64url");
}

function generateCodeChallenge(codeVerifier: string): string {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

export async function GET(request: NextRequest) {
  const keycloakUrl =
    process.env.KEYCLOAK_URL ?? process.env.NEXT_PUBLIC_KEYCLOAK_URL;

  const realm =
    process.env.KEYCLOAK_REALM ?? process.env.NEXT_PUBLIC_KEYCLOAK_REALM;

  const clientId =
    process.env.KEYCLOAK_CLIENT_ID ??
    process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;

  const appUrl = process.env.APP_URL ?? request.nextUrl.origin;

  if (!keycloakUrl || !realm || !clientId) {
    console.error("KEYCLOAK LOGIN CONFIGURATION ERROR:", {
      hasKeycloakUrl: Boolean(keycloakUrl),
      hasRealm: Boolean(realm),
      hasClientId: Boolean(clientId),
      appUrl,
    });

    return NextResponse.redirect(
      new URL("/login?error=server_configuration_error", request.url),
    );
  }

  const normalizedKeycloakUrl = normalizeBaseUrl(keycloakUrl);

  const normalizedAppUrl = normalizeBaseUrl(appUrl);

  const requestedReturnTo =
    request.nextUrl.searchParams.get("returnTo") ?? "/dashboard";

  const returnTo = isSafeReturnPath(requestedReturnTo)
    ? requestedReturnTo
    : "/dashboard";

  const state = randomBytes(32).toString("base64url");

  const codeVerifier = generateCodeVerifier();

  const codeChallenge = generateCodeChallenge(codeVerifier);

  const redirectUri = `${normalizedAppUrl}/api/auth/callback`;

  const authorizationUrl = new URL(
    `${normalizedKeycloakUrl}/realms/${encodeURIComponent(
      realm,
    )}/protocol/openid-connect/auth`,
  );

  authorizationUrl.searchParams.set("client_id", clientId);

  authorizationUrl.searchParams.set("response_type", "code");

  authorizationUrl.searchParams.set("scope", "openid profile email");

  authorizationUrl.searchParams.set("redirect_uri", redirectUri);

  authorizationUrl.searchParams.set("state", state);

  authorizationUrl.searchParams.set("code_challenge", codeChallenge);

  authorizationUrl.searchParams.set("code_challenge_method", "S256");

  console.log("KEYCLOAK LOGIN:", {
    clientId,
    realm,
    redirectUri,
    returnTo,
    authorizationUrl: authorizationUrl.origin + authorizationUrl.pathname,
  });

  const response = NextResponse.redirect(authorizationUrl);

  const temporaryCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 10 * 60,
  };

  response.cookies.set("foodhub_oauth_state", state, temporaryCookieOptions);

  response.cookies.set(
    "foodhub_code_verifier",
    codeVerifier,
    temporaryCookieOptions,
  );

  response.cookies.set("foodhub_return_to", returnTo, temporaryCookieOptions);

  return response;
}
