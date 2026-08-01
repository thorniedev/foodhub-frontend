"use client";

import {
  IoCheckmarkCircle,
  IoCopyOutline,
  IoLocationOutline,
  IoPeopleOutline,
  IoTimeOutline,
} from "react-icons/io5";

import type { GroupMember } from "@/types/group-recommendation";

interface GroupMemberListProps {
  groupName: string;
  inviteCode: string;
  members: GroupMember[];
  onSimulateLocations: () => void;
  onCalculateMidpoint: () => void;
}

export default function GroupMemberList({
  groupName,
  inviteCode,
  members,
  onSimulateLocations,
  onCalculateMidpoint,
}: GroupMemberListProps) {
  const readyCount = members.filter(
    (member) => member.locationStatus === "ready",
  ).length;
  const allReady = readyCount === members.length;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
    } catch {
      // Clipboard may be unavailable in some browser contexts.
    }
  };

  return (
    <section className="rounded-[26px] border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[16px] font-semibold text-secondary-500">
            Group waiting room
          </p>
          <h2 className="mt-1 text-[26px] font-bold text-primary-900">
            {groupName}
          </h2>
          <p className="mt-2 text-[16px] text-gray-500">
            {readyCount}/{members.length} members shared their location
          </p>
        </div>

        <button
          type="button"
          onClick={copyCode}
          className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 text-[16px] font-semibold text-primary-800"
        >
          <IoCopyOutline className="text-[20px]" />
          {inviteCode}
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => (
          <article
            key={member.uuid}
            className="flex items-center gap-3 rounded-[20px] border border-gray-100 p-4"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[18px] font-bold text-primary-800">
              {member.name.slice(0, 1).toUpperCase()}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[17px] font-semibold text-primary-900">
                {member.name}
              </p>
              <p
                className={`mt-1 flex items-center gap-1.5 text-[15px] ${
                  member.locationStatus === "ready"
                    ? "text-green-700"
                    : "text-amber-700"
                }`}
              >
                {member.locationStatus === "ready" ? (
                  <IoCheckmarkCircle className="text-[18px]" />
                ) : (
                  <IoTimeOutline className="text-[18px]" />
                )}
                {member.locationStatus === "ready"
                  ? "Location ready"
                  : "Waiting for location"}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {!allReady && (
          <button
            type="button"
            onClick={onSimulateLocations}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-primary-200 px-5 text-[16px] font-semibold text-primary-800 transition hover:bg-primary-50"
          >
            <IoLocationOutline className="text-[21px]" />
            Demo: receive member locations
          </button>
        )}

        <button
          type="button"
          disabled={!allReady}
          onClick={onCalculateMidpoint}
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary-800 px-5 text-[16px] font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IoPeopleOutline className="text-[21px]" />
          Calculate group midpoint
        </button>
      </div>
    </section>
  );
}
