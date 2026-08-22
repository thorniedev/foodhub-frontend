"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FriendDto } from "@/types/friends";
import { useDeleteFriendMutation } from "@/app/store/friendsApi";
import {
  Shield,
  Utensils,
  UserMinus,
  MoreVertical,
  Calendar,
  Loader2,
  AlertTriangle,
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
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "Recently";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return "Recently";
  }
}

export default function FriendCard({ friend }: FriendCardProps) {
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

  const initial = friend.username.charAt(0).toUpperCase();

  return (
    <>
      <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-emerald-500/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div>
          {/* Header row: Avatar + Names + Options */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-teal-700 text-lg font-bold text-white shadow-xs">
                {initial}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-slate-900 dark:text-white">
                  {friend.username}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Connected {formatDate(friend.connectedAt)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRemoveDialog(true)}
              title="Remove friend"
              className="rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
            >
              <UserMinus className="h-4 w-4" />
            </button>
          </div>

          {/* Safety Profile Badge */}
          <div className="mt-4">
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/40">
              <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="truncate">
                {friend.defaultProfileName || "Standard Dietary Profile"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick CTA button */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <Link
            href={`/meetup/create?friendUuid=${encodeURIComponent(friend.userUuid)}`}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600/10 py-2.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white"
          >
            <Utensils className="h-3.5 w-3.5" />
            Invite to Lunch / Meetup
          </Link>
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="max-w-md rounded-3xl bg-white p-6 dark:bg-slate-900">
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-slate-900 dark:text-white">
              Remove Friend?
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-slate-500 dark:text-slate-400">
              Are you sure you want to remove <span className="font-semibold text-slate-800 dark:text-slate-200">@{friend.username}</span> from your friends list? You can reconnect anytime.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 grid grid-cols-2 gap-3 sm:justify-stretch">
            <button
              type="button"
              onClick={() => setShowRemoveDialog(false)}
              className="rounded-2xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRemove}
              disabled={isDeleting}
              className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, Remove"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
