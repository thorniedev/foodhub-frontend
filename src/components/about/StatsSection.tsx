"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { EASE_SOFT, VIEWPORT, group, rise, riseScale } from "@/lib/reveal";

interface StatItem {
  value: string;
  valueColor?: string;
  highlightText?: string;
  normalText?: string;
  subText?: string;
  subTextHighlight?: string;
}

const statsData: StatItem[] = [
  {
    value: "800k",
    highlightText: "អាហារ",
    normalText: "និង ភេសជ្ជៈ",
    subText: "ជាច្រើនដែលត្រូវនឹងអ្នក",
  },
  {
    value: "4.9",
    highlightText: "Google",
    subText: "Score",
  },
  {
    value: "6500 +",
    valueColor: "text-[#E58348]",
    normalText: "ប្រភេទនៃ",
    subTextHighlight: "អាហារ",
    subText: "និង ភេសជ្ជៈ",
  },
  {
    value: "120k",
    highlightText: "ហាងអាហារដែលមាន",
    subTextHighlight: "លក់អាហារ",
    subText: "ឆ្ងាញ់ៗ",
  },
];

/* =========================================================
   COUNT UP

   A stats block's natural reveal is the number arriving, not
   the box moving. Splits "6500 +" into 6500 and " +", counts
   the numeric part, then restores the exact original string
   so spacing and suffixes are never guessed at.

   Writes straight to the DOM node — a setState per frame
   would re-render the whole section ~90 times.
========================================================= */

const NUMBER_RE = /^(\D*)([\d.]+)(.*)$/;

function CountUp({ value, className }: { value: string; className?: string }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  const parsed = useMemo(() => {
    const match = value.match(NUMBER_RE);
    if (!match) return null;

    const [, prefix, digits, suffix] = match;
    const target = Number(digits);
    if (Number.isNaN(target)) return null;

    const dot = digits.indexOf(".");
    const decimals = dot === -1 ? 0 : digits.length - dot - 1;

    return { prefix, suffix, target, decimals };
  }, [value]);

  const render = (n: number) =>
    parsed
      ? `${parsed.prefix}${n.toFixed(parsed.decimals)}${parsed.suffix}`
      : value;

  // start from zero, but only once JS is running — the server
  // still ships the real number so it's there without JS
  useEffect(() => {
    if (!ref.current || !parsed || reduceMotion) return;
    ref.current.textContent = render(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed, reduceMotion]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !parsed || reduceMotion || !inView) return;

    const controls = animate(0, parsed.target, {
      duration: 1.5,
      ease: EASE_SOFT,
      onUpdate: (n) => {
        el.textContent = render(n);
      },
      onComplete: () => {
        // exact original string, spacing and all
        el.textContent = value;
      },
    });

    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, parsed, reduceMotion, value]);

  return (
    <h3 ref={ref} className={className}>
      {value}
    </h3>
  );
}

/* =========================================================
   REVEALS

   Same language as Hero / PopularSection / SeasonSection:
   travel and scale only, never opacity.
========================================================= */

const sushiIn: Variants = {
  hidden: { x: -70, y: 24, scale: 0.9, rotate: -6 },
  show: {
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.95, ease: EASE_SOFT },
  },
};

const sushiFloat: Variants = {
  hidden: {},
  show: {
    y: [0, -10],
    rotate: [0, 1.5, 0],
    transition: {
      y: {
        duration: 3.2,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
        // starts once the reveal above has landed
        delay: 1,
      },
      rotate: {
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1,
      },
    },
  },
};

/** the card carries the stagger for its four columns */
const cardIn: Variants = {
  hidden: riseScale.hidden,
  show: {
    ...(riseScale.show as object),
    transition: {
      duration: 0.9,
      ease: EASE_SOFT,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export default function StatsSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative w-full bg-primary-800 pt-10 sm:pt-14 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8  overflow-visible">
      <motion.div
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={VIEWPORT}
        variants={group(0.14)}
        className="max-w-7xl container px-2  mx-auto relative flex flex-col lg:flex-row items-center justify-end"
      >
        {/* Sushi Image - Hidden on small screens (below lg) */}
        <motion.div
          variants={sushiIn}
          style={{ willChange: "transform" }}
          className="hidden z-2  lg:block absolute lg:-left-4 xl:-left-18 lg:-bottom-14 z-20 lg:w-[340px] xl:w-[390px] pointer-events-none"
        >
          <motion.div >
            <Image
              src="/about/su.png"
              alt="Sushi with chopsticks"
              width={480}
              height={580}
              className="w-full h-auto object-contain drop-shadow-2xl"
              priority
            />
          </motion.div>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          variants={cardIn}
          style={{ willChange: "transform" }}
          className="w-full lg:w-auto flex-1 lg:ml-[310px] xl:ml-[360px] bg-[#FFF5EE] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl z-10"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-4 sm:gap-x-6 lg:gap-0 divide-y-0 lg:divide-x divide-orange-200/60">
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                variants={rise}
                className={`flex flex-col justify-start ${
                  index !== 0 ? "lg:pl-5 xl:pl-6" : ""
                } ${index % 2 !== 0 ? "pl-2 sm:pl-4 lg:pl-5 xl:pl-6" : ""}`}
              >
                {/* Stat Value */}
                <CountUp
                  value={stat.value}
                  className={`text-2xl sm:text-3xl xl:text-4xl font-black tracking-tight tabular-nums mb-1 ${
                    stat.valueColor || "text-slate-900"
                  }`}
                />

                {/* Main Label */}
                <div className="text-base sm:text-lg leading-relaxed font-medium">
                  <p>
                    {stat.highlightText && (
                      <span className="text-[#E58348]">
                        {stat.highlightText}
                      </span>
                    )}
                    {stat.normalText && (
                      <span className="text-slate-500">{stat.normalText}</span>
                    )}
                  </p>

                  {/* Secondary Label */}
                  {(stat.subText || stat.subTextHighlight) && (
                    <p>
                      {stat.subTextHighlight && (
                        <span className="text-[#E58348]">
                          {stat.subTextHighlight}
                        </span>
                      )}
                      {stat.subText && (
                        <span className="text-slate-500">{stat.subText}</span>
                      )}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
