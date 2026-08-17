"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IoFilterOutline, IoRestaurantOutline } from "react-icons/io5";

import {
  useCreateMeetupMutation,
  useDeleteMeetupGroupMutation,
  useGetMeetupGroupQuery,
  useGetMeetupVotesQuery,
  useJoinMeetupParticipantMutation,
  useSubmitMeetupVoteMutation,
} from "@/app/store/groupRecommendationApi";

import {
  useGetCurrentUserQuery,
  useGetBackendUserQuery,
  useSyncBackendUserMutation,
} from "@/app/store/auth/currentUserApi";
import { useGetNearbyStoresQuery } from "@/app/store/locationApi";

import type { LocationStore } from "@/types/location-store";
import type { MenuItem } from "@/types/manu";
import type {
  Coordinates,
  LocationFiltersState,
  LocationViewMode,
} from "@/types/location";
import type {
  GroupLocationMember,
  GroupRecommendationStage,
} from "@/types/group-location";

// SharedGroupSession-shaped data assembled from real backend responses
// so that GroupVotingPanel / GroupWinnerResult can render unchanged.
import type {
  GroupVote,
  SharedGroupSession,
} from "@/types/group-recommendation";

import { calculateGroupMidpoint } from "@/lib/location/group-geo";
import {
  buildGroupRecommendedStores,
  filterAndSortGroupStores,
} from "@/lib/location/group-recommendation";

import MobileLocationToolbar from "../MobileLocationToolbar";
import GroupLocationSetup from "./GroupLocationSetup";
import GroupMeetingPoint from "./GroupMeetingPoint";
import GroupRecommendationStoreCard from "./GroupRecommendationStoreCard";
import GroupResultsHeader from "./GroupResultsHeader";
import GroupVotingPanel from "./GroupVotingPanel";
import GroupWinnerResult from "./GroupWinnerResult";

const FoodLocationMap = dynamic(() => import("../FoodLocationMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[58dvh] min-h-[440px] animate-pulse rounded-[26px] bg-gray-100 md:h-[620px]" />
  ),
});

const CURRENT_MEMBER_UUID = "current-user";
const MAX_VOTING_CANDIDATES = 8;
const BACKEND_MEETUP_EXPIRY_HOURS = 24;
// Poll the backend every 3 seconds while voting is open.
const VOTE_POLL_INTERVAL_MS = 3_000;

function getClientTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Phnom_Penh";
  } catch {
    return "Asia/Phnom_Penh";
  }
}

function buildMeetupExpiry(): string {
  return new Date(
    Date.now() + BACKEND_MEETUP_EXPIRY_HOURS * 60 * 60 * 1000,
  ).toISOString();
}

function isPositiveInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    Number.isFinite(value) &&
    value > 0
  );
}

interface GroupRecommendationProps {
  menuItems: MenuItem[];
  stores: LocationStore[];
  userLocation: Coordinates | null;
  filters: LocationFiltersState;
  searchQuery: string;
  onOpenFilters: () => void;
  onResultCountChange: (count: number) => void;
}

function createInitialMembers(
  userLocation: Coordinates | null,
): GroupLocationMember[] {
  return [
    {
      uuid: CURRENT_MEMBER_UUID,
      name: "អ្នក",
      coordinates: userLocation,
      locationStatus: userLocation ? "ready" : "waiting",
      requiredDietaryCodes: [],
      blockedAllergenCodes: [],
      hasVoted: false,
    },
    {
      uuid: "friend-1",
      name: "មិត្តភក្តិ 1",
      coordinates: null,
      locationStatus: "waiting",
      requiredDietaryCodes: [],
      blockedAllergenCodes: [],
      hasVoted: false,
    },
  ];
}

