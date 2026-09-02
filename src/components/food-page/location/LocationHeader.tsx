"use client";

import type { ReactNode } from "react";

import { motion } from "framer-motion";

import {
  IoAlertCircleOutline,
  IoBookmarkOutline,
  IoLocateOutline,
  IoLocationOutline,
  IoMapOutline,
  IoOptionsOutline,
  IoLinkOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoRefreshOutline,
  IoRestaurantOutline,
  IoShieldCheckmarkOutline,
  IoStorefrontOutline,
} from "react-icons/io5";

import type { RecommendationMode } from "@/types/location";
import RecommendationModeTabs from "./RecommendationModeTabs";

import type { LocationSelectionSource } from "@/hooks/useUserLocation";

export type LocationStatus =
  | "idle"
  | "loading"
  | "ready"
  | "denied"
  | "unavailable";

export type LocationSource = LocationSelectionSource;

type LocationHeaderProps = {
  mode: RecommendationMode;
  onModeChange?: (mode: RecommendationMode) => void;
  storeCount: number;
  radiusKm: number;

  locationStatus: LocationStatus;
  locationSource: LocationSource;

  locationError?: string | null;
  locationLabel?: string | null;

  isRefreshing?: boolean;

  onRefresh: () => void;

  onUseCurrentLocation: () => void;

  onChooseLocation: () => void;

  onOpenSavedLocations?: () => void;

  onOpenFilters?: () => void;

  children?: ReactNode;
};

