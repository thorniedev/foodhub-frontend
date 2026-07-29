"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
  type PanInfo,
} from "framer-motion";

import { FaStar, FaStore } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import { MdDeliveryDining, MdReplay } from "react-icons/md";
import { IoBagHandle, IoClose, IoSparkles } from "react-icons/io5";

import { useGetMenuItemsQuery } from "@/app/store/menuApi";
import type { MenuItem } from "@/types/manu";

type WonEntry = {
  food: MenuItem;
  count: number;
};

type SpinDirection = 1 | -1;

type DragState = {
  lastAngle: number;
  accumulatedAngle: number;
};

const SLICE_COLORS = [
  "fill-primary-800",
  "fill-secondary-500",
  "fill-primary-600",
  "fill-secondary-400",
];

const CONFETTI_COLORS = [
  "#7c2d12",
  "#ea580c",
  "#f59e0b",
  "#fbbf24",
  "#fde68a",
  "#fb923c",
];

const STORAGE_KEY = "foodhub:menu-spin-collection";

const SIZE = 300;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - 6;

const SPIN_DURATION = 4.2;
const EXTRA_SPINS = 6;

const DRAG_SPIN_THRESHOLD = 10;
const FLICK_VELOCITY_THRESHOLD = 320;

function pointOnCircle(angleDegrees: number, radius: number) {
  const radians = (angleDegrees * Math.PI) / 180;

  return {
    x: CENTER + radius * Math.sin(radians),

    y: CENTER - radius * Math.cos(radians),
  };
}

function createSlicePath(startAngle: number, endAngle: number) {
  const start = pointOnCircle(startAngle, RADIUS);

  const end = pointOnCircle(endAngle, RADIUS);

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${CENTER} ${CENTER}`,
    `L ${start.x} ${start.y}`,
    `A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

function shortestAngleDifference(from: number, to: number) {
  const difference = to - from;

  return ((((difference + 180) % 360) + 360) % 360) - 180;
}

function truncateText(value: string, maximumLength = 12) {
  if (value.length <= maximumLength) {
    return value;
  }

  return `${value.slice(0, maximumLength - 1)}…`;
}

function formatPrice(food: MenuItem) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: food.currencyCode || "USD",
      minimumFractionDigits: 2,
    }).format(food.price);
  } catch {
    return `$${food.price.toFixed(2)}`;
  }
}

