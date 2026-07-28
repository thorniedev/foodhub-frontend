// components/dashboard/notifications/NotificationsHeader.tsx
"use client";

import { CheckCheck, Trash2 } from "lucide-react";

interface Props {
  unreadCount: number;
  onMarkAllRead: () => void;
  onClearRead: () => void;
}

export default function NotificationsHeader({
  unreadCount,
  onMarkAllRead,
  onClearRead,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">ការជូនដំណឹង</h1>
        <p className="mt-1 text-sm text-slate-500">
          {unreadCount > 0
            ? `អ្នកមានការជូនដំណឹង ${unreadCount} មិនទាន់អាន`
            : "អ្នកបានអានការជូនដំណឹងទាំងអស់ហើយ"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMarkAllRead}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
        >
          <CheckCheck className="h-4 w-4" />
          សម្គាល់ថាបានអានទាំងអស់
        </button>
        <button
          type="button"
          onClick={onClearRead}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
        >
          <Trash2 className="h-4 w-4" />
          លុបចេញអ្វីដែលបានអាន
        </button>
      </div>
    </div>
  );
}