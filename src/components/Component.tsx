"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Check,
  ChevronRight,
  Clock3,
  HeartPulse,
  Leaf,
  MapPin,
  Navigation,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  UtensilsCrossed,
} from "lucide-react";

interface FoodSignal {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  position: string;
  accent: "green" | "orange";
}

const FOOD_SIGNALS: FoodSignal[] = [
  {
    id: "diet",
    label: "Diet preference",
    value: "Healthy Khmer food",
    icon: Leaf,
    position: "left-[1%] top-[8%] sm:left-[3%] sm:top-[13%]",
    accent: "green",
  },
  {
    id: "allergy",
    label: "Allergy safety",
    value: "Peanut free",
    icon: ShieldCheck,
    position: "right-[1%] top-[8%] sm:right-[3%] sm:top-[13%]",
    accent: "orange",
  },
  {
    id: "family",
    label: "Family profile",
    value: "Vanndeth",
    icon: Users,
    position: "bottom-[5%] left-[1%] sm:bottom-[12%] sm:left-[3%]",
    accent: "orange",
  },
  {
    id: "location",
    label: "Nearby food",
    value: "Within 2 km",
    icon: Navigation,
    position: "bottom-[5%] right-[1%] sm:bottom-[12%] sm:right-[3%]",
    accent: "green",
  },
];

const CONNECTION_PATHS = [
  "M 115 100 C 195 100, 190 205, 300 235",
  "M 485 100 C 405 100, 410 205, 300 235",
  "M 115 400 C 195 400, 190 295, 300 265",
  "M 485 400 C 405 400, 410 295, 300 265",
];

