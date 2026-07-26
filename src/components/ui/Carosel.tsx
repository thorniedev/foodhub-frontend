"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

export type CarouselItem = {
  id: string | number;
  image: string;
  alt: string;
};

type CarouselProps = {
  items: CarouselItem[];
  /** fixed gap in px; leave undefined to use the responsive default (16 / 20 / 24) */
  gap?: number;
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  autoPlayResumeDelay?: number;
  pauseOnHover?: boolean;
  /** loop seamlessly back to the first slide after the last (default: true) */
  loop?: boolean;
  /** show the prev/next arrows on phones too (default: false — swipe instead) */
  showArrowsOnMobile?: boolean;
};

export default function Carousel({
  items,
  gap,
  className = "",
  autoPlay = false,
  autoPlayInterval = 3000,
  autoPlayResumeDelay = 3000,
  pauseOnHover = true,
  loop = true,
  showArrowsOnMobile = false,
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
    velocity: 0,
  });
  const pausedUntilRef = useRef(0);
  const lastAdvanceRef = useRef(0);
  const hoveredRef = useRef(false);
  const activeIndexRef = useRef(0);
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // where a smooth scroll is currently heading, so rapid arrow clicks stack
  const targetIndexRef = useRef<{ index: number; at: number }>({
    index: 0,
    at: 0,
  });

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const n = items.length;
  const isLooping = loop && n > 1;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Three back-to-back copies of the items so we can always keep the
  // visible scroll position inside the "real" (middle) copy, and jump
  // invisibly between copies since they're pixel-identical.
  const displayItems = useMemo(
    () => (isLooping ? [...items, ...items, ...items] : items),
    [items, isLooping],
  );

  const pauseAutoPlay = useCallback(() => {
    const resumeAt = performance.now() + autoPlayResumeDelay;
    pausedUntilRef.current = resumeAt;
    lastAdvanceRef.current = resumeAt;
  }, [autoPlayResumeDelay]);

  // Once scrolling has settled, if we've drifted into the first or third
  // copy, silently reposition to the equivalent card in the middle copy.
  const normalizeLoop = useCallback(() => {
    const el = trackRef.current;
    if (!el || !isLooping) return;
    if (dragState.current.dragging) return;

    const cardEls = Array.from(el.children) as HTMLElement[];
    const idx = activeIndexRef.current;

    if (idx < n) {
      const target = cardEls[idx + n];
      if (target) {
        el.scrollLeft = target.offsetLeft;
        activeIndexRef.current = idx + n;
        targetIndexRef.current = { index: idx + n, at: 0 };
      }
    } else if (idx >= 2 * n) {
      const target = cardEls[idx - n];
      if (target) {
        el.scrollLeft = target.offsetLeft;
        activeIndexRef.current = idx - n;
        targetIndexRef.current = { index: idx - n, at: 0 };
      }
    }
  }, [isLooping, n]);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    if (isLooping) {
      setCanPrev(true);
      setCanNext(true);
    } else {
      setCanPrev(el.scrollLeft > 4);
      setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    }

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

    const dotIndex = isLooping ? ((closest % n) + n) % n : closest;
    setActiveIndex(dotIndex);

    // debounce: only normalize once scrolling has actually stopped
    if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);
    settleTimeoutRef.current = setTimeout(() => {
      normalizeLoop();
    }, 120);
  }, [isLooping, n, normalizeLoop]);

  // initial mount: center inside the middle copy so both directions
  // have somewhere to scroll into immediately
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    if (isLooping) {
      const cardEls = Array.from(el.children) as HTMLElement[];
      const target = cardEls[n];
      if (target) {
        el.scrollLeft = target.offsetLeft;
        activeIndexRef.current = n;
<<<<<<< HEAD
=======
        targetIndexRef.current = { index: n, at: 0 };
>>>>>>> d1cdd83bd745a3a0f98e4be08cf8aa4555ae8915
      }
    }

    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
      if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);
    };
  }, [updateArrows, isLooping, n]);

  // card widths change at every breakpoint — re-align to the active card
  // after a resize so we never rest half-way between two slides
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const cardEls = Array.from(el.children) as HTMLElement[];
        const card = cardEls[activeIndexRef.current];
        if (card) el.scrollLeft = card.offsetLeft;
      }, 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const goToIndex = useCallback(
    (index: number) => {
      const el = trackRef.current;
      if (!el) return;
      const cardEls = Array.from(el.children) as HTMLElement[];
      if (cardEls.length === 0) return;
      const clamped = Math.max(0, Math.min(index, cardEls.length - 1));
      targetIndexRef.current = { index: clamped, at: performance.now() };
      el.scrollTo({
        left: cardEls[clamped].offsetLeft,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    },
    [reduceMotion],
  );

  // base index for the next step: the in-flight target if a smooth scroll
  // is still running, otherwise wherever we actually are
  const stepBase = useCallback(() => {
    const { index, at } = targetIndexRef.current;
    return performance.now() - at < 500 ? index : activeIndexRef.current;
  }, []);

  const advance = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const cardEls = Array.from(el.children) as HTMLElement[];
    if (cardEls.length === 0) return;

    if (isLooping) {
      // extended list + normalizeLoop keeps this safe indefinitely
      goToIndex(stepBase() + 1);
    } else {
      const isAtEnd = activeIndexRef.current >= cardEls.length - 1;
      if (!isAtEnd) goToIndex(stepBase() + 1);
    }
  }, [goToIndex, isLooping, stepBase]);

  useEffect(() => {
    if (!autoPlay || reduceMotion) return;

    const CHECK_INTERVAL = 200;
    let timeoutId: ReturnType<typeof setTimeout>;
    lastAdvanceRef.current = performance.now();

    const tick = () => {
      const now = performance.now();
      const isPaused =
        dragState.current.dragging ||
        (pauseOnHover && hoveredRef.current) ||
        document.hidden ||
        now < pausedUntilRef.current;

      if (!isPaused && now - lastAdvanceRef.current >= autoPlayInterval) {
        advance();
        lastAdvanceRef.current = now;
      }
      timeoutId = setTimeout(tick, CHECK_INTERVAL);
    };

    timeoutId = setTimeout(tick, CHECK_INTERVAL);
    return () => clearTimeout(timeoutId);
  }, [autoPlay, autoPlayInterval, pauseOnHover, advance, reduceMotion]);

  // step by one card, measured from the DOM so it stays correct at every
  // breakpoint regardless of what the gap resolves to
  const scrollByCard = (direction: 1 | -1) => {
    pauseAutoPlay();
    goToIndex(stepBase() + direction);
  };

  const scrollToIndex = (index: number) => {
    pauseAutoPlay();
    const base = isLooping ? Math.floor(stepBase() / n) * n : 0;
    goToIndex(base + index);
  };

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
    targetIndexRef.current = { index: closest, at: performance.now() };
    el.scrollTo({
      left: cardEls[closest]?.offsetLeft ?? 0,
      behavior: "smooth",
    });
  }, []);

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
      const instant = (e.clientX - state.lastX) / dt;
      state.velocity = state.velocity * 0.7 + instant * 0.3;
    }
    state.lastX = e.clientX;
    state.lastTime = now;

    const delta = e.clientX - state.startX;
    if (Math.abs(delta) > 4) dragMoved.current = true;
    pendingX.current = state.startScrollLeft - delta;

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

    let velocity = state.velocity * 16;
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

  const onClickCapture = (e: React.MouseEvent) => {
    if (dragMoved.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollByCard(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollByCard(-1);
    }
  };

  const arrowBase = `${
    showArrowsOnMobile ? "flex" : "hidden sm:flex"
  } absolute top-1/2 -translate-y-1/2 z-10
     h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-full
     bg-white/90 backdrop-blur-sm shadow-md border border-gray-200
     text-gray-700 hover:bg-white
     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700
     disabled:opacity-0 disabled:pointer-events-none transition-opacity`;

  return (
    <div
      className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-4 ${className}`}
    >
      <div
        className="relative"
        onMouseEnter={() => {
          hoveredRef.current = true;
        }}
        onMouseLeave={() => {
          hoveredRef.current = false;
        }}
      >
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => scrollByCard(-1)}
          disabled={!canPrev}
          className={`${arrowBase} left-2 min-[1360px]:-left-5`}
        >
          <ChevronIcon direction="left" />
        </button>

        <div
          ref={trackRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured items"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onClickCapture={onClickCapture}
          className={`flex overflow-x-auto select-none rounded-2xl
                     gap-4 sm:gap-5 lg:gap-6
                     focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-700
                     [scrollbar-width:none] [-ms-overflow-style:none]
                     [&::-webkit-scrollbar]:hidden
                     ${isDragging ? "cursor-grabbing" : "cursor-grab scroll-smooth"}
                     ${isDragging ? "" : "snap-x snap-mandatory"}`}
          style={{
            ...(gap != null ? { gap: `${gap}px` } : null),
            scrollPaddingLeft: 0,
            touchAction: "pan-y",
            overscrollBehaviorX: "contain",
          }}
        >
          {displayItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="snap-start shrink-0 basis-[88%] sm:basis-[70%] lg:basis-[calc(50%-12px)]"
            >
              <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl bg-gray-100 aspect-[16/9] sm:aspect-[2/1] lg:aspect-auto lg:h-75">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  draggable={false}
                  className="object-cover pointer-events-none"
                  sizes="(max-width: 640px) 88vw, (max-width: 1024px) 70vw, 50vw"
                  priority={false}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="Next slide"
          onClick={() => scrollByCard(1)}
          disabled={!canNext}
          className={`${arrowBase} right-2 min-[1360px]:-right-5`}
        >
          <ChevronIcon direction="right" />
        </button>
      </div>

      <div className="mt-3 lg:mt-4 flex flex-wrap justify-center">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={activeIndex === i}
            onClick={() => scrollToIndex(i)}
            className="p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 rounded-full"
          >
            <span
              className={`block h-2 rounded-full transition-all ${
                activeIndex === i ? "w-6 bg-primary-700" : "w-2 bg-gray-300"
              }`}
            />
          </button>
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
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

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
