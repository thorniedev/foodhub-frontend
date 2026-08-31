"use client";

import Image from "next/image";
import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import {
  Check,
  HeartPulse,
  Leaf,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const FLOATING_PARTICLES = [
  { left: "8%", top: "18%", size: 6, delay: 0, duration: 5.5 },
  { left: "18%", top: "76%", size: 4, delay: 1.2, duration: 6.2 },
  { left: "76%", top: "13%", size: 5, delay: 0.7, duration: 5.8 },
  { left: "90%", top: "58%", size: 7, delay: 1.8, duration: 6.8 },
  { left: "58%", top: "88%", size: 4, delay: 2.4, duration: 5.2 },
] as const;

const PERSONALIZATION_POINTS = [
  { label: "ចំណូលចិត្ត", icon: Leaf },
  { label: "អាឡែស៊ី", icon: ShieldCheck },
  { label: "សុខភាព", icon: HeartPulse },
  { label: "គ្រួសារ", icon: Users },
  { label: "ទីតាំង", icon: MapPin },
] as const;

const FEATURE_STEPS = [
  {
    title: "កំណត់ចំណូលចិត្ត",
    description: "ជ្រើសរើសម្ហូប អាឡែស៊ី និងរបបអាហាររបស់អ្នក",
    tint: "from-secondary-50 to-white",
    preview: (
      <div className="relative mt-6 flex w-full justify-center">
        <div className="relative z-10 flex items-center rounded-full bg-primary-600 p-2 pr-14 text-white shadow-lg">
          <div className="mr-3 size-9 overflow-hidden rounded-full border border-white/30 bg-[#D2B48C]">
            <Image
              src="/Image/food-picture/food 31.jpg"
              alt="Food preference profile"
              width={48}
              height={48}
              className="size-full object-cover"
            />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold leading-none">Default profile</p>
            <p className="mt-1 text-xs leading-none text-white/70">
              Preferences ready
            </p>
          </div>
        </div>
        <div className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-xl bg-secondary-400 px-3 py-2 text-[11px] font-black text-white shadow-md">
          Add
        </div>
      </div>
    ),
  },
  {
    title: "ស្វែងរកបែបរីករាយ",
    description: "អូសមើល ឬបង្វិលកង ដើម្បីរកម្ហូបដែលអ្នកចូលចិត្ត",
    tint: "from-primary-50 to-white",
    preview: (
      <div className="relative mt-6 flex w-full justify-center">
        <div className="flex items-center rounded-full bg-primary-600 p-1.5 text-white shadow-lg">
          <div className="rounded-full bg-white/20 px-4 py-2 text-sm font-bold">
            Swipe
          </div>
          <div className="px-4 text-base font-bold">Spin & discover</div>
        </div>
        <motion.div
          animate={{ y: [0, -5, 0], rotate: [10, 18, 10] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-6 right-1/3 rounded-full bg-secondary-400 p-2.5 shadow-lg"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4 stroke-current text-white"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M7 17 17 7M17 7H7M17 7v10" />
          </svg>
        </motion.div>
      </div>
    ),
  },
  {
    title: "ទទួលបានការណែនាំ",
    description: "FoodHub ផ្គូផ្គងម្ហូបដែលសមនឹងអ្នកបំផុត",
    tint: "from-accent-50 to-white",
    preview: (
      <div className="relative mt-6 flex w-full max-w-[210px] flex-col items-center rounded-[1.75rem] bg-primary-600 px-6 py-4 text-white shadow-lg">
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
          Smart match
        </p>
        <p className="mt-1 text-2xl font-black">98%</p>
        <div className="absolute -bottom-2 left-9 size-5 rotate-45 bg-primary-600" />
      </div>
    ),
  },
] as const;

function FloatingFoodCard({
  side,
  image,
  title,
  subtitle,
  delay,
  reduceMotion,
}: {
  side: "left" | "right";
  image: string;
  title: string;
  subtitle: string;
  delay: number;
  reduceMotion: boolean;
}) {
  const rotation = side === "left" ? -10 : 10;

  return (
    <motion.div
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              x: side === "left" ? -90 : 90,
              y: 42,
              scale: 0.72,
              rotate: side === "left" ? -24 : 24,
              filter: "blur(10px)",
            }
      }
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
        filter: "blur(0px)",
      }}
      transition={{
        duration: 1,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={
        side === "left"
          ? "absolute left-5 top-[58%] z-30 -translate-y-1/2 md:left-0 md:top-[50%] lg:left-6"
          : "absolute right-5 top-[63%] z-30 -translate-y-1/2 md:right-0 md:top-[46%] lg:right-6"
      }
    >
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, side === "left" ? -14 : -20, 0],
                rotate: [rotation, rotation + 2, rotation - 1, rotation],
              }
        }
        transition={{
          duration: side === "left" ? 5.8 : 6.6,
          delay: side === "left" ? 0.2 : 0.9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={
          reduceMotion
            ? undefined
            : {
                y: -14,
                rotate: 0,
                scale: 1.07,
              }
        }
        className="group relative w-36 cursor-pointer rounded-[1.7rem] border border-white/60 bg-white/55 p-4 shadow-[0_24px_70px_-30px_rgba(15,70,47,0.6)] backdrop-blur-xl sm:w-44 md:w-52 md:rounded-[2rem] md:p-5"
      >
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/35 via-transparent to-emerald-300/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />

        <div className="relative mx-auto size-16 overflow-hidden rounded-full border-[3px] border-white/70 bg-slate-800 shadow-inner sm:size-20 md:size-24">
          <Image
            src={image}
            alt={title}
            fill
            sizes="96px"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>

        <div className="relative mt-4 text-center text-primary-700">
          <p className="text-sm font-extrabold sm:text-base md:text-lg">
            {title}
          </p>
          <p className="mt-1 text-xs font-medium text-primary-700/70 sm:text-sm md:text-base">
            {subtitle}
          </p>
        </div>

        <motion.span
          aria-hidden
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [0.2, 0.65, 0.2],
                  scale: [0.9, 1.15, 0.9],
                }
          }
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-2 -top-2 size-4 rounded-full bg-secondary-400 shadow-[0_0_22px_rgba(255,159,64,0.75)]"
        />
      </motion.div>
    </motion.div>
  );
}

