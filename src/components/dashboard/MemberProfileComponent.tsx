"use client";

import { Plus, RefreshCw } from "lucide-react";

import { useGetMemberProfilesQuery } from "@/app/store/memberProfileApi";

import type {
  MemberGender,
  MemberRelationship,
} from "@/types/member-profile/member-profile";

const relationshipLabels: Record<MemberRelationship, string> = {
  SELF: "ខ្លួនឯង",
  PARENT: "ឪពុកម្តាយ",
  SPOUSE: "ប្តី ឬប្រពន្ធ",
  CHILD: "កូន",
  SIBLING: "បងប្អូន",
  GRANDPARENT: "ជីដូនជីតា",
  OTHER: "ផ្សេងៗ",
};

const genderLabels: Record<MemberGender, string> = {
  MALE: "ប្រុស",
  FEMALE: "ស្រី",
  OTHER: "ផ្សេងៗ",
  PREFER_NOT_TO_SAY: "មិនបញ្ជាក់",
};

export default function MemberProfiles() {
  const { data, isLoading, isFetching, isError, refetch } =
    useGetMemberProfilesQuery({
      page: 0,
      size: 20,
    });

  const members = data?.contents ?? [];

  const handleAddProfile = () => {
    // Open your create-profile modal or navigate to the create page.
    console.log("Add new family profile");
  };

  if (isLoading) {
    return (
      <div>
        <div className="mb-4 h-6 w-40 animate-pulse rounded bg-slate-200" />

        <div className="flex flex-wrap gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex animate-pulse items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-slate-200" />

              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="h-3 w-16 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-700">
          មិនអាចទាញយកគណនីគ្រួសារបានទេ។
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          <RefreshCw className="h-4 w-4" />
          ព្យាយាមម្តងទៀត
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <p className="text-lg font-semibold text-slate-700">គណនីសរុប</p>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {data?.totalElements ?? 0}
        </span>

        {isFetching && (
          <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        {members.map((member) => {
          const firstLetter =
            member.profileName.trim().charAt(0).toUpperCase() || "?";

          return (
            <div
              key={member.uuid}
              className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50"
            >
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-base font-bold text-emerald-700 ring-1 ring-emerald-200">
                {firstLetter}

                {member.isDefault && (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500"
                    title="Default profile"
                  />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">
                    {member.profileName}
                  </p>

                  {!member.isActive && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                      អសកម្ម
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-400">
                  {relationshipLabels[member.relationship] ??
                    member.relationship}
                  {" · "}
                  {genderLabels[member.gender] ?? member.gender}
                </p>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={handleAddProfile}
          className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-500 transition-colors hover:border-emerald-400 hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300">
            <Plus className="h-4 w-4" />
          </span>
          បន្ថែមគណនី
        </button>
      </div>

      {members.length === 0 && (
        <p className="mt-5 text-sm text-slate-500">
          មិនទាន់មានគណនីគ្រួសារនៅឡើយទេ។
        </p>
      )}
    </div>
  );
}
