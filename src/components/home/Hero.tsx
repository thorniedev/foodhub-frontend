// "use client";

// import Image from "next/image";
// import { motion, useReducedMotion } from "framer-motion";
// import { useEffect, useState } from "react";

// const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// const TRANSPARENT_PIXEL =
//   "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

// export default function Hero() {
//   const reduceMotion = useReducedMotion();

//   const [heroImageLoaded, setHeroImageLoaded] = useState(false);
//   const [showSecondSection, setShowSecondSection] = useState(false);

//   useEffect(() => {
//     if (!heroImageLoaded) return;

//     /*
//      * Main image is ready.
//      *
//      * Give the top hero a little time to finish
//      * its entrance animations before mounting
//      * the large second section.
//      */
//     const timer = window.setTimeout(
//       () => {
//         setShowSecondSection(true);
//       },
//       reduceMotion ? 100 : 1200,
//     );

//     return () => {
//       window.clearTimeout(timer);
//     };
//   }, [heroImageLoaded, reduceMotion]);

//   return (
//     <section className="relative overflow-hidden">
//       <section className="relative overflow-hidden">
//         <div
//           className="
//           container relative mx-auto
//           flex max-w-305.25
//           flex-col items-center justify-center
//           gap-4

//           lg:min-h-screen
//           lg:pb-13
//           lg:py-0

//           md:mt-10
//           md:py-20

//           max-md:py-55
//         "
//         >
//           {/* =====================================================
//             TOP LEFT DECORATION

//             First: reveal once
//             After: faster continuous floating animation
//         ====================================================== */}

//           <motion.div
//             initial={
//               reduceMotion
//                 ? false
//                 : {
//                     opacity: 0,
//                     scale: 0.7,
//                     rotate: -15,
//                   }
//             }
//             animate={{
//               opacity: 1,
//               scale: 1,
//               rotate: 0,
//             }}
//             transition={{
//               duration: 0.55,
//               delay: 0.55,
//               ease: EASE_OUT,
//             }}
//             className="absolute left-10 top-25 z-10 w-20"
//           >
//             <motion.div
//               animate={
//                 reduceMotion
//                   ? undefined
//                   : {
//                       y: [0, -10, 0],
//                       rotate: [0, 5, 0, -5, 0],
//                     }
//               }
//               transition={{
//                 duration: 5,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               }}
//               style={{
//                 willChange: "transform",
//               }}
//             >
//               <Image
//                 src="/Image/decorate.png"
//                 alt=""
//                 width={80}
//                 height={80}
//                 className="h-auto w-full"
//               />
//             </motion.div>
//           </motion.div>

//           {/* =====================================================
//             MAIN FOODHUB IMAGE

//             Reveal:
//             opacity + scale + y

//             After reveal:
//             faster floating like your old animation
//         ====================================================== */}

//           <motion.div
//             initial={
//               reduceMotion
//                 ? false
//                 : {
//                     opacity: 0,
//                     y: 30,
//                     scale: 0.92,
//                   }
//             }
//             animate={{
//               opacity: 1,
//               y: 0,
//               scale: 1,
//             }}
//             transition={{
//               duration: 0.75,
//               delay: 0.12,
//               ease: EASE_OUT,
//             }}
//             className="z-1"
//           >
//             <motion.div
//               animate={
//                 reduceMotion
//                   ? undefined
//                   : {
//                       y: [0, -14, 0],
//                       rotate: [0, 0.8, 0],
//                     }
//               }
//               transition={{
//                 duration: 4,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               }}
//               style={{
//                 willChange: "transform",
//               }}
//             >
//               <Image
//                 className="
//     z-1
//     lg:w-237.5
//     md:w-150
//   "
//                 src="/Image/foodhub-image-new.png"
//                 alt="FOODHUB"
//                 width={950}
//                 height={450}
//                 priority
//                 sizes="(max-width: 768px) 100vw, 950px"
//                 onLoad={() => {
//                   setHeroImageLoaded(true);
//                 }}
//               />
//             </motion.div>
//           </motion.div>

//           {/* =====================================================
//             LEFT VECTOR

//             Reveal first.
//             Then continuous stronger movement.
//         ====================================================== */}

//           <motion.div
//             initial={
//               reduceMotion
//                 ? false
//                 : {
//                     opacity: 0,
//                     x: -30,
//                     y: 15,
//                     scale: 0.85,
//                   }
//             }
//             animate={{
//               opacity: 1,
//               x: 0,
//               y: 0,
//               scale: 1,
//             }}
//             transition={{
//               duration: 0.6,
//               delay: 0.7,
//               ease: EASE_OUT,
//             }}
//             className="
//             absolute

//             lg:bottom-3
//             lg:left-0

//             md:bottom-15
//             md:left-0

//             max-md:right-0
//             max-md:mt-15
//           "
//           >
//             <motion.div
//               animate={
//                 reduceMotion
//                   ? undefined
//                   : {
//                       y: [0, -10, 0],
//                       rotate: [0, 10, 0, -10, 0],
//                     }
//               }
//               transition={{
//                 duration: 5,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               }}
//               style={{
//                 willChange: "transform",
//               }}
//             >
//               <Image
//                 className="
//                 max-md:w-10
//                 max-md:-rotate-90
//               "
//                 src="/Image/left-vector.png"
//                 alt=""
//                 width={103}
//                 height={97}
//               />
//             </motion.div>
//           </motion.div>

//           {/* =====================================================
//             RIGHT VECTOR
//         ====================================================== */}

//           <motion.div
//             initial={
//               reduceMotion
//                 ? false
//                 : {
//                     opacity: 0,
//                     x: 30,
//                     y: 15,
//                     scale: 0.85,
//                   }
//             }
//             animate={{
//               opacity: 1,
//               x: 0,
//               y: 0,
//               scale: 1,
//             }}
//             transition={{
//               duration: 0.6,
//               delay: 0.8,
//               ease: EASE_OUT,
//             }}
//             className="
//             absolute
//             top-25

//             md:right-0

//             max-md:left-0
//           "
//           >
//             <motion.div
//               animate={
//                 reduceMotion
//                   ? undefined
//                   : {
//                       y: [0, -10, 0],
//                       rotate: [0, -10, 0, 10, 0],
//                     }
//               }
//               transition={{
//                 duration: 5.5,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               }}
//               style={{
//                 willChange: "transform",
//               }}
//             >
//               <Image
//                 className="
//                 max-md:w-10
//                 max-md:-rotate-30
//               "
//                 src="/Image/right-vector.png"
//                 alt=""
//                 width={131}
//                 height={114}
//               />
//             </motion.div>
//           </motion.div>

//           {/* =====================================================
//             GREEN BACKGROUND BLUR

//             Only fade in.
//             No infinite animation because large blur animations
//             are expensive.
//         ====================================================== */}

//           <motion.div
//             initial={
//               reduceMotion
//                 ? false
//                 : {
//                     opacity: 0,
//                   }
//             }
//             animate={{
//               opacity: 1,
//             }}
//             transition={{
//               duration: 0.8,
//               delay: 0.15,
//             }}
//             className="
//             pointer-events-none
//             absolute
//             top-10
//             -left-40
//           "
//           >
//             <Image
//               src="/Image/blur-green.png"
//               alt=""
//               width={577}
//               height={542}
//             />
//           </motion.div>

//           {/* =====================================================
//             ORANGE GLOW

//             Static after reveal.
//         ====================================================== */}

//           <motion.div
//             initial={
//               reduceMotion
//                 ? false
//                 : {
//                     opacity: 0,
//                     scale: 0.8,
//                   }
//             }
//             animate={{
//               opacity: 1,
//               scale: 1,
//             }}
//             transition={{
//               duration: 0.7,
//               delay: 0.5,
//               ease: EASE_OUT,
//             }}
//             className="
//             pointer-events-none
//             absolute
//             right-25

//             h-30
//             w-30

//             rounded-full

//             bg-secondary-500/70
//             blur-[80px]
//           "
//           />

//           {/* =====================================================
//             HERO TITLE
//         ====================================================== */}

