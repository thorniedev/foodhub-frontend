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
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-800/20 hover:shadow-[0_18px_50px_rgba(15,23,42,0.09)]">
      {fullMember.isDefault && (
        <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-lg font-semibold text-amber-700 shadow-sm">
          <Crown className="h-4 w-4" />
          លំនាំដើម
        </div>
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <Link
          href={`/dashboard/family-profile/${fullMember.uuid}`}
          className="block rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-800/10"
        >
          <div className="flex items-center gap-4">
            <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[22px] bg-primary-800/10 ring-1 ring-primary-800/10">
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
                  className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-[4px] border-white bg-emerald-500"
                />
              )}
            </div>

            <div className="min-w-0 flex-1 pr-1">
              <h3 className="truncate text-[22px] font-bold text-primary-800">
                {fullMember.profileName}
              </h3>

              <p className="mt-1.5 truncate text-lg font-medium text-slate-500">
                {relationshipLabels[fullMember.relationship] ??
                  fullMember.relationship}
              </p>

              {fullMember.ageGroup?.name && (
                <p className="mt-1 truncate text-lg text-slate-400">
                  {fullMember.ageGroup.name}
                </p>
              )}
            </div>
          </div>
        </Link>

        <div className="mt-6 grid grid-cols-3 gap-2.5">
          <div className="rounded-2xl bg-red-50/80 px-3 py-3 text-center">
            <ShieldAlert className="mx-auto h-5 w-5 text-red-500" />
            <p className="mt-1.5 text-lg font-bold text-slate-800">
              {allergyCount}
            </p>
            <p className="mt-0.5 text-lg text-slate-500">អាឡែហ្ស៊ី</p>
          </div>

          <div className="rounded-2xl bg-emerald-50/80 px-3 py-3 text-center">
            <Salad className="mx-auto h-5 w-5 text-emerald-600" />
            <p className="mt-1.5 text-lg font-bold text-slate-800">
              {dietaryCount}
            </p>
            <p className="mt-0.5 text-lg text-slate-500">របបអាហារ</p>
          </div>

          <div className="rounded-2xl bg-blue-50/80 px-3 py-3 text-center">
            <HeartPulse className="mx-auto h-5 w-5 text-blue-600" />
            <p className="mt-1.5 text-lg font-bold text-slate-800">
              {medicalCount}
            </p>
            <p className="mt-0.5 text-lg text-slate-500">សុខភាព</p>
          </div>
        </div>

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
          className={`mt-4 flex w-full items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
            isIncludedInRecommendations
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
          }`}
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            ណែនាំម្ហូបសម្រាប់គណនីនេះ
          </span>

          <span
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
              isIncludedInRecommendations ? "bg-emerald-500" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                isIncludedInRecommendations ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </span>
        </button>

        <div className="mt-6 flex items-center gap-2.5 border-t border-slate-100 pt-5">
          <Link
            href={`/dashboard/family-profile/${fullMember.uuid}`}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary-800 px-4 py-3 text-lg font-semibold text-white shadow-sm transition hover:bg-primary-900"
          >
            <Eye className="h-5 w-5" />
            មើលព័ត៌មាន
          </Link>

          <Link
            href={`/dashboard/family-profile/${fullMember.uuid}?mode=edit`}
            title="កែប្រែ"
            aria-label="កែប្រែ"
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-primary-800/20 hover:bg-primary-800/5 hover:text-primary-800"
          >
            <Pencil className="h-5 w-5" />
          </Link>

          <button
            type="button"
            onClick={() => onDelete(fullMember)}
            disabled={fullMember.isDefault}
            title={
              fullMember.isDefault
                ? "មិនអាចលុបគណនីលំនាំដើមបានទេ"
                : "លុបគណនី"
            }
            aria-label="លុបគណនី"
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Trash2 className="h-5 w-5" />
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
      className="group flex min-h-[360px] w-full flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-slate-200 bg-white p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary-800/40 hover:bg-primary-800/[0.025] hover:shadow-[0_18px_50px_rgba(15,23,42,0.07)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-800/10"
    >
      <span className="flex h-18 w-18 items-center justify-center rounded-[22px] bg-primary-800/10 text-primary-800 transition-all duration-300 group-hover:scale-105 group-hover:bg-primary-800 group-hover:text-white">
        <Plus className="h-8 w-8" />
      </span>

      <h3 className="mt-6 text-[22px] font-bold text-primary-800">
        បន្ថែមគណនីថ្មី
      </h3>

      <p className="mt-3 max-w-[280px] text-lg leading-8 text-slate-500">
        បង្កើតគណនីសម្រាប់សមាជិកគ្រួសារ និងកំណត់ចំណូលចិត្តអាហារ។
      </p>

      <span className="mt-6 inline-flex items-center gap-2 text-lg font-semibold text-primary-800">
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
      <section className="mx-auto w-full max-w-7xl p-4 ">
        <div className="mb-8 rounded-[30px] border border-slate-200/70 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-800/10 text-primary-800">
                <UsersRound className="h-7 w-7" />
              </div>

              <div>
                <p className="text-[28px] font-bold tracking-tight text-primary-800 sm:text-[32px]">
                  គណនីសមាជិកគ្រួសារ
                </p>

                <p className="mt-2 max-w-2xl text-lg leading-8 text-slate-500">
                  គ្រប់គ្រងព័ត៌មានសមាជិក ចំណូលចិត្តអាហារ អាឡែហ្ស៊ី
                  និងព័ត៌មានសុខភាពរបស់ពួកគេ។
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary-800 px-6 py-3 text-lg font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-900 hover:shadow-md lg:w-auto"
            >
              <Plus className="h-5 w-5" />
              បន្ថែមគណនី
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-primary-800">
              <UserRound className="h-6 w-6" />
            </div>

            <div>
              <p className="text-lg text-slate-500">គណនីសរុប</p>

              <p className="text-lg font-bold text-primary-800">
                {data?.totalElements ?? members.length} គណនី
              </p>
            </div>

            {isFetching && (
              <div className="ml-auto inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-lg font-medium text-slate-500">
                <RefreshCw className="h-4 w-4 animate-spin" />
                កំពុងធ្វើបច្ចុប្បន្នភាព...
              </div>
            )}
          </div>
        </div>

        {deleteError && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-lg leading-8 text-red-700">{deleteError}</p>

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
          <div className="rounded-[30px] border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-primary-800/10 text-primary-800">
              <UsersRound className="h-9 w-9" />
            </div>

            <h2 className="mt-6 text-[26px] font-bold text-primary-800">
              មិនទាន់មានគណនីគ្រួសារ
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-lg leading-8 text-slate-500">
              បន្ថែមសមាជិកដំបូងរបស់អ្នក
              ដើម្បីទទួលបានការណែនាំអាហារដែលសមស្របតាមមនុស្សម្នាក់ៗ។
            </p>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary-800 px-6 py-3 text-lg font-semibold text-white shadow-sm transition hover:bg-primary-900"
            >
              <Plus className="h-5 w-5" />
              បន្ថែមគណនីដំបូង
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
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
