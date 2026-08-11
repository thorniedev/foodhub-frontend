// "use client";

// import { useRef, useState } from "react";
// import {
//   motion,
//   useScroll,
//   useTransform,
//   useSpring,
//   useReducedMotion,
//   useMotionValueEvent,
//   MotionValue,
// } from "framer-motion";

// const MEALS = [
//   {
//     label: "អាហារពេលព្រឹក",
//     dish: "បបរគ្រឿង",
//     time: "០៦:៣០",
//     img: "/Image/food/food1.png",
//   },
//   {
//     label: "អាហារថ្ងៃត្រង់",
//     dish: "សម្លម្ជូរ",
//     time: "១២:០០",
//     img: "/Image/food/food4.png",
//   },
//   {
//     label: "អាហារពេលល្ងាច",
//     dish: "ឡុកឡាក់",
//     time: "១៨:៣០",
//     img: "/Image/food/food7.png",
//   },
//   {
//     label: "អាហារសម្រន់",
//     dish: "នំចាក់",
//     time: "២១:០០",
//     img: "/Image/food/food9.png",
//   },
// ];

// const HEADLINE = "រាល់ពេលវេលា មានរសជាតិ ដែលសាកសមនឹងអ្នក";

// export default function MealTimeJourneySection() {
//   const reduce = useReducedMotion();
//   const ref = useRef<HTMLDivElement>(null);
//   const [active, setActive] = useState(0);

//   const { scrollYProgress } = useScroll({
//     target: ref,
//     offset: ["start start", "end end"],
//   });

//   const progress = useSpring(scrollYProgress, {
//     stiffness: 65,
//     damping: 25,
//     mass: 0.45,
//     restDelta: 0.0005,
//   });

//   const span = 1 / (MEALS.length + 0.5);

//   useMotionValueEvent(progress, "change", (v) => {
//     setActive(Math.min(MEALS.length - 1, Math.max(0, Math.floor(v / span))));
//   });

//   // dawn -> midday -> dusk -> night
//   const bg = useTransform(
//     progress,
//     [0, 0.3, 0.62, 1],
//     ["#14532d", "#166534", "#7c2d12", "#052e16"],
//   );

//   // sun arcs across the top
//   const sunX = useTransform(progress, [0, 1], ["8%", "88%"]);
//   const sunY = useTransform(progress, [0, 0.5, 1], ["22%", "6%", "26%"]);
//   const sunColor = useTransform(
//     progress,
//     [0, 0.35, 0.7, 1],
//     ["#fde047", "#facc15", "#fb923c", "#166534"],
//   );

//   const words = HEADLINE.split(" ");

//   return (
//     <div ref={ref} style={{ height: `${(MEALS.length + 0.5) * 100}vh` }}>
//       <motion.section
//         className="sticky top-0 h-screen overflow-hidden"
//         style={{ backgroundColor: reduce ? "#052e16" : bg }}
//       >
//         {/* horizon glow */}
//         <div
//           className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-1/2"
//           style={{
//             background:
//               "linear-gradient(to top, rgba(250,204,21,0.16), transparent 80%)",
//           }}
//         />

//         {/* arcing sun */}
//         <motion.div
//           className="pointer-events-none absolute z-10 h-24 w-24 rounded-full blur-[2px] md:h-32 md:w-32"
//           style={{
//             left: sunX,
//             top: sunY,
//             x: "-50%",
//             backgroundColor: reduce ? "#facc15" : sunColor,
//             opacity: 0.9,
//           }}
//         />

//         {/* time ticks across the top */}
//         <div className="absolute inset-x-0 top-0 z-30 flex justify-between border-b border-white/10 px-6 py-5 md:px-14">
//           {MEALS.map((m, i) => (
//             <span
//               key={m.time}
//               className={`font-mono text-lg tabular-nums transition-colors duration-700 ${
//                 i === active ? "text-accent-300" : "text-white/25"
//               }`}
//             >
//               {m.time}
//             </span>
//           ))}
//         </div>

//         {/* centre stage */}
//         <div className="relative z-20 flex h-full flex-col items-center justify-center px-6">
//           {/* circular aperture */}
//           <div className="relative h-[46vh] w-[46vh] max-h-[380px] max-w-[380px]">
//             {/* rotating ring caption */}
//             <motion.div
//               className="absolute inset-[-14%] z-10"
//               animate={reduce ? {} : { rotate: 360 }}
//               transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
//             >
//               <svg viewBox="0 0 200 200" className="h-full w-full">
//                 <defs>
//                   <path
//                     id="ringPath"
//                     d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0"
//                     fill="none"
//                   />
//                 </defs>
//                 <text
//                   className="fill-accent-300/60"
//                   style={{ fontSize: 13, letterSpacing: 4 }}
//                 >
//                   <textPath href="#ringPath">
//                     ស្វែងរករសជាតិ · គ្រប់ពេលវេលា · ស្វែងរករសជាតិ · គ្រប់ពេលវេលា
//                     ·
//                   </textPath>
//                 </text>
//               </svg>
//             </motion.div>

//             <div className="absolute inset-0 overflow-hidden rounded-full ring-2 ring-accent-400/30">
//               {MEALS.map((m, i) => (
//                 <Aperture
//                   key={m.label}
//                   meal={m}
//                   index={i}
//                   span={span}
//                   progress={progress}
//                   reduce={!!reduce}
//                 />
//               ))}
//             </div>

//             {/* dish tag pinned to the circle edge */}
//             <motion.div
//               key={MEALS[active].dish}
//               initial={reduce ? false : { opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
//               className="absolute -bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-accent-400 px-6 py-2"
//             >
//               <span className="text-lg font-bold text-primary-950">
//                 {MEALS[active].dish}
//               </span>
//             </motion.div>
//           </div>

//           {/* meal label */}
//           <motion.p
//             key={MEALS[active].label}
//             initial={reduce ? false : { opacity: 0, y: 14 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
//             className="mt-12 text-3xl font-black text-white md:text-5xl"
//           >
//             {MEALS[active].label}
//           </motion.p>

//           {/* word-by-word fill headline */}
//           <p className="mt-6 max-w-3xl text-center text-xl font-semibold leading-relaxed md:text-2xl">
//             {words.map((w, i) => (
//               <FillWord
//                 key={i}
//                 word={w}
//                 index={i}
//                 total={words.length}
//                 progress={progress}
//                 reduce={!!reduce}
//               />
//             ))}
//           </p>
//         </div>