function SignalCard({
  signal,
  activeSignal,
  onActivate,
  reduceMotion,
}: {
  signal: FoodSignal;
  activeSignal: string;
  onActivate: (id: string) => void;
  reduceMotion: boolean;
}) {
  const Icon = signal.icon;
  const isActive = activeSignal === signal.id;

  return (
    <motion.button
      type="button"
      onPointerEnter={() => onActivate(signal.id)}
      onFocus={() => onActivate(signal.id)}
      onClick={() => onActivate(signal.id)}
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.025 }}
      whileTap={{ scale: 0.97 }}
      className={`absolute z-20 flex w-[155px] items-center gap-3 rounded-2xl border p-3 text-left backdrop-blur-xl transition-colors duration-300 sm:w-[190px] sm:p-4 ${
        signal.position
      } ${
        isActive
          ? "border-emerald-400 bg-white shadow-[0_18px_45px_-20px_rgba(16,185,129,0.65)] dark:border-emerald-400/60 dark:bg-[#101915]"
          : "border-slate-200/80 bg-white/80 shadow-[0_14px_35px_-24px_rgba(15,23,42,0.6)] hover:border-emerald-300 dark:border-white/10 dark:bg-[#0b120f]/80"
      }`}
      aria-pressed={isActive}
    >
      {isActive && (
        <motion.span
          layoutId="active-food-signal"
          className="absolute inset-0 -z-10 rounded-2xl bg-emerald-500/[0.05]"
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        />
      )}

      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
          signal.accent === "green"
            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
            : "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300"
        }`}
      >
        <Icon className="size-5" aria-hidden />
      </span>

      <span className="min-w-0">
        <span className="block truncate text-base font-bold text-slate-900 dark:text-white">
          {signal.value}
        </span>

        <span className="mt-0.5 hidden text-sm text-slate-500 sm:block dark:text-slate-400">
          {signal.label}
        </span>
      </span>
    </motion.button>
  );
}

function AnimatedConnections({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <svg
      viewBox="0 0 600 500"
      className="pointer-events-none absolute inset-0 z-0 hidden size-full sm:block"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="foodhubConnection" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.08" />
          <stop offset="50%" stopColor="#10b981" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.2" />
        </linearGradient>

        <filter id="connectionGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />

          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {CONNECTION_PATHS.map((path, index) => (
        <g key={path}>
          <path
            d={path}
            stroke="url(#foodhubConnection)"
            strokeWidth="1.5"
            strokeDasharray="5 8"
          />

          {!reduceMotion && (
            <motion.path
              d={path}
              stroke={index % 2 === 0 ? "#10b981" : "#f97316"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="26 280"
              filter="url(#connectionGlow)"
              initial={{ strokeDashoffset: 300 }}
              animate={{ strokeDashoffset: -300 }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: "linear",
                delay: index * 0.45,
              }}
            />
          )}

          {!reduceMotion && (
            <circle
              r="4"
              fill={index % 2 === 0 ? "#34d399" : "#fb923c"}
              filter="url(#connectionGlow)"
            >
              <animateMotion
                dur={`${2.7 + index * 0.25}s`}
                repeatCount="indefinite"
                path={path}
                begin={`${index * 0.4}s`}
              />
            </circle>
          )}
        </g>
      ))}
    </svg>
  );
}

function MatchProgress({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="relative flex size-[86px] items-center justify-center sm:size-[104px]">
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full -rotate-90"
        aria-hidden
      >
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          className="text-slate-100 dark:text-white/10"
        />

        <motion.circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="url(#matchGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="276"
          initial={reduceMotion ? false : { strokeDashoffset: 276 }}
          whileInView={{ strokeDashoffset: 6 }}
          viewport={{ once: true }}
          transition={{
            duration: 1.8,
            delay: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        />

        <defs>
          <linearGradient id="matchGradient">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>

      <div className="text-center">
        <span className="block text-xl font-black text-slate-950 sm:text-2xl dark:text-white">
          98%
        </span>

        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          match
        </span>
      </div>
    </div>
  );
}

function MealResultCard({
  activeSignal,
  reduceMotion,
}: {
  activeSignal: FoodSignal;
  reduceMotion: boolean;
}) {
  const ActiveIcon = activeSignal.icon;

  return (
    <motion.div
      animate={
        reduceMotion
          ? undefined
          : {
              y: [0, -5, 0],
            }
      }
      transition={{
        duration: 4.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute left-1/2 top-1/2 z-10 w-[245px] -translate-x-1/2 -translate-y-1/2 sm:w-[290px]"
    >
      {!reduceMotion && (
        <>
          <motion.div
            aria-hidden
            className="absolute inset-[-20px] rounded-[38px] border border-emerald-400/25"
            animate={{
              scale: [0.96, 1.08],
              opacity: [0.65, 0],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />

          <motion.div
            aria-hidden
            className="absolute inset-[-8px] rounded-[34px] border border-orange-400/20"
            animate={{
              scale: [0.96, 1.06],
              opacity: [0.45, 0],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              delay: 1.4,
              ease: "easeOut",
            }}
          />
        </>
      )}

      <div className="relative overflow-hidden rounded-[30px] border border-white/80 bg-white/90 p-4 shadow-[0_35px_90px_-40px_rgba(16,185,129,0.75)] backdrop-blur-2xl sm:p-5 dark:border-white/10 dark:bg-[#0b130f]/95">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

        {!reduceMotion && (
          <motion.div
            aria-hidden
            className="absolute inset-x-4 h-16 bg-gradient-to-b from-transparent via-emerald-400/10 to-transparent blur-lg"
            initial={{ top: "-30%" }}
            animate={{ top: "110%" }}
            transition={{
              duration: 3.4,
              repeat: Infinity,
              repeatDelay: 0.8,
              ease: "linear",
            }}
          />
        )}

        <div className="relative flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <Sparkles className="size-4" aria-hidden />
            Best match
          </span>

          <MatchProgress reduceMotion={reduceMotion} />
        </div>

        <div className="relative mt-3 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-orange-500 text-white shadow-[0_16px_32px_-14px_rgba(16,185,129,0.7)]">
          <UtensilsCrossed className="size-8" aria-hidden />

          {!reduceMotion && (
            <motion.span
              className="absolute inset-0 rounded-2xl border border-white/70"
              animate={{
                scale: [1, 1.45],
                opacity: [0.55, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          )}
        </div>

        <h3 className="relative mt-4 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
          Fish Amok
        </h3>

        <p className="relative mt-1 text-base text-slate-500 dark:text-slate-400">
          Traditional Khmer Kitchen
        </p>

        <div className="relative mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1">
            <Star
              className="size-4 fill-orange-400 text-orange-400"
              aria-hidden
            />
            4.9
          </span>

          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-4 text-emerald-500" aria-hidden />
            25 min
          </span>

          <span className="inline-flex items-center gap-1">
            <MapPin className="size-4 text-emerald-500" aria-hidden />
            1.4 km
          </span>
        </div>

        <motion.div
          key={activeSignal.id}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-white/[0.04]"
          aria-live="polite"
        >
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
              activeSignal.accent === "green"
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
                : "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300"
            }`}
          >
            <ActiveIcon className="size-4" aria-hidden />
          </span>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-500 dark:text-slate-400">
              {activeSignal.label}
            </p>

            <p className="truncate text-base font-bold text-slate-900 dark:text-white">
              {activeSignal.value}
            </p>
          </div>

          <Check
            className="ml-auto size-5 shrink-0 text-emerald-500"
            aria-hidden
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

