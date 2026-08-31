// components/about/GoalsSection.tsx
"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/** Shared "expo out" curve — fast start, soft landing. Feels premium, not bouncy. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

interface GoalCardProps {
  number: number;
  badgeBg: string;
  badgeColor: string;
  title: string;
  description: string;
  cardBg: string;
  imageSrc?: string;
}

const goalsData: GoalCardProps[] = [
  {
    number: 1,
    badgeBg: "bg-[#22c55e]",
    badgeColor: "bg-[#e8f5e9] text-[#136c34]",
    title: "បេសកកម្ម",
    description:
      "ស្វែងរកម្ហូបនិងភេសជ្ជៈដែលអ្នកចូលចិត្តបានយ៉ាងលឿន និងងាយស្រួលបំផុត! ជាមួយសេវាកម្មរហ័សទាន់ចិត្តជម្រើសសម្បូរបែប ៖",
    cardBg: "bg-[#E9F9EF]",
    imageSrc: "/about/mee.png",
  },
  {
    number: 2,
    badgeBg: "bg-[#22c55e]",
    badgeColor: "bg-[#e8f5e9] text-[#136c34]",
    title: "ចក្ខុវិស័យ",
    description: "វេទិកាស្វែងរកនិងណែនាំអាហារឈានមុខគេ ជាមួយបទពិសោធន៍ល្អបំផុត!",
    cardBg: "",
  },
  {
    number: 3,
    badgeBg: "bg-[#f97316]",
    badgeColor: "bg-[#fff3eb] text-[#f97316]",
    title: "តម្លៃស្នូល",
    description:
      "យើងផ្ដោតលើគុណភាពភាពងាយស្រួល ការច្នៃប្រឌិត និងការដាក់អ្នកប្រើប្រាស់ជាចម្បងក្នុងការអភិវឌ្ឍសេវាកម្មរបស់យើង ៖",
    cardBg: "bg-[#fff7ed]",
  },
];

/* =========================================================
   MOTION HELPERS

   Same idiom as MentorSection: each element declares its own
   entrance with an index-based delay, so the four columns
   arrive one after another rather than all at once.
========================================================= */

/** ENTRANCE: lifts + un-blurs the whole card on scroll-in. */
const cardEntrance = (index: number, reduceMotion: boolean | null) =>
  ({
    initial: reduceMotion
      ? false
      : { opacity: 0, y: 48, scale: 0.9, filter: "blur(8px)" },
    whileInView: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    viewport: { once: true, amount: 0.25 },
    transition: { duration: 0.95, ease: EASE_OUT, delay: index * 0.18 },
  }) as const;

/** Badge pill: springs in slightly after its card. */
const badgeEntrance = (index: number, reduceMotion: boolean | null) =>
  ({
    initial: reduceMotion ? false : { opacity: 0, y: 14, scale: 0.7 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: { once: true, amount: 0.5 },
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 18,
      delay: 0.34 + index * 0.18,
    },
  }) as const;

/** Numbered circle: springs and untwists. */
const numberEntrance = (index: number, reduceMotion: boolean | null) =>
  ({
    initial: reduceMotion ? false : { scale: 0, rotate: -120 },
    whileInView: { scale: 1, rotate: 0 },
    viewport: { once: true, amount: 0.5 },
    transition: {
      type: "spring",
      stiffness: 420,
      damping: 16,
      delay: 0.46 + index * 0.18,
    },
  }) as const;

/** Body copy: plain fade-up, last in the sequence. */
const textEntrance = (index: number, reduceMotion: boolean | null) =>
  ({
    initial: reduceMotion ? false : { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.4 },
    transition: {
      duration: 0.6,
      ease: EASE_OUT,
      delay: 0.54 + index * 0.18,
    },
  }) as const;

