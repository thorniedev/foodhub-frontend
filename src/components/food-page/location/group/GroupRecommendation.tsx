"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetFriendsQuery } from "@/app/store/friendsApi";
import { useCreateMeetupMutation } from "@/app/store/groupRecommendationApi";
import { useGetCurrentUserQuery, useGetBackendUserQuery } from "@/app/store/auth/currentUserApi";
import type { LocationStore } from "@/types/location-store";
import type { MenuItem } from "@/types/manu";
import type { Coordinates, LocationFiltersState } from "@/types/location";
import {
  Users,
  Link2,
  Shield,
  MapPin,
  Clock,
  Check,
  Copy,
  Share2,
  Send,
  Loader2,
  Sparkles,
  CheckCircle2,
  Navigation,
  Utensils,
  ArrowRight,
  QrCode,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GroupRecommendationProps {
  menuItems: MenuItem[];
  stores?: LocationStore[];
  userLocation: Coordinates | null;
  filters: LocationFiltersState;
  searchQuery: string;
  onOpenFilters: () => void;
  onResultCountChange: (count: number) => void;
}

export default function GroupRecommendation({
  menuItems,
  stores = [],
  userLocation,
  filters,
  searchQuery,
  onOpenFilters,
  onResultCountChange,
}: GroupRecommendationProps) {
  const router = useRouter();

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
  const [locationLat, setLocationLat] = useState<number>(userLocation?.latitude ?? 11.5564);
  const [locationLng, setLocationLng] = useState<number>(userLocation?.longitude ?? 104.9282);
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(filters.radiusKm || 3);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);

  // Success / Share Modal
  const [createdMeetup, setCreatedMeetup] = useState<{
    uuid: string;
    shareToken: string;
    title: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const toggleFriend = (uuid: string) => {
    setSelectedFriendUuids((prev) =>
      prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid],
    );
  };

  const handleCreateMeetup = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentUserId = backendUser?.id || 1;
    const meetupTitle =
      title.trim() ||
      (mode === "friends"
        ? `Lunch with Friends (${selectedFriendUuids.length + 1})`
        : "FoodHub Group Lunch");

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
      console.error("Failed to create meetup from location:", err);
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
    <div className="w-full space-y-6">
      {/* Hero Banner with Dual-Mode Tabs */}
      <div className="rounded-3xl bg-linear-to-r from-emerald-800 to-teal-900 p-6 text-white shadow-xl sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <Sparkles className="h-6 w-6 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              ការណាត់ញ៉ាំអាហារជាក្រុម (Dual-Mode Meetup)
            </h2>
            <p className="mt-1 text-sm text-emerald-100/90">
              ជ្រើសរើសរបៀបញ៉ាំជាមួយមិត្តភក្តិ ឬបង្កើតតំណភ្ជាប់ចែករំលែកដើម្បីបោះឆ្នោតភ្លាមៗ!
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-black/20 p-1.5 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setMode("friends")}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-bold transition ${
              mode === "friends"
                ? "bg-white text-emerald-950 shadow-md"
                : "text-emerald-100 hover:bg-white/10"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Mode 1: មិត្តភក្តិ FoodHub</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("guest")}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs sm:text-sm font-bold transition ${
              mode === "guest"
                ? "bg-white text-emerald-950 shadow-md"
                : "text-emerald-100 hover:bg-white/10"
            }`}
          >
            <Link2 className="h-4 w-4" />
            <span>Mode 2: តំណភ្ជាប់សាធារណៈ (Guest Link)</span>
          </button>
        </div>
      </div>

      {/* Creation Form */}
      <form
        onSubmit={handleCreateMeetup}
        className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
            ឈ្មោះក្រុម ឬ គោលបំណងជួបជុំ (Meetup Title)
          </label>
          <input
            type="text"
            placeholder={
              mode === "friends"
                ? "ឧទាហរណ៍៖ ញ៉ាំបាយថ្ងៃត្រង់ជាមួយមិត្តភក្តិ"
                : "ឧទាហរណ៍៖ ញ៉ាំបាយជាមួយក្រុមការងារ BKK"
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        {/* Mode 1: Friends Checklist */}
        {mode === "friends" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                ជ្រើសរើសមិត្តភក្តិដែលត្រូវអញ្ជើញ ({selectedFriendUuids.length} នាក់បានជ្រើសរើស)
              </label>
              <span className="text-xs text-slate-400">
                ប្រព័ន្ធនឹងភ្ជាប់ទិន្នន័យសុវត្ថិភាពម្ហូបអាហារស្វ័យប្រវត្តិ
              </span>
            </div>

            {isLoadingFriends ? (
              <div className="flex h-36 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              </div>
            ) : friends.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-800">
                អ្នកមិនទាន់មានមិត្តភក្តិក្នុងបញ្ជីនៅឡើយទេ។ សូមប្រើ Mode 2 ដើម្បីផ្ញើតំណភ្ជាប់ ឬបន្ថែមមិត្តភក្តិលើទំព័រ Friends!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-h-72 overflow-y-auto pr-1">
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

        {/* Mode 2: Casual Team / Guest Link Controls */}
        {mode === "guest" && (
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-950/40">
            {/* Radius */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-bold text-slate-800 dark:text-slate-200">
                <span>កាំស្វែងរកហាង (Search Radius)</span>
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

            {/* Duration */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  រយៈពេលបោះឆ្នោត (Duration)
                </span>
                <span className="text-xs text-slate-500">
                  {durationMinutes === 0 ? "ម្ចាស់ក្រុមបិទដោយផ្ទាល់ (Manual)" : `${durationMinutes} នាទី`}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "15 នាទី", val: 15 },
                  { label: "30 នាទី", val: 30 },
                  { label: "1 ម៉ោង", val: 60 },
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
            វិធីសាស្ត្របោះឆ្នោត (Voting Method)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "SINGLE_PICK", label: "Single Pick (👍)" },
              { id: "APPROVAL", label: "Approval (👍/👎)" },
              { id: "RANKED", label: "Ranked (❤️)" },
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

        {/* Submit */}
        <button
          type="submit"
          disabled={isCreating}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-base font-bold text-white shadow-lg transition hover:bg-emerald-700 active:scale-98 disabled:opacity-50"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> កំពុងបង្កើត Meetup...
            </>
          ) : (
            <>
              <Utensils className="h-5 w-5" />
              {mode === "friends" ? "បង្កើត Meetup ជាមួយមិត្តភក្តិ" : "បង្កើតតំណភ្ជាប់ចែករំលែក (Generate Link)"}
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
                Meetup ត្រូវបានបង្កើតរួចរាល់!
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                ចែករំលែកតំណភ្ជាប់នេះជាមួយសមាជិក ឬចូលទៅកាន់បន្ទប់បោះឆ្នោតផ្ទាល់។
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  តំណភ្ជាប់អញ្ជើញ (Invite Link)
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
                      <Check className="h-4 w-4 text-emerald-600" /> បានចម្លង!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> ចម្លងតំណ
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleShareTelegram}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#229ED9] py-3 text-xs font-bold text-white shadow-xs transition hover:bg-[#1f8fc4]"
                >
                  <Send className="h-4 w-4" /> ផ្ញើទៅ Telegram
                </button>
              </div>

              <button
                type="button"
                onClick={() => router.push(`/meet/${createdMeetup.shareToken}`)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700"
              >
                ចូលបន្ទប់បោះឆ្នោតផ្ទាល់ (Enter Room) &rarr;
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
