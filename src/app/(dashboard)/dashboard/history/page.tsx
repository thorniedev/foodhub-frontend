"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  getHistory,
  HISTORY_UPDATED_EVENT,
  type HistoryItem,
} from "@/lib/history/recentlyViewed";

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const updateHistory = () => {
      setHistory(getHistory());
    };

    updateHistory();

    window.addEventListener(HISTORY_UPDATED_EVENT, updateHistory);

    return () => {
      window.removeEventListener(HISTORY_UPDATED_EVENT, updateHistory);
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <p className="text-[28px] font-bold text-slate-900">
          ប្រវត្តិដែលបានមើល
        </p>

        <p className="mt-1 text-[17px] text-slate-500">
          មុខម្ហូបដែលអ្នកបានមើលថ្មីៗ
        </p>
      </div>

      {/* Empty state */}
      {history.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-[18px] font-semibold text-slate-600">
            មិនទាន់មានមុខម្ហូបដែលបានមើលទេ
          </p>

          <p className="mt-2 text-[17px] text-slate-400">
            ចុចលើមុខម្ហូបណាមួយ ដើម្បីបន្ថែមទៅក្នុងប្រវត្តិ។
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {history.map((item) => (
            <HistoryFoodCard key={item.uuid} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryFoodCard({ item }: { item: HistoryItem }) {
  return (
    <Link href={`/food/${item.uuid}`} className="group block w-full">
      <div className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          {item.thumbnail ? (
            <Image
              src={item.thumbnail}
              alt={item.localName || item.name}
              fill
              sizes="
                (max-width: 640px) 100vw,
                (max-width: 1024px) 50vw,
                25vw
              "
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[17px] text-slate-400">
              មិនមានរូបភាព
            </div>
          )}

          {/* Recently viewed badge */}
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-white/90 px-3 py-1.5 text-[15px] font-medium text-slate-700 shadow-sm backdrop-blur">
              បានមើលថ្មីៗ
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="line-clamp-1 text-[18px] font-bold text-slate-900">
            {item.localName || item.name}
          </h3>

          {item.localName && item.name !== item.localName && (
            <p className="mt-1 line-clamp-1 text-[17px] text-slate-500">
              {item.name}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            {/* Price */}
            {item.price != null ? (
              <p className="text-[18px] font-bold text-primary-800">
                {item.currencyCode === "USD" ? "$" : item.currencyCode || "$"}

                {item.price.toFixed(2)}
              </p>
            ) : (
              <span />
            )}

            {/* Viewed date */}
            <span className="text-[15px] text-slate-400">
              {formatViewedTime(item.viewedAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatViewedTime(viewedAt: string) {
  const date = new Date(viewedAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("km-KH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
