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
    tone: "bg-white/15 text-white",
    live: true,
  },
  RECOMMENDING: {
    label: "កំពុងណែនាំម្ហូប",
    tone: "bg-white/15 text-white",
    live: true,
  },
  VOTING: { label: "កំពុងបោះឆ្នោត", tone: "bg-accent-300 text-primary-950", live: true },
  DECIDED: { label: "សម្រេចរួច", tone: "bg-accent-300 text-primary-950", live: false },
  CANCELLED: { label: "បានលុបចោល", tone: "bg-rose-500 text-white", live: false },
  EXPIRED: { label: "ផុតកំណត់", tone: "bg-slate-500 text-white", live: false },
};

function statusMeta(status: MeetupGroupStatus | null) {
  return (
    (status ? STATUS_META[status] : undefined) ?? {
      label: "ការណាត់ជួប",
      tone: "bg-white/15 text-white",
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
    <section className="overflow-hidden rounded-3xl bg-linear-to-br from-primary-800 via-primary-900 to-primary-950 text-white shadow-xl">
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

            <h1 className="mt-4 text-2xl! font-black leading-tight tracking-tight sm:text-3xl! lg:text-4xl!">
              {group.title || "ការណាត់ញ៉ាំអាហារ FoodHub"}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-primary-100">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 shrink-0" />
                {participantCount} នាក់ចូលរួម
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{place}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Radio className="h-4 w-4 shrink-0" />
                {totalVotes} សំឡេង
              </span>
            </div>
          </div>

          {canShare && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onShowQr}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
              >
                <QrCode className="h-4 w-4" />
                QR កូដ
              </button>
              <button
                type="button"
                onClick={onCopyInvite}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-bold text-primary-950 transition hover:bg-slate-100 active:scale-95"
              >
                {copiedInvite ? (
                  <Check className="h-4 w-4 text-primary-600" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
                {copiedInvite ? "បានចម្លង" : "អញ្ជើញ"}
              </button>
              <button
                type="button"
                onClick={onCopyResult}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-accent-300 px-4 text-sm font-bold text-primary-950 transition hover:bg-accent-200 active:scale-95"
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
