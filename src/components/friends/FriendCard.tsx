"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FriendDto } from "@/types/friends";
import { useDeleteFriendMutation } from "@/app/store/friendsApi";
import { useGetMediaAccessUrlQuery } from "@/app/store/memberProfileApi";
import {
  Shield,
  Utensils,
  UserMinus,
  Calendar,
  Loader2,
  AlertTriangle,
  Star,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FriendCardProps {
  friend: FriendDto;
  isSelected?: boolean;
  onToggleSelect?: (userUuid: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (userUuid: string) => void;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "ថ្មីៗនេះ";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("km-KH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return "ថ្មីៗនេះ";
  }
}

// Deterministic gradient generator for initial avatars
const AVATAR_GRADIENTS = [
  "from-emerald-500 to-teal-700",
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-700",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-blue-600",
];

export function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

export function FriendAvatar({
  username,
  avatarMediaKey,
  avatarMediaUuid,
  avatarUrl,
  size = 48,
}: {
  username: string;
  avatarMediaKey?: string | null;
  avatarMediaUuid?: string | null;
  avatarUrl?: string | null;
  size?: number;
}) {
  const [imageError, setImageError] = useState(false);
  const mediaKey = avatarMediaKey || avatarMediaUuid || "";

  // Fetch access URL if media key is provided and no direct avatar URL exists
  const { data: mediaAccessData } = useGetMediaAccessUrlQuery(mediaKey, {
    skip: !mediaKey || !!avatarUrl,
  });

  const resolvedUrl = avatarUrl || mediaAccessData?.url || null;
  const initial = (username?.charAt(0) || "U").toUpperCase();
  const gradient = getAvatarGradient(username || "user");

  return (
    <div
      className="relative shrink-0 flex items-center justify-center rounded-full p-0.5 ring-2 ring-emerald-500/20 dark:ring-emerald-400/20"
      style={{ width: size, height: size }}
    >
      <div className="h-full w-full overflow-hidden rounded-full">
        {resolvedUrl && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolvedUrl}
            alt={username}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-linear-to-br ${gradient} font-bold text-white shadow-inner`}
            style={{ fontSize: Math.max(12, Math.round(size * 0.38)) }}
          >
            {initial}
          </div>
        )}
      </div>

      {/* Active Status Badge Dot */}
      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
    </div>
  );
}

export default function FriendCard({
  friend,
  isSelected = false,
  onToggleSelect,
  isFavorite = false,
  onToggleFavorite,
}: FriendCardProps) {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [deleteFriend, { isLoading: isDeleting }] = useDeleteFriendMutation();

  const handleConfirmRemove = async () => {
    try {
      await deleteFriend(friend.userUuid).unwrap();
      setShowRemoveDialog(false);
    } catch (err) {
      console.error("Failed to remove friend:", err);
    }
  };

  return (
    <>
      <div
        className={`group relative flex items-center justify-between gap-2.5 rounded-2xl border p-3 sm:gap-3.5 sm:p-4 transition-all duration-200 ${
          isSelected
            ? "border-emerald-500 bg-emerald-50/40 shadow-sm dark:border-emerald-500/60 dark:bg-emerald-950/20"
            : "border-slate-100 bg-white shadow-xs hover:border-slate-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/90 dark:hover:border-slate-700"
        }`}
      >
        {/* Left Row: Checkbox + Star + Avatar + Details */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {/* Checkbox (Multi-select for Dining) */}
          {onToggleSelect && (
            <button
              type="button"
              onClick={() => onToggleSelect(friend.userUuid)}
              title={isSelected ? "ដកចេញពីការជ្រើសរើស" : "ជ្រើសរើសសម្រាប់ណាត់ញ៉ាំ"}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all sm:h-6 sm:w-6 ${
                isSelected
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-xs dark:border-emerald-500 dark:bg-emerald-500"
                  : "border-slate-300 bg-slate-50 text-transparent hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800"
              }`}
            >
              <Check className="h-3.5 w-3.5 stroke-[3] sm:h-4 sm:w-4" />
            </button>
          )}

          {/* Favorite Star */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(friend.userUuid)}
              title={isFavorite ? "ដកចេញពីសំណព្វចិត្ត" : "ដាក់ជាមិត្តសំណព្វចិត្ត"}
              className={`shrink-0 p-0.5 transition-transform active:scale-125 sm:p-1 ${
                isFavorite
                  ? "text-amber-400 drop-shadow-xs"
                  : "text-slate-300 hover:text-amber-400/80 dark:text-slate-700 dark:hover:text-amber-400/60"
              }`}
            >
              <Star
                className={`h-4 w-4 ${isFavorite ? "fill-amber-400" : ""}`}
              />
            </button>
          )}

          {/* Avatar with dynamic Profile Picture or Initial */}
          <FriendAvatar
            username={friend.username}
            avatarMediaKey={friend.avatarMediaKey}
            avatarMediaUuid={friend.avatarMediaUuid}
            avatarUrl={friend.avatarUrl}
            size={44}
          />

          {/* Friend Names & Profile Info */}
          <div className="min-w-0 flex-1 space-y-1">
            {/* Top: Profile Badge */}
            {friend.defaultProfileName && (
              <div className="flex items-center">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40">
                  <Shield className="h-3 w-3 shrink-0" />
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">
                    {friend.defaultProfileName}
                  </span>
                </span>
              </div>
            )}

            {/* Middle: Friend Username (Full visible width) */}
            <h3 className="truncate text-base font-bold text-slate-900 dark:text-white sm:text-lg">
              {friend.username}
            </h3>

            {/* Bottom: Date */}
            <div className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap sm:text-sm">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">បានភ្ជាប់ {formatDate(friend.connectedAt)}</span>
            </div>
          </div>
        </div>

        {/* Right Row: Actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          {/* Quick Dining Invite CTA */}
          <Link
            href={`/meetup/create?friendUuid=${encodeURIComponent(friend.userUuid)}`}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600/10 p-2 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-600 hover:text-white active:scale-95 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white sm:rounded-2xl sm:px-4 sm:py-2 sm:text-base"
          >
            <Utensils className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">ណាត់ញ៉ាំ</span>
          </Link>

          {/* Remove Friend Menu Trigger */}
          <button
            type="button"
            onClick={() => setShowRemoveDialog(true)}
            title="ដកមិត្តភក្តិ"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 sm:rounded-2xl sm:p-2.5"
          >
            <UserMinus className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="max-w-md rounded-3xl bg-white p-6 dark:bg-slate-900">
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-slate-900 dark:text-white">
              ដកមិត្តភក្តិ?
            </DialogTitle>
            <DialogDescription className="text-center text-lg text-slate-500 dark:text-slate-400">
              តើអ្នកប្រាកដថាចង់ដក{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                @{friend.username}
              </span>{" "}
              ចេញពីបញ្ជីមិត្តភក្តិមែនទេ?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-5 grid grid-cols-2 gap-3 sm:justify-stretch">
            <button
              type="button"
              onClick={() => setShowRemoveDialog(false)}
              className="rounded-2xl border border-slate-200 bg-white py-3 text-lg font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              បោះបង់
            </button>
            <button
              type="button"
              onClick={handleConfirmRemove}
              disabled={isDeleting}
              className="flex items-center justify-center gap-2 rounded-2xl bg-rose-600 py-3 text-lg font-bold text-white hover:bg-rose-700 disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "ដកចេញ"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
