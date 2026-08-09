// components/MentorSection.tsx
"use client";

import Image from "next/image";

import { motion, useReducedMotion } from "framer-motion";

/** Shared "expo out" curve — fast start, soft landing. Feels premium, not bouncy. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

interface SocialButtonProps {
  icon: "gh" | "fb" | "tg";
  href?: string;
  /** Stagger index so the three buttons pop in one after another. */
  index?: number;
}

function SocialButton({ icon, href, index = 0 }: SocialButtonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${icon}`}
      // className="size-10 sm:size-11 rounded-full bg-white text-[#1E2E3E] border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors focus:outline-none shadow-xs"
      // new
      className="size-10 sm:size-11 rounded-full bg-white dark:bg-[#1e3e29] text-[#1E2E3E] dark:text-white border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none shadow-xs"
      initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.6 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{
        type: "spring",
        stiffness: 460,
        damping: 17,
        delay: 0.75 + index * 0.09,
      }}
      whileHover={reduceMotion ? undefined : { y: -5, scale: 1.14 }}
      whileTap={reduceMotion ? undefined : { scale: 0.9 }}
    >
      {icon === "gh" && (
        <svg className="size-[22px] sm:size-6 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      )}

      {icon === "fb" && (
        <svg className="size-[22px] sm:size-6 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )}

      {icon === "tg" && (
        <svg className="size-[22px] sm:size-6 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.119.098.152.228.166.323.014.095.032.312.018.483z" />
        </svg>
      )}
    </motion.a>
  );
}

interface MentorCardProps {
  id: string;
  name: string;
  role: string;
  avatar: string;
  frameSrc?: string;
  /** Stagger index so the two mentors arrive one after the other. */
  index?: number;

  socials?: {
    facebook?: string;
    telegram?: string;
    github?: string;
  };
}

function MentorCard({
  name,
  role,
  avatar,
  frameSrc = "/about/frame.png",
  index = 0,
  socials,
}: MentorCardProps) {
  const reduceMotion = useReducedMotion();

  /** Mirror the spin direction per card so the pair feels choreographed. */
  const spinDirection = index % 2 === 0 ? 360 : -360;

  return (
    <div className="flex flex-col items-center">
      {/* ENTRANCE layer: lifts + un-blurs the whole medallion on scroll-in. */}
      <motion.div
        initial={
          reduceMotion
            ? false
            : { opacity: 0, y: 48, scale: 0.82, filter: "blur(10px)" }
        }
        whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.95, ease: EASE_OUT, delay: index * 0.18 }}
      >
        {/* FLOAT layer: endless slow bob, so the card never looks frozen. */}
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.9,
          }}
        >
          {/* Frame size adjusted to 280px on mobile -> 320px on desktop */}
          <div className="relative size-[280px] sm:size-[320px] flex items-center justify-center">
            {/* Soft breathing halo behind the portrait. */}
            <motion.span
              aria-hidden="true"
              // className="pointer-events-none absolute inset-0 m-auto size-[64%] rounded-full bg-[#F97316]/15 blur-2xl"
              // className="pointer-events-none absolute inset-0 m-auto size-[64%] rounded-full bg-[#F97316]/15 dark:bg-[#F97316]/25 blur-2xl"
              // className="pointer-events-none absolute inset-0 m-auto size-[62%] rounded-full border-2 border-[#136C34]/35"
              // className="pointer-events-none absolute inset-0 m-auto size-[62%] rounded-full border-2 border-[#00ff55]"
              className="pointer-events-none absolute inset-0 m-auto size-[62%] rounded-full border-2 border-[#ff5500]"
              animate={
                reduceMotion
                  ? undefined
                  : { scale: [1, 1.18, 1], opacity: [0.45, 0.9, 0.45] }
              }
              transition={{
                duration: 4.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.6,
              }}
            />

            {/* Expanding "sonar" ring that pulses out from the portrait edge. */}
            <motion.span
              aria-hidden="true"
              // className="pointer-events-none absolute inset-0 m-auto size-[62%] rounded-full border-2 border-[#136C34]/35"
              // className="pointer-events-none absolute inset-0 m-auto size-[62%] rounded-full border-2 border-[#00ff55]"
              className="pointer-events-none absolute inset-0 m-auto size-[62%] rounded-full border-2 border-[#ff5500]"
              animate={
                reduceMotion
                  ? undefined
                  : { scale: [1, 1.35], opacity: [0.7, 0] }
              }
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeOut",
                delay: index * 0.7,
              }}
            />

            {/* User Image */}
            <motion.div
              // className="relative size-[60%] rounded-full overflow-hidden bg-gray-100"
              // new
              className="relative size-[60%] rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800"
              // className="relative size-[60%] rounded-full overflow-hidden bg-gray-100 dark:bg-green-500"
              initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 15,
                delay: 0.28 + index * 0.18,
              }}
              whileHover={reduceMotion ? undefined : { scale: 1.07 }}
            >
              <Image
                src={avatar}
                alt={name}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 640px) 200px, 240px"
              />
            </motion.div>

            {/* Frame Overlay — now slowly orbits, which is what sells the effect. */}
            <motion.div
              className="absolute inset-0 size-full pointer-events-none z-10"
              initial={
                reduceMotion ? false : { rotate: -35, opacity: 0, scale: 1.12 }
              }
              whileInView={{ rotate: 0, opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                duration: 1.1,
                ease: EASE_OUT,
                delay: index * 0.18,
              }}
            >
              <motion.div
                className="size-full"
                animate={reduceMotion ? undefined : { rotate: spinDirection }}
                transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
              >
                <Image
                  src={frameSrc}
                  alt="Mentor Card Frame"
                  fill
                  className="absolute inset-0 size-full object-contain pointer-events-none z-10"
                  priority
                />
              </motion.div>
            </motion.div>

            {/* Comet dots running around the ring, counter to the frame. */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20"
              animate={reduceMotion ? undefined : { rotate: -spinDirection }}
              transition={{ duration: 7.5, repeat: Infinity, ease: "linear" }}
            >
              <span className="absolute left-1/2 top-[5%] size-2.5 -translate-x-1/2 rounded-full bg-[#F97316] shadow-[0_0_14px_4px_rgba(249,115,22,0.55)]" />
              <span className="absolute left-1/2 bottom-[5%] size-1.5 -translate-x-1/2 rounded-full dark:bg-[#00ff55] bg-[#136C34] shadow-[0_0_10px_3px_rgba(19,108,52,0.45)]" />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Info Section */}
      <div className="text-center flex flex-col items-center gap-1.5">
        <motion.p
          // className="font-['Kantumruy_Pro',sans-serif] font-bold text-[#1E2E3E] text-lg sm:text-2xl"
          // new
          className="font-['Kantumruy_Pro',sans-serif] font-bold text-[#1E2E3E] dark:text-white text-lg sm:text-2xl"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{
            duration: 0.6,
            ease: EASE_OUT,
            delay: 0.5 + index * 0.18,
          }}
        >
          {name}
        </motion.p>

        <motion.span
          // className="font-['Kantumruy_Pro',sans-serif] text-sm sm:text-base font-semibold px-5 py-1 rounded-full bg-[#E9F9EF] text-[#136C34]"
          // new
          className="font-['Kantumruy_Pro',sans-serif] text-sm sm:text-base font-semibold px-5 py-1 rounded-full bg-[#E9F9EF] dark:bg-[#136C34]/40 text-[#136C34] dark:text-[#00ff55]"
          initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.85 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 18,
            delay: 0.62 + index * 0.18,
          }}
        >
          {role}
        </motion.span>

        {/* <div className="flex gap-2.5 mt-1.5">
          <SocialButton icon="gh" index={0} />
          <SocialButton icon="fb" index={1} />
          <SocialButton icon="tg" index={2} />
        </div> */}

        <div className="flex gap-2.5 mt-1.5">
          <SocialButton icon="fb" href={socials?.facebook} index={0} />

          <SocialButton icon="tg" href={socials?.telegram} index={1} />

          <SocialButton icon="gh" href={socials?.github} index={2} />
        </div>
      </div>
    </div>
  );
}

const mentors: MentorCardProps[] = [
  {
    id: "mentor-1",
    name: "មុំ រស្មី",
    role: "Mentor",
    avatar: "/about/cher1.jpg",
    frameSrc: "/about/frame.png",

    socials: {
      facebook: "https://www.facebook.com/mom.reksmey.12",
      telegram: "https://t.me/reksmey_mom",
      github: "https://www.linkedin.com/in/reksmey-mom/",
    },
  },
  {
    id: "mentor-2",
    name: "អ៊ឹង លីហហ្សា",
    role: "Mentor",
    avatar: "/about/cher.jpg",
    frameSrc: "/about/frame.png",

    socials: {
      facebook: "https://www.facebook.com/lazizhia",
      telegram: "https://t.me/lyzhia",
      github: "https://github.com/lyzhiaa",
    },
  },
];

export default function MentorSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className=" py-14 md:py-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 sm:mb-16">
          <motion.h2
            className="font-['Kantumruy_Pro',sans-serif] font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-wide"
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: 30, letterSpacing: "0.18em" }
            }
            whileInView={{ opacity: 1, y: 0, letterSpacing: "0.025em" }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.85, ease: EASE_OUT }}
          >
            {/* <span className="text-[#136C34]">Mentors </span>
            <span className="text-[#F97316]">របស់យើង</span> */}

            {/* // new */}
            <span className="text-[#136C34] dark:text-[#4ADE80]">Mentors </span>
            <span className="text-[#F97316] dark:text-[#FB923C]">របស់យើង</span>
          </motion.h2>
        </div>

        <div className="flex flex-wrap gap-12 sm:gap-16 md:gap-20 justify-center items-center">
          {mentors.map((mentor, mentorIndex) => (
            <MentorCard key={mentor.id} {...mentor} index={mentorIndex} />
          ))}
        </div>
      </div>
    </section>
  );
}


// =================================================================================================
// // components/MentorSection.tsx
// "use client";

// import Image from "next/image";
// import { motion, useReducedMotion } from "framer-motion";

// const EASE_OUT = [0.22, 1, 0.36, 1] as const;
// const EASE_SHARP = [0.16, 1, 0.3, 1] as const; // steeper deceleration, feels like a fast dart-in

// interface SocialButtonProps {
//   icon: "gh" | "fb" | "tg";
//   href?: string;
//   index?: number;
// }

// function SocialButton({ icon, href, index = 0 }: SocialButtonProps) {
//   const reduceMotion = useReducedMotion();

//   return (
//     <motion.a
//       href={href}
//       target="_blank"
//       rel="noopener noreferrer"
//       aria-label={`Open ${icon}`}
//       className="size-10 sm:size-11 rounded-full bg-white dark:bg-[#1E2E3E] text-[#1E2E3E] dark:text-white border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none shadow-xs"
//       initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.6 }}
//       whileInView={{ opacity: 1, y: 0, scale: 1 }}
//       viewport={{ once: true, amount: 0.5 }}
//       transition={{ type: "spring", stiffness: 460, damping: 17, delay: 0.75 + index * 0.09 }}
//       whileHover={reduceMotion ? undefined : { y: -5, scale: 1.14 }}
//       whileTap={reduceMotion ? undefined : { scale: 0.9 }}
//     >
//       {icon === "gh" && (
//         <svg className="size-[22px] sm:size-6 fill-current" viewBox="0 0 24 24">
//           <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
//         </svg>
//       )}
//       {icon === "fb" && (
//         <svg className="size-[22px] sm:size-6 fill-current" viewBox="0 0 24 24">
//           <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
//         </svg>
//       )}
//       {icon === "tg" && (
//         <svg className="size-[22px] sm:size-6 fill-current" viewBox="0 0 24 24">
//           <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.119.098.152.228.166.323.014.095.032.312.018.483z" />
//         </svg>
//       )}
//     </motion.a>
//   );
// }

// /** Two rings of food emoji orbiting the portrait, spinning opposite directions — "two little worlds". */
// function FoodOrbit({ index = 0, reduceMotion }: { index?: number; reduceMotion: boolean | null }) {
//   if (reduceMotion) return null;

//   const innerFoods = ["🍜", "🍕", "🥗"];
//   const outerFoods = ["🍔", "🍱", "🍩"];
//   const innerDir = index % 2 === 0 ? 360 : -360;
//   const outerDir = -innerDir;

//   return (
//     <>
//       {/* Inner ring — closer, faster, smaller icons */}
//       <motion.div
//         aria-hidden="true"
//         className="pointer-events-none absolute inset-0 z-30"
//         animate={{ rotate: innerDir }}
//         transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
//       >
//         {innerFoods.map((food, i) => (
//           <span
//             key={food}
//             className="absolute text-base sm:text-lg drop-shadow-md"
//             style={{
//               top: "50%",
//               left: "50%",
//               transform: `rotate(${(360 / innerFoods.length) * i}deg) translate(0, -155%) rotate(-${
//                 (360 / innerFoods.length) * i
//               }deg)`,
//             }}
//           >
//             {food}
//           </span>
//         ))}
//       </motion.div>

//       {/* Outer ring — wider, slower, counter-rotating */}
//       <motion.div
//         aria-hidden="true"
//         className="pointer-events-none absolute inset-0 z-30"
//         animate={{ rotate: outerDir }}
//         transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
//       >
//         {outerFoods.map((food, i) => (
//           <span
//             key={food}
//             className="absolute text-lg sm:text-xl drop-shadow-md"
//             style={{
//               top: "50%",
//               left: "50%",
//               transform: `rotate(${(360 / outerFoods.length) * i + 40}deg) translate(0, -195%) rotate(-${
//                 (360 / outerFoods.length) * i + 40
//               }deg)`,
//             }}
//           >
//             {food}
//           </span>
//         ))}
//       </motion.div>
//     </>
//   );
// }

// /** Dark-mode-only flicker layer — quick lightning-style glow pulses. Pure CSS gate via dark: classes, no JS branching needed. */
// function LightningGlow({ index = 0 }: { index?: number }) {
//   return (
//     <motion.span
//       aria-hidden="true"
//       className="hidden dark:block pointer-events-none absolute inset-0 m-auto size-[70%] rounded-full"
//       style={{
//         background:
//           "radial-gradient(circle, rgba(249,115,22,0.35) 0%, rgba(19,108,52,0.25) 55%, transparent 75%)",
//       }}
//       animate={{ opacity: [0.25, 0.85, 0.35, 0.9, 0.3], scale: [1, 1.08, 1.02, 1.1, 1] }}
//       transition={{
//         duration: 2.6,
//         repeat: Infinity,
//         ease: "easeInOut",
//         delay: index * 0.5,
//         times: [0, 0.15, 0.4, 0.55, 1],
//       }}
//     />
//   );
// }

// interface MentorCardProps {
//   id: string;
//   name: string;
//   role: string;
//   avatar: string;
//   frameSrc?: string;
//   index?: number;
//   socials?: { facebook?: string; telegram?: string; github?: string };
// }

// function MentorCard({ name, role, avatar, frameSrc = "/about/frame.png", index = 0, socials }: MentorCardProps) {
//   const reduceMotion = useReducedMotion();
//   const spinDirection = index % 2 === 0 ? 360 : -360;
//   const flyFrom = index % 2 === 0 ? -220 : 220; // alternate entry side per card

//   return (
//     <div className="flex flex-col items-center">
//       {/* ENTRANCE: sharp lateral dart-in with rotation, instead of a soft float-up */}
//       <motion.div
//         initial={
//           reduceMotion
//             ? false
//             : { opacity: 0, x: flyFrom, y: -30, rotate: index % 2 === 0 ? -18 : 18, scale: 0.7, filter: "blur(6px)" }
//         }
//         whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, filter: "blur(0px)" }}
//         viewport={{ once: true, amount: 0.35 }}
//         transition={{ duration: 0.65, ease: EASE_SHARP, delay: index * 0.12 }}
//       >
//         <motion.div
//           animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
//           transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.9 }}
//         >
//           <div className="relative size-[280px] sm:size-[320px] flex items-center justify-center">
//             <motion.span
//               aria-hidden="true"
//               className="pointer-events-none absolute inset-0 m-auto size-[64%] rounded-full bg-[#F97316]/15 dark:bg-[#F97316]/10 blur-2xl"
//               animate={reduceMotion ? undefined : { scale: [1, 1.18, 1], opacity: [0.45, 0.9, 0.45] }}
//               transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: index * 0.6 }}
//             />

//             <LightningGlow index={index} />

//             <motion.span
//               aria-hidden="true"
//               className="pointer-events-none absolute inset-0 m-auto size-[62%] rounded-full border-2 border-[#136C34]/35 dark:border-[#4ADE80]/40"
//               animate={reduceMotion ? undefined : { scale: [1, 1.35], opacity: [0.7, 0] }}
//               transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut", delay: index * 0.7 }}
//             />

//             <FoodOrbit index={index} reduceMotion={reduceMotion} />

//             <motion.div
//               className="relative size-[60%] rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800"
//               initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }}
//               whileInView={{ scale: 1, opacity: 1 }}
//               viewport={{ once: true, amount: 0.4 }}
//               transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.28 + index * 0.18 }}
//               whileHover={reduceMotion ? undefined : { scale: 1.07 }}
//             >
//               <Image src={avatar} alt={name} fill unoptimized className="object-cover" sizes="(max-width: 640px) 200px, 240px" />
//             </motion.div>

//             <motion.div
//               className="absolute inset-0 size-full pointer-events-none z-10"
//               initial={reduceMotion ? false : { rotate: -35, opacity: 0, scale: 1.12 }}
//               whileInView={{ rotate: 0, opacity: 1, scale: 1 }}
//               viewport={{ once: true, amount: 0.35 }}
//               transition={{ duration: 1.1, ease: EASE_OUT, delay: index * 0.18 }}
//             >
//               <motion.div
//                 className="size-full"
//                 animate={reduceMotion ? undefined : { rotate: spinDirection }}
//                 transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
//               >
//                 <Image src={frameSrc} alt="Mentor Card Frame" fill className="absolute inset-0 size-full object-contain pointer-events-none z-10" priority />
//               </motion.div>
//             </motion.div>

//             <motion.div
//               aria-hidden="true"
//               className="pointer-events-none absolute inset-0 z-20"
//               animate={reduceMotion ? undefined : { rotate: -spinDirection }}
//               transition={{ duration: 7.5, repeat: Infinity, ease: "linear" }}
//             >
//               <span className="absolute left-1/2 top-[5%] size-2.5 -translate-x-1/2 rounded-full bg-[#F97316] shadow-[0_0_14px_4px_rgba(249,115,22,0.55)]" />
//               <span className="absolute left-1/2 bottom-[5%] size-1.5 -translate-x-1/2 rounded-full bg-[#136C34] shadow-[0_0_10px_3px_rgba(19,108,52,0.45)]" />
//             </motion.div>
//           </div>
//         </motion.div>
//       </motion.div>

//       <div className="text-center flex flex-col items-center gap-1.5">
//         <motion.p
//           className="font-['Kantumruy_Pro',sans-serif] font-bold text-[#1E2E3E] dark:text-white text-lg sm:text-2xl"
//           initial={reduceMotion ? false : { opacity: 0, y: 18 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, amount: 0.5 }}
//           transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.5 + index * 0.18 }}
//         >
//           {name}
//         </motion.p>

//         <motion.span
//           className="font-['Kantumruy_Pro',sans-serif] text-sm sm:text-base font-semibold px-5 py-1 rounded-full bg-[#E9F9EF] dark:bg-[#136C34]/20 text-[#136C34] dark:text-[#4ADE80]"
//           initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.85 }}
//           whileInView={{ opacity: 1, y: 0, scale: 1 }}
//           viewport={{ once: true, amount: 0.5 }}
//           transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.62 + index * 0.18 }}
//         >
//           {role}
//         </motion.span>

//         <div className="flex gap-2.5 mt-1.5">
//           <SocialButton icon="fb" href={socials?.facebook} index={0} />
//           <SocialButton icon="tg" href={socials?.telegram} index={1} />
//           <SocialButton icon="gh" href={socials?.github} index={2} />
//         </div>
//       </div>
//     </div>
//   );
// }

// const mentors: MentorCardProps[] = [
//   {
//     id: "mentor-1",
//     name: "មុំ រស្មី",
//     role: "Mentor",
//     avatar: "/about/cher1.jpg",
//     frameSrc: "/about/frame.png",
//     socials: {
//       facebook: "https://www.facebook.com/mom.reksmey.12",
//       telegram: "https://t.me/reksmey_mom",
//       github: "https://www.linkedin.com/in/reksmey-mom/",
//     },
//   },
//   {
//     id: "mentor-2",
//     name: "អ៊ឹង លីហហ្សា",
//     role: "Mentor",
//     avatar: "/about/cher.jpg",
//     frameSrc: "/about/frame.png",
//     socials: {
//       facebook: "https://www.facebook.com/lazizhia",
//       telegram: "https://t.me/lyzhia",
//       github: "https://github.com/lyzhiaa",
//     },
//   },
// ];

// export default function MentorSection() {
//   const reduceMotion = useReducedMotion();

//   return (
//     <section className="py-14 md:py-24 px-4 sm:px-8">
//       <div className="max-w-6xl mx-auto">
//         <div className="text-center mb-14 sm:mb-16">
//           <motion.h2
//             className="font-['Kantumruy_Pro',sans-serif] font-extrabold text-3xl sm:text-5xl md:text-6xl tracking-wide"
//             initial={reduceMotion ? false : { opacity: 0, y: 30, letterSpacing: "0.18em" }}
//             whileInView={{ opacity: 1, y: 0, letterSpacing: "0.025em" }}
//             viewport={{ once: true, amount: 0.6 }}
//             transition={{ duration: 0.85, ease: EASE_OUT }}
//           >
//             <span className="text-[#136C34] dark:text-[#4ADE80]">Mentors </span>
//             <span className="text-[#F97316] dark:text-[#FB923C]">របស់យើង</span>
//           </motion.h2>
//         </div>

//         <div className="flex flex-wrap gap-12 sm:gap-16 md:gap-20 justify-center items-center">
//           {mentors.map((mentor, mentorIndex) => (
//             <MentorCard key={mentor.id} {...mentor} index={mentorIndex} />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }