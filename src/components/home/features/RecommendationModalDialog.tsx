"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineLightBulb } from "react-icons/hi2";
import { IoAlertCircleOutline, IoClose, IoRefresh, IoSparkles } from "react-icons/io5";
import { MdSwipe } from "react-icons/md";
import { RiRobot2Line } from "react-icons/ri";
import { TbWheel } from "react-icons/tb";

import { useGetMemberProfilesQuery } from "@/app/store/memberProfileApi";
import { useCreateRecommendationSessionMutation } from "@/app/store/recommendationApi";
import {
  getRecommendationTargets,
  useRecommendationProfileSelection,
} from "@/hooks/useRecommendationProfileSelection";
import { useEnrichedRecommendationItems } from "@/hooks/useEnrichedRecommendationItems";
import {
  isDrinkItem,
  isFoodItem,
  type CategoryFilterType,
} from "@/lib/category-filter";

import SwipeCardTinderStyle from "./SwipeCardTinderStyle";
import SpinFood from "./SpinFood";
import AiPromptRecommender from "./AiPromptRecommender";
import { ProfileMultiSelect } from "@/components/profile/ProfileMultiSelect";
import type { MemberProfile } from "@/types/member-profile/member-profile";

type ModalTab = "swipe" | "spin" | "chat";

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
  {
    id: "chat",
    label: "ជជែកជាមួយ AI",
    description: "ប្រាប់ AI នូវលក្ខខណ្ឌរបស់អ្នក ដើម្បីទទួលបានការណែនាំ",
    icon: <IoSparkles className="text-[24px]" />,
  },
];

