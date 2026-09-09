"use client";

import ReactDOM from "react-dom";

/**
 * Warms the connection to Keycloak while the page is still loading, so the
 * TLS handshake is already done by the time someone clicks Login. Measured
 * separately: this app's own /api/auth/login redirect responds in ~25ms,
 * but reaching Keycloak's hosted login form afterward took 0.5-6.8s across
 * repeated tests -- almost entirely connection setup on a cold connection.
 * Called directly during render (not in an effect) so it lands in the
 * server-rendered <head> on the very first response.
 */
export default function PreconnectHints() {
  const keycloakUrl =
    process.env.NEXT_PUBLIC_KEYCLOAK_URL || "https://auth.mhoubahar.store";

  ReactDOM.preconnect(keycloakUrl);

  return null;
}
