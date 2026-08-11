"use client";

import { type PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  HeartPulse,
  Leaf,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { TypingAnimation } from "@/components/ui/typing-animation";

type FeatureColor = "emerald" | "orange";

type FeatureItem = {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: FeatureColor;
  positionClassName: string;
  path: string;
  delay: number;
};

/*
 * The order controls the automatic animation:
 *
 * top-left
 * top-right
 * right-middle
 * bottom
 * left-middle
 * back to top-left
 */
const FEATURES: FeatureItem[] = [
  {
    key: "diet",
    label: "របបអាហារ",
    description: "ណែនាំមុខម្ហូបតាមរបបអាហាររបស់អ្នក",
    icon: Leaf,
    color: "emerald",
    positionClassName: "left-[2%] top-[7%] md:left-[3%] md:top-[12%]",
    path: "M 492 307 C 410 250, 322 158, 174 112",
    delay: 0,
  },
  {
    key: "allergy",
    label: "អាឡែស៊ី",
    description: "ពិនិត្យគ្រឿងផ្សំដែលអាចបង្កអាឡែស៊ី",
    icon: ShieldCheck,
    color: "orange",
    positionClassName: "right-[2%] top-[7%] md:right-[3%] md:top-[12%]",
    path: "M 508 307 C 590 250, 678 158, 826 112",
    delay: 0.3,
  },
  {
    key: "family",
    label: "គ្រួសារ",
    description: "បង្កើតការណែនាំសម្រាប់សមាជិកម្នាក់ៗ",
    icon: Users,
    color: "orange",
    positionClassName:
      "right-0 top-[47%] -translate-y-1/2 md:right-[1%] md:top-[50%]",
    path: "M 513 318 C 640 320, 750 325, 882 320",
    delay: 0.6,
  },
  {
    key: "nutrition",
    label: "អាហារូបត្ថម្ភ",
    description: "ផ្គូផ្គងមុខម្ហូបតាមគោលដៅសុខភាព",
    icon: HeartPulse,
    color: "emerald",
    positionClassName: "bottom-[1%] left-1/2 -translate-x-1/2 md:bottom-[2%]",
    path: "M 500 333 C 500 405, 500 486, 500 548",
    delay: 0.9,
  },
  {
    key: "location",
    label: "ទីតាំង",
    description: "ស្វែងរកមុខម្ហូប និងហាងដែលនៅជិតអ្នក",
    icon: MapPin,
    color: "emerald",
    positionClassName:
      "left-0 top-[47%] -translate-y-1/2 md:left-[1%] md:top-[50%]",
    path: "M 487 318 C 360 320, 250 325, 118 320",
    delay: 1.2,
  },
];

const PARTICLES = Array.from({ length: 18 }, (_, index) => ({
  left: `${(index * 37 + 9) % 96}%`,
  top: `${(index * 53 + 7) % 92}%`,
  size: 2 + (index % 4),
  delay: (index % 7) * 0.45,
  duration: 5.5 + (index % 5) * 0.7,
}));

function HeroBackground({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
      <div className="absolute inset-0 bg-white dark:bg-[#020b08]" />

      <motion.div
        className="absolute -left-40 top-[10%] size-[420px] rounded-full bg-emerald-300/20 blur-[120px] dark:bg-emerald-500/10"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, 65, 0],
                y: [0, 30, 0],
                scale: [1, 1.14, 1],
              }
        }
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute -right-44 bottom-[4%] size-[440px] rounded-full bg-orange-300/20 blur-[125px] dark:bg-orange-500/10"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, -55, 0],
                y: [0, -35, 0],
                scale: [1, 1.12, 1],
              }
        }
        transition={{
          duration: 12,
          delay: 0.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_63%,rgba(16,185,129,0.14),transparent_34%)] dark:bg-[radial-gradient(circle_at_50%_63%,rgba(16,185,129,0.11),transparent_38%)]" />

      <div className="absolute inset-0 opacity-[0.032] [background-image:linear-gradient(rgba(15,23,42,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.7)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] dark:opacity-[0.065] dark:[background-image:linear-gradient(rgba(255,255,255,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.45)_1px,transparent_1px)]" />

      {PARTICLES.map((particle, index) => (
        <motion.span
          key={`${particle.left}-${particle.top}`}
          className={`absolute rounded-full ${
            index % 4 === 0
              ? "bg-orange-400/65 shadow-[0_0_18px_rgba(251,146,60,0.65)]"
              : "bg-emerald-400/60 shadow-[0_0_18px_rgba(52,211,153,0.58)]"
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
                  y: [0, -24, 0],
                  x: [0, index % 2 === 0 ? 10 : -10, 0],
                  opacity: [0.1, 0.9, 0.1],
                  scale: [0.8, 1.55, 0.8],
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
    </div>
  );
}

function ConnectionLines({
  activeKey,
  reduceMotion,
}: {
  activeKey: string;
  reduceMotion: boolean;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1000 620"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 hidden size-full md:block"
    >
      <defs>
        <linearGradient id="line-emerald" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d1fae5" stopOpacity="0.25" />
          <stop offset="0.48" stopColor="#34d399" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.4" />
        </linearGradient>

        <linearGradient id="line-orange" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffedd5" stopOpacity="0.25" />
          <stop offset="0.48" stopColor="#fb923c" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.4" />
        </linearGradient>

        <filter id="line-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="5" result="blur" />

          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {FEATURES.map((feature) => {
        const active = activeKey === feature.key;

        const stroke =
          feature.color === "emerald"
            ? "url(#line-emerald)"
            : "url(#line-orange)";

        return (
          <g key={feature.key}>
            <path
              d={feature.path}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 10"
              className="text-slate-300/45 dark:text-white/10"
            />

            <motion.path
              d={feature.path}
              fill="none"
              stroke={stroke}
              strokeWidth={active ? 4 : 2.2}
              strokeLinecap="round"
              filter={active ? "url(#line-glow)" : undefined}
              initial={false}
              animate={
                reduceMotion
                  ? {
                      opacity: active ? 1 : 0.16,
                    }
                  : {
                      pathLength: active ? [0.1, 1, 0.1] : 1,
                      pathOffset: active ? [0, 0.06, 0] : 0,
                      opacity: active ? [0.35, 1, 0.35] : 0.14,
                    }
              }
              transition={{
                duration: active ? 1.8 : 0.35,
                repeat: active && !reduceMotion ? Infinity : 0,
                ease: "easeInOut",
              }}
            />

            {active && !reduceMotion && (
              <motion.circle
                r="5"
                fill={feature.color === "emerald" ? "#34d399" : "#fb923c"}
                filter="url(#line-glow)"
                initial={{
                  offsetDistance: "0%",
                  opacity: 0,
                }}
                animate={{
                  offsetDistance: ["0%", "100%"],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 1.7,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  offsetPath: `path("${feature.path}")`,
                }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function FeatureCard({
  feature,
  active,
  reduceMotion,
  onActivate,
  onFeatureHoverStart,
  onFeatureHoverEnd,
}: {
  feature: FeatureItem;
  active: boolean;
  reduceMotion: boolean;
  onActivate: (key: string) => void;
  onFeatureHoverStart: (key: string) => void;
  onFeatureHoverEnd: () => void;
}) {
  const Icon = feature.icon;
  const emerald = feature.color === "emerald";

  function activateHoveredFeature() {
    onFeatureHoverStart(feature.key);
    onActivate(feature.key);
  }

  return (
    <div className={`absolute z-30 ${feature.positionClassName}`}>
      <motion.button
        type="button"
        aria-label={`${feature.label}: ${feature.description}`}
        aria-pressed={active}
        onPointerEnter={activateHoveredFeature}
        onPointerLeave={onFeatureHoverEnd}
        onFocus={activateHoveredFeature}
        onBlur={onFeatureHoverEnd}
        onClick={() => onActivate(feature.key)}
        whileHover={
          reduceMotion
            ? undefined
            : {
                scale: 1.08,
                y: -7,
              }
        }
        whileTap={{
          scale: 0.95,
        }}
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -8, 0],
                rotate: [0, emerald ? -1.4 : 1.4, 0],
              }
        }
        transition={{
          duration: 3.4,
          delay: feature.delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`group relative flex h-14 min-w-14 items-center justify-center gap-3 overflow-hidden rounded-2xl border px-2.5 backdrop-blur-2xl transition-[border-color,background-color,color,box-shadow] duration-300 sm:h-16 sm:min-w-[150px] sm:justify-start sm:px-3.5 ${
          active
            ? emerald
              ? "border-emerald-300/90 bg-white/92 text-emerald-700 shadow-[0_18px_50px_-18px_rgba(16,185,129,0.78)] dark:border-emerald-300/70 dark:bg-emerald-950/65 dark:text-emerald-100"
              : "border-orange-300/90 bg-white/92 text-orange-700 shadow-[0_18px_50px_-18px_rgba(249,115,22,0.76)] dark:border-orange-300/70 dark:bg-orange-950/55 dark:text-orange-100"
            : "border-white/80 bg-white/72 text-slate-700 shadow-[0_16px_44px_-24px_rgba(15,23,42,0.65)] hover:border-emerald-300 dark:border-white/10 dark:bg-slate-950/58 dark:text-slate-200"
        }`}
      >
        {active && (
          <motion.span
            layoutId="active-feature-card"
            className={`absolute inset-0 -z-10 ${
              emerald
                ? "bg-[linear-gradient(110deg,rgba(16,185,129,0.08),rgba(255,255,255,0.85),rgba(16,185,129,0.12))] dark:bg-[linear-gradient(110deg,rgba(16,185,129,0.12),rgba(6,78,59,0.32),rgba(16,185,129,0.16))]"
                : "bg-[linear-gradient(110deg,rgba(249,115,22,0.08),rgba(255,255,255,0.85),rgba(249,115,22,0.12))] dark:bg-[linear-gradient(110deg,rgba(249,115,22,0.12),rgba(124,45,18,0.26),rgba(249,115,22,0.16))]"
            }`}
          />
        )}

        {active && !reduceMotion && (
          <motion.span
            aria-hidden
            className="absolute -left-14 top-0 h-full w-10 skew-x-[-18deg] bg-white/85 blur-sm"
            animate={{
              left: ["-30%", "130%"],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              repeatDelay: 0.8,
              ease: "easeInOut",
            }}
          />
        )}

        <span
          className={`relative flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-11 ${
            emerald
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-200"
              : "bg-orange-100 text-orange-600 dark:bg-orange-400/15 dark:text-orange-200"
          }`}
        >
          <Icon className="size-5 sm:size-[22px]" aria-hidden />

          {active && !reduceMotion && (
            <motion.span
              aria-hidden
              className={`absolute inset-0 rounded-xl border ${
                emerald ? "border-emerald-400" : "border-orange-400"
              }`}
              animate={{
                scale: [1, 1.65],
                opacity: [0.65, 0],
              }}
              transition={{
                duration: 1.35,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          )}
        </span>

        <span className="hidden text-left sm:block">
          <span className="block whitespace-nowrap text-[16px] font-bold">
            {feature.label}
          </span>

          <span className="mt-0.5 hidden max-w-[190px] text-[13px] font-normal leading-5 text-slate-500 xl:block dark:text-slate-300">
            {feature.description}
          </span>
        </span>

        <motion.span
          aria-hidden
          className={`absolute right-2 top-2 size-2 rounded-full ${
            active
              ? emerald
                ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)]"
                : "bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,1)]"
              : "bg-slate-300 dark:bg-slate-700"
          }`}
          animate={
            active && !reduceMotion
              ? {
                  scale: [0.7, 1.4, 0.7],
                  opacity: [0.6, 1, 0.6],
                }
              : undefined
          }
          transition={{
            duration: 1.3,
            repeat: Infinity,
          }}
        />
      </motion.button>
    </div>
  );
}

function AICore({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="relative flex size-[88px] items-center justify-center sm:size-[126px]">
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/30 via-emerald-600/25 to-orange-500/30 blur-xl"
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [0.92, 1.32, 0.92],
                opacity: [0.7, 0.12, 0.7],
              }
        }
        transition={{
          duration: 2.7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full border border-dashed border-cyan-300/70"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.span
        aria-hidden
        className="absolute inset-[6px] rounded-full border border-orange-300/50"
        animate={reduceMotion ? undefined : { rotate: -360 }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {!reduceMotion && (
        <>
          <motion.span
            aria-hidden
            className="absolute inset-[2px] rounded-full"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <span className="absolute left-1/2 top-0 size-2.5 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,1)] sm:size-3" />
          </motion.span>

          <motion.span
            aria-hidden
            className="absolute inset-[9px] rounded-full"
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 6.5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <span className="absolute bottom-0 left-1/2 size-2 -translate-x-1/2 rounded-full bg-yellow-300 shadow-[0_0_14px_rgba(253,224,71,1)] sm:size-2.5" />
          </motion.span>
        </>
      )}

      <div className="absolute inset-[9px] rounded-full bg-gradient-to-br from-cyan-300 via-emerald-600 to-orange-500 p-[2px] shadow-[0_20px_45px_rgba(20,90,65,0.5)]">
        <div className="relative flex size-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#062f2b] via-[#064e3b] to-[#1b4332]">
          <motion.span
            aria-hidden
            className="absolute -left-7 -top-8 size-20 rounded-full bg-cyan-200/25 blur-2xl"
            animate={
              reduceMotion
                ? undefined
                : {
                    x: [0, 40, 0],
                    y: [0, 28, 0],
                  }
            }
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
              backgroundSize: "10px 10px",
            }}
          />

          {!reduceMotion && (
            <motion.span
              aria-hidden
              className="absolute left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-cyan-200 to-transparent shadow-[0_0_10px_rgba(165,243,252,1)]"
              animate={{
                y: [-26, 26, -26],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          <motion.div
            className="relative z-10 flex flex-col items-center"
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, -2, 0],
                  }
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="relative mb-1 h-3 w-[2px] rounded-full bg-white/80">
              <motion.span
                className="absolute -left-[4px] -top-1.5 size-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,1)]"
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        scale: [1, 0.7, 1],
                        opacity: [1, 0.4, 1],
                      }
                }
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                }}
              />
            </div>

            <div className="relative flex h-8 w-11 items-center justify-center gap-2 rounded-[12px] border border-cyan-100/20 bg-white/10 shadow-inner backdrop-blur sm:h-9 sm:w-12 sm:gap-2.5">
              <motion.span
                className="h-3 w-2 rounded-full bg-cyan-100 shadow-[0_0_10px_rgba(207,250,254,1)]"
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        scaleY: [1, 1, 0.15, 1],
                      }
                }
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  times: [0, 0.45, 0.5, 1],
                }}
              />

              <motion.span
                className="h-3 w-2 rounded-full bg-cyan-100 shadow-[0_0_10px_rgba(207,250,254,1)]"
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        scaleY: [1, 1, 0.15, 1],
                      }
                }
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  times: [0, 0.45, 0.5, 1],
                }}
              />

              <motion.span
                className="absolute inset-x-2 bottom-1 h-[1px] rounded-full bg-cyan-200/70"
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        scaleX: [0.5, 1, 0.5],
                        opacity: [0.4, 1, 0.4],
                      }
                }
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                }}
              />
            </div>

            <div className="mt-1.5 flex items-end gap-0.5">
              {[5, 8, 6, 10, 5].map((height, index) => (
                <motion.span
                  key={`${height}-${index}`}
                  className="w-1 rounded-full bg-cyan-200"
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          height: [height, height + 5, height],
                        }
                  }
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: index * 0.1,
                  }}
                  style={{
                    height,
                  }}
                />
              ))}
            </div>
          </motion.div>

          <motion.span
            aria-hidden
            className="absolute right-1.5 top-1.5 text-yellow-300 sm:right-2 sm:top-2"
            animate={
              reduceMotion
                ? undefined
                : {
                    rotate: 360,
                    scale: [0.8, 1.25, 0.8],
                  }
            }
            transition={{
              rotate: {
                duration: 6,
                repeat: Infinity,
                ease: "linear",
              },
              scale: {
                duration: 1.6,
                repeat: Infinity,
              },
            }}
          >
            <Sparkles className="size-3.5 sm:size-4" />
          </motion.span>
        </div>
      </div>

      <motion.span
        aria-hidden
        className="absolute bottom-0 left-0 z-30 flex size-5 items-center justify-center rounded-full bg-white shadow-lg sm:size-6"
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [1, 1.1, 1],
              }
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      >
        <span className="size-2.5 rounded-full bg-green-400 ring-2 ring-green-100 sm:size-3.5" />
      </motion.span>

      <motion.span
        initial={
          reduceMotion
            ? false
            : {
                scale: 0,
                rotate: -20,
              }
        }
        animate={{
          scale: 1,
          rotate: 0,
        }}
        transition={{
          delay: 0.5,
          type: "spring",
          stiffness: 400,
          damping: 16,
        }}
        className="absolute -right-2 top-0 z-30 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-orange-400 to-orange-600 px-1 text-[11px] font-bold text-white shadow-lg sm:-right-3 sm:h-8 sm:min-w-8 sm:text-[13px]"
      >
        AI
      </motion.span>
    </div>
  );
}

function LogoCore({
  activeFeature,
  reduceMotion,
}: {
  activeFeature: FeatureItem;
  reduceMotion: boolean;
}) {
  const ActiveIcon = activeFeature.icon;
  const emerald = activeFeature.color === "emerald";

  return (
    <div className="absolute inset-0 grid place-items-center">
      <motion.div
        aria-hidden
        className="absolute size-[250px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.82),rgba(16,185,129,0.25)_30%,rgba(16,185,129,0.06)_54%,transparent_72%)] blur-2xl sm:size-[340px] dark:bg-[radial-gradient(circle,rgba(255,255,255,0.15),rgba(16,185,129,0.22)_30%,rgba(16,185,129,0.04)_58%,transparent_74%)]"
        animate={
          reduceMotion
            ? undefined
            : {
                scale: [0.82, 1.14, 0.82],
                opacity: [0.3, 0.9, 0.3],
              }
        }
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        aria-hidden
        className="absolute size-[215px] rounded-full border border-dashed border-emerald-400/35 sm:size-[300px] dark:border-emerald-300/20"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <span className="absolute left-1/2 top-[-5px] size-2.5 -translate-x-1/2 rounded-full bg-emerald-300 shadow-[0_0_8px_2px_white,0_0_20px_5px_rgba(52,211,153,0.8)]" />

        <span className="absolute bottom-[-4px] left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-orange-300 shadow-[0_0_8px_2px_white,0_0_20px_5px_rgba(251,146,60,0.8)]" />
      </motion.div>

      <motion.div
        aria-hidden
        className="absolute size-[178px] rounded-full [background:conic-gradient(from_0deg,transparent,rgba(52,211,153,0.8),transparent_20%,transparent_48%,rgba(251,146,60,0.78),transparent_70%)] [mask:radial-gradient(farthest-side,transparent_calc(100%-3px),#000_calc(100%-1px))] sm:size-[252px]"
        animate={reduceMotion ? undefined : { rotate: -360 }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -7, 0],
                scale: [1, 1.025, 1],
                rotate: [0, 0.6, 0],
              }
        }
        transition={{
          duration: 3.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative grid size-[156px] place-items-center rounded-[2.4rem] bg-[conic-gradient(from_210deg,#22d3ee,#34d399_35%,#fb923c_68%,#22d3ee)] p-[2px] shadow-[0_30px_90px_-28px_rgba(16,185,129,0.88)] sm:size-[220px] sm:rounded-[3rem]"
      >
        {!reduceMotion && (
          <motion.span
            aria-hidden
            className="absolute -inset-1 rounded-[2.6rem] bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.95),transparent_16%,transparent_45%,rgba(52,211,153,0.85),transparent_61%,rgba(251,146,60,0.85),transparent_80%)] blur-[3px] sm:rounded-[3.2rem]"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}

        <div className="relative flex size-full flex-col items-center justify-center overflow-hidden rounded-[2.35rem] border border-white/90 bg-white/90 p-3 backdrop-blur-2xl sm:rounded-[2.95rem] sm:p-5 dark:border-white/10 dark:bg-[#06130e]/90">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.95),rgba(16,185,129,0.12)_40%,transparent_66%)] dark:bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.14),rgba(16,185,129,0.13)_42%,transparent_68%)]" />

          {!reduceMotion && (
            <motion.span
              aria-hidden
              className="absolute inset-x-[10%] z-20 h-10 rounded-full bg-gradient-to-r from-transparent via-white/80 to-transparent blur-md"
              animate={{
                top: ["-25%", "115%"],
                opacity: [0, 0.9, 0],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                repeatDelay: 0.7,
                ease: "linear",
              }}
            />
          )}

          <motion.div
            key={activeFeature.key}
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    scale: 0.88,
                    y: 8,
                  }
            }
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{
              duration: 0.38,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="relative">
              <AICore reduceMotion={reduceMotion} />

              <motion.span
                aria-hidden
                className={`absolute -bottom-1 -right-1 z-40 flex size-8 items-center justify-center rounded-xl border-2 border-white text-white shadow-lg sm:size-10 ${
                  emerald ? "bg-emerald-500" : "bg-orange-500"
                }`}
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        rotate: [0, -8, 8, 0],
                        scale: [1, 1.1, 1],
                      }
                }
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <ActiveIcon className="size-4 sm:size-5" />
              </motion.span>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-[14px] font-bold text-slate-900 sm:mt-3 sm:text-[17px] dark:text-white">
              <Sparkles
                className={`size-4 ${
                  emerald ? "text-emerald-500" : "text-orange-500"
                }`}
                aria-hidden
              />

              <span>{activeFeature.label}</span>
            </div>

            <p className="mt-1 hidden max-w-[185px] text-center text-[13px] leading-5 text-slate-500 sm:block dark:text-slate-300">
              {activeFeature.description}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {!reduceMotion && (
        <>
          <motion.span
            aria-hidden
            className="absolute left-[38%] top-[24%] size-2 rounded-full bg-white shadow-[0_0_8px_2px_white,0_0_18px_5px_rgba(52,211,153,0.72)]"
            animate={{
              x: [0, 45, 64, 18, 0],
              y: [0, 18, 58, 80, 0],
              opacity: [0.2, 1, 0.65, 1, 0.2],
            }}
            transition={{
              duration: 4.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.span
            aria-hidden
            className="absolute bottom-[24%] right-[38%] size-2 rounded-full bg-orange-200 shadow-[0_0_8px_2px_white,0_0_18px_5px_rgba(251,146,60,0.72)]"
            animate={{
              x: [0, -42, -66, -20, 0],
              y: [0, -16, -55, -78, 0],
              opacity: [0.2, 1, 0.65, 1, 0.2],
            }}
            transition={{
              duration: 4.9,
              delay: 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </>
      )}
    </div>
  );
}

function InteractiveVisual({
  activeFeature,
  activeKey,
  setActiveKey,
  setHoveredFeatureKey,
  reduceMotion,
  rotateX,
  rotateY,
  layerX,
  layerY,
}: {
  activeFeature: FeatureItem;
  activeKey: string;
  setActiveKey: (key: string) => void;
  setHoveredFeatureKey: (key: string | null) => void;
  reduceMotion: boolean;
  rotateX: ReturnType<typeof useSpring>;
  rotateY: ReturnType<typeof useSpring>;
  layerX: ReturnType<typeof useSpring>;
  layerY: ReturnType<typeof useSpring>;
}) {
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
      className="relative mx-auto h-[430px] w-full max-w-[980px] sm:h-[520px] md:h-[620px] [transform-style:preserve-3d]"
    >
      <motion.div
        aria-hidden
        style={
          reduceMotion
            ? undefined
            : {
                x: layerX,
                y: layerY,
              }
        }
        className="absolute inset-[10%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.6),rgba(16,185,129,0.16)_30%,rgba(249,115,22,0.08)_52%,transparent_72%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(255,255,255,0.1),rgba(16,185,129,0.16)_30%,rgba(249,115,22,0.07)_54%,transparent_74%)]"
      />

      <ConnectionLines activeKey={activeKey} reduceMotion={reduceMotion} />

      <LogoCore activeFeature={activeFeature} reduceMotion={reduceMotion} />

      {FEATURES.map((feature) => (
        <FeatureCard
          key={feature.key}
          feature={feature}
          active={activeKey === feature.key}
          reduceMotion={reduceMotion}
          onActivate={setActiveKey}
          onFeatureHoverStart={(key) => {
            setHoveredFeatureKey(key);
            setActiveKey(key);
          }}
          onFeatureHoverEnd={() => {
            setHoveredFeatureKey(null);
          }}
        />
      ))}
    </motion.div>
  );
}

export default function FoodHubHeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const reduceMotion = Boolean(useReducedMotion());

  const [activeKey, setActiveKey] = useState(FEATURES[0].key);

  /*
   * null means no feature is being hovered.
   * When null, automatic switching runs.
   */
  const [hoveredFeatureKey, setHoveredFeatureKey] = useState<string | null>(
    null,
  );

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const rotateXInput = useTransform(pointerY, [-0.5, 0.5], [7, -7]);
  const rotateYInput = useTransform(pointerX, [-0.5, 0.5], [-8, 8]);

  const glowXInput = useTransform(pointerX, [-0.5, 0.5], [-130, 130]);
  const glowYInput = useTransform(pointerY, [-0.5, 0.5], [-75, 75]);

  const layerXInput = useTransform(pointerX, [-0.5, 0.5], [22, -22]);
  const layerYInput = useTransform(pointerY, [-0.5, 0.5], [16, -16]);

  const rotateX = useSpring(rotateXInput, {
    stiffness: 105,
    damping: 21,
    mass: 0.75,
  });

  const rotateY = useSpring(rotateYInput, {
    stiffness: 105,
    damping: 21,
    mass: 0.75,
  });

  const glowX = useSpring(glowXInput, {
    stiffness: 80,
    damping: 22,
  });

  const glowY = useSpring(glowYInput, {
    stiffness: 80,
    damping: 22,
  });

  const layerX = useSpring(layerXInput, {
    stiffness: 75,
    damping: 24,
  });

  const layerY = useSpring(layerYInput, {
    stiffness: 75,
    damping: 24,
  });

  const activeFeature = useMemo(() => {
    return FEATURES.find((feature) => feature.key === activeKey) ?? FEATURES[0];
  }, [activeKey]);

  /*
   * Automatically move from one feature to the next.
   *
   * Hovering a feature pauses this timer.
   * Leaving the feature starts the timer again.
   */
  useEffect(() => {
    if (reduceMotion || hoveredFeatureKey !== null) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveKey((currentKey) => {
        const currentIndex = FEATURES.findIndex(
          (feature) => feature.key === currentKey,
        );

        const safeCurrentIndex = currentIndex === -1 ? 0 : currentIndex;
        const nextIndex = (safeCurrentIndex + 1) % FEATURES.length;

        return FEATURES[nextIndex].key;
      });
    }, 2300);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [hoveredFeatureKey, reduceMotion]);

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (reduceMotion || !sectionRef.current) {
      return;
    }

    const bounds = sectionRef.current.getBoundingClientRect();

    const normalizedX = (event.clientX - bounds.left) / bounds.width - 0.5;

    const normalizedY = (event.clientY - bounds.top) / bounds.height - 0.5;

    pointerX.set(normalizedX);
    pointerY.set(normalizedY);
  }

  function resetPointer() {
    pointerX.set(0);
    pointerY.set(0);
    setHoveredFeatureKey(null);
  }

  return (
    <section
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      className="relative isolate min-h-screen w-full overflow-hidden pt-24 text-slate-950 lg:pt-20 dark:text-white"
    >
      <HeroBackground reduceMotion={reduceMotion} />

      {!reduceMotion && (
        <motion.div
          aria-hidden
          style={{
            x: glowX,
            y: glowY,
          }}
          className="pointer-events-none absolute left-1/2 top-[62%] -z-10 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/18 blur-[110px] sm:size-[560px] dark:bg-emerald-400/10"
        />
      )}

      <div className="container mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 py-14 sm:px-6 sm:py-16 lg:px-0 lg:py-8">
        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 28,
                  filter: "blur(12px)",
                }
          }
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 0.85,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative z-20 flex max-w-5xl flex-col items-center gap-5 text-center sm:gap-6"
        >
          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    scale: 0.9,
                  }
            }
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.55,
              delay: 0.1,
            }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/70 px-4 py-2 text-[14px] font-semibold text-emerald-700 shadow-sm backdrop-blur-xl dark:border-emerald-300/15 dark:bg-emerald-950/35 dark:text-emerald-200"
          >
            <Sparkles className="size-4" aria-hidden />
            Smart Food Recommendation
          </motion.div>

          <h1 className="text-balance text-3xl font-semibold leading-[1.45] text-primary-800 dark:text-primary-dark sm:text-4xl md:text-5xl lg:text-[56px] dark:text-emerald-300">
            បទពិសោធន៍ថ្មីក្នុង
            <TypingAnimation
              words={["ការស្វែងរកអាហារ", "ការជ្រើសរើសមុខម្ហូប"]}
              blinkCursor
              pauseDelay={1900}
              loop
              className="inline-block text-secondary-500 dark:text-orange-400"
            >
              ការស្វែងរកអាហារ
            </TypingAnimation>
          </h1>

          <p className="max-w-5xl text-center text-[16px] font-light leading-7 text-gray-700 sm:text-[18px] sm:leading-8 md:text-[20px] lg:text-[22px] lg:leading-10 dark:text-gray-100">
            ស្វែងរកមុខម្ហូប និងហាងអាហារដែលសមនឹងអ្នក តាមរយៈ
            <br className="hidden sm:block" />
            ប្រព័ន្ធណែនាំឆ្លាតវៃ ដែលគិតគូរពីចំណូលចិត្ត អាឡែស៊ី របបអាហារ
            ជំនឿសាសនា និងទីតាំងរបស់អ្នក
          </p>
        </motion.div>

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  scale: 0.9,
                  y: 35,
                  filter: "blur(14px)",
                }
          }
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 1,
            delay: 0.16,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative mt-4 w-full sm:mt-6 lg:mt-2"
        >
          <InteractiveVisual
            activeFeature={activeFeature}
            activeKey={activeKey}
            setActiveKey={setActiveKey}
            setHoveredFeatureKey={setHoveredFeatureKey}
            reduceMotion={reduceMotion}
            rotateX={rotateX}
            rotateY={rotateY}
            layerX={layerX}
            layerY={layerY}
          />
        </motion.div>
      </div>
    </section>
  );
}