function RecommendationCanvas({
  activeSignal,
  setActiveSignal,
  reduceMotion,
  rotateX,
  rotateY,
}: {
  activeSignal: string;
  setActiveSignal: (id: string) => void;
  reduceMotion: boolean;
  rotateX: ReturnType<typeof useSpring>;
  rotateY: ReturnType<typeof useSpring>;
}) {
  const selectedSignal =
    FOOD_SIGNALS.find((signal) => signal.id === activeSignal) ??
    FOOD_SIGNALS[0];

  return (
    <motion.div
      style={
        reduceMotion
          ? undefined
          : {
              rotateX,
              rotateY,
              transformPerspective: 1200,
            }
      }
      className="relative mx-auto aspect-[1/1.05] w-full max-w-[670px] [transform-style:preserve-3d]"
    >
      <motion.div
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [0.92, 1.05, 0.92],
                opacity: [0.35, 0.55, 0.35],
              }
        }
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-[20%] rounded-full bg-emerald-400/15 blur-[70px]"
      />

      <AnimatedConnections reduceMotion={reduceMotion} />

      {FOOD_SIGNALS.map((signal, index) => (
        <motion.div
          key={signal.id}
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  scale: 0.85,
                  y: index < 2 ? -15 : 15,
                }
          }
          whileInView={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          viewport={{ once: true }}
          transition={{
            duration: 0.6,
            delay: 0.2 + index * 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <SignalCard
            signal={signal}
            activeSignal={activeSignal}
            onActivate={setActiveSignal}
            reduceMotion={reduceMotion}
          />
        </motion.div>
      ))}

      <MealResultCard
        activeSignal={selectedSignal}
        reduceMotion={reduceMotion}
      />
    </motion.div>
  );
}

export default function MinimalFoodHubRecommendationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = Boolean(useReducedMotion());
  const [activeSignal, setActiveSignal] = useState("diet");

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const rotateXInput = useTransform(pointerY, [-0.5, 0.5], [4, -4]);
  const rotateYInput = useTransform(pointerX, [-0.5, 0.5], [-5, 5]);

  const glowXInput = useTransform(pointerX, [-0.5, 0.5], [-130, 130]);
  const glowYInput = useTransform(pointerY, [-0.5, 0.5], [-80, 80]);

  const rotateX = useSpring(rotateXInput, {
    stiffness: 100,
    damping: 24,
    mass: 0.8,
  });

  const rotateY = useSpring(rotateYInput, {
    stiffness: 100,
    damping: 24,
    mass: 0.8,
  });

  const glowX = useSpring(glowXInput, {
    stiffness: 80,
    damping: 24,
  });

  const glowY = useSpring(glowYInput, {
    stiffness: 80,
    damping: 24,
  });

  const spotlight = useMotionTemplate`
    radial-gradient(
      380px circle at calc(50% + ${glowX}px) calc(50% + ${glowY}px),
      rgba(16, 185, 129, 0.10),
      transparent 70%
    )
  `;

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (reduceMotion || !sectionRef.current) return;

    const bounds = sectionRef.current.getBoundingClientRect();

    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);

    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  }

  function resetPointer() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <section
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      className="relative isolate overflow-hidden bg-[#f8faf8] py-20 text-slate-950 sm:py-28 lg:py-32 dark:bg-[#060b08] dark:text-white"
    >
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_75%_45%,rgba(16,185,129,0.10),transparent_42%)]" />

      <div className="absolute inset-0 -z-20 opacity-[0.025] [background-image:radial-gradient(rgba(15,23,42,0.7)_1px,transparent_1px)] [background-size:28px_28px] dark:opacity-[0.05] dark:[background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1px)]" />

      {!reduceMotion && (
        <motion.div
          aria-hidden
          style={{ background: spotlight }}
          className="pointer-events-none absolute inset-0 -z-10"
        />
      )}

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-6 lg:px-10">
        <div className="text-center lg:text-left">
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-2 text-sm font-bold text-emerald-700 backdrop-blur dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
          >
            <Sparkles className="size-4" aria-hidden />
            Smart Food Discovery
          </motion.span>

          <motion.h2
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="mt-7 text-balance text-5xl font-black leading-[0.96] tracking-[-0.05em] sm:text-6xl lg:text-7xl"
          >
            Food that fits
            <span className="mt-2 block text-emerald-600 dark:text-[#22a447]">
              your real life.
            </span>
          </motion.h2>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.16 }}
            className="mx-auto mt-6 max-w-lg text-base leading-7 text-slate-600 sm:text-lg lg:mx-0 dark:text-slate-300"
          >
            Every recommendation considers your taste, allergies, family
            profile, nutrition needs, and location.
          </motion.p>

          <motion.a
            href="#food-recommendations"
            initial={reduceMotion ? false : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.24 }}
            whileHover={reduceMotion ? undefined : { x: 4 }}
            className="mt-8 inline-flex items-center gap-2 text-base font-bold text-slate-950 transition-colors hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400"
          >
            Explore recommendations
            <ChevronRight className="size-5" aria-hidden />
          </motion.a>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="mt-9 flex flex-wrap justify-center gap-x-5 gap-y-3 text-sm font-semibold text-slate-500 lg:justify-start dark:text-slate-400"
          >
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-500" aria-hidden />
              Allergy-aware
            </span>

            <span className="inline-flex items-center gap-2">
              <HeartPulse className="size-4 text-emerald-500" aria-hidden />
              Nutrition focused
            </span>

            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-emerald-500" aria-hidden />
              Location based
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  scale: 0.94,
                  y: 24,
                }
          }
          whileInView={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <RecommendationCanvas
            activeSignal={activeSignal}
            setActiveSignal={setActiveSignal}
            reduceMotion={reduceMotion}
            rotateX={rotateX}
            rotateY={rotateY}
          />
        </motion.div>
      </div>
    </section>
  );
}