function Confetti({ count = 42 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({
        length: count,
      }).map((_, index) => ({
        id: index,

        startX: (Math.random() - 0.5) * 360,

        drift: (Math.random() - 0.5) * 150,

        rotation: Math.random() * 720 - 360,

        delay: Math.random() * 0.25,

        duration: 1.6 + Math.random() * 1.2,

        size: 6 + Math.random() * 8,

        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],

        round: Math.random() > 0.5,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          className="absolute left-1/2 top-0 block"
          style={{
            width: piece.size,

            height: piece.round ? piece.size : piece.size * 0.55,

            backgroundColor: piece.color,

            borderRadius: piece.round ? 9999 : 2,
          }}
          initial={{
            x: piece.startX,
            y: -40,
            opacity: 1,
            rotate: 0,
          }}
          animate={{
            x: piece.startX + piece.drift,

            y: "110vh",

            opacity: [1, 1, 0],

            rotate: piece.rotation,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}

function FoodStats({ food }: { food: MenuItem }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-primary-400">
      <span className="flex items-center gap-1 text-accent-400">
        <FaStar className="text-base" />

        {food.store.averageRating}
      </span>

      <span className="flex items-center gap-1">
        <IoMdTime className="text-[18px]" />
        {food.preparationTimeMinutes} min
      </span>

      <span className="flex items-center gap-1">
        <MdDeliveryDining className="text-base" />
        {food.distanceKm} km
      </span>
    </div>
  );
}

type WinPopupProps = {
  food: MenuItem;
  reducedMotion: boolean;
  onClose: () => void;
  onSpinAgain: () => void;
};

function WinPopup({
  food,
  reducedMotion,
  onClose,
  onSpinAgain,
}: WinPopupProps) {
  const matchPercentage = Math.round(food.recommendation.finalScore * 100);

  return (
    <motion.div
      className="fixed inset-0 z-[1200] flex items-center justify-center p-4"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        duration: 0.2,
      }}
    >
      <button
        type="button"
        aria-label="បិទ"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-sm"
      />

      {!reducedMotion && <Confetti />}

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="មុខម្ហូបដែលអ្នកបានទទួល"
        className="relative w-full max-w-[300px]"
        initial={
          reducedMotion
            ? {
                opacity: 0,
              }
            : {
                opacity: 0,
                scale: 0.6,
                y: 50,
                rotate: -3,
              }
        }
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          rotate: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.8,
          y: 20,
        }}
        transition={{
          type: "spring",
          stiffness: 270,
          damping: 20,
        }}
      >
        {!reducedMotion && (
          <motion.div
            className="absolute left-1/2 top-1/2 -z-10 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(251,191,36,0.65), transparent 70%)",
            }}
            initial={{
              scale: 0.2,
              opacity: 0.9,
            }}
            animate={{
              scale: 3,
              opacity: 0,
            }}
            transition={{
              duration: 1,
              ease: "easeOut",
            }}
          />
        )}

        <motion.div
          className="absolute -top-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-secondary-500 to-accent-400 px-4 py-1.5 text-[18px] font-semibold text-white shadow-lg"
          initial={
            reducedMotion
              ? false
              : {
                  scale: 0,
                  rotate: -8,
                }
          }
          animate={{
            scale: 1,
            rotate: 0,
          }}
          transition={{
            delay: 0.12,
            type: "spring",
            stiffness: 320,
            damping: 15,
          }}
        >
          <IoSparkles />
          អ្នកទទួលបាន!
        </motion.div>

        <div className="overflow-hidden rounded-[26px] bg-white p-2 shadow-2xl ring-1 ring-black/5">
          <button
            type="button"
            aria-label="បិទ"
            onClick={onClose}
            className="absolute right-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-primary-800 shadow-md backdrop-blur transition hover:bg-white active:scale-90"
          >
            <IoClose className="text-lg" />
          </button>

          <Link href={`/food/${food.uuid}`} onClick={onClose} className="block">
            <div className="relative h-[195px] overflow-hidden rounded-[18px]">
              <Image
                fill
                src={food.thumbnail}
                alt={food.localName || food.name}
                sizes="300px"
                priority
                className="object-cover"
              />

              <span className="absolute left-2 top-2 rounded-full bg-primary-800/95 px-3 py-1 text-base font-medium text-white shadow">
                {matchPercentage}% Match
              </span>

              {!reducedMotion && (
                <motion.div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)",
                  }}
                  initial={{
                    x: "-120%",
                  }}
                  animate={{
                    x: "120%",
                  }}
                  transition={{
                    duration: 1.1,
                    delay: 0.35,
                    repeat: Infinity,
                    repeatDelay: 2.8,
                    ease: "easeInOut",
                  }}
                />
              )}
            </div>

            <div className="flex flex-col gap-2 p-3">
              <div className="flex items-center gap-1.5 text-secondary-400">
                <FaStore className="shrink-0 text-base" />

                <p className="truncate text-base">{food.store.localName}</p>
              </div>

              <div className="flex items-start justify-between gap-3">
                <p className="line-clamp-1 min-w-0 text-lg font-semibold text-primary-900">
                  {food.localName || food.name}
                </p>

                <p className="shrink-0 font-semibold text-primary-800">
                  {formatPrice(food)}
                </p>
              </div>

              <FoodStats food={food} />

              <div className="scrollbar-hide flex gap-2 overflow-x-auto">
                {food.dietaryTypes.map((diet) => (
                  <span
                    key={diet.code}
                    className="shrink-0 whitespace-nowrap rounded-full bg-primary-800 px-3 p-1 text-base text-white"
                  >
                    {diet.name}
                  </span>
                ))}
              </div>
            </div>
          </Link>

          {/* mdorng tt spin */}
          {/* <div className="flex gap-2 border-t border-gray-100 px-2 pb-1 pt-3">
            <button
              type="button"
              onClick={onSpinAgain}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary-800 px-4 py-2.5 text-[18px] font-semibold text-white transition hover:bg-primary-700 active:scale-[0.97]"
            >
              <MdReplay />
              បង្វិលម្តងទៀត
            </button>

            <Link
              href={`/food/${food.uuid}`}
              onClick={onClose}
              className="flex flex-1 items-center justify-center rounded-full border border-primary-800 px-4 py-2.5 text-[18px] font-semibold text-primary-800 transition hover:bg-primary-50 active:scale-[0.97]"
            >
              មើលលម្អិត
            </Link>
          </div> */}
        </div>
      </motion.div>
    </motion.div>
  );
}

