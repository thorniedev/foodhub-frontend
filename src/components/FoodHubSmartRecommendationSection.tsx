"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Clock3,
  HeartPulse,
  Leaf,
  MapPin,
  Navigation,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  UtensilsCrossed,
} from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  badge: string;
  delay?: number;
}

const leftFeatures: FeatureCardProps[] = [
  {
    icon: SlidersHorizontal,
    eyebrow: "Personalized for you",
    title: "Preference Match",
    description:
      "FoodHub learns your favorite tastes, meal types, and dietary choices.",
    badge: "98% match",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Eat with confidence",
    title: "Allergy Safety",
    description:
      "Meals are checked against the allergens saved in each family profile.",
    badge: "Safety checked",
  },
];

const rightFeatures: FeatureCardProps[] = [
  {
    icon: MapPin,
    eyebrow: "Available around you",
    title: "Nearby Food",
    description:
      "Discover suitable meals from nearby restaurants based on your location.",
    badge: "1.2 km away",
  },
  {
    icon: HeartPulse,
    eyebrow: "Built around your goal",
    title: "Nutrition Goals",
    description:
      "Balance calories, protein, and meal choices without losing great taste.",
    badge: "Goal friendly",
  },
];

const preferenceNodes = [
  { label: "Diet", icon: Leaf, position: "left-[5%] top-[17%]", delay: 0 },
  {
    label: "Family",
    icon: Users,
    position: "right-[3%] top-[20%]",
    delay: 0.35,
  },
  {
    label: "Allergy",
    icon: ShieldCheck,
    position: "left-[1%] bottom-[22%]",
    delay: 0.7,
  },
  {
    label: "Location",
    icon: Navigation,
    position: "right-[1%] bottom-[20%]",
    delay: 1.05,
  },
];

const foodTags = [
  {
    emoji: "🥗",
    label: "Healthy",
    position: "left-[11%] top-[44%]",
    delay: 0.1,
  },
  { emoji: "🍜", label: "Khmer", position: "right-[8%] top-[43%]", delay: 0.5 },
  {
    emoji: "🍲",
    label: "Warm",
    position: "left-[24%] bottom-[5%]",
    delay: 0.9,
  },
  {
    emoji: "🥑",
    label: "Fresh",
    position: "right-[22%] bottom-[4%]",
    delay: 1.3,
  },
];

const beamRows = [
  { top: "18%", duration: 8, delay: 0 },
  { top: "48%", duration: 10, delay: 2.2 },
  { top: "78%", duration: 9, delay: 4.1 },
];

function FeatureCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  badge,
  delay = 0,
}: FeatureCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.97 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -7, scale: 1.015 }}
      className="group relative overflow-hidden rounded-[28px] border border-emerald-200/70 bg-white/80 p-5 shadow-[0_18px_55px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl transition-colors duration-300 hover:border-orange-300 dark:border-white/10 dark:bg-slate-950/70"
    >
      <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute -right-14 -top-14 h-32 w-32 rounded-full bg-orange-400/10 blur-2xl transition-transform duration-500 group-hover:scale-150" />

      <div className="relative flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
          <Icon className="size-6" aria-hidden="true" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-600 dark:text-orange-400">
            {eyebrow}
          </p>
          <h3 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
            {title}
          </h3>
        </div>
      </div>

      <p className="relative mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
        {description}
      </p>

      <div className="relative mt-5 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
          <Sparkles className="size-4" aria-hidden="true" />
          {badge}
        </span>
        <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_16px_4px_rgba(249,115,22,0.45)]" />
      </div>
    </motion.article>
  );
}

