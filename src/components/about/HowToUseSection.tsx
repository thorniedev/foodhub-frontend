"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import svgPaths from "@/lib/scv";

/** Shared "expo out" curve — fast start, soft landing. Feels premium, not bouncy. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/* =========================================================
   MOTION HELPERS

   Same idiom as MentorSection: each element declares its own
   entrance with an index-based delay, so the three cards
   arrive one after another.
========================================================= */

/** ENTRANCE: lifts + un-blurs the card on scroll-in. */
const cardEntrance = (index: number, reduceMotion: boolean | null) =>
  ({
    initial: reduceMotion
      ? false
      : { opacity: 0, y: 48, scale: 0.9, filter: "blur(8px)" },
    whileInView: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    viewport: { once: true, amount: 0.25 },
    transition: { duration: 0.95, ease: EASE_OUT, delay: index * 0.18 },
  }) as const;

/** Heading row: springs in just after its card. */
const headingEntrance = (index: number, reduceMotion: boolean | null) =>
  ({
    initial: reduceMotion ? false : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.5 },
    transition: {
      duration: 0.55,
      ease: EASE_OUT,
      delay: 0.34 + index * 0.18,
    },
  }) as const;

const bodyEntrance = (index: number, reduceMotion: boolean | null) =>
  ({
    initial: reduceMotion ? false : { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.4 },
    transition: {
      duration: 0.6,
      ease: EASE_OUT,
      delay: 0.46 + index * 0.18,
    },
  }) as const;

