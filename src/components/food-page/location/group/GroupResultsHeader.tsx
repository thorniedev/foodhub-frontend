"use client";

import { useState } from "react";
import {
  IoCheckmarkCircleOutline,
  IoCopyOutline,
  IoFilterOutline,
  IoGameControllerOutline,
  IoLinkOutline,
  IoRefreshOutline,
  IoShareSocialOutline,
} from "react-icons/io5";

interface GroupResultsHeaderProps {
  groupName: string;
  resultCount: number;
  shareUrl: string;
  hasVotingSession: boolean;
  isCreatingSession: boolean;

  onOpenFilters: () => void;
  onChangeLocations: () => void;
  onCreateVotingSession: () => void;
  onOpenVoting: () => void;
}

export default function GroupResultsHeader({
  groupName,
  resultCount,
  shareUrl,
  hasVotingSession,
  isCreatingSession,
  onOpenFilters,
  onChangeLocations,
  onCreateVotingSession,
  onOpenVoting,
}: GroupResultsHeaderProps) {
  const [copied, setCopied] = useState(false);

  const votingReady = hasVotingSession && Boolean(shareUrl) && resultCount > 0;

  const copyVotingLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  };

  const shareVotingLink = async () => {
    if (!shareUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${groupName} — FoodHub`,
          text: "ចូលរួមបោះឆ្នោតជ្រើសរើសហាងជាមួយពួកយើង",
          url: shareUrl,
        });

        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    await copyVotingLink();
  };

  return (
    <section className="mb-5 rounded-[24px] border border-slate-100 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)] sm:p-5">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-50 px-3 py-1.5 text-[16px] font-bold text-orange-600">
              Vote together
            </span>

            <span className="max-w-full truncate rounded-full bg-emerald-50 px-3 py-1.5 text-[16px] font-bold text-emerald-800">
              {groupName}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[16px] font-semibold text-slate-600">
              {resultCount} ហាង
            </span>
          </div>

          <h2 className="mt-3 text-[22px] font-bold leading-[1.5] text-primary-900 sm:text-[25px]">
            ចែករំលែកតំណ ហើយបោះឆ្នោតជ្រើសរើសហាង
          </h2>

          <p className="mt-1 text-[16px] leading-7 text-slate-500">
            Copy ឬ Share តំណទៅមិត្តភក្តិ
            រួចបើកការបោះឆ្នោតដើម្បីជ្រើសរើសកន្លែងជាមួយគ្នា។
          </p>
        </div>

        {/* Small utility buttons */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <button
            type="button"
            onClick={onOpenFilters}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[16px] font-semibold text-slate-700 transition hover:border-primary-200 hover:bg-primary-50"
          >
            <IoFilterOutline className="text-[19px]" />
            តម្រង
          </button>

          <button
            type="button"
            onClick={onChangeLocations}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[16px] font-semibold text-slate-700 transition hover:border-primary-200 hover:bg-primary-50"
          >
            <IoRefreshOutline className="text-[19px]" />
            ប្ដូរទីតាំង
          </button>
        </div>
      </div>

      {/* Compact voting toolbar */}
      <div className="mt-5 rounded-[18px] border border-slate-100 bg-slate-50 p-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          {/* Status */}
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                votingReady
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-orange-100 text-orange-600"
              }`}
            >
              {votingReady ? (
                <IoCheckmarkCircleOutline className="text-[22px]" />
              ) : (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-200 border-t-orange-600" />
              )}
            </span>

            <div>
              <p className="text-[16px] font-bold text-primary-900">
                {votingReady
                  ? "Voting room ready"
                  : isCreatingSession
                    ? "កំពុងរៀបចំ Voting room..."
                    : "Voting room មិនទាន់រួចរាល់"}
              </p>

              <p className="text-[16px] text-slate-500">
                {resultCount} កន្លែងសម្រាប់ជ្រើសរើស
              </p>
            </div>
          </div>

          {/* Link */}
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
            <IoLinkOutline className="shrink-0 text-[20px] text-primary-700" />

            <input
              type="text"
              readOnly
              value={shareUrl}
              placeholder={
                isCreatingSession
                  ? "កំពុងបង្កើត voting link..."
                  : "Voting link will appear here"
              }
              aria-label="Voting link"
              onFocus={(event) => {
                event.currentTarget.select();
              }}
              className="min-h-11 min-w-0 flex-1 bg-transparent text-[16px] text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Compact action buttons */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap xl:shrink-0">
            {!hasVotingSession && !isCreatingSession && (
              <button
                type="button"
                disabled={resultCount === 0}
                onClick={onCreateVotingSession}
                className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 text-[16px] font-bold text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-1"
              >
                <IoRefreshOutline className="text-[19px]" />
                រៀបចំ Voting
              </button>
            )}

            <button
              type="button"
              disabled={!shareUrl}
              onClick={() => void copyVotingLink()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary-200 bg-white px-4 text-[16px] font-bold text-primary-800 dark:text-primary-dark transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
            >
              {copied ? (
                <IoCheckmarkCircleOutline className="text-[20px]" />
              ) : (
                <IoCopyOutline className="text-[20px]" />
              )}

              {copied ? "បានចម្លង" : "Copy"}
            </button>

            <button
              type="button"
              disabled={!shareUrl}
              onClick={() => void shareVotingLink()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary-200 bg-white px-4 text-[16px] font-bold text-primary-800 dark:text-primary-dark transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
            >
              <IoShareSocialOutline className="text-[20px]" />
              Share
            </button>

            <button
              type="button"
              disabled={!votingReady}
              onClick={onOpenVoting}
              className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-[16px] font-bold text-white shadow-[0_10px_22px_rgba(249,115,22,0.2)] transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none sm:col-span-1"
            >
              <IoGameControllerOutline className="text-[20px]" />
              Vote now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
