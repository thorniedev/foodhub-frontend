"use client";

import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { IoMdTime } from "react-icons/io";
import { FaStar, FaStore } from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";

import type { FoodItem } from "@/types/food";

type SpinWheelProps = {
  foods: FoodItem[];
};

// alternating slice colors pulled from the same palette used across the
// app (RecommendCardStack, RecommandSection) — cycles if there are more
// foods than colors listed here
const SLICE_COLORS = [
  "fill-primary-800",
  "fill-secondary-500",
  "fill-primary-600",
  "fill-secondary-400",
];

const SIZE = 300;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - 6;
const SPIN_DURATION = 4.2; // seconds
const EXTRA_SPINS = 6; // full rotations before landing, for effect

// angle 0 = top (12 o'clock), increasing clockwise — matches the fixed
// pointer position above the wheel
function pointOnCircle(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.sin(rad),
    y: CENTER - radius * Math.cos(rad),
  };
}

function sliceDPath(startAngle: number, endAngle: number) {
  const start = pointOnCircle(startAngle, RADIUS);
  const end = pointOnCircle(endAngle, RADIUS);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

function truncate(label: string, max = 12) {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

export default function SpinWheel({ foods }: SpinWheelProps) {
  const total = foods.length;
  const segAngle = 360 / Math.max(total, 1);

  // past ~8 slices there's no longer enough arc width for readable text
  // at any font size — switch to small photo thumbnails instead, which
  // stay recognizable far smaller than text does. Full names are still
  // shown in the result card once a spin lands.
  const useTextLabels = total <= 8;
  const labelRadius = RADIUS * 0.62;
  const segAngleRad = (segAngle * Math.PI) / 180;
  const arcWidthAtLabel = labelRadius * segAngleRad;
  const thumbSize = Math.max(14, Math.min(32, arcWidthAtLabel * 0.72));
  // bigger font when there's more room per slice, capped both ends
  const labelFontSize = Math.max(9, Math.min(15, segAngle * 0.55));

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<FoodItem | null>(null);
  const pendingIndexRef = useRef<number | null>(null);

  const slices = useMemo(
    () =>
      foods.map((food, i) => {
        const start = i * segAngle;
        const end = start + segAngle;
        const mid = start + segAngle / 2;
        return {
          food,
          start,
          end,
          mid,
          colorClass: SLICE_COLORS[i % SLICE_COLORS.length],
        };
      }),
    [foods, segAngle],
  );

  if (total === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        មិនមានមុខម្ហូបសម្រាប់បង្វិលទេ
      </div>
    );
  }

  const handleSpin = () => {
    if (spinning) return;

    const randomIndex = Math.floor(Math.random() * total);
    const targetCenter = slices[randomIndex].mid;

    // land targetCenter under the fixed top pointer, keep spinning forward
    // (never snap backward) by adding full turns on top of the delta
    const currentMod = ((rotation % 360) + 360) % 360;
    const desiredMod = (360 - targetCenter) % 360;
    let delta = desiredMod - currentMod;
    if (delta < 0) delta += 360;

    pendingIndexRef.current = randomIndex;
    setResult(null);
    setSpinning(true);
    setRotation((prev) => prev + EXTRA_SPINS * 360 + delta);
  };

  const handleSpinComplete = () => {
    setSpinning(false);
    if (pendingIndexRef.current !== null) {
      setResult(foods[pendingIndexRef.current]);
      pendingIndexRef.current = null;
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-10 px-4">
      <div className="relative w-full max-w-[460px] aspect-square mx-auto">
        {/* fixed pointer — doesn't rotate with the wheel */}
        <div
          className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1"
          style={{
            width: 0,
            height: 0,
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderTop: "20px solid var(--pointer-color, #7c2d12)",
          }}
        />

        <motion.svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          width="100%"
          height="100%"
          animate={{ rotate: rotation }}
          transition={{
            duration: SPIN_DURATION,
            ease: [0.14, 0.67, 0.1, 0.99],
          }}
          onAnimationComplete={handleSpinComplete}
          className="drop-shadow-xl"
        >
          <circle cx={CENTER} cy={CENTER} r={RADIUS} className="fill-white" />
          <defs>
            {!useTextLabels &&
              slices.map(({ food }) => (
                <clipPath key={`clip-${food.id}`} id={`wheel-thumb-${food.id}`}>
                  <circle
                    cx={CENTER}
                    cy={CENTER - labelRadius}
                    r={thumbSize / 2}
                  />
                </clipPath>
              ))}
          </defs>
          {slices.map(({ food, start, end, mid, colorClass }) => (
            <g key={food.id}>
              <path
                d={sliceDPath(start, end)}
                className={`${colorClass} stroke-white`}
                strokeWidth={2}
              />
              {useTextLabels ? (
                <g transform={`rotate(${mid}, ${CENTER}, ${CENTER})`}>
                  <text
                    x={CENTER}
                    y={CENTER - labelRadius}
                    // flip upright on the bottom half so it's never
                    // rendered upside-down — this is a rotate around the
                    // label's own point, so its position doesn't move,
                    // only its orientation does
                    transform={
                      mid > 90 && mid < 270
                        ? `rotate(180, ${CENTER}, ${CENTER - labelRadius})`
                        : undefined
                    }
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={labelFontSize}
                    className="fill-white font-medium select-none"
                  >
                    {truncate(food.name)}
                  </text>
                </g>
              ) : (
                <g transform={`rotate(${mid}, ${CENTER}, ${CENTER})`}>
                  <image
                    href={food.image}
                    x={CENTER - thumbSize / 2}
                    y={CENTER - labelRadius - thumbSize / 2}
                    width={thumbSize}
                    height={thumbSize}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath={`url(#wheel-thumb-${food.id})`}
                  />
                  <circle
                    cx={CENTER}
                    cy={CENTER - labelRadius}
                    r={thumbSize / 2}
                    fill="none"
                    stroke="white"
                    strokeWidth={1.4}
                  />
                </g>
              )}
            </g>
          ))}
        </motion.svg>

        {/* center spin button, sized relative to the wheel so it scales
            with it instead of staying a fixed pixel size */}
        <button
          type="button"
          onClick={handleSpin}
          disabled={spinning}
          aria-label="Spin the wheel"
          className="absolute left-1/2 top-1/2 z-10 flex aspect-square w-[20%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary-800 text-[clamp(11px,3.2vw,15px)] font-semibold text-white shadow-lg ring-4 ring-white transition-transform active:scale-90 disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed"
        >
          {spinning ? "..." : "បង្វិល"}
        </button>
      </div>

      {/* result reveal */}
      <div className="min-h-[140px] w-full max-w-xs">
        {result && !spinning && (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="flex items-center gap-3 rounded-[20px] border border-gray-100 bg-white p-3 shadow-md"
          >
            <img
              src={result.image}
              alt={result.name}
              className="h-16 w-16 shrink-0 rounded-[12px] object-cover"
            />
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-center gap-1.5 text-secondary-400">
                <FaStore className="text-base" />
                <p className="truncate text-[12px]">{result.store}</p>
              </div>
              <p className="truncate text-[17px] font-medium text-primary-900">
                {result.name}
              </p>
              <div className="flex items-center gap-3 text-[12px] text-primary-400">
                <span className="flex items-center gap-1 text-accent-400">
                  <FaStar className="text-base" />
                  {result.rating}
                </span>
                <span className="flex items-center gap-1">
                  <IoMdTime className="text-sm" />
                  {result.time}
                </span>
                <span className="flex items-center gap-1">
                  <MdDeliveryDining className="text-base" />
                  {result.distance}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
