import { Metadata } from "next";
import MeetupLiveRoom from "@/components/meetup/MeetupLiveRoom";
import { Suspense } from "react";

interface MeetupRoomPageProps {
  params: Promise<{
    uuid: string;
  }>;
}

export const metadata: Metadata = {
  title: "Live Meetup Voting | FoodHub",
  description: "Live group dining voting room on FoodHub.",
};

export default async function MeetupRoomPage({ params }: MeetupRoomPageProps) {
  const { uuid } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 dark:bg-slate-950">
          Loading live meetup room...
        </div>
      }
    >
      {/* Host route: the meetup uuid resolves through the owner endpoint. */}
      <MeetupLiveRoom meetupUuid={uuid} />
    </Suspense>
  );
}
