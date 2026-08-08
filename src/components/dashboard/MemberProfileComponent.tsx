"use client";

import Link from "next/link";
import { useState } from "react";

import {
  ArrowRight,
  Crown,
  Eye,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import CreateMemberProfileModal from "@/app/(dashboard)/dashboard/CreateMemberProfileModal";

import {
  useDeleteMemberProfileMutation,
  useGetMemberProfilesQuery,
} from "@/app/store/memberProfileApi";

import type {
  MemberProfile,
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

/* -------------------------------------------------------------------------- */
/*                             DELETE CONFIRMATION                            */
/* -------------------------------------------------------------------------- */

interface DeleteProfileDialogProps {
  profile: MemberProfile | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteProfileDialog({
  profile,
  loading,
  onClose,
  onConfirm,
}: DeleteProfileDialogProps) {
  if (!profile) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Trash2 className="h-5 w-5" />
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pb-6">
          <h3 className="text-xl font-semibold text-slate-900">លុបគណនី?</h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            តើអ្នកពិតជាចង់លុបគណនី{" "}
            <span className="font-semibold text-slate-800">
              {profile.profileName}
            </span>{" "}
            មែនទេ?
          </p>

          <p className="mt-2 text-sm text-red-500">
            សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានទេ។
          </p>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  កំពុងលុប...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  លុបគណនី
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                PROFILE CARD                                */
/* -------------------------------------------------------------------------- */

interface ProfileCardProps {
  member: MemberProfile;
  onDelete: (member: MemberProfile) => void;
}

function ProfileCard({ member, onDelete }: ProfileCardProps) {
  const firstLetter = member.profileName.trim().charAt(0).toUpperCase() || "?";

  const allergyCount = member.allergies?.length ?? 0;
  const dietaryCount = member.dietaryTypes?.length ?? 0;
  const medicalCount = member.medicalConditions?.length ?? 0;

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">
      {/* Default profile marker */}

      {member.isDefault && (
        <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
          <Crown className="h-3.5 w-3.5" />
          លំនាំដើម
        </div>
      )}

      <div className="p-5 sm:p-6">
        {/* Profile */}

        <Link
          href={``}
          className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl font-bold text-emerald-700 ring-1 ring-emerald-100">
              {firstLetter}

              {member.isActive && (
                <span
                  title="Active"
                  className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white bg-emerald-500"
                />
              )}
            </div>

            <div className="min-w-0 pr-16">
              <h3 className="truncate text-lg font-semibold text-slate-900">
                {member.profileName}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {relationshipLabels[member.relationship] ?? member.relationship}
              </p>

              {member.ageGroup?.name && (
                <p className="mt-1 text-xs text-slate-400">
                  {member.ageGroup.name}
                </p>
              )}
            </div>
          </div>
        </Link>

        {/* Safety information */}

      

        {/* Actions */}

        <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
          <Link
            href={`/dashboard/family-profile/${member.uuid}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            <Eye className="h-4 w-4" />
            មើលព័ត៌មាន
          </Link>

          <Link
            href={`/dashboard/family-profile/${member.uuid}?mode=edit`}
            title="កែប្រែ"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Pencil className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={() => onDelete(member)}
            disabled={member.isDefault}
            title={member.isDefault ? "មិនអាចលុបគណនីលំនាំដើមបានទេ" : "លុបគណនី"}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                              ADD PROFILE CARD                              */
/* -------------------------------------------------------------------------- */

function AddProfileCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[285px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-6 text-center transition hover:border-emerald-300 hover:bg-emerald-50/40"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:scale-105 group-hover:bg-emerald-100">
        <Plus className="h-7 w-7" />
      </span>

      <h3 className="mt-5 font-semibold text-slate-800">បន្ថែមគណនីថ្មី</h3>

      <p className="mt-2 max-w-[230px] text-sm leading-6 text-slate-400">
        បង្កើតគណនីសម្រាប់សមាជិកគ្រួសារ និងកំណត់ចំណូលចិត្តអាហារ។
      </p>

      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
        ចាប់ផ្ដើម
        <ArrowRight className="h-4 w-4" />
      </span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                              FAMILY PROFILES                               */
/* -------------------------------------------------------------------------- */

export default function FamilyProfiles() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [profilePendingDelete, setProfilePendingDelete] =
    useState<MemberProfile | null>(null);

  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetMemberProfilesQuery({
      page: 0,
      size: 20,
    });

  const [deleteMemberProfile, { isLoading: isDeleting }] =
    useDeleteMemberProfileMutation();

  const members = data?.contents ?? [];

  const handleDeleteRequest = (member: MemberProfile) => {
    setDeleteError(null);

    if (member.isDefault) {
      setDeleteError(
        "មិនអាចលុបគណនីលំនាំដើមបានទេ។ សូមកំណត់គណនីផ្សេងជាលំនាំដើមជាមុនសិន។",
      );

      return;
    }

    setProfilePendingDelete(member);
  };

  const confirmDelete = async () => {
    if (!profilePendingDelete?.uuid) {
      return;
    }

    setDeleteError(null);

    try {
      await deleteMemberProfile({
        uuid: profilePendingDelete.uuid,
      }).unwrap();

      setProfilePendingDelete(null);
    } catch (error) {
      console.error("DELETE PROFILE ERROR:", error);

      setDeleteError(getErrorMessage(error, "មិនអាចលុបគណនីនេះបានទេ។"));

      setProfilePendingDelete(null);
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                                LOADING                                 */
  /* ---------------------------------------------------------------------- */

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <div className="text-center">
            <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-emerald-600" />

            <p className="mt-3 text-sm text-slate-500">កំពុងទាញយកគណនី...</p>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                                 ERROR                                  */
  /* ---------------------------------------------------------------------- */

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-medium text-red-700">
            មិនអាចទាញយកគណនីគ្រួសារបានទេ។
          </p>

          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            ព្យាយាមម្តងទៀត
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}

        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-600">
              <UsersRound className="h-5 w-5" />

              <span className="text-sm font-semibold">Family Profiles</span>
            </div>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              គណនីសមាជិកគ្រួសារ
            </p>

            <p className="mt-2 max-w-xl text-xl leading-6 text-slate-500">
              គ្រប់គ្រងព័ត៌មានសមាជិក ចំណូលចិត្តអាហារ អាឡែហ្ស៊ី
              និងព័ត៌មានសុខភាពរបស់ពួកគេ។
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            បន្ថែមគណនី
          </button>
        </div>

        {/* Summary */}

        <div className="mb-7 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <UserRound className="h-4 w-4" />
          </div>

          <div>
            <p className="text-xs text-slate-400">គណនីសរុប</p>

            <p className="text-sm font-semibold text-slate-800">
              {data?.totalElements ?? members.length} គណនី
            </p>
          </div>

          {isFetching && (
            <div className="ml-auto inline-flex items-center gap-2 text-xs text-slate-400">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              កំពុងធ្វើបច្ចុប្បន្នភាព...
            </div>
          )}
        </div>

        {/* Delete error */}

        {deleteError && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm leading-6 text-red-700">{deleteError}</p>

            <button
              type="button"
              onClick={() => setDeleteError(null)}
              className="shrink-0 rounded-full p-1 text-red-400 transition hover:bg-red-100 hover:text-red-700"
              aria-label="Close error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Empty state */}

        {members.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <UsersRound className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              មិនទាន់មានគណនីគ្រួសារ
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              បន្ថែមសមាជិកដំបូងរបស់អ្នក ដើម្បីទទួលបានការណែនាំអាហារដែលសមស្រប។
            </p>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              បន្ថែមគណនីដំបូង
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => (
              <ProfileCard
                key={member.uuid}
                member={member}
                onDelete={handleDeleteRequest}
              />
            ))}

            <AddProfileCard onClick={() => setIsCreateModalOpen(true)} />
          </div>
        )}
      </section>

      {/* Create */}

      <CreateMemberProfileModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Delete */}

      <DeleteProfileDialog
        profile={profilePendingDelete}
        loading={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setProfilePendingDelete(null);
          }
        }}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