//           <motion.p
//             initial={
//               reduceMotion
//                 ? false
//                 : {
//                     opacity: 0,
//                     y: 28,
//                   }
//             }
//             animate={{
//               opacity: 1,
//               y: 0,
//             }}
//             transition={{
//               duration: 0.65,
//               delay: 0.38,
//               ease: EASE_OUT,
//             }}
//             className="
//             z-1
//             font-extrabold

//             text-primary-800
//             dark:text-primary-dark

//             lg:ml-55
//             lg:-mt-35
//             lg:text-[50px]

//             md:text-center
//             md:text-[48px]
//             md:leading-17

//             max-md:w-full
//             max-md:text-[38px]
//           "
//           >
//             ណែនាំអាហារដែលត្រូវនឹង <br className="hidden md:block" />
//             <motion.span
//               initial={
//                 reduceMotion
//                   ? false
//                   : {
//                       opacity: 0,
//                       y: 8,
//                     }
//               }
//               animate={{
//                 opacity: 1,
//                 y: 0,
//               }}
//               transition={{
//                 duration: 0.45,
//                 delay: 0.6,
//                 ease: EASE_OUT,
//               }}
//             >
//               ចំណូលចិត្តរបស់អ្នក !
//             </motion.span>
//           </motion.p>

//           {/* =====================================================
//             FLOATING FOOD CARDS
//         ====================================================== */}

//           <div className="absolute md:w-full">
//             {/* ===================================================
//               FLOATING CARD 1

//               First: reveal from left
//               After: faster infinite floating
//           ==================================================== */}

//             <motion.div
//               initial={
//                 reduceMotion
//                   ? false
//                   : {
//                       opacity: 0,
//                       x: -40,
//                       y: 35,
//                       scale: 0.92,
//                     }
//               }
//               animate={{
//                 opacity: 1,
//                 x: 0,
//                 y: 0,
//                 scale: 1,
//               }}
//               transition={{
//                 duration: 0.65,
//                 delay: 0.85,
//                 ease: EASE_OUT,
//               }}
//               className="
//               pointer-events-auto
//               absolute
//               z-30

//               lg:left-10
//               lg:top-5

//               md:left-0
//               md:top-20

//               max-md:top-50
//               max-md:ml-6
//             "
//             >
//               <motion.div
//                 animate={
//                   reduceMotion
//                     ? undefined
//                     : {
//                         y: [0, -14, 0],
//                         rotate: [0, 2, 0, -2, 0],
//                       }
//                 }
//                 transition={{
//                   duration: 3.5,
//                   repeat: Infinity,
//                   ease: "easeInOut",
//                 }}
//                 style={{
//                   willChange: "transform",
//                 }}
//               >
//                 <div
//                   className="
//                   flex
//                   aspect-3/3.5
//                   w-40

//                   rotate-[-12deg]

//                   flex-col
//                   items-center
//                   justify-center

//                   rounded-[2rem]

//                   border
//                   border-white/40

//                   bg-white/5

//                   p-5

//                   shadow-xl

//                   transition-transform
//                   duration-300

//                   hover:rotate-0
//                   hover:scale-[1.03]

//                   lg:backdrop-blur-xs

//                   md:w-52
//                 "
//                 >
//                   {/* Food image */}

//                   <div
//                     className="
//                     mb-4
//                     flex

//                     h-16
//                     w-16

//                     items-center
//                     justify-center

//                     overflow-hidden

//                     rounded-full

//                     border-[3px]
//                     border-white/50

//                     bg-[#2C3E50]

//                     shadow-inner

//                     md:h-24
//                     md:w-24
//                   "
//                   >
//                     <Image
//                       src="/Image/food-picture/food 31.jpg"
//                       alt="Food"
//                       width={96}
//                       height={96}
//                       className="
//                       h-full
//                       w-full
//                       scale-150
//                       object-cover
//                     "
//                     />
//                   </div>

//                   {/* Text */}

//                   <div className="mt-2 text-center text-primary-500">
//                     <p className="text-sm font-bold md:text-lg">
//                       2.ម្ហូបគ្រប់ប្រភេទ
//                     </p>

//                     <p className="mt-1 text-[10px] md:text-base">
//                       23 422 មុខសម្រាប់ជ្រើសរើស
//                     </p>
//                   </div>
//                 </div>
//               </motion.div>
//             </motion.div>

//             {/* ===================================================
//               FLOATING CARD 2

//               Different speed and movement from Card 1
//               so they don't look synchronized.
//           ==================================================== */}

//             <motion.div
//               initial={
//                 reduceMotion
//                   ? false
//                   : {
//                       opacity: 0,
//                       x: 40,
//                       y: 35,
//                       scale: 0.92,
//                     }
//               }
//               animate={{
//                 opacity: 1,
//                 x: 0,
//                 y: 0,
//                 scale: 1,
//               }}
//               transition={{
//                 duration: 0.65,
//                 delay: 1.05,
//                 ease: EASE_OUT,
//               }}
//               className="
//               pointer-events-auto
//               absolute
//               z-30

//               md:right-10
//               md:-top-12

//               max-md:right-10
//               max-md:top-60
//             "
//             >
//               <motion.div
//                 animate={
//                   reduceMotion
//                     ? undefined
//                     : {
//                         y: [0, -16, 0],
//                         rotate: [0, -2, 0, 2, 0],
//                       }
//                 }
//                 transition={{
//                   duration: 4,
//                   repeat: Infinity,
//                   ease: "easeInOut",
//                   delay: 0.35,
//                 }}
//                 style={{
//                   willChange: "transform",
//                 }}
//               >
//                 <div
//                   className="
//                   flex
//                   aspect-3/3.5
//                   w-40

//                   rotate-[12deg]

//                   flex-col
//                   items-center
//                   justify-center

//                   rounded-[2rem]

//                   border
//                   border-white/40

//                   bg-white/5

//                   p-5

//                   shadow-xl

//                   transition-transform
//                   duration-300

//                   hover:rotate-0
//                   hover:scale-[1.03]

//                   lg:backdrop-blur-xs

//                   md:w-52
//                 "
//                 >
//                   {/* Food image */}

//                   <div
//                     className="
//                     mb-4
//                     flex

//                     h-16
//                     w-16

//                     items-center
//                     justify-center

//                     overflow-hidden

//                     rounded-full

//                     border-[3px]
//                     border-white/50

//                     bg-[#2C3E50]

//                     shadow-inner

//                     md:h-24
//                     md:w-24
//                   "
//                   >
//                     <Image
//                       src="/Image/food-picture/food-32.jpg"
//                       alt="Food"
//                       width={96}
//                       height={96}
//                       className="
//                       h-full
//                       w-full
//                       scale-150
//                       object-cover
//                     "
//                     />
//                   </div>

//                   {/* Text */}

//                   <div className="mt-2 text-center text-primary-500">
//                     <p className="text-sm font-bold md:text-lg">
//                       1.ម្ហូបគ្រប់ប្រភេទ
//                     </p>

//                     <p className="mt-1 text-[10px] md:text-base">
//                       23 422 មុខសម្រាប់ជ្រើសរើស
//                     </p>
//                   </div>
//                 </div>
//               </motion.div>
//             </motion.div>
//           </div>
//         </div>
//       </section>
//       {/* =========================================================
//     SECOND SECTION
//     SECOND SECTION
// ========================================================= */}

//       <div className="lg:-mt-30">
//         {/* =======================================================
//       BACKGROUND

//       Simple entrance only.
//       Don't animate continuously because this is a large image.
//   ======================================================== */}
//         <motion.div
//           initial={
//             reduceMotion
//               ? false
//               : {
//                   opacity: 0,
//                   y: 40,
//                   scale: 0.98,
//                 }
//           }
//           whileInView={{
//             opacity: 1,
//             y: 0,
//             scale: 1,
//           }}
//           viewport={{
//             once: true,
//             amount: 0.12,
//           }}
//           transition={{
//             duration: 0.65,
//             ease: EASE_OUT,
//           }}
//         >
//           <Image
//             width={1550}
//             height={0}
//             src={
//               showSecondSection ? "/Image/background.png" : TRANSPARENT_PIXEL
//             }
//             loading="lazy"
//             fetchPriority="low"
//             alt="background"
//             className="
//       w-full
//       lg:h-auto
//       md:h-[550px]
//       max-md:h-[350px]
//     "
//           />
//         </motion.div>
//         {/* =======================================================
//       CONTENT
//   ======================================================== */}

