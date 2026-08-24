"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useTrackInteraction } from "@/hooks/useTrackInteraction";

interface BookmarkButtonProps {
  initialBookmarkUuid?: string | null;
  menuItemUuid?: string;
  storeUuid?: string;
  foodUuid?: string;
  showText?: boolean;
  className?: string;
  onToggled?: (isBookmarked: boolean, bookmarkUuid?: string) => void;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  initialBookmarkUuid = null,
  menuItemUuid,
  storeUuid,
  foodUuid,
  showText = false,
  className = "",
  onToggled,
}) => {
  const { bookmarks, addBookmark, removeBookmark, findBookmark } = useBookmarks();
  const { track } = useTrackInteraction();

  const [bookmarkUuid, setBookmarkUuid] = useState<string | null>(initialBookmarkUuid);
  const [submitting, setSubmitting] = useState(false);

  // Sync state from profile's current bookmarks
  useEffect(() => {
    const existing = findBookmark({ menuItemUuid, storeUuid, foodUuid });
    if (existing) {
      setBookmarkUuid(existing.uuid);
    } else if (initialBookmarkUuid) {
      setBookmarkUuid(initialBookmarkUuid);
    } else {
      setBookmarkUuid(null);
    }
  }, [bookmarks, menuItemUuid, storeUuid, foodUuid, findBookmark, initialBookmarkUuid]);

  const isBookmarked = Boolean(bookmarkUuid);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (submitting) return;

    setSubmitting(true);
    if (isBookmarked && bookmarkUuid) {
      const currentUuid = bookmarkUuid;
      // Optimistic state
      setBookmarkUuid(null);
      try {
        await removeBookmark(currentUuid);
        track({
          eventType: "UNBOOKMARK",
          menuItemUuid,
          storeUuid,
          foodUuid,
        });
        onToggled?.(false);
      } catch (err) {
        console.error("Failed to remove bookmark:", err);
        setBookmarkUuid(currentUuid); // Rollback
      }
    } else {
      try {
        const created = await addBookmark({ menuItemUuid, storeUuid, foodUuid });
        if (created) {
          setBookmarkUuid(created.uuid);
          track({
            eventType: "BOOKMARK",
            menuItemUuid,
            storeUuid,
            foodUuid,
          });
          onToggled?.(true, created.uuid);
        }
      } catch (err) {
        console.error("Failed to add bookmark:", err);
      }
    }
    setSubmitting(false);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={submitting}
      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this item"}
      className={`inline-flex items-center justify-center gap-1.5 p-2 rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 ${
        isBookmarked
          ? "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
          : "bg-black/5 hover:bg-black/10 text-neutral-600 dark:bg-white/10 dark:hover:bg-white/20 dark:text-neutral-300"
      } ${className}`}
    >
      {submitting ? (
        <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
      ) : isBookmarked ? (
        <BookmarkCheck className="w-5 h-5 fill-current" />
      ) : (
        <Bookmark className="w-5 h-5" />
      )}
      {showText && (
        <span className="text-sm font-medium pr-1">
          {isBookmarked ? "Bookmarked" : "Bookmark"}
        </span>
      )}
    </button>
  );
};
