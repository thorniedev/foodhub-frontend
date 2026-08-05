"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { LoaderCircle, Plus, RefreshCw, Trash2, X } from "lucide-react";

import {
  useCreateMemberProfileMutation,
  useDeleteMemberProfileMutation,
  useGetMemberProfilesQuery,
} from "@/app/store/memberProfileApi";

import type {
  CreateMemberProfileRequest,
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
  PREFER_NOT_TO_SAY: "មិនចង់បញ្ជាក់",
};

const initialFormState: CreateMemberProfileRequest = {
  profileName: "",
  relationship: "CHILD",
  gender: "MALE",
  dateOfBirth: "",
  preferredLanguage: "km",
  avatarMediaUuid: null,
  isDefault: false,
  allergies: [],
  dietaryTypes: [],
  medicalConditions: [],
  ingredientAvoids: [],
  preferences: null,
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

  const [form, setForm] =
    useState<CreateMemberProfileRequest>(initialFormState);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [deletingProfileUuid, setDeletingProfileUuid] = useState<string | null>(
    null,
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useGetMemberProfilesQuery({
      page: 0,
      size: 20,
    });

  const [createMemberProfile, { isLoading: isCreating }] =
    useCreateMemberProfileMutation();

  const [deleteMemberProfile, { isLoading: isDeleting }] =
    useDeleteMemberProfileMutation();

  const members = data?.contents ?? [];

  const handleAddProfile = () => {
    setSubmitError(null);
    setForm(initialFormState);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isCreating) {
      return;
    }

    setSubmitError(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitError(null);

    if (!form.profileName.trim()) {
      setSubmitError("សូមបញ្ចូលឈ្មោះគណនី។");
      return;
    }

    if (!form.dateOfBirth) {
      setSubmitError("សូមជ្រើសរើសថ្ងៃខែឆ្នាំកំណើត។");
      return;
    }

    try {
      await createMemberProfile({
        ...form,
        profileName: form.profileName.trim(),
      }).unwrap();

      setForm(initialFormState);
      setIsModalOpen(false);
    } catch (error) {
      console.error("CREATE MEMBER PROFILE ERROR:", error);

      setSubmitError(getErrorMessage(error, "មិនអាចបង្កើតគណនីបានទេ។"));
    }
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
      console.error("DELETE PROFILE: UUID is missing", {
        uuid,
        profileName,
      });

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
      console.log("DELETE PROFILE:", {
        uuid,
        profileName,
      });

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

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  បន្ថែមគណនីគ្រួសារ
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  បញ្ចូលព័ត៌មានសម្រាប់សមាជិកគ្រួសារ។
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isCreating}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="profileName"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  ឈ្មោះគណនី
                </label>

                <input
                  id="profileName"
                  type="text"
                  value={form.profileName}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      profileName: event.target.value,
                    }))
                  }
                  placeholder="ឧ. Leng Sokha"
                  disabled={isCreating}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="relationship"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    ទំនាក់ទំនង
                  </label>

                  <select
                    id="relationship"
                    value={form.relationship}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        relationship: event.target.value as MemberRelationship,
                      }))
                    }
                    disabled={isCreating}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-100"
                  >
                    {Object.entries(relationshipLabels).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="gender"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    ភេទ
                  </label>

                  <select
                    id="gender"
                    value={form.gender}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        gender: event.target.value as MemberGender,
                      }))
                    }
                    disabled={isCreating}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-100"
                  >
                    {Object.entries(genderLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  ថ្ងៃខែឆ្នាំកំណើត
                </label>

                <input
                  id="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      dateOfBirth: event.target.value,
                    }))
                  }
                  disabled={isCreating}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="preferredLanguage"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  ភាសាដែលពេញចិត្ត
                </label>

                <select
                  id="preferredLanguage"
                  value={form.preferredLanguage}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      preferredLanguage: event.target.value,
                    }))
                  }
                  disabled={isCreating}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-100"
                >
                  <option value="km">ភាសាខ្មែរ</option>

                  <option value="en">English</option>
                </select>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      isDefault: event.target.checked,
                    }))
                  }
                  disabled={isCreating}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />

                <div>
                  <p className="text-sm font-medium text-slate-700">
                    កំណត់ជាគណនីលំនាំដើម
                  </p>

                  <p className="text-xs text-slate-400">
                    គណនីនេះនឹងត្រូវបានប្រើជាលំនាំដើម។
                  </p>
                </div>
              </label>

              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isCreating}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  បោះបង់
                </button>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreating ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      កំពុងបង្កើត...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      បង្កើតគណនី
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
