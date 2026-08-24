"use client";

import { useMemo } from "react";
import { useGetMemberProfilesQuery } from "@/app/store/memberProfileApi";
import { useRecommendationProfileSelection } from "@/hooks/useRecommendationProfileSelection";
import type { MemberProfile } from "@/types/member-profile/member-profile";

export function useActiveProfile() {
  const { data: profileResponse, isLoading } = useGetMemberProfilesQuery();
  const { selectedUuids, toggleProfile, selectAll, clearAll } =
    useRecommendationProfileSelection();

  const profiles: MemberProfile[] = useMemo(() => {
    if (!profileResponse) return [];
    if (Array.isArray(profileResponse)) return profileResponse;
    if (Array.isArray(profileResponse.contents)) return profileResponse.contents;
    return [];
  }, [profileResponse]);

  const activeProfile = useMemo(() => {
    if (profiles.length === 0) return null;

    // 1. If user previously selected a specific profile, use it
    if (selectedUuids.length > 0) {
      const matched = profiles.find((p) => selectedUuids.includes(p.uuid));
      if (matched) return matched;
    }

    // 2. Otherwise default to isDefault profile
    const defaultProfile = profiles.find((p) => p.isDefault);
    if (defaultProfile) return defaultProfile;

    // 3. Otherwise first active profile
    return profiles[0];
  }, [profiles, selectedUuids]);

  const activeProfileUuid = activeProfile?.uuid ?? null;

  return {
    activeProfile,
    activeProfileUuid,
    profiles,
    selectedUuids,
    isLoading,
    toggleProfile,
    selectAll,
    clearAll,
  };
}
