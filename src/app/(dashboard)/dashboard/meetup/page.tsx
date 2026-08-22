import { Metadata } from "next";
import { Suspense } from "react";
import HostMeetupCreate from "@/components/meetup/HostMeetupCreate";

export const metadata: Metadata = {
  title: "ការណាត់ញ៉ាំអាហារ - Meetup | FoodHub Dashboard",
  description: "Create and manage group dining meetups, share guest links, and vote with friends.",
};

export default function DashboardMeetupPage() {
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <Suspense fallback={<div className="py-12 text-center text-slate-500">Loading Meetup...</div>}>
        <HostMeetupCreate />
      </Suspense>
    </div>
  );
}
