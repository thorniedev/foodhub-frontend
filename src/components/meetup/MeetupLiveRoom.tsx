"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Loader2,
  MapPin,
  QrCode,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Vote,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { useGetBackendUserQuery, useGetCurrentUserQuery } from "@/app/store/auth/currentUserApi";
import {
  useCompleteMeetupVotingMutation,
  useGetMeetupVoteTallyQuery,
  useResolveMeetupShareTokenQuery,
  useSubmitMeetupVoteMutation,
} from "@/app/store/groupRecommendationApi";
import { useGetMemberProfilesQuery } from "@/app/store/memberProfileApi";
import { useCreateRecommendationSessionMutation } from "@/app/store/recommendationApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  readStoredMeetupSession,
  type StoredMeetupSession,
} from "@/lib/meetup/meetup-session";
import GuestJoinSafetySheet from "./GuestJoinSafetySheet";
import type { RecommendationItem, RecommendationSession } from "@/types/recommendation";

interface MeetupLiveRoomProps {
  shareToken: string;
  initialMeetupUuid?: string;
}

interface MeetupCandidate {
  candidateUuid: string;
  foodUuid: string;
  foodName: string;
  storeName: string;
  photoUrl: string | null;
  rating: number | null;
  price: number | null;
  currencyCode: string;
  distanceKm: number | null;
  finalScore: number | null;
  reasonText: string | null;
  reasonCodes: string[];
  safetyStatus: string | null;
  dietaryTags: string[];
  allergenTags: string[];
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(record: UnknownRecord, keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getNumber(record: UnknownRecord, keys: readonly string[]): number | null {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function readNestedRecord(record: UnknownRecord, keys: readonly string[]): UnknownRecord {
  for (const key of keys) {
    const value = record[key];

    if (isRecord(value)) {
      return value;
    }
  }

  return {};
}

function getStringArray(record: UnknownRecord, keys: readonly string[]): string[] {
  for (const key of keys) {
    const value = record[key];

    if (Array.isArray(value)) {
      return value.flatMap((entry) => {
        if (typeof entry === "string" && entry.trim()) {
          return [entry.trim()];
        }

        if (isRecord(entry)) {
          const label = getString(entry, [
            "code",
            "uuid",
            "name",
            "localName",
            "allergenCode",
            "dietaryTypeCode",
          ]);

          return label ? [label] : [];
        }

        return [];
      });
    }
  }

  return [];
}

function getItemRaw(item: RecommendationItem): UnknownRecord {
  const candidate = item as RecommendationItem & { raw?: unknown };
  return isRecord(candidate.raw) ? candidate.raw : {};
}

function toMeetupCandidate(item: RecommendationItem): MeetupCandidate | null {
  const raw = getItemRaw(item);
  const food = readNestedRecord(raw, ["food", "menuItem"]);
  const store = readNestedRecord(raw, ["store"]);
  const recommendation = readNestedRecord(raw, ["recommendation"]);
  const foodUuid =
    getString(raw, ["foodUuid", "menuItemUuid", "menuItemUUID"]) ||
    getString(food, ["uuid", "foodUuid", "menuItemUuid"]) ||
    item.uuid ||
    (typeof item.menuItemId === "number" ? String(item.menuItemId) : "");

  if (!foodUuid) {
    return null;
  }

  return {
    candidateUuid:
      getString(raw, ["candidateUuid", "uuid"]) || item.uuid || foodUuid,
    foodUuid,
    foodName:
      item.menuItemName ||
      getString(raw, ["foodName", "name", "menuItemName"]) ||
      getString(food, ["name", "localName", "canonicalName"]) ||
      "FoodHub item",
    storeName:
      item.storeName ||
      getString(raw, ["storeName"]) ||
      getString(store, ["name", "storeName"]) ||
      "FoodHub store",
    photoUrl:
      getString(raw, ["photoUrl", "foodPhotoUrl", "imageUrl"]) ||
      getString(food, ["imageUrl", "photoUrl"]) ||
      null,
    rating:
      getNumber(raw, ["rating", "averageRating"]) ||
      getNumber(store, ["averageRating", "rating"]),
    price:
      item.priceSnapshot ??
      getNumber(raw, ["price", "priceSnapshot"]) ??
      getNumber(food, ["price"]),
    currencyCode: item.currencyCode || getString(raw, ["currencyCode"]) || "USD",
    distanceKm: item.distanceKm ?? getNumber(raw, ["distanceKm"]),
    finalScore: item.finalScore ?? getNumber(raw, ["finalScore"]),
    reasonText:
      item.reasonText ||
      getString(raw, ["reasonText"]) ||
      getString(recommendation, ["reasonText"]),
    reasonCodes:
      item.reasonCodes ||
      getStringArray(raw, ["reasonCodes"]) ||
      getStringArray(recommendation, ["reasonCodes"]),
    safetyStatus:
      getString(raw, ["safetyStatus"]) ||
      getString(recommendation, ["safetyStatus"]),
    dietaryTags: [
      ...getStringArray(raw, ["dietaryTypes", "dietaryTags"]),
      ...getStringArray(food, ["dietaryTypes", "dietaryTags"]),
    ],
    allergenTags: [
      ...getStringArray(raw, ["allergenDeclarations", "allergens"]),
      ...getStringArray(food, ["allergenDeclarations", "allergens"]),
    ],
  };
}

function normalizeNeedles(values?: string[]): string[] {
  return (values ?? [])
    .map((value) => value.toLowerCase().trim())
    .filter(Boolean);
}

function isSafeForParticipant(
  candidate: MeetupCandidate,
  session: StoredMeetupSession | null,
) {
  const safetyStatus = candidate.safetyStatus?.toUpperCase();

  if (
    safetyStatus === "BLOCKED" ||
    safetyStatus === "UNSAFE" ||
    safetyStatus === "DANGER"
  ) {
    return false;
  }

  if (!session || session.joinMode !== "GUEST") {
    return true;
  }

  if (
    session.budgetMin !== undefined &&
    session.budgetMin !== null &&
    candidate.price !== null &&
    candidate.price < session.budgetMin
  ) {
    return false;
  }

  if (
    session.budgetMax !== undefined &&
    session.budgetMax !== null &&
    candidate.price !== null &&
    candidate.price > session.budgetMax
  ) {
    return false;
  }

  const selectedAllergies = normalizeNeedles(session.allergies);
  const itemAllergens = normalizeNeedles(candidate.allergenTags);

  if (
    selectedAllergies.length > 0 &&
    itemAllergens.some((allergen) =>
      selectedAllergies.some((selected) => allergen.includes(selected)),
    )
  ) {
    return false;
  }

  const selectedDietaryTypes = normalizeNeedles(session.dietaryTypes);
  const itemDietaryTags = normalizeNeedles(candidate.dietaryTags);

  if (
    selectedDietaryTypes.length > 0 &&
    itemDietaryTags.length > 0 &&
    !selectedDietaryTypes.every((selected) =>
      itemDietaryTags.some((tag) => tag.includes(selected)),
    )
  ) {
    return false;
  }

  return true;
}

function buildResultLink(shareToken: string) {
  return `/meetup/result/${encodeURIComponent(shareToken)}`;
}

export default function MeetupLiveRoom({
  shareToken,
  initialMeetupUuid,
}: MeetupLiveRoomProps) {
  const router = useRouter();
  const { data: user } = useGetCurrentUserQuery();
  const { data: backendUser } = useGetBackendUserQuery();
  const { data: profilePage, isLoading: isLoadingProfiles } =
    useGetMemberProfilesQuery(undefined, {
      skip: !user,
    });

  const {
    data: group,
    isLoading: isLoadingGroup,
    isError: hasGroupError,
    refetch: refetchGroup,
  } = useResolveMeetupShareTokenQuery(shareToken, {
    pollingInterval: 5000,
  });

  const meetupUuid = group?.uuid || initialMeetupUuid || "";
  const participants = group?.participants ?? [];

  const {
    data: tally,
    isFetching: isFetchingTally,
    refetch: refetchTally,
  } = useGetMeetupVoteTallyQuery(meetupUuid, {
    skip: !meetupUuid,
    pollingInterval: 4000,
  });

  const [createRecommendationSession, { isLoading: isLoadingRecommendations }] =
    useCreateRecommendationSessionMutation();
  const [submitVote, { isLoading: isSubmittingVote }] =
    useSubmitMeetupVoteMutation();
  const [completeVoting, { isLoading: isCompleting }] =
    useCompleteMeetupVotingMutation();

  const [storedSession, setStoredSession] =
    useState<StoredMeetupSession | null>(null);
  const [recommendationSession, setRecommendationSession] =
    useState<RecommendationSession | null>(null);
  const [recommendationKey, setRecommendationKey] = useState("");
  const [recommendationError, setRecommendationError] = useState<string | null>(
    null,
  );
  const [selectedFoodUuid, setSelectedFoodUuid] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    setStoredSession(readStoredMeetupSession(shareToken));
  }, [shareToken]);

  const defaultProfileUuid = useMemo(() => {
    const profiles = profilePage?.contents ?? [];
    return (
      profiles.find((profile) => profile.isDefault && profile.isActive)?.uuid ||
      profiles.find((profile) => profile.isActive)?.uuid ||
      null
    );
  }, [profilePage?.contents]);

  const selectedRecommendationProfileUuid =
    storedSession?.profileUuid ||
    (storedSession?.joinMode === "FRIEND" ? defaultProfileUuid : null);

  const candidates = useMemo(() => {
    return (recommendationSession?.items ?? [])
      .map(toMeetupCandidate)
      .filter((candidate): candidate is MeetupCandidate => Boolean(candidate))
      .filter((candidate) => isSafeForParticipant(candidate, storedSession));
  }, [recommendationSession?.items, storedSession]);

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/meet/${shareToken}`
      : `/meet/${shareToken}`;
  const resultPath = buildResultLink(shareToken);
  const resultUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${resultPath}`
      : resultPath;

  const isHost =
    Boolean(
      backendUser?.id &&
        group?.createdByUserId &&
        backendUser.id === group.createdByUserId,
    ) ||
    participants.some(
      (participant) =>
        participant.uuid === storedSession?.participantUuid &&
        participant.participantRole === "HOST",
    );

  const participantCount = participants.length;
  const totalVotes = tally?.totalVotes ?? 0;

  useEffect(() => {
    if (!meetupUuid || !storedSession) {
      return;
    }

    if (
      storedSession.joinMode === "FRIEND" &&
      !selectedRecommendationProfileUuid &&
      isLoadingProfiles
    ) {
      return;
    }

    if (
      storedSession.joinMode === "FRIEND" &&
      !selectedRecommendationProfileUuid
    ) {
      setRecommendationError("No active FoodHub profile is available for recommendations.");
      return;
    }

    const nextKey = JSON.stringify({
      meetupUuid,
      participantUuid: storedSession.participantUuid,
      profileUuid: selectedRecommendationProfileUuid,
      guest: storedSession.joinMode === "GUEST" ? storedSession.profileSnapshot : null,
      locationMode: group?.locationMode,
      radius: group?.searchRadiusKm,
    });

    if (recommendationKey === nextKey) {
      return;
    }

    setRecommendationKey(nextKey);
    setRecommendationError(null);

    void createRecommendationSession({
      mode: "GROUP",
      requestSource: "MEETUP",
      requestedLimit: 12,
      searchRadiusKm: group?.searchRadiusKm ?? 3,
      currencyCode: "USD",
      contextData: {
        meetupUuid,
        shareToken,
        audienceMode: group?.audienceMode,
        locationMode: group?.locationMode,
        targetAreaName: group?.targetAreaName,
        targetCity: group?.targetCity,
        targetProvince: group?.targetProvince,
        targetLat: group?.targetLat,
        targetLng: group?.targetLng,
        participantUuid: storedSession.participantUuid,
        participantLocation:
          storedSession.locationMode === "PIN"
            ? {
                lat: storedSession.locationLat,
                lng: storedSession.locationLng,
              }
            : {
                areaName: storedSession.targetAreaName,
                city: storedSession.targetCity,
                province: storedSession.targetProvince,
              },
        profileSnapshot:
          storedSession.joinMode === "GUEST"
            ? storedSession.profileSnapshot
            : undefined,
      },
      profiles: selectedRecommendationProfileUuid
        ? [
            {
              profileId: selectedRecommendationProfileUuid,
              isPrimary: true,
            },
          ]
        : [],
    })
      .unwrap()
      .then((session) => {
        setRecommendationSession(session);
      })
      .catch((error) => {
        console.error("Meetup recommendation request failed:", error);
        setRecommendationError("FoodHub could not load safe recommendations for this meetup.");
      });
  }, [
    createRecommendationSession,
    group?.audienceMode,
    group?.locationMode,
    group?.searchRadiusKm,
    group?.targetAreaName,
    group?.targetCity,
    group?.targetLat,
    group?.targetLng,
    group?.targetProvince,
    isLoadingProfiles,
    meetupUuid,
    recommendationKey,
    selectedRecommendationProfileUuid,
    shareToken,
    storedSession,
  ]);

  const getVoteCount = (candidate: MeetupCandidate) => {
    const entry = tally?.tally.find(
      (item) =>
        item.foodUuid === candidate.foodUuid ||
        item.candidateUuid === candidate.foodUuid ||
        item.candidateUuid === candidate.candidateUuid,
    );

    return entry?.voteCount ?? 0;
  };

  const handleCopy = async (value: string, type: "invite" | "result") => {
    await navigator.clipboard.writeText(value);

    if (type === "invite") {
      setCopiedInvite(true);
      window.setTimeout(() => setCopiedInvite(false), 2200);
    } else {
      setCopiedResult(true);
      window.setTimeout(() => setCopiedResult(false), 2200);
    }
  };

  const handleVote = async (candidate: MeetupCandidate) => {
    if (!meetupUuid || !storedSession) {
      setActionError("Join this meetup before voting.");
      return;
    }

    setActionError(null);

    try {
      await submitVote({
        meetupUuid,
        participantUuid: storedSession.participantUuid,
        foodUuid: candidate.foodUuid,
        rankChoice: 1,
      }).unwrap();

      setSelectedFoodUuid(candidate.foodUuid);
      await refetchTally();
    } catch (error) {
      console.error("Meetup vote failed:", error);
      setActionError("FoodHub could not submit your vote.");
    }
  };

  const handleCompleteVoting = async () => {
    if (!meetupUuid) {
      return;
    }

    setActionError(null);

    try {
      await completeVoting(meetupUuid).unwrap();
      await Promise.all([refetchGroup(), refetchTally()]);
      router.push(resultPath);
    } catch (error) {
      console.error("Complete voting failed:", error);
      setActionError("FoodHub could not complete voting yet.");
    }
  };

  if (isLoadingGroup) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-emerald-600" />
        Loading meetup...
      </main>
    );
  }

  if (hasGroupError || !group) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 pt-24">
        <section className="mx-auto max-w-xl rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">
            Meetup not found
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            The invite link may be expired or unavailable.
          </p>
          <Link
            href="/meetup/create"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-black text-white"
          >
            Create meetup
          </Link>
        </section>
      </main>
    );
  }

  if (!storedSession && group.status !== "DECIDED") {
    return (
      <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-24 dark:bg-slate-950 sm:px-6">
        <GuestJoinSafetySheet
          shareToken={shareToken}
          meetupUuid={meetupUuid}
          meetupTitle={group.title || "FoodHub meetup"}
          audienceMode={group.audienceMode}
          guestAllowed={group.guestAllowed}
          locationMode={group.locationMode}
          targetAreaName={group.targetAreaName}
          targetCity={group.targetCity}
          targetProvince={group.targetProvince}
          onJoined={(session) => {
            setStoredSession(session);
            void refetchGroup();
          }}
        />
      </main>
    );
  }

  const isDecided = group.status === "DECIDED";

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-20 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl bg-linear-to-r from-emerald-800 to-teal-900 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-100">
                <Vote className="h-3.5 w-3.5" />
                {isDecided ? "Voting complete" : "Live voting"}
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                {group.title || "FoodHub dining meetup"}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-emerald-50/90">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {participantCount} joined
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {group.locationMode === "PIN"
                    ? `${group.searchRadiusKm ?? 3}km radius`
                    : [group.targetAreaName, group.targetCity, group.targetProvince]
                        .filter(Boolean)
                        .join(", ") || "Area meetup"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 text-sm font-bold text-white transition hover:bg-white/20"
              >
                <QrCode className="h-4 w-4" />
                QR
              </button>
              <button
                type="button"
                onClick={() => handleCopy(inviteUrl, "invite")}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-bold text-emerald-950 transition hover:bg-slate-100"
              >
                {copiedInvite ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                Invite
              </button>
              <button
                type="button"
                onClick={() => handleCopy(resultUrl, "result")}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-amber-300 px-4 text-sm font-bold text-emerald-950 transition hover:bg-amber-200"
              >
                {copiedResult ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Result
              </button>
            </div>
          </div>
        </section>

        {isDecided && (
          <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-800">
            Voting is complete.{" "}
            <Link href={resultPath} className="font-black underline">
              Open the result page
            </Link>
            .
          </section>
        )}

        {actionError && (
          <section className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {actionError}
          </section>
        )}

        <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Safe food choices
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Recommendations are loaded for the joined participant.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRecommendationKey("");
                  setRecommendationSession(null);
                }}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            {isLoadingRecommendations ? (
              <div className="flex min-h-64 items-center justify-center rounded-2xl bg-slate-50 text-sm font-semibold text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-emerald-600" />
                Loading recommendations...
              </div>
            ) : recommendationError ? (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm font-semibold text-rose-700">
                {recommendationError}
              </div>
            ) : candidates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm leading-6 text-slate-500">
                No safe matching foods are available yet. Refresh after more
                participants join or adjust the meetup constraints.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {candidates.map((candidate) => {
                  const voteCount = getVoteCount(candidate);
                  const selected = selectedFoodUuid === candidate.foodUuid;

                  return (
                    <article
                      key={`${candidate.foodUuid}-${candidate.candidateUuid}`}
                      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition dark:bg-slate-950 ${
                        selected
                          ? "border-emerald-500 ring-2 ring-emerald-500/15"
                          : "border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <div className="relative h-40 bg-slate-100 dark:bg-slate-800">
                        {candidate.photoUrl ? (
                          <img
                            src={candidate.photoUrl}
                            alt={candidate.foodName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            <Sparkles className="h-8 w-8" />
                          </div>
                        )}
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-black text-white shadow-sm">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Safe
                        </span>
                      </div>

                      <div className="space-y-4 p-4">
                        <div>
                          <h3 className="line-clamp-2 text-lg font-black text-slate-900 dark:text-white">
                            {candidate.foodName}
                          </h3>
                          <p className="mt-1 text-sm font-semibold text-[#F97316]">
                            {candidate.storeName}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs font-bold">
                          {candidate.price !== null && (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                              {candidate.currencyCode === "USD" ? "$" : candidate.currencyCode}
                              {candidate.price.toFixed(2)}
                            </span>
                          )}
                          {candidate.distanceKm !== null && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {candidate.distanceKm.toFixed(1)}km
                            </span>
                          )}
                          {candidate.finalScore !== null && (
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
                              Score {Math.round(candidate.finalScore)}
                            </span>
                          )}
                        </div>

                        {candidate.reasonText && (
                          <p className="line-clamp-3 text-sm leading-6 text-slate-500">
                            {candidate.reasonText}
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                          <span className="text-sm font-black text-emerald-700">
                            {voteCount} vote{voteCount === 1 ? "" : "s"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleVote(candidate)}
                            disabled={isSubmittingVote || isDecided}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isSubmittingVote ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : selected ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Vote className="h-4 w-4" />
                            )}
                            {selected ? "Voted" : "Vote"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Tally
                </h2>
                {isFetchingTally && (
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                )}
              </div>

              <div className="mt-4 space-y-3">
                {(tally?.tally ?? []).length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-950">
                    Waiting for votes.
                  </p>
                ) : (
                  tally?.tally.map((entry, index) => (
                    <div
                      key={`${entry.candidateUuid}-${index}`}
                      className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-black text-slate-800 dark:text-slate-200">
                          {entry.foodName || entry.candidateName || entry.candidateUuid}
                        </p>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-black text-emerald-700">
                          {entry.voteCount}
                        </span>
                      </div>
                      {entry.storeName && (
                        <p className="mt-1 truncate text-xs font-semibold text-slate-400">
                          {entry.storeName}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4 text-sm font-semibold text-slate-500 dark:border-slate-800">
                Total votes: {totalVotes}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Participants
              </h2>
              <div className="mt-4 space-y-2">
                {participants.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-950">
                    Waiting for participants.
                  </p>
                ) : (
                  participants.map((participant, index) => (
                    <div
                      key={participant.uuid || index}
                      className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-950"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-black text-white">
                        {(participant.nickname || "M").charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black text-slate-800 dark:text-slate-200">
                          {participant.nickname || `Member ${index + 1}`}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          {participant.participantRole === "HOST" ? "Host" : "Member"}
                        </span>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>

            {isHost && !isDecided && (
              <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Finish voting
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  The result link opens after the vote is complete.
                </p>
                <button
                  type="button"
                  onClick={handleCompleteVoting}
                  disabled={isCompleting}
                  className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-black text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
                >
                  {isCompleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trophy className="h-4 w-4" />
                  )}
                  Complete voting
                </button>
              </section>
            )}
          </aside>
        </section>
      </div>

      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="max-w-xs rounded-3xl bg-white p-6 text-center dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Scan to join
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Open this invite on another device.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 flex justify-center">
            <QRCodeSVG value={inviteUrl} size={200} />
          </div>
          <p className="truncate font-mono text-xs text-slate-400">
            {inviteUrl}
          </p>
        </DialogContent>
      </Dialog>
    </main>
  );
}
