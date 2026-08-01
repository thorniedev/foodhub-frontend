import { createHash, randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function generateRandomValue(size = 32): string {
  return randomBytes(size).toString("base64url");
}

function createCodeChallenge(codeVerifier: string): string {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

export function GET(request: NextRequest) {
  const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
  const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM;
  const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;

  if (!keycloakUrl || !realm || !clientId) {
    return NextResponse.json(
      { message: "Keycloak configuration is missing" },
      { status: 500 },
    );
  }

  const codeVerifier = generateRandomValue(64);
  const codeChallenge = createCodeChallenge(codeVerifier);
  const state = generateRandomValue(32);

  const requestedReturnTo =
    request.nextUrl.searchParams.get("returnTo") ?? "/dashboard";

  // Prevent external redirect URLs
  const returnTo = requestedReturnTo.startsWith("/dashboard")
    ? requestedReturnTo
    : "/dashboard";

  const redirectUri = new URL(
    "/api/auth/callback",
    request.nextUrl.origin,
  ).toString();

  const authorizationUrl = new URL(
    `/realms/${realm}/protocol/openid-connect/auth`,
    keycloakUrl,
  );

  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "openid profile email");

  // PKCE parameters
  authorizationUrl.searchParams.set("code_challenge", codeChallenge);
  authorizationUrl.searchParams.set("code_challenge_method", "S256");

  // CSRF protection
  authorizationUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizationUrl);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 10 * 60,
  };

  response.cookies.set("pkce_verifier", codeVerifier, cookieOptions);
  response.cookies.set("oauth_state", state, cookieOptions);
  response.cookies.set("auth_return_to", returnTo, cookieOptions);

  return response;
}
