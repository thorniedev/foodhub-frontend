"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Loader2,
  MapPin,
  Trophy,
  Users,
  Vote,
} from "lucide-react";

import { useGetCurrentUserQuery } from "@/app/store/auth/currentUserApi";
import { useGetMyMeetupsQuery } from "@/app/store/groupRecommendationApi";
import type { MeetupGroupStatus } from "@/types/meetup-api";

const STATUS_LABEL: Record<string, string> = {
  COLLECTING: "កំពុងប្រមូលអ្នកចូលរួម",
  RECOMMENDING: "កំពុងណែនាំម្ហូប",
  VOTING: "កំពុងបោះឆ្នោត",
  DECIDED: "សម្រេចរួច",
  CANCELLED: "បានលុបចោល",
};

const STATUS_STYLE: Record<string, string> = {
  COLLECTING: "bg-primary-50 text-primary-700 ring-primary-200",
  RECOMMENDING: "bg-primary-50 text-primary-700 ring-primary-200",
  VOTING: "bg-accent-50 text-accent-700 ring-accent-200",
  DECIDED: "bg-secondary-50 text-secondary-700 ring-secondary-200",
  CANCELLED: "bg-slate-100 text-slate-500 ring-slate-200",
};

function statusLabel(status: MeetupGroupStatus | null) {
  return (status && STATUS_LABEL[status]) || "ការណាត់ជួប";
}

function statusStyle(status: MeetupGroupStatus | null) {
  return (
    (status && STATUS_STYLE[status]) ||
    "bg-slate-100 text-slate-600 ring-slate-200"
  );
}

export default function MyMeetupsList() {
  const { data: user } = useGetCurrentUserQuery();

  const { data, isLoading, isError } = useGetMyMeetupsQuery(
    { page: 0, size: 6 },
    { skip: !user },
  );

  /* Signed-out visitors see the marketing sections only. */
  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="flex min-h-40 items-center justify-center rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
      </section>
    );
  }

  /* A failed list must not break the page for a signed-in host. */
  if (isError || !data || data.contents.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
            ការណាត់ជួបរបស់អ្នក
          </p>
          <p className="mt-1 text-sm text-slate-500 lg:text-base">
            បន្តការណាត់ជួបដែលអ្នកបានបង្កើត
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-sm font-bold text-primary-700 ring-1 ring-primary-100 dark:bg-primary-950/40 dark:text-primary-300">
          <Users className="h-3.5 w-3.5 shrink-0" />
          {data.totalElements} សរុប
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data.contents.map((meetup) => {
          const isDecided = meetup.status === "DECIDED";
          const place =
            [meetup.targetAreaName, meetup.targetCity]
              .filter(Boolean)
              .join(", ") ||
            (meetup.searchRadiusKm
              ? `ជុំវិញ ${meetup.searchRadiusKm} គ.ម`
              : "តាមតំបន់");

          return (
            <article
              key={meetup.uuid ?? meetup.id}
              className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-primary-300 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 flex-1 truncate text-base font-black text-slate-900 dark:text-white lg:text-lg">
                  {meetup.title || "ការណាត់ញ៉ាំអាហារ"}
                </p>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-sm font-bold ring-1 ${statusStyle(meetup.status)}`}
                >
                  {statusLabel(meetup.status)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{place}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  {meetup.participants.length} នាក់
                </span>
                {meetup.durationMinutes ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                    {meetup.durationMinutes} នាទី
                  </span>
                ) : null}
              </div>

              {meetup.shareToken ? (
                <Link
                  href={
                    isDecided
                      ? `/meetup/result/${encodeURIComponent(meetup.shareToken)}`
                      : `/meet/${encodeURIComponent(meetup.shareToken)}`
                  }
                  className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 text-sm font-black text-white transition hover:bg-primary-700"
                >
                  {isDecided ? (
                    <Trophy className="h-4 w-4 shrink-0" />
                  ) : (
                    <Vote className="h-4 w-4 shrink-0" />
                  )}
                  {isDecided ? "មើលលទ្ធផល" : "បន្តបោះឆ្នោត"}
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                </Link>
              ) : (
                /* The share token is returned once at creation and never again. */
                <p className="mt-auto rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-400 dark:bg-slate-950">
                  តំណចែករំលែកមិនមានទេ
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
