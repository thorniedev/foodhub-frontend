"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Link2,
  Loader2,
  MapPin,
  Navigation,
  Send,
  Shield,
  Sparkles,
  Users,
  Vote,
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

  const { data: user } = useGetCurrentUserQuery();
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

  const stepClass =
    "rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6";
  const fieldClass =
    "mt-2 h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
  const labelClass = "text-sm font-bold text-slate-800 dark:text-slate-200";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <section className="overflow-hidden rounded-3xl bg-linear-to-br from-primary-800 via-primary-900 to-primary-950 p-6 text-white shadow-xl sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-primary-100">
          <Sparkles className="h-3.5 w-3.5" />
          ការណាត់ញ៉ាំអាហារជាក្រុម
        </span>
        <h1 className="mt-4 text-2xl! font-black leading-tight tracking-tight sm:text-3xl! lg:text-4xl!">
          បង្កើតការណាត់ញ៉ាំអាហារ
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-primary-50/90">
          បង្កើតបន្ទប់សម្រាប់មិត្តភក្តិ តំណអញ្ជើញភ្ញៀវ ឬបន្ទប់ចម្រុះ។
          ជ្រើសរើសតាមតំបន់ ឬចំណុច រួចឲ្យអ្នកគ្រប់គ្នាបោះឆ្នោត
          លើម្ហូបដែលមានសុវត្ថិភាព។
        </p>
      </section>

      <form onSubmit={handleCreateMeetup} className="space-y-5">
        <section className={stepClass}>
          <StepHeading
            step={1}
            title="តើអញ្ជើញអ្នកណា?"
            hint="កំណត់ថានរណាអាចចូលរួមក្នុងបន្ទប់នេះ។"
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              {
                value: "friends",
                label: "មិត្តភក្តិ",
                description: "អញ្ជើញមិត្តភក្តិ FoodHub ដែលមានគណនី។",
                icon: Users,
              },
              {
                value: "guest",
                label: "ភ្ញៀវ",
                description: "ចែករំលែកតំណសាធារណៈ មិនត្រូវការគណនី។",
                icon: Link2,
              },
              {
                value: "mixed",
                label: "ចម្រុះ",
                description: "មិត្តភក្តិ និងតំណភ្ញៀវ ដំណើរការជាមួយគ្នា។",
                icon: Sparkles,
              },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = mode === item.value;

              return (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => setMode(item.value as MeetupMode)}
                  aria-pressed={isActive}
                  className={`flex flex-col gap-2 rounded-2xl border p-4 text-left transition active:scale-[0.99] ${
                    isActive
                      ? "border-primary-600 bg-primary-50 ring-2 ring-primary-500/20 dark:bg-primary-950/40"
                      : "border-slate-200 bg-white hover:border-primary-200 dark:border-slate-800 dark:bg-slate-950/40"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      isActive
                        ? "bg-primary-600 text-white"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {item.label}
                  </span>
                  <span className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {item.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className={stepClass}>
          <StepHeading
            step={2}
            title="ព័ត៌មានការណាត់ជួប"
            hint="ដាក់ឈ្មោះ រយៈពេលបោះឆ្នោត និងវិធីបោះឆ្នោត។"
          />

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="meetup-title" className={labelClass}>
                ឈ្មោះការណាត់ជួប
              </label>
              <input
                id="meetup-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="អាហារថ្ងៃត្រង់នៅភ្នំពេញ"
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="meetup-duration" className={labelClass}>
                <Clock className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />
                រយៈពេលបោះឆ្នោត
              </label>
              <select
                id="meetup-duration"
                value={durationMinutes}
                onChange={(event) =>
                  setDurationMinutes(getNumberValue(event.target.value, 120))
                }
                className={fieldClass}
              >
                <option value={30}>៣០ នាទី</option>
                <option value={60}>១ ម៉ោង</option>
                <option value={120}>២ ម៉ោង</option>
                <option value={1440}>២៤ ម៉ោង</option>
              </select>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-black text-slate-900 dark:text-white">
                  <Vote className="h-4 w-4 shrink-0 text-primary-600" />
                  វិធីបោះឆ្នោត
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {votingChoice === "APPROVAL"
                    ? "អ្នកចូលរួមអាចជ្រើសរើសម្ហូបច្រើនមុខបាន។"
                    : "អ្នកចូលរួមម្នាក់មួយសំឡេង ហើយអាចផ្លាស់ប្ដូរបាន។"}
                </p>
              </div>

              <div className="grid shrink-0 grid-cols-2 gap-1 rounded-xl bg-white p-1 shadow-xs dark:bg-slate-900">
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
          </div>
        </section>

        <section className={stepClass}>
          <StepHeading
            step={3}
            title="ទីតាំងណាត់ជួប"
            hint="ជ្រើសរើសតំបន់ ឬកំណត់ចំណុចជាក់លាក់លើផែនទី។"
          />

          <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-950/60 sm:max-w-xs">
            {[
              { value: "area", label: "តាមតំបន់" },
              { value: "pin", label: "តាមចំណុច" },
            ].map((item) => (
              <button
                type="button"
                key={item.value}
                onClick={() => setLocationMode(item.value as MeetupLocationMode)}
                aria-pressed={locationMode === item.value}
                className={`min-h-10 rounded-lg px-4 text-sm font-bold transition ${
                  locationMode === item.value
                    ? "bg-primary-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {locationMode === "area" ? (
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div>
                <label htmlFor="target-area" className={labelClass}>
                  តំបន់
                </label>
                <input
                  id="target-area"
                  value={targetAreaName}
                  onChange={(event) => setTargetAreaName(event.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="target-city" className={labelClass}>
                  ក្រុង
                </label>
                <input
                  id="target-city"
                  value={targetCity}
                  onChange={(event) => setTargetCity(event.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="target-province" className={labelClass}>
                  ខេត្ត
                </label>
                <input
                  id="target-province"
                  value={targetProvince}
                  onChange={(event) => setTargetProvince(event.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                <LocationPickerMap
                  value={pin}
                  selectedPlace={pinPlace}
                  onChange={setPin}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <div>
                  <label htmlFor="pin-lat" className={labelClass}>
                    រយៈទទឹង (latitude)
                  </label>
                  <input
                    id="pin-lat"
                    type="number"
                    step="0.000001"
                    value={pin.latitude}
                    onChange={(event) =>
                      setPin((current) => ({
                        ...current,
                        latitude: getNumberValue(
                          event.target.value,
                          current.latitude,
                        ),
                      }))
                    }
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="pin-lng" className={labelClass}>
                    រយៈបណ្ដោយ (longitude)
                  </label>
                  <input
                    id="pin-lng"
                    type="number"
                    step="0.000001"
                    value={pin.longitude}
                    onChange={(event) =>
                      setPin((current) => ({
                        ...current,
                        longitude: getNumberValue(
                          event.target.value,
                          current.longitude,
                        ),
                      }))
                    }
                    className={fieldClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isGettingGps}
                  className="mt-2 inline-flex h-12 items-center justify-center gap-2 self-end rounded-2xl bg-primary-100 px-4 text-sm font-bold text-primary-800 transition hover:bg-primary-200 disabled:cursor-wait disabled:opacity-70 dark:bg-primary-950 dark:text-primary-300"
                >
                  {isGettingGps ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                  ទីតាំងបច្ចុប្បន្ន
                </button>
              </div>

              <div>
                <p className={labelClass}>
                  <MapPin className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />
                  រង្វង់ស្វែងរក
                </p>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {RADIUS_OPTIONS.map((radius) => (
                    <button
                      type="button"
                      key={radius}
                      onClick={() => setSearchRadiusKm(radius)}
                      aria-pressed={searchRadiusKm === radius}
                      className={`min-h-11 rounded-xl text-sm font-bold transition ${
                        searchRadiusKm === radius
                          ? "bg-primary-600 text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                      }`}
                    >
                      {radius} គ.ម
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  អ្នកចូលរួមដែលនៅឆ្ងាយជាងរង្វង់នេះ នឹងមិនអាចបោះឆ្នោតបានទេ។
                </p>
              </div>
            </div>
          )}
        </section>

        <section className={stepClass}>
          <StepHeading
            step={4}
            title={mode === "guest" ? "ចំនួនភ្ញៀវ" : "អញ្ជើញមិត្តភក្តិ"}
            hint={
              mode === "guest"
                ? "FoodHub រក្សាកន្លែងសម្រាប់ម្ចាស់ផ្ទះ បូកនឹងចំនួនភ្ញៀវ។"
                : mode === "mixed"
                  ? "មិត្តភក្តិដែលបានអញ្ជើញចូលរួមផ្ទាល់ អ្នកផ្សេងអាចប្រើតំណបាន។"
                  : "មានតែមិត្តភក្តិដែលបានជ្រើសរើសទេដែលអាចចូលរួម។"
            }
          />

          {mode !== "guest" ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-500">
                  ជ្រើសរើសយ៉ាងតិចម្នាក់ សម្រាប់របៀបមិត្តភក្តិ។
                </p>
                <span className="shrink-0 rounded-full bg-primary-50 px-3 py-1 text-xs font-black text-primary-700 dark:bg-primary-950/60 dark:text-primary-300">
                  បានជ្រើស {selectedFriendUuids.length}
                </span>
              </div>

              {isLoadingFriends ? (
                <div className="flex min-h-32 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800">
                  <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                </div>
              ) : friends.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm leading-6 text-slate-500 dark:border-slate-700">
                  មិនទាន់មានមិត្តភក្តិ FoodHub ទេ។
                  ប្រើរបៀបភ្ញៀវដើម្បីបង្កើតតំណអញ្ជើញសាធារណៈ។
                </p>
              ) : (
                <div className="grid max-h-80 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
                  {friends.map((friend) => {
                    const isSelected = selectedFriendUuids.includes(
                      friend.userUuid,
                    );

                    return (
                      <button
                        type="button"
                        key={friend.friendshipUuid}
                        onClick={() => toggleFriend(friend.userUuid)}
                        aria-pressed={isSelected}
                        className={`flex min-h-20 items-start gap-3 rounded-2xl border p-4 text-left transition ${
                          isSelected
                            ? "border-primary-600 bg-primary-50 dark:bg-primary-950/40"
                            : "border-slate-200 bg-white hover:border-primary-200 dark:border-slate-800 dark:bg-slate-950/40"
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
                          <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary-700 dark:text-primary-400">
                            <Shield className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">
                              {friend.defaultProfileName ||
                                "ប្រវត្តិរូបលំនាំដើម"}
                            </span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 sm:max-w-xs">
              <label htmlFor="guest-count" className={labelClass}>
                ចំនួនភ្ញៀវដែលរំពឹងទុក
              </label>
              <input
                id="guest-count"
                type="number"
                min={1}
                max={99}
                value={expectedGuestCount}
                onChange={(event) =>
                  setExpectedGuestCount(
                    Math.max(1, getNumberValue(event.target.value, 1)),
                  )
                }
                className={fieldClass}
              />
            </div>
          )}
        </section>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold leading-6 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300"
          >
            {errorMessage}
          </div>
        )}

        {/*
          * Only the mutation state drives this button. Gating it on the user
          * query instead made the server render the loading variant and the
          * client the idle one, which broke hydration on every visit; a signed
          * out visitor is caught by the submit handler.
          */}
        <button
          type="submit"
          disabled={isCreating}
          className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 text-base font-black text-white shadow-lg transition hover:bg-primary-700 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
        >
          {isCreating ? (
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
        <Dialog
          open={Boolean(createdMeetup)}
          onOpenChange={() => setCreatedMeetup(null)}
        >
          <DialogContent className="w-full rounded-3xl border-0 bg-white p-6 shadow-2xl dark:bg-slate-900 sm:max-w-lg sm:p-8">
            <DialogHeader className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <DialogTitle className="text-xl font-bold leading-normal text-slate-900 dark:text-white sm:text-2xl">
                បង្កើតការណាត់ជួបជោគជ័យ!
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                រក្សាទុកតំណនេះ — វានឹងមិនបង្ហាញម្ដងទៀតទេ។
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  តំណអញ្ជើញ
                </span>
                <p className="select-all truncate rounded-xl border border-gray-200/80 bg-white px-3 py-2 font-mono text-sm font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
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
                      <span className="text-primary-700 dark:text-primary-400">
                        បានចម្លង!
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-slate-500" />
                      <span>ចម្លងតំណ</span>
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
                <span>ចូលបន្ទប់បោះឆ្នោត</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface StepHeadingProps {
  step: number;
  title: string;
  hint: string;
}

function StepHeading({ step, title, hint }: StepHeadingProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-sm font-black text-white">
        {step}
      </span>
      <div className="min-w-0">
        <h2 className="text-base! font-black text-slate-900 dark:text-white">
          {title}
        </h2>
        <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      </div>
    </div>
  );
}
