"use client";

import { useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { Check, ChevronDown, Users } from "lucide-react";

import { useGetMediaAccessUrlQuery } from "@/app/store/memberProfileApi";

import type { MemberProfile } from "@/types/member-profile/member-profile";

const RELATIONSHIP_LABELS: Record<string, string> = {
  SELF: "ខ្លួនឯង",
  PARENT: "ឪពុកម្តាយ",
  SPOUSE: "ប្តី ឬប្រពន្ធ",
  CHILD: "កូន",
  SIBLING: "បងប្អូន",
  GRANDPARENT: "ជីដូនជីតា",
  OTHER: "ផ្សេងៗ",
};

/** Small circular avatar; falls back to the profile's first letter. */
export function ProfileAvatar({
  name,
  avatarMediaUuid,
  size = 28,
}: {
  name: string;
  avatarMediaUuid: string | null;
  size?: number;
}) {
  const { data } = useGetMediaAccessUrlQuery(avatarMediaUuid ?? "", {
    skip: !avatarMediaUuid,
  });

  const firstLetter = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-800/10 text-primary-800"
      style={{ width: size, height: size }}
    >
      {data?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.url} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span
          className="font-bold"
          style={{ fontSize: Math.max(11, Math.round(size * 0.42)) }}
        >
          {firstLetter}
        </span>
      )}
    </span>
  );
}

/** Overlapping avatar stack used on the dropdown trigger for 2+ profiles. */
export function ProfileAvatarStack({ profiles }: { profiles: MemberProfile[] }) {
  const visible = profiles.slice(0, 3);

  return (
    <span className="flex shrink-0 items-center">
      {visible.map((profile, index) => (
        <span
          key={profile.uuid}
          className="shrink-0 rounded-full ring-2 ring-white"
          style={{ marginLeft: index === 0 ? 0 : -8, zIndex: visible.length - index }}
        >
          <ProfileAvatar
            name={profile.profileName}
            avatarMediaUuid={profile.avatarMediaUuid}
            size={20}
          />
        </span>
      ))}
    </span>
  );
}

/**
 * Dropdown that lets the user pick which family profiles a request should
 * target: one profile, several (safety-intersected across all of them), or
 * every active profile via "select all". Selecting none falls back to the
 * default profile. Shared between the AI recommendation modal and the
 * "/menu/location" Single-mode discovery page — both should let the user
 * pick the same way, and both read/write the same selection via
 * useRecommendationProfileSelection so they stay in sync with each other
 * and with the toggle on the "គណនីសមាជិកគ្រួសារ" dashboard list.
 */
export function ProfileMultiSelect({
  profiles,
  targetProfiles,
  onToggle,
  onSelectAll,
  allSelected,
  emptyLabel = "ជ្រើសរើសគណនី",
  triggerClassName = "flex items-center gap-1.5 rounded-full bg-emerald-50 py-0.5 pl-0.5 pr-2 text-[12px] font-medium text-emerald-700 transition hover:bg-emerald-100",
}: {
  profiles: MemberProfile[];
  targetProfiles: MemberProfile[];
  onToggle: (profile: MemberProfile) => void;
  onSelectAll: () => void;
  allSelected: boolean;
  emptyLabel?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (profiles.length === 0) {
    return null;
  }

  const targetUuids = new Set(targetProfiles.map((profile) => profile.uuid));

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={triggerClassName}
      >
        {targetProfiles.length > 1 ? (
          <ProfileAvatarStack profiles={targetProfiles} />
        ) : (
          <ProfileAvatar
            name={targetProfiles[0]?.profileName ?? "?"}
            avatarMediaUuid={targetProfiles[0]?.avatarMediaUuid ?? null}
            size={20}
          />
        )}
        <span className="max-w-[130px] truncate">
          {targetProfiles.length > 1
            ? `គ្រួសារ (${targetProfiles.length} នាក់)`
            : targetProfiles[0]?.profileName ?? emptyLabel}
        </span>
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-multiselectable="true"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-30 mt-2 w-[230px] overflow-hidden rounded-2xl border border-gray-100 bg-white p-1.5 shadow-[0_18px_50px_rgba(15,23,42,0.14)]"
          >
            <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              គ្រួសារ
            </p>

            <button
              type="button"
              role="option"
              aria-selected={allSelected}
              onClick={onSelectAll}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition ${
                allSelected ? "bg-primary-50" : "hover:bg-gray-50"
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-800/10 text-primary-800">
                <Users className="h-4 w-4" />
              </span>

              <span className="min-w-0 flex-1 text-[14px] font-semibold text-gray-900">
                ជ្រើសរើសទាំងអស់
              </span>

              {allSelected && (
                <Check className="h-4 w-4 shrink-0 text-primary-700" />
              )}
            </button>

            <div className="my-1 border-t border-gray-100" />

            {profiles.map((profile) => {
              const isSelected = targetUuids.has(profile.uuid);

              return (
                <button
                  key={profile.uuid}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onToggle(profile)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition ${
                    isSelected ? "bg-primary-50" : "hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border ${
                      isSelected
                        ? "border-primary-700 bg-primary-700"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </span>

                  <ProfileAvatar
                    name={profile.profileName}
                    avatarMediaUuid={profile.avatarMediaUuid}
                    size={32}
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-gray-900">
                      {profile.profileName}
                    </span>
                    <span className="block truncate text-[12px] text-gray-400">
                      {profile.isDefault
                        ? "លំនាំដើម"
                        : RELATIONSHIP_LABELS[profile.relationship] ??
                          profile.relationship}
                    </span>
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
