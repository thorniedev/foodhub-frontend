"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  ArrowRight,
  Crown,
  Eye,
  HeartPulse,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Salad,
  ShieldAlert,
  Sparkles,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import CreateMemberProfileModal from "@/app/(dashboard)/dashboard/CreateMemberProfileModal";

import {
  useDeleteMemberProfileMutation,
  useGetMemberProfilesQuery,
  useGetMemberProfileByIdQuery,
  useGetMediaAccessUrlQuery,
} from "@/app/store/memberProfileApi";

import {
  getRecommendationTargets,
  useRecommendationProfileSelection,
} from "@/hooks/useRecommendationProfileSelection";

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
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 sm:px-7">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Trash2 className="h-6 w-6" />
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-11 w-11 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="បិទ"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6 sm:px-7">
          <h3 className="text-[26px] font-bold text-primary-800">លុបគណនី?</h3>

          <p className="mt-3 text-lg leading-8 text-slate-500">
            តើអ្នកពិតជាចង់លុបគណនី{" "}
            <span className="font-semibold text-slate-800">
              {profile.profileName}
            </span>{" "}
            មែនទេ?
          </p>

          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5">
            <p className="text-lg leading-7 text-red-600">
              សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានទេ។
            </p>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="min-h-12 rounded-full border border-slate-200 bg-white px-6 py-3 text-lg font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              បោះបង់
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3 text-lg font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  កំពុងលុប...
                </>
              ) : (
                <>
                  <Trash2 className="h-5 w-5" />
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
  isIncludedInRecommendations: boolean;
  onToggleRecommendation: (member: MemberProfile) => void;
}

