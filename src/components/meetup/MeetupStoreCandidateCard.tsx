"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Check,
  Loader2,
  MapPin,
  ShieldCheck,
  Star,
  Store,
  Trophy,
  Vote,
} from "lucide-react";

import { toFrontendApiAssetUrl } from "@/lib/catalog-media";
import type { MeetupStoreCandidate } from "@/lib/meetup/meetup-candidates";

interface MeetupStoreCandidateCardProps {
  candidate: MeetupStoreCandidate;
  voteCount: number;
  totalVotes: number;
  isSelected: boolean;
  isLeading: boolean;
  isBusy: boolean;
  isLocked: boolean;
  onVote: (candidate: MeetupStoreCandidate) => void;
}

/** Dishes listed in full on the card; the rest collapse into a count. */
const VISIBLE_ITEM_COUNT = 4;

function formatPrice(price: number, currencyCode: string): string {
  return currencyCode === "USD"
    ? `$${price.toFixed(2)}`
    : `${price.toFixed(2)} ${currencyCode}`;
}

export default function MeetupStoreCandidateCard({
  candidate,
  voteCount,
  totalVotes,
  isSelected,
  isLeading,
  isBusy,
  isLocked,
  onVote,
}: MeetupStoreCandidateCardProps) {
  const sharePercent =
    totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

  const visibleItems = candidate.items.slice(0, VISIBLE_ITEM_COUNT);
  const hiddenItemCount = candidate.items.length - visibleItems.length;

  const resolvedPhotoUrl = toFrontendApiAssetUrl(candidate.photoUrl, "");
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(resolvedPhotoUrl) && !imageFailed;

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-3xl border bg-white transition-all dark:bg-slate-900 ${
        isSelected
          ? "border-primary-500 shadow-lg shadow-primary-500/10 ring-2 ring-primary-500/20"
          : "border-slate-200 shadow-sm hover:border-primary-200 hover:shadow-md dark:border-slate-800"
      }`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
        {showImage ? (
          <Image
            src={resolvedPhotoUrl}
            alt={candidate.storeName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300 dark:text-slate-600">
            <Store className="h-10 w-10" />
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          {candidate.isVerifiedSafe ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-600/95 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              ពិនិត្យសុវត្ថិភាព
            </span>
          ) : (
            <span aria-hidden="true" />
          )}

          {isLeading && voteCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-300 px-2.5 py-1 text-xs font-black text-primary-950 shadow-sm">
              <Trophy className="h-3.5 w-3.5" />
              នាំមុខ
            </span>
          )}
        </div>

        {isSelected && (
          <div className="absolute inset-x-0 bottom-0 bg-primary-600/95 px-3 py-1.5 text-center text-xs font-black text-white backdrop-blur-sm">
            អ្នកបានបោះឆ្នោតឲ្យហាងនេះ
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-2 text-base! font-black leading-snug text-slate-900 dark:text-white">
            {candidate.storeName}
          </h3>
          <p className="mt-1 text-sm font-semibold text-secondary-500">
            មានម្ហូប {candidate.items.length} មុខសម្រាប់ក្រុមនេះ
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs font-bold">
          {candidate.minPrice !== null && (
            <span className="rounded-lg bg-primary-50 px-2 py-1 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300">
              ចាប់ពី {formatPrice(candidate.minPrice, candidate.currencyCode)}
            </span>
          )}
          {candidate.distanceKm !== null && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <MapPin className="h-3 w-3" />
              {candidate.distanceKm.toFixed(1)} គ.ម
            </span>
          )}
          {candidate.rating !== null && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-accent-50 px-2 py-1 text-accent-700 dark:bg-accent-950/40 dark:text-accent-300">
              <Star className="h-3 w-3 fill-current" />
              {candidate.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/*
          * The dishes are why this store is on the slate: every one of them
          * passed the room's combined allergy and diet rules.
          */}
        <ul className="space-y-1.5 rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/60">
          {visibleItems.map((item) => (
            <li
              key={item.menuItemUuid ?? item.foodUuid}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <span className="truncate font-semibold text-slate-700 dark:text-slate-200">
                {item.foodName}
              </span>
              {item.price !== null && (
                <span className="shrink-0 font-bold text-slate-500 dark:text-slate-400">
                  {formatPrice(item.price, item.currencyCode)}
                </span>
              )}
            </li>
          ))}

          {hiddenItemCount > 0 && (
            <li className="pt-0.5 text-xs font-bold text-slate-400">
              និង {hiddenItemCount} មុខទៀត
            </li>
          )}
        </ul>

        <div className="mt-auto space-y-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500 dark:text-slate-400">
                {voteCount} សំឡេង
              </span>
              {totalVotes > 0 && (
                <span className="text-slate-400">{sharePercent}%</span>
              )}
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
              role="presentation"
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isLeading && voteCount > 0
                    ? "bg-accent-400"
                    : "bg-primary-500"
                }`}
                style={{ width: `${sharePercent}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => onVote(candidate)}
            disabled={isBusy || isLocked}
            aria-pressed={isSelected}
            aria-label={
              isSelected
                ? `ដកសំឡេងសម្រាប់ ${candidate.storeName}`
                : `បោះឆ្នោតឲ្យ ${candidate.storeName}`
            }
            className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
              isSelected
                ? "border-2 border-primary-600 bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-950/40 dark:text-primary-300"
                : "bg-primary-600 text-white shadow-sm hover:bg-primary-700"
            }`}
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSelected ? (
              <Check className="h-4 w-4" />
            ) : (
              <Vote className="h-4 w-4" />
            )}
            {isSelected ? "បានបោះឆ្នោត" : "បោះឆ្នោត"}
          </button>
        </div>
      </div>
    </article>
  );
}
