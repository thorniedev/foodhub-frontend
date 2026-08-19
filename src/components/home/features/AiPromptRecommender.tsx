"use client";

import { useMemo, useState } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";

import { useGetMemberProfilesQuery } from "@/app/store/memberProfileApi";
import { useCreateRecommendationSessionMutation } from "@/app/store/recommendationApi";
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

/**
 * Prompt-driven AI recommendation, mounted under the swipe cards. The user's
 * free text is sent to the real recommendation API as contextData.userPrompt
 * across every owned profile (GROUP = safety intersection). Anonymous users are
 * prompted to sign in; the swipe browse above keeps working regardless.
 */
export default function AiPromptRecommender() {
  const [prompt, setPrompt] = useState("");

  const { data: profilesData } = useGetMemberProfilesQuery();
  const [createSession, { data: session, isLoading, error }] =
    useCreateRecommendationSessionMutation();

  const activeProfiles = useMemo(
    () => (profilesData?.contents ?? []).filter((p) => p.isActive),
    [profilesData],
  );

  const canRecommend = activeProfiles.length > 0;
  const items: RecommendationItem[] = session?.items ?? [];

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canRecommend || isLoading) return;

    const trimmed = prompt.trim();
    const profiles = activeProfiles.map((p, index) => ({
      profileId: p.uuid,
      isPrimary: index === 0,
    }));

    try {
      await createSession({
        mode: profiles.length >= 2 ? "GROUP" : "SINGLE",
        requestSource: "USER_PROMPT",
        requestedLimit: 12,
        contextData: trimmed ? { userPrompt: trimmed } : undefined,
        profiles,
      }).unwrap();
    } catch {
      // surfaced via `error`
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white/70 px-4 py-4">
      <div className="mb-2 flex items-center gap-2 text-[15px] font-semibold text-primary-900">
        <Sparkles className="h-4 w-4 text-secondary-500" />
        ប្រាប់ AI នូវលក្ខខណ្ឌរបស់អ្នក (Tell the AI what you want)
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={prompt}
          maxLength={MAX_PROMPT}
          onChange={(e) => setPrompt(e.target.value)}
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

      {!canRecommend && (
        <p className="mt-2 text-[13px] text-amber-600">
          សូមចូលគណនី និងបង្កើតប្រវត្តិរូប ដើម្បីទទួលការណែនាំ AI។
        </p>
      )}

      {error && (
        <p className="mt-2 text-[13px] text-red-600">{getErrorMessage(error)}</p>
      )}

      {session && items.length === 0 && !isLoading && !error && (
        <p className="mt-2 text-[13px] text-gray-500">
          គ្មានម្ហូបត្រូវនឹងលក្ខខណ្ឌសុវត្ថិភាពនៃប្រវត្តិរូបទាំងអស់ទេ។
        </p>
      )}

      {items.length > 0 && (
        <ul className="mt-3 max-h-[220px] space-y-2 overflow-y-auto pr-1">
          {items.map((item) => {
            const price = formatPrice(item.priceSnapshot, item.currencyCode);
            const match =
              item.finalScore != null ? Math.round(item.finalScore * 100) : null;
            return (
              <li
                key={item.uuid}
                className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-white p-3"
              >
                <div className="min-w-0">
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
                </div>
                <div className="shrink-0 text-right">
                  {price && (
                    <p className="font-bold text-gray-900">{price}</p>
                  )}
                  {match != null && (
                    <p className="text-[12px] font-semibold text-primary-700">
                      {match}% match
                    </p>
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
