"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Check,
  ChefHat,
  Clock3,
  HeartPulse,
  Leaf,
  MapPin,
  Navigation,
  ShieldCheck,
  Star,
  UtensilsCrossed,
  Users,
  Zap,
} from "lucide-react";

interface SignalNode {
  label: string;
  description: string;
  icon: LucideIcon;
  angle: number;
  color: "green" | "orange";
}

interface LightningBoltData {
  left: string;
  top: string;
  width: number;
  rotate: number;
  delay: number;
  duration: number;
  opacity: number;
}

const SIGNALS: SignalNode[] = [
  {
    label: "Diet",
    description: "Meals selected around your dietary preferences.",
    icon: Leaf,
    angle: 0,
    color: "green",
  },
  {
    label: "Allergy",
    description: "Ingredients checked against your allergies.",
    icon: ShieldCheck,
    angle: 72,
    color: "orange",
  },
  {
    label: "Location",
    description: "Recommendations from restaurants near you.",
    icon: Navigation,
    angle: 144,
    color: "green",
  },
  {
    label: "Family",
    description: "A personal recommendation for every family profile.",
    icon: Users,
    angle: 216,
    color: "orange",
  },
  {
    label: "Nutrition",
    description: "Meals matched with your nutrition goals.",
    icon: HeartPulse,
    angle: 288,
    color: "green",
  },
];

const BACKGROUND_PARTICLES = [
  { left: "8%", top: "18%", size: 6, duration: 6, delay: 0 },
  { left: "17%", top: "72%", size: 4, duration: 7, delay: 1.2 },
  { left: "29%", top: "10%", size: 5, duration: 5.5, delay: 2.1 },
  { left: "74%", top: "14%", size: 5, duration: 6.5, delay: 0.8 },
  { left: "87%", top: "35%", size: 7, duration: 7.5, delay: 1.7 },
  { left: "82%", top: "78%", size: 4, duration: 5.8, delay: 2.5 },
  { left: "57%", top: "88%", size: 6, duration: 6.8, delay: 0.4 },
  { left: "42%", top: "17%", size: 3, duration: 4.8, delay: 1.8 },
  { left: "65%", top: "64%", size: 5, duration: 6.1, delay: 0.9 },
];

const LIGHTNING_BOLTS: LightningBoltData[] = [
  {
    left: "6%",
    top: "10%",
    width: 54,
    rotate: -18,
    delay: 0.2,
    duration: 4.3,
    opacity: 0.9,
  },
  {
    left: "84%",
    top: "12%",
    width: 48,
    rotate: 16,
    delay: 1.35,
    duration: 4.9,
    opacity: 0.82,
  },
  {
    left: "10%",
    top: "68%",
    width: 44,
    rotate: -8,
    delay: 2.2,
    duration: 4.6,
    opacity: 0.72,
  },
  {
    left: "81%",
    top: "66%",
    width: 58,
    rotate: 20,
    delay: 0.85,
    duration: 5.2,
    opacity: 0.86,
  },
];

const STREAM_PARTICLES = [0, 1, 2, 3];
const ORBIT_DURATION = 34;

