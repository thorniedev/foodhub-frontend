"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { IoCameraOutline } from "react-icons/io5";
import { FaRegStar, FaRegUser, FaUtensils } from "react-icons/fa";
import { RiShieldCheckLine } from "react-icons/ri";
import { FiAlertTriangle } from "react-icons/fi";

import {
  useGetAllergenOptionsQuery,
  useGetDietaryTypeOptionsQuery,
  useGetMedicalConditionOptionsQuery,
  useGetMemberProfileByIdQuery,
  useGetMemberProfilesQuery,
} from "@/app/store/memberProfileApi";

import type {
  MemberGender,
  MemberRelationship,
  SafetyOption,
} from "@/types/member-profile/member-profile";

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

  if (!defaultProfileSummary) {
    return (
      <DashboardState
        title="មិនទាន់មានប្រវត្តិរូបលំនាំដើម"
        description="ទំព័រនេះបង្ហាញតែ profile ដែលមាន isDefault = true ប៉ុណ្ណោះ។"
      >
        <Link
          href="/dashboard/family-profile"
          className="mt-4 inline-flex rounded-lg bg-emerald-600 px-5 py-2.5 text-[17px] font-medium text-white transition hover:bg-emerald-700"
        >
          គ្រប់គ្រងប្រវត្តិរូប
        </Link>
      </DashboardState>
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
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
      {/* ------------------------------------------------------------------ */}
      {/* Profile banner - keep UserDashboard layout                         */}
      {/* ------------------------------------------------------------------ */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-20 bg-gradient-to-r from-primary-100 to-primary-200 sm:h-32" />

        <div className="relative px-4 pb-5 sm:px-6 sm:pb-6">
          <div className="-mt-8 flex flex-col gap-4 sm:-mt-10 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-end gap-3 sm:gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-[#136C34] text-[20px] font-bold text-white shadow-sm sm:h-20 sm:w-20 sm:text-[26px]">
                {getInitials(profile.profileName)}
              </div>

              <div className="min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-[22px] font-bold text-slate-800 sm:text-[34px]">
                    {profile.profileName}
                  </p>

                  <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1.5 text-[17px] font-semibold text-emerald-700">
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
              <IoCameraOutline className="text-[19px]" />
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
      {/* Medical conditions - full detail in rounded tags                   */}
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
      {/* Dietary + Allergies - keep old 2-column UserDashboard layout       */}
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
      {/* Ingredient avoids - full detail tags                               */}
      {/* ------------------------------------------------------------------ */}

      <SectionCard
        icon={<FaRegStar />}
        title="គ្រឿងផ្សំដែលត្រូវជៀសវាង"
        className="mt-4 sm:mt-5"
      >
        {ingredientAvoids.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {ingredientAvoids.map((ingredient, index) => {
              const name =
                getString(ingredient, "ingredientName", "name") ??
                ingredient.ingredientCode;

              return (
                <DetailedSafetyTag
                  key={`${ingredient.ingredientCode}-${index}`}
                  name={name}
                  variant="orange"
                  details={[
                    ingredientAvoidLevelLabels[ingredient.avoidLevel],
                    ingredient.reasonCode,
                    ingredient.notes,
                  ]}
                />
              );
            })}
          </div>
        ) : (
          <EmptyValue text="មិនមានគ្រឿងផ្សំដែលត្រូវជៀសវាង។" />
        )}
      </SectionCard>
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

      {visibleDetails.map((detail, index) => (
        <span
          key={`${detail}-${index}`}
          className={`rounded-full border px-3 py-1 text-[17px] font-medium ${styles[variant].detail}`}
        >
          {detail}
        </span>
      ))}
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
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
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
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
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
