"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetFriendsQuery } from "@/app/store/friendsApi";
import {
  useCreateMeetupMutation,
} from "@/app/store/groupRecommendationApi";
import {
  useGetCurrentUserQuery,
  useGetBackendUserQuery,
} from "@/app/store/auth/currentUserApi";
import {
  Users,
  Link2,
  Shield,
  MapPin,
  Clock,
  Compass,
  Check,
  Copy,
  Share2,
  Send,
  Loader2,
  Sparkles,
  CheckCircle2,
  Navigation,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function HostMeetupCreate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedFriendUuid = searchParams.get("friendUuid");

  const { data: user } = useGetCurrentUserQuery();
  const { data: backendUser } = useGetBackendUserQuery();
  const { data: friends = [], isLoading: isLoadingFriends } = useGetFriendsQuery();

  const [createMeetup, { isLoading: isCreating }] = useCreateMeetupMutation();

  // Mode: 1 = FoodHub Friends, 2 = Casual Team / Guest Link
  const [mode, setMode] = useState<"friends" | "guest">("friends");

  // Common fields
  const [title, setTitle] = useState("");
  const [votingMethod, setVotingMethod] = useState<"SINGLE_PICK" | "APPROVAL" | "RANKED">("SINGLE_PICK");

  // Mode 1: Friends selection
  const [selectedFriendUuids, setSelectedFriendUuids] = useState<string[]>([]);

  // Mode 2: Location & settings
  const [locationLat, setLocationLat] = useState<number>(11.5564); // Phnom Penh default
  const [locationLng, setLocationLng] = useState<number>(104.9282);
  const [locationName, setLocationName] = useState("Phnom Penh Central");
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(3);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);

  // Success / Share Modal
  const [createdMeetup, setCreatedMeetup] = useState<{
    uuid: string;
    shareToken: string;
    title: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto-select friend if passed in query param
  useEffect(() => {
    if (preselectedFriendUuid && !selectedFriendUuids.includes(preselectedFriendUuid)) {
      setSelectedFriendUuids((prev) => [...prev, preselectedFriendUuid]);
    }
  }, [preselectedFriendUuid]);

  const toggleFriend = (uuid: string) => {
    setSelectedFriendUuids((prev) =>
      prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid],
    );
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationLat(pos.coords.latitude);
        setLocationLng(pos.coords.longitude);
        setLocationName("My Current GPS Location");
        setIsGettingGps(false);
      },
      (err) => {
        console.warn("GPS error:", err);
        setIsGettingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleCreateMeetup = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentUserId = backendUser?.id || 1;
    const meetupTitle =
      title.trim() ||
      (mode === "friends"
        ? `Lunch with Friends (${selectedFriendUuids.length + 1})`
        : "FoodHub Team Lunch");

    const expiresAt = new Date(
      Date.now() + (durationMinutes > 0 ? durationMinutes * 60 * 1000 : 86400000),
    ).toISOString();

    try {
      const response = await createMeetup({
        createdByUserId: currentUserId,
        title: meetupTitle,
        votingMethod,
        searchRadiusKm,
        timezone: "Asia/Phnom_Penh",
        expiresAt,
        meetingPointLat: locationLat,
        meetingPointLng: locationLng,
        guestAllowed: mode === "guest",
        friendUserUuids: mode === "friends" ? selectedFriendUuids : [],
        durationMinutes: mode === "guest" ? durationMinutes : undefined,
        inviteMode: mode === "friends" ? "FRIENDS" : "GUEST_LINK",
      }).unwrap();

      const createdUuid = response.uuid || "new-meetup";
      const shareToken =
        response.shareToken ||
        (createdUuid.includes("-") ? createdUuid.split("-")[0] : createdUuid);

      setCreatedMeetup({
        uuid: createdUuid,
        shareToken,
        title: meetupTitle,
      });
    } catch (err) {
      console.error("Failed to create meetup:", err);
    }
  };

  const shareUrl =
    typeof window !== "undefined" && createdMeetup
      ? `${window.location.origin}/meet/${createdMeetup.shareToken}`
      : `https://foodhub.app/meet/${createdMeetup?.shareToken || ""}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(
      `🍽️ Join our FoodHub Meetup: "${createdMeetup?.title}"!\nVote for what to eat together:\n${shareUrl}`,
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`, "_blank");
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-linear-to-r from-emerald-800 to-teal-900 p-6 text-white shadow-xl sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <Sparkles className="h-6 w-6 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Create Group Dining Meetup
            </h1>
            <p className="mt-1 text-sm text-emerald-100/90">
              Pick a dining mode, collect dietary preferences, and vote on the best spot!
            </p>
          </div>
        </div>

        {/* Dual Mode Switcher Tabs */}
        <div className="mt-8 grid grid-cols-2 gap-3 rounded-2xl bg-black/20 p-1.5 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setMode("friends")}
            className={`flex items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-bold transition ${
              mode === "friends"
                ? "bg-white text-emerald-950 shadow-md"
                : "text-emerald-100 hover:bg-white/10"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Mode 1: FoodHub Friends</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("guest")}
            className={`flex items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-bold transition ${
              mode === "guest"
                ? "bg-white text-emerald-950 shadow-md"
                : "text-emerald-100 hover:bg-white/10"
            }`}
          >
            <Link2 className="h-4 w-4" />
            <span>Mode 2: Casual Team / Guest Link</span>
          </button>
        </div>
      </div>

      {/* Main Creation Form */}
      <form
        onSubmit={handleCreateMeetup}
        className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8 space-y-6"
      >
        {/* Title Input */}
        <div>
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
            Meetup Title
          </label>
          <input
            type="text"
            placeholder={
              mode === "friends"
                ? "e.g. Friday Lunch with Squad"
                : "e.g. Engineering Team Lunch @ BKK"
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        {/* MODE 1: Friends Selection Checklist */}
        {mode === "friends" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Select Friends to Invite ({selectedFriendUuids.length} selected)
              </label>
              <span className="text-xs text-slate-400">
                Dietary profiles auto-attached
              </span>
            </div>

            {isLoadingFriends ? (
              <div className="flex h-36 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              </div>
            ) : friends.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-800">
                You haven&apos;t added any friends yet. Add friends on the Friends page or use Mode 2 to invite via link!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-h-80 overflow-y-auto pr-1">
                {friends.map((friend) => {
                  const isSelected = selectedFriendUuids.includes(friend.userUuid);
                  return (
                    <button
                      type="button"
                      key={friend.friendshipUuid}
                      onClick={() => toggleFriend(friend.userUuid)}
                      className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/70 shadow-xs dark:border-emerald-500 dark:bg-emerald-950/40"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                      }`}
                    >
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border mt-0.5 transition ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800"
                        }`}
                      >
                        {isSelected && <Check className="h-4 w-4" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-sm text-slate-900 dark:text-white">
                          @{friend.username}
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400">
                          <Shield className="h-3 w-3 shrink-0" />
                          <span className="truncate">
                            {friend.defaultProfileName || "Standard Profile"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MODE 2: Casual Team / Guest Link Controls */}
        {mode === "guest" && (
          <div className="space-y-6 rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-950/40">
            {/* Central Meeting Pin & GPS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  Central Meeting Point
                </label>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isGettingGps}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                >
                  {isGettingGps ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Navigation className="h-3 w-3" />
                  )}
                  Use Current GPS
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                <Compass className="h-4 w-4 text-slate-400" />
                <span>
                  Pinned: {locationName} ({locationLat.toFixed(4)}, {locationLng.toFixed(4)})
                </span>
              </div>
            </div>

            {/* Radius Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-bold text-slate-800 dark:text-slate-200">
                <span>Search Radius</span>
                <span className="text-emerald-600 dark:text-emerald-400">{searchRadiusKm} km</span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 5, 10].map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setSearchRadiusKm(r)}
                    className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                      searchRadiusKm === r
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {r}km
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  Voting Duration
                </span>
                <span className="text-xs text-slate-500">
                  {durationMinutes === 0 ? "Manual finish by host" : `${durationMinutes} minutes`}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "15 min", val: 15 },
                  { label: "30 min", val: 30 },
                  { label: "1 hour", val: 60 },
                  { label: "Manual", val: 0 },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.val}
                    onClick={() => setDurationMinutes(item.val)}
                    className={`rounded-xl py-2 text-xs font-bold transition ${
                      durationMinutes === item.val
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Voting Method */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
            Voting Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "SINGLE_PICK", label: "Single Pick (👍)" },
              { id: "APPROVAL", label: "Approval (👍/👎)" },
              { id: "RANKED", label: "Ranked Choice (❤️)" },
            ].map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setVotingMethod(m.id as "SINGLE_PICK" | "APPROVAL" | "RANKED")}
                className={`rounded-2xl border p-3 text-center text-xs font-bold transition ${
                  votingMethod === m.id
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-300 shadow-xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isCreating}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-base font-bold text-white shadow-lg transition hover:bg-emerald-700 active:scale-98 disabled:opacity-50"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Creating Meetup...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              {mode === "friends" ? "Launch Friends Meetup" : "Generate Guest Link & Room"}
            </>
          )}
        </button>
      </form>

      {/* Share / Room Modal */}
      {createdMeetup && (
        <Dialog open={Boolean(createdMeetup)} onOpenChange={() => setCreatedMeetup(null)}>
          <DialogContent className="max-w-md rounded-3xl bg-white p-6 dark:bg-slate-900 sm:p-8">
            <DialogHeader className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                Meetup Room Created!
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                Share this invite link with your members or join the live voting room right now.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Invite Link
                </span>
                <p className="mt-1 font-mono text-xs font-bold text-slate-800 truncate dark:text-slate-200">
                  {shareUrl}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copy Link
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleShareTelegram}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#229ED9] py-3 text-xs font-bold text-white shadow-xs transition hover:bg-[#1f8fc4]"
                >
                  <Send className="h-4 w-4" /> Share to Telegram
                </button>
              </div>

              <button
                type="button"
                onClick={() => router.push(`/meet/${createdMeetup.shareToken}`)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700"
              >
                Enter Live Voting Room &rarr;
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
