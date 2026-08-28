// "use client"

// import * as React from "react"
// import useEmblaCarousel, {
//   type UseEmblaCarouselType,
// } from "embla-carousel-react"

// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"
// import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

// type CarouselApi = UseEmblaCarouselType[1]
// type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
// type CarouselOptions = UseCarouselParameters[0]
// type CarouselPlugin = UseCarouselParameters[1]

// type CarouselProps = {
//   opts?: CarouselOptions
//   plugins?: CarouselPlugin
//   orientation?: "horizontal" | "vertical"
//   setApi?: (api: CarouselApi) => void
// }

// type CarouselContextProps = {
//   carouselRef: ReturnType<typeof useEmblaCarousel>[0]
//   api: ReturnType<typeof useEmblaCarousel>[1]
//   scrollPrev: () => void
//   scrollNext: () => void
//   canScrollPrev: boolean
//   canScrollNext: boolean
// } & CarouselProps

// const CarouselContext = React.createContext<CarouselContextProps | null>(null)

// function useCarousel() {
//   const context = React.useContext(CarouselContext)

//   if (!context) {
//     throw new Error("useCarousel must be used within a <Carousel />")
//   }

//   return context
// }

// function Carousel({
//   orientation = "horizontal",
//   opts,
//   setApi,
//   plugins,
//   className,
//   children,
//   ...props
// }: React.ComponentProps<"div"> & CarouselProps) {
//   const [carouselRef, api] = useEmblaCarousel(
//     {
//       ...opts,
//       axis: orientation === "horizontal" ? "x" : "y",
//     },
//     plugins
//   )
//   const [canScrollPrev, setCanScrollPrev] = React.useState(false)
//   const [canScrollNext, setCanScrollNext] = React.useState(false)

//   const onSelect = React.useCallback((api: CarouselApi) => {
//     if (!api) return
//     setCanScrollPrev(api.canScrollPrev())
//     setCanScrollNext(api.canScrollNext())
//   }, [])

//   const scrollPrev = React.useCallback(() => {
//     api?.scrollPrev()
//   }, [api])

//   const scrollNext = React.useCallback(() => {
//     api?.scrollNext()
//   }, [api])

//   const handleKeyDown = React.useCallback(
//     (event: React.KeyboardEvent<HTMLDivElement>) => {
//       if (event.key === "ArrowLeft") {
//         event.preventDefault()
//         scrollPrev()
//       } else if (event.key === "ArrowRight") {
//         event.preventDefault()
//         scrollNext()
//       }
//     },
//     [scrollPrev, scrollNext]
//   )

//   React.useEffect(() => {
//     if (!api || !setApi) return
//     setApi(api)
//   }, [api, setApi])

//   React.useEffect(() => {
//     if (!api) return
//     onSelect(api)
//     api.on("reInit", onSelect)
//     api.on("select", onSelect)

//     return () => {
//       api?.off("select", onSelect)
//     }
//   }, [api, onSelect])

//   return (
//     <CarouselContext.Provider
//       value={{
//         carouselRef,
//         api: api,
//         opts,
//         orientation:
//           orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
//         scrollPrev,
//         scrollNext,
//         canScrollPrev,
//         canScrollNext,
//       }}
//     >
//       <div
//         onKeyDownCapture={handleKeyDown}
//         className={cn("relative", className)}
//         role="region"
//         aria-roledescription="carousel"
//         data-slot="carousel"
//         {...props}
//       >
//         {children}
//       </div>
//     </CarouselContext.Provider>
//   )
// }

// function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
//   const { carouselRef, orientation } = useCarousel()

//   return (
//     <div
//       ref={carouselRef}
//       className="overflow-hidden"
//       data-slot="carousel-content"
//     >
//       <div
//         className={cn(
//           "flex",
//           orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
//           className
//         )}
//         {...props}
//       />
//     </div>
//   )
// }

// function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
//   const { orientation } = useCarousel()

//   return (
//     <div
//       role="group"
//       aria-roledescription="slide"
//       data-slot="carousel-item"
//       className={cn(
//         "min-w-0 shrink-0 grow-0 basis-full",
//         orientation === "horizontal" ? "pl-4" : "pt-4",
//         className
//       )}
//       {...props}
//     />
//   )
// }

// function CarouselPrevious({
//   className,
//   variant = "outline",
//   size = "icon-sm",
//   ...props
// }: React.ComponentProps<typeof Button>) {
//   const { orientation, scrollPrev, canScrollPrev } = useCarousel()

//   return (
//     <Button
//       data-slot="carousel-previous"
//       variant={variant}
//       size={size}
//       className={cn(
//         "absolute touch-manipulation rounded-full",
//         orientation === "horizontal"
//           ? "inset-y-0 -left-12 my-auto"
//           : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
//         className
//       )}
//       disabled={!canScrollPrev}
//       onClick={scrollPrev}
//       {...props}
//     >
//       <ChevronLeftIcon />
//       <span className="sr-only">Previous slide</span>
//     </Button>
//   )
// }

// function CarouselNext({
//   className,
//   variant = "outline",
//   size = "icon-sm",
//   ...props
// }: React.ComponentProps<typeof Button>) {
//   const { orientation, scrollNext, canScrollNext } = useCarousel()

//   return (
//     <Button
//       data-slot="carousel-next"
//       variant={variant}
//       size={size}
//       className={cn(
//         "absolute touch-manipulation rounded-full",
//         orientation === "horizontal"
//           ? "inset-y-0 -right-12 my-auto"
//           : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
//         className
//       )}
//       disabled={!canScrollNext}
//       onClick={scrollNext}
//       {...props}
//     >
//       <ChevronRightIcon />
//       <span className="sr-only">Next slide</span>
//     </Button>
//   )
// }

// export {
//   type CarouselApi,
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselPrevious,
//   CarouselNext,
//   useCarousel,
// }

// "use client";

// import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import Image from "next/image";

// export type CarouselItem = {
//   id: string | number;

//   image: string;
//   alt: string;

//   name: string;
//   description: string;
//   origin: string;
// };

// type CarouselProps = {
//   items: CarouselItem[];
//   /** fixed gap in px; leave undefined to use the responsive default (16 / 20 / 24) */
//   gap?: number;
//   className?: string;
//   autoPlay?: boolean;
//   autoPlayInterval?: number;
//   autoPlayResumeDelay?: number;
//   pauseOnHover?: boolean;
//   /** loop seamlessly back to the first slide after the last (default: true) */
//   loop?: boolean;
//   /** show the prev/next arrows on phones too (default: false — swipe instead) */
//   showArrowsOnMobile?: boolean;
// };

