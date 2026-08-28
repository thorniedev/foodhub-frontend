"use client";

import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  Store,
  Loader2,
} from "lucide-react";
import { useGetInteractionHistoryQuery } from "@/app/store/interactionApi";
import { useGetMenuItemByUuidQuery } from "@/app/store/menuApi";
import type { InteractionEventResponse } from "@/types/interaction";

function getMediaUrl(value: string | null | undefined): string {
  if (!value) return "/Image/default-food.png";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/api/v1/")) return `/api/${value.slice("/api/v1/".length)}`;
  if (value.startsWith("/")) return value;
  return `/${value}`;
}

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "ថ្មីៗនេះ";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 2) return "ឥឡូវនេះ";
    if (diffMins < 60) return `${diffMins} នាទីមុន`;
    if (diffHours < 24) return `${diffHours} ម៉ោងមុន`;
    if (diffDays < 7) return `${diffDays} ថ្ងៃមុន`;

    return new Intl.DateTimeFormat("km-KH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return "ថ្មីៗនេះ";
  }
}

function HistoryItemCard({ event }: { event: InteractionEventResponse }) {
  const menuItemUuid = event.menuItemUuid || event.foodUuid || "";
  const { data: itemDetail, isLoading } = useGetMenuItemByUuidQuery(menuItemUuid, {
    skip: !menuItemUuid,
  });

  const title =
    itemDetail?.localName || itemDetail?.name || "មុខម្ហូប";
  const price = itemDetail?.price != null ? `$${Number(itemDetail.price).toFixed(2)}` : null;
  const storeName = itemDetail?.store?.name || null;
  const thumbnail = itemDetail?.thumbnail || "/Image/default-food.png";

  if (event.storeUuid && !event.menuItemUuid) {
    return (
      <Link
        href={`/stores/${event.storeUuid}`}
        className="group block overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
            <Store className="h-7 w-7" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              <span>បានមើល {formatRelativeTime(event.occurredAt)}</span>
            </div>

            <h4 className="mt-1 truncate text-base font-bold text-slate-900 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
              ហាង
            </h4>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/menu/${menuItemUuid}`}
      className="group block overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Image
          src={getMediaUrl(thumbnail)}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />

        <div className="absolute top-3 left-3 rounded-xl bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-xs">
          {formatRelativeTime(event.occurredAt)}
        </div>
      </div>

      <div className="p-4">
        <h4 className="truncate text-base font-bold text-slate-900 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
          {isLoading ? "កំពុងផ្ទុកមុខម្ហូប..." : title}
        </h4>

        <div className="mt-2 flex items-center justify-between gap-2 text-xs">
          <span className="truncate text-slate-500 dark:text-slate-400">
            {storeName || "មុខម្ហូប"}
          </span>

          {price && (
            <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
              {price}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function HistoryContent() {
  const { data: pageData, isLoading } = useGetInteractionHistoryQuery({
    eventType: "VIEW",
    page: 0,
    size: 30,
  });

  const history = pageData?.contents ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-4 rounded-3xl bg-linear-to-r from-teal-800 to-emerald-950 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6" />
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              ប្រវត្តិដែលបានមើល
            </h2>
          </div>
          <p className="text-sm text-emerald-100/90">
            មុខម្ហូប និងហាងដែលអ្នកបានបើកមើលថ្មីៗនេះ។
          </p>
        </div>
      </div>

      {/* History Items Grid */}
      {isLoading ? (
        <div className="flex h-56 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50">
            <Clock className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
            មិនទាន់មានប្រវត្តិដែលបានមើលទេ
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            មុខម្ហូប និងហាងដែលអ្នកបើកមើលនឹងបង្ហាញនៅទីនេះដោយស្វ័យប្រវត្តិ។
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/menu"
              className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition"
            >
              មើលមុខម្ហូប
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {history.map((event) => (
            <HistoryItemCard key={event.uuid || event.clientEventId} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex h-64 max-w-5xl items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <HistoryContent />
    </Suspense>
  );
}
