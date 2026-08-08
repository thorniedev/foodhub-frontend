"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  ArrowLeft,
  Check,
  HeartPulse,
  LoaderCircle,
  RefreshCw,
  Salad,
  Save,
  ShieldAlert,
} from "lucide-react";

import {
  useGetAllergenOptionsQuery,
  useGetDietaryTypeOptionsQuery,
  useGetMedicalConditionOptionsQuery,
  useGetMemberProfileByIdQuery,
  useSaveMemberAllergiesMutation,
  useSaveMemberDietaryTypesMutation,
  useSaveMemberMedicalConditionsMutation,
  useUpdateMemberProfileMutation,
} from "@/app/store/memberProfileApi";

import type {
  DietaryEnforcementLevel,
  MemberGender,
  MemberRelationship,
  ProfileSeverity,
} from "@/types/member-profile/member-profile";

interface ProfileEditFormProps {
  uuid: string;
}

interface AllergyFormItem {
  allergenCode: string;
  severity: ProfileSeverity;
  reactionNotes: string;
  avoidCrossContact: boolean;
  medicallyDiagnosed: boolean;
}

interface DietaryFormItem {
  dietaryTypeCode: string;
  enforcementLevel: DietaryEnforcementLevel;
  priority: number;
  notes: string;
}

interface MedicalFormItem {
  conditionCode: string;
  severity: ProfileSeverity;
  notes: string;
}

interface EditFormState {
  profileName: string;
  relationship: MemberRelationship;
  gender: MemberGender;
  dateOfBirth: string;
  preferredLanguage: string;

  allergies: AllergyFormItem[];
  dietaryTypes: DietaryFormItem[];
  medicalConditions: MedicalFormItem[];
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

const severityLabels: Record<ProfileSeverity, string> = {
  MILD: "កម្រិតស្រាល",
  MODERATE: "កម្រិតមធ្យម",
  SEVERE: "កម្រិតធ្ងន់",
};

const enforcementLabels: Record<DietaryEnforcementLevel, string> = {
  PREFERRED: "ចូលចិត្ត",
  REQUIRED: "តម្រូវឱ្យអនុវត្ត",
};

const initialForm: EditFormState = {
  profileName: "",
  relationship: "OTHER",
  gender: "PREFER_NOT_TO_SAY",
  dateOfBirth: "",
  preferredLanguage: "km",

  allergies: [],
  dietaryTypes: [],
  medicalConditions: [],
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as UnknownRecord;
  }

  return null;
}

function readString(value: unknown, ...keys: string[]): string | null {
  const record = asRecord(value);

  if (!record) {
    return null;
  }

  for (const key of keys) {
    const field = record[key];

    if (typeof field === "string" && field.trim()) {
      return field;
    }
  }

  return null;
}

function readBoolean(value: unknown, key: string): boolean {
  const record = asRecord(value);

  return record?.[key] === true;
}

function readNumber(value: unknown, key: string): number | null {
  const record = asRecord(value);
  const field = record?.[key];

  return typeof field === "number" ? field : null;
}

function normalizeSeverity(value: string | null): ProfileSeverity {
  if (value === "MILD" || value === "MODERATE" || value === "SEVERE") {
    return value;
  }

  return "MODERATE";
}

function normalizeEnforcement(value: string | null): DietaryEnforcementLevel {
  if (value === "PREFERRED" || value === "REQUIRED") {
    return value;
  }

  return "PREFERRED";
}

function normalizeAllergies(value: unknown): AllergyFormItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const code = readString(item, "allergenCode", "code");

    if (!code) {
      return [];
    }

    return [
      {
        allergenCode: code,
        severity: normalizeSeverity(readString(item, "severity")),
        reactionNotes: readString(item, "reactionNotes") ?? "",
        avoidCrossContact: readBoolean(item, "avoidCrossContact"),
        medicallyDiagnosed: readBoolean(item, "medicallyDiagnosed"),
      },
    ];
  });
}

function normalizeDietaryTypes(value: unknown): DietaryFormItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item, index) => {
    const code = readString(item, "dietaryTypeCode", "code");

    if (!code) {
      return [];
    }

    return [
      {
        dietaryTypeCode: code,

        enforcementLevel: normalizeEnforcement(
          readString(item, "enforcementLevel"),
        ),

        priority: readNumber(item, "priority") ?? index + 1,

        notes: readString(item, "notes") ?? "",
      },
    ];
  });
}