// export default function Carousel({
//   items,
//   gap,
//   className = "",
//   autoPlay = false,
//   autoPlayInterval = 3000,
//   autoPlayResumeDelay = 3000,
//   pauseOnHover = true,
//   loop = true,
//   showArrowsOnMobile = false,
// }: CarouselProps) {
//   const trackRef = useRef<HTMLDivElement>(null);
//   const dragMoved = useRef(false);
//   const rafId = useRef<number | null>(null);
//   const pendingX = useRef<number | null>(null);
//   const dragState = useRef({
//     dragging: false,
//     startX: 0,
//     startScrollLeft: 0,
//     lastX: 0,
//     lastTime: 0,
//     velocity: 0,
//   });
//   const pausedUntilRef = useRef(0);
//   const lastAdvanceRef = useRef(0);
//   const hoveredRef = useRef(false);
//   const activeIndexRef = useRef(0);
//   const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   // where a smooth scroll is currently heading, so rapid arrow clicks stack
//   const targetIndexRef = useRef<{ index: number; at: number }>({
//     index: 0,
//     at: 0,
//   });

//   const [canPrev, setCanPrev] = useState(false);
//   const [canNext, setCanNext] = useState(true);
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [isDragging, setIsDragging] = useState(false);
//   const [reduceMotion, setReduceMotion] = useState(false);

//   const n = items.length;
//   const isLooping = loop && n > 1;

//   useEffect(() => {
//     const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
//     const update = () => setReduceMotion(mq.matches);
//     update();
//     mq.addEventListener("change", update);
//     return () => mq.removeEventListener("change", update);
//   }, []);

//   // Three back-to-back copies of the items so we can always keep the
//   // visible scroll position inside the "real" (middle) copy, and jump
//   // invisibly between copies since they're pixel-identical.
//   const displayItems = useMemo(
//     () => (isLooping ? [...items, ...items, ...items] : items),
//     [items, isLooping],
//   );

//   const pauseAutoPlay = useCallback(() => {
//     const resumeAt = performance.now() + autoPlayResumeDelay;
//     pausedUntilRef.current = resumeAt;
//     lastAdvanceRef.current = resumeAt;
//   }, [autoPlayResumeDelay]);

//   // Once scrolling has settled, if we've drifted into the first or third
//   // copy, silently reposition to the equivalent card in the middle copy.
//   const normalizeLoop = useCallback(() => {
//     const el = trackRef.current;

//     if (!el || !isLooping || dragState.current.dragging) return;

//     const cardEls = Array.from(el.children) as HTMLElement[];
//     const currentIndex = activeIndexRef.current;

//     let normalizedIndex: number | null = null;

//     // First copy -> middle copy
//     if (currentIndex < n) {
//       normalizedIndex = currentIndex + n;
//     }

//     // Third copy -> middle copy
//     if (currentIndex >= n * 2) {
//       normalizedIndex = currentIndex - n;
//     }

//     if (normalizedIndex === null) return;

//     const target = cardEls[normalizedIndex];
//     if (!target) return;

//     // Important: reposition instantly without animating backward.
//     const previousScrollBehavior = el.style.scrollBehavior;
//     el.style.scrollBehavior = "auto";
//     el.scrollLeft = target.offsetLeft;

//     activeIndexRef.current = normalizedIndex;
//     targetIndexRef.current = {
//       index: normalizedIndex,
//       at: 0,
//     };

//     requestAnimationFrame(() => {
//       if (trackRef.current) {
//         trackRef.current.style.scrollBehavior = previousScrollBehavior;
//       }
//     });
//   }, [isLooping, n]);

//   const updateArrows = useCallback(() => {
//     const el = trackRef.current;
//     if (!el) return;

//     if (isLooping) {
//       setCanPrev(true);
//       setCanNext(true);
//     } else {
//       setCanPrev(el.scrollLeft > 4);
//       setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
//     }

//     const cardEls = Array.from(el.children) as HTMLElement[];
//     let closest = 0;
//     let closestDist = Infinity;
//     cardEls.forEach((card, i) => {
//       const dist = Math.abs(card.offsetLeft - el.scrollLeft);
//       if (dist < closestDist) {
//         closestDist = dist;
//         closest = i;
//       }
//     });
//     activeIndexRef.current = closest;

//     const dotIndex = isLooping ? ((closest % n) + n) % n : closest;
//     setActiveIndex(dotIndex);

//     // debounce: only normalize once scrolling has actually stopped
//     if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);
//     settleTimeoutRef.current = setTimeout(() => {
//       normalizeLoop();
//     }, 120);
//   }, [isLooping, n, normalizeLoop]);

//   // initial mount: center inside the middle copy so both directions
//   // have somewhere to scroll into immediately
//   useEffect(() => {
//     const el = trackRef.current;
//     if (!el) return;

//     if (isLooping) {
//       const cardEls = Array.from(el.children) as HTMLElement[];
//       const target = cardEls[n];
//       if (target) {
//         el.scrollLeft = target.offsetLeft;
//         activeIndexRef.current = n;
//         targetIndexRef.current = { index: n, at: 0 };
//       }
//     }

//     updateArrows();
//     el.addEventListener("scroll", updateArrows, { passive: true });
//     window.addEventListener("resize", updateArrows);
//     return () => {
//       el.removeEventListener("scroll", updateArrows);
//       window.removeEventListener("resize", updateArrows);
//       if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);
//     };
//   }, [updateArrows, isLooping, n]);

//   // card widths change at every breakpoint — re-align to the active card
//   // after a resize so we never rest half-way between two slides
//   useEffect(() => {
//     const el = trackRef.current;
//     if (!el) return;
//     let t: ReturnType<typeof setTimeout>;
//     const onResize = () => {
//       clearTimeout(t);
//       t = setTimeout(() => {
//         const cardEls = Array.from(el.children) as HTMLElement[];
//         const card = cardEls[activeIndexRef.current];
//         if (card) el.scrollLeft = card.offsetLeft;
//       }, 150);
//     };
//     window.addEventListener("resize", onResize);
//     return () => {
//       window.removeEventListener("resize", onResize);
//       clearTimeout(t);
//     };
//   }, []);

//   useEffect(() => {
//     return () => {
//       if (rafId.current != null) cancelAnimationFrame(rafId.current);
//     };
//   }, []);

//   const goToIndex = useCallback(
//     (index: number) => {
//       const el = trackRef.current;
//       if (!el) return;
//       const cardEls = Array.from(el.children) as HTMLElement[];
//       if (cardEls.length === 0) return;
//       const clamped = Math.max(0, Math.min(index, cardEls.length - 1));
//       targetIndexRef.current = { index: clamped, at: performance.now() };
//       el.scrollTo({
//         left: cardEls[clamped].offsetLeft,
//         behavior: reduceMotion ? "auto" : "smooth",
//       });
//     },
//     [reduceMotion],
//   );

