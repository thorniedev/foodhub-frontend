"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  IoArrowForwardOutline,
  IoPeopleOutline,
  IoSparklesOutline,
} from "react-icons/io5";

import {
  useResolveMeetupShareTokenQuery,
  useJoinMeetupParticipantMutation,
  useSubmitMeetupVoteMutation,
  useGetMeetupVotesQuery,
} from "@/app/store/groupRecommendationApi";
import {
  useGetStoresQuery,
  useGetNearbyStoresQuery,
} from "@/app/store/locationApi";
import { useGetMenuItemsQuery } from "@/app/store/menuApi";
import {
  buildGroupRecommendedStores,
  filterAndSortGroupStores,
} from "@/lib/location/group-recommendation";

import type { LocationStore } from "@/types/location-store";
import type { MenuItem } from "@/types/manu";
import type { CatalogMenuItem } from "@/types/catalog-menu-item";
import type { GroupMember, GroupVote, SharedGroupSession } from "@/types/group-recommendation";

import VotingLeaderboard from "./VotingLeaderboard";
import VotingResult from "./VotingResult";

interface SharedVotingPageProps {
  /** The share token from the URL — resolves to a meetup group via GET /meetup/groups/share/{token} */
  inviteCode: string;
}

function toLocationMenuItem(item: CatalogMenuItem): MenuItem {
  const category = item.food?.category ?? {
    code: "",
    name: "",
  };

  const cuisine = item.food?.cuisine ?? {
    code: "",
    name: "",
  };

  const ageGroups = Array.isArray(item.food?.ageGroups)
    ? item.food.ageGroups
    : [];

  const mealTypes = Array.isArray(item.food?.mealTypes)
    ? item.food.mealTypes
    : [];

  const dietaryTypes = Array.isArray(item.food?.dietaryTypes)
    ? item.food.dietaryTypes
    : [];

  const ingredients = Array.isArray(item.ingredients)
    ? item.ingredients.filter(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    )
    : [];

  const recommendationScore = Number(item.recommendation?.finalScore ?? 0);
  const scoreBreakdown = item.recommendation?.scoreBreakdown;

  const converted = {
    uuid: item.uuid,
    legacyId: Number(item.legacyId ?? 0),
    name: item.name,
    localName: item.localName ?? item.name,
    description: item.description ?? "",
    localDescription: item.localDescription ?? item.description ?? "",
    thumbnail: item.thumbnail ?? "",
    gallery: Array.isArray(item.gallery) ? item.gallery : [],
    price: Number(item.price ?? 0),
    currencyCode: item.currencyCode,
    preparationTimeMinutes: item.preparationTimeMinutes ?? 0,
    availabilityStatus: item.availabilityStatus,
    isFeatured: Boolean(item.isFeatured),
    source: item.source,
    store: {
      uuid: item.store?.uuid ?? "",
      name: item.store?.name ?? "",
      localName: item.store?.localName ?? item.store?.name ?? "",
      logoUrl: item.store?.logoUrl ?? "",
      coverImageUrl: item.store?.coverImageUrl ?? "",
      addressLine: item.store?.addressLine ?? "",
      district: item.store?.district ?? "",
      city: item.store?.city ?? "",
      latitude: Number(item.store?.latitude) || 0,
      longitude: Number(item.store?.longitude) || 0,
      operatingStatus: item.store?.operatingStatus ?? "CLOSED",
      averageRating: Number(item.store?.averageRating) || 0,
      totalReviews: Number(item.store?.totalReviews) || 0,
    },
    food: {
      uuid: item.food?.uuid ?? item.uuid,
      canonicalName: item.food?.canonicalName ?? item.name,
      category,
      cuisine,
      spiceLevel: Number(item.food?.spiceLevel ?? 0),
      ageGroups,
    },
    mealTypes,
    dietaryTypes,
    allergenDeclarations: Array.isArray(item.allergenDeclarations) ? item.allergenDeclarations : [],
    ingredients,
    beveragePairings: [],
    nutrition: {
      calories: Number(item.nutrition?.calories ?? 0),
      protein: Number(item.nutrition?.proteinGrams ?? 0),
      carbohydrate: Number(item.nutrition?.carbsGrams ?? 0),
      fat: Number(item.nutrition?.fatGrams ?? 0),
      fiber: 0,
      sodium: 0,
    },
    distanceKm:
      item.distanceKm === null || item.distanceKm === undefined
        ? 0
        : Number(item.distanceKm),
    deliveryFee: 0,
    recommendation: {
      isRecommended:
        Number.isFinite(recommendationScore) && recommendationScore > 0,
      rankPosition: 0,
      finalScore: Number.isFinite(recommendationScore)
        ? recommendationScore
        : 0,
      safetyStatus: "SAFE",
      candidateSource: item.source,
      reasonCodes: item.recommendation?.reasonCodes ?? [],
      reasonText: item.recommendation?.reasonText ?? "",
      isExploration: false,
      scoreBreakdown: {
        mealMatch: Number(scoreBreakdown?.mealMatch ?? 0),
        cuisineMatch: Number(scoreBreakdown?.cuisineMatch ?? 0),
        budgetMatch: Number(scoreBreakdown?.budgetMatch ?? 0),
        distanceMatch: Number(scoreBreakdown?.distanceMatch ?? 0),
        popularity: Number(scoreBreakdown?.popularity ?? 0),
      },
    },
  };

  return converted as unknown as MenuItem;
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "data" in error) {
    const data = (
      error as {
        data?: {
          message?: string;
        };
      }
    ).data;

    if (data?.message) {
      return data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export default function SharedVotingPage({ inviteCode }: SharedVotingPageProps) {
  const router = useRouter();

  const [nickname, setNickname] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);

  // Participant UUID & meetup UUID stored after joining — used for voting
  const participantUuidKey = `foodhub-participant-uuid-${inviteCode}`;
  const meetupUuidKey = `foodhub-meetup-uuid-${inviteCode}`;

  const [participantUuid, setParticipantUuid] = useState<string | null>(null);
  const [meetupUuid, setMeetupUuid] = useState<string | null>(null);

  useEffect(() => {
    setShareUrl(window.location.href);
    setParticipantUuid(window.localStorage.getItem(participantUuidKey));
    setMeetupUuid(window.localStorage.getItem(meetupUuidKey));
  }, [meetupUuidKey, participantUuidKey]);

  // 1. Resolve shareToken → meetup group (participants list, status, etc.)
  const {
    data: group,
    isLoading: isLoadingGroup,
    isError: isGroupError,
    error: groupError,
    refetch: refetchGroup,
  } = useResolveMeetupShareTokenQuery(inviteCode, {
    pollingInterval: 3_000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  // Use meetupUuid from the resolved group if we haven't stored it yet
  const resolvedMeetupUuid = meetupUuid ?? group?.uuid ?? null;

  // 2. Derive meeting point from meetup group / participants
  const meetingPoint = useMemo(() => {
    if (group?.meetingPointLat != null && group?.meetingPointLng != null) {
      return { latitude: group.meetingPointLat, longitude: group.meetingPointLng };
    }
    const validCoords = (group?.participants ?? [])
      .filter((p) => p.locationLat != null && p.locationLng != null)
      .map((p) => ({ latitude: p.locationLat!, longitude: p.locationLng! }));
    if (validCoords.length > 0) {
      const avgLat = validCoords.reduce((sum, c) => sum + c.latitude, 0) / validCoords.length;
      const avgLng = validCoords.reduce((sum, c) => sum + c.longitude, 0) / validCoords.length;
      return { latitude: avgLat, longitude: avgLng };
    }
    return { latitude: 11.5564, longitude: 104.9282 }; // Phnom Penh default
  }, [group]);

  // 3. Fetch real stores & menu items from backend
  const { data: nearbyStores = [] } = useGetNearbyStoresQuery(
    {
      latitude: meetingPoint.latitude,
      longitude: meetingPoint.longitude,
    },
    {
      skip: !meetingPoint,
    },
  );

  const { data: allStores = [] } = useGetStoresQuery(undefined, {
    skip: nearbyStores.length > 0,
  });

  const rawStores = nearbyStores.length > 0 ? nearbyStores : allStores;
  const { data: menuItems = [] } = useGetMenuItemsQuery();

  // 4. Poll votes for the meetup
  const { data: votesResponse, refetch: refetchVotes } = useGetMeetupVotesQuery(
    resolvedMeetupUuid ?? "",
    {
      skip: !resolvedMeetupUuid,
      pollingInterval: 3_000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  const [joinParticipant, { isLoading: isJoining }] =
    useJoinMeetupParticipantMutation();

  const [submitMeetupVote, { isLoading: isSubmittingVote }] =
    useSubmitMeetupVoteMutation();

  // ──────────────────────────────────────────────────────────
  // Build a SharedGroupSession-shaped object from real data
  // so VotingLeaderboard / VotingResult render unchanged.
  // ──────────────────────────────────────────────────────────
  const mappedVotes = useMemo((): GroupVote[] => {
    const votes = votesResponse?.votes ?? [];
    return votes.map((v) => ({
      memberUuid: v.participantUuid ?? "",
      storeUuid: v.candidateUuid ?? "",
      createdAt: v.createdAt ?? new Date().toISOString(),
    }));
  }, [votesResponse]);

  const winnerStoreUuid = useMemo((): string | null => {
    if (mappedVotes.length === 0) return null;
    const counts = new Map<string, number>();
    for (const vote of mappedVotes) {
      counts.set(vote.storeUuid, (counts.get(vote.storeUuid) ?? 0) + 1);
    }
    let max = 0;
    let winner: string | null = null;
    for (const [uuid, count] of counts) {
      if (count > max) {
        max = count;
        winner = uuid;
      }
    }
    return winner;
  }, [mappedVotes]);

  // Map backend participants to GroupMember shape
  const groupMembers = useMemo((): GroupMember[] => {
    return (group?.participants ?? []).map((p) => ({
      uuid: p.uuid ?? "",
      name: p.nickname ?? "Member",
      coordinates:
        p.locationLat != null && p.locationLng != null
          ? { latitude: p.locationLat, longitude: p.locationLng }
          : null,
      locationStatus:
        p.locationLat != null && p.locationLng != null ? "ready" : "waiting",
      requiredDietaryCodes: [],
      blockedAllergenCodes: [],
      hasVoted: mappedVotes.some((v) => v.memberUuid === (p.uuid ?? "")),
    }));
  }, [group?.participants, mappedVotes]);

  const adaptedStores = useMemo<LocationStore[]>(
    () => (Array.isArray(rawStores) ? (rawStores as unknown as LocationStore[]) : []),
    [rawStores],
  );

  const adaptedMenuItems = useMemo<MenuItem[]>(
    () => (Array.isArray(menuItems) ? menuItems.map(toLocationMenuItem) : []),
    [menuItems],
  );

  const recommendedCandidateStores = useMemo(() => {
    if (adaptedStores.length === 0) return [];
    const recommended = buildGroupRecommendedStores({
      sourceStores: adaptedStores,
      menuItems: adaptedMenuItems,
      midpoint: meetingPoint,
      members: groupMembers.map((m) => ({
        uuid: m.uuid,
        name: m.name,
        coordinates: m.coordinates,
        locationStatus: m.locationStatus === "ready" ? "ready" : "waiting",
        requiredDietaryCodes: [],
        blockedAllergenCodes: [],
        customNotes: "",
        hasVoted: m.hasVoted,
      })),
    });

    // If host explicitly defined candidate store UUIDs (e.g. 2 filtered stores)
    const candidateUuids = group?.candidateStoreUuids;
    if (Array.isArray(candidateUuids) && candidateUuids.length > 0) {
      const uuidSet = new Set(candidateUuids);
      const matched = recommended.filter((store) => uuidSet.has(store.uuid));
      if (matched.length > 0) {
        return matched.sort(
          (a, b) => candidateUuids.indexOf(a.uuid) - candidateUuids.indexOf(b.uuid),
        );
      }
    }

    const searchRadiusKm = group?.searchRadiusKm ? Number(group.searchRadiusKm) : 10;

    return filterAndSortGroupStores({
      stores: recommended,
      filters: {
        radiusKm: searchRadiusKm > 0 ? searchRadiusKm : 10,
        selectedProvince: "",
        selectedCity: "",
        selectedDistrict: "",
        openNow: false,
        deliveryAvailable: false,
        pickupAvailable: false,
        minimumRating: 0,
        safeForAllMembers: false,
        hasMealsForEveryone: false,
        sortBy: "recommended",
      },
    });
  }, [adaptedStores, adaptedMenuItems, meetingPoint, groupMembers, group?.candidateStoreUuids, group?.searchRadiusKm]);

  const [showResults, setShowResults] = useState(false);

  const session = useMemo((): SharedGroupSession | null => {
    if (!group) return null;

    return {
      inviteCode,
      groupName: group.title ?? "FoodHub Group",
      status: showResults ? "COMPLETED" : "VOTING",
      members: groupMembers,
      stores: recommendedCandidateStores.slice(0, 10),
      votes: mappedVotes,
      winnerStoreUuid,
      createdAt: group.createdAt ?? new Date().toISOString(),
      updatedAt: group.updatedAt ?? new Date().toISOString(),
    };
  }, [
    group,
    groupMembers,
    inviteCode,
    mappedVotes,
    recommendedCandidateStores,
    showResults,
    winnerStoreUuid,
  ]);

  const winner = useMemo(() => {
    if (!winnerStoreUuid || !session) return null;
    return session.stores.find((s) => s.uuid === winnerStoreUuid) ?? null;
  }, [session, winnerStoreUuid]);

  const winnerVoteCount = useMemo(() => {
    if (!winner) return 0;
    return mappedVotes.filter((v) => v.storeUuid === winner.uuid).length;
  }, [mappedVotes, winner]);

  // ──────────────────────────────────────────────────────────
  // Handlers
  // ──────────────────────────────────────────────────────────

  const handleJoin = async () => {
    const cleanNickname = nickname.trim();

    if (!cleanNickname) {
      setJoinError("Please enter your name.");
      return;
    }

    try {
      setJoinError(null);

      const joined = await joinParticipant({
        meetupUuid: group?.uuid ?? undefined,
        shareToken: inviteCode,
        nickname: cleanNickname,
      }).unwrap();

      const pUuid = joined.uuid ?? "";
      const mUuid = joined.meetupUuid ?? group?.uuid ?? "";

      window.localStorage.setItem(participantUuidKey, pUuid);
      window.localStorage.setItem(meetupUuidKey, mUuid);

      setParticipantUuid(pUuid);
      setMeetupUuid(mUuid);

      void refetchGroup();
    } catch (error) {
      setJoinError(getErrorMessage(error));
    }
  };

  const handleVote = async (storeUuid: string) => {
    if (!participantUuid || !resolvedMeetupUuid) return;

    try {
      setVoteError(null);

      await submitMeetupVote({
        meetupUuid: resolvedMeetupUuid,
        participantUuid,
        foodUuid: storeUuid,
        candidateUuid: storeUuid,
        rankChoice: 1,
      }).unwrap();

      void refetchVotes();
    } catch (error) {
      setVoteError(getErrorMessage(error));
    }
  };

  // ──────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────

  if (isLoadingGroup) {
    return (
      <main className="flex min-h-[70dvh] items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl animate-pulse rounded-[28px] border border-gray-100 bg-white p-8 shadow-sm">
          <div className="h-8 w-2/3 rounded bg-gray-100" />
          <div className="mt-4 h-5 w-full rounded bg-gray-100" />
          <div className="mt-8 h-14 rounded-full bg-gray-100" />
        </div>
      </main>
    );
  }

  if (isGroupError || !session) {
    return (
      <main className="flex min-h-[70dvh] items-center justify-center px-4 py-10">
        <section className="w-full max-w-xl rounded-[28px] border border-red-100 bg-white p-6 text-center shadow-sm sm:p-8">
          <h1 className="text-[23px] font-bold text-primary-900 sm:text-[25px]">
            Voting session unavailable
          </h1>

          <p className="mt-3 text-[17px] leading-7 text-gray-600">
            {getErrorMessage(groupError)} The session may have expired.
          </p>

          <button
            type="button"
            onClick={() => void refetchGroup()}
            className="mt-5 min-h-12 rounded-full bg-primary-800 px-6 text-[17px] font-semibold text-white"
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  if (showResults && winner) {
    return (
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl mb-4">
          <button
            type="button"
            onClick={() => setShowResults(false)}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2 text-[17px] font-semibold text-primary-900 shadow-sm transition hover:bg-gray-50 active:scale-95"
          >
            ← ត្រឡប់ទៅមើលការបោះឆ្នោត (Back to voting)
          </button>
        </div>

        <VotingResult
          winner={winner}
          winnerVoteCount={winnerVoteCount}
          memberCount={session.members.length}
          shareUrl={shareUrl}
          onRestart={() => setShowResults(false)}
        />
      </main>
    );
  }

  // Not yet joined — show join form
  if (!participantUuid) {
    return (
      <main className="flex min-h-[75dvh] items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4 py-10">
        <section className="w-full max-w-xl overflow-hidden rounded-[30px] border border-white bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
          <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-5 py-6 sm:px-7">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary-700 shadow-sm">
              <IoPeopleOutline className="text-[28px]" />
            </div>

            <div className="mt-4 flex items-center gap-2 text-secondary-500">
              <IoSparklesOutline className="text-[21px]" />
              <p className="text-[17px] font-semibold">You are invited</p>
            </div>

            <h1 className="mt-2 text-[23px] font-bold leading-[1.45] text-primary-900 sm:text-[25px]">
              Join {session.groupName}
            </h1>

            <p className="mt-2 text-[17px] leading-7 text-gray-600">
              Enter your name to join the group and vote for your favorite
              restaurant.
            </p>
          </div>

          <div className="p-5 sm:p-7">
            <label
              htmlFor="voter-name"
              className="text-[17px] font-semibold text-primary-900"
            >
              Your name
            </label>

            <input
              id="voter-name"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handleJoin();
                }
              }}
              placeholder="Enter your name"
              className="mt-2 min-h-13 w-full rounded-[17px] border border-gray-200 px-4 text-[17px] outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-50"
            />

            {joinError && (
              <p className="mt-3 text-[17px] leading-7 text-red-500">
                {joinError}
              </p>
            )}

            <button
              type="button"
              disabled={isJoining}
              onClick={() => void handleJoin()}
              className="mt-5 flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-secondary-500 px-6 text-[18px] font-semibold text-white transition hover:bg-secondary-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isJoining ? "Joining..." : "Join the vote"}
              <IoArrowForwardOutline className="text-[22px]" />
            </button>
          </div>
        </section>
      </main>
    );
  }

  // Joined — show the live leaderboard
  return (
    <main className="min-h-screen bg-[#fffdf8]">
      {voteError && (
        <div className="fixed left-1/2 top-4 z-[250] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-[18px] border border-red-100 bg-white px-4 py-3 text-[17px] text-red-500 shadow-lg">
          {voteError}
        </div>
      )}

      <VotingLeaderboard
        open
        stores={session.stores}
        members={session.members}
        votes={session.votes}
        currentMemberUuid={participantUuid}
        shareUrl={shareUrl}
        canFinish={true}
        onFinish={() => setShowResults(true)}
        isSubmittingVote={isSubmittingVote}
        onVote={(storeUuid) => void handleVote(storeUuid)}
        onClose={() => router.push("/food")}
      />
    </main>
  );
}