//         {/* progress arc at the bottom */}
//         <div className="absolute inset-x-0 bottom-0 z-30 h-1 bg-white/10">
//           <motion.div
//             className="h-full origin-left bg-accent-400"
//             style={{ scaleX: reduce ? 1 : progress }}
//           />
//         </div>
//       </motion.section>
//     </div>
//   );
// }

// function Aperture({
//   meal,
//   index,
//   span,
//   progress,
//   reduce,
// }: {
//   meal: (typeof MEALS)[number];
//   index: number;
//   span: number;
//   progress: MotionValue<number>;
//   reduce: boolean;
// }) {
//   const start = index === 0 ? -0.001 : index * span;
//   const end = index * span + span * 0.68;

//   const radius = useTransform(progress, [start, end], [0, 78]);
//   const clipPath = useTransform(radius, (r) => `circle(${r}% at 50% 50%)`);
//   const scale = useTransform(progress, [start, end + span * 0.3], [1.25, 1.02]);
//   const rotate = useTransform(progress, [start, end], [-6, 0]);

//   return (
//     <motion.div
//       className="absolute inset-0"
//       style={{
//         clipPath: reduce ? "circle(78% at 50% 50%)" : clipPath,
//         zIndex: index + 1,
//         willChange: "clip-path",
//       }}
//     >
//       <motion.img
//         src={meal.img}
//         alt={meal.label}
//         className="h-full w-full object-cover"
//         style={{
//           scale: reduce ? 1 : scale,
//           rotate: reduce ? 0 : rotate,
//           willChange: "transform",
//         }}
//       />
//       <div className="absolute inset-0 bg-primary-950/25" />
//     </motion.div>
//   );
// }

// function FillWord({
//   word,
//   index,
//   total,
//   progress,
//   reduce,
// }: {
//   word: string;
//   index: number;
//   total: number;
//   progress: MotionValue<number>;
//   reduce: boolean;
// }) {
//   const step = 0.7 / total;
//   const from = 0.12 + index * step;
//   const to = from + step * 1.6;

//   const opacity = useTransform(progress, [from, to], [0.22, 1]);
//   const blur = useTransform(progress, [from, to], [4, 0]);
//   const filter = useTransform(blur, (b) => `blur(${b}px)`);

//   return (
//     <motion.span
//       className="mr-2 inline-block text-white"
//       style={
//         reduce ? undefined : { opacity, filter, willChange: "opacity, filter" }
//       }
//     >
//       {word}
//     </motion.span>
//   );
// }

// "use client";

// import { useRef, useState } from "react";
// import {
//   motion,
//   useScroll,
//   useTransform,
//   useSpring,
//   useReducedMotion,
//   useMotionValueEvent,
//   MotionValue,
// } from "framer-motion";

// const MEALS = [
//   {
//     label: "អាហារពេលព្រឹក",
//     dish: "បបរគ្រឿង",
//     time: "០៦:៣០",
//     note: "ចាប់ផ្ដើមថ្ងៃដោយភាពស្រាល",
//     img: "/Image/food/food1.png",
//   },
//   {
//     label: "អាហារថ្ងៃត្រង់",
//     dish: "សម្លម្ជូរ",
//     time: "១២:០០",
//     note: "ឆ្អែតពេញ សម្រាប់រសៀលវែង",
//     img: "/Image/food/food4.png",
//   },
//   {
//     label: "អាហារពេលល្ងាច",
//     dish: "ឡុកឡាក់",
//     time: "១៨:៣០",
//     note: "ក្ដៅៗ ជាមួយក្រុមគ្រួសារ",
//     img: "/Image/food/food7.png",
//   },
//   {
//     label: "អាហារសម្រន់",
//     dish: "នំចាក់",
//     time: "២១:០០",
//     note: "ផ្អែមបន្តិច មុនចូលដំណេក",
//     img: "/Image/food/food9.png",
//   },
// ];

// export default function MealTimeJourneySection() {
//   const reduce = useReducedMotion();
//   const ref = useRef<HTMLDivElement>(null);
//   const [active, setActive] = useState(0);

//   const { scrollYProgress } = useScroll({
//     target: ref,
//     offset: ["start start", "end end"],
//   });

//   const progress = useSpring(scrollYProgress, {
//     stiffness: 65,
//     damping: 25,
//     mass: 0.45,
//     restDelta: 0.0005,
//   });

//   const span = 1 / (MEALS.length + 0.5);

//   useMotionValueEvent(progress, "change", (v) => {
//     setActive(Math.min(MEALS.length - 1, Math.max(0, Math.floor(v / span))));
//   });

//   const bg = useTransform(
//     progress,
//     [0, 0.32, 0.64, 1],
//     ["#14532d", "#166534", "#5c2c12", "#052e16"],
//   );

//   const dialRotate = useTransform(progress, [0, 1], [0, 360]);
//   const orbA = useTransform(progress, [0, 1], ["-10%", "18%"]);
//   const orbB = useTransform(progress, [0, 1], ["12%", "-16%"]);

//   return (
//     <div ref={ref} style={{ height: `${(MEALS.length + 0.5) * 100}vh` }}>
//       <motion.section
//         className="sticky top-0 h-screen overflow-hidden"
//         style={{ backgroundColor: reduce ? "#052e16" : bg }}
//       >
//         {/* drifting bokeh */}
//         <motion.div
//           className="pointer-events-none absolute -left-40 top-10 z-0 h-[46vh] w-[46vh] rounded-full opacity-40 blur-[110px]"
//           style={{ x: reduce ? 0 : orbA, background: "#facc15" }}
//         />
//         <motion.div
//           className="pointer-events-none absolute -right-32 bottom-0 z-0 h-[52vh] w-[52vh] rounded-full opacity-30 blur-[120px]"
//           style={{ x: reduce ? 0 : orbB, background: "#fb923c" }}
//         />

//         {/* film grain */}
//         <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full opacity-[0.14] mix-blend-overlay">
//           <filter id="mealGrain">
//             <feTurbulence
//               type="fractalNoise"
//               baseFrequency="0.85"
//               numOctaves="3"
//             />
//           </filter>
//           <rect width="100%" height="100%" filter="url(#mealGrain)" />
//         </svg>

