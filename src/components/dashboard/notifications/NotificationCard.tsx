"use client";

import Image from "next/image";
import { AlertTriangle, ChevronRight, Loader2, Trash2, Volume2, VolumeX } from "lucide-react";
import { DEFAULT_FOOD_IMAGE, toFrontendApiAssetUrl } from "@/lib/catalog-media";
import { categoryStyles } from "@/lib/notifications/category-styles";
import { formatNotificationTime } from "@/lib/formatDate";
import { useKhmerVoiceNotification } from "@/hooks/useKhmerVoiceNotification";
import type { AppNotification } from "@/types/notifications";

interface Props {
  notification: AppNotification;
  isDismissing?: boolean;
  isOpening?: boolean;
  onOpen: (notification: AppNotification) => void;
  onDismiss: (notification: AppNotification) => void;
}

export default function NotificationCard({
  notification,
  isDismissing = false,
  isOpening = false,
  onOpen,
  onDismiss,
}: Props) {
  const {
    playNotificationSpeech,
    stopNotificationSpeech,
    currentlyPlayingId,
    isLoadingId,
  } = useKhmerVoiceNotification();

  const isPlayingThis = currentlyPlayingId === notification.id;
  const isLoadingThis = isLoadingId === notification.id;

  const style = categoryStyles[notification.category];
  const Icon = style.icon;

  return (
    <article
      className={`relative flex gap-4 rounded-2xl border border-l-4 bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-slate-900 ${
        notification.isUrgent
          ? "border-rose-200 dark:border-rose-900/60 " + style.border
          : "border-slate-100 dark:border-slate-800 " + style.border
      }`}
    >
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

      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => onOpen(notification)}
            disabled={isOpening}
            className="block min-w-0 flex-1 rounded-xl text-left outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-wait"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {notification.title}
              </p>
              {notification.isUnread && (
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-950"
                  aria-hidden
                />
              )}
              {notification.isUrgent && (
                <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-base font-medium text-rose-600 dark:bg-rose-950/50 dark:text-rose-300">
                  <AlertTriangle className="h-3 w-3" />
                  បន្ទាន់
                </span>
              )}
            </div>

            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {notification.message}
            </p>
          </button>

          {notification.imageUrl && (
            <button
              type="button"
              onClick={() => onOpen(notification)}
              disabled={isOpening}
              className="group relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm ring-1 ring-slate-900/5 transition duration-200 hover:scale-105 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:ring-slate-700"
              title={notification.title}
              aria-label={notification.title}
            >
              <img
                src={toFrontendApiAssetUrl(
                  notification.imageUrl,
                  DEFAULT_FOOD_IMAGE,
                )}
                alt={notification.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                onError={(event) => {
                  const currentSrc = event.currentTarget.src;
                  if (!currentSrc.includes(DEFAULT_FOOD_IMAGE)) {
                    event.currentTarget.src = DEFAULT_FOOD_IMAGE;
                  }
                }}
              />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {notification.tags.map((tag) => (
              <span
                key={tag.label}
                className={`rounded-full px-2 py-0.5 text-base font-medium ${
                  tag.tone === "urgent"
                    ? "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {tag.label}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-base text-slate-400 dark:text-slate-500">
            {/* Khmer Voice Read Aloud Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isPlayingThis) {
                  stopNotificationSpeech();
                } else {
                  playNotificationSpeech({
                    id: notification.id,
                    title: notification.title,
                    message: notification.message,
                  });
                }
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-medium transition ${
                isPlayingThis
                  ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-400 dark:bg-emerald-950 dark:text-emerald-300"
                  : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-emerald-300"
              }`}
              title={
                isPlayingThis
                  ? "ផ្អាកសំឡេង (Stop Voice)"
                  : "អានជាសំឡេងខ្មែរ (Read aloud in Khmer)"
              }
              aria-label={
                isPlayingThis
                  ? "ផ្អាកសំឡេង"
                  : "អានជាសំឡេងខ្មែរ"
              }
            >
              {isLoadingThis ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                  <span className="text-xs">កំពុងរៀបចំ...</span>
                </>
              ) : isPlayingThis ? (
                <>
                  <Volume2 className="h-3.5 w-3.5 animate-bounce text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    កំពុងអាន...
                  </span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5" />
                  <span className="text-xs">អាន</span>
                </>
              )}
            </button>

            <span>{formatNotificationTime(notification.createdAt)}</span>
            <button
              type="button"
              onClick={() => onOpen(notification)}
              disabled={isOpening}
              className="flex items-center gap-0.5 font-medium text-emerald-600 transition hover:text-emerald-700 disabled:cursor-wait disabled:opacity-60 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              {isOpening && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {notification.action.label}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDismiss(notification)}
              disabled={isDismissing}
              className="flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-wait disabled:opacity-60 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
            >
              {isDismissing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