function RecommendationCore() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto aspect-square w-full max-w-[560px]"
    >
      <div className="absolute inset-[5%] rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.16),transparent_62%)] blur-2xl" />

      <motion.div
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[8%] rounded-full border border-dashed border-emerald-400/35"
      />
      <motion.div
        animate={reduceMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[18%] rounded-full border border-dashed border-orange-400/45"
      />

      <div className="absolute inset-[28%] rounded-full border border-white/70 bg-white/85 shadow-[0_30px_100px_-35px_rgba(22,163,74,0.65)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85">
        <motion.div
          animate={reduceMotion ? undefined : { scale: [1, 1.045, 1] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-3 rounded-full bg-gradient-to-br from-emerald-500 via-green-500 to-orange-500 p-[2px]"
        >
          <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white px-4 text-center dark:bg-slate-950">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-orange-500 text-white shadow-lg shadow-emerald-500/20">
              <UtensilsCrossed className="size-7" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
              FoodHub AI
            </p>
            <p className="mt-1 text-xl font-black text-slate-950 dark:text-white sm:text-2xl">
              Your best meal
            </p>
            <div className="mt-3 flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
              <Star className="size-4 fill-current" aria-hidden="true" />
              98% match
            </div>
          </div>
        </motion.div>
      </div>

      {preferenceNodes.map(({ label, icon: Icon, position, delay }) => (
        <motion.div
          key={label}
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -9, 0],
                  scale: [1, 1.04, 1],
                }
          }
          transition={{
            duration: 4,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute ${position} z-20`}
        >
          <div className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/85 px-3 py-2 text-sm font-bold text-slate-700 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/85 dark:text-slate-100">
            <span className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            {label}
          </div>
        </motion.div>
      ))}

      {foodTags.map(({ emoji, label, position, delay }) => (
        <motion.div
          key={label}
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, 8, 0],
                  rotate: [-1.5, 1.5, -1.5],
                }
          }
          transition={{
            duration: 4.8,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute ${position} z-10`}
        >
          <div className="flex items-center gap-2 rounded-full border border-orange-200/80 bg-white/80 px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-md backdrop-blur-md dark:border-orange-500/20 dark:bg-slate-900/80 dark:text-slate-200">
            <span className="text-lg" aria-hidden="true">
              {emoji}
            </span>
            {label}
          </div>
        </motion.div>
      ))}

      <motion.div
        animate={reduceMotion ? undefined : { opacity: [0.35, 0.9, 0.35] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-[14%] h-[72%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-orange-400 to-transparent"
      />

      <div className="absolute bottom-[13%] left-1/2 z-30 w-[68%] -translate-x-1/2 rounded-2xl border border-white/70 bg-white/90 p-3 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
              <Clock3 className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Ready nearby
              </p>
              <p className="text-base font-bold text-slate-950 dark:text-white">
                Chicken Amok Bowl
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500 px-3 py-1.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20">
            18 min
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function FoodHubSmartRecommendationSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate w-full overflow-hidden border-y border-emerald-200/70 bg-[#f8fff9] py-20 text-slate-950 dark:border-white/10 dark:bg-[#06110b] dark:text-white sm:py-24 lg:py-28">
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_50%_32%,rgba(34,197,94,0.18),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(249,115,22,0.14),transparent_25%),radial-gradient(circle_at_15%_78%,rgba(34,197,94,0.12),transparent_28%)]" />
      <div className="absolute inset-0 -z-20 opacity-[0.35] [background-image:linear-gradient(rgba(22,163,74,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(22,163,74,0.10)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)] dark:opacity-[0.12]" />

      {!reduceMotion && (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          {beamRows.map((beam) => (
            <motion.div
              key={beam.top}
              initial={{ x: "-35vw", opacity: 0 }}
              animate={{ x: "130vw", opacity: [0, 0.75, 0.75, 0] }}
              transition={{
                duration: beam.duration,
                delay: beam.delay,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ top: beam.top }}
              className="absolute left-0 h-px w-56 bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_22px_5px_rgba(249,115,22,0.18)]"
            />
          ))}
        </div>
      )}

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-bold text-emerald-700 shadow-sm backdrop-blur dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            <Sparkles className="size-4" aria-hidden="true" />
            Smart food discovery
          </div>

          <h2 className="mt-6 text-balance text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            One recommendation, built from{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-orange-500 bg-clip-text text-transparent">
              everything that matters
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
            FoodHub combines your food preferences, dietary needs, allergy
            information, nutrition goals, family profiles, and location to find
            meals that truly fit you.
          </p>
        </motion.div>

        <div className="relative mt-14 grid items-center gap-8 lg:mt-20 lg:grid-cols-12 lg:gap-6">
          <div className="order-2 grid gap-6 sm:grid-cols-2 lg:order-1 lg:col-span-3 lg:grid-cols-1">
            {leftFeatures.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={index * 0.12}
              />
            ))}
          </div>

          <div className="order-1 lg:order-2 lg:col-span-6">
            <RecommendationCore />
          </div>

          <div className="order-3 grid gap-6 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-1">
            {rightFeatures.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={0.15 + index * 0.12}
              />
            ))}
          </div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-3 rounded-[28px] border border-emerald-200/80 bg-white/75 p-4 shadow-[0_18px_60px_-38px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60"
        >
          {[
            "Dietary preferences",
            "Food allergies",
            "Religious restrictions",
            "Nutrition goals",
            "Family profiles",
            "Current location",
          ].map((item, index) => (
            <motion.span
              key={item}
              whileHover={reduceMotion ? undefined : { y: -3, scale: 1.03 }}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              <span className="mr-2 text-emerald-500">0{index + 1}</span>
              {item}
            </motion.span>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </section>
  );
}