interface RecommendationModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RecommendationModalDialog({
  isOpen,
  onClose,
}: RecommendationModalDialogProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>("swipe");

  const { data: profilesData, isLoading: isLoadingProfiles } =
    useGetMemberProfilesQuery();
  const [
    createSession,
    { data: session, isLoading: isSessionLoading, error: sessionError },
  ] = useCreateRecommendationSessionMutation();

  const [prompt, setPrompt] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilterType>("ALL");
  const hasAutoTriggeredRef = useRef(false);
  const sessionInFlightRef = useRef(false);

  const activeProfiles = useMemo(() => {
    const list = Array.isArray(profilesData)
      ? profilesData
      : (profilesData?.contents ?? []);
    return list.filter((p) => p.isActive !== false);
  }, [profilesData]);

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
    categoryFilterOverride?: CategoryFilterType,
  ) => {
    const targets = targetProfilesOverride ?? targetProfiles;
    const cat = categoryFilterOverride ?? categoryFilter;
    if (
      !canRecommend ||
      isSessionLoading ||
      sessionInFlightRef.current ||
      targets.length === 0
    ) {
      return;
    }

    sessionInFlightRef.current = true;

    void Promise.resolve(
      createSession({
        mode: targets.length > 1 ? "GROUP" : "SINGLE",
        requestSource: promptText ? "OTHER" : "HOMEPAGE_AUTO",
        requestedLimit: 15,
        searchRadiusKm: 3,
        currencyCode: "USD",
        rootCategoryCode: cat === "ALL" ? undefined : cat,
        contextData: promptText ? { userPrompt: promptText } : undefined,
        profiles: targets.map((profile, index) => ({
          profileId: profile.uuid,
          isPrimary: index === 0,
        })),
      }),
    ).finally(() => {
      sessionInFlightRef.current = false;
    });
  };

  /*
   * Purely a display filter -- no new session.
   *
   * `displayedFoods` below already narrows the loaded items to FOOD/DRINK,
   * so re-running the recommendation here spent a full backend round trip
   * (safety checks over every candidate, scoring, and paid AI calls) only to
   * hand back a list the client then filtered anyway. Switching tabs is now
   * instant, and the counts beside each label tell the user up front how
   * many of the loaded items fall into each category.
   */
  const handleCategoryChange = (newCat: CategoryFilterType) => {
    if (newCat === categoryFilter) return;
    setCategoryFilter(newCat);
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

  useEffect(() => {
    if (
      !isOpen ||
      hasAutoTriggeredRef.current ||
      !canRecommend ||
      targetProfiles.length === 0
    )
      return;
    hasAutoTriggeredRef.current = true;
    runRecommendation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, canRecommend, targetProfiles]);

  const { enrichedItems: enrichedSwipeFoods, isEnriching } =
    useEnrichedRecommendationItems(session, sessionItems);

  const displayedFoods = useMemo(() => {
    if (categoryFilter === "FOOD") {
      return enrichedSwipeFoods.filter((f) => isFoodItem(f));
    }
    if (categoryFilter === "DRINK") {
      return enrichedSwipeFoods.filter((f) => isDrinkItem(f));
    }
    return enrichedSwipeFoods;
  }, [enrichedSwipeFoods, categoryFilter]);

  const categoryCounts = useMemo(() => {
    let foodCount = 0;
    let drinkCount = 0;
    for (const f of enrichedSwipeFoods) {
      if (isDrinkItem(f)) {
        drinkCount++;
      } else {
        foodCount++;
      }
    }
    return {
      ALL: enrichedSwipeFoods.length,
      FOOD: foodCount,
      DRINK: drinkCount,
    };
  }, [enrichedSwipeFoods]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const renderTabContent = () => {
    if (activeTab === "spin") {
      return (
        <SpinFood
          foods={displayedFoods}
          isLoading={isSessionLoading || isEnriching}
        />
      );
    }

    if (activeTab === "chat") {
      return (
        <AiPromptRecommender
          prompt={prompt}
          onPromptChange={setPrompt}
          onSubmit={handlePromptSubmit}
          isLoading={isSessionLoading}
          error={sessionError}
          items={displayedFoods}
          canRecommend={canRecommend}
          isLoadingProfiles={isLoadingProfiles}
          targetProfiles={targetProfiles}
        />
      );
    }

    if (isLoadingProfiles) {
      return (
        <div className="flex min-h-[460px] flex-col items-center justify-center gap-5 px-5 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-800" />
          <p className="text-[16px] text-gray-500">កំពុងផ្ទុកប្រវត្តិរូប...</p>
        </div>
      );
    }

    if (!canRecommend) {
      return (
        <div className="flex min-h-[460px] flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
            <RiRobot2Line className="text-[38px] text-amber-600" />
          </div>

          <p className="text-[20px] font-semibold text-primary-900">
            សូមចូលគណនី និងបង្កើតប្រវត្តិរូប
          </p>

          <p className="max-w-[350px] text-[16px] leading-7 text-gray-500">
            ការណែនាំម្ហូបទាមទារឱ្យអ្នកចូលគណនី
            ដើម្បីត្រួតពិនិត្យសុវត្ថិភាពទៅតាមអាឡែហ្ស៊ី
            និងលក្ខខណ្ឌសុខភាពរបស់អ្នក។
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/api/auth/login";
            }}
            className="flex items-center gap-2 rounded-full bg-primary-800 px-6 py-3 text-[16px] font-semibold text-white transition hover:bg-primary-700 active:scale-95"
          >
            ចូលគណនី
          </button>
        </div>
      );
    }

    const deckArea = (() => {
      if (isSessionLoading || isEnriching) {
        return (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-5 px-5 text-center">
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

      if (sessionError) {
        return (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-5 px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <IoAlertCircleOutline className="text-[38px] text-red-500" />
            </div>

            <div>
              <p className="text-[20px] font-semibold text-red-500">
                AI មិនអាចផ្ទុកការណែនាំបានទេ
              </p>
              <p className="mt-2 text-[16px] leading-7 text-gray-500">
                សូមពិនិត្យការតភ្ជាប់ ហើយព្យាយាមម្តងទៀត
              </p>
            </div>

            <button
              type="button"
              onClick={() => runRecommendation(prompt.trim() || undefined)}
              className="flex items-center gap-2 rounded-full bg-primary-800 px-6 py-3 text-[16px] font-semibold text-white transition hover:bg-primary-700 active:scale-95"
            >
              <IoRefresh className="text-[20px]" />
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        );
      }

      if (session && displayedFoods.length === 0) {
        return (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-50">
              <HiOutlineLightBulb className="text-[38px] text-primary-700" />
            </div>

            <p className="text-[20px] font-semibold text-primary-900">
              {categoryFilter === "DRINK"
                ? "រកមិនឃើញភេសជ្ជៈដែលត្រូវគ្នាទេ"
                : categoryFilter === "FOOD"
                  ? "រកមិនឃើញមុខម្ហូបដែលត្រូវគ្នាទេ"
                  : "រកមិនឃើញម្ហូបដែលត្រូវគ្នាទេ"}
            </p>

            <p className="max-w-[350px] text-[16px] leading-7 text-gray-500">
              {categoryFilter === "DRINK"
                ? "មិនទាន់មានភេសជ្ជៈណាត្រូវនឹងលក្ខខណ្ឌសុវត្ថិភាព ឬចំណូលចិត្តរបស់អ្នកទេ។ សូមសាកល្បងជ្រើសរើសប្រភេទផ្សេង ឬចុចព្យាយាមម្តងទៀត។"
                : "គ្មានមុខម្ហូបណាត្រូវនឹងលក្ខខណ្ឌសុវត្ថិភាព អាឡែហ្ស៊ី ឬរបបអាហាររបស់អ្នកទេ។ សូមសាកល្បងជ្រើសរើសប្រវត្តិរូបតែម្នាក់ជំនួសឱ្យទាំងអស់គ្នា ឬកែប្រែពាក្យសុំ និងការកំណត់សុវត្ថិភាពប្រវត្តិរូប។"}
            </p>

            <button
              type="button"
              onClick={() => runRecommendation(prompt.trim() || undefined)}
              className="flex items-center gap-2 rounded-full bg-primary-800 px-6 py-3 text-[16px] font-semibold text-white transition hover:bg-primary-700 active:scale-95"
            >
              <IoRefresh className="text-[20px]" />
              ព្យាយាមម្តងទៀត
            </button>
          </div>
        );
      }

      if (displayedFoods.length === 0) {
        return (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-5 px-5 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-800" />
          </div>
        );
      }

      return <SwipeCardTinderStyle foods={displayedFoods} />;
    })();

    return (
      <div className="flex w-full flex-col">
        <div className="flex w-full justify-center">{deckArea}</div>
      </div>
    );
  };

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="foodhub-ai-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-3 py-4 backdrop-blur-md sm:px-5"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="FoodHub AI recommendation assistant"
            key="foodhub-ai-modal"
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 25 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 28,
            }}
            onClick={(event) => event.stopPropagation()}
            className="relative flex max-h-[94vh] w-full max-w-[560px] md:max-w-[680px] lg:max-w-[800px] flex-col overflow-hidden rounded-[32px] border border-white/50 bg-[#f6f7f5] shadow-[0_35px_120px_rgba(0,0,0,0.35)]"
          >
            <div className="border-b border-gray-200 bg-white px-3 pt-3 sm:px-4">
              <div className="mb-3 flex items-center justify-between pl-1 pr-1">
                <h2 className="text-[17px] font-bold text-gray-900">
                  ការណែនាំពី AI
                </h2>
                <div className="flex items-center gap-2">
                  <ProfileMultiSelect
                    profiles={activeProfiles}
                    targetProfiles={targetProfiles}
                    onToggle={handleToggleProfile}
                    onSelectAll={handleSelectAllProfiles}
                    allSelected={allActiveProfilesSelected}
                  />
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 cursor-pointer"
                  >
                    <IoClose className="text-[18px]" />
                  </button>
                </div>
              </div>

              <div className="flex overflow-x-auto snap-x hide-scrollbar gap-2 md:grid md:grid-cols-3">
                {MODAL_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex min-w-[150px] shrink-0 snap-start items-center gap-3 rounded-t-[18px] px-3 pb-4 pt-3 text-left transition md:min-w-0 cursor-pointer ${
                        isActive
                          ? "bg-primary-50 text-primary-800 dark:text-primary-dark"
                          : "text-gray-500 hover:bg-gray-50 hover:text-primary-700"
                      }`}
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${
                          isActive
                            ? "bg-primary-800 text-white shadow-md"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {tab.icon}
                      </span>

                      <span className="min-w-0">
                        <span className="block truncate text-[16px] font-semibold">
                          {tab.label}
                        </span>
                        <span className="mt-0.5 hidden text-[13px] leading-tight text-gray-400 sm:line-clamp-2">
                          {tab.description}
                        </span>
                      </span>

                      {isActive && (
                        <div
                          className="absolute bottom-0 left-3 right-3 h-[3px] rounded-full bg-primary-800"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Filter Bar */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white/95 px-4 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
              <span className="text-[13px] font-semibold text-gray-500 dark:text-gray-400">
                តម្រងប្រភេទ៖
              </span>
              <div className="inline-flex items-center rounded-xl bg-gray-100 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => handleCategoryChange("ALL")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                    categoryFilter === "ALL"
                      ? "bg-primary-800 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  <span> ទាំងអស់</span>
                  {categoryCounts.ALL > 0 && (
                    <span className="text-[11px] opacity-80">
                      ({categoryCounts.ALL})
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryChange("FOOD")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                    categoryFilter === "FOOD"
                      ? "bg-primary-800 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  <span> ម្ហូប</span>
                  {categoryCounts.FOOD > 0 && (
                    <span className="text-[11px] opacity-80">
                      ({categoryCounts.FOOD})
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleCategoryChange("DRINK")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                    categoryFilter === "DRINK"
                      ? "bg-primary-800 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  <span> ភេសជ្ជៈ</span>
                  {categoryCounts.DRINK > 0 && (
                    <span className="text-[11px] opacity-80">
                      ({categoryCounts.DRINK})
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="scrollbar-hide flex-1 overflow-y-auto">
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
                    duration: 0.2,
                    ease: "easeOut",
                  }}
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