function HeroStage({ reduceMotion }: { reduceMotion: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const imageXInput = useTransform(pointerX, [-0.5, 0.5], [-14, 14]);
  const imageYInput = useTransform(pointerY, [-0.5, 0.5], [-9, 9]);
  const backXInput = useTransform(pointerX, [-0.5, 0.5], [18, -18]);
  const backYInput = useTransform(pointerY, [-0.5, 0.5], [12, -12]);
  const glowXInput = useTransform(pointerX, [-0.5, 0.5], [-170, 170]);
  const glowYInput = useTransform(pointerY, [-0.5, 0.5], [-100, 100]);

  const imageX = useSpring(imageXInput, { stiffness: 90, damping: 22 });
  const imageY = useSpring(imageYInput, { stiffness: 90, damping: 22 });
  const backX = useSpring(backXInput, { stiffness: 75, damping: 24 });
  const backY = useSpring(backYInput, { stiffness: 75, damping: 24 });
  const glowX = useSpring(glowXInput, { stiffness: 70, damping: 25 });
  const glowY = useSpring(glowYInput, { stiffness: 70, damping: 25 });

  const pointerGlow = useMotionTemplate`
    radial-gradient(
      360px circle at calc(50% + ${glowX}px) calc(42% + ${glowY}px),
      rgba(83, 181, 103, 0.18),
      transparent 72%
    )
  `;

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (reduceMotion || !stageRef.current) return;

    const bounds = stageRef.current.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  }

  function resetPointer() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <section className="relative isolate overflow-hidden bg-white">
      <div
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointer}
        className="relative mx-auto flex min-h-[760px] w-full max-w-[1220px] flex-col items-center justify-center px-5 pb-24 pt-20 sm:min-h-[820px] sm:px-8 md:min-h-screen md:pb-20 md:pt-16 lg:px-10"
      >
        <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_50%_34%,rgba(83,181,103,0.12),transparent_44%)]" />

        <div className="absolute inset-0 -z-20 opacity-[0.04] [background-image:radial-gradient(rgba(29,92,55,0.9)_1px,transparent_1px)] [background-size:34px_34px]" />

        {!reduceMotion && (
          <motion.div
            aria-hidden
            style={{ background: pointerGlow }}
            className="pointer-events-none absolute inset-0 -z-10"
          />
        )}

        <motion.div
          aria-hidden
          style={reduceMotion ? undefined : { x: backX, y: backY }}
          className="pointer-events-none absolute -left-40 top-0 -z-10 h-[540px] w-[577px] opacity-80"
        >
          <Image
            src="/Image/blur-green.png"
            alt=""
            fill
            sizes="577px"
            className="object-contain"
          />
        </motion.div>

        <motion.div
          aria-hidden
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [1, 1.12, 1],
                  opacity: [0.25, 0.55, 0.25],
                }
          }
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[10%] top-[18%] -z-10 size-40 rounded-full bg-secondary-400/20 blur-[70px]"
        />

        {FLOATING_PARTICLES.map((particle, index) => (
          <motion.span
            key={index}
            aria-hidden
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
            }}
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, -18, 0],
                    opacity: [0.2, 0.8, 0.2],
                    scale: [1, 1.45, 1],
                  }
            }
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -z-10 rounded-full bg-primary-400 shadow-[0_0_18px_rgba(83,181,103,0.7)]"
          />
        ))}

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: -40,
                  scale: 0.7,
                  rotate: -20,
                }
          }
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
          transition={{
            duration: 0.85,
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute left-6 top-20 z-10 w-14 sm:left-10 sm:top-24 sm:w-20"
        >
          <motion.div
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, -10, 0],
                    rotate: [0, 7, -5, 0],
                  }
            }
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
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

        <motion.div
          initial={
            reduceMotion
              ? false
              : { opacity: 0, x: -80, rotate: -30, scale: 0.75 }
          }
          animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
          transition={{
            duration: 0.95,
            delay: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute bottom-16 left-2 hidden w-16 sm:block md:bottom-20 md:left-0 lg:bottom-8 lg:w-[103px]"
        >
          <motion.div
            animate={
              reduceMotion
                ? undefined
                : { y: [0, -10, 0], rotate: [0, 10, -6, 0] }
            }
            transition={{ duration: 6.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/Image/left-vector.png"
              alt=""
              width={103}
              height={97}
              className="h-auto w-full"
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={
            reduceMotion
              ? false
              : { opacity: 0, x: 80, rotate: 30, scale: 0.75 }
          }
          animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
          transition={{
            duration: 0.95,
            delay: 0.82,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute right-4 top-24 w-12 sm:right-8 sm:w-16 md:right-0 lg:w-[131px]"
        >
          <motion.div
            animate={
              reduceMotion
                ? undefined
                : { y: [0, -13, 0], rotate: [0, -12, 8, 0] }
            }
            transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/Image/right-vector.png"
              alt=""
              width={131}
              height={114}
              className="h-auto w-full"
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 60,
                  scale: 0.78,
                  rotateX: 18,
                  filter: "blur(16px)",
                }
          }
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 1.25,
            delay: 0.15,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={
            reduceMotion
              ? undefined
              : {
                  x: imageX,
                  y: imageY,
                  transformPerspective: 1100,
                }
          }
          className="relative z-10 w-full max-w-[950px]"
        >
          <motion.div
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, -11, 0],
                    rotate: [0, 0.7, 0, -0.5, 0],
                  }
            }
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <motion.div
              aria-hidden
              animate={
                reduceMotion
                  ? undefined
                  : {
                      scale: [0.94, 1.04, 0.94],
                      opacity: [0.2, 0.45, 0.2],
                    }
              }
              transition={{
                duration: 4.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-[15%] -z-10 rounded-full bg-primary-400/20 blur-[70px]"
            />

            <Image
              src="/Image/foodhub-image (2).png"
              alt="FoodHub personalized food recommendation"
              width={950}
              height={450}
              priority
              className="h-auto w-full drop-shadow-[0_35px_38px_rgba(29,92,55,0.18)]"
            />

            {!reduceMotion && (
              <motion.div
                aria-hidden
                initial={{ x: "-140%" }}
                animate={{ x: "170%" }}
                transition={{
                  duration: 2.2,
                  delay: 1.15,
                  repeat: Infinity,
                  repeatDelay: 6,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute inset-y-[14%] w-24 rotate-12 bg-gradient-to-r from-transparent via-white/55 to-transparent blur-md"
              />
            )}
          </motion.div>
        </motion.div>

        <motion.h1
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 30,
                }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative z-20 -mt-4 max-w-[850px] dark:text-white text-balance text-center text-[36px] font-extrabold leading-[1.35] text-primary-800 dark:text-primary-dark sm:text-[44px] md:-mt-10 md:text-[50px] lg:-mt-14 lg:ml-48 lg:text-left lg:text-[54px]"
        >
          ស្វែងរកអាហារដែលស័ក្តិសម
          <br className="hidden md:block" /> បំផុតសម្រាប់អ្នក !
        </motion.h1>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 1.1 }}
          className="relative z-20 mt-6 flex max-w-[760px] flex-wrap justify-center gap-2.5 px-4 lg:ml-48"
        >
          {PERSONALIZATION_POINTS.map((point, index) => {
            const PointIcon = point.icon;

            return (
              <motion.span
                key={point.label}
                initial={
                  reduceMotion ? false : { opacity: 0, y: 14, scale: 0.9 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.55,
                  delay: 1.15 + index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={reduceMotion ? undefined : { y: -4, scale: 1.04 }}
                className="inline-flex items-center gap-2 rounded-full border border-primary-200/70 bg-white/70 px-3.5 py-2 text-sm font-bold text-primary-700 shadow-sm backdrop-blur-md"
              >
                <PointIcon className="size-4 text-secondary-500" aria-hidden />
                {point.label}
              </motion.span>
            );
          })}
        </motion.div>

        <FloatingFoodCard
          side="left"
          image="/Image/food-picture/food 31.jpg"
          title="ម្ហូបខ្មែរ"
          subtitle="រាប់ពាន់មុខសម្រាប់ជ្រើសរើស"
          delay={0.85}
          reduceMotion={reduceMotion}
        />

        <FloatingFoodCard
          side="right"
          image="/Image/food-picture/food-32.jpg"
          title="ម្ហូបពេញនិយម"
          subtitle="ជ្រើសរើសតាមចំណូលចិត្តអ្នក"
          delay={1}
          reduceMotion={reduceMotion}
        />

        {!reduceMotion && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: [0, 0.7, 0], scaleX: [0, 1, 0] }}
            transition={{
              duration: 2.4,
              delay: 1.4,
              repeat: Infinity,
              repeatDelay: 5,
            }}
            className="absolute bottom-12 left-1/2 h-px w-[60%] -translate-x-1/2 bg-gradient-to-r from-transparent via-secondary-400 to-transparent"
          />
        )}
      </div>
    </section>
  );
}

