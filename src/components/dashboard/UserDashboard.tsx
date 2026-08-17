"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useMemo, type ReactNode } from "react";
import { IoCameraOutline } from "react-icons/io5";
import { FaRegStar, FaRegUser, FaUtensils } from "react-icons/fa";
import { RiShieldCheckLine } from "react-icons/ri";
import { FiAlertTriangle } from "react-icons/fi";
import {
  LoaderCircle,
  Plus,
  UserRound,
  Pencil,
  Crown,
  Users,
} from "lucide-react";

import {
  useGetAllergenOptionsQuery,
  useGetDietaryTypeOptionsQuery,
  useGetMedicalConditionOptionsQuery,
  useGetMemberProfileByIdQuery,
  useGetMemberProfilesQuery,
  useUploadMediaMutation,
  useUpdateMemberProfileMutation,
  useGetMediaAccessUrlQuery,
} from "@/app/store/memberProfileApi";

import type {
  MemberGender,
  MemberProfile,
  MemberRelationship,
  SafetyOption,
} from "@/types/member-profile/member-profile";

import CreateMemberProfileModal from "@/app/(dashboard)/dashboard/CreateMemberProfileModal";

/* -------------------------------------------------------------------------- */
/*                                   LABELS                                   */
/* -------------------------------------------------------------------------- */

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

const severityLabels = {
  MILD: "ស្រាល",
  MODERATE: "មធ្យម",
  SEVERE: "ធ្ងន់",
} as const;

const dietaryLevelLabels = {
  PREFERRED: "ចូលចិត្ត",
  REQUIRED: "ត្រូវតែគោរព",
} as const;

const ingredientAvoidLevelLabels = {
  PREFERENCE: "ចូលចិត្តជៀសវាង",
  STRICT_BLOCK: "ហាមដាច់ខាត",
} as const;

type UnknownRecord = Record<string, unknown>;

/* -------------------------------------------------------------------------- */
/*                                   HELPERS                                  */
/* -------------------------------------------------------------------------- */

function asRecord(value: unknown): UnknownRecord | null {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as UnknownRecord;
  }

  return null;
}

function getString(value: unknown, ...keys: string[]): string | null {
  const record = asRecord(value);

  if (!record) {
    return null;
  }

  for (const key of keys) {
    const currentValue = record[key];

    if (typeof currentValue === "string" && currentValue.trim()) {
      return currentValue;
    }
  }

  return null;
}

function calculateAge(dateOfBirth: string): number {
  const [year, month, day] = dateOfBirth.split("-").map(Number);

  if (!year || !month || !day) {
    return 0;
  }

  const today = new Date();
  let age = today.getFullYear() - year;

  const birthdayPassed =
    today.getMonth() + 1 > month ||
    (today.getMonth() + 1 === month && today.getDate() >= day);

  if (!birthdayPassed) {
    age -= 1;
  }

  return Math.max(age, 0);
}

