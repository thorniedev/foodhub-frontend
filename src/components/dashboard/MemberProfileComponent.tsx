"use client";

import Link from "next/link";
import { useState } from "react";
import { LoaderCircle, Plus, RefreshCw, Trash2, X } from "lucide-react";

import CreateMemberProfileModal from "@/app/(dashboard)/dashboard/CreateMemberProfileModal";
import {
  useDeleteMemberProfileMutation,
  useGetMemberProfilesQuery,
} from "@/app/store/memberProfileApi";

import type { MemberRelationship } from "@/types/member-profile/member-profile";

const relationshipLabels: Record<MemberRelationship, string> = {
  SELF: "ខ្លួនឯង",
  PARENT: "ឪពុកម្តាយ",
  SPOUSE: "ប្តី ឬប្រពន្ធ",
  CHILD: "កូន",
  SIBLING: "បងប្អូន",
  GRANDPARENT: "ជីដូនជីតា",
  OTHER: "ផ្សេងៗ",
};

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const errorData = (
      error as {
        data?: {
          message?: string;
          backendResponse?: {
            message?: string;
          };
        };
      }
    ).data;

    return (
      errorData?.backendResponse?.message ??
      errorData?.message ??
      fallbackMessage
    );
  }

  return fallbackMessage;
}

export default function FamilyProfiles() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [deletingProfileUuid, setDeletingProfileUuid] = useState<string | null>(
    null,
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGetMemberProfilesQuery({
      page: 0,
      size: 20,
    });

  const [deleteMemberProfile, { isLoading: isDeleting }] =
    useDeleteMemberProfileMutation();

  const members = data?.contents ?? [];

  const handleAddProfile = () => {
    setIsModalOpen(true);
  };

  const handleDeleteProfile = async (
    uuid: string,
    profileName: string,
    isDefault: boolean,
  ) => {
    if (isDefault) {
      setDeleteError(
        "មិនអាចលុបគណនីលំនាំដើមបានទេ។ សូមកំណត់គណនីផ្សេងជាលំនាំដើមជាមុនសិន។",
      );
      return;
    }

    if (!uuid) {
      setDeleteError("រកមិនឃើញលេខសម្គាល់គណនី។");
      return;
    }

    const confirmed = window.confirm(
      `តើអ្នកពិតជាចង់លុបគណនី "${profileName}" មែនទេ?`,
    );

    if (!confirmed) {
      return;
    }

    setDeleteError(null);
    setDeletingProfileUuid(uuid);

    try {
      await deleteMemberProfile({ uuid }).unwrap();
    } catch (error) {
      console.error("DELETE PROFILE ERROR:", error);

      setDeleteError(getErrorMessage(error, "មិនអាចលុបគណនីនេះបានទេ។"));
    } finally {
      setDeletingProfileUuid(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-slate-500">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span>កំពុងទាញយកគណនី...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">មិនអាចទាញយកគណនីគ្រួសារបានទេ។</p>

        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          ព្យាយាមម្តងទៀត
        </button>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="mb-4 flex items-center gap-3">
          <p className="text-lg font-semibold text-slate-700">គណនីសរុប</p>

          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {data?.totalElements ?? 0}
          </span>

          {isFetching && (
            <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
          )}
        </div>

        {deleteError && (
          <div className="mb-4 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{deleteError}</p>

            <button
              type="button"
              onClick={() => setDeleteError(null)}
              className="shrink-0 text-red-400 transition hover:text-red-700"
              aria-label="Close error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-6">
          {members.map((member) => {
            const firstLetter =
              member.profileName.trim().charAt(0).toUpperCase() || "?";

            const isDeletingThisProfile =
              isDeleting && deletingProfileUuid === member.uuid;

            return (
              <div
                key={member.uuid}
                className="flex items-center gap-2 rounded-xl border border-transparent p-1 transition hover:border-slate-200 hover:bg-slate-50"
              >
                <Link
                  href={`/dashboard/family-profile/${member.uuid}`}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1"
                >
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    {firstLetter}

                    {member.isDefault && (
                      <span
                        className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500"
                        title="Default profile"
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {member.profileName}
                      </p>

                      {member.isDefault && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          លំនាំដើម
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-400">
                      {relationshipLabels[member.relationship] ??
                        member.relationship}
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    handleDeleteProfile(
                      member.uuid,
                      member.profileName,
                      member.isDefault,
                    )
                  }
                  disabled={isDeleting || member.isDefault}
                  title={
                    member.isDefault ? "មិនអាចលុបគណនីលំនាំដើមបានទេ" : "លុបគណនី"
                  }
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isDeletingThisProfile ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
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

      <CreateMemberProfileModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
