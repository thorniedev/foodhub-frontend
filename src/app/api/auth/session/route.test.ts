import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const refreshKeycloakTokens = vi.fn();

vi.mock("@/lib/auth/keycloak", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/auth/keycloak")
  >("@/lib/auth/keycloak");

  return {
    ...actual,
    refreshKeycloakTokens: (token: string) => refreshKeycloakTokens(token),
  };
});

const { GET } = await import("./route");

/** Minimal HS256-shaped JWT: only the payload is ever decoded here. */
function jwt(claims: Record<string, unknown>): string {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none" })}.${encode(claims)}.signature`;
}

const secondsFromNow = (offset: number) =>
  Math.floor(Date.now() / 1000) + offset;

function requestWithCookies(cookies: Record<string, string>): NextRequest {
  const header = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");

  return new NextRequest("https://mhoubahar.store/api/auth/session", {
    headers: header ? { cookie: header } : {},
  });
}

const validClaims = {
  sub: "user-123",
  preferred_username: "sokha",
  email: "sokha@example.com",
  realm_access: { roles: ["USER"] },
};

describe("GET /api/auth/session", () => {
  beforeEach(() => {
    refreshKeycloakTokens.mockReset();
  });

  it("reports the user without refreshing while the token is still valid", async () => {
    const response = await GET(
      requestWithCookies({
        foodhub_access_token: jwt({ ...validClaims, exp: secondsFromNow(300) }),
        foodhub_refresh_token: "refresh-token",
      }),
    );
    const body = await response.json();

    expect(body.authenticated).toBe(true);
    expect(body.user.uuid).toBe("user-123");
    expect(refreshKeycloakTokens).not.toHaveBeenCalled();
  });

  /**
   * The reported defect: an access token lives about five minutes and its
   * cookie expires with it, so treating that as "logged out" ended every
   * session after minutes regardless of how long Keycloak keeps it alive.
   */
  it("refreshes instead of reporting logged out when the token has expired", async () => {
    refreshKeycloakTokens.mockResolvedValue({
      access_token: jwt({ ...validClaims, exp: secondsFromNow(300) }),
      refresh_token: "rotated-refresh-token",
      expires_in: 300,
      refresh_expires_in: 2_592_000,
    });

    const response = await GET(
      requestWithCookies({
        foodhub_access_token: jwt({ ...validClaims, exp: secondsFromNow(-60) }),
        foodhub_refresh_token: "refresh-token",
      }),
    );
    const body = await response.json();

    expect(refreshKeycloakTokens).toHaveBeenCalledWith("refresh-token");
    expect(body.authenticated).toBe(true);
    expect(body.user.uuid).toBe("user-123");
  });

  it("refreshes when the access token cookie is gone entirely", async () => {
    refreshKeycloakTokens.mockResolvedValue({
      access_token: jwt({ ...validClaims, exp: secondsFromNow(300) }),
      expires_in: 300,
    });

    const response = await GET(
      requestWithCookies({ foodhub_refresh_token: "refresh-token" }),
    );
    const body = await response.json();

    expect(refreshKeycloakTokens).toHaveBeenCalledWith("refresh-token");
    expect(body.authenticated).toBe(true);
  });

  it("writes the rotated tokens back so the next call does not refresh again", async () => {
    refreshKeycloakTokens.mockResolvedValue({
      access_token: jwt({ ...validClaims, exp: secondsFromNow(300) }),
      refresh_token: "rotated-refresh-token",
      expires_in: 300,
      refresh_expires_in: 2_592_000,
    });

    const response = await GET(
      requestWithCookies({ foodhub_refresh_token: "refresh-token" }),
    );

    const setCookie = response.headers.getSetCookie().join("\n");
    expect(setCookie).toContain("foodhub_access_token=");
    expect(setCookie).toContain("foodhub_refresh_token=rotated-refresh-token");
  });

  /**
   * Session length must stay a Keycloak setting: the refresh cookie's lifetime
   * is whatever Keycloak reports, so raising the realm's SSO session lifespan
   * is all that is needed for a week- or month-long session.
   */
  it("gives the refresh cookie the lifetime Keycloak reports", async () => {
    refreshKeycloakTokens.mockResolvedValue({
      access_token: jwt({ ...validClaims, exp: secondsFromNow(300) }),
      refresh_token: "rotated-refresh-token",
      expires_in: 300,
      refresh_expires_in: 2_592_000,
    });

    const response = await GET(
      requestWithCookies({ foodhub_refresh_token: "refresh-token" }),
    );

    const refreshCookie = response.headers
      .getSetCookie()
      .find((cookie) => cookie.startsWith("foodhub_refresh_token="));

    expect(refreshCookie).toContain("Max-Age=2592000");
  });

  it("reports expired only once the refresh token is rejected too", async () => {
    refreshKeycloakTokens.mockResolvedValue(null);

    const response = await GET(
      requestWithCookies({
        foodhub_access_token: jwt({ ...validClaims, exp: secondsFromNow(-60) }),
        foodhub_refresh_token: "dead-refresh-token",
      }),
    );
    const body = await response.json();

    expect(body.authenticated).toBe(false);
    expect(body.expired).toBe(true);
    expect(body.user).toBeNull();
  });

  it("reports logged out, not an error, when no cookies exist at all", async () => {
    const response = await GET(requestWithCookies({}));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.authenticated).toBe(false);
    expect(body.user).toBeNull();
    expect(refreshKeycloakTokens).not.toHaveBeenCalled();
  });
});