//         <section
//           className="
//       container
//       relative z-20
//       mx-auto
//       flex w-full
//       flex-col
//       items-center
//       justify-center

//       lg:-mt-105

//       md:-mt-100
//       md:gap-12.5

//       max-md:-mt-55
//       max-md:gap-6
//     "
//         >
//           {/* =====================================================
//         TITLE
//     ====================================================== */}

//           <motion.p
//             initial={
//               reduceMotion
//                 ? false
//                 : {
//                     opacity: 0,
//                     y: 28,
//                     scale: 0.97,
//                   }
//             }
//             whileInView={{
//               opacity: 1,
//               y: 0,
//               scale: 1,
//             }}
//             viewport={{
//               once: true,
//               amount: 0.5,
//             }}
//             transition={{
//               duration: 0.6,
//               ease: EASE_OUT,
//             }}
//             className="
//         text-center
//         font-semibold
//         text-white

//         lg:text-6xl  py-2
//         md:text-5xl
//         max-md:text-3xl
//       "
//           >
//             បទពិសោធន៍ថ្មីក្នុង
//             <motion.span
//               initial={
//                 reduceMotion
//                   ? false
//                   : {
//                       opacity: 0,
//                     }
//               }
//               whileInView={{
//                 opacity: 1,
//               }}
//               viewport={{
//                 once: true,
//               }}
//               transition={{
//                 duration: 0.5,
//                 delay: 0.25,
//               }}
//               className="text-secondary-500"
//             >
//               ការស្វែងរកអាហារ
//             </motion.span>
//           </motion.p>

//           {/* =====================================================
//         DESCRIPTION
//     ====================================================== */}

//           <motion.p
//             initial={
//               reduceMotion
//                 ? false
//                 : {
//                     opacity: 0,
//                     y: 20,
//                   }
//             }
//             whileInView={{
//               opacity: 1,
//               y: 0,
//             }}
//             viewport={{
//               once: true,
//               amount: 0.5,
//             }}
//             transition={{
//               duration: 0.55,
//               delay: 0.18,
//               ease: EASE_OUT,
//             }}
//             className="
//         text-center
//         font-light
//         text-accent-50

//         lg:text-[24px]
//         md:text-[20px]
//       "
//           >
//             ស្វែងរកមុខម្ហូប និងហាងអាហារដែលសមនឹងអ្នក តាមរយៈ
//             <br />
//             ប្រព័ន្ធណែនាំឆ្លាតវៃ ដែលគិតគូរពីចំណូលចិត្ត អាឡែស៊ី របបអាហារ
//             ជំនឿសាសនា និងទីតាំងរបស់អ្នក
//           </motion.p>

//           {/* =====================================================
//         CARDS
//     ====================================================== */}

//           <div
//             className="
//         container
//         relative
//         mx-auto
//         grid
//         max-w-7xl
//         grid-cols-1
//         gap-6

//         md:grid-cols-3
//         md:gap-8
//       "
//           >
//             {/* ===================================================
//           TOP LEFT DECORATION
//       ==================================================== */}

//             <motion.div
//               initial={
//                 reduceMotion
//                   ? false
//                   : {
//                       opacity: 0,
//                       scale: 0.5,
//                       rotate: -20,
//                     }
//               }
//               whileInView={{
//                 opacity: 1,
//                 scale: 1,
//                 rotate: 0,
//               }}
//               viewport={{
//                 once: true,
//                 amount: 0.4,
//               }}
//               transition={{
//                 duration: 0.5,
//                 delay: 0.35,
//                 ease: EASE_OUT,
//               }}
//               className="
//           absolute
//           md:-left-10
//           md:-top-10
//           max-md:hidden
//         "
//             >
//               <motion.div
//                 animate={
//                   reduceMotion
//                     ? undefined
//                     : {
//                         y: [0, -5, 0],
//                         rotate: [0, 4, 0],
//                       }
//                 }
//                 transition={{
//                   duration: 6,
//                   repeat: Infinity,
//                   ease: "easeInOut",
//                 }}
//               >
//                 <Image
//                   width={40}
//                   height={50}
//                   className="h-[50px] w-[40px]"
//                   src="/Image/decorate.png"
//                   alt=""
//                 />
//               </motion.div>
//             </motion.div>

//             {/* ===================================================
//           CARD 1
//       ==================================================== */}

//             <motion.div
//               initial={
//                 reduceMotion
//                   ? false
//                   : {
//                       opacity: 0,
//                       y: 45,
//                       scale: 0.95,
//                     }
//               }
//               whileInView={{
//                 opacity: 1,
//                 y: 0,
//                 scale: 1,
//               }}
//               viewport={{
//                 once: true,
//                 amount: 0.25,
//               }}
//               transition={{
//                 duration: 0.6,
//                 delay: 0.05,
//                 ease: EASE_OUT,
//               }}
//               whileHover={
//                 reduceMotion
//                   ? undefined
//                   : {
//                       y: -6,
//                       scale: 1.015,
//                       transition: {
//                         duration: 0.22,
//                       },
//                     }
//               }
//               className="
//           relative
//           flex h-64
//           flex-col
//           items-center
//           rounded-[2rem]
//           border
//           border-gray-100
//           bg-gradient-to-b
//           from-secondary-50
//           to-white
//           p-8
//           text-center
//           shadow-xs
//         "
//             >
//               {/* Heading */}

//               <motion.h3
//                 initial={
//                   reduceMotion
//                     ? false
//                     : {
//                         opacity: 0,
//                         y: 12,
//                       }
//                 }
//                 whileInView={{
//                   opacity: 1,
//                   y: 0,
//                 }}
//                 viewport={{
//                   once: true,
//                 }}
//                 transition={{
//                   duration: 0.4,
//                   delay: 0.25,
//                 }}
//                 className="
//             mb-2
//             text-xl
//             font-black
//             uppercase
//             leading-tight
//             text-primary-800

//             dark:text-primary-dark

//             md:text-2xl
//           "
//               >
//                 កំណត់ចំណង់ចំណូលចិត្ត
//                 <br />
//                 របស់លោកអ្នក
//               </motion.h3>

//               {/* Description */}

//               <motion.p
//                 initial={
//                   reduceMotion
//                     ? false
//                     : {
//                         opacity: 0,
//                       }
//                 }
//                 whileInView={{
//                   opacity: 1,
//                 }}
//                 viewport={{
//                   once: true,
//                 }}
//                 transition={{
//                   duration: 0.4,
//                   delay: 0.35,
//                 }}
//                 className="
//             mb-auto
//             font-bold
//             text-black/60
//           "
//               >
//                 ជ្រើសរើសប្រភេទម្ហូប និងចំណូលចិត្តរបស់អ្នក
//               </motion.p>

//               {/* =================================================
//             PROFILE PILL
//         ================================================== */}

//               <motion.div
//                 initial={
//                   reduceMotion
//                     ? false
//                     : {
//                         opacity: 0,
//                         y: 15,
//                         scale: 0.9,
//                       }
//                 }
//                 whileInView={{
//                   opacity: 1,
//                   y: 0,
//                   scale: 1,
//                 }}
//                 viewport={{
//                   once: true,
//                 }}
//                 transition={{
//                   duration: 0.45,
//                   delay: 0.42,
//                   ease: EASE_OUT,
//                 }}
//                 className="
//             relative mt-6
//             flex w-full
//             justify-center
//           "
//               >
//                 <div
//                   className="
//               relative z-10
//               flex items-center
//               rounded-full
//               bg-primary-600
//               p-2 pr-16
//               text-white
//               shadow-lg
//             "
//                 >
//                   <div
//                     className="
//                 mr-3
//                 h-8 w-8
//                 shrink-0
//                 overflow-hidden
//                 rounded-full
//                 border
//                 border-white/30
//                 bg-[#D2B48C]
//               "
//                   >
//                     <img
//                       src="https://i.pinimg.com/736x/c7/f9/cd/c7f9cd69787cfb858d686150d097597f.jpg"
//                       alt="Avatar"
//                       className="h-full w-full object-cover"
//                     />
//                   </div>

