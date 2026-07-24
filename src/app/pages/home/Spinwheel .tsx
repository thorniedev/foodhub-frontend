"use client";

import React, { useMemo, useRef, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import { IoMdTime } from "react-icons/io";
import { FaStar, FaStore } from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";

import type { FoodItem } from "@/app/types/food";

type SpinWheelProps = {
  foods: FoodItem[];
};

// alternating slice fill colors, pulled from the same palette used across
// the app (RecommendCardStack, RecommandSection)
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

  // text runs radially for every slice regardless of count — as slices
  // get thinner, the label starts further from center (where the slice
  // is already wider), so a fixed font size still has room to fit
  const labelInnerRadius =
    RADIUS * Math.min(0.5, 0.28 + Math.max(0, total - 8) * 0.012);
  const labelOuterRadius = RADIUS * 0.93;
  const labelFontSize = 16;

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [isDraggingWheel, setIsDraggingWheel] = useState(false);
  const [result, setResult] = useState<FoodItem | null>(null);
  const pendingIndexRef = useRef<number | null>(null);
  const wheelWrapRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{ lastAngle: number; accum: number } | null>(
    null,
  );
  const DRAG_SPIN_THRESHOLD = 12; // degrees of net rotation to count as an intentional spin, not just a nudge

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

  // angle of a screen point relative to the wheel's own center, in our
  // 0-at-top / clockwise-increasing convention
  const getAngleFromPoint = (clientX: number, clientY: number) => {
    const rect = wheelWrapRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rawDeg = (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
    return (((rawDeg + 90) % 360) + 360) % 360;
  };

  // shortest signed angular difference from `from` to `to`, in (-180, 180]
  const angleDelta = (from: number, to: number) => {
    const diff = to - from;
    return ((((diff + 180) % 360) + 360) % 360) - 180;
  };

  // direction: 1 = clockwise (button default), -1 = counterclockwise —
  // lets a manual drag continue spinning the way it was already flicked
  // instead of always snapping to one direction
  const handleSpin = (direction: 1 | -1 = 1) => {
    if (spinning) return;

    const randomIndex = Math.floor(Math.random() * total);
    const targetCenter = slices[randomIndex].mid;

    const currentMod = ((rotation % 360) + 360) % 360;
    const desiredMod = (360 - targetCenter) % 360;
    let delta = (((desiredMod - currentMod) % 360) + 360) % 360; // normalized to [0, 360)

    pendingIndexRef.current = randomIndex;
    setResult(null);
    setSpinning(true);

    if (direction === 1) {
      setRotation((prev) => prev + EXTRA_SPINS * 360 + delta);
    } else {
      setRotation((prev) => prev - EXTRA_SPINS * 360 + (delta - 360));
    }
  };

  const handleSpinComplete = () => {
    setSpinning(false);
    if (pendingIndexRef.current !== null) {
      setResult(foods[pendingIndexRef.current]);
      pendingIndexRef.current = null;
    }
  };

  // dragging the wheel itself: it follows the pointer 1:1 in real time
  // while held, and releasing with enough rotation behind it kicks off
  // the same fair random-spin animation as the button, continuing in
  // whichever direction it was being turned
  const handlePanStart = (_: unknown, info: PanInfo) => {
    if (spinning) return;
    setIsDraggingWheel(true);
    dragStateRef.current = {
      lastAngle: getAngleFromPoint(info.point.x, info.point.y),
      accum: 0,
    };
  };

  const handlePan = (_: unknown, info: PanInfo) => {
    if (spinning || !dragStateRef.current) return;
    const currentAngle = getAngleFromPoint(info.point.x, info.point.y);
    const delta = angleDelta(dragStateRef.current.lastAngle, currentAngle);
    dragStateRef.current.lastAngle = currentAngle;
    dragStateRef.current.accum += delta;
    setRotation((prev) => prev + delta);
  };

  const handlePanEnd = () => {
    if (spinning || !dragStateRef.current) return;
    const accum = dragStateRef.current.accum;
    dragStateRef.current = null;
    setIsDraggingWheel(false);
    if (Math.abs(accum) > DRAG_SPIN_THRESHOLD) {
      handleSpin(accum >= 0 ? 1 : -1);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-10 px-4">
      <div
        ref={wheelWrapRef}
        className="relative w-full max-w-[460px] aspect-square mx-auto"
      >
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
          // instant, no easing while the user is physically turning it —
          // the slow deceleration only applies to the triggered spin
          transition={
            isDraggingWheel
              ? { duration: 0 }
              : { duration: SPIN_DURATION, ease: [0.14, 0.67, 0.1, 0.99] }
          }
          onAnimationComplete={handleSpinComplete}
          onPanStart={handlePanStart}
          onPan={handlePan}
          onPanEnd={handlePanEnd}
          style={{ touchAction: "none" }}
          className={`drop-shadow-xl ${
            spinning ? "cursor-wait" : "cursor-grab active:cursor-grabbing"
          }`}
        >
          <circle cx={CENTER} cy={CENTER} r={RADIUS} className="fill-white" />
          {slices.map(({ food, start, end, mid, colorClass }) => {
            const availableLength = labelOuterRadius - labelInnerRadius;
            // cap how many characters we even attempt to fit, so
            // lengthAdjust below is compressing at most a little rather
            // than squeezing a long name into a tiny lane unreadably
            const maxChars = Math.max(
              4,
              Math.min(
                14,
                Math.floor(availableLength / (labelFontSize * 0.42)),
              ),
            );
            const label = truncate(food.name, maxChars);
            const approxTextWidth = Math.min(
              label.length * labelFontSize * 0.58,
              availableLength,
            );

            return (
              <g key={food.id}>
                <path
                  d={sliceDPath(start, end)}
                  className={`${colorClass} stroke-white`}
                  strokeWidth={2}
                />

                {/* text runs radially outward from center, like a clock
                    hand with its label printed along the length — angle
                    0 in our scheme is 12 o'clock, and unrotated text
                    naturally points toward 3 o'clock (angle 90), hence
                    the -90 offset to align it with this slice */}
                <g transform={`rotate(${mid - 90}, ${CENTER}, ${CENTER})`}>
                  <text
                    x={CENTER + labelInnerRadius + labelFontSize * 0.4}
                    y={CENTER}
                    textAnchor="start"
                    dominantBaseline="middle"
                    fontSize={labelFontSize}
                    textLength={approxTextWidth}
                    lengthAdjust="spacingAndGlyphs"
                    className="fill-white font-normal select-none"
                  >
                    {label}
                  </text>
                </g>
              </g>
            );
          })}
        </motion.svg>

        {/* center spin button, sized relative to the wheel so it scales
            with it instead of staying a fixed pixel size */}
        <button
          type="button"
          onClick={() => handleSpin(1)}
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
                <FaStore className="text-xs" />
                <p className="truncate text-[12px]">{result.store}</p>
              </div>
              <p className="truncate text-[17px] font-medium text-primary-900">
                {result.name}
              </p>
              <div className="flex items-center gap-3 text-[12px] text-primary-400">
                <span className="flex items-center gap-1 text-accent-400">
                  <FaStar className="text-xs" />
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
