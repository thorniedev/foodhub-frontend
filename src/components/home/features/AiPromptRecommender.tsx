"use client";

import { useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import {
  Check,
  ChevronDown,
  Sparkles,
  Send,
  Loader2,
  ShieldCheck,
  Users,
} from "lucide-react";

import { useGetMediaAccessUrlQuery } from "@/app/store/memberProfileApi";

import type { MemberProfile } from "@/types/member-profile/member-profile";
import type { RecommendationItem } from "@/types/recommendation";

const MAX_PROMPT = 200;

const RELATIONSHIP_LABELS: Record<string, string> = {
  SELF: "ខ្លួនឯង",
  PARENT: "ឪពុកម្តាយ",
  SPOUSE: "ប្តី ឬប្រពន្ធ",
  CHILD: "កូន",
  SIBLING: "បងប្អូន",
  GRANDPARENT: "ជីដូនជីតា",
  OTHER: "ផ្សេងៗ",
};

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

/** Small circular avatar; falls back to the profile's first letter. */
function ProfileAvatar({
  name,
  avatarMediaUuid,
  size = 28,
}: {
  name: string;
  avatarMediaUuid: string | null;
  size?: number;
}) {
  const { data } = useGetMediaAccessUrlQuery(avatarMediaUuid ?? "", {
    skip: !avatarMediaUuid,
  });

  const firstLetter = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-800/10 text-primary-800"
      style={{ width: size, height: size }}
    >
      {data?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.url}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          className="font-bold"
          style={{ fontSize: Math.max(11, Math.round(size * 0.42)) }}
        >
          {firstLetter}
        </span>
      )}
    </span>
  );
}

/** Overlapping avatar stack used on the dropdown trigger for 2+ profiles. */
function ProfileAvatarStack({ profiles }: { profiles: MemberProfile[] }) {
  const visible = profiles.slice(0, 3);

  return (
    <span className="flex shrink-0 items-center">
      {visible.map((profile, index) => (
        <span
          key={profile.uuid}
          className="shrink-0 rounded-full ring-2 ring-white"
          style={{ marginLeft: index === 0 ? 0 : -8, zIndex: visible.length - index }}
        >
          <ProfileAvatar
            name={profile.profileName}
            avatarMediaUuid={profile.avatarMediaUuid}
            size={20}
          />
        </span>
      ))}
    </span>
  );
}

/**
 * Dropdown that lets the user pick which family profiles the AI session
 * should recommend for: one profile, several (a GROUP session safe for all
 * of them), or every active profile via "select all". Selecting none falls
 * back to the default profile. The same selection is shared (via
 * useRecommendationProfileSelection) with the toggle on the
 * "គណនីសមាជិកគ្រួសារ" dashboard list.
 */
function ProfileSelect({
  profiles,
  targetProfiles,
  onToggle,
  onSelectAll,
  allSelected,
}: {
  profiles: MemberProfile[];
  targetProfiles: MemberProfile[];
  onToggle: (profile: MemberProfile) => void;
  onSelectAll: () => void;
  allSelected: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (profiles.length === 0) {
    return null;
  }

  const targetUuids = new Set(targetProfiles.map((profile) => profile.uuid));

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full bg-emerald-50 py-0.5 pl-0.5 pr-2 text-[12px] font-medium text-emerald-700 transition hover:bg-emerald-100"
      >
        {targetProfiles.length > 1 ? (
          <ProfileAvatarStack profiles={targetProfiles} />
        ) : (
          <ProfileAvatar
            name={targetProfiles[0]?.profileName ?? "?"}
            avatarMediaUuid={targetProfiles[0]?.avatarMediaUuid ?? null}
            size={20}
          />
        )}
        <span className="max-w-[130px] truncate">
          {targetProfiles.length > 1
            ? `គ្រួសារ (${targetProfiles.length} នាក់)`
            : targetProfiles[0]?.profileName ?? "ជ្រើសរើសគណនី"}
        </span>
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-multiselectable="true"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-30 mt-2 w-[230px] overflow-hidden rounded-2xl border border-gray-100 bg-white p-1.5 shadow-[0_18px_50px_rgba(15,23,42,0.14)]"
          >
            <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              គ្រួសារ
            </p>

            <button
              type="button"
              role="option"
              aria-selected={allSelected}
              onClick={onSelectAll}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition ${
                allSelected ? "bg-primary-50" : "hover:bg-gray-50"
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-800/10 text-primary-800">
                <Users className="h-4 w-4" />
              </span>

              <span className="min-w-0 flex-1 text-[14px] font-semibold text-gray-900">
                ជ្រើសរើសទាំងអស់
              </span>

              {allSelected && (
                <Check className="h-4 w-4 shrink-0 text-primary-700" />
              )}
            </button>

            <div className="my-1 border-t border-gray-100" />

            {profiles.map((profile) => {
              const isSelected = targetUuids.has(profile.uuid);

              return (
                <button
                  key={profile.uuid}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onToggle(profile)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition ${
                    isSelected ? "bg-primary-50" : "hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border ${
                      isSelected
                        ? "border-primary-700 bg-primary-700"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </span>

                  <ProfileAvatar
                    name={profile.profileName}
                    avatarMediaUuid={profile.avatarMediaUuid}
                    size={32}
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-gray-900">
                      {profile.profileName}
                    </span>
                    <span className="block truncate text-[12px] text-gray-400">
                      {profile.isDefault
                        ? "លំនាំដើម"
                        : RELATIONSHIP_LABELS[profile.relationship] ??
                          profile.relationship}
                    </span>
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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

        <ProfileSelect
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