//                   <div className="text-left">
//                     <p className="text-[14px] font-bold leading-none">
//                       Default profile
//                     </p>

//                     <p
//                       className="
//                   mt-1
//                   text-[12px]
//                   leading-none
//                   text-white/70
//                 "
//                     >
//                       23 422 points
//                     </p>
//                   </div>
//                 </div>

//                 {/* Add preference label */}

//                 <motion.div
//                   initial={
//                     reduceMotion
//                       ? false
//                       : {
//                           opacity: 0,
//                           x: 10,
//                           scale: 0.9,
//                         }
//                   }
//                   whileInView={{
//                     opacity: 1,
//                     x: 0,
//                     scale: 1,
//                   }}
//                   viewport={{
//                     once: true,
//                   }}
//                   transition={{
//                     duration: 0.35,
//                     delay: 0.58,
//                     ease: EASE_OUT,
//                   }}
//                   className="
//               absolute
//               right-2 top-1/2 z-20
//               -translate-y-1/2
//               rounded-xl
//               bg-secondary-400
//               px-3 py-2
//               text-[10px]
//               font-black
//               text-white
//               shadow-md
//             "
//                 >
//                   add preferences
//                 </motion.div>
//               </motion.div>

//               {/* =================================================
//             ARROW TO CARD 2
//         ================================================== */}

//               <motion.div
//                 initial={
//                   reduceMotion
//                     ? false
//                     : {
//                         opacity: 0,
//                         x: -10,
//                       }
//                 }
//                 whileInView={{
//                   opacity: 1,
//                   x: 0,
//                 }}
//                 viewport={{
//                   once: true,
//                 }}
//                 transition={{
//                   duration: 0.45,
//                   delay: 0.7,
//                 }}
//                 className="
//             absolute
//             -right-12 bottom-8 z-30
//             hidden h-16 w-16
//             md:block
//           "
//               >
//                 <motion.img
//                   src="/Image/arr.png"
//                   alt=""
//                   animate={
//                     reduceMotion
//                       ? undefined
//                       : {
//                           x: [0, 5, 0],
//                         }
//                   }
//                   transition={{
//                     duration: 2,
//                     repeat: Infinity,
//                     ease: "easeInOut",
//                   }}
//                   className="h-full w-full object-contain"
//                 />
//               </motion.div>
//             </motion.div>

//             {/* ===================================================
//           CARD 2
//       ==================================================== */}

//             <motion.div
//               initial={
//                 reduceMotion
//                   ? false
//                   : {
//                       opacity: 0,
//                       y: 45,
//                       scale: 0.95,
//                     }
//               }
//               whileInView={{
//                 opacity: 1,
//                 y: 0,
//                 scale: 1,
//               }}
//               viewport={{
//                 once: true,
//                 amount: 0.25,
//               }}
//               transition={{
//                 duration: 0.6,

//                 // appears after card 1
//                 delay: 0.18,

//                 ease: EASE_OUT,
//               }}
//               whileHover={
//                 reduceMotion
//                   ? undefined
//                   : {
//                       y: -6,
//                       scale: 1.015,
//                       transition: {
//                         duration: 0.22,
//                       },
//                     }
//               }
//               className="
//           relative
//           flex h-64
//           flex-col
//           items-center
//           rounded-[2rem]
//           border
//           border-gray-100
//           bg-gradient-to-b
//           from-primary-50
//           to-white
//           p-8
//           text-center
//           shadow-xs
//         "
//             >
//               <motion.h3
//                 initial={
//                   reduceMotion
//                     ? false
//                     : {
//                         opacity: 0,
//                         y: 12,
//                       }
//                 }
//                 whileInView={{
//                   opacity: 1,
//                   y: 0,
//                 }}
//                 viewport={{
//                   once: true,
//                 }}
//                 transition={{
//                   duration: 0.4,
//                   delay: 0.38,
//                 }}
//                 className="
//             mb-2
//             text-xl
//             font-black
//             uppercase
//             leading-tight
//             text-primary-800

//             dark:text-primary-dark

//             md:text-2xl
//           "
//               >
//                 កំណត់ចំណង់ចំណូលចិត្ត
//                 <br />
//                 របស់លោកអ្នក
//               </motion.h3>

//               <motion.p
//                 initial={
//                   reduceMotion
//                     ? false
//                     : {
//                         opacity: 0,
//                       }
//                 }
//                 whileInView={{
//                   opacity: 1,
//                 }}
//                 viewport={{
//                   once: true,
//                 }}
//                 transition={{
//                   duration: 0.4,
//                   delay: 0.45,
//                 }}
//                 className="
//             mb-auto
//             font-bold
//             text-black/60
//           "
//               >
//                 ជ្រើសរើសប្រភេទម្ហូប និងចំណូលចិត្តរបស់អ្នក
//               </motion.p>

//               {/* =================================================
//             SWIPE PILL
//         ================================================== */}

//               <motion.div
//                 initial={
//                   reduceMotion
//                     ? false
//                     : {
//                         opacity: 0,
//                         y: 16,
//                         scale: 0.9,
//                       }
//                 }
//                 whileInView={{
//                   opacity: 1,
//                   y: 0,
//                   scale: 1,
//                 }}
//                 viewport={{
//                   once: true,
//                 }}
//                 transition={{
//                   duration: 0.45,
//                   delay: 0.52,
//                   ease: EASE_OUT,
//                 }}
//                 className="
//             relative mt-6
//             flex w-full
//             justify-center
//           "
//               >
//                 <div
//                   className="
//               flex items-center
//               rounded-full
//               bg-primary-600
//               p-1.5
//               text-white
//               shadow-lg
//             "
//                 >
//                   <div
//                     className="
//                 mr-2
//                 rounded-full
//                 bg-white/20
//                 px-4 py-2
//                 text-sm
//                 font-bold
//                 text-white
//               "
//                   >
//                     play with
//                   </div>

//                   <div className="px-4 text-base font-bold">swipe style</div>
//                 </div>

//                 {/* Floating orange button */}

//                 <motion.div
//                   initial={
//                     reduceMotion
//                       ? false
//                       : {
//                           opacity: 0,
//                           scale: 0.5,
//                           rotate: -20,
//                         }
//                   }
//                   whileInView={{
//                     opacity: 1,
//                     scale: 1,
//                     rotate: 12,
//                   }}
//                   viewport={{
//                     once: true,
//                   }}
//                   transition={{
//                     duration: 0.45,
//                     delay: 0.68,
//                     ease: EASE_OUT,
//                   }}
//                   className="
//               absolute
//               -bottom-6
//               right-1/3
//               z-20
//             "
//                 >
//                   <motion.div
//                     animate={
//                       reduceMotion
//                         ? undefined
//                         : {
//                             y: [0, -4, 0],
//                             rotate: [12, 17, 12],
//                           }
//                     }
//                     transition={{
//                       duration: 3.2,
//                       repeat: Infinity,
//                       ease: "easeInOut",
//                     }}
//                     className="
//                 rounded-full
//                 bg-secondary-400
//                 p-2.5
//                 shadow-lg
//               "
//                   >
//                     <svg
//                       viewBox="0 0 24 24"
//                       className="
//                   h-4 w-4
//                   stroke-current
//                   text-white
//                 "
//                       fill="none"
//                       strokeWidth="3"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     >
//                       <path d="M7 17L17 7M17 7H7M17 7V17" />
//                     </svg>
//                   </motion.div>
//                 </motion.div>
//               </motion.div>

//               {/* =================================================
//             ARROW TO CARD 3
//         ================================================== */}

//               <motion.div
//                 initial={
//                   reduceMotion
//                     ? false
//                     : {
//                         opacity: 0,
//                         x: -10,
//                       }
//                 }
//                 whileInView={{
//                   opacity: 1,
//                   x: 0,
//                 }}
//                 viewport={{
//                   once: true,
//                 }}
//                 transition={{
//                   duration: 0.45,
//                   delay: 0.82,
//                 }}
//                 className="
//             absolute
//             -right-12 bottom-8 z-30
//             hidden h-16 w-16
//             md:block
//           "
//               >
//                 <motion.img
//                   src="/Image/arr.png"
//                   alt=""
//                   animate={
//                     reduceMotion
//                       ? undefined
//                       : {
//                           x: [0, 5, 0],
//                         }
//                   }
//                   transition={{
//                     duration: 2,
//                     repeat: Infinity,
//                     ease: "easeInOut",