export default function GoalsSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative w-full  py-8 sm:py-12 md:py-12.5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header — letter-spacing tightens as it settles. */}
        <motion.h2
          className="mb-8 sm:mb-12 text-center font-semibold text-primary-800 lg:text-6xl py-2 md:text-5xl max-md:text-3xl dark:text-[#22a447] dark:text-primary-dark"
          initial={
            reduceMotion
              ? false
              : { opacity: 0, y: 30, letterSpacing: "0.18em" }
          }
          whileInView={{ opacity: 1, y: 0, letterSpacing: "0.025em" }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.85, ease: EASE_OUT }}
        >
          <span className="text-[#f97316]">គោលបំណង</span>
          <span className="text-[#136c34] dark:text-primary-dark">របស់យើង</span>
        </motion.h2>

        {/* Responsive Grid Layout: 1 col (mobile) -> 2 cols (tablet) -> 12 cols (desktop) */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-12 lg:items-stretch">
          {/* Card 1: Mission */}
          <motion.div
            {...cardEntrance(0, reduceMotion)}
            whileHover={reduceMotion ? undefined : { y: -6 }}
            className="relative flex min-h-[380px] sm:min-h-[440px] flex-col justify-between overflow-hidden sm:overflow-visible rounded-3xl sm:rounded-[2.5rem] bg-[#E9F9EF] p-5 sm:p-6 lg:p-8 md:col-span-1 lg:col-span-4"
          >
            <div>
              {/* Badge Header */}
              <motion.div
                {...badgeEntrance(0, reduceMotion)}
                className="inline-flex items-center gap-2 rounded-full bg-[#6dbf82] py-1.5 pl-2 pr-4"
              >
                <motion.span
                  {...numberEntrance(0, reduceMotion)}
                  className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-[#4ba361] text-base font-extrabold text-white"
                >
                  1
                </motion.span>
                <span className=" text-base font-bold text-[#1a4427] sm:text-lg lg:text-xl">
                  {goalsData[0].title}
                </span>
              </motion.div>

              {/* Description */}
              <motion.p
                {...textEntrance(0, reduceMotion)}
                className="mt-3 sm:mt-4 dark: text-sm font-medium leading-relaxed text-[#1d4629] sm:text-base lg:text-lg"
              >
                {goalsData[0].description}
              </motion.p>
            </div>

            {/* Bottom Soup Bowl */}
            <div className="relative -mb-6 sm:-mb-10 flex h-36 sm:h-44 w-full items-end justify-end">
              {/* Soft breathing halo behind the bowl. */}
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-4 left-1/2 size-[55%] -translate-x-1/2 rounded-full bg-[#f97316]/20 blur-2xl"
                animate={
                  reduceMotion
                    ? undefined
                    : { scale: [1, 1.18, 1], opacity: [0.45, 0.85, 0.45] }
                }
                transition={{
                  duration: 4.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* FLOAT layer: endless slow bob, so the bowl never looks frozen. */}
              <motion.div
                className="absolute -bottom-8 sm:-bottom-12 h-[300px] sm:h-[440px] w-[120%] sm:w-[135%]"
                initial={
                  reduceMotion ? false : { opacity: 0, y: 40, scale: 0.9 }
                }
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1, ease: EASE_OUT, delay: 0.35 }}
              >
                <motion.div
                  className="size-full"
                  animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
                  transition={{
                    duration: 5.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    // starts once the entrance above has landed
                    delay: 1.35,
                  }}
                >
                  <Image
                    src={goalsData[0].imageSrc!}
                    alt="Tom yum soup bowl"
                    fill
                    className="object-contain object-bottom"
                    priority
                    unoptimized
                  />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Middle Column (Cards 2 & 3 Stacked) */}
          <div className="flex flex-col gap-4 sm:gap-6 md:col-span-1 lg:col-span-4">
            {/* Card 2: Vision */}
            <motion.div
              {...cardEntrance(1, reduceMotion)}
              whileHover={reduceMotion ? undefined : { y: -6 }}
              className="flex bg-white min-h-[200px] sm:min-h-[220px] flex-1 flex-col justify-start rounded-3xl border border-slate-100  p-5 sm:p-6 lg:p-8 shadow-sm"
            >
              <div>
                <motion.div
                  {...badgeEntrance(1, reduceMotion)}
                  className="inline-flex items-center gap-2.5 self-start rounded-full bg-[#d8f3e1] py-1.5 pl-2 pr-4"
                >
                  <motion.span
                    {...numberEntrance(1, reduceMotion)}
                    className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-[#34a853] text-base font-bold text-white"
                  >
                    2
                  </motion.span>
                  <span className=" text-base font-extrabold text-[#136c34] sm:text-lg lg:text-xl">
                    {goalsData[1].title}
                  </span>
                </motion.div>

                <motion.p
                  {...textEntrance(1, reduceMotion)}
                  className="mt-3 sm:mt-4  text-sm font-medium leading-relaxed text-slate-600 sm:text-base lg:text-lg"
                >
                  {goalsData[1].description}
                </motion.p>
              </div>
            </motion.div>

            {/* Card 3: Core Values */}
            <motion.div
              {...cardEntrance(2, reduceMotion)}
              whileHover={reduceMotion ? undefined : { y: -6 }}
              className="flex min-h-[200px] sm:min-h-[220px] flex-1 flex-col justify-start rounded-3xl border border-orange-100/50 bg-[#fff7ed] p-5 sm:p-6 lg:p-8"
            >
              <div>
                <motion.div
                  {...badgeEntrance(2, reduceMotion)}
                  className="inline-flex items-center gap-2.5 self-start rounded-full bg-[#ffedd5] py-1.5 pl-2 pr-4"
                >
                  <motion.span
                    {...numberEntrance(2, reduceMotion)}
                    className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-[#f97316] text-base font-bold text-white"
                  >
                    3
                  </motion.span>
                  <span className=" text-base font-extrabold text-[#f97316] sm:text-lg lg:text-xl">
                    {goalsData[2].title}
                  </span>
                </motion.div>

                <motion.p
                  {...textEntrance(2, reduceMotion)}
                  className="mt-3 sm:mt-4  text-sm font-medium leading-relaxed text-slate-600 sm:text-base lg:text-lg"
                >
                  {goalsData[2].description}
                </motion.p>
              </div>
            </motion.div>
          </div>

          {/* Card 4: Poster Banner Card */}
          <motion.div
            {...cardEntrance(3, reduceMotion)}
            whileHover={reduceMotion ? undefined : { y: -6 }}
            className="relative min-h-[300px] sm:min-h-[380px] w-full overflow-hidden rounded-3xl md:col-span-2 lg:col-span-4"
          >
            {/* Slow ken-burns push, so the poster breathes like the medallions do. */}
            <motion.div
              className="absolute inset-0"
              animate={reduceMotion ? undefined : { scale: [1, 1.08, 1] }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Image
                src="/about/food10.webp"
                alt="Good Food Good Vibes Poster"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
