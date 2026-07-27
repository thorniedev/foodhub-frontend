"use client";

import { Plus } from "lucide-react";
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
    <div>
      <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-700">
        {/* <span aria-hidden>👪</span> */}
        គណនីសរុប
      </h2>

      <div className="flex flex-wrap items-center gap-8">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={member.avatarUrl}
              alt={member.name}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-slate-800">{member.name}</p>
              <p className="text-sm text-slate-400">{member.role}</p>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onAddProfile}
          className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-2 text-slate-500 hover:border-emerald-400 hover:text-emerald-600"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300">
            <Plus className="h-4 w-4" />
          </span>
          Add profile
        </button>
      </div>
    </div>
  );
}
