"use client";

import { useId, useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";

const DEFAULT_NOTES = [
  { k: "ស្រុកកំណើត", v: "ខេត្តកំពត" },
  { k: "រដូវល្អបំផុត", v: "ខែធ្នូ – កុម្ភៈ" },
  { k: "កម្រិតហឹរ", v: "មធ្យម" },
];

export default function ZoomThroughSection({
  word = "រសជាតិ",
  image = "/Image/food/food4.png",
  eyebrow = "មុខម្ហូបប្រចាំខែ",
  title = "ក្ដាមម្រេចខ្ចី ពីឆ្នេរកែប",
  notes = DEFAULT_NOTES,
  height = "320vh",
}: {
  word?: string;
  image?: string;
  eyebrow?: string;
  title?: string;
  notes?: { k: string; v: string }[];
  height?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // unique ids so several of these can live on one page
  const rawId = useId();
  const maskId = `zoomWordMask-${rawId.replace(/:/g, "")}`;
  const grainId = `zoomGrain-${rawId.replace(/:/g, "")}`;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 72,
    damping: 26,
    mass: 0.45,
    restDelta: 0.0005,
  });

  // the word grows until its counters swallow the whole viewport
  const wordScale = useTransform(progress, [0, 0.72, 1], [1, 16, 34]);
  // image pushes back slightly so the zoom feels like a dolly, not just scale
  const imgScale = useTransform(progress, [0, 1], [1.28, 1]);
  const imgOpacity = useTransform(progress, [0, 0.12], [0, 1]);

  // fades the whole section in as it takes over from the hero
  const introOpacity = useTransform(progress, [0, 0.06], [0, 1]);

  const hintOpacity = useTransform(progress, [0, 0.12], [1, 0]);
  const captionOpacity = useTransform(progress, [0.68, 0.85], [0, 1]);
  const captionY = useTransform(progress, [0.68, 0.85], [30, 0]);
  const vignette = useTransform(progress, [0.6, 1], [0, 0.55]);

  return (
    <div ref={ref} style={{ height }}>
      <motion.section
        className="sticky top-0 h-screen overflow-hidden bg-primary-950"
        style={{ opacity: reduce ? 1 : introOpacity }}
      >
        {/* masked image */}
        <svg
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse">
              <rect x="0" y="0" width="1000" height="1000" fill="black" />
              <motion.text
                x="500"
                y="515"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                stroke="white"
                strokeWidth={8}
                strokeLinejoin="round"
                style={{
                  fontSize: 190,
                  fontWeight: 900,
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  scale: reduce ? 34 : wordScale,
                }}
              >
                {word}
              </motion.text>
            </mask>
          </defs>

          <motion.image
            href={image}
            x="0"
            y="0"
            width="1000"
            height="1000"
            preserveAspectRatio="xMidYMid slice"
            mask={`url(#${maskId})`}
            style={{
              scale: reduce ? 1 : imgScale,
              opacity: reduce ? 1 : imgOpacity,
              transformBox: "fill-box",
              transformOrigin: "center",
            }}
          />
        </svg>

        {/* vignette settles in once the frame is full */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            opacity: reduce ? 0.4 : vignette,
            background:
              "radial-gradient(75% 70% at 50% 45%, transparent 35%, rgba(5,46,22,0.9) 100%)",
          }}
        />

        {/* grain */}
        <svg className="pointer-events-none absolute inset-0 z-[11] h-full w-full opacity-[0.1] mix-blend-overlay">
          <filter id={grainId}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="3"
            />
          </filter>
          <rect width="100%" height="100%" filter={`url(#${grainId})`} />
        </svg>

        {/* scroll hint, only before the zoom starts */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-14 z-30 text-center"
          style={{ opacity: reduce ? 0 : hintOpacity }}
        >
          <span className="text-lg font-medium tracking-[0.2em] text-accent-300">
            រំកិលចុះក្រោម
          </span>
          <motion.div
            className="mx-auto mt-4 h-9 w-[2px] origin-top bg-accent-300/70"
            animate={reduce ? {} : { scaleY: [0.2, 1, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* caption arrives after the image fills the frame */}
        <motion.div
          className="absolute inset-x-0 bottom-0 z-30 px-6 pb-14 md:px-14"
          style={{
            opacity: reduce ? 1 : captionOpacity,
            y: reduce ? 0 : captionY,
          }}
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="text-lg font-semibold tracking-[0.18em] text-accent-300">
                {eyebrow}
              </span>
              <h2 className="mt-3 max-w-md text-3xl font-black leading-tight text-white md:text-5xl">
                {title}
              </h2>
            </div>

            <dl className="flex flex-wrap gap-x-10 gap-y-4">
              {notes.map((n) => (
                <div key={n.k}>
                  <dt className="text-lg text-white/55">{n.k}</dt>
                  <dd className="mt-1 text-lg font-bold text-white">{n.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </motion.div>

        {/* progress rail */}
        <div className="absolute inset-x-0 bottom-0 z-30 h-[3px] bg-white/15">
          <motion.div
            className="h-full origin-left bg-accent-400"
            style={{ scaleX: reduce ? 1 : progress }}
          />
        </div>
      </motion.section>
    </div>
  );
}
