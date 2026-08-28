"use client";

import { useState, useEffect, useMemo, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  useCreateMeetupMutation,
  useTriggerGroupMeetupInviteMutation,
} from "@/app/store/groupRecommendationApi";
import { useGetFriendsQuery } from "@/app/store/friendsApi";
import { useGetCurrentUserQuery } from "@/app/store/auth/currentUserApi";
import type { LocationStore } from "@/types/location-store";
import type { MenuItem } from "@/types/manu";
import type {
  Coordinates,
  LocationFiltersState,
  LocationViewMode,
} from "@/types/location";
import { buildGroupRecommendedStores } from "@/lib/location/group-recommendation";
import type { GroupRecommendedStore } from "@/types/group-location";
import {
  Users,
  Link2,
  Shield,
  MapPin,
  Clock,
  Check,
  Copy,
  Send,
  Loader2,
  CheckCircle2,
  Utensils,
  Compass,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getApiErrorMessage } from "@/lib/api-error";
import { APP_TIME_ZONE } from "@/lib/formatDate";
import { saveStoredMeetupSession } from "@/lib/meetup/meetup-session";
import MobileLocationToolbar from "../MobileLocationToolbar";
import StoreMenuItemList from "../StoreMenuItemList";
import { buildStoreMenuItemCards } from "@/lib/location/store-menu-item-cards";

const FoodLocationMap = dynamic(() => import("../FoodLocationMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[58dvh] min-h-[440px] animate-pulse rounded-[24px] bg-slate-100 dark:bg-slate-800" />
  ),
});

const POPULAR_AREAS = [
  "Boeung Keng Kang 1",
  "Toul Tompoung",
  "Daun Penh / Riverside",
  "Toul Kork",
  "Chroy Changvar",
  "Tonle Bassac",
  "7 Makara",
];

interface GroupRecommendationProps {
  meetupMode?: "friends" | "guest";
  menuItems: MenuItem[];
  stores: LocationStore[];
  userLocation: Coordinates | null;
  filters: LocationFiltersState;
  searchQuery: string;
  onOpenFilters: () => void;
  onResultCountChange: (count: number) => void;
  onRadiusChange?: (radius: number) => void;
}