function calculateMemberSinceDays(createdAt: string): number {
  const createdDate = new Date(createdAt);

  if (Number.isNaN(createdDate.getTime())) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("km-KH-u-ca-gregory", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function getLanguageLabel(language: string): string {
  const normalized = language.trim().toLowerCase();

  if (normalized.startsWith("km")) {
    return "ភាសាខ្មែរ";
  }

  if (normalized.startsWith("en")) {
    return "English";
  }

  return language;
}

function getInitials(profileName: string): string {
  const words = profileName.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  return words
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join("");
}

function buildOptionLabelMap(
  options: SafetyOption[] | undefined,
  preferredLanguage: string,
): Map<string, string> {
  const useKhmer = preferredLanguage.toLowerCase().startsWith("km");

  return new Map(
    (options ?? []).map((option) => [
      option.code,
      useKhmer && option.localName ? option.localName : option.name,
    ]),
  );
}

/* -------------------------------------------------------------------------- */
/*                              USER DASHBOARD                                */
/* -------------------------------------------------------------------------- */

export default function UserDashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createAsDefault, setCreateAsDefault] = useState(false);

  /*
   * STEP 1:
   * Fetch the profile list only to find the DEFAULT profile.
   */
  const {
    data: profilesResponse,
    isLoading: isProfilesLoading,
    isFetching: isProfilesFetching,
    isError: isProfilesError,
    refetch: refetchProfiles,
  } = useGetMemberProfilesQuery({
    page: 0,
    size: 100,
  });

  const defaultProfileSummary = useMemo(
    () =>
      profilesResponse?.contents.find(
        (memberProfile) => memberProfile.isDefault === true,
      ) ?? null,
    [profilesResponse],
  );

  const otherProfiles = useMemo(
    () =>
      profilesResponse?.contents.filter(
        (memberProfile) => memberProfile.isDefault !== true,
      ) ?? [],
    [profilesResponse],
  );

  /*
   * STEP 2:
   * Fetch the FULL detail of the default profile.
   *
   * This is important because the profile-list response may not contain
   * complete allergies, dietaryTypes, medicalConditions and ingredientAvoids.
   */
  const {
    data: profile,
    isLoading: isDetailLoading,
    isFetching: isDetailFetching,
    isError: isDetailError,
    refetch: refetchDetail,
  } = useGetMemberProfileByIdQuery(defaultProfileSummary?.uuid ?? "", {
    skip: !defaultProfileSummary?.uuid,
  });

  const { data: allergenOptionsResponse } = useGetAllergenOptionsQuery();
  const { data: dietaryOptionsResponse } = useGetDietaryTypeOptionsQuery();
  const { data: medicalOptionsResponse } = useGetMedicalConditionOptionsQuery();

  const preferredLanguage =
    profile?.preferredLanguage ??
    defaultProfileSummary?.preferredLanguage ??
    "km";

  const allergenLabelMap = useMemo(
    () =>
      buildOptionLabelMap(allergenOptionsResponse?.contents, preferredLanguage),
    [allergenOptionsResponse?.contents, preferredLanguage],
  );

  const dietaryLabelMap = useMemo(
    () =>
      buildOptionLabelMap(dietaryOptionsResponse?.contents, preferredLanguage),
    [dietaryOptionsResponse?.contents, preferredLanguage],
  );

  const medicalLabelMap = useMemo(
    () =>
      buildOptionLabelMap(medicalOptionsResponse?.contents, preferredLanguage),
    [medicalOptionsResponse?.contents, preferredLanguage],
  );

  const isLoading =
    isProfilesLoading || (!!defaultProfileSummary && isDetailLoading);

  const isFetching = isProfilesFetching || isDetailFetching;

  const isError = isProfilesError || (!!defaultProfileSummary && isDetailError);

  const openCreateModal = (asDefault: boolean) => {
    setCreateAsDefault(asDefault);
    setIsCreateModalOpen(true);
  };

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (isError) {
    return (
      <DashboardState
        title="មិនអាចទាញយកប្រវត្តិរូបបាន"
        description="មានបញ្ហាក្នុងការទាញយកព័ត៌មានប្រវត្តិរូបពី API។"
      >
        <button
          type="button"
          onClick={() => {
            void refetchProfiles();

            if (defaultProfileSummary?.uuid) {
              void refetchDetail();
            }
          }}
          className="mt-4 rounded-lg bg-emerald-600 px-5 py-2.5 text-[17px] font-medium text-white transition hover:bg-emerald-700"
        >
          ព្យាយាមម្តងទៀត
        </button>
      </DashboardState>
    );
  }

  /* ------------------------------------------------------------------ */
  /* No default profile → show premium CTA to create one                */
  /* ------------------------------------------------------------------ */

  if (!defaultProfileSummary) {
    return (
      <>
        <div className="mx-auto container max-w-7xl">
          {/* Hero CTA card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#136C34] via-[#1a8b42] to-[#0d5429] p-8 shadow-xl sm:p-12">
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/5" />

            <div className="relative z-10 flex flex-col items-center gap-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-4 ring-white/20">
                <UserRound className="h-10 w-10 text-white" />
              </div>

              <div>
                <h2 className="text-[28px] font-bold text-white sm:text-[36px]">
                  សូមស្វាគមន៍មកកាន់ FoodHub!
                </h2>
                <p className="mx-auto mt-3 max-w-md text-[17px] leading-7 text-emerald-100">
                  ចាប់ផ្តើមដំណើររបស់អ្នកដោយបង្កើតគណនីមូលដ្ឋានរបស់អ្នក។ FoodHub
                  នឹងប្រើព័ត៌មាននេះដើម្បីណែនាំអាហារដែលស័ក្តិសមបំផុត សម្រាប់អ្នក។
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4 text-[15px] text-emerald-200">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  ការណែនាំអាហារផ្ទាល់ខ្លួន
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  ការគ្រប់គ្រងស្ថានភាពអាឡែស៊ី
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  ប្រវត្តិការបញ្ជាទិញ
                </div>
              </div>

              <button
                type="button"
                onClick={() => openCreateModal(true)}
                className="inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-[18px] font-bold text-[#136C34] shadow-lg transition hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
              >
                <Plus className="h-6 w-6" />
                បង្កើតគណនីរបស់ខ្ញុំ
              </button>
            </div>
          </div>

          {/* Features grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: "🍜",
                title: "ណែនាំអាហារ",
                desc: "ទទួលការណែនាំអាហារដែលត្រូវនឹងតម្រូវការសុខភាពរបស់អ្នក",
              },
              {
                icon: "👨‍👩‍👧",
                title: "ប្រវត្តិរូបគ្រួសារ",
                desc: "បង្កើតប្រវត្តិរូបសម្រាប់សមាជិកគ្រួសារទាំងអស់",
              },
              {
                icon: "🛡️",
                title: "ការប្រុងប្រយ័ត្នសុខភាព",
                desc: "ចុះឈ្មោះអាឡែស៊ី និងស្ថានភាពវេជ្ជសាស្ត្ររបស់អ្នក",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 text-[32px]">{feature.icon}</div>
                <p className="text-[17px] font-bold text-slate-800">
                  {feature.title}
                </p>
                <p className="mt-1 text-[15px] leading-6 text-slate-500">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <CreateMemberProfileModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          forceDefault={createAsDefault}
        />
      </>
    );
  }

  if (!profile) {
    return (
      <DashboardState
        title="មិនអាចបង្ហាញព័ត៌មានលម្អិតបាន"
        description="រកឃើញ profile លំនាំដើម ប៉ុន្តែមិនទទួលបានព័ត៌មានលម្អិតពី API។"
      />
    );
  }

  const age = calculateAge(profile.dateOfBirth);
  const memberSinceDays = calculateMemberSinceDays(profile.createdAt);

  const allergies = profile.allergies ?? [];
  const dietaryTypes = profile.dietaryTypes ?? [];
  const medicalConditions = profile.medicalConditions ?? [];
  const ingredientAvoids = profile.ingredientAvoids ?? [];

  const preferenceCount =
    allergies.length +
    dietaryTypes.length +
    medicalConditions.length +
    ingredientAvoids.length;

  return (
    <>
      <div className="mx-auto max-w-7xl p-4">
        {/* ------------------------------------------------------------------ */}
        {/* Profile banner                                                      */}
        {/* ------------------------------------------------------------------ */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative h-20 bg-gradient-to-r from-primary-100 to-primary-200 sm:h-32" />

          <div className="relative px-4 pb-5 sm:px-6 sm:pb-6">
            <div className="-mt-8 flex flex-col gap-4 sm:-mt-10 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-end gap-3 sm:gap-4">
                {/* ---- Avatar with upload overlay ---- */}
                <AvatarUpload
                  profileUuid={profile.uuid}
                  avatarMediaUuid={profile.avatarMediaUuid}
                  profileName={profile.profileName}
                  onRefresh={() => void refetchDetail()}
                />

                <div className="min-w-0 pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[22px] font-bold text-slate-800 sm:text-[34px]">
                      {profile.profileName}
                    </p>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-[15px] font-semibold text-emerald-700">
                      <Crown className="h-3.5 w-3.5" />
                      លំនាំដើម
                    </span>
                  </div>

                  <p className="mt-1 truncate text-[17px] text-slate-500">
                    {relationshipLabels[profile.relationship]}
                    {" • "}
                    {getLanguageLabel(profile.preferredLanguage)}
                  </p>
                </div>
              </div>

              <Link
                href={`/dashboard/family-profile/${profile.uuid}?mode=edit`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-[17px] font-medium text-slate-600 transition hover:bg-slate-50 sm:mt-2 sm:w-auto"
              >
                <Pencil className="text-[17px]" />
                កែប្រែព័ត៌មាន
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
              <StatCard
                label="សមាជិក"
                value={memberSinceDays}
                sublabel="ថ្ងៃជាសមាជិក"
              />

              <StatCard
                label="អាយុ"
                value={age}
                sublabel="ឆ្នាំ"
                accent="text-emerald-600"
              />

              <StatCard
                label="ការកំណត់"
                value={preferenceCount}
                sublabel="សុខភាព និងអាហារ"
              />
            </div>

            {isFetching && (
              <p className="mt-3 text-right text-[17px] text-slate-400">
                កំពុងធ្វើបច្ចុប្បន្នភាព...
              </p>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Personal info                                                      */}
        {/* ------------------------------------------------------------------ */}

        <SectionCard
          icon={<FaRegUser />}
          title="ព័ត៌មានផ្ទាល់ខ្លួន"
          className="mt-4 sm:mt-5"
        >
          <div className="flex flex-wrap gap-3">
            <ProfileInfoTag
              label="ទំនាក់ទំនង"
              value={relationshipLabels[profile.relationship]}
            />

            <ProfileInfoTag label="ភេទ" value={genderLabels[profile.gender]} />

            <ProfileInfoTag
              label="ថ្ងៃខែឆ្នាំកំណើត"
              value={formatDate(profile.dateOfBirth)}
            />

            <ProfileInfoTag
              label="ក្រុមអាយុ"
              value={profile.ageGroup?.name ?? "មិនបានបញ្ជាក់"}
            />

            <ProfileInfoTag
              label="ភាសា"
              value={getLanguageLabel(profile.preferredLanguage)}
            />

            <ProfileInfoTag
              label="បានកែប្រែ"
              value={formatDate(profile.updatedAt)}
            />
          </div>
        </SectionCard>

        {/* ------------------------------------------------------------------ */}
        {/* Medical conditions                                                  */}
        {/* ------------------------------------------------------------------ */}

        <SectionCard
          icon={<RiShieldCheckLine />}
          title="ស្ថានភាពសុខភាព"
          className="mt-4 sm:mt-5"
        >
          {medicalConditions.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {medicalConditions.map((condition, index) => {
                const name =
                  getString(condition, "conditionName", "name") ??
                  medicalLabelMap.get(condition.conditionCode) ??
                  condition.conditionCode;

                return (
                  <DetailedSafetyTag
                    key={`${condition.conditionCode}-${index}`}
                    name={name}
                    variant="blue"
                    details={[
                      severityLabels[condition.severity],
                      condition.notes,
                    ]}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyValue text="មិនមានព័ត៌មានសុខភាព។" />
          )}

          <div className="mt-4 flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-[17px] leading-7 text-emerald-700">
            <RiShieldCheckLine className="mt-1 shrink-0 text-[19px]" />
            FoodHub នឹងប្រើព័ត៌មានសុខភាពរបស់ profile លំនាំដើមនេះ
            សម្រាប់ការណែនាំអាហារ។
          </div>
        </SectionCard>

        {/* ------------------------------------------------------------------ */}
        {/* Dietary + Allergies                                                 */}
        {/* ------------------------------------------------------------------ */}

        <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 md:grid-cols-2">
          <SectionCard icon={<FaUtensils />} title="ចំណូលចិត្តផ្នែកអាហារ">
            {dietaryTypes.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {dietaryTypes.map((dietaryType, index) => {
                  const name =
                    getString(dietaryType, "dietaryTypeName", "name") ??
                    dietaryLabelMap.get(dietaryType.dietaryTypeCode) ??
                    dietaryType.dietaryTypeCode;

                  return (
                    <DetailedSafetyTag
                      key={`${dietaryType.dietaryTypeCode}-${index}`}
                      name={name}
                      variant="emerald"
                      details={[
                        dietaryLevelLabels[dietaryType.enforcementLevel],
                        `អាទិភាព ${dietaryType.priority}`,
                        dietaryType.notes,
                      ]}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyValue text="មិនមានរបបអាហារដែលបានកំណត់។" />
            )}
          </SectionCard>

          <SectionCard icon={<FiAlertTriangle />} title="អាឡែស៊ីនិងអាហារ">
            {allergies.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-3">
                  {allergies.map((allergy, index) => {
                    const name =
                      getString(allergy, "allergenName", "name") ??
                      allergenLabelMap.get(allergy.allergenCode) ??
                      allergy.allergenCode;

                    return (
                      <DetailedSafetyTag
                        key={`${allergy.allergenCode}-${index}`}
                        name={name}
                        variant="red"
                        details={[
                          severityLabels[allergy.severity],
                          allergy.avoidCrossContact
                            ? "ជៀសវាងការប៉ះពាល់ឆ្លង"
                            : null,
                          allergy.medicallyDiagnosed
                            ? "វិនិច្ឆ័យដោយវេជ្ជបណ្ឌិត"
                            : null,
                          allergy.reactionNotes,
                        ]}
                      />
                    );
                  })}
                </div>

                <p className="mt-4 flex items-start gap-2 text-[17px] leading-7 text-orange-600">
                  <FiAlertTriangle className="mt-1 shrink-0 text-[19px]" />
                  សារធាតុទាំងនេះនឹងត្រូវបានពិចារណាក្នុងការណែនាំអាហារ។
                </p>
              </>
            ) : (
              <EmptyValue text="មិនមានព័ត៌មានអាឡែស៊ី។" />
            )}
          </SectionCard>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Multi-profile section                                               */}
        {/* ------------------------------------------------------------------ */}

        <section className="mt-4 sm:mt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[19px] text-emerald-600">
                <Users className="h-5 w-5" />
              </span>
              <p className="text-[20px] font-semibold sm:text-[24px]">
                ប្រវត្តិរូបគ្រួសារ
              </p>
            </div>

            <button
              type="button"
              onClick={() => openCreateModal(false)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              បន្ថែម
            </button>
          </div>

          {otherProfiles.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherProfiles.map((memberProfile) => (
                <ProfileCard
                  key={memberProfile.uuid}
                  profile={memberProfile}
                  onRefetch={() => void refetchProfiles()}
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <Users className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-[17px] font-medium text-slate-500">
                មិនទាន់មានប្រវត្តិរូបគ្រួសារ
              </p>
              <p className="mt-1 text-[15px] text-slate-400">
                ចុចប៊ូតុង "បន្ថែម" ដើម្បីបង្កើតប្រវត្តិរូបថ្មី
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Create profile modal — works for both default and multi-profile */}
      <CreateMemberProfileModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        forceDefault={createAsDefault}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                              PROFILE CARD (non-default)                    */
/* -------------------------------------------------------------------------- */

interface ProfileCardProps {
  profile: MemberProfile;
  onRefetch: () => void;
}

function ProfileCard({ profile, onRefetch }: ProfileCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-4">
        {/* Avatar with upload */}
        <AvatarUpload
          profileUuid={profile.uuid}
          avatarMediaUuid={profile.avatarMediaUuid}
          profileName={profile.profileName}
          onRefresh={onRefetch}
          size="sm"
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-[17px] font-bold text-slate-800">
            {profile.profileName}
          </p>
          <p className="mt-0.5 text-[14px] text-slate-500">
            {relationshipLabels[profile.relationship as MemberRelationship]}
          </p>
        </div>

        <Link
          href={`/dashboard/family-profile/${profile.uuid}?mode=edit`}
          className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          title="កែប្រែ"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             AVATAR UPLOAD                                  */
/* -------------------------------------------------------------------------- */

interface AvatarUploadProps {
  profileUuid: string;
  avatarMediaUuid: string | null;
  profileName: string;
  onRefresh: () => void;
  size?: "sm" | "md";
}

function AvatarUpload({
  profileUuid,
  avatarMediaUuid,
  profileName,
  onRefresh,
  size = "md",
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateMemberProfileMutation();

  /* Fetch the CDN URL for the current avatar */
  const { data: accessUrlData } = useGetMediaAccessUrlQuery(
    avatarMediaUuid ?? "",
    { skip: !avatarMediaUuid },
  );

  const isProcessing = isUploading || isUpdating;

  const sizeClasses =
    size === "sm"
      ? "h-12 w-12 sm:h-14 sm:w-14 rounded-xl border-2"
      : "h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-4";

  const textSizeClass =
    size === "sm" ? "text-[16px] sm:text-[18px]" : "text-[20px] sm:text-[26px]";

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    /* Reset the input so the same file can be re-selected */
    event.target.value = "";

    if (!file) return;

    /* Basic client-side validation */
    if (!file.type.startsWith("image/")) {
      setUploadError("សូមជ្រើសរើសរូបភាពប្រភេទ JPG, PNG ឬ WebP");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("ទំហំឯកសារមិនត្រូវលើសពី 5 MB");
      return;
    }

    setUploadError(null);

    try {
      /* 1. Upload the file to the media service */
      const mediaResult = await uploadMedia({
        file,
        purpose: "PROFILE_AVATAR",
      }).unwrap();

      /* 2. Patch the profile with the new avatar UUID */
      await updateProfile({
        uuid: profileUuid,
        body: { avatarMediaUuid: mediaResult.uuid },
      }).unwrap();

      /* 3. Re-fetch the profile so the new URL is picked up */
      onRefresh();
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "data" in err) {
        const data = (err as { data?: { message?: string } }).data;
        setUploadError(
          data?.message ?? "មិនអាចផ្ទុករូបភាពបានទេ។ សូមព្យាយាមមើលទៀត។",
        );
      } else if (err instanceof Error) {
        setUploadError(err.message);
      } else {
        setUploadError("មិនអាចផ្ទុករូបភាពបានទេ។ សូមព្យាយាមមើលទៀត។");
      }
    }
  };

  const initials = getInitials(profileName);

  return (
    <div className="shrink-0">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id={`avatar-input-${profileUuid}`}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => void handleFileChange(e)}
        disabled={isProcessing}
      />

      {/* Avatar circle */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        title="ផ្លាស់ប្ដូររូបតំណាង"
        aria-label="ផ្លាស់ប្ដូររូបតំណាង"
        className={`group relative flex shrink-0 items-center justify-center overflow-hidden border-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-70 ${sizeClasses}`}
      >
        {/* Photo or initials background */}
        {accessUrlData?.url ? (
          <Image
            src={accessUrlData.url}
            alt={profileName}
            fill
            className="object-cover"
            sizes={size === "sm" ? "56px" : "80px"}
          />
        ) : (
          <span
            className={`flex h-full w-full items-center justify-center bg-[#136C34] font-bold text-white ${textSizeClass}`}
          >
            {initials}
          </span>
        )}

        {/* Spinner overlay while uploading */}
        {isProcessing && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50">
            <LoaderCircle className="h-6 w-6 animate-spin text-white" />
          </span>
        )}

        {/* Camera hover overlay */}
        {!isProcessing && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <IoCameraOutline className="text-[22px] text-white" />
            {size === "md" && (
              <span className="text-[10px] font-semibold text-white">
                ផ្លាស់ប្ដូរ
              </span>
            )}
          </span>
        )}
      </button>

      {/* Inline upload error */}
      {uploadError && (
        <p className="mt-1.5 max-w-[140px] text-center text-[13px] leading-5 text-red-600">
          {uploadError}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              UI COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

function StatCard({
  label,
  value,
  sublabel,
  accent = "text-slate-800",
}: {
  label: string;
  value: number | string;
  sublabel: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
      <p className="text-[17px] text-slate-500">{label}</p>

      <p className={`text-[22px] font-bold sm:text-[26px] ${accent}`}>
        {value}
      </p>

      <p className="truncate text-[17px] text-slate-400">{sublabel}</p>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  children,
  className = "",
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 ${className}`}
    >
      <div className="mb-4 flex items-center gap-3 text-slate-800">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[19px] text-emerald-600">
          {icon}
        </span>

        <p className="text-[20px] font-semibold sm:text-[24px]">{title}</p>
      </div>

      {children}
    </section>
  );
}

function ProfileInfoTag({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5">
      <span className="text-[17px] font-medium text-slate-500">{label}</span>

      <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />

      <span className="text-[17px] font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function DetailedSafetyTag({
  name,
  details,
  variant,
}: {
  name: string;
  details: Array<string | null | undefined>;
  variant: "red" | "emerald" | "blue" | "orange";
}) {
  const styles = {
    red: {
      wrapper: "border-red-200 bg-red-50 text-red-700",
      detail: "border-red-100 bg-white/80 text-red-700",
    },
    emerald: {
      wrapper: "border-emerald-200 bg-emerald-50 text-emerald-700",
      detail: "border-emerald-100 bg-white/80 text-emerald-700",
    },
    blue: {
      wrapper: "border-blue-200 bg-blue-50 text-blue-700",
      detail: "border-blue-100 bg-white/80 text-blue-700",
    },
    orange: {
      wrapper: "border-orange-200 bg-orange-50 text-orange-700",
      detail: "border-orange-100 bg-white/80 text-orange-700",
    },
  };

  const visibleDetails = details.filter(
    (detail): detail is string =>
      typeof detail === "string" && detail.trim().length > 0,
  );

  return (
    <div
      className={`inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border px-4 py-2.5 ${styles[variant].wrapper}`}
    >
      <span className="text-[17px] font-semibold">{name}</span>
    </div>
  );
}

function EmptyValue({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-[17px] text-slate-500">
      {text}
    </p>
  );
}

function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 ">
      <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-20 bg-slate-100 sm:h-32" />

        <div className="px-4 pb-5 sm:px-6">
          <div className="-mt-8 flex items-end gap-3 sm:-mt-10">
            <div className="h-16 w-16 rounded-2xl bg-slate-200 sm:h-20 sm:w-20" />

            <div className="space-y-2 pb-1">
              <div className="h-7 w-48 rounded bg-slate-200" />
              <div className="h-4 w-32 rounded bg-slate-100" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-24 rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
      </div>

      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="mt-5 h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}

function DashboardState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl  py-4 ">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-[20px] text-emerald-600">
          <FaRegUser />
        </div>

        <h2 className="mt-4 text-[22px] font-bold text-slate-800">{title}</h2>

        <p className="mx-auto mt-2 max-w-lg text-[17px] leading-7 text-slate-500">
          {description}
        </p>

        {children}
      </div>
    </div>
  );
}
