"use client";

import { useMemo, useState } from "react";
import { Sparkles, Send, Loader2, RefreshCw, ChefHat, MapPin } from "lucide-react";

import { useGetMemberProfilesQuery } from "@/app/store/memberProfileApi";
import { useCreateRecommendationSessionMutation } from "@/app/store/recommendationApi";
import type { RecommendationItem } from "@/types/recommendation";

const MAX_PROMPT = 200;

function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as { status?: number; data?: unknown };
    if (e.status === 401) return "Please sign in to get personalized AI recommendations.";
    if (e.status === 403) return "You don't have access to this recommendation.";
    if (e.data && typeof e.data === "object" && "message" in e.data) {
      const message = (e.data as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) return message;
    }
  }
  return "Something went wrong while getting recommendations. Please try again.";
}

function formatPrice(amount: number | null, currency: string | null): string | null {
  if (amount == null) return null;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency ?? "USD",
    }).format(amount);
  } catch {
    return `${amount} ${currency ?? ""}`.trim();
  }
}

function RecommendCard({ item }: { item: RecommendationItem }) {
  const price = formatPrice(item.priceSnapshot, item.currencyCode);
  const match =
    item.finalScore != null ? Math.round(item.finalScore * 100) : null;

  return (
    <li className="group flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-900/70">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
          <ChefHat className="size-5" aria-hidden />
        </span>
        {match != null && (
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-300">
            {match}% match
          </span>
        )}
      </div>

      <div>
        <h3 className="line-clamp-2 font-bold text-slate-900 dark:text-white">
          {item.menuItemName ?? "Recommended dish"}
        </h3>
        {item.storeName && (
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
            <MapPin className="size-3.5" aria-hidden />
            <span className="line-clamp-1">{item.storeName}</span>
          </p>
        )}
      </div>

      {item.reasonText && (
        <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
          {item.reasonText}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between pt-1">
        {price && (
          <span className="font-bold text-slate-900 dark:text-white">{price}</span>
        )}
        {item.rankPosition != null && (
          <span className="text-xs text-slate-400">#{item.rankPosition}</span>
        )}
      </div>
    </li>
  );
}

function CardSkeleton() {
  return (
    <li className="h-44 animate-pulse rounded-2xl border border-slate-100 bg-slate-50 dark:border-white/10 dark:bg-slate-900/50" />
  );
}

export default function AiRecommendation() {
  const [prompt, setPrompt] = useState("");

  const {
    data: profilesData,
    isLoading: profilesLoading,
    error: profilesError,
  } = useGetMemberProfilesQuery();

  const [createSession, { data: session, isLoading, error, reset }] =
    useCreateRecommendationSessionMutation();

  const activeProfiles = useMemo(
    () => (profilesData?.contents ?? []).filter((p) => p.isActive),
    [profilesData],
  );

  const canRecommend = activeProfiles.length > 0;
  const items = session?.items ?? [];

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canRecommend || isLoading) return;

    const trimmed = prompt.trim();
    const profiles = activeProfiles.map((profile, index) => ({
      profileId: profile.uuid,
      isPrimary: index === 0,
    }));

    try {
      await createSession({
        // GROUP intersects safety across all owned profiles; SINGLE for one.
        mode: profiles.length >= 2 ? "GROUP" : "SINGLE",
        // Keep this within the backend's request_source check constraint.
        requestSource: "OTHER",
        requestedLimit: 12,
        searchRadiusKm: 3,
        currencyCode: "USD",
        contextData: trimmed ? { userPrompt: trimmed } : undefined,
        profiles,
      }).unwrap();
    } catch {
      // Error surfaced via the `error` state below.
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
      <div className="mb-5 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-orange-500 text-white">
          <Sparkles className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            AI Recommendation
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Personalized for every profile you own, checked against each
            profile&apos;s allergies and dietary needs.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            value={prompt}
            maxLength={MAX_PROMPT}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={!canRecommend || isLoading}
            placeholder="Tell the AI what you feel like… e.g. “light spicy noodles under $5”"
            aria-label="Describe what you want to eat"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 disabled:opacity-60 dark:border-white/10 dark:bg-slate-900/70 dark:text-white"
          />
        </div>
        <button
          type="submit"
          disabled={!canRecommend || isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 className="size-5 animate-spin" aria-hidden />
          ) : (
            <Send className="size-5" aria-hidden />
          )}
          {isLoading ? "Thinking…" : session ? "Recommend again" : "Recommend"}
        </button>
      </form>

      {/* Auth / no-profile gate */}
      {!profilesLoading && profilesError ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          Please sign in and add a family profile to get AI recommendations.
        </p>
      ) : !profilesLoading && !canRecommend ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300">
          Add at least one active profile to start getting recommendations.
        </p>
      ) : null}

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <span>{getErrorMessage(error)}</span>
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline"
          >
            <RefreshCw className="size-4" aria-hidden />
            Dismiss
          </button>
        </div>
      )}

      {/* Results */}
      <ul
        aria-live="polite"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {isLoading &&
          items.length === 0 &&
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}

        {items.map((item) => (
          <RecommendCard key={item.uuid} item={item} />
        ))}
      </ul>

      {/* Empty state (a completed session with no eligible items) */}
      {!isLoading && session && items.length === 0 && !error && (
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300">
          No dishes matched every profile&apos;s safety rules for that request.
          Try a broader prompt.
        </p>
      )}
    </section>
  );
}