//   // base index for the next step: the in-flight target if a smooth scroll
//   // is still running, otherwise wherever we actually are
//   const stepBase = useCallback(() => {
//     const { index, at } = targetIndexRef.current;
//     return performance.now() - at < 500 ? index : activeIndexRef.current;
//   }, []);

//   const advance = useCallback(() => {
//     const el = trackRef.current;
//     if (!el) return;
//     const cardEls = Array.from(el.children) as HTMLElement[];
//     if (cardEls.length === 0) return;

//     if (isLooping) {
//       // extended list + normalizeLoop keeps this safe indefinitely
//       goToIndex(stepBase() + 1);
//     } else {
//       const isAtEnd = activeIndexRef.current >= cardEls.length - 1;
//       if (!isAtEnd) goToIndex(stepBase() + 1);
//     }
//   }, [goToIndex, isLooping, stepBase]);

//   useEffect(() => {
//     if (!autoPlay || reduceMotion) return;

//     const CHECK_INTERVAL = 200;
//     let timeoutId: ReturnType<typeof setTimeout>;
//     lastAdvanceRef.current = performance.now();

//     const tick = () => {
//       const now = performance.now();
//       const isPaused =
//         dragState.current.dragging ||
//         (pauseOnHover && hoveredRef.current) ||
//         document.hidden ||
//         now < pausedUntilRef.current;

//       if (!isPaused && now - lastAdvanceRef.current >= autoPlayInterval) {
//         advance();
//         lastAdvanceRef.current = now;
//       }
//       timeoutId = setTimeout(tick, CHECK_INTERVAL);
//     };

//     timeoutId = setTimeout(tick, CHECK_INTERVAL);
//     return () => clearTimeout(timeoutId);
//   }, [autoPlay, autoPlayInterval, pauseOnHover, advance, reduceMotion]);

//   // step by one card, measured from the DOM so it stays correct at every
//   // breakpoint regardless of what the gap resolves to
//   const scrollByCard = (direction: 1 | -1) => {
//     pauseAutoPlay();
//     goToIndex(stepBase() + direction);
//   };

//   const scrollToIndex = (index: number) => {
//     pauseAutoPlay();
//     const base = isLooping ? Math.floor(stepBase() / n) * n : 0;
//     goToIndex(base + index);
//   };

//   const snapToNearest = useCallback(() => {
//     const el = trackRef.current;
//     if (!el) return;
//     const cardEls = Array.from(el.children) as HTMLElement[];
//     let closest = 0;
//     let closestDist = Infinity;
//     cardEls.forEach((card, i) => {
//       const dist = Math.abs(card.offsetLeft - el.scrollLeft);
//       if (dist < closestDist) {
//         closestDist = dist;
//         closest = i;
//       }
//     });
//     targetIndexRef.current = { index: closest, at: performance.now() };
//     el.scrollTo({
//       left: cardEls[closest]?.offsetLeft ?? 0,
//       behavior: "smooth",
//     });
//   }, []);

//   const onPointerDown = (e: React.PointerEvent) => {
//     const el = trackRef.current;
//     if (!el) return;
//     if (rafId.current != null) {
//       cancelAnimationFrame(rafId.current);
//       rafId.current = null;
//     }
//     const state = dragState.current;
//     state.dragging = true;
//     state.startX = e.clientX;
//     state.startScrollLeft = el.scrollLeft;
//     state.lastX = e.clientX;
//     state.lastTime = performance.now();
//     state.velocity = 0;
//     dragMoved.current = false;
//     el.setPointerCapture(e.pointerId);
//     setIsDragging(true);
//     pauseAutoPlay();
//   };

//   const onPointerMove = (e: React.PointerEvent) => {
//     const state = dragState.current;
//     if (!state.dragging || !trackRef.current) return;

//     const now = performance.now();
//     const dt = now - state.lastTime;
//     if (dt > 0) {
//       const instant = (e.clientX - state.lastX) / dt;
//       state.velocity = state.velocity * 0.7 + instant * 0.3;
//     }
//     state.lastX = e.clientX;
//     state.lastTime = now;

//     const delta = e.clientX - state.startX;
//     if (Math.abs(delta) > 4) dragMoved.current = true;
//     pendingX.current = state.startScrollLeft - delta;

//     if (rafId.current == null) {
//       rafId.current = requestAnimationFrame(() => {
//         rafId.current = null;
//         if (pendingX.current != null && trackRef.current) {
//           trackRef.current.scrollLeft = pendingX.current;
//         }
//       });
//     }
//   };

//   const endDrag = (e: React.PointerEvent) => {
//     const el = trackRef.current;
//     const state = dragState.current;
//     if (!el || !state.dragging) return;
//     state.dragging = false;
//     setIsDragging(false);
//     pauseAutoPlay();
//     try {
//       el.releasePointerCapture(e.pointerId);
//     } catch {
//       /* noop */
//     }

//     if (rafId.current != null) {
//       cancelAnimationFrame(rafId.current);
//       rafId.current = null;
//     }

//     let velocity = state.velocity * 16;
//     const friction = 0.94;

//     const glide = () => {
//       const track = trackRef.current;
//       if (!track) return;
//       velocity *= friction;
//       track.scrollLeft -= velocity;
//       if (Math.abs(velocity) > 0.4) {
//         rafId.current = requestAnimationFrame(glide);
//       } else {
//         rafId.current = null;
//         snapToNearest();
//       }
//     };

//     if (Math.abs(velocity) > 1.5) {
//       rafId.current = requestAnimationFrame(glide);
//     } else {
//       snapToNearest();
//     }
//   };

//   const onClickCapture = (e: React.MouseEvent) => {
//     if (dragMoved.current) {
//       e.preventDefault();
//       e.stopPropagation();
//     }
//   };

//   const onKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "ArrowRight") {
//       e.preventDefault();
//       scrollByCard(1);
//     } else if (e.key === "ArrowLeft") {
//       e.preventDefault();
//       scrollByCard(-1);
//     }
//   };

//   const arrowBase = `${
//     showArrowsOnMobile ? "flex" : "hidden sm:flex"
//   } absolute top-1/2 -translate-y-1/2 z-10
//      h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-full
//      bg-white/90 backdrop-blur-sm shadow-md border border-gray-200
//      text-gray-700 dark:text-gray-100 hover:bg-white
//      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700
//      disabled:opacity-0 disabled:pointer-events-none transition-opacity`;

//   return (
//     <div className={`mx-auto w-full max-w-7xl  ${className}`}>
//       <div
//         className="relative z-0"
//         onMouseEnter={() => {
//           hoveredRef.current = true;
//         }}
//         onMouseLeave={() => {
//           hoveredRef.current = false;
//         }}
//       >
//         <button
//           type="button"
//           aria-label="Previous slide"
//           onClick={() => scrollByCard(-1)}
//           disabled={!canPrev}
//           className={`${arrowBase} left-2 min-[1360px]:-left-5`}
//         >
//           <ChevronIcon direction="left" />
//         </button>

