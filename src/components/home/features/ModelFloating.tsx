"use client";

import { useEffect, useRef, useState } from "react";

import { animate, motion, useMotionValue } from "framer-motion";

import { HiOutlineCursorArrowRays, HiSparkles } from "react-icons/hi2";

import { IoSparkles } from "react-icons/io5";

import { RiRobot2Line } from "react-icons/ri";

type DraggableAIAssistantProps = {
  onOpen: () => void;
};

type SavedPosition = {
  x: number;
  y: number;
};

const STORAGE_KEY = "foodhub-ai-assistant-position";

const ASSISTANT_SIZE = 88;
const SCREEN_GAP = 16;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export default function DraggableAIAssistant({
  onOpen,
}: DraggableAIAssistantProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const [mounted, setMounted] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

  const [isNearLeft, setIsNearLeft] = useState(false);

  const [showHint, setShowHint] = useState(true);

  const wasDraggedRef = useRef(false);

  const dragStartRef = useRef({
    x: 0,
    y: 0,
  });

  const positionAssistant = (savedPosition?: SavedPosition) => {
    const maximumX = window.innerWidth - ASSISTANT_SIZE - SCREEN_GAP;

    const maximumY = window.innerHeight - ASSISTANT_SIZE - SCREEN_GAP;

    const defaultX = maximumX;
    const defaultY = window.innerHeight - ASSISTANT_SIZE - 100;

    const nextX = clamp(savedPosition?.x ?? defaultX, SCREEN_GAP, maximumX);

    const nextY = clamp(savedPosition?.y ?? defaultY, SCREEN_GAP, maximumY);

    x.set(nextX);
    y.set(nextY);

    setIsNearLeft(nextX < window.innerWidth / 2);
  };

  useEffect(() => {
    setMounted(true);

    try {
      const savedValue = window.localStorage.getItem(STORAGE_KEY);

      const parsedValue = savedValue
        ? (JSON.parse(savedValue) as SavedPosition)
        : undefined;

      positionAssistant(parsedValue);
    } catch {
      positionAssistant();
    }

    const handleResize = () => {
      positionAssistant({
        x: x.get(),
        y: y.get(),
      });
    };

    window.addEventListener("resize", handleResize);

    const hideHintTimer = window.setTimeout(() => {
      setShowHint(false);
    }, 7000);

    return () => {
      window.removeEventListener("resize", handleResize);

      window.clearTimeout(hideHintTimer);
    };
  }, [x, y]);

  const savePosition = (nextX: number, nextY: number) => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          x: nextX,
          y: nextY,
        }),
      );
    } catch {
      // Ignore unavailable storage.
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
    setShowHint(false);

    wasDraggedRef.current = false;

    dragStartRef.current = {
      x: x.get(),
      y: y.get(),
    };
  };

  const handleDrag = () => {
    const distanceX = Math.abs(x.get() - dragStartRef.current.x);

    const distanceY = Math.abs(y.get() - dragStartRef.current.y);

    if (distanceX > 5 || distanceY > 5) {
      wasDraggedRef.current = true;
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);

    const currentX = x.get();
    const currentY = y.get();

    const maximumX = window.innerWidth - ASSISTANT_SIZE - SCREEN_GAP;

    const maximumY = window.innerHeight - ASSISTANT_SIZE - SCREEN_GAP;

    const snappedX =
      currentX + ASSISTANT_SIZE / 2 < window.innerWidth / 2
        ? SCREEN_GAP
        : maximumX;

    const snappedY = clamp(currentY, SCREEN_GAP, maximumY);

    setIsNearLeft(snappedX === SCREEN_GAP);

    animate(x, snappedX, {
      type: "spring",
      stiffness: 420,
      damping: 32,
      mass: 0.75,
    });

    animate(y, snappedY, {
      type: "spring",
      stiffness: 420,
      damping: 32,
      mass: 0.75,

      onComplete: () => {
        savePosition(snappedX, snappedY);
      },
    });

    window.setTimeout(() => {
      wasDraggedRef.current = false;
    }, 180);
  };

  const handleClick = () => {
    if (wasDraggedRef.current) {
      return;
    }

    onOpen();
  };

  if (!mounted) {
    return null;
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.08}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      style={{
        x,
        y,
        width: ASSISTANT_SIZE,
        height: ASSISTANT_SIZE,
        touchAction: "none",
      }}
      whileDrag={{
        scale: 1.08,
      }}
      className="group fixed left-0 top-0 z-[900] select-none"
    >
      {/* Smart suggestion bubble */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.85,
          x: isNearLeft ? -10 : 10,
        }}
        animate={
          showHint && !isDragging
            ? {
                opacity: 1,
                scale: 1,
                x: 0,
              }
            : {
                opacity: 0,
                scale: 0.9,
                x: isNearLeft ? -8 : 8,
              }
        }
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 24,
        }}
        className={`pointer-events-none absolute top-1/2 hidden w-[255px] -translate-y-1/2 rounded-[22px] border border-white/70 bg-white/90 p-4 shadow-[0_22px_70px_rgba(20,70,45,0.24)] backdrop-blur-2xl md:block ${
          isNearLeft ? "left-[102px]" : "right-[102px]"
        }`}
      >
        <div
          className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 border bg-white/90 ${
            isNearLeft
              ? "-left-2 border-b border-l border-gray-100 border-r-transparent border-t-transparent"
              : "-right-2 border-r border-t border-gray-100 border-b-transparent border-l-transparent"
          }`}
        />

        <div className="relative flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-gradient-to-br from-primary-900 to-secondary-500 text-white shadow-md">
            <IoSparkles className="text-[23px]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[16px] font-semibold text-primary-900">
                FoodHub AI
              </p>

              <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[16px] font-medium text-green-600">
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-green-500"
                  animate={{
                    opacity: [1, 0.3, 1],
                  }}
                  transition={{
                    duration: 1.3,
                    repeat: Infinity,
                  }}
                />
                Ready
              </span>
            </div>

            <p className="mt-1 text-[16px] leading-7 text-gray-500">
              ខ្ញុំអាចជួយអ្នកជ្រើសរើសម្ហូបដែលសមនឹងអ្នក។
            </p>
          </div>
        </div>
      </motion.div>

      {/* Hover panel */}
      <div
        className={`pointer-events-none absolute top-1/2 hidden w-[270px] -translate-y-1/2 opacity-0 transition-all duration-300 group-hover:opacity-100 lg:block ${
          isNearLeft
            ? "left-[102px] translate-x-3 group-hover:translate-x-0"
            : "right-[102px] -translate-x-3 group-hover:translate-x-0"
        }`}
      >
        <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-[0_24px_80px_rgba(15,65,45,0.28)] backdrop-blur-2xl">
          <div className="absolute inset-x-4 top-0 h-[3px] rounded-full bg-gradient-to-r from-cyan-400 via-primary-700 to-secondary-500" />

          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-primary-50 text-primary-800 dark:text-primary-dark">
              <RiRobot2Line className="text-[27px]" />
            </div>

            <div>
              <p className="text-[17px] font-semibold text-primary-900">
                Smart Food Assistant
              </p>

              <p className="mt-1 text-[16px] leading-7 text-gray-500">
                ចុចដើម្បីមើលការណែនាំ ឬអូសដើម្បីផ្លាស់ទី។
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-[16px] bg-primary-50 px-3 py-2.5">
            <HiOutlineCursorArrowRays className="shrink-0 text-[21px] text-primary-700" />

            <p className="text-[16px] text-primary-700">Drag me anywhere</p>
          </div>
        </div>
      </div>

      {/* Drop shadow under assistant */}
      <motion.div
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 h-4 w-14 -translate-x-1/2 rounded-full bg-black/20 blur-md"
        animate={
          isDragging
            ? {
                scaleX: 0.65,
                opacity: 0.14,
                y: 12,
              }
            : {
                scaleX: 1,
                opacity: 0.24,
                y: 7,
              }
        }
      />

      <motion.button
        type="button"
        aria-label="Open FoodHub AI assistant"
        onClick={handleClick}
        whileHover={{
          scale: 1.06,
        }}
        whileTap={{
          scale: 0.94,
        }}
        className="relative flex h-[88px] w-[88px] cursor-grab items-center justify-center border-0 bg-transparent p-0 outline-none active:cursor-grabbing"
      >
        {/* Pulsing energy field */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-[5px] rounded-[30px] bg-gradient-to-br from-cyan-300/40 via-primary-600/30 to-secondary-500/40 blur-xl"
          animate={{
            scale: [0.9, 1.22, 0.9],
            opacity: [0.8, 0.2, 0.8],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Outer rounded tech frame */}
        <motion.div
          className="absolute inset-[2px] rounded-[30px] border border-dashed border-cyan-300/70"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Orbiting light */}
        <motion.div
          className="absolute inset-[5px] rounded-[28px]"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,1)]" />
        </motion.div>

        {/* Main assistant body */}
        <div className="absolute inset-[9px] rounded-[25px] bg-gradient-to-br from-cyan-300 via-primary-700 to-secondary-500 p-[2px] shadow-[0_18px_42px_rgba(20,85,60,0.5)]">
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[23px] bg-gradient-to-br from-[#052e2b] via-primary-950 to-[#123d32]">
            {/* Background grid */}
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.1]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
                backgroundSize: "9px 9px",
              }}
            />

            {/* Moving glow */}
            <motion.span
              className="absolute -left-8 -top-8 h-20 w-20 rounded-full bg-cyan-200/30 blur-2xl"
              animate={{
                x: [0, 38, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Scanner */}
            <motion.span
              className="absolute left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-cyan-200 to-transparent shadow-[0_0_10px_rgba(165,243,252,1)]"
              animate={{
                y: [-27, 27, -27],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Robot character */}
            <motion.div
              className="relative z-10 flex flex-col items-center"
              animate={{
                y: [0, -2, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Antenna */}
              <div className="relative mb-1 h-3 w-[2px] rounded-full bg-white/70">
                <motion.span
                  className="absolute -left-[4px] -top-1.5 h-2.5 w-2.5 rounded-full bg-green-300 shadow-[0_0_12px_rgba(134,239,172,1)]"
                  animate={{
                    scale: [1, 0.7, 1],
                    opacity: [1, 0.35, 1],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                  }}
                />
              </div>

              {/* Face screen */}
              <div className="relative flex h-10 w-13 items-center justify-center gap-2.5 rounded-[14px] border border-cyan-100/25 bg-white/10 shadow-inner backdrop-blur-md">
                <motion.span
                  className="h-3 w-2 rounded-full bg-cyan-100 shadow-[0_0_9px_rgba(207,250,254,1)]"
                  animate={{
                    scaleY: [1, 1, 0.12, 1],
                  }}
                  transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    times: [0, 0.45, 0.5, 1],
                  }}
                />

                <motion.span
                  className="h-3 w-2 rounded-full bg-cyan-100 shadow-[0_0_9px_rgba(207,250,254,1)]"
                  animate={{
                    scaleY: [1, 1, 0.12, 1],
                  }}
                  transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    times: [0, 0.45, 0.5, 1],
                  }}
                />

                <motion.span
                  className="absolute bottom-1 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-cyan-200"
                  animate={{
                    scaleX: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                  }}
                />
              </div>

              {/* Voice activity */}
              <div className="mt-1.5 flex h-3 items-end gap-0.5">
                {[5, 9, 6, 11, 5].map((height, index) => (
                  <motion.span
                    key={index}
                    className="w-1 rounded-full bg-cyan-200"
                    animate={{
                      height: [height, height + 4, height],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: index * 0.1,
                    }}
                    style={{
                      height,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            <motion.span
              className="absolute right-2 top-2 text-yellow-300"
              animate={{
                rotate: 360,
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                rotate: {
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear",
                },

                scale: {
                  duration: 1.6,
                  repeat: Infinity,
                },
              }}
            >
              <HiSparkles className="text-[18px]" />
            </motion.span>
          </div>
        </div>

        {/* Online dot */}
        <motion.span
          className="absolute bottom-1 right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-lg"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        >
          <span className="h-3.5 w-3.5 rounded-full bg-green-400 ring-2 ring-green-100" />
        </motion.span>

        {/* AI label */}
        <motion.span
          initial={{
            scale: 0,
            rotate: -15,
          }}
          animate={{
            scale: 1,
            rotate: 0,
          }}
          transition={{
            delay: 0.7,
            type: "spring",
            stiffness: 400,
            damping: 16,
          }}
          className="absolute -right-2 top-0 z-30 flex h-8 min-w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-secondary-400 to-secondary-600 px-1.5 text-[16px] font-bold text-white shadow-lg"
        >
          AI
        </motion.span>
      </motion.button>
    </motion.div>
  );
}