//         {/* vignette */}
//         <div
//           className="pointer-events-none absolute inset-0 z-[2]"
//           style={{
//             background:
//               "radial-gradient(70% 65% at 50% 45%, transparent 40%, rgba(5,46,22,0.55) 100%)",
//           }}
//         />

//         {/* header */}
//         <div className="absolute inset-x-0 top-0 z-30 px-6 pt-8 text-center md:pt-10">
//           <span className="text-lg font-medium tracking-[0.2em] text-accent-300/90">
//             គ្រប់ពេលវេលា
//           </span>
//           <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-bold leading-snug text-white md:text-4xl">
//             រាល់ពេលវេលា មានរសជាតិដែលសាកសមនឹងអ្នក
//           </h2>
//         </div>

//         {/* stage */}
//         <div className="relative z-20 flex h-full items-center justify-center px-6">
//           <div className="relative h-[42vh] w-[42vh] max-h-[360px] max-w-[360px]">
//             {/* dial track + progress arc */}
//             <svg
//               viewBox="0 0 200 200"
//               className="absolute inset-[-9%] h-[118%] w-[118%] -rotate-90"
//             >
//               <defs>
//                 <linearGradient id="dialGrad" x1="0" y1="0" x2="1" y2="1">
//                   <stop offset="0%" stopColor="#fde047" />
//                   <stop offset="55%" stopColor="#facc15" />
//                   <stop offset="100%" stopColor="#fb923c" />
//                 </linearGradient>
//               </defs>
//               <circle
//                 cx="100"
//                 cy="100"
//                 r="92"
//                 fill="none"
//                 stroke="rgba(255,255,255,0.12)"
//                 strokeWidth="2"
//               />
//               <motion.circle
//                 cx="100"
//                 cy="100"
//                 r="92"
//                 fill="none"
//                 stroke="url(#dialGrad)"
//                 strokeWidth="3"
//                 strokeLinecap="round"
//                 style={{ pathLength: reduce ? 1 : progress }}
//               />
//             </svg>

//             {/* orbiting knob */}
//             <motion.div
//               className="pointer-events-none absolute inset-[-9%]"
//               style={{ rotate: reduce ? 360 : dialRotate }}
//             >
//               <span className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-300 shadow-[0_0_20px_6px_rgba(250,204,21,0.45)]" />
//             </motion.div>

//             {/* photo aperture */}
//             <div className="absolute inset-0 overflow-hidden rounded-full shadow-2xl shadow-primary-950/60">
//               {MEALS.map((m, i) => (
//                 <Aperture
//                   key={m.label}
//                   meal={m}
//                   index={i}
//                   span={span}
//                   progress={progress}
//                   reduce={!!reduce}
//                 />
//               ))}
//               <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/20" />
//             </div>

//             {/* time chip */}
//             <div className="absolute -top-3 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/15 bg-primary-950/70 px-5 py-1.5 backdrop-blur-md">
//               <span className="font-mono text-lg tabular-nums text-accent-300">
//                 {MEALS[active].time}
//               </span>
//             </div>

//             {/* glass info panel */}
//             <motion.div
//               key={MEALS[active].dish}
//               initial={reduce ? false : { opacity: 0, y: 16 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
//               className="absolute -bottom-14 left-1/2 z-30 w-[86vw] max-w-sm -translate-x-1/2 rounded-3xl border border-white/15 bg-white/[0.07] px-7 py-5 text-center shadow-xl shadow-primary-950/40 backdrop-blur-xl"
//             >
//               <p className="text-2xl font-black text-white md:text-3xl">
//                 {MEALS[active].dish}
//               </p>
//               <p className="mt-2 text-lg text-white/70">{MEALS[active].note}</p>
//               <span className="mt-4 inline-block rounded-full bg-accent-400 px-5 py-1.5 text-lg font-bold text-primary-950">
//                 {MEALS[active].label}
//               </span>
//             </motion.div>
//           </div>
//         </div>

//         {/* timeline */}
//         <div className="absolute inset-x-0 bottom-10 z-30 px-8 md:px-20">
//           <div className="relative mx-auto flex max-w-2xl items-center justify-between">
//             <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/15" />
//             <motion.span
//               className="absolute left-0 top-1/2 h-px origin-left -translate-y-1/2 bg-accent-400"
//               style={{ width: "100%", scaleX: reduce ? 1 : progress }}
//             />
//             {MEALS.map((m, i) => (
//               <span key={m.time} className="relative">
//                 <span
//                   className={`block h-3.5 w-3.5 rounded-full transition-all duration-500 ${
//                     i === active
//                       ? "scale-125 bg-accent-300 shadow-[0_0_16px_4px_rgba(250,204,21,0.4)]"
//                       : i < active
//                         ? "bg-accent-400/60"
//                         : "bg-white/25"
//                   }`}
//                 />
//               </span>
//             ))}
//           </div>
//         </div>
//       </motion.section>
//     </div>
//   );
// }

// function Aperture({
//   meal,
//   index,
//   span,
//   progress,
//   reduce,
// }: {
//   meal: (typeof MEALS)[number];
//   index: number;
//   span: number;
//   progress: MotionValue<number>;
//   reduce: boolean;
// }) {
//   const start = index === 0 ? -0.001 : index * span;
//   const end = index * span + span * 0.68;

//   const radius = useTransform(progress, [start, end], [0, 76]);
//   const clipPath = useTransform(radius, (r) => `circle(${r}% at 50% 50%)`);
//   const scale = useTransform(progress, [start, end + span * 0.3], [1.22, 1.02]);
//   const rotate = useTransform(progress, [start, end], [-5, 0]);

//   return (
//     <motion.div
//       className="absolute inset-0"
//       style={{
//         clipPath: reduce ? "circle(76% at 50% 50%)" : clipPath,
//         zIndex: index + 1,
//         willChange: "clip-path",
//       }}
//     >
//       <motion.img
//         src={meal.img}
//         alt={meal.label}
//         className="h-full w-full object-cover"
//         style={{
//           scale: reduce ? 1 : scale,
//           rotate: reduce ? 0 : rotate,
//           willChange: "transform",
//         }}
//       />
//       <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary-950/45" />
//     </motion.div>
//   );
// }

//verion3

// "use client";

