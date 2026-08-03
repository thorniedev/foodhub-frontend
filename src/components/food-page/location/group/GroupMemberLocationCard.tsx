"use client";

import { motion } from "framer-motion";
import {
  IoAlertCircleOutline,
  IoCheckmarkCircle,
  IoLinkOutline,
  IoLocationOutline,
  IoOpenOutline,
  IoPersonOutline,
  IoSearchOutline,
  IoTrashOutline,
} from "react-icons/io5";

import type { GroupLocationMember } from "@/types/group-location";

export type GroupMapResolveStatus = "idle" | "resolving" | "ready" | "error";

export interface GroupMemberLocationDraft {
  mapUrl: string;
  status: GroupMapResolveStatus;
  errorMessage: string;
  resolvedLabel: string;
  resolvedUrl: string;
}

interface GroupMemberLocationCardProps {
  index: number;
  member: GroupLocationMember;
  draft: GroupMemberLocationDraft;

  canRemove: boolean;
  canUseCurrentLocation: boolean;

  onNameChange: (name: string) => void;
  onMapUrlChange: (value: string) => void;
  onResolveMapUrl: () => void;
  onUseCurrentLocation: () => void;
  onRemove: () => void;
}

export default function GroupMemberLocationCard({
  index,
  member,
  draft,
  canRemove,
  canUseCurrentLocation,
  onNameChange,
  onMapUrlChange,
  onResolveMapUrl,
  onUseCurrentLocation,
  onRemove,
}: GroupMemberLocationCardProps) {
  const ready =
    member.locationStatus === "ready" && member.coordinates !== null;

  const resolving = draft.status === "resolving";
  const hasError = draft.status === "error";

  const canResolve = draft.mapUrl.trim().length > 0 && !resolving;

  const statusText = resolving
    ? "កំពុងស្វែងរកទីតាំង..."
    : hasError
      ? "មិនអាចរកទីតាំងបាន"
      : ready
        ? "ទីតាំងរួចរាល់"
        : "បញ្ចូល Google Maps link";

  const statusClasses = resolving
    ? "text-orange-600"
    : hasError
      ? "text-red-600"
      : ready
        ? "text-emerald-600"
        : "text-slate-400";

  const cardClasses = hasError
    ? "border-red-200 ring-4 ring-red-50/70"
    : ready
      ? "border-emerald-200 ring-4 ring-emerald-50/70"
      : resolving
        ? "border-orange-200 ring-4 ring-orange-50/70"
        : "border-slate-100 hover:border-primary-200";

  const mapLink = draft.resolvedUrl || draft.mapUrl.trim();

  return (
    <motion.article
      layout
      initial={{
        opacity: 0,
        y: 12,
        scale: 0.99,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: -8,
        scale: 0.98,
      }}
      transition={{
        type: "spring",
        stiffness: 290,
        damping: 25,
      }}
      className={`overflow-hidden rounded-[22px] border bg-white shadow-sm transition ${cardClasses}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[22px] ${
              hasError
                ? "bg-red-100 text-red-600"
                : resolving
                  ? "bg-orange-100 text-orange-600"
                  : ready
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-primary-50 text-primary-700"
            }`}
          >
            {hasError ? (
              <IoAlertCircleOutline />
            ) : resolving ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-orange-200 border-t-orange-600" />
            ) : ready ? (
              <IoCheckmarkCircle />
            ) : (
              <IoPersonOutline />
            )}
          </span>

          <div className="min-w-0">
            <p className="truncate text-[18px] font-bold text-primary-900">
              {index === 0 ? "អ្នក" : member.name || `មិត្តភក្តិ ${index}`}
            </p>

            <p className={`mt-0.5 text-[16px] font-medium ${statusClasses}`}>
              {statusText}
            </p>
          </div>
        </div>

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${member.name}`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-50"
          >
            <IoTrashOutline className="text-[21px]" />
          </button>
        )}
      </div>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(180px,0.7fr)_minmax(0,1.7fr)_auto] lg:items-end">
        <label className="block min-w-0">
          <span className="text-[16px] font-semibold text-slate-700">
            ឈ្មោះ
          </span>

          <input
            type="text"
            value={member.name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder={index === 0 ? "អ្នក" : "ឈ្មោះមិត្តភក្តិ"}
            className="mt-2 min-h-12 w-full rounded-[16px] border border-slate-200 bg-white px-4 text-[16px] text-primary-900 outline-none transition placeholder:text-slate-300 focus:border-primary-400 focus:ring-4 focus:ring-primary-50"
          />
        </label>

        <label className="block min-w-0">
          <span className="text-[16px] font-semibold text-slate-700">
            Google Maps link
          </span>

          <div
            className={`mt-2 flex min-w-0 items-center gap-2 rounded-[16px] border bg-white px-3 transition focus-within:ring-4 ${
              hasError
                ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-50"
                : "border-slate-200 focus-within:border-primary-400 focus-within:ring-primary-50"
            }`}
          >
            <IoLinkOutline
              className={`shrink-0 text-[21px] ${
                hasError ? "text-red-500" : "text-primary-700"
              }`}
            />

            <input
              type="url"
              value={draft.mapUrl}
              disabled={resolving}
              onChange={(event) => onMapUrlChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && canResolve) {
                  event.preventDefault();
                  onResolveMapUrl();
                }
              }}
              placeholder="https://maps.app.goo.gl/..."
              autoComplete="off"
              spellCheck={false}
              aria-label={`Google Maps link for ${member.name}`}
              className="min-h-12 min-w-0 flex-1 bg-transparent text-[16px] text-primary-900 outline-none placeholder:text-slate-300 disabled:cursor-wait disabled:text-slate-500"
            />
          </div>
        </label>

        <button
          type="button"
          disabled={!canResolve}
          onClick={onResolveMapUrl}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-primary-800 px-5 text-[16px] font-bold text-white transition hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 lg:w-auto lg:min-w-[150px]"
        >
          {resolving ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              កំពុងរក...
            </>
          ) : (
            <>
              <IoSearchOutline className="text-[20px]" />
              រកទីតាំង
            </>
          )}
        </button>
      </div>

      {hasError && (
        <div className="mx-4 mb-4 flex items-start gap-3 rounded-[16px] border border-red-100 bg-red-50 px-4 py-3 sm:mx-5">
          <IoAlertCircleOutline className="mt-0.5 shrink-0 text-[21px] text-red-600" />

          <p className="text-[16px] leading-7 text-red-700">
            {draft.errorMessage || "Google Maps link នេះមិនអាចប្រើបានទេ។"}
          </p>
        </div>
      )}

      {ready && (
        <div className="mx-4 mb-4 flex flex-col gap-3 rounded-[16px] border border-emerald-100 bg-emerald-50 px-4 py-3 sm:mx-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
              <IoCheckmarkCircle className="text-[22px]" />
            </span>

            <div className="min-w-0">
              <p className="text-[16px] font-bold text-emerald-800">
                ទីតាំងបានរកឃើញ
              </p>

              <p className="truncate text-[16px] text-emerald-700/80">
                {draft.resolvedLabel || "Google Maps location"}
              </p>
            </div>
          </div>

          {mapLink && (
            <a
              href={mapLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 text-[16px] font-semibold text-emerald-800 transition hover:bg-emerald-100 sm:w-auto"
            >
              <IoOpenOutline className="text-[19px]" />
              បើកផែនទី
            </a>
          )}
        </div>
      )}

      {canUseCurrentLocation && (
        <div className="border-t border-slate-100 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onUseCurrentLocation}
            disabled={resolving}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary-50 px-5 text-[16px] font-semibold text-primary-700 transition hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
          >
            <IoLocationOutline className="text-[20px]" />
            ប្រើទីតាំងបច្ចុប្បន្នរបស់ខ្ញុំ
          </button>
        </div>
      )}
    </motion.article>
  );
}
