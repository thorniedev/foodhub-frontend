"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Plus, Check } from "lucide-react";
import type { FamilyMember } from "@/types/family-profile";

interface UserProfileDropdownProps {
  members: FamilyMember[];
  activeMember: FamilyMember;
  onChangeProfile: (member: FamilyMember) => void;
  onAddProfile?: () => void;
}

export default function UserProfileDropdown({
  members,
  activeMember,
  onChangeProfile,
  onAddProfile,
}: UserProfileDropdownProps) {
  const [open, setOpen] = useState(false);

  if (!activeMember) {
    return null;
  }

  return (
    <div className="relative">
      {/* Current User */}
      <button
        onClick={() => setOpen(!open)}
        className="
        flex items-center gap-3
        rounded-full
        px-3 py-2
        hover:bg-slate-100
        transition
        "
      >
        <Image
          src={activeMember?.avatarUrl || "/Image/default-avatar.png"}
          alt={activeMember?.name || "User"}
          width={40}
          height={40}
          className="
          h-10 w-10
          rounded-full
          object-cover
          ring-2 ring-emerald-100
          "
        />

        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-slate-800">
            {activeMember.name}
          </p>

          <p className="text-xs text-slate-400">{activeMember.role}</p>
        </div>

        <ChevronDown
          className={`
          h-4 w-4 text-slate-500
          transition-transform
          ${open ? "rotate-180" : ""}
          `}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
          absolute
          right-0
          mt-3
          w-72
          rounded-2xl
          bg-white
          shadow-xl
          border
          border-slate-100
          p-3
          z-50
          "
        >
          <p
            className="
          px-3
          py-2
          text-sm
          font-semibold
          text-slate-600
          "
          >
            គណនីរបស់អ្នក
          </p>

          <div className="space-y-1">
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => {
                  onChangeProfile(member);
                  setOpen(false);
                }}
                className="
                w-full
                flex
                items-center
                justify-between
                gap-3
                rounded-xl
                p-3
                hover:bg-emerald-50
                transition
                "
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={member.avatarUrl || "/Image/default-avatar.png"}
                    alt={member.name}
                    width={36}
                    height={36}
                    className="
  h-9 w-9
  rounded-full
  object-cover
  "
                  />

                  <div className="text-left">
                    <p
                      className="
                    text-sm
                    font-semibold
                    text-slate-800
                    "
                    >
                      {member.name}
                    </p>

                    <p
                      className="
                    text-xs
                    text-slate-400
                    "
                    >
                      {member.role}
                    </p>
                  </div>
                </div>

                {activeMember.id === member.id && (
                  <Check
                    className="
                      h-4 w-4
                      text-emerald-600
                      "
                  />
                )}
              </button>
            ))}
          </div>

          {/* Add Profile */}
          <button
            onClick={() => {
              setOpen(false);
              onAddProfile?.();
            }}
            className="
            mt-2
            w-full
            flex
            items-center
            gap-3
            rounded-xl
            border
            border-dashed
            border-slate-300
            p-3
            text-sm
            text-slate-500
            hover:border-emerald-400
            hover:text-emerald-600
            transition
            "
          >
            <span
              className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              border
              "
            >
              <Plus className="h-4 w-4" />
            </span>
            បន្ថែមគណនី
          </button>
        </div>
      )}
    </div>
  );
}
