import type { Variants } from "motion/react";

/* =========================================================
   SHARED REVEAL LANGUAGE

   Import these anywhere instead of hand-tuning delays per
   section — that's what makes the reveals feel like one
   system rather than six different animations.
========================================================= */

/** long, soft deceleration — things settle instead of stopping */
export const EASE_SOFT = [0.16, 1, 0.3, 1] as const;

/** starts as the element enters, not once it's half way up the screen */
export const VIEWPORT = {
  once: true,
  amount: 0.15,
  margin: "0px 0px -12% 0px",
} as const;

/** parent orchestrator: children reveal as one continuous wave */
export const group = (
  staggerChildren = 0.13,
  delayChildren = 0.04,
): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren, delayChildren },
  },
});

/*
 * Rise + wipe. No opacity anywhere — the element is masked by
 * its own clip box and uncovers as it rises, so nothing ever
 * fades in from white.
 */
export const riseReveal: Variants = {
  hidden: {
    y: 34,
    clipPath: "inset(0% 0% 100% 0%)",
  },
  show: {
    y: 0,
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { duration: 0.85, ease: EASE_SOFT },
  },
};

/*
 * Pure wipe, no travel. For big media that must stay aligned
 * with whatever overlaps it — moving it would break the overlap
 * mid-animation.
 */
export const wipe: Variants = {
  hidden: { clipPath: "inset(0% 0% 100% 0%)" },
  show: {
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { duration: 1, ease: EASE_SOFT },
  },
};

/** small travel, no clip — safe on anything with a shadow */
export const rise: Variants = {
  hidden: { y: 18 },
  show: {
    y: 0,
    transition: { duration: 0.65, ease: EASE_SOFT },
  },
};

/** cards and panels: travel + a touch of scale, still no opacity */
export const riseScale: Variants = {
  hidden: { y: 42, scale: 0.965 },
  show: {
    y: 0,
    scale: 1,
    transition: { duration: 0.85, ease: EASE_SOFT },
  },
};