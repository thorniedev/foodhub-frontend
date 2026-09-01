"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import { MeetupWinningCardResponse } from "@/types/meetup-api";
import {
  MapPin,
  Trophy,
  Share2,
  Check,
  Star,
  Compass,
  Send,
  Sparkles,
} from "lucide-react";

interface MeetupWinnerCelebrationProps {
  winningCard: MeetupWinningCardResponse;
  shareToken?: string;
}

export default function MeetupWinnerCelebration({
  winningCard,
  shareToken,
}: MeetupWinnerCelebrationProps) {
  const [copied, setCopied] = useState(false);

  // Trigger confetti burst on mount
  useEffect(() => {
    try {
      const end = Date.now() + 3 * 1000;
      const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch (err) {
      console.warn("Confetti animation failed:", err);
    }
  }, []);

  const restaurantName =
    winningCard.storeName ||
    winningCard.winningCandidateName ||
    "Top Voted Restaurant";

  const foodName =
    winningCard.foodName ||
    winningCard.winningCandidateName ||
    "Selected Group Choice";

  const storeSearchUrl =
    winningCard.storeName || winningCard.storeAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          [winningCard.storeName, winningCard.storeAddress]
            .filter(Boolean)
            .join(", "),
        )}`
      : "";

  const directionsUrl =
    winningCard.mapsDirectionsUrl ||
    storeSearchUrl ||
    (winningCard.meetingPointLat != null && winningCard.meetingPointLng != null
      ? `https://www.google.com/maps/dir/?api=1&destination=${winningCard.meetingPointLat},${winningCard.meetingPointLng}`
      : "https://www.google.com/maps");

  const handleShare = async () => {
    const currentUrl =
      typeof window !== "undefined"
        ? window.location.href
        : shareToken
          ? `/meetup/result/${shareToken}`
          : "";
    const shareText = `👑 Winner Announced for "${winningCard.title}"!\nWe're dining at ${restaurantName} (${foodName}).\nDirections: ${directionsUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `FoodHub Group Result: ${restaurantName}`,
          text: shareText,
          url: currentUrl,
        });
        return;
      } catch {
        // fallback to copy
      }
    }

    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTelegramShare = () => {
    const currentUrl =
      typeof window !== "undefined"
        ? window.location.href
        : shareToken
          ? `/meetup/result/${shareToken}`
          : "";
    const text = encodeURIComponent(
      `👑 Winner for "${winningCard.title}":\n🍽️ ${restaurantName}\n📍 Open in Google Maps: ${directionsUrl}`,
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${text}`, "_blank");
  };

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      {/* Winner Hero Card */}
      <div className="overflow-hidden rounded-3xl border border-primary-500/30 bg-white shadow-2xl dark:border-primary-500/20 dark:bg-slate-900">
        {/* Banner with Trophy */}
        <div className="relative bg-linear-to-br from-primary-600 via-primary-700 to-primary-900 px-6 pt-10 pb-8 text-center text-white">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-3xl bg-accent-400 text-slate-950 shadow-xl shadow-accent-400/30 animate-bounce">
            <Trophy className="h-10 w-10" />
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-black/20 px-3 py-1 text-sm font-black uppercase tracking-wider text-accent-300 backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 shrink-0" /> សម្រេចចិត្តរួមរួចរាល់
          </span>

          <p className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            {restaurantName}
          </p>

          <p className="mt-1 text-sm font-medium text-primary-100">
            {winningCard.title || "ការណាត់ញ៉ាំអាហារ"}
          </p>

          {/* Vote tally pill */}
          <div className="mt-4 inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-2xl bg-white/15 px-4 py-1.5 text-sm font-bold text-white backdrop-blur-sm shadow-inner">
            <span>👑 ឈ្នះដោយ {winningCard.totalVotes || 1} សំឡេង</span>
            {winningCard.distanceKm !== undefined && (
              <>
                <span className="text-white/40">•</span>
                <span className="flex items-center gap-1">
                  <Compass className="h-3 w-3" />
                  ចម្ងាយ {winningCard.distanceKm.toFixed(1)} គ.ម
                </span>
              </>
            )}
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Food Picture & Name */}
          <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800">
              <Image
                src={winningCard.foodPhotoUrl || "/Image/food01.png"}
                alt={foodName}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold text-slate-900 dark:text-white">
                {foodName}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                {winningCard.rating && (
                  <span className="flex items-center gap-1 font-bold text-accent-500">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {winningCard.rating}
                  </span>
                )}
                {winningCard.price && (
                  <span className="flex items-center gap-0.5 font-semibold text-primary-600 dark:text-primary-400">
                    ${winningCard.price.toFixed(2)}
                  </span>
                )}
                {winningCard.storeAddress && (
                  <span className="w-full truncate sm:w-auto">{winningCard.storeAddress}</span>
                )}
              </div>
            </div>
          </div>

          {/* Primary CTA: Direct Google Maps Navigation */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 hover:bg-primary-700 active:scale-98 transition text-base"
          >
            <MapPin className="w-5 h-5 shrink-0" />
            បើកផែនទី
          </a>

          {/* Secondary Actions */}
          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleShare}
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 shrink-0 text-primary-600" /> បានចម្លង!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 shrink-0" /> ចែករំលែក
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleTelegramShare}
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#229ED9] py-3 text-sm font-bold text-white shadow-xs transition hover:bg-[#1f8fc4]"
            >
              <Send className="h-4 w-4 shrink-0" /> Telegram
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
