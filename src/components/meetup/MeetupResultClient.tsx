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
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            {isLoading ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : (
              <Trophy className="h-7 w-7" />
            )}
          </div>
          <h1 className="mt-4 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Result not ready yet
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Voting is still open. This page will update when the host completes
            the meetup.
          </p>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
              <Vote className="h-4 w-4 text-emerald-600" />
              Current tally
            </h2>
            {(isFetchingResult || isFetchingTally) && (
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            )}
          </div>

          <div className="mt-4 space-y-2">
            {(tally?.tally ?? []).length === 0 ? (
              <p className="text-sm text-slate-500">Waiting for votes.</p>
            ) : (
              tally?.tally.map((entry, index) => (
                <div
                  key={`${entry.candidateUuid}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 dark:bg-slate-900"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-800 dark:text-slate-200">
                      {entry.foodName || entry.candidateName || entry.candidateUuid}
                    </span>
                    {entry.storeName && (
                      <span className="block truncate text-xs text-slate-400">
                        {entry.storeName}
                      </span>
                    )}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700">
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
            Refresh
          </button>

          <Link
            href={`/meet/${encodeURIComponent(shareToken)}`}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-black text-white shadow-md transition hover:bg-emerald-700"
          >
            Back to vote
          </Link>
        </div>
      </section>
    </main>
  );
}