export default function GroupRecommendation({
  meetupMode = "friends",
  menuItems,
  stores = [],
  userLocation,
  filters,
  searchQuery,
  onOpenFilters,
  onResultCountChange,
  onRadiusChange,
}: GroupRecommendationProps) {
  const router = useRouter();

  const { data: user } = useGetCurrentUserQuery();
  const { data: friends = [], isLoading: isLoadingFriends } = useGetFriendsQuery();

  const [createMeetup, { isLoading: isCreating }] = useCreateMeetupMutation();
  const [triggerGroupMeetupInvite] = useTriggerGroupMeetupInviteMutation();

  const activeMode = meetupMode;

  // Common Fields
  const [title, setTitle] = useState("");
  const [votingMethod, setVotingMethod] =
    useState<"SINGLE_PICK" | "RANKED_BORDA">("SINGLE_PICK");
  const [view, setView] = useState<LocationViewMode>("list");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Radius & Duration (Dynamic)
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(filters.radiusKm || 5);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);

  // Location Mode & Area for Guest Mode
  const [guestLocationMode, setGuestLocationMode] = useState<"PIN" | "AREA">("PIN");
  const [targetAreaName, setTargetAreaName] = useState("Boeung Keng Kang 1");

  // Friend Mode Fields
  const [selectedFriendUuids, setSelectedFriendUuids] = useState<string[]>([]);

  // Share / Success State
  const [createdMeetup, setCreatedMeetup] = useState<{
    uuid: string;
    shareToken: string;
    title: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleRadiusSelect = (radius: number) => {
    setSearchRadiusKm(radius);
    if (onRadiusChange) {
      onRadiusChange(radius);
    }
  };

  // Build recommended stores with compatibility scores
  const recommendedStores: GroupRecommendedStore[] = useMemo(() => {
    return buildGroupRecommendedStores({
      sourceStores: stores,
      menuItems,
      midpoint: userLocation,
      members: [],
    });
  }, [stores, menuItems, userLocation]);

  // Filtered stores
  const filteredStores = useMemo(() => {
    let result = recommendedStores;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.localName && s.localName.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [recommendedStores, searchQuery]);

  /* Each candidate store contributes the dishes it actually sells. */
  const menuItemCards = useMemo(() => {
    const cards = buildStoreMenuItemCards(filteredStores);
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return cards;
    }

    return cards.filter(
      (card) =>
        card.name.toLowerCase().includes(query) ||
        card.storeName.toLowerCase().includes(query),
    );
  }, [filteredStores, searchQuery]);

  useEffect(() => {
    onResultCountChange(menuItemCards.length);
  }, [menuItemCards.length, onResultCountChange]);

  const toggleFriend = (uuid: string) => {
    setSelectedFriendUuids((prev) =>
      prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid],
    );
  };

  const handleCreateMeetup = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("Please sign in before creating a meetup.");
      return;
    }

    const sanitizedFriendUuids = Array.from(
      new Set(
        activeMode === "friends"
          ? selectedFriendUuids.filter(
              (uuid) => uuid && uuid !== user?.uuid,
            )
          : [],
      ),
    );

    const meetupTitle =
      title.trim() ||
      (activeMode === "friends"
        ? `Lunch with Friends (${sanitizedFriendUuids.length + 1})`
        : "FoodHub Group Lunch");

    const expiresAt = new Date(
      Date.now() + (durationMinutes > 0 ? durationMinutes * 60 * 1000 : 86400000),
    ).toISOString();

    const lat = userLocation?.latitude ?? 11.5564;
    const lng = userLocation?.longitude ?? 104.9282;
    const expectedGuestCount = 4;
    const isAreaMode = activeMode === "guest" && guestLocationMode === "AREA";

    try {
      const response = await createMeetup({
        title: meetupTitle,
        votingMethod,
        audienceMode: activeMode === "friends" ? "FRIENDS" : "GUESTS",
        locationMode: isAreaMode ? "AREA" : "PIN",
        targetAreaName: isAreaMode ? targetAreaName.trim() || "Boeung Keng Kang 1" : undefined,
        targetCity: isAreaMode ? "Phnom Penh" : undefined,
        targetProvince: isAreaMode ? "Phnom Penh" : undefined,
        searchRadiusKm: Math.min(5, Math.max(1, searchRadiusKm || 3)),
        timezone: APP_TIME_ZONE,
        expiresAt,
        targetLat: isAreaMode ? undefined : lat,
        targetLng: isAreaMode ? undefined : lng,
        guestAllowed: activeMode === "guest",
        friendUserUuids: sanitizedFriendUuids,
        expectedGuestCount:
          activeMode === "guest" ? expectedGuestCount : undefined,
        maxParticipants:
          activeMode === "guest"
            ? Math.max(20, expectedGuestCount + 5)
            : Math.max(20, sanitizedFriendUuids.length + 5),
        durationMinutes: activeMode === "guest" ? durationMinutes : undefined,
        inviteMode: activeMode === "friends" ? "FRIENDS" : "GUEST_LINK",
      }).unwrap();

      if (!response.uuid || !response.shareToken) {
        alert("Meetup created, but no invite link was returned.");
        return;
      }

      const createdUuid = response.uuid;
      const shareToken = response.shareToken;

      // Save to localStorage for Meetup History page
      try {
        localStorage.setItem(
          `foodhub-meetup-share-${createdUuid}`,
          JSON.stringify({
            uuid: createdUuid,
            shareToken,
            title: meetupTitle,
            audienceMode: activeMode === "friends" ? "FRIENDS" : "GUESTS",
            inviteMode: activeMode === "friends" ? "FRIENDS" : "GUEST_LINK",
            locationMode: isAreaMode ? "AREA" : "PIN",
            status: "VOTING",
            createdAt: new Date().toISOString(),
            participantCount:
              activeMode === "friends"
                ? selectedFriendUuids.length + 1
                : expectedGuestCount + 1,
            radiusKm: searchRadiusKm,
          }),
        );
      } catch {
        // ignore
      }

      const hostParticipant = response.participants.find(
        (participant) => participant.participantRole === "HOST",
      );

      if (hostParticipant?.uuid) {
        saveStoredMeetupSession(shareToken, {
          participantUuid: hostParticipant.uuid,
          profileUuid: hostParticipant.profileUuid,
          nickname: hostParticipant.nickname || user.username,
          joinMode: "FRIEND",
          locationMode: isAreaMode ? "AREA" : "PIN",
          locationLat: isAreaMode ? undefined : lat,
          locationLng: isAreaMode ? undefined : lng,
          targetAreaName: isAreaMode ? targetAreaName : undefined,
        });
      }

      // Automatically dispatch invite notifications to friends if in Friends Mode
      if (activeMode === "friends" && sanitizedFriendUuids.length > 0) {
        try {
          const inviteeProfiles = friends
            .filter((f) => sanitizedFriendUuids.includes(f.userUuid) && f.defaultProfileUuid)
            .map((f) => f.defaultProfileUuid as string);

          if (inviteeProfiles.length > 0) {
            await triggerGroupMeetupInvite({
              meetupUuid: createdUuid,
              inviteeProfileUuids: inviteeProfiles,
              message: `Hey! Join our FoodHub dinner meetup: "${meetupTitle}"!`,
            }).unwrap();
          }
        } catch (inviteErr) {
          console.warn("Could not dispatch automated friend invites:", inviteErr);
        }
      }

      setCreatedMeetup({
        uuid: createdUuid,
        shareToken,
        title: meetupTitle,
      });
    } catch (err) {
      console.error("Failed to create meetup:", err);
      alert(
        getApiErrorMessage(
          err,
          "FoodHub could not create the meetup with the production backend.",
        ),
      );
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
      {/* Creation Configuration Form in Clean FoodHub White-Card Theme */}
      <form
        onSubmit={handleCreateMeetup}
        className="rounded-[24px] border border-gray-100 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5"
      >
        {/* Header Title inside Setup */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4 dark:border-slate-800">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-primary-900 dark:text-white flex items-center gap-2">
              {activeMode === "friends" ? (
                <>
                  <Users className="h-5 w-5 text-primary-800 dark:text-emerald-400" />
                  <span>រៀបចំការណាត់ជួបជាមួយមិត្តភក្តិ</span>
                </>
              ) : (
                <>
                  <Link2 className="h-5 w-5 text-primary-800 dark:text-emerald-400" />
                  <span>រៀបចំការណាត់ជួបតាមតំណភ្ញៀវ</span>
                </>
              )}
            </h3>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">
              {activeMode === "friends"
                ? "ជ្រើសរើសមិត្តភក្តិដើម្បីប្រព័ន្ធភ្ជាប់ទិន្នន័យសុវត្ថិភាពម្ហូបអាហារ និងផ្ញើដំណឹងអញ្ជើញដោយស្វ័យប្រវត្តិ"
                : "កំណត់កាំស្វែងរក និងរយៈពេលបោះឆ្នោត ដើម្បីបង្កើតបន្ទប់ចែករំលែកជាសាធារណៈ"}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-primary-800 bg-primary-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-3 py-1.5 rounded-full self-start sm:self-auto">
            <MapPin className="h-3.5 w-3.5" />
            <span>{filteredStores.length} ហាង &bull; {menuItemCards.length} មុខម្ហូប</span>
          </div>
        </div>

        {/* Meetup Title Input */}
        <div>
          <label className="block text-sm font-semibold text-primary-900 dark:text-slate-200">
            ឈ្មោះការណាត់ជួប
          </label>
          <input
            type="text"
            placeholder={
              activeMode === "friends"
                ? "ឧទាហរណ៍៖ ញ៉ាំបាយថ្ងៃត្រង់ជាមួយមិត្តភក្តិ"
                : "ឧទាហរណ៍៖ ញ៉ាំបាយជាមួយក្រុមការងារ BKK"
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        {/* MODE 1: Friends Selection Checklist */}
        {activeMode === "friends" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-primary-900 dark:text-slate-200">
                ជ្រើសរើសមិត្តភក្តិ ({selectedFriendUuids.length} នាក់បានជ្រើសរើស)
              </label>
              <span className="text-xs text-primary-700 dark:text-emerald-400 font-medium">
                ភ្ជាប់ប្រវត្តិសុវត្ថិភាព & ផ្ញើ Notification ស្វ័យប្រវត្តិ
              </span>
            </div>

            {isLoadingFriends ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary-800" />
              </div>
            ) : friends.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-slate-800">
                <p className="font-medium">អ្នកមិនទាន់មានមិត្តភក្តិក្នុងបញ្ជីនៅឡើយទេ។</p>
                <p className="mt-1 text-xs text-gray-400">
                  សូមចូលទៅកាន់ទំព័រ <span className="font-bold text-primary-800 dark:text-emerald-400">មិត្តភក្តិ</span> ដើម្បីស្កេន QR ឬបន្ថែមមិត្តភក្តិ!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 max-h-64 overflow-y-auto pr-1">
                {friends.map((friend) => {
                  const isSelected = selectedFriendUuids.includes(friend.userUuid);
                  return (
                    <button
                      type="button"
                      key={friend.friendshipUuid}
                      onClick={() => toggleFriend(friend.userUuid)}
                      className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition ${
                        isSelected
                          ? "border-primary-700 bg-primary-50/60 shadow-xs dark:border-emerald-500 dark:bg-emerald-950/40"
                          : "border-gray-200 bg-white hover:border-gray-300 dark:border-slate-800 dark:bg-slate-900"
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border mt-0.5 transition ${
                          isSelected
                            ? "border-primary-800 bg-primary-800 text-white"
                            : "border-gray-300 bg-white dark:border-slate-700 dark:bg-slate-800"
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-sm text-primary-900 dark:text-white">
                          @{friend.username}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-primary-700 dark:text-emerald-400">
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

        {/* MODE 2: Guest Mode Location Mode (PIN vs AREA) */}
        {activeMode === "guest" && (
          <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="flex items-center justify-between text-sm font-semibold text-primary-900 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-primary-800" />
                របៀបកំណត់ទីតាំង
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGuestLocationMode("PIN")}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
                  guestLocationMode === "PIN"
                    ? "bg-primary-800 text-white shadow-xs"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>ចំណុចផែនទី</span>
              </button>

              <button
                type="button"
                onClick={() => setGuestLocationMode("AREA")}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${
                  guestLocationMode === "AREA"
                    ? "bg-primary-800 text-white shadow-xs"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
                <span>តំបន់គោលដៅ</span>
              </button>
            </div>

            {guestLocationMode === "AREA" && (
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300">
                  ជ្រើសរើសតំបន់ ឬសង្កាត់ក្នុងរាជធានីភ្នំពេញ
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_AREAS.map((area) => (
                    <button
                      type="button"
                      key={area}
                      onClick={() => setTargetAreaName(area)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                        targetAreaName === area
                          ? "bg-primary-800 text-white"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dynamic Search Radius (Active for both modes) */}
        <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-semibold text-primary-900 dark:text-slate-200">
              <span>កាំស្វែងរកហាង</span>
              <span className="text-primary-800 dark:text-emerald-400 font-bold">{searchRadiusKm} km</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => handleRadiusSelect(r)}
                  className={`rounded-xl py-2 text-xs font-bold transition ${
                    searchRadiusKm === r
                      ? "bg-primary-800 text-white shadow-xs"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          {/* Duration Selector (for Guest Mode) */}
          {activeMode === "guest" && (
            <div className="space-y-2 pt-2 border-t border-gray-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between text-sm font-semibold text-primary-900 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary-800" />
                  រយៈពេលបោះឆ្នោត
                </span>
                <span className="text-xs text-gray-500">
                  {durationMinutes === 0 ? "បិទដោយផ្ទាល់" : `${durationMinutes} នាទី`}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "15 នាទី", val: 15 },
                  { label: "30 នាទី", val: 30 },
                  { label: "1 ម៉ោង", val: 60 },
                  { label: "បិទផ្ទាល់", val: 0 },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.val}
                    onClick={() => setDurationMinutes(item.val)}
                    className={`rounded-xl py-2 text-xs font-bold transition ${
                      durationMinutes === item.val
                        ? "bg-primary-800 text-white shadow-xs"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isCreating}
          className="flex w-full min-h-12 items-center justify-center gap-2 rounded-full bg-primary-800 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-primary-700 active:scale-98 disabled:opacity-50"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> កំពុងបង្កើត Meetup...
            </>
          ) : (
            <>
              <Utensils className="h-5 w-5" />
              {activeMode === "friends" ? "បង្កើត Meetup ជាមួយមិត្តភក្តិ" : "បង្កើតតំណភ្ជាប់ចែករំលែក"}
            </>
          )}
        </button>
      </form>

      {/* Candidate Menu Items Cards & Interactive Map Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-base font-bold text-primary-900 dark:text-white sm:text-lg">
            <span>មុខម្ហូបក្នុងហាងដែលស័ក្តិសមសម្រាប់បោះឆ្នោត ({menuItemCards.length})</span>
          </p>

          <MobileLocationToolbar
            view={view}
            onViewChange={setView}
            onOpenFilters={onOpenFilters}
          />
        </div>

        {/* List & Map Layout */}
        <div className="2xl:hidden">
          {view === "list" ? (
            <StoreMenuItemList
              cards={menuItemCards}
              selectedStoreId={selectedStoreId}
              onSelectStore={setSelectedStoreId}
            />
          ) : (
            <FoodLocationMap
              mode="group"
              userLocation={userLocation}
              groupMembers={[]}
              meetingPoint={userLocation}
              stores={filteredStores}
              selectedStoreId={selectedStoreId}
              radiusKm={searchRadiusKm}
              onSelectStore={setSelectedStoreId}
            />
          )}
        </div>

        <div className="hidden min-w-0 gap-6 2xl:grid 2xl:grid-cols-[minmax(420px,46%)_minmax(0,54%)]">
          <div className="min-w-0">
            <StoreMenuItemList
              cards={menuItemCards}
              selectedStoreId={selectedStoreId}
              onSelectStore={setSelectedStoreId}
            />
          </div>

          <div className="min-w-0">
            <div className="sticky top-24">
              <FoodLocationMap
                mode="group"
                userLocation={userLocation}
                groupMembers={[]}
                meetingPoint={userLocation}
                stores={filteredStores}
                selectedStoreId={selectedStoreId}
                radiusKm={searchRadiusKm}
                onSelectStore={setSelectedStoreId}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Share / Room Modal */}
      {createdMeetup && (
        <Dialog open={Boolean(createdMeetup)} onOpenChange={() => setCreatedMeetup(null)}>
          <DialogContent className="w-full sm:max-w-lg rounded-3xl bg-white p-6 dark:bg-slate-900 sm:p-8 border-0 shadow-2xl">
            <DialogHeader className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-normal">
                Meetup ត្រូវបានបង្កើតរួចរាល់!
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                ចែករំលែកតំណភ្ជាប់នេះជាមួយសមាជិក ឬចូលទៅកាន់បន្ទប់បោះឆ្នោតផ្ទាល់។
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-1.5">
                  តំណភ្ជាប់អញ្ជើញ
                </span>
                <p className="font-mono text-xs font-semibold text-gray-800 dark:text-slate-200 truncate bg-white dark:bg-slate-900 py-2 px-3 rounded-xl border border-gray-200/80 dark:border-slate-800 select-all">
                  {shareUrl}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3 text-xs font-bold text-gray-700 transition hover:bg-gray-50 active:scale-[0.98] dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />{" "}
                      <span className="text-emerald-700 dark:text-emerald-400">បានចម្លង!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-gray-500" />{" "}
                      <span>ចម្លងតំណ</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleShareTelegram}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#229ED9] py-3 text-xs font-bold text-white shadow-xs transition hover:bg-[#1f8fc4] active:scale-[0.98] cursor-pointer"
                >
                  <Send className="h-4 w-4" /> <span>ផ្ញើទៅ Telegram</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => router.push(`/meet/${createdMeetup.shareToken}`)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-800 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-primary-900 active:scale-[0.99] dark:bg-emerald-600 dark:hover:bg-emerald-700 cursor-pointer"
              >
                <span>ចូលបន្ទប់បោះឆ្នោតផ្ទាល់</span>
                <span className="text-lg leading-none">&rarr;</span>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