//                     // different from first arrow
//                     delay: 0.35,
//                   }}
//                   className="h-full w-full object-contain"
//                 />
//               </motion.div>
//             </motion.div>

//             {/* ===================================================
//           CARD 3
//       ==================================================== */}

//             <motion.div
//               initial={
//                 reduceMotion
//                   ? false
//                   : {
//                       opacity: 0,
//                       y: 45,
//                       scale: 0.95,
//                     }
//               }
//               whileInView={{
//                 opacity: 1,
//                 y: 0,
//                 scale: 1,
//               }}
//               viewport={{
//                 once: true,
//                 amount: 0.25,
//               }}
//               transition={{
//                 duration: 0.6,

//                 // last card
//                 delay: 0.31,

//                 ease: EASE_OUT,
//               }}
//               whileHover={
//                 reduceMotion
//                   ? undefined
//                   : {
//                       y: -6,
//                       scale: 1.015,
//                       transition: {
//                         duration: 0.22,
//                       },
//                     }
//               }
//               className="
//           relative
//           flex h-64
//           flex-col
//           items-center
//           rounded-[2rem]
//           border
//           border-gray-100
//           bg-gradient-to-b
//           from-accent-50
//           to-white
//           p-8
//           text-center
//           shadow-xs
//         "
//             >
//               <motion.h3
//                 initial={
//                   reduceMotion
//                     ? false
//                     : {
//                         opacity: 0,
//                         y: 12,
//                       }
//                 }
//                 whileInView={{
//                   opacity: 1,
//                   y: 0,
//                 }}
//                 viewport={{
//                   once: true,
//                 }}
//                 transition={{
//                   duration: 0.4,
//                   delay: 0.48,
//                 }}
//                 className="
//             mb-2
//             text-xl
//             font-black
//             uppercase
//             leading-tight
//             text-primary-800

//             dark:text-primary-dark

//             md:text-2xl
//           "
//               >
//                 កំណត់ចំណង់ចំណូលចិត្ត
//                 <br />
//                 របស់លោកអ្នក
//               </motion.h3>

//               <motion.p
//                 initial={
//                   reduceMotion
//                     ? false
//                     : {
//                         opacity: 0,
//                       }
//                 }
//                 whileInView={{
//                   opacity: 1,
//                 }}
//                 viewport={{
//                   once: true,
//                 }}
//                 transition={{
//                   duration: 0.4,
//                   delay: 0.56,
//                 }}
//                 className="
//             mb-auto
//             font-bold
//             text-black/60
//           "
//               >
//                 ជ្រើសរើសប្រភេទម្ហូប និងចំណូលចិត្តរបស់អ្នក
//               </motion.p>

//               {/* =================================================
//             FINAL RESULT CARD
//         ================================================== */}

//               <motion.div
//                 initial={
//                   reduceMotion
//                     ? false
//                     : {
//                         opacity: 0,
//                         y: 16,
//                         scale: 0.88,
//                       }
//                 }
//                 whileInView={{
//                   opacity: 1,
//                   y: 0,
//                   scale: 1,
//                 }}
//                 viewport={{
//                   once: true,
//                 }}
//                 transition={{
//                   duration: 0.5,
//                   delay: 0.65,
//                   ease: EASE_OUT,
//                 }}
//                 className="
//             relative mt-6
//             flex w-full
//             max-w-[200px]
//             flex-col
//             items-center
//             rounded-[2rem]
//             bg-primary-600
//             px-6 py-4
//             text-white
//             shadow-lg
//           "
//               >
//                 <p
//                   className="
//               mb-1
//               text-[9px]
//               font-bold
//               uppercase
//               tracking-wider
//             "
//                 >
//                   EST. Monthly $CLUB
//                 </p>

//                 <motion.p
//                   initial={
//                     reduceMotion
//                       ? false
//                       : {
//                           opacity: 0,
//                           scale: 0.9,
//                         }
//                   }
//                   whileInView={{
//                     opacity: 1,
//                     scale: 1,
//                   }}
//                   viewport={{
//                     once: true,
//                   }}
//                   transition={{
//                     duration: 0.35,
//                     delay: 0.8,
//                   }}
//                   className="text-xl font-black"
//                 >
//                   188.34257
//                 </motion.p>

//                 {/* Speech bubble tail */}

//                 <div
//                   className="
//               absolute
//               -bottom-2 left-8
//               h-5 w-5
//               rotate-45
//               bg-primary-600
//             "
//                 />
//               </motion.div>
//             </motion.div>
//           </div>
//         </section>
//       </div>
//     </section>
//   );
// }

"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";

/* =========================================================
   EASINGS
========================================================= */

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/*
 * Softer / longer tail than EASE_OUT.
 * This is what makes the reveal feel like it "settles"
 * instead of stopping abruptly.
 */
const EASE_SOFT = [0.16, 1, 0.3, 1] as const;

const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

/* =========================================================
   HERO ENTRANCE TIMELINE

   Kept in one place so the infinite floating loops can start
   EXACTLY when each element finishes revealing.
   (Before, the loops started at mount and fought the reveal,
   which is what made it look jumpy.)
========================================================= */

type Timing = { delay: number; duration: number };

const REVEAL = {
  heroImage: { delay: 0.12, duration: 0.8 },
  blurGreen: { delay: 0.15, duration: 0.9 },
  title: { delay: 0.34, duration: 0.7 },
  titleSpan: { delay: 0.56, duration: 0.5 },
  orangeGlow: { delay: 0.48, duration: 0.75 },
  decorate: { delay: 0.52, duration: 0.6 },
  leftVector: { delay: 0.66, duration: 0.65 },
  rightVector: { delay: 0.76, duration: 0.65 },
  card1: { delay: 0.82, duration: 0.7 },
  card2: { delay: 1.0, duration: 0.7 },
} satisfies Record<string, Timing>;

const endOf = (t: Timing) => t.delay + t.duration;

/*
 * Entrance transition.
 * Opacity finishes slightly before the transform so the element
 * is fully visible while it's still gliding into place.
 */
const enter = (t: Timing) => ({
  duration: t.duration,
  delay: t.delay,
  ease: EASE_SOFT,
  opacity: {
    duration: t.duration * 0.75,
    delay: t.delay,
    ease: "easeOut" as const,
  },
});

/* =========================================================
   FLOATING LOOP HELPER

   - y uses 2 keyframes + repeatType "mirror" -> a true
     back-and-forth with no stall at the midpoint keyframe.
   - rotate keeps the original multi-keyframe arrays.
   - y and rotate run on DIFFERENT periods so the motion never
     looks mechanical.
   - `start` delays the loop until the reveal is done, so there
     is no visible hand-off jump.
========================================================= */

type FloatOptions = {
  y?: number;
  yDuration?: number;
  rotate?: number[];
  rotateDuration?: number;
  start?: number;
};

function float({
  y = 12,
  yDuration = 2,
  rotate,
  rotateDuration = 5,
  start = 0,
}: FloatOptions) {
  return {
    animate: {
      y: [0, -y],
      ...(rotate ? { rotate } : {}),
    },
    transition: {
      y: {
        duration: yDuration,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut" as const,
        delay: start,
      },
      ...(rotate
        ? {
            rotate: {
              duration: rotateDuration,
              repeat: Infinity,
              ease: "easeInOut" as const,
              delay: start,
            },
          }
        : {}),
    },
  };
}

/* =========================================================
   SECOND SECTION VARIANTS

   The old version gave every element its own whileInView with
   its own hand-tuned delay, so they fired independently and
   felt scattered. Now a parent orchestrates the group with
   staggerChildren -> one continuous, natural wave.
========================================================= */

const VIEWPORT = {
  once: true,
  amount: 0.15,
  margin: "0px 0px -12% 0px",
} as const;

const groupStagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.13,
      delayChildren: 0.04,
    },
  },
};

const cardsStagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.05,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: EASE_SOFT },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const cardIn: Variants = {
  hidden: { opacity: 0, y: 42, scale: 0.965 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.85,
      ease: EASE_SOFT,
      opacity: { duration: 0.5, ease: "easeOut" },

      // inner content follows the card
      staggerChildren: 0.07,
      delayChildren: 0.16,
    },
  },
};

const itemUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_SOFT },
  },
};

const pillUp: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.93 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_SOFT },
  },
};

const labelIn: Variants = {
  hidden: { opacity: 0, x: 10, scale: 0.92 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.45, ease: EASE_SOFT },
  },
};

const arrowIn: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: EASE_SOFT },
  },
};

const decorateIn: Variants = {
  hidden: { opacity: 0, scale: 0.55, rotate: -20 },
  show: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.6, ease: EASE_SOFT },
  },
};

const orangeButtonIn: Variants = {
  hidden: { opacity: 0, scale: 0.55, rotate: -20 },
  show: {
    opacity: 1,
    scale: 1,
    rotate: 12,
    transition: { duration: 0.55, ease: EASE_SOFT },
  },
};

const resultCardIn: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: EASE_SOFT },
  },
};

/* ---------------------------------------------------------
   Loops for the second section.

   These live in variants too, so they only start once the
   element has actually revealed - not at mount.
--------------------------------------------------------- */

const decorateLoop: Variants = {
  hidden: {},
  show: {
    y: [0, -5],
    rotate: [0, 4, 0],
    transition: {
      y: {
        duration: 3,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
        delay: 0.35,
      },
      rotate: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.35,
      },
    },
  },
};

const orangeButtonLoop: Variants = {
  hidden: {},
  show: {
    y: [0, -4],
    rotate: [12, 17, 12],
    transition: {
      y: {
        duration: 1.6,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
        delay: 0.4,
      },
      rotate: {
        duration: 3.2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.4,
      },
    },
  },
};

const arrowLoop = (delay: number): Variants => ({
  hidden: {},
  show: {
    x: [0, 5],
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
      delay: 0.45 + delay,
    },
  },
});

