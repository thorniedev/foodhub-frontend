"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * Draggable / swipeable carousel with optional auto-advance.
 * - Desktop: shows 2 cards at once inside a max-w-7xl, mx-auto container
 * - Tablet: shows ~1.2 cards
 * - Mobile: shows 1 card
 * - User can drag/swipe left-right, or use the prev/next buttons/dots
 * - Optionally auto-advances one card at a time on a timer, but instantly
 *   yields to the user on drag, hover, or button/dot clicks, resuming a
 *   fixed delay after the interaction ends
 *
 * Usage:
 *   <Carousel items={slides} autoPlay />
 *   <Carousel items={slides} autoPlay autoPlayInterval={3000} autoPlayResumeDelay={3000} />
 */

export type CarouselItem = {
  id: string | number;
  image: string;
  alt: string;
};

type CarouselProps = {
  items: CarouselItem[];
  /** px gap between cards, keep in sync with the gap-* class below */
  gap?: number;
  className?: string;
  /** auto-advance one card at a time when true (default: false) */
  autoPlay?: boolean;
  /** ms between auto-advances (default: 3000) */
  autoPlayInterval?: number;
  /** ms to wait after the user interacts before auto-advance resumes (default: 3000) */
  autoPlayResumeDelay?: number;
  /** pause auto-advance while the mouse is hovering the carousel (default: true) */
  pauseOnHover?: boolean;
  /** loop back to the first slide after the last (default: true) */
  loop?: boolean;
};

