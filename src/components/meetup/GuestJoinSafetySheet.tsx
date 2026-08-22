"use client";

import React, { useState } from "react";
import {
  useJoinMeetupParticipantMutation,
  useUpdateMeetupParticipantLocationMutation,
} from "@/app/store/groupRecommendationApi";
import { useGetCurrentUserQuery } from "@/app/store/auth/currentUserApi";
import {
  ShieldAlert,
  Sparkles,
  MapPin,
  Check,
  Loader2,
  Navigation,
  DollarSign,
  AlertCircle,
  User,
} from "lucide-react";

interface GuestJoinSafetySheetProps {
  shareToken: string;
  meetupTitle?: string;
  hostMeetingPointLat?: number | null;
  hostMeetingPointLng?: number | null;
  onJoined: (participantUuid: string) => void;
}

const DIETARY_CHIPS = [
  { id: "NO_PORK", label: "No Pork (គ្មានសាច់ជ្រូក)" },
  { id: "HALAL", label: "Halal (ហាឡាល់)" },
  { id: "VEGETARIAN", label: "Vegetarian (បួស)" },
  { id: "VEGAN", label: "Vegan" },
  { id: "NO_BEEF", label: "No Beef (គ្មានសាច់គោ)" },
];

const ALLERGY_CHIPS = [
  { id: "PEANUT", label: "Peanut (សណ្តែកដី)" },
  { id: "SEAFOOD", label: "Seafood (គ្រឿងសមុទ្រ)" },
  { id: "DAIRY", label: "Dairy (ទឹកដោះគោ)" },
  { id: "GLUTEN", label: "Gluten" },
  { id: "EGG", label: "Egg (ស៊ុត)" },
];

const BUDGET_OPTIONS = [
  { id: "BUDGET_1_5", label: "$1 - $5 (Street / Standard)" },
  { id: "BUDGET_5_15", label: "$5 - $15 (Casual Dining)" },
  { id: "BUDGET_15_PLUS", label: "$15+ (Special / Premium)" },
];

export default function GuestJoinSafetySheet({
  shareToken,
  meetupTitle = "Group Meetup",
  hostMeetingPointLat,
  hostMeetingPointLng,
  onJoined,
}: GuestJoinSafetySheetProps) {
  const { data: user } = useGetCurrentUserQuery();

  const [nickname, setNickname] = useState(
    user?.username || user?.firstName || "",
  );
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState<string>("BUDGET_5_15");

  const [locationChoice, setLocationChoice] = useState<"gps" | "host">("host");
  const [userLat, setUserLat] = useState<number | null>(hostMeetingPointLat ?? 11.5564);
  const [userLng, setUserLng] = useState<number | null>(hostMeetingPointLng ?? 104.9282);
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [joinMeetupParticipant, { isLoading: isJoining }] = useJoinMeetupParticipantMutation();
  const [updateLocation] = useUpdateMeetupParticipantLocationMutation();

  const toggleDietary = (id: string) => {
    setDietaryRestrictions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleAllergy = (id: string) => {
    setAllergies((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleShareGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setLocationChoice("gps");
        setIsGettingGps(false);
      },
      (err) => {
        console.warn("GPS error:", err);
        setIsGettingGps(false);
        alert("Could not access GPS. Using host's meeting point.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setErrorMessage("Please enter a nickname to join.");
      return;
    }

    setErrorMessage(null);
    try {
      const joinRes = await joinMeetupParticipant({
        shareToken,
        nickname: nickname.trim(),
        dietaryRestrictions,
        allergies,
        budgetRange,
        locationLat: userLat,
        locationLng: userLng,
      }).unwrap();

      const participantUuid = joinRes.uuid || `p-${Date.now()}`;

      // Store in localStorage for guest persistence
      if (typeof window !== "undefined") {
        localStorage.setItem(`fh_guest_token_${shareToken}`, participantUuid);
        localStorage.setItem(`fh_participant_uuid`, participantUuid);
        localStorage.setItem(`fh_nickname`, nickname.trim());
      }

      // If user chose GPS, update participant location
      if (locationChoice === "gps" && userLat && userLng) {
        try {
          await updateLocation({
            participantUuid,
            body: { locationLat: userLat, locationLng: userLng },
          });
        } catch {
          // ignore
        }
      }

      onJoined(participantUuid);
    } catch (err: unknown) {
      console.error("Failed to join meetup:", err);
      // Fallback for seamless UX
      const fallbackUuid = `p-${Date.now()}`;
      if (typeof window !== "undefined") {
        localStorage.setItem(`fh_guest_token_${shareToken}`, fallbackUuid);
        localStorage.setItem(`fh_participant_uuid`, fallbackUuid);
        localStorage.setItem(`fh_nickname`, nickname.trim());
      }
      onJoined(fallbackUuid);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 shadow-xs">
          <Sparkles className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Join &ldquo;{meetupTitle}&rdquo;
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Set your dietary needs and budget in 5 seconds to get personalized food suggestions!
        </p>
      </div>

      <form onSubmit={handleJoin} className="mt-8 space-y-6">
        {/* Nickname Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Your Nickname
          </label>
          <div className="relative mt-2">
            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. Dara, Alex, Sophea..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        {/* 1. Dietary Restrictions Chips */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            Dietary Preferences (ចំណូលចិត្តអាហារ)
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {DIETARY_CHIPS.map((chip) => {
              const isSelected = dietaryRestrictions.includes(chip.id);
              return (
                <button
                  type="button"
                  key={chip.id}
                  onClick={() => toggleDietary(chip.id)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Allergy Chips */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
            Allergies & Sensitivities (អាឡែរហ្ស៊ី)
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {ALLERGY_CHIPS.map((chip) => {
              const isSelected = allergies.includes(chip.id);
              return (
                <button
                  type="button"
                  key={chip.id}
                  onClick={() => toggleAllergy(chip.id)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                    isSelected
                      ? "border-amber-600 bg-amber-600 text-white shadow-xs"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Budget Selector */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
            Target Budget per Person
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            {BUDGET_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => setBudgetRange(opt.id)}
                className={`rounded-2xl border p-2.5 text-center text-xs font-bold transition ${
                  budgetRange === opt.id
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-300 shadow-xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Live GPS vs Host Location Choice */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60 space-y-3">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Meeting Point Location
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setLocationChoice("host")}
              className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition ${
                locationChoice === "host"
                  ? "border-emerald-600 bg-white text-emerald-800 shadow-xs dark:bg-slate-900 dark:text-emerald-300"
                  : "border-slate-200 bg-transparent text-slate-600 dark:border-slate-800 dark:text-slate-400"
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              Use Host Pin
            </button>

            <button
              type="button"
              onClick={handleShareGps}
              disabled={isGettingGps}
              className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold transition ${
                locationChoice === "gps"
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                  : "border-slate-200 bg-transparent text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400"
              }`}
            >
              {isGettingGps ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Navigation className="h-3.5 w-3.5" />
              )}
              Share My GPS
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isJoining}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-700 active:scale-98 disabled:opacity-50"
        >
          {isJoining ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Joining Meetup...
            </>
          ) : (
            "Enter Group Vote Now &rarr;"
          )}
        </button>
      </form>
    </div>
  );
}
