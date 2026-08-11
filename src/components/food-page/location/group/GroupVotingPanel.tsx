"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  IoCheckmarkCircle,
  IoCloseOutline,
  IoLocationOutline,
  IoPeopleOutline,
  IoTrophyOutline,
} from "react-icons/io5";
import { FaStar, FaStore } from "react-icons/fa";

import type { SharedGroupSession } from "@/types/group-recommendation";
import type { RecommendedStore } from "@/types/location";

import GroupWinnerResult from "./GroupWinnerResult";

interface GroupVotingPanelProps {
  open: boolean;
  session: SharedGroupSession | null;
  shareUrl: string;
  currentMemberUuid: string | null;
  isSubmittingVote: boolean;
  isFinishing: boolean;
  errorMessage: string | null;

  onVote: (storeUuid: string) => void;
  onFinish: () => void;
  onClose: () => void;
  onRestart: () => void;
}

function getStoreName(store: RecommendedStore): string {
  return store.localName?.trim() || store.name;
}

export default function GroupVotingPanel({
  open,
  session,
  shareUrl,
  currentMemberUuid,
  isSubmittingVote,
  isFinishing,
  errorMessage,
  onVote,
  onFinish,
  onClose,
  onRestart,
}: GroupVotingPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  const rankedStores = useMemo(() => {
    if (!session) {
      return [];
    }

    const voteCounts = new Map<string, number>();

    session.votes.forEach((vote) => {
      voteCounts.set(vote.storeUuid, (voteCounts.get(vote.storeUuid) ?? 0) + 1);
    });

    return session.stores
      .map((store) => ({
        store,
        voteCount: voteCounts.get(store.uuid) ?? 0,
      }))
      .sort(
        (first, second) =>
          second.voteCount - first.voteCount ||
          second.store.recommendationScore - first.store.recommendationScore ||
          first.store.distanceKm - second.store.distanceKm,
      );
  }, [session]);

  const currentVote = useMemo(() => {
    if (!session || !currentMemberUuid) {
      return null;
    }

    return (
      session.votes.find((vote) => vote.memberUuid === currentMemberUuid) ??
      null
    );
  }, [currentMemberUuid, session]);

  const votedCount = useMemo(
    () => new Set(session?.votes.map((vote) => vote.memberUuid) ?? []).size,
    [session?.votes],
  );

  const winner = useMemo(() => {
    if (!session?.winnerStoreUuid) {
      return null;
    }

    return (
      session.stores.find((store) => store.uuid === session.winnerStoreUuid) ??
      null
    );
  }, [session]);

  const winnerVoteCount = useMemo(() => {
    if (!winner || !session) {
      return 0;
    }

    return session.votes.filter((vote) => vote.storeUuid === winner.uuid)
      .length;
  }, [session, winner]);

  const isCompleted = session?.status === "COMPLETED" && Boolean(winner);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="
            fixed inset-0 z-[300]
            flex items-end justify-center
            bg-slate-950/55
            backdrop-blur-sm
            sm:items-center sm:p-5
          "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label="Group voting panel"
            initial={{
              y: 44,
              opacity: 0,
              scale: 0.99,
            }}
            animate={{
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            exit={{
              y: 44,
              opacity: 0,
              scale: 0.99,
            }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 28,
            }}
            className="
              relative
              flex max-h-[96dvh] w-full max-w-6xl
              flex-col
              overflow-hidden
              rounded-t-[28px]
              border border-gray-200
              bg-white
              shadow-[0_30px_90px_rgba(15,23,42,0.28)]
              sm:max-h-[92dvh]
              sm:rounded-[28px]
            "
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close voting panel"
              className="
                absolute right-3 top-3 z-30
                flex h-11 w-11
                items-center justify-center
                rounded-full
                border border-gray-200
                bg-white
                text-gray-500
                shadow-sm
                transition
                hover:border-primary-200
                hover:bg-primary-50
                hover:text-primary-800 dark:text-primary-dark
                sm:right-4 sm:top-4
              "
            >
              <IoCloseOutline className="text-[24px]" />
            </button>

            <div
              className="
                min-h-0 flex-1
                overflow-y-auto
                overscroll-contain
                px-4 pb-4 pt-16
                [scrollbar-width:thin]
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-gray-300
                sm:px-5 sm:pb-5 sm:pt-5
                lg:px-6 lg:pb-6
              "
            >
              {isCompleted && winner ? (
                <GroupWinnerResult
                  winner={winner}
                  winnerVoteCount={winnerVoteCount}
                  memberCount={session?.members.length ?? 0}
                  shareUrl={shareUrl}
                  compact
                  onRestart={onRestart}
                />
              ) : !session ? (
                <div className="flex min-h-[300px] items-center justify-center text-center">
                  <div>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-800 dark:text-primary-dark">
                      <FaStore className="text-[26px]" />
                    </div>

                    <p className="mt-4 text-[20px] font-bold text-primary-900">
                      កំពុងរៀបចំការបោះឆ្នោត...
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4 pr-14">
                    <p className="text-[22px] font-bold leading-8 text-primary-900 sm:text-[24px]">
                      បោះឆ្នោតជ្រើសរើសហាង
                    </p>

                    <p className="mt-1 text-[17px] leading-8 text-gray-500">
                      ចុចលើហាងមួយដើម្បីបោះឆ្នោត។
                      អ្នកអាចផ្លាស់ប្ដូរជម្រើសរបស់អ្នកមុនពេលបញ្ចប់ការបោះឆ្នោត។
                    </p>
                  </div>

                  <LiveLeaderboard
                    rankedStores={rankedStores}
                    votedCount={votedCount}
                    memberCount={session.members.length}
                  />

                  <div className="mb-4 grid gap-3 sm:grid-cols-2">
                    <MiniMetric
                      icon={<IoPeopleOutline />}
                      label="Participants"
                      value={String(session.members.length)}
                    />

                    <MiniMetric
                      icon={<IoCheckmarkCircle />}
                      label="Votes in"
                      value={`${votedCount}/${session.members.length}`}
                    />
                  </div>

                  {errorMessage && (
                    <div className="mb-4 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-[17px] leading-8 text-red-700">
                      {errorMessage}
                    </div>
                  )}

                  <div className="overflow-hidden rounded-[20px] border border-gray-200 bg-white">
                    <div
                      className="
                        hidden
                        grid-cols-[48px_minmax(240px,1fr)_100px_100px_110px_100px]
                        items-center
                        gap-3
                        border-b border-gray-200
                        bg-gray-50
                        px-4 py-3
                        text-[17px] font-semibold text-gray-500
                        lg:grid
                      "
                    >
                      <span>#</span>
                      <span>Store</span>
                      <span>Rating</span>
                      <span>Distance</span>
                      <span>Match</span>
                      <span className="text-right">Votes</span>
                    </div>

                    <div className="divide-y divide-gray-200">
                      {rankedStores.map(({ store, voteCount }, index) => {
                        const selected = currentVote?.storeUuid === store.uuid;

                        const imageUrl =
                          store.coverImageUrl || store.logoUrl || null;

                        return (
                          <motion.button
                            layout
                            key={store.uuid}
                            type="button"
                            disabled={isSubmittingVote}
                            onClick={() => onVote(store.uuid)}
                            whileTap={{ scale: 0.995 }}
                            className={`
                                block w-full
                                px-3 py-3
                                text-left
                                transition
                                sm:px-4
                                ${
                                  selected
                                    ? "bg-primary-50"
                                    : "bg-white hover:bg-gray-50"
                                }
                                disabled:cursor-wait
                                disabled:opacity-70
                              `}
                          >
                            <div
                              className="
                                  grid
                                  grid-cols-[42px_minmax(0,1fr)]
                                  items-start
                                  gap-3
                                  lg:grid-cols-[48px_minmax(240px,1fr)_100px_100px_110px_100px]
                                  lg:items-center
                                "
                            >
                              <span
                                className={`
                                    flex h-9 w-9
                                    items-center justify-center
                                    rounded-full
                                    border
                                    text-[17px] font-bold
                                    ${
                                      selected
                                        ? "border-primary-300 bg-primary-800 text-white"
                                        : "border-gray-200 bg-white text-primary-900"
                                    }
                                  `}
                              >
                                {index + 1}
                              </span>

                              <div className="min-w-0">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div
                                    className="
                                        relative
                                        hidden h-12 w-12
                                        shrink-0 overflow-hidden
                                        rounded-[12px]
                                        bg-primary-50
                                        sm:block
                                      "
                                  >
                                    {imageUrl ? (
                                      <div
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{
                                          backgroundImage: `url("${imageUrl}")`,
                                        }}
                                      />
                                    ) : (
                                      <div className="absolute inset-0 flex items-center justify-center text-primary-700">
                                        <FaStore className="text-[22px]" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <div className="flex min-w-0 items-center gap-2">
                                      <p className="truncate text-[18px] font-bold text-primary-900">
                                        {getStoreName(store)}
                                      </p>

                                      {selected && (
                                        <IoCheckmarkCircle className="shrink-0 text-[20px] text-primary-700" />
                                      )}
                                    </div>

                                    <div className="mt-1 flex items-start gap-1.5 text-[17px] leading-7 text-gray-500">
                                      <IoLocationOutline className="mt-1 shrink-0 text-primary-700" />
                                      <p className="line-clamp-1">
                                        {store.addressLine ||
                                          "No address available"}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2 lg:hidden">
                                  <DataChip>
                                    <FaStar className="text-secondary-500" />
                                    {store.averageRating > 0
                                      ? store.averageRating.toFixed(1)
                                      : "ថ្មី"}
                                  </DataChip>

                                  <DataChip>
                                    {store.distanceKm.toFixed(1)} km
                                  </DataChip>

                                  <DataChip>
                                    Match {store.recommendationScore}%
                                  </DataChip>

                                  <DataChip strong={selected}>
                                    {voteCount} votes
                                  </DataChip>
                                </div>
                              </div>

                              <div className="hidden text-[17px] font-semibold text-gray-700 lg:flex lg:items-center lg:gap-1.5">
                                <FaStar className="text-secondary-500" />
                                {store.averageRating > 0
                                  ? store.averageRating.toFixed(1)
                                  : "ថ្មី"}
                              </div>

                              <div className="hidden text-[17px] font-semibold text-gray-700 lg:block">
                                {store.distanceKm.toFixed(1)} km
                              </div>

                              <div className="hidden text-[17px] font-semibold text-gray-700 lg:block">
                                {store.recommendationScore}%
                              </div>

                              <div className="hidden text-right lg:block">
                                <span
                                  className={`
                                      inline-flex min-w-[72px]
                                      items-center justify-center
                                      rounded-full
                                      px-3 py-1.5
                                      text-[17px] font-bold
                                      ${
                                        selected
                                          ? "bg-primary-800 text-white"
                                          : "bg-primary-50 text-primary-800 dark:text-primary-dark"
                                      }
                                    `}
                                >
                                  {voteCount} votes
                                </span>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {session && session.status === "VOTING" && (
              <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-4 sm:px-5 lg:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[17px] leading-8 text-gray-500">
                    {currentVote
                      ? "ជម្រើសរបស់អ្នកត្រូវបានរក្សាទុក។"
                      : "សូមជ្រើសរើសហាងមួយសម្រាប់សំឡេងរបស់អ្នក។"}
                  </p>

                  <button
                    type="button"
                    disabled={session.votes.length === 0 || isFinishing}
                    onClick={onFinish}
                    className="
                      flex min-h-12 w-full
                      items-center justify-center gap-2
                      rounded-full
                      bg-primary-800
                      px-6
                      text-[17px] font-bold text-white
                      transition
                      hover:bg-primary-700
                      disabled:cursor-not-allowed
                      disabled:opacity-45
                      sm:w-auto
                    "
                  >
                    <IoTrophyOutline className="text-[20px]" />

                    {isFinishing ? "កំពុងគណនា..." : "បញ្ចប់ការបោះឆ្នោត"}
                  </button>
                </div>
              </div>
            )}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

type RankedStoreEntry = {
  store: RecommendedStore;
  voteCount: number;
};

function LiveLeaderboard({
  rankedStores,
  votedCount,
  memberCount,
}: {
  rankedStores: RankedStoreEntry[];
  votedCount: number;
  memberCount: number;
}) {
  const topThree = rankedStores.slice(0, 3);

  const displayOrder = [
    topThree[1]
      ? {
          ...topThree[1],
          rank: 2,
        }
      : null,
    topThree[0]
      ? {
          ...topThree[0],
          rank: 1,
        }
      : null,
    topThree[2]
      ? {
          ...topThree[2],
          rank: 3,
        }
      : null,
  ].filter(
    (
      entry,
    ): entry is RankedStoreEntry & {
      rank: number;
    } => Boolean(entry),
  );

  const maxVotes = Math.max(1, ...topThree.map((entry) => entry.voteCount));

  const consensusPercentage =
    memberCount > 0
      ? Math.min(100, Math.round((votedCount / memberCount) * 100))
      : 0;

  return (
    <section
      aria-label="Live voting leaderboard"
      className="
        mb-4
        overflow-hidden
        rounded-[20px]
        border border-gray-200
        bg-white
      "
    >
      <div
        className="
          flex flex-col gap-2
          border-b border-gray-200
          px-4 py-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <p className="text-[20px] font-bold text-primary-900">
            Live leaderboard
          </p>

          <p className="mt-1 text-[17px] leading-7 text-gray-500">
            ចំណាត់ថ្នាក់នឹងផ្លាស់ប្ដូរតាមសំឡេងឆ្នោតរបស់ក្រុម។
          </p>
        </div>

        <span
          className="
            w-fit
            rounded-full
            bg-primary-50
            px-3 py-1.5
            text-[17px] font-bold
            text-primary-800 dark:text-primary-dark
          "
        >
          {votedCount}/{memberCount} voted
        </span>
      </div>

      {displayOrder.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <p className="text-[17px] text-gray-500">
            មិនទាន់មានហាងសម្រាប់បង្ហាញចំណាត់ថ្នាក់ទេ។
          </p>
        </div>
      ) : (
        <>
          <div
            className="
              grid grid-cols-3
              items-end gap-2
              px-3 pb-0 pt-5
              sm:gap-4
              sm:px-6 sm:pt-6
            "
          >
            {displayOrder.map((entry) => {
              const imageUrl =
                entry.store.coverImageUrl || entry.store.logoUrl || null;

              const rankBaseHeight =
                entry.rank === 1 ? 150 : entry.rank === 2 ? 120 : 96;

              const liveGrowth = Math.round((entry.voteCount / maxVotes) * 42);

              const barHeight = rankBaseHeight + liveGrowth;

              return (
                <div
                  key={entry.store.uuid}
                  className="flex min-w-0 flex-col items-center"
                >
                  <div
                    className="
                      relative
                      z-10
                      h-12 w-12
                      overflow-hidden
                      rounded-full
                      border-2 border-primary-200
                      bg-primary-50
                      shadow-sm
                      sm:h-14 sm:w-14
                    "
                  >
                    {imageUrl ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url("${imageUrl}")`,
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-primary-700">
                        <FaStore className="text-[21px] sm:text-[24px]" />
                      </div>
                    )}
                  </div>

                  <p
                    className="
                      mt-2
                      line-clamp-1
                      w-full
                      text-center
                      text-[17px] font-bold
                      text-primary-900
                    "
                    title={getStoreName(entry.store)}
                  >
                    {getStoreName(entry.store)}
                  </p>

                  <motion.div
                    layout
                    initial={false}
                    animate={{
                      height: barHeight,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 220,
                      damping: 24,
                    }}
                    className={`
                      mt-2 flex w-full
                      min-w-0 flex-col
                      items-center justify-center
                      rounded-t-[18px]
                      px-2
                      text-center
                      ${
                        entry.rank === 1
                          ? "bg-primary-800 text-white"
                          : entry.rank === 2
                            ? "bg-primary-600 text-white"
                            : "bg-primary-100 text-primary-900"
                      }
                    `}
                  >
                    <span className="text-[18px] font-bold">
                      {entry.rank === 1
                        ? "1st"
                        : entry.rank === 2
                          ? "2nd"
                          : "3rd"}
                    </span>

                    <span
                      className={`
                        mt-2
                        rounded-full
                        px-3 py-1
                        text-[17px] font-bold
                        ${
                          entry.rank === 3
                            ? "bg-white text-primary-800 dark:text-primary-dark"
                            : "bg-white/15 text-white"
                        }
                      `}
                    >
                      {entry.voteCount}
                      {entry.voteCount === 1 ? "Vote" : "Votes"}
                    </span>
                  </motion.div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[17px] font-semibold text-gray-600">
                Consensus progress
              </p>

              <p className="text-[17px] font-bold text-primary-800 dark:text-primary-dark">
                {votedCount}/{memberCount} voted
              </p>
            </div>

            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-gray-100">
              <motion.div
                initial={false}
                animate={{
                  width: `${consensusPercentage}%`,
                }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                }}
                className="h-full rounded-full bg-primary-800"
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function MiniMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[16px] border border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-[17px] font-semibold text-gray-500">
        <span className="text-[20px] text-primary-700">{icon}</span>
        {label}
      </div>

      <p className="mt-2 text-[22px] font-bold text-primary-900">{value}</p>
    </div>
  );
}

function DataChip({
  children,
  strong = false,
}: {
  children: ReactNode;
  strong?: boolean;
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full
        px-3 py-1.5
        text-[17px] font-semibold
        ${strong ? "bg-primary-800 text-white" : "bg-gray-100 text-gray-600"}
      `}
    >
      {children}
    </span>
  );
}
