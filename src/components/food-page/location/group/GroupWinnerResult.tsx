"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  IoCheckmarkCircle,
  IoCopyOutline,
  IoLocationOutline,
  IoNavigateOutline,
  IoRefreshOutline,
  IoShareSocialOutline,
  IoTrophyOutline,
} from "react-icons/io5";
import { FaStar, FaStore } from "react-icons/fa";

import type { RecommendedStore } from "@/types/location";

interface GroupWinnerResultProps {
  winner: RecommendedStore;
  winnerVoteCount: number;
  memberCount: number;
  shareUrl: string;
  compact?: boolean;
  onRestart: () => void;
}

export default function GroupWinnerResult({
  winner,
  winnerVoteCount,
  memberCount,
  shareUrl,
  compact = false,
  onRestart,
}: GroupWinnerResultProps) {
  const [copied, setCopied] = useState(false);

  const displayName = winner.localName?.trim() || winner.name;

  const imageUrl = winner.coverImageUrl || winner.logoUrl || "";

  const mapUrl = `https://www.google.com/maps?q=${winner.latitude},${winner.longitude}`;

  const copyLink = async () => {
    if (!shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);

      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const shareResult = async () => {
    if (!shareUrl) {
      return;
    }

    if (navigator.share) {
      await navigator.share({
        title: `${displayName} won our FoodHub vote`,
        text: "Our group picked this restaurant",
        url: shareUrl,
      });

      return;
    }

    await copyLink();
  };

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 250,
        damping: 24,
      }}
      className={`mx-auto w-full max-w-4xl ${compact ? "pb-1" : "py-2"}`}
    >
      <div className="pr-14 text-center sm:pr-0">
        <div
          className="
            mx-auto flex h-14 w-14
            items-center justify-center
            rounded-full
            bg-secondary-50
            text-secondary-600
          "
        >
          <IoTrophyOutline className="text-[29px]" />
        </div>

        <span
          className="
            mt-3 inline-flex
            items-center gap-2
            rounded-full
            bg-secondary-50
            px-3 py-1.5
            text-[17px] font-bold
            text-secondary-600
          "
        >
          <IoTrophyOutline className="text-[18px]" />
          We have a winner
        </span>

        <p className="mx-auto mt-3 max-w-3xl text-[22px] font-bold leading-[1.45] text-primary-900 sm:text-[25px]">
          {displayName}
        </p>

        <p className="mx-auto mt-2 max-w-2xl text-[17px] leading-8 text-gray-500">
          ក្រុមរបស់អ្នកបានសម្រេចចិត្តរួចហើយ។ មើលព័ត៌មានហាង ទីតាំង
          និងចែករំលែកលទ្ធផលនៅខាងក្រោម។
        </p>
      </div>

      <div className="mt-5 overflow-hidden rounded-[22px] border border-gray-200 bg-white">
        <div className="grid md:grid-cols-[220px_minmax(0,1fr)]">
          <div className="relative min-h-[180px] bg-primary-50 md:min-h-[230px]">
            {imageUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url("${imageUrl}")`,
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <FaStore className="text-[46px] text-primary-700" />
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="
                  rounded-full
                  bg-secondary-50
                  px-3 py-1.5
                  text-[17px] font-bold
                  text-secondary-600
                "
              >
                Group favorite
              </span>

              <span
                className="
                  rounded-full
                  bg-primary-50
                  px-3 py-1.5
                  text-[17px] font-semibold
                  text-primary-800 dark:text-primary-dark
                "
              >
                {winnerVoteCount}/{memberCount} សំឡេង
              </span>
            </div>

            <p className="mt-4 text-[21px] font-bold leading-[1.45] text-primary-900 sm:text-[23px]">
              {displayName}
            </p>

            <div className="mt-2 flex items-start gap-2 text-[17px] leading-8 text-gray-600">
              <IoLocationOutline className="mt-1 shrink-0 text-primary-700" />

              <span>{winner.addressLine || "មិនមានអាសយដ្ឋាន"}</span>
            </div>

            {winner.description && (
              <p className="mt-2 line-clamp-2 text-[17px] leading-8 text-gray-500">
                {winner.description}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className="
                  inline-flex items-center gap-1.5
                  rounded-full
                  bg-secondary-50
                  px-3 py-1.5
                  text-[17px] font-semibold
                  text-secondary-600
                "
              >
                <FaStar />

                {winner.averageRating > 0
                  ? winner.averageRating.toFixed(1)
                  : "ហាងថ្មី"}
              </span>

              <span
                className="
                  rounded-full
                  bg-primary-50
                  px-3 py-1.5
                  text-[17px] font-semibold
                  text-primary-800 dark:text-primary-dark
                "
              >
                {winner.distanceKm.toFixed(1)} km
              </span>

              <span
                className="
                  rounded-full
                  bg-gray-100
                  px-3 py-1.5
                  text-[17px] font-semibold
                  text-gray-600
                "
              >
                Match {winner.recommendationScore}%
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="
                  flex min-h-12
                  items-center justify-center gap-2
                  rounded-full
                  bg-primary-800
                  px-5
                  text-[17px] font-bold text-white
                  transition
                  hover:bg-primary-700
                "
              >
                <IoNavigateOutline className="text-[20px]" />
                មើលលើផែនទី
              </a>

              <button
                type="button"
                onClick={() => void shareResult()}
                className="
                  flex min-h-12
                  items-center justify-center gap-2
                  rounded-full
                  bg-secondary-500
                  px-5
                  text-[17px] font-bold text-white
                  transition
                  hover:bg-secondary-600
                "
              >
                <IoShareSocialOutline className="text-[20px]" />
                ចែករំលែកលទ្ធផល
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
        <button
          type="button"
          onClick={() => void copyLink()}
          className="
            flex min-h-11
            items-center justify-center gap-2
            rounded-full
            border border-primary-200
            bg-white
            px-5
            text-[17px] font-semibold
            text-primary-800 dark:text-primary-dark
            transition
            hover:bg-primary-50
          "
        >
          {copied ? (
            <IoCheckmarkCircle className="text-[20px]" />
          ) : (
            <IoCopyOutline className="text-[20px]" />
          )}

          {copied ? "បានចម្លង" : "ចម្លងតំណលទ្ធផល"}
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="
            flex min-h-11
            items-center justify-center gap-2
            rounded-full
            border border-gray-200
            bg-white
            px-5
            text-[17px] font-semibold
            text-primary-900
            transition
            hover:bg-gray-50
          "
        >
          <IoRefreshOutline className="text-[20px]" />
          ចាប់ផ្ដើមក្រុមថ្មី
        </button>
      </div>
    </motion.section>
  );
}
