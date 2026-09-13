"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationPermissionModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if we've already asked the user
    const hasAsked = localStorage.getItem("foodhub_notification_permission_asked");
    
    // Only show if the browser supports notifications
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default" && !hasAsked) {
        // Show after 15s delay so it doesn't interrupt initial page load or audits
        const timer = setTimeout(() => setIsOpen(true), 15000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleClose = (allow: boolean) => {
    localStorage.setItem("foodhub_notification_permission_asked", "true");
    setIsOpen(false);

    if (allow && "Notification" in window) {
      Notification.requestPermission();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[310px] rounded-[18px] bg-white text-center shadow-2xl pt-10"
          >
            {/* Logo Image - Floating above */}
            <div className="absolute -top-[50px] left-1/2 -translate-x-1/2 w-[100px] h-[100px] pointer-events-none bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center p-3">
              <div className="relative w-full h-full">
                <Image
                  src="/Image/foodHub-logo.webp"
                  alt="FoodHub Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <div className="px-6 pb-5 pt-4">
              <h2 className="text-[17px] font-semibold text-black mb-2 tracking-tight">
                Please turn on Notifications
              </h2>
              <p className="text-[13px] leading-[18px] text-gray-500">
                You'll be able to receive updates about your food orders and promotions on your phone.
              </p>
            </div>

            <div className="flex border-t border-gray-200">
              <button
                onClick={() => handleClose(false)}
                className="flex-1 py-3.5 text-[16px] text-[#FF3B30] hover:bg-gray-50 active:bg-gray-100 transition-colors rounded-bl-[18px]"
              >
                Don't Allow
              </button>
              <div className="w-[1px] bg-gray-200" />
              <button
                onClick={() => handleClose(true)}
                className="group relative flex-1 flex justify-center items-center gap-2 py-3.5 text-[16px] font-bold text-primary-800 hover:bg-primary-50/50 active:bg-primary-100/50 transition-colors rounded-br-[18px]"
              >
                <span>Allow</span>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