export default function Carousel({
  items,
  gap = 24,
  className = "",
  autoPlay = false,
  autoPlayInterval = 3000,
  autoPlayResumeDelay = 3000,
  pauseOnHover = true,
  loop = true,
}: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragMoved = useRef(false);
  const rafId = useRef<number | null>(null);
  const pendingX = useRef<number | null>(null);
  const dragState = useRef({
    dragging: false,
    startX: 0,
    startScrollLeft: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0, // px per ms
  });
  const pausedUntilRef = useRef(0);
  const lastAdvanceRef = useRef(0);
  const hoveredRef = useRef(false);
  const activeIndexRef = useRef(0);

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // any interaction (drag, button, dot) pauses auto-advance for a bit,
  // and pushes the next scheduled advance back so it doesn't fire the
  // instant the pause window ends
  const pauseAutoPlay = useCallback(() => {
    const resumeAt = performance.now() + autoPlayResumeDelay;
    pausedUntilRef.current = resumeAt;
    lastAdvanceRef.current = resumeAt;
  }, [autoPlayResumeDelay]);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);

    // figure out which card is closest to the left edge, for the dots
    const cardEls = Array.from(el.children) as HTMLElement[];
    let closest = 0;
    let closestDist = Infinity;
    cardEls.forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft - el.scrollLeft);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    activeIndexRef.current = closest;
    setActiveIndex(closest);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  useEffect(() => {
    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // move to a specific card, wrapping if requested
  const goToIndex = useCallback((index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const cardEls = Array.from(el.children) as HTMLElement[];
    if (cardEls.length === 0) return;
    const clamped =
      ((index % cardEls.length) + cardEls.length) % cardEls.length;
    el.scrollTo({ left: cardEls[clamped].offsetLeft, behavior: "smooth" });
  }, []);

  const advance = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const cardEls = Array.from(el.children) as HTMLElement[];
    if (cardEls.length === 0) return;

    const isAtEnd = activeIndexRef.current >= cardEls.length - 1;
    if (isAtEnd) {
      if (loop) goToIndex(0);
      // if not looping, just stay put
    } else {
      goToIndex(activeIndexRef.current + 1);
    }
  }, [goToIndex, loop]);

  // ---- Auto-advance one card at a time, pauses on drag / hover / interaction ----
  useEffect(() => {
    if (!autoPlay) return;

    const CHECK_INTERVAL = 200; // how often we check whether it's time to advance
    let timeoutId: ReturnType<typeof setTimeout>;
    lastAdvanceRef.current = performance.now();

    const tick = () => {
      const now = performance.now();
      const isPaused =
        dragState.current.dragging ||
        (pauseOnHover && hoveredRef.current) ||
        now < pausedUntilRef.current;

      if (!isPaused && now - lastAdvanceRef.current >= autoPlayInterval) {
        advance();
        lastAdvanceRef.current = now;
      }
      timeoutId = setTimeout(tick, CHECK_INTERVAL);
    };

    timeoutId = setTimeout(tick, CHECK_INTERVAL);
    return () => clearTimeout(timeoutId);
  }, [autoPlay, autoPlayInterval, pauseOnHover, advance]);

  const scrollByCard = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    pauseAutoPlay();
    const card = el.children[0] as HTMLElement | undefined;
    const step = card
      ? card.getBoundingClientRect().width + gap
      : el.clientWidth;
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  const scrollToIndex = (index: number) => {
    pauseAutoPlay();
    goToIndex(index);
  };

  // snap to whichever card is closest to the left edge right now
  const snapToNearest = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const cardEls = Array.from(el.children) as HTMLElement[];
    let closest = 0;
    let closestDist = Infinity;
    cardEls.forEach((card, i) => {
      const dist = Math.abs(card.offsetLeft - el.scrollLeft);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    el.scrollTo({
      left: cardEls[closest]?.offsetLeft ?? 0,
      behavior: "smooth",
    });
  }, []);

  // ---- Pointer (mouse + touch) drag-to-scroll, with rAF batching + momentum ----
  const onPointerDown = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el) return;
    if (rafId.current != null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    const state = dragState.current;
    state.dragging = true;
    state.startX = e.clientX;
    state.startScrollLeft = el.scrollLeft;
    state.lastX = e.clientX;
    state.lastTime = performance.now();
    state.velocity = 0;
    dragMoved.current = false;
    el.setPointerCapture(e.pointerId);
    setIsDragging(true);
    pauseAutoPlay();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const state = dragState.current;
    if (!state.dragging || !trackRef.current) return;

    const now = performance.now();
    const dt = now - state.lastTime;
    if (dt > 0) {
      // smooth the velocity reading a little so a single jumpy sample
      // doesn't dominate the momentum throw
      const instant = (e.clientX - state.lastX) / dt;
      state.velocity = state.velocity * 0.7 + instant * 0.3;
    }
    state.lastX = e.clientX;
    state.lastTime = now;

    const delta = e.clientX - state.startX;
    if (Math.abs(delta) > 4) dragMoved.current = true;
    pendingX.current = state.startScrollLeft - delta;

    // batch the actual DOM write into the next animation frame so we
    // never write scrollLeft more than once per paint
    if (rafId.current == null) {
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;
        if (pendingX.current != null && trackRef.current) {
          trackRef.current.scrollLeft = pendingX.current;
        }
      });
    }
  };

  const endDrag = (e: React.PointerEvent) => {
    const el = trackRef.current;
    const state = dragState.current;
    if (!el || !state.dragging) return;
    state.dragging = false;
    setIsDragging(false);
    pauseAutoPlay();
    try {
      el.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }

    if (rafId.current != null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    // throw: keep coasting in the direction of the released velocity,
    // decelerating each frame, then settle on the nearest card
    let velocity = state.velocity * 16; // px per frame at ~60fps
    const friction = 0.94;

    const glide = () => {
      const track = trackRef.current;
      if (!track) return;
      velocity *= friction;
      track.scrollLeft -= velocity;
      if (Math.abs(velocity) > 0.4) {
        rafId.current = requestAnimationFrame(glide);
      } else {
        rafId.current = null;
        snapToNearest();
      }
    };

    if (Math.abs(velocity) > 1.5) {
      rafId.current = requestAnimationFrame(glide);
    } else {
      snapToNearest();
    }
  };

  // prevent an image click firing right after a drag
  const onClickCapture = (e: React.MouseEvent) => {
    if (dragMoved.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className={` max-w-7xl container mx-auto px-4 ${className}`}>
      <div
        className="relative"
        onMouseEnter={() => {
          hoveredRef.current = true;
        }}
        onMouseLeave={() => {
          hoveredRef.current = false;
        }}
      >
        {/* Prev button */}
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => scrollByCard(-1)}
          disabled={!canPrev}
          className="absolute left-0 sm:-left-5 top-1/2 -translate-y-1/2 z-10
                     flex h-10 w-10 items-center justify-center rounded-full
                     bg-white shadow-md border border-gray-200
                     disabled:opacity-0 disabled:pointer-events-none
                     transition-opacity hover:bg-gray-50"
        >
          <ChevronIcon direction="left" />
        </button>

        {/* Track */}
        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onClickCapture={onClickCapture}
          className={`flex overflow-x-auto select-none
                     [scrollbar-width:none] [-ms-overflow-style:none]
                     [&::-webkit-scrollbar]:hidden
                     ${isDragging ? "cursor-grabbing" : "cursor-grab scroll-smooth"}
                     ${isDragging ? "" : "snap-x snap-mandatory"}`}
          style={{
            gap: `${gap}px`,
            scrollPaddingLeft: 0,
            touchAction: "pan-y",
            overscrollBehaviorX: "contain",
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="snap-start shrink-0 basis-full sm:basis-[70%] lg:basis-[calc(50%-12px)]"
            >
              <div className="relative w-full h-75 aspect-video overflow-hidden rounded-2xl bg-gray-100">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  draggable={false}
                  className="object-cover pointer-events-none"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 50vw"
                  priority={false}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Next button */}
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => scrollByCard(1)}
          disabled={!canNext}
          className="absolute right-0 sm:-right-5 top-1/2 -translate-y-1/2 z-10
                     flex h-10 w-10 items-center justify-center rounded-full
                     bg-white shadow-md border border-gray-200
                     disabled:opacity-0 disabled:pointer-events-none
                     transition-opacity hover:bg-gray-50"
        >
          <ChevronIcon direction="right" />
        </button>
      </div>

      {/* Dots */}
      <div className="mt-4 flex justify-center gap-2">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => scrollToIndex(i)}
            className={`h-2 rounded-full transition-all ${
              activeIndex === i ? "w-6 bg-primary-700" : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={direction === "left" ? "" : "rotate-180"}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

// ---- Example data, swap with your own images ----
export const slides: CarouselItem[] = [
  {
    id: 1,
    image: "/Image/benner.png",
    alt: "Grilled chicken combo with dipping sauces",
  },
  {
    id: 2,
    image: "/Image/benner.png",
    alt: "Fried chicken special combo with fries and coke",
  },
  { id: 3, image: "/Image/benner.png", alt: "Chicken burger combo" },
  { id: 4, image: "/Image/benner.png", alt: "Family sharing platter" },
];
