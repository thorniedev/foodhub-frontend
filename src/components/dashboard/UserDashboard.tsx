"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useMemo, type ReactNode } from "react";
import { IoCameraOutline } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import { FiAlertTriangle } from "react-icons/fi";
import {
  Ban,
  Cake,
  CalendarDays,
  ChevronRight,
  Crown,
  HeartPulse,
  Languages,
  LoaderCircle,
  Pencil,
  Plus,
  Salad,
  Sparkles,
  UserPlus,
  UserRound,
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
          className="mt-4 rounded-lg bg-emerald-600 px-5 py-2.5 text-[17px] font-medium text-white transition lg:text-lg hover:bg-emerald-700"
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
          {/* Empty-profile CTA — flat, no gradient */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 text-primary-800 ring-1 ring-primary-100">
              <UserRound className="h-10 w-10" />
            </div>

            <div className="mt-5">
              <p className="text-[28px] font-bold text-slate-900 sm:text-[36px]">
                សូមស្វាគមន៍មកកាន់ FoodHub!
              </p>
              <p className="mx-auto mt-3 max-w-md text-[17px] leading-7 text-slate-500 lg:text-lg">
                ចាប់ផ្តើមដោយបង្កើតប្រវត្តិរូបរបស់អ្នក។ FoodHub នឹងប្រើព័ត៌មាននេះ
                ដើម្បីណែនាំអាហារដែលស័ក្តិសមសម្រាប់អ្នក។
              </p>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[15px] text-slate-600 lg:text-lg">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary-700" />
                ការណែនាំអាហារផ្ទាល់ខ្លួន
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary-700" />
                ការគ្រប់គ្រងស្ថានភាពអាឡែស៊ី
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary-700" />
                ប្រវត្តិរូបគ្រួសារ
              </div>
            </div>

            <button
              type="button"
              onClick={() => openCreateModal(true)}
              className="mt-6 inline-flex items-center gap-3 rounded-full bg-primary-800 px-7 py-3.5 text-[17px] font-semibold text-white shadow-sm transition lg:text-lg hover:bg-primary-900 active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" />
              បង្កើតប្រវត្តិរូបរបស់ខ្ញុំ
            </button>
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
                <p className="text-[17px] font-bold text-slate-800 lg:text-xl">
                  {feature.title}
                </p>
                <p className="mt-1 text-[15px] leading-6 text-slate-500 lg:text-lg">
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

  const familyProfileCount = profilesResponse?.contents.length ?? 1;

  return (
    <>
      <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-4 lg:px-5 lg:py-5 xl:px-6">
        {/* ------------------------------------------------------------------ */}
        {/* Profile header                                                     */}
        {/* ------------------------------------------------------------------ */}

        <section className="rounded-3xl border border-slate-200/80 bg-white px-4 pb-0 pt-5 shadow-xs sm:px-6 sm:pt-6 lg:px-7 lg:pt-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between lg:gap-6">
            <div className="flex min-w-0 items-center gap-4 sm:gap-5 lg:gap-6">
              <AvatarUpload
                profileUuid={profile.uuid}
                avatarMediaUuid={profile.avatarMediaUuid}
                profileName={profile.profileName}
                onRefresh={() => void refetchDetail()}
              />

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                  <p className="truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                    {profile.profileName}
                  </p>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary-200 bg-secondary-50 px-2.5 py-1 text-sm font-semibold text-secondary-600 lg:px-3 lg:py-1.5 lg:text-lg">
                    <Crown className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    លំនាំដើម
                  </span>
                </div>

                <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-base text-slate-500 lg:mt-2 lg:text-lg">
                  <span>{relationshipLabels[profile.relationship]}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  {/* <span>{getLanguageLabel(profile.preferredLanguage)}</span> */}
                </p>
              </div>
            </div>

            <Link
              href={`/dashboard/family-profile/${profile.uuid}?mode=edit`}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-base font-semibold text-slate-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 active:scale-[0.98] sm:w-auto lg:min-h-12 lg:px-6 lg:text-lg"
            >
              <Pencil className="h-4 w-4 lg:h-5 lg:w-5" />
              កែប្រែប្រវត្តិរូប
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-100 py-3.5 lg:mt-7 lg:py-4">
            <SocialStat value={age} label="អាយុ" suffix="ឆ្នាំ" />
            <SocialStat value={preferenceCount} label="ការកំណត់" />
            <SocialStat value={familyProfileCount} label="ប្រវត្តិរូប" />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto py-2.5 lg:gap-2 lg:py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ProfileAnchor href="#profile-about" label="អំពី" />
            <ProfileAnchor href="#profile-health" label="សុខភាព" />
            <ProfileAnchor href="#profile-food" label="ចំណូលចិត្តអាហារ" />
            <ProfileAnchor href="#profile-family" label="គ្រួសារ" />
          </div>

          {isFetching && (
            <p className="pb-3 text-right text-sm text-slate-400 lg:text-lg">
              កំពុងធ្វើបច្ចុប្បន្នភាព...
            </p>
          )}
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* About: full-width so desktop space is used efficiently             */}
        {/* ------------------------------------------------------------------ */}

        <SectionCard
          id="profile-about"
          icon={<FaRegUser />}
          title="អំពីខ្ញុំ"
          description="ព័ត៌មានមូលដ្ឋានរបស់ប្រវត្តិរូបនេះ"
          className="mt-4 lg:mt-5"
        >
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 lg:gap-3 xl:grid-cols-6">
            <ProfileInfoRow
              icon={<UserRound className="h-5 w-5" />}
              label="ទំនាក់ទំនង"
              value={relationshipLabels[profile.relationship]}
            />
            <ProfileInfoRow
              icon={<FaRegUser className="text-[18px]" />}
              label="ភេទ"
              value={genderLabels[profile.gender]}
            />
            <ProfileInfoRow
              icon={<Cake className="h-5 w-5" />}
              label="ថ្ងៃខែឆ្នាំកំណើត"
              value={formatDate(profile.dateOfBirth)}
            />
            <ProfileInfoRow
              icon={<CalendarDays className="h-5 w-5" />}
              label="ក្រុមអាយុ"
              value={profile.ageGroup?.name ?? "មិនបានបញ្ជាក់"}
            />
            <ProfileInfoRow
              icon={<Languages className="h-5 w-5" />}
              label="ភាសា"
              value={getLanguageLabel(profile.preferredLanguage)}
            />

            <div className="flex min-h-[88px] items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3 lg:min-h-[104px] lg:px-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary-700 shadow-sm lg:h-11 lg:w-11">
                <CalendarDays className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500 lg:text-lg">
                  សមាជិក FoodHub
                </p>
                <p className="mt-0.5 text-base font-bold text-slate-800 lg:text-xl">
                  {memberSinceDays} ថ្ងៃ
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-400 lg:text-lg">
                  កែប្រែ {formatDate(profile.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ------------------------------------------------------------------ */}
        {/* Health and preferences                                             */}
        {/* ------------------------------------------------------------------ */}

        <div className="mt-4 grid gap-4 lg:mt-5 lg:grid-cols-2 lg:gap-5">
          <SectionCard
            id="profile-health"
            icon={<HeartPulse className="h-5 w-5" />}
            title="ស្ថានភាពសុខភាព"
            description="FoodHub ប្រើព័ត៌មាននេះដើម្បីជួយតម្រង និងណែនាំអាហារ"
            className="lg:col-span-2"
          >
            {medicalConditions.length > 0 ? (
              <div className="flex flex-wrap gap-2.5 lg:gap-3">
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

            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-base leading-7 text-emerald-800 lg:mt-5 lg:p-5 lg:text-lg lg:leading-8">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm lg:h-10 lg:w-10">
                <Sparkles className="h-4 w-4 lg:h-5 lg:w-5" />
              </span>
              <p>
                ប្រវត្តិរូបលំនាំដើមនេះត្រូវបានប្រើសម្រាប់ការណែនាំអាហារផ្ទាល់ខ្លួនរបស់អ្នក។
              </p>
            </div>
          </SectionCard>

          <SectionCard
            id="profile-food"
            icon={<Salad className="h-5 w-5" />}
            title="របប និងចំណូលចិត្តអាហារ"
            description="អ្វីដែលអ្នកចូលចិត្ត ឬត្រូវការជាប្រចាំ"
          >
            {dietaryTypes.length > 0 ? (
              <div className="flex flex-wrap gap-2.5 lg:gap-3">
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

          <SectionCard
            icon={<FiAlertTriangle className="text-[19px]" />}
            title="អាឡែស៊ី"
            description="សារធាតុដែល FoodHub ត្រូវប្រុងប្រយ័ត្ន"
          >
            {allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2.5 lg:gap-3">
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
                        allergy.medicallyDiagnosed ? "បានវិនិច្ឆ័យ" : null,
                        allergy.reactionNotes,
                      ]}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyValue text="មិនមានព័ត៌មានអាឡែស៊ី។" />
            )}
          </SectionCard>

          <SectionCard
            icon={<Ban className="h-5 w-5" />}
            title="គ្រឿងផ្សំដែលចង់ជៀសវាង"
            description="FoodHub នឹងកាត់បន្ថយ ឬរារាំងអាហារដែលមានគ្រឿងផ្សំទាំងនេះ"
            className="lg:col-span-2"
          >
            {ingredientAvoids.length > 0 ? (
              <div className="flex flex-wrap gap-2.5 lg:gap-3">
                {ingredientAvoids.map((ingredientAvoid, index) => {
                  const code =
                    getString(ingredientAvoid, "ingredientCode", "code") ??
                    `ingredient-${index}`;
                  const name =
                    getString(
                      ingredientAvoid,
                      "ingredientName",
                      "name",
                      "localName",
                    ) ?? code;
                  const level = getString(
                    ingredientAvoid,
                    "avoidLevel",
                    "level",
                    "enforcementLevel",
                  );
                  const levelLabel =
                    level && level in ingredientAvoidLevelLabels
                      ? ingredientAvoidLevelLabels[
                          level as keyof typeof ingredientAvoidLevelLabels
                        ]
                      : level;

                  return (
                    <DetailedSafetyTag
                      key={`${code}-${index}`}
                      name={name}
                      variant="orange"
                      details={[
                        levelLabel,
                        getString(ingredientAvoid, "notes", "reason"),
                      ]}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyValue text="មិនមានគ្រឿងផ្សំដែលបានកំណត់ឱ្យជៀសវាង។" />
            )}
          </SectionCard>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Family profiles                                                    */}
        {/* ------------------------------------------------------------------ */}

        <section
          id="profile-family"
          className="mt-4 scroll-mt-24 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.05)] sm:p-6 lg:mt-5 lg:p-7"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 lg:gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 lg:h-12 lg:w-12">
                <Users className="h-5 w-5 lg:h-6 lg:w-6" />
              </span>

              <div>
                <p className="text-xl font-bold text-slate-900 sm:text-2xl lg:text-2xl">
                  ប្រវត្តិរូបគ្រួសារ
                </p>
                <p className="mt-0.5 text-sm text-slate-500 sm:text-base lg:text-lg">
                  គ្រប់គ្រងមនុស្សដែលអ្នកចង់ទទួលការណែនាំអាហារជូន
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openCreateModal(false)}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary-800 px-5 py-2.5 text-base font-semibold text-white shadow-sm transition hover:bg-primary-900 active:scale-[0.98] sm:w-auto lg:min-h-12 lg:px-6 lg:text-lg"
            >
              <UserPlus className="h-[18px] w-[18px] lg:h-5 lg:w-5" />
              បន្ថែមសមាជិក
            </button>
          </div>

          {otherProfiles.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:mt-6 lg:gap-4 xl:grid-cols-3">
              {otherProfiles.map((memberProfile) => (
                <ProfileCard
                  key={memberProfile.uuid}
                  profile={memberProfile}
                  onRefetch={() => void refetchProfiles()}
                />
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openCreateModal(false)}
              className="mt-5 flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-primary-300 hover:bg-primary-50/50 lg:mt-6"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary-700 shadow-sm lg:h-14 lg:w-14">
                <UserPlus className="h-5 w-5 lg:h-6 lg:w-6" />
              </span>
              <p className="mt-3 text-base font-semibold text-slate-700 lg:text-lg">
                បន្ថែមប្រវត្តិរូបគ្រួសារដំបូង
              </p>
              <p className="mt-1 text-sm text-slate-500 lg:text-lg">
                អ្នកអាចកំណត់អាឡែស៊ី របបអាហារ
                និងចំណូលចិត្តខុសៗគ្នាសម្រាប់មនុស្សម្នាក់ៗ។
              </p>
            </button>
          )}
        </section>
      </div>

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
  const allergyCount = profile.allergies?.length ?? 0;
  const dietaryCount = profile.dietaryTypes?.length ?? 0;
  const medicalCount = profile.medicalConditions?.length ?? 0;

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] lg:p-5">
      <div className="flex items-center gap-3">
        <AvatarUpload
          profileUuid={profile.uuid}
          avatarMediaUuid={profile.avatarMediaUuid}
          profileName={profile.profileName}
          onRefresh={onRefetch}
          size="sm"
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-slate-900 lg:text-xl">
            {profile.profileName}
          </p>
          <p className="mt-0.5 truncate text-sm text-slate-500 lg:text-lg">
            {relationshipLabels[profile.relationship as MemberRelationship]}
          </p>
        </div>

        <Link
          href={`/dashboard/family-profile/${profile.uuid}?mode=edit`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-primary-50 hover:text-primary-700 lg:h-11 lg:w-11"
          title="កែប្រែ"
          aria-label={`កែប្រែ ${profile.profileName}`}
        >
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 lg:gap-3">
        <MiniProfileStat value={allergyCount} label="អាឡែស៊ី" tone="red" />
        <MiniProfileStat value={dietaryCount} label="របបអាហារ" tone="emerald" />
        <MiniProfileStat value={medicalCount} label="សុខភាព" tone="blue" />
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
      ? "h-14 w-14 rounded-full border-2"
      : "h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4";

  const textSizeClass =
    size === "sm" ? "text-lg lg:text-xl" : "text-2xl sm:text-3xl lg:text-4xl";

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
            sizes={size === "sm" ? "56px" : "112px"}
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

function SocialStat({
  value,
  label,
  suffix,
}: {
  value: number | string;
  label: string;
  suffix?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center justify-center px-2 text-center">
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-slate-900 sm:text-2xl lg:text-3xl">
          {value}
        </span>
        {suffix && (
          <span className="text-xs font-medium text-slate-400 lg:text-lg">
            {suffix}
          </span>
        )}
      </div>
      <span className="mt-0.5 truncate text-xs font-medium text-slate-500 sm:text-sm lg:text-lg">
        {label}
      </span>
    </div>
  );
}

function ProfileAnchor({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-primary-800 lg:px-5 lg:py-2.5 lg:text-lg"
    >
      {label}
    </a>
  );
}

function SectionCard({
  id,
  icon,
  title,
  description,
  children,
  className = "",
}: {
  id?: string;
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.045)] sm:p-5 lg:p-6 ${className}`}
    >
      <div className="mb-4 flex items-start gap-3 lg:mb-5 lg:gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 lg:h-12 lg:w-12">
          {icon}
        </span>

        <div className="min-w-0">
          <p className="text-lg font-bold text-primary-800 sm:text-xl lg:text-2xl">
            {title}
          </p>
          {description && (
            <p className="mt-0.5 text-sm leading-6 text-slate-500 lg:text-lg lg:leading-8">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

function ProfileInfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-[82px] items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-3 transition hover:border-primary-100 hover:bg-primary-50/40 lg:min-h-[104px] lg:px-4 lg:py-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm lg:h-11 lg:w-11">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400 lg:text-lg">{label}</p>
        <p className="mt-0.5 break-words text-sm font-semibold text-slate-700 sm:text-base lg:text-lg">
          {value}
        </p>
      </div>
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
      wrapper: "border-red-100 bg-red-50 text-red-700",
      dot: "bg-red-500",
      detail: "text-red-500",
    },
    emerald: {
      wrapper: "border-emerald-100 bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
      detail: "text-emerald-600",
    },
    blue: {
      wrapper: "border-blue-100 bg-blue-50 text-blue-700",
      dot: "bg-blue-500",
      detail: "text-blue-500",
    },
    orange: {
      wrapper: "border-orange-100 bg-orange-50 text-orange-700",
      dot: "bg-orange-500",
      detail: "text-orange-600",
    },
  };

  const visibleDetails = details.filter(
    (detail): detail is string =>
      typeof detail === "string" && detail.trim().length > 0,
  );

  return (
    <div
      className={`max-w-full rounded-2xl border px-3.5 py-2.5 lg:px-4 lg:py-3 ${styles[variant].wrapper}`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${styles[variant].dot}`}
        />
        <span className="break-words text-sm font-bold sm:text-base lg:text-lg">
          {name}
        </span>
      </div>

      {visibleDetails.length > 0 && (
        <div
          className={`mt-1 flex flex-wrap gap-x-2 gap-y-0.5 pl-4 text-xs font-medium lg:mt-2 lg:text-lg ${styles[variant].detail}`}
        >
          {visibleDetails.map((detail, index) => (
            <span key={`${detail}-${index}`}>
              {index > 0 && <span className="mr-2 opacity-40">•</span>}
              {detail}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniProfileStat({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "red" | "emerald" | "blue";
}) {
  const toneClass = {
    red: "bg-red-50 text-red-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
  }[tone];

  return (
    <div
      className={`rounded-xl px-2 py-2.5 text-center lg:px-3 lg:py-3 ${toneClass}`}
    >
      <p className="text-base font-bold lg:text-xl">{value}</p>
      <p className="mt-0.5 truncate text-[11px] font-medium opacity-80 lg:text-lg">
        {label}
      </p>
    </div>
  );
}

function EmptyValue({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-500 lg:px-5 lg:py-5 lg:text-lg">
      {text}
    </p>
  );
}

function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-4 lg:px-5 lg:py-5 xl:px-6">
      {/* Profile Header Skeleton */}
      <div className="animate-pulse rounded-3xl border border-slate-200/80 bg-white px-4 pb-0 pt-5 shadow-xs sm:px-6 sm:pt-6 lg:px-7 lg:pt-7">
        
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between lg:gap-6">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5 lg:gap-6">
            <div className="h-20 w-20 shrink-0 rounded-full bg-slate-200 lg:h-24 lg:w-24" />
            
            <div className="space-y-3">
              <div className="h-8 w-48 rounded-lg bg-slate-200 sm:w-64 lg:h-10 lg:w-80" />
              <div className="h-4 w-32 rounded-md bg-slate-100 sm:w-40 lg:h-5 lg:w-56" />
            </div>
          </div>
          
          <div className="h-11 w-full rounded-full bg-slate-200 sm:w-36 lg:h-12 lg:w-44" />
        </div>

        <div className="mt-6 grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-100 py-3.5 lg:mt-7 lg:py-4">
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex flex-col items-center justify-center space-y-2">
              <div className="h-7 w-12 rounded-md bg-slate-200 lg:h-8 lg:w-16" />
              <div className="h-4 w-16 rounded-md bg-slate-100 lg:w-20" />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 py-2.5 lg:py-3">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-9 w-20 rounded-full bg-slate-100 lg:h-10 lg:w-24" />
          ))}
        </div>
      </div>

      {/* Sections Skeletons */}
      <div className="mt-6 flex flex-col gap-5 lg:gap-6">
        <div className="h-64 animate-pulse rounded-3xl border border-slate-200/80 bg-white shadow-xs lg:h-72" />
        <div className="h-96 animate-pulse rounded-3xl border border-slate-200/80 bg-white shadow-xs lg:h-[420px]" />
      </div>
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
    <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-4 lg:px-5 xl:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-[20px] text-emerald-600">
          <FaRegUser />
        </div>

        <p className="mt-4 text-[22px] font-bold text-slate-800">{title}</p>

        <p className="mx-auto mt-2 max-w-lg text-[17px] leading-7 text-slate-500 lg:text-lg">
          {description}
        </p>

        {children}
      </div>
    </div>
  );
}

// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { useRef, useState, useMemo, type ReactNode } from "react";
// import { IoCameraOutline } from "react-icons/io5";
// import { FaRegStar, FaRegUser, FaUtensils } from "react-icons/fa";
// import { RiShieldCheckLine } from "react-icons/ri";
// import { FiAlertTriangle } from "react-icons/fi";
// import {
//   LoaderCircle,
//   Plus,
//   UserRound,
//   Pencil,
//   Crown,
//   Users,
// } from "lucide-react";

// import {
//   useGetAllergenOptionsQuery,
//   useGetDietaryTypeOptionsQuery,
//   useGetMedicalConditionOptionsQuery,
//   useGetMemberProfileByIdQuery,
//   useGetMemberProfilesQuery,
//   useUploadMediaMutation,
//   useUpdateMemberProfileMutation,
//   useGetMediaAccessUrlQuery,
// } from "@/app/store/memberProfileApi";

// import type {
//   MemberGender,
//   MemberProfile,
//   MemberRelationship,
//   SafetyOption,
// } from "@/types/member-profile/member-profile";

// import CreateMemberProfileModal from "@/app/(dashboard)/dashboard/CreateMemberProfileModal";

// /* -------------------------------------------------------------------------- */
// /*                                   LABELS                                   */
// /* -------------------------------------------------------------------------- */

// const relationshipLabels: Record<MemberRelationship, string> = {
//   SELF: "ខ្លួនឯង",
//   PARENT: "ឪពុកម្តាយ",
//   SPOUSE: "ប្តី ឬប្រពន្ធ",
//   CHILD: "កូន",
//   SIBLING: "បងប្អូន",
//   GRANDPARENT: "ជីដូនជីតា",
//   OTHER: "ផ្សេងៗ",
// };

// const genderLabels: Record<MemberGender, string> = {
//   MALE: "ប្រុស",
//   FEMALE: "ស្រី",
//   OTHER: "ផ្សេងៗ",
//   PREFER_NOT_TO_SAY: "មិនចង់បញ្ជាក់",
// };

// const severityLabels = {
//   MILD: "ស្រាល",
//   MODERATE: "មធ្យម",
//   SEVERE: "ធ្ងន់",
// } as const;

// const dietaryLevelLabels = {
//   PREFERRED: "ចូលចិត្ត",
//   REQUIRED: "ត្រូវតែគោរព",
// } as const;

// const ingredientAvoidLevelLabels = {
//   PREFERENCE: "ចូលចិត្តជៀសវាង",
//   STRICT_BLOCK: "ហាមដាច់ខាត",
// } as const;

// type UnknownRecord = Record<string, unknown>;

// /* -------------------------------------------------------------------------- */
// /*                                   HELPERS                                  */
// /* -------------------------------------------------------------------------- */

// function asRecord(value: unknown): UnknownRecord | null {
//   if (typeof value === "object" && value !== null && !Array.isArray(value)) {
//     return value as UnknownRecord;
//   }

//   return null;
// }

// function getString(value: unknown, ...keys: string[]): string | null {
//   const record = asRecord(value);

//   if (!record) {
//     return null;
//   }

//   for (const key of keys) {
//     const currentValue = record[key];

//     if (typeof currentValue === "string" && currentValue.trim()) {
//       return currentValue;
//     }
//   }

//   return null;
// }

// function calculateAge(dateOfBirth: string): number {
//   const [year, month, day] = dateOfBirth.split("-").map(Number);

//   if (!year || !month || !day) {
//     return 0;
//   }

//   const today = new Date();
//   let age = today.getFullYear() - year;

//   const birthdayPassed =
//     today.getMonth() + 1 > month ||
//     (today.getMonth() + 1 === month && today.getDate() >= day);

//   if (!birthdayPassed) {
//     age -= 1;
//   }

//   return Math.max(age, 0);
// }

// function calculateMemberSinceDays(createdAt: string): number {
//   const createdDate = new Date(createdAt);

//   if (Number.isNaN(createdDate.getTime())) {
//     return 0;
//   }

//   return Math.max(
//     0,
//     Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)),
//   );
// }

// function formatDate(value: string): string {
//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) {
//     return value;
//   }

//   return new Intl.DateTimeFormat("km-KH-u-ca-gregory", {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   }).format(date);
// }

// function getLanguageLabel(language: string): string {
//   const normalized = language.trim().toLowerCase();

//   if (normalized.startsWith("km")) {
//     return "ភាសាខ្មែរ";
//   }

//   if (normalized.startsWith("en")) {
//     return "English";
//   }

//   return language;
// }

// function getInitials(profileName: string): string {
//   const words = profileName.trim().split(/\s+/).filter(Boolean);

//   if (words.length === 0) {
//     return "?";
//   }

//   return words
//     .slice(0, 2)
//     .map((word) => Array.from(word)[0] ?? "")
//     .join("");
// }

// function buildOptionLabelMap(
//   options: SafetyOption[] | undefined,
//   preferredLanguage: string,
// ): Map<string, string> {
//   const useKhmer = preferredLanguage.toLowerCase().startsWith("km");

//   return new Map(
//     (options ?? []).map((option) => [
//       option.code,
//       useKhmer && option.localName ? option.localName : option.name,
//     ]),
//   );
// }

// /* -------------------------------------------------------------------------- */
// /*                              USER DASHBOARD                                */
// /* -------------------------------------------------------------------------- */

// export default function UserDashboard() {
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [createAsDefault, setCreateAsDefault] = useState(false);

//   /*
//    * STEP 1:
//    * Fetch the profile list only to find the DEFAULT profile.
//    */
//   const {
//     data: profilesResponse,
//     isLoading: isProfilesLoading,
//     isFetching: isProfilesFetching,
//     isError: isProfilesError,
//     refetch: refetchProfiles,
//   } = useGetMemberProfilesQuery({
//     page: 0,
//     size: 100,
//   });

//   const defaultProfileSummary = useMemo(
//     () =>
//       profilesResponse?.contents.find(
//         (memberProfile) => memberProfile.isDefault === true,
//       ) ?? null,
//     [profilesResponse],
//   );

//   const otherProfiles = useMemo(
//     () =>
//       profilesResponse?.contents.filter(
//         (memberProfile) => memberProfile.isDefault !== true,
//       ) ?? [],
//     [profilesResponse],
//   );

//   /*
//    * STEP 2:
//    * Fetch the FULL detail of the default profile.
//    *
//    * This is important because the profile-list response may not contain
//    * complete allergies, dietaryTypes, medicalConditions and ingredientAvoids.
//    */
//   const {
//     data: profile,
//     isLoading: isDetailLoading,
//     isFetching: isDetailFetching,
//     isError: isDetailError,
//     refetch: refetchDetail,
//   } = useGetMemberProfileByIdQuery(defaultProfileSummary?.uuid ?? "", {
//     skip: !defaultProfileSummary?.uuid,
//   });

//   const { data: allergenOptionsResponse } = useGetAllergenOptionsQuery();
//   const { data: dietaryOptionsResponse } = useGetDietaryTypeOptionsQuery();
//   const { data: medicalOptionsResponse } = useGetMedicalConditionOptionsQuery();

//   const preferredLanguage =
//     profile?.preferredLanguage ??
//     defaultProfileSummary?.preferredLanguage ??
//     "km";

//   const allergenLabelMap = useMemo(
//     () =>
//       buildOptionLabelMap(allergenOptionsResponse?.contents, preferredLanguage),
//     [allergenOptionsResponse?.contents, preferredLanguage],
//   );

//   const dietaryLabelMap = useMemo(
//     () =>
//       buildOptionLabelMap(dietaryOptionsResponse?.contents, preferredLanguage),
//     [dietaryOptionsResponse?.contents, preferredLanguage],
//   );

//   const medicalLabelMap = useMemo(
//     () =>
//       buildOptionLabelMap(medicalOptionsResponse?.contents, preferredLanguage),
//     [medicalOptionsResponse?.contents, preferredLanguage],
//   );

//   const isLoading =
//     isProfilesLoading || (!!defaultProfileSummary && isDetailLoading);

//   const isFetching = isProfilesFetching || isDetailFetching;

//   const isError = isProfilesError || (!!defaultProfileSummary && isDetailError);

//   const openCreateModal = (asDefault: boolean) => {
//     setCreateAsDefault(asDefault);
//     setIsCreateModalOpen(true);
//   };

//   if (isLoading) {
//     return <DashboardLoading />;
//   }

//   if (isError) {
//     return (
//       <DashboardState
//         title="មិនអាចទាញយកប្រវត្តិរូបបាន"
//         description="មានបញ្ហាក្នុងការទាញយកព័ត៌មានប្រវត្តិរូបពី API។"
//       >
//         <button
//           type="button"
//           onClick={() => {
//             void refetchProfiles();

//             if (defaultProfileSummary?.uuid) {
//               void refetchDetail();
//             }
//           }}
//           className="mt-4 rounded-lg bg-emerald-600 px-5 py-2.5 text-[17px] font-medium text-white transition hover:bg-emerald-700"
//         >
//           ព្យាយាមម្តងទៀត
//         </button>
//       </DashboardState>
//     );
//   }

//   /* ------------------------------------------------------------------ */
//   /* No default profile → show premium CTA to create one                */
//   /* ------------------------------------------------------------------ */

//   if (!defaultProfileSummary) {
//     return (
//       <>
//         <div className="mx-auto container max-w-7xl">
//           {/* Hero CTA card */}
//           <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#136C34] via-[#1a8b42] to-[#0d5429] p-8 shadow-xl sm:p-12">
//             {/* Decorative blobs */}
//             <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
//             <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/5" />

//             <div className="relative z-10 flex flex-col items-center gap-6 text-center">
//               <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-4 ring-white/20">
//                 <UserRound className="h-10 w-10 text-white" />
//               </div>

//               <div>
//                 <h2 className="text-[28px] font-bold text-white sm:text-[36px]">
//                   សូមស្វាគមន៍មកកាន់ FoodHub!
//                 </h2>
//                 <p className="mx-auto mt-3 max-w-md text-[17px] leading-7 text-emerald-100">
//                   ចាប់ផ្តើមដំណើររបស់អ្នកដោយបង្កើតគណនីមូលដ្ឋានរបស់អ្នក។ FoodHub
//                   នឹងប្រើព័ត៌មាននេះដើម្បីណែនាំអាហារដែលស័ក្តិសមបំផុត សម្រាប់អ្នក។
//                 </p>
//               </div>

//               <div className="flex flex-wrap justify-center gap-4 text-[15px] text-emerald-200">
//                 <div className="flex items-center gap-2">
//                   <span className="h-2 w-2 rounded-full bg-emerald-300" />
//                   ការណែនាំអាហារផ្ទាល់ខ្លួន
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className="h-2 w-2 rounded-full bg-emerald-300" />
//                   ការគ្រប់គ្រងស្ថានភាពអាឡែស៊ី
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className="h-2 w-2 rounded-full bg-emerald-300" />
//                   ប្រវត្តិការបញ្ជាទិញ
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={() => openCreateModal(true)}
//                 className="inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-[18px] font-bold text-[#136C34] shadow-lg transition hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
//               >
//                 <Plus className="h-6 w-6" />
//                 បង្កើតគណនីរបស់ខ្ញុំ
//               </button>
//             </div>
//           </div>

//           {/* Features grid */}
//           <div className="mt-6 grid gap-4 sm:grid-cols-3">
//             {[
//               {
//                 icon: "🍜",
//                 title: "ណែនាំអាហារ",
//                 desc: "ទទួលការណែនាំអាហារដែលត្រូវនឹងតម្រូវការសុខភាពរបស់អ្នក",
//               },
//               {
//                 icon: "👨‍👩‍👧",
//                 title: "ប្រវត្តិរូបគ្រួសារ",
//                 desc: "បង្កើតប្រវត្តិរូបសម្រាប់សមាជិកគ្រួសារទាំងអស់",
//               },
//               {
//                 icon: "🛡️",
//                 title: "ការប្រុងប្រយ័ត្នសុខភាព",
//                 desc: "ចុះឈ្មោះអាឡែស៊ី និងស្ថានភាពវេជ្ជសាស្ត្ររបស់អ្នក",
//               },
//             ].map((feature) => (
//               <div
//                 key={feature.title}
//                 className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
//               >
//                 <div className="mb-3 text-[32px]">{feature.icon}</div>
//                 <p className="text-[17px] font-bold text-slate-800">
//                   {feature.title}
//                 </p>
//                 <p className="mt-1 text-[15px] leading-6 text-slate-500">
//                   {feature.desc}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>

//         <CreateMemberProfileModal
//           open={isCreateModalOpen}
//           onClose={() => setIsCreateModalOpen(false)}
//           forceDefault={createAsDefault}
//         />
//       </>
//     );
//   }

//   if (!profile) {
//     return (
//       <DashboardState
//         title="មិនអាចបង្ហាញព័ត៌មានលម្អិតបាន"
//         description="រកឃើញ profile លំនាំដើម ប៉ុន្តែមិនទទួលបានព័ត៌មានលម្អិតពី API។"
//       />
//     );
//   }

//   const age = calculateAge(profile.dateOfBirth);
//   const memberSinceDays = calculateMemberSinceDays(profile.createdAt);

//   const allergies = profile.allergies ?? [];
//   const dietaryTypes = profile.dietaryTypes ?? [];
//   const medicalConditions = profile.medicalConditions ?? [];
//   const ingredientAvoids = profile.ingredientAvoids ?? [];

//   const preferenceCount =
//     allergies.length +
//     dietaryTypes.length +
//     medicalConditions.length +
//     ingredientAvoids.length;

//   return (
//     <>
//       <div className="mx-auto max-w-7xl p-4">
//         {/* ------------------------------------------------------------------ */}
//         {/* Profile banner                                                      */}
//         {/* ------------------------------------------------------------------ */}

//         <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//           <div className="relative h-20 bg-gradient-to-r from-primary-100 to-primary-200 sm:h-32" />

//           <div className="relative px-4 pb-5 sm:px-6 sm:pb-6">
//             <div className="-mt-8 flex flex-col gap-4 sm:-mt-10 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
//               <div className="flex min-w-0 items-end gap-3 sm:gap-4">
//                 {/* ---- Avatar with upload overlay ---- */}
//                 <AvatarUpload
//                   profileUuid={profile.uuid}
//                   avatarMediaUuid={profile.avatarMediaUuid}
//                   profileName={profile.profileName}
//                   onRefresh={() => void refetchDetail()}
//                 />

//                 <div className="min-w-0 pb-1">
//                   <div className="flex flex-wrap items-center gap-2">
//                     <p className="truncate text-[22px] font-bold text-slate-800 sm:text-[34px]">
//                       {profile.profileName}
//                     </p>

//                     <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-[15px] font-semibold text-emerald-700">
//                       <Crown className="h-3.5 w-3.5" />
//                       លំនាំដើម
//                     </span>
//                   </div>

//                   <p className="mt-1 truncate text-[17px] text-slate-500">
//                     {relationshipLabels[profile.relationship]}
//                     {" • "}
//                     {getLanguageLabel(profile.preferredLanguage)}
//                   </p>
//                 </div>
//               </div>

//               <Link
//                 href={`/dashboard/family-profile/${profile.uuid}?mode=edit`}
//                 className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-[17px] font-medium text-slate-600 transition hover:bg-slate-50 sm:mt-2 sm:w-auto"
//               >
//                 <Pencil className="text-[17px]" />
//                 កែប្រែព័ត៌មាន
//               </Link>
//             </div>

//             <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
//               <StatCard
//                 label="សមាជិក"
//                 value={memberSinceDays}
//                 sublabel="ថ្ងៃជាសមាជិក"
//               />

//               <StatCard
//                 label="អាយុ"
//                 value={age}
//                 sublabel="ឆ្នាំ"
//                 accent="text-emerald-600"
//               />

//               <StatCard
//                 label="ការកំណត់"
//                 value={preferenceCount}
//                 sublabel="សុខភាព និងអាហារ"
//               />
//             </div>

//             {isFetching && (
//               <p className="mt-3 text-right text-[17px] text-slate-400">
//                 កំពុងធ្វើបច្ចុប្បន្នភាព...
//               </p>
//             )}
//           </div>
//         </div>

//         {/* ------------------------------------------------------------------ */}
//         {/* Personal info                                                      */}
//         {/* ------------------------------------------------------------------ */}

//         <SectionCard
//           icon={<FaRegUser />}
//           title="ព័ត៌មានផ្ទាល់ខ្លួន"
//           className="mt-4 sm:mt-5"
//         >
//           <div className="flex flex-wrap gap-3">
//             <ProfileInfoTag
//               label="ទំនាក់ទំនង"
//               value={relationshipLabels[profile.relationship]}
//             />

//             <ProfileInfoTag label="ភេទ" value={genderLabels[profile.gender]} />

//             <ProfileInfoTag
//               label="ថ្ងៃខែឆ្នាំកំណើត"
//               value={formatDate(profile.dateOfBirth)}
//             />

//             <ProfileInfoTag
//               label="ក្រុមអាយុ"
//               value={profile.ageGroup?.name ?? "មិនបានបញ្ជាក់"}
//             />

//             <ProfileInfoTag
//               label="ភាសា"
//               value={getLanguageLabel(profile.preferredLanguage)}
//             />

//             <ProfileInfoTag
//               label="បានកែប្រែ"
//               value={formatDate(profile.updatedAt)}
//             />
//           </div>
//         </SectionCard>

//         {/* ------------------------------------------------------------------ */}
//         {/* Medical conditions                                                  */}
//         {/* ------------------------------------------------------------------ */}

//         <SectionCard
//           icon={<RiShieldCheckLine />}
//           title="ស្ថានភាពសុខភាព"
//           className="mt-4 sm:mt-5"
//         >
//           {medicalConditions.length > 0 ? (
//             <div className="flex flex-wrap gap-3">
//               {medicalConditions.map((condition, index) => {
//                 const name =
//                   getString(condition, "conditionName", "name") ??
//                   medicalLabelMap.get(condition.conditionCode) ??
//                   condition.conditionCode;

//                 return (
//                   <DetailedSafetyTag
//                     key={`${condition.conditionCode}-${index}`}
//                     name={name}
//                     variant="blue"
//                     details={[
//                       severityLabels[condition.severity],
//                       condition.notes,
//                     ]}
//                   />
//                 );
//               })}
//             </div>
//           ) : (
//             <EmptyValue text="មិនមានព័ត៌មានសុខភាព។" />
//           )}

//           <div className="mt-4 flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-[17px] leading-7 text-emerald-700">
//             <RiShieldCheckLine className="mt-1 shrink-0 text-[19px]" />
//             FoodHub នឹងប្រើព័ត៌មានសុខភាពរបស់ profile លំនាំដើមនេះ
//             សម្រាប់ការណែនាំអាហារ។
//           </div>
//         </SectionCard>

//         {/* ------------------------------------------------------------------ */}
//         {/* Dietary + Allergies                                                 */}
//         {/* ------------------------------------------------------------------ */}

//         <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 md:grid-cols-2">
//           <SectionCard icon={<FaUtensils />} title="ចំណូលចិត្តផ្នែកអាហារ">
//             {dietaryTypes.length > 0 ? (
//               <div className="flex flex-wrap gap-3">
//                 {dietaryTypes.map((dietaryType, index) => {
//                   const name =
//                     getString(dietaryType, "dietaryTypeName", "name") ??
//                     dietaryLabelMap.get(dietaryType.dietaryTypeCode) ??
//                     dietaryType.dietaryTypeCode;

//                   return (
//                     <DetailedSafetyTag
//                       key={`${dietaryType.dietaryTypeCode}-${index}`}
//                       name={name}
//                       variant="emerald"
//                       details={[
//                         dietaryLevelLabels[dietaryType.enforcementLevel],
//                         `អាទិភាព ${dietaryType.priority}`,
//                         dietaryType.notes,
//                       ]}
//                     />
//                   );
//                 })}
//               </div>
//             ) : (
//               <EmptyValue text="មិនមានរបបអាហារដែលបានកំណត់។" />
//             )}
//           </SectionCard>

//           <SectionCard icon={<FiAlertTriangle />} title="អាឡែស៊ីនិងអាហារ">
//             {allergies.length > 0 ? (
//               <>
//                 <div className="flex flex-wrap gap-3">
//                   {allergies.map((allergy, index) => {
//                     const name =
//                       getString(allergy, "allergenName", "name") ??
//                       allergenLabelMap.get(allergy.allergenCode) ??
//                       allergy.allergenCode;

//                     return (
//                       <DetailedSafetyTag
//                         key={`${allergy.allergenCode}-${index}`}
//                         name={name}
//                         variant="red"
//                         details={[
//                           severityLabels[allergy.severity],
//                           allergy.avoidCrossContact
//                             ? "ជៀសវាងការប៉ះពាល់ឆ្លង"
//                             : null,
//                           allergy.medicallyDiagnosed
//                             ? "វិនិច្ឆ័យដោយវេជ្ជបណ្ឌិត"
//                             : null,
//                           allergy.reactionNotes,
//                         ]}
//                       />
//                     );
//                   })}
//                 </div>

//                 <p className="mt-4 flex items-start gap-2 text-[17px] leading-7 text-orange-600">
//                   <FiAlertTriangle className="mt-1 shrink-0 text-[19px]" />
//                   សារធាតុទាំងនេះនឹងត្រូវបានពិចារណាក្នុងការណែនាំអាហារ។
//                 </p>
//               </>
//             ) : (
//               <EmptyValue text="មិនមានព័ត៌មានអាឡែស៊ី។" />
//             )}
//           </SectionCard>
//         </div>

//         {/* ------------------------------------------------------------------ */}
//         {/* Multi-profile section                                               */}
//         {/* ------------------------------------------------------------------ */}

//         <section className="mt-4 sm:mt-5">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[19px] text-emerald-600">
//                 <Users className="h-5 w-5" />
//               </span>
//               <p className="text-[20px] font-semibold sm:text-[24px]">
//                 ប្រវត្តិរូបគ្រួសារ
//               </p>
//             </div>

//             <button
//               type="button"
//               onClick={() => openCreateModal(false)}
//               className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
//             >
//               <Plus className="h-4 w-4" />
//               បន្ថែម
//             </button>
//           </div>

//           {otherProfiles.length > 0 ? (
//             <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//               {otherProfiles.map((memberProfile) => (
//                 <ProfileCard
//                   key={memberProfile.uuid}
//                   profile={memberProfile}
//                   onRefetch={() => void refetchProfiles()}
//                 />
//               ))}
//             </div>
//           ) : (
//             <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
//               <Users className="mx-auto h-10 w-10 text-slate-300" />
//               <p className="mt-3 text-[17px] font-medium text-slate-500">
//                 មិនទាន់មានប្រវត្តិរូបគ្រួសារ
//               </p>
//               <p className="mt-1 text-[15px] text-slate-400">
//                 ចុចប៊ូតុង "បន្ថែម" ដើម្បីបង្កើតប្រវត្តិរូបថ្មី
//               </p>
//             </div>
//           )}
//         </section>
//       </div>

//       {/* Create profile modal — works for both default and multi-profile */}
//       <CreateMemberProfileModal
//         open={isCreateModalOpen}
//         onClose={() => setIsCreateModalOpen(false)}
//         forceDefault={createAsDefault}
//       />
//     </>
//   );
// }

// /* -------------------------------------------------------------------------- */
// /*                              PROFILE CARD (non-default)                    */
// /* -------------------------------------------------------------------------- */

// interface ProfileCardProps {
//   profile: MemberProfile;
//   onRefetch: () => void;
// }

// function ProfileCard({ profile, onRefetch }: ProfileCardProps) {
//   return (
//     <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
//       <div className="flex items-center gap-4">
//         {/* Avatar with upload */}
//         <AvatarUpload
//           profileUuid={profile.uuid}
//           avatarMediaUuid={profile.avatarMediaUuid}
//           profileName={profile.profileName}
//           onRefresh={onRefetch}
//           size="sm"
//         />

//         <div className="min-w-0 flex-1">
//           <p className="truncate text-[17px] font-bold text-slate-800">
//             {profile.profileName}
//           </p>
//           <p className="mt-0.5 text-[14px] text-slate-500">
//             {relationshipLabels[profile.relationship as MemberRelationship]}
//           </p>
//         </div>

//         <Link
//           href={`/dashboard/family-profile/${profile.uuid}?mode=edit`}
//           className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
//           title="កែប្រែ"
//         >
//           <Pencil className="h-4 w-4" />
//         </Link>
//       </div>
//     </div>
//   );
// }

// /* -------------------------------------------------------------------------- */
// /*                             AVATAR UPLOAD                                  */
// /* -------------------------------------------------------------------------- */

// interface AvatarUploadProps {
//   profileUuid: string;
//   avatarMediaUuid: string | null;
//   profileName: string;
//   onRefresh: () => void;
//   size?: "sm" | "md";
// }

// function AvatarUpload({
//   profileUuid,
//   avatarMediaUuid,
//   profileName,
//   onRefresh,
//   size = "md",
// }: AvatarUploadProps) {
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [uploadError, setUploadError] = useState<string | null>(null);

//   const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();
//   const [updateProfile, { isLoading: isUpdating }] =
//     useUpdateMemberProfileMutation();

//   /* Fetch the CDN URL for the current avatar */
//   const { data: accessUrlData } = useGetMediaAccessUrlQuery(
//     avatarMediaUuid ?? "",
//     { skip: !avatarMediaUuid },
//   );

//   const isProcessing = isUploading || isUpdating;

//   const sizeClasses =
//     size === "sm"
//       ? "h-12 w-12 sm:h-14 sm:w-14 rounded-xl border-2"
//       : "h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-4";

//   const textSizeClass =
//     size === "sm" ? "text-[16px] sm:text-[18px]" : "text-[20px] sm:text-[26px]";

//   const handleFileChange = async (
//     event: React.ChangeEvent<HTMLInputElement>,
//   ) => {
//     const file = event.target.files?.[0];
//     /* Reset the input so the same file can be re-selected */
//     event.target.value = "";

//     if (!file) return;

//     /* Basic client-side validation */
//     if (!file.type.startsWith("image/")) {
//       setUploadError("សូមជ្រើសរើសរូបភាពប្រភេទ JPG, PNG ឬ WebP");
//       return;
//     }

//     if (file.size > 5 * 1024 * 1024) {
//       setUploadError("ទំហំឯកសារមិនត្រូវលើសពី 5 MB");
//       return;
//     }

//     setUploadError(null);

//     try {
//       /* 1. Upload the file to the media service */
//       const mediaResult = await uploadMedia({
//         file,
//         purpose: "PROFILE_AVATAR",
//       }).unwrap();

//       /* 2. Patch the profile with the new avatar UUID */
//       await updateProfile({
//         uuid: profileUuid,
//         body: { avatarMediaUuid: mediaResult.uuid },
//       }).unwrap();

//       /* 3. Re-fetch the profile so the new URL is picked up */
//       onRefresh();
//     } catch (err: unknown) {
//       if (typeof err === "object" && err !== null && "data" in err) {
//         const data = (err as { data?: { message?: string } }).data;
//         setUploadError(
//           data?.message ?? "មិនអាចផ្ទុករូបភាពបានទេ។ សូមព្យាយាមមើលទៀត។",
//         );
//       } else if (err instanceof Error) {
//         setUploadError(err.message);
//       } else {
//         setUploadError("មិនអាចផ្ទុករូបភាពបានទេ។ សូមព្យាយាមមើលទៀត។");
//       }
//     }
//   };

//   const initials = getInitials(profileName);

//   return (
//     <div className="shrink-0">
//       {/* Hidden file input */}
//       <input
//         ref={fileInputRef}
//         id={`avatar-input-${profileUuid}`}
//         type="file"
//         accept="image/*"
//         className="sr-only"
//         onChange={(e) => void handleFileChange(e)}
//         disabled={isProcessing}
//       />

//       {/* Avatar circle */}
//       <button
//         type="button"
//         onClick={() => fileInputRef.current?.click()}
//         disabled={isProcessing}
//         title="ផ្លាស់ប្ដូររូបតំណាង"
//         aria-label="ផ្លាស់ប្ដូររូបតំណាង"
//         className={`group relative flex shrink-0 items-center justify-center overflow-hidden border-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-70 ${sizeClasses}`}
//       >
//         {/* Photo or initials background */}
//         {accessUrlData?.url ? (
//           <Image
//             src={accessUrlData.url}
//             alt={profileName}
//             fill
//             className="object-cover"
//             sizes={size === "sm" ? "56px" : "80px"}
//           />
//         ) : (
//           <span
//             className={`flex h-full w-full items-center justify-center bg-[#136C34] font-bold text-white ${textSizeClass}`}
//           >
//             {initials}
//           </span>
//         )}

//         {/* Spinner overlay while uploading */}
//         {isProcessing && (
//           <span className="absolute inset-0 flex items-center justify-center bg-black/50">
//             <LoaderCircle className="h-6 w-6 animate-spin text-white" />
//           </span>
//         )}

//         {/* Camera hover overlay */}
//         {!isProcessing && (
//           <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
//             <IoCameraOutline className="text-[22px] text-white" />
//             {size === "md" && (
//               <span className="text-[10px] font-semibold text-white">
//                 ផ្លាស់ប្ដូរ
//               </span>
//             )}
//           </span>
//         )}
//       </button>

//       {/* Inline upload error */}
//       {uploadError && (
//         <p className="mt-1.5 max-w-[140px] text-center text-[13px] leading-5 text-red-600">
//           {uploadError}
//         </p>
//       )}
//     </div>
//   );
// }

// /* -------------------------------------------------------------------------- */
// /*                              UI COMPONENTS                                 */
// /* -------------------------------------------------------------------------- */

// function StatCard({
//   label,
//   value,
//   sublabel,
//   accent = "text-slate-800",
// }: {
//   label: string;
//   value: number | string;
//   sublabel: string;
//   accent?: string;
// }) {
//   return (
//     <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
//       <p className="text-[17px] text-slate-500">{label}</p>

//       <p className={`text-[22px] font-bold sm:text-[26px] ${accent}`}>
//         {value}
//       </p>

//       <p className="truncate text-[17px] text-slate-400">{sublabel}</p>
//     </div>
//   );
// }

// function SectionCard({
//   icon,
//   title,
//   children,
//   className = "",
// }: {
//   icon: ReactNode;
//   title: string;
//   children: ReactNode;
//   className?: string;
// }) {
//   return (
//     <section
//       className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 ${className}`}
//     >
//       <div className="mb-4 flex items-center gap-3 text-slate-800">
//         <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[19px] text-emerald-600">
//           {icon}
//         </span>

//         <p className="text-[20px] font-semibold sm:text-[24px]">{title}</p>
//       </div>

//       {children}
//     </section>
//   );
// }

// function ProfileInfoTag({ label, value }: { label: string; value: string }) {
//   return (
//     <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5">
//       <span className="text-[17px] font-medium text-slate-500">{label}</span>

//       <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />

//       <span className="text-[17px] font-semibold text-slate-800">{value}</span>
//     </div>
//   );
// }

// function DetailedSafetyTag({
//   name,
//   details,
//   variant,
// }: {
//   name: string;
//   details: Array<string | null | undefined>;
//   variant: "red" | "emerald" | "blue" | "orange";
// }) {
//   const styles = {
//     red: {
//       wrapper: "border-red-200 bg-red-50 text-red-700",
//       detail: "border-red-100 bg-white/80 text-red-700",
//     },
//     emerald: {
//       wrapper: "border-emerald-200 bg-emerald-50 text-emerald-700",
//       detail: "border-emerald-100 bg-white/80 text-emerald-700",
//     },
//     blue: {
//       wrapper: "border-blue-200 bg-blue-50 text-blue-700",
//       detail: "border-blue-100 bg-white/80 text-blue-700",
//     },
//     orange: {
//       wrapper: "border-orange-200 bg-orange-50 text-orange-700",
//       detail: "border-orange-100 bg-white/80 text-orange-700",
//     },
//   };

//   const visibleDetails = details.filter(
//     (detail): detail is string =>
//       typeof detail === "string" && detail.trim().length > 0,
//   );

//   return (
//     <div
//       className={`inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border px-4 py-2.5 ${styles[variant].wrapper}`}
//     >
//       <span className="text-[17px] font-semibold">{name}</span>
//     </div>
//   );
// }

// function EmptyValue({ text }: { text: string }) {
//   return (
//     <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-[17px] text-slate-500">
//       {text}
//     </p>
//   );
// }

// function DashboardLoading() {
//   return (
//     <div className="mx-auto max-w-6xl px-4 ">
//       <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//         <div className="h-20 bg-slate-100 sm:h-32" />

//         <div className="px-4 pb-5 sm:px-6">
//           <div className="-mt-8 flex items-end gap-3 sm:-mt-10">
//             <div className="h-16 w-16 rounded-2xl bg-slate-200 sm:h-20 sm:w-20" />

//             <div className="space-y-2 pb-1">
//               <div className="h-7 w-48 rounded bg-slate-200" />
//               <div className="h-4 w-32 rounded bg-slate-100" />
//             </div>
//           </div>

//           <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
//             {[0, 1, 2].map((item) => (
//               <div key={item} className="h-24 rounded-xl bg-slate-100" />
//             ))}
//           </div>
//         </div>
//       </div>

//       {[0, 1, 2, 3].map((item) => (
//         <div
//           key={item}
//           className="mt-5 h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
//         />
//       ))}
//     </div>
//   );
// }

// function DashboardState({
//   title,
//   description,
//   children,
// }: {
//   title: string;
//   description: string;
//   children?: ReactNode;
// }) {
//   return (
//     <div className="mx-auto max-w-6xl  py-4 ">
//       <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
//         <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-[20px] text-emerald-600">
//           <FaRegUser />
//         </div>

//         <h2 className="mt-4 text-[22px] font-bold text-slate-800">{title}</h2>

//         <p className="mx-auto mt-2 max-w-lg text-[17px] leading-7 text-slate-500">
//           {description}
//         </p>

//         {children}
//       </div>
//     </div>
//   );
// }
