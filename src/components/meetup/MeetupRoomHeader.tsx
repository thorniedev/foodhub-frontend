"use client";

import {
  Check,
  Copy,
  MapPin,
  QrCode,
  Radio,
  Share2,
  Trophy,
  Users,
} from "lucide-react";

import type { MeetupGroupResponse, MeetupGroupStatus } from "@/types/meetup-api";

const STATUS_META: Record<
  string,
  { label: string; tone: string; live: boolean }
> = {
  COLLECTING: {
    label: "កំពុងប្រមូលអ្នកចូលរួម",
    tone: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    live: true,
  },
  RECOMMENDING: {
    label: "កំពុងណែនាំហាង",
    tone: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
    live: true,
  },
  VOTING: {
    label: "កំពុងបោះឆ្នោត",
    tone: "bg-accent-100 text-primary-950 border border-accent-300 dark:bg-accent-950/40 dark:text-accent-300 dark:border-accent-800",
    live: true,
  },
  DECIDED: {
    label: "សម្រេចរួច",
    tone: "bg-primary-50 text-primary-800 border border-primary-200 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-800",
    live: false,
  },
  CANCELLED: {
    label: "បានលុបចោល",
    tone: "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    live: false,
  },
  EXPIRED: {
    label: "ផុតកំណត់",
    tone: "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    live: false,
  },
};

function statusMeta(status: MeetupGroupStatus | null) {
  return (
    (status ? STATUS_META[status] : undefined) ?? {
      label: "ការណាត់ជួប",
      tone: "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300",
      live: false,
    }
  );
}

interface MeetupRoomHeaderProps {
  group: MeetupGroupResponse;
  participantCount: number;
  totalVotes: number;
  canShare: boolean;
  copiedInvite: boolean;
  copiedResult: boolean;
  onCopyInvite: () => void;
  onCopyResult: () => void;
  onShowQr: () => void;
}

export default function MeetupRoomHeader({
  group,
  participantCount,
  totalVotes,
  canShare,
  copiedInvite,
  copiedResult,
  onCopyInvite,
  onCopyResult,
  onShowQr,
}: MeetupRoomHeaderProps) {
  const meta = statusMeta(group.status);

  const place =
    group.locationMode === "PIN"
      ? `ជុំវិញ ${group.searchRadiusKm ?? 5} គ.ម`
      : [group.targetAreaName, group.targetCity, group.targetProvince]
          .filter(Boolean)
          .join(", ") || "តាមតំបន់";

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${meta.tone}`}
            >
              {meta.live ? (
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
                </span>
              ) : (
                <Trophy className="h-3.5 w-3.5" />
              )}
              {meta.label}
            </span>

            <h1 className="mt-4 text-2xl! font-black leading-tight tracking-tight text-slate-900 sm:text-3xl! lg:text-4xl! dark:text-white">
              {group.title || "ការណាត់ញ៉ាំអាហារ FoodHub"}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
                <span className="text-slate-800 dark:text-slate-200">{participantCount}</span> នាក់ចូលរួម
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
                <span className="truncate">{place}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Radio className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
                <span className="text-slate-800 dark:text-slate-200">{totalVotes}</span> សំឡេង
              </span>
            </div>
          </div>

          {canShare && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onShowQr}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <QrCode className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                QR កូដ
              </button>
              <button
                type="button"
                onClick={onCopyInvite}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-primary-700 active:scale-95"
              >
                {copiedInvite ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
                {copiedInvite ? "បានចម្លង" : "អញ្ជើញ"}
              </button>
              <button
                type="button"
                onClick={onCopyResult}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-accent-300 px-4 text-sm font-bold text-primary-950 shadow-sm transition hover:bg-accent-200 active:scale-95"
              >
                {copiedResult ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedResult ? "បានចម្លង" : "លទ្ធផល"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
