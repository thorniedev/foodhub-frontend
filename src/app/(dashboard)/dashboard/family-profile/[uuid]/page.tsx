"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  Activity,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Globe2,
  HeartPulse,
  LoaderCircle,
  ShieldAlert,
  UserRound,
  UsersRound,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";

import { useGetMemberProfileByIdQuery } from "@/app/store/memberProfileApi";

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
  PREFER_NOT_TO_SAY: "មិនចង់បញ្ជាក់",
};

function formatDate(value: string): string {
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

function formatUnknownItem(item: unknown): string {
  if (typeof item === "string") {
    return item;
  }

  if (typeof item === "object" && item !== null) {
    const objectItem = item as Record<string, unknown>;

    const possibleName =
      objectItem.name ??
      objectItem.code ??
      objectItem.allergenCode ??
      objectItem.dietaryTypeCode ??
      objectItem.conditionCode ??
      objectItem.ingredientCode;

    if (typeof possibleName === "string") {
      return possibleName;
    }
  }

  return JSON.stringify(item);
}

interface InformationRowProps {
  label: string;
  value: string;
}

function InformationRow({ label, value }: InformationRowProps) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-slate-100 py-4 last:border-b-0">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="text-right text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

interface PreferenceSectionProps {
  title: string;
  emptyText: string;
  items: unknown[];
  icon: React.ReactNode;
}

function PreferenceSection({
  title,
  emptyText,
  items,
  icon,
}: PreferenceSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          {icon}
        </span>

        <div>
          <h4 className="font-semibold text-slate-900">{title}</h4>

          <p className="text-xs text-slate-400">{items.length} ធាតុ</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          {emptyText}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={`${formatUnknownItem(item)}-${index}`}
              className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700"
            >
              {formatUnknownItem(item)}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

export default function MemberProfileDetailPage() {
  const params = useParams<{
    uuid: string;
  }>();

  const uuid = typeof params.uuid === "string" ? params.uuid : "";

  const {
    data: profile,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetMemberProfileByIdQuery(uuid, {
    skip: !uuid,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          <span>កំពុងទាញយកព័ត៌មានគណនី...</span>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/family-profile"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" />
          ត្រឡប់ទៅគណនីគ្រួសារ
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <XCircle className="mx-auto h-10 w-10 text-red-500" />

          <h1 className="mt-3 font-semibold text-red-800">
            មិនអាចទាញយកព័ត៌មានគណនីបានទេ
          </h1>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700"
          >
            ព្យាយាមម្តងទៀត
          </button>
        </div>
      </div>
    );
  }

  const firstLetter = profile.profileName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="mx-auto w-full max-w-6xl pb-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/dashboard/family-profile"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" />
          ត្រឡប់ទៅគណនីគ្រួសារ
        </Link>

        {isFetching && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            កំពុងធ្វើបច្ចុប្បន្នភាព
          </div>
        )}
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="h-28 bg-gradient-to-r from-emerald-500/50 to-teal-500" />

        <div className="px-6 pb-7 sm:px-8">
          <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-4 border-white bg-emerald-100 text-3xl font-bold text-emerald-700 shadow-md">
                {firstLetter}
              </div>

              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-2xl font-bold text-slate-900">
                    {profile.profileName}
                  </h4>

                  {profile.isDefault && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      គណនីលំនាំដើម
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {relationshipLabels[profile.relationship] ??
                    profile.relationship}
                </p>
              </div>
            </div>

            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
                profile.isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {profile.isActive ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}

              {profile.isActive ? "កំពុងប្រើប្រាស់" : "អសកម្ម"}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.4fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <UserRound className="h-5 w-5" />
            </span>

            <h4 className="font-semibold text-slate-900">ព័ត៌មានផ្ទាល់ខ្លួន</h4>
          </div>

          <InformationRow label="ឈ្មោះគណនី" value={profile.profileName} />

          <InformationRow
            label="ទំនាក់ទំនង"
            value={
              relationshipLabels[profile.relationship] ?? profile.relationship
            }
          />

          <InformationRow
            label="ភេទ"
            value={genderLabels[profile.gender] ?? profile.gender}
          />

          <InformationRow
            label="ថ្ងៃខែឆ្នាំកំណើត"
            value={formatDate(profile.dateOfBirth)}
          />

          <InformationRow
            label="ក្រុមអាយុ"
            value={
              profile.ageGroup
                ? `${profile.ageGroup.name} (${profile.ageGroup.minAge ?? "?"}–${profile.ageGroup.maxAge ?? "?"})`
                : "មិនមាន"
            }
          />

          <InformationRow
            label="ភាសាដែលពេញចិត្ត"
            value={
              profile.preferredLanguage === "km"
                ? "ភាសាខ្មែរ"
                : profile.preferredLanguage === "en"
                  ? "English"
                  : profile.preferredLanguage
            }
          />

          <InformationRow
            label="បានបង្កើតនៅ"
            value={formatDate(profile.createdAt)}
          />

          <InformationRow
            label="បានកែប្រែចុងក្រោយ"
            value={formatDate(profile.updatedAt)}
          />
        </section>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <PreferenceSection
            title="ប្រតិកម្មអាឡែហ្ស៊ី"
            emptyText="មិនមានព័ត៌មានអាឡែហ្ស៊ី។"
            items={profile.allergies}
            icon={<ShieldAlert className="h-5 w-5" />}
          />

          <PreferenceSection
            title="ប្រភេទរបបអាហារ"
            emptyText="មិនមានការកំណត់របបអាហារ។"
            items={profile.dietaryTypes}
            icon={<UtensilsCrossed className="h-5 w-5" />}
          />

          <PreferenceSection
            title="ស្ថានភាពសុខភាព"
            emptyText="មិនមានព័ត៌មានស្ថានភាពសុខភាព។"
            items={profile.medicalConditions}
            icon={<HeartPulse className="h-5 w-5" />}
          />

          <PreferenceSection
            title="គ្រឿងផ្សំដែលត្រូវជៀសវាង"
            emptyText="មិនមានគ្រឿងផ្សំដែលត្រូវជៀសវាង។"
            items={profile.ingredientAvoids}
            icon={<Activity className="h-5 w-5" />}
          />
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Globe2 className="h-5 w-5" />
          </span>

          <h4 className="font-semibold text-slate-900">ចំណូលចិត្តផ្សេងៗ</h4>
        </div>

        {profile.preferences ? (
          <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">
            {JSON.stringify(profile.preferences, null, 2)}
          </pre>
        ) : (
          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
            មិនទាន់មានចំណូលចិត្តផ្សេងៗនៅឡើយទេ។
          </p>
        )}
      </section>
    </div>
  );
}
