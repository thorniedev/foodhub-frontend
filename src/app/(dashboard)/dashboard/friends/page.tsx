import { Metadata } from "next";
import FriendsTabs from "@/components/friends/FriendsTabs";

export const metadata: Metadata = {
  title: "មិត្តភក្តិ - Friends | FoodHub Dashboard",
  description: "Manage your friends, dietary profiles, and QR codes.",
};

export default function DashboardFriendsPage() {
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <FriendsTabs />
    </div>
  );
}