//         <div
//           ref={trackRef}
//           role="region"
//           aria-roledescription="carousel"
//           aria-label="Featured items"
//           tabIndex={0}
//           onKeyDown={onKeyDown}
//           onPointerDown={onPointerDown}
//           onPointerMove={onPointerMove}
//           onPointerUp={endDrag}
//           onPointerLeave={endDrag}
//           onClickCapture={onClickCapture}
//           className={`flex overflow-x-auto select-none rounded-2xl
//                      gap-4 sm:gap-5 lg:gap-6
//                      focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-700
//                      [scrollbar-width:none] [-ms-overflow-style:none]
//                      [&::-webkit-scrollbar]:hidden
//                      ${isDragging ? "cursor-grabbing" : "cursor-grab scroll-smooth"}
//                      ${isDragging ? "" : "snap-x snap-mandatory"}`}
//           style={{
//             ...(gap != null ? { gap: `${gap}px` } : null),
//             scrollPaddingLeft: 0,
//             touchAction: "pan-y",
//             overscrollBehaviorX: "contain",
//           }}
//         >
//           {displayItems.map((item, idx) => (
//             <div
//               key={`${item.id}-${idx}`}
//               className="
//       snap-start
//       shrink-0
//       basis-[88%]
//       sm:basis-[70%]
//       lg:basis-[calc(50%-12px)]
//     "
//             >
//               <div
//                 className="
//         group
//         relative
//         w-full
//         overflow-hidden
//         rounded-xl
//         bg-gray-100
//         aspect-[16/9]
//         sm:aspect-[2/1]
//         sm:rounded-2xl
//         lg:aspect-auto
//         lg:h-75
//       "
//               >
//                 {/* IMAGE */}
//                 <Image
//                   src={item.image}
//                   alt={item.alt}
//                   fill
//                   draggable={false}
//                   className="
//           pointer-events-none
//           object-cover
//           transition-transform
//           duration-700
//           ease-out
//           group-hover:scale-[1.06]
//         "
//                   sizes="
//           (max-width: 640px) 88vw,
//           (max-width: 1024px) 70vw,
//           50vw
//         "
//                   priority={false}
//                 />

//                 {/* DARK GRADIENT */}
//                 <div
//                   className="
//           pointer-events-none
//           absolute
//           inset-0
//           bg-gradient-to-t
//           from-black/85
//           via-black/30
//           to-transparent
//           opacity-0
//           transition-opacity
//           duration-500
//           group-hover:opacity-100
//         "
//                 />

//                 {/* FOOD INFORMATION */}
//                 <div
//                   className="
//           pointer-events-none
//           absolute
//           inset-x-0
//           bottom-0
//           z-10
//           translate-y-6
//           p-5
//           opacity-0
//           transition-all
//           duration-500
//           ease-out
//           group-hover:translate-y-0
//           group-hover:opacity-100
//           sm:p-6
//           lg:p-7
//         "
//                 >
//                   {/* ORIGIN */}
//                   <div className="mb-3">
//                     <span
//                       className="
//               inline-flex
//               items-center
//               gap-1.5
//               rounded-full
//               border
//               border-white/20
//               bg-white/15
//               px-3
//               py-1.5
//               text-sm
//               font-medium
//               text-white
//               backdrop-blur-md
//             "
//                     >
//                       <svg
//                         viewBox="0 0 24 24"
//                         fill="none"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         className="h-4 w-4"
//                         aria-hidden="true"
//                       >
//                         <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
//                         <circle cx="12" cy="10" r="2.5" />
//                       </svg>

//                       {item.origin}
//                     </span>
//                   </div>

//                   {/* FOOD NAME */}
//                   <h3
//                     className="
//             text-xl
//             font-semibold
//             text-white
//             sm:text-2xl
//             lg:text-[28px]
//           "
//                   >
//                     {item.name}
//                   </h3>

//                   {/* DESCRIPTION */}
//                   <p
//                     className="
//             mt-2
//             line-clamp-2
//             max-w-xl
//             text-[17px]
//             leading-6
//             text-white/80
//             sm:text-base
//             sm:leading-7
//           "
//                   >
//                     {item.description}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         <button
//           type="button"
//           aria-label="Next slide"
//           onClick={() => scrollByCard(1)}
//           disabled={!canNext}
//           className={`${arrowBase} right-2  min-[1360px]:-right-5`}
//         >
//           <ChevronIcon direction="right" />
//         </button>
//       </div>

//       <div className="mt-3 lg:mt-4 flex flex-wrap justify-center">
//         {items.map((item, i) => (
//           <button
//             key={item.id}
//             type="button"
//             aria-label={`Go to slide ${i + 1}`}
//             aria-current={activeIndex === i}
//             onClick={() => scrollToIndex(i)}
//             className="p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 rounded-full"
//           >
//             <span
//               className={`block h-2 rounded-full transition-all ${
//                 activeIndex === i ? "w-6 bg-primary-700" : "w-2 bg-gray-300"
//               }`}
//             />
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }

// function ChevronIcon({ direction }: { direction: "left" | "right" }) {
//   return (
//     <div className="dark:text-black">
//       <svg
//         width="20"
//         height="20"
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth="2"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         className={direction === "left" ? "" : "rotate-180"}
//         aria-hidden="true"
//       >
//         <polyline points="15 18 9 12 15 6" />
//       </svg>
//     </div>
//   );
// }

