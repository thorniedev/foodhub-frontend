"use client";

import { Compass, Sparkles, Send, Loader2, ShieldCheck } from "lucide-react";

import { ProfileMultiSelect } from "@/components/profile/ProfileMultiSelect";

import type { MemberProfile } from "@/types/member-profile/member-profile";
import type { RecommendationItem } from "@/types/recommendation";

const MAX_PROMPT = 200;

function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as { status?: number; data?: unknown };
    if (e.status === 401) return "សូមចូលគណនី ដើម្បីទទួលការណែនាំ AI (please sign in).";
    if (e.data && typeof e.data === "object" && "message" in e.data) {
      const m = (e.data as { message?: unknown }).message;
      if (typeof m === "string" && m.trim()) return m;
    }
  }
  return "មានបញ្ហា សូមព្យាយាមម្តងទៀត (something went wrong).";
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

/** Match-score pill color: green >=85%, teal >=70%, else neutral. */
function matchClasses(match: number | null): string {
  if (match == null) return "bg-gray-100 text-gray-500";
  if (match >= 85) return "bg-emerald-100 text-emerald-700";
  if (match >= 70) return "bg-teal-100 text-teal-700";
  return "bg-gray-100 text-gray-600";
}

/** Hover tooltip text summarizing the per-strategy score breakdown. */
function breakdownTitle(breakdown: Record<string, number> | null): string | undefined {
  if (!breakdown) return undefined;
  const labels: Record<string, string> = {
    AI_JUDGMENT: "AI",
    CONTENT_BASED: "Taste",
    BEHAVIOR: "Behavior",
    POPULARITY: "Popularity",
    TRENDING: "Trending",
  };
  const parts = Object.entries(breakdown).map(
    ([key, value]) => `${labels[key] ?? key} ${Math.round(value * 100)}%`,
  );
  return parts.length ? parts.join(" · ") : undefined;
}

/**
 * Prompt-driven AI recommendation, mounted under the swipe cards. Controlled
 * by the parent (Model.tsx), which owns the single recommendation session
 * shared with the swipe deck above — submitting a prompt here replaces that
 * same session's items, so the swipe cards reflect it too instead of the two
 * staying independent of each other.
 */
export default function AiPromptRecommender({
  prompt,
  onPromptChange,
  onSubmit,
  isLoading,
  error,
  items,
  canRecommend,
  isLoadingProfiles,
  profiles,
  targetProfiles,
  onToggleProfile,
  onSelectAllProfiles,
  allProfilesSelected,
}: {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  isLoading: boolean;
  error: unknown;
  items: RecommendationItem[];
  canRecommend: boolean;
  isLoadingProfiles: boolean;
  profiles: MemberProfile[];
  targetProfiles: MemberProfile[];
  onToggleProfile: (profile: MemberProfile) => void;
  onSelectAllProfiles: () => void;
  allProfilesSelected: boolean;
}) {
  return (
    <div className="border-t border-gray-200 bg-white/70 px-4 py-4">
      <div className="mb-2 flex items-center justify-between gap-2 text-[15px] font-semibold text-primary-900">
        <div className="flex min-w-0 items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-secondary-500" />
          <span className="truncate">
            ប្រាប់ AI នូវលក្ខខណ្ឌរបស់អ្នក (Tell the AI what you want)
          </span>
        </div>

        <ProfileMultiSelect
          profiles={profiles}
          targetProfiles={targetProfiles}
          onToggle={onToggleProfile}
          onSelectAll={onSelectAllProfiles}
          allSelected={allProfilesSelected}
        />
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="text"
          value={prompt}
          maxLength={MAX_PROMPT}
          onChange={(e) => onPromptChange(e.target.value)}
          disabled={!canRecommend || isLoading}
          placeholder="ឧ. ម្ហូបហឹរតិច ក្រោម $5 (e.g. light spicy under $5)"
          aria-label="Describe what you want to eat"
          className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-[15px] text-gray-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!canRecommend || isLoading}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary-800 px-4 py-2.5 text-[15px] font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isLoading ? "កំពុងគិត..." : "ណែនាំ"}
        </button>
      </form>

      {!canRecommend && !isLoadingProfiles && (
        <p className="mt-2 text-[13px] text-amber-600">
          សូមចូលគណនី និងបង្កើតប្រវត្តិរូប ដើម្បីទទួលការណែនាំ AI។
        </p>
      )}

      {error != null && (
        <p className="mt-2 text-[13px] text-red-600">{getErrorMessage(error)}</p>
      )}

      {items.length === 0 && !isLoading && error == null && (
        <p className="mt-2 text-[13px] text-gray-500">
          {targetProfiles.length === 1
            ? `គ្មានម្ហូបត្រូវនឹងលក្ខខណ្ឌសុវត្ថិភាពរបស់ ${targetProfiles[0].profileName} ទេ។`
            : targetProfiles.length > 1
              ? "គ្មានម្ហូបត្រូវនឹងលក្ខខណ្ឌសុវត្ថិភាពនៃប្រវត្តិរូបដែលបានជ្រើសទាំងអស់ទេ។"
              : "គ្មានម្ហូបត្រូវនឹងលក្ខខណ្ឌសុវត្ថិភាពទេ។"}
        </p>
      )}

      {items.length > 0 && targetProfiles.length > 1 && (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-semibold text-emerald-700">
          <ShieldCheck className="h-3.5 w-3.5" />
          សុវត្ថិភាពសម្រាប់សមាជិកទាំង {targetProfiles.length} នាក់ (safe for all
          selected members)
        </p>
      )}

      {items.length > 0 && (
        <ul className="mt-3 max-h-[240px] space-y-2 overflow-y-auto pr-1">
          {items.map((item) => {
            const price = formatPrice(item.priceSnapshot, item.currencyCode);
            const match =
              item.finalScore != null ? Math.round(item.finalScore * 100) : null;
            return (
              <li
                key={item.uuid}
                className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3"
              >
                {item.rankPosition != null && (
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-800 text-[12px] font-bold text-white">
                    {item.rankPosition}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">
                    {item.menuItemName ?? "Recommended dish"}
                  </p>
                  {item.storeName && (
                    <p className="truncate text-[13px] text-gray-500">
                      {item.storeName}
                    </p>
                  )}
                  {item.reasonText && (
                    <p className="mt-0.5 line-clamp-1 text-[13px] text-gray-600">
                      {item.reasonText}
                    </p>
                  )}
                  {item.isExploration && (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                      <Compass className="h-3 w-3" />
                      ស្វែងរកថ្មី
                    </span>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  {price && <p className="font-bold text-gray-900">{price}</p>}
                  {match != null && (
                    <span
                      title={breakdownTitle(item.scoreBreakdown)}
                      className={`mt-1 inline-block cursor-default rounded-full px-2 py-0.5 text-[12px] font-semibold ${matchClasses(
                        match,
                      )}`}
                    >
                      {match}% match
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
