"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { HiSparkles } from "react-icons/hi2";

// ✅ PERF: Only load the heavy recommendation dialog, swipe deck,
// canvas-confetti, and query hooks when the user clicks the AI button.
const RecommendationModalDialog = dynamic(
  () => import("./RecommendationModalDialog"),
  { ssr: false },
);

export default function Model() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        aria-label="Open FoodHub AI assistant"
        onClick={() => setIsOpen(true)}
        className="group fixed bottom-[calc(10px+env(safe-area-inset-bottom))] right-2 z-[101] cursor-pointer border-0 bg-transparent p-0 outline-none md:bottom-10 md:right-10 md:left-auto md:translate-x-0 pointer-events-auto transition-transform hover:scale-105 active:scale-95"
      >
        <div className="origin-bottom-right scale-[0.75] transition-transform md:scale-100">
          <div className="relative flex h-[88px] w-[88px] items-center justify-center">
            {/* Pulsing energy field - GPU accelerated via CSS */}
            <span
              aria-hidden="true"
              className="absolute inset-[5px] rounded-[30px] bg-gradient-to-br from-cyan-300/40 via-primary-600/30 to-secondary-500/40 blur-xl animate-pulse"
            />

            {/* Outer rounded tech frame - CSS spin */}
            <div
              className="absolute inset-[2px] rounded-[30px] border border-dashed border-cyan-300/70 animate-[spin_20s_linear_infinite]"
            />

            {/* Main assistant body */}
            <div className="absolute inset-[9px] rounded-[25px] bg-gradient-to-br from-cyan-300 via-primary-700 to-secondary-500 p-[2px] shadow-[0_18px_42px_rgba(20,85,60,0.5)]">
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[23px] bg-gradient-to-br from-[#052e2b] via-primary-950 to-[#123d32]">
                {/* Robot character */}
                <div className="relative z-10 flex flex-col items-center">
                  {/* Antenna */}
                  <div className="relative mb-1 h-3 w-[2px] rounded-full bg-white/70">
                    <span className="absolute -left-[4px] -top-1.5 h-2.5 w-2.5 rounded-full bg-green-300 shadow-[0_0_12px_rgba(134,239,172,1)] animate-ping" />
                  </div>

                  {/* Face screen */}
                  <div className="relative flex h-10 w-13 items-center justify-center gap-2.5 rounded-[14px] border border-cyan-100/25 bg-white/10 shadow-inner backdrop-blur-md">
                    <span className="h-3 w-2 rounded-full bg-cyan-100 shadow-[0_0_9px_rgba(207,250,254,1)]" />
                    <span className="h-3 w-2 rounded-full bg-cyan-100 shadow-[0_0_9px_rgba(207,250,254,1)]" />
                    <span className="absolute bottom-1 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-cyan-200" />
                  </div>

                  {/* Voice activity bars */}
                  <div className="mt-1.5 flex h-3 items-end gap-0.5">
                    {[6, 10, 7, 11, 6].map((height, index) => (
                      <span
                        key={index}
                        className="w-[2px] rounded-full bg-gradient-to-t from-cyan-400 to-green-300"
                        style={{ height: `${height}px` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Floating sparkles */}
                <span className="absolute right-2 top-2 text-cyan-200 opacity-80 animate-spin">
                  <HiSparkles className="text-[18px]" />
                </span>
              </div>
            </div>

            {/* Online status indicator */}
            <span className="absolute bottom-1 right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-lg">
              <span className="h-3.5 w-3.5 rounded-full bg-green-400 ring-2 ring-green-100" />
            </span>

            {/* AI badge */}
            <span className="absolute -right-2 top-0 z-30 flex h-8 min-w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-secondary-400 to-secondary-600 px-1.5 text-[16px] font-bold text-white shadow-lg">
              AI
            </span>
          </div>
        </div>
      </button>

      {mounted && isOpen && (
        <RecommendationModalDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
