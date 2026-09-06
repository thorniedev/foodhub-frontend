"use client";

import { useRef, useState, useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  useMotionValueEvent,
  MotionValue,
} from "framer-motion";
import { useGetLocationBannersQuery } from "@/app/store/bannerApi";
import { resolveBannerImageUrl } from "@/lib/banner-media";
import { MapPin } from "lucide-react";

const DEFAULT_REGIONS = [
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

export default function ProvineImageRevealSection() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { data: locationBanners } = useGetLocationBannersQuery();

  const regions = useMemo(() => {
    if (locationBanners && locationBanners.length > 0) {
      return locationBanners.slice(0, 5).map((banner, idx) => {
        const fallback = DEFAULT_REGIONS[idx % DEFAULT_REGIONS.length].img;
        return {
          name: banner.title || banner.location || DEFAULT_REGIONS[idx % DEFAULT_REGIONS.length].name,
          en: banner.location || banner.title || DEFAULT_REGIONS[idx % DEFAULT_REGIONS.length].en,
          img: resolveBannerImageUrl(banner, fallback),
        };
      });
    }
    return DEFAULT_REGIONS;
  }, [locationBanners]);

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

  const span = 1 / (regions.length + 0.6);

  useMotionValueEvent(progress, "change", (v) => {
    setActive(Math.min(regions.length - 1, Math.max(0, Math.floor(v / span))));
  });

  const drift = useTransform(progress, [0, 1], ["6%", "-46%"]);
  const railX = useTransform(progress, [0, 1], ["0%", "400%"]);

  return (
    <div ref={ref} style={{ height: `${(regions.length + 0.6) * 100}vh` }}>
      <section className="sticky  top-0 h-screen overflow-hidden bg-slate-50 dark:bg-primary-950 transition-colors duration-500">
        {/* warm glow anchored to the card side */}
        {/* <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(60% 55% at 68% 45%, rgba(250,204,21,0.10), transparent 70%)",
          }}
        /> */}

        {/* ghost wordmark */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute top-1/2 z-0 -translate-y-1/2 whitespace-nowrap text-[20vw] font-black leading-none tracking-tighter text-primary-200/50 dark:text-primary-800/30 transition-colors duration-500"
          style={{ x: reduce ? "0%" : drift }}
        >
          {regions.map((r) => r.en).join(" · ")}
        </motion.span>

        {/* top bar */}
        {/* <div className="absolute  inset-x-0 top-0 z-30 flex items-end justify-between border-b border-primary-200 dark:border-primary-800/60 px-6 py-6 md:px-12 transition-colors duration-500">
          <div>
            <span className="text-lg font-medium tracking-[0.18em] text-accent-400">
              យកតាមខ្លួន
            </span>
            <h2 className="mt-2 max-w-lg text-2xl font-bold leading-snug text-white md:text-4xl">
              រសជាតិដែលធ្វើដំណើរជាមួយអ្នក
            </h2>
          </div>
          <span className="hidden font-mono text-lg tabular-nums text-primary-500 dark:text-primary-200/50 md:block transition-colors duration-500">
            <span className="text-accent-600 dark:text-accent-400">
              {String(active + 1).padStart(2, "0")}
            </span>
            {" / "}
            {String(regions.length).padStart(2, "0")}
          </span>
        </div> */}

        {/* stage */}
        <div className="relative container mx-auto max-w-7xl z-20 flex flex-col justify-center h-full gap-8 px-6 pt-32 lg:pt-0 md:px-12">
          {/* index rail */}
          <div className="w-full max-w-3xl mx-auto hidden lg:block px-4">
            <div className="relative border-t-2 border-primary-200 dark:border-primary-800/70 pt-6 transition-colors duration-500">
              <motion.span
                className="absolute -top-[2px] left-0 h-[2px] w-[20%] bg-secondary-500 dark:bg-accent-400 transition-colors duration-500"
                style={{ x: reduce ? "0%" : railX }}
              />
              <ul className="flex justify-between w-full">
                {regions.map((r, i) => (
                  <li
                    key={r.en + i}
                    className="flex flex-col items-center gap-1.5 flex-1 text-center"
                  >
                    <span
                      className={`font-mono text-sm transition-colors duration-500 ${
                        i === active
                          ? "text-secondary-500 dark:text-accent-400"
                          : "text-primary-400 dark:text-primary-200/30"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`origin-top text-lg lg:text-xl font-semibold transition-all duration-500 ${
                        i === active
                          ? "translate-y-1 text-secondary-500 dark:text-white"
                          : "text-primary-600/50 dark:text-primary-200/35"
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
          <div className="w-full flex justify-center">
            <div className="relative">
              <div className="group relative aspect-[16/9] lg:max-w-[550px] w-[66vw] max-w-[300px] overflow-hidden rounded-[20px] ring-1 ring-primary-200 dark:ring-primary-800 md:max-w-[340px] transition-colors duration-500 cursor-pointer shadow-lg shadow-black/5 dark:shadow-black/20">
                {regions.map((r, i) => (
                  <RegionCard
                    key={r.en + i}
                    region={r}
                    index={i}
                    span={span}
                    progress={progress}
                    reduce={!!reduce}
                  />
                ))}
                
                {/* hover overlay */}
                <div className="pointer-events-none absolute inset-0 z-50 flex flex-col justify-end p-5 md:p-8 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  
                  <div className="relative z-10 flex flex-col gap-1 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500 ease-out delay-75">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs md:text-sm w-fit mb-2 shadow-sm">
                      <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span className="font-medium tracking-wide">{regions[active]?.en}</span>
                    </div>
                    <h3 className="text-2xl md:text-4xl font-bold text-white tracking-tight">{regions[active]?.en}</h3>
                    <p className="text-white/80 text-sm md:text-lg font-medium">{regions[active]?.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* bottom rail */}
        <div className="absolute inset-x-0 bottom-0 z-30 overflow-hidden border-t border-primary-200 dark:border-primary-800/60 bg-slate-50/90 dark:bg-primary-950/90 backdrop-blur-sm py-4 transition-colors duration-500">
          <motion.div
            className="flex whitespace-nowrap"
            style={{ x: reduce ? "0%" : drift }}
          >
            {[...regions, ...regions].map((r, i) => (
              <span
                key={i}
                className="mx-8 text-lg font-medium tracking-[0.16em] text-primary-600 dark:text-primary-200/45 transition-colors duration-500"
              >
                {r.en}{" "}
                <span className="text-accent-500 dark:text-accent-400">✦</span>
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
  region: { name: string; en: string; img: string };
  index: number;
  span: number;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const start = index === 0 ? -0.001 : index * span;
  const end = index * span + span * 0.72;

  if (reduce || index === 0) {
    return (
      <div className="absolute inset-0" style={{ zIndex: index + 1 }}>
        <img
          src={region.img}
          alt={region.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t dark:from-primary-950/80 via-transparent to-transparent transition-colors duration-500" />
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
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t   dark:from-primary-950/80 via-transparent to-transparent transition-colors duration-500" />
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
