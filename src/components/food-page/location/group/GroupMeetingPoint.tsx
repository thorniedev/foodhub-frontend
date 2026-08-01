import { IoLocationOutline, IoPeopleOutline } from "react-icons/io5";

import type { GroupMember } from "@/types/group-recommendation";
import type { Coordinates } from "@/types/location";

import { calculateDistanceSummary } from "@/lib/location/geo";

interface GroupMeetingPointProps {
  meetingPoint: Coordinates;
  members: GroupMember[];
}

export default function GroupMeetingPoint({
  meetingPoint,
  members,
}: GroupMeetingPointProps) {
  const summary = calculateDistanceSummary(meetingPoint, members);

  return (
    <section className="mb-5 grid gap-3 sm:grid-cols-3">
      <article className="rounded-[20px] border border-gray-100 bg-white p-4 shadow-sm">
        <span className="flex items-center gap-2 text-[16px] text-gray-500">
          <IoLocationOutline className="text-[20px] text-primary-700" />
          Group midpoint
        </span>
        <p className="mt-2 text-[17px] font-semibold text-primary-900">
          {meetingPoint.latitude.toFixed(5)},{" "}
          {meetingPoint.longitude.toFixed(5)}
        </p>
      </article>

      <article className="rounded-[20px] border border-gray-100 bg-white p-4 shadow-sm">
        <span className="flex items-center gap-2 text-[16px] text-gray-500">
          <IoPeopleOutline className="text-[20px] text-primary-700" />
          Average member distance
        </span>
        <p className="mt-2 text-[22px] font-bold text-primary-900">
          {summary.averageKm.toFixed(1)} km
        </p>
      </article>

      <article className="rounded-[20px] border border-gray-100 bg-white p-4 shadow-sm">
        <span className="flex items-center gap-2 text-[16px] text-gray-500">
          <IoPeopleOutline className="text-[20px] text-primary-700" />
          Farthest member
        </span>
        <p className="mt-2 text-[22px] font-bold text-primary-900">
          {summary.maximumKm.toFixed(1)} km
        </p>
      </article>
    </section>
  );
}
