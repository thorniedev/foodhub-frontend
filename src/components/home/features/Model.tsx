"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import { createPortal } from "react-dom";

import { AnimatePresence, motion } from "framer-motion";

import { HiOutlineLightBulb, HiSparkles } from "react-icons/hi2";

import { IoClose, IoRefresh, IoSparkles } from "react-icons/io5";

import { MdSwipe } from "react-icons/md";
import { RiRobot2Line } from "react-icons/ri";
import { TbWheel } from "react-icons/tb";

import { useGetMenuItemsQuery } from "@/app/store/menuApi";

import SwipeCardTinderStyle from "./SwipeCardTinderStyle";
import SpinFood from "./SpinFood";

import type { MenuItem } from "@/types/manu";

type ModalTab = "swipe" | "spin";

type ModalTabItem = {
  id: ModalTab;
  label: string;
  description: string;
  icon: ReactNode;
};

const MODAL_TABS: ModalTabItem[] = [
  {
    id: "swipe",
    label: "អូសមើលម្ហូប",
    description: "អូសទៅឆ្វេង ឬស្តាំ ដើម្បីស្វែងរកម្ហូបដែលអ្នកចូលចិត្ត",
    icon: <MdSwipe className="text-[24px]" />,
  },
  {
    id: "spin",
    label: "បង្វិលកង់",
    description: "ឱ្យ AI ជួយជ្រើសរើសមុខម្ហូបមួយសម្រាប់អ្នក",
    icon: <TbWheel className="text-[24px]" />,
  },
];

function getTopRecommendation(foods: MenuItem[]): MenuItem | null {
  return foods[0] ?? null;
}

function getPreferenceLabels(foods: MenuItem[]): string[] {
  const values = new Set<string>();

  foods.slice(0, 6).forEach((food) => {
    food.dietaryTypes.forEach((diet) => {
      values.add(diet.name);
    });
  });

  return Array.from(values).slice(0, 4);
}