// import { useRef, useState } from "react";
// import {
//   motion,
//   useScroll,
//   useTransform,
//   useSpring,
//   useReducedMotion,
//   useMotionValueEvent,
//   useMotionTemplate,
//   MotionValue,
// } from "framer-motion";

// const MEALS = [
//   {
//     label: "អាហារពេលព្រឹក",
//     dish: "បបរគ្រឿង",
//     time: "០៦:៣០",
//     note: "ចាប់ផ្ដើមថ្ងៃដោយភាពស្រាល",
//     img: "/Image/food/food1.png",
//   },
//   {
//     label: "អាហារថ្ងៃត្រង់",
//     dish: "សម្លម្ជូរ",
//     time: "១២:០០",
//     note: "ឆ្អែតពេញ សម្រាប់រសៀលវែង",
//     img: "/Image/food/food4.png",
//   },
//   {
//     label: "អាហារពេលល្ងាច",
//     dish: "ឡុកឡាក់",
//     time: "១៨:៣០",
//     note: "ក្ដៅៗ ជាមួយក្រុមគ្រួសារ",
//     img: "/Image/food/food7.png",
//   },
//   {
//     label: "អាហារសម្រន់",
//     dish: "នំចាក់",
//     time: "២១:០០",
//     note: "ផ្អែមបន្តិច មុនចូលដំណេក",
//     img: "/Image/food/food9.png",
//   },
// ];

// const STARS = [
//   [12, 18],
//   [24, 9],
//   [37, 22],
//   [48, 12],
//   [61, 20],
//   [72, 8],
//   [83, 24],
//   [91, 14],
//   [18, 32],
//   [55, 30],
//   [67, 35],
//   [30, 15],
// ];

// export default function MealTimeJourneySection() {
//   const reduce = useReducedMotion();
//   const ref = useRef<HTMLDivElement>(null);
//   const [active, setActive] = useState(0);

//   const { scrollYProgress } = useScroll({
//     target: ref,
//     offset: ["start start", "end end"],
//   });

//   const progress = useSpring(scrollYProgress, {
//     stiffness: 65,
//     damping: 25,
//     mass: 0.45,
//     restDelta: 0.0005,
//   });

//   const span = 1 / (MEALS.length + 0.5);

//   useMotionValueEvent(progress, "change", (v) => {
//     setActive(Math.min(MEALS.length - 1, Math.max(0, Math.floor(v / span))));
//   });

//   /* ---------- sky ---------- */
//   const skyTop = useTransform(
//     progress,
//     [0, 0.22, 0.5, 0.76, 1],
//     ["#1e3a5f", "#2563a0", "#3b8fd4", "#7c2d12", "#031b0d"],
//   );
//   const skyMid = useTransform(
//     progress,
//     [0, 0.22, 0.5, 0.76, 1],
//     ["#7c3f12", "#c2410c", "#86c5e8", "#c2410c", "#052e16"],
//   );
//   const skyLow = useTransform(
//     progress,
//     [0, 0.22, 0.5, 0.76, 1],
//     ["#facc15", "#fdba74", "#fef9c3", "#f97316", "#0d2f1a"],
//   );
//   const sky = useMotionTemplate`linear-gradient(to bottom, ${skyTop} 0%, ${skyMid} 52%, ${skyLow} 100%)`;

//   /* ---------- sun arc ---------- */
//   const sunX = useTransform(progress, [0, 1], ["6%", "94%"]);
//   const sunY = useTransform(
//     progress,
//     [0, 0.12, 0.3, 0.5, 0.7, 0.88, 1],
//     ["86%", "58%", "30%", "17%", "30%", "58%", "86%"],
//   );
//   const sunColor = useTransform(
//     progress,
//     [0, 0.2, 0.5, 0.8, 1],
//     ["#f97316", "#fdba74", "#fef08a", "#fb923c", "#c2410c"],
//   );
//   const sunGlow = useTransform(progress, [0, 0.5, 1], [70, 130, 70]);
//   const sunScale = useTransform(progress, [0, 0.5, 1], [1.35, 1, 1.35]);
//   const raysOpacity = useTransform(progress, [0.2, 0.5, 0.8], [0, 0.55, 0]);
//   const starOpacity = useTransform(progress, [0.74, 0.95], [0, 1]);
//   const glowSpread = useMotionTemplate`0 0 ${sunGlow}px ${sunGlow}px`;

//   /* sheen that follows the sun across the photo */
//   const sheen = useMotionTemplate`radial-gradient(circle at ${sunX} -10%, rgba(255,255,255,0.28), transparent 62%)`;

//   const dialRotate = useTransform(progress, [0, 1], [0, 360]);

//   return (
//     <div ref={ref} style={{ height: `${(MEALS.length + 0.5) * 100}vh` }}>
//       <motion.section
//         className="sticky top-0 h-screen overflow-hidden"
//         style={{
//           backgroundImage: reduce ? "linear-gradient(#052e16,#0d2f1a)" : sky,
//         }}
//       >
//         {/* stars */}
//         <motion.div
//           className="pointer-events-none absolute inset-0 z-0"
//           style={{ opacity: reduce ? 0 : starOpacity }}
//         >
//           {STARS.map(([l, t], i) => (
//             <motion.span
//               key={i}
//               className="absolute rounded-full bg-white"
//               style={{
//                 left: `${l}%`,
//                 top: `${t}%`,
//                 width: i % 3 === 0 ? 3 : 2,
//                 height: i % 3 === 0 ? 3 : 2,
//               }}
//               animate={{ opacity: [0.35, 1, 0.35] }}
//               transition={{
//                 duration: 2.6 + (i % 4),
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               }}
//             />
//           ))}
//         </motion.div>

//         {/* sun */}
//         <motion.div
//           className="pointer-events-none absolute z-10"
//           style={{
//             left: sunX,
//             top: sunY,
//             x: "-50%",
//             y: "-50%",
//             scale: reduce ? 1 : sunScale,
//           }}
//         >
//           {/* rays */}
//           <motion.div
//             className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2"
//             style={{ opacity: reduce ? 0 : raysOpacity }}
//             animate={reduce ? {} : { rotate: 360 }}
//             transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
//           >
//             <div
//               className="h-full w-full"
//               style={{
//                 background:
//                   "conic-gradient(from 0deg, rgba(255,255,255,0.35) 0deg 4deg, transparent 4deg 30deg, rgba(255,255,255,0.28) 30deg 34deg, transparent 34deg 60deg, rgba(255,255,255,0.35) 60deg 64deg, transparent 64deg 90deg, rgba(255,255,255,0.28) 90deg 94deg, transparent 94deg 120deg, rgba(255,255,255,0.35) 120deg 124deg, transparent 124deg 180deg)",
//                 maskImage:
//                   "radial-gradient(circle, black 20%, transparent 70%)",
//                 WebkitMaskImage:
//                   "radial-gradient(circle, black 20%, transparent 70%)",
//               }}
//             />
//           </motion.div>