function BackgroundEffects({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <>
      <div className="absolute inset-0 -z-40 bg-[#f7fbf8] dark:bg-[#020806]" />

      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_50%_42%,rgba(16,185,129,0.2),transparent_42%)] dark:bg-[radial-gradient(circle_at_50%_42%,rgba(16,185,129,0.15),transparent_45%)]" />

      <div className="absolute inset-0 -z-30 opacity-[0.04] [background-image:linear-gradient(rgba(15,23,42,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.8)_1px,transparent_1px)] [background-size:48px_48px] dark:opacity-[0.075] dark:[background-image:linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)]" />

      <div className="absolute left-[-190px] top-[12%] -z-30 size-[450px] rounded-full bg-emerald-400/12 blur-[110px]" />
      <div className="absolute right-[-180px] top-[40%] -z-30 size-[420px] rounded-full bg-orange-400/12 blur-[120px]" />

      {!reduceMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20 bg-white dark:bg-emerald-50"
          animate={{
            opacity: [0, 0, 0.1, 0, 0, 0.045, 0],
          }}
          transition={{
            duration: 5.4,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.44, 0.455, 0.475, 0.76, 0.775, 1],
          }}
        />
      )}

      {BACKGROUND_PARTICLES.map((particle, index) => (
        <motion.span
          key={index}
          aria-hidden
          className={`absolute -z-10 rounded-full ${
            index % 3 === 0
              ? "bg-orange-400/45 shadow-[0_0_18px_rgba(251,146,60,0.6)]"
              : "bg-emerald-400/45 shadow-[0_0_18px_rgba(52,211,153,0.6)]"
          }`}
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, index % 2 === 0 ? 12 : -12, 0],
                  y: [0, -20, 0],
                  opacity: [0.18, 0.9, 0.18],
                  scale: [1, 1.55, 1],
                }
          }
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

function LightningBolt({
  data,
  reduceMotion,
}: {
  data: LightningBoltData;
  reduceMotion: boolean;
}) {
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 80 180"
      fill="none"
      className="pointer-events-none absolute -z-10 overflow-visible"
      style={{
        left: data.left,
        top: data.top,
        width: data.width,
        rotate: data.rotate,
      }}
      animate={
        reduceMotion
          ? { opacity: 0.18 }
          : {
              opacity: [0, 0, data.opacity, 0.22, 0, 0],
              scale: [0.92, 0.92, 1.08, 1, 0.98, 0.92],
              filter: [
                "drop-shadow(0 0 0 rgba(255,255,255,0))",
                "drop-shadow(0 0 0 rgba(255,255,255,0))",
                "drop-shadow(0 0 13px rgba(255,255,255,1))",
                "drop-shadow(0 0 8px rgba(52,211,153,0.85))",
                "drop-shadow(0 0 0 rgba(255,255,255,0))",
                "drop-shadow(0 0 0 rgba(255,255,255,0))",
              ],
            }
      }
      transition={{
        duration: data.duration,
        delay: data.delay,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.46, 0.49, 0.53, 0.57, 1],
      }}
    >
      <motion.path
        d="M49 4 18 78h25l-17 44 39-60H40L67 4H49Z"
        stroke="url(#lightning-stroke)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={
          reduceMotion
            ? undefined
            : {
                pathLength: [0, 0, 1, 1, 0],
                opacity: [0, 0, 1, 0.8, 0],
              }
        }
        transition={{
          duration: data.duration,
          delay: data.delay,
          repeat: Infinity,
          ease: "easeOut",
          times: [0, 0.45, 0.5, 0.56, 1],
        }}
      />
      <path
        d="M49 4 18 78h25l-17 44 39-60H40L67 4H49Z"
        fill="url(#lightning-fill)"
        opacity="0.34"
      />
      <defs>
        <linearGradient
          id="lightning-stroke"
          x1="42"
          y1="4"
          x2="42"
          y2="122"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="0.55" stopColor="#6ee7b7" />
          <stop offset="1" stopColor="#fb923c" />
        </linearGradient>
        <linearGradient
          id="lightning-fill"
          x1="42"
          y1="4"
          x2="42"
          y2="122"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="0.6" stopColor="#34d399" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}

function LightningField({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <>
      {LIGHTNING_BOLTS.map((bolt, index) => (
        <LightningBolt key={index} data={bolt} reduceMotion={reduceMotion} />
      ))}

      {!reduceMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[43%] -z-20 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.28),rgba(16,185,129,0.12)_32%,transparent_68%)] blur-3xl"
          animate={{
            opacity: [0.12, 0.36, 0.14, 0.48, 0.12],
            scale: [0.9, 1.06, 0.96, 1.1, 0.9],
          }}
          transition={{
            duration: 4.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </>
  );
}

