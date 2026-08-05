// // import { createHash, randomBytes } from "node:crypto";
// // import type { NextRequest } from "next/server";
// // import { NextResponse } from "next/server";

// // function generateRandomValue(size = 32): string {
// //   return randomBytes(size).toString("base64url");
// // }

// // function createCodeChallenge(codeVerifier: string): string {
// //   return createHash("sha256").update(codeVerifier).digest("base64url");
// // }

// // export function GET(request: NextRequest) {
// //   const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
// //   const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM;
// //   const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;

// //   if (!keycloakUrl || !realm || !clientId) {
// //     return NextResponse.json(
// //       { message: "Keycloak configuration is missing" },
// //       { status: 500 },
// //     );
// //   }

// //   const codeVerifier = generateRandomValue(64);
// //   const codeChallenge = createCodeChallenge(codeVerifier);
// //   const state = generateRandomValue(32);

// //   const requestedReturnTo =
// //     request.nextUrl.searchParams.get("returnTo") ?? "/dashboard";

// //   // Prevent external redirect URLs
// //   const returnTo = requestedReturnTo.startsWith("/dashboard")
// //     ? requestedReturnTo
// //     : "/dashboard";

// //   const redirectUri = new URL(
// //     "/api/auth/callback",
// //     request.nextUrl.origin,
// //   ).toString();

// //   const authorizationUrl = new URL(
// //     `/realms/${realm}/protocol/openid-connect/auth`,
// //     keycloakUrl,
// //   );

// //   authorizationUrl.searchParams.set("client_id", clientId);
// //   authorizationUrl.searchParams.set("redirect_uri", redirectUri);
// //   authorizationUrl.searchParams.set("response_type", "code");
// //   authorizationUrl.searchParams.set("scope", "openid profile email");

// //   // PKCE parameters
// //   authorizationUrl.searchParams.set("code_challenge", codeChallenge);
// //   authorizationUrl.searchParams.set("code_challenge_method", "S256");

// //   // CSRF protection
// //   authorizationUrl.searchParams.set("state", state);

// //   const response = NextResponse.redirect(authorizationUrl);

// //   const cookieOptions = {
// //     httpOnly: true,
// //     secure: process.env.NODE_ENV === "production",
// //     sameSite: "lax" as const,
// //     path: "/",
// //     maxAge: 10 * 60,
// //   };

// //   response.cookies.set("pkce_verifier", codeVerifier, cookieOptions);
// //   response.cookies.set("oauth_state", state, cookieOptions);
// //   response.cookies.set("auth_return_to", returnTo, cookieOptions);

// //   return response;
// // }
// import { createHash, randomBytes } from "node:crypto";
// import { NextRequest, NextResponse } from "next/server";

// function generateRandomValue(size = 32): string {
//   return randomBytes(size).toString("base64url");
// }

// function createCodeChallenge(codeVerifier: string): string {
//   return createHash("sha256").update(codeVerifier).digest("base64url");
// }

// export async function GET(request: NextRequest) {
//   const keycloakUrl = process.env.KEYCLOAK_URL;
//   const realm = process.env.KEYCLOAK_REALM;
//   const clientId = process.env.KEYCLOAK_CLIENT_ID;

//   if (!keycloakUrl || !realm || !clientId) {
//     return NextResponse.json(
//       {
//         message: "Missing Keycloak environment configuration",
//         required: ["KEYCLOAK_URL", "KEYCLOAK_REALM", "KEYCLOAK_CLIENT_ID"],
//       },
//       { status: 500 },
//     );
//   }

//   const requestedReturnTo =
//     request.nextUrl.searchParams.get("returnTo") ?? "/dashboard";

//   const safeReturnTo = requestedReturnTo.startsWith("/")
//     ? requestedReturnTo
//     : "/dashboard";

//   const state = generateRandomValue(32);
//   const codeVerifier = generateRandomValue(64);
//   const codeChallenge = createCodeChallenge(codeVerifier);
//   const redirectUri = new URL(
//     "/api/auth/callback",
//     request.nextUrl.origin,
//   ).toString();

//   const authorizationUrl = new URL(
//     `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth`,
//   );

//   authorizationUrl.searchParams.set("client_id", clientId);
//   authorizationUrl.searchParams.set("response_type", "code");
//   authorizationUrl.searchParams.set("scope", "openid profile email");
//   authorizationUrl.searchParams.set("redirect_uri", redirectUri);
//   authorizationUrl.searchParams.set("state", state);
//   authorizationUrl.searchParams.set("code_challenge", codeChallenge);
//   authorizationUrl.searchParams.set("code_challenge_method", "S256");

//   const response = NextResponse.redirect(authorizationUrl);

//   const cookieOptions = {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax" as const,
//     path: "/",
//     maxAge: 10 * 60,
//   };

//   response.cookies.set("oauth_state", state, cookieOptions);
//   response.cookies.set("auth_return_to", safeReturnTo, cookieOptions);
//   response.cookies.set("pkce_verifier", codeVerifier, cookieOptions);

//   return response;
// }

import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

function createRandomValue(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export async function GET(request: NextRequest) {
  const keycloakUrl = process.env.KEYCLOAK_URL;
  const realm = process.env.KEYCLOAK_REALM;
  const clientId = process.env.KEYCLOAK_CLIENT_ID;
  const appUrl = process.env.APP_URL ?? request.nextUrl.origin;

  if (!keycloakUrl || !realm || !clientId) {
    return NextResponse.json(
      {
        message: "Missing Keycloak environment configuration",
        required: ["KEYCLOAK_URL", "KEYCLOAK_REALM", "KEYCLOAK_CLIENT_ID"],
      },
      { status: 500 },
    );
  }

  const requestedReturnTo =
    request.nextUrl.searchParams.get("returnTo") ?? "/dashboard";

  // Prevent redirecting users to an external website.
  const returnTo =
    requestedReturnTo.startsWith("/") && !requestedReturnTo.startsWith("//")
      ? requestedReturnTo
      : "/dashboard";

  const state = createRandomValue();
  const codeVerifier = createRandomValue();

  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const redirectUri = `${appUrl}/api/auth/callback`;

  const authorizationUrl = new URL(
    `${keycloakUrl.replace(/\/$/, "")}/realms/${realm}/protocol/openid-connect/auth`,
  );

  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("response_mode", "query");
  authorizationUrl.searchParams.set("scope", "openid profile email");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("code_challenge", codeChallenge);
  authorizationUrl.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(authorizationUrl);
  console.log("KEYCLOAK LOGIN:", {
    clientId,
    realm,
    redirectUri,
    authorizationUrl: authorizationUrl.toString(),
  });
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