//           {/* disc */}
//           <motion.div
//             className="h-24 w-24 rounded-full md:h-32 md:w-32"
//             style={{
//               backgroundColor: reduce ? "#facc15" : sunColor,
//               boxShadow: reduce
//                 ? "0 0 90px 90px rgba(250,204,21,0.18)"
//                 : glowSpread,
//               color: "rgba(250,204,21,0.20)",
//             }}
//           />
//         </motion.div>

//         {/* haze band on the horizon */}
//         <motion.div
//           className="pointer-events-none absolute inset-x-0 bottom-0 z-[11] h-1/3 blur-2xl"
//           style={{
//             backgroundColor: reduce ? "transparent" : sunColor,
//             opacity: 0.22,
//           }}
//         />

//         {/* hills — sun rises out of and sets behind these */}
//         <svg
//           viewBox="0 0 1440 260"
//           preserveAspectRatio="none"
//           className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-[26vh] w-full"
//         >
//           <path
//             d="M0,150 C220,90 360,180 560,140 C760,100 900,190 1120,150 C1280,120 1380,160 1440,140 L1440,260 L0,260 Z"
//             fill="#0b3d22"
//             opacity="0.9"
//           />
//           <path
//             d="M0,196 C260,150 420,220 660,190 C880,162 1040,225 1240,196 C1340,182 1400,200 1440,192 L1440,260 L0,260 Z"
//             fill="#052e16"
//           />
//         </svg>

//         {/* grain */}
//         <svg className="pointer-events-none absolute inset-0 z-[16] h-full w-full opacity-[0.12] mix-blend-overlay">
//           <filter id="mealGrain">
//             <feTurbulence
//               type="fractalNoise"
//               baseFrequency="0.85"
//               numOctaves="3"
//             />
//           </filter>
//           <rect width="100%" height="100%" filter="url(#mealGrain)" />
//         </svg>

//         {/* header */}
//         <div className="absolute inset-x-0 top-0 z-30 px-6 pt-8 text-center md:pt-10">
//           <span className="text-lg font-medium tracking-[0.2em] text-white/80">
//             គ្រប់ពេលវេលា
//           </span>
//           <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-bold leading-snug text-white drop-shadow-[0_2px_12px_rgba(5,46,22,0.7)] md:text-4xl">
//             រាល់ពេលវេលា មានរសជាតិដែលសាកសមនឹងអ្នក
//           </h2>
//         </div>

//         {/* stage */}
//         <div className="relative z-20 flex h-full items-center justify-center px-6">
//           <div className="relative h-[38vh] w-[38vh] max-h-[330px] max-w-[330px]">
//             {/* dial */}
//             <svg
//               viewBox="0 0 200 200"
//               className="absolute inset-[-9%] h-[118%] w-[118%] -rotate-90"
//             >
//               <defs>
//                 <linearGradient id="dialGrad" x1="0" y1="0" x2="1" y2="1">
//                   <stop offset="0%" stopColor="#fde047" />
//                   <stop offset="55%" stopColor="#facc15" />
//                   <stop offset="100%" stopColor="#fb923c" />
//                 </linearGradient>
//               </defs>
//               <circle
//                 cx="100"
//                 cy="100"
//                 r="92"
//                 fill="none"
//                 stroke="rgba(255,255,255,0.18)"
//                 strokeWidth="2"
//               />
//               <motion.circle
//                 cx="100"
//                 cy="100"
//                 r="92"
//                 fill="none"
//                 stroke="url(#dialGrad)"
//                 strokeWidth="3"
//                 strokeLinecap="round"
//                 style={{ pathLength: reduce ? 1 : progress }}
//               />
//             </svg>

//             <motion.div
//               className="pointer-events-none absolute inset-[-9%]"
//               style={{ rotate: reduce ? 360 : dialRotate }}
//             >
//               <span className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-300 shadow-[0_0_20px_6px_rgba(250,204,21,0.45)]" />
//             </motion.div>

//             {/* photo */}
//             <div className="absolute inset-0 overflow-hidden rounded-full shadow-2xl shadow-primary-950/60">
//               {MEALS.map((m, i) => (
//                 <Aperture
//                   key={m.label}
//                   meal={m}
//                   index={i}
//                   span={span}
//                   progress={progress}
//                   reduce={!!reduce}
//                 />
//               ))}
//               <motion.div
//                 className="pointer-events-none absolute inset-0 rounded-full"
//                 style={{ backgroundImage: reduce ? "none" : sheen }}
//               />
//               <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/25" />
//             </div>

//             {/* time chip */}
//             <div className="absolute -top-3 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/20 bg-primary-950/60 px-5 py-1.5 backdrop-blur-md">
//               <span className="font-mono text-lg tabular-nums text-accent-300">
//                 {MEALS[active].time}
//               </span>
//             </div>

//             {/* glass panel */}
//             {/* <motion.div
//               key={MEALS[active].dish}
//               initial={reduce ? false : { opacity: 0, y: 16 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
//               className="absolute -bottom-16 left-1/2 z-30 w-[86vw] max-w-sm -translate-x-1/2 rounded-3xl border border-white/20 bg-white/[0.09] px-7 py-5 text-center shadow-xl shadow-primary-950/40 backdrop-blur-xl"
//             >
//               <p className="text-2xl font-black text-white md:text-3xl">
//                 {MEALS[active].dish}
//               </p>
//               <p className="mt-2 text-lg text-white/75">{MEALS[active].note}</p>
//               <span className="mt-4 inline-block rounded-full bg-accent-400 px-5 py-1.5 text-lg font-bold text-primary-950">
//                 {MEALS[active].label}
//               </span>
//             </motion.div> */}
//           </div>
//         </div>

