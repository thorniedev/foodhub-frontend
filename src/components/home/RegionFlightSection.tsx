"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  useMotionValueEvent,
  MotionValue,
} from "framer-motion";

const REGIONS = [
  {
    name: "ភ្នំពេញ",
    en: "ភ្នំពេញ",
    dish: "បាយឆា",
    img: "/Image/food-picture/card 1.jpg",
  },
  {
    name: "សៀមរាប",
    en: "សៀមរាប",
    dish: "អាម៉ុក",
    img: "/Image/food-picture/card 2.jpg",
  },
  {
    name: "បាត់ដំបង",
    en: "បាត់ដំបង",
    dish: "នំបញ្ចុក",
    img: "/Image/food-picture/card 3.jpg",
  },
  {
    name: "កំពត",
    en: "កំពត",
    dish: "ក្ដាមម្រេច",
    img: "/Image/food-picture/card 4.jpg",
  },
  {
    name: "ព្រះសីហនុ",
    en: "ព្រះសីហនុ",
    dish: "គ្រឿងសមុទ្រ",
    img: "/Image/food-picture/card 6.jpg",
  },
];

export default function RegionFlightSection() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 26,
    mass: 0.4,
    restDelta: 0.0005,
  });

  const span = 1 / (REGIONS.length + 0.6);

  useMotionValueEvent(progress, "change", (v) => {
    setActive(Math.min(REGIONS.length - 1, Math.max(0, Math.floor(v / span))));
  });

  const drift = useTransform(progress, [0, 1], ["6%", "-46%"]);
  const railY = useTransform(progress, [0, 1], ["0%", "400%"]);

  return (
    <div ref={ref} style={{ height: `${(REGIONS.length + 0.6) * 100}vh` }}>
      <section className="sticky top-0 h-screen overflow-hidden bg-primary-950">
        {/* warm glow anchored to the card side */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(60% 55% at 68% 45%, rgba(250,204,21,0.10), transparent 70%)",
          }}
        />

        {/* ghost wordmark */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute top-1/2 z-0 -translate-y-1/2 whitespace-nowrap text-[20vw] font-black leading-none tracking-tighter text-primary-800/30"
          style={{ x: reduce ? "0%" : drift }}
        >
          {REGIONS.map((r) => r.en).join(" · ")}
        </motion.span>

        {/* top bar */}
        <div className="absolute inset-x-0 top-0 z-30 flex items-end justify-between border-b border-primary-800/60 px-6 py-6 md:px-12">
          <div>
            <span className="text-lg font-medium tracking-[0.18em] text-accent-400">
              យកតាមខ្លួន
            </span>
            <h2 className="mt-2 max-w-lg text-2xl font-bold leading-snug text-white md:text-4xl">
              រសជាតិដែលធ្វើដំណើរជាមួយអ្នក
            </h2>
          </div>
          <span className="hidden font-mono text-lg tabular-nums text-primary-200/50 md:block">
            <span className="text-accent-400">
              {String(active + 1).padStart(2, "0")}
            </span>
            {" / "}
            {String(REGIONS.length).padStart(2, "0")}
          </span>
        </div>

        {/* stage */}
        <div className="relative z-20 grid h-full grid-cols-12 items-center gap-6 px-6 pt-32 md:px-12">
          {/* index rail */}
          <div className="col-span-4 hidden lg:block">
            <div className="relative border-l-2 border-primary-800/70 pl-8">
              <motion.span
                className="absolute -left-[2px] top-0 h-[20%] w-[2px] bg-accent-400"
                style={{ y: reduce ? "0%" : railY }}
              />
              <ul className="space-y-6">
                {REGIONS.map((r, i) => (
                  <li key={r.en} className="flex items-baseline gap-5">
                    <span
                      className={`font-mono text-lg transition-colors duration-500 ${
                        i === active ? "text-accent-400" : "text-primary-200/30"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`origin-left text-2xl font-semibold transition-all duration-500 ${
                        i === active
                          ? "translate-x-1 text-white"
                          : "text-primary-200/35"
                      }`}
                    >
                      {r.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* card cluster */}
          <div className="col-span-12 flex justify-center lg:col-span-8 lg:justify-start lg:pl-8">
            <div className="relative">
              {/* <div className="absolute -left-4 top-4 h-full w-full rotate-[-5deg] rounded-[26px] border-2 border-primary-800/70" />
              <div className="absolute -right-3 top-2 h-full w-full rotate-[4deg] rounded-[26px] bg-primary-900/60" /> */}

              <div className="relative aspect-[4/5] w-[66vw] max-w-[300px] overflow-hidden rounded-[26px] ring-1 ring-primary-800 md:max-w-[340px]">
                {REGIONS.map((r, i) => (
                  <RegionCard
                    key={r.en}
                    region={r}
                    index={i}
                    span={span}
                    progress={progress}
                    reduce={!!reduce}
                  />
                ))}
              </div>

              {/* name breaking over the edge */}
            </div>
          </div>
        </div>

        {/* bottom rail */}
        <div className="absolute inset-x-0 bottom-0 z-30 overflow-hidden border-t border-primary-800/60 bg-primary-950/80 py-4">
          <motion.div
            className="flex whitespace-nowrap"
            style={{ x: reduce ? "0%" : drift }}
          >
            {[...REGIONS, ...REGIONS].map((r, i) => (
              <span
                key={i}
                className="mx-8 text-lg font-medium tracking-[0.16em] text-primary-200/45"
              >
                {r.en} <span className="text-accent-400">✦</span>
              </span>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
// const COLS = 4;
// const ROWS = 5;

// function RegionCard({
//   region,
//   index,
//   span,
//   progress,
//   reduce,
// }: {
//   region: (typeof REGIONS)[number];
//   index: number;
//   span: number;
//   progress: MotionValue<number>;
//   reduce: boolean;
// }) {
//   const start = index === 0 ? -0.001 : index * span;
//   const end = index * span + span * 0.72;

//   if (reduce) {
//     return (
//       <div className="absolute inset-0" style={{ zIndex: index + 1 }}>
//         <img
//           src={region.img}
//           alt={region.name}
//           className="h-full w-full object-cover"
//         />
//         <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-transparent to-transparent" />
//       </div>
//     );
//   }

//   const tiles = [];
//   for (let r = 0; r < ROWS; r++) {
//     for (let c = 0; c < COLS; c++) {
//       tiles.push({ r, c });
//     }
//   }

//   return (
//     <div className="absolute inset-0" style={{ zIndex: index + 1 }}>
//       {tiles.map(({ r, c }) => (
//         <Tile
//           key={`${r}-${c}`}
//           row={r}
//           col={c}
//           img={region.img}
//           start={start}
//           end={end}
//           progress={progress}
//         />
//       ))}
//       <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-950/80 via-transparent to-transparent" />
//       <span className="sr-only">{region.name}</span>
//     </div>
//   );
// }

// function Tile({
//   row,
//   col,
//   img,
//   start,
//   end,
//   progress,
// }: {
//   row: number;
//   col: number;
//   img: string;
//   start: number;
//   end: number;
//   progress: MotionValue<number>;
// }) {
//   const total = end - start;
//   const maxStep = COLS + ROWS - 2;
//   const step = row + col; // diagonal wave from top-left
//   const from = start + (step / maxStep) * (total * 0.5);
//   const to = from + total * 0.5;

//   const y = useTransform(progress, [from, to], ["-100%", "0%"]);
//   const opacity = useTransform(progress, [from, from + total * 0.12], [0, 1]);

//   return (
//     <div
//       className="absolute overflow-hidden"
//       style={{
//         left: `${(col / COLS) * 100}%`,
//         top: `${(row / ROWS) * 100}%`,
//         width: `${100 / COLS + 0.3}%`, // slight bleed kills sub-pixel seams
//         height: `${100 / ROWS + 0.3}%`,
//       }}
//     >
//       <motion.div
//         className="h-full w-full bg-cover"
//         style={{
//           backgroundImage: `url("${img}")`,
//           backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
//           backgroundPosition: `${(col / (COLS - 1)) * 100}% ${(row / (ROWS - 1)) * 100}%`,
//           y,
//           opacity,
//           willChange: "transform",
//         }}
//       />
//     </div>
//   );
// }
const SLATS = 7;

function RegionCard({
  region,
  index,
  span,
  progress,
  reduce,
}: {
  region: (typeof REGIONS)[number];
  index: number;
  span: number;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const start = index === 0 ? -0.001 : index * span;
  const end = index * span + span * 0.72;

  if (reduce) {
    return (
      <div className="absolute inset-0" style={{ zIndex: index + 1 }}>
        <img
          src={region.img}
          alt={region.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0" style={{ zIndex: index + 1 }}>
      {Array.from({ length: SLATS }).map((_, s) => (
        <Slat
          key={s}
          slat={s}
          img={region.img}
          alt={region.name}
          start={start}
          end={end}
          progress={progress}
        />
      ))}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-950/80 via-transparent to-transparent" />
    </div>
  );
}

function Slat({
  slat,
  img,
  alt,
  start,
  end,
  progress,
}: {
  slat: number;
  img: string;
  alt: string;
  start: number;
  end: number;
  progress: MotionValue<number>;
}) {
  const total = end - start;
  const stagger = (total * 0.45) / SLATS;
  const from = start + slat * stagger;
  const to = end;

  // alternate entry direction for the woven effect
  const dir = slat % 2 === 0 ? "-105%" : "105%";

  const y = useTransform(progress, [from, to], [dir, "0%"]);
  const opacity = useTransform(progress, [from, from + total * 0.15], [0, 1]);
  // shared range so every slat's photo stays in register
  const scale = useTransform(progress, [start, end], [1.12, 1]);

  const left = (slat / SLATS) * 100;
  const width = 100 / SLATS;

  return (
    <div
      className="absolute inset-y-0 overflow-hidden"
      style={{ left: `${left}%`, width: `${width}%` }}
    >
      <motion.div
        className="h-full w-full"
        style={{ y, opacity, willChange: "transform" }}
      >
        {/* full-width image, shifted so the slats compose one picture */}
        <motion.img
          src={img}
          alt={slat === 0 ? alt : ""}
          aria-hidden={slat !== 0}
          className="h-full max-w-none object-cover"
          style={{
            width: `${SLATS * 100}%`,
            marginLeft: `-${slat * 100}%`,
            scale,
            willChange: "transform",
          }}
        />
      </motion.div>
    </div>
  );
}