function normalizeMedicalConditions(value: unknown): MedicalFormItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    const code = readString(item, "conditionCode", "code");

    if (!code) {
      return [];
    }

    return [
      {
        conditionCode: code,

        severity: normalizeSeverity(readString(item, "severity")),

        notes: readString(item, "notes") ?? "",
      },
    ];
  });
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (
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
      data?.backendResponse?.message ??
      data?.message ??
      "មិនអាចរក្សាទុកការផ្លាស់ប្តូរបានទេ។"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "មិនអាចរក្សាទុកការផ្លាស់ប្តូរបានទេ។";
}

async function clearSafetySection(
  uuid: string,
  section: "allergies" | "dietary-types" | "medical-conditions",
) {
  const response = await fetch(
    `/api/profiles/${encodeURIComponent(uuid)}/safety/${section}`,
    {
      method: "DELETE",

      headers: {
        Accept: "application/json",
      },

      credentials: "include",
    },
  );

  if (!response.ok) {
    let message = "មិនអាចលុបព័ត៌មានសុវត្ថិភាពបានទេ។";

    try {
      const data = await response.json();

      if (data && typeof data.message === "string") {
        message = data.message;
      }
    } catch {
      // Ignore empty DELETE response.
    }

    throw new Error(message);
  }
}

function PreferenceSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          {icon}
        </div>

        <div>
          <h2 className="text-[22px] font-bold text-slate-900">{title}</h2>

          <p className="mt-1 text-[17px] leading-7 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