function ProfileCard({
  member,
  onDelete,
  isIncludedInRecommendations,
  onToggleRecommendation,
}: ProfileCardProps) {
  const { data: detail } = useGetMemberProfileByIdQuery(member.uuid, {
    skip: !member.uuid,
  });

  const fullMember = detail ?? member;
  const isDefault = Boolean(fullMember.isDefault);

  const firstLetter =
    fullMember.profileName.trim().charAt(0).toUpperCase() || "?";

  const allergyCount = fullMember.allergies?.length ?? 0;
  const dietaryCount = fullMember.dietaryTypes?.length ?? 0;
  const medicalCount = fullMember.medicalConditions?.length ?? 0;

  const avatarMediaUuid =
    fullMember.avatarMediaUuid ?? member.avatarMediaUuid ?? "";

  /* Fetch CDN URL for the avatar */
  const { data: avatarAccessUrlData } = useGetMediaAccessUrlQuery(
    avatarMediaUuid,
    { skip: !avatarMediaUuid },
  );

  return (
    <article
      className={`group flex h-full flex-col rounded-3xl border bg-white p-5 transition duration-300 sm:p-6 ${
        isDefault
          ? "border-amber-300 bg-amber-50/20 ring-1 ring-amber-200 shadow-[0_12px_34px_rgba(245,158,11,0.10)] hover:shadow-[0_16px_42px_rgba(245,158,11,0.14)]"
          : "border-slate-200 shadow-sm hover:border-primary-800/20 hover:shadow-[0_14px_38px_rgba(15,23,42,0.08)]"
      }`}
    >
      {/* Clear default-profile marker. Visual only; profile logic stays unchanged. */}
      {isDefault && (
        <div className="-mx-5 -mt-5 mb-5 flex min-h-12 items-center justify-between gap-3 rounded-t-[23px] border-b border-amber-200 bg-amber-50 px-5 py-2.5 sm:-mx-6 sm:-mt-6 sm:px-6">
          <span className="inline-flex min-w-0 items-center gap-2 font-semibold text-amber-800">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-200">
              <Crown className="h-4 w-4" />
            </span>
            <span className="truncate text-base lg:text-lg">គណនីលំនាំដើម</span>
          </span>

          <span className="hidden shrink-0 text-sm font-medium text-amber-700/80 sm:inline lg:text-base">
            គណនីសំខាន់របស់អ្នក
          </span>
        </div>
      )}

      {/* Profile identity */}
      <div className="flex items-start gap-4">
        <Link
          href={`/dashboard/family-profile/${fullMember.uuid}`}
          className={`relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full bg-primary-800/10 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-800/10 ${
            isDefault
              ? "ring-3 ring-amber-300 shadow-[0_0_0_4px_rgba(254,243,199,0.75)]"
              : "ring-1 ring-slate-200 group-hover:ring-primary-800/20"
          }`}
          aria-label={`មើលព័ត៌មាន ${fullMember.profileName}`}
        >
          {avatarAccessUrlData?.url ? (
            <Image
              src={avatarAccessUrlData.url}
              alt={fullMember.profileName}
              fill
              className="object-cover"
              sizes="72px"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[28px] font-bold text-primary-800">
              {firstLetter}
            </span>
          )}

          {fullMember.isActive && (
            <span
              title="Active"
              className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-[4px] border-white bg-emerald-500"
            />
          )}
        </Link>

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/dashboard/family-profile/${fullMember.uuid}`}
              className="min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-800/20"
            >
              <h3 className="truncate text-xl font-bold text-primary-800 lg:text-2xl">
                {fullMember.profileName}
              </h3>
            </Link>
          </div>

          <p className="mt-1 text-base font-medium text-slate-600 lg:text-lg">
            {relationshipLabels[fullMember.relationship] ??
              fullMember.relationship}
          </p>

          {fullMember.ageGroup?.name && (
            <p className="mt-0.5 truncate text-base text-slate-400 lg:text-lg">
              {fullMember.ageGroup.name}
            </p>
          )}
        </div>
      </div>

      {/* Familiar social-profile style stats */}
      <div className="mt-5 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/70 px-2 py-3">
        <div className="px-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-red-500">
            <ShieldAlert className="h-4 w-4 lg:h-5 lg:w-5" />
            <span className="text-lg font-bold text-slate-800">
              {allergyCount}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 lg:text-lg">អាឡែហ្ស៊ី</p>
        </div>

        <div className="px-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-emerald-600">
            <Salad className="h-4 w-4 lg:h-5 lg:w-5" />
            <span className="text-lg font-bold text-slate-800">
              {dietaryCount}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 lg:text-lg">របបអាហារ</p>
        </div>

        <div className="px-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-blue-600">
            <HeartPulse className="h-4 w-4 lg:h-5 lg:w-5" />
            <span className="text-lg font-bold text-slate-800">
              {medicalCount}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 lg:text-lg">សុខភាព</p>
        </div>
      </div>

      {/* Recommendation preference */}
      <button
        type="button"
        onClick={() => onToggleRecommendation(fullMember)}
        disabled={!fullMember.isActive}
        title={
          !fullMember.isActive
            ? "គណនីនេះមិនសកម្មទេ"
            : isIncludedInRecommendations
              ? "កំពុងណែនាំម្ហូបសម្រាប់គណនីនេះ"
              : "មិនណែនាំម្ហូបសម្រាប់គណនីនេះទេ"
        }
        className={`mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
          isIncludedInRecommendations
            ? "border-emerald-200 bg-emerald-50/80 text-emerald-700"
            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              isIncludedInRecommendations
                ? "bg-white text-emerald-600"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            <Sparkles className="h-4 w-4 lg:h-5 lg:w-5" />
          </span>

          <span className="min-w-0">
            <span className="block truncate text-base font-semibold lg:text-lg">
              ណែនាំម្ហូបសម្រាប់គណនីនេះ
            </span>
            <span className="mt-0.5 block truncate text-sm font-normal opacity-75 lg:text-lg">
              {isIncludedInRecommendations ? "បានបើក" : "បានបិទ"}
            </span>
          </span>
        </span>

        <span
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
            isIncludedInRecommendations ? "bg-emerald-500" : "bg-slate-300"
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition ${
              isIncludedInRecommendations
                ? "translate-x-[22px]"
                : "translate-x-0.5"
            }`}
          />
        </span>
      </button>

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2.5 pt-5">
        <Link
          href={`/dashboard/family-profile/${fullMember.uuid}`}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary-800 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-primary-900 active:scale-[0.99] lg:text-lg"
        >
          <Eye className="h-5 w-5" />
          មើលព័ត៌មាន
        </Link>

        <Link
          href={`/dashboard/family-profile/${fullMember.uuid}?mode=edit`}
          title="កែប្រែ"
          aria-label="កែប្រែ"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-primary-800/20 hover:bg-primary-800/5 hover:text-primary-800"
        >
          <Pencil className="h-5 w-5" />
        </Link>

        <button
          type="button"
          onClick={() => onDelete(fullMember)}
          disabled={fullMember.isDefault}
          title={
            fullMember.isDefault ? "មិនអាចលុបគណនីលំនាំដើមបានទេ" : "លុបគណនី"
          }
          aria-label="លុបគណនី"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Trash2 className="h-5 w-5" />
        </button>
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
      className="group flex min-h-[360px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/40 p-7 text-center transition-all duration-300 hover:border-primary-800/30 hover:bg-white hover:shadow-[0_14px_38px_rgba(15,23,42,0.06)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-800/10"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-800/10 text-primary-800 transition-all duration-300 group-hover:scale-105 group-hover:bg-primary-800 group-hover:text-white">
        <Plus className="h-7 w-7" />
      </span>

      <h3 className="mt-5 text-xl font-bold text-primary-800 lg:text-2xl">
        បន្ថែមគណនីថ្មី
      </h3>

      <p className="mt-2 max-w-[320px] text-base leading-7 text-slate-500 lg:text-lg lg:leading-8">
        បង្កើតគណនីសម្រាប់សមាជិកគ្រួសារ និងកំណត់ចំណូលចិត្តអាហារ។
      </p>

      <span className="mt-5 inline-flex items-center gap-2 text-base font-semibold text-primary-800 lg:text-lg">
        ចាប់ផ្ដើម
        <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
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

  const members = useMemo(() => data?.contents ?? [], [data]);

  // Same selection the AI recommendation dropdown reads/writes — toggling a
  // profile here immediately shows up there too, and vice versa.
  const { selectedUuids: recommendationSelectedUuids, toggleProfile } =
    useRecommendationProfileSelection();

  const activeMembers = useMemo(
    () => members.filter((member) => member.isActive),
    [members],
  );

  const recommendationTargetUuids = useMemo(() => {
    const targets = getRecommendationTargets(
      activeMembers,
      recommendationSelectedUuids,
    );
    return new Set(targets.map((profile) => profile.uuid));
  }, [activeMembers, recommendationSelectedUuids]);

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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 ">
        <div className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-800/10">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary-800" />
            </div>

            <p className="mt-4 text-lg font-medium text-slate-500">
              កំពុងទាញយកគណនី...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm">
            <RefreshCw className="h-7 w-7" />
          </div>

          <p className="mt-5 text-[22px] font-bold text-red-700">
            មិនអាចទាញយកគណនីគ្រួសារបានទេ។
          </p>

          <p className="mx-auto mt-2 max-w-md text-lg leading-8 text-red-600/80">
            សូមព្យាយាមទាញយកទិន្នន័យម្តងទៀត។
          </p>

          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-lg font-semibold text-white transition hover:bg-red-700"
          >
            <RefreshCw className="h-5 w-5" />
            ព្យាយាមម្តងទៀត
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-5 lg:py-6 xl:px-6">
        {/* Compact page heading */}
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-800/10 text-primary-800">
                <UsersRound className="h-6 w-6" />
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-primary-800 sm:text-[30px] lg:text-[32px]">
                    គណនីសមាជិកគ្រួសារ
                  </h1>

                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-base font-semibold text-slate-600 lg:text-lg">
                    {data?.totalElements ?? members.length} គណនី
                  </span>
                </div>

                <p className="mt-1.5 max-w-3xl text-base leading-7 text-slate-500 lg:text-lg lg:leading-8">
                  គ្រប់គ្រងព័ត៌មានសមាជិក ចំណូលចិត្តអាហារ អាឡែហ្ស៊ី
                  និងព័ត៌មានសុខភាពរបស់ពួកគេ។
                </p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {isFetching && (
              <span className="hidden items-center gap-2 text-base font-medium text-slate-400 sm:inline-flex lg:text-lg">
                <RefreshCw className="h-4 w-4 animate-spin" />
                កំពុងធ្វើបច្ចុប្បន្នភាព...
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-800 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-primary-900 active:scale-[0.99] sm:w-auto lg:text-lg"
            >
              <Plus className="h-5 w-5" />
              បន្ថែមគណនី
            </button>
          </div>
        </div>

        {deleteError && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-base leading-7 text-red-700 lg:text-lg lg:leading-8">
              {deleteError}
            </p>

            <button
              type="button"
              onClick={() => setDeleteError(null)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-red-400 transition hover:bg-red-100 hover:text-red-700"
              aria-label="បិទសារ"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {members.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-800/10 text-primary-800">
              <UsersRound className="h-9 w-9" />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-primary-800 lg:text-[28px]">
              មិនទាន់មានគណនីគ្រួសារ
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-base leading-7 text-slate-500 lg:text-lg lg:leading-8">
              បន្ថែមសមាជិកដំបូងរបស់អ្នក
              ដើម្បីទទួលបានការណែនាំអាហារដែលសមស្របតាមមនុស្សម្នាក់ៗ។
            </p>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary-800 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-primary-900 lg:text-lg"
            >
              <Plus className="h-5 w-5" />
              បន្ថែមគណនីដំបូង
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 min-[1800px]:grid-cols-3">
            {members.map((member) => (
              <ProfileCard
                key={member.uuid}
                member={member}
                onDelete={handleDeleteRequest}
                isIncludedInRecommendations={recommendationTargetUuids.has(
                  member.uuid,
                )}
                onToggleRecommendation={(profile) =>
                  toggleProfile(profile.uuid)
                }
              />
            ))}

            <AddProfileCard onClick={() => setIsCreateModalOpen(true)} />
          </div>
        )}
      </section>

      <CreateMemberProfileModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

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

// "use client";

// import { Plus, UsersRound } from "lucide-react";
// import type { FamilyMember } from "@/types/family-profile";

// interface FamilyMemberListProps {
//   members: FamilyMember[];
//   onAddProfile?: () => void;
// }

// export default function FamilyMemberList({
//   members,
//   onAddProfile,
// }: FamilyMemberListProps) {
//   return (
//     <section className="rounded-[28px] border border-slate-200/70 bg-white p-5 shadow-sm sm:p-7">
//       {/* Header */}
//       <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <div className="flex items-center gap-4">
//           <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-800/10 text-primary-800">
//             <UsersRound className="h-6 w-6" />
//           </div>

//           <div>
//             <h3 className="text-[24px] font-bold text-primary-800 sm:text-[26px]">
//               គណនីសមាជិក
//             </h3>

//             <p className="mt-1 text-lg leading-7 text-slate-500">
//               ជ្រើសរើស ឬបន្ថែមគណនីសមាជិកគ្រួសារ
//             </p>
//           </div>
//         </div>

//         {/* Count */}
//         <div className="w-fit rounded-full bg-slate-100 px-4 py-2 text-lg font-semibold text-slate-600">
//           {members.length} គណនី
//         </div>
//       </div>

//       {/* Divider */}
//       <div className="mb-6 h-px bg-slate-100" />

//       {/* Members */}
//       <div className="flex flex-wrap gap-4">
//         {members.map((member) => (
//           <div
//             key={member.id}
//             className="
//               group
//               flex
//               min-w-[240px]
//               items-center
//               gap-4
//               rounded-[22px]
//               border
//               border-slate-200
//               bg-slate-50/50
//               px-4
//               py-3.5
//               transition-all
//               duration-200
//               hover:-translate-y-0.5
//               hover:border-primary-800/25
//               hover:bg-white
//               hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)]
//             "
//           >
//             {/* Avatar */}
//             <div className="relative shrink-0">
//               <div className="rounded-full bg-white p-1 shadow-sm">
//                 <img
//                   src={member.avatarUrl}
//                   alt={member.name}
//                   className="h-14 w-14 rounded-full object-cover"
//                 />
//               </div>

//               <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-[3px] border-white bg-emerald-500" />
//             </div>

//             {/* Member info */}
//             <div className="min-w-0 flex-1">
//               <p className="truncate text-lg font-bold text-primary-800">
//                 {member.name}
//               </p>

//               <p className="mt-1 truncate text-lg text-slate-500">
//                 {member.role}
//               </p>
//             </div>
//           </div>
//         ))}

//         {/* Add profile */}
//         <button
//           type="button"
//           onClick={onAddProfile}
//           className="
//             group
//             flex
//             min-w-[240px]
//             items-center
//             gap-4
//             rounded-[22px]
//             border
//             border-dashed
//             border-slate-300
//             bg-white
//             px-4
//             py-3.5
//             text-left
//             transition-all
//             duration-200
//             hover:-translate-y-0.5
//             hover:border-primary-800
//             hover:bg-primary-800/[0.03]
//             hover:shadow-[0_8px_30px_rgba(15,23,42,0.07)]
//             focus-visible:outline-none
//             focus-visible:ring-4
//             focus-visible:ring-primary-800/10
//           "
//         >
//           <span
//             className="
//               flex
//               h-14
//               w-14
//               shrink-0
//               items-center
//               justify-center
//               rounded-full
//               bg-primary-800/10
//               text-primary-800
//               transition-all
//               duration-200
//               group-hover:bg-primary-800
//               group-hover:text-white
//             "
//           >
//             <Plus className="h-6 w-6" />
//           </span>

//           <div>
//             <p className="text-lg font-bold text-primary-800">បន្ថែមគណនី</p>

//             <p className="mt-1 text-lg text-slate-500">បង្កើតសមាជិកថ្មី</p>
//           </div>
//         </button>
//       </div>

//       {/* Empty state */}
//       {members.length === 0 && (
//         <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-4">
//           <p className="text-lg leading-7 text-slate-500">
//             មិនទាន់មានគណនីសមាជិកទេ។ ចុច
//             <span className="font-semibold text-primary-800"> បន្ថែមគណនី </span>
//             ដើម្បីបង្កើតគណនីថ្មី។
//           </p>
//         </div>
//       )}
//     </section>
//   );
// }