export default function LocationHeader({
  mode,
  onModeChange,
  storeCount,
  radiusKm,
  locationStatus,
  locationSource,
  locationError,
  locationLabel,
  isRefreshing = false,
  onRefresh,
  onUseCurrentLocation,
  onChooseLocation,
  onOpenSavedLocations,
  onOpenFilters,
  children,
}: LocationHeaderProps) {
  const manualLocationActive =
    locationSource === "manual" || locationSource === "saved-manual";

  const currentLocationActive =
    locationSource === "live" || locationSource === "saved";

  const showLocationWarning =
    !manualLocationActive &&
    (locationStatus === "denied" || locationStatus === "unavailable");

  const sourceLabel = getLocationSourceLabel(locationSource);

  return (
    <motion.header
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
      className="overflow-hidden rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm sm:p-5 lg:p-6"
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-primary-700">
            <IoLocationOutline className="shrink-0 text-[24px]" />

            <p className="text-lg font-bold">ទីតាំង</p>
          </div>

          <p
            role="heading"
            aria-level={1}
            className="mt-2 text-2xl sm:text-3xl font-bold leading-tight text-primary-900"
          >
            {mode === "me"
              ? "ម្ហូបនៅជិតអ្នក"
              : mode === "single"
                ? "ការណាត់ញ៉ាំអាហារជាមួយមិត្តភក្តិ"
                : "ការណាត់ញ៉ាំអាហារជាក្រុម"}
          </p>

          <p className="mt-2 max-w-2xl text-lg leading-relaxed text-gray-500">
            {mode === "me"
              ? "ជ្រើសរើសគណនីគ្រួសារ រួចមើលម្ហូបដែលត្រូវនឹងអ្នកនៅជុំវិញទីតាំងបច្ចុប្បន្ន"
              : mode === "single"
                ? "ជ្រើសរើសមិត្តភក្តិ និងស្វែងរកហាងដែលស័ក្តិសមជាមួយសុវត្ថិភាពម្ហូបអាហារ"
                : "បង្កើតតំណភ្ជាប់ចែករំលែកដើម្បីអញ្ជើញក្រុមការងារ ឬមិត្តភក្តិបោះឆ្នោតភ្លាមៗ"}
          </p>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center xl:w-auto xl:justify-end">
          {onModeChange && (
            <div className="w-full sm:w-auto overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <RecommendationModeTabs mode={mode} onChange={onModeChange} />
            </div>
          )}

          {onOpenFilters && (
            <button
              type="button"
              onClick={onOpenFilters}
              className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 text-lg font-bold text-primary-800 dark:text-primary-dark transition hover:border-primary-300 hover:bg-primary-50 active:scale-[0.98] dark:text-emerald-400 xl:hidden shrink-0"
            >
              <IoOptionsOutline className="text-[24px]" />
              តម្រង
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <InfoChip
          icon={<IoRestaurantOutline className="text-[22px]" />}
          label={`${storeCount} មុខម្ហូប`}
          variant="green"
        />

        <InfoChip
          icon={<IoLocateOutline className="text-[22px]" />}
          label={`ក្នុងរង្វង់ ${radiusKm} km`}
          variant="green"
        />

        <InfoChip
          icon={<IoShieldCheckmarkOutline className="text-[22px]" />}
          label={sourceLabel}
          variant={
            locationSource === "live" || manualLocationActive ? "green" : "gray"
          }
        />

        {locationStatus === "loading" && (
          <InfoChip
            icon={
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-200 border-t-primary-700" />
            }
            label="កំពុងស្វែងរកទីតាំង"
            variant="gray"
          />
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2 rounded-[20px] border border-gray-100 bg-gray-50/80 p-2 dark:border-slate-800 dark:bg-slate-900">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onUseCurrentLocation}
          className={`flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-2xl py-3 px-3 text-center transition ${
            currentLocationActive
              ? "bg-white text-primary-700 shadow-sm border border-gray-200/60 font-bold dark:bg-slate-800 dark:border-slate-700 dark:text-emerald-400"
              : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900 font-medium dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white"
          }`}
        >
          <IoLocateOutline className="text-[20px]" />
          <span className="text-[15px]">ទីតាំងបច្ចុប្បន្ន</span>
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onChooseLocation}
          className={`flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-2xl py-3 px-3 text-center transition ${
            manualLocationActive
              ? "bg-white text-primary-700 shadow-sm border border-gray-200/60 font-bold dark:bg-slate-800 dark:border-slate-700 dark:text-emerald-400"
              : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900 font-medium dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white"
          }`}
        >
          <IoMapOutline className="text-[20px]" />
          <span className="text-[15px]">ជ្រើសលើផែនទី</span>
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onOpenSavedLocations || onChooseLocation}
          className="flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-2xl py-3 px-3 text-center font-medium text-gray-600 transition hover:bg-gray-200/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <IoBookmarkOutline className="text-[20px]" />
          <span className="text-[15px]">ទីតាំងរក្សាទុក</span>
        </motion.button>
      </div>

      {showLocationWarning && (
        <motion.div
          initial={{
            opacity: 0,
            height: 0,
          }}
          animate={{
            opacity: 1,
            height: "auto",
          }}
          className="mt-5"
        >
          <div role="alert" className="flex items-start gap-3 px-4 py-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center">
              <IoAlertCircleOutline className="text-[24px] text-orange-600" />
            </div>

            <div className="min-w-0">
              <p className="text-lg font-bold leading-relaxed text-orange-700">
                មិនអាចប្រើទីតាំងបច្ចុប្បន្នបាន
              </p>

              <p className="mt-1 text-lg leading-relaxed text-orange-600">
                {locationError ||
                  "អ្នកអាចស្វែងរក ឬជ្រើសទីតាំងដោយផ្ទាល់លើផែនទី។"}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {children && (
        <div className="mt-6 border-t border-gray-100 pt-6 dark:border-slate-800">
          {children}
        </div>
      )}
    </motion.header>
  );
}



type InfoChipProps = {
  icon: ReactNode;
  label: string;

  variant: "green" | "gray";
};

function InfoChip({ icon, label, variant }: InfoChipProps) {
  return (
    <div
      className={`flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 ${
        variant === "green"
          ? "border-primary-100 bg-primary-50 text-primary-800 dark:text-primary-dark"
          : "border-gray-200 bg-gray-50 text-gray-600"
      }`}
    >
      <span className="shrink-0">{icon}</span>

      <span className="text-lg font-semibold">{label}</span>
    </div>
  );
}

function getLocationSourceLabel(source: LocationSource): string {
  switch (source) {
    case "live":
      return "Live GPS location";

    case "saved":
      return "Saved GPS location";

    case "manual":
      return "Selected map location";

    case "saved-manual":
      return "Saved selected location";

    case "fallback":
    default:
      return "No location selected";
  }
}
