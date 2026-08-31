"use client";

import React, { Suspense, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  Store,
  Loader2,
  ArrowLeft,
  Utensils,
} from "lucide-react";
import { useGetInteractionHistoryQuery } from "@/app/store/interactionApi";
import { useGetMenuItemsQuery, useGetMenuItemByUuidQuery } from "@/app/store/menuApi";
import { DEFAULT_FOOD_IMAGE, toFrontendApiAssetUrl } from "@/lib/catalog-media";
import type { InteractionEventResponse } from "@/types/interaction";
import type { CatalogMenuItem } from "@/types/catalog-menu-item";

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

function HistoryItemCard({
  event,
  allMenuItems,
}: {
  event: InteractionEventResponse;
  allMenuItems: CatalogMenuItem[];
}) {
  const menuItemUuid = event.menuItemUuid || event.foodUuid || "";
  const { data: itemDetail } = useGetMenuItemByUuidQuery(menuItemUuid, {
    skip: !menuItemUuid,
  });

  const cachedItem = allMenuItems.find(
    (m) =>
      m.uuid === menuItemUuid ||
      m.food?.uuid === menuItemUuid ||
      m.name === menuItemUuid ||
      m.localName === menuItemUuid,
  );

  const title =
    itemDetail?.localName ||
    itemDetail?.name ||
    cachedItem?.localName ||
    cachedItem?.name ||
    "មុខម្ហូប";

  const rawPrice = itemDetail?.price ?? cachedItem?.price;
  const price = rawPrice != null ? `$${Number(rawPrice).toFixed(2)}` : null;

  const storeName =
    itemDetail?.store?.name || cachedItem?.store?.name || null;

  const rawThumbnail =
    itemDetail?.thumbnail || cachedItem?.thumbnail || "/Image/default-food.png";
  const thumbnail = toFrontendApiAssetUrl(rawThumbnail, DEFAULT_FOOD_IMAGE);

  if (event.storeUuid && !event.menuItemUuid) {
    return (
      <Link
        href={`/stores/${event.storeUuid}`}
        className="group block overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
            <Store className="h-8 w-8" />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 text-base text-slate-400">
              <Clock className="h-4 w-4" />
              <span>បានមើល {formatRelativeTime(event.occurredAt)}</span>
            </div>

            <h4 className="truncate text-lg font-bold text-slate-900 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400 sm:text-xl">
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
      className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Image
          src={thumbnail}
          alt={title}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />

        <div className="absolute top-3 left-3 rounded-xl bg-black/60 px-3 py-1.5 text-base font-semibold text-white backdrop-blur-xs">
          {formatRelativeTime(event.occurredAt)}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <h4 className="truncate text-lg font-bold text-slate-900 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400 sm:text-xl">
          {title}
        </h4>

        <div className="mt-3 flex items-center justify-between gap-3 text-base">
          <span className="truncate font-medium text-slate-500 dark:text-slate-400">
            {storeName || "មុខម្ហូប"}
          </span>

          {price && (
            <span className="shrink-0 text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
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
    size: 50,
  });

  const { data: allMenuItems = [] } = useGetMenuItemsQuery();

  // Deduplicate history to show unique viewed items in reverse chronological order
  const history = useMemo(() => {
    const rawEvents: InteractionEventResponse[] =
      pageData?.contents ?? (Array.isArray(pageData) ? pageData : []);

    const seen = new Set<string>();
    const uniqueList: InteractionEventResponse[] = [];

    for (const ev of rawEvents) {
      const key =
        ev.menuItemUuid ||
        ev.foodUuid ||
        ev.storeUuid ||
        ev.uuid ||
        ev.clientEventId;

      if (key && !seen.has(key)) {
        seen.add(key);
        uniqueList.push(ev);
      }
    }

    return uniqueList;
  }, [pageData]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      {/* Clean Dashboard Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5 pt-5">
          <Link
            href="/dashboard"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            title="ត្រឡប់ក្រោយ"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              ប្រវត្តិដែលបានមើល
            </h1>
            <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400 sm:text-base">
              {history.length} មុខម្ហូប និងហាងដែលអ្នកបានបើកមើលថ្មីៗនេះ
            </p>
          </div>
        </div>
      </div>

      {/* History Items Grid */}
      {isLoading ? (
        <div className="flex h-56 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-base text-slate-400 sm:text-lg">កំពុងទាញយកប្រវត្តិ...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-8 py-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 sm:h-20 sm:w-20">
            <Clock className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white sm:mt-5 sm:text-2xl">
            មិនទាន់មានប្រវត្តិដែលបានមើលទេ
          </h3>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:mt-2 sm:text-base">
            មុខម្ហូប និងហាងដែលអ្នកបើកមើលនឹងបង្ហាញនៅទីនេះដោយស្វ័យប្រវត្តិ។
          </p>
          <div className="mt-6 flex gap-4 sm:mt-8">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-base font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-95 sm:text-lg"
            >
              <Utensils className="h-5 w-5" />
              <span>មើលមុខម្ហូប</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {history.map((event) => (
            <HistoryItemCard
              key={event.uuid || event.clientEventId}
              event={event}
              allMenuItems={allMenuItems}
            />
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
