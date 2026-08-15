"use client";

import {
  useSearchParams,
} from "next/navigation";

function safeReturnTo(
  value: string | null,
) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/dashboard";
  }

  return value;
}

export default function LoginClient() {
  const searchParams =
    useSearchParams();

  const returnTo =
    safeReturnTo(
      searchParams.get(
        "returnTo",
      ),
    );

  const error =
    searchParams.get(
      "error",
    );

  const errorDescription =
    searchParams.get(
      "error_description",
    );

  const loginUrl =
    `/api/auth/login?returnTo=${encodeURIComponent(
      returnTo,
    )}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#136C34]">
            FoodHub
          </h1>

          <p className="mt-3 text-slate-500">
            Sign in to continue to
            your FoodHub account.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4">
            <p className="font-semibold text-red-700">
              Login failed
            </p>

            <p className="mt-1 text-sm text-red-600">
              {errorDescription ??
                error}
            </p>
          </div>
        )}

        <a
          href={loginUrl}
          className="mt-7 flex h-12 w-full items-center justify-center rounded-xl bg-[#136C34] font-semibold text-white transition hover:bg-[#0f592b]"
        >
          Login with FoodHub
        </a>
      </div>
    </main>
  );
}