function getApiErrorMessage(error: unknown): string {
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

export default function GroupRecommendation({
  menuItems,
  stores: sourceStores = [],
  userLocation,
  filters,
  searchQuery,
  onOpenFilters,
  onResultCountChange,
}: GroupRecommendationProps) {
  const [stage, setStage] = useState<GroupRecommendationStage>("setup");
  const [groupName, setGroupName] = useState("FoodHub Dinner Group");
  const [members, setMembers] = useState<GroupLocationMember[]>(() =>
    createInitialMembers(userLocation),
  );
  const [meetingPoint, setMeetingPoint] = useState<Coordinates | null>(null);
  const [view, setView] = useState<LocationViewMode>("list");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [votingOpen, setVotingOpen] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Real backend meetup state
  const [backendMeetupUuid, setBackendMeetupUuid] = useState<string | null>(null);
  const [backendShareToken, setBackendShareToken] = useState<string | null>(null);
  // The participant UUID for the current user (host) so we can mark their vote
  const [hostParticipantUuid, setHostParticipantUuid] = useState<string | null>(null);

  const autoCreateAttemptedRef = useRef(false);

  const { data: authUser } = useGetCurrentUserQuery();
  const {
    data: backendUser,
    isLoading: isLoadingUser,
    refetch: refetchBackendUser,
  } = useGetBackendUserQuery();
  const createdByUserId = isPositiveInteger(backendUser?.id)
    ? backendUser.id
    : null;
  const isAuthenticated = Boolean(authUser || createdByUserId);

  const [createMeetup, { isLoading: isCreatingMeetup }] =
    useCreateMeetupMutation();
  const [deleteMeetupGroup] = useDeleteMeetupGroupMutation();
  const [joinParticipant] = useJoinMeetupParticipantMutation();
  const [syncBackendUser] = useSyncBackendUserMutation();
  const [submitMeetupVote, { isLoading: isSubmittingVote }] =
    useSubmitMeetupVoteMutation();

  // Poll group state while voting is open to detect when all members have voted
  const { data: liveGroup } = useGetMeetupGroupQuery(
    backendMeetupUuid ?? "",
    {
      skip: !backendMeetupUuid || stage !== "voting",
      pollingInterval: VOTE_POLL_INTERVAL_MS,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  // Poll votes list while voting is open
  const { data: liveVotesResponse, refetch: refetchVotes } =
    useGetMeetupVotesQuery(backendMeetupUuid ?? "", {
      skip: !backendMeetupUuid || (stage !== "voting" && stage !== "completed"),
      pollingInterval: VOTE_POLL_INTERVAL_MS,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    });

  // Fetch real stores around the newly calculated group midpoint
  const { data: midpointNearbyStores = [] } = useGetNearbyStoresQuery(
    {
      latitude: meetingPoint?.latitude ?? 0,
      longitude: meetingPoint?.longitude ?? 0,
    },
    {
      skip: !meetingPoint,
    },
  );

  const effectiveSourceStores = useMemo<LocationStore[]>(() => {
    if (midpointNearbyStores.length > 0) {
      return midpointNearbyStores as unknown as LocationStore[];
    }
    return sourceStores;
  }, [midpointNearbyStores, sourceStores]);

  // ──────────────────────────────────────────────────────────
  // Derived data: build a SharedGroupSession-shaped object so
  // GroupVotingPanel / GroupWinnerResult can render unchanged.
  // ──────────────────────────────────────────────────────────
  const recommendedStores = useMemo(
    () =>
      buildGroupRecommendedStores({
        sourceStores: effectiveSourceStores,
        menuItems,
        midpoint: meetingPoint,
        members,
      }),
    [effectiveSourceStores, menuItems, meetingPoint, members],
  );

  const filteredStores = useMemo(
    () =>
      filterAndSortGroupStores({
        stores: recommendedStores,
        filters,
        searchQuery,
      }),
    [recommendedStores, filters, searchQuery],
  );

  // Map backend votes to the GroupVote shape expected by GroupVotingPanel
  const mappedVotes = useMemo((): GroupVote[] => {
    const votes = liveVotesResponse?.votes ?? [];
    return votes.map((v) => ({
      memberUuid: v.participantUuid ?? "",
      storeUuid: v.candidateUuid ?? "",
      createdAt: v.createdAt ?? new Date().toISOString(),
    }));
  }, [liveVotesResponse]);

  // Determine winner: the candidateUuid with the most votes
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

  // Build pseudo-SharedGroupSession from real data for panel components
  const activeSession = useMemo((): SharedGroupSession | null => {
    if (!backendMeetupUuid || filteredStores.length === 0) return null;

    const sessionMembers = members.map((m) => ({
      uuid: m.backendParticipantUuid ?? m.uuid,
      name: m.name,
      coordinates: m.coordinates,
      locationStatus: m.locationStatus,
      requiredDietaryCodes: [...m.requiredDietaryCodes],
      blockedAllergenCodes: [...m.blockedAllergenCodes],
      hasVoted: mappedVotes.some(
        (v) => v.memberUuid === (m.backendParticipantUuid ?? m.uuid),
      ),
    }));

    return {
      inviteCode: backendShareToken ?? backendMeetupUuid,
      groupName: groupName.trim() || "FoodHub Group",
      status: stage === "completed" ? "COMPLETED" : "VOTING",
      members: sessionMembers,
      stores: filteredStores.slice(0, MAX_VOTING_CANDIDATES),
      votes: mappedVotes,
      winnerStoreUuid: stage === "completed" ? winnerStoreUuid : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [
    backendMeetupUuid,
    backendShareToken,
    filteredStores,
    groupName,
    mappedVotes,
    members,
    stage,
    winnerStoreUuid,
  ]);

  const shareUrl = backendShareToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/group-vote/${encodeURIComponent(backendShareToken)}`
    : "";

  const winner = useMemo(() => {
    if (!winnerStoreUuid || stage !== "completed") return null;
    return filteredStores.find((s) => s.uuid === winnerStoreUuid) ?? null;
  }, [filteredStores, stage, winnerStoreUuid]);

  const winnerVoteCount = useMemo(() => {
    if (!winnerStoreUuid) return 0;
    return mappedVotes.filter((v) => v.storeUuid === winnerStoreUuid).length;
  }, [mappedVotes, winnerStoreUuid]);

  // ──────────────────────────────────────────────────────────
  // Effects
  // ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!userLocation) return;
    setMembers((current) =>
      current.map((member) =>
        member.uuid === CURRENT_MEMBER_UUID
          ? { ...member, coordinates: userLocation, locationStatus: "ready" }
          : member,
      ),
    );
  }, [userLocation]);

  useEffect(() => {
    const showResults = stage === "recommendations" || stage === "voting";
    onResultCountChange(showResults ? filteredStores.length : 0);
  }, [filteredStores.length, onResultCountChange, stage]);

  // Auto-advance to completed when liveGroup signals all members voted
  // (backend doesn't auto-finish, so we rely on the host pressing Finish)
  // This effect keeps the group state in sync.
  useEffect(() => {
    if (!liveGroup) return;
    // Update backendShareToken if it changes
    if (liveGroup.shareToken && liveGroup.shareToken !== backendShareToken) {
      setBackendShareToken(liveGroup.shareToken);
    }
  }, [liveGroup, backendShareToken]);

  // ──────────────────────────────────────────────────────────
  // Actions
  // ──────────────────────────────────────────────────────────

  /** Create real meetup on backend and transition to voting stage. */
  const createMeetupAndStartVoting = useCallback(async () => {
    const candidateStores = filteredStores.slice(0, MAX_VOTING_CANDIDATES);

    if (candidateStores.length === 0) {
      setSessionError("No candidate stores are available for voting.");
      return;
    }

    let targetUserId = createdByUserId;
    if (!targetUserId) {
      try {
        const refetched = await refetchBackendUser();
        if (refetched.data?.id && isPositiveInteger(refetched.data.id)) {
          targetUserId = refetched.data.id;
        } else {
          const synced = await syncBackendUser().unwrap();
          if (synced?.id && isPositiveInteger(synced.id)) {
            targetUserId = synced.id;
          }
        }
      } catch {
        // fallback
      }
    }

    const finalUserId =
      targetUserId && isPositiveInteger(targetUserId) ? targetUserId : 1;

    try {
      setSessionError(null);

      const created = await createMeetup({
        createdByUserId: finalUserId,
        title: groupName.trim() || "FoodHub Group",
        votingMethod: "SINGLE_PICK",
        searchRadiusKm: filters.radiusKm,
        timezone: getClientTimezone(),
        expiresAt: buildMeetupExpiry(),
        meetingPointLat: meetingPoint?.latitude ?? null,
        meetingPointLng: meetingPoint?.longitude ?? null,
        candidateStoreUuids: candidateStores.map((s) => s.uuid),
      }).unwrap();

      if (!created.uuid) {
        throw new Error("Meetup created but no UUID was returned.");
      }

      setBackendMeetupUuid(created.uuid);

      if (created.shareToken) {
        setBackendShareToken(created.shareToken);
        window.localStorage.setItem(
          `foodhub-meetup-share-${created.uuid}`,
          created.shareToken,
        );
      }

      // Auto-join host as the first participant!
      let hostPartUuid = created.participants?.[0]?.uuid;
      if (!hostPartUuid && created.uuid) {
        try {
          const hostJoined = await joinParticipant({
            meetupUuid: created.uuid,
            shareToken: created.shareToken ?? undefined,
            nickname: authUser?.username || "Host",
            locationLat: userLocation?.latitude,
            locationLng: userLocation?.longitude,
          }).unwrap();
          if (hostJoined.uuid) {
            hostPartUuid = hostJoined.uuid;
          }
        } catch {
          hostPartUuid = created.uuid;
        }
      }

      if (hostPartUuid) {
        setHostParticipantUuid(hostPartUuid);
        setMembers((current) =>
          current.map((m) =>
            m.uuid === CURRENT_MEMBER_UUID
              ? { ...m, backendParticipantUuid: hostPartUuid }
              : m,
          ),
        );
      }

      setStage("voting");
      setVotingOpen(false);
    } catch (error) {
      setSessionError(getApiErrorMessage(error));
    }
  }, [
    authUser?.username,
    createMeetup,
    createdByUserId,
    filteredStores,
    filters.radiusKm,
    groupName,
    isLoadingUser,
    joinParticipant,
    refetchBackendUser,
    syncBackendUser,
    userLocation?.latitude,
    userLocation?.longitude,
  ]);

  /** Automatically create the voting session when recommendations are ready. */
  useEffect(() => {
    const shouldCreate =
      stage === "recommendations" &&
      filteredStores.length > 0 &&
      !backendMeetupUuid &&
      !autoCreateAttemptedRef.current &&
      !isLoadingUser;

    if (!shouldCreate) return;

    autoCreateAttemptedRef.current = true;
    void createMeetupAndStartVoting();
  }, [
    createMeetupAndStartVoting,
    backendMeetupUuid,
    filteredStores.length,
    stage,
    isLoadingUser,
  ]);

  const calculateAndShowRecommendations = () => {
    const midpoint = calculateGroupMidpoint(members);
    if (!midpoint) return;

    setMeetingPoint(midpoint);
    setSelectedStoreId(null);
    setView("list");
    autoCreateAttemptedRef.current = false;
    setStage("recommendations");
    setSessionError(null);
  };

  /** Host votes for a store. */
  const voteAsHost = async (storeUuid: string) => {
    if (!backendMeetupUuid) {
      setSessionError("Voting session is not ready yet.");
      return;
    }

    let participantUuid = hostParticipantUuid;

    if (!participantUuid && backendMeetupUuid) {
      try {
        const hostJoined = await joinParticipant({
          meetupUuid: backendMeetupUuid,
          shareToken: backendShareToken ?? undefined,
          nickname: authUser?.username || "Host",
          locationLat: userLocation?.latitude,
          locationLng: userLocation?.longitude,
        }).unwrap();
        if (hostJoined.uuid) {
          participantUuid = hostJoined.uuid;
          setHostParticipantUuid(hostJoined.uuid);
        }
      } catch {
        const existingParticipant = liveGroup?.participants?.find(
          (p) =>
            p.nickname === (authUser?.username || "Host") ||
            p.profileId === createdByUserId,
        );
        participantUuid =
          existingParticipant?.uuid || hostParticipantUuid || backendMeetupUuid;
        setHostParticipantUuid(participantUuid);
      }
    }

    if (!participantUuid) {
      participantUuid = backendMeetupUuid;
      setHostParticipantUuid(participantUuid);
    }

    try {
      setSessionError(null);
      await submitMeetupVote({
        meetupUuid: backendMeetupUuid,
        participantUuid,
        foodUuid: storeUuid,
        candidateUuid: storeUuid,
        rankChoice: 1,
      }).unwrap();
      void refetchVotes();
    } catch (error) {
      setSessionError(getApiErrorMessage(error));
    }
  };

  /** Host manually finishes voting and reveals the winner. */
  const finishVoting = () => {
    setStage("completed");
    setVotingOpen(true);
    void refetchVotes();
  };

  /** Cancel and delete the backend meetup, then reset all local state. */
  const cancelBackendMeetupIfNeeded = () => {
    const meetupUuid = backendMeetupUuid;

    setBackendMeetupUuid(null);
    setBackendShareToken(null);
    setHostParticipantUuid(null);

    if (!meetupUuid) return;

    window.localStorage.removeItem(`foodhub-meetup-share-${meetupUuid}`);

    void deleteMeetupGroup(meetupUuid)
      .unwrap()
      .catch(() => {
        // Do not block the local UI reset if backend deletion fails.
      });
  };

  const clearVotingState = () => {
    autoCreateAttemptedRef.current = false;
    setVotingOpen(false);
    setSessionError(null);
  };

  const changeLocations = () => {
    cancelBackendMeetupIfNeeded();
    clearVotingState();
    setMeetingPoint(null);
    setSelectedStoreId(null);
    setView("list");
    setStage("setup");
    onResultCountChange(0);
  };

  const restart = () => {
    cancelBackendMeetupIfNeeded();
    clearVotingState();
    setGroupName("FoodHub Dinner Group");
    setMembers(createInitialMembers(userLocation));
    setMeetingPoint(null);
    setSelectedStoreId(null);
    setView("list");
    setStage("setup");
    onResultCountChange(0);
  };

  // ──────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────

  const votingPanel = (
    <GroupVotingPanel
      open={votingOpen}
      session={activeSession}
      shareUrl={shareUrl}
      currentMemberUuid={hostParticipantUuid ?? CURRENT_MEMBER_UUID}
      isSubmittingVote={isSubmittingVote}
      isFinishing={false}
      errorMessage={sessionError}
      onVote={(storeUuid) => void voteAsHost(storeUuid)}
      onFinish={finishVoting}
      onClose={() => setVotingOpen(false)}
      onRestart={restart}
    />
  );

  if (stage === "setup") {
    return (
      <>
        <GroupLocationSetup
          groupName={groupName}
          members={members}
          currentLocation={userLocation}
          sourceStoreCount={sourceStores.length}
          onGroupNameChange={setGroupName}
          onMembersChange={setMembers}
          onCalculate={calculateAndShowRecommendations}
        />
        {votingPanel}
      </>
    );
  }

  if (stage === "completed" && winner && activeSession) {
    return (
      <>
        <GroupWinnerResult
          winner={winner}
          winnerVoteCount={winnerVoteCount}
          memberCount={activeSession.members.length}
          shareUrl={shareUrl}
          onRestart={restart}
        />
        {votingPanel}
      </>
    );
  }

  if (!meetingPoint) {
    return (
      <section className="rounded-[24px] border border-red-100 bg-red-50 p-6 text-center">
        <p
          role="heading"
          aria-level={2}
          className="text-[21px] font-bold text-primary-900"
        >
          មិនអាចគណនាចំណុចកណ្ដាលបានទេ
        </p>

        <p className="mt-2 text-[17px] leading-8 text-gray-600">
          សូមឱ្យសមាជិកយ៉ាងហោចណាស់ពីរនាក់កំណត់ទីតាំងរបស់ពួកគេ។
        </p>

        <button
          type="button"
          onClick={changeLocations}
          className="mt-5 min-h-12 rounded-full bg-primary-800 px-6 text-[17px] font-bold text-white"
        >
          ត្រឡប់ទៅបញ្ចូលទីតាំង
        </button>
      </section>
    );
  }

  const storeList = (
    <div className="space-y-4">
      {filteredStores.length === 0 ? (
        <EmptyResults
          sourceStoreCount={sourceStores.length}
          recommendedStoreCount={recommendedStores.length}
          onOpenFilters={onOpenFilters}
        />
      ) : (
        filteredStores.map((store) => (
          <GroupRecommendationStoreCard
            key={store.uuid}
            store={store}
            selected={selectedStoreId === store.uuid}
            onSelect={() => setSelectedStoreId(store.uuid)}
          />
        ))
      )}
    </div>
  );

  const map = (
    <FoodLocationMap
      mode="group"
      userLocation={userLocation}
      groupMembers={members}
      meetingPoint={meetingPoint}
      stores={filteredStores}
      selectedStoreId={selectedStoreId}
      radiusKm={filters.radiusKm}
      onSelectStore={setSelectedStoreId}
    />
  );

  return (
    <section>
      {/* <GroupMeetingPoint
        meetingPoint={meetingPoint}
        members={members}
        storeCount={filteredStores.length}
        radiusKm={filters.radiusKm}
      /> */}

      <GroupResultsHeader
        groupName={groupName}
        resultCount={filteredStores.length}
        shareUrl={shareUrl}
        hasVotingSession={Boolean(backendMeetupUuid)}
        isCreatingSession={isCreatingMeetup || isLoadingUser}
        onOpenFilters={onOpenFilters}
        onChangeLocations={changeLocations}
        onCreateVotingSession={() => {
          autoCreateAttemptedRef.current = false;
          setSessionError(null);
          void createMeetupAndStartVoting();
        }}
        onOpenVoting={() => setVotingOpen(true)}
      />

      {sessionError && !votingOpen && (
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-[17px] leading-7 text-red-700 shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[20px]">⚠️</span>
            <span>{sessionError}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                autoCreateAttemptedRef.current = false;
                setSessionError(null);
                void createMeetupAndStartVoting();
              }}
              className="rounded-xl bg-red-600 px-4 py-1.5 text-[15px] font-bold text-white shadow-sm transition hover:bg-red-700 active:scale-95"
            >
              🔄 សាកល្បងម្ដងទៀត (Retry)
            </button>
            <a
              href="/api/auth/login"
              className="rounded-xl border border-red-300 bg-white px-4 py-1.5 text-[15px] font-bold text-red-700 shadow-sm transition hover:bg-red-50"
            >
              🔑 ចូលគណនី (Login)
            </a>
          </div>
        </div>
      )}

      <MobileLocationToolbar
        view={view}
        onViewChange={setView}
        onOpenFilters={onOpenFilters}
      />

      <div className="2xl:hidden">{view === "list" ? storeList : map}</div>

      <div className="hidden min-w-0 gap-6 2xl:grid 2xl:grid-cols-[minmax(420px,46%)_minmax(0,54%)]">
        <div className="min-w-0">{storeList}</div>

        <div className="min-w-0">
          <div className="sticky top-24">{map}</div>
        </div>
      </div>

      {votingPanel}
    </section>
  );
}

function EmptyResults({
  sourceStoreCount,
  recommendedStoreCount,
  onOpenFilters,
}: {
  sourceStoreCount: number;
  recommendedStoreCount: number;
  onOpenFilters: () => void;
}) {
  return (
    <section className="rounded-[24px] border border-amber-100 bg-amber-50 p-5 sm:p-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary-700 shadow-sm">
        <IoRestaurantOutline className="text-[27px]" />
      </div>

      <p
        role="heading"
        aria-level={3}
        className="mt-4 text-[21px] font-bold text-primary-900"
      >
        មិនមានហាងដែលត្រូវនឹងតម្រង
      </p>

      <p className="mt-2 text-[17px] leading-8 text-gray-600">
        ក្នុងពេលសាកល្បង សូមប្រើកាំស្វែងរក 5 km ឬ 10 km ហើយបិទ Open now, Rating,
        Delivery, Pickup និង Group safety។
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <DebugMetric label="ហាងទាំងអស់" value={String(sourceStoreCount)} />
        <DebugMetric label="ហាងមុនតម្រង" value={String(recommendedStoreCount)} />
      </div>

      <button
        type="button"
        onClick={onOpenFilters}
        className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary-800 px-6 text-[17px] font-bold text-white transition hover:bg-primary-700 sm:w-fit"
      >
        <IoFilterOutline className="text-[20px]" />
        បើកតម្រង
      </button>
    </section>
  );
}

function DebugMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-[16px] text-gray-400">{label}</p>
      <p className="mt-1 text-[21px] font-bold text-primary-900">{value}</p>
    </div>
  );
}
