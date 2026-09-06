"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  ChefHat,
  Loader2,
  LogOut,
  RefreshCw,
  ShieldAlert,
  Store,
  Trophy,
  Utensils,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import {
  useGetBackendUserQuery,
  useGetCurrentUserQuery,
} from "@/app/store/auth/currentUserApi";
import {
  useCompleteMeetupVotingMutation,
  useGetMeetupGroupQuery,
  useGetMeetupParticipantsQuery,
  useGetMeetupVoteTallyQuery,
  useGetMeetupVotesQuery,
  useGetMeetupCandidatesQuery,
  useLeaveMeetupParticipantMutation,
  useRemoveMeetupParticipantMutation,
  useResolveMeetupShareTokenQuery,
  useRetractMeetupVoteMutation,
  useSubmitMeetupVoteMutation,
} from "@/app/store/groupRecommendationApi";
import {
  useGetNearbyStoresQuery,
  useGetStoresQuery,
} from "@/app/store/locationApi";
import { useGetMenuItemsQuery } from "@/app/store/menuApi";
import { useGetMemberProfilesQuery } from "@/app/store/memberProfileApi";
import {
  useCreateRecommendationSessionMutation,
  useGetRecommendationSafetyChecksQuery,
} from "@/app/store/recommendationApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  buildMeetupSlate,
  collectMeetupProfileUuids,
  type MeetupCandidate,
} from "@/lib/meetup/meetup-candidates";
import {
  getMeetupErrorMessage,
  isAlreadyVotedError,
  isConflictError,
} from "@/lib/meetup/meetup-errors";
import {
  useStoredMeetupSession,
  useStoredShareToken,
  type StoredMeetupSession,
} from "@/lib/meetup/meetup-session";
import type { RecommendationSession } from "@/types/recommendation";
import type { MeetupWinningCardResponse } from "@/types/meetup-api";
import type { CatalogMenuItem } from "@/types/catalog-menu-item";
import type { LocationStore } from "@/types/location-store";
import type { MenuItem } from "@/types/manu";
import type { GroupLocationMember, GroupRecommendedStore } from "@/types/group-location";
import { calculateGroupMidpoint } from "@/lib/location/group-geo";
import { buildGroupRecommendedStores } from "@/lib/location/group-recommendation";
import GuestJoinSafetySheet from "./GuestJoinSafetySheet";
import MeetupCandidateCard from "./MeetupCandidateCard";
import MeetupStoreCandidateCard from "./MeetupStoreCandidateCard";
import MeetupParticipantsPanel, {
  toDisplayName,
} from "./MeetupParticipantsPanel";
import MeetupMidpointMap from "./MeetupMidpointMap";
import MeetupRoomHeader from "./MeetupRoomHeader";
import MeetupTallyPanel from "./MeetupTallyPanel";
import MeetupWinnerCelebration from "./MeetupWinnerCelebration";

interface MeetupLiveRoomProps {
  /** Present when the room was opened from a host/dashboard link. */
  meetupUuid?: string;
  /** Present when the room was opened from a public invite link. */
  shareToken?: string;
}

function CandidateSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="aspect-[16/10] animate-pulse bg-slate-100 dark:bg-slate-800" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-11 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}

function toLocationMenuItem(item: CatalogMenuItem): MenuItem {
  const category = item.food?.category ?? { code: "", name: "" };
  const cuisine = item.food?.cuisine ?? { code: "", name: "" };
  const ageGroups = Array.isArray(item.food?.ageGroups) ? item.food.ageGroups : [];
  const mealTypes = Array.isArray(item.food?.mealTypes) ? item.food.mealTypes : [];
  const dietaryTypes = Array.isArray(item.food?.dietaryTypes) ? item.food.dietaryTypes : [];
  const ingredients = Array.isArray(item.ingredients)
    ? item.ingredients.filter(
        (value: unknown): value is string => typeof value === "string" && value.trim().length > 0,
      )
    : [];

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
    distanceKm: item.distanceKm ? Number(item.distanceKm) : 0,
    deliveryFee: 0,
    recommendation: {
      isRecommended: true,
      rankPosition: 0,
      finalScore: Number(item.recommendation?.finalScore ?? 80),
      safetyStatus: "SAFE",
      candidateSource: item.source,
      reasonCodes: item.recommendation?.reasonCodes ?? [],
      reasonText: item.recommendation?.reasonText ?? "",
      isExploration: false,
      scoreBreakdown: {
        mealMatch: 80,
        cuisineMatch: 80,
        budgetMatch: 80,
        distanceMatch: 80,
        popularity: 80,
      },
    },
  };

  return converted as unknown as MenuItem;
}