function ElectricRing({
  inset,
  duration,
  reverse = false,
  color = "green",
  reduceMotion,
}: {
  inset: string;
  duration: number;
  reverse?: boolean;
  color?: "green" | "orange";
  reduceMotion: boolean;
}) {
  const mainStroke = color === "green" ? "#34d399" : "#fb923c";
  const softStroke = color === "green" ? "#a7f3d0" : "#fed7aa";

  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 100 100"
      className="absolute overflow-visible"
      style={{ inset }}
      animate={reduceMotion ? undefined : { rotate: reverse ? -360 : 360 }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="none"
        stroke={softStroke}
        strokeOpacity="0.16"
        strokeWidth="0.45"
      />

      <motion.circle
        cx="50"
        cy="50"
        r="48"
        fill="none"
        stroke={mainStroke}
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeDasharray="13 18 4 25"
        animate={
          reduceMotion
            ? undefined
            : {
                strokeDashoffset: reverse ? [0, 120] : [0, -120],
                opacity: [0.35, 1, 0.35],
              }
        }
        transition={{
          duration: duration / 2,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          filter: `drop-shadow(0 0 3px ${mainStroke})`,
        }}
      />

      <motion.circle
        cx="50"
        cy="2"
        r="1.1"
        fill="white"
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [0.65, 1.65, 0.65],
                opacity: [0.4, 1, 0.4],
              }
        }
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          filter: `drop-shadow(0 0 5px ${mainStroke})`,
        }}
      />
    </motion.svg>
  );
}

