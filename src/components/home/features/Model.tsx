"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useDispatch } from "react-redux";

import { createPortal } from "react-dom";

import { AnimatePresence, motion } from "framer-motion";

import { HiOutlineLightBulb, HiSparkles } from "react-icons/hi2";

import { IoClose, IoRefresh, IoSparkles } from "react-icons/io5";

import { MdSwipe } from "react-icons/md";
import { RiRobot2Line } from "react-icons/ri";
import { TbWheel } from "react-icons/tb";

import { menuApi, useGetMenuItemsQuery } from "@/app/store/menuApi";
import { useGetMemberProfilesQuery } from "@/app/store/memberProfileApi";
import { useCreateRecommendationSessionMutation } from "@/app/store/recommendationApi";
import {
  getRecommendationTargets,
  useRecommendationProfileSelection,
} from "@/hooks/useRecommendationProfileSelection";

import SwipeCardTinderStyle from "./SwipeCardTinderStyle";
import SpinFood from "./SpinFood";
import AiPromptRecommender from "./AiPromptRecommender";

import type { CatalogMenuItem } from "@/types/catalog-menu-item";
import type { AppDispatch } from "@/app/store/store";
import type { MemberProfile } from "@/types/member-profile/member-profile";

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
    label: "បង្វិលកង",
    description: "ឱ្យ AI ជួយជ្រើសរើសមុខម្ហូបមួយសម្រាប់អ្នក",
    icon: <TbWheel className="text-[24px]" />,
  },
];

function getTopRecommendation(
  foods: CatalogMenuItem[],
): CatalogMenuItem | null {
  return foods[0] ?? null;
}

function getPreferenceLabels(foods: CatalogMenuItem[]): string[] {
  const values = new Set<string>();

  foods.slice(0, 6).forEach((food) => {
    if (!Array.isArray(food.food?.dietaryTypes)) {
      return;
    }

    food.food.dietaryTypes.forEach((item) => {
      if (item.name) {
        values.add(item.name);
      }
    });
  });

  return Array.from(values).slice(0, 4);
}

