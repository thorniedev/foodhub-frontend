
"use client";

import Image from "next/image";
import Link from "next/link";

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Compass,
  Crown,
  Flame,
  HeartPulse,
  Languages,
  LoaderCircle,
  Pencil,
  RefreshCw,
  Salad,
  ShieldAlert,
  Sparkles,
  UserRound,
  UsersRound,
  Utensils,
  Wallet,
} from "lucide-react";

import {
  useGetMemberProfileByIdQuery,
  useGetMediaAccessUrlQuery,
} from "@/app/store/memberProfileApi";

import type {
  MemberGender,
  MemberRelationship,
} from "@/types/member-profile/member-profile";

import {
  CUISINE_OPTIONS,
  PREFERENCE_LEVELS,
  TASTE_OPTIONS,
  TEXTURE_OPTIONS,
  getSpiceDescriptor,
} from "./ProfileEditForm";

interface ProfileDetailViewProps {
  uuid: string;
}

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

type UnknownRecord = Record<string, unknown>;

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

function formatDate(value?: string | null) {
  if (!value) {
    return "មិនបានបញ្ជាក់";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("km-KH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "មិនបានបញ្ជាក់";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("km-KH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[17px] font-medium text-slate-500">{label}</p>

          <p className="mt-1 break-words text-[18px] font-semibold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

type SafetyTagVariant = "red" | "emerald" | "blue" | "orange";

const safetyTagStyles: Record<SafetyTagVariant, string> = {
  red: "border-red-200 bg-red-50 text-red-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  orange: "border-orange-200 bg-orange-50 text-orange-700",
};

function SafetyTag({
  name,
  meta,
  variant,
}: {
  name: string;
  meta?: string | null;
  variant: SafetyTagVariant;
}) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-2 rounded-full border px-4 py-2 text-[16px] font-semibold ${safetyTagStyles[variant]}`}
    >
      <span className="truncate">{name}</span>

      {meta && (
        <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[12px] font-medium">
          {meta}
        </span>
      )}
    </span>
  );
}

function EmptySafetyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-7 text-center">
      <p className="text-[17px] text-slate-500">{message}</p>
    </div>
  );
}

export default function ProfileDetailView({ uuid }: ProfileDetailViewProps) {
  const {
    data: profile,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetMemberProfileByIdQuery(uuid);

  const { data: avatarAccessUrlData } = useGetMediaAccessUrlQuery(
    profile?.avatarMediaUuid ?? "",
    { skip: !profile?.avatarMediaUuid },
  );

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[400px] w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-emerald-600" />

          <p className="mt-4 text-[17px] text-slate-500">
            កំពុងទាញយកព័ត៌មានគណនី...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />

          <p className="mt-4 text-[18px] font-semibold text-red-700">
            មិនអាចទាញយកព័ត៌មានគណនីបានទេ។
          </p>

          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-[17px] font-medium text-white transition hover:bg-red-700"
          >
            <RefreshCw className="h-5 w-5" />
            ព្យាយាមម្តងទៀត
          </button>
        </div>
      </div>
    );
  }

  const firstLetter = profile.profileName.trim().charAt(0).toUpperCase() || "?";

  const allergies = profile.allergies ?? [];
  const dietaryTypes = profile.dietaryTypes ?? [];
  const medicalConditions = profile.medicalConditions ?? [];
  const ingredientAvoids = profile.ingredientAvoids ?? [];

  const preferences = profile.preferences as Record<string, any> | null;

  const spiceLevel =
    typeof preferences?.spiceTolerance === "number"
      ? preferences.spiceTolerance
      : parseInt(String(preferences?.spiceLevel ?? "5"), 10) || 5;

  const minBudget =
    typeof preferences?.minimumPrice === "number"
      ? preferences.minimumPrice
      : preferences?.minimumBudget;

  const maxBudget =
    typeof preferences?.maximumPrice === "number"
      ? preferences.maximumPrice
      : preferences?.maximumBudget;

  const currency = preferences?.currencyCode ?? "USD";

  const radiusKm =
    typeof preferences?.defaultSearchRadiusKm === "number"
      ? preferences.defaultSearchRadiusKm
      : typeof preferences?.radiusMeters === "number"
      ? preferences.radiusMeters / 1000
      : 5.0;

  const tasteCodes: string[] = Array.isArray(preferences?.tasteCodes)
    ? preferences.tasteCodes
    : preferences?.tastePreferences
    ? Object.keys(preferences.tastePreferences).filter(
        (k) => preferences.tastePreferences[k],
      )
    : [];

  const textureCodes: string[] = Array.isArray(preferences?.textureCodes)
    ? preferences.textureCodes
    : preferences?.texturePreferences
    ? Object.keys(preferences.texturePreferences).filter(
        (k) => preferences.texturePreferences[k],
      )
    : [];

  const cuisinePreferences: {
    cuisineCode: string;
    preferenceLevel?: string;
    priority?: number;
  }[] = Array.isArray(preferences?.cuisines)
    ? preferences.cuisines
    : Array.isArray(preferences?.cuisineCodes)
    ? preferences.cuisineCodes.map((code: string, idx: number) => ({
        cuisineCode: code,
        preferenceLevel: "LOVE",
        priority: idx + 1,
      }))
    : [];

  return (
    <div className="mx-auto w-full max-w-7xl p-4 ">
      {/* Top navigation */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/family-profile"
          className="inline-flex w-fit items-center gap-2 text-[17px] font-medium text-slate-600 transition hover:text-emerald-700"
        >
          <ArrowLeft className="h-5 w-5" />
          ត្រឡប់ទៅ Dashboard
        </Link>

        <div className="flex items-center gap-3">
          {isFetching && (
            <div className="inline-flex items-center gap-2 text-[17px] text-slate-400">
              <RefreshCw className="h-5 w-5 animate-spin" />
              កំពុងធ្វើបច្ចុប្បន្នភាព
            </div>
          )}

          <Link
            href={`/dashboard/family-profile/${uuid}?mode=edit`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-[17px] font-semibold text-white transition hover:bg-emerald-700"
          >
            <Pencil className="h-5 w-5" />
            កែប្រែព័ត៌មាន
          </Link>
        </div>
      </div>

      {/* Profile header */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 px-5 py-7 sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl bg-emerald-100 ring-4 ring-white shadow-sm">
              {avatarAccessUrlData?.url ? (
                <Image
                  src={avatarAccessUrlData.url}
                  alt={profile.profileName}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[34px] font-bold text-emerald-700">
                  {firstLetter}
                </span>
              )}

              {profile.isActive && (
                <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white bg-emerald-500" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="break-words text-[28px] font-bold text-slate-900 sm:text-[32px]">
                  {profile.profileName}
                </h3>

                {profile.isDefault && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-[17px] font-semibold text-amber-700">
                    <Crown className="h-5 w-5" />
                    គណនីលំនាំដើម
                  </span>
                )}

                {profile.isActive && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-[17px] font-semibold text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                    សកម្ម
                  </span>
                )}
              </div>

              <p className="mt-2 text-[18px] text-slate-500">
                {relationshipLabels[profile.relationship] ??
                  profile.relationship}
              </p>
            </div>
          </div>
        </div>

        {/* Basic information */}

        <div className="p-5 sm:p-8">
          <div className="mb-5">
            <h4 className="text-[24px] font-bold text-slate-900">
              ព័ត៌មានផ្ទាល់ខ្លួន
            </h4>

            <p className="mt-2 text-[17px] text-slate-500">
              ព័ត៌មានមូលដ្ឋានសម្រាប់គណនីនេះ។
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <InfoItem
              icon={<UsersRound className="h-5 w-5" />}
              label="ទំនាក់ទំនង"
              value={
                relationshipLabels[profile.relationship] ?? profile.relationship
              }
            />

            <InfoItem
              icon={<UserRound className="h-5 w-5" />}
              label="ភេទ"
              value={genderLabels[profile.gender] ?? profile.gender}
            />

            <InfoItem
              icon={<CalendarDays className="h-5 w-5" />}
              label="ថ្ងៃខែឆ្នាំកំណើត"
              value={formatDate(profile.dateOfBirth)}
            />

            <InfoItem
              icon={<HeartPulse className="h-5 w-5" />}
              label="ក្រុមអាយុ"
              value={profile.ageGroup?.name ?? "មិនបានបញ្ជាក់"}
            />

            <InfoItem
              icon={<Languages className="h-5 w-5" />}
              label="ភាសាដែលពេញចិត្ត"
              value={
                profile.preferredLanguage === "km"
                  ? "ភាសាខ្មែរ"
                  : profile.preferredLanguage === "en"
                    ? "English"
                    : profile.preferredLanguage
              }
            />

            <InfoItem
              icon={<RefreshCw className="h-5 w-5" />}
              label="បានកែប្រែចុងក្រោយ"
              value={formatDateTime(profile.updatedAt)}
            />
          </div>
        </div>
      </section>

      {/* General & Cuisine Preferences */}
      <section className="mt-7">
        <div className="mb-5">
          <h4 className="text-[24px] font-bold text-slate-900">
            ចំណូលចិត្តទូទៅ និងរសជាតិ (Food Preferences)
          </h4>
          <p className="mt-2 text-[17px] text-slate-500">
            ចំណូលចិត្តកម្រិតហឹរ ថវិកា រសជាតិ និងប្រភេទម្ហូបជាតិសាសន៍។
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* General Specs Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <Flame className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-[21px] font-bold text-slate-900">
                    កម្រិតហឹរ និងថវិកា
                  </h3>
                  <p className="text-[15px] text-slate-500">
                    Spice Tolerance & Budget Preferences
                  </p>
                </div>
              </div>

              {/* Spice Meter */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-sm font-bold text-slate-700">
                    កម្រិតហឹរ (Spice Level)
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      getSpiceDescriptor(spiceLevel).colorClass
                    }`}
                  >
                    {getSpiceDescriptor(spiceLevel).emoji}{" "}
                    {getSpiceDescriptor(spiceLevel).labelKm} ({spiceLevel}/10)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-600 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(5, (spiceLevel / 10) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Budget & Radius */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <Wallet className="h-3.5 w-3.5 text-emerald-600" />
                    <span>ថវិកា (Budget)</span>
                  </div>
                  <p className="text-base font-bold text-slate-900">
                    {minBudget != null && maxBudget != null
                      ? `${currency === "USD" ? "$" : ""}${minBudget} - ${
                          currency === "USD" ? "$" : ""
                        }${maxBudget} ${currency}`
                      : maxBudget != null
                      ? `ក្រោម ${
                          currency === "USD" ? "$" : ""
                        }${maxBudget} ${currency}`
                      : "មិនបានកំណត់"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <Compass className="h-3.5 w-3.5 text-blue-600" />
                    <span>ចម្ងាយរុករក</span>
                  </div>
                  <p className="text-base font-bold text-slate-900">
                    {radiusKm.toFixed(1)} km
                  </p>
                </div>
              </div>

              {/* Taste & Textures */}
              {(tasteCodes.length > 0 || textureCodes.length > 0) && (
                <div className="space-y-3 pt-1">
                  {tasteCodes.length > 0 && (
                    <div>
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        រសជាតិចូលចិត្ត (Tastes)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {tasteCodes.map((code) => {
                          const meta = TASTE_OPTIONS.find(
                            (t) => t.key === code.toLowerCase(),
                          );
                          return (
                            <span
                              key={code}
                              className="inline-flex items-center gap-1 rounded-xl bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-800"
                            >
                              <span>{meta?.emoji ?? "✨"}</span>
                              <span>{meta?.labelKm ?? code}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {textureCodes.length > 0 && (
                    <div>
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        ទម្រង់អាហារ (Textures)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {textureCodes.map((code) => {
                          const meta = TEXTURE_OPTIONS.find(
                            (t) => t.key === code.toLowerCase(),
                          );
                          return (
                            <span
                              key={code}
                              className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700"
                            >
                              <span>{meta?.emoji ?? "✨"}</span>
                              <span>{meta?.labelKm ?? code}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cuisine Preferences Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Utensils className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-[21px] font-bold text-slate-900">
                    ចំណូលចិត្តម្ហូបជាតិសាសន៍
                  </h3>
                  <p className="text-[15px] text-slate-500">
                    {cuisinePreferences.length} ជម្រើសដែលបានកំណត់
                  </p>
                </div>
              </div>

              {cuisinePreferences.length === 0 ? (
                <EmptySafetyState message="មិនទាន់មានការកំណត់ម្ហូបជាតិសាសន៍នៅឡើយ។" />
              ) : (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {cuisinePreferences.map((c) => {
                    const meta = CUISINE_OPTIONS.find(
                      (opt) => opt.code === c.cuisineCode,
                    );
                    const levelMeta = PREFERENCE_LEVELS.find(
                      (l) => l.value === (c.preferenceLevel || "LOVE"),
                    );
                    return (
                      <div
                        key={c.cuisineCode}
                        className="flex items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 px-3.5 py-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{meta?.flag ?? "🍽️"}</span>
                          <span className="font-bold text-slate-800 text-sm">
                            {meta?.labelKm ?? c.cuisineCode}
                          </span>
                        </div>
                        <span
                          className={`rounded-lg border px-2 py-0.5 text-[11px] font-bold ${
                            levelMeta?.badgeClass ??
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {levelMeta?.labelKm ?? c.preferenceLevel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Safety information */}

      <section className="mt-7">
        <div className="mb-5">
          <h4 className="text-[24px] font-bold text-slate-900">
            សុវត្ថិភាពអាហារ (Food Safety)
          </h4>

          <p className="mt-2 text-[17px] text-slate-500">
            FoodHub ប្រើព័ត៌មានទាំងនេះសម្រាប់ការណែនាំអាហារដែលសមស្រប។
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Allergies */}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <ShieldAlert className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-[21px] font-bold text-slate-900">
                  ប្រតិកម្មអាឡែហ្ស៊ី
                </h3>

                <p className="text-[17px] text-slate-500">
                  {allergies.length} ជម្រើស
                </p>
              </div>
            </div>

            {allergies.length === 0 ? (
              <EmptySafetyState message="មិនមានព័ត៌មានអាឡែហ្ស៊ី។" />
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {allergies.map((item, index) => {
                  const code =
                    getString(item, "allergenCode", "code") ?? "Unknown";

                  const name = getString(item, "allergenName", "name") ?? code;
                  const severity = getString(item, "severity");

                  return (
                    <SafetyTag
                      key={`${code}-${index}`}
                      name={name}
                      meta={severity}
                      variant="red"
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Dietary */}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Salad className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-[21px] font-bold text-slate-900">
                  ប្រភេទរបបអាហារ
                </h3>

                <p className="text-[17px] text-slate-500">
                  {dietaryTypes.length} ជម្រើស
                </p>
              </div>
            </div>

            {dietaryTypes.length === 0 ? (
              <EmptySafetyState message="មិនមានរបបអាហារដែលបានកំណត់។" />
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {dietaryTypes.map((item, index) => {
                  const code =
                    getString(item, "dietaryTypeCode", "code") ?? "Unknown";

                  const name =
                    getString(item, "dietaryTypeName", "name") ?? code;

                  const level = getString(item, "enforcementLevel");

                  return (
                    <SafetyTag
                      key={`${code}-${index}`}
                      name={name}
                      meta={level}
                      variant="emerald"
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Medical */}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <HeartPulse className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-[21px] font-bold text-slate-900">
                  ស្ថានភាពសុខភាព
                </h3>

                <p className="text-[17px] text-slate-500">
                  {medicalConditions.length} ជម្រើស
                </p>
              </div>
            </div>

            {medicalConditions.length === 0 ? (
              <EmptySafetyState message="មិនមានព័ត៌មានសុខភាព។" />
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {medicalConditions.map((item, index) => {
                  const code =
                    getString(item, "conditionCode", "code") ?? "Unknown";

                  const name = getString(item, "conditionName", "name") ?? code;
                  const severity = getString(item, "severity");

                  return (
                    <SafetyTag
                      key={`${code}-${index}`}
                      name={name}
                      meta={severity}
                      variant="blue"
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Ingredients */}

          {/* <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-[21px] font-bold text-slate-900">
                  គ្រឿងផ្សំដែលត្រូវជៀសវាង
                </h3>

                <p className="text-[17px] text-slate-500">
                  {ingredientAvoids.length} ជម្រើស
                </p>
              </div>
            </div>

            {ingredientAvoids.length === 0 ? (
              <EmptySafetyState message="មិនមានគ្រឿងផ្សំដែលត្រូវជៀសវាង។" />
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {ingredientAvoids.map((item, index) => {
                  const code =
                    getString(item, "ingredientCode", "code") ?? "Unknown";

                  const name =
                    getString(item, "ingredientName", "name") ?? code;

                  const avoidLevel = getString(item, "avoidLevel");

                  return (
                    <SafetyTag
                      key={`${code}-${index}`}
                      name={name}
                      meta={avoidLevel}
                      variant="orange"
                    />
                  );
                })}
              </div>
            )}
          </div> */}
        </div>
      </section>
    </div>
  );
}
