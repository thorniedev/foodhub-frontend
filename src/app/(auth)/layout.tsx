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
    <div className="min-h-screen w-full bg-background">
      {children}
    </div>
  );
}
