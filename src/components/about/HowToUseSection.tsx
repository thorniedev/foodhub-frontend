"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import svgPaths from "@/lib/scv";

function CarouselAnimationStyles() {
  return (
    <style jsx global>{`
      @keyframes progressFill {
        from { width: 0%; }
        to { width: 100%; }
      }
      .animate-progress-fill { animation: progressFill linear forwards; }
    `}</style>
  );
}

function ProgressBar({
  isActive,
  cycleKey,
  colorClass,
  durationMs,
}: {
  isActive: boolean;
  cycleKey: number;
  colorClass: string;
  durationMs: number;
}) {
  return (
    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-black/5">
      {isActive && (
        <div
          key={cycleKey}
          className={`h-full rounded-full animate-progress-fill ${colorClass}`}
          style={{ animationDuration: `${durationMs}ms` }}
        />
      )}
    </div>
  );
}

function ArrowIcon() {
  return (
    <div className="flex-shrink-0 rounded-full bg-[#136c34] p-2">
      <svg className="size-5" fill="none" viewBox="0 0 20 20">
        <path d={svgPaths.p3610fb80} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        <path d={svgPaths.p3e47bd00} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
      </svg>
    </div>
  );
}

function Card1({ isActive }: { isActive: boolean }) {
  return (
    <div
      className={`flex h-full min-h-[380px] w-full flex-col gap-4 rounded-[32px] bg-[#e9f9ef] p-6 transition-all duration-300 ease-out ${
        isActive
          ? "-translate-y-2 scale-105 ring-2 ring-[#136c34]/40"
          : "translate-y-0 scale-100"
      }`}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-['Kantumruy_Pro',sans-serif] text-xl font-bold text-[#136c34]">
          ស្វែងរកតាមចំណូលចិត្ត
        </h3>
        <ArrowIcon />
      </div>
      <div className="border-t border-[#3f3f46]/20 pt-3">
        <p className="font-['Kantumruy_Pro',sans-serif] text-base leading-relaxed text-[#596378]">
          ស្វែងរកមុខម្ហូប និងប្រភេទអាហារ ត្រូវចិត្ត សម្រាប់អ្នក និងគ្រួសារ ។
        </p>
      </div>
      <div className="relative mt-auto h-48 overflow-hidden rounded-2xl">
        <Image
          alt="Search food"
          src="/about/fooooo.jpg"
          fill
          unoptimized
          className="object-cover "
        />
        <div className="absolute inset-0 " />
      </div>
    </div>
  );
}

function Card2({ isActive }: { isActive: boolean }) {
  return (
    <div
      className={`relative flex h-full min-h-[380px] w-full flex-col gap-4 rounded-[32px] bg-[#fef1e8] p-6 transition-all duration-300 ease-out ${
        isActive
          ? "-translate-y-2 scale-105 ring-2 ring-[#e36914]/40"
          : "translate-y-0 scale-100"
      }`}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-['Kantumruy_Pro',sans-serif] text-xl font-bold text-[#e36914]">
          ជ្រើសរើសឥឡូវនេះ
        </h3>
      </div>
      <div className="border-t border-[#3f3f46]/20 pt-3">
        <p className="font-['Kantumruy_Pro',sans-serif] text-base leading-relaxed text-[#596378]">
          ស្វែងយល់ពីជម្រើសនៅជុំវិញអ្នក ជាមួយការណែនាំឆ្លាតវៃ ។
        </p>
      </div>
      <div className="relative mt-auto h-48 overflow-hidden rounded-2xl">
        <Image
          alt="Choose food"
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
          fill
          unoptimized
          className="object-cover"
        />
      </div>
      {/* Orange button */}
      <div className="absolute -left-3 bottom-12 z-10 flex size-13 items-center justify-center rounded-full border-4 border-black bg-[#e36914] sm:size-16">
        <svg className="size-6 sm:size-7" fill="none" viewBox="0 0 28 28">
          <path d={svgPaths.p379dca80} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
          <path d={svgPaths.p3b3e9900} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
        </svg>
      </div>
    </div>
  );
}

function Card3({ isActive }: { isActive: boolean }) {
  return (
    <div
      className={`flex h-full min-h-[380px] w-full flex-col gap-4 rounded-[32px] border border-[#eceff3] bg-white p-6 transition-all duration-300 ease-out ${
        isActive
          ? "-translate-y-2 scale-105 ring-2 ring-[#515a6d]/40"
          : "translate-y-0 scale-100"
      }`}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-['Kantumruy_Pro',sans-serif] text-xl font-bold text-[#515a6d]">
          ញ៉ាំដោយភាពរីករាយ
        </h3>
        <ArrowIcon />
      </div>
      <div className="border-t border-[#3f3f46]/20 pt-3">
        <p className="font-['Kantumruy_Pro',sans-serif] text-base leading-relaxed text-[#596378]">
          ចូលញ៉ាំដល់ហាង ឬកុម្ម៉ង់ភ្លាម រីករាយ ជាមួយអាហារឆ្ងាញ់ ។
        </p>
      </div>
      <div className="relative mt-auto h-48 overflow-hidden rounded-2xl">
        <Image
          alt="Enjoy food"
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
          fill
          unoptimized
          className="object-cover"
        />
      </div>
    </div>
  );
}

const HIGHLIGHT_INTERVAL_MS = 1000;
const CARD_COUNT = 3;

export default function HowToUseSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CARD_COUNT);
      setCycle((prev) => prev + 1);
    }, HIGHLIGHT_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <section className="bg-[#f8fafc] px-4 py-12 sm:px-8 md:py-20">
      <CarouselAnimationStyles />
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 text-center md:mb-14">
          <h2 className="font-['Kantumruy_Pro',sans-serif] text-3xl font-semibold tracking-wide sm:text-4xl md:text-[48px]">
            <span className="text-[#e36914]">របៀបក្នុង</span>
            <span className="text-[#136c34]">ការប្រើប្រាស់</span>
          </h2>
        </div>

        {/* All 3 cards always visible; active one auto-highlights on rotation */}
        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <Card1 isActive={activeIndex === 0} />
          <Card2 isActive={activeIndex === 1} />
          <Card3 isActive={activeIndex === 2} />
        </div>

        {/* Dot Indicators */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: CARD_COUNT }).map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-[10px] rounded-full transition-all duration-300 ${
                activeIndex === index
                  ? "w-7 bg-[#368153]"
                  : "w-[10px] bg-[#eceff3] hover:bg-[#c9dad4]"
              }`}
              aria-label={`Highlight card ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 