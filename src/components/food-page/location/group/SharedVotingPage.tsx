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

import type { GroupMember, GroupVote, SharedGroupSession } from "@/types/group-recommendation";

import VotingLeaderboard from "./VotingLeaderboard";
import VotingResult from "./VotingResult";

interface SharedVotingPageProps {
  /** The share token from the URL — resolves to a meetup group via GET /meetup/groups/share/{token} */
  inviteCode: string;
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

  // 2. Poll votes for the meetup
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
    return (votesResponse?.votes ?? []).map((v) => ({
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

  // We need a list of candidate stores. On the shared voting page we only
  // know the stores that people have already voted for, plus the group data.
  // The winning candidate is derived from the tally.
  // NOTE: stores for display come from votes — show all voted-on stores.
  const candidateStoreUuids = useMemo(() => {
    const uuids = new Set<string>();
    for (const vote of mappedVotes) {
      if (vote.storeUuid) uuids.add(vote.storeUuid);
    }
    return [...uuids];
  }, [mappedVotes]);

  const session = useMemo((): SharedGroupSession | null => {
    if (!group) return null;

    // Build minimal store objects from voted-on UUIDs so the leaderboard can render.
    // Without full store details (name, rating), we show UUIDs — this is a limitation
    // until a store lookup endpoint is integrated.
    const storeObjects = candidateStoreUuids.map((uuid) => ({
      uuid,
      name: uuid.slice(0, 8) + "…",
      localName: null,
      description: "",
      addressLine: "",
      commune: "",
      district: "",
      city: "",
      province: "",
      latitude: 0,
      longitude: 0,
      phoneNumber: null,
      email: null,
      logoUrl: null,
      coverImageUrl: null,
      priceLevel: null,
      averageRating: 0,
      totalReviews: 0,
      operatingStatus: "OPEN" as const,
      isOpenNow: false,
      deliveryAvailable: false,
      pickupAvailable: false,
      menuItems: [],
      menuCount: 0,
      matchingMenuCount: 0,
      distanceKm: 0,
      recommendationScore: 0,
      voteCount: mappedVotes.filter((v) => v.storeUuid === uuid).length,
    }));

    return {
      inviteCode,
      groupName: group.title ?? "FoodHub Group",
      status: winnerStoreUuid ? "COMPLETED" : "VOTING",
      members: groupMembers,
      stores: storeObjects,
      votes: mappedVotes,
      winnerStoreUuid,
      createdAt: group.createdAt ?? new Date().toISOString(),
      updatedAt: group.updatedAt ?? new Date().toISOString(),
    };
  }, [
    candidateStoreUuids,
    group,
    groupMembers,
    inviteCode,
    mappedVotes,
    winnerStoreUuid,
  ]);

  const winner = useMemo(() => {
    if (!session?.winnerStoreUuid || session.status !== "COMPLETED") return null;
    return session.stores.find((s) => s.uuid === session.winnerStoreUuid) ?? null;
  }, [session]);

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

  if (session.status === "COMPLETED" && winner) {
    return (
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <VotingResult
          winner={winner}
          winnerVoteCount={winnerVoteCount}
          memberCount={session.members.length}
          shareUrl={shareUrl}
          onRestart={() => router.push("/food")}
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
        canFinish={false}
        isSubmittingVote={isSubmittingVote}
        onVote={(storeUuid) => void handleVote(storeUuid)}
        onClose={() => router.push("/food")}
      />
    </main>
  );
}
