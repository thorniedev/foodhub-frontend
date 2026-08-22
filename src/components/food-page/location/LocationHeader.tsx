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
  IoPeopleOutline,
  IoPersonOutline,
  IoRefreshOutline,
  IoShieldCheckmarkOutline,
  IoStorefrontOutline,
} from "react-icons/io5";

import type { RecommendationMode } from "@/types/location";

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

  storeCount: number;
  radiusKm: number;

  locationStatus: LocationStatus;
  locationSource: LocationSource;

  locationError?: string | null;
  locationLabel?: string | null;

  isRefreshing?: boolean;

  onModeChange: (mode: RecommendationMode) => void;

  onRefresh: () => void;

  onUseCurrentLocation: () => void;

  onChooseLocation: () => void;

  onOpenSavedLocations?: () => void;

  onOpenFilters?: () => void;
};

export default function LocationHeader({
  mode,
  storeCount,
  radiusKm,
  locationStatus,
  locationSource,
  locationError,
  locationLabel,
  isRefreshing = false,
  onModeChange,
  onRefresh,
  onUseCurrentLocation,
  onChooseLocation,
  onOpenSavedLocations,
  onOpenFilters,
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
            <IoLocationOutline className="shrink-0 text-[22px]" />

            <p className="text-[17px] font-semibold">ទីតាំង</p>
          </div>

          <p
            role="heading"
            aria-level={1}
            className="mt-2 text-[24px] font-semibold leading-tight text-primary-900 sm:text-[27px]"
          >
            {mode === "single"
              ? "ការណាត់ញ៉ាំអាហារជាមួយមិត្តភក្តិ"
              : "ការណាត់ញ៉ាំអាហារជាក្រុម"}
          </p>

          <p className="mt-2 max-w-2xl text-[17px] leading-8 text-gray-500">
            {mode === "single"
              ? "ជ្រើសរើសមិត្តភក្តិ និងស្វែងរកហាងដែលស័ក្តិសមជាមួយសុវត្ថិភាពម្ហូបអាហារ"
              : "បង្កើតតំណភ្ជាប់ចែករំលែកដើម្បីអញ្ជើញក្រុមការងារ ឬមិត្តភក្តិបោះឆ្នោតភ្លាមៗ"}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center xl:w-auto">
          <RecommendationModeSwitch mode={mode} onChange={onModeChange} />

          {onOpenFilters && (
            <button
              type="button"
              onClick={onOpenFilters}
              className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-[17px] font-semibold text-primary-800 dark:text-primary-dark transition hover:border-primary-300 hover:bg-primary-50 active:scale-[0.98] dark:text-emerald-400 xl:hidden"
            >
              <IoOptionsOutline className="text-[22px]" />
              តម្រង
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <InfoChip
          icon={<IoStorefrontOutline className="text-[21px]" />}
          label={`${storeCount} ហាង`}
          variant="green"
        />

        <InfoChip
          icon={<IoLocateOutline className="text-[21px]" />}
          label={`ក្នុងរង្វង់ ${radiusKm} km`}
          variant="green"
        />

        <InfoChip
          icon={<IoShieldCheckmarkOutline className="text-[21px]" />}
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

      <div className="mt-5 grid gap-3 rounded-[20px] border border-gray-100 bg-gray-50 p-3 sm:grid-cols-3">
        <motion.button
          type="button"
          whileTap={{
            scale: 0.98,
          }}
          onClick={onUseCurrentLocation}
          className={`flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
            currentLocationActive
              ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
              : "border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          }`}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <IoLocateOutline className="text-[24px]" />
          </span>

          <span className="min-w-0">
            <span className="block text-[17px] font-semibold">
              ប្រើទីតាំងបច្ចុប្បន្ន
            </span>

            <span className="mt-1 block text-[15px] opacity-75">
              ប្រើ GPS របស់ឧបករណ៍
            </span>
          </span>
        </motion.button>

        <motion.button
          type="button"
          whileTap={{
            scale: 0.98,
          }}
          onClick={onChooseLocation}
          className={`flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
            manualLocationActive
              ? "border-primary-700 bg-primary-800 text-white shadow-sm"
              : "border-primary-200 bg-white text-primary-800 dark:text-primary-dark hover:bg-primary-50"
          }`}
        >
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-sm ${
              manualLocationActive ? "bg-white/15" : "bg-primary-50"
            }`}
          >
            <IoMapOutline className="text-[24px]" />
          </span>

          <span className="min-w-0">
            <span className="block text-[17px] font-semibold">
              ជ្រើសទីតាំងលើផែនទី
            </span>

            <span className="mt-1 block text-[15px] opacity-75">
              ស្វែងរក ឬចុចលើផែនទី
            </span>
          </span>
        </motion.button>

        <motion.button
          type="button"
          whileTap={{
            scale: 0.98,
          }}
          onClick={onOpenSavedLocations || onChooseLocation}
          className="flex min-h-14 items-center gap-3 rounded-2xl border border-amber-200 bg-white px-4 py-3 text-left text-slate-800 transition hover:border-amber-300 hover:bg-amber-50/60 shadow-sm"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700 shadow-sm">
            <IoBookmarkOutline className="text-[22px]" />
          </span>

          <span className="min-w-0">
            <span className="block text-[17px] font-semibold">
              ទីតាំងបានរក្សាទុក
            </span>

            <span className="mt-1 block text-[15px] text-gray-500 opacity-80">
              ផ្ទះ, ការិយាល័យ
            </span>
          </span>
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
              <p className="text-[17px] font-semibold leading-8 text-orange-700">
                មិនអាចប្រើទីតាំងបច្ចុប្បន្នបាន
              </p>

              <p className="mt-1 text-[17px] leading-8 text-orange-600">
                {locationError ||
                  "អ្នកអាចស្វែងរក ឬជ្រើសទីតាំងដោយផ្ទាល់លើផែនទី។"}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}

type RecommendationModeSwitchProps = {
  mode: RecommendationMode;

  onChange: (mode: RecommendationMode) => void;
};

function RecommendationModeSwitch({
  mode,
  onChange,
}: RecommendationModeSwitchProps) {
  const options: Array<{
    value: RecommendationMode;
    label: string;
    icon: ReactNode;
  }> = [
    {
      value: "single",
      label: "Friend",
      icon: <IoPersonOutline />,
    },
    {
      value: "group",
      label: "Guest Link",
      icon: <IoPeopleOutline />,
    },
  ];

  return (
    <div
      role="tablist"
      aria-label="Recommendation mode"
      className="grid min-h-12 w-full grid-cols-2 rounded-full bg-gray-100 p-1 sm:w-auto"
    >
      {options.map((option) => {
        const selected = mode === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={`flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 text-[17px] font-semibold transition ${
              selected
                ? "bg-primary-800 text-white shadow-sm"
                : "text-gray-600 hover:bg-white hover:text-primary-800 dark:text-primary-dark"
            }`}
          >
            <span className="text-[21px]">{option.icon}</span>  

            {option.label}
          </button>
        );
      })}
    </div>
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
      className={`flex min-h-10 items-center gap-2 rounded-full border px-3.5 py-2 ${
        variant === "green"
          ? "border-primary-100 bg-primary-50 text-primary-800 dark:text-primary-dark"
          : "border-gray-200 bg-gray-50 text-gray-600"
      }`}
    >
      <span className="shrink-0">{icon}</span>

      <span className="text-[17px] font-medium">{label}</span>
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
