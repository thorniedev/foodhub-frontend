"use client";

import { AnimatePresence, motion } from "motion/react";

import {
  AlertTriangle,
  BellRing,
  Cloud,
  LoaderCircle,
  LocateFixed,
  MapPin,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";

import {
  type VoiceAlertStore,
  useNearbyStoreVoiceAlert,
} from "@/hooks/useNearbyStoreVoiceAlert";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type NearbyStoreVoiceAlertProps = {
  coordinates?: Coordinates | null;
  stores: VoiceAlertStore[];
  radiusMeters?: number;
  cooldownMilliseconds?: number;
  onRequestLocation?: () => void;
};

function getStoreName(store: VoiceAlertStore): string {
  return (
    store.localName ?? store.storeName ?? store.name ?? "ហាងអាហារនៅជិតអ្នក"
  );
}

function formatKhmerNumber(value: number): string {
  try {
    return new Intl.NumberFormat("km-KH-u-nu-khmr", {
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return String(Math.round(value));
  }
}

export default function NearbyStoreVoiceAlert({
  coordinates,
  stores,
  radiusMeters = 100,
  cooldownMilliseconds = 10 * 60 * 1000,
  onRequestLocation,
}: NearbyStoreVoiceAlertProps) {
  const {
    voiceEnabled,
    voiceSupported,
    khmerVoiceAvailable,
    speechMode,
    speechError,
    isSpeaking,
    lastAlertedStore,
    enableVoiceAlerts,
    disableVoiceAlerts,
    repeatLastAlert,
  } = useNearbyStoreVoiceAlert({
    coordinates: coordinates ?? null,
    stores,
    radiusMeters,
    cooldownMilliseconds,
  });

  const lastStoreName = lastAlertedStore
    ? getStoreName(lastAlertedStore.store)
    : null;

  const lastDistance = lastAlertedStore
    ? formatKhmerNumber(
        Math.max(1, Math.round(lastAlertedStore.distanceMeters)),
      )
    : null;

  const usingCloudVoice =
    voiceEnabled && !khmerVoiceAvailable && speechMode !== "error";

  function handleToggleVoice() {
    if (voiceEnabled) {
      disableVoiceAlerts();
      return;
    }

    if (!coordinates) {
      onRequestLocation?.();
    }

    enableVoiceAlerts();
  }

  if (!voiceSupported) {
    return (
      <div className="fixed bottom-5 left-4 z-[850] w-[calc(100%-2rem)] max-w-[360px] sm:bottom-6 sm:left-6">
        <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50/95 p-4 shadow-xl backdrop-blur-xl dark:border-orange-400/20 dark:bg-orange-950/90">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-400/15 dark:text-orange-300">
            <AlertTriangle className="size-5" />
          </span>

          <div>
            <p className="font-['Kantumruy_Pro',sans-serif] text-[16px] font-semibold text-orange-900 dark:text-orange-100">
              មិនគាំទ្រការជូនដំណឹងជាសំឡេង
            </p>

            <p className="mt-1 font-['Kantumruy_Pro',sans-serif] text-[14px] leading-6 text-orange-700 dark:text-orange-200">
              កម្មវិធីរុករកនេះមិនអាចបញ្ចេញសំឡេងបានទេ។
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed bottom-5 left-4 z-[850] w-[calc(100%-2rem)] max-w-[370px] sm:bottom-6 sm:left-6">
      <motion.div
        initial={{
          opacity: 0,
          x: -30,
          y: 25,
          scale: 0.92,
        }}
        animate={{
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 24,
          delay: 0.3,
        }}
        className="pointer-events-auto relative overflow-hidden rounded-[26px] border border-white/70 bg-white/90 shadow-[0_24px_70px_-24px_rgba(15,118,82,0.55)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#07130f]/95"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-14 -top-16 size-44 rounded-full bg-emerald-300/25 blur-3xl dark:bg-emerald-500/15"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.35, 0.75, 0.35],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-cyan-400 via-emerald-500 to-orange-400" />

        <div className="relative p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="relative flex size-12 shrink-0 items-center justify-center">
              {voiceEnabled && (
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-2xl bg-emerald-400/25"
                  animate={{
                    scale: [0.9, 1.4, 0.9],
                    opacity: [0.7, 0, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}

              <motion.span
                className={`relative flex size-12 items-center justify-center rounded-2xl text-white shadow-lg ${
                  voiceEnabled
                    ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                    : "bg-gradient-to-br from-slate-500 to-slate-700"
                }`}
                animate={
                  voiceEnabled
                    ? {
                        y: [0, -2, 0],
                      }
                    : undefined
                }
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {isSpeaking ? (
                  <LoaderCircle className="size-6 animate-spin" />
                ) : voiceEnabled ? (
                  <Volume2 className="size-6" />
                ) : (
                  <VolumeX className="size-6" />
                )}
              </motion.span>

              <motion.span
                className={`absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-white dark:border-[#07130f] ${
                  voiceEnabled ? "bg-green-400" : "bg-slate-400"
                }`}
                animate={
                  voiceEnabled
                    ? {
                        scale: [1, 1.25, 1],
                        opacity: [0.7, 1, 0.7],
                      }
                    : undefined
                }
                transition={{
                  duration: 1.3,
                  repeat: Infinity,
                }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="font-['Kantumruy_Pro',sans-serif] text-[17px] font-bold text-slate-900 dark:text-white">
                  ការជូនដំណឹងជាសំឡេង
                </p>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                    voiceEnabled
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200"
                      : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"
                  }`}
                >
                  {isSpeaking
                    ? "កំពុងនិយាយ"
                    : voiceEnabled
                      ? "បានបើក"
                      : "បានបិទ"}
                </span>
              </div>

              <p className="mt-1  text-[14px] leading-6 text-slate-500 dark:text-slate-300">
                ជូនដំណឹងពេលមានហាងត្រូវចំណូលចិត្តក្នុងចម្ងាយ{" "}
                {formatKhmerNumber(radiusMeters)} ម៉ែត្រ
              </p>
            </div>
          </div>

          {!coordinates && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-3 py-2.5 dark:border-orange-400/20 dark:bg-orange-400/10">
              <LocateFixed className="mt-0.5 size-4 shrink-0 text-orange-600 dark:text-orange-300" />

              <p className="font-['Kantumruy_Pro',sans-serif] text-[14px] leading-6 text-orange-700 dark:text-orange-200">
                សូមអនុញ្ញាតទីតាំង ដើម្បីទទួលការជូនដំណឹងអំពីហាងនៅជិតអ្នក។
              </p>
            </div>
          )}

          {usingCloudVoice && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 dark:border-emerald-400/20 dark:bg-emerald-400/10">
              <Cloud className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-300" />

              <p className="font-['Kantumruy_Pro',sans-serif] text-[14px] leading-6 text-emerald-700 dark:text-emerald-200">
                កំពុងប្រើសំឡេងភាសាខ្មែរតាមប្រព័ន្ធ Cloud។
              </p>
            </div>
          )}

          {voiceEnabled && khmerVoiceAvailable && speechMode === "device" && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-cyan-200 bg-cyan-50 px-3 py-2.5 dark:border-cyan-400/20 dark:bg-cyan-400/10">
              <Volume2 className="mt-0.5 size-4 shrink-0 text-cyan-600 dark:text-cyan-300" />

              <p className="font-['Kantumruy_Pro',sans-serif] text-[14px] leading-6 text-cyan-700 dark:text-cyan-200">
                កំពុងប្រើសំឡេងភាសាខ្មែរពីឧបករណ៍របស់អ្នក។
              </p>
            </div>
          )}

          {speechError && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-400/20 dark:bg-red-400/10">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-300" />

              <p className="font-['Kantumruy_Pro',sans-serif] text-[14px] leading-6 text-red-700 dark:text-red-200">
                មិនអាចបញ្ចេញសំឡេងភាសាខ្មែរបានទេ។ សូមពិនិត្យការកំណត់ Azure Speech
                និងការតភ្ជាប់អ៊ីនធឺណិត។
              </p>
            </div>
          )}

          <AnimatePresence>
            {voiceEnabled && lastAlertedStore && lastStoreName && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 12,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  height: "auto",
                }}
                exit={{
                  opacity: 0,
                  y: 8,
                  height: 0,
                }}
                className="overflow-hidden"
              >
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-3.5 dark:border-emerald-400/15 dark:bg-emerald-400/5">
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm dark:bg-white/10 dark:text-emerald-300">
                      <MapPin className="size-5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-['Kantumruy_Pro',sans-serif] text-[15px] font-semibold text-emerald-900 dark:text-emerald-100">
                        {lastStoreName}
                      </p>

                      <p className="mt-1 font-['Kantumruy_Pro',sans-serif] text-[13px] text-emerald-700 dark:text-emerald-300">
                        ចម្ងាយប្រហែល {lastDistance} ម៉ែត្រ
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={repeatLastAlert}
                      disabled={isSpeaking}
                      aria-label="Repeat voice alert"
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-white text-emerald-600 transition hover:bg-emerald-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/10 dark:text-emerald-300 dark:hover:bg-white/15"
                    >
                      <RotateCcw className="size-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            onClick={handleToggleVoice}
            whileHover={{
              y: -2,
            }}
            whileTap={{
              scale: 0.97,
            }}
            className={`mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-['Kantumruy_Pro',sans-serif] text-[16px] font-semibold text-white shadow-lg transition ${
              voiceEnabled
                ? "bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {voiceEnabled ? (
              <>
                <VolumeX className="size-5" />
                បិទការជូនដំណឹង
              </>
            ) : (
              <>
                <BellRing className="size-5" />
                បើកការជូនដំណឹងជាសំឡេង
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