export default function Model() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
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
        .sort((firstFood, secondFood) => {
          if (firstFood.isFeatured !== secondFood.isFeatured) {
            return firstFood.isFeatured ? -1 : 1;
          }

          return (
            Number(secondFood.store?.averageRating ?? 0) -
            Number(firstFood.store?.averageRating ?? 0)
          );
        }),
    [menuItems],
  );

  // --- Real recommendation session, shared by the swipe deck and the AI
  // prompt box below it (previously two independent features: the swipe
  // deck always showed the full catalog regardless of what was typed here).
  const dispatch = useDispatch<AppDispatch>();

  const { data: profilesData, isLoading: isLoadingProfiles } =
    useGetMemberProfilesQuery();
  const [createSession, { data: session, isLoading: isSessionLoading, error: sessionError }] =
    useCreateRecommendationSessionMutation();

  const [prompt, setPrompt] = useState("");
  const [enrichedSwipeFoods, setEnrichedSwipeFoods] = useState<CatalogMenuItem[]>([]);
  const hasAutoTriggeredRef = useRef(false);

  const activeProfiles = useMemo(() => {
    const list = Array.isArray(profilesData)
      ? profilesData
      : profilesData?.contents ?? [];
    return list.filter((p) => p.isActive !== false);
  }, [profilesData]);

  // Which family profiles are opted in to receive recommendations. Persisted
  // (see the hook) so this stays in sync with the same toggle on the
  // "គណនីសមាជិកគ្រួសារ" dashboard list. Selecting none falls back to the
  // default profile; selecting several runs a GROUP session safe for all of
  // them.
  const {
    selectedUuids: selectedProfileUuids,
    toggleProfile: toggleProfileSelection,
    selectAll: selectAllProfileUuids,
  } = useRecommendationProfileSelection();

  const targetProfiles = useMemo(
    () => getRecommendationTargets(activeProfiles, selectedProfileUuids),
    [activeProfiles, selectedProfileUuids],
  );

  const allActiveProfilesSelected =
    activeProfiles.length > 0 &&
    activeProfiles.every((p) => selectedProfileUuids.includes(p.uuid));

  const canRecommend = activeProfiles.length > 0;
  const sessionItems = useMemo(() => session?.items ?? [], [session]);

  const runRecommendation = (
    promptText?: string,
    targetProfilesOverride?: MemberProfile[],
  ) => {
    const targets = targetProfilesOverride ?? targetProfiles;
    if (!canRecommend || isSessionLoading || targets.length === 0) return;

    void createSession({
      mode: targets.length > 1 ? "GROUP" : "SINGLE",
      requestSource: promptText ? "USER_PROMPT" : "HOME_SWIPE",
      requestedLimit: 12,
      contextData: promptText ? { userPrompt: promptText } : undefined,
      profiles: targets.map((profile, index) => ({
        profileId: profile.uuid,
        isPrimary: index === 0,
      })),
    });
  };

  const handlePromptSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    runRecommendation(prompt.trim());
  };

  const handleToggleProfile = (profile: MemberProfile) => {
    const nextUuids = selectedProfileUuids.includes(profile.uuid)
      ? selectedProfileUuids.filter((id) => id !== profile.uuid)
      : [...selectedProfileUuids, profile.uuid];

    toggleProfileSelection(profile.uuid);
    runRecommendation(
      prompt.trim() || undefined,
      getRecommendationTargets(activeProfiles, nextUuids),
    );
  };

  const handleSelectAllProfiles = () => {
    if (allActiveProfilesSelected) {
      selectAllProfileUuids([]);
      runRecommendation(
        prompt.trim() || undefined,
        getRecommendationTargets(activeProfiles, []),
      );
    } else {
      const allUuids = activeProfiles.map((p) => p.uuid);
      selectAllProfileUuids(allUuids);
      runRecommendation(prompt.trim() || undefined, activeProfiles);
    }
  };

  // Auto-run a default (prompt-less) session the first time the modal opens,
  // so the swipe deck starts personalized without requiring the user to type
  // anything first.
  useEffect(() => {
    if (!isOpen || hasAutoTriggeredRef.current || !canRecommend || targetProfiles.length === 0)
      return;
    hasAutoTriggeredRef.current = true;
    runRecommendation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, canRecommend, targetProfiles]);

  // Enrich the ranked recommendation UUIDs with full catalog detail (image,
  // store, price, ...) that SwipeCardTinderStyle's card UI needs but
  // RecommendationItem does not carry. The detail endpoint accepts the
  // session UUID and returns the same personalized ranking/reason for each.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!session || sessionItems.length === 0) {
        if (!cancelled) setEnrichedSwipeFoods([]);
        return;
      }

      const results = await Promise.all(
        sessionItems.map((item) =>
          dispatch(
            menuApi.endpoints.getMenuItemByUuid.initiate({
              uuid: item.uuid,
              sessionUuid: session.uuid,
            }),
          )
            .unwrap()
            .catch(() => null),
        ),
      );

      if (cancelled) return;

      setEnrichedSwipeFoods(
        results.filter((food): food is CatalogMenuItem => food !== null),
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [session, sessionItems, dispatch]);

  // Personalized swipe deck when a session produced enriched results;
  // otherwise fall back to the plain catalog browse list so swiping still
  // works for anonymous users or while the session is still loading.
  const swipeFoods =
    enrichedSwipeFoods.length > 0 ? enrichedSwipeFoods : recommendedFoods;

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
        <div className="flex  min-h-[460px] flex-col items-center justify-center gap-5 px-5 text-center">
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

            <RiRobot2Line className="text-[34px] text-primary-800 dark:text-primary-dark" />
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
      return (
        <div className="flex w-full flex-col">
          <div className="flex w-full justify-center">
            <SwipeCardTinderStyle foods={swipeFoods} />
          </div>
          {/* Same recommendation session feeds the deck above: submitting a
              prompt here re-ranks the swipe cards too, not just this list. */}
          <AiPromptRecommender
            prompt={prompt}
            onPromptChange={setPrompt}
            onSubmit={handlePromptSubmit}
            isLoading={isSessionLoading}
            error={sessionError}
            items={sessionItems}
            canRecommend={canRecommend}
            isLoadingProfiles={isLoadingProfiles}
            profiles={activeProfiles}
            targetProfiles={targetProfiles}
            onToggleProfile={handleToggleProfile}
            onSelectAllProfiles={handleSelectAllProfiles}
            allProfilesSelected={allActiveProfilesSelected}
          />
        </div>
      );
    }

    return <SpinFood />;
  };

  return (
    <>
      <motion.button
        type="button"
        // aria-label="Open FoodHub AI assistant"
        onClick={openModal}
        initial={{
          opacity: 0,
          scale: 0.35,
          y: 60,
          rotate: -18,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          rotate: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 210,
          damping: 17,
          delay: 0.35,
        }}
        whileHover="hover"
        whileTap={{
          scale: 0.92,
        }}
        className="group  fixed bottom-6 right-6 z-90 cursor-pointer border-0 bg-transparent p-0 outline-none md:bottom-10 md:right-10"
      >
        {/* AI recommendation preview */}
        <motion.div
          initial={{
            opacity: 0,
            x: 24,
            scale: 0.92,
            filter: "blur(8px)",
          }}
          variants={{
            hover: {
              opacity: 1,
              x: 0,
              scale: 1,
              filter: "blur(0px)",
            },
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 24,
          }}
          className="pointer-events-none absolute bottom-0 right-[98px] hidden w-[290px] overflow-hidden rounded-[24px] border border-white/60 bg-white/85 p-4 text-left z-99 shadow-[0_24px_80px_rgba(18,80,55,0.28)] backdrop-blur-2xl sm:block"
        >
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-cyan-400 via-primary-700 to-secondary-500" />

          <motion.div
            aria-hidden="true"
            className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-300/20 blur-3xl"
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.35, 0.7, 0.35],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="relative flex items-start gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-primary-900 to-secondary-500 text-white shadow-lg">
              <RiRobot2Line className="text-[27px]" />

              <motion.span
                className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white"
                animate={{
                  opacity: [1, 0.35, 1],
                  scale: [1, 0.8, 1],
                }}
                transition={{
                  duration: 1.3,
                  repeat: Infinity,
                }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[17px] font-semibold text-primary-900">
                  FoodHub
                </p>

                <span className="rounded-full bg-green-50 px-2.5 py-1 text-[16px] font-medium text-green-600">
                  Active
                </span>
              </div>

              <p className="mt-1 text-[16px] leading-7 text-gray-500">
                ខ្ញុំបានរកឃើញមុខម្ហូបដែលសមនឹងអ្នក
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-full bg-primary-50 px-3 py-1.5 text-[16px] font-medium text-primary-700">
                  95% Match
                </span>

                <span className="rounded-full bg-secondary-50 px-3 py-1.5 text-[16px] font-medium text-secondary-600">
                  Nearby
                </span>
              </div>
            </div>
          </div>

          <motion.div
            className="mt-4 flex items-center gap-1"
            animate={{
              opacity: [0.55, 1, 0.55],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            {[8, 14, 10, 18, 12, 16, 9].map((height, index) => (
              <motion.span
                key={index}
                className="w-1 rounded-full bg-gradient-to-t from-primary-700 to-cyan-400"
                animate={{
                  height: [height, height + 8, height],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: index * 0.08,
                  ease: "easeInOut",
                }}
                style={{
                  height,
                }}
              />
            ))}

            <span className="ml-2 text-[16px] text-gray-400">AI is ready</span>
          </motion.div>
        </motion.div>

        {/* Floating AI message */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.6,
            y: 12,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            delay: 1.1,
            type: "spring",
            stiffness: 300,
            damping: 19,
          }}
          className="pointer-events-none absolute right-2 -top-16 hidden whitespace-nowrap rounded-[18px] rounded-br-[5px] border border-primary-100 bg-white/95 px-4 py-2.5 text-[16px] font-medium text-primary-900 shadow-[0_12px_40px_rgba(20,70,45,0.18)] backdrop-blur-xl md:block"
        >
          {/* តើថ្ងៃនេះអ្នកចង់ញ៉ាំអ្វី? */}
          ណែនាំម្ហូបអាហារដោយAI
          <motion.span
            className="ml-2 inline-block text-secondary-500"
            animate={{
              rotate: [0, 20, -12, 0],
              scale: [1, 1.25, 1],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              repeatDelay: 1.8,
            }}
          >
            ✦
          </motion.span>
        </motion.div>

        {/* Main AI core */}
        <motion.div
          variants={{
            hover: {
              scale: 1.1,
              y: -7,
              rotate: 2,
            },
          }}
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 20,
          }}
          className="relative flex h-[92px] w-[92px] items-center justify-center"
        >
          {/* Outer energy pulse */}
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/30 via-primary-600/25 to-secondary-500/30 blur-xl"
            animate={{
              scale: [0.92, 1.32, 0.92],
              opacity: [0.7, 0.12, 0.7],
            }}
            transition={{
              duration: 2.7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Large rotating ring */}
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-dashed border-cyan-300/70"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Reverse rotating ring */}
          <motion.span
            aria-hidden="true"
            className="absolute inset-[7px] rounded-full border border-secondary-300/50"
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Orbit particle one */}
          <motion.span
            aria-hidden="true"
            className="absolute inset-[2px] rounded-full"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,1)]" />
          </motion.span>

          {/* Orbit particle two */}
          <motion.span
            aria-hidden="true"
            className="absolute inset-[10px] rounded-full"
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 6.5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <span className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-yellow-300 shadow-[0_0_14px_rgba(253,224,71,1)]" />
          </motion.span>

          {/* AI shell */}
          <div className="absolute inset-[10px] rounded-full bg-gradient-to-br from-cyan-300 via-primary-700 to-secondary-500 p-[2px] shadow-[0_20px_45px_rgba(20,90,65,0.5)]">
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#062f2b] via-primary-900 to-[#1b4332]">
              {/* Internal glow */}
              <motion.span
                className="absolute -left-7 -top-8 h-20 w-20 rounded-full bg-cyan-200/25 blur-2xl"
                animate={{
                  x: [0, 40, 0],
                  y: [0, 28, 0],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Grid */}
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
                  backgroundSize: "10px 10px",
                }}
              />

              {/* Scanner */}
              <motion.span
                aria-hidden="true"
                className="absolute left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-cyan-200 to-transparent shadow-[0_0_10px_rgba(165,243,252,1)]"
                animate={{
                  y: [-26, 26, -26],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2.5,
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
                <div className="relative mb-1 h-3 w-[2px] rounded-full bg-white/80">
                  <motion.span
                    className="absolute -left-[4px] -top-1.5 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,1)]"
                    animate={{
                      scale: [1, 0.7, 1],
                      opacity: [1, 0.4, 1],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                    }}
                  />
                </div>

                <div className="relative flex h-9 w-12 items-center justify-center gap-2.5 rounded-[13px] border border-cyan-100/20 bg-white/10 shadow-inner backdrop-blur">
                  <motion.span
                    className="h-3 w-2 rounded-full bg-cyan-100 shadow-[0_0_10px_rgba(207,250,254,1)]"
                    animate={{
                      scaleY: [1, 1, 0.15, 1],
                    }}
                    transition={{
                      duration: 3.2,
                      repeat: Infinity,
                      times: [0, 0.45, 0.5, 1],
                    }}
                  />

                  <motion.span
                    className="h-3 w-2 rounded-full bg-cyan-100 shadow-[0_0_10px_rgba(207,250,254,1)]"
                    animate={{
                      scaleY: [1, 1, 0.15, 1],
                    }}
                    transition={{
                      duration: 3.2,
                      repeat: Infinity,
                      times: [0, 0.45, 0.5, 1],
                    }}
                  />

                  <motion.span
                    className="absolute inset-x-2 bottom-1 h-[1px] rounded-full bg-cyan-200/70"
                    animate={{
                      scaleX: [0.5, 1, 0.5],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                    }}
                  />
                </div>

                <div className="mt-1.5 flex items-end gap-0.5">
                  {[5, 8, 6, 10, 5].map((height, index) => (
                    <motion.span
                      key={index}
                      className="w-1 rounded-full bg-cyan-200"
                      animate={{
                        height: [height, height + 5, height],
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

              {/* Sparkles */}
              <motion.span
                className="absolute right-2 top-2 text-yellow-300"
                animate={{
                  rotate: 360,
                  scale: [0.8, 1.25, 0.8],
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

          {/* Online status */}
          <motion.span
            className="absolute bottom-1 right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-[0_5px_16px_rgba(0,0,0,0.2)]"
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

          {/* AI badge */}
          <motion.span
            initial={{
              scale: 0,
              rotate: -20,
            }}
            animate={{
              scale: 1,
              rotate: 0,
            }}
            transition={{
              delay: 0.9,
              type: "spring",
              stiffness: 400,
              damping: 16,
            }}
            className="absolute -right-3 top-1 z-30 flex h-8 min-w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-secondary-400 to-secondary-600 px-1.5 text-[16px] font-bold text-white shadow-[0_8px_20px_rgba(234,88,12,0.45)]"
          >
            AI
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
                                ? "bg-primary-50 text-primary-800 dark:text-primary-dark"
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
                    {/* <div className="border-b border-gray-100 bg-white/70 px-5 py-3 backdrop-blur">
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
                      </div> */}

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

                  {/* <div className="border-t border-gray-200 bg-white px-5 py-">
                      <div className="flex items-start justify-center gap-2 text-center">
                        <HiOutlineLightBulb className="mt-0.5 shrink-0 text-[22px] text-secondary-500" />

                        <p className="text-[16px] leading-7 text-gray-500">
                          ការណែនាំនេះផ្អែកលើទិន្នន័យ ចំណូលចិត្ត
                          និងលក្ខខណ្ឌសុវត្ថិភាពរបស់អ្នក។
                        </p>
                      </div>
                    </div> */}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
