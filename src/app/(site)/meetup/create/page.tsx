import { Metadata } from "next";
import HostMeetupCreate from "@/components/meetup/HostMeetupCreate";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "បង្កើត Meetup - Create Meetup | FoodHub",
  description: "Create a dual-mode dining meetup with friends or share a casual guest link for instant team voting.",
};

export default function CreateMeetupPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 px-4 pt-24 pb-16 dark:bg-slate-950 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center py-20 text-slate-500">Loading meetup builder...</div>}>
        <HostMeetupCreate />
      </Suspense>
    </main>
  );
}
