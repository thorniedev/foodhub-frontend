import { afterEach, describe, expect, it, vi } from "vitest";

import { getAuthCookieOptions } from "./keycloak";

/**
 * Regression coverage for the cookie-domain fix: without an explicit Domain
 * attribute, a cookie is only visible on the exact host that set it. A
 * login started on "www.mhoubahar.store" would set foodhub_oauth_state
 * there, but the OAuth redirect_uri (built from APP_URL) always points at
 * the bare apex domain — so Keycloak's redirect back landed on a host that
 * never saw the cookie, and the callback's state-match check failed
 * ("invalid_state" / "Session expired").
 */
describe("getAuthCookieOptions", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("scopes the cookie to the apex domain in production, regardless of a www APP_URL", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_URL", "https://www.mhoubahar.store");

    expect(getAuthCookieOptions().domain).toBe(".mhoubahar.store");
  });

  it("scopes the cookie to the apex domain in production for a bare APP_URL", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_URL", "https://mhoubahar.store");

    expect(getAuthCookieOptions().domain).toBe(".mhoubahar.store");
  });

  it("does not set a cookie domain outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("APP_URL", "http://localhost:3000");

    expect(getAuthCookieOptions().domain).toBeUndefined();
  });

  it("still marks cookies httpOnly and lax regardless of environment", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_URL", "https://mhoubahar.store");

    const options = getAuthCookieOptions();

    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.secure).toBe(true);
  });
});