//         {/* timeline */}
//         <div className="absolute inset-x-0 bottom-8 z-30 px-8 md:px-20">
//           <div className="relative mx-auto flex max-w-2xl items-center justify-between">
//             <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/20" />
//             <motion.span
//               className="absolute left-0 top-1/2 h-px w-full origin-left -translate-y-1/2 bg-accent-300"
//               style={{ scaleX: reduce ? 1 : progress }}
//             />
//             {MEALS.map((m, i) => (
//               <span
//                 key={m.time}
//                 className={`relative block h-3.5 w-3.5 rounded-full transition-all duration-500 ${
//                   i === active
//                     ? "scale-125 bg-accent-300 shadow-[0_0_16px_4px_rgba(250,204,21,0.45)]"
//                     : i < active
//                       ? "bg-accent-400/60"
//                       : "bg-white/30"
//                 }`}
//               />
//             ))}
//           </div>
//         </div>
//       </motion.section>
//     </div>
//   );
// }

// function Aperture({
//   meal,
//   index,
//   span,
//   progress,
//   reduce,
// }: {
//   meal: (typeof MEALS)[number];
//   index: number;
//   span: number;
//   progress: MotionValue<number>;
//   reduce: boolean;
// }) {
//   const start = index === 0 ? -0.001 : index * span;
//   const end = index * span + span * 0.68;

//   const radius = useTransform(progress, [start, end], [0, 76]);
//   const clipPath = useTransform(radius, (r) => `circle(${r}% at 50% 50%)`);
//   const scale = useTransform(progress, [start, end + span * 0.3], [1.22, 1.02]);
//   const rotate = useTransform(progress, [start, end], [-5, 0]);

//   return (
//     <motion.div
//       className="absolute inset-0"
//       style={{
//         clipPath: reduce ? "circle(76% at 50% 50%)" : clipPath,
//         zIndex: index + 1,
//         willChange: "clip-path",
//       }}
//     >
//       <motion.img
//         src={meal.img}
//         alt={meal.label}
//         className="h-full w-full object-cover"
//         style={{
//           scale: reduce ? 1 : scale,
//           rotate: reduce ? 0 : rotate,
//           willChange: "transform",
//         }}
//       />
//       <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary-950/45" />
//     </motion.div>
//   );
// }

// export { MealTimeJourneySection };

//version 4

"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  useMotionValueEvent,
  useMotionTemplate,
  MotionValue,
} from "framer-motion";

const MEALS = [
  {
    label: "អាហារពេលព្រឹក",
    dish: "បបរគ្រឿង",
    time: "០៦:៣០",
    note: "ចាប់ផ្ដើមថ្ងៃដោយភាពស្រាល",
    img: "/Image/food/food1.png",
  },
  {
    label: "អាហារថ្ងៃត្រង់",
    dish: "សម្លម្ជូរ",
    time: "១២:០០",
    note: "ឆ្អែតពេញ សម្រាប់រសៀលវែង",
    img: "/Image/food/food4.png",
  },
  {
    label: "អាហារពេលល្ងាច",
    dish: "ឡុកឡាក់",
    time: "១៨:៣០",
    note: "ក្ដៅៗ ជាមួយក្រុមគ្រួសារ",
    img: "/Image/food/food7.png",
  },
  {
    label: "អាហារសម្រន់",
    dish: "នំចាក់",
    time: "២១:០០",
    note: "ផ្អែមបន្តិច មុនចូលដំណេក",
    img: "/Image/food/food9.png",
  },
];

const STARS: [number, number][] = [
  [12, 18],
  [24, 9],
  [37, 22],
  [48, 12],
  [61, 20],
  [72, 8],
  [83, 24],
  [91, 14],
  [18, 32],
  [55, 30],
  [67, 35],
  [30, 15],
];

