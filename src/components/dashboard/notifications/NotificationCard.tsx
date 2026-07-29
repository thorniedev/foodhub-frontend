// components/dashboard/notifications/NotificationCard.tsx
"use client";

import Link from "next/link";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { categoryStyles } from "@/lib/notifications/category-styles";
import { timeAgo } from "@/lib/notifications/mock-data";
import type { AppNotification } from "@/types/notifications";

interface Props {
  notification: AppNotification;
}

export default function NotificationCard({ notification }: Props) {
  const style = categoryStyles[notification.category];
  const Icon = style.icon;

  return (
    <article
      className={`relative flex gap-4 rounded-2xl border border-l-4 bg-white p-4 shadow-sm transition hover:shadow-md ${
        notification.isUrgent
          ? "border-rose-200 " + style.border
          : "border-slate-100 " + style.border
      }`}
    >
      {notification.isUnread && (
        <span
          className="absolute right-4 top-4 h-2 w-2 rounded-full bg-emerald-500"
          aria-hidden
        />
      )}

      {notification.actor ? (
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${notification.actor.color ?? "bg-slate-400"}`}
        >
          {notification.actor.initials}
        </span>
      ) : (
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.iconBg}`}
        >
          <Icon className={`h-5 w-5 ${style.iconColor}`} strokeWidth={2} />
        </span>
      )}

      <div className="flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xl font-semibold text-slate-900">
            {notification.title}
          </p>
          {notification.isUrgent && (
            <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-base font-medium text-rose-600">
              <AlertTriangle className="h-3 w-3" />
              បន្ទាន់
            </span>
          )}
        </div>

        <p className="text-sm leading-relaxed text-slate-500">
          {notification.message}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {notification.tags.map((tag) => (
              <span
                key={tag.label}
                className={`rounded-full px-2 py-0.5 text-base font-medium ${
                  tag.tone === "urgent"
                    ? "bg-rose-50 text-rose-600"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {tag.label}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 text-base text-slate-400">
            <span>{timeAgo(notification.createdAt)}</span>
            <Link
              href={notification.action.href}
              className="flex items-center gap-0.5 font-medium text-emerald-600 hover:text-emerald-700"
            >
              {notification.action.label}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
