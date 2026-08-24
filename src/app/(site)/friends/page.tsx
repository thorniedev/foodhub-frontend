import { Metadata } from "next";
import { Suspense } from "react";
import FriendsTabs from "@/components/friends/FriendsTabs";

export const metadata: Metadata = {
  title: "មិត្តភក្តិ - Friends | FoodHub",
  description: "Connect with friends on FoodHub, share dietary profiles, and organize group dining meetups.",
};

export default function FriendsPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 px-4 pt-24 pb-16 dark:bg-slate-950 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="mx-auto flex h-64 max-w-5xl items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          </div>
        }
      >
        <FriendsTabs />
      </Suspense>
    </main>
  );
}
