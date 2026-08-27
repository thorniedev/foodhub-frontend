"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  Link2,
  Loader2,
  Navigation,
  Send,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

import { useGetCurrentUserQuery } from "@/app/store/auth/currentUserApi";
import { useGetFriendsQuery } from "@/app/store/friendsApi";
import { useCreateMeetupMutation } from "@/app/store/groupRecommendationApi";
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
import type { CreateMeetupRequest } from "@/types/meetup-api";
import type { Coordinates } from "@/types/location";
import type { LocationSearchResult } from "@/types/location-search";

const LocationPickerMap = dynamic(
  () => import("@/components/food-page/location/picker/LocationPickerMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[360px] items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-500">
        Loading map...
      </div>
    ),
  },
);

type MeetupMode = "friends" | "guest" | "mixed";

/* MIXED invites friends and still hands out a public guest link. */
const AUDIENCE_MODE_BY_MEETUP_MODE: Record<
  MeetupMode,
  "FRIENDS" | "GUESTS" | "MIXED"
> = {
  friends: "FRIENDS",
  guest: "GUESTS",
  mixed: "MIXED",
};

type MeetupVotingChoice = "SINGLE_PICK" | "APPROVAL";
type MeetupLocationMode = "area" | "pin";

const DEFAULT_PIN: Coordinates = {
  latitude: 11.5564,
  longitude: 104.9282,
};

const RADIUS_OPTIONS = [1, 2, 3, 4, 5] as const;

function getExpiry(durationMinutes: number): string {
  return new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
}

function getNumberValue(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function saveCreatedMeetupHistory(input: {
  uuid: string;
  shareToken: string;
  title: string;
  audienceMode: "FRIENDS" | "GUESTS" | "MIXED";
  locationMode: "AREA" | "PIN";
  locationName: string;
  radiusKm: number;
  participantCount: number;
}) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      `foodhub-meetup-share-${input.uuid}`,
      JSON.stringify({
        uuid: input.uuid,
        shareToken: input.shareToken,
        title: input.title,
        audienceMode: input.audienceMode,
        inviteMode:
          input.audienceMode === "FRIENDS"
            ? "FRIENDS"
            : input.audienceMode === "MIXED"
              ? "MIXED"
              : "GUEST_LINK",
        locationMode: input.locationMode,
        status: "VOTING",
        createdAt: new Date().toISOString(),
        participantCount: input.participantCount,
        locationName: input.locationName,
        radiusKm: input.radiusKm,
      }),
    );
  } catch {
    // Local history is nice to have, not required for creating the meetup.
  }
}

