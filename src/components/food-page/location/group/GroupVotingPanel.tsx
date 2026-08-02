"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  const rankedStores = useMemo(() => {
    if (!session) return [];

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
    if (!session || !currentMemberUuid) return null;

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
    if (!session?.winnerStoreUuid) return null;

    return (
      session.stores.find((store) => store.uuid === session.winnerStoreUuid) ??
      null
    );
  }, [session]);

  const winnerVoteCount = useMemo(() => {
    if (!winner || !session) return 0;

    return session.votes.filter((vote) => vote.storeUuid === winner.uuid)
      .length;
  }, [session, winner]);

  const copyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const shareLink = async () => {
    if (!shareUrl) return;

    if (navigator.share) {
      await navigator.share({
        title: session?.groupName ?? "FoodHub vote",
        text: "Join our FoodHub restaurant vote 🎮🍜",
        url: shareUrl,
      });
      return;
    }

    await copyLink();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="group-vote-title"
            initial={{ y: 70, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 70, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 27 }}
            className="flex max-h-[96dvh] w-full max-w-6xl flex-col overflow-hidden rounded-t-[30px] bg-[#fffdf8] shadow-[0_30px_90px_rgba(15,23,42,0.35)] sm:max-h-[92dvh] sm:rounded-[30px]"
          >
            <div className="relative overflow-hidden border-b border-secondary-100 bg-gradient-to-br from-secondary-50 via-white to-primary-50 px-4 py-5 sm:px-6 lg:px-7">
              <div className="pointer-events-none absolute -right-8 -top-12 h-44 w-44 rounded-full bg-secondary-200/35 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-2 rounded-full bg-secondary-100 px-3 py-1.5 text-[16px] font-bold text-secondary-600">
                      <IoGameControllerOutline className="text-[20px]" />
                      Vote Party
                    </span>

                    <span className="rounded-full bg-white px-3 py-1.5 text-[16px] font-bold text-primary-700 shadow-sm">
                      {votedCount}/{session?.members.length ?? 0} បានបោះឆ្នោត
                    </span>
                  </div>

                  <h2
                    id="group-vote-title"
                    className="mt-3 text-[23px] font-bold leading-[1.45] text-primary-900 sm:text-[28px]"
                  >
                    ជ្រើសរើសហាងដែលក្រុមអ្នកចង់ទៅ 🍜
                  </h2>

                  <p className="mt-2 max-w-3xl text-[17px] leading-7 text-gray-600">
                    មនុស្សម្នាក់មានមួយសំឡេង
                    ហើយអាចផ្លាស់ប្ដូរជម្រើសបានរហូតដល់ម្ចាស់ក្រុមបញ្ចប់ការបោះឆ្នោត។
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

              {session && (
                <div className="relative mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <div className="min-w-0 rounded-[18px] border border-white bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
                    <p className="text-[16px] font-semibold text-gray-500">
                      Share voting link
                    </p>
                    <p className="mt-1 truncate text-[16px] font-bold text-primary-900">
                      {shareUrl || `Invite code: ${session.inviteCode}`}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => void copyLink()}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-primary-100 bg-white px-4 text-[16px] font-bold text-primary-700 transition hover:bg-primary-50"
                    >
                      {copied ? (
                        <IoCheckmarkCircle className="text-[21px]" />
                      ) : (
                        <IoCopyOutline className="text-[21px]" />
                      )}
                      {copied ? "បានចម្លង" : "Copy"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void shareLink()}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-secondary-500 px-4 text-[16px] font-bold text-white transition hover:bg-secondary-600"
                    >
                      <IoShareSocialOutline className="text-[21px]" />
                      Share
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-7">
              {!session ? (
                <div className="flex min-h-[320px] items-center justify-center rounded-[24px] border border-dashed border-gray-200 bg-white p-6 text-center">
                  <div>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                      <IoSparklesOutline className="text-[31px]" />
                    </div>
                    <p className="mt-4 text-[20px] font-bold text-primary-900">
                      កំពុងរៀបចំ Vote Party...
                    </p>
                  </div>
                </div>
              ) : session.status === "COMPLETED" && winner ? (
                <GroupWinnerResult
                  winner={winner}
                  winnerVoteCount={winnerVoteCount}
                  memberCount={session.members.length}
                  shareUrl={shareUrl}
                  compact
                  onRestart={onRestart}
                />
              ) : (
                <>
                  {errorMessage && (
                    <div className="mb-4 rounded-[18px] border border-red-100 bg-red-50 px-4 py-3 text-[16px] leading-7 text-red-600">
                      {errorMessage}
                    </div>
                  )}

                  <div className="mb-4 grid gap-3 sm:grid-cols-3">
                    <MiniMetric
                      icon={<IoPeopleOutline />}
                      label="Participants"
                      value={String(session.members.length)}
                    />
                    <MiniMetric
                      icon={<IoCheckmarkCircle />}
                      label="Votes in"
                      value={String(votedCount)}
                    />
                    <MiniMetric
                      icon={<IoTrophyOutline />}
                      label="Candidates"
                      value={String(session.stores.length)}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {rankedStores.map(({ store, voteCount }, index) => {
                      const selected = currentVote?.storeUuid === store.uuid;
                      const imageUrl =
                        store.coverImageUrl || store.logoUrl || null;
                      const percentage =
                        votedCount > 0
                          ? Math.round((voteCount / votedCount) * 100)
                          : 0;

                      return (
                        <motion.button
                          layout
                          key={store.uuid}
                          type="button"
                          disabled={isSubmittingVote}
                          onClick={() => onVote(store.uuid)}
                          whileTap={{ scale: 0.985 }}
                          className={`overflow-hidden rounded-[22px] border bg-white text-left shadow-sm transition ${
                            selected
                              ? "border-emerald-300 ring-4 ring-emerald-50"
                              : "border-gray-100 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"
                          } disabled:cursor-wait disabled:opacity-70`}
                        >
                          <div className="grid min-h-full sm:grid-cols-[150px_minmax(0,1fr)] md:grid-cols-1 lg:grid-cols-[165px_minmax(0,1fr)]">
                            <div
                              className="relative min-h-[155px] bg-gradient-to-br from-primary-100 to-secondary-100 bg-cover bg-center"
                              style={
                                imageUrl
                                  ? { backgroundImage: `url("${imageUrl}")` }
                                  : undefined
                              }
                            >
                              {!imageUrl && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <FaStore className="text-[48px] text-primary-700" />
                                </div>
                              )}

                              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                              <span className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[18px] font-bold text-primary-900 shadow-sm">
                                {index + 1}
                              </span>

                              {selected && (
                                <span className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                                  <IoCheckmarkCircle className="text-[23px]" />
                                </span>
                              )}
                            </div>

                            <div className="flex min-w-0 flex-col p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h3 className="line-clamp-2 text-[19px] font-bold leading-7 text-primary-900">
                                    {getStoreName(store)}
                                  </h3>
                                  <p className="mt-1 flex items-start gap-2 text-[16px] leading-6 text-gray-500">
                                    <IoLocationOutline className="mt-1 shrink-0 text-primary-700" />
                                    <span className="line-clamp-2">
                                      {store.addressLine}
                                    </span>
                                  </p>
                                </div>

                                <span className="shrink-0 rounded-full bg-secondary-50 px-3 py-1.5 text-[16px] font-bold text-secondary-600">
                                  {voteCount} vote{voteCount === 1 ? "" : "s"}
                                </span>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1.5 text-[16px] font-semibold text-yellow-700">
                                  <FaStar />
                                  {store.averageRating > 0
                                    ? store.averageRating.toFixed(1)
                                    : "ថ្មី"}
                                </span>
                                <span className="rounded-full bg-primary-50 px-3 py-1.5 text-[16px] font-semibold text-primary-700">
                                  {store.distanceKm.toFixed(1)} km
                                </span>
                                <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[16px] font-semibold text-gray-600">
                                  Match {store.recommendationScore}%
                                </span>
                              </div>

                              <div className="mt-auto pt-4">
                                <div className="flex items-center justify-between gap-3 text-[16px] font-semibold">
                                  <span className="text-gray-500">
                                    Live score
                                  </span>
                                  <span className="text-primary-800">
                                    {percentage}%
                                  </span>
                                </div>
                                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100">
                                  <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-secondary-400 to-secondary-600"
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.35 }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {session && session.status === "VOTING" && (
              <div className="border-t border-gray-100 bg-white px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[16px] leading-7 text-gray-500">
                    {currentVote
                      ? "ជម្រើសរបស់អ្នកត្រូវបានរក្សាទុក។ អ្នកអាចប្ដូរវាបាន។"
                      : "ជ្រើសរើសហាងមួយ ដើម្បីបញ្ចូលសំឡេងរបស់អ្នក។"}
                  </p>

                  <button
                    type="button"
                    disabled={session.votes.length === 0 || isFinishing}
                    onClick={onFinish}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary-800 px-6 text-[17px] font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
                  >
                    <IoTrophyOutline className="text-[21px]" />
                    {isFinishing ? "កំពុងគណនា..." : "បញ្ចប់ និងបង្ហាញអ្នកឈ្នះ"}
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
    <div className="rounded-[18px] border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[16px] font-semibold text-gray-500">
        <span className="text-[20px] text-primary-700">{icon}</span>
        {label}
      </div>
      <p className="mt-2 text-[23px] font-bold text-primary-900">{value}</p>
    </div>
  );
}
