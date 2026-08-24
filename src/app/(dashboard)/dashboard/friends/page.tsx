import { Metadata } from "next";
import { Suspense } from "react";
import FriendsTabs from "@/components/friends/FriendsTabs";

export const metadata: Metadata = {
  title: "មិត្តភក្តិ - Friends | FoodHub Dashboard",
  description: "Manage your friends, dietary profiles, and QR codes.",
};

export default function DashboardFriendsPage() {
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <Suspense
        fallback={
          <div className="mx-auto flex h-64 max-w-5xl items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          </div>
        }
      >
        <FriendsTabs />
      </Suspense>
    </div>
  );
}
