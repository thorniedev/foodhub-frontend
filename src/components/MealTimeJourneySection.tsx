"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { FaShieldAlt, FaStore, FaArrowRight } from "react-icons/fa";

import { useGetMenuItemsQuery } from "@/app/store/menuApi";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { sortFoodsForProfile } from "@/lib/recommendation/profileFoodPreferences";
import { toFrontendApiAssetUrl } from "@/lib/catalog-media";
import type { CatalogMenuItem } from "@/types/catalog-menu-item";

/* =========================================================
   MEAL CONFIGURATION & TIME SLOTS
========================================================= */

type MealSlotConfig = {
  id: string;
  label: string;
  defaultTime: string;
  defaultDish: string;
  note: string;
  mealCodes: string[];
  fallbackImg: string;
};

const MEAL_SLOTS: MealSlotConfig[] = [
  {
    id: "MORNING",
    label: "អាហារពេលព្រឹក",
    defaultTime: "០៧:០០",
    defaultDish: "បបរគ្រឿងឈ្ងុយឆ្ងាញ់",
    note: "ចាប់ផ្ដើមថ្ងៃថ្មីដោយភាពស្រស់ស្រាយ និងថាមពល",
    mealCodes: ["MORNING", "BREAKFAST", "ព្រឹក", "អាហារពេលព្រឹក"],
    fallbackImg: "/Image/food/food4.png",
  },
  {
    id: "LUNCH",
    label: "អាហារថ្ងៃត្រង់",
    defaultTime: "១២:០០",
    defaultDish: "សម្លម្ជូរគ្រឿងខ្មែរ",
    note: "ឆ្អែតពេញលេញ មានជីវជាតិ សម្រាប់រសៀលវែង",
    mealCodes: ["LUNCH", "MIDDAY", "ថ្ងៃ", "អាហារថ្ងៃត្រង់", "អាហារពេលថ្ងៃ"],
    fallbackImg: "/Image/food/food5.png",
  },
  {
    id: "DINNER",
    label: "អាហារពេលល្ងាច",
    defaultTime: "១៨:៣០",
    defaultDish: "ឡុកឡាក់សាច់គោពិសេស",
    note: "ម្ហូបក្ដៅៗ ឈ្ងុយឆ្ងាញ់ ជួបជុំក្រុមគ្រួសារ",
    mealCodes: ["DINNER", "EVENING", "NIGHT", "ល្ងាច", "អាហារពេលល្ងាច"],
    fallbackImg: "/Image/food/food7.png",
  },
  {
    id: "SNACK",
    label: "អាហារសម្រន់",
    defaultTime: "២១:០០",
    defaultDish: "បង្អែមខ្មែរផ្អែមស្រទន់",
    note: "ស្រាលស្រទន់ រសជាតិផ្អែមល្ហែមមុនចូលដំណេក",
    mealCodes: [
      "SNACK",
      "DESSERT",
      "LATE_NIGHT",
      "សម្រន់",
      "អាហារសម្រន់",
      "បង្អែម",
    ],
    fallbackImg: "/Image/food/food9.png",
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

/* =========================================================
   KHMER TIME FORMATTER
========================================================= */

function formatKhmerTime(date: Date): string {
  const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const khmerHours = hours
    .split("")
    .map((d) => khmerDigits[Number(d)] ?? d)
    .join("");
  const khmerMinutes = minutes
    .split("")
    .map((d) => khmerDigits[Number(d)] ?? d)
    .join("");

  return `${khmerHours}:${khmerMinutes}`;
}

function getMealIndexByHour(hour: number): number {
  if (hour >= 5 && hour < 11) return 0; // Morning (05:00 - 10:59)
  if (hour >= 11 && hour < 15) return 1; // Lunch (11:00 - 14:59)
  if (hour >= 15 && hour < 21) return 2; // Dinner (15:00 - 20:59)
  return 3; // Night / Snack (21:00 - 04:59)
}

/* =========================================================
   DISH IMAGE COMPONENT WITH FALLBACK
========================================================= */

function MealDishImage({
  src,
  alt,
  fallbackSrc,
}: {
  src: string;
  alt: string;
  fallbackSrc: string;
}) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      unoptimized
      priority
      sizes="(max-width: 768px) 360px, 420px"
      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function MealTimeJourneySection() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Active user profile & safety preferences
  const { activeProfile } = useActiveProfile();

  // Fetch real menu items from catalog API
  const { data: menuItems = [] } = useGetMenuItemsQuery();

  // Current live time
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const [active, setActive] = useState<number>(() => {
    return getMealIndexByHour(new Date().getHours());
  });

  // Keep current time updated
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  // Filter and rank safe foods for the active profile
  const safeFoods = useMemo<CatalogMenuItem[]>(() => {
    if (!menuItems || menuItems.length === 0) return [];
    return sortFoodsForProfile(menuItems, activeProfile);
  }, [menuItems, activeProfile]);

  // Match real foods for each meal slot
  const resolvedMeals = useMemo(() => {
    const usedUuids = new Set<string>();
    const currentHour = currentTime.getHours();
    const currentMealIdx = getMealIndexByHour(currentHour);

    return MEAL_SLOTS.map((slot, index) => {
      // 1. Look for safe items matching this slot's meal codes
      const matched = safeFoods.find((item) => {
        if (usedUuids.has(item.uuid)) return false;
        const types = Array.isArray(item.food?.mealTypes)
          ? item.food.mealTypes
          : [];
        return types.some((t) => {
          const code = String(t.code ?? "").toUpperCase();
          const name = String(t.name ?? "").toUpperCase();
          return slot.mealCodes.some(
            (mc) =>
              code.includes(mc.toUpperCase()) ||
              name.includes(mc.toUpperCase()),
          );
        });
      });

      // 2. Fallback to any unused safe food if no exact mealType tag
      const chosenFood =
        matched ||
        safeFoods.find((item) => !usedUuids.has(item.uuid)) ||
        safeFoods[index % (safeFoods.length || 1)] ||
        null;

      if (chosenFood?.uuid) {
        usedUuids.add(chosenFood.uuid);
      }

      const isCurrentSlot = index === currentMealIdx;
      const displayTime = isCurrentSlot
        ? formatKhmerTime(currentTime)
        : slot.defaultTime;

      const dishName =
        chosenFood?.localName || chosenFood?.name || slot.defaultDish;
      const rawImage =
        chosenFood?.thumbnail ||
        (Array.isArray(chosenFood?.gallery) && chosenFood.gallery[0]) ||
        slot.fallbackImg;
      const imageUrl = toFrontendApiAssetUrl(rawImage, slot.fallbackImg);

      return {
        id: slot.id,
        label: slot.label,
        dish: dishName,
        time: displayTime,
        note: slot.note,
        img: imageUrl,
        fallbackImg: slot.fallbackImg,
        uuid: chosenFood?.uuid ?? null,
        price: chosenFood?.price != null ? `$${chosenFood.price}` : null,
        storeName:
          chosenFood?.store?.name || chosenFood?.store?.localName || null,
        isSafe: Boolean(activeProfile),
        profileName: activeProfile?.profileName || null,
      };
    });
  }, [safeFoods, currentTime, activeProfile]);

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

  const span = 1 / (resolvedMeals.length + 0.5);

  useMotionValueEvent(progress, "change", (v) => {
    setActive(
      Math.min(resolvedMeals.length - 1, Math.max(0, Math.floor(v / span))),
    );
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

  /* ---------------- chicken + coop ---------------- */
  const chickenX = useTransform(progress, [0, 0.15, 0.2], [-360, -80, 0]);
  const chickenY = useTransform(
    progress,
    [0, 0.08, 0.15, 0.2],
    [-16, -9, -2, -40],
  );
  const chickenTilt = useTransform(progress, [0.15, 0.17, 0.2], [0, -12, -12]);
  const chickenOpacity = useTransform(progress, [0, 0.185, 0.2], [1, 1, 0]);
  const coopLight = useTransform(progress, [0.64, 0.8, 1], [0, 0.85, 1]);

  const currentActiveMeal = resolvedMeals[active] || resolvedMeals[0];

  return (
    <div
      ref={ref}
      className="relative w-full max-w-full overflow-x-clip"
      style={{ height: `${(resolvedMeals.length + 0.5) * 100}vh` }}
    >
      <motion.section
        className="sticky top-0 h-screen w-full max-w-full overflow-hidden"
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

        {/* hills */}
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

        {/* dawn scene — farm coop & chicken */}
        <div
          className="pointer-events-none absolute bottom-[6.3vh] left-[38%] z-[15]"
          style={{ opacity: reduce ? 0 : 1 }}
        >
          <div className="absolute bottom-0 left-0 h-[150px] w-[179px] -translate-x-[34%] translate-y-[9.5%] md:h-[172px] md:w-[205px]">
            <svg viewBox="0 0 100 84" className="h-full w-full">
              <path
                d="M27,55 L-8,76"
                stroke="#03210e"
                strokeWidth="7"
                fill="none"
              />
              <g stroke="#0c3a1e" strokeWidth="1.6" strokeLinecap="round">
                <path d="M20,56 L17,62" />
                <path d="M11,61 L8,67" />
                <path d="M2,66 L-1,72" />
              </g>
              <rect x="20" y="22" width="60" height="34" fill="#01120a" />
              <motion.rect
                x="58"
                y="30"
                width="16"
                height="12"
                fill="#facc15"
                style={{ opacity: reduce ? 0 : coopLight }}
              />
              <motion.rect
                x="25"
                y="34"
                width="18"
                height="22"
                fill="#f59e0b"
                style={{ opacity: reduce ? 0 : coopLight }}
                opacity={0.35}
              />
            </svg>
          </div>

          <motion.div
            className="absolute bottom-0 left-0"
            style={{
              x: chickenX,
              y: chickenY,
              rotate: reduce ? 0 : chickenTilt,
              opacity: reduce ? 0 : chickenOpacity,
            }}
          >
            <motion.div
              animate={{ y: [0, -2.5, 0, -1.5, 0] }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="-translate-x-1/2 translate-y-[4.5%]">
                <svg
                  viewBox="0 0 66 56"
                  className="h-[50px] w-[59px] md:h-[58px] md:w-[68px]"
                  style={{
                    filter: "drop-shadow(-2px -1px 2px rgba(255,178,90,0.5))",
                  }}
                >
                  <g fill="#03210e">
                    <path d="M14,27 C8,19 6,10 12,5 C14,14 19,19 22,23 Z" />
                    <ellipse cx="30" cy="30" rx="19" ry="14" />
                    <motion.g
                      style={{
                        transformOrigin: "40px 28px",
                        transformBox: "view-box",
                      }}
                      animate={{ rotate: [0, 4, 0, -3, 0] }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <ellipse
                        cx="43"
                        cy="22"
                        rx="6.5"
                        ry="9"
                        transform="rotate(-32 43 22)"
                      />
                      <circle cx="49" cy="16" r="8" />
                      <path d="M44,9 C45,4 48,4 48.5,7.5 C50,3 54,5 53,9 C50.5,7.6 46.5,7.8 44,9 Z" />
                      <path d="M57,15 L64,17 L57,20 Z" />
                      <circle cx="55" cy="23" r="2.6" />
                      <circle
                        cx="52"
                        cy="15"
                        r="1.2"
                        fill="rgba(255,214,150,0.6)"
                      />
                    </motion.g>
                  </g>

                  <g
                    stroke="#03210e"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    fill="none"
                  >
                    <motion.g
                      style={{
                        transformOrigin: "26px 40px",
                        transformBox: "view-box",
                      }}
                      animate={{ rotate: [16, -16, 16] }}
                      transition={{
                        duration: 0.9,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <path d="M26,40 L26,53" />
                      <path d="M22,53.5 L31,53.5" />
                    </motion.g>
                    <motion.g
                      style={{
                        transformOrigin: "35px 40px",
                        transformBox: "view-box",
                      }}
                      animate={{ rotate: [-16, 16, -16] }}
                      transition={{
                        duration: 0.9,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <path d="M35,40 L35,53" />
                      <path d="M31,53.5 L40,53.5" />
                    </motion.g>
                  </g>
                </svg>
              </div>
            </motion.div>
          </motion.div>

          <div className="absolute bottom-0 left-0 h-[150px] w-[179px] -translate-x-[34%] translate-y-[9.5%] md:h-[172px] md:w-[205px]">
            <svg
              viewBox="0 0 100 84"
              className="h-full w-full"
              style={{
                filter: "drop-shadow(-2px -1px 2px rgba(255,178,90,0.4))",
              }}
            >
              <path
                d="M26,56 h6 v20 h-6 Z M68,56 h6 v20 h-6 Z"
                fill="#03210e"
              />
              <path d="M17,55 h66 v4 h-66 Z" fill="#03210e" />
              <path
                fillRule="evenodd"
                d="M20,22 H80 V56 H20 Z M25,56 V36 A9,9 0 0 1 43,36 V56 Z M58,30 H74 V42 H58 Z"
                fill="#03210e"
              />
              <path d="M10,27 L52,3 L94,27 Z" fill="#03210e" />
              <path d="M49,7 h6 v-5 h-6 Z" fill="#03210e" />
            </svg>
          </div>
        </div>

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

        {/* stage */}
        <div className="relative z-20 flex h-full items-center justify-center px-4">
          <div className="relative h-[42vh] w-[42vh] max-h-[360px] max-w-[360px] sm:max-h-[390px] sm:max-w-[390px] md:max-h-[420px] md:max-w-[420px]">
            {/* dial track */}
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

            {/* photo aperture - circular container with food photo & details INSIDE */}
            <div className="group absolute inset-0 overflow-hidden rounded-full shadow-2xl shadow-primary-950/70 border-[2px] border-white/30 bg-primary-950">
              {/* Active Dish Food Photo */}
              <motion.div
                key={currentActiveMeal.id + currentActiveMeal.img}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="absolute inset-0 h-full w-full"
              >
                <MealDishImage
                  src={currentActiveMeal.img}
                  alt={currentActiveMeal.dish}
                  fallbackSrc={currentActiveMeal.fallbackImg}
                />
              </motion.div>

              {/* Gradient Scrim */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              {/* Sheen effect */}
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{ backgroundImage: reduce ? "none" : sheen }}
              />
              <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/20" />

              {/* Time Badge - Top Inside Circle */}
              {/* <div className="absolute top-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/25 bg-black/80 px-3.5 py-0.5 backdrop-blur-md shadow-md">
                <span className="font-mono text-xs sm:text-sm tabular-nums text-accent-300 font-bold tracking-wider">
                  {currentActiveMeal.time}
                </span>
              </div> */}

              {/* Matching Dish Information - Bottom Inside Circle */}
              <motion.div
                key={currentActiveMeal.id + currentActiveMeal.dish}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center px-4 pt-4 pb-5 sm:pb-6 text-center"
              >
                {/* Tag & Safety status */}
                <div className="flex flex-col items-center gap-2 mb-2 p-2 rounded-[16px] bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                  <span className="rounded-full bg-accent-400 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-primary-950 shadow-sm">
                    {currentActiveMeal.label}
                  </span>

                  {currentActiveMeal.isSafe && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-300 bg-emerald-950/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <FaShieldAlt className="text-emerald-400 shrink-0 text-[9px]" />
                      <span className="truncate max-w-[120px]">
                        សុវត្ថិភាព {currentActiveMeal.profileName || ""}
                      </span>
                    </span>
                  )}
                </div>

                {/* Dish Name */}
                {/* <p className="line-clamp-1 text-sm sm:text-base font-bold text-white drop-shadow-md">
                  {currentActiveMeal.dish}
                </p> */}

                {/* Store & Price */}
                {/* {currentActiveMeal.storeName && (
                  <p className="flex items-center justify-center gap-1 line-clamp-1 text-[11px] sm:text-xs text-white/80 mt-0.5">
                    <FaStore className="shrink-0 text-accent-300 text-[10px]" />
                    <span className="truncate max-w-[140px] sm:max-w-[180px]">{currentActiveMeal.storeName}</span>
                    {currentActiveMeal.price && (
                      <span className="font-extrabold text-accent-300 ml-1">· {currentActiveMeal.price}</span>
                    )}
                  </p>
                )} */}

                {/* Action Link button */}
                {/* {currentActiveMeal.uuid && (
                  <Link
                    href={`/menu/${currentActiveMeal.uuid}`}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 px-3.5 py-1 text-[11px] sm:text-xs font-bold text-white transition active:scale-95 shadow-md"
                  >
                    <span>មើលមុខម្ហូបនេះ</span>
                    <FaArrowRight className="text-[9px]" />
                  </Link>
                )} */}
              </motion.div>
            </div>
          </div>
        </div>

        {/* timeline bottom nav */}
        <div className="absolute inset-x-0 bottom-6 z-30 px-6 sm:px-12 md:px-20">
          <div className="relative mx-auto flex max-w-xl items-center justify-between">
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/20" />
            <motion.span
              className="absolute left-0 top-1/2 h-px w-full origin-left -translate-y-1/2 bg-accent-300"
              style={{ scaleX: reduce ? 1 : progress }}
            />
            {resolvedMeals.map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  if (ref.current) {
                    const scrollTarget =
                      ref.current.offsetTop +
                      (i / (resolvedMeals.length - 1 || 1)) *
                        (ref.current.offsetHeight - window.innerHeight);
                    window.scrollTo({ top: scrollTarget, behavior: "smooth" });
                  }
                }}
                className="group relative flex flex-col items-center focus:outline-none"
                aria-label={m.label}
              >
                <span
                  className={`block h-3.5 w-3.5 rounded-full transition-all duration-500 cursor-pointer ${
                    i === active
                      ? "scale-125 bg-accent-300 shadow-[0_0_16px_4px_rgba(250,204,21,0.45)]"
                      : i < active
                        ? "bg-accent-400/60 hover:scale-110"
                        : "bg-white/30 hover:bg-white/60 hover:scale-110"
                  }`}
                />
                <span
                  className={`absolute -bottom-5 whitespace-nowrap text-[10px] font-medium transition-colors ${
                    i === active
                      ? "text-accent-300 font-semibold"
                      : "text-white/40 group-hover:text-white/80"
                  }`}
                >
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
