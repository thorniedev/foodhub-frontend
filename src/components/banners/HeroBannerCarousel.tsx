"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
  type PanInfo,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PublicBannerResponse } from "@/types/banner";
import { bannerApi } from "@/services/bannerApi";
import { resolveImageUrl } from "@/utils/image";
import { HeroBannerSkeleton } from "./BannerSkeleton";

const SLIDE_TIME = 5000;

const SPRING = {
  type: "spring",
  stiffness: 240,
  damping: 34,
  mass: 1,
} as const;

const PARALLAX = 0.05;
const FLICK_POWER = 0.2;
const STEP_THRESHOLD = 0.18;

interface SlideProps {
  banner: PublicBannerResponse;
  index: number;
  x: MotionValue<number>;
  width: number;
  isActive: boolean;
  isPriority: boolean;
  reduceMotion: boolean | null;
}

function CarouselSlide({
  banner,
  index,
  x,
  width,
  isActive,
  isPriority,
  reduceMotion,
}: SlideProps) {
  const w = width || 1;
  const offset = useTransform(x, (v) => v + index * w);
  const imageX = useTransform(
    offset,
    [-w, 0, w],
    [w * PARALLAX, 0, -w * PARALLAX],
  );
  const scrim = useTransform(offset, [-w, 0, w], [0.45, 0, 0.45]);

  return (
    <div className="relative h-full w-full shrink-0 overflow-hidden bg-neutral-900">
      <motion.div
        style={
          reduceMotion
            ? undefined
            : {
                x: imageX,
                willChange: "transform",
              }
        }
        className="absolute inset-0"
      >
        <motion.div
          className="relative h-full w-full"
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: isActive ? 1.15 : 1.08,
                }
          }
          transition={{
            duration: SLIDE_TIME / 1000 + 1.5,
            ease: "linear",
          }}
        >
          <Image
            src={resolveImageUrl(banner.image)}
            alt={banner.title}
            fill
            priority={isPriority}
            loading={isPriority ? undefined : "eager"}
            sizes="100vw"
            draggable={false}
            className="pointer-events-none select-none object-cover"
          />
        </motion.div>
      </motion.div>

      {!reduceMotion && (
        <motion.div
          aria-hidden
          style={{ opacity: scrim }}
          className="pointer-events-none absolute inset-0 bg-black"
        />
      )}

      {/* Dark gradient overlay matching requirement: from-black/70 via-black/20 to-transparent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
      />

      {/* Text overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-5 md:p-10 lg:p-12">
        <h2 className="max-w-2xl text-xl font-bold tracking-tight text-white drop-shadow-md sm:text-2xl md:text-4xl lg:text-5xl">
          {banner.title}
        </h2>
        {banner.description && (
          <p className="mt-2 max-w-xl text-xs sm:text-sm md:text-base lg:text-lg text-white/90 drop-shadow-md">
            {banner.description}
          </p>
        )}
      </div>
    </div>
  );
}

export interface HeroBannerCarouselProps {
  banners?: PublicBannerResponse[];
}

export default function HeroBannerCarousel({
  banners: initialBanners,
}: HeroBannerCarouselProps) {
  const [banners, setBanners] = useState<PublicBannerResponse[]>(
    initialBanners || [],
  );
  const [loading, setLoading] = useState(!initialBanners);
  const [error, setError] = useState(false);

  const reduceMotion = useReducedMotion();
  const n = banners.length;

  useEffect(() => {
    if (initialBanners) {
      setBanners(initialBanners);
      setLoading(false);
      return;
    }

    let isMounted = true;
    bannerApi
      .getMainBanners()
      .then((data) => {
        if (isMounted) {
          setBanners(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("[HeroBannerCarousel] Error loading main banners:", err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initialBanners]);

  const slides = useMemo(
    () => (n > 0 ? [...banners, ...banners, ...banners] : []),
    [banners, n],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef(0);
  const [width, setWidth] = useState(0);

  const x = useMotionValue(0);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);

  const [index, setIndex] = useState(n);
  const indexRef = useRef(n);

  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);

  const paused = hovered || dragging || tabHidden;
  const activeDot = n > 0 ? ((index % n) + n) % n : 0;

  useEffect(() => {
    indexRef.current = n;
    setIndex(n);
  }, [n]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const apply = () => {
      const next = el.getBoundingClientRect().width;
      if (!next || next === widthRef.current) return;

      widthRef.current = next;
      setWidth(next);

      controlsRef.current?.stop();
      x.set(-indexRef.current * next);
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);

    return () => observer.disconnect();
  }, [x]);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const goTo = useCallback(
    (target: number) => {
      if (n === 0) return;
      indexRef.current = target;
      setIndex(target);

      controlsRef.current?.stop();

      const w = widthRef.current;
      if (!w) return;

      controlsRef.current = animate(
        x,
        -target * w,
        reduceMotion
          ? { duration: 0 }
          : {
              ...SPRING,
              onComplete: () => {
                if (indexRef.current !== target) return;

                const wrapped = n + ((((target - n) % n) + n) % n);
                if (wrapped === target) return;

                indexRef.current = wrapped;
                setIndex(wrapped);
                x.set(-wrapped * widthRef.current);
              },
            },
      );
    },
    [n, reduceMotion, x],
  );

  const step = useCallback(
    (direction: 1 | -1) => {
      goTo(indexRef.current + direction);
    },
    [goTo],
  );

  const goToDot = useCallback(
    (target: number) => {
      if (n === 0) return;
      const current = ((indexRef.current % n) + n) % n;

      let delta = target - current;
      if (delta > n / 2) delta -= n;
      if (delta < -n / 2) delta += n;

      if (delta === 0) return;
      goTo(indexRef.current + delta);
    },
    [goTo, n],
  );

  useEffect(() => {
    if (reduceMotion || paused || !width || n <= 1) return;

    const timer = window.setTimeout(() => {
      step(1);
    }, SLIDE_TIME);

    return () => {
      window.clearTimeout(timer);
    };
  }, [index, paused, reduceMotion, width, step, n]);

  const onDragStart = () => {
    controlsRef.current?.stop();
    setDragging(true);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    setDragging(false);
    const w = widthRef.current || 1;
    const projected = info.offset.x + info.velocity.x * FLICK_POWER;

    if (projected < -w * STEP_THRESHOLD) {
      step(1);
    } else if (projected > w * STEP_THRESHOLD) {
      step(-1);
    } else {
      goTo(indexRef.current);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  };

  if (loading) {
    return <HeroBannerSkeleton />;
  }

  if (error || n === 0) {
    return null;
  }

  return (
    <section
      aria-label="Hero Banner Section"
      className="relative w-full overflow-hidden pt-6 md:pt-8 lg:pt-10"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        ref={containerRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="FoodHub Hero Promotions"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="
          group
          relative
          container
          mx-auto
          max-w-7xl
          h-[220px]
          sm:h-[300px]
          md:h-[400px]
          lg:h-[500px]
          xl:h-[70vh]
          overflow-hidden
          rounded-2xl
          bg-neutral-900
          md:rounded-3xl
          shadow-lg
          focus-visible:outline-2
          focus-visible:outline-offset-4
          focus-visible:outline-primary-700
        "
      >
        {/* Track */}
        <motion.div
          className="absolute inset-0 flex cursor-grab active:cursor-grabbing"
          style={{
            x,
            touchAction: "pan-y",
            willChange: "transform",
          }}
          drag={reduceMotion || n <= 1 ? false : "x"}
          dragDirectionLock
          dragMomentum={false}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          {slides.map((banner, i) => (
            <CarouselSlide
              key={`${banner.id}-${i}`}
              banner={banner}
              index={i}
              x={x}
              width={width}
              isActive={i === index}
              isPriority={i === n}
              reduceMotion={reduceMotion}
            />
          ))}
        </motion.div>

        {/* Previous Button */}
        {n > 1 && (
          <motion.button
            type="button"
            aria-label="Previous banner"
            onClick={() => step(-1)}
            whileHover={reduceMotion ? undefined : { scale: 1.08 }}
            whileTap={reduceMotion ? undefined : { scale: 0.92 }}
            className="
              absolute
              left-3
              top-1/2
              z-30
              hidden
              h-10
              w-10
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              border
              border-white/20
              bg-black/30
              text-white
              backdrop-blur-md
              opacity-0
              transition-opacity
              duration-300
              hover:bg-black/50
              focus-visible:opacity-100
              group-hover:opacity-100
              md:left-6
              md:flex
            "
          >
            <ChevronLeft className="h-6 w-6" />
          </motion.button>
        )}

        {/* Next Button */}
        {n > 1 && (
          <motion.button
            type="button"
            aria-label="Next banner"
            onClick={() => step(1)}
            whileHover={reduceMotion ? undefined : { scale: 1.08 }}
            whileTap={reduceMotion ? undefined : { scale: 0.92 }}
            className="
              absolute
              right-3
              top-1/2
              z-30
              hidden
              h-10
              w-10
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              border
              border-white/20
              bg-black/30
              text-white
              backdrop-blur-md
              opacity-0
              transition-opacity
              duration-300
              hover:bg-black/50
              focus-visible:opacity-100
              group-hover:opacity-100
              md:right-6
              md:flex
            "
          >
            <ChevronRight className="h-6 w-6" />
          </motion.button>
        )}

        {/* Dot Indicators */}
        {n > 1 && (
          <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 md:bottom-6">
            {banners.map((banner, i) => {
              const isActive = i === activeDot;
              return (
                <button
                  key={banner.id}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={isActive}
                  onClick={() => goToDot(i)}
                  className="group/dot flex h-6 items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <span
                    className={`
                      relative block h-2 overflow-hidden rounded-full transition-all duration-500 ease-out
                      ${
                        isActive
                          ? "w-8 md:w-10 bg-white/30"
                          : "w-2 bg-white/50 group-hover/dot:bg-white/80"
                      }
                    `}
                  >
                    {isActive && (
                      <motion.span
                        key={`${index}-${paused}`}
                        initial={{ scaleX: reduceMotion ? 1 : 0 }}
                        animate={{
                          scaleX: !reduceMotion && paused ? 0 : 1,
                        }}
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : paused
                              ? { duration: 0.35, ease: "easeOut" }
                              : {
                                  duration: SLIDE_TIME / 1000,
                                  ease: "linear",
                                }
                        }
                        className="absolute inset-0 origin-left rounded-full bg-white"
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
