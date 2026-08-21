"use client";

import { useCallback, useSyncExternalStore } from "react";

import type { MemberProfile } from "@/types/member-profile/member-profile";

const STORAGE_KEY = "foodhub:recommendation-profile-selection";

const listeners = new Set<() => void>();

const EMPTY_SELECTION: string[] = [];

let cachedRaw: string | null | undefined;
let cachedSnapshot: string[] = EMPTY_SELECTION;

function parseSelection(raw: string | null): string[] {
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

/** Cached so React's useSyncExternalStore gets a stable reference between calls. */
function getSnapshot(): string[] {
  if (typeof window === "undefined") {
    return cachedSnapshot;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSnapshot = parseSelection(raw);
  }

  return cachedSnapshot;
}

function getServerSnapshot(): string[] {
  return EMPTY_SELECTION;
}

function writeStoredSelection(uuids: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(uuids));
  } catch {
    // Ignore storage failures (private browsing, quota, etc). The
    // selection simply won't persist across reloads in that case.
  }

  // The native "storage" event only fires in *other* tabs/documents, so
  // notify same-tab subscribers (this component tree) directly.
  listeners.forEach((listener) => listener());
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

/**
 * Which family profiles are currently opted in to receive recommendations.
 *
 * This is a client-side UI preference only — deliberately NOT tied to a
 * profile's `isActive` field, which on the backend means "not soft-deleted"
 * (see ProfileServiceImpl#softDeleteProfile). Flipping this selection can
 * never deactivate or delete anyone's profile.
 *
 * Persisted to localStorage (via useSyncExternalStore, same pattern as
 * useUserLocation) so the AI recommendation dropdown and the family-profile
 * dashboard list ("គណនីសមាជិកគ្រួសារ") both read/write the same selection
 * and stay in sync.
 */
export function useRecommendationProfileSelection() {
  const selectedUuids = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setSelectedUuids = useCallback((next: string[]) => {
    writeStoredSelection(next);
  }, []);

  const toggleProfile = useCallback((uuid: string) => {
    const current = getSnapshot();
    writeStoredSelection(
      current.includes(uuid)
        ? current.filter((id) => id !== uuid)
        : [...current, uuid],
    );
  }, []);

  const selectAll = useCallback(
    (uuids: string[]) => setSelectedUuids(uuids),
    [setSelectedUuids],
  );

  const clearAll = useCallback(() => setSelectedUuids([]), [setSelectedUuids]);

  return {
    selectedUuids,
    toggleProfile,
    selectAll,
    clearAll,
  };
}

/**
 * Resolves the effective set of profiles a recommendation request should
 * target: explicitly-selected active profiles, or — when nothing is
 * explicitly selected — the user's default profile as a fallback.
 */
export function getRecommendationTargets(
  activeProfiles: MemberProfile[],
  selectedUuids: string[],
): MemberProfile[] {
  const explicit = activeProfiles.filter((profile) =>
    selectedUuids.includes(profile.uuid),
  );

  if (explicit.length > 0) {
    return explicit;
  }

  const defaultProfile =
    activeProfiles.find((profile) => profile.isDefault) ?? activeProfiles[0];

  return defaultProfile ? [defaultProfile] : [];
}
