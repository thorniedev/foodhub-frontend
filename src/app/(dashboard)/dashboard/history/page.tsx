"use client";

import { useEffect, useState } from "react";
import { getHistory, type HistoryItem } from "@/lib/history/recentlyViewed";

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h4 className="text-[26px] font-bold text-slate-900">
        ប្រវត្តិដែលបានមើល
      </h4>

      <p className="mt-1 text-[17px] text-slate-500">
        មុខម្ហូបដែលអ្នកបានមើលថ្មីៗ
      </p>

      <div className="mt-6 grid gap-4">
        {history.map((item) => (
          <div key={item.uuid}>{/* render your existing card here */}</div>
        ))}
      </div>
    </div>
  );
}
