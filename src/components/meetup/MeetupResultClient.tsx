"use client";

import Link from "next/link";
import { Loader2, RefreshCw, Trophy, Vote } from "lucide-react";

import {
  useGetMeetupResultQuery,
  useGetMeetupVoteTallyQuery,
  useResolveMeetupShareTokenQuery,
} from "@/app/store/groupRecommendationApi";
import MeetupWinnerCelebration from "./MeetupWinnerCelebration";

interface MeetupResultClientProps {
  shareToken: string;
}

function isResultReady(status?: string | null, resultReady?: boolean) {
  return resultReady === true || status === "DECIDED";
}

export default function MeetupResultClient({
  shareToken,
}: MeetupResultClientProps) {
  const {
    data: result,
    isLoading: isLoadingResult,
    isFetching: isFetchingResult,
    refetch: refetchResult,
  } = useGetMeetupResultQuery(shareToken, {
    pollingInterval: 5000,
  });

  const {
    data: group,
    isLoading: isLoadingGroup,
    refetch: refetchGroup,
  } = useResolveMeetupShareTokenQuery(shareToken, {
    pollingInterval: 5000,
  });

  const meetupUuid = result?.meetupUuid || group?.uuid || "";
  const {
    data: tally,
    isFetching: isFetchingTally,
    refetch: refetchTally,
  } = useGetMeetupVoteTallyQuery(meetupUuid, {
    skip: !meetupUuid,
    pollingInterval: 5000,
  });

  const ready = isResultReady(result?.status || group?.status, result?.resultReady);
  const hasWinner =
    Boolean(result?.winningCandidateName) ||
    Boolean(result?.winningCandidateId) ||
    Boolean(result?.winningCandidateUuid);

  if (ready && result && hasWinner) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-24 dark:bg-slate-950 sm:px-6">
        <MeetupWinnerCelebration shareToken={shareToken} winningCard={result} />
      </main>
    );
  }

  const isLoading = isLoadingResult || isLoadingGroup;

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-24 dark:bg-slate-950 sm:px-6">
      <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-100 text-accent-700 dark:bg-accent-950 dark:text-accent-300">
            {isLoading ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : (
              <Trophy className="h-7 w-7" />
            )}
          </div>
          <p className="mt-4 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            លទ្ធផលមិនទាន់រួចរាល់
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            ការបោះឆ្នោតកំពុងបន្ត។ ទំព័រនេះនឹងធ្វើបច្ចុប្បន្នភាព
            នៅពេលម្ចាស់ផ្ទះបញ្ចប់ការណាត់ជួប។
          </p>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
              <Vote className="h-4 w-4 text-primary-600" />
              លទ្ធផលបច្ចុប្បន្ន
            </p>
            {(isFetchingResult || isFetchingTally) && (
              <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
            )}
          </div>

          <div className="mt-4 space-y-2">
            {(tally?.tally ?? []).length === 0 ? (
              <p className="text-sm text-slate-500">កំពុងរង់ចាំសំឡេងបោះឆ្នោត។</p>
            ) : (
              tally?.tally.map((entry, index) => (
                <div
                  key={`${entry.candidateUuid}-${index}`}
                  className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 ${
                    entry.isWinner
                      ? "bg-accent-50 ring-1 ring-accent-200 dark:bg-accent-950/30 dark:ring-accent-900"
                      : "bg-white dark:bg-slate-900"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    {entry.isWinner && (
                      <Trophy className="h-3.5 w-3.5 shrink-0 text-accent-500" />
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-slate-800 dark:text-slate-200">
                        {entry.foodName ||
                          entry.candidateName ||
                          entry.candidateUuid}
                      </span>
                      {entry.storeName && (
                        <span className="block truncate text-sm text-slate-400">
                          {entry.storeName}
                        </span>
                      )}
                    </span>
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-sm font-black ${
                      entry.isWinner
                        ? "bg-accent-200 text-accent-900"
                        : "bg-primary-100 text-primary-700"
                    }`}
                  >
                    {entry.voteCount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              void refetchResult();
              void refetchGroup();
              void refetchTally();
            }}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <RefreshCw className="h-4 w-4" />
            ផ្ទុកឡើងវិញ
          </button>

          <Link
            href={`/meet/${encodeURIComponent(shareToken)}`}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary-600 px-5 text-sm font-black text-white shadow-md transition hover:bg-primary-700"
          >
            ត្រឡប់ទៅបោះឆ្នោត
          </Link>
        </div>
      </section>
    </main>
  );
}
