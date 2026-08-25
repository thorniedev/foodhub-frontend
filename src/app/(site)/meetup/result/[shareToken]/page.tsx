import { Metadata } from "next";
import { Suspense } from "react";

import MeetupResultClient from "@/components/meetup/MeetupResultClient";

interface MeetupResultPageProps {
  params: Promise<{
    shareToken: string;
  }>;
}

export const metadata: Metadata = {
  title: "Meetup Result | FoodHub",
  description: "View the final FoodHub group dining result.",
};

export default async function MeetupResultPage({
  params,
}: MeetupResultPageProps) {
  const { shareToken } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
          Loading meetup result...
        </div>
      }
    >
      <MeetupResultClient shareToken={shareToken} />
    </Suspense>
  );
}
