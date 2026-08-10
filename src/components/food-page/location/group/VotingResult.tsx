"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import {
  IoCheckmarkCircle,
  IoCopyOutline,
  IoNavigateOutline,
  IoRefreshOutline,
  IoShareSocialOutline,
  IoSparklesOutline,
  IoTrophyOutline,
} from "react-icons/io5";
import { FaStar } from "react-icons/fa";

import type { RecommendedStore } from "@/types/location";

interface VotingResultProps {
  winner: RecommendedStore;
  winnerVoteCount: number;
  memberCount: number;
  shareUrl: string;
  onRestart: () => void;
}

const CONFETTI = [
  ["left-[6%]", "bg-secondary-400", 0.05],
  ["left-[12%]", "bg-primary-500", 0.15],
  ["left-[18%]", "bg-yellow-400", 0.3],
  ["left-[24%]", "bg-pink-400", 0.1],
  ["left-[31%]", "bg-cyan-400", 0.4],
  ["left-[38%]", "bg-secondary-500", 0.22],
  ["left-[45%]", "bg-primary-400", 0.35],
  ["left-[52%]", "bg-yellow-500", 0.08],
  ["left-[59%]", "bg-pink-500", 0.28],
  ["left-[66%]", "bg-cyan-500", 0.18],
  ["left-[73%]", "bg-secondary-400", 0.42],
  ["left-[80%]", "bg-primary-500", 0.12],
  ["left-[87%]", "bg-yellow-400", 0.33],
  ["left-[93%]", "bg-pink-400", 0.2],
] as const;

export default function VotingResult({
  winner,
  winnerVoteCount,
  memberCount,
  shareUrl,
  onRestart,
}: VotingResultProps) {
  const [copied, setCopied] = useState(false);

  const displayName = winner.localName?.trim() || winner.name;

  const imageUrl =
    winner.coverImageUrl || winner.logoUrl || "/Image/store/default-store.png";

  const mapUrl = `https://www.google.com/maps?q=${winner.latitude},${winner.longitude}`;

  const copyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const shareLink = async () => {
    if (!shareUrl) return;

    if (navigator.share) {
      await navigator.share({
        title: `${displayName} won our FoodHub vote`,
        text: "Our group picked this restaurant.",
        url: shareUrl,
      });
      return;
    }

    await copyLink();
  };

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 250,
        damping: 24,
      }}
      className="relative overflow-hidden rounded-[28px] border border-yellow-100 bg-gradient-to-br from-yellow-50 via-white to-primary-50 p-4 shadow-sm sm:p-6 lg:p-8"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {CONFETTI.map(([position, color, delay], index) => (
          <motion.span
            key={`${position}-${index}`}
            initial={{
              y: -30,
              rotate: 0,
              opacity: 0,
            }}
            animate={{
              y: [0, 190, 420],
              rotate: [0, 180, 420],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2.7,
              delay,
              repeat: Infinity,
              repeatDelay: 1.2,
            }}
            className={`absolute top-0 h-3 w-2 rounded-sm ${position} ${color}`}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 18,
              delay: 0.1,
            }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400 text-yellow-950 shadow-[0_12px_35px_rgba(250,204,21,0.35)]"
          >
            <IoTrophyOutline className="text-[42px]" />
          </motion.div>

          <div className="mt-4 flex items-center justify-center gap-2 text-secondary-500">
            <IoSparklesOutline className="text-[22px]" />
            <p className="text-[17px] font-semibold">We have a winner!</p>
            <IoSparklesOutline className="text-[22px]" />
          </div>

          <h2 className="mt-2 text-[23px] font-bold leading-[1.45] text-primary-900 sm:text-[25px]">
            អ្នកឈ្នះគឺ {displayName} 🎉
          </h2>

          <p className="mx-auto mt-2 max-w-2xl text-[17px] leading-7 text-gray-600">
            ក្រុមរបស់អ្នកបានជ្រើសរើសហាងនេះ។
            ដល់ពេលរៀបចំដំណើរទៅញ៉ាំអាហារជាមួយគ្នា។
          </p>
        </div>

        <article className="mt-6 overflow-hidden rounded-[24px] border border-white bg-white shadow-[0_16px_45px_rgba(15,23,42,0.10)]">
          <div className="grid md:grid-cols-[minmax(260px,42%)_minmax(0,58%)]">
            <div
              className="min-h-[240px] bg-gray-100 bg-cover bg-center"
              style={{
                backgroundImage: `url("${imageUrl}")`,
              }}
            />

            <div className="flex min-w-0 flex-col p-5 sm:p-6">
              <span className="w-fit rounded-full bg-yellow-100 px-3 py-2 text-[17px] font-bold text-yellow-700">
                🏆 Group favorite
              </span>

              <h3 className="mt-4 text-[22px] font-bold leading-[1.45] text-primary-900 sm:text-[25px]">
                {displayName}
              </h3>

              <p className="mt-2 line-clamp-3 text-[17px] leading-7 text-gray-600">
                {winner.description ||
                  winner.addressLine ||
                  "ហាងដែលសមស្របសម្រាប់ក្រុមរបស់អ្នក។"}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <span className="flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-2 text-[17px] font-semibold text-yellow-700">
                  <FaStar />
                  {winner.averageRating > 0
                    ? winner.averageRating.toFixed(1)
                    : "ហាងថ្មី"}
                </span>

                <span className="rounded-full bg-primary-50 px-3 py-2 text-[17px] font-semibold text-primary-700">
                  {winner.distanceKm.toFixed(1)} km
                </span>

                <span className="rounded-full bg-secondary-50 px-3 py-2 text-[17px] font-semibold text-secondary-600">
                  {winnerVoteCount}/{memberCount} សំឡេង
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary-800 px-5 text-[17px] font-semibold text-white transition hover:bg-primary-700"
                >
                  <IoNavigateOutline className="text-[21px]" />
                  មើលលើផែនទី
                </a>

                <button
                  type="button"
                  onClick={shareLink}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-secondary-500 px-5 text-[17px] font-semibold text-white transition hover:bg-secondary-600"
                >
                  <IoShareSocialOutline className="text-[21px]" />
                  ចែករំលែកលទ្ធផល
                </button>
              </div>
            </div>
          </div>
        </article>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <button
            type="button"
            onClick={copyLink}
            className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary-200 bg-white px-5 text-[17px] font-semibold text-primary-800 dark:text-primary-dark transition hover:bg-primary-50"
          >
            {copied ? (
              <IoCheckmarkCircle className="text-[21px]" />
            ) : (
              <IoCopyOutline className="text-[21px]" />
            )}
            {copied ? "បានចម្លង" : "ចម្លងតំណលទ្ធផល"}
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 text-[17px] font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <IoRefreshOutline className="text-[21px]" />
            ចាប់ផ្ដើមក្រុមថ្មី
          </button>
        </div>
      </div>
    </motion.section>
  );
}
