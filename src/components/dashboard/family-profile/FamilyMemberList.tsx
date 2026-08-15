"use client";

import { Plus, UsersRound } from "lucide-react";
import type { FamilyMember } from "@/types/family-profile";

interface FamilyMemberListProps {
  members: FamilyMember[];
  onAddProfile?: () => void;
}

export default function FamilyMemberList({
  members,
  onAddProfile,
}: FamilyMemberListProps) {
  return (
    <section className="rounded-[28px] border border-slate-200/70 bg-white p-5 shadow-sm sm:p-7">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-800/10 text-primary-800">
            <UsersRound className="h-6 w-6" />
          </div>

          <div>
            <h3 className="text-[24px] font-bold text-primary-800 sm:text-[26px]">
              គណនីសមាជិក
            </h3>

            <p className="mt-1 text-lg leading-7 text-slate-500">
              ជ្រើសរើស ឬបន្ថែមគណនីសមាជិកគ្រួសារ
            </p>
          </div>
        </div>

        {/* Count */}
        <div className="w-fit rounded-full bg-slate-100 px-4 py-2 text-lg font-semibold text-slate-600">
          {members.length} គណនី
        </div>
      </div>

      {/* Divider */}
      <div className="mb-6 h-px bg-slate-100" />

      {/* Members */}
      <div className="flex flex-wrap gap-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="
              group
              flex
              min-w-[240px]
              items-center
              gap-4
              rounded-[22px]
              border
              border-slate-200
              bg-slate-50/50
              px-4
              py-3.5
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:border-primary-800/25
              hover:bg-white
              hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)]
            "
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="rounded-full bg-white p-1 shadow-sm">
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="h-14 w-14 rounded-full object-cover"
                />
              </div>

              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-[3px] border-white bg-emerald-500" />
            </div>

            {/* Member info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold text-primary-800">
                {member.name}
              </p>

              <p className="mt-1 truncate text-lg text-slate-500">
                {member.role}
              </p>
            </div>
          </div>
        ))}

        {/* Add profile */}
        <button
          type="button"
          onClick={onAddProfile}
          className="
            group
            flex
            min-w-[240px]
            items-center
            gap-4
            rounded-[22px]
            border
            border-dashed
            border-slate-300
            bg-white
            px-4
            py-3.5
            text-left
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:border-primary-800
            hover:bg-primary-800/[0.03]
            hover:shadow-[0_8px_30px_rgba(15,23,42,0.07)]
            focus-visible:outline-none
            focus-visible:ring-4
            focus-visible:ring-primary-800/10
          "
        >
          <span
            className="
              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-primary-800/10
              text-primary-800
              transition-all
              duration-200
              group-hover:bg-primary-800
              group-hover:text-white
            "
          >
            <Plus className="h-6 w-6" />
          </span>

          <div>
            <p className="text-lg font-bold text-primary-800">បន្ថែមគណនី</p>

            <p className="mt-1 text-lg text-slate-500">បង្កើតសមាជិកថ្មី</p>
          </div>
        </button>
      </div>

      {/* Empty state */}
      {members.length === 0 && (
        <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-4">
          <p className="text-lg leading-7 text-slate-500">
            មិនទាន់មានគណនីសមាជិកទេ។ ចុច
            <span className="font-semibold text-primary-800"> បន្ថែមគណនី </span>
            ដើម្បីបង្កើតគណនីថ្មី។
          </p>
        </div>
      )}
    </section>
  );
}