function OrbitRings({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <>
      <motion.div
        aria-hidden
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[12%] rounded-full"
      >
        <div className="absolute inset-0 rounded-full border border-dashed border-emerald-500/25" />

        <motion.div
          className="absolute left-1/2 top-[-5px] size-3 -translate-x-1/2 rounded-full bg-white shadow-[0_0_8px_2px_white,0_0_24px_7px_rgba(52,211,153,0.75)]"
          animate={
            reduceMotion
              ? undefined
              : { scale: [0.75, 1.45, 0.75], opacity: [0.5, 1, 0.5] }
          }
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute bottom-[-4px] left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-orange-300 shadow-[0_0_8px_2px_white,0_0_22px_6px_rgba(251,146,60,0.75)]"
          animate={
            reduceMotion
              ? undefined
              : { scale: [1.4, 0.7, 1.4], opacity: [1, 0.45, 1] }
          }
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <ElectricRing
        inset="17%"
        duration={13}
        color="green"
        reduceMotion={reduceMotion}
      />

      <ElectricRing
        inset="22%"
        duration={17}
        reverse
        color="orange"
        reduceMotion={reduceMotion}
      />

      <motion.div
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : {
                rotate: 360,
                scale: [0.98, 1.035, 0.98],
                opacity: [0.45, 0.95, 0.45],
              }
        }
        transition={{
          rotate: { duration: 6.5, repeat: Infinity, ease: "linear" },
          scale: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute inset-[27%] rounded-full [background:conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.95)_10deg,rgba(52,211,153,0.9)_22deg,transparent_50deg,transparent_145deg,rgba(251,146,60,0.9)_168deg,transparent_205deg)] [mask:radial-gradient(farthest-side,transparent_calc(100%-4px),#000_calc(100%-2px))]"
      />
    </>
  );
}

interface SignalOrbitProps {
  activeSignal: string;
  setActiveSignal: (signal: string) => void;
  reduceMotion: boolean;
}

function SignalOrbit({
  activeSignal,
  setActiveSignal,
  reduceMotion,
}: SignalOrbitProps) {
  return (
    <motion.div
      animate={reduceMotion ? undefined : { rotate: 360 }}
      transition={{
        duration: ORBIT_DURATION,
        repeat: Infinity,
        ease: "linear",
      }}
      className="absolute inset-[1%]"
    >
      {SIGNALS.map((signal) => {
        const SignalIcon = signal.icon;
        const isActive = activeSignal === signal.label;
        const particleClass =
          signal.color === "green"
            ? "bg-emerald-300 shadow-[0_0_8px_2px_white,0_0_16px_6px_rgba(52,211,153,0.68)]"
            : "bg-orange-300 shadow-[0_0_8px_2px_white,0_0_16px_6px_rgba(251,146,60,0.68)]";

        return (
          <div
            key={signal.label}
            className="absolute inset-0"
            style={{ transform: `rotate(${signal.angle}deg)` }}
          >
            <div className="absolute bottom-1/2 left-1/2 top-[7%] w-px -translate-x-1/2 overflow-visible bg-gradient-to-b from-transparent via-emerald-500/25 to-white/70">
              {!reduceMotion &&
                STREAM_PARTICLES.map((particle) => (
                  <motion.span
                    key={particle}
                    className={`absolute left-1/2 size-1.5 -translate-x-1/2 rounded-full ${particleClass}`}
                    initial={{ top: "0%", opacity: 0 }}
                    animate={{
                      top: ["0%", "96%"],
                      opacity: [0, 1, 0.9, 0],
                      scale: [0.5, 1.45, 1, 0.4],
                    }}
                    transition={{
                      duration: 1.65,
                      delay: particle * 0.32 + (signal.angle / 360) * 1.1,
                      repeat: Infinity,
                      repeatDelay: 0.65,
                      ease: "easeIn",
                    }}
                  />
                ))}

              {isActive && !reduceMotion && (
                <motion.span
                  className="absolute bottom-[4%] left-1/2 h-12 w-4 -translate-x-1/2 rounded-full bg-white/70 blur-md"
                  animate={{
                    opacity: [0, 0.9, 0],
                    scaleY: [0.25, 1.3, 0.25],
                  }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              )}
            </div>

            <div className="absolute left-1/2 top-0 -translate-x-1/2">
              <div style={{ transform: `rotate(${-signal.angle}deg)` }}>
                <motion.div
                  animate={reduceMotion ? undefined : { rotate: -360 }}
                  transition={{
                    duration: ORBIT_DURATION,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <motion.button
                    type="button"
                    aria-label={`${signal.label}: ${signal.description}`}
                    aria-pressed={isActive}
                    onPointerEnter={() => setActiveSignal(signal.label)}
                    onFocus={() => setActiveSignal(signal.label)}
                    whileHover={
                      reduceMotion
                        ? undefined
                        : {
                            scale: 1.12,
                            y: -5,
                            rotate: signal.color === "green" ? -1 : 1,
                          }
                    }
                    whileTap={{ scale: 0.95 }}
                    animate={
                      reduceMotion || !isActive
                        ? undefined
                        : {
                            y: [0, -2, 0],
                            boxShadow: [
                              "0 0 0 rgba(16,185,129,0)",
                              "0 0 30px rgba(16,185,129,0.5)",
                              "0 0 24px rgba(249,115,22,0.35)",
                              "0 0 0 rgba(16,185,129,0)",
                            ],
                          }
                    }
                    transition={{
                      duration: 2.1,
                      repeat: isActive ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                    className={`group relative flex items-center gap-2 overflow-hidden rounded-2xl border px-2.5 py-2 text-base font-bold backdrop-blur-xl transition-colors duration-300 sm:px-3.5 ${
                      isActive
                        ? "border-white/80 bg-gradient-to-r from-white via-emerald-50 to-orange-50 text-slate-950 shadow-[0_18px_48px_-18px_rgba(16,185,129,0.9)] dark:border-emerald-300/80 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(6,78,59,0.9),rgba(124,45,18,0.82))] dark:text-white"
                        : "border-emerald-200/75 bg-white/80 text-slate-700 shadow-[0_12px_34px_-20px_rgba(15,23,42,0.7)] hover:border-emerald-400 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200"
                    }`}
                  >
                    {isActive && (
                      <>
                        <motion.span
                          layoutId="active-signal-glow"
                          className="absolute inset-0 -z-10 rounded-2xl bg-emerald-400/15"
                        />

                        {!reduceMotion && (
                          <motion.span
                            aria-hidden
                            className="absolute -left-10 top-0 h-full w-10 skew-x-[-18deg] bg-white/75 blur-sm"
                            animate={{ left: ["-25%", "125%"] }}
                            transition={{
                              duration: 1.55,
                              repeat: Infinity,
                              repeatDelay: 0.85,
                              ease: "easeInOut",
                            }}
                          />
                        )}
                      </>
                    )}

                    <span
                      className={`relative flex size-10 items-center justify-center rounded-xl transition-colors ${
                        signal.color === "green"
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200"
                          : "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-200"
                      }`}
                    >
                      <SignalIcon className="size-5" aria-hidden />

                      {isActive && !reduceMotion && (
                        <motion.span
                          aria-hidden
                          className="absolute inset-0 rounded-xl border border-white/80"
                          animate={{ scale: [1, 1.55], opacity: [0.75, 0] }}
                          transition={{
                            duration: 1.35,
                            repeat: Infinity,
                            ease: "easeOut",
                          }}
                        />
                      )}
                    </span>

                    <span className="hidden whitespace-nowrap min-[430px]:inline">
                      {signal.label}
                    </span>

                    <span
                      className={`absolute -right-1 -top-1 size-3 rounded-full ${
                        isActive
                          ? "bg-white shadow-[0_0_7px_2px_white,0_0_16px_5px_rgba(52,211,153,0.75)]"
                          : "bg-slate-300 dark:bg-slate-600"
                      }`}
                    />
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

function RecommendationCore({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="absolute inset-[28%] grid place-items-center">
      {!reduceMotion && (
        <>
          <motion.span
            aria-hidden
            className="absolute inset-[-5%] rounded-full border border-white/70"
            animate={{ scale: [0.88, 1.38], opacity: [0.72, 0] }}
            transition={{ duration: 2.1, repeat: Infinity, ease: "easeOut" }}
          />

          <motion.span
            aria-hidden
            className="absolute inset-[-5%] rounded-full border border-emerald-300/70"
            animate={{ scale: [0.9, 1.45], opacity: [0.55, 0] }}
            transition={{
              duration: 2.1,
              delay: 0.7,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />

          <motion.span
            aria-hidden
            className="absolute inset-[-5%] rounded-full border border-orange-300/60"
            animate={{ scale: [0.92, 1.5], opacity: [0.45, 0] }}
            transition={{
              duration: 2.1,
              delay: 1.4,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />

          <motion.div
            aria-hidden
            className="absolute inset-[4%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.52),rgba(52,211,153,0.22)_35%,rgba(249,115,22,0.12)_55%,transparent_74%)] blur-2xl"
            animate={{
              scale: [0.82, 1.2, 0.88],
              opacity: [0.28, 0.82, 0.28],
            }}
            transition={{ duration: 2.35, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -4, 0],
                scale: [1, 1.035, 1],
              }
        }
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        className="relative size-full rounded-full bg-[conic-gradient(from_0deg,#34d399,#ffffff,#f97316,#ffffff,#34d399)] p-[2px] shadow-[0_0_30px_rgba(255,255,255,0.5),0_32px_100px_-28px_rgba(16,185,129,0.95)]"
      >
        {!reduceMotion && (
          <motion.div
            aria-hidden
            className="absolute inset-[-4px] rounded-full [background:conic-gradient(from_0deg,transparent,rgba(255,255,255,0.95),transparent_18%,transparent_47%,rgba(52,211,153,0.85),transparent_62%,rgba(251,146,60,0.85),transparent_82%)] blur-[2px]"
            animate={{ rotate: 360 }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "linear" }}
          />
        )}

        <div className="relative flex size-full flex-col items-center justify-center overflow-hidden rounded-full bg-white px-3 text-center dark:bg-[#04100b]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.9),rgba(16,185,129,0.16)_34%,transparent_62%)] dark:bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.14),rgba(16,185,129,0.15)_34%,transparent_64%)]" />

          {!reduceMotion && (
            <>
              <motion.div
                aria-hidden
                className="absolute inset-x-[8%] h-12 rounded-full bg-gradient-to-r from-transparent via-white/90 to-transparent blur-md"
                animate={{ top: ["-24%", "112%"], opacity: [0, 0.95, 0] }}
                transition={{
                  duration: 2.15,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                  ease: "linear",
                }}
              />

              <motion.div
                aria-hidden
                className="absolute inset-0 rounded-full [background:conic-gradient(from_0deg,transparent,rgba(16,185,129,0.16),transparent_20%,rgba(249,115,22,0.14),transparent_42%,transparent)]"
                animate={{ rotate: 360 }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
              />
            </>
          )}

          <motion.div
            animate={
              reduceMotion
                ? undefined
                : {
                    rotate: [0, -2, 2, 0],
                    scale: [1, 1.08, 1],
                  }
            }
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-orange-500 text-white shadow-[0_0_12px_2px_rgba(255,255,255,0.45),0_14px_30px_-8px_rgba(16,185,129,0.9)] sm:size-14"
          >
            <ChefHat className="size-6 sm:size-7" aria-hidden />

            {!reduceMotion && (
              <>
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-2xl border border-white/80"
                  animate={{ scale: [1, 1.75], opacity: [0.75, 0] }}
                  transition={{
                    duration: 1.45,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />

                <motion.span
                  aria-hidden
                  className="absolute -right-2 -top-2 text-white drop-shadow-[0_0_7px_rgba(255,255,255,1)]"
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.65, 1.25, 0.65],
                    rotate: [-12, 10, -12],
                  }}
                  transition={{
                    duration: 1.35,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Zap className="size-5 fill-white" />
                </motion.span>
              </>
            )}
          </motion.div>

          <p className="relative mt-2 text-base font-black leading-tight text-slate-950 sm:text-xl dark:text-white">
            Fish Amok
          </p>

          <div className="relative mt-1 hidden items-center gap-1.5 text-base font-semibold text-slate-500 min-[430px]:flex dark:text-slate-300">
            <Star
              className="size-4 fill-orange-400 text-orange-400"
              aria-hidden
            />
            <span>4.9</span>
            <span>•</span>
            <Clock3 className="size-4" aria-hidden />
            <span>25 min</span>
          </div>

          <motion.span
            animate={
              reduceMotion
                ? undefined
                : {
                    boxShadow: [
                      "0 0 0 0 rgba(16,185,129,0)",
                      "0 0 24px 5px rgba(16,185,129,0.42)",
                      "0 0 16px 3px rgba(249,115,22,0.26)",
                      "0 0 0 0 rgba(16,185,129,0)",
                    ],
                  }
            }
            transition={{ duration: 2.1, repeat: Infinity }}
            className="relative mt-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1 text-base font-black text-white"
          >
            <Check className="size-4" aria-hidden />
            98% match
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}

interface InteractiveOrbitProps {
  activeSignal: string;
  setActiveSignal: (signal: string) => void;
  reduceMotion: boolean;
  rotateX: ReturnType<typeof useSpring>;
  rotateY: ReturnType<typeof useSpring>;
}

function InteractiveOrbit({
  activeSignal,
  setActiveSignal,
  reduceMotion,
  rotateX,
  rotateY,
}: InteractiveOrbitProps) {
  return (
    <motion.div
      style={
        reduceMotion
          ? undefined
          : {
              rotateX,
              rotateY,
              transformPerspective: 1150,
            }
      }
      className="relative mx-auto aspect-square w-full max-w-[680px] [transform-style:preserve-3d]"
    >
      <motion.div
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [0.9, 1.08, 0.9],
                opacity: [0.28, 0.7, 0.28],
              }
        }
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-[7%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.35),rgba(16,185,129,0.24)_27%,rgba(16,185,129,0.07)_48%,transparent_70%)] blur-3xl"
      />

      {!reduceMotion && (
        <motion.div
          aria-hidden
          className="absolute inset-[14%] rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.55),transparent_12%,rgba(52,211,153,0.16),transparent_40%,rgba(251,146,60,0.15),transparent_70%)] blur-2xl"
          animate={{ rotate: 360, opacity: [0.25, 0.7, 0.25] }}
          transition={{
            rotate: { duration: 9, repeat: Infinity, ease: "linear" },
            opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      )}

      <OrbitRings reduceMotion={reduceMotion} />

      <SignalOrbit
        activeSignal={activeSignal}
        setActiveSignal={setActiveSignal}
        reduceMotion={reduceMotion}
      />

      <RecommendationCore reduceMotion={reduceMotion} />

      <motion.div
        aria-hidden
        animate={reduceMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[8%] rounded-full"
      >
        <motion.div
          animate={
            reduceMotion ? undefined : { y: [0, -6, 0], rotate: [0, -4, 0] }
          }
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[12%] top-[16%] flex size-10 items-center justify-center rounded-xl border border-white/75 bg-white/90 text-orange-500 shadow-[0_0_16px_rgba(251,146,60,0.3)] backdrop-blur dark:border-white/10 dark:bg-slate-900/80"
        >
          <UtensilsCrossed className="size-5" aria-hidden />
        </motion.div>

        <motion.div
          animate={
            reduceMotion ? undefined : { y: [0, 6, 0], rotate: [0, 4, 0] }
          }
          transition={{
            duration: 3.5,
            delay: 0.7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[10%] right-[16%] flex size-10 items-center justify-center rounded-xl border border-white/75 bg-white/90 text-emerald-500 shadow-[0_0_16px_rgba(52,211,153,0.3)] backdrop-blur dark:border-white/10 dark:bg-slate-900/80"
        >
          <MapPin className="size-5" aria-hidden />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function FoodHubSmartRecommendationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = Boolean(useReducedMotion());
  const [activeSignal, setActiveSignal] = useState(SIGNALS[0].label);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const rotateXInput = useTransform(pointerY, [-0.5, 0.5], [8, -8]);
  const rotateYInput = useTransform(pointerX, [-0.5, 0.5], [-8, 8]);
  const glowXInput = useTransform(pointerX, [-0.5, 0.5], [-115, 115]);
  const glowYInput = useTransform(pointerY, [-0.5, 0.5], [-80, 80]);

  const rotateX = useSpring(rotateXInput, {
    stiffness: 120,
    damping: 22,
    mass: 0.7,
  });

  const rotateY = useSpring(rotateYInput, {
    stiffness: 120,
    damping: 22,
    mass: 0.7,
  });

  const glowX = useSpring(glowXInput, {
    stiffness: 90,
    damping: 24,
  });

  const glowY = useSpring(glowYInput, {
    stiffness: 90,
    damping: 24,
  });

  useEffect(() => {
    if (reduceMotion) return;

    const intervalId = window.setInterval(() => {
      setActiveSignal((current) => {
        const currentIndex = SIGNALS.findIndex(
          (signal) => signal.label === current,
        );
        return SIGNALS[(currentIndex + 1) % SIGNALS.length].label;
      });
    }, 2600);

    return () => window.clearInterval(intervalId);
  }, [reduceMotion]);

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (reduceMotion || !sectionRef.current) return;

    const bounds = sectionRef.current.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    pointerX.set(x);
    pointerY.set(y);
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
      className="relative isolate w-full overflow-hidden py-20 text-slate-950 sm:py-28 lg:py-32 dark:text-white"
    >
      <BackgroundEffects reduceMotion={reduceMotion} />
      <LightningField reduceMotion={reduceMotion} />

      {!reduceMotion && (
        <motion.div
          aria-hidden
          style={{ x: glowX, y: glowY }}
          className="pointer-events-none absolute left-1/2 top-[42%] -z-10 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/15 blur-[95px]"
        />
      )}

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  scale: 0.9,
                  y: 24,
                  filter: "blur(12px)",
                }
          }
          whileInView={
            reduceMotion
              ? undefined
              : {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  filter: "blur(0px)",
                }
          }
          viewport={{ once: true, amount: 0.22 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <InteractiveOrbit
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
