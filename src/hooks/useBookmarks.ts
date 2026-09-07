"use client";

import { useCallback, useMemo } from "react";
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

export function useBookmarks(page = 0, size = 50) {
  const { activeProfileUuid, activeProfile } = useActiveProfile();

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

  // The server is the only source of truth here — this used to be unioned
  // with a parallel copy of bookmarked menu-item ids kept in localStorage.
  // That copy was written on every successful save but only ever cleared by
  // this same hook's own removeBookmark, so anything that removed a bookmark
  // by another path — a direct DB delete, another device, an admin action —
  // left an entry this browser would keep showing as saved forever. Every
  // add here already requires a real profile and a real server call, so the
  // local copy added no real offline capability, only that drift.
  const bookmarks: BookmarkResponse[] = useMemo(() => {
    if (!pageData) return [];
    const maybeItems = (pageData as unknown as { items?: unknown }).items;
    if (Array.isArray(maybeItems)) return maybeItems as BookmarkResponse[];
    if (Array.isArray(pageData.contents)) return pageData.contents;
    if (Array.isArray(pageData)) return pageData as BookmarkResponse[];
    return [];
  }, [pageData]);

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

      return await createBookmarkMutation({
        profileUuid: activeProfileUuid,
        ...params,
      }).unwrap();
    },
    [activeProfileUuid, createBookmarkMutation]
  );

  const removeBookmark = useCallback(
    async (bookmarkUuid: string) => {
      if (!activeProfileUuid) {
        throw new Error("No active profile selected.");
      }

      return await deleteBookmarkMutation({
        profileUuid: activeProfileUuid,
        bookmarkUuid,
      }).unwrap();
    },
    [activeProfileUuid, deleteBookmarkMutation]
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