function ExperienceSection({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <section className="relative isolate min-h-[900px] overflow-hidden bg-primary-800 pb-24 pt-28 text-white md:min-h-[760px] md:pb-28 md:pt-36 lg:min-h-[820px] lg:pt-44">
      <Image
        src="/Image/background.png"
        alt=""
        fill
        sizes="100vw"
        className="-z-20 object-cover object-top"
      />

      <div className="absolute inset-0 -z-10 bg-primary-900/20" />
      <div className="absolute left-1/2 top-0 -z-10 h-72 w-[720px] -translate-x-1/2 rounded-full bg-secondary-400/15 blur-[110px]" />

      <div className="container relative z-20 mx-auto flex w-full max-w-7xl flex-col items-center px-5 sm:px-8 lg:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-balance text-center text-3xl font-semibold sm:text-4xl md:text-5xl lg:text-6xl  py-2"
        >
          បទពិសោធន៍ថ្មីក្នុងការ
          <span className="text-secondary-500">ស្វែងរកម្ហូបអាហារ (Mhoub)</span>
        </motion.h2>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="mt-6 max-w-4xl text-balance text-center text-base font-light leading-8 text-accent-50 sm:text-lg md:text-xl lg:text-2xl"
        >
          ស្វែងរកម្ហូបអាហារ និងហាងអាហារដែលសមនឹងអ្នក តាមរយៈប្រព័ន្ធណែនាំម្ហូបអាហារឆ្លាតវៃ
          ដែលគិតគូរពីចំណូលចិត្ត អាឡែស៊ី របបអាហារ ជំនឿសាសនា និងទីតាំងរបស់អ្នក
        </motion.p>

        <div className="relative mt-12 grid w-full grid-cols-1 gap-6 md:mt-16 md:grid-cols-3 md:gap-8">
          <Image
            src="/Image/decorate.png"
            alt=""
            width={40}
            height={50}
            className="absolute -left-9 -top-10 hidden h-[50px] w-[40px] md:block"
          />

          {FEATURE_STEPS.map((step, index) => (
            <motion.article
              key={step.title}
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 55,
                      rotateX: 12,
                      scale: 0.92,
                    }
              }
              whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.75,
                delay: index * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={reduceMotion ? undefined : { y: -10, scale: 1.015 }}
              className={`group relative flex min-h-64 flex-col items-center rounded-[2rem] border border-white/80 bg-gradient-to-b ${step.tint} p-8 text-center shadow-[0_24px_65px_-35px_rgba(0,0,0,0.45)]`}
            >
              <motion.span
                className="absolute left-6 top-6 grid size-9 place-items-center rounded-full bg-primary-600 text-sm font-black text-white shadow-md"
                whileHover={
                  reduceMotion ? undefined : { rotate: 12, scale: 1.1 }
                }
              >
                {index + 1}
              </motion.span>

              <h3 className="mt-2 text-xl font-black uppercase leading-tight text-primary-800 dark:text-primary-dark md:text-2xl">
                {step.title}
              </h3>

              <p className="mt-3 text-base font-semibold leading-7 text-black/60">
                {step.description}
              </p>

              <div className="mt-auto flex w-full justify-center">
                {step.preview}
              </div>

              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100"
                initial={{ x: "-130%" }}
                whileHover={{ x: "130%" }}
                transition={{ duration: 0.8 }}
              />

              {index < FEATURE_STEPS.length - 1 && (
                <motion.div
                  aria-hidden
                  animate={
                    reduceMotion
                      ? undefined
                      : { x: [0, 7, 0], opacity: [0.65, 1, 0.65] }
                  }
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -right-12 bottom-7 z-30 hidden size-16 md:block"
                >
                  <Image
                    src="/Image/arr.png"
                    alt=""
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </motion.div>
              )}
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-wrap justify-center gap-3 text-sm font-semibold text-white/80"
        >
          {["ផ្ទាល់ខ្លួន", "គិតគូរអាឡែស៊ី", "ផ្អែកលើទីតាំង"].map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur"
            >
              <Check className="size-4 text-secondary-400" aria-hidden />
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default function Hero() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <main className="overflow-hidden">
      <HeroStage reduceMotion={reduceMotion} />
      <ExperienceSection reduceMotion={reduceMotion} />
    </main>
  );
}
