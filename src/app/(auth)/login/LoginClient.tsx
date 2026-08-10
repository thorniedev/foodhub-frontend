"use client";

import Link from "next/link";
import { useState } from "react";

type LoginClientProps = {
  returnTo: string;
};

export default function LoginClient({ returnTo }: LoginClientProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleLogin = () => {
    setIsRedirecting(true);

    window.location.assign(
      `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`,
    );
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">FoodHub</h1>

          <h2 className="text-xl font-semibold">Sign in to your account</h2>

          <p className="text-muted-foreground">
            Continue with your Keycloak-powered FoodHub session.
          </p>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={handleLogin}
            disabled={isRedirecting}
            className="w-full rounded-xl bg-primary px-5 py-3.5 text-base font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRedirecting
              ? "Redirecting to Keycloak..."
              : "Continue with Keycloak"}
          </button>

          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Create one
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