// export const slides: CarouselItem[] = [
//   {
//     id: 1,
//     image: "/Image/carousel/food1.jpeg",
//     alt: "Grilled chicken combo with dipping sauces",
//     name: "អាម៉ុកត្រី",
//     description:
//       "ត្រីស្រស់ចម្អិនជាមួយគ្រឿងអាម៉ុក និងខ្ទិះដូង ឈ្ងុយឆ្ងាញ់បែបខ្មែរ",
//     origin: "សៀមរាប",
//   },
//   {
//     id: 2,
//     image: "/Image/carousel/food2.jpg",
//     alt: "Fried chicken special combo with fries and coke",
//     name: "ក្តាមឆាម្រេចកំពត",
//     description: "ក្តាមស្រស់ឆាជាមួយម្រេចកំពត ក្លិនឈ្ងុយ និងរសជាតិហឹរឆ្ងាញ់",
//     origin: "កំពត",
//   },
//   {
//     id: 3,
//     image: "/Image/carousel/food3.avif",
//     alt: "Chicken burger combo",
//     name: "គុយទាវ",
//     description: "គុយទាវទឹកស៊ុបក្តៅឈ្ងុយ ជាមួយសាច់ និងបន្លែស្រស់",
//     origin: "ភ្នំពញ",
//   },
//   {
//     id: 4,
//     image: "/Image/carousel/food4.jpg",
//     alt: "Family sharing platter",
//     name: "បាញ់ឆែវ",
//     description: "បាញ់ឆែវស្រួយ ស្នូលសាច់ និងសណ្ដែកបណ្ដុះ ញ៉ាំជាមួយបន្លែស្រស់",
//     origin: "ព្រែវែង",
//   },
//   {
//     id: 5,
//     image: "/Image/carousel/food5.jpg",
//     alt: "Family sharing platter",
//     name: "បង្កងប៉ាក",
//     description: "បង្កងប៉ាកស្រស់ចម្អិនជាមួយគ្រឿងរសជាតិខ្មែរ ឈ្ងុយ និងផ្អែមសាច់",
//     origin: "ក្រុងព្រះសីហនុ",
//   },
//   {
//     id: 6,
//     image: "/Image/carousel/food6.jpg",
//     alt: "Family sharing platter",
//     name: "ត្រីដុត",
//     description: "ត្រីស្រស់ដុតឈ្ងុយ សាច់ទន់ផ្អែម ញ៉ាំជាមួយទឹកជ្រលក់ខ្មែរ",
//     origin: "ក្រចេះ",
//   },
//   {
//     id: 7,
//     image: "/Image/carousel/food7.png",
//     alt: "Family sharing platter",
//     name: "សម្លរប្រូង",
//     description:
//       "សម្លរបែបប្រពៃណីខ្មែរ មានរសជាតិឈ្ងុយឆ្ងាញ់ និងគ្រឿងផ្សំធម្មជាតិ",
//     origin: "មណ្ឌលគិរី",
//   },
//   {
//     id: 8,
//     image: "/Image/carousel/food11.jpg",
//     alt: "Family sharing platter",
//     name: "មាន់អាំងខ្ទឹមស",
//     description: "មាន់អាំងខ្ទឹមសក្លិនឈ្ងុយ សាច់ទន់ និងរសជាតិចូលគ្រឿង",
//     origin: "បាត់ដំបង",
//   },
//   {
//     id: 9,
//     image: "/Image/carousel/food9.webp",
//     alt: "Family sharing platter",
//     name: " ប្រហុកខ្ទិះ",
//     description: "ប្រហុកខ្ទិះខ្មែរ រសជាតិខាប់ឈ្ងុយ ញ៉ាំជាមួយបន្លែស្រស់",
//     origin: "កំពង់ធំ",
//   },
//   {
//     id: 10,
//     image: "/Image/carousel/food10.jpg",
//     alt: "Family sharing platter",
//     name: "នំអាកោត្នោត",
//     description: "នំអាកោត្នោតទន់ផ្អែម មានក្លិនត្នោតឈ្ងុយបែបបង្អែមខ្មែរ",
//     origin: "សៀមរាប",
//   },
// ];

//new responsive

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

/* =========================================================
   TYPES
========================================================= */

export type CarouselItem = {
  id: string | number;

  image: string;
  alt: string;

  name: string;
  description: string;
  origin: string;
};

type CarouselProps = {
  items: CarouselItem[];

  /**
   * Fixed gap in px.
   * Leave undefined to use responsive defaults.
   *
   * Mobile: 16px
   * Tablet: 20px
   * Desktop: 24px
   */
  gap?: number;

  className?: string;

  autoPlay?: boolean;
  autoPlayInterval?: number;
  autoPlayResumeDelay?: number;

  pauseOnHover?: boolean;

  /**
   * Loop seamlessly back to the first slide
   * after the last slide.
   *
   * Default: true
   */
  loop?: boolean;

  /**
   * Show previous/next arrows on phones too.
   *
   * Default: false
   *
   * Phones normally use swipe.
   * Tablet and desktop show arrows automatically.
   */
  showArrowsOnMobile?: boolean;
};

