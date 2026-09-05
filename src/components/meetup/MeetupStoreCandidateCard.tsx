"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Compass,
  ExternalLink,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Trophy,
  Users,
  Utensils,
  Vote,
} from "lucide-react";

import type { GroupRecommendedStore } from "@/types/group-location";
import { toFrontendApiAssetUrl } from "@/lib/catalog-media";
import { resolveStoreMediaUrl } from "@/components/food-page/store/store-page-utils";

interface MeetupStoreCandidateCardProps {
  store: GroupRecommendedStore;
  voteCount: number;
  totalVotes: number;
  isSelected: boolean;
  isLeading: boolean;
  isBusy: boolean;
  isLocked: boolean;
  onVote: (store: GroupRecommendedStore) => void;
}

export default function MeetupStoreCandidateCard({
  store,
  voteCount,
  totalVotes,
  isSelected,
  isLeading,
  isBusy,
  isLocked,
  onVote,
}: MeetupStoreCandidateCardProps) {
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  // Initial candidate URL from store properties or first menu dish
  const initialImageUrl = useMemo(() => {
    if (store.coverImageUrl) {
      return toFrontendApiAssetUrl(store.coverImageUrl);
    }
    if (store.logoUrl) {
      return toFrontendApiAssetUrl(store.logoUrl);
    }
    if (store.menuItems && store.menuItems.length > 0) {
      const firstDish = store.menuItems[0];
      if (firstDish.thumbnail) {
        return toFrontendApiAssetUrl(firstDish.thumbnail);
      }
      if (firstDish.gallery && firstDish.gallery.length > 0) {
        return toFrontendApiAssetUrl(firstDish.gallery[0]);
      }
    }
    return null;
  }, [store.coverImageUrl, store.logoUrl, store.menuItems]);

  useEffect(() => {
    let cancelled = false;
    setImageFailed(false);

    if (initialImageUrl) {
      setResolvedImageUrl(initialImageUrl);
      return;
    }

    const mediaUuid = store.coverMediaUuid || store.logoMediaUuid;
    if (!mediaUuid) {
      setResolvedImageUrl(null);
      return;
    }

    async function loadMedia() {
      const resolved = await resolveStoreMediaUrl(mediaUuid);
      if (!cancelled) {
        setResolvedImageUrl(resolved || toFrontendApiAssetUrl(mediaUuid));
      }
    }

    void loadMedia();

    return () => {
      cancelled = true;
    };
  }, [initialImageUrl, store.coverMediaUuid, store.logoMediaUuid]);

  const sharePercent =
    totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

  const displayName = store.localName?.trim() || store.name?.trim() || "ហាងអាហារ FoodHub";
  const displayAddress = [store.addressLine, store.district, store.city]
    .filter(Boolean)
    .join(", ") || "រាជធានីភ្នំពេញ";

  const isOpen = store.isOpenNow ?? true;
  const rating = Number(store.averageRating || 0);

  const finalImageUrl = !imageFailed ? (resolvedImageUrl || initialImageUrl) : null;

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-3xl border bg-white transition-all dark:bg-slate-900 ${
        isSelected
          ? "border-primary-500 shadow-lg shadow-primary-500/10 ring-2 ring-primary-500/20"
          : "border-slate-200 shadow-sm hover:border-primary-200 hover:shadow-md dark:border-slate-800"
      }`}
    >
      {/* Cover image & badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
        {finalImageUrl ? (
          <Image
            src={finalImageUrl}
            alt={displayName}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-linear-to-br from-primary-50 via-emerald-50 to-secondary-50 text-primary-600 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 dark:text-primary-400">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-100 bg-white/80 shadow-xs backdrop-blur-xs dark:border-slate-700 dark:bg-slate-800/80">
              <Store className="h-8 w-8 text-primary-500 dark:text-primary-400" />
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <div className="flex flex-wrap gap-1.5">
            {store.safeForAllMembers && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/95 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
                <ShieldCheck className="h-3.5 w-3.5" />
                សុវត្ថិភាពសម្រាប់ក្រុម
              </span>
            )}
            {store.recommendationScore > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary-500/95 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                {store.recommendationScore}% សាកសម
              </span>
            )}
          </div>

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

      {/* Store Info */}
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-base! font-black leading-snug text-slate-900 dark:text-white">
              {displayName}
            </h3>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                isOpen
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300"
              }`}
            >
              {isOpen ? "បើកដំណើរការ" : "បានបិទ"}
            </span>
          </div>

          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary-600 dark:text-primary-400" />
            <span className="truncate">{displayAddress}</span>
          </p>
        </div>

        {/* Distance & Rating Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Compass className="h-3.5 w-3.5 text-emerald-600" />
            {store.distanceKm.toFixed(1)} គ.ម ពីចំណុចកណ្ដាល
          </span>

          {store.averageMemberDistanceKm > 0 && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Users className="h-3 w-3" />
              មធ្យម {store.averageMemberDistanceKm.toFixed(1)} គ.ម/នាក់
            </span>
          )}

          {rating > 0 && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
              {rating.toFixed(1)} ({store.totalReviews || 0})
            </span>
          )}
        </div>

        {/* Menu count preview */}
        {store.menuCount > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Utensils className="h-3.5 w-3.5 text-slate-400" />
            <span>មានមុខម្ហូបប្រហែល {store.menuCount} មុខ</span>
          </p>
        )}

        {/* Vote progress & action */}
        <div className="mt-auto space-y-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600 dark:text-slate-300">
                {voteCount} សំឡេងបោះឆ្នោត
              </span>
              {totalVotes > 0 && (
                <span className="text-slate-400">{sharePercent}%</span>
              )}
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
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

          <div className="grid grid-cols-[1fr_auto] gap-2">
            <button
              type="button"
              onClick={() => onVote(store)}
              disabled={isBusy || isLocked}
              aria-pressed={isSelected}
              aria-label={
                isSelected
                  ? `ដកសំឡេងសម្រាប់ ${displayName}`
                  : `បោះឆ្នោតឲ្យ ${displayName}`
              }
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
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
              {isSelected ? "បានបោះឆ្នោត" : "បោះឆ្នោតហាងនេះ"}
            </button>

            <Link
              href={`/store/${encodeURIComponent(store.uuid)}`}
              target="_blank"
              rel="noopener noreferrer"
              title="មើលព័ត៌មានហាង"
              className="inline-flex min-h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-primary-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
