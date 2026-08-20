"use client";

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
} from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface HeroBannerSlide {
  id: string;
  image: string;
  alt: string;
  title: string;
  description?: string | null;
}

const SLIDE_TIME = 5000;

/*
 * Slightly overdamped spring: fast start, zero bounce, long soft settle.
 * This is what a tween can never quite fake.
 */
const SPRING = {
  type: "spring",
  stiffness: 240,
  damping: 34,
  mass: 1,
} as const;

/** how far the image drifts against the slide, as a share of slide width */
const PARALLAX = 0.05;

/** flick projection: velocity is worth this many seconds of travel */
const FLICK_POWER = 0.2;

/** fraction of the slide you must drag (or fling) to change slide */
const STEP_THRESHOLD = 0.18;

/* =========================================================
   SLIDE

   The image sits on its own layer and moves slower than the
   track, so the banner has depth while you drag instead of
   sliding like a flat sheet of paper.
========================================================= */

function Slide({
  banner,
  index,
  x,
  width,
  isActive,
  isPriority,
  reduceMotion,
}: {
  banner: HeroBannerSlide;
  index: number;
  x: MotionValue<number>;
  width: number;
  isActive: boolean;
  isPriority: boolean;
  reduceMotion: boolean | null;
}) {
  // guard against the very first render, before we've measured
  const w = width || 1;

  /** 0 when this slide is centred, +w when it's one slide to the right */
  const offset = useTransform(x, (v) => v + index * w);

  const imageX = useTransform(
    offset,
    [-w, 0, w],
    [w * PARALLAX, 0, -w * PARALLAX],
  );

  /*
   * Dim neighbours with a black scrim, NOT with opacity.
   * A semi-transparent slide lets the page background show through,
   * which is exactly what reads as "gray".
   */
  const scrim = useTransform(offset, [-w, 0, w], [0.45, 0, 0.45]);

  return (
    /*
     * The clip box must NOT move.
     * overflow-hidden on a translated element drags the clip
     * rectangle along with it and opens a gap at the slide edge —
     * that was the gray strip. Clip here, move the layer inside.
     */
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
        {/* slow ken-burns push on the slide you're actually looking at */}
        <motion.div
          className="relative h-full w-full"
          animate={
            reduceMotion
              ? undefined
              : {
                  // base 1.12 = 6% bleed per side, comfortably more
                  // than the 4.5% parallax shift, so no edge is ever
                  // exposed mid-drag
                  scale: isActive ? 1.18 : 1.12,
                }
          }
          transition={{
            duration: SLIDE_TIME / 1000 + 1.5,
            ease: "linear",
          }}
        >
          <Image
            src={banner.image}
            alt={banner.alt}
            fill
            priority={isPriority}
            /*
             * Only 3 unique files, all above the fold. Lazy-loading
             * meant the next banner was still blank when you swiped
             * to it — another source of gray.
             */
            loading={isPriority ? undefined : "eager"}
            sizes="100vw"
            draggable={false}
            className="
              pointer-events-none
              select-none
              object-cover
            "
          />
        </motion.div>
      </motion.div>

      {!reduceMotion && (
        <motion.div
          aria-hidden
          style={{ opacity: scrim }}
          className="
            pointer-events-none
            absolute
            inset-0
            bg-black
          "
        />
      )}

      {/* text overlay, readable over the bottom scrim added by the parent */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          z-20
          p-5
          md:p-10
        "
      >
        <p className="max-w-2xl text-xl font-bold text-white drop-shadow-md md:text-4xl">
          {banner.title}
        </p>
        {banner.description && (
          <p className="mt-2 max-w-xl text-sm text-white/90 drop-shadow-md md:text-lg">
            {banner.description}
          </p>
        )}
      </div>
    </div>
  );
}

export interface BannerCarouselProps {
  banners: HeroBannerSlide[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const reduceMotion = useReducedMotion();

  const n = banners.length;

  /*
   * Three identical copies. We always live in the middle one, so
   * there is real content to drag into on both sides — and because
   * the copies are pixel-identical we can hop between them without
   * anyone seeing it. No "rewind to slide 1" jump.
   */
  const slides = useMemo(
    () => [...banners, ...banners, ...banners],
    [banners],
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
  const activeDot = ((index % n) + n) % n;

  /* ================================
     MEASURE
  ================================= */

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const apply = () => {
      /*
       * getBoundingClientRect, not clientWidth: clientWidth rounds to
       * whole pixels. On a container that lays out at e.g. 1200.5px
       * the rounding error accumulates across slides and leaves a
       * hairline seam between them.
       */
      const next = el.getBoundingClientRect().width;
      if (!next || next === widthRef.current) return;

      widthRef.current = next;
      setWidth(next);

      // re-anchor instantly so a resize never leaves us mid-slide
      controlsRef.current?.stop();
      x.set(-indexRef.current * next);
    };

    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(el);

    return () => observer.disconnect();
  }, [x]);

  /* ================================
     DON'T AUTOPLAY IN A HIDDEN TAB
  ================================= */

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);

    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  /* ================================
     MOVEMENT
  ================================= */

  const goTo = useCallback(
    (target: number) => {
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
                // only normalise if nothing else moved us in the meantime
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

  /** jump to a dot by the shortest route, so it never scrolls the long way */
  const goToDot = useCallback(
    (target: number) => {
      const current = ((indexRef.current % n) + n) % n;

      let delta = target - current;
      if (delta > n / 2) delta -= n;
      if (delta < -n / 2) delta += n;

      if (delta === 0) return;

      goTo(indexRef.current + delta);
    },
    [goTo, n],
  );

  /* ================================
     AUTO PLAY

     Restarts whenever the slide changes or you stop hovering,
     so the dot timer and the actual timer always agree.
  ================================= */

  useEffect(() => {
    if (reduceMotion || paused || !width) return;

    const timer = window.setTimeout(() => {
      step(1);
    }, SLIDE_TIME);

    return () => {
      window.clearTimeout(timer);
    };
  }, [index, paused, reduceMotion, width, step]);

  /* ================================
     DRAG
  ================================= */

  const onDragStart = () => {
    controlsRef.current?.stop();
    setDragging(true);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    setDragging(false);

    const w = widthRef.current || 1;

    // where the swipe would land if we let it coast
    const projected = info.offset.x + info.velocity.x * FLICK_POWER;

    if (projected < -w * STEP_THRESHOLD) {
      step(1);
    } else if (projected > w * STEP_THRESHOLD) {
      step(-1);
    } else {
      // not far enough — spring back to where we were
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

  // The wrapping Server Component hides this section entirely on an empty
  // published-MAIN-banner response; this guard only protects against the
  // n=0 modulo math above being reached if this component is ever reused
  // without that guarantee.
  if (n === 0) {
    return null;
  }

  return (
    <section
      className="
        relative
        w-full
        overflow-hidden
        lg:pt-12.5
          pt-8
      "
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* =====================================
          BANNER AREA
      ====================================== */}

      <div
        ref={containerRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="FoodHub promotions"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="
          group
          relative
          max-w-7xl 
          container 
          
mx-auto
          h-[220px]
          sm:h-[300px]
          md:h-[400px]
          lg:h-[500px]
          xl:h-[85vh]

          overflow-hidden
          rounded-2xl
          bg-neutral-900
          md:rounded-3xl

          focus-visible:outline-2
          focus-visible:outline-offset-4
          focus-visible:outline-primary-700
        "
      >
        {/* =====================================
            TRACK

            One flex row you can actually grab.
            The slide follows your finger 1:1.
        ====================================== */}

        <motion.div
          className="
            absolute
            inset-0
            flex
            cursor-grab
            active:cursor-grabbing
          "
          style={{
            x,
            touchAction: "pan-y",
            willChange: "transform",
          }}
          drag={reduceMotion ? false : "x"}
          dragDirectionLock
          dragMomentum={false}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          {slides.map((banner, i) => (
            <Slide
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

        {/* =====================================
            SUBTLE DARK GRADIENT

            Optional. Helps if your banners
            contain text.
        ====================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-10
            bg-gradient-to-r
            from-black/10
            via-transparent
            to-black/10
          "
        />

        {/* bottom scrim so the controls stay readable on bright photos */}

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            z-10
            h-24
            bg-gradient-to-t
            from-black/35
            to-transparent
          "
        />

        {/* =====================================
            PREVIOUS BUTTON
        ====================================== */}

        <motion.button
          type="button"
          aria-label="Previous banner"
          onClick={() => step(-1)}
          whileHover={reduceMotion ? undefined : { scale: 1.08 }}
          whileTap={reduceMotion ? undefined : { scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="
            absolute
            left-3
            top-1/2
            z-30

            hidden
            h-9
            w-9
            -translate-y-1/2
            items-center
            justify-center

            rounded-full

            border
            border-white/20
            bg-black/25
            text-white
            backdrop-blur-sm

            opacity-0
            transition-opacity
            duration-300

            hover:bg-black/40
            focus-visible:opacity-100
            group-hover:opacity-100

            md:left-6
            md:flex
            md:h-11
            md:w-11
          "
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
        </motion.button>

        {/* =====================================
            NEXT BUTTON
        ====================================== */}

        <motion.button
          type="button"
          aria-label="Next banner"
          onClick={() => step(1)}
          whileHover={reduceMotion ? undefined : { scale: 1.08 }}
          whileTap={reduceMotion ? undefined : { scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="
            absolute
            right-3
            top-1/2
            z-30

            hidden
            h-9
            w-9
            -translate-y-1/2
            items-center
            justify-center

            rounded-full

            border
            border-white/20
            bg-black/25
            text-white
            backdrop-blur-sm

            opacity-0
            transition-opacity
            duration-300

            hover:bg-black/40
            focus-visible:opacity-100
            group-hover:opacity-100

            md:right-6
            md:flex
            md:h-11
            md:w-11
          "
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
        </motion.button>

        {/* =====================================
            DOT INDICATORS

            The active dot doubles as the autoplay
            timer — it drains while the slide is up
            and empties when you hover to pause.
        ====================================== */}

        <div
          className="
            absolute
            bottom-4
            left-1/2
            z-30

            flex
            -translate-x-1/2
            items-center
            gap-2

            md:bottom-6
          "
        >
          {banners.map((banner, i) => {
            const isActive = i === activeDot;

            return (
              <button
                key={banner.id}
                type="button"
                aria-label={`Go to banner ${i + 1}`}
                aria-current={isActive}
                onClick={() => goToDot(i)}
                className="
                  group/dot
                  flex
                  h-6
                  items-center
                  rounded-full

                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-white
                "
              >
                <span
                  className={`
                    relative
                    block
                    h-2
                    overflow-hidden
                    rounded-full

                    transition-all
                    duration-500
                    ease-out

                    ${
                      isActive
                        ? "w-10 bg-white/30"
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
                      className="
                        absolute
                        inset-0
                        origin-left
                        rounded-full
                        bg-white
                      "
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