export default function Model() {
  const [mounted, setMounted] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<ModalTab>("swipe");

  const {
    data: menuItems = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetMenuItemsQuery();

  const recommendedFoods = useMemo(
    () =>
      [...menuItems]
        .filter((food) => food.availabilityStatus === "AVAILABLE")
        .filter((food) => food.recommendation?.safetyStatus === "SAFE")
        .sort(
          (firstFood, secondFood) =>
            secondFood.recommendation.finalScore -
            firstFood.recommendation.finalScore,
        ),
    [menuItems],
  );

  const topRecommendation = useMemo(
    () => getTopRecommendation(recommendedFoods),
    [recommendedFoods],
  );

  const preferenceLabels = useMemo(
    () => getPreferenceLabels(recommendedFoods),
    [recommendedFoods],
  );

  const activeTabInformation =
    MODAL_TABS.find((tab) => tab.id === activeTab) ?? MODAL_TABS[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const openModal = () => {
    setActiveTab("swipe");
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const renderTabContent = () => {
    if (isLoading || isFetching) {
      return (
        <div className="flex min-h-[460px] flex-col items-center justify-center gap-5 px-5 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-primary-100 border-t-primary-800"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            <RiRobot2Line className="text-[34px] text-primary-800" />
          </div>

          <div>
            <p className="text-[18px] font-semibold text-primary-900">
              AI កំពុងវិភាគចំណូលចិត្តរបស់អ្នក
            </p>

            <p className="mt-2 text-[16px] leading-7 text-gray-500">
              កំពុងរៀបចំមុខម្ហូបដែលសមស្រប និងមានសុវត្ថិភាពសម្រាប់អ្នក
            </p>
          </div>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex min-h-[460px] flex-col items-center justify-center gap-5 px-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <RiRobot2Line className="text-[38px] text-red-500" />
          </div>

          <div>
            <p className="text-[20px] font-semibold text-red-500">
              AI មិនអាចទាញយកទិន្នន័យបានទេ
            </p>

            <p className="mt-2 text-[16px] leading-7 text-gray-500">
              សូមពិនិត្យការតភ្ជាប់ ហើយព្យាយាមម្តងទៀត
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-full bg-primary-800 px-6 py-3 text-[16px] font-semibold text-white transition hover:bg-primary-700 active:scale-95"
          >
            <IoRefresh className="text-[20px]" />
            ព្យាយាមម្តងទៀត
          </button>

          <details className="max-w-full">
            <summary className="cursor-pointer text-[16px] text-gray-400">
              ព័ត៌មានបច្ចេកទេស
            </summary>

            <pre className="mt-3 max-w-full overflow-auto whitespace-pre-wrap rounded-xl bg-red-50 p-3 text-left text-[14px] text-red-500">
              {JSON.stringify(error, null, 2)}
            </pre>
          </details>
        </div>
      );
    }

    if (recommendedFoods.length === 0) {
      return (
        <div className="flex min-h-[460px] flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-50">
            <HiOutlineLightBulb className="text-[38px] text-primary-700" />
          </div>

          <p className="text-[20px] font-semibold text-primary-900">
            មិនទាន់មានការណែនាំទេ
          </p>

          <p className="max-w-[350px] text-[16px] leading-7 text-gray-500">
            AI នឹងបង្ហាញមុខម្ហូបនៅពេលមានទិន្នន័យសមស្របសម្រាប់អ្នក
          </p>
        </div>
      );
    }

    if (activeTab === "swipe") {
      return <SwipeCardTinderStyle foods={recommendedFoods} />;
    }

    return <SpinFood />;
  };

  return (
    <>
      <motion.button
        type="button"
        aria-label="Open FoodHub AI assistant"
        onClick={openModal}
        initial={{
          opacity: 0,
          scale: 0.4,
          y: 50,
          rotate: -15,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          rotate: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 220,
          damping: 18,
          delay: 0.35,
        }}
        whileHover="hover"
        whileTap={{
          scale: 0.92,
        }}
        className="group fixed bottom-6 right-6 z-[900] cursor-pointer border-0 bg-transparent p-0 outline-none md:bottom-10 md:right-10"
      >
        {/* Hover information panel */}
        <motion.div
          variants={{
            hover: {
              opacity: 1,
              x: 0,
              scale: 1,
            },
          }}
          initial={{
            opacity: 0,
            x: 18,
            scale: 0.94,
          }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 24,
          }}
          className="pointer-events-none absolute bottom-2 right-[78px] hidden w-[245px] overflow-hidden rounded-[22px] border border-white/60 bg-white/90 p-3.5 text-left shadow-[0_18px_60px_rgba(22,70,48,0.22)] backdrop-blur-xl group-hover:block sm:block sm:opacity-0"
        >
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary-800 via-secondary-500 to-yellow-400" />

          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-primary-50 text-primary-800">
              <IoSparkles className="text-[22px]" />
            </span>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[16px] font-semibold text-primary-900">
                  FoodHub AI
                </p>

                <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[16px] font-medium text-green-600">
                  <motion.span
                    className="h-1.5 w-1.5 rounded-full bg-green-500"
                    animate={{
                      opacity: [1, 0.35, 1],
                    }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                    }}
                  />
                  Online
                </span>
              </div>

              <p className="mt-1 text-[16px] leading-6 text-gray-500">
                ចុចដើម្បីទទួលបានការណែនាំម្ហូបសម្រាប់អ្នក
              </p>
            </div>
          </div>
        </motion.div>

        {/* Message bubble */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.6,
            y: 8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            delay: 1.2,
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className="pointer-events-none absolute -left-4 -top-11 hidden whitespace-nowrap rounded-[14px] rounded-br-[4px] border border-primary-100 bg-white px-3 py-2 text-[16px] font-medium text-primary-900 shadow-lg md:block"
        >
          មិនដឹងញ៉ាំអ្វីមែនទេ?
          <motion.span
            className="ml-1 inline-block text-secondary-500"
            animate={{
              rotate: [0, 15, -8, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          >
            ✦
          </motion.span>
        </motion.div>

        {/* Main floating orb */}
        <motion.div
          variants={{
            hover: {
              scale: 1.08,
              y: -5,
            },
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className="relative flex h-[76px] w-[76px] items-center justify-center"
        >
          {/* Large pulsing aura */}
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-primary-600/25 blur-md"
            animate={{
              scale: [0.95, 1.35, 0.95],
              opacity: [0.55, 0.12, 0.55],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Outer dashed orbit */}
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-dashed border-secondary-400/80"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Orbit particle one */}
          <motion.span
            aria-hidden="true"
            className="absolute inset-[4px] rounded-full"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-yellow-300 shadow-[0_0_12px_rgba(253,224,71,0.95)]" />
          </motion.span>

          {/* Orbit particle two */}
          <motion.span
            aria-hidden="true"
            className="absolute inset-[7px] rounded-full"
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-secondary-300 shadow-[0_0_10px_rgba(251,146,60,0.9)]" />
          </motion.span>

          {/* Gradient border shell */}
          <div className="absolute inset-[7px] rounded-full bg-gradient-to-br from-yellow-300 via-secondary-500 to-primary-800 p-[2px] shadow-[0_14px_35px_rgba(28,107,69,0.4)]">
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary-950 via-primary-800 to-secondary-500">
              {/* Moving internal light */}
              <motion.span
                aria-hidden="true"
                className="absolute -left-7 -top-8 h-16 w-16 rounded-full bg-white/25 blur-xl"
                animate={{
                  x: [0, 35, 0],
                  y: [0, 24, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Scanning line */}
              <motion.span
                aria-hidden="true"
                className="absolute left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-green-300 to-transparent opacity-70"
                animate={{
                  y: [-20, 20, -20],
                  opacity: [0, 0.9, 0],
                }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* AI face */}
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
                <div className="relative mb-1 h-2.5 w-[2px] rounded-full bg-white/75">
                  <motion.span
                    className="absolute -left-[3px] -top-1 h-2 w-2 rounded-full bg-green-300 shadow-[0_0_10px_rgba(134,239,172,1)]"
                    animate={{
                      opacity: [1, 0.3, 1],
                      scale: [1, 0.75, 1],
                    }}
                    transition={{
                      duration: 1.3,
                      repeat: Infinity,
                    }}
                  />
                </div>

                {/* Robot screen */}
                <div className="flex h-8 w-10 items-center justify-center gap-2 rounded-[11px] border border-white/25 bg-white/15 shadow-inner backdrop-blur">
                  <motion.span
                    className="h-2.5 w-1.5 rounded-full bg-green-200 shadow-[0_0_7px_rgba(187,247,208,1)]"
                    animate={{
                      scaleY: [1, 1, 0.15, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      times: [0, 0.45, 0.5, 1],
                    }}
                  />

                  <motion.span
                    className="h-2.5 w-1.5 rounded-full bg-green-200 shadow-[0_0_7px_rgba(187,247,208,1)]"
                    animate={{
                      scaleY: [1, 1, 0.15, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      times: [0, 0.45, 0.5, 1],
                    }}
                  />
                </div>

                {/* Smile */}
                <div className="mt-1 h-1.5 w-4 rounded-b-full border-b-2 border-white/80" />
              </motion.div>

              {/* Sparkle */}
              <motion.span
                className="absolute right-1.5 top-1.5 text-yellow-300"
                animate={{
                  rotate: 360,
                  scale: [0.8, 1.25, 0.8],
                }}
                transition={{
                  rotate: {
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                  },
                  scale: {
                    duration: 1.6,
                    repeat: Infinity,
                  },
                }}
              >
                <HiSparkles className="text-[17px]" />
              </motion.span>
            </div>
          </div>

          {/* Online status */}
          <motion.span
            className="absolute bottom-1 right-1 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md"
            animate={{
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
            }}
          >
            <span className="h-3 w-3 rounded-full bg-green-400 ring-2 ring-green-100" />
          </motion.span>

          {/* Notification badge */}
          <motion.span
            initial={{
              scale: 0,
            }}
            animate={{
              scale: 1,
            }}
            transition={{
              delay: 1,
              type: "spring",
              stiffness: 400,
              damping: 15,
            }}
            className="absolute -right-1 top-0 z-30 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-secondary-500 px-1 text-[16px] font-bold text-white shadow-lg"
          >
            3
          </motion.span>
        </motion.div>
      </motion.button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                key="foodhub-ai-backdrop"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  duration: 0.22,
                }}
                onClick={closeModal}
                className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-3 py-4 backdrop-blur-md sm:px-5"
              >
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label="FoodHub AI recommendation assistant"
                  key="foodhub-ai-modal"
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    y: 40,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.94,
                    y: 25,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 28,
                  }}
                  onClick={(event) => event.stopPropagation()}
                  className="relative flex max-h-[94vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[32px] border border-white/50 bg-[#f6f7f5] shadow-[0_35px_120px_rgba(0,0,0,0.35)]"
                >
                  <div className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-800 to-secondary-500 px-5 pb-6 pt-5 text-white sm:px-6">
                    <motion.div
                      aria-hidden="true"
                      className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl"
                      animate={{
                        x: [0, -14, 0],
                        y: [0, 12, 0],
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />

                    <motion.div
                      aria-hidden="true"
                      className="absolute -bottom-24 -left-14 h-52 w-52 rounded-full bg-yellow-300/15 blur-3xl"
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />

                    <div className="absolute right-20 top-8 hidden grid-cols-3 gap-3 opacity-25 sm:grid">
                      {Array.from({
                        length: 9,
                      }).map((_, index) => (
                        <motion.span
                          key={index}
                          className="h-1.5 w-1.5 rounded-full bg-white"
                          animate={{
                            opacity: [0.25, 1, 0.25],
                            scale: [1, 1.4, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.12,
                          }}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      aria-label="Close AI assistant"
                      onClick={closeModal}
                      className="absolute right-4 top-4 z-20 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-md transition hover:rotate-6 hover:bg-white/25 active:scale-90"
                    >
                      <IoClose className="text-[25px]" />
                    </button>

                    <div className="relative z-10 flex items-start gap-4 pr-12">
                      <motion.div
                        className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-white/15 ring-1 ring-white/25"
                        animate={{
                          y: [0, -4, 0],
                        }}
                        transition={{
                          duration: 2.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <RiRobot2Line className="text-[39px]" />

                        <motion.span
                          className="absolute -right-2 -top-2"
                          animate={{
                            rotate: [0, 18, -10, 0],
                            scale: [1, 1.18, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1,
                          }}
                        >
                          <HiSparkles className="text-[24px] text-yellow-300" />
                        </motion.span>
                      </motion.div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-[23px] font-semibold sm:text-[26px]">
                            FoodHub AI Assistant
                          </h2>

                          <span className="flex items-center gap-1.5 rounded-full bg-green-400/20 px-3 py-1 text-[16px] font-medium text-green-100 ring-1 ring-green-300/30">
                            <span className="h-2 w-2 rounded-full bg-green-300" />
                            Online
                          </span>
                        </div>

                        <p className="mt-2 text-[16px] leading-7 text-white/85">
                          ជំនួយការ AI ដែលស្វែងយល់ពីចំណូលចិត្ត របបអាហារ ទីតាំង
                          និងសុវត្ថិភាព ដើម្បីជ្រើសរើសម្ហូបសម្រាប់អ្នក។
                        </p>
                      </div>
                    </div>

                    {!isLoading && topRecommendation && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 12,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: 0.15,
                        }}
                        className="relative z-10 mt-5 rounded-[20px] border border-white/15 bg-white/10 p-4 backdrop-blur-md"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-300/20">
                            <IoSparkles className="text-[23px] text-yellow-300" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[16px] font-semibold">
                              AI Recommendation Insight
                            </p>

                            <p className="mt-1 text-[16px] leading-7 text-white/80">
                              <span className="font-semibold text-white">
                                {topRecommendation.localName}
                              </span>{" "}
                              មានកម្រិតសមស្រប{" "}
                              <span className="font-semibold text-yellow-200">
                                {Math.round(
                                  topRecommendation.recommendation.finalScore *
                                    100,
                                )}
                                %
                              </span>{" "}
                              ជាមួយចំណូលចិត្តរបស់អ្នក។
                            </p>
                          </div>
                        </div>

                        {preferenceLabels.length > 0 && (
                          <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto">
                            {preferenceLabels.map((label) => (
                              <span
                                key={label}
                                className="shrink-0 whitespace-nowrap rounded-full bg-white/15 px-3 py-1.5 text-[16px] text-white ring-1 ring-white/15"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  <div className="border-b border-gray-200 bg-white px-3 pt-3 sm:px-4">
                    <div className="grid grid-cols-2 gap-2">
                      {MODAL_TABS.map((tab) => {
                        const isActive = activeTab === tab.id;

                        return (
                          <motion.button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            whileTap={{
                              scale: 0.97,
                            }}
                            className={`relative flex min-w-0 items-center gap-3 rounded-t-[18px] px-3 pb-4 pt-3 text-left transition ${
                              isActive
                                ? "bg-primary-50 text-primary-800"
                                : "text-gray-500 hover:bg-gray-50 hover:text-primary-700"
                            }`}
                          >
                            <motion.span
                              animate={
                                isActive
                                  ? {
                                      scale: [1, 1.08, 1],
                                    }
                                  : {
                                      scale: 1,
                                    }
                              }
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${
                                isActive
                                  ? "bg-primary-800 text-white shadow-md"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {tab.icon}
                            </motion.span>

                            <span className="min-w-0">
                              <span className="block truncate text-[16px] font-semibold">
                                {tab.label}
                              </span>

                              <span className="mt-1 hidden truncate text-[16px] text-gray-400 sm:block">
                                {tab.description}
                              </span>
                            </span>

                            {isActive && (
                              <motion.div
                                layoutId="foodhub-ai-tab-indicator"
                                className="absolute bottom-0 left-3 right-3 h-[3px] rounded-full bg-primary-800"
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 40,
                                }}
                              />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="scrollbar-hide flex-1 overflow-y-auto">
                    <div className="border-b border-gray-100 bg-white/70 px-5 py-3 backdrop-blur">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                          {activeTabInformation.icon}
                        </div>

                        <div>
                          <p className="text-[17px] font-semibold text-primary-900">
                            {activeTabInformation.label}
                          </p>

                          <p className="mt-1 text-[16px] leading-7 text-gray-500">
                            {activeTabInformation.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{
                          opacity: 0,
                          x: activeTab === "swipe" ? -24 : 24,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        exit={{
                          opacity: 0,
                          x: activeTab === "swipe" ? 24 : -24,
                        }}
                        transition={{
                          duration: 0.24,
                          ease: "easeOut",
                        }}
                      >
                        {renderTabContent()}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="border-t border-gray-200 bg-white px-5 py-3">
                    <div className="flex items-start justify-center gap-2 text-center">
                      <HiOutlineLightBulb className="mt-0.5 shrink-0 text-[22px] text-secondary-500" />

                      <p className="text-[16px] leading-7 text-gray-500">
                        ការណែនាំនេះផ្អែកលើទិន្នន័យ ចំណូលចិត្ត
                        និងលក្ខខណ្ឌសុវត្ថិភាពរបស់អ្នក។
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
