"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { IoMdTime } from "react-icons/io";
import { FaStar, FaStore } from "react-icons/fa";
import { MdDeliveryDining, MdReplay } from "react-icons/md";
import { IoBagHandle, IoClose, IoSparkles } from "react-icons/io5";

import type { FoodItem } from "@/types/food";

type SpinWheelProps = {
  foods: FoodItem[];
};

// each card the user has landed on, with how many times they've won it
type WonEntry = { food: FoodItem; count: number };

// alternating slice fill colors, pulled from the same palette used across
// the app (RecommendCardStack, RecommandSection)
const SLICE_COLORS = [
  "fill-primary-800",
  "fill-secondary-500",
  "fill-primary-600",
  "fill-secondary-400",
];

// warm, festive palette for the confetti burst — hex (not tailwind classes)
// because these color inline spans, not svg fills
const CONFETTI_COLORS = [
  "#7c2d12",
  "#ea580c",
  "#f59e0b",
  "#fbbf24",
  "#fde68a",
  "#fb923c",
];

const STORAGE_KEY = "foodhub:spin-collection";

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

// ---------------------------------------------------------------------------
// confetti rain — a burst of colored pieces falling from the top-center of the
// popup. built on framer-motion so it needs no extra dependency. skipped
// entirely when the user prefers reduced motion.
// ---------------------------------------------------------------------------
function Confetti({ count = 44 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        startX: (Math.random() - 0.5) * 360,
        drift: (Math.random() - 0.5) * 140,
        rotate: Math.random() * 720 - 360,
        delay: Math.random() * 0.3,
        duration: 1.6 + Math.random() * 1.3,
        size: 6 + Math.random() * 8,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        round: Math.random() > 0.5,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute left-1/2 top-0 block"
          style={{
            width: p.size,
            height: p.round ? p.size : p.size * 0.5,
            backgroundColor: p.color,
            borderRadius: p.round ? 9999 : 2,
          }}
          initial={{ x: p.startX, y: -40, opacity: 1, rotate: 0 }}
          animate={{
            x: p.startX + p.drift,
            y: "110vh",
            opacity: [1, 1, 0],
            rotate: p.rotate,
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

// small reusable stat row used inside both the popup and the collection sheet
function FoodStats({ food }: { food: FoodItem }) {
  return (
    <div className="flex items-center gap-3 text-[12px] text-primary-400">
      <span className="flex items-center gap-1 text-accent-400">
        <FaStar className="text-xs" />
        {food.rating}
      </span>
      <span className="flex items-center gap-1">
        <IoMdTime className="text-sm" />
        {food.time}
      </span>
      <span className="flex items-center gap-1">
        <MdDeliveryDining className="text-base" />
        {food.distance}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// the win pop-up: a compact 4:3 prize card that springs into the center of the
// screen with a light burst, confetti and a shine sweep — the "you won
// something" moment.
// ---------------------------------------------------------------------------
function WinPopup({
  food,
  reduced,
  onClose,
  onSpinAgain,
}: {
  food: FoodItem;
  reduced: boolean;
  onClose: () => void;
  onSpinAgain: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* dimmed, blurred backdrop — tap to dismiss */}
      <motion.button
        type="button"
        aria-label="បិទ"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {!reduced && <Confetti />}

      <motion.div
        className="relative w-full max-w-[264px]"
        initial={reduced ? { opacity: 0 } : { scale: 0.55, y: 48, opacity: 0 }}
        animate={reduced ? { opacity: 1 } : { scale: 1, y: 0, opacity: 1 }}
        exit={reduced ? { opacity: 0 } : { scale: 0.75, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        {/* radial light burst blooming out from behind the card on reveal */}
        {!reduced && (
          <motion.div
            className="absolute left-1/2 top-1/2 -z-10 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(251,191,36,0.6), transparent 70%)",
            }}
            initial={{ scale: 0.2, opacity: 0.9 }}
            animate={{ scale: 2.8, opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        )}

        {/* floating "you got it" banner tucked over the top edge of the card */}
        <motion.div
          className="absolute -top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-secondary-500 to-accent-400 px-4 py-1.5 text-[13px] font-semibold text-white shadow-lg"
          initial={reduced ? false : { scale: 0, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.15,
            type: "spring",
            stiffness: 320,
            damping: 14,
          }}
        >
          {/* <IoSparkles className="text-sm" /> */}
          អ្នកទទួលបាន!
          {/* <IoSparkles className="text-sm" /> */}
        </motion.div>

        {/* the card itself */}
        <div className="overflow-hidden  bg-white p-2 rounded-[24px] shadow-2xl ring-1 ring-black/5">
          <button
            type="button"
            onClick={onClose}
            aria-label="បិទ"
            className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-primary-800 shadow-sm backdrop-blur transition-colors hover:bg-white"
          >
            <IoClose className="text-lg" />
          </button>

          {/* 4:3 image with a one-off shine sweep that repeats slowly */}
          <div className="relative   overflow-hidden ">
            <img
              src={food.image}
              alt={food.name}
              className="h-full rounded-[16px] w-full object-cover"
            />
            {!reduced && (
              <motion.div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 32%, rgba(255,255,255,0.55) 50%, transparent 68%)",
                }}
                initial={{ x: "-120%" }}
                animate={{ x: "120%" }}
                transition={{
                  duration: 1.1,
                  delay: 0.35,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 2.6,
                }}
              />
            )}
          </div>

          <div className="flex flex-col gap-1 px-4 pb-2 pt-3">
            <div className="flex items-center gap-1.5 text-secondary-400">
              <FaStore className="text-xs" />
              <p className="truncate text-[12px]">{food.store}</p>
            </div>
            <p className="truncate text-[17px] font-medium text-primary-900">
              {food.name}
            </p>
            <FoodStats food={food} />
          </div>

          {/* auto-saved note + actions */}
          {/* <div className="  gap-2 border-t border-gray-100 pt-2">
            <span className="flex items-center gap-1 text-[11px] text-primary-400">
              <IoBagHandle className="text-sm text-secondary-500" />
              បានរក្សាទុកក្នុងកាតរបស់អ្នក
            </span>
            <button
              type="button"
              onClick={onSpinAgain}
              className="ml-auto flex items-center gap-1 rounded-full bg-primary-800 px-3.5 py-1.5 text-[12px] font-semibold text-white transition-transform active:scale-95"
            >
              <MdReplay className="text-sm" />
              បង្វិលម្តងទៀត
            </button>
          </div> */}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// collection sheet: a bottom sheet listing every card the user has won so far,
// opened from the bag button under the wheel.
// ---------------------------------------------------------------------------
function CollectionSheet({
  entries,
  onClose,
}: {
  entries: WonEntry[];
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.button
        type="button"
        aria-label="បិទ"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <motion.div
        className="relative cursor-pointer flex max-h-[80vh] w-full max-w-md flex-col rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex  cursor-pointer z-99 items-center justify-between px-5 pb-2 pt-5">
          <div className="flex cursor-pointer items-center gap-2">
            <IoBagHandle className="text-xl text-secondary-500" />
            <h3 className="text-[16px] cursor-pointer  font-semibold text-primary-900">
              កាតរបស់ខ្ញុំ
            </h3>
            {entries.length > 0 && (
              <span className="rounded-full bg-secondary-500/10 px-2 py-0.5 text-[12px] font-semibold text-secondary-500">
                {entries.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="បិទ"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-primary-800 transition-colors hover:bg-gray-200"
          >
            <IoClose className="text-lg" />
          </button>
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <IoSparkles className="text-3xl text-secondary-400" />
            <p className="text-[14px] font-medium text-primary-900">
              មិនទាន់មានកាតទេ
            </p>
            <p className="text-[12px] text-primary-400">
              បង្វិលកង់ដើម្បីទទួលបានកាតដំបូងរបស់អ្នក
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 overflow-y-auto px-5 pb-6 pt-2">
            {entries.map(({ food, count }) => (
              <div
                key={food.id}
                className="overflow-hidden rounded-[18px] border border-gray-100 bg-white shadow-sm"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={food.image}
                    alt={food.name}
                    className="h-full w-full object-cover"
                  />
                  {count > 1 && (
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-primary-800/90 px-2 py-0.5 text-[11px] font-semibold text-white">
                      ×{count}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 p-2.5">
                  <div className="flex items-center gap-1 text-secondary-400">
                    <FaStore className="text-[10px]" />
                    <p className="truncate text-[11px]">{food.store}</p>
                  </div>
                  <p className="truncate text-[13px] font-medium text-primary-900">
                    {food.name}
                  </p>
                  <span className="flex items-center gap-1 text-[11px] text-accent-400">
                    <FaStar className="text-[10px]" />
                    {food.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function SpinWheel({ foods = [] }: SpinWheelProps) {
  const reduced = useReducedMotion() ?? false;

  // guard against the prop arriving undefined (e.g. while an RTK Query load
  // is still in flight) so we never read `.length` off undefined
  const items = Array.isArray(foods) ? foods : [];
  const total = items.length;
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
  const [showResult, setShowResult] = useState(false);
  const [collection, setCollection] = useState<WonEntry[]>([]);
  const [showCollection, setShowCollection] = useState(false);
  const pendingIndexRef = useRef<number | null>(null);
  const wheelWrapRef = useRef<HTMLDivElement>(null);
  const hydratedRef = useRef(false);
  const dragStateRef = useRef<{ lastAngle: number; accum: number } | null>(
    null,
  );
  const DRAG_SPIN_THRESHOLD = 12; // degrees of net rotation to count as an intentional spin, not just a nudge

  // load the saved collection once on mount (client only, so no SSR mismatch)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        // tolerate an older stored shape (a plain FoodItem[]) by wrapping
        // each into a { food, count } entry, and drop anything malformed
        const cleaned = parsed
          .map((e: any) =>
            e && e.food?.id
              ? { food: e.food, count: e.count ?? 1 }
              : e && e.id
                ? { food: e, count: 1 }
                : null,
          )
          .filter(Boolean) as WonEntry[];
        setCollection(cleaned);
      }
    } catch {
      /* ignore malformed / unavailable storage */
    }
    hydratedRef.current = true;
  }, []);

  // persist after every change — but only once the initial load has run, so
  // we never clobber the stored list with the empty starting state
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
    } catch {
      /* ignore quota / unavailable storage */
    }
  }, [collection]);

  const slices = useMemo(
    () =>
      items.map((food, i) => {
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
    [items, segAngle],
  );

  const totalWins = useMemo(
    () => collection.reduce((sum, e) => sum + e.count, 0),
    [collection],
  );

  if (total === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        មិនមានមុខម្ហូបសម្រាប់បង្វិលទេ
      </div>
    );
  }

  // add a won card to the collection: bump its count and float it to the
  // front if already there, otherwise prepend it as new
  const addToCollection = (food: FoodItem) => {
    setCollection((prev) => {
      const idx = prev.findIndex((e) => e.food.id === food.id);
      if (idx === -1) return [{ food, count: 1 }, ...prev];
      const next = [...prev];
      const [entry] = next.splice(idx, 1);
      return [{ food, count: entry.count + 1 }, ...next];
    });
  };

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
    setShowResult(false);
    setSpinning(true);

    if (direction === 1) {
      setRotation((prev) => prev + EXTRA_SPINS * 360 + delta);
    } else {
      setRotation((prev) => prev - EXTRA_SPINS * 360 + (delta - 360));
    }
  };

  const handleSpinComplete = () => {
    setSpinning(false);
    // guard: this also fires on the duration-0 animations while dragging,
    // where pendingIndexRef is null — so only the button/flick spin reveals
    if (pendingIndexRef.current !== null) {
      const won = items[pendingIndexRef.current];
      pendingIndexRef.current = null;
      setResult(won);
      addToCollection(won);
      setShowResult(true);
    }
  };

  const handleSpinAgain = () => {
    setShowResult(false);
    handleSpin(1);
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

      {/* collection button — holds every card won from spins; the badge
          shows how many distinct cards you've collected */}
      <button
        type="button"
        onClick={() => setShowCollection(true)}
        className="relative cursor-pointer hover:scale-109 flex items-center gap-2 rounded-full border border-gray-100 bg-white px-5 py-2.5 text-[14px] font-medium text-primary-900 shadow-md transition-transform active:scale-95"
      >
        <IoBagHandle className="text-lg text-secondary-500" />
        កាតរបស់ខ្ញុំ
        {collection.length > 0 && (
          <span className="ml-0.5 flex min-w-[20px] items-center justify-center rounded-full bg-secondary-500 px-1.5 text-[11px] font-semibold text-white">
            {collection.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showResult && result && (
          <WinPopup
            food={result}
            reduced={reduced}
            onClose={() => setShowResult(false)}
            onSpinAgain={handleSpinAgain}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCollection && (
          <CollectionSheet
            entries={collection}
            onClose={() => setShowCollection(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
