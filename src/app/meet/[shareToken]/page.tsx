import { Metadata } from "next";
import MeetupLiveRoom from "@/components/meetup/MeetupLiveRoom";
import { Suspense } from "react";

interface MeetPageProps {
  params: Promise<{
    shareToken: string;
  }>;
}

export const metadata: Metadata = {
  title: "ចូលរួម Meetup - Join Group Dining | FoodHub",
  description: "Join your group dining session, set dietary safety preferences, and vote on what to eat together.",
};

export default async function MeetGuestPage({ params }: MeetPageProps) {
  const { shareToken } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
          Loading group dining room...
        </div>
      }
    >
      <MeetupLiveRoom shareToken={shareToken} />
    </Suspense>
  );
}