export default function MealTimeJourneySection() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 65,
    damping: 25,
    mass: 0.45,
    restDelta: 0.0005,
  });

  const span = 1 / (MEALS.length + 0.5);

  useMotionValueEvent(progress, "change", (v) => {
    setActive(Math.min(MEALS.length - 1, Math.max(0, Math.floor(v / span))));
  });

  /* ---------------- sky ---------------- */
  const skyTop = useTransform(
    progress,
    [0, 0.22, 0.5, 0.76, 1],
    ["#1e3a5f", "#2563a0", "#3b8fd4", "#7c2d12", "#031b0d"],
  );
  const skyMid = useTransform(
    progress,
    [0, 0.22, 0.5, 0.76, 1],
    ["#7c3f12", "#c2410c", "#86c5e8", "#c2410c", "#052e16"],
  );
  const skyLow = useTransform(
    progress,
    [0, 0.22, 0.5, 0.76, 1],
    ["#facc15", "#fdba74", "#fef9c3", "#f97316", "#0d2f1a"],
  );
  const sky = useMotionTemplate`linear-gradient(to bottom, ${skyTop} 0%, ${skyMid} 52%, ${skyLow} 100%)`;

  /* ---------------- sun path ---------------- */
  const sunX = useTransform(progress, [0, 1], ["6%", "94%"]);
  const sunY = useTransform(
    progress,
    [0, 0.12, 0.3, 0.5, 0.7, 0.88, 1],
    ["86%", "58%", "30%", "17%", "30%", "58%", "86%"],
  );

  /* ---------------- sun shape ---------------- */
  // wider than tall near the horizon — atmospheric refraction
  const sunScaleX = useTransform(
    progress,
    [0, 0.18, 0.5, 0.82, 1],
    [1.28, 1.18, 1, 1.18, 1.28],
  );
  const sunScaleY = useTransform(
    progress,
    [0, 0.18, 0.5, 0.82, 1],
    [1.0, 1.1, 1, 1.1, 1.0],
  );

  /* ---------------- sun colour ---------------- */
  const coreColor = useTransform(
    progress,
    [0, 0.2, 0.5, 0.8, 1],
    ["#ffb367", "#ffe1a3", "#ffffff", "#ffd08a", "#ff9d4d"],
  );
  const haloColor = useTransform(
    progress,
    [0, 0.2, 0.5, 0.8, 1],
    ["#f97316", "#fbbf24", "#fef3c7", "#fb923c", "#ea580c"],
  );
  const rimColor = useTransform(
    progress,
    [0, 0.2, 0.5, 0.8, 1],
    ["#c2410c", "#f59e0b", "#facc15", "#ea580c", "#9a3412"],
  );
  const discGradient = useMotionTemplate`radial-gradient(circle at 50% 46%, ${coreColor} 0%, ${coreColor} 16%, ${haloColor} 54%, ${rimColor} 100%)`;

  /* ---------------- sun light ---------------- */
  const glowRGBA = useTransform(
    progress,
    [0, 0.2, 0.5, 0.8, 1],
    [
      "rgba(249,115,22,0.42)",
      "rgba(251,191,36,0.50)",
      "rgba(254,243,199,0.62)",
      "rgba(251,146,60,0.50)",
      "rgba(194,65,12,0.40)",
    ],
  );
  const nearGlow = useMotionTemplate`radial-gradient(circle, ${glowRGBA} 0%, transparent 62%)`;
  const wideGlow = useMotionTemplate`radial-gradient(circle, ${glowRGBA} 0%, transparent 72%)`;

  const bloomA = useTransform(progress, [0, 0.5, 1], [26, 54, 26]);
  const bloomB = useTransform(progress, [0, 0.5, 1], [40, 90, 40]);
  const bloom = useMotionTemplate`0 0 ${bloomA}px ${bloomB}px ${glowRGBA}`;

  // shafts read at low angles, not overhead
  const shaftOpacity = useTransform(
    progress,
    [0.06, 0.26, 0.5, 0.74, 0.94],
    [0, 0.3, 0.1, 0.3, 0],
  );
  const washOpacity = useTransform(
    progress,
    [0, 0.5, 0.85, 1],
    [0.16, 0.08, 0.2, 0],
  );

  // lens ghosts mirrored through screen centre
  const ghostLeft = useMotionTemplate`calc(100% - ${sunX})`;
  const ghostTop = useMotionTemplate`calc(100% - ${sunY})`;
  const ghostLeftB = useMotionTemplate`calc(50% + (100% - ${sunX} - 50%) * 0.5)`;
  const ghostTopB = useMotionTemplate`calc(50% + (100% - ${sunY} - 50%) * 0.5)`;
  const ghostOpacity = useTransform(progress, [0.12, 0.5, 0.88], [0, 0.14, 0]);

  const horizonHaze = useMotionTemplate`linear-gradient(to top, ${haloColor} 0%, transparent 85%)`;

  /* ---------------- stage ---------------- */
  const starOpacity = useTransform(progress, [0.74, 0.95], [0, 1]);
  const dialRotate = useTransform(progress, [0, 1], [0, 360]);
  const sheen = useMotionTemplate`radial-gradient(circle at ${sunX} -10%, rgba(255,255,255,0.28), transparent 62%)`;

  return (
    <div ref={ref} style={{ height: `${(MEALS.length + 0.5) * 100}vh` }}>
      <motion.section
        className="sticky top-0 h-screen overflow-hidden"
        style={{
          backgroundImage: reduce ? "linear-gradient(#052e16,#0d2f1a)" : sky,
        }}
      >
        {/* stars */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-0"
          style={{ opacity: reduce ? 0 : starOpacity }}
        >
          {STARS.map(([l, t], i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: `${l}%`,
                top: `${t}%`,
                width: i % 3 === 0 ? 3 : 2,
                height: i % 3 === 0 ? 3 : 2,
              }}
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{
                duration: 2.6 + (i % 4),
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>

        {/* volumetric shafts */}
        <motion.div
          className="pointer-events-none absolute z-[9] h-[150vh] w-[150vh] mix-blend-screen"
          style={{
            left: sunX,
            top: sunY,
            x: "-50%",
            y: "-50%",
            opacity: reduce ? 0 : shaftOpacity,
            filter: "blur(42px)",
            background:
              "conic-gradient(from 12deg, transparent 0deg 16deg, rgba(255,236,180,0.55) 22deg 30deg, transparent 36deg 62deg, rgba(255,236,180,0.35) 68deg 78deg, transparent 84deg 120deg, rgba(255,236,180,0.45) 128deg 138deg, transparent 146deg 200deg, rgba(255,236,180,0.30) 208deg 216deg, transparent 224deg 360deg)",
            maskImage:
              "radial-gradient(circle, black 6%, rgba(0,0,0,0.35) 30%, transparent 66%)",
            WebkitMaskImage:
              "radial-gradient(circle, black 6%, rgba(0,0,0,0.35) 30%, transparent 66%)",
          }}
        />

        {/* sun */}
        <div className="pointer-events-none absolute inset-0 z-10">
          <motion.div
            className="absolute"
            style={{ left: sunX, top: sunY, x: "-50%", y: "-50%" }}
          >
            {/* wide atmospheric scatter */}
            <motion.div
              className="absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
              style={{
                backgroundImage: reduce ? "none" : wideGlow,
                filter: "blur(30px)",
                opacity: 0.7,
              }}
            />
            {/* near glow */}
            <motion.div
              className="absolute left-1/2 top-1/2 h-[26vh] w-[26vh] -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
              style={{
                backgroundImage: reduce ? "none" : nearGlow,
                filter: "blur(14px)",
              }}
            />
            {/* disc */}
            <motion.div
              className="h-20 w-20 rounded-full md:h-28 md:w-28"
              style={{
                backgroundImage: reduce ? "none" : discGradient,
                backgroundColor: reduce ? "#facc15" : undefined,
                boxShadow: reduce
                  ? "0 0 60px 70px rgba(250,204,21,0.2)"
                  : bloom,
                scaleX: reduce ? 1 : sunScaleX,
                scaleY: reduce ? 1 : sunScaleY,
                filter: "blur(0.6px)",
              }}
            />
          </motion.div>

          {/* lens ghosts */}
          <motion.span
            className="absolute h-16 w-16 rounded-full mix-blend-screen"
            style={{
              left: ghostLeft,
              top: ghostTop,
              x: "-50%",
              y: "-50%",
              opacity: reduce ? 0 : ghostOpacity,
              background:
                "radial-gradient(circle, rgba(255,224,150,0.9) 0%, transparent 70%)",
              filter: "blur(6px)",
            }}
          />
          <motion.span
            className="absolute h-8 w-8 rounded-full mix-blend-screen"
            style={{
              left: ghostLeftB,
              top: ghostTopB,
              x: "-50%",
              y: "-50%",
              opacity: reduce ? 0 : ghostOpacity,
              background:
                "radial-gradient(circle, rgba(255,246,214,0.9) 0%, transparent 70%)",
              filter: "blur(3px)",
            }}
          />
        </div>

        {/* warm light wash */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-[12] mix-blend-soft-light"
          style={{
            backgroundColor: reduce ? "transparent" : haloColor,
            opacity: reduce ? 0 : washOpacity,
          }}
        />

        {/* horizon haze */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[13] h-[38%]"
          style={{
            backgroundImage: reduce ? "none" : horizonHaze,
            opacity: reduce ? 0 : 0.28,
            filter: "blur(18px)",
          }}
        />

        {/* hills — the sun rises out of and sets behind these */}
        <svg
          viewBox="0 0 1440 260"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-[26vh] w-full"
        >
          <path
            d="M0,150 C220,90 360,180 560,140 C760,100 900,190 1120,150 C1280,120 1380,160 1440,140 L1440,260 L0,260 Z"
            fill="#0b3d22"
            opacity="0.9"
          />
          <path
            d="M0,196 C260,150 420,220 660,190 C880,162 1040,225 1240,196 C1340,182 1400,200 1440,192 L1440,260 L0,260 Z"
            fill="#052e16"
          />
        </svg>

        {/* grain */}
        <svg className="pointer-events-none absolute inset-0 z-[16] h-full w-full opacity-[0.12] mix-blend-overlay">
          <filter id="mealGrain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="3"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#mealGrain)" />
        </svg>

        {/* header */}
        {/* <div className="absolute inset-x-0 top-0 z-30 px-6 pt-8 text-center md:pt-10">
          <span className="text-lg font-medium tracking-[0.2em] text-white/80">
            គ្រប់ពេលវេលា
          </span>
          <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-bold leading-snug text-white drop-shadow-[0_2px_12px_rgba(5,46,22,0.7)] md:text-4xl">
            រាល់ពេលវេលា មានរសជាតិដែលសាកសមនឹងអ្នក
          </h2>
        </div> */}

        {/* stage */}
        <div className="relative z-20 flex h-full items-center justify-center px-6">
          <div className="relative h-[38vh] w-[38vh] max-h-[330px] max-w-[330px]">
            {/* dial */}
            <svg
              viewBox="0 0 200 200"
              className="absolute inset-[-9%] h-[118%] w-[118%] -rotate-90"
            >
              <defs>
                <linearGradient id="dialGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fde047" />
                  <stop offset="55%" stopColor="#facc15" />
                  <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>
              </defs>
              <circle
                cx="100"
                cy="100"
                r="92"
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="2"
              />
              <motion.circle
                cx="100"
                cy="100"
                r="92"
                fill="none"
                stroke="url(#dialGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                style={{ pathLength: reduce ? 1 : progress }}
              />
            </svg>

            {/* orbiting knob */}
            <motion.div
              className="pointer-events-none absolute inset-[-9%]"
              style={{ rotate: reduce ? 360 : dialRotate }}
            >
              <span className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-300 shadow-[0_0_20px_6px_rgba(250,204,21,0.45)]" />
            </motion.div>

            {/* photo aperture */}
            <div className="absolute inset-0 overflow-hidden rounded-full shadow-2xl shadow-primary-950/60">
              {MEALS.map((m, i) => (
                <Aperture
                  key={m.label}
                  meal={m}
                  index={i}
                  span={span}
                  progress={progress}
                  reduce={!!reduce}
                />
              ))}
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{ backgroundImage: reduce ? "none" : sheen }}
              />
              <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/25" />
            </div>

            {/* time chip */}
            <div className="absolute -top-3 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/20 bg-primary-950/60 px-5 py-1.5 backdrop-blur-md">
              <span className="font-mono text-lg tabular-nums text-accent-300">
                {MEALS[active].time}
              </span>
            </div>

            {/* glass panel */}
            {/* <motion.div
              key={MEALS[active].dish}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -bottom-16 left-1/2 z-30 w-[86vw] max-w-sm -translate-x-1/2 rounded-3xl border border-white/20 bg-white/[0.09] px-7 py-5 text-center shadow-xl shadow-primary-950/40 backdrop-blur-xl"
            >
              <p className="text-2xl font-black text-white md:text-3xl">
                {MEALS[active].dish}
              </p>
              <p className="mt-2 text-lg text-white/75">{MEALS[active].note}</p>
              <span className="mt-4 inline-block rounded-full bg-accent-400 px-5 py-1.5 text-lg font-bold text-primary-950">
                {MEALS[active].label}
              </span>
            </motion.div> */}
          </div>
        </div>

        {/* timeline */}
        <div className="absolute inset-x-0 bottom-8 z-30 px-8 md:px-20">
          <div className="relative mx-auto flex max-w-2xl items-center justify-between">
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/20" />
            <motion.span
              className="absolute left-0 top-1/2 h-px w-full origin-left -translate-y-1/2 bg-accent-300"
              style={{ scaleX: reduce ? 1 : progress }}
            />
            {MEALS.map((m, i) => (
              <span
                key={m.time}
                className={`relative block h-3.5 w-3.5 rounded-full transition-all duration-500 ${
                  i === active
                    ? "scale-125 bg-accent-300 shadow-[0_0_16px_4px_rgba(250,204,21,0.45)]"
                    : i < active
                      ? "bg-accent-400/60"
                      : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}

function Aperture({
  meal,
  index,
  span,
  progress,
  reduce,
}: {
  meal: (typeof MEALS)[number];
  index: number;
  span: number;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const start = index === 0 ? -0.001 : index * span;
  const end = index * span + span * 0.68;

  const radius = useTransform(progress, [start, end], [0, 76]);
  const clipPath = useTransform(radius, (r) => `circle(${r}% at 50% 50%)`);
  const scale = useTransform(progress, [start, end + span * 0.3], [1.22, 1.02]);
  const rotate = useTransform(progress, [start, end], [-5, 0]);

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        clipPath: reduce ? "circle(76% at 50% 50%)" : clipPath,
        zIndex: index + 1,
        willChange: "clip-path",
      }}
    >
      <motion.img
        src={meal.img}
        alt={meal.label}
        className="h-full w-full object-cover"
        style={{
          scale: reduce ? 1 : scale,
          rotate: reduce ? 0 : rotate,
          willChange: "transform",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary-950/45" />
    </motion.div>
  );
}
