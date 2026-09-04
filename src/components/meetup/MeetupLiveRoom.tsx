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
import GuestJoinSafetySheet from "./GuestJoinSafetySheet";
import MeetupCandidateCard from "./MeetupCandidateCard";
import MeetupParticipantsPanel, {
  toDisplayName,
} from "./MeetupParticipantsPanel";
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
      ? "មិនមានប្រវត្តិរូប FoodHub សកម្មសម្រាប់បង្កើតបញ្ជីម្ហូបទេ។ សូមចូលគណនី ឬឲ្យសមាជិកដែលមានគណនីបើកបន្ទប់នេះ។"
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

  const groupContext = useMemo(
    () => ({
      audienceMode: group?.audienceMode,
      locationMode: group?.locationMode,
      targetAreaName: group?.targetAreaName,
      targetCity: group?.targetCity,
      targetProvince: group?.targetProvince,
      targetLat: group?.targetLat,
      targetLng: group?.targetLng,
      searchRadiusKm: group?.searchRadiusKm ?? 5,
    }),
    [group],
  );

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
            "FoodHub មិនអាចផ្ទុកបញ្ជីម្ហូបសម្រាប់ការណាត់ជួបនេះបានទេ។ សូមចុច ផ្ទុកឡើងវិញ។",
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
      return "គ្មានម្ហូបណាឆ្លងកាត់ច្បាប់អាឡែស៊ី និងរបបអាហាររបស់សមាជិកទាំងអស់ក្នុងបន្ទប់នេះទេ។ សូមពិនិត្យប្រវត្តិរូបសមាជិក ឬបន្ថែមម្ហូបក្នុងបញ្ជី។";
    }

    if (!recommendationSession) {
      return "មិនទាន់មានម្ហូបសម្រាប់បន្ទប់នេះទេ។ សូមចុច ផ្ទុកឡើងវិញ។";
    }

    const candidateCount = recommendationSession.candidateCount ?? 0;
    const eligibleCount = recommendationSession.eligibleCount ?? 0;

    if (candidateCount === 0) {
      return "រកមិនឃើញម្ហូបក្នុងបញ្ជីសម្រាប់តំបន់ និងរង្វង់ស្វែងរកនេះទេ។ សូមពង្រីករង្វង់ស្វែងរក ឬប្ដូរទីតាំង។";
    }

    if (eligibleCount === 0) {
      return `រកឃើញម្ហូប ${candidateCount} មុខ ប៉ុន្តែគ្មានមុខណាឆ្លងកាត់ច្បាប់អាឡែស៊ី និងរបបអាហាររបស់សមាជិកទាំងអស់ទេ។ សូមពិនិត្យប្រវត្តិរូបសមាជិក ឬដកសមាជិកដែលមានលក្ខខណ្ឌតឹងរ៉ឹងបំផុត។`;
    }

    return "ម្ហូបដែលឆ្លងកាត់សុវត្ថិភាព មិនមានព័ត៌មានម្ហូបគោលដើម្បីបោះឆ្នោតបានទេ។ សូមទាក់ទងអ្នកគ្រប់គ្រងបញ្ជីម្ហូប។";
  }, [recommendationSession, shareToken]);

  const getVoteCount = useCallback(
    (candidate: MeetupCandidate) =>
      (tally?.tally ?? []).find(
        (entry) =>
          entry.foodUuid === candidate.foodUuid ||
          entry.candidateUuid === candidate.foodUuid,
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

  const handleVote = async (candidate: MeetupCandidate) => {
    if (!meetupUuid || !activeSession) {
      setActionError("សូមចូលរួមការណាត់ជួបមុននឹងបោះឆ្នោត។");
      return;
    }

    setActionError(null);
    setVotingFoodUuid(candidate.foodUuid);

    const existingVoteUuid = myVoteUuidByFoodUuid.get(candidate.foodUuid);

    try {
      if (existingVoteUuid) {
        /* Tapping a dish already backed by this participant retracts it. */
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
          /* The vote endpoint resolves canonical foods only. */
          foodUuid: candidate.foodUuid,
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
    setRecommendationError(null);

    if (shareToken) {
      void refetchSharedCandidates();
      return;
    }

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
                  <Utensils className="h-5 w-5 shrink-0 text-primary-600" />
                  ជ្រើសរើសម្ហូប
                </h2>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  បញ្ជីតែមួយសម្រាប់អ្នកគ្រប់គ្នាក្នុងបន្ទប់នេះ។
                </p>
              </div>
              <button
                type="button"
                onClick={handleRefreshRecommendations}
                disabled={isSlateLoading}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isSlateLoading ? "animate-spin" : ""}`}
                />
                ផ្ទុកឡើងវិញ
              </button>
            </div>

            {slate.hiddenForAllergies > 0 && (
              <p className="flex items-start gap-2 rounded-2xl border border-accent-200 bg-accent-50 px-4 py-3 text-sm font-semibold leading-6 text-accent-800 dark:border-accent-900 dark:bg-accent-950/30 dark:text-accent-200">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                បានលាក់ម្ហូប {slate.hiddenForAllergies} មុខ
                ព្រោះមានធាតុផ្សំដែលអ្នកបានរាយថាមានអាឡែស៊ី។
              </p>
            )}

            {isSlateLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <CandidateSkeleton />
                <CandidateSkeleton />
                <CandidateSkeleton />
              </div>
            ) : effectiveRecommendationError ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center dark:border-rose-900/40 dark:bg-rose-950/20">
                <ChefHat className="h-9 w-9 text-rose-400" />
                <p className="max-w-md text-sm font-semibold leading-6 text-rose-700 dark:text-rose-300">
                  {effectiveRecommendationError}
                </p>
                <button
                  type="button"
                  onClick={handleRefreshRecommendations}
                  className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-50 dark:bg-slate-900 dark:text-rose-300 dark:ring-rose-900"
                >
                  <RefreshCw className="h-4 w-4 shrink-0" />
                  ព្យាយាមម្តងទៀត
                </button>
              </div>
            ) : slate.candidates.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                <ChefHat className="h-9 w-9 text-slate-300 dark:text-slate-600" />
                <p className="max-w-md text-sm leading-6 text-slate-500">
                  {emptySlateReason}
                </p>
                {/*
                  * The session reports how far the funnel got. Showing it turns
                  * a dead end into something the host can act on.
                  */}
                {recommendationSession && (
                  <p className="text-xs font-semibold text-slate-400">
                    ម្ហូបដែលរកឃើញ {recommendationSession.candidateCount ?? 0} ·
                    ឆ្លងកាត់សុវត្ថិភាព {recommendationSession.eligibleCount ?? 0}
                  </p>
                )}

                {blockingMembers.length > 0 && (
                  <div className="w-full max-w-sm space-y-1.5 rounded-2xl bg-slate-50 p-3 text-left dark:bg-slate-950/60">
                    <p className="text-xs font-black text-slate-600 dark:text-slate-300">
                      ច្បាប់សុវត្ថិភាពដែលបានហាមឃាត់
                    </p>
                    {blockingMembers.map((member) => (
                      <p
                        key={member.profileId}
                        className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500"
                      >
                        <span className="truncate capitalize">{member.name}</span>
                        <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 font-black text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                          {member.blockedCount}
                        </span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {slate.candidates.map((candidate) => (
                  <MeetupCandidateCard
                    key={candidate.foodUuid}
                    candidate={candidate}
                    voteCount={getVoteCount(candidate)}
                    totalVotes={totalVotes}
                    isSelected={myVoteUuidByFoodUuid.has(candidate.foodUuid)}
                    isLeading={candidate.foodUuid === leadingFoodUuid}
                    isBusy={votingFoodUuid === candidate.foodUuid}
                    isLocked={isVotingClosed || votingFoodUuid !== null}
                    onVote={handleVote}
                  />
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <MeetupTallyPanel
              tally={tally?.tally ?? []}
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
                  ម្ហូបដែលមានសំឡេងច្រើនជាងគេនឹងក្លាយជាលទ្ធផលចុងក្រោយ។
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
