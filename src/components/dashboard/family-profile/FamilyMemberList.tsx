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
      <p className="mb-4 text-lg font-semibold text-slate-700">គណនីសរុប</p>

      <div className="flex flex-wrap items-center gap-6">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-3">
   
            <img
              src={member.avatarUrl}
              alt={member.name}
              className="h-12 w-12 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {member.name}
              </p>
              <p className="text-xs text-slate-400">{member.role}</p>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onAddProfile}
          className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-500 transition-colors hover:border-emerald-400 hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300">
            <Plus className="h-4 w-4" />
          </span>
          បន្ថែមគណនី
        </button>
      </div>
    </div>
  );
}