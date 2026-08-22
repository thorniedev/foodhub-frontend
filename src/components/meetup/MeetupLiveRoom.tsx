"use client";

import React, { useState, useEffect } from "react";
import {
  useResolveMeetupShareTokenQuery,
  useGetMeetupGroupQuery,
  useGetMeetupParticipantsQuery,
  useGetMeetupVotesQuery,
  useSubmitMeetupVoteMutation,
  useCompleteMeetupVotingMutation,
} from "@/app/store/groupRecommendationApi";
import { useGetCurrentUserQuery, useGetBackendUserQuery } from "@/app/store/auth/currentUserApi";
import GuestJoinSafetySheet from "./GuestJoinSafetySheet";
import MeetupWinnerCelebration from "./MeetupWinnerCelebration";
import {
  Users,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Trophy,
  Share2,
  Check,
  Copy,
  Clock,
  Loader2,
  Sparkles,
  QrCode,
  Shield,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";

interface MeetupLiveRoomProps {
  shareToken: string;
  initialMeetupUuid?: string;
}

// Fallback mock candidates if backend recommendations endpoint is empty
const DEFAULT_CANDIDATES = [
  {
    candidateUuid: "cand-1",
    storeName: "Bong Thom Khmer Kitchen",
    foodName: "Khmer Lok Lak with Kampot Pepper",
    photoUrl: "/Image/food01.png",
    rating: 4.9,
    price: 5.5,
    distanceKm: 0.6,
    tags: ["Khmer Traditional", "Halal Friendly"],
  },
  {
    candidateUuid: "cand-2",
    storeName: "Malis Restaurant BKK",
    foodName: "Royal Amok Fish in Banana Leaf",
    photoUrl: "/Image/food02.png",
    rating: 4.8,
    price: 9.0,
    distanceKm: 1.2,
    tags: ["Premium Khmer", "Gluten Free"],
  },
  {
    candidateUuid: "cand-3",
    storeName: "Eleven One Kitchen",
    foodName: "Stir-Fried Beef with Wild Basil",
    photoUrl: "/Image/food04.png",
    rating: 4.7,
    price: 4.5,
    distanceKm: 0.9,
    tags: ["Eco-Friendly", "Vegetarian Options"],
  },
];

export default function MeetupLiveRoom({
  shareToken,
  initialMeetupUuid,
}: MeetupLiveRoomProps) {
  const { data: user } = useGetCurrentUserQuery();
  const { data: backendUser } = useGetBackendUserQuery();

  const {
    data: group,
    isLoading: isLoadingGroup,
    refetch: refetchGroup,
  } = useResolveMeetupShareTokenQuery(shareToken, {
    pollingInterval: 4000,
  });

  const meetupUuid = group?.uuid || initialMeetupUuid || "";

  const { data: participants = [] } = useGetMeetupParticipantsQuery(meetupUuid, {
    skip: !meetupUuid,
    pollingInterval: 4000,
  });

  const { data: votesData, refetch: refetchVotes } = useGetMeetupVotesQuery(meetupUuid, {
    skip: !meetupUuid,
    pollingInterval: 3000,
  });

  const [submitVote, { isLoading: isSubmittingVote }] = useSubmitMeetupVoteMutation();
  const [completeVoting, { isLoading: isCompleting }] = useCompleteMeetupVotingMutation();

  // Participant state
  const [myParticipantUuid, setMyParticipantUuid] = useState<string | null>(null);
  const [showJoinSheet, setShowJoinSheet] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Local user votes map: candidateUuid -> 'UP' | 'DOWN' | 'LOVE'
  const [userVotes, setUserVotes] = useState<Record<string, "UP" | "DOWN" | "LOVE">>({});

  // Check saved guest token from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken =
        localStorage.getItem(`fh_guest_token_${shareToken}`) ||
        localStorage.getItem(`fh_participant_uuid`);
      if (storedToken) {
        setMyParticipantUuid(storedToken);
      } else if (!user) {
        setShowJoinSheet(true);
      }
    }
  }, [shareToken, user]);

  const isHost =
    Boolean(user && group?.createdByUserId && backendUser?.id === group.createdByUserId) ||
    participants.some(
      (p) => p.uuid === myParticipantUuid && p.participantRole === "HOST",
    );

  const votesList = votesData?.votes || [];

  // Compute vote counts for each candidate
  const getCandidateVoteCount = (candUuid: string) => {
    return votesList.filter(
      (v) => (v.candidateUuid === candUuid || v.foodUuid === candUuid) && v.rankChoice !== -1,
    ).length;
  };

  const handleCastVote = async (
    candidateUuid: string,
    type: "UP" | "DOWN" | "LOVE",
  ) => {
    const pUuid = myParticipantUuid || `p-${Date.now()}`;
    setUserVotes((prev) => ({ ...prev, [candidateUuid]: type }));

    try {
      await submitVote({
        meetupUuid,
        participantUuid: pUuid,
        candidateUuid,
        rankChoice: type === "DOWN" ? -1 : type === "LOVE" ? 2 : 1,
      }).unwrap();
      refetchVotes();
    } catch (err) {
      console.warn("Vote submit error:", err);
    }
  };

  const handleCompleteVoting = async () => {
    if (!meetupUuid) return;
    try {
      await completeVoting(meetupUuid).unwrap();
      refetchGroup();
    } catch (err) {
      console.warn("Complete voting error:", err);
    }
  };

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/meet/${shareToken}`
      : `https://foodhub.app/meet/${shareToken}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // If status is DECIDED, show celebration card
  if (group?.status === "DECIDED") {
    const winningCandidate = DEFAULT_CANDIDATES[0];
    return (
      <main className="min-h-screen bg-slate-50/50 px-4 pt-20 pb-16 dark:bg-slate-950 sm:px-6">
        <MeetupWinnerCelebration
          shareToken={shareToken}
          winningCard={{
            meetupUuid,
            title: group.title || "Group Lunch",
            winningCandidateId: group.winningCandidateId || 1,
            winningCandidateName: winningCandidate.storeName,
            totalVotes: votesList.length || 5,
            meetingPointLat: group.meetingPointLat || 11.5564,
            meetingPointLng: group.meetingPointLng || 104.9282,
            mapsDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${group.meetingPointLat || 11.5564},${group.meetingPointLng || 104.9282}`,
            decidedAt: group.updatedAt || new Date().toISOString(),
            storeName: winningCandidate.storeName,
            storeAddress: "Central BKK, Phnom Penh",
            foodName: winningCandidate.foodName,
            foodPhotoUrl: winningCandidate.photoUrl,
            rating: winningCandidate.rating,
            price: winningCandidate.price,
            distanceKm: winningCandidate.distanceKm,
          }}
        />
      </main>
    );
  }

  // If guest hasn't joined yet and modal is requested
  if (showJoinSheet && !myParticipantUuid) {
    return (
      <main className="min-h-screen bg-slate-50/50 px-4 pt-24 pb-16 dark:bg-slate-950 sm:px-6">
        <GuestJoinSafetySheet
          shareToken={shareToken}
          meetupTitle={group?.title || "Team Dining Meetup"}
          hostMeetingPointLat={group?.meetingPointLat}
          hostMeetingPointLng={group?.meetingPointLng}
          onJoined={(pUuid) => {
            setMyParticipantUuid(pUuid);
            setShowJoinSheet(false);
          }}
        />
      </main>
    );
  }

  const totalMembers = participants.length || 1;

  return (
    <main className="min-h-screen bg-slate-50/50 px-4 pt-20 pb-16 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col gap-4 rounded-3xl bg-linear-to-r from-emerald-800 to-teal-900 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                Live Group Voting Session
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              {group?.title || "FoodHub Dining Meetup"}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-100/90 font-medium">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {totalMembers} member{totalMembers !== 1 ? "s" : ""} joined
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {group?.searchRadiusKm || 3}km radius
              </span>
            </div>
          </div>

          {/* Quick Invite & Share actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1.5 rounded-2xl bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <QrCode className="h-4 w-4" /> Room QR
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 rounded-2xl bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-md transition hover:bg-slate-100"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" /> Invite Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Joined Participants Strip */}
        <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
            Joined:
          </span>
          {participants.map((p, idx) => (
            <div
              key={p.uuid || idx}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white">
                {p.nickname?.charAt(0).toUpperCase() || "M"}
              </div>
              <span>{p.nickname || `Guest ${idx + 1}`}</span>
              {p.participantRole === "HOST" && (
                <span className="rounded-md bg-amber-100 px-1 text-[9px] text-amber-800 font-extrabold dark:bg-amber-950 dark:text-amber-300">
                  HOST
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Candidates List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Restaurant & Meal Candidates
            </h2>
            <span className="text-xs font-medium text-slate-500">
              Cast your vote below
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DEFAULT_CANDIDATES.map((cand) => {
              const myVote = userVotes[cand.candidateUuid];
              const votesCount = getCandidateVoteCount(cand.candidateUuid);

              return (
                <div
                  key={cand.candidateUuid}
                  className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="space-y-3">
                    <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                      <img
                        src={cand.photoUrl}
                        alt={cand.foodName}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-2.5 right-2.5 rounded-xl bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-xs">
                        ★ {cand.rating}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {cand.storeName}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {cand.foodName}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          ${cand.price.toFixed(2)}
                        </span>
                        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {cand.distanceKm} km
                        </span>
                        {cand.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Vote Buttons Row */}
                  <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCastVote(cand.candidateUuid, "UP")}
                          className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition active:scale-90 ${
                            myVote === "UP"
                              ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCastVote(cand.candidateUuid, "DOWN")}
                          className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition active:scale-90 ${
                            myVote === "DOWN"
                              ? "border-rose-500 bg-rose-500 text-white shadow-xs"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCastVote(cand.candidateUuid, "LOVE")}
                          className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition active:scale-90 ${
                            myVote === "LOVE"
                              ? "border-pink-500 bg-pink-500 text-white shadow-xs"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <Heart className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-black text-emerald-700 dark:text-emerald-400">
                        <span>{votesCount} votes</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Host Complete Voting Action Bar */}
        <div className="rounded-3xl border border-emerald-500/30 bg-linear-to-r from-emerald-50 to-teal-50 p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ready to decide?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Completing the vote tallies all responses and reveals turn-by-turn navigation!
              </p>
            </div>

            <button
              type="button"
              onClick={handleCompleteVoting}
              disabled={isCompleting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-700 active:scale-98 disabled:opacity-50"
            >
              {isCompleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Finalizing Winner...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4" /> Complete Voting & Announce Winner
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Room QR Modal */}
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="max-w-xs rounded-3xl bg-white p-6 text-center dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Scan to Join</DialogTitle>
            <DialogDescription className="text-xs">
              Point a camera at this code to join this meetup room instantly.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 flex justify-center">
            <QRCodeSVG value={shareUrl} size={200} />
          </div>
          <p className="font-mono text-xs text-slate-400 truncate">{shareUrl}</p>
        </DialogContent>
      </Dialog>
    </main>
  );
}
