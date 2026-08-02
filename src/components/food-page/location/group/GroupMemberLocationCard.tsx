"use client";

import { motion } from "framer-motion";
import {
  IoCheckmarkCircle,
  IoLocationOutline,
  IoPersonOutline,
  IoTrashOutline,
} from "react-icons/io5";

import type { GroupLocationMember } from "@/types/group-location";

export interface GroupMemberCoordinateDraft {
  latitude: string;
  longitude: string;
}

interface GroupMemberLocationCardProps {
  index: number;
  member: GroupLocationMember;
  draft: GroupMemberCoordinateDraft;
  canRemove: boolean;
  canUseCurrentLocation: boolean;

  onNameChange: (name: string) => void;
  onCoordinateChange: (
    field: keyof GroupMemberCoordinateDraft,
    value: string,
  ) => void;
  onUseCurrentLocation: () => void;
  onRemove: () => void;
}

export default function GroupMemberLocationCard({
  index,
  member,
  draft,
  canRemove,
  canUseCurrentLocation,
  onNameChange,
  onCoordinateChange,
  onUseCurrentLocation,
  onRemove,
}: GroupMemberLocationCardProps) {
  const ready =
    member.locationStatus === "ready" && member.coordinates !== null;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 290, damping: 25 }}
      className={`overflow-hidden rounded-[22px] border bg-white shadow-sm transition ${
        ready
          ? "border-emerald-200 ring-4 ring-emerald-50/70"
          : "border-gray-100 hover:border-primary-200"
      }`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[22px] ${
              ready
                ? "bg-emerald-100 text-emerald-700"
                : "bg-primary-50 text-primary-700"
            }`}
          >
            {ready ? <IoCheckmarkCircle /> : <IoPersonOutline />}
          </span>

          <div className="min-w-0">
            <p className="truncate text-[18px] font-bold text-primary-900">
              {index === 0 ? "អ្នក" : `មិត្តភក្តិ ${index}`}
            </p>
            <p
              className={`mt-0.5 text-[16px] font-medium ${
                ready ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              {ready ? "ទីតាំងរួចរាល់" : "កំពុងរង់ចាំទីតាំង"}
            </p>
          </div>
        </div>

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${member.name}`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100"
          >
            <IoTrashOutline className="text-[21px]" />
          </button>
        )}
      </div>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(180px,0.8fr)_minmax(170px,1fr)_minmax(170px,1fr)]">
        <label className="block min-w-0">
          <span className="text-[16px] font-semibold text-gray-700">ឈ្មោះ</span>
          <input
            value={member.name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder={index === 0 ? "អ្នក" : "ឈ្មោះមិត្តភក្តិ"}
            className="mt-2 min-h-12 w-full rounded-[16px] border border-gray-200 bg-white px-4 text-[16px] text-primary-900 outline-none transition placeholder:text-gray-300 focus:border-primary-400 focus:ring-4 focus:ring-primary-50"
          />
        </label>

        <label className="block min-w-0">
          <span className="text-[16px] font-semibold text-gray-700">
            Latitude
          </span>
          <input
            inputMode="decimal"
            value={draft.latitude}
            onChange={(event) =>
              onCoordinateChange("latitude", event.target.value)
            }
            placeholder="11.5639508"
            className="mt-2 min-h-12 w-full rounded-[16px] border border-gray-200 bg-white px-4 text-[16px] text-primary-900 outline-none transition placeholder:text-gray-300 focus:border-primary-400 focus:ring-4 focus:ring-primary-50"
          />
        </label>

        <label className="block min-w-0">
          <span className="text-[16px] font-semibold text-gray-700">
            Longitude
          </span>
          <input
            inputMode="decimal"
            value={draft.longitude}
            onChange={(event) =>
              onCoordinateChange("longitude", event.target.value)
            }
            placeholder="104.9083060"
            className="mt-2 min-h-12 w-full rounded-[16px] border border-gray-200 bg-white px-4 text-[16px] text-primary-900 outline-none transition placeholder:text-gray-300 focus:border-primary-400 focus:ring-4 focus:ring-primary-50"
          />
        </label>
      </div>

      {canUseCurrentLocation && (
        <div className="border-t border-gray-100 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onUseCurrentLocation}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary-50 px-5 text-[16px] font-semibold text-primary-700 transition hover:bg-primary-100 sm:w-fit"
          >
            <IoLocationOutline className="text-[20px]" />
            ប្រើទីតាំងបច្ចុប្បន្នរបស់ខ្ញុំ
          </button>
        </div>
      )}
    </motion.article>
  );
}
