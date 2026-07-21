import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      <h1 className="text-8xl font-bold text-green-600">404</h1>

      <h2 className="mt-4 text-3xl font-semibold text-gray-800">
        Page Not Found
      </h2>

      <p className="mt-3 text-gray-500 max-w-md">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>

      <Link
        href="/"
        className="mt-8 rounded-full bg-green-600 px-6 py-3 text-white hover:bg-green-700 transition"
      >
        Back to Home
      </Link>
    </main>
  );
}