/** Photo: uncovers upward, so the card assembles rather than appearing whole. */
const photoEntrance = (index: number, reduceMotion: boolean | null) =>
  ({
    initial: reduceMotion
      ? false
      : { opacity: 0, y: 24, clipPath: "inset(0% 0% 100% 0%)" },
    whileInView: { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" },
    viewport: { once: true, amount: 0.3 },
    transition: {
      duration: 0.8,
      ease: EASE_OUT,
      delay: 0.58 + index * 0.18,
    },
  }) as const;

/**
 * The active-card lift.
 *
 * This has to be a motion value, not the old Tailwind
 * `-translate-y-2 scale-105` classes: framer writes its own
 * inline transform for the entrance, which overrides any
 * transform coming from a class.
 */
const activeLift = (isActive: boolean, reduceMotion: boolean | null) =>
  reduceMotion
    ? {}
    : {
        animate: { y: isActive ? -8 : 0, scale: isActive ? 1.05 : 1 },
        transition: { type: "spring", stiffness: 260, damping: 24 } as const,
      };

function ProgressBar({
  isActive,
  cycleKey,
  colorClass,
  durationMs,
  isPaused,
  reduceMotion,
}: {
  isActive: boolean;
  cycleKey: number;
  colorClass: string;
  durationMs: number;
  isPaused: boolean;
  reduceMotion: boolean | null;
}) {
  return (
    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-black/5">
      {isActive && (
        <motion.div
          key={cycleKey}
          className={`h-full w-full origin-left rounded-full ${colorClass}`}
          initial={{ scaleX: reduceMotion ? 1 : 0 }}
          animate={{ scaleX: !reduceMotion && isPaused ? 0 : 1 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : isPaused
                ? { duration: 0.3, ease: "easeOut" }
                : { duration: durationMs / 1000, ease: "linear" }
          }
        />
      )}
    </div>
  );
}

function ArrowIcon({ index = 0 }: { index?: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="flex-shrink-0 rounded-full bg-[#136c34] p-2"
      initial={reduceMotion ? false : { scale: 0, rotate: -120 }}
      whileInView={{ scale: 1, rotate: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{
        type: "spring",
        stiffness: 420,
        damping: 16,
        delay: 0.46 + index * 0.18,
      }}
      whileHover={reduceMotion ? undefined : { scale: 1.12, rotate: 8 }}
    >
      <svg className="size-5" fill="none" viewBox="0 0 20 20">
        <path
          d={svgPaths.p3610fb80}
          stroke="white"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.66667"
        />
        <path
          d={svgPaths.p3e47bd00}
          stroke="white"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.66667"
        />
      </svg>
    </motion.div>
  );
}

type CardProps = {
  isActive: boolean;
  isPaused: boolean;
  cycle: number;
  durationMs: number;
};

function Card1({ isActive, isPaused, cycle, durationMs }: CardProps) {
  const reduceMotion = useReducedMotion();
  const index = 0;

  return (
    <motion.div {...cardEntrance(index, reduceMotion)} className="h-full">
      <motion.div
        {...activeLift(isActive, reduceMotion)}
        className={`flex h-full min-h-[380px] w-full flex-col gap-4 rounded-[32px] bg-[#e9f9ef] p-6 ${
          isActive ? "ring-2 ring-[#136c34]/40" : ""
        }`}
      >
        <motion.div
          {...headingEntrance(index, reduceMotion)}
          className="flex items-start justify-between"
        >
          <h3 className="  text-xl font-bold text-[#136c34]">
            ស្វែងរកតាមចំណូលចិត្ត
          </h3>
          <ArrowIcon index={index} />
        </motion.div>
        <motion.div
          {...bodyEntrance(index, reduceMotion)}
          className="border-t border-[#3f3f46]/20 pt-3"
        >
          <p className="   text-[20px] leading-relaxed text-[#596378]">
            ស្វែងរកមុខម្ហូប និងប្រភេទអាហារ ត្រូវចិត្ត សម្រាប់អ្នក និងគ្រួសារ ។
          </p>
        </motion.div>
        <motion.div
          {...photoEntrance(index, reduceMotion)}
          className="relative mt-auto h-48 overflow-hidden rounded-2xl"
        >
          {/* slow ken-burns while this card is the active one */}
          <motion.div
            className="absolute inset-0"
            animate={reduceMotion ? undefined : { scale: isActive ? 1.08 : 1 }}
            transition={{ duration: 1.6, ease: EASE_OUT }}
          >
            <Image
              alt="Search food"
              src="/about/fooooo.jpg"
              fill
              unoptimized
              className="object-cover "
            />
          </motion.div>
          <div className="absolute inset-0 " />
        </motion.div>

        <ProgressBar
          isActive={isActive}
          cycleKey={cycle}
          colorClass="bg-[#136c34]"
          durationMs={durationMs}
          isPaused={isPaused}
          reduceMotion={reduceMotion}
        />
      </motion.div>
    </motion.div>
  );
}

function Card2({ isActive, isPaused, cycle, durationMs }: CardProps) {
  const reduceMotion = useReducedMotion();
  const index = 1;

  return (
    <motion.div {...cardEntrance(index, reduceMotion)} className="h-full">
      <motion.div
        {...activeLift(isActive, reduceMotion)}
        className={`relative flex h-full min-h-[380px] w-full flex-col gap-4 rounded-[32px] bg-[#fef1e8] p-6 ${
          isActive ? "ring-2 ring-[#e36914]/40" : ""
        }`}
      >
        <motion.div
          {...headingEntrance(index, reduceMotion)}
          className="flex items-start justify-between"
        >
          <h3 className="  text-xl font-bold text-[#e36914]">
            ជ្រើសរើសឥឡូវនេះ
          </h3>
        </motion.div>
        <motion.div
          {...bodyEntrance(index, reduceMotion)}
          className="border-t border-[#3f3f46]/20 pt-3"
        >
          <p className="   text-[20px] leading-relaxed text-[#596378]">
            ស្វែងយល់ពីជម្រើសនៅជុំវិញអ្នក ជាមួយការណែនាំឆ្លាតវៃ ។
          </p>
        </motion.div>
        <motion.div
          {...photoEntrance(index, reduceMotion)}
          className="relative mt-auto h-48 overflow-hidden rounded-2xl"
        >
          <motion.div
            className="absolute inset-0"
            animate={reduceMotion ? undefined : { scale: isActive ? 1.08 : 1 }}
            transition={{ duration: 1.6, ease: EASE_OUT }}
          >
            <Image
              alt="Choose food"
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
              fill
              unoptimized
              className="object-cover"
            />
          </motion.div>
        </motion.div>

        <ProgressBar
          isActive={isActive}
          cycleKey={cycle}
          colorClass="bg-[#e36914]"
          durationMs={durationMs}
          isPaused={isPaused}
          reduceMotion={reduceMotion}
        />

        {/* Orange button — springs in, then pulses while its card is active */}
        <motion.div
          className="absolute -left-3 bottom-12 z-10 flex size-13 items-center justify-center rounded-full border-4 border-black bg-[#e36914] sm:size-16"
          initial={reduceMotion ? false : { scale: 0, rotate: -90 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 15,
            delay: 0.7 + index * 0.18,
          }}
          whileHover={reduceMotion ? undefined : { scale: 1.12 }}
        >
          {/* sonar ring, same trick as the mentor medallions */}
          {!reduceMotion && isActive && (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#e36914]"
              animate={{ scale: [1, 1.6], opacity: [0.7, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
            />
          )}
          <svg className="size-6 sm:size-7" fill="none" viewBox="0 0 28 28">
            <path
              d={svgPaths.p379dca80}
              stroke="white"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3.5"
            />
            <path
              d={svgPaths.p3b3e9900}
              stroke="white"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3.5"
            />
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function Card3({ isActive, isPaused, cycle, durationMs }: CardProps) {
  const reduceMotion = useReducedMotion();
  const index = 2;

  return (
    <motion.div {...cardEntrance(index, reduceMotion)} className="h-full">
      <motion.div
        {...activeLift(isActive, reduceMotion)}
        className={`flex h-full min-h-[380px] w-full flex-col gap-4 rounded-[32px] border border-[#eceff3] bg-white p-6 ${
          isActive ? "ring-2 ring-[#515a6d]/40" : ""
        }`}
      >
        <motion.div
          {...headingEntrance(index, reduceMotion)}
          className="flex items-start justify-between"
        >
          <h3 className="  text-xl font-bold text-[#515a6d]">
            ញ៉ាំដោយភាពរីករាយ
          </h3>
          <ArrowIcon index={index} />
        </motion.div>
        <motion.div
          {...bodyEntrance(index, reduceMotion)}
          className="border-t border-[#3f3f46]/20 pt-3"
        >
          <p className="   text-[20px] leading-relaxed text-[#596378]">
            ចូលញ៉ាំដល់ហាង ឬកុម្ម៉ង់ភ្លាម រីករាយ ជាមួយអាហារឆ្ងាញ់ ។
          </p>
        </motion.div>
        <motion.div
          {...photoEntrance(index, reduceMotion)}
          className="relative mt-auto h-48 overflow-hidden rounded-2xl"
        >
          <motion.div
            className="absolute inset-0"
            animate={reduceMotion ? undefined : { scale: isActive ? 1.08 : 1 }}
            transition={{ duration: 1.6, ease: EASE_OUT }}
          >
            <Image
              alt="Enjoy food"
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
              fill
              unoptimized
              className="object-cover"
            />
          </motion.div>
        </motion.div>

        <ProgressBar
          isActive={isActive}
          cycleKey={cycle}
          colorClass="bg-[#515a6d]"
          durationMs={durationMs}
          isPaused={isPaused}
          reduceMotion={reduceMotion}
        />
      </motion.div>
    </motion.div>
  );
}

/*
 * Was 1000ms — one second per card reads as flicker rather
 * than as a walkthrough, and the progress bar never finishes.
 */
const HIGHLIGHT_INTERVAL_MS = 3500;
const CARD_COUNT = 3;

export default function HowToUseSection() {
  const reduceMotion = useReducedMotion();

  const [activeIndex, setActiveIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || reduceMotion) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CARD_COUNT);
      setCycle((prev) => prev + 1);
    }, HIGHLIGHT_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPaused, reduceMotion]);

  const goTo = (index: number) => {
    setActiveIndex(index);
    setCycle((prev) => prev + 1);
  };

  return (
    <section className=" px-6 ">
      <div className="mx-auto container max-w-7xl">
        {/* Header — letter-spacing tightens as it settles */}
        <div className="mb-10 text-center md:mb-14">
          <motion.h2
            className="  text-3xl font-semibold tracking-wide sm:text-4xl md:text-[48px]"
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: 30, letterSpacing: "0.18em" }
            }
            whileInView={{ opacity: 1, y: 0, letterSpacing: "0.025em" }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.85, ease: EASE_OUT }}
          >
            <span className="text-[#e36914]">របៀបក្នុង</span>
            <span className="text-[#136c34] dark:text-primary-dark">
              ការប្រើប្រាស់
            </span>
          </motion.h2>
        </div>

        {/* All 3 cards always visible; active one auto-highlights on rotation */}
        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <Card1
            isActive={activeIndex === 0}
            isPaused={isPaused}
            cycle={cycle}
            durationMs={HIGHLIGHT_INTERVAL_MS}
          />
          <Card2
            isActive={activeIndex === 1}
            isPaused={isPaused}
            cycle={cycle}
            durationMs={HIGHLIGHT_INTERVAL_MS}
          />
          <Card3
            isActive={activeIndex === 2}
            isPaused={isPaused}
            cycle={cycle}
            durationMs={HIGHLIGHT_INTERVAL_MS}
          />
        </div>

        {/* Dot Indicators */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: CARD_COUNT }).map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goTo(index)}
              whileHover={reduceMotion ? undefined : { scale: 1.2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.9 }}
              className={`h-[10px] rounded-full transition-all duration-300 ${
                activeIndex === index
                  ? "w-7 bg-[#368153]"
                  : "w-[10px] bg-[#eceff3] hover:bg-[#c9dad4]"
              }`}
              aria-label={`Highlight card ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
