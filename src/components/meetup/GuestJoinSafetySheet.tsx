"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  DollarSign,
  Loader2,
  MapPin,
  Navigation,
  ShieldAlert,
  Sparkles,
  User,
} from "lucide-react";

import { useGetCurrentUserQuery } from "@/app/store/auth/currentUserApi";
import {
  useJoinMeetupParticipantMutation,
  useUpdateMeetupParticipantLocationMutation,
} from "@/app/store/groupRecommendationApi";
import {
  useGetAllergenOptionsQuery,
  useGetDietaryTypeOptionsQuery,
  useGetMemberProfilesQuery,
} from "@/app/store/memberProfileApi";
import {
  saveStoredMeetupSession,
  type StoredMeetupSession,
} from "@/lib/meetup/meetup-session";
import type { SafetyOption } from "@/types/member-profile/member-profile";
import type {
  MeetupAudienceMode,
  MeetupLocationMode,
} from "@/types/meetup-api";

interface GuestJoinSafetySheetProps {
  shareToken: string;
  meetupUuid?: string | null;
  meetupTitle?: string;
  audienceMode?: MeetupAudienceMode | null;
  guestAllowed?: boolean;
  locationMode?: MeetupLocationMode | null;
  targetAreaName?: string | null;
  targetCity?: string | null;
  targetProvince?: string | null;
  onJoined: (session: StoredMeetupSession) => void;
}

const FALLBACK_DIETARY_OPTIONS: SafetyOption[] = [
  { uuid: "HALAL", code: "HALAL", name: "Halal", localName: "ហាឡាល់" },
  { uuid: "VEGETARIAN", code: "VEGETARIAN", name: "Vegetarian", localName: "បួស" },
  { uuid: "VEGAN", code: "VEGAN", name: "Vegan" },
  { uuid: "NO_PORK", code: "NO_PORK", name: "No pork", localName: "គ្មានសាច់ជ្រូក" },
  { uuid: "NO_BEEF", code: "NO_BEEF", name: "No beef", localName: "គ្មានសាច់គោ" },
];

const FALLBACK_ALLERGEN_OPTIONS: SafetyOption[] = [
  { uuid: "PEANUT", code: "PEANUT", name: "Peanut", localName: "សណ្តែកដី" },
  { uuid: "SEAFOOD", code: "SEAFOOD", name: "Seafood", localName: "គ្រឿងសមុទ្រ" },
  { uuid: "DAIRY", code: "DAIRY", name: "Dairy", localName: "ទឹកដោះគោ" },
  { uuid: "GLUTEN", code: "GLUTEN", name: "Gluten" },
  { uuid: "EGG", code: "EGG", name: "Egg", localName: "ស៊ុត" },
];

function getOptionLabel(option: SafetyOption): string {
  return option.localName || option.name || option.code;
}

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function toBudgetRange(min: number | null, max: number | null): string | null {
  if (min === null && max === null) {
    return null;
  }

  if (min !== null && max !== null) {
    return `${min}-${max}`;
  }

  return min !== null ? `${min}+` : `0-${max}`;
}

