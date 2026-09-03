"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const SLATS = 6;
const MIN_MS = 1600; // minimum time the loader stays up
const ONCE_PER_SESSION = true;

export default function Preloader({
  label = "កំពុងរៀបចំមុខម្ហូប...",
  word = "ម្ហូបអាហារ",
}: {
  label?: string;
  word?: string;
}) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [pct, setPct] = useState(0);
  const target = useRef(90);

  // decide whether to show at all (avoids SSR/hydration mismatch)
  useEffect(() => {
    if (ONCE_PER_SESSION && sessionStorage.getItem("foodhub:loaded")) {
      setVisible(false);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !visible) return;

    document.body.style.overflow = "hidden";
    const started = performance.now();
    let raf = 0;

    const tick = () => {
      setPct((p) => {
        const next = p + (target.current - p) * 0.07;
        return target.current - next < 0.2 ? target.current : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const finish = () => {
      const wait = Math.max(0, MIN_MS - (performance.now() - started));
      window.setTimeout(() => {
        target.current = 100;
        window.setTimeout(() => {
          setVisible(false);
          sessionStorage.setItem("foodhub:loaded", "1");
          window.dispatchEvent(new CustomEvent("foodhub:reveal"));
        }, 500);
      }, wait);
    };

    const ready = Promise.all([
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise((r) =>
            window.addEventListener("load", r, { once: true }),
          ),
      (document as any).fonts?.ready ?? Promise.resolve(),
    ]);
    ready.then(finish);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, [mounted, visible]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[9999] flex items-end justify-between px-6 pb-8 md:px-12 md:pb-12"
          exit={reduce ? { opacity: 0 } : {}}
          transition={{ duration: 0.4 }}
        >
          {/* slat curtain */}
          <div className="absolute inset-0 -z-10 flex">
            {Array.from({ length: SLATS }).map((_, i) => (
              <motion.div
                key={i}
                className="h-full flex-1 bg-primary-900"
                initial={{ y: 0 }}
                exit={
                  reduce
                    ? { opacity: 0 }
                    : {
                        y: "-100%",
                        transition: {
                          duration: 0.8,
                          delay: i * 0.06,
                          ease: [0.76, 0, 0.24, 1],
                        },
                      }
                }
              />
            ))}
          </div>

          {/* wordmark, mask-revealed */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="overflow-hidden">
              <motion.h2
                className="text-4xl py-20 font-bold tracking-normal text-accent-400 md:text-6xl"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                exit={{
                  y: "-110%",
                  transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] },
                }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}
              </motion.h2>
            </div>
          </div>

          {/* label + counter */}
          <motion.span
            className="text-sm tracking-wide text-white/60"
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
          >
            {label}
          </motion.span>
          <motion.span
            className="font-mono text-4xl tabular-nums text-white md:text-6xl"
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
          >
            {String(Math.round(pct)).padStart(3, "0")}
          </motion.span>

          {/* progress hairline */}
          <motion.div
            className="absolute bottom-0 left-0 h-[2px] bg-accent-400"
            style={{ width: `${pct}%` }}
            exit={{ opacity: 0 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
