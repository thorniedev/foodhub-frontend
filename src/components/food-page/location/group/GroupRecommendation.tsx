"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IoFilterOutline, IoRestaurantOutline } from "react-icons/io5";

import {
  useCancelMeetupMutation,
  useCreateMeetupMutation,
  useCreateMockGroupSessionMutation,
  useFinishMockGroupVotingMutation,
  useGetMockGroupSessionQuery,
  useSubmitMockGroupVoteMutation,
} from "@/app/store/groupRecommendationApi";

import { useGetCurrentUserQuery } from "@/app/store/auth/currentUserApi";

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
import type {
  GroupMember,
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

function getClientTimezone(): string {
  try {
    return (
      Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Phnom_Penh"
    );
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

function toSharedMember(member: GroupLocationMember): GroupMember {
  return {
    uuid: member.uuid,
    name: member.name.trim() || "Friend",
    coordinates: member.coordinates,
    locationStatus: member.locationStatus,
    requiredDietaryCodes: [...member.requiredDietaryCodes],
    blockedAllergenCodes: [...member.blockedAllergenCodes],
    hasVoted: false,
  };
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

  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const [ownerToken, setOwnerToken] = useState<string | null>(null);

  const [participantToken, setParticipantToken] = useState<string | null>(null);

  const [participantUuid, setParticipantUuid] = useState<string | null>(null);

  const [createdSession, setCreatedSession] =
    useState<SharedGroupSession | null>(null);

  const [shareUrl, setShareUrl] = useState("");

  const [votingOpen, setVotingOpen] = useState(false);

  const [sessionError, setSessionError] = useState<string | null>(null);

  const [backendMeetupUuid, setBackendMeetupUuid] = useState<string | null>(
    null,
  );

  const [backendShareToken, setBackendShareToken] = useState<string | null>(
    null,
  );

  const [backendSyncError, setBackendSyncError] = useState<string | null>(null);

  const autoCreateAttemptedRef = useRef(false);

  const { data: currentUser } = useGetCurrentUserQuery();

  const createdByUserId = isPositiveInteger(currentUser?.id)
    ? currentUser.id
    : null;

  const [createMeetup] = useCreateMeetupMutation();

  const [cancelMeetup] = useCancelMeetupMutation();

  const [createSession, { isLoading: isCreatingSession }] =
    useCreateMockGroupSessionMutation();

  const [submitVote, { isLoading: isSubmittingVote }] =
    useSubmitMockGroupVoteMutation();

  const [finishVoting, { isLoading: isFinishingVoting }] =
    useFinishMockGroupVotingMutation();

  const { data: queriedSession, refetch: refetchSession } =
    useGetMockGroupSessionQuery(inviteCode ?? "", {
      skip: !inviteCode,
      pollingInterval: 3_000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    });

  const activeSession = queriedSession ?? createdSession;

  useEffect(() => {
    if (!userLocation) return;

    setMembers((current) =>
      current.map((member) =>
        member.uuid === CURRENT_MEMBER_UUID
          ? {
              ...member,
              coordinates: userLocation,
              locationStatus: "ready",
            }
          : member,
      ),
    );
  }, [userLocation]);

  const recommendedStores = useMemo(
    () =>
      buildGroupRecommendedStores({
        sourceStores,
        menuItems,
        midpoint: meetingPoint,
        members,
      }),
    [sourceStores, menuItems, meetingPoint, members],
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

  const winner = useMemo(() => {
    if (!activeSession?.winnerStoreUuid) {
      return null;
    }

    return (
      activeSession.stores.find(
        (store) => store.uuid === activeSession.winnerStoreUuid,
      ) ?? null
    );
  }, [activeSession]);

  const winnerVoteCount = useMemo(() => {
    if (!activeSession || !winner) {
      return 0;
    }

    return activeSession.votes.filter((vote) => vote.storeUuid === winner.uuid)
      .length;
  }, [activeSession, winner]);

  useEffect(() => {
    const showResults = stage === "recommendations" || stage === "voting";

    onResultCountChange(showResults ? filteredStores.length : 0);
  }, [filteredStores.length, onResultCountChange, stage]);

  useEffect(() => {
    if (activeSession?.status === "COMPLETED") {
      setStage("completed");
      setVotingOpen(true);
    }
  }, [activeSession?.status]);

  const syncMeetupToBackend = useCallback(async () => {
    /*
     * The backend JOIN endpoint is not confirmed yet.
     * For now we create the real meetup and immediately persist its one-time
     * shareToken, while members/recommendations/store-voting continue using
     * the current local/mock flow.
     */
    if (backendMeetupUuid) {
      return;
    }

    if (!createdByUserId) {
      setBackendSyncError(
        "Real meetup was not created because /users/me does not expose a numeric user id yet.",
      );
      return;
    }

    try {
      setBackendSyncError(null);

      const created = await createMeetup({
        createdByUserId,
        title: groupName.trim() || "FoodHub Group",
        votingMethod: "SINGLE_PICK",
        searchRadiusKm: filters.radiusKm,
        timezone: getClientTimezone(),
        expiresAt: buildMeetupExpiry(),
      }).unwrap();

      const meetupUuid = created.uuid;

      if (!meetupUuid) {
        throw new Error(
          "Meetup was created but the response did not include a meetup UUID.",
        );
      }

      setBackendMeetupUuid(meetupUuid);

      if (created.shareToken) {
        setBackendShareToken(created.shareToken);

        window.localStorage.setItem(
          `foodhub-meetup-share-token-${meetupUuid}`,
          created.shareToken,
        );
      }
    } catch (error) {
      setBackendSyncError(getApiErrorMessage(error));
    }
  }, [
    backendMeetupUuid,
    createMeetup,
    createdByUserId,
    filters.radiusKm,
    groupName,
  ]);

  const calculateAndShowRecommendations = () => {
    const midpoint = calculateGroupMidpoint(members);

    if (!midpoint) {
      return;
    }

    setMeetingPoint(midpoint);
    setSelectedStoreId(null);
    setView("list");

    autoCreateAttemptedRef.current = false;

    setStage("recommendations");

    setSessionError(null);

    void syncMeetupToBackend();
  };

  const createVotingSession = useCallback(
    async (openPanel = false) => {
      const candidateStores = filteredStores.slice(0, MAX_VOTING_CANDIDATES);

      if (candidateStores.length === 0) {
        setSessionError("No candidate stores are available for voting.");

        return;
      }

      try {
        setSessionError(null);

        const result = await createSession({
          groupName: groupName.trim() || "FoodHub Group",

          members: members.map(toSharedMember),

          stores: candidateStores,
        }).unwrap();

        const url = `${window.location.origin}/group-vote/${encodeURIComponent(
          result.session.inviteCode,
        )}`;

        setInviteCode(result.session.inviteCode);

        setOwnerToken(result.ownerToken);

        setParticipantToken(result.participantToken);

        setParticipantUuid(result.participantUuid);

        setCreatedSession(result.session);

        setShareUrl(url);

        setStage("voting");

        setVotingOpen(openPanel);

        window.localStorage.setItem(
          `foodhub-vote-token-${result.session.inviteCode}`,
          result.participantToken,
        );

        window.localStorage.setItem(
          `foodhub-vote-member-${result.session.inviteCode}`,
          result.participantUuid,
        );
      } catch (error) {
        setSessionError(getApiErrorMessage(error));
      }
    },
    [createSession, filteredStores, groupName, members],
  );

  useEffect(() => {
    const shouldPrepareVoting =
      stage === "recommendations" &&
      filteredStores.length > 0 &&
      !inviteCode &&
      !isCreatingSession &&
      !autoCreateAttemptedRef.current;

    if (!shouldPrepareVoting) {
      return;
    }

    autoCreateAttemptedRef.current = true;

    void createVotingSession(false);
  }, [
    createVotingSession,
    filteredStores.length,
    inviteCode,
    isCreatingSession,
    stage,
  ]);

  const voteAsHost = async (storeUuid: string) => {
    if (!inviteCode || !participantToken) {
      setSessionError("Voting access is not ready yet.");

      return;
    }

    try {
      setSessionError(null);

      const session = await submitVote({
        inviteCode,
        participantToken,
        storeUuid,
      }).unwrap();

      setCreatedSession(session);

      void refetchSession();
    } catch (error) {
      setSessionError(getApiErrorMessage(error));
    }
  };

  const finishSharedVoting = async () => {
    if (!inviteCode || !ownerToken) {
      setSessionError("Owner access is not ready yet.");

      return;
    }

    try {
      setSessionError(null);

      const session = await finishVoting({
        inviteCode,
        ownerToken,
      }).unwrap();

      setCreatedSession(session);

      setStage("completed");

      setVotingOpen(true);

      void refetchSession();
    } catch (error) {
      setSessionError(getApiErrorMessage(error));
    }
  };

  const cancelBackendMeetupIfNeeded = () => {
    const meetupUuid = backendMeetupUuid;

    setBackendMeetupUuid(null);
    setBackendShareToken(null);
    setBackendSyncError(null);

    if (!meetupUuid) {
      return;
    }

    window.localStorage.removeItem(`foodhub-meetup-share-token-${meetupUuid}`);

    void cancelMeetup(meetupUuid)
      .unwrap()
      .catch(() => {
        // Do not block the local UI reset if backend cancellation fails.
      });
  };

  const clearSharedSession = () => {
    autoCreateAttemptedRef.current = false;

    setInviteCode(null);
    setOwnerToken(null);
    setParticipantToken(null);
    setParticipantUuid(null);
    setCreatedSession(null);
    setShareUrl("");
    setVotingOpen(false);
    setSessionError(null);
  };

  const changeLocations = () => {
    cancelBackendMeetupIfNeeded();
    clearSharedSession();

    setMeetingPoint(null);
    setSelectedStoreId(null);
    setView("list");
    setStage("setup");

    onResultCountChange(0);
  };

  const restart = () => {
    cancelBackendMeetupIfNeeded();
    clearSharedSession();

    setGroupName("FoodHub Dinner Group");

    setMembers(createInitialMembers(userLocation));

    setMeetingPoint(null);
    setSelectedStoreId(null);
    setView("list");
    setStage("setup");

    onResultCountChange(0);
  };

  const votingPanel = (
    <GroupVotingPanel
      open={votingOpen}
      session={activeSession}
      shareUrl={shareUrl}
      currentMemberUuid={participantUuid}
      isSubmittingVote={isSubmittingVote}
      isFinishing={isFinishingVoting}
      errorMessage={sessionError}
      onVote={(storeUuid) => void voteAsHost(storeUuid)}
      onFinish={() => void finishSharedVoting()}
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
      <GroupMeetingPoint
        meetingPoint={meetingPoint}
        members={members}
        storeCount={filteredStores.length}
        radiusKm={filters.radiusKm}
      />

      <GroupResultsHeader
        groupName={groupName}
        resultCount={filteredStores.length}
        shareUrl={shareUrl}
        hasVotingSession={Boolean(inviteCode)}
        isCreatingSession={isCreatingSession}
        onOpenFilters={onOpenFilters}
        onChangeLocations={changeLocations}
        onCreateVotingSession={() => {
          autoCreateAttemptedRef.current = true;

          void createVotingSession(false);
        }}
        onOpenVoting={() => setVotingOpen(true)}
      />

      {sessionError && !votingOpen && (
        <div className="mb-5 rounded-[18px] border border-red-100 bg-red-50 px-4 py-3 text-[17px] leading-7 text-red-600">
          {sessionError}
        </div>
      )}

      {backendSyncError && !votingOpen && (
        <div className="mb-5 rounded-[18px] border border-amber-100 bg-amber-50 px-4 py-3 text-[17px] leading-7 text-amber-700">
          {backendSyncError}
        </div>
      )}

      {backendMeetupUuid && !backendSyncError && !votingOpen && (
        <div className="mb-5 rounded-[18px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-[17px] leading-7 text-emerald-700">
          Real meetup synced locally.
          {backendShareToken ? " Backend share token saved." : ""}
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
        <DebugMetric label="" value={String(sourceStoreCount)} />

        <DebugMetric
          label="ហាងមុនតម្រង"
          value={String(recommendedStoreCount)}
        />
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
