"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useGetBookmarksQuery,
  useCreateBookmarkMutation,
  useDeleteBookmarkMutation,
} from "@/app/store/bookmarkApi";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import type {
  BookmarkResponse,
  CreateBookmarkRequest,
} from "@/types/interaction";

const FAVORITES_STORAGE_KEY = "foodhub-favorite-menu-items";
const FAVORITES_UPDATED_EVENT = "foodhub-favorites-updated";
const LOCAL_BOOKMARK_PREFIX = "local:";

type LocalFavoriteEntry = {
  id: string;
  addedAt?: string;
};

function readLocalFavoriteEntries(): LocalFavoriteEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!value) {
      return [];
    }

    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((item): LocalFavoriteEntry[] => {
      if (typeof item === "string" && item.trim()) {
        return [{ id: item.trim() }];
      }

      if (typeof item === "object" && item !== null) {
        const record = item as Record<string, unknown>;
        const id =
          typeof record.id === "string"
            ? record.id
            : typeof record.menuItemUuid === "string"
              ? record.menuItemUuid
              : "";

        if (id.trim()) {
          return [
            {
              id: id.trim(),
              addedAt:
                typeof record.addedAt === "string" ? record.addedAt : undefined,
            },
          ];
        }
      }

      return [];
    });
  } catch {
    return [];
  }
}

function writeLocalFavoriteIds(ids: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(uniqueIds));
  window.dispatchEvent(new Event(FAVORITES_UPDATED_EVENT));
}

export function useBookmarks(page = 0, size = 50) {
  const { activeProfileUuid, activeProfile } = useActiveProfile();
  const [localFavorites, setLocalFavorites] = useState<LocalFavoriteEntry[]>([]);

  const {
    data: pageData,
    isLoading,
    isFetching,
    refetch,
  } = useGetBookmarksQuery(
    { profileUuid: activeProfileUuid!, page, size },
    { skip: !activeProfileUuid }
  );

  const [createBookmarkMutation, { isLoading: isCreating }] =
    useCreateBookmarkMutation();
  const [deleteBookmarkMutation, { isLoading: isDeleting }] =
    useDeleteBookmarkMutation();

  useEffect(() => {
    const syncLocalFavorites = () => {
      setLocalFavorites(readLocalFavoriteEntries());
    };

    syncLocalFavorites();

    window.addEventListener(FAVORITES_UPDATED_EVENT, syncLocalFavorites);
    window.addEventListener("storage", syncLocalFavorites);

    return () => {
      window.removeEventListener(FAVORITES_UPDATED_EVENT, syncLocalFavorites);
      window.removeEventListener("storage", syncLocalFavorites);
    };
  }, []);

  const serverBookmarks: BookmarkResponse[] = useMemo(() => {
    if (!pageData) return [];
    const maybeItems = (pageData as unknown as { items?: unknown }).items;
    if (Array.isArray(maybeItems)) return maybeItems as BookmarkResponse[];
    if (Array.isArray(pageData.contents)) return pageData.contents;
    if (Array.isArray(pageData)) return pageData as BookmarkResponse[];
    return [];
  }, [pageData]);

  const bookmarks: BookmarkResponse[] = useMemo(() => {
    const serverMenuItemIds = new Set(
      serverBookmarks.flatMap((bookmark) =>
        bookmark.menuItemUuid ? [bookmark.menuItemUuid] : [],
      ),
    );

    const localBookmarks = localFavorites
      .filter((favorite) => !serverMenuItemIds.has(favorite.id))
      .map(
        (favorite): BookmarkResponse => ({
          uuid: `${LOCAL_BOOKMARK_PREFIX}${favorite.id}`,
          profileUuid: activeProfileUuid ?? LOCAL_BOOKMARK_PREFIX,
          foodUuid: null,
          menuItemUuid: favorite.id,
          storeUuid: null,
          sourceRecommendationItemUuid: null,
          notes: null,
          createdAt: favorite.addedAt ?? new Date().toISOString(),
        }),
      );

    return [...serverBookmarks, ...localBookmarks];
  }, [activeProfileUuid, localFavorites, serverBookmarks]);

  const totalElements = bookmarks.length;

  const isBookmarked = useCallback(
    (target: { menuItemUuid?: string; storeUuid?: string; foodUuid?: string }) => {
      if (!target.menuItemUuid && !target.storeUuid && !target.foodUuid) return false;
      return bookmarks.some((b) => {
        if (target.menuItemUuid && b.menuItemUuid === target.menuItemUuid) return true;
        if (target.storeUuid && b.storeUuid === target.storeUuid) return true;
        if (target.foodUuid && b.foodUuid === target.foodUuid) return true;
        return false;
      });
    },
    [bookmarks]
  );

  const findBookmark = useCallback(
    (target: { menuItemUuid?: string; storeUuid?: string; foodUuid?: string }) => {
      return (
        bookmarks.find((b) => {
          if (target.menuItemUuid && b.menuItemUuid === target.menuItemUuid) return true;
          if (target.storeUuid && b.storeUuid === target.storeUuid) return true;
          if (target.foodUuid && b.foodUuid === target.foodUuid) return true;
          return false;
        }) ?? null
      );
    },
    [bookmarks]
  );

  const addBookmark = useCallback(
    async (params: CreateBookmarkRequest) => {
      if (!activeProfileUuid) {
        throw new Error("No active profile selected. Please select a profile.");
      }

      if (params.menuItemUuid) {
        const ids = readLocalFavoriteEntries().map((favorite) => favorite.id);
        writeLocalFavoriteIds([...ids, params.menuItemUuid]);
      }

      return await createBookmarkMutation({
        profileUuid: activeProfileUuid,
        ...params,
      }).unwrap();
    },
    [activeProfileUuid, createBookmarkMutation]
  );

  const removeBookmark = useCallback(
    async (bookmarkUuid: string) => {
      const bookmark = bookmarks.find((item) => item.uuid === bookmarkUuid);

      if (bookmark?.menuItemUuid) {
        const ids = readLocalFavoriteEntries()
          .map((favorite) => favorite.id)
          .filter((id) => id !== bookmark.menuItemUuid);
        writeLocalFavoriteIds(ids);
      }

      if (bookmarkUuid.startsWith(LOCAL_BOOKMARK_PREFIX)) {
        return;
      }

      if (!activeProfileUuid) {
        throw new Error("No active profile selected.");
      }

      return await deleteBookmarkMutation({
        profileUuid: activeProfileUuid,
        bookmarkUuid,
      }).unwrap();
    },
    [activeProfileUuid, bookmarks, deleteBookmarkMutation]
  );

  return {
    bookmarks,
    totalElements,
    activeProfile,
    activeProfileUuid,
    loading: isLoading || isFetching || isCreating || isDeleting,
    refetch,
    isBookmarked,
    findBookmark,
    addBookmark,
    removeBookmark,
  };
}
