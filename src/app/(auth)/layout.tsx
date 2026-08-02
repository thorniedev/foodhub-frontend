import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "Authentication | FoodHub",
    template: "%s | FoodHub",
  },
  description: "Sign in or create your FoodHub account.",
};

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* <header className="border-b bg-background">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            FoodHub
          </Link>
        </div>
      </header> */}

      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
