"use client";

import { useState } from "react";
import { IoEnterOutline, IoPeopleOutline } from "react-icons/io5";

interface GroupSetupProps {
  onCreateGroup: (name: string) => void;
  onJoinGroup: (code: string) => void;
}

export default function GroupSetup({
  onCreateGroup,
  onJoinGroup,
}: GroupSetupProps) {
  const [groupName, setGroupName] = useState("FoodHub Dinner Group");
  const [inviteCode, setInviteCode] = useState("");

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-[26px] border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-800">
          <IoPeopleOutline className="text-[28px]" />
        </span>

        <h2 className="mt-5 text-[24px] font-bold text-primary-900">
          បង្កើតក្រុមថ្មី
        </h2>
        <p className="mt-2 text-[16px] leading-7 text-gray-500">
          Invite your friends, collect their live locations, calculate a fair
          midpoint, and recommend stores for everyone.
        </p>

        <label className="mt-6 block text-[16px] font-semibold text-gray-700 dark:text-gray-100">
          Group name
        </label>
        <input
          value={groupName}
          onChange={(event) => setGroupName(event.target.value)}
          className="mt-2 min-h-12 w-full rounded-[16px] border border-gray-200 px-4 text-[16px] outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-50"
        />

        <button
          type="button"
          onClick={() => onCreateGroup(groupName.trim() || "FoodHub Group")}
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary-800 px-5 text-[16px] font-semibold text-white transition hover:bg-primary-700"
        >
          <IoPeopleOutline className="text-[21px]" />
          Create group
        </button>
      </section>

      <section className="rounded-[26px] border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-50 text-secondary-600">
          <IoEnterOutline className="text-[28px]" />
        </span>

        <h2 className="mt-5 text-[24px] font-bold text-primary-900">
          ចូលរួមក្រុម
        </h2>
        <p className="mt-2 text-[16px] leading-7 text-gray-500">
          Enter the invitation code sent by the group leader to join the same
          recommendation and voting session.
        </p>

        <label className="mt-6 block text-[16px] font-semibold text-gray-700 dark:text-gray-100">
          Invitation code
        </label>
        <input
          value={inviteCode}
          onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
          placeholder="FH-28A9"
          className="mt-2 min-h-12 w-full rounded-[16px] border border-gray-200 px-4 text-[16px] uppercase outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-50"
        />

        <button
          type="button"
          disabled={!inviteCode.trim()}
          onClick={() => onJoinGroup(inviteCode.trim())}
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-secondary-500 px-5 text-[16px] font-semibold text-white transition hover:bg-secondary-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IoEnterOutline className="text-[21px]" />
          Join group
        </button>
      </section>
    </div>
  );
}