/* =========================================================
   CAROUSEL
========================================================= */

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
  /* =======================================================
     REFS
  ======================================================= */

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

  /**
   * Where a smooth scroll is currently heading.
   *
   * This allows rapid arrow clicks to stack correctly.
   */
  const targetIndexRef = useRef<{
    index: number;
    at: number;
  }>({
    index: 0,
    at: 0,
  });

  /* =======================================================
     STATE
  ======================================================= */

  const [canPrev, setCanPrev] = useState(false);

  const [canNext, setCanNext] = useState(true);

  const [activeIndex, setActiveIndex] = useState(0);

  const [isDragging, setIsDragging] = useState(false);

  const [reduceMotion, setReduceMotion] = useState(false);

  /* =======================================================
     BASIC VALUES
  ======================================================= */

  const n = items.length;

  const isLooping = loop && n > 1;

  /* =======================================================
     REDUCED MOTION
  ======================================================= */

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      setReduceMotion(mediaQuery.matches);
    };

    update();

    mediaQuery.addEventListener("change", update);

    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  /* =======================================================
     DISPLAY ITEMS FOR INFINITE LOOP

     Three copies are rendered:

     COPY 1
     COPY 2 ← normal visible copy
     COPY 3

     When the carousel enters copy 1 or copy 3,
     it silently moves back to the same card in copy 2.
  ======================================================= */

  const displayItems = useMemo(
    () => (isLooping ? [...items, ...items, ...items] : items),
    [items, isLooping],
  );

  /* =======================================================
     PAUSE AUTOPLAY
  ======================================================= */

  const pauseAutoPlay = useCallback(() => {
    const resumeAt = performance.now() + autoPlayResumeDelay;

    pausedUntilRef.current = resumeAt;

    lastAdvanceRef.current = resumeAt;
  }, [autoPlayResumeDelay]);

  /* =======================================================
     NORMALIZE INFINITE LOOP
  ======================================================= */

  const normalizeLoop = useCallback(() => {
    const element = trackRef.current;

    if (!element || !isLooping || dragState.current.dragging) {
      return;
    }

    const cardElements = Array.from(element.children) as HTMLElement[];

    const currentIndex = activeIndexRef.current;

    let normalizedIndex: number | null = null;

    /* -----------------------------------------------------
       First copy → middle copy
    ----------------------------------------------------- */

    if (currentIndex < n) {
      normalizedIndex = currentIndex + n;
    }

    /* -----------------------------------------------------
       Third copy → middle copy
    ----------------------------------------------------- */

    if (currentIndex >= n * 2) {
      normalizedIndex = currentIndex - n;
    }

    if (normalizedIndex === null) {
      return;
    }

    const target = cardElements[normalizedIndex];

    if (!target) {
      return;
    }

    /**
     * Reposition instantly.
     *
     * No animation should be visible to the user.
     */

    const previousScrollBehavior = element.style.scrollBehavior;

    element.style.scrollBehavior = "auto";

    element.scrollLeft = target.offsetLeft;

    activeIndexRef.current = normalizedIndex;

    targetIndexRef.current = {
      index: normalizedIndex,
      at: 0,
    };

    requestAnimationFrame(() => {
      if (trackRef.current) {
        trackRef.current.style.scrollBehavior = previousScrollBehavior;
      }
    });
  }, [isLooping, n]);

  /* =======================================================
     UPDATE ARROWS + ACTIVE DOT
  ======================================================= */

  const updateArrows = useCallback(() => {
    const element = trackRef.current;

    if (!element) {
      return;
    }

    /* -----------------------------------------------------
       ARROW STATE
    ----------------------------------------------------- */

    if (isLooping) {
      setCanPrev(true);
      setCanNext(true);
    } else {
      setCanPrev(element.scrollLeft > 4);

      setCanNext(
        element.scrollLeft < element.scrollWidth - element.clientWidth - 4,
      );
    }

    /* -----------------------------------------------------
       FIND CLOSEST CARD
    ----------------------------------------------------- */

    const cardElements = Array.from(element.children) as HTMLElement[];

    let closest = 0;
    let closestDistance = Infinity;

    cardElements.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - element.scrollLeft);

      if (distance < closestDistance) {
        closestDistance = distance;
        closest = index;
      }
    });

    activeIndexRef.current = closest;

    /* -----------------------------------------------------
       DOT INDEX
    ----------------------------------------------------- */

    const dotIndex = isLooping ? ((closest % n) + n) % n : closest;

    setActiveIndex(dotIndex);

    /* -----------------------------------------------------
       NORMALIZE AFTER SCROLL SETTLES
    ----------------------------------------------------- */

    if (settleTimeoutRef.current) {
      clearTimeout(settleTimeoutRef.current);
    }

    settleTimeoutRef.current = setTimeout(() => {
      normalizeLoop();
    }, 120);
  }, [isLooping, n, normalizeLoop]);

  /* =======================================================
     INITIAL POSITION
  ======================================================= */

  useEffect(() => {
    const element = trackRef.current;

    if (!element) {
      return;
    }

    /**
     * Start inside the middle copy.
     */

    if (isLooping) {
      const cardElements = Array.from(element.children) as HTMLElement[];

      const target = cardElements[n];

      if (target) {
        element.scrollLeft = target.offsetLeft;

        activeIndexRef.current = n;

        targetIndexRef.current = {
          index: n,
          at: 0,
        };
      }
    }

    updateArrows();

    element.addEventListener("scroll", updateArrows, {
      passive: true,
    });

    window.addEventListener("resize", updateArrows);

    return () => {
      element.removeEventListener("scroll", updateArrows);

      window.removeEventListener("resize", updateArrows);

      if (settleTimeoutRef.current) {
        clearTimeout(settleTimeoutRef.current);
      }
    };
  }, [updateArrows, isLooping, n]);

  /* =======================================================
     RESPONSIVE RESIZE REALIGNMENT

     Card widths are different for:

     Mobile
     Tablet
     Desktop

     After resize, align the current active card again.
  ======================================================= */

  useEffect(() => {
    const element = trackRef.current;

    if (!element) {
      return;
    }

    let timeout: ReturnType<typeof setTimeout> | undefined;

    const onResize = () => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        const cardElements = Array.from(element.children) as HTMLElement[];

        const card = cardElements[activeIndexRef.current];

        if (card) {
          element.scrollLeft = card.offsetLeft;
        }
      }, 150);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);

      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  /* =======================================================
     CLEAN ANIMATION FRAME
  ======================================================= */

  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  /* =======================================================
     GO TO INDEX
  ======================================================= */

  const goToIndex = useCallback(
    (index: number) => {
      const element = trackRef.current;

      if (!element) {
        return;
      }

      const cardElements = Array.from(element.children) as HTMLElement[];

      if (cardElements.length === 0) {
        return;
      }

      const clamped = Math.max(0, Math.min(index, cardElements.length - 1));

      targetIndexRef.current = {
        index: clamped,
        at: performance.now(),
      };

      element.scrollTo({
        left: cardElements[clamped].offsetLeft,

        behavior: reduceMotion ? "auto" : "smooth",
      });
    },
    [reduceMotion],
  );

  /* =======================================================
     CURRENT STEP BASE

     If a smooth scroll is already running,
     use its target instead of the old current position.
  ======================================================= */

  const stepBase = useCallback(() => {
    const { index, at } = targetIndexRef.current;

    return performance.now() - at < 500 ? index : activeIndexRef.current;
  }, []);

  /* =======================================================
     AUTOPLAY ADVANCE
  ======================================================= */

  const advance = useCallback(() => {
    const element = trackRef.current;

    if (!element) {
      return;
    }

    const cardElements = Array.from(element.children) as HTMLElement[];

    if (cardElements.length === 0) {
      return;
    }

    if (isLooping) {
      goToIndex(stepBase() + 1);

      return;
    }

    const isAtEnd = activeIndexRef.current >= cardElements.length - 1;

    if (!isAtEnd) {
      goToIndex(stepBase() + 1);
    }
  }, [goToIndex, isLooping, stepBase]);

  /* =======================================================
     AUTOPLAY
  ======================================================= */

  useEffect(() => {
    if (!autoPlay || reduceMotion) {
      return;
    }

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

    return () => {
      clearTimeout(timeoutId);
    };
  }, [autoPlay, autoPlayInterval, pauseOnHover, advance, reduceMotion]);

  /* =======================================================
     SCROLL ONE CARD
  ======================================================= */

  const scrollByCard = (direction: 1 | -1) => {
    pauseAutoPlay();

    goToIndex(stepBase() + direction);
  };

  /* =======================================================
     DOT NAVIGATION
  ======================================================= */

  const scrollToIndex = (index: number) => {
    pauseAutoPlay();

    const base = isLooping ? Math.floor(stepBase() / n) * n : 0;

    goToIndex(base + index);
  };

  /* =======================================================
     SNAP TO NEAREST CARD
  ======================================================= */

  const snapToNearest = useCallback(() => {
    const element = trackRef.current;

    if (!element) {
      return;
    }

    const cardElements = Array.from(element.children) as HTMLElement[];

    let closest = 0;

    let closestDistance = Infinity;

    cardElements.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - element.scrollLeft);

      if (distance < closestDistance) {
        closestDistance = distance;

        closest = index;
      }
    });

    targetIndexRef.current = {
      index: closest,
      at: performance.now(),
    };

    element.scrollTo({
      left: cardElements[closest]?.offsetLeft ?? 0,

      behavior: "smooth",
    });
  }, []);

  /* =======================================================
     POINTER DOWN
  ======================================================= */

  const onPointerDown = (event: React.PointerEvent) => {
    const element = trackRef.current;

    if (!element) {
      return;
    }

    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);

      rafId.current = null;
    }

    const state = dragState.current;

    state.dragging = true;

    state.startX = event.clientX;

    state.startScrollLeft = element.scrollLeft;

    state.lastX = event.clientX;

    state.lastTime = performance.now();

    state.velocity = 0;

    dragMoved.current = false;

    element.setPointerCapture(event.pointerId);

    setIsDragging(true);

    pauseAutoPlay();
  };

  /* =======================================================
     POINTER MOVE
  ======================================================= */

  const onPointerMove = (event: React.PointerEvent) => {
    const state = dragState.current;

    if (!state.dragging || !trackRef.current) {
      return;
    }

    const now = performance.now();

    const deltaTime = now - state.lastTime;

    if (deltaTime > 0) {
      const instantVelocity = (event.clientX - state.lastX) / deltaTime;

      state.velocity = state.velocity * 0.7 + instantVelocity * 0.3;
    }

    state.lastX = event.clientX;

    state.lastTime = now;

    const delta = event.clientX - state.startX;

    if (Math.abs(delta) > 4) {
      dragMoved.current = true;
    }

    pendingX.current = state.startScrollLeft - delta;

    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;

        if (pendingX.current !== null && trackRef.current) {
          trackRef.current.scrollLeft = pendingX.current;
        }
      });
    }
  };

  /* =======================================================
     END DRAG
  ======================================================= */

  const endDrag = (event: React.PointerEvent) => {
    const element = trackRef.current;

    const state = dragState.current;

    if (!element || !state.dragging) {
      return;
    }

    state.dragging = false;

    setIsDragging(false);

    pauseAutoPlay();

    try {
      element.releasePointerCapture(event.pointerId);
    } catch {
      /* noop */
    }

    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);

      rafId.current = null;
    }

    let velocity = state.velocity * 16;

    const friction = 0.94;

    const glide = () => {
      const track = trackRef.current;

      if (!track) {
        return;
      }

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

  /* =======================================================
     PREVENT CLICK AFTER DRAG
  ======================================================= */

  const onClickCapture = (event: React.MouseEvent) => {
    if (dragMoved.current) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  /* =======================================================
     KEYBOARD
  ======================================================= */

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();

      scrollByCard(1);

      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();

      scrollByCard(-1);
    }
  };

  /* =======================================================
     ARROW STYLE

     PHONE:
     hidden by default

     TABLET:
     visible

     DESKTOP:
     visible

     showArrowsOnMobile=true:
     visible everywhere
  ======================================================= */

  const arrowBase = `${showArrowsOnMobile ? "flex" : "hidden md:flex"}
    absolute
    top-1/2
    z-20
    -translate-y-1/2

    h-9
    w-9

    items-center
    justify-center

    rounded-full
    border
    border-gray-200

    bg-white/90
    text-gray-700

    shadow-md
    backdrop-blur-sm

    transition-all

    hover:bg-white
    hover:shadow-lg

    active:scale-95

    dark:text-gray-100

    lg:h-10
    lg:w-10

    focus-visible:outline-2
    focus-visible:outline-offset-2
    focus-visible:outline-primary-700

    disabled:pointer-events-none
    disabled:opacity-0
  `;

  /* =======================================================
     EMPTY
  ======================================================= */

  if (items.length === 0) {
    return null;
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className={`
        mx-auto
        w-full
        min-w-0
        max-w-7xl
        ${className}
      `}
    >
      {/* ===================================================
          CAROUSEL AREA
      =================================================== */}

      <div
        className="
          relative
          z-0
          w-full
          min-w-0
        "
        onMouseEnter={() => {
          hoveredRef.current = true;
        }}
        onMouseLeave={() => {
          hoveredRef.current = false;
        }}
      >
        {/* ===============================================
            PREVIOUS ARROW
        =============================================== */}

        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => scrollByCard(-1)}
          disabled={!canPrev}
          className={`
            ${arrowBase}

            left-2

            md:-left-12  lg:-left-5

            min-[1360px]:-left-5
          `}
        >
          <ChevronIcon direction="left" />
        </button>

        {/* ===============================================
            TRACK
        =============================================== */}

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
          className={`
            flex
            w-full
            min-w-0

            select-none
            overflow-x-auto

            gap-4
            md:gap-5
            lg:gap-6

            focus-visible:outline-2
            focus-visible:outline-offset-4
            focus-visible:outline-primary-700

            [scrollbar-width:none]
            [-ms-overflow-style:none]

            [&::-webkit-scrollbar]:hidden

            ${isDragging ? "cursor-grabbing" : "cursor-grab scroll-smooth"}

            ${isDragging ? "" : "snap-x snap-mandatory"}
          `}
          style={{
            ...(gap != null
              ? {
                  gap: `${gap}px`,
                }
              : null),

            scrollPaddingLeft: 0,

            touchAction: "pan-y",

            overscrollBehaviorX: "contain",
          }}
        >
          {/* =============================================
              SLIDES
          ============================================= */}

          {displayItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="
                  min-w-0
                  shrink-0
                  snap-start

                  basis-full

                  md:basis-[calc(50%-10px)]

                  lg:basis-[calc(50%-12px)]
                "
            >
              {/* =======================================
                    CARD
                ======================================= */}

              <div
                className="
                    group
                    relative
                    w-full
                    overflow-hidden

                    rounded-xl
                    bg-gray-100

                    aspect-[16/9]

                    md:aspect-[16/9]
                    md:rounded-2xl

                    lg:aspect-auto
                    lg:h-75
                  "
              >
                {/* =====================================
                      IMAGE
                  ===================================== */}

                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  draggable={false}
                  priority={false}
                  className="
                      pointer-events-none

                      object-cover

                      transition-transform
                      duration-700
                      ease-out

                      lg:group-hover:scale-[1.06]
                    "
                  sizes="
                      (max-width: 767px) 100vw,
                      (max-width: 1023px) 50vw,
                      50vw
                    "
                />

                {/* =====================================
                      DARK GRADIENT

                      PHONE:
                      visible

                      TABLET:
                      visible

                      DESKTOP:
                      same hover UI as before
                  ===================================== */}

                <div
                  className="
                      pointer-events-none
                      absolute
                      inset-0

                      bg-gradient-to-t
                      from-black/85
                      via-black/30
                      to-transparent

                      opacity-100

                      transition-opacity
                      duration-500

                      lg:opacity-0
                      lg:group-hover:opacity-100
                    "
                />

                {/* =====================================
                      FOOD INFORMATION
                  ===================================== */}

                <div
                  className="
                      pointer-events-none
                      absolute
                      inset-x-0
                      bottom-0
                      z-10

                      translate-y-0
                      opacity-100

                      p-4

                      transition-all
                      duration-500
                      ease-out

                      sm:p-5

                      md:p-5

                      lg:translate-y-6
                      lg:p-7
                      lg:opacity-0

                      lg:group-hover:translate-y-0
                      lg:group-hover:opacity-100
                    "
                >
                  {/* ===================================
                        ORIGIN
                    =================================== */}

                  <div className="mb-2 md:mb-3">
                    <span
                      className="
                          inline-flex
                          items-center
                          gap-1.5

                          rounded-full
                          border
                          border-white/20

                          bg-white/15

                        px-3
                          py-1

                          text-xs
                          font-medium
                          text-white

                          backdrop-blur-md

                      
                          sm:py-1.5
                          sm:text-sm
                        "
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="
                            h-3.5
                            w-3.5

                            sm:h-4
                            sm:w-4
                          "
                        aria-hidden="true"
                      >
                        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />

                        <circle cx="12" cy="10" r="2.5" />
                      </svg>

                      {item.origin}
                    </span>
                  </div>

                  {/* ===================================
                        FOOD NAME
                    =================================== */}

                  <p
                    className="
                        text-lg
                        font-semibold
                        leading-tight
                        text-white

                        sm:text-xl

                        md:text-xl

                        lg:text-[28px]
                      "
                  >
                    {item.name}
                  </p>

                  {/* ===================================
                        DESCRIPTION
                    =================================== */}

                  <p
                    className="
                        mt-1.5
                        line-clamp-2
                        max-w-xl

                        text-sm
                        leading-5
                        text-white/80

                        sm:mt-2
                        sm:text-base
                        sm:leading-6

                        md:text-sm
                        md:leading-6

                        lg:text-[17px]
                        lg:leading-6
                      "
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ===============================================
            NEXT ARROW
        =============================================== */}

        <button
          type="button"
          aria-label="Next slide"
          onClick={() => scrollByCard(1)}
          disabled={!canNext}
          className={`
            ${arrowBase}

            right-2

            md:-right-12 lg:-right-5

            min-[1360px]:-right-5
          `}
        >
          <ChevronIcon direction="right" />
        </button>
      </div>

      {/* ===================================================
          DOTS
      =================================================== */}

      <div
        className="
          mt-2
          flex
          flex-wrap
          items-center
          justify-center

          md:mt-3

          lg:mt-4
        "
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            aria-current={activeIndex === index}
            onClick={() => scrollToIndex(index)}
            className="
                rounded-full
                p-1.5

                transition

                sm:p-2

                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-primary-700
              "
          >
            <span
              className={`
                  block
                  h-2
                  rounded-full
                  transition-all
                  duration-300

                  ${
                    activeIndex === index
                      ? "w-6 bg-primary-700"
                      : "w-2 bg-gray-300"
                  }
                `}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   CHEVRON ICON
