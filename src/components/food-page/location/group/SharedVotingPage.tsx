"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  IoArrowForwardOutline,
  IoPeopleOutline,
  IoSparklesOutline,
} from "react-icons/io5";

import {
  useGetMockGroupSessionQuery,
  useJoinMockGroupSessionMutation,
  useSubmitMockGroupVoteMutation,
} from "@/app/store/groupRecommendationApi";

import VotingLeaderboard from "./VotingLeaderboard";
import VotingResult from "./VotingResult";

interface SharedVotingPageProps {
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

export default function SharedVotingPage({
  inviteCode,
}: SharedVotingPageProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [participantToken, setParticipantToken] = useState<string | null>(null);
  const [participantUuid, setParticipantUuid] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);

  const tokenStorageKey = `foodhub-vote-token-${inviteCode}`;
  const uuidStorageKey = `foodhub-vote-member-${inviteCode}`;

  useEffect(() => {
    setShareUrl(window.location.href);

    setParticipantToken(window.localStorage.getItem(tokenStorageKey));

    setParticipantUuid(window.localStorage.getItem(uuidStorageKey));
  }, [tokenStorageKey, uuidStorageKey]);

  const {
    data: session,
    isLoading,
    isError,
    error: sessionError,
    refetch,
  } = useGetMockGroupSessionQuery(inviteCode, {
    pollingInterval: 3_000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [joinSession, { isLoading: isJoining }] =
    useJoinMockGroupSessionMutation();

  const [submitVote, { isLoading: isSubmittingVote }] =
    useSubmitMockGroupVoteMutation();

  const winner = useMemo(() => {
    if (!session?.winnerStoreUuid) {
      return null;
    }

    return (
      session.stores.find((store) => store.uuid === session.winnerStoreUuid) ??
      null
    );
  }, [session]);

  const winnerVoteCount = useMemo(() => {
    if (!winner || !session) {
      return 0;
    }

    return session.votes.filter((vote) => vote.storeUuid === winner.uuid)
      .length;
  }, [session, winner]);

  const handleJoin = async () => {
    const cleanName = name.trim();

    if (!cleanName) {
      setJoinError("Please enter your name.");
      return;
    }

    try {
      setJoinError(null);

      const result = await joinSession({
        inviteCode,
        name: cleanName,
      }).unwrap();

      window.localStorage.setItem(tokenStorageKey, result.participantToken);

      window.localStorage.setItem(uuidStorageKey, result.participantUuid);

      setParticipantToken(result.participantToken);
      setParticipantUuid(result.participantUuid);
    } catch (error) {
      setJoinError(getErrorMessage(error));
    }
  };

  const handleVote = async (storeUuid: string) => {
    if (!participantToken) {
      return;
    }

    try {
      setVoteError(null);

      await submitVote({
        inviteCode,
        participantToken,
        storeUuid,
      }).unwrap();

      void refetch();
    } catch (error) {
      setVoteError(getErrorMessage(error));
    }
  };

  if (isLoading) {
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

  if (isError || !session) {
    return (
      <main className="flex min-h-[70dvh] items-center justify-center px-4 py-10">
        <section className="w-full max-w-xl rounded-[28px] border border-red-100 bg-white p-6 text-center shadow-sm sm:p-8">
          <h1 className="text-[23px] font-bold text-primary-900 sm:text-[25px]">
            Voting session unavailable
          </h1>

          <p className="mt-3 text-[17px] leading-7 text-gray-600">
            {getErrorMessage(sessionError)} The temporary server may have
            restarted.
          </p>

          <button
            type="button"
            onClick={() => void refetch()}
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

  if (!participantToken || !participantUuid) {
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
              Enter the same name your friend used when adding you to the group,
              then choose your favorite restaurant.
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
              value={name}
              onChange={(event) => setName(event.target.value)}
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
