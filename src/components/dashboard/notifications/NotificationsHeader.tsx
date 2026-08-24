"use client";

import { CheckCheck, Loader2, RefreshCw } from "lucide-react";

interface Props {
  unreadCount: number;
  isMarkingAllRead?: boolean;
  isRefreshing?: boolean;
  onMarkAllRead: () => void;
  onRefresh: () => void;
}

export default function NotificationsHeader({
  unreadCount,
  isMarkingAllRead = false,
  isRefreshing = false,
  onMarkAllRead,
  onRefresh,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-4xl font-semibold text-[#F97316]">ការជូនដំណឹង</p>
        <p className="mt-1 text-md text-slate-500">
          {unreadCount > 0
            ? `អ្នកមានការជូនដំណឹង ${unreadCount} មិនទាន់អាន`
            : "អ្នកបានអានការជូនដំណឹងទាំងអស់ហើយ"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={isMarkingAllRead || unreadCount === 0}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
        >
          {isMarkingAllRead ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCheck className="h-4 w-4" />
          )}
          សម្គាល់ថាបានអានទាំងអស់
        </button>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>
    </div>
  );
}
