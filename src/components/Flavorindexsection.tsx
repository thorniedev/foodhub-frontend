"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";

const DISHES = [
  {
    name: "អាម៉ុកត្រី",
    region: "សៀមរាប",
    heat: 1,
    img: "/Image/food/food1.png",
  },
  {
    name: "សម្លម្ជូរគ្រឿង",
    region: "ភ្នំពេញ",
    heat: 2,
    img: "/Image/food/food3.png",
  },
  {
    name: "ក្ដាមម្រេចខ្ចី",
    region: "កំពត",
    heat: 3,
    img: "/Image/food/food5.png",
  },
  {
    name: "ឡុកឡាក់សាច់គោ",
    region: "បាត់ដំបង",
    heat: 2,
    img: "/Image/food/food7.png",
  },
  {
    name: "នំបញ្ចុកសម្លខ្មែរ",
    region: "តាកែវ",
    heat: 1,
    img: "/Image/food/food9.png",
  },
  {
    name: "ត្រីអាំងជ្រក់",
    region: "ព្រះសីហនុ",
    heat: 3,
    img: "/Image/food/food10.png",
  },
];

export default function FlavorIndexSection() {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const x = useSpring(mx, { stiffness: 260, damping: 30, mass: 0.6 });
  const y = useSpring(my, { stiffness: 260, damping: 30, mass: 0.6 });

  // tilt the preview based on how fast the pointer is travelling
  const xVelocity = useVelocity(x);
  const rotate = useTransform(xVelocity, [-1600, 0, 1600], [-14, 0, 14], {
    clamp: true,
  });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  return (
    <section className="relative overflow-hidden bg-primary-50 py-24 md:py-32">
      {/* dotted field */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(22,101,52,0.18) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      {/* corner wash */}
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-[46vw] w-[46vw] rounded-full opacity-60 blur-[110px]"
        style={{ background: "#fef08a" }}
      />

      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        {/* heading */}
        <div className="flex flex-col gap-6 border-b-2 border-primary-900/10 pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-lg font-semibold tracking-[0.18em] text-secondary-600">
              បញ្ជីរសជាតិ
            </span>
            <h2 className="mt-3 max-w-xl text-3xl font-black leading-tight text-primary-950 md:text-5xl">
              មុខម្ហូបខ្មែរ ដែលគួរសាកម្ដង
            </h2>
          </div>
          <p className="max-w-xs text-lg leading-relaxed text-primary-900/70">
            រំកិលកណ្ដុរលើឈ្មោះនីមួយៗ ដើម្បីមើលរូបភាព និងតំបន់ដើមកំណើត
          </p>
        </div>

        {/* index */}
        <div
          ref={wrapRef}
          onMouseMove={handleMove}
          onMouseLeave={() => setHovered(null)}
          className="relative"
        >
          <ul>
            {DISHES.map((d, i) => (
              <li key={d.name}>
                <button
                  type="button"
                  onMouseEnter={() => setHovered(i)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  className="group relative flex w-full items-center justify-between gap-6 border-b border-primary-900/10 py-7 text-left outline-none transition-colors focus-visible:bg-accent-200/40 md:py-9"
                >
                  {/* sliding yellow wash */}
                  <span className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-accent-300/35 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />

                  <span className="relative flex items-center gap-5">
                    {/* mobile thumbnail */}
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl md:hidden">
                      <Image
                        src={d.img}
                        alt={d.name}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="text-2xl font-bold text-primary-950 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3 md:text-4xl lg:text-5xl">
                      {d.name}
                    </span>
                  </span>

                  <span className="relative flex shrink-0 items-center gap-5">
                    {/* heat dots */}
                    <span className="hidden items-center gap-1.5 sm:flex">
                      {[0, 1, 2].map((h) => (
                        <span
                          key={h}
                          className={`h-2.5 w-2.5 rounded-full ${
                            h < d.heat
                              ? "bg-secondary-500"
                              : "bg-primary-900/15"
                          }`}
                        />
                      ))}
                    </span>
                    <span className="text-lg font-medium text-primary-900/60">
                      {d.region}
                    </span>
                    <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-primary-900/15 text-xl text-primary-900 transition-all duration-500 group-hover:border-primary-950 group-hover:bg-primary-950 group-hover:text-accent-300">
                      ↗
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* cursor-following preview — desktop only */}
          {!reduce && (
            <motion.div
              className="pointer-events-none absolute left-0 top-0 z-20 hidden md:block"
              style={{ x, y, rotate }}
            >
              <div className="-translate-x-1/2 -translate-y-1/2">
                <AnimatePresence mode="popLayout">
                  {hovered !== null && (
                    <motion.div
                      key={DISHES[hovered].name}
                      initial={{ opacity: 0, scale: 0.82 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="relative h-64 w-52 overflow-hidden rounded-[26px] shadow-2xl shadow-primary-950/25 ring-1 ring-primary-950/10"
                    >
                      <Image
                        src={DISHES[hovered].img}
                        alt={DISHES[hovered].name}
                        fill
                        sizes="208px"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary-950/85 px-4 py-1.5 text-lg font-semibold text-accent-300 backdrop-blur-sm">
                        {DISHES[hovered].region}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>

        {/* footer note */}
        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3">
          <span className="text-lg text-primary-900/60">កម្រិតហឹរ</span>
          <span className="flex items-center gap-2 text-lg text-primary-900/60">
            <span className="h-2.5 w-2.5 rounded-full bg-secondary-500" />
            ស្រាល
          </span>
          <span className="flex items-center gap-2 text-lg text-primary-900/60">
            <span className="h-2.5 w-2.5 rounded-full bg-secondary-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-secondary-500" />
            មធ្យម
          </span>
          <span className="flex items-center gap-2 text-lg text-primary-900/60">
            <span className="h-2.5 w-2.5 rounded-full bg-secondary-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-secondary-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-secondary-500" />
            ហឹរ
          </span>
        </div>
      </div>
    </section>
  );
}