export default function Hero() {
  const reduceMotion = useReducedMotion();

  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [showSecondSection, setShowSecondSection] = useState(false);
  const [backgroundReady, setBackgroundReady] = useState(false);

  useEffect(() => {
    if (!heroImageLoaded) return;

    /*
     * Main image is ready.
     *
     * Give the top hero a little time to finish
     * its entrance animations before mounting
     * the large second section.
     */
    const timer = window.setTimeout(
      () => {
        setShowSecondSection(true);
      },
      reduceMotion ? 100 : 1200,
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [heroImageLoaded, reduceMotion]);

  return (
    <section className="relative w-full max-w-full overflow-x-clip">
      <section className="relative overflow-x-clip container max-w-7xl mx-auto px-4 sm:px-6">
        <div
          className="
          container relative mx-auto
          flex max-w-305.25
          flex-col items-center justify-center
          gap-4

          lg:min-h-[95vh]
          lg:pb-13
          lg:py-0

          md:mt-10
          md:py-20
          overflow-visible
          max-md:py-55
        "
        >
          {/* =====================================================
            TOP LEFT DECORATION

            First: reveal once
            After: continuous floating animation
            (loop now starts exactly when the reveal ends)
        ====================================================== */}

          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    scale: 0.7,
                    rotate: -15,
                  }
            }
            animate={{
              opacity: 1,
              scale: 1,
              rotate: 0,
            }}
            transition={enter(REVEAL.decorate)}
            className="absolute md:left-6 top-3 lg:left-10 lg:top-25 z-10 w-20"
          >
            <motion.div
              {...(reduceMotion
                ? {}
                : float({
                    y: 10,
                    yDuration: 2.5,
                    rotate: [0, 5, 0, -5, 0],
                    rotateDuration: 5,
                    start: endOf(REVEAL.decorate),
                  }))}
              style={{
                willChange: "transform",
              }}
            >
              <Image
                src="/Image/decorate.png"
                alt=""
                width={80}
                height={80}
                className="h-auto w-full"
              />
            </motion.div>
          </motion.div>

          {/* =====================================================
            MAIN FOODHUB IMAGE

            Reveal:
            opacity + scale + y

            After reveal:
            floating, handed over seamlessly
        ====================================================== */}

          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 30,
                    scale: 0.92,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={enter(REVEAL.heroImage)}
            className="z-1 relative"
          >
            <motion.div
              {...(reduceMotion
                ? {}
                : float({
                    y: 14,
                    yDuration: 2,
                    rotate: [0, 0.8, 0],
                    rotateDuration: 4,
                    start: endOf(REVEAL.heroImage),
                  }))}
              style={{
                willChange: "transform",
              }}
            >
              <Image
                className="
    z-1
    lg:w-237.5
    md:w-150
    lg:-mt-6
  "
                src="/Image/foodhub-image-new.png"
                alt="FOODHUB"
                width={950}
                height={450}
                priority
                sizes="(max-width: 768px) 100vw, 950px"
                onLoad={() => {
                  setHeroImageLoaded(true);
                }}
              />
            </motion.div>
            {/* =====================================================
            LEFT VECTOR
        ====================================================== */}

            <motion.div
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      x: -30,
                      y: 15,
                      scale: 0.85,
                    }
              }
              animate={{
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
              }}
              transition={enter(REVEAL.leftVector)}
              className="
            absolute

            lg:mt-30
            lg:-ml-40
     min-md:-ml-25
     min-md:-mt-25

            z-20
            max-md:right-0
            max-md:mt-15
          "
            >
              <motion.div
                {...(reduceMotion
                  ? {}
                  : float({
                      y: 10,
                      yDuration: 2.5,
                      rotate: [0, 10, 0, -10, 0],
                      rotateDuration: 5,
                      start: endOf(REVEAL.leftVector),
                    }))}
                style={{
                  willChange: "transform",
                }}
              >
                <Image
                  className="
                max-md:w-8
                max-md:-rotate-90
              
              "
                  src="/Image/left-vector.png"
                  alt=""
                  width={103}
                  height={97}
                />
              </motion.div>
            </motion.div>

            {/* =====================================================
            RIGHT VECTOR
        ====================================================== */}

            <motion.div
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      x: 30,
                      y: 15,
                      scale: 0.85,
                    }
              }
              animate={{
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
              }}
              transition={enter(REVEAL.rightVector)}
              className="
            absolute
            top-12
            md:right-3
            lg:-mt-35
            lg:-mr-40
            min-md:-mt-35
            min-md:-mr-35
            max-md:left-0
          "
            >
              <motion.div
                {...(reduceMotion
                  ? {}
                  : float({
                      y: 10,
                      yDuration: 2.75,
                      rotate: [0, -10, 0, 10, 0],
                      rotateDuration: 5.5,
                      start: endOf(REVEAL.rightVector),
                    }))}
                style={{
                  willChange: "transform",
                }}
              >
                <Image
                  className="
                max-md:w-10
                max-md:-rotate-30
            
                max-w-[110px]
              "
                  src="/Image/right-vector.png"
                  alt=""
                  width={131}
                  height={114}
                />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* =====================================================
            GREEN BACKGROUND BLUR

            Only fade in.
            No infinite animation because large blur animations
            are expensive.
        ====================================================== */}

          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                  }
            }
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: REVEAL.blurGreen.duration,
              delay: REVEAL.blurGreen.delay,
              ease: "easeOut",
            }}
            className="
            pointer-events-none
            absolute
            top-10
            -left-40
          "
          >
            <Image
              src="/Image/blur-green.png"
              alt=""
              width={577}
              height={542}
            />
          </motion.div>

          {/* =====================================================
            ORANGE GLOW

            Static after reveal.
        ====================================================== */}

          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    scale: 0.8,
                  }
            }
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={enter(REVEAL.orangeGlow)}
            className="
            pointer-events-none
            absolute
            right-25

            h-30
            w-30

            rounded-full

            bg-secondary-500/70
            blur-[80px]
          "
          />

          {/* =====================================================
            HERO TITLE
        ====================================================== */}

          <motion.p
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 28,
                  }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={enter(REVEAL.title)}
            className="
            z-1
            font-extrabold

            text-primary-800
            dark:text-primary-dark

            lg:ml-35
            lg:-mt-30
            lg:text-[50px]

            md:text-center
            md:text-[48px]
            md:leading-17

            max-md:w-full
            max-md:text-[38px]
          "
          >
            ណែនាំអាហារដែលត្រូវនឹង <br className="hidden md:block" />
            <motion.span
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 8,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={enter(REVEAL.titleSpan)}
            >
              ចំណូលចិត្តរបស់អ្នក !
            </motion.span>
          </motion.p>

          {/* =====================================================
            FLOATING FOOD CARDS
        ====================================================== */}

          <div className="absolute md:w-full">
            {/* ===================================================
              FLOATING CARD 1
          ==================================================== */}

            <motion.div
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      x: -40,
                      y: 35,
                      scale: 0.92,
                    }
              }
              animate={{
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
              }}
              transition={enter(REVEAL.card1)}
              className="
              pointer-events-auto
              absolute
              z-30

              lg:left-0
              lg:-top-8

              md:left-0
              md:top-20

              max-md:top-50
              max-md:ml-6
            "
            >
              <motion.div
                {...(reduceMotion
                  ? {}
                  : float({
                      y: 14,
                      yDuration: 1.75,
                      rotate: [0, 2, 0, -2, 0],
                      rotateDuration: 3.5,
                      start: endOf(REVEAL.card1),
                    }))}
                style={{
                  willChange: "transform",
                }}
              >
                <div
                  className="
                  flex
                  aspect-3/3.5
                  w-40

                  rotate-[-12deg]

                  flex-col
                  items-center
                  justify-center

                  rounded-[2rem]

                  border
                  border-white/40

                  bg-white/5

                  p-5

                  shadow-xl

                  transition-transform
                  duration-300

                  hover:rotate-0
                  hover:scale-[1.03]

                  lg:backdrop-blur-xs

                  md:w-52
                "
                >
                  {/* Food image */}

                  <div
                    className="
                    mb-4
                    flex

                    h-16
                    w-16

                    items-center
                    justify-center

                    overflow-hidden

                    rounded-full

                    border-[3px]
                    border-white/50

                    bg-[#2C3E50]

                    shadow-inner

                    md:h-24
                    md:w-24
                  "
                  >
                    <Image
                      src="/Image/food-picture/food 31.jpg"
                      alt="Food"
                      width={96}
                      height={96}
                      className="
                      h-full
                      w-full
                      scale-150
                      object-cover
                    "
                    />
                  </div>

                  {/* Text */}

                  <div className="mt-2 text-center text-primary-500">
                    <p className="text-sm font-bold md:text-lg">
                      2.ម្ហូបគ្រប់ប្រភេទ
                    </p>

                    <p className="mt-1 text-[10px] md:text-base">
                      23 422 មុខសម្រាប់ជ្រើសរើស
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* ===================================================
              FLOATING CARD 2

              Different speed and movement from Card 1
              so they don't look synchronized.
          ==================================================== */}

            <motion.div
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      x: 40,
                      y: 35,
                      scale: 0.92,
                    }
              }
              animate={{
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
              }}
              transition={enter(REVEAL.card2)}
              className="
              pointer-events-auto
              absolute
              z-30

              md:right-0
              md:-top-12

              max-md:right-10
              max-md:top-60
            "
            >
              <motion.div
                {...(reduceMotion
                  ? {}
                  : float({
                      y: 16,
                      yDuration: 2,
                      rotate: [0, -2, 0, 2, 0],
                      rotateDuration: 4,
                      start: endOf(REVEAL.card2) + 0.35,
                    }))}
                style={{
                  willChange: "transform",
                }}
              >
                <div
                  className="
                  flex
                  aspect-3/3.5
                  w-40

                  rotate-[12deg]

                  flex-col
                  items-center
                  justify-center

                  rounded-[2rem]

                  border
                  border-white/40

                  bg-white/5

                  p-5

                  shadow-xl

                  transition-transform
                  duration-300

                  hover:rotate-0
                  hover:scale-[1.03]

                  lg:backdrop-blur-xs

                  md:w-52
                "
                >
                  {/* Food image */}

                  <div
                    className="
                    mb-4
                    flex

                    h-16
                    w-16

                    items-center
                    justify-center

                    overflow-hidden

                    rounded-full

                    border-[3px]
                    border-white/50

                    bg-[#2C3E50]

                    shadow-inner

                    md:h-24
                    md:w-24
                  "
                  >
                    <Image
                      src="/Image/food-picture/food-32.jpg"
                      alt="Food"
                      width={96}
                      height={96}
                      className="
                      h-full
                      w-full
                      scale-150
                      object-cover
                    "
                    />
                  </div>

                  {/* Text */}

                  <div className="mt-2 text-center text-primary-500">
                    <p className="text-sm font-bold md:text-lg">
                      1.ម្ហូបគ្រប់ប្រភេទ
                    </p>

                    <p className="mt-1 text-[10px] md:text-base">
                      23 422 មុខសម្រាប់ជ្រើសរើស
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* =========================================================
    SECOND SECTION
    SECOND SECTION
========================================================= */}

      <div className="lg:-mt-30">
        {/* =======================================================
      BACKGROUND

      Simple entrance only.
      Don't animate continuously because this is a large image.

      The src swap (pixel -> real background) now cross-fades
      instead of popping in.
  ======================================================== */}
        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 40,
                  scale: 0.985,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          viewport={{
            once: true,
            amount: 0.05,
            margin: "0px 0px -10% 0px",
          }}
          transition={{
            duration: 0.9,
            ease: EASE_SOFT,
            opacity: { duration: 0.6, ease: "easeOut" },
          }}
        >
          <Image
            width={1550}
            height={0}
            src={
              showSecondSection ? "/Image/background.png" : TRANSPARENT_PIXEL
            }
            loading="lazy"
            fetchPriority="low"
            alt="background"
            onLoad={() => {
              if (showSecondSection) {
                setBackgroundReady(true);
              }
            }}
            style={{
              opacity: showSecondSection && backgroundReady ? 1 : 0,
              transition: reduceMotion
                ? undefined
                : "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            className="
      w-full
      lg:h-auto
      md:h-[550px]
      max-md:h-[350px]
    "
          />
        </motion.div>
        {/* =======================================================
      CONTENT

      One orchestrated group: title -> description -> cards row.
  ======================================================== */}

        <motion.section
          initial={reduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={VIEWPORT}
          variants={groupStagger}
          className="
      container
      relative z-20
      mx-auto
      flex w-full
      flex-col
      items-center
      justify-center

      lg:-mt-105

      md:-mt-100
      md:gap-12.5

      max-md:-mt-55
      max-md:gap-6
    "
        >
          {/* =====================================================
        TITLE
    ====================================================== */}

          <motion.p
            variants={fadeUp}
            className="
        text-center
        font-semibold
        text-white

        lg:text-6xl  py-2
        md:text-5xl
        max-md:text-3xl
      "
          >
            បទពិសោធន៍ថ្មីក្នុង
            <motion.span variants={fadeIn} className="text-secondary-500">
              ការស្វែងរកអាហារ
            </motion.span>
          </motion.p>

          {/* =====================================================
        DESCRIPTION
    ====================================================== */}

          <motion.p
            variants={fadeUp}
            className="
        text-center
        font-light
        text-accent-50

        lg:text-[24px]
        md:text-[20px]
      "
          >
            ស្វែងរកមុខម្ហូប និងហាងអាហារដែលសមនឹងអ្នក តាមរយៈ
            <br />
            ប្រព័ន្ធណែនាំឆ្លាតវៃ ដែលគិតគូរពីចំណូលចិត្ត អាឡែស៊ី របបអាហារ
            ជំនឿសាសនា និងទីតាំងរបស់អ្នក
          </motion.p>

          {/* =====================================================
        CARDS

        Own in-view trigger so they animate when the row is
        actually on screen, then stagger left -> right.
    ====================================================== */}

          <motion.div
            initial={reduceMotion ? false : "hidden"}
            whileInView="show"
            viewport={VIEWPORT}
            variants={cardsStagger}
            className="
        container
        relative
        mx-auto
        grid
        lg:max-w-7xl
        grid-cols-1
        gap-6
        lg:grid-cols-3
        md:gap-8
      "
          >
            {/* ===================================================
          TOP LEFT DECORATION
      ==================================================== */}

            <motion.div
              variants={decorateIn}
              className="
          absolute
          md:-left-10
          md:-top-10
          max-md:hidden
        "
            >
              <motion.div variants={reduceMotion ? undefined : decorateLoop}>
                <Image
                  width={40}
                  height={50}
                  className="h-[50px] w-[40px]"
                  src="/Image/decorate.png"
                  alt=""
                />
              </motion.div>
            </motion.div>

            {/* ===================================================
          CARD 1
      ==================================================== */}

            <motion.div
              variants={cardIn}
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      y: -6,
                      scale: 1.015,
                      transition: {
                        duration: 0.32,
                        ease: EASE_OUT,
                      },
                    }
              }
              className="
          relative
          flex h-64
          flex-col
          items-center
          rounded-[2rem]
          border
          border-gray-100
          bg-gradient-to-b
          from-secondary-50
          to-white
          p-8
          text-center
          shadow-xs
        "
            >
              {/* Heading */}

              <motion.h3
                variants={itemUp}
                className="
            mb-2
            text-xl
            font-black
            uppercase
            leading-tight
            text-primary-800

            dark:text-primary-dark

            md:text-2xl
          "
              >
                កំណត់ចំណង់ចំណូលចិត្ត
                <br />
                របស់លោកអ្នក
              </motion.h3>

              {/* Description */}

              <motion.p
                variants={fadeIn}
                className="
            mb-auto
            font-bold
            text-black/60
          "
              >
                ជ្រើសរើសប្រភេទម្ហូប និងចំណូលចិត្តរបស់អ្នក
              </motion.p>

              {/* =================================================
            PROFILE PILL
        ================================================== */}

              <motion.div
                variants={pillUp}
                className="
            relative mt-6
            flex w-full
            justify-center
          "
              >
                <div
                  className="
              relative z-10
              flex items-center
              rounded-full
              bg-primary-600
              p-2 pr-16
              text-white
              shadow-lg
            "
                >
                  <div
                    className="
                mr-3
                h-8 w-8
                shrink-0
                overflow-hidden
                rounded-full
                border
                border-white/30
                bg-[#D2B48C]
              "
                  >
                    <img
                      src="https://i.pinimg.com/736x/c7/f9/cd/c7f9cd69787cfb858d686150d097597f.jpg"
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="text-left">
                    <p className="text-[14px] font-bold leading-none">
                      Default profile
                    </p>

                    <p
                      className="
                  mt-1
                  text-[12px]
                  leading-none
                  text-white/70
                "
                    >
                      23 422 points
                    </p>
                  </div>
                </div>

                {/* Add preference label */}

                <motion.div
                  variants={labelIn}
                  className="
              absolute
              lg:right-2 top-1/2 z-20
              -translate-y-1/2 md:right-44
              rounded-xl
              bg-secondary-400
              px-3 py-2
              text-[10px]
              font-black
              text-white
              shadow-md
            "
                >
                  add preferences
                </motion.div>
              </motion.div>

              {/* =================================================
            ARROW TO CARD 2
        ================================================== */}

              <motion.div
                variants={arrowIn}
                className="
            absolute
            lg:-right-12 bottom-8 z-40
            hidden h-16 w-16 lg:bottom-20
            md:block
            md:-bottom-15
            lg:rotate-0
            md:rotate-120
          "
              >
                <motion.img
                  src="/Image/arr.png"
                  alt=""
                  variants={reduceMotion ? undefined : arrowLoop(0)}
                  className="h-full w-full object-contain"
                />
              </motion.div>
            </motion.div>

            {/* ===================================================
          CARD 2
      ==================================================== */}

            <motion.div
              variants={cardIn}
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      y: -6,
                      scale: 1.015,
                      transition: {
                        duration: 0.32,
                        ease: EASE_OUT,
                      },
                    }
              }
              className="
          relative
          flex h-64
          flex-col
          items-center
          rounded-[2rem]
          border
          border-gray-100
          bg-gradient-to-b
          from-primary-50
          to-white
          p-8
          text-center
          shadow-xs
        "
            >
              <motion.h3
                variants={itemUp}
                className="
            mb-2
            text-xl
            font-black
            uppercase
            leading-tight
            text-primary-800

            dark:text-primary-dark

            md:text-2xl
          "
              >
                កំណត់ចំណង់ចំណូលចិត្ត
                <br />
                របស់លោកអ្នក
              </motion.h3>

              <motion.p
                variants={fadeIn}
                className="
            mb-auto
            font-bold
            text-black/60
          "
              >
                ជ្រើសរើសប្រភេទម្ហូប និងចំណូលចិត្តរបស់អ្នក
              </motion.p>

              {/* =================================================
            SWIPE PILL
        ================================================== */}

              <motion.div
                variants={pillUp}
                className="
            relative mt-6
            flex w-full
            justify-center
          "
              >
                <div
                  className="
              flex items-center
              rounded-full
              bg-primary-600
              p-1.5
              text-white
              shadow-lg
            "
                >
                  <div
                    className="
                mr-2
                rounded-full
                bg-white/20
                px-4 py-2
                text-sm
                font-bold
                text-white
              "
                  >
                    play with
                  </div>

                  <div className="px-4 text-base font-bold">swipe style</div>
                </div>

                {/* Floating orange button */}

                <motion.div
                  variants={orangeButtonIn}
                  className="
              absolute
              -bottom-6
              right-1/3
              z-20
            "
                >
                  <motion.div
                    variants={reduceMotion ? undefined : orangeButtonLoop}
                    className="
                rounded-full
                bg-secondary-400
                p-2.5
                shadow-lg
              "
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="
                  h-4 w-4
                  stroke-current
                  text-white
                "
                      fill="none"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* =================================================
            ARROW TO CARD 3
        ================================================== */}

              <motion.div
                variants={arrowIn}
                className="
            absolute
            md:-bottom-13 lg:-right-12 bottom-8 z-40
            hidden h-16 w-16
            md:block lg:bottom-20
            md:rotate-120 lg:rotate-0
          "
              >
                <motion.img
                  src="/Image/arr.png"
                  alt=""
                  variants={reduceMotion ? undefined : arrowLoop(0.35)}
                  className="h-full w-full object-contain"
                />
              </motion.div>
            </motion.div>

            {/* ===================================================
          CARD 3
      ==================================================== */}

            <motion.div
              variants={cardIn}
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      y: -6,
                      scale: 1.015,
                      transition: {
                        duration: 0.32,
                        ease: EASE_OUT,
                      },
                    }
              }
              className="
          relative
          flex h-64
          flex-col
          items-center
          rounded-[2rem]
          border
          border-gray-100
          bg-gradient-to-b
          from-accent-50
          to-white
          p-8
          text-center
          shadow-xs
        "
            >
              <motion.h3
                variants={itemUp}
                className="
            mb-2
            text-xl
            font-black
            uppercase
            leading-tight
            text-primary-800

            dark:text-primary-dark

            md:text-2xl
          "
              >
                កំណត់ចំណង់ចំណូលចិត្ត
                <br />
                របស់លោកអ្នក
              </motion.h3>

              <motion.p
                variants={fadeIn}
                className="
            mb-auto
            font-bold
            text-black/60
          "
              >
                ជ្រើសរើសប្រភេទម្ហូប និងចំណូលចិត្តរបស់អ្នក
              </motion.p>

              {/* =================================================
            FINAL RESULT CARD
        ================================================== */}

              <motion.div
                variants={resultCardIn}
                className="
            relative mt-6
            flex w-full
            max-w-[200px]
            flex-col
            items-center
            rounded-[2rem]
            bg-primary-600
            px-6 py-4
            text-white
            shadow-lg
          "
              >
                <p
                  className="
              mb-1
              text-[9px]
              font-bold
              uppercase
              tracking-wider
            "
                >
                  EST. Monthly $CLUB
                </p>

                <motion.p variants={fadeIn} className="text-xl font-black">
                  188.34257
                </motion.p>

                {/* Speech bubble tail */}

                <div
                  className="
              absolute
              -bottom-2 left-8
              h-5 w-5
              rotate-45
              bg-primary-600
            "
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.section>
      </div>
    </section>
  );
}
