"use client";

import { useEffect, useMemo, useState } from "react";

import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import {
  IoCheckmarkCircle,
  IoCloseOutline,
  IoLocationOutline,
  IoPeopleOutline,
  IoRefreshOutline,
  IoTrophyOutline,
} from "react-icons/io5";

import { FaStar, FaStore } from "react-icons/fa";

import {
  useGetGroupVotingQuery,
  useSubmitGroupVoteMutation,
} from "@/app/store/groupRecommendationApi";

import type { VotingPanelStore } from "@/types/group-recommendation";

type VotingLeaderboardProps = {
  open: boolean;
  groupId: string;
  stores: VotingPanelStore[];

  initialStoreId?: string | null;

  onClose: () => void;
};

type RankedStore = VotingPanelStore & {
  voteCount: number;
  percentage: number;
};

export default function VotingLeaderboard({
  open,
  groupId,
  stores,
  initialStoreId = null,
  onClose,
}: VotingLeaderboardProps) {
  const [mounted, setMounted] = useState(false);

  const [submittingStoreId, setSubmittingStoreId] = useState<string | null>(
    null,
  );

  const {
    data: votingData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetGroupVotingQuery(groupId, {
    skip: !open || !groupId,
    pollingInterval: open ? 5_000 : 0,
  });

  const [submitVote, { isLoading: isSubmittingVote }] =
    useSubmitGroupVoteMutation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  const rankedStores = useMemo<RankedStore[]>(() => {
    const voteMap = new Map(
      votingData?.stores.map((store) => [store.storeId, store.voteCount]) ?? [],
    );

    const totalVotes = votingData?.totalVotes ?? 0;

    return stores
      .map((store) => {
        const voteCount = voteMap.get(store.uuid) ?? store.voteCount ?? 0;

        const percentage =
          totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

        return {
          ...store,
          voteCount,
          percentage,
        };
      })
      .sort((first, second) => {
        if (second.voteCount !== first.voteCount) {
          return second.voteCount - first.voteCount;
        }

        if (second.recommendationScore !== first.recommendationScore) {
          return second.recommendationScore - first.recommendationScore;
        }

        return first.distanceKm - second.distanceKm;
      });
  }, [stores, votingData]);

  const selectedStoreId = votingData?.myVoteStoreId ?? initialStoreId;

  const handleVote = async (storeId: string) => {
    if (!groupId || !votingData?.votingOpen) {
      return;
    }

    try {
      setSubmittingStoreId(storeId);

      await submitVote({
        groupId,
        storeId,
      }).unwrap();
    } catch (error) {
      console.error("Failed to submit group vote:", error);
    } finally {
      setSubmittingStoreId(null);
    }
  };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="voting-panel-overlay"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.2,
          }}
          className="
            fixed inset-0 z-[200]
            flex items-end justify-center
            bg-black/50 backdrop-blur-[3px]
            md:items-center md:p-6
          "
        >
          <button
            type="button"
            aria-label="Close voting panel"
            onClick={onClose}
            className="absolute inset-0 cursor-default"
          />

          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="voting-panel-title"
            initial={{
              y: "100%",
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: "100%",
              opacity: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="
              relative z-10 flex
              h-[92dvh] w-full
              flex-col overflow-hidden
              rounded-t-[28px]
              border border-gray-100
              bg-[#fafaf8]
              shadow-2xl

              md:h-auto
              md:max-h-[88dvh]
              md:max-w-5xl
              md:rounded-[28px]
            "
          >
            {/* Fixed header */}
            <header className="shrink-0 border-b border-gray-100 bg-white px-4 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-primary-700">
                    <IoTrophyOutline className="shrink-0 text-[21px]" />

                    <p className="text-[16px] font-semibold">Group voting</p>
                  </div>

                  <h2
                    id="voting-panel-title"
                    className="mt-1 text-[21px] font-semibold leading-8 text-primary-900 sm:text-[23px]"
                  >
                    ជ្រើសរើសហាងសម្រាប់ក្រុម
                  </h2>

                  <p className="mt-1 text-[16px] leading-7 text-gray-500">
                    បោះឆ្នោតជ្រើសរើសហាងមួយដែលក្រុមចង់ទៅ។
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close voting panel"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-primary-50 hover:text-primary-700"
                >
                  <IoCloseOutline className="text-[24px]" />
                </button>
              </div>

              {/* Summary */}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <SummaryCard
                  icon={<IoPeopleOutline />}
                  label="បានបោះឆ្នោត"
                  value={`${votingData?.totalVotes ?? 0} / ${
                    votingData?.totalMembers ?? 0
                  }`}
                />

                <SummaryCard
                  icon={<FaStore />}
                  label="ហាងណែនាំ"
                  value={String(stores.length)}
                />

                <div className="col-span-2 sm:col-span-1">
                  <SummaryCard
                    icon={
                      votingData?.votingOpen ? (
                        <IoCheckmarkCircle />
                      ) : (
                        <IoTrophyOutline />
                      )
                    }
                    label="ស្ថានភាព"
                    value={
                      votingData?.votingOpen ? "កំពុងបោះឆ្នោត" : "បានបញ្ចប់"
                    }
                  />
                </div>
              </div>
            </header>

            {/* Scrollable voting content */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
              {isLoading ? (
                <VotingLoadingState />
              ) : isError ? (
                <VotingErrorState onRetry={refetch} />
              ) : rankedStores.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-gray-200 bg-white px-5 py-12 text-center">
                  <FaStore className="mx-auto text-[40px] text-primary-300" />

                  <h3 className="mt-3 text-[19px] font-semibold text-primary-900">
                    មិនមានហាងសម្រាប់បោះឆ្នោត
                  </h3>

                  <p className="mt-2 text-[16px] leading-7 text-gray-500">
                    សូមគណនាការណែនាំសម្រាប់ក្រុមជាមុនសិន។
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rankedStores.map((store, index) => {
                    const selected = selectedStoreId === store.uuid;

                    const submitting =
                      isSubmittingVote && submittingStoreId === store.uuid;

                    return (
                      <VotingStoreRow
                        key={store.uuid}
                        rank={index + 1}
                        store={store}
                        selected={selected}
                        votingOpen={votingData?.votingOpen ?? false}
                        submitting={submitting}
                        onVote={() => handleVote(store.uuid)}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Fixed footer */}
            <footer className="shrink-0 border-t border-gray-100 bg-white px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[16px] leading-7 text-gray-500">
                  {selectedStoreId
                    ? "អ្នកអាចផ្លាស់ប្ដូរសំឡេងឆ្នោតបាន រហូតដល់ការបោះឆ្នោតត្រូវបានបញ្ចប់។"
                    : "សូមជ្រើសរើសហាងមួយដើម្បីបោះឆ្នោត។"}
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-11 shrink-0 rounded-full bg-primary-800 px-6 text-[16px] font-semibold text-white transition hover:bg-primary-700 active:scale-[0.98]"
                >
                  រួចរាល់
                </button>
              </div>
            </footer>

            {isFetching && !isLoading && (
              <div className="absolute right-5 top-5 hidden items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-primary-700 lg:flex">
                <IoRefreshOutline className="animate-spin" />

                <span className="text-[14px]">Updating</span>
              </div>
            )}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

type VotingStoreRowProps = {
  rank: number;
  store: RankedStore;
  selected: boolean;
  votingOpen: boolean;
  submitting: boolean;
  onVote: () => void;
};

function VotingStoreRow({
  rank,
  store,
  selected,
  votingOpen,
  submitting,
  onVote,
}: VotingStoreRowProps) {
  return (
    <article
      className={`rounded-[20px] border bg-white p-3 transition sm:p-4 ${
        selected
          ? "border-primary-600 ring-2 ring-primary-100"
          : "border-gray-100 hover:border-primary-200 hover:shadow-sm"
      }`}
    >
      <div className="grid min-w-0 gap-4 sm:grid-cols-[auto_80px_minmax(0,1fr)_auto] sm:items-center">
        {/* Rank */}
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full text-[16px] font-semibold ${
            rank === 1
              ? "bg-yellow-100 text-yellow-700"
              : rank === 2
                ? "bg-gray-200 text-gray-700"
                : rank === 3
                  ? "bg-orange-100 text-orange-700"
                  : "bg-primary-50 text-primary-700"
          }`}
        >
          {rank}
        </div>

        {/* Store image */}
        <div className="relative hidden h-16 w-20 overflow-hidden rounded-[14px] bg-primary-50 sm:block">
          {store.coverImageUrl ? (
            <Image
              fill
              src={store.coverImageUrl}
              alt={store.localName || store.name}
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <FaStore className="text-[24px] text-primary-600" />
            </div>
          )}
        </div>

        {/* Store information */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[17px] font-semibold text-primary-900">
              {store.localName || store.name}
            </h3>

            {selected && (
              <span className="rounded-full bg-primary-100 px-2.5 py-1 text-[14px] font-semibold text-primary-800">
                សំឡេងរបស់អ្នក
              </span>
            )}
          </div>

          {store.localName && (
            <p className="mt-0.5 truncate text-[16px] text-gray-500">
              {store.name}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-gray-500">
            <span className="flex items-center gap-1.5 text-yellow-500">
              <FaStar />
              {store.averageRating}
            </span>

            <span className="flex items-center gap-1.5">
              <IoLocationOutline />
              {store.distanceKm.toFixed(1)} km
            </span>

            <span>{store.menuCount} មុខម្ហូប</span>

            <span>{Math.round(store.recommendationScore * 100)}% match</span>
          </div>

          {/* Vote progress */}
          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-[15px] font-medium text-gray-600">
                {store.voteCount} votes
              </span>

              <span className="text-[15px] font-semibold text-primary-700">
                {store.percentage}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${store.percentage}%`,
                }}
                transition={{
                  duration: 0.35,
                }}
                className="h-full rounded-full bg-primary-700"
              />
            </div>
          </div>
        </div>

        {/* Vote button on the right */}
        <button
          type="button"
          onClick={onVote}
          disabled={!votingOpen || submitting}
          className={`min-h-11 w-full shrink-0 rounded-full px-5 text-[16px] font-semibold transition sm:w-auto ${
            selected
              ? "border border-primary-200 bg-primary-50 text-primary-800"
              : "bg-primary-800 text-white hover:bg-primary-700"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {submitting
            ? "កំពុងបោះឆ្នោត..."
            : selected
              ? "បានបោះឆ្នោត"
              : votingOpen
                ? "បោះឆ្នោត"
                : "បិទ"}
        </button>
      </div>
    </article>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[16px] border border-gray-100 bg-gray-50 px-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[18px] text-primary-700">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[14px] text-gray-500">{label}</p>

        <p className="truncate text-[16px] font-semibold text-primary-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function VotingLoadingState() {
  return (
    <div className="space-y-3">
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div
          key={index}
          className="h-[145px] animate-pulse rounded-[20px] bg-gray-100"
        />
      ))}
    </div>
  );
}

function VotingErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-[20px] border border-red-100 bg-white px-5 py-12 text-center">
      <p className="text-[18px] font-semibold text-red-500">
        មិនអាចទាញយកការបោះឆ្នោតបានទេ
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-full bg-primary-800 px-5 py-2.5 text-[16px] font-semibold text-white"
      >
        ព្យាយាមម្តងទៀត
      </button>
    </div>
  );
}
