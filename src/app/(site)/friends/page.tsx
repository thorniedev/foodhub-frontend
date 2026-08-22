import { Metadata } from "next";
import FriendsTabs from "@/components/friends/FriendsTabs";

export const metadata: Metadata = {
  title: "មិត្តភក្តិ - Friends | FoodHub",
  description: "Connect with friends on FoodHub, share dietary profiles, and organize group dining meetups.",
};

export default function FriendsPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 px-4 pt-24 pb-16 dark:bg-slate-950 sm:px-6 lg:px-8">
      <FriendsTabs />
    </main>
  );
}
