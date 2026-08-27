"use client";

import { BarChart3, Loader2, Trophy } from "lucide-react";

import type { MeetupVoteTallyEntry } from "@/types/meetup-api";

interface MeetupTallyPanelProps {
  tally: readonly MeetupVoteTallyEntry[];
  totalVotes: number;
  isFetching: boolean;
  isApprovalVoting: boolean;
}

export default function MeetupTallyPanel({
  tally,
  totalVotes,
  isFetching,
  isApprovalVoting,
}: MeetupTallyPanelProps) {
  const topVoteCount = tally.reduce(
    (highest, entry) => Math.max(highest, entry.voteCount),
    0,
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base! font-black text-slate-900 dark:text-white">
            <BarChart3 className="h-4 w-4 shrink-0 text-primary-600" />
            លទ្ធផលបន្តផ្ទាល់
          </h2>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">
            {isApprovalVoting
              ? "បោះឆ្នោតបែបយល់ព្រម — អាចជ្រើសរើសម្ហូបច្រើនមុខ។"
              : "ម្នាក់មួយសំឡេង — បោះម្ដងទៀតនឹងផ្លាស់ប្ដូរសំឡេង។"}
          </p>
        </div>
        {isFetching && (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary-600" />
        )}
      </div>

      <div className="mt-4 space-y-2.5">
        {tally.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs font-semibold leading-5 text-slate-400 dark:border-slate-800">
            មិនទាន់មានសំឡេងបោះឆ្នោតទេ។
            <br />
            សំឡេងដំបូងនឹងបង្ហាញនៅទីនេះ។
          </p>
        ) : (
          tally.map((entry, index) => {
            const widthPercent =
              topVoteCount > 0
                ? Math.round((entry.voteCount / topVoteCount) * 100)
                : 0;

            return (
              <div
                key={`${entry.foodUuid ?? entry.candidateUuid}-${index}`}
                className={`rounded-2xl p-3 transition ${
                  entry.isWinner
                    ? "bg-accent-50 ring-1 ring-accent-200 dark:bg-accent-950/30 dark:ring-accent-900"
                    : "bg-slate-50 dark:bg-slate-950/60"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="flex min-w-0 items-center gap-1.5 text-sm font-black text-slate-800 dark:text-slate-200">
                    {entry.isWinner && (
                      <Trophy className="h-3.5 w-3.5 shrink-0 text-accent-500" />
                    )}
                    <span className="truncate">
                      {entry.foodName ||
                        entry.candidateName ||
                        "ម្ហូបគ្មានឈ្មោះ"}
                    </span>
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-black ${
                      entry.isWinner
                        ? "bg-accent-200 text-accent-900"
                        : "bg-primary-100 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300"
                    }`}
                  >
                    {entry.voteCount}
                  </span>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white dark:bg-slate-900">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      entry.isWinner ? "bg-accent-400" : "bg-primary-400"
                    }`}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      <p className="mt-4 border-t border-slate-100 pt-3 text-xs font-bold text-slate-500 dark:border-slate-800 dark:text-slate-400">
        សំឡេងសរុប៖ {totalVotes}
      </p>
    </section>
  );
}
