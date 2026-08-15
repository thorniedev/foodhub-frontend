"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

import {
  IoCheckmarkCircle,
  IoCloseOutline,
  IoCopyOutline,
  IoGameControllerOutline,
  IoLocationOutline,
  IoPeopleOutline,
  IoShareSocialOutline,
  IoSparklesOutline,
  IoTrophyOutline,
} from "react-icons/io5";
import { FaStar, FaStore } from "react-icons/fa";

import type { GroupMember, GroupVote } from "@/types/group-recommendation";
import type { RecommendedStore } from "@/types/location";

interface VotingLeaderboardProps {
  open: boolean;
  stores: RecommendedStore[];
  members: GroupMember[];
  votes: GroupVote[];
  currentMemberUuid: string;
  shareUrl: string;
  canFinish?: boolean;
  isSubmittingVote?: boolean;
  isFinishing?: boolean;
  onVote: (storeUuid: string) => void;
  onFinish?: () => void;
  onClose: () => void;
}

type RankedStore = RecommendedStore & {
  voteCount: number;
  percentage: number;
};

function getRecommendationPercentage(score: number): number {
  const normalizedScore = score <= 1 ? score * 100 : score;

  return Math.max(0, Math.min(100, Math.round(normalizedScore)));
}

export default function VotingLeaderboard({
  open,
  stores,
  members,
  votes,
  currentMemberUuid,
  shareUrl,
  canFinish = true,
  isSubmittingVote = false,
  isFinishing = false,
  onVote,
  onFinish,
  onClose,
}: VotingLeaderboardProps) {
  const [mounted, setMounted] = useState(false);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

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

  const currentVote = useMemo(
    () => votes.find((vote) => vote.memberUuid === currentMemberUuid),
    [currentMemberUuid, votes],
  );

  const votedCount = useMemo(
    () => new Set(votes.map((vote) => vote.memberUuid)).size,
    [votes],
  );

  const rankedStores = useMemo<RankedStore[]>(() => {
    return stores
      .map((store) => {
        const voteCount = votes.filter(
          (vote) => vote.storeUuid === store.uuid,
        ).length;

        return {
          ...store,
          voteCount,
          percentage:
            votedCount > 0 ? Math.round((voteCount / votedCount) * 100) : 0,
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
  }, [stores, votedCount, votes]);

  const leadingStore = rankedStores[0];

  const remainingVotes = Math.max(members.length - votedCount, 0);

  const copyVotingLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);

      setCopied(true);

      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const shareVotingLink = async () => {
    if (!shareUrl) return;

    if (navigator.share) {
      await navigator.share({
        title: "FoodHub group voting",
        text: "Join our FoodHub restaurant vote.",
        url: shareUrl,
      });

      return;
    }

    await copyVotingLink();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="vote-party-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[220] flex items-end justify-center bg-black/45 backdrop-blur-[3px] md:items-center md:p-6"
        >
          <button
            type="button"
            aria-label="Close voting panel"
            onClick={onClose}
            className="absolute inset-0"
          />

          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="vote-party-title"
            initial={{
              opacity: 0,
              y: "100%",
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: "100%",
              scale: 0.98,
            }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 28,
            }}
            className="relative z-10 flex h-[94dvh] w-full flex-col overflow-hidden rounded-t-[30px] border border-white/70 bg-[#fffdf8] shadow-2xl md:h-auto md:max-h-[90dvh] md:max-w-6xl md:rounded-[30px]"
          >
            <header className="shrink-0 border-b border-orange-100 bg-gradient-to-br from-orange-50 via-white to-primary-50 px-4 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-2 rounded-full bg-secondary-100 px-3 py-1.5 text-[17px] font-semibold text-secondary-600">
                      <IoGameControllerOutline className="text-[20px]" />
                      Vote party
                    </span>

                    <span className="rounded-full bg-white px-3 py-1.5 text-[17px] font-semibold text-primary-700 shadow-sm">
                      {votedCount}/{members.length} បានបោះឆ្នោត
                    </span>
                  </div>

                  <h2
                    id="vote-party-title"
                    className="mt-3 text-[23px] font-bold leading-[1.45] text-primary-900 sm:text-[25px]"
                  >
                    ជ្រើសរើសហាងដែលក្រុមអ្នកចង់ទៅ
                  </h2>

                  <p className="mt-2 max-w-3xl text-[17px] leading-7 text-gray-600">
                    បោះឆ្នោតមួយសំឡេង ហើយអាចផ្លាស់ប្ដូរជម្រើសបាន
                    រហូតដល់ការបោះឆ្នោតបញ្ចប់។
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close voting panel"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition hover:bg-gray-100 hover:text-primary-700"
                >
                  <IoCloseOutline className="text-[25px]" />
                </button>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="flex min-w-0 items-center gap-3 rounded-[18px] border border-white bg-white/85 px-4 py-3 shadow-sm">
                  <IoSparklesOutline className="shrink-0 text-[22px] text-secondary-500" />

                  <p className="min-w-0 text-[17px] leading-7 text-gray-600">
                    {remainingVotes > 0
                      ? `${remainingVotes} សំឡេងទៀតដើម្បីឱ្យសមាជិកគ្រប់គ្នាបានចូលរួម។`
                      : "អស្ចារ្យ! សមាជិកគ្រប់គ្នាបានបោះឆ្នោតរួចរាល់។"}

                    {leadingStore && votedCount > 0
                      ? ` កំពុងនាំមុខ៖ ${
                          leadingStore.localName || leadingStore.name
                        }`
                      : ""}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={copyVotingLink}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-primary-200 bg-white px-4 text-[17px] font-semibold text-primary-800 dark:text-primary-dark transition hover:bg-primary-50"
                  >
                    {copied ? (
                      <IoCheckmarkCircle className="text-[21px]" />
                    ) : (
                      <IoCopyOutline className="text-[21px]" />
                    )}

                    {copied ? "បានចម្លង" : "ចម្លងតំណ"}
                  </button>

                  <button
                    type="button"
                    onClick={shareVotingLink}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary-800 px-4 text-[17px] font-semibold text-white transition hover:bg-primary-700"
                  >
                    <IoShareSocialOutline className="text-[21px]" />
                    ចែករំលែក
                  </button>
                </div>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
              <div className="grid gap-4 xl:grid-cols-2">
                {rankedStores.map((store, index) => {
                  const selected = currentVote?.storeUuid === store.uuid;

                  const displayName = store.localName?.trim() || store.name;

                  const imageUrl =
                    store.coverImageUrl ||
                    store.logoUrl ||
                    "/Image/store/default-store.png";

                  return (
                    <motion.article
                      layout
                      key={store.uuid}
                      className={`overflow-hidden rounded-[22px] border bg-white transition ${
                        selected
                          ? "border-secondary-400 ring-2 ring-secondary-100"
                          : "border-gray-100 hover:border-primary-200 hover:shadow-md"
                      }`}
                    >
                      <div className="grid min-w-0 sm:grid-cols-[150px_minmax(0,1fr)]">
                        <div
                          className="relative min-h-[170px] bg-gray-100 bg-cover bg-center sm:min-h-full"
                          style={{
                            backgroundImage: `url("${imageUrl}")`,
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />

                          <span className="absolute left-3 top-3 flex h-10 min-w-10 items-center justify-center rounded-full bg-white px-3 text-[17px] font-bold text-primary-800 dark:text-primary-dark shadow-sm">
                            #{index + 1}
                          </span>

                          {index === 0 && votedCount > 0 && (
                            <span className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-yellow-400 px-3 py-2 text-[17px] font-bold text-yellow-950 shadow-sm">
                              <IoTrophyOutline className="text-[20px]" />
                              នាំមុខ
                            </span>
                          )}
                        </div>

                        <div className="flex min-w-0 flex-col p-4">
                          <div className="flex min-w-0 items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="line-clamp-2 text-[20px] font-bold leading-[1.45] text-primary-900 sm:text-[22px]">
                                {displayName}
                              </h3>

                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-[17px] text-gray-600">
                                <span className="flex items-center gap-1.5 text-yellow-600">
                                  <FaStar />
                                  {store.averageRating > 0
                                    ? store.averageRating.toFixed(1)
                                    : "ថ្មី"}
                                </span>

                                <span className="flex items-center gap-1.5">
                                  <IoLocationOutline />
                                  {store.distanceKm.toFixed(1)} km
                                </span>

                                <span className="flex items-center gap-1.5">
                                  <FaStore />
                                  {store.menuCount} មុខម្ហូប
                                </span>
                              </div>
                            </div>

                            {selected && (
                              <IoCheckmarkCircle className="shrink-0 text-[25px] text-secondary-500" />
                            )}
                          </div>

                          <div className="mt-4">
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <span className="text-[17px] font-semibold text-gray-700">
                                {store.voteCount} សំឡេង
                              </span>

                              <span className="text-[17px] font-bold text-primary-700">
                                {store.percentage}%
                              </span>
                            </div>

                            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                              <motion.div
                                initial={{
                                  width: 0,
                                }}
                                animate={{
                                  width: `${store.percentage}%`,
                                }}
                                className="h-full rounded-full bg-gradient-to-r from-primary-600 to-secondary-500"
                              />
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="rounded-full bg-primary-50 px-3 py-2 text-[17px] font-semibold text-primary-700">
                              {getRecommendationPercentage(
                                store.recommendationScore,
                              )}
                              % សមស្រប
                            </span>

                            <button
                              type="button"
                              disabled={isSubmittingVote}
                              onClick={() => onVote(store.uuid)}
                              className={`min-h-11 rounded-full px-5 text-[17px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                selected
                                  ? "border border-secondary-200 bg-secondary-50 text-secondary-600"
                                  : "bg-secondary-500 text-white hover:bg-secondary-600"
                              }`}
                            >
                              {selected ? "ជម្រើសរបស់អ្នក" : "បោះឆ្នោត"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </div>

            <footer className="shrink-0 border-t border-gray-100 bg-white px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <IoPeopleOutline className="text-[22px] text-primary-700" />

                  <p className="text-[17px] leading-7 text-gray-600">
                    {currentVote
                      ? "អ្នកបានបោះឆ្នោត។ អ្នកនៅតែអាចផ្លាស់ប្ដូរជម្រើស។"
                      : "ជ្រើសរើសហាងមួយ មុនពេលចាកចេញ។"}
                  </p>
                </div>

                {canFinish && onFinish ? (
                  <button
                    type="button"
                    disabled={!currentVote || isFinishing}
                    onClick={onFinish}
                    className="flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary-800 px-6 text-[17px] font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <IoTrophyOutline className="text-[21px]" />
                    {isFinishing
                      ? "កំពុងប្រកាស..."
                      : "បញ្ចប់ និងប្រកាសអ្នកឈ្នះ"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="min-h-12 shrink-0 rounded-full bg-primary-800 px-6 text-[17px] font-semibold text-white transition hover:bg-primary-700"
                  >
                    រួចរាល់
                  </button>
                )}
              </div>
            </footer>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
