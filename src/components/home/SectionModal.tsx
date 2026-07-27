"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { HiSparkles } from "react-icons/hi2";
import RecommendCardStack from "./RecommendationStack";
import { FoodItem } from "@/types/food";
import SpinWheel from "./Spinwheel ";
import { useGetFoodsQuery } from "@/app/store/foodApi";

type ModalTab = "swipe" | "spin";

const MODAL_TABS: { id: ModalTab; label: string }[] = [
  { id: "swipe", label: "អូសមើលម្ហូប" },
  { id: "spin", label: "បង្វិលកង់" },
];

export default function SectionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>("swipe");

  // portal needs a real DOM target, which only exists client-side
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => cancelAnimationFrame(id);
  }, []);

  // always land on the swipe tab when the modal is (re)opened
  // useEffect(() => {
  //   if (isOpen) setActiveTab("swipe");
  // }, [isOpen]);
  const openModal = () => {
    setActiveTab("swipe");
    setIsOpen(true);
  };
  // lock page scroll while open + let Escape close it
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const {
    data: recommendedFoods = [],
    isLoading,
    isError,
  } = useGetFoodsQuery();
  return (
    <div>
      {/* floating AI-assistant style launcher — lives bottom-right on
          every page it's mounted on, always visible above content */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open food recommendations"
        initial={{ opacity: 0, scale: 0, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        className="group fixed bottom-10 right-10 z-99 flex items-center gap-0 rounded-full bg-gradient-to-br from-primary-800 to-secondary-500 p-2.5 pr-2.5 text-white shadow-xl shadow-primary-800/30 transition-[padding,gap] duration-300 hover:gap-2 hover:pr-5 cursor-pointer"
      >
        {/* soft pulsing glow — the "AI is here / available" cue */}
        <motion.span
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full bg-primary-700"
          animate={{ scale: [1, 1.35, 1], opacity: [0.55, 0, 0.55] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />

        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
          <motion.span
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center justify-center"
          >
            <HiSparkles className="text-xl" />
          </motion.span>
          {/* small "active" beacon dot */}
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white" />
        </span>

        <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-300 group-hover:max-w-[160px] group-hover:opacity-100">
          ណែនាំម្ហូបសម្រាប់អ្នក
        </span>
      </motion.button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={() => setIsOpen(false)}
                className="fixed    inset-0 z-99 flex items-center justify-center bg-black/10 backdrop-blur-sm px-4"
              >
                <motion.div
                  key="panel"
                  initial={{ opacity: 0, scale: 0.92, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 16 }}
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  onClick={(e) => e.stopPropagation()}
<<<<<<<< HEAD:src/components/home/SectionModal.tsx
                  className="relative overflow-clip shadow-md border w-full max-w-md max-h-[90vh]  rounded-[28px] bg-[#f5f4f3] p-4 "
========
                  className="relative shadow-md border w-full overflow-x-clip max-w-md max-h-[90vh]  rounded-[28px] bg-[#f5f4f3] p-4 "
>>>>>>>> 3ac91be43590fb4a71ed6e9b2bb87bc0fa094ff4:src/app/home/SectionModal.tsx
                >
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={() => setIsOpen(false)}
                    className="absolute top-3 right-3 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-md text-gray-600 hover:bg-gray-100 active:scale-90 transition-all cursor-pointer"
                  >
                    <IoClose className="text-xl" />
                  </button>

                  {/* tab switcher — same underline pattern used for the
                      meal-time tabs elsewhere in the app */}
                  <div className="mt-8 mb-2 flex gap-6 border-b border-gray-200 px-1">
                    {MODAL_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative cursor-pointer pb-3 text-xl font-semibold transition-colors ${
                          activeTab === tab.id
                            ? "text-primary-700"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        {tab.label}
                        {activeTab === tab.id && (
                          <motion.div
                            layoutId="modal-tab-underline"
                            className="absolute left-0 right-0 -bottom-[1px] h-[3px] rounded-full bg-primary-700"
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 40,
                            }}
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* content — crossfades + slides between the two views;
                      mode="wait" so the outgoing view fully leaves before
                      the next one animates in, avoiding overlap jank */}
                  <AnimatePresence mode="wait">
                    {activeTab === "swipe" ? (
                      <motion.div
                        key="swipe"
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      >
                        <RecommendCardStack foods={recommendedFoods} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="spin"
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      >
                        <SpinWheel foods={recommendedFoods} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