export default function ProfileEditForm({ uuid }: ProfileEditFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<EditFormState>(initialForm);

  const [initializedProfileUuid, setInitializedProfileUuid] = useState<
    string | null
  >(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useGetMemberProfileByIdQuery(uuid);

  const {
    data: allergenResponse,
    isLoading: isLoadingAllergens,
    isFetching: isFetchingAllergens,
    isError: isAllergenError,
    refetch: refetchAllergens,
  } = useGetAllergenOptionsQuery();

  const {
    data: dietaryResponse,
    isLoading: isLoadingDietary,
    isFetching: isFetchingDietary,
    isError: isDietaryError,
    refetch: refetchDietary,
  } = useGetDietaryTypeOptionsQuery();

  const {
    data: medicalResponse,
    isLoading: isLoadingMedical,
    isFetching: isFetchingMedical,
    isError: isMedicalError,
    refetch: refetchMedical,
  } = useGetMedicalConditionOptionsQuery();

  const [updateMemberProfile, updateProfileState] =
    useUpdateMemberProfileMutation();

  const [saveMemberAllergies, saveAllergiesState] =
    useSaveMemberAllergiesMutation();

  const [saveMemberDietaryTypes, saveDietaryState] =
    useSaveMemberDietaryTypesMutation();

  const [saveMemberMedicalConditions, saveMedicalState] =
    useSaveMemberMedicalConditionsMutation();

  const maxDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  const allergenOptions = allergenResponse?.contents ?? [];

  const dietaryOptions = dietaryResponse?.contents ?? [];

  const medicalOptions = medicalResponse?.contents ?? [];

  const isLoadingSafetyOptions =
    isLoadingAllergens ||
    isFetchingAllergens ||
    isLoadingDietary ||
    isFetchingDietary ||
    isLoadingMedical ||
    isFetchingMedical;

  const hasSafetyOptionError =
    isAllergenError || isDietaryError || isMedicalError;

  const isSaving =
    updateProfileState.isLoading ||
    saveAllergiesState.isLoading ||
    saveDietaryState.isLoading ||
    saveMedicalState.isLoading;

  /*
   * Load existing profile into the edit form.
   */
  useEffect(() => {
    if (!profile || initializedProfileUuid === profile.uuid) {
      return;
    }

    setForm({
      profileName: profile.profileName,

      relationship: profile.relationship,

      gender: profile.gender,

      dateOfBirth: profile.dateOfBirth ?? "",

      preferredLanguage: profile.preferredLanguage || "km",

      allergies: normalizeAllergies(profile.allergies),

      dietaryTypes: normalizeDietaryTypes(profile.dietaryTypes),

      medicalConditions: normalizeMedicalConditions(profile.medicalConditions),
    });

    setInitializedProfileUuid(profile.uuid);
  }, [profile, initializedProfileUuid]);

  const toggleAllergy = (allergenCode: string) => {
    setForm((previous) => {
      const exists = previous.allergies.some(
        (item) => item.allergenCode === allergenCode,
      );

      if (exists) {
        return {
          ...previous,

          allergies: previous.allergies.filter(
            (item) => item.allergenCode !== allergenCode,
          ),
        };
      }

      return {
        ...previous,

        allergies: [
          ...previous.allergies,

          {
            allergenCode,
            severity: "MODERATE",
            reactionNotes: "",
            avoidCrossContact: false,
            medicallyDiagnosed: false,
          },
        ],
      };
    });
  };

  const updateAllergy = (
    allergenCode: string,
    patch: Partial<AllergyFormItem>,
  ) => {
    setForm((previous) => ({
      ...previous,

      allergies: previous.allergies.map((item) =>
        item.allergenCode === allergenCode
          ? {
              ...item,
              ...patch,
            }
          : item,
      ),
    }));
  };

  const toggleDietaryType = (dietaryTypeCode: string) => {
    setForm((previous) => {
      const exists = previous.dietaryTypes.some(
        (item) => item.dietaryTypeCode === dietaryTypeCode,
      );

      if (exists) {
        const nextItems = previous.dietaryTypes.filter(
          (item) => item.dietaryTypeCode !== dietaryTypeCode,
        );

        return {
          ...previous,

          dietaryTypes: nextItems.map((item, index) => ({
            ...item,
            priority: index + 1,
          })),
        };
      }

      return {
        ...previous,

        dietaryTypes: [
          ...previous.dietaryTypes,

          {
            dietaryTypeCode,

            enforcementLevel: "PREFERRED",

            priority: previous.dietaryTypes.length + 1,

            notes: "",
          },
        ],
      };
    });
  };

  const updateDietaryType = (
    dietaryTypeCode: string,
    patch: Partial<DietaryFormItem>,
  ) => {
    setForm((previous) => ({
      ...previous,

      dietaryTypes: previous.dietaryTypes.map((item) =>
        item.dietaryTypeCode === dietaryTypeCode
          ? {
              ...item,
              ...patch,
            }
          : item,
      ),
    }));
  };

  const toggleMedicalCondition = (conditionCode: string) => {
    setForm((previous) => {
      const exists = previous.medicalConditions.some(
        (item) => item.conditionCode === conditionCode,
      );

      if (exists) {
        return {
          ...previous,

          medicalConditions: previous.medicalConditions.filter(
            (item) => item.conditionCode !== conditionCode,
          ),
        };
      }

      return {
        ...previous,

        medicalConditions: [
          ...previous.medicalConditions,

          {
            conditionCode,
            severity: "MODERATE",
            notes: "",
          },
        ],
      };
    });
  };

  const updateMedicalCondition = (
    conditionCode: string,
    patch: Partial<MedicalFormItem>,
  ) => {
    setForm((previous) => ({
      ...previous,

      medicalConditions: previous.medicalConditions.map((item) =>
        item.conditionCode === conditionCode
          ? {
              ...item,
              ...patch,
            }
          : item,
      ),
    }));
  };

  const retrySafetyOptions = () => {
    void refetchAllergens();
    void refetchDietary();
    void refetchMedical();
  };

  const handleSave = async () => {
    if (!profile) {
      return;
    }

    setErrorMessage(null);

    if (!form.profileName.trim()) {
      setErrorMessage("សូមបញ្ចូលឈ្មោះគណនី។");
      return;
    }

    if (!form.dateOfBirth) {
      setErrorMessage("សូមជ្រើសរើសថ្ងៃខែឆ្នាំកំណើត។");
      return;
    }

    /*
     * Do not save while safety options failed to load.
     *
     * Otherwise an empty local array could accidentally
     * clear the user's saved preferences.
     */
    if (hasSafetyOptionError) {
      setErrorMessage("សូមទាញយកជម្រើសសុវត្ថិភាពឡើងវិញ មុនពេលរក្សាទុក។");
      return;
    }

    try {
      /*
       * ==================================================
       * 1. PATCH BASIC PROFILE
       * ==================================================
       */

      const basicPatch: {
        profileName?: string;
        relationship?: MemberRelationship;
        gender?: MemberGender;
        dateOfBirth?: string;
        preferredLanguage?: string;
      } = {};

      if (form.profileName.trim() !== profile.profileName) {
        basicPatch.profileName = form.profileName.trim();
      }

      /*
       * SELF relationship should not be
       * changed to another relationship.
       */
      if (
        profile.relationship !== "SELF" &&
        form.relationship !== profile.relationship
      ) {
        basicPatch.relationship = form.relationship;
      }

      if (form.gender !== profile.gender) {
        basicPatch.gender = form.gender;
      }

      if (form.dateOfBirth !== profile.dateOfBirth) {
        basicPatch.dateOfBirth = form.dateOfBirth;
      }

      if (form.preferredLanguage !== profile.preferredLanguage) {
        basicPatch.preferredLanguage = form.preferredLanguage;
      }

      if (Object.keys(basicPatch).length > 0) {
        await updateMemberProfile({
          uuid,
          body: basicPatch,
        }).unwrap();
      }

      /*
       * ==================================================
       * 2. ALLERGIES
       * ==================================================
       */

      const originalAllergyCount = profile.allergies?.length ?? 0;

      if (form.allergies.length > 0) {
        await saveMemberAllergies({
          uuid,

          allergies: form.allergies.map((item) => ({
            allergenCode: item.allergenCode,

            severity: item.severity,

            reactionNotes: item.reactionNotes.trim() || null,

            avoidCrossContact: item.avoidCrossContact,

            medicallyDiagnosed: item.medicallyDiagnosed,
          })),
        }).unwrap();
      } else if (originalAllergyCount > 0) {
        await clearSafetySection(uuid, "allergies");
      }

      /*
       * ==================================================
       * 3. DIETARY TYPES
       * ==================================================
       */

      const originalDietaryCount = profile.dietaryTypes?.length ?? 0;

      if (form.dietaryTypes.length > 0) {
        await saveMemberDietaryTypes({
          uuid,

          dietaryTypes: form.dietaryTypes.map((item, index) => ({
            dietaryTypeCode: item.dietaryTypeCode,

            enforcementLevel: item.enforcementLevel,

            priority: index + 1,

            notes: item.notes.trim() || null,
          })),
        }).unwrap();
      } else if (originalDietaryCount > 0) {
        await clearSafetySection(uuid, "dietary-types");
      }

      /*
       * ==================================================
       * 4. MEDICAL CONDITIONS
       * ==================================================
       */

      const originalMedicalCount = profile.medicalConditions?.length ?? 0;

      if (form.medicalConditions.length > 0) {
        await saveMemberMedicalConditions({
          uuid,

          medicalConditions: form.medicalConditions.map((item) => ({
            conditionCode: item.conditionCode,

            severity: item.severity,

            notes: item.notes.trim() || null,
          })),
        }).unwrap();
      } else if (originalMedicalCount > 0) {
        await clearSafetySection(uuid, "medical-conditions");
      }

      /*
       * Refresh the profile because the DELETE
       * requests above do not pass through RTK Query.
       */
      await refetchProfile();

      router.replace(`/dashboard/family-profile/${uuid}`);

      router.refresh();
    } catch (error) {
      console.error("UPDATE MEMBER PROFILE ERROR:", error);

      setErrorMessage(getErrorMessage(error));
    }
  };

  if (isLoadingProfile) {
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

  if (isProfileError || !profile) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-7">
          <p className="text-[18px] font-semibold text-red-700">
            មិនអាចទាញយកព័ត៌មានគណនីបានទេ។
          </p>

          <button
            type="button"
            onClick={() => void refetchProfile()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-[17px] font-medium text-white"
          >
            <RefreshCw className="h-5 w-5" />
            ព្យាយាមម្តងទៀត
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}

      <Link
        href={`/dashboard/family-profile/${uuid}`}
        className="inline-flex items-center gap-2 text-[17px] font-medium text-slate-600 transition hover:text-emerald-700"
      >
        <ArrowLeft className="h-5 w-5" />
        ត្រឡប់ទៅព័ត៌មានលម្អិត
      </Link>

      {/* Header */}

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h4 className="text-[28px] font-bold text-slate-900 sm:text-[32px]">
            កែប្រែគណនី
          </h4>

          <p className="mt-2 max-w-2xl text-[17px] leading-7 text-slate-500">
            កែប្រែព័ត៌មានផ្ទាល់ខ្លួន និងចំណូលចិត្តអាហាររបស់{" "}
            <span className="font-semibold text-slate-700">
              {profile.profileName}
            </span>
            ។
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving || isLoadingSafetyOptions}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-[17px] font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? (
            <>
              <LoaderCircle className="h-5 w-5 animate-spin" />
              កំពុងរក្សាទុក...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              រក្សាទុកការផ្លាស់ប្តូរ
            </>
          )}
        </button>
      </div>

      {/* Basic info */}

      <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
        <div>
          <h2 className="text-[23px] font-bold text-slate-900">ព័ត៌មានគណនី</h2>

          <p className="mt-2 text-[17px] text-slate-500">
            កែប្រែព័ត៌មានមូលដ្ឋានរបស់សមាជិក។
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Name */}

          <div className="md:col-span-2">
            <label
              htmlFor="edit-profile-name"
              className="mb-2 block text-[17px] font-semibold text-slate-700"
            >
              ឈ្មោះគណនី
            </label>

            <input
              id="edit-profile-name"
              value={form.profileName}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  profileName: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[17px] text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Relationship */}

          <div>
            <label
              htmlFor="edit-relationship"
              className="mb-2 block text-[17px] font-semibold text-slate-700"
            >
              ទំនាក់ទំនង
            </label>

            <select
              id="edit-relationship"
              value={form.relationship}
              disabled={profile.relationship === "SELF"}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,

                  relationship: event.target.value as MemberRelationship,
                }))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[17px] text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            >
              {Object.entries(relationshipLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            {profile.relationship === "SELF" && (
              <p className="mt-2 text-[17px] leading-7 text-slate-500">
                គណនីខ្លួនឯងមិនអាចប្តូរទំនាក់ទំនងទៅជាសមាជិកផ្សេងបានទេ។
              </p>
            )}
          </div>

          {/* Gender */}

          <div>
            <label
              htmlFor="edit-gender"
              className="mb-2 block text-[17px] font-semibold text-slate-700"
            >
              ភេទ
            </label>

            <select
              id="edit-gender"
              value={form.gender}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,

                  gender: event.target.value as MemberGender,
                }))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[17px] text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              {Object.entries(genderLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* DOB */}

          <div>
            <label
              htmlFor="edit-dob"
              className="mb-2 block text-[17px] font-semibold text-slate-700"
            >
              ថ្ងៃខែឆ្នាំកំណើត
            </label>

            <input
              id="edit-dob"
              type="date"
              max={maxDate}
              value={form.dateOfBirth}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,

                  dateOfBirth: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[17px] text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Language */}

          <div>
            <label
              htmlFor="edit-language"
              className="mb-2 block text-[17px] font-semibold text-slate-700"
            >
              ភាសាដែលពេញចិត្ត
            </label>

            <select
              id="edit-language"
              value={form.preferredLanguage}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,

                  preferredLanguage: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[17px] text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="km">ភាសាខ្មែរ</option>

              <option value="en">English</option>
            </select>
          </div>
        </div>
      </section>

      {/* Safety load error */}

      {hasSafetyOptionError && (
        <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-red-600" />

            <div>
              <p className="text-[18px] font-semibold text-red-700">
                មិនអាចទាញយកជម្រើសសុវត្ថិភាពបានទេ។
              </p>

              <p className="mt-2 text-[17px] leading-7 text-red-600">
                សូមព្យាយាមទាញយកឡើងវិញ មុនពេលរក្សាទុកការផ្លាស់ប្តូរ។
              </p>

              <button
                type="button"
                onClick={retrySafetyOptions}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[17px] font-semibold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100"
              >
                <RefreshCw className="h-5 w-5" />
                ព្យាយាមម្តងទៀត
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}

      {/* Loading safety options */}

      {isLoadingSafetyOptions && !hasSafetyOptionError && (
        <div className="mt-6 flex min-h-[220px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <div className="text-center">
            <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-emerald-600" />

            <p className="mt-3 text-[17px] text-slate-500">
              កំពុងទាញយកជម្រើសចំណូលចិត្ត...
            </p>
          </div>
        </div>
      )}

      {/* Safety preference sections */}

      {!isLoadingSafetyOptions && !hasSafetyOptionError && (
        <div className="mt-6 space-y-6">
          {/* Allergies */}

          <PreferenceSection
            title="ប្រតិកម្មអាឡែហ្ស៊ី"
            description="ជ្រើសរើសអាហារ ឬសារធាតុដែលអាចបង្កអាឡែហ្ស៊ី។ អ្នកអាចជ្រើសរើសច្រើន។"
            icon={<ShieldAlert className="h-6 w-6" />}
          >
            {allergenOptions.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-[17px] text-slate-500">
                មិនមានជម្រើសអាឡែហ្ស៊ី។
              </p>
            ) : (
              <div className="space-y-3">
                {allergenOptions.map((option) => {
                  const selectedItem = form.allergies.find(
                    (item) => item.allergenCode === option.code,
                  );

                  const isSelected = Boolean(selectedItem);

                  return (
                    <div
                      key={option.code}
                      className={`rounded-2xl border p-4 transition ${
                        isSelected
                          ? "border-emerald-300 bg-emerald-50/60"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <label className="flex cursor-pointer items-start gap-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleAllergy(option.code)}
                          className="mt-1.5 h-5 w-5 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />

                        <span>
                          <span className="block text-[18px] font-semibold text-slate-900">
                            {option.localName || option.name || option.code}
                          </span>

                          {option.description && (
                            <span className="mt-1 block text-[17px] leading-7 text-slate-500">
                              {option.description}
                            </span>
                          )}
                        </span>
                      </label>

                      {selectedItem && (
                        <div className="mt-5 grid gap-4 border-t border-emerald-200 pt-5 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-[17px] font-semibold text-slate-700">
                              កម្រិតធ្ងន់ធ្ងរ
                            </label>

                            <select
                              value={selectedItem.severity}
                              onChange={(event) =>
                                updateAllergy(option.code, {
                                  severity: event.target
                                    .value as ProfileSeverity,
                                })
                              }
                              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[17px]"
                            >
                              {Object.entries(severityLabels).map(
                                ([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ),
                              )}
                            </select>
                          </div>

                          <div>
                            <label className="mb-2 block text-[17px] font-semibold text-slate-700">
                              ចំណាំអំពីប្រតិកម្ម
                            </label>

                            <input
                              value={selectedItem.reactionNotes}
                              onChange={(event) =>
                                updateAllergy(option.code, {
                                  reactionNotes: event.target.value,
                                })
                              }
                              placeholder="បញ្ចូលចំណាំ"
                              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[17px]"
                            />
                          </div>

                          <label className="flex cursor-pointer items-center gap-3 text-[17px] text-slate-700">
                            <input
                              type="checkbox"
                              checked={selectedItem.avoidCrossContact}
                              onChange={(event) =>
                                updateAllergy(option.code, {
                                  avoidCrossContact: event.target.checked,
                                })
                              }
                              className="h-5 w-5"
                            />
                            ជៀសវាងការប៉ះពាល់ឆ្លង
                          </label>

                          <label className="flex cursor-pointer items-center gap-3 text-[17px] text-slate-700">
                            <input
                              type="checkbox"
                              checked={selectedItem.medicallyDiagnosed}
                              onChange={(event) =>
                                updateAllergy(option.code, {
                                  medicallyDiagnosed: event.target.checked,
                                })
                              }
                              className="h-5 w-5"
                            />
                            បានវិនិច្ឆ័យដោយវេជ្ជបណ្ឌិត
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </PreferenceSection>

          {/* Dietary */}

          <PreferenceSection
            title="ប្រភេទរបបអាហារ"
            description="ជ្រើសរើសរបបអាហារ ឬច្បាប់អាហារដែលគណនីនេះត្រូវការ។"
            icon={<Salad className="h-6 w-6" />}
          >
            {dietaryOptions.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-[17px] text-slate-500">
                មិនមានជម្រើសរបបអាហារ។
              </p>
            ) : (
              <div className="space-y-3">
                {dietaryOptions.map((option) => {
                  const selectedItem = form.dietaryTypes.find(
                    (item) => item.dietaryTypeCode === option.code,
                  );

                  const isSelected = Boolean(selectedItem);

                  return (
                    <div
                      key={option.code}
                      className={`rounded-2xl border p-4 ${
                        isSelected
                          ? "border-emerald-300 bg-emerald-50/60"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <label className="flex cursor-pointer items-start gap-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleDietaryType(option.code)}
                          className="mt-1.5 h-5 w-5 shrink-0"
                        />

                        <span>
                          <span className="block text-[18px] font-semibold text-slate-900">
                            {option.localName || option.name || option.code}
                          </span>

                          {option.description && (
                            <span className="mt-1 block text-[17px] leading-7 text-slate-500">
                              {option.description}
                            </span>
                          )}
                        </span>
                      </label>

                      {selectedItem && (
                        <div className="mt-5 grid gap-4 border-t border-emerald-200 pt-5 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-[17px] font-semibold text-slate-700">
                              កម្រិតតម្រូវការ
                            </label>

                            <select
                              value={selectedItem.enforcementLevel}
                              onChange={(event) =>
                                updateDietaryType(option.code, {
                                  enforcementLevel: event.target
                                    .value as DietaryEnforcementLevel,
                                })
                              }
                              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[17px]"
                            >
                              {Object.entries(enforcementLabels).map(
                                ([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ),
                              )}
                            </select>
                          </div>

                          <div>
                            <label className="mb-2 block text-[17px] font-semibold text-slate-700">
                              ចំណាំ
                            </label>

                            <input
                              value={selectedItem.notes}
                              onChange={(event) =>
                                updateDietaryType(option.code, {
                                  notes: event.target.value,
                                })
                              }
                              placeholder="បញ្ចូលចំណាំ"
                              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[17px]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </PreferenceSection>

          {/* Medical */}

          <PreferenceSection
            title="ស្ថានភាពសុខភាព"
            description="ជ្រើសរើសស្ថានភាពសុខភាពដែលអាចមានឥទ្ធិពលលើការណែនាំអាហារ។"
            icon={<HeartPulse className="h-6 w-6" />}
          >
            {medicalOptions.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-[17px] text-slate-500">
                មិនមានជម្រើសសុខភាព។
              </p>
            ) : (
              <div className="space-y-3">
                {medicalOptions.map((option) => {
                  const selectedItem = form.medicalConditions.find(
                    (item) => item.conditionCode === option.code,
                  );

                  const isSelected = Boolean(selectedItem);

                  return (
                    <div
                      key={option.code}
                      className={`rounded-2xl border p-4 ${
                        isSelected
                          ? "border-emerald-300 bg-emerald-50/60"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <label className="flex cursor-pointer items-start gap-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleMedicalCondition(option.code)}
                          className="mt-1.5 h-5 w-5 shrink-0"
                        />

                        <span>
                          <span className="block text-[18px] font-semibold text-slate-900">
                            {option.localName || option.name || option.code}
                          </span>

                          {option.description && (
                            <span className="mt-1 block text-[17px] leading-7 text-slate-500">
                              {option.description}
                            </span>
                          )}
                        </span>
                      </label>

                      {selectedItem && (
                        <div className="mt-5 grid gap-4 border-t border-emerald-200 pt-5 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-[17px] font-semibold text-slate-700">
                              កម្រិតធ្ងន់ធ្ងរ
                            </label>

                            <select
                              value={selectedItem.severity}
                              onChange={(event) =>
                                updateMedicalCondition(option.code, {
                                  severity: event.target
                                    .value as ProfileSeverity,
                                })
                              }
                              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[17px]"
                            >
                              {Object.entries(severityLabels).map(
                                ([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ),
                              )}
                            </select>
                          </div>

                          <div>
                            <label className="mb-2 block text-[17px] font-semibold text-slate-700">
                              ចំណាំ
                            </label>

                            <input
                              value={selectedItem.notes}
                              onChange={(event) =>
                                updateMedicalCondition(option.code, {
                                  notes: event.target.value,
                                })
                              }
                              placeholder="បញ្ចូលចំណាំ"
                              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[17px]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </PreferenceSection>
        </div>
      )}

      {/* Error */}

      {errorMessage && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
          <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-red-600" />

          <p className="text-[17px] leading-7 text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Bottom actions */}

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
        <Link
          href={`/dashboard/family-profile/${uuid}`}
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-[17px] font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          បោះបង់
        </Link>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving || isLoadingSafetyOptions || hasSafetyOptionError}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-[17px] font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? (
            <>
              <LoaderCircle className="h-5 w-5 animate-spin" />
              កំពុងរក្សាទុក...
            </>
          ) : (
            <>
              <Check className="h-5 w-5" />
              រក្សាទុកការផ្លាស់ប្តូរ
            </>
          )}
        </button>
      </div>
    </div>
  );
}
