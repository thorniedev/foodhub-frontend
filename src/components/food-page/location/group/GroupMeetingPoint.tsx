import type { ReactNode } from "react";
import {
  IoLocationOutline,
  IoPeopleOutline,
  IoRestaurantOutline,
  IoScanOutline,
} from "react-icons/io5";

import type { Coordinates } from "@/types/location";
import type { GroupLocationMember } from "@/types/group-location";

interface GroupMeetingPointProps {
  meetingPoint: Coordinates;
  members: GroupLocationMember[];
  storeCount: number;
  radiusKm: number;
}

export default function GroupMeetingPoint({
  meetingPoint,
  members,
  storeCount,
  radiusKm,
}: GroupMeetingPointProps) {
  const readyCount = members.filter(
    (member) =>
      member.locationStatus === "ready" && member.coordinates !== null,
  ).length;

  return (
    <section className="mb-5 overflow-hidden rounded-[26px] border border-emerald-100 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
      <div className="relative overflow-hidden px-4 py-5 sm:px-6 sm:py-6 lg:px-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.13),transparent_38%),linear-gradient(135deg,rgba(236,253,245,0.9),rgba(255,255,255,0.96))]" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <IoScanOutline className="text-[22px]" />
              </span>

              <span className="rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-[16px] font-bold text-emerald-700 backdrop-blur-sm">
                Midpoint ready
              </span>
            </div>

            <h2 className="mt-4 text-[22px] font-bold leading-[1.45] text-primary-900 sm:text-[26px]">
              ចំណុចកណ្ដាលរបស់ក្រុមបានរួចរាល់
            </h2>

            <p className="mt-2 max-w-2xl text-[16px] leading-7 text-gray-600 sm:text-[17px]">
              FoodHub ប្រើទីតាំងរបស់សមាជិកដើម្បីរកហាងដែលនៅកណ្ដាល
              និងងាយស្រួលសម្រាប់គ្រប់គ្នា។
            </p>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 text-[16px] font-bold text-emerald-800 shadow-sm">
              <IoLocationOutline className="text-[20px]" />
              កាំស្វែងរក {radiusKm} km
            </span>

            <span className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-800 px-4 text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(22,101,52,0.18)]">
              <IoRestaurantOutline className="text-[20px]" />
              {storeCount} ហាង
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-t border-emerald-100 bg-white p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-4">
        <Metric
          icon={<IoLocationOutline />}
          label="Latitude"
          value={meetingPoint.latitude.toFixed(6)}
        />
        <Metric
          icon={<IoLocationOutline />}
          label="Longitude"
          value={meetingPoint.longitude.toFixed(6)}
        />
        <Metric
          icon={<IoPeopleOutline />}
          label="ទីតាំងរួចរាល់"
          value={`${readyCount}/${members.length}`}
        />
        <Metric
          icon={<IoRestaurantOutline />}
          label="ហាងដែលរកឃើញ"
          value={String(storeCount)}
        />
      </div>
    </section>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="group min-w-0 rounded-[20px] border border-gray-100 bg-gray-50/70 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/50">
      <div className="flex items-center gap-2 text-[16px] font-semibold text-gray-500">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[19px] text-emerald-700 shadow-sm">
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>

      <p className="mt-3 break-all text-[20px] font-bold tracking-tight text-primary-900">
        {value}
      </p>
    </div>
  );
}
