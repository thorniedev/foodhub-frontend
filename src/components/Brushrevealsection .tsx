"use client";

import { useId, useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";

const DISHES = [
  {
    name: "អាម៉ុកត្រី",
    region: "សៀមរាប",
    body: "ត្រីស្រស់ លាយគ្រឿងខ្ទិះដូង ចំហុយក្នុងស្លឹកចេក រហូតទាល់តែទន់ល្មម។",
    img: "/Image/food/food1.png",
  },
  {
    name: "ក្ដាមម្រេចខ្ចី",
    region: "កំពត",
    body: "ក្ដាមសមុទ្រឆាជាមួយម្រេចខ្ចីកំពត ក្លិនឈ្ងុយ និងរសជាតិហឹរស្រាល។",
    img: "/Image/food/food5.png",
  },
  {
    name: "សម្លម្ជូរគ្រឿង",
    region: "ភ្នំពេញ",
    body: "សម្លជូរបែបខ្មែរ ដែលរួមបញ្ចូលបន្លែតាមរដូវ និងគ្រឿងសមុទ្រ ឬសាច់។",
    img: "/Image/food/food3.png",
  },
  {
    name: "នំអន្សមចេក",
    region: "បាត់ដំបង",
    body: "បាយដំណើបខ្ចប់ស្លឹកចេក ជាមួយចេកណាំវ៉ា ផ្អែមល្មម សម្រាប់ពេលសម្រន់។",
    img: "/Image/food/food9.png",
  },
];

// serpentine sweep — four brush passes across the frame
const BRUSH =
  "M -10,18 L 110,18 L 110,52 L -10,52 L -10,86 L 110,86 L 110,120 L -10,120";

export default function BrushRevealSection() {
  return (
    <section className="relative overflow-hidden bg-accent-50 py-24 md:py-32">
      {/* paper texture */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]">
        <filter id="paperGrain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.7"
            numOctaves="4"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#paperGrain)" />
      </svg>

      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <header className="mb-20 max-w-2xl md:mb-28">
          <span className="text-lg font-semibold tracking-[0.18em] text-secondary-600">
            គូរដោយរសជាតិ
          </span>
          <h2 className="mt-4 text-3xl font-black leading-tight text-primary-950 md:text-5xl">
            មុខម្ហូបនីមួយៗ មានរឿងរ៉ាវរបស់វា
          </h2>
        </header>

        <div className="space-y-28 md:space-y-40">
          {DISHES.map((d, i) => (
            <BrushRow key={d.name} dish={d} flip={i % 2 === 1} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BrushRow({
  dish,
  flip,
  index,
}: {
  dish: (typeof DISHES)[number];
  flip: boolean;
  index: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const maskId = useId();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "center 0.45"],
  });

  const painted = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    mass: 0.5,
    restDelta: 0.001,
  });

  // photo drifts slightly as it's painted in
  const imgY = useTransform(painted, [0, 1], [26, 0]);
  const underline = useTransform(painted, [0.25, 0.9], [0, 1]);

  return (
    <div
      ref={ref}
      className={`grid items-center gap-10 md:grid-cols-12 md:gap-14 ${
        flip ? "md:[direction:rtl]" : ""
      }`}
    >
      {/* painted photo */}
      <motion.div
        className="md:col-span-7 [direction:ltr]"
        style={{ y: reduce ? 0 : imgY }}
      >
        <svg
          viewBox="0 0 100 125"
          className="h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse">
              <motion.path
                d={BRUSH}
                stroke="white"
                strokeWidth={36}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                style={{ pathLength: reduce ? 1 : painted }}
              />
            </mask>
          </defs>

          <image
            href={dish.img}
            x="0"
            y="0"
            width="100"
            height="125"
            preserveAspectRatio="xMidYMid slice"
            mask={`url(#${maskId})`}
          />
        </svg>
      </motion.div>

      {/* copy */}
      <div className="md:col-span-5 [direction:ltr]">
        <span className="text-lg font-semibold tracking-[0.16em] text-secondary-600">
          {dish.region}
        </span>

        <h3 className="relative mt-3 inline-block text-2xl font-black leading-tight text-primary-950 md:text-4xl">
          {dish.name}
          {/* brush underline drawn with the same progress */}
          <svg
            viewBox="0 0 200 12"
            preserveAspectRatio="none"
            className="absolute -bottom-2 left-0 h-3 w-full"
          >
            <motion.path
              d="M2,8 C48,2 92,11 138,5 C162,2 182,7 198,4"
              stroke="#facc15"
              strokeWidth={7}
              strokeLinecap="round"
              fill="none"
              style={{ pathLength: reduce ? 1 : underline }}
            />
          </svg>
        </h3>

        <p className="mt-7 text-lg leading-relaxed text-primary-900/75">
          {dish.body}
        </p>

        <span className="mt-8 inline-flex items-center gap-3 text-lg font-bold text-primary-950">
          <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-primary-950 text-xl">
            {index + 1}
          </span>
          មើលហាងដែលមាន
        </span>
      </div>
    </div>
  );
}