export default function HostMeetupCreate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedFriendUuid = searchParams.get("friendUuid");

  const { data: user, isLoading: isLoadingUser } = useGetCurrentUserQuery();
  const { data: friends = [], isLoading: isLoadingFriends } =
    useGetFriendsQuery();
  const [createMeetup, { isLoading: isCreating }] = useCreateMeetupMutation();

  const [mode, setMode] = useState<MeetupMode>("friends");
  const [votingChoice, setVotingChoice] =
    useState<MeetupVotingChoice>("SINGLE_PICK");
  const [locationMode, setLocationMode] =
    useState<MeetupLocationMode>("area");
  const [title, setTitle] = useState("");
  const [selectedFriendUuids, setSelectedFriendUuids] = useState<string[]>(
    () => (preselectedFriendUuid ? [preselectedFriendUuid] : []),
  );
  const [targetAreaName, setTargetAreaName] = useState("Phnom Penh");
  const [targetCity, setTargetCity] = useState("Phnom Penh");
  const [targetProvince, setTargetProvince] = useState("Phnom Penh");
  const [pin, setPin] = useState<Coordinates>(DEFAULT_PIN);
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(3);
  const [expectedGuestCount, setExpectedGuestCount] = useState<number>(4);
  const [durationMinutes, setDurationMinutes] = useState<number>(120);
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdMeetup, setCreatedMeetup] = useState<{
    uuid: string;
    shareToken: string;
    title: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const pinPlace = useMemo<LocationSearchResult>(
    () => ({
      id: "meetup-pin",
      name: "FoodHub meetup pin",
      address: `${pin.latitude.toFixed(6)}, ${pin.longitude.toFixed(6)}`,
      addressLine1: null,
      addressLine2: null,
      city: targetCity || "Phnom Penh",
      district: targetAreaName || null,
      county: null,
      state: targetProvince || "Phnom Penh",
      postcode: null,
      country: "Cambodia",
      countryCode: "kh",
      latitude: pin.latitude,
      longitude: pin.longitude,
      type: "meetup-target",
    }),
    [pin.latitude, pin.longitude, targetAreaName, targetCity, targetProvince],
  );

  const shareUrl =
    typeof window !== "undefined" && createdMeetup
      ? `${window.location.origin}/meet/${createdMeetup.shareToken}`
      : "";

  const toggleFriend = (uuid: string) => {
    setSelectedFriendUuids((current) =>
      current.includes(uuid)
        ? current.filter((item) => item !== uuid)
        : [...current, uuid],
    );
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage("កម្មវិធីរុករកនេះមិនគាំទ្រទីតាំងបច្ចុប្បន្នទេ។");
      return;
    }

    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPin({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
        setLocationMode("pin");
        setIsGettingGps(false);
      },
      () => {
        setErrorMessage("មិនអាចអានទីតាំងបច្ចុប្បន្នបានទេ។ សូមជ្រើសរើសលើផែនទី។");
        setIsGettingGps(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12_000,
      },
    );
  };

  const handleCreateMeetup = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!user) {
      setErrorMessage("សូមចូលគណនីមុននឹងបង្កើតការណាត់ជួប។");
      return;
    }

    if (mode === "friends" && selectedFriendUuids.length === 0) {
      setErrorMessage("សូមជ្រើសរើសមិត្តភក្តិយ៉ាងតិចម្នាក់សម្រាប់របៀបមិត្តភក្តិ។");
      return;
    }

    if (
      locationMode === "area" &&
      (!targetAreaName.trim() || !targetCity.trim() || !targetProvince.trim())
    ) {
      setErrorMessage("របៀបតំបន់ត្រូវការឈ្មោះតំបន់ ក្រុង និងខេត្ត។");
      return;
    }

    if (
      locationMode === "pin" &&
      (!Number.isFinite(pin.latitude) || !Number.isFinite(pin.longitude))
    ) {
      setErrorMessage("របៀបចំណុចត្រូវការរយៈទទឹង និងរយៈបណ្តោយត្រឹមត្រូវ។");
      return;
    }

    const audienceMode = AUDIENCE_MODE_BY_MEETUP_MODE[mode];
    const apiLocationMode = locationMode === "area" ? "AREA" : "PIN";
    const sanitizedFriendUuids = Array.from(
      new Set(
        mode === "guest"
          ? []
          : selectedFriendUuids.filter((uuid) => uuid && uuid !== user.uuid),
      ),
    );

    const meetupTitle =
      title.trim() ||
      (mode === "friends"
        ? `Lunch with ${sanitizedFriendUuids.length + 1} friends`
        : `${mode === "mixed" ? "Meetup" : "Guest meetup"} in ${
            targetAreaName || targetCity || "Phnom Penh"
          }`);

    const body: CreateMeetupRequest = {
      title: meetupTitle,
      votingMethod: votingChoice,
      audienceMode,
      guestAllowed: mode !== "friends",
      friendUserUuids: sanitizedFriendUuids,
      expectedGuestCount: mode === "friends" ? undefined : expectedGuestCount,
      maxParticipants:
        mode === "friends"
          ? Math.max(20, sanitizedFriendUuids.length + 5)
          : Math.max(20, expectedGuestCount + sanitizedFriendUuids.length + 5),
      locationMode: apiLocationMode,
      timezone: APP_TIME_ZONE,
      expiresAt: getExpiry(durationMinutes),
      durationMinutes,
      candidateLimit: 12,
      currencyCode: "USD",
      ...(locationMode === "area"
        ? {
            targetAreaName: targetAreaName.trim(),
            targetCity: targetCity.trim(),
            targetProvince: targetProvince.trim(),
          }
        : {
            targetLat: pin.latitude,
            targetLng: pin.longitude,
            searchRadiusKm,
          }),
    };

    try {
      const response = await createMeetup(body).unwrap();

      if (!response.uuid || !response.shareToken) {
        setErrorMessage("បានបង្កើតការណាត់ជួប ប៉ុន្តែម៉ាស៊ីនមេមិនបានផ្ដល់តំណចែករំលែកទេ។");
        return;
      }

      saveCreatedMeetupHistory({
        uuid: response.uuid,
        shareToken: response.shareToken,
        title: response.title || meetupTitle,
        audienceMode,
        locationMode: apiLocationMode,
        locationName:
          locationMode === "area"
            ? [targetAreaName, targetCity, targetProvince]
                .filter(Boolean)
                .join(", ")
            : `${pin.latitude.toFixed(5)}, ${pin.longitude.toFixed(5)}`,
        radiusKm: searchRadiusKm,
        participantCount:
          mode === "friends"
            ? selectedFriendUuids.length + 1
            : expectedGuestCount + sanitizedFriendUuids.length + 1,
      });

      const hostParticipant = response.participants.find(
        (participant) => participant.participantRole === "HOST",
      );

      if (hostParticipant?.uuid) {
        saveStoredMeetupSession(response.shareToken, {
          participantUuid: hostParticipant.uuid,
          profileUuid: hostParticipant.profileUuid,
          nickname: hostParticipant.nickname || user.username,
          joinMode: "FRIEND",
          locationMode: apiLocationMode,
          targetAreaName:
            apiLocationMode === "AREA" ? targetAreaName.trim() : null,
          targetCity: apiLocationMode === "AREA" ? targetCity.trim() : null,
          targetProvince:
            apiLocationMode === "AREA" ? targetProvince.trim() : null,
          locationLat: apiLocationMode === "PIN" ? pin.latitude : null,
          locationLng: apiLocationMode === "PIN" ? pin.longitude : null,
        });
      }

      setCreatedMeetup({
        uuid: response.uuid,
        shareToken: response.shareToken,
        title: response.title || meetupTitle,
      });
    } catch (error) {
      console.error("Failed to create meetup:", error);
      setErrorMessage(
        getApiErrorMessage(
          error,
          "FoodHub មិនអាចបង្កើតការណាត់ជួបជាមួយម៉ាស៊ីនមេបានទេ។",
        ),
      );
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) {
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 2400);
  };

  const handleShareTelegram = () => {
    if (!createdMeetup || !shareUrl) {
      return;
    }

    const text = encodeURIComponent(
      `Join FoodHub meetup: ${createdMeetup.title}\n${shareUrl}`,
    );
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`,
      "_blank",
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-3xl bg-linear-to-r from-primary-800 to-primary-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-bold uppercase tracking-wide text-primary-100">
              <Sparkles className="h-3.5 w-3.5" />
              Group dining
            </div>
            <p className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              បង្កើតការណាត់ញ៉ាំអាហារ
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-50/90">
              បង្កើតបន្ទប់សម្រាប់មិត្តភក្តិ តំណអញ្ជើញភ្ញៀវ ឬបន្ទប់ចម្រុះ។
              ជ្រើសរើសតាមតំបន់ ឬចំណុច រួចឲ្យអ្នកគ្រប់គ្នាបោះឆ្នោត
              លើម្ហូបដែលមានសុវត្ថិភាព។
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-2 rounded-2xl bg-black/20 p-1.5 sm:min-w-[360px] sm:grid-cols-3 lg:w-auto">
            {[
              { value: "friends", label: "មិត្តភក្តិ", icon: Users },
              { value: "guest", label: "ភ្ញៀវ", icon: Link2 },
              { value: "mixed", label: "ចម្រុះ", icon: Sparkles },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = mode === item.value;

              return (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => setMode(item.value as MeetupMode)}
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition ${
                    isActive
                      ? "bg-white text-primary-950 shadow-md"
                      : "text-primary-50 hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <form
        onSubmit={handleCreateMeetup}
        className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7"
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div>
            <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Meetup title
            </label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Lunch near Phnom Penh"
              className="mt-2 h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Voting window
            </label>
            <select
              value={durationMinutes}
              onChange={(event) =>
                setDurationMinutes(getNumberValue(event.target.value, 120))
              }
              className="mt-2 h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={1440}>24 hours</option>
            </select>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                វិធីបោះឆ្នោត
              </p>
              <p className="text-sm text-slate-500">
                {votingChoice === "APPROVAL"
                  ? "អ្នកចូលរួមអាចជ្រើសរើសម្ហូបច្រើនមុខបាន។"
                  : "អ្នកចូលរួមម្នាក់មួយសំឡេង ហើយអាចផ្លាស់ប្ដូរបាន។"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1 rounded-xl bg-white p-1 shadow-xs dark:bg-slate-900">
              {[
                { value: "SINGLE_PICK", label: "មួយសំឡេង" },
                { value: "APPROVAL", label: "យល់ព្រម" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.value}
                  onClick={() =>
                    setVotingChoice(item.value as MeetupVotingChoice)
                  }
                  aria-pressed={votingChoice === item.value}
                  className={`min-h-10 rounded-lg px-4 text-sm font-bold transition ${
                    votingChoice === item.value
                      ? "bg-primary-600 text-white"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                របៀបទីតាំង
              </p>
              <p className="text-sm text-slate-500">
                ជ្រើសរើសតំបន់ ឬកំណត់ចំណុចជួបជាក់លាក់។
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1 rounded-xl bg-white p-1 shadow-xs dark:bg-slate-900">
              {[
                { value: "area", label: "តំបន់" },
                { value: "pin", label: "ចំណុច" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => setLocationMode(item.value as MeetupLocationMode)}
                  className={`min-h-10 rounded-lg px-4 text-sm font-bold transition ${
                    locationMode === item.value
                      ? "bg-primary-600 text-white"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {locationMode === "area" ? (
            <div className="grid gap-3 md:grid-cols-3">
              <label className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Target area
                <input
                  value={targetAreaName}
                  onChange={(event) => setTargetAreaName(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-900 outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>
              <label className="text-sm font-bold uppercase tracking-wide text-slate-500">
                City
                <input
                  value={targetCity}
                  onChange={(event) => setTargetCity(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-900 outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>
              <label className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Province
                <input
                  value={targetProvince}
                  onChange={(event) => setTargetProvince(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-900 outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <LocationPickerMap
                  value={pin}
                  selectedPlace={pinPlace}
                  onChange={setPin}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <label className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Latitude
                  <input
                    type="number"
                    step="0.000001"
                    value={pin.latitude}
                    onChange={(event) =>
                      setPin((current) => ({
                        ...current,
                        latitude: getNumberValue(event.target.value, current.latitude),
                      }))
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-900 outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </label>
                <label className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Longitude
                  <input
                    type="number"
                    step="0.000001"
                    value={pin.longitude}
                    onChange={(event) =>
                      setPin((current) => ({
                        ...current,
                        longitude: getNumberValue(event.target.value, current.longitude),
                      }))
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-900 outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isGettingGps}
                  className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-100 px-4 text-sm font-bold text-primary-800 transition hover:bg-primary-200 disabled:cursor-wait disabled:opacity-70 dark:bg-primary-950 dark:text-primary-300"
                >
                  {isGettingGps ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                  Use current
                </button>
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Search radius
                </p>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {RADIUS_OPTIONS.map((radius) => (
                    <button
                      type="button"
                      key={radius}
                      onClick={() => setSearchRadiusKm(radius)}
                      className={`min-h-10 rounded-xl text-sm font-bold transition ${
                        searchRadiusKm === radius
                          ? "bg-primary-600 text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                      }`}
                    >
                      {radius}km
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {mode !== "guest" ? (
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  អញ្ជើញមិត្តភក្តិ FoodHub
                </p>
                <p className="text-sm text-slate-500">
                  {mode === "mixed"
                    ? "មិត្តភក្តិដែលបានអញ្ជើញចូលរួមផ្ទាល់ អ្នកផ្សេងអាចប្រើតំណបាន។"
                    : "មានតែមិត្តភក្តិដែលបានជ្រើសរើសទេដែលអាចចូលរួម។"}
                </p>
              </div>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-bold text-primary-700">
                បានជ្រើស {selectedFriendUuids.length}
              </span>
            </div>

            {isLoadingFriends ? (
              <div className="flex min-h-32 items-center justify-center rounded-2xl border border-slate-200">
                <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
              </div>
            ) : friends.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                មិនទាន់មានមិត្តភក្តិ FoodHub ទេ។ ប្រើរបៀបភ្ញៀវដើម្បីបង្កើតតំណអញ្ជើញសាធារណៈ។
              </div>
            ) : (
              <div className="grid max-h-80 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
                {friends.map((friend) => {
                  const isSelected = selectedFriendUuids.includes(friend.userUuid);

                  return (
                    <button
                      type="button"
                      key={friend.friendshipUuid}
                      onClick={() => toggleFriend(friend.userUuid)}
                      className={`flex min-h-24 items-start gap-3 rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? "border-primary-600 bg-primary-50 shadow-xs dark:bg-primary-950/40"
                          : "border-slate-200 bg-white hover:border-primary-200 dark:border-slate-800 dark:bg-slate-900"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${
                          isSelected
                            ? "border-primary-600 bg-primary-600 text-white"
                            : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800"
                        }`}
                      >
                        {isSelected && <Check className="h-4 w-4" />}
                      </span>

                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black text-slate-900 dark:text-white">
                          @{friend.username}
                        </span>
                        <span className="mt-1 flex items-center gap-1 text-sm font-semibold text-primary-700">
                          <Shield className="h-3.5 w-3.5" />
                          <span className="truncate">
                            {friend.defaultProfileName || "Default active profile"}
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          <section className="grid gap-4 rounded-2xl border border-primary-100 bg-primary-50/50 p-4 dark:border-primary-900 dark:bg-primary-950/20 sm:grid-cols-[1fr_220px]">
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                Guest invite capacity
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                FoodHub reserves one host seat plus the guest count.
              </p>
            </div>

            <label className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Expected guests
              <input
                type="number"
                min={1}
                max={99}
                value={expectedGuestCount}
                onChange={(event) =>
                  setExpectedGuestCount(
                    Math.max(1, getNumberValue(event.target.value, 1)),
                  )
                }
                className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-900 outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
          </section>
        )}

        {errorMessage && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isCreating || isLoadingUser}
          className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 py-4 text-base font-black text-white shadow-lg transition hover:bg-primary-700 disabled:cursor-wait disabled:opacity-60"
        >
          {isCreating || isLoadingUser ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              កំពុងបង្កើត...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              {mode === "friends"
                ? "បង្កើតការណាត់ជួបមិត្តភក្តិ"
                : mode === "mixed"
                  ? "បង្កើតការណាត់ជួបចម្រុះ"
                  : "បង្កើតការណាត់ជួបភ្ញៀវ"}
            </>
          )}
        </button>
      </form>

      {createdMeetup && (
        <Dialog open={Boolean(createdMeetup)} onOpenChange={() => setCreatedMeetup(null)}>
          <DialogContent className="w-full sm:max-w-lg rounded-3xl bg-white p-6 dark:bg-slate-900 sm:p-8 border-0 shadow-2xl">
            <DialogHeader className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400">
                <CheckCircle2 className="h-7 w-7 text-primary-600 dark:text-primary-400" />
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-normal">
                Meetup Created Successfully!
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Copy the invite link to share with friends or enter the live room directly.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1.5">
                  Invite Link
                </span>
                <p className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200 truncate bg-white dark:bg-slate-900 py-2 px-3 rounded-xl border border-gray-200/80 dark:border-slate-800 select-all">
                  {shareUrl}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-4 w-4 text-primary-600" />
                      <span className="text-primary-700 dark:text-primary-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-slate-500" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleShareTelegram}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#229ED9] py-3 text-sm font-bold text-white shadow-xs transition hover:bg-[#1f8fc4] active:scale-[0.98]"
                >
                  <Send className="h-4 w-4" />
                  <span>Telegram</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => router.push(`/meet/${createdMeetup.shareToken}`)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-primary-700 active:scale-[0.99]"
              >
                <span>Enter Live Room</span>
                <span className="text-lg leading-none">&rarr;</span>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