export default function MeetupLiveRoom({
  meetupUuid: meetupUuidProp,
  shareToken: shareTokenProp,
}: MeetupLiveRoomProps) {
  const router = useRouter();
  const { data: user } = useGetCurrentUserQuery();
  const { data: backendUser } = useGetBackendUserQuery();
  const { data: profilePage, isLoading: isLoadingProfiles } =
    useGetMemberProfilesQuery(undefined, { skip: !user });

  /*
   * Polling stops once the room can no longer change — decided, cancelled, or
   * unreachable — so a dead link does not keep hitting the API every few
   * seconds for as long as the tab stays open.
   * ✅ PERFORMANCE FIX: Reduced polling frequency from 6s/4s/8s to 15s/10s/20s
   */
  const [isRoomLive, setIsRoomLive] = useState(true);
  const roomPollMs = isRoomLive ? 15000 : 0; // Reduced from 6000ms to 15000ms

  /*
   * A room reached by share token resolves through the public endpoint; one
   * reached by uuid (host links, "my meetups") resolves through the owner
   * endpoint. Only one of the two ever runs.
   */
  const shareTokenQuery = useResolveMeetupShareTokenQuery(shareTokenProp ?? "", {
    skip: !shareTokenProp,
    pollingInterval: roomPollMs,
  });

  const uuidQuery = useGetMeetupGroupQuery(meetupUuidProp ?? "", {
    skip: Boolean(shareTokenProp) || !meetupUuidProp,
    pollingInterval: roomPollMs,
  });

  const {
    data: group,
    isLoading: isLoadingGroup,
    isError: hasGroupError,
    refetch: refetchGroup,
  } = shareTokenProp ? shareTokenQuery : uuidQuery;

  const meetupUuid = group?.uuid || meetupUuidProp || "";

  const isRoomFinished =
    group?.status === "DECIDED" ||
    group?.status === "CANCELLED" ||
    group?.status === "EXPIRED";
  const shouldPoll = !hasGroupError && !isRoomFinished;

  /*
   * Adjusted during render rather than in an effect: the next poll interval is
   * derived from the response that just arrived, so React can re-render with
   * the new value before committing instead of after an extra pass.
   */
  if (shouldPoll !== isRoomLive) {
    setIsRoomLive(shouldPoll);
  }

  /*
   * The invite and result links need the plaintext share token, which the API
   * only returns once at creation. A host arriving by uuid recovers it from
   * the local history written at that moment.
   */
  const recoveredShareToken = useStoredShareToken(
    shareTokenProp ? "" : meetupUuid,
  );

  const shareToken = shareTokenProp || recoveredShareToken;

  /* Identity is stored per share token; a uuid-only room keys on the uuid. */
  const sessionKey = shareToken || meetupUuid;

  const { data: participantList } = useGetMeetupParticipantsQuery(meetupUuid, {
    skip: !meetupUuid,
    pollingInterval: isRoomLive ? 20000 : 0, // Reduced from 8000ms to 20000ms
  });

  /* The group payload carries participants; the dedicated endpoint backs it up. */
  const allParticipants = useMemo(
    () =>
      participantList?.length ? participantList : (group?.participants ?? []),
    [participantList, group?.participants],
  );

  const participants = useMemo(
    () =>
      allParticipants.filter(
        (participant) => (participant.status ?? "ACTIVE") === "ACTIVE",
      ),
    [allParticipants],
  );

  const departedCount = allParticipants.length - participants.length;

  const {
    data: tally,
    isFetching: isFetchingTally,
    refetch: refetchTally,
  } = useGetMeetupVoteTallyQuery(meetupUuid, {
    skip: !meetupUuid,
    pollingInterval: isRoomLive ? 10000 : 0, // Reduced from 4000ms to 10000ms
  });

  const { data: votesResponse, refetch: refetchVotes } = useGetMeetupVotesQuery(
    meetupUuid,
    { skip: !meetupUuid, pollingInterval: isRoomLive ? 10000 : 0 }, // Reduced from 4000ms to 10000ms
  );

  /*
   * Preferred source: the meetup resolves its own slate from the share token,
   * which works for guests and gives every member the same list. The
   * per-viewer session below is the fallback for a host who opened the room by
   * uuid and therefore has no token.
   */
  const {
    data: sharedCandidates,
    isFetching: isFetchingSharedCandidates,
    refetch: refetchSharedCandidates,
  } = useGetMeetupCandidatesQuery(shareToken ?? "", { skip: !shareToken });

  const [createRecommendationSession, { isLoading: isLoadingRecommendations }] =
    useCreateRecommendationSessionMutation();
  const [submitVote] = useSubmitMeetupVoteMutation();
  const [retractVote] = useRetractMeetupVoteMutation();
  const [completeVoting, { isLoading: isCompleting }] =
    useCompleteMeetupVotingMutation();
  const [removeParticipant] = useRemoveMeetupParticipantMutation();
  const [leaveMeetup, { isLoading: isLeaving }] =
    useLeaveMeetupParticipantMutation();

  /* Written by the join sheet; this room re-renders as soon as it lands. */
  const storedSession = useStoredMeetupSession(sessionKey);
  const [recommendationSession, setRecommendationSession] =
    useState<RecommendationSession | null>(null);
  const recommendationKeyRef = useRef("");
  const [recommendationRefreshKey, setRecommendationRefreshKey] = useState(0);
  const [recommendationError, setRecommendationError] = useState<string | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  /*
   * complete-voting returns the winning card directly. Keeping it lets a host
   * without the one-time share token still see the result, since the public
   * result page can only be reached with that token.
   */
  const [winningCard, setWinningCard] =
    useState<MeetupWinningCardResponse | null>(null);
  const [votingFoodUuid, setVotingFoodUuid] = useState<string | null>(null);
  const [removingUuid, setRemovingUuid] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const myProfileUuids = useMemo(
    () =>
      new Set(
        (profilePage?.contents ?? [])
          .map((profile) => profile.uuid)
          .filter((uuid): uuid is string => Boolean(uuid)),
      ),
    [profilePage?.contents],
  );

  /*
   * A signed-in host or invited friend is already a participant, created
   * server-side. Adopting that row keeps them out of the join sheet when they
   * open the room on another device or after clearing storage.
   */
  const adoptedParticipant = useMemo(() => {
    if (storedSession || myProfileUuids.size === 0) {
      return null;
    }

    return (
      participants.find(
        (participant) =>
          participant.profileUuid && myProfileUuids.has(participant.profileUuid),
      ) ?? null
    );
  }, [storedSession, myProfileUuids, participants]);

  const activeSession: StoredMeetupSession | null = useMemo(() => {
    if (storedSession) {
      return storedSession;
    }

    if (adoptedParticipant?.uuid) {
      return {
        participantUuid: adoptedParticipant.uuid,
        guestToken: null,
        profileUuid: adoptedParticipant.profileUuid ?? null,
        nickname: adoptedParticipant.nickname,
        joinMode: "FRIEND",
        locationMode: adoptedParticipant.locationMode === "PIN" ? "PIN" : "AREA",
        locationLat: adoptedParticipant.locationLat,
        locationLng: adoptedParticipant.locationLng,
        allergies: [],
        dietaryTypes: [],
      };
    }

    return null;
  }, [storedSession, adoptedParticipant]);

  const myParticipantUuid = activeSession?.participantUuid ?? null;

  /*
   * Everyone in the room should vote on the same dishes, so the preferred
   * slate is requested from the meetup's own profiles rather than the
   * viewer's: identical inputs make the backend return an identical ranking.
   */
  const meetupProfileUuids = useMemo(
    () => collectMeetupProfileUuids(participants),
    [participants],
  );

  const slateItems = useMemo(
    () =>
      shareToken
        ? (sharedCandidates ?? [])
        : (recommendationSession?.items ?? []),
    [shareToken, sharedCandidates, recommendationSession?.items],
  );

  const isSlateLoading = shareToken
    ? isFetchingSharedCandidates && !sharedCandidates
    : isLoadingRecommendations;

  const slate = useMemo(
    () => buildMeetupSlate(slateItems, activeSession),
    [slateItems, activeSession],
  );

  const inviteUrl =
    shareToken && typeof window !== "undefined"
      ? `${window.location.origin}/meet/${shareToken}`
      : "";
  const resultPath = shareToken
    ? `/meetup/result/${encodeURIComponent(shareToken)}`
    : "";
  const resultUrl =
    resultPath && typeof window !== "undefined"
      ? `${window.location.origin}${resultPath}`
      : "";

  const isHost =
    Boolean(
      backendUser?.id &&
        group?.createdByUserId &&
        backendUser.id === group.createdByUserId,
    ) ||
    participants.some(
      (participant) =>
        participant.uuid === myParticipantUuid &&
        participant.participantRole === "HOST",
    );

  const totalVotes = tally?.totalVotes ?? 0;
  const isApprovalVoting =
    (group?.votingMethod ?? "").toUpperCase() === "APPROVAL";
  const isDecided = group?.status === "DECIDED";
  const isCancelled = group?.status === "CANCELLED";
  const isVotingClosed = isDecided || isCancelled || group?.status === "EXPIRED";

  const myVotes = useMemo(() => {
    if (!myParticipantUuid) {
      return [];
    }

    return (votesResponse?.votes ?? []).filter(
      (vote) => vote.participantUuid === myParticipantUuid,
    );
  }, [votesResponse?.votes, myParticipantUuid]);

  /* foodUuid -> voteUuid, so a second tap on a card can retract that vote. */
  const myVoteUuidByFoodUuid = useMemo(() => {
    const map = new Map<string, string>();

    for (const vote of myVotes) {
      const foodUuid = vote.foodUuid || vote.candidateUuid;

      if (foodUuid && vote.uuid) {
        map.set(foodUuid, vote.uuid);
      }
    }

    return map;
  }, [myVotes]);

  const votedParticipantUuids = useMemo(
    () =>
      new Set(
        (votesResponse?.votes ?? [])
          .map((vote) => vote.participantUuid)
          .filter((uuid): uuid is string => Boolean(uuid)),
      ),
    [votesResponse?.votes],
  );

  /* Display-only frontrunner; the host's complete-voting call decides. */
  const leadingFoodUuid = useMemo(() => {
    const leader = (tally?.tally ?? []).find((entry) => entry.isWinner);

    return (
      leader?.foodUuid || leader?.candidateUuid || tally?.winnerUuid || null
    );
  }, [tally?.tally, tally?.winnerUuid]);

  /* Profiles the viewer owns are always accepted by the session endpoint. */
  const ownProfileUuids = useMemo(() => {
    const profiles = (profilePage?.contents ?? []).filter(
      (profile) => profile.isActive && profile.uuid,
    );

    const preferred = profiles.find((profile) => profile.isDefault) ?? profiles[0];

    return preferred?.uuid ? [preferred.uuid] : [];
  }, [profilePage?.contents]);

  const hasNoUsableProfile =
    meetupProfileUuids.length === 0 &&
    ownProfileUuids.length === 0 &&
    !isLoadingProfiles &&
    Boolean(group);

  const effectiveRecommendationError =
    recommendationError ||
    (hasNoUsableProfile
      ? "មិនមានប្រវត្តិរូប FoodHub សកម្មសម្រាប់បង្កើតបញ្ជីហាងទេ។ សូមចូលគណនី ឬឲ្យសមាជិកដែលមានគណនីបើកបន្ទប់នេះ។"
      : null);

  /*
   * The request only changes when the room's inputs change, so it is keyed on
   * primitives rather than the polled group object — otherwise every poll
   * would look like a new request.
   */
  const slateKey = useMemo(
    () =>
      JSON.stringify({
        meetupUuid,
        meetupProfileUuids,
        ownProfileUuids,
        radius: group?.searchRadiusKm ?? null,
        refresh: recommendationRefreshKey,
      }),
    [
      meetupUuid,
      meetupProfileUuids,
      ownProfileUuids,
      group?.searchRadiusKm,
      recommendationRefreshKey,
    ],
  );

  const groupLocationMembers = useMemo<GroupLocationMember[]>(() => {
    return participants.map((participant, index) => {
      const hasCoords =
        participant.locationLat != null &&
        participant.locationLng != null &&
        Number.isFinite(participant.locationLat) &&
        Number.isFinite(participant.locationLng);

      return {
        uuid: participant.uuid ?? participant.nickname ?? `member-${index}`,
        name: toDisplayName(participant.nickname ?? null, "សមាជិក"),
        coordinates: hasCoords
          ? {
              latitude: Number(participant.locationLat),
              longitude: Number(participant.locationLng),
            }
          : null,
        locationStatus: hasCoords ? "ready" : "waiting",
        requiredDietaryCodes: participant.dietaryTypes ?? [],
        blockedAllergenCodes: participant.allergies ?? [],
        hasVoted: votedParticipantUuids.has(participant.uuid ?? ""),
        profileId: participant.profileId,
        backendParticipantUuid: participant.uuid ?? null,
      };
    });
  }, [participants, votedParticipantUuids]);

  const calculatedMidpointResult = useMemo(() => {
    const calculated = calculateGroupMidpoint(groupLocationMembers);
    if (calculated) {
      return { coordinates: calculated, isCalculated: true };
    }

    if (group?.meetingPointLat != null && group?.meetingPointLng != null) {
      return {
        coordinates: {
          latitude: group.meetingPointLat,
          longitude: group.meetingPointLng,
        },
        isCalculated: false,
      };
    }

    if (group?.targetLat != null && group?.targetLng != null) {
      return {
        coordinates: {
          latitude: group.targetLat,
          longitude: group.targetLng,
        },
        isCalculated: false,
      };
    }

    return null;
  }, [
    groupLocationMembers,
    group?.meetingPointLat,
    group?.meetingPointLng,
    group?.targetLat,
    group?.targetLng,
  ]);

  const groupContext = useMemo(
    () => ({
      audienceMode: group?.audienceMode,
      locationMode: group?.locationMode,
      targetAreaName: group?.targetAreaName,
      targetCity: group?.targetCity,
      targetProvince: group?.targetProvince,
      targetLat: calculatedMidpointResult?.coordinates.latitude ?? group?.targetLat,
      targetLng: calculatedMidpointResult?.coordinates.longitude ?? group?.targetLng,
      searchRadiusKm: group?.searchRadiusKm ?? 5,
    }),
    [group, calculatedMidpointResult],
  );

  // ─── STORES RECOMMENDATION AROUND MIDPOINT ───────────
  const midpointCoords = calculatedMidpointResult?.coordinates ?? null;

  const {
    data: nearbyStores = [],
    isLoading: isLoadingNearby,
    refetch: refetchNearby,
  } = useGetNearbyStoresQuery(
    {
      latitude: midpointCoords?.latitude ?? 11.5564,
      longitude: midpointCoords?.longitude ?? 104.9282,
    },
    { skip: !midpointCoords },
  );

  const {
    data: allStores = [],
    isLoading: isLoadingAllStores,
    refetch: refetchAllStores,
  } = useGetStoresQuery(undefined, {
    skip: Boolean(midpointCoords && nearbyStores.length > 0),
  });

  const { data: rawMenuItems = [] } = useGetMenuItemsQuery();

  const adaptedMenuItems = useMemo<MenuItem[]>(() => {
    return Array.isArray(rawMenuItems) ? rawMenuItems.map(toLocationMenuItem) : [];
  }, [rawMenuItems]);

  const sourceStores = nearbyStores.length > 0 ? nearbyStores : allStores;
  const isLoadingStores =
    (!midpointCoords && isLoadingGroup) ||
    (Boolean(midpointCoords) && isLoadingNearby && nearbyStores.length === 0);

  const rawLocationStores = useMemo(() => {
    return sourceStores.map((s) => ({
      uuid: s.uuid,
      storeName: s.storeName,
      name: s.storeName,
      localName: s.storeName,
      description: ("description" in s && typeof s.description === "string" ? s.description : ""),
      addressLine: s.addressLine ?? "",
      district: ("district" in s && typeof s.district === "string" ? s.district : (s.city ?? "")),
      commune: "",
      city: s.city ?? "",
      province: s.province ?? "",
      countryCode: "KHM",
      postalCode: "",
      latitude: Number(s.latitude) || 0,
      longitude: Number(s.longitude) || 0,
      logoUrl: ("logoUrl" in s && typeof s.logoUrl === "string" ? s.logoUrl : null),
      coverImageUrl: ("coverImageUrl" in s && typeof s.coverImageUrl === "string" ? s.coverImageUrl : null),
      logoMediaUuid: ("logoMediaUuid" in s && typeof s.logoMediaUuid === "string" ? s.logoMediaUuid : null),
      coverMediaUuid: ("coverMediaUuid" in s && typeof s.coverMediaUuid === "string" ? s.coverMediaUuid : null),
      averageRating: Number(s.averageRating) || 0,
      totalReviews: Number(s.totalReviews) || 0,
      operatingStatus: (s.operatingStatus as "OPEN" | "CLOSED" | "TEMPORARILY_CLOSED") ?? "OPEN",
      isOpenNow: s.isOpenNow ?? true,
      priceLevel: ("priceLevel" in s && s.priceLevel ? s.priceLevel : "$$"),
      deliveryAvailable: ("deliveryAvailable" in s ? Boolean(s.deliveryAvailable) : true),
      pickupAvailable: ("pickupAvailable" in s ? Boolean(s.pickupAvailable) : true),
      contactPhone: "",
      phoneNumber: "",
      email: "",
      menuCategories: [],
      gallery: [],
      dietaryOptions: [],
      averagePreparationTimeMinutes: 20,
      distanceKm: s.distanceMeters ? s.distanceMeters / 1000 : null,
      distanceMeters: s.distanceMeters ?? null,
      featuredFoods: [],
    } as unknown as LocationStore));
  }, [sourceStores]);

  const recommendedStores = useMemo<GroupRecommendedStore[]>(() => {
    if (!midpointCoords) {
      return [];
    }

    const built = buildGroupRecommendedStores({
      sourceStores: rawLocationStores,
      menuItems: adaptedMenuItems,
      midpoint: midpointCoords,
      members: groupLocationMembers,
    });

    if (built.length > 0) {
      return built;
    }

    // Fallback: If no direct distance match or empty, map raw stores
    return rawLocationStores.map((s) => ({
      uuid: s.uuid,
      name: s.storeName,
      localName: s.storeName,
      description: s.description ?? "",
      addressLine: s.addressLine ?? "",
      district: s.district ?? "",
      commune: "",
      city: s.city ?? "",
      province: s.province ?? "",
      phoneNumber: "",
      email: "",
      latitude: s.latitude,
      longitude: s.longitude,
      logoUrl: s.logoUrl,
      coverImageUrl: s.coverImageUrl,
      logoMediaUuid: s.logoMediaUuid,
      coverMediaUuid: s.coverMediaUuid,
      averageRating: s.averageRating ?? 0,
      totalReviews: s.totalReviews ?? 0,
      operatingStatus: s.operatingStatus ?? "OPEN",
      isOpenNow: s.isOpenNow ?? true,
      priceLevel: s.priceLevel ?? null,
      deliveryAvailable: s.deliveryAvailable ?? true,
      pickupAvailable: s.pickupAvailable ?? true,
      distanceKm: 0,
      averageMemberDistanceKm: 0,
      maximumMemberDistanceKm: 0,
      menuItems: adaptedMenuItems.filter((m) => m.store?.uuid === s.uuid),
      menuCount: adaptedMenuItems.filter((m) => m.store?.uuid === s.uuid).length,
      matchingMenuCount: 0,
      safeForAllMembers: true,
      hasMealsForEveryone: true,
      recommendationScore: 85,
      voteCount: 0,
    } as unknown as GroupRecommendedStore));
  }, [rawLocationStores, adaptedMenuItems, midpointCoords, groupLocationMembers]);

  const enrichedTally = useMemo(() => {
    return (tally?.tally ?? []).map((entry) => {
      const candidateId = entry.foodUuid || entry.candidateUuid;
      const matched = recommendedStores.find((s) => s.uuid === candidateId);
      const storeName = matched ? (matched.localName || matched.name) : null;
      return {
        ...entry,
        candidateName: storeName || entry.foodName || entry.candidateName || "ហាងអាហារ",
      };
    });
  }, [tally?.tally, recommendedStores]);

  const leadingStoreUuid = useMemo(() => {
    const leader = (enrichedTally ?? []).find((entry) => entry.isWinner);
    return leader?.foodUuid || leader?.candidateUuid || tally?.winnerUuid || null;
  }, [enrichedTally, tally?.winnerUuid]);

  useEffect(() => {
    if (!meetupUuid || !group) {
      return;
    }

    /*
     * With a share token the meetup serves its own slate, so the per-viewer
     * session below is unnecessary — and impossible for a guest, who has no
     * account to open one with.
     */
    if (shareToken) {
      return;
    }

    if (recommendationKeyRef.current === slateKey) {
      return;
    }

    recommendationKeyRef.current = slateKey;

    /*
     * The session endpoint only accepts profiles the requester owns, plus —
     * in GROUP mode — profiles belonging to their friends. A room profile
     * that fits neither is rejected, so the shared group slate is attempted
     * first and the viewer's own profile is the guaranteed fallback.
     */
    const attempts: Array<{ uuids: string[]; mode: "GROUP" | "SINGLE" }> = [];

    if (meetupProfileUuids.length >= 2) {
      attempts.push({ uuids: meetupProfileUuids, mode: "GROUP" });
    } else if (meetupProfileUuids.length === 1) {
      attempts.push({ uuids: meetupProfileUuids, mode: "SINGLE" });
    }

    if (ownProfileUuids.length > 0) {
      attempts.push({ uuids: ownProfileUuids, mode: "SINGLE" });
    }

    const uniqueAttempts = attempts.filter(
      (attempt, index) =>
        attempts.findIndex(
          (other) =>
            other.mode === attempt.mode &&
            other.uuids.join() === attempt.uuids.join(),
        ) === index,
    );

    if (uniqueAttempts.length === 0) {
      return;
    }

    let cancelled = false;

    async function loadSlate() {
      let lastError: unknown = null;

      for (const attempt of uniqueAttempts) {
        /*
         * A 409 from session creation is a transient write conflict — several
         * people opening the same room at once — rather than a rejection of
         * this request. One retry clears it; anything else falls through to
         * the next attempt immediately.
         */
        for (let tryCount = 0; tryCount < 2; tryCount += 1) {
          try {
            const session = await createRecommendationSession({
              mode: attempt.mode,
              requestSource: "HOMEPAGE_AUTO",
              requestedLimit: 12,
              searchRadiusKm: groupContext.searchRadiusKm,
              currencyCode: "USD",
              contextData: { meetupUuid, ...groupContext },
              profiles: attempt.uuids.map((profileUuid, index) => ({
                profileId: profileUuid,
                isPrimary: index === 0,
              })),
            }).unwrap();

            if (!cancelled) {
              setRecommendationError(null);
              setRecommendationSession(session);
            }

            return;
          } catch (error) {
            console.error(
              `Meetup slate attempt failed (${attempt.mode}):`,
              error,
            );
            lastError = error;

            if (cancelled || !isConflictError(error) || tryCount === 1) {
              break;
            }

            await new Promise((resolve) => window.setTimeout(resolve, 400));
          }
        }

        if (cancelled) {
          return;
        }
      }

      if (!cancelled) {
        /*
         * Every attempt failed. The key is deliberately left in place so the
         * room does not retry on its own — the refresh button drives retries.
         */
        setRecommendationError(
          getMeetupErrorMessage(
            lastError,
            "FoodHub មិនអាចផ្ទុកបញ្ជីហាងសម្រាប់ការណាត់ជួបនេះបានទេ។ សូមចុច ផ្ទុកឡើងវិញ។",
          ),
        );
      }
    }

    void loadSlate();

    return () => {
      cancelled = true;
    };
  }, [
    createRecommendationSession,
    group,
    groupContext,
    meetupProfileUuids,
    meetupUuid,
    ownProfileUuids,
    slateKey,
  ]);

  /*
   * When the group's rules blocked every dish, the session's safety checks say
   * which profile did it. Fetched only in that case — it is a per-item table
   * and there is nothing to explain while the room has food to vote on.
   */
  const blockedEverything =
    Boolean(recommendationSession) &&
    (recommendationSession?.candidateCount ?? 0) > 0 &&
    (recommendationSession?.eligibleCount ?? 0) === 0;

  const { data: safetyChecks } = useGetRecommendationSafetyChecksQuery(
    recommendationSession?.uuid ?? "",
    { skip: !blockedEverything || !recommendationSession?.uuid },
  );

  /**
   * Members whose profile blocked dishes, worst first, so the host knows whose
   * restrictions to look at rather than guessing.
   */
  const blockingMembers = useMemo(() => {
    if (!safetyChecks?.length) {
      return [];
    }

    const blocksByProfileId = new Map<number, number>();

    for (const check of safetyChecks) {
      if (check.result?.toUpperCase() !== "BLOCKED" || check.profileId === null) {
        continue;
      }

      blocksByProfileId.set(
        check.profileId,
        (blocksByProfileId.get(check.profileId) ?? 0) + 1,
      );
    }

    return [...blocksByProfileId.entries()]
      .map(([profileId, blockedCount]) => {
        const participant = participants.find(
          (candidate) => candidate.profileId === profileId,
        );

        return {
          profileId,
          blockedCount,
          name: toDisplayName(participant?.nickname ?? null, "សមាជិក"),
        };
      })
      .sort((left, right) => right.blockedCount - left.blockedCount);
  }, [safetyChecks, participants]);

  /*
   * An empty slate has three very different causes and the session's own
   * counters tell them apart: nothing in the catalog matched the room, the
   * group's combined allergy and diet rules blocked everything, or the dishes
   * that survived carry no canonical food and so cannot be voted on.
   */
  const emptySlateReason = useMemo(() => {
    if (shareToken) {
      /* The shared slate returns items only, so the cause stays general. */
      return "គ្មានហាងណាឆ្លងកាត់ច្បាប់អាឡែស៊ី និងរបបអាហាររបស់សមាជិកទាំងអស់ក្នុងបន្ទប់នេះទេ។ សូមពិនិត្យប្រវត្តិរូបសមាជិក ឬបន្ថែមហាងក្នុងបញ្ជី។";
    }

    if (!recommendationSession) {
      return "មិនទាន់មានហាងសម្រាប់បន្ទប់នេះទេ។ សូមចុច ផ្ទុកឡើងវិញ។";
    }

    const candidateCount = recommendationSession.candidateCount ?? 0;
    const eligibleCount = recommendationSession.eligibleCount ?? 0;

    if (candidateCount === 0) {
      return "រកមិនឃើញហាងក្នុងបញ្ជីសម្រាប់តំបន់ និងរង្វង់ស្វែងរកនេះទេ។ សូមពង្រីករង្វង់ស្វែងរក ឬប្ដូរទីតាំង។";
    }

    if (eligibleCount === 0) {
      return `រកឃើញហាង ${candidateCount} កន្លែង ប៉ុន្តែគ្មានហាងណាឆ្លងកាត់ច្បាប់អាឡែស៊ី និងរបបអាហាររបស់សមាជិកទាំងអស់ទេ។ សូមពិនិត្យប្រវត្តិរូបសមាជិក ឬដកសមាជិកដែលមានលក្ខខណ្ឌតឹងរ៉ឹងបំផុត។`;
    }

    return "ហាងដែលឆ្លងកាត់សុវត្ថិភាព មិនមានព័ត៌មានគោលដើម្បីបោះឆ្នោតបានទេ។ សូមទាក់ទងអ្នកគ្រប់គ្រង។";
  }, [recommendationSession, shareToken]);

  const getVoteCount = useCallback(
    (candidateId: string) =>
      (tally?.tally ?? []).find(
        (entry) =>
          entry.foodUuid === candidateId ||
          entry.candidateUuid === candidateId,
      )?.voteCount ?? 0,
    [tally?.tally],
  );

  const handleCopy = async (value: string, type: "invite" | "result") => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
    } catch {
      setActionError("មិនអាចចម្លងតំណបានទេ។ សូមចម្លងដោយដៃ។");
      return;
    }

    if (type === "invite") {
      setCopiedInvite(true);
      window.setTimeout(() => setCopiedInvite(false), 2200);
    } else {
      setCopiedResult(true);
      window.setTimeout(() => setCopiedResult(false), 2200);
    }
  };

  const handleVoteStore = async (store: GroupRecommendedStore) => {
    if (!meetupUuid || !activeSession) {
      setActionError("សូមចូលរួមការណាត់ជួបមុននឹងបោះឆ្នោត។");
      return;
    }

    setActionError(null);
    setVotingFoodUuid(store.uuid);

    const existingVoteUuid = myVoteUuidByFoodUuid.get(store.uuid);

    try {
      if (existingVoteUuid) {
        /* Tapping a store already backed by this participant retracts it. */
        await retractVote({ voteUuid: existingVoteUuid, meetupUuid }).unwrap();
      } else {
        if (!isApprovalVoting) {
          /*
           * SINGLE_PICK allows one vote, so clear the previous one first. A
           * vote already gone server-side must not block the new one.
           */
          for (const vote of myVotes) {
            if (!vote.uuid) {
              continue;
            }

            try {
              await retractVote({ voteUuid: vote.uuid, meetupUuid }).unwrap();
            } catch {
              /* Already replaced or removed server-side. */
            }
          }
        }

        await submitVote({
          meetupUuid,
          participantUuid: activeSession.participantUuid,
          foodUuid: store.uuid,
        }).unwrap();
      }

      await Promise.all([refetchVotes(), refetchTally()]);
    } catch (error: unknown) {
      console.error("Meetup vote failed:", error);

      if (isAlreadyVotedError(error)) {
        /* The server already holds this vote; realign instead of erroring. */
        await Promise.all([refetchVotes(), refetchTally()]);
      } else {
        setActionError(
          getMeetupErrorMessage(error, "FoodHub មិនអាចកែសំឡេងរបស់អ្នកបានទេ។"),
        );
      }
    } finally {
      setVotingFoodUuid(null);
    }
  };

  const handleCompleteVoting = async () => {
    if (!meetupUuid) {
      return;
    }

    setActionError(null);

    try {
      const card = await completeVoting(meetupUuid).unwrap();
      await Promise.all([refetchGroup(), refetchTally()]);

      if (resultPath) {
        router.push(resultPath);
      } else {
        setWinningCard(card);
      }
    } catch (error) {
      console.error("Complete voting failed:", error);
      setActionError(
        getMeetupErrorMessage(error, "FoodHub មិនទាន់អាចបញ្ចប់ការបោះឆ្នោតបានទេ។"),
      );
    }
  };

  const handleRemoveParticipant = async (participantUuid: string) => {
    setActionError(null);
    setRemovingUuid(participantUuid);

    try {
      await removeParticipant({ participantUuid, meetupUuid }).unwrap();
    } catch (error) {
      setActionError(
        getMeetupErrorMessage(error, "មិនអាចដកអ្នកចូលរួមនេះបានទេ។"),
      );
    } finally {
      setRemovingUuid(null);
    }
  };

  const handleLeave = async () => {
    if (!activeSession) {
      return;
    }

    setActionError(null);

    try {
      await leaveMeetup({
        participantUuid: activeSession.participantUuid,
        meetupUuid,
      }).unwrap();
      router.push("/meetup");
    } catch (error) {
      setActionError(
        getMeetupErrorMessage(error, "មិនអាចចាកចេញពីការណាត់ជួបបានទេ។"),
      );
    }
  };

  const handleRefreshRecommendations = () => {
    setActionError(null);
    if (shareToken) {
      void refetchSharedCandidates();
    }
    void refetchNearby();
    void refetchAllStores();
    void refetchVotes();
    void refetchTally();
    recommendationKeyRef.current = "";
    setRecommendationSession(null);
    setRecommendationRefreshKey((current) => current + 1);
  };

  if (isLoadingGroup) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-7 w-7 animate-spin text-primary-600" />
          <p className="text-sm font-bold">កំពុងផ្ទុកការណាត់ជួប...</p>
        </div>
      </main>
    );
  }

  if (hasGroupError || !group) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 pt-24 dark:bg-slate-950">
        <section className="mx-auto max-w-xl rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-sm dark:border-rose-900/40 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl! font-black text-slate-900 dark:text-white">
            រកមិនឃើញការណាត់ជួប
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            តំណអញ្ជើញអាចផុតកំណត់ ត្រូវបានលុប ឬមិនត្រឹមត្រូវ។
          </p>
          <Link
            href="/meetup/create"
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 text-sm font-black text-white shadow-md transition hover:bg-primary-700"
          >
            បង្កើតការណាត់ជួប
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
    );
  }

  /*
   * An invited friend is already a participant, so their identity is adopted
   * from the roster rather than joined again. Waiting for the profile and
   * participant lists before offering the join sheet stops them being pushed
   * into a join the backend then rejects as "only accepted friends can join".
   */
  const isResolvingIdentity =
    !activeSession &&
    Boolean(user) &&
    (isLoadingProfiles || participants.length === 0);

  if (isResolvingIdentity) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-7 w-7 animate-spin text-primary-600" />
          <p className="text-sm font-bold">កំពុងពិនិត្យការចូលរួមរបស់អ្នក...</p>
        </div>
      </main>
    );
  }

  /* An unidentified visitor joins first; a decided room is read-only. */
  if (!activeSession && !isDecided) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-24 dark:bg-slate-950 sm:px-6">
        <GuestJoinSafetySheet
          shareToken={shareToken ?? ""}
          meetupUuid={meetupUuid}
          meetupTitle={group.title || "FoodHub meetup"}
          audienceMode={group.audienceMode}
          guestAllowed={group.guestAllowed}
          locationMode={group.locationMode}
          targetAreaName={group.targetAreaName}
          targetCity={group.targetCity}
          targetProvince={group.targetProvince}
          targetLat={group.targetLat}
          targetLng={group.targetLng}
          searchRadiusKm={group.searchRadiusKm}
          sessionKey={sessionKey}
          onJoined={() => {
            void refetchGroup();
          }}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-20 pt-20 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <MeetupRoomHeader
          group={group}
          participantCount={participants.length}
          totalVotes={totalVotes}
          canShare={Boolean(shareToken)}
          copiedInvite={copiedInvite}
          copiedResult={copiedResult}
          onCopyInvite={() => handleCopy(inviteUrl, "invite")}
          onCopyResult={() => handleCopy(resultUrl, "result")}
          onShowQr={() => setShowQrModal(true)}
        />

        {calculatedMidpointResult?.coordinates && (
          <MeetupMidpointMap
            midpoint={calculatedMidpointResult.coordinates}
            members={groupLocationMembers}
            stores={recommendedStores}
            radiusKm={group?.searchRadiusKm ?? 5}
            isCalculatedFromMembers={calculatedMidpointResult.isCalculated}
          />
        )}

        {winningCard ? (
          <MeetupWinnerCelebration
            winningCard={winningCard}
            shareToken={shareToken ?? undefined}
          />
        ) : (
          isDecided && (
            <section className="flex flex-col gap-3 rounded-3xl border border-accent-200 bg-accent-50 p-5 dark:border-accent-900 dark:bg-accent-950/30 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm font-black text-accent-800 dark:text-accent-200">
                <Trophy className="h-5 w-5 shrink-0" />
                ការបោះឆ្នោតបានបញ្ចប់រួចរាល់។
              </p>
              {resultPath && (
                <Link
                  href={resultPath}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-primary-700"
                >
                  បើកទំព័រលទ្ធផល
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </section>
          )
        )}

        {isCancelled && (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 text-sm font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            ការណាត់ជួបនេះត្រូវបានលុបចោលដោយម្ចាស់ផ្ទះ។
          </section>
        )}

        {actionError && (
          <section
            role="alert"
            className="flex items-start gap-2.5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold leading-6 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {actionError}
          </section>
        )}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-lg! font-black text-slate-900 dark:text-white">
                  <Store className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" />
                  ជ្រើសរើសហាងអាហារ
                </h2>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  បញ្ជីហាងអាហារនៅចំណុចកណ្ដាលសម្រាប់សមាជិកបោះឆ្នោតទៅញ៉ាំជុំគ្នា។
                </p>
              </div>
              <button
                type="button"
                onClick={handleRefreshRecommendations}
                disabled={isLoadingStores}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoadingStores ? "animate-spin" : ""}`}
                />
                ផ្ទុកឡើងវិញ
              </button>
            </div>

            {isLoadingStores ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <CandidateSkeleton />
                <CandidateSkeleton />
                <CandidateSkeleton />
              </div>
            ) : recommendedStores.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                <Store className="h-9 w-9 text-slate-300 dark:text-slate-600" />
                <p className="max-w-md text-sm leading-6 text-slate-500">
                  មិនទាន់រកឃើញហាងអាហារក្នុងកាំស្វែងរកនេះទេ។ សូមពង្រីករង្វង់ស្វែងរក ឬបន្ថែមទីតាំងសមាជិក។
                </p>
                <button
                  type="button"
                  onClick={handleRefreshRecommendations}
                  className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-primary-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-primary-700"
                >
                  <RefreshCw className="h-4 w-4 shrink-0" />
                  ស្វែងរកម្តងទៀត
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {recommendedStores.map((store) => (
                  <MeetupStoreCandidateCard
                    key={store.uuid}
                    store={store}
                    voteCount={getVoteCount(store.uuid)}
                    totalVotes={totalVotes}
                    isSelected={myVoteUuidByFoodUuid.has(store.uuid)}
                    isLeading={store.uuid === leadingStoreUuid}
                    isBusy={votingFoodUuid === store.uuid}
                    isLocked={isVotingClosed || votingFoodUuid !== null}
                    onVote={handleVoteStore}
                  />
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <MeetupTallyPanel
              tally={enrichedTally}
              totalVotes={totalVotes}
              isFetching={isFetchingTally}
              isApprovalVoting={isApprovalVoting}
            />

            <MeetupParticipantsPanel
              participants={participants}
              departedCount={departedCount}
              myParticipantUuid={myParticipantUuid}
              votedParticipantUuids={votedParticipantUuids}
              canModerate={isHost && !isVotingClosed}
              removingUuid={removingUuid}
              onRemove={handleRemoveParticipant}
            />

            {isHost && !isVotingClosed && (
              <section className="rounded-3xl border border-primary-200 bg-primary-50 p-5 dark:border-primary-900 dark:bg-primary-950/30">
                <h2 className="text-base! font-black text-slate-900 dark:text-white">
                  បញ្ចប់ការបោះឆ្នោត
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  ហាងដែលមានសំឡេងច្រើនជាងគេនឹងក្លាយជាលទ្ធផលចុងក្រោយ។
                </p>
                <button
                  type="button"
                  onClick={handleCompleteVoting}
                  disabled={isCompleting || totalVotes === 0}
                  className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 text-sm font-black text-white shadow-md transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCompleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trophy className="h-4 w-4" />
                  )}
                  {totalVotes === 0 ? "រង់ចាំសំឡេងបោះឆ្នោត" : "បញ្ចប់ការបោះឆ្នោត"}
                </button>
              </section>
            )}

            {activeSession && !isHost && !isVotingClosed && (
              <button
                type="button"
                onClick={handleLeave}
                disabled={isLeaving}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-500 transition hover:border-rose-200 hover:text-rose-600 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
              >
                {isLeaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                ចាកចេញពីការណាត់ជួប
              </button>
            )}
          </aside>
        </div>
      </div>

      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="max-w-xs rounded-3xl bg-white p-6 text-center dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-xl! font-bold text-slate-900 dark:text-white">
              ស្កេនដើម្បីចូលរួម
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              បើកតំណអញ្ជើញនេះនៅលើឧបករណ៍ផ្សេង។
            </DialogDescription>
          </DialogHeader>
          {inviteUrl && (
            <>
              <div className="my-4 flex justify-center overflow-hidden rounded-2xl bg-white p-3 shadow-inner">
                <QRCodeSVG
                  value={inviteUrl}
                  size={240}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "/auth/mhoubahar-brand.png",
                    x: undefined,
                    y: undefined,
                    height: 44,
                    width: 44,
                    excavate: true,
                  }}
                />
              </div>
              <p className="truncate font-mono text-xs text-slate-400">
                {inviteUrl}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
