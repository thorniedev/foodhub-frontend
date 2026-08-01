"use client";

import {
  IoNavigateOutline,
  IoRefreshOutline,
  IoTrophyOutline,
} from "react-icons/io5";
import { FaStar } from "react-icons/fa";

import type { RecommendedStore } from "@/types/location";

interface VotingResultProps {
  winner: RecommendedStore;
  onRestart: () => void;
}

export default function VotingResult({ winner, onRestart }: VotingResultProps) {
  const mapUrl = `https://www.google.com/maps?q=${winner.latitude},${winner.longitude}`;

  return (
    <section className="overflow-hidden rounded-[30px] border border-primary-100 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 p-6 text-white shadow-lg sm:p-8 lg:p-10">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
        <IoTrophyOutline className="text-[34px] text-secondary-300" />
      </span>

      <p className="mt-6 text-[16px] font-semibold text-secondary-300">
        Group decision completed
      </p>
      <h2 className="mt-2 text-[30px] font-bold leading-tight sm:text-[38px]">
        {winner.localName || winner.name}
      </h2>
      <p className="mt-3 max-w-2xl text-[16px] leading-7 text-white/80">
        This store won the group vote using vote count, group recommendation
        score, fair travel distance, and store rating as tie breakers.
      </p>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[18px] bg-white/10 p-4">
          <p className="text-[15px] text-white/70">Votes</p>
          <p className="mt-1 text-[24px] font-bold">{winner.voteCount}</p>
        </div>
        <div className="rounded-[18px] bg-white/10 p-4">
          <p className="text-[15px] text-white/70">Group match</p>
          <p className="mt-1 text-[24px] font-bold">
            {winner.recommendationScore}%
          </p>
        </div>
        <div className="rounded-[18px] bg-white/10 p-4">
          <p className="text-[15px] text-white/70">Average travel</p>
          <p className="mt-1 text-[24px] font-bold">
            {winner.averageMemberDistanceKm.toFixed(1)} km
          </p>
        </div>
        <div className="rounded-[18px] bg-white/10 p-4">
          <p className="text-[15px] text-white/70">Rating</p>
          <p className="mt-1 flex items-center gap-2 text-[24px] font-bold">
            <FaStar className="text-yellow-300" /> {winner.averageRating}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href={mapUrl}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-secondary-500 px-5 text-[16px] font-semibold text-white transition hover:bg-secondary-600"
        >
          <IoNavigateOutline className="text-[21px]" />
          Get directions
        </a>

        <button
          type="button"
          onClick={onRestart}
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 text-[16px] font-semibold text-white transition hover:bg-white/15"
        >
          <IoRefreshOutline className="text-[21px]" />
          Start another group
        </button>
      </div>
    </section>
  );
}