type CollectionSheetProps = {
  entries: WonEntry[];
  onClose: () => void;
};

function CollectionSheet({ entries, onClose }: CollectionSheetProps) {
  const totalWins = entries.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <motion.div
      className="fixed inset-0 z-[1200] flex items-end justify-center p-0 sm:items-center sm:p-4"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        duration: 0.2,
      }}
    >
      <button
        type="button"
        aria-label="បិទ"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-sm"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="កាតរបស់ខ្ញុំ"
        className="relative flex max-h-[82vh] w-full max-w-md flex-col rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
        initial={{
          y: 80,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        exit={{
          y: 80,
          opacity: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      >
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-gray-200 sm:hidden" />

        <div className="flex items-center justify-between px-5 pb-3 pt-4">
          <div className="flex items-center gap-2">
            <IoBagHandle className="text-xl text-secondary-500" />

            <div>
              <h3 className="font-semibold text-primary-900">កាតរបស់ខ្ញុំ</h3>

              <p className="text-base text-gray-400">
                {entries.length} មុខម្ហូប · {totalWins} ដង
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="បិទ"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-primary-800 transition hover:bg-gray-200 active:scale-90"
          >
            <IoClose />
          </button>
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-500/10">
              <IoSparkles className="text-3xl text-secondary-500" />
            </div>

            <p className="text-[18px] font-semibold text-primary-900">
              មិនទាន់មានកាតទេ
            </p>

            <p className="max-w-[240px] text-base leading-5 text-primary-400">
              បង្វិលកងដើម្បីទទួលបានកាតមុខម្ហូបដំបូងរបស់អ្នក
            </p>
          </div>
        ) : (
          <div className="scrollbar-hide grid grid-cols-2 gap-3 overflow-y-auto px-5 pb-6 pt-1">
            {entries.map(({ food, count }) => (
              <Link
                key={food.uuid}
                href={`/food/${food.uuid}`}
                onClick={onClose}
                className="group overflow-hidden rounded-[18px] border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    fill
                    src={food.thumbnail}
                    alt={food.localName || food.name}
                    sizes="180px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {count > 1 && (
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-primary-800/95 px-2 py-0.5 text-base font-semibold text-white shadow">
                      ×{count}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 p-2.5">
                  <div className="flex items-center gap-1 text-secondary-400">
                    <FaStore className="shrink-0 text-[10px]" />

                    <p className="truncate text-[11px]">
                      {food.store.localName}
                    </p>
                  </div>

                  <p className="truncate text-[18px] font-medium text-primary-900">
                    {food.localName || food.name}
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 text-base text-accent-400">
                      <FaStar className="text-[10px]" />

                      {food.store.averageRating}
                    </span>

                    <span className="text-base font-medium text-primary-800">
                      {formatPrice(food)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function SpinFood() {
  const reducedMotion = useReducedMotion() ?? false;

  const {
    data: menuItems = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetMenuItemsQuery();

  const items = useMemo(
    () =>
      [...menuItems]
        .filter((item) => item.availabilityStatus === "AVAILABLE")
        .filter((item) => item.recommendation?.safetyStatus === "SAFE")
        .sort(
          (first, second) =>
            second.recommendation.finalScore - first.recommendation.finalScore,
        ),
    [menuItems],
  );

  const total = items.length;

  const segmentAngle = 360 / Math.max(total, 1);

  const labelInnerRadius =
    RADIUS * Math.min(0.5, 0.28 + Math.max(0, total - 8) * 0.012);

  const labelOuterRadius = RADIUS * 0.93;

  const labelFontSize = total > 12 ? 12 : total > 9 ? 14 : 16;

  const rotation = useMotionValue(0);

  const [spinning, setSpinning] = useState(false);

  const [isDraggingWheel, setIsDraggingWheel] = useState(false);

  const [result, setResult] = useState<MenuItem | null>(null);

  const [showResult, setShowResult] = useState(false);

  const [collection, setCollection] = useState<WonEntry[]>([]);

  const [showCollection, setShowCollection] = useState(false);

  const wheelWrapRef = useRef<HTMLDivElement>(null);

  const pendingIndexRef = useRef<number | null>(null);

  const spinningRef = useRef(false);

  const hydratedRef = useRef(false);

  const dragStateRef = useRef<DragState | null>(null);

  const animationControlRef = useRef<AnimationPlaybackControls | null>(null);

  useEffect(() => {
    try {
      const rawValue = window.localStorage.getItem(STORAGE_KEY);

      const parsedValue = rawValue ? JSON.parse(rawValue) : [];

      if (!Array.isArray(parsedValue)) {
        hydratedRef.current = true;
        return;
      }

      const cleanedEntries = parsedValue.filter((entry): entry is WonEntry =>
        Boolean(entry?.food?.uuid && typeof entry.count === "number"),
      );

      setCollection(cleanedEntries);
    } catch {
      setCollection([]);
    } finally {
      hydratedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
    } catch {
      // Ignore localStorage errors.
    }
  }, [collection]);

  useEffect(() => {
    return () => {
      animationControlRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    const modalIsOpen = showResult || showCollection;

    if (!modalIsOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      setShowResult(false);
      setShowCollection(false);
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleEscape);
    };
  }, [showResult, showCollection]);

  const slices = useMemo(
    () =>
      items.map((food, index) => {
        const start = index * segmentAngle;

        const end = start + segmentAngle;

        const middle = start + segmentAngle / 2;

        return {
          food,
          start,
          end,
          middle,

          colorClass: SLICE_COLORS[index % SLICE_COLORS.length],
        };
      }),
    [items, segmentAngle],
  );

  const addToCollection = useCallback((food: MenuItem) => {
    setCollection((current) => {
      const existingIndex = current.findIndex(
        (entry) => entry.food.uuid === food.uuid,
      );

      if (existingIndex === -1) {
        return [
          {
            food,
            count: 1,
          },
          ...current,
        ];
      }

      const next = [...current];

      const [existingEntry] = next.splice(existingIndex, 1);

      return [
        {
          food,
          count: existingEntry.count + 1,
        },
        ...next,
      ];
    });
  }, []);

  const getAngleFromPoint = useCallback((clientX: number, clientY: number) => {
    const rectangle = wheelWrapRef.current?.getBoundingClientRect();

    if (!rectangle) {
      return 0;
    }

    const centerX = rectangle.left + rectangle.width / 2;

    const centerY = rectangle.top + rectangle.height / 2;

    const degrees =
      (Math.atan2(clientY - centerY, clientX - centerX) * 180) / Math.PI;

    return normalizeAngle(degrees + 90);
  }, []);

  const finishSpin = useCallback(() => {
    spinningRef.current = false;
    setSpinning(false);

    const winningIndex = pendingIndexRef.current;

    pendingIndexRef.current = null;

    if (winningIndex === null) {
      return;
    }

    const winningFood = items[winningIndex];

    if (!winningFood) {
      return;
    }

    setResult(winningFood);
    addToCollection(winningFood);
    setShowResult(true);
  }, [items, addToCollection]);

  const handleSpin = useCallback(
    (direction: SpinDirection = 1, velocity = 0) => {
      if (spinningRef.current || total === 0) {
        return;
      }

      animationControlRef.current?.stop();

      spinningRef.current = true;
      setSpinning(true);
      setIsDraggingWheel(false);

      const randomIndex = Math.floor(Math.random() * total);

      const targetSlice = slices[randomIndex];

      if (!targetSlice) {
        spinningRef.current = false;
        setSpinning(false);
        return;
      }

      const currentRotation = rotation.get();

      const currentNormalized = normalizeAngle(currentRotation);

      const desiredNormalized = normalizeAngle(360 - targetSlice.middle);

      const clockwiseDelta = normalizeAngle(
        desiredNormalized - currentNormalized,
      );

      const extraRotation =
        EXTRA_SPINS * 360 + Math.min(Math.abs(velocity) * 0.08, 720);

      const targetRotation =
        direction === 1
          ? currentRotation + extraRotation + clockwiseDelta
          : currentRotation - extraRotation + (clockwiseDelta - 360);

      pendingIndexRef.current = randomIndex;

      setResult(null);
      setShowResult(false);

      animationControlRef.current = animate(rotation, targetRotation, {
        duration: reducedMotion ? 0.8 : SPIN_DURATION,

        ease: reducedMotion ? "easeOut" : [0.12, 0.68, 0.08, 1],

        onComplete: finishSpin,
      });
    },
    [total, slices, rotation, reducedMotion, finishSpin],
  );

  const handlePanStart = useCallback(
    (_: unknown, info: PanInfo) => {
      if (spinningRef.current) {
        return;
      }

      animationControlRef.current?.stop();

      setIsDraggingWheel(true);

      dragStateRef.current = {
        lastAngle: getAngleFromPoint(info.point.x, info.point.y),

        accumulatedAngle: 0,
      };
    },
    [getAngleFromPoint],
  );

  const handlePan = useCallback(
    (_: unknown, info: PanInfo) => {
      if (spinningRef.current || !dragStateRef.current) {
        return;
      }

      const currentAngle = getAngleFromPoint(info.point.x, info.point.y);

      const delta = shortestAngleDifference(
        dragStateRef.current.lastAngle,
        currentAngle,
      );

      dragStateRef.current.lastAngle = currentAngle;

      dragStateRef.current.accumulatedAngle += delta;

      rotation.set(rotation.get() + delta);
    },
    [getAngleFromPoint, rotation],
  );

  const handlePanEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const dragState = dragStateRef.current;

      dragStateRef.current = null;
      setIsDraggingWheel(false);

      if (spinningRef.current || !dragState) {
        return;
      }

      const accumulatedAngle = dragState.accumulatedAngle;

      const velocityMagnitude = Math.hypot(info.velocity.x, info.velocity.y);

      const draggedEnough = Math.abs(accumulatedAngle) >= DRAG_SPIN_THRESHOLD;

      const flickedFastEnough = velocityMagnitude >= FLICK_VELOCITY_THRESHOLD;

      if (!draggedEnough && !flickedFastEnough) {
        return;
      }

      let direction: SpinDirection;

      if (Math.abs(accumulatedAngle) >= 1) {
        direction = accumulatedAngle >= 0 ? 1 : -1;
      } else {
        direction = info.velocity.x >= 0 ? 1 : -1;
      }

      handleSpin(direction, velocityMagnitude);
    },
    [handleSpin],
  );

  const handleSpinAgain = useCallback(() => {
    setShowResult(false);

    window.setTimeout(() => {
      handleSpin(1);
    }, 120);
  }, [handleSpin]);

  if (isLoading || isFetching) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-gray-400">
        <motion.div
          className="h-10 w-10 rounded-full border-4 border-primary-100 border-t-primary-800"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <p className="text-[18px]">កំពុងផ្ទុកមុខម្ហូប...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
          !
        </div>

        <div>
          <p className="font-medium text-red-500">មិនអាចទាញយកមុខម្ហូបបានទេ</p>

          <p className="mt-1 text-[18px] text-gray-400">
            សូមពិនិត្យការតភ្ជាប់ ហើយព្យាយាមម្តងទៀត
          </p>
        </div>

        <details className="max-w-full text-left">
          <summary className="cursor-pointer text-base text-gray-400">
            ព័ត៌មានបច្ចេកទេស
          </summary>

          <pre className="mt-2 max-w-full overflow-auto whitespace-pre-wrap rounded-lg bg-red-50 p-3 text-base text-red-500">
            {JSON.stringify(error, null, 2)}
          </pre>
        </details>

        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-full bg-primary-800 px-5 py-2.5 text-[18px] font-medium text-white transition hover:bg-primary-700 active:scale-95"
        >
          ព្យាយាមម្តងទៀត
        </button>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
          <IoSparkles className="text-2xl text-primary-700" />
        </div>

        <p className="font-medium text-gray-500">
          មិនមានមុខម្ហូបសម្រាប់បង្វិលទេ
        </p>

        <p className="text-[18px] text-gray-400">សូមត្រឡប់មកវិញនៅពេលក្រោយ</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 px-2 py-8 sm:px-4">
      <div className="text-center">
        <p className="font-semibold text-2xl text-primary-900">
          បង្វិលដើម្បីជ្រើសរើសម្ហូប
        </p>

        <p className="mt-1 text-base text-2xl text-gray-400">
          ចុចប៊ូតុង ឬអូសកង់ដើម្បីបង្វិល
        </p>
      </div>

      <div
        ref={wheelWrapRef}
        className="relative mx-auto aspect-square w-full max-w-[390px] select-none"
      >
        <motion.div
          aria-hidden="true"
          className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1"
          animate={
            spinning
              ? {
                  y: [0, -3, 0],
                }
              : {
                  y: 0,
                }
          }
          transition={{
            duration: 0.18,
            repeat: spinning ? Infinity : 0,
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,

              borderLeft: "13px solid transparent",

              borderRight: "13px solid transparent",

              borderTop: "22px solid #7c2d12",

              filter: "drop-shadow(0 3px 2px rgba(0,0,0,0.2))",
            }}
          />
        </motion.div>

        <div className="absolute inset-[2%] rounded-full bg-white shadow-[0_16px_45px_rgba(30,60,40,0.18)]" />

        <motion.svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          width="100%"
          height="100%"
          style={{
            rotate: rotation,
            touchAction: "none",
            willChange: "transform",
            transformOrigin: "50% 50%",
          }}
          onPanStart={handlePanStart}
          onPan={handlePan}
          onPanEnd={handlePanEnd}
          className={`relative z-10 select-none ${
            spinning
              ? "cursor-wait"
              : isDraggingWheel
                ? "cursor-grabbing"
                : "cursor-grab"
          }`}
        >
          <circle cx={CENTER} cy={CENTER} r={RADIUS} className="fill-white" />

          {slices.map(({ food, start, end, middle, colorClass }) => {
            const availableLength = labelOuterRadius - labelInnerRadius;

            const maximumCharacters = Math.max(
              4,
              Math.min(
                13,
                Math.floor(availableLength / (labelFontSize * 0.43)),
              ),
            );

            const label = truncateText(
              food.localName || food.name,
              maximumCharacters,
            );

            const textWidth = Math.min(
              label.length * labelFontSize * 0.58,

              availableLength,
            );

            return (
              <g key={food.uuid}>
                <path
                  d={createSlicePath(start, end)}
                  className={`${colorClass} stroke-white`}
                  strokeWidth={2}
                />

                <g transform={`rotate(${middle - 90}, ${CENTER}, ${CENTER})`}>
                  <text
                    x={CENTER + labelInnerRadius + labelFontSize * 0.35}
                    y={CENTER}
                    textAnchor="start"
                    dominantBaseline="middle"
                    fontSize={labelFontSize}
                    textLength={textWidth}
                    lengthAdjust="spacingAndGlyphs"
                    className="pointer-events-none select-none fill-white font-medium"
                  >
                    {label}
                  </text>
                </g>
              </g>
            );
          })}

          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS - 1}
            fill="none"
            stroke="rgba(255,255,255,0.65)"
            strokeWidth={2}
            className="pointer-events-none"
          />
        </motion.svg>

        <button
          type="button"
          onClick={() => handleSpin(1)}
          disabled={spinning}
          aria-label="បង្វិលកង់"
          className="absolute left-1/2 top-1/2 z-30 flex aspect-square w-[22%] -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-primary-800 px-2 text-[clamp(11px,3vw,15px)] font-semibold text-white shadow-xl ring-[5px] ring-white transition hover:scale-105 hover:bg-primary-700 active:scale-90 disabled:cursor-not-allowed disabled:opacity-80"
        >
          {spinning ? (
            <motion.span
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "linear",
              }}
              className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white"
            />
          ) : (
            "បង្វិល"
          )}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => handleSpin(1)}
          disabled={spinning}
          className="flex items-center gap-2 rounded-full bg-primary-800 px-5 py-2.5 text-[18px] font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-lg active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <IoSparkles />
          បង្វិលឥឡូវនេះ
        </button>

        <button
          type="button"
          onClick={() => setShowCollection(true)}
          className="relative flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-[18px] font-medium text-primary-900 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md active:translate-y-0 active:scale-95"
        >
          <IoBagHandle className="text-lg text-secondary-500" />
          កាតរបស់ខ្ញុំ
          {collection.length > 0 && (
            <span className="ml-0.5 flex min-w-5 items-center justify-center rounded-full bg-secondary-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
              {collection.length}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showResult && result && (
          <WinPopup
            food={result}
            reducedMotion={reducedMotion}
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