function getNumericInput(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function GuestJoinSafetySheet({
  shareToken,
  meetupUuid,
  meetupTitle = "FoodHub meetup",
  audienceMode,
  guestAllowed,
  locationMode,
  targetAreaName,
  targetCity,
  targetProvince,
  onJoined,
}: GuestJoinSafetySheetProps) {
  const normalizedLocationMode = locationMode === "PIN" ? "PIN" : "AREA";
  const isFriendRoom = audienceMode === "FRIENDS" && !guestAllowed;

  const { data: user } = useGetCurrentUserQuery();
  const { data: profilePage, isLoading: isLoadingProfiles } =
    useGetMemberProfilesQuery(undefined, {
      skip: !user,
    });
  const { data: allergenPage } = useGetAllergenOptionsQuery();
  const { data: dietaryPage } = useGetDietaryTypeOptionsQuery();

  const [joinMeetupParticipant, { isLoading: isJoining }] =
    useJoinMeetupParticipantMutation();
  const [updateLocation] = useUpdateMeetupParticipantLocationMutation();

  const profiles = useMemo(
    () => (profilePage?.contents ?? []).filter((profile) => profile.isActive),
    [profilePage?.contents],
  );
  const allergenOptions =
    allergenPage?.contents && allergenPage.contents.length > 0
      ? allergenPage.contents
      : FALLBACK_ALLERGEN_OPTIONS;
  const dietaryOptions =
    dietaryPage?.contents && dietaryPage.contents.length > 0
      ? dietaryPage.contents
      : FALLBACK_DIETARY_OPTIONS;

  const [selectedProfileUuid, setSelectedProfileUuid] = useState("");
  const [nickname, setNickname] = useState("");
  const [areaName, setAreaName] = useState(targetAreaName || "Phnom Penh");
  const [city, setCity] = useState(targetCity || "Phnom Penh");
  const [province, setProvince] = useState(targetProvince || "Phnom Penh");
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [dietaryTypes, setDietaryTypes] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState<number | null>(2);
  const [budgetMax, setBudgetMax] = useState<number | null>(8);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setAreaName(targetAreaName || "Phnom Penh");
    setCity(targetCity || "Phnom Penh");
    setProvince(targetProvince || "Phnom Penh");
  }, [targetAreaName, targetCity, targetProvince]);

  useEffect(() => {
    if (nickname || !user) {
      return;
    }

    setNickname(user.username || user.firstName || "");
  }, [nickname, user]);

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage("Current location is not available in this browser.");
      return;
    }

    setIsGettingLocation(true);
    setErrorMessage(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationLat(position.coords.latitude);
        setLocationLng(position.coords.longitude);
        setIsGettingLocation(false);
      },
      () => {
        setErrorMessage("Please allow location to join this pin-based meetup.");
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12_000,
      },
    );
  };

  const handleJoin = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (isFriendRoom && !user) {
      setErrorMessage("Please sign in to join this friend meetup.");
      return;
    }

    if (!isFriendRoom && !nickname.trim()) {
      setErrorMessage("Enter a nickname to join as a guest.");
      return;
    }

    if (
      normalizedLocationMode === "PIN" &&
      (locationLat === null || locationLng === null)
    ) {
      setErrorMessage("Please allow current location before joining.");
      return;
    }

    if (
      normalizedLocationMode === "AREA" &&
      (!areaName.trim() || !city.trim() || !province.trim())
    ) {
      setErrorMessage("Please provide area, city, and province.");
      return;
    }

    if (
      budgetMin !== null &&
      budgetMax !== null &&
      budgetMin > budgetMax
    ) {
      setErrorMessage("Budget minimum cannot be higher than budget maximum.");
      return;
    }

    const joinMode = isFriendRoom ? "FRIEND" : "GUEST";
    const displayName =
      joinMode === "FRIEND"
        ? nickname.trim() || user?.username || user?.firstName || "FoodHub member"
        : nickname.trim();
    const profileSnapshot =
      joinMode === "GUEST"
        ? {
            nickname: displayName,
            allergies,
            dietaryTypes,
            budgetMin,
            budgetMax,
          }
        : undefined;

    try {
      const participant = await joinMeetupParticipant({
        shareToken,
        nickname: displayName,
        guestNickname: joinMode === "GUEST" ? displayName : undefined,
        profileUuid: selectedProfileUuid || undefined,
        locationMode: normalizedLocationMode,
        ...(normalizedLocationMode === "PIN"
          ? {
              locationLat,
              locationLng,
            }
          : {
              targetAreaName: areaName.trim(),
              targetCity: city.trim(),
              targetProvince: province.trim(),
            }),
        ...(joinMode === "GUEST"
          ? {
              allergies,
              dietaryTypes,
              dietaryRestrictions: dietaryTypes,
              budgetMin,
              budgetMax,
              budgetRange: toBudgetRange(budgetMin, budgetMax),
              profileSnapshot,
              contextData: {
                profileSnapshot,
              },
            }
          : {}),
      }).unwrap();

      if (!participant.uuid) {
        setErrorMessage("The backend did not return a participant id.");
        return;
      }

      try {
        await updateLocation({
          participantUuid: participant.uuid,
          meetupUuid: meetupUuid ?? participant.meetupUuid ?? undefined,
          body:
            normalizedLocationMode === "PIN"
              ? {
                  locationLat,
                  locationLng,
                }
              : {
                  targetAreaName: areaName.trim(),
                  targetCity: city.trim(),
                  targetProvince: province.trim(),
                },
        }).unwrap();
      } catch (locationError) {
        console.warn("Participant location update skipped:", locationError);
      }

      const storedSession: StoredMeetupSession = {
        participantUuid: participant.uuid,
        guestToken: participant.guestToken ?? null,
        profileUuid: selectedProfileUuid || participant.profileUuid || null,
        nickname: displayName,
        joinMode,
        locationMode: normalizedLocationMode,
        targetAreaName: normalizedLocationMode === "AREA" ? areaName.trim() : null,
        targetCity: normalizedLocationMode === "AREA" ? city.trim() : null,
        targetProvince: normalizedLocationMode === "AREA" ? province.trim() : null,
        locationLat,
        locationLng,
        allergies,
        dietaryTypes,
        budgetMin,
        budgetMax,
        profileSnapshot,
      };

      saveStoredMeetupSession(shareToken, storedSession);
      onJoined(storedSession);
    } catch (error) {
      console.error("Failed to join meetup:", error);
      setErrorMessage("FoodHub could not join this meetup. Please try again.");
    }
  };

  if (isFriendRoom && !user) {
    return (
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950">
          <User className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
          Sign in to join
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
          This invite is for FoodHub friends. Sign in, choose a profile, then
          join the vote.
        </p>
        <Link
          href={`/login?returnTo=${encodeURIComponent(`/meet/${shareToken}`)}`}
          className="mt-5 inline-flex min-h-12 items-center justify-center rounded-2xl bg-emerald-600 px-6 text-sm font-black text-white shadow-md transition hover:bg-emerald-700"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-7">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950">
          <Sparkles className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Join {meetupTitle}
        </h2>
        <p className="mx-auto max-w-md text-sm leading-6 text-slate-500">
          Add the safety and location details FoodHub needs before showing food
          choices.
        </p>
      </div>

      <form onSubmit={handleJoin} className="mt-7 space-y-6">
        {isFriendRoom ? (
          <section className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
              FoodHub profile
              <select
                value={selectedProfileUuid}
                onChange={(event) => setSelectedProfileUuid(event.target.value)}
                disabled={isLoadingProfiles}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold normal-case tracking-normal text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="">Use default active profile</option>
                {profiles.map((profile) => (
                  <option key={profile.uuid} value={profile.uuid}>
                    {profile.profileName}
                    {profile.isDefault ? " - Default" : ""}
                  </option>
                ))}
              </select>
            </label>

            {profiles.length === 0 && !isLoadingProfiles && (
              <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                No active profile found. FoodHub will ask the backend to use
                your default active profile.
              </p>
            )}
          </section>
        ) : (
          <section>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
              Guest nickname
              <div className="relative mt-2">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="Your nickname"
                  className="h-12 w-full rounded-2xl border border-slate-300 bg-white pl-10 pr-4 text-sm font-semibold normal-case tracking-normal text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </label>
          </section>
        )}

        {normalizedLocationMode === "PIN" ? (
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                  <Navigation className="h-4 w-4 text-emerald-600" />
                  Current location
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Pin-based meetups need your current position.
                </p>
              </div>
              <button
                type="button"
                onClick={handleShareLocation}
                disabled={isGettingLocation}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-70"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                Allow location
              </button>
            </div>

            {locationLat !== null && locationLng !== null && (
              <p className="mt-3 rounded-xl bg-white px-3 py-2 font-mono text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                {locationLat.toFixed(6)}, {locationLng.toFixed(6)}
              </p>
            )}
          </section>
        ) : (
          <section className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60 sm:grid-cols-3">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Area
              <input
                value={areaName}
                onChange={(event) => setAreaName(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              City
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Province
              <input
                value={province}
                onChange={(event) => setProvince(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
          </section>
        )}

        {!isFriendRoom && (
          <section className="space-y-5">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                Dietary types
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {dietaryOptions.map((option) => {
                  const value = option.code || option.uuid;
                  const isSelected = dietaryTypes.includes(value);

                  return (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setDietaryTypes((current) => toggleValue(current, value))}
                      className={`inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                      {getOptionLabel(option)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-700">
                <ShieldAlert className="h-3.5 w-3.5" />
                Allergies
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {allergenOptions.map((option) => {
                  const value = option.code || option.uuid;
                  const isSelected = allergies.includes(value);

                  return (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setAllergies((current) => toggleValue(current, value))}
                      className={`inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition ${
                        isSelected
                          ? "border-amber-600 bg-amber-600 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                      {getOptionLabel(option)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Budget min
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    value={budgetMin ?? ""}
                    onChange={(event) => setBudgetMin(getNumericInput(event.target.value))}
                    className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm font-semibold normal-case tracking-normal text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </label>
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Budget max
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    value={budgetMax ?? ""}
                    onChange={(event) => setBudgetMax(getNumericInput(event.target.value))}
                    className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm font-semibold normal-case tracking-normal text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </label>
            </div>
          </section>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-3.5 text-sm font-semibold text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isJoining}
          className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-black text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
        >
          {isJoining ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Joining...
            </>
          ) : (
            "Join voting room"
          )}
        </button>
      </form>
    </div>
  );
}