========================================================= */

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <div className="dark:text-black">
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
    </div>
  );
}

/* =========================================================
   SLIDES
========================================================= */

export const slides: CarouselItem[] = [
  {
    id: 1,

    image: "/Image/carousel/food1.jpeg",

    alt: "Grilled chicken combo with dipping sauces",

    name: "អាម៉ុកត្រី",

    description:
      "ត្រីស្រស់ចម្អិនជាមួយគ្រឿងអាម៉ុក និងខ្ទិះដូង ឈ្ងុយឆ្ងាញ់បែបខ្មែរ",

    origin: "សៀមរាប",
  },

  {
    id: 2,

    image: "/Image/carousel/food2.jpg",

    alt: "Fried chicken special combo with fries and coke",

    name: "ក្តាមឆាម្រេចកំពត",

    description: "ក្តាមស្រស់ឆាជាមួយម្រេចកំពត ក្លិនឈ្ងុយ និងរសជាតិហឹរឆ្ងាញ់",

    origin: "កំពត",
  },

  {
    id: 3,

    image: "/Image/carousel/food3.avif",

    alt: "Chicken burger combo",

    name: "គុយទាវ",

    description: "គុយទាវទឹកស៊ុបក្តៅឈ្ងុយ ជាមួយសាច់ និងបន្លែស្រស់",

    origin: "ភ្នំពញ",
  },

  {
    id: 4,

    image: "/Image/carousel/food4.jpg",

    alt: "Family sharing platter",

    name: "បាញ់ឆែវ",

    description: "បាញ់ឆែវស្រួយ ស្នូលសាច់ និងសណ្ដែកបណ្ដុះ ញ៉ាំជាមួយបន្លែស្រស់",

    origin: "ព្រែវែង",
  },

  {
    id: 5,

    image: "/Image/carousel/food5.jpg",

    alt: "Family sharing platter",

    name: "បង្កងប៉ាក",

    description: "បង្កងប៉ាកស្រស់ចម្អិនជាមួយគ្រឿងរសជាតិខ្មែរ ឈ្ងុយ និងផ្អែមសាច់",

    origin: "ក្រុងព្រះសីហនុ",
  },

  {
    id: 6,

    image: "/Image/carousel/food6.jpg",

    alt: "Family sharing platter",

    name: "ត្រីដុត",

    description: "ត្រីស្រស់ដុតឈ្ងុយ សាច់ទន់ផ្អែម ញ៉ាំជាមួយទឹកជ្រលក់ខ្មែរ",

    origin: "ក្រចេះ",
  },

  {
    id: 7,

    image: "/Image/carousel/food7.png",

    alt: "Family sharing platter",

    name: "សម្លរប្រូង",

    description:
      "សម្លរបែបប្រពៃណីខ្មែរ មានរសជាតិឈ្ងុយឆ្ងាញ់ និងគ្រឿងផ្សំធម្មជាតិ",

    origin: "មណ្ឌលគិរី",
  },

  {
    id: 8,

    image: "/Image/carousel/food11.jpg",

    alt: "Family sharing platter",

    name: "មាន់អាំងខ្ទឹមស",

    description: "មាន់អាំងខ្ទឹមសក្លិនឈ្ងុយ សាច់ទន់ និងរសជាតិចូលគ្រឿង",

    origin: "បាត់ដំបង",
  },

  {
    id: 9,

    image: "/Image/carousel/food9.webp",

    alt: "Family sharing platter",

    name: " ប្រហុកខ្ទិះ",

    description: "ប្រហុកខ្ទិះខ្មែរ រសជាតិខាប់ឈ្ងុយ ញ៉ាំជាមួយបន្លែស្រស់",

    origin: "កំពង់ធំ",
  },

  {
    id: 10,

    image: "/Image/carousel/food10.jpg",

    alt: "Family sharing platter",

    name: "នំអាកោត្នោត",

    description: "នំអាកោត្នោតទន់ផ្អែម មានក្លិនត្នោតឈ្ងុយបែបបង្អែមខ្មែរ",

    origin: "សៀមរាប",
  },
];
