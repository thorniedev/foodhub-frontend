"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
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
  Undo2,
  Users,
  Vote,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { useGetBackendUserQuery, useGetCurrentUserQuery } from "@/app/store/auth/currentUserApi";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useCompleteMeetupVotingMutation,
  useGetMeetupParticipantsQuery,
  useGetMeetupVoteTallyQuery,
  useGetMeetupVotesQuery,
  useResolveMeetupShareTokenQuery,
  useRetractMeetupVoteMutation,
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

/**
 * Turns an account-derived nickname into something readable. Emails are
 * reduced to their local part so the room never displays a full address.
 */
function toDisplayName(nickname: string | null, fallback: string): string {
  const trimmed = (nickname ?? "").trim();

  if (!trimmed) {
    return fallback;
  }

  const atIndex = trimmed.indexOf("@");
  const localPart = atIndex > 0 ? trimmed.slice(0, atIndex) : trimmed;

  return localPart.replace(/[._-]+/g, " ").trim() || fallback;
}

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
    item.foodUuid ||
    item.menuItemUuid ||
    getString(raw, [
      "foodUuid",
      "menuItemUuid",
      "menuItemUUID",
      "food_uuid",
      "menu_item_uuid",
    ]) ||
    getString(food, ["uuid", "foodUuid", "menuItemUuid"]) ||
    item.uuid;

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

  /*
   * The group payload normally carries participants. Some backend builds
   * return it empty, so the dedicated participants endpoint backs it up.
   */
  const { data: participantList } = useGetMeetupParticipantsQuery(meetupUuid, {
    skip: !meetupUuid,
    pollingInterval: 8000,
  });

  const allParticipants = group?.participants?.length
    ? group.participants
    : (participantList ?? []);

  /* LEFT and REMOVED participants stay out of the roster and the count. */
  const participants = allParticipants.filter(
    (participant) => (participant.status ?? "ACTIVE") === "ACTIVE",
  );

  const departedCount = allParticipants.length - participants.length;

  const {
    data: tally,
    isFetching: isFetchingTally,
    refetch: refetchTally,
  } = useGetMeetupVoteTallyQuery(meetupUuid, {
    skip: !meetupUuid,
    pollingInterval: 4000,
  });

  /*
   * Cast votes are read back from the server so a participant's own vote
   * survives a reload and so retracting one has a vote uuid to target.
   */
  const { data: votesResponse, refetch: refetchVotes } = useGetMeetupVotesQuery(
    meetupUuid,
    {
      skip: !meetupUuid,
      pollingInterval: 4000,
    },
  );

  const [createRecommendationSession, { isLoading: isLoadingRecommendations }] =
    useCreateRecommendationSessionMutation();
  const [submitVote, { isLoading: isSubmittingVote }] =
    useSubmitMeetupVoteMutation();
  const [retractVote, { isLoading: isRetractingVote }] =
    useRetractMeetupVoteMutation();
  const [completeVoting, { isLoading: isCompleting }] =
    useCompleteMeetupVotingMutation();

  const [storedSession, setStoredSession] =
    useState<StoredMeetupSession | null>(() =>
      readStoredMeetupSession(shareToken),
    );
  const [recommendationSession, setRecommendationSession] =
    useState<RecommendationSession | null>(null);
  const recommendationKeyRef = useRef("");
  const [recommendationRefreshKey, setRecommendationRefreshKey] = useState(0);
  const [recommendationError, setRecommendationError] = useState<string | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

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

  /*
   * The recommendation session must carry every profile in the room, not just
   * the viewer's. Guests contribute no profile; their constraints ride along
   * in contextData instead.
   */
  const meetupProfileUuids = useMemo(() => {
    const fromParticipants = participants
      .map((participant) => participant.profileUuid)
      .filter((profileUuid): profileUuid is string => Boolean(profileUuid));

    const ordered = selectedRecommendationProfileUuid
      ? [selectedRecommendationProfileUuid, ...fromParticipants]
      : fromParticipants;

    return Array.from(new Set(ordered));
  }, [participants, selectedRecommendationProfileUuid]);

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

  /* APPROVAL lets a participant back several dishes; SINGLE_PICK allows one. */
  const isApprovalVoting =
    (group?.votingMethod ?? "").toUpperCase() === "APPROVAL";

  const myVotes = useMemo(() => {
    const participantUuid = storedSession?.participantUuid;

    if (!participantUuid) {
      return [];
    }

    return (votesResponse?.votes ?? []).filter(
      (vote) => vote.participantUuid === participantUuid,
    );
  }, [votesResponse?.votes, storedSession?.participantUuid]);

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

  /* Display-only frontrunner; the host's complete-voting call decides. */
  const leadingFoodUuid = useMemo(() => {
    const leader = (tally?.tally ?? []).find((entry) => entry.isWinner);

    return leader?.foodUuid || leader?.candidateUuid || tally?.winnerUuid || null;
  }, [tally?.tally, tally?.winnerUuid]);
  /* No profile anywhere in the room means there is nothing safe to match on. */
  const missingGroupProfiles =
    meetupProfileUuids.length === 0 && !isLoadingProfiles;

  const effectiveRecommendationError =
    recommendationError ||
    (missingGroupProfiles
      ? "មិនមានប្រវត្តិរូប FoodHub សកម្មក្នុងបន្ទប់នេះទេ។ សូមឲ្យសមាជិកដែលមានគណនីចូលរួម ដើម្បីទទួលការណែនាំដែលមានសុវត្ថិភាព។"
      : null);

  useEffect(() => {
    if (!meetupUuid || !storedSession) {
      return;
    }

    if (isLoadingProfiles) {
      return;
    }

    /* Without at least one profile the backend has no safety set to apply. */
    if (meetupProfileUuids.length === 0) {
      return;
    }

    const nextKey = JSON.stringify({
      meetupUuid,
      participantUuid: storedSession.participantUuid,
      profileUuids: meetupProfileUuids,
      guest: storedSession.joinMode === "GUEST" ? storedSession.profileSnapshot : null,
      locationMode: group?.locationMode,
      radius: group?.searchRadiusKm,
    });

    if (recommendationKeyRef.current === nextKey) {
      return;
    }

    recommendationKeyRef.current = nextKey;

    void createRecommendationSession({
      /*
       * GROUP requires two or more distinct profiles; a room with one profile
       * must use SINGLE or the backend rejects the session.
       */
      mode: meetupProfileUuids.length >= 2 ? "GROUP" : "SINGLE",
      /*
       * "WEB" is the request source the backend accepts. The meetup marker
       * travels in contextData, which is free-form.
       */
      requestSource: "WEB",
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
      profiles: meetupProfileUuids.map((profileUuid, index) => ({
        profileId: profileUuid,
        isPrimary: index === 0,
      })),
    })
      .unwrap()
      .then((session) => {
        setRecommendationSession(session);
      })
      .catch((error) => {
        console.error("Meetup recommendation request failed:", error);
        setRecommendationError("FoodHub មិនអាចផ្ទុកការណែនាំដែលមានសុវត្ថិភាពសម្រាប់ការណាត់ជួបនេះបានទេ។");
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
    meetupProfileUuids,
    meetupUuid,
    recommendationRefreshKey,
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
      setActionError("សូមចូលរួមការណាត់ជួបមុននឹងបោះឆ្នោត។");
      return;
    }

    setActionError(null);

    const existingVoteUuid = myVoteUuidByFoodUuid.get(candidate.foodUuid);

    try {
      if (existingVoteUuid) {
        /* Tapping a dish already backed by this participant retracts it. */
        await retractVote({ voteUuid: existingVoteUuid, meetupUuid }).unwrap();
      } else {
        if (!isApprovalVoting) {
          /*
           * SINGLE_PICK allows one vote, so clear the previous one first.
           * A backend that replaces the vote itself makes this a no-op, so a
           * failure here must not block the new vote.
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
          participantUuid: storedSession.participantUuid,
          foodUuid: candidate.foodUuid,
          rankChoice: 1,
        }).unwrap();
      }

      await Promise.all([refetchVotes(), refetchTally()]);
    } catch (error: unknown) {
      console.error("Meetup vote failed:", error);
      setActionError(
        getApiErrorMessage(error, "FoodHub មិនអាចកែសំឡេងរបស់អ្នកបានទេ។"),
      );
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
      setActionError("FoodHub មិនទាន់អាចបញ្ចប់ការបោះឆ្នោតបានទេ។");
    }
  };

  if (isLoadingGroup) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary-600" />
        កំពុងផ្ទុកការណាត់ជួប...
      </main>
    );
  }

  if (hasGroupError || !group) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 pt-24">
        <section className="mx-auto max-w-xl rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-sm">
          <p className="text-2xl font-black text-slate-900">
            រកមិនឃើញការណាត់ជួប
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            តំណអញ្ជើញអាចផុតកំណត់ ឬមិនអាចប្រើបាន។
          </p>
          <Link
            href="/meetup/create"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl bg-primary-600 px-5 text-sm font-black text-white"
          >
            បង្កើតការណាត់ជួប
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
  const isCancelled = group.status === "CANCELLED";

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-20 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl bg-linear-to-r from-primary-800 to-primary-950 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-bold uppercase tracking-wide text-primary-100">
                <Vote className="h-3.5 w-3.5" />
                {isDecided
                  ? "បោះឆ្នោតរួចរាល់"
                  : isCancelled
                    ? "បានលុបចោល"
                    : "កំពុងបោះឆ្នោត"}
              </div>
              <p className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                {group.title || "ការណាត់ញ៉ាំអាហារ FoodHub"}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-primary-50/90">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {participantCount} នាក់ចូលរួម
                  {departedCount > 0 ? ` · ចាកចេញ ${departedCount}` : ""}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {group.locationMode === "PIN"
                    ? `ជុំវិញ ${group.searchRadiusKm ?? 3} គ.ម`
                    : [group.targetAreaName, group.targetCity, group.targetProvince]
                        .filter(Boolean)
                        .join(", ") || "តាមតំបន់"}
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
                QR កូដ
              </button>
              <button
                type="button"
                onClick={() => handleCopy(inviteUrl, "invite")}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-bold text-primary-950 transition hover:bg-slate-100"
              >
                {copiedInvite ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                អញ្ជើញ
              </button>
              <button
                type="button"
                onClick={() => handleCopy(resultUrl, "result")}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-accent-300 px-4 text-sm font-bold text-primary-950 transition hover:bg-accent-200"
              >
                {copiedResult ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                លទ្ធផល
              </button>
            </div>
          </div>
        </section>

        {isDecided && (
          <section className="rounded-3xl border border-accent-200 bg-accent-50 p-5 text-sm font-semibold text-accent-800">
            ការបោះឆ្នោតបានបញ្ចប់។{" "}
            <Link href={resultPath} className="font-black underline">
              បើកទំព័រលទ្ធផល
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
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  ម្ហូបដែលមានសុវត្ថិភាព
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  ការណែនាំត្រូវបានផ្ទុកតាមអ្នកចូលរួមដែលបានចូល។
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  recommendationKeyRef.current = "";
                  setRecommendationError(null);
                  setRecommendationSession(null);
                  setRecommendationRefreshKey((current) => current + 1);
                }}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
              >
                <RefreshCw className="h-4 w-4" />
                ផ្ទុកឡើងវិញ
              </button>
            </div>

            {isLoadingRecommendations ? (
              <div className="flex min-h-64 items-center justify-center rounded-2xl bg-slate-50 text-sm font-semibold text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary-600" />
                កំពុងផ្ទុកការណែនាំ...
              </div>
            ) : effectiveRecommendationError ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center dark:border-rose-900/40 dark:bg-rose-950/20">
                <p className="max-w-md text-sm font-semibold leading-6 text-rose-700 dark:text-rose-300 lg:text-base">
                  {effectiveRecommendationError}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    recommendationKeyRef.current = "";
                    setRecommendationError(null);
                    setRecommendationSession(null);
                    setRecommendationRefreshKey((current) => current + 1);
                  }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-50 dark:bg-slate-900 dark:text-rose-300 dark:ring-rose-900"
                >
                  <RefreshCw className="h-4 w-4 shrink-0" />
                  ព្យាយាមម្តងទៀត
                </button>
              </div>
            ) : candidates.length === 0 ? (
              <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm leading-6 text-slate-500 dark:border-slate-700">
                មិនទាន់មានម្ហូបដែលមានសុវត្ថិភាពត្រូវនឹងលក្ខខណ្ឌទេ។
                សូមផ្ទុកឡើងវិញបន្ទាប់ពីមានអ្នកចូលរួមបន្ថែម។
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {candidates.map((candidate) => {
                  const voteCount = getVoteCount(candidate);
                  const selected = myVoteUuidByFoodUuid.has(candidate.foodUuid);
                  const isLeading =
                    voteCount > 0 && candidate.foodUuid === leadingFoodUuid;

                  return (
                    <article
                      key={`${candidate.foodUuid}-${candidate.candidateUuid}`}
                      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition dark:bg-slate-950 ${
                        selected
                          ? "border-primary-500 ring-2 ring-primary-500/15"
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
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary-600 px-2.5 py-1 text-sm font-black text-white shadow-sm">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          សុវត្ថិភាព
                        </span>
                        {isLeading && (
                          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent-300 px-2.5 py-1 text-sm font-black text-primary-950 shadow-sm">
                            <Trophy className="h-3.5 w-3.5" />
                            នាំមុខ
                          </span>
                        )}
                      </div>

                      <div className="space-y-4 p-4">
                        <div>
                          <p className="line-clamp-2 text-lg font-black text-slate-900 dark:text-white">
                            {candidate.foodName}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-secondary-500">
                            {candidate.storeName}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 text-sm font-bold">
                          {candidate.price !== null && (
                            <span className="rounded-full bg-primary-50 px-2.5 py-1 text-primary-700">
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
                            <span className="rounded-full bg-accent-50 px-2.5 py-1 text-accent-700">
                              ពិន្ទុ {Math.round(candidate.finalScore)}
                            </span>
                          )}
                        </div>

                        {candidate.reasonText && (
                          <p className="line-clamp-3 text-sm leading-6 text-slate-500">
                            {candidate.reasonText}
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                          <span className="text-sm font-black text-primary-700">
                            {voteCount} vote{voteCount === 1 ? "" : "s"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleVote(candidate)}
                            disabled={
                              isSubmittingVote || isRetractingVote || isDecided
                            }
                            aria-pressed={selected}
                            aria-label={
                              selected
                                ? `ដកសំឡេងសម្រាប់ ${candidate.foodName}`
                                : `បោះឆ្នោតឲ្យ ${candidate.foodName}`
                            }
                            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              selected
                                ? "border border-primary-600 bg-white text-primary-700 hover:bg-primary-50 dark:bg-slate-950 dark:hover:bg-slate-900"
                                : "bg-primary-600 text-white hover:bg-primary-700"
                            }`}
                          >
                            {isSubmittingVote || isRetractingVote ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : selected ? (
                              <Undo2 className="h-4 w-4" />
                            ) : (
                              <Vote className="h-4 w-4" />
                            )}
                            {selected ? "ដកសំឡេង" : "បោះឆ្នោត"}
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
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  លទ្ធផលបោះឆ្នោត
                </p>
                {isFetchingTally && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                )}
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-400">
                {isApprovalVoting
                  ? "បោះឆ្នោតបែបយល់ព្រម — អាចជ្រើសរើសម្ហូបច្រើនមុខ។"
                  : "ម្នាក់មួយសំឡេង — បោះម្ដងទៀតនឹងផ្លាស់ប្ដូរសំឡេង។"}
              </p>

              <div className="mt-4 space-y-3">
                {(tally?.tally ?? []).length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-950">
                    កំពុងរង់ចាំសំឡេងបោះឆ្នោត។
                  </p>
                ) : (
                  tally?.tally.map((entry, index) => (
                    <div
                      key={`${entry.candidateUuid}-${index}`}
                      className={`rounded-2xl p-3 ${
                        entry.isWinner
                          ? "bg-accent-50 ring-1 ring-accent-200 dark:bg-accent-950/30 dark:ring-accent-900"
                          : "bg-slate-50 dark:bg-slate-950"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="flex min-w-0 items-center gap-1.5 truncate text-sm font-black text-slate-800 dark:text-slate-200">
                          {entry.isWinner && (
                            <Trophy className="h-3.5 w-3.5 shrink-0 text-accent-500" />
                          )}
                          <span className="truncate">
                            {entry.foodName ||
                              entry.candidateName ||
                              entry.candidateUuid}
                          </span>
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-sm font-black ${
                            entry.isWinner
                              ? "bg-accent-200 text-accent-900"
                              : "bg-primary-100 text-primary-700"
                          }`}
                        >
                          {entry.voteCount}
                        </span>
                      </div>
                      {entry.storeName && (
                        <p className="mt-1 truncate text-sm font-semibold text-slate-400">
                          {entry.storeName}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4 text-sm font-semibold text-slate-500 dark:border-slate-800">
                សំឡេងសរុប៖ {totalVotes}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-lg font-black text-slate-900 dark:text-white">
                អ្នកចូលរួម
              </p>
              <div className="mt-4 space-y-2">
                {participants.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-950">
                    កំពុងរង់ចាំអ្នកចូលរួម។
                  </p>
                ) : (
                  participants.map((participant, index) => (
                    <div
                      key={participant.uuid || index}
                      className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-950"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-black text-white">
                        {toDisplayName(participant.nickname, "?")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black capitalize text-slate-800 dark:text-slate-200">
                          {toDisplayName(
                            participant.nickname,
                            `សមាជិក ${index + 1}`,
                          )}
                        </span>
                        <span className="text-sm font-semibold text-slate-400">
                          {participant.participantRole === "HOST"
                            ? "ម្ចាស់ផ្ទះ"
                            : participant.participantRole === "GUEST"
                              ? "ភ្ញៀវ"
                              : "សមាជិក"}
                          {participant.locationLat !== null &&
                          participant.locationLng !== null
                            ? " · បានចែករំលែកទីតាំង"
                            : ""}
                        </span>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>

            {isHost && !isDecided && !isCancelled && (
              <section className="rounded-3xl border border-primary-200 bg-primary-50 p-5 dark:border-primary-900 dark:bg-primary-950/30">
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  បញ្ចប់ការបោះឆ្នោត
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  តំណលទ្ធផលនឹងបើកបន្ទាប់ពីការបោះឆ្នោតបញ្ចប់។
                </p>
                <button
                  type="button"
                  onClick={handleCompleteVoting}
                  disabled={isCompleting}
                  className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 text-sm font-black text-white shadow-md transition hover:bg-primary-700 disabled:cursor-wait disabled:opacity-60"
                >
                  {isCompleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trophy className="h-4 w-4" />
                  )}
                  បញ្ចប់ការបោះឆ្នោត
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
              ស្កេនដើម្បីចូលរួម
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              បើកតំណអញ្ជើញនេះនៅលើឧបករណ៍ផ្សេង។
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 flex justify-center">
            <QRCodeSVG value={inviteUrl} size={200} />
          </div>
          <p className="truncate font-mono text-sm text-slate-400">
            {inviteUrl}
          </p>
        </DialogContent>
      </Dialog>
    </main>
  );
}
