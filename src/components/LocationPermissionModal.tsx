"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  LocateFixed,
  MapPin,
  Navigation,
  ShieldCheck,
  X,
} from "lucide-react";

type LocationStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unsupported"
  | "unavailable";

type LocationPermissionModalProps = {
  open: boolean;
  status: LocationStatus;
  error?: string | null;
  onEnable: () => void;
  onClose: () => void;
};

export default function LocationPermissionModal({
  open,
  status,
  error,
  onEnable,
  onClose,
}: LocationPermissionModalProps) {
  const isRequesting = status === "requesting";
  const isDenied = status === "denied";
  const isUnsupported = status === "unsupported";
  const isUnavailable = status === "unavailable";

  const hasProblem = isDenied || isUnsupported || isUnavailable;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-md"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-dialog-title"
            aria-describedby="location-dialog-description"
            initial={{
              opacity: 0,
              y: 35,
              scale: 0.92,
              filter: "blur(10px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.96,
            }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 25,
            }}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-[500px] overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-[0_35px_100px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-[#07130f]"
          >
            {/* Background decoration */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              <motion.div
                className="absolute -left-20 -top-24 size-64 rounded-full bg-emerald-300/30 blur-[80px] dark:bg-emerald-500/15"
                animate={{
                  x: [0, 30, 0],
                  y: [0, 20, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <motion.div
                className="absolute -bottom-24 -right-20 size-64 rounded-full bg-orange-300/25 blur-[80px] dark:bg-orange-500/10"
                animate={{
                  x: [0, -25, 0],
                  y: [0, -20, 0],
                  scale: [1, 1.12, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(15,23,42,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.7)_1px,transparent_1px)] [background-size:32px_32px] dark:opacity-[0.06]" />
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close location dialog"
              className="absolute right-4 top-4 z-30 flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-500 backdrop-blur-md transition hover:bg-white hover:text-slate-900 active:scale-95 dark:border-white/10 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15 dark:hover:text-white"
            >
              <X className="size-5" />
            </button>

            <div className="relative z-10 px-6 pb-7 pt-9 sm:px-8 sm:pb-8 sm:pt-10">
              {/* Animated location icon */}
              <div className="mx-auto flex size-[120px] items-center justify-center">
                <motion.div
                  aria-hidden
                  className={`absolute size-[112px] rounded-full ${
                    hasProblem ? "bg-orange-400/15" : "bg-emerald-400/15"
                  }`}
                  animate={{
                    scale: [0.85, 1.2, 0.85],
                    opacity: [0.8, 0.1, 0.8],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <motion.div
                  aria-hidden
                  className={`absolute size-[88px] rounded-full border border-dashed ${
                    hasProblem
                      ? "border-orange-400/60"
                      : "border-emerald-400/60"
                  }`}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <span
                    className={`absolute left-1/2 top-[-5px] size-2.5 -translate-x-1/2 rounded-full ${
                      hasProblem
                        ? "bg-orange-400 shadow-[0_0_14px_rgba(251,146,60,0.9)]"
                        : "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)]"
                    }`}
                  />
                </motion.div>

                <motion.div
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className={`relative flex size-16 items-center justify-center rounded-[22px] text-white shadow-xl ${
                    hasProblem
                      ? "bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/30"
                      : "bg-gradient-to-br from-emerald-400 to-emerald-700 shadow-emerald-500/30"
                  }`}
                >
                  {hasProblem ? (
                    <AlertTriangle className="size-8" />
                  ) : (
                    <MapPin className="size-8" />
                  )}
                </motion.div>
              </div>

              {/* Text */}
              <div className="mt-3 text-center">
                <p className="text-[14px] font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300">
                  FoodHub Location
                </p>

                <h2
                  id="location-dialog-title"
                  className="mt-2 font-['Kantumruy_Pro',sans-serif] text-[26px] font-bold leading-relaxed text-slate-900 sm:text-[30px] dark:text-white"
                >
                  {isDenied
                    ? "ការចូលប្រើទីតាំងត្រូវបានបិទ"
                    : isUnsupported
                      ? "កម្មវិធីរុករកមិនគាំទ្រទីតាំង"
                      : isUnavailable
                        ? "រកមិនឃើញទីតាំងរបស់អ្នក"
                        : "អនុញ្ញាតឱ្យប្រើទីតាំងរបស់អ្នក"}
                </h2>

                <p
                  id="location-dialog-description"
                  className="mx-auto mt-3 max-w-[410px] font-['Kantumruy_Pro',sans-serif] text-[16px] leading-7 text-slate-600 dark:text-slate-300"
                >
                  {isDenied
                    ? "សូមបើកសិទ្ធិទីតាំងក្នុងការកំណត់របស់កម្មវិធីរុករក ដើម្បីឱ្យ FoodHub អាចស្វែងរកហាងអាហារនៅជិតអ្នក។"
                    : isUnsupported
                      ? "កម្មវិធីរុករកនេះមិនអាចប្រើមុខងារទីតាំងបានទេ។ អ្នកនៅតែអាចស្វែងរកហាងដោយបញ្ចូលទីតាំងដោយដៃ។"
                      : isUnavailable
                        ? "យើងមិនអាចរកទីតាំងរបស់អ្នកនៅពេលនេះបានទេ។ សូមពិនិត្យ GPS និងការតភ្ជាប់របស់អ្នក។"
                        : "FoodHub ប្រើទីតាំងរបស់អ្នក ដើម្បីណែនាំហាងអាហារ និងមុខម្ហូបដែលនៅជិតអ្នក។"}
                </p>
              </div>

              {/* Benefits */}
              {!hasProblem && (
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <BenefitItem
                    icon={<LocateFixed className="size-5" />}
                    label="ហាងនៅជិតអ្នក"
                  />

                  <BenefitItem
                    icon={<Navigation className="size-5" />}
                    label="ចម្ងាយត្រឹមត្រូវ"
                  />

                  <BenefitItem
                    icon={<ShieldCheck className="size-5" />}
                    label="រក្សាឯកជនភាព"
                  />
                </div>
              )}

              {error && status !== "granted" && (
                <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-[15px] leading-6 text-orange-700 dark:border-orange-400/20 dark:bg-orange-400/10 dark:text-orange-200">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                {!isUnsupported && (
                  <motion.button
                    type="button"
                    onClick={onEnable}
                    disabled={isRequesting}
                    whileHover={isRequesting ? undefined : { y: -2 }}
                    whileTap={isRequesting ? undefined : { scale: 0.97 }}
                    className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-[16px] font-semibold text-white shadow-[0_15px_35px_-15px_rgba(5,150,105,0.8)] transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isRequesting ? (
                      <>
                        <motion.span
                          className="size-5 rounded-full border-2 border-white/40 border-t-white"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        កំពុងស្វែងរកទីតាំង
                      </>
                    ) : (
                      <>
                        <Navigation className="size-5" />
                        {hasProblem ? "ព្យាយាមម្តងទៀត" : "អនុញ្ញាតទីតាំង"}
                      </>
                    )}
                  </motion.button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isRequesting}
                  className="min-h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-[16px] font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  ស្វែងរកដោយដៃ
                </button>
              </div>

              {!hasProblem && (
                <p className="mt-4 text-center text-[14px] leading-6 text-slate-400 dark:text-slate-500">
                  អ្នកអាចផ្លាស់ប្តូរសិទ្ធិនេះនៅក្នុងការកំណត់កម្មវិធីរុករកបានគ្រប់ពេល។
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BenefitItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -3,
        scale: 1.02,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 22,
      }}
      className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 px-3 py-3 text-emerald-700 sm:flex-col sm:justify-center sm:text-center dark:border-emerald-400/10 dark:bg-emerald-400/5 dark:text-emerald-200"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-white/10">
        {icon}
      </span>

      <span className="font-['Kantumruy_Pro',sans-serif] text-[14px] font-semibold leading-5">
        {label}
      </span>
    </motion.div>
  );
}
