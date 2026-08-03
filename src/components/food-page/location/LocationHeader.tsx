"use client";

import { motion } from "framer-motion";

import {
  IoAlertCircleOutline,
  IoLocateOutline,
  IoLocationOutline,
  IoOptionsOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoRefreshOutline,
  IoShieldCheckmarkOutline,
  IoStorefrontOutline,
} from "react-icons/io5";

import type { RecommendationMode } from "@/types/location";

export type LocationStatus =
  | "idle"
  | "loading"
  | "ready"
  | "denied"
  | "unavailable";

export type LocationSource = "live" | "saved" | "fallback";

type LocationHeaderProps = {
  mode: RecommendationMode;
  storeCount: number;
  radiusKm: number;

  locationStatus: LocationStatus;
  locationSource: LocationSource;
  locationError?: string | null;

  isRefreshing?: boolean;

  onModeChange: (mode: RecommendationMode) => void;
  onRefresh: () => void;

  /**
   * Used to open the filter drawer on mobile and tablet.
   */
  onOpenFilters?: () => void;
};

export default function LocationHeader({
  mode,
  storeCount,
  radiusKm,
  locationStatus,
  locationSource,
  locationError,
  isRefreshing = false,
  onModeChange,
  onRefresh,
  onOpenFilters,
}: LocationHeaderProps) {
  const showLocationWarning =
    locationStatus === "denied" || locationStatus === "unavailable";

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
        {/* Heading */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-primary-700">
            <IoLocationOutline className="shrink-0 text-[20px]" />

            <p className="text-[16px] font-semibold">ទីតាំង</p>
          </div>

          <p className="mt-1.5 text-[22px] font-semibold leading-15 text-primary-900 sm:text-[24px]">
            ហាងនៅជិតអ្នក
          </p>
          <p className="mt-1 max-w-2xl text-[16px] leading-7 text-gray-500">
            ស្វែងរកហាង និងមុខម្ហូបនៅជិតទីតាំងរបស់អ្នក
          </p>
        </div>

        {/* Controls */}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center xl:w-auto">
          <RecommendationModeSwitch mode={mode} onChange={onModeChange} />

          <div className="grid grid-cols-2 gap-2 sm:flex">
            {onOpenFilters && (
              <button
                type="button"
                onClick={onOpenFilters}
                className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-[16px] dark:text-emerald-400 font-semibold text-primary-800 transition hover:border-primary-300 hover:bg-primary-50 active:scale-[0.98] xl:hidden"
              >
                <IoOptionsOutline className="text-[20px]" />
                តម្រង
              </button>
            )}

            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-[16px] dark:text-emerald-400 font-semibold text-primary-800 transition hover:border-primary-300 hover:bg-primary-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <motion.span
                animate={
                  isRefreshing
                    ? {
                        rotate: 360,
                      }
                    : {
                        rotate: 0,
                      }
                }
                transition={
                  isRefreshing
                    ? {
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "linear",
                      }
                    : {
                        duration: 0.2,
                      }
                }
              >
                <IoRefreshOutline className="text-[20px]" />
              </motion.span>

              <span>{isRefreshing ? "កំពុងផ្ទុក" : "Refresh"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Information chips */}
      <div className="mt-5 flex flex-wrap gap-2.5">
        <InfoChip
          icon={<IoStorefrontOutline className="text-[19px]" />}
          label={`${storeCount} ហាង`}
          variant="green"
        />

        <InfoChip
          icon={<IoLocateOutline className="text-[19px]" />}
          label={`ក្នុងរង្វង់ ${radiusKm} km`}
          variant="green"
        />

        <InfoChip
          icon={<IoShieldCheckmarkOutline className="text-[19px]" />}
          label={sourceLabel}
          variant={locationSource === "live" ? "green" : "gray"}
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

      {/* Location warning */}
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
            <div className="flex h-9 w-9 shrink-0 items-center justify-center ">
              <IoAlertCircleOutline className="text-[22px] text-orange-600" />
            </div>

            <div className="min-w-0">
              <p className="text-[16px] font-semibold leading-7 text-orange-700">
                មិនអាចប្រើទីតាំងបច្ចុប្បន្នបាន
              </p>

              <p className="mt-0.5 text-[16px] leading-7 text-orange-600">
                {locationError ||
                  "FoodHub កំពុងប្រើចម្ងាយដែលបានរក្សាទុក ដើម្បីបង្ហាញហាងនៅក្បែរអ្នក។"}
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
    icon: React.ReactNode;
  }> = [
    {
      value: "single",
      label: "សម្រាប់ខ្ញុំ",
      icon: <IoPersonOutline />,
    },
    {
      value: "group",
      label: "សម្រាប់ក្រុម",
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
            className={`flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-[16px] font-semibold whitespace-nowrap transition ${
              selected
                ? "bg-primary-800 text-white shadow-sm"
                : "text-gray-600 hover:bg-white hover:text-primary-800"
            }`}
          >
            <span className="text-[19px]">{option.icon}</span>

            {option.label}
          </button>
        );
      })}
    </div>
  );
}

type InfoChipProps = {
  icon: React.ReactNode;
  label: string;
  variant: "green" | "gray";
};

function InfoChip({ icon, label, variant }: InfoChipProps) {
  return (
    <div
      className={`flex min-h-10 items-center gap-2 rounded-full border px-3.5 py-2 ${
        variant === "green"
          ? "border-primary-100 bg-primary-50 text-primary-800"
          : "border-gray-200 bg-gray-50 text-gray-600"
      }`}
    >
      <span className="shrink-0">{icon}</span>

      <span className="text-[16px] font-medium">{label}</span>
    </div>
  );
}

function getLocationSourceLabel(source: LocationSource): string {
  switch (source) {
    case "live":
      return "Live location";

    case "saved":
      return "Saved location";

    case "fallback":
    default:
      return "Location fallback";
  }
}
