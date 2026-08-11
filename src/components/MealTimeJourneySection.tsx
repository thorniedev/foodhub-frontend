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

const MEALS = [
  {
    label: "អាហារពេលព្រឹក",
    dish: "បបរគ្រឿង",
    time: "០៦:៣០",
    img: "/Image/food/food1.png",
  },
  {
    label: "អាហារថ្ងៃត្រង់",
    dish: "សម្លម្ជូរ",
    time: "១២:០០",
    img: "/Image/food/food4.png",
  },
  {
    label: "អាហារពេលល្ងាច",
    dish: "ឡុកឡាក់",
    time: "១៨:៣០",
    img: "/Image/food/food7.png",
  },
  {
    label: "អាហារសម្រន់",
    dish: "នំចាក់",
    time: "២១:០០",
    img: "/Image/food/food9.png",
  },
];

const HEADLINE = "រាល់ពេលវេលា មានរសជាតិ ដែលសាកសមនឹងអ្នក";

export default function MealTimeJourneySection() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 65,
    damping: 25,
    mass: 0.45,
    restDelta: 0.0005,
  });

  const span = 1 / (MEALS.length + 0.5);

  useMotionValueEvent(progress, "change", (v) => {
    setActive(Math.min(MEALS.length - 1, Math.max(0, Math.floor(v / span))));
  });

  // dawn -> midday -> dusk -> night
  const bg = useTransform(
    progress,
    [0, 0.3, 0.62, 1],
    ["#14532d", "#166534", "#7c2d12", "#052e16"],
  );

  // sun arcs across the top
  const sunX = useTransform(progress, [0, 1], ["8%", "88%"]);
  const sunY = useTransform(progress, [0, 0.5, 1], ["22%", "6%", "26%"]);
  const sunColor = useTransform(
    progress,
    [0, 0.35, 0.7, 1],
    ["#fde047", "#facc15", "#fb923c", "#166534"],
  );

  const words = HEADLINE.split(" ");

  return (
    <div ref={ref} style={{ height: `${(MEALS.length + 0.5) * 100}vh` }}>
      <motion.section
        className="sticky top-0 h-screen overflow-hidden"
        style={{ backgroundColor: reduce ? "#052e16" : bg }}
      >
        {/* horizon glow */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-1/2"
          style={{
            background:
              "linear-gradient(to top, rgba(250,204,21,0.16), transparent 80%)",
          }}
        />

        {/* arcing sun */}
        <motion.div
          className="pointer-events-none absolute z-10 h-24 w-24 rounded-full blur-[2px] md:h-32 md:w-32"
          style={{
            left: sunX,
            top: sunY,
            x: "-50%",
            backgroundColor: reduce ? "#facc15" : sunColor,
            opacity: 0.9,
          }}
        />

        {/* time ticks across the top */}
        <div className="absolute inset-x-0 top-0 z-30 flex justify-between border-b border-white/10 px-6 py-5 md:px-14">
          {MEALS.map((m, i) => (
            <span
              key={m.time}
              className={`font-mono text-lg tabular-nums transition-colors duration-700 ${
                i === active ? "text-accent-300" : "text-white/25"
              }`}
            >
              {m.time}
            </span>
          ))}
        </div>

        {/* centre stage */}
        <div className="relative z-20 flex h-full flex-col items-center justify-center px-6">
          {/* circular aperture */}
          <div className="relative h-[46vh] w-[46vh] max-h-[380px] max-w-[380px]">
            {/* rotating ring caption */}
            <motion.div
              className="absolute inset-[-14%] z-10"
              animate={reduce ? {} : { rotate: 360 }}
              transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            >
              <svg viewBox="0 0 200 200" className="h-full w-full">
                <defs>
                  <path
                    id="ringPath"
                    d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0"
                    fill="none"
                  />
                </defs>
                <text
                  className="fill-accent-300/60"
                  style={{ fontSize: 13, letterSpacing: 4 }}
                >
                  <textPath href="#ringPath">
                    ស្វែងរករសជាតិ · គ្រប់ពេលវេលា · ស្វែងរករសជាតិ · គ្រប់ពេលវេលា
                    ·
                  </textPath>
                </text>
              </svg>
            </motion.div>

            <div className="absolute inset-0 overflow-hidden rounded-full ring-2 ring-accent-400/30">
              {MEALS.map((m, i) => (
                <Aperture
                  key={m.label}
                  meal={m}
                  index={i}
                  span={span}
                  progress={progress}
                  reduce={!!reduce}
                />
              ))}
            </div>

            {/* dish tag pinned to the circle edge */}
            <motion.div
              key={MEALS[active].dish}
              initial={reduce ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-accent-400 px-6 py-2"
            >
              <span className="text-lg font-bold text-primary-950">
                {MEALS[active].dish}
              </span>
            </motion.div>
          </div>

          {/* meal label */}
          <motion.p
            key={MEALS[active].label}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 text-3xl font-black text-white md:text-5xl"
          >
            {MEALS[active].label}
          </motion.p>

          {/* word-by-word fill headline */}
          <p className="mt-6 max-w-3xl text-center text-xl font-semibold leading-relaxed md:text-2xl">
            {words.map((w, i) => (
              <FillWord
                key={i}
                word={w}
                index={i}
                total={words.length}
                progress={progress}
                reduce={!!reduce}
              />
            ))}
          </p>
        </div>

        {/* progress arc at the bottom */}
        <div className="absolute inset-x-0 bottom-0 z-30 h-1 bg-white/10">
          <motion.div
            className="h-full origin-left bg-accent-400"
            style={{ scaleX: reduce ? 1 : progress }}
          />
        </div>
      </motion.section>
    </div>
  );
}

function Aperture({
  meal,
  index,
  span,
  progress,
  reduce,
}: {
  meal: (typeof MEALS)[number];
  index: number;
  span: number;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const start = index === 0 ? -0.001 : index * span;
  const end = index * span + span * 0.68;

  const radius = useTransform(progress, [start, end], [0, 78]);
  const clipPath = useTransform(radius, (r) => `circle(${r}% at 50% 50%)`);
  const scale = useTransform(progress, [start, end + span * 0.3], [1.25, 1.02]);
  const rotate = useTransform(progress, [start, end], [-6, 0]);

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        clipPath: reduce ? "circle(78% at 50% 50%)" : clipPath,
        zIndex: index + 1,
        willChange: "clip-path",
      }}
    >
      <motion.img
        src={meal.img}
        alt={meal.label}
        className="h-full w-full object-cover"
        style={{
          scale: reduce ? 1 : scale,
          rotate: reduce ? 0 : rotate,
          willChange: "transform",
        }}
      />
      <div className="absolute inset-0 bg-primary-950/25" />
    </motion.div>
  );
}

function FillWord({
  word,
  index,
  total,
  progress,
  reduce,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const step = 0.7 / total;
  const from = 0.12 + index * step;
  const to = from + step * 1.6;

  const opacity = useTransform(progress, [from, to], [0.22, 1]);
  const blur = useTransform(progress, [from, to], [4, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  return (
    <motion.span
      className="mr-2 inline-block text-white"
      style={
        reduce ? undefined : { opacity, filter, willChange: "opacity, filter" }
      }
    >
      {word}
    </motion.span>
  );
}
