"use client";

import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { ArrowLeft, ArrowRight, Check, LoaderCircle, X } from "lucide-react";

import {
  useCreateMemberProfileMutation,
  useGetAllergenOptionsQuery,
  useGetDietaryTypeOptionsQuery,
  useGetMedicalConditionOptionsQuery,
  useSaveMemberAllergiesMutation,
  useSaveMemberDietaryTypesMutation,
  useSaveMemberMedicalConditionsMutation,
} from "@/app/store/memberProfileApi";

import type {
  CreateMemberProfileRequest,
  DietaryEnforcementLevel,
  MemberGender,
  MemberRelationship,
  ProfileSeverity,
} from "@/types/member-profile/member-profile";

interface AllergyFormItem {
  allergenCode: string;
  severity: ProfileSeverity;
  reactionNotes: string;
  avoidCrossContact: boolean;
  medicallyDiagnosed: boolean;
}

interface DietaryTypeFormItem {
  dietaryTypeCode: string;
  enforcementLevel: DietaryEnforcementLevel;
  priority: number;
  notes: string;
}

interface MedicalConditionFormItem {
  conditionCode: string;
  severity: ProfileSeverity;
  notes: string;
}

interface CreateProfileForm {
  profileName: string;
  relationship: MemberRelationship;
  gender: MemberGender;
  dateOfBirth: string;
  preferredLanguage: string;
  avatarMediaUuid: string | null;
  isDefault: boolean;
  allergies: AllergyFormItem[];
  dietaryTypes: DietaryTypeFormItem[];
  medicalConditions: MedicalConditionFormItem[];
}

interface CreateMemberProfileModalProps {
  open: boolean;
  onClose: () => void;
}

interface PreferenceSectionProps {
  title: string;
  description: string;
  children: ReactNode;
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

const initialFormState: CreateProfileForm = {
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
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

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
      "មិនអាចរក្សាទុកព័ត៌មានគណនីបានទេ។"
    );
  }

  return "មិនអាចរក្សាទុកព័ត៌មានគណនីបានទេ។";
}

function PreferenceSection({
  title,
  description,
  children,
}: PreferenceSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900">{title}</h3>

        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {children}
    </section>
  );
}

export default function CreateMemberProfileModal({
  open,
  onClose,
}: CreateMemberProfileModalProps) {
  const [step, setStep] = useState<1 | 2>(1);

  const [form, setForm] = useState<CreateProfileForm>(initialFormState);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /*
   * Store the created profile UUID.
   *
   * This prevents duplicate profiles if the profile POST succeeds,
   * but one of the safety PUT requests fails.
   */
  const [createdProfileUuid, setCreatedProfileUuid] = useState<string | null>(
    null,
  );

  const [createMemberProfile, createProfileState] =
    useCreateMemberProfileMutation();

  const [saveMemberAllergies, saveAllergiesState] =
    useSaveMemberAllergiesMutation();

  const [saveMemberDietaryTypes, saveDietaryTypesState] =
    useSaveMemberDietaryTypesMutation();

  const [saveMemberMedicalConditions, saveMedicalConditionsState] =
    useSaveMemberMedicalConditionsMutation();

  /*
   * Only load safety options when Step 2 is visible.
   */
  const shouldLoadSafetyOptions = open && step === 2;

  const {
    data: allergenResponse,
    isLoading: isLoadingAllergens,
    isFetching: isFetchingAllergens,
    isError: isAllergenError,
    refetch: refetchAllergens,
  } = useGetAllergenOptionsQuery(undefined, {
    skip: !shouldLoadSafetyOptions,
  });

  const {
    data: dietaryTypeResponse,
    isLoading: isLoadingDietaryTypes,
    isFetching: isFetchingDietaryTypes,
    isError: isDietaryTypeError,
    refetch: refetchDietaryTypes,
  } = useGetDietaryTypeOptionsQuery(undefined, {
    skip: !shouldLoadSafetyOptions,
  });

  const {
    data: medicalConditionResponse,
    isLoading: isLoadingMedicalConditions,
    isFetching: isFetchingMedicalConditions,
    isError: isMedicalConditionError,
    refetch: refetchMedicalConditions,
  } = useGetMedicalConditionOptionsQuery(undefined, {
    skip: !shouldLoadSafetyOptions,
  });

  const allergenOptions = allergenResponse?.contents ?? [];

  const dietaryTypeOptions = dietaryTypeResponse?.contents ?? [];

  const medicalConditionOptions = medicalConditionResponse?.contents ?? [];

  const isLoadingSafetyOptions =
    isLoadingAllergens ||
    isFetchingAllergens ||
    isLoadingDietaryTypes ||
    isFetchingDietaryTypes ||
    isLoadingMedicalConditions ||
    isFetchingMedicalConditions;

  const hasSafetyOptionError =
    isAllergenError || isDietaryTypeError || isMedicalConditionError;

  const isSubmitting =
    createProfileState.isLoading ||
    saveAllergiesState.isLoading ||
    saveDietaryTypesState.isLoading ||
    saveMedicalConditionsState.isLoading;

  const maxDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  if (!open) {
    return null;
  }

  const resetModal = () => {
    setStep(1);
    setForm(initialFormState);
    setCreatedProfileUuid(null);
    setErrorMessage(null);
  };

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }

    resetModal();
    onClose();
  };

  const retrySafetyOptions = () => {
    setErrorMessage(null);

    void refetchAllergens();
    void refetchDietaryTypes();
    void refetchMedicalConditions();
  };

  const validateStepOne = (): boolean => {
    setErrorMessage(null);

    if (!form.profileName.trim()) {
      setErrorMessage("សូមបញ្ចូលឈ្មោះគណនី។");
      return false;
    }

    if (!form.dateOfBirth) {
      setErrorMessage("សូមជ្រើសរើសថ្ងៃខែឆ្នាំកំណើត។");
      return false;
    }

    return true;
  };

  const handleStepOneSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validateStepOne()) {
      setStep(2);
    }
  };

  /*
   * POST /profiles should only contain basic profile information.
   */
  const buildBasicProfilePayload = (): CreateMemberProfileRequest => ({
    profileName: form.profileName.trim(),
    relationship: form.relationship,
    gender: form.gender,
    dateOfBirth: form.dateOfBirth,
    preferredLanguage: form.preferredLanguage,
    avatarMediaUuid: form.avatarMediaUuid,
    isDefault: form.isDefault,
  });

  const toggleAllergy = (allergenCode: string) => {
    setForm((previous) => {
      const isSelected = previous.allergies.some(
        (item) => item.allergenCode === allergenCode,
      );

      return {
        ...previous,
        allergies: isSelected
          ? previous.allergies.filter(
              (item) => item.allergenCode !== allergenCode,
            )
          : [
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
      const isSelected = previous.dietaryTypes.some(
        (item) => item.dietaryTypeCode === dietaryTypeCode,
      );

      if (isSelected) {
        const remainingItems = previous.dietaryTypes.filter(
          (item) => item.dietaryTypeCode !== dietaryTypeCode,
        );

        return {
          ...previous,
          dietaryTypes: remainingItems.map((item, index) => ({
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
    patch: Partial<DietaryTypeFormItem>,
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
      const isSelected = previous.medicalConditions.some(
        (item) => item.conditionCode === conditionCode,
      );

      return {
        ...previous,
        medicalConditions: isSelected
          ? previous.medicalConditions.filter(
              (item) => item.conditionCode !== conditionCode,
            )
          : [
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
    patch: Partial<MedicalConditionFormItem>,
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

  const submitProfile = async (includeSafetyData: boolean) => {
    if (!validateStepOne()) {
      setStep(1);
      return;
    }

    setErrorMessage(null);

    let profileWasCreated = Boolean(createdProfileUuid);

    try {
      let profileUuid = createdProfileUuid;

      /*
       * Step 1: Create the basic profile.
       */
      if (!profileUuid) {
        const createdProfile = await createMemberProfile(
          buildBasicProfilePayload(),
        ).unwrap();

        profileUuid = createdProfile.uuid;

        if (!profileUuid) {
          throw new Error("Backend did not return the created profile UUID.");
        }

        profileWasCreated = true;
        setCreatedProfileUuid(profileUuid);
      }

      /*
       * Skip button:
       * only create the profile and do not save safety data.
       */
      if (!includeSafetyData) {
        resetModal();
        onClose();
        return;
      }

      /*
       * Step 2: Save selected safety information.
       */
      const safetyRequests: Promise<unknown>[] = [];

      if (form.allergies.length > 0) {
        safetyRequests.push(
          saveMemberAllergies({
            uuid: profileUuid,
            allergies: form.allergies.map((item) => ({
              allergenCode: item.allergenCode,
              severity: item.severity,
              reactionNotes: item.reactionNotes.trim() || null,
              avoidCrossContact: item.avoidCrossContact,
              medicallyDiagnosed: item.medicallyDiagnosed,
            })),
          }).unwrap(),
        );
      }

      if (form.dietaryTypes.length > 0) {
        safetyRequests.push(
          saveMemberDietaryTypes({
            uuid: profileUuid,
            dietaryTypes: form.dietaryTypes.map((item, index) => ({
              dietaryTypeCode: item.dietaryTypeCode,
              enforcementLevel: item.enforcementLevel,
              priority: index + 1,
              notes: item.notes.trim() || null,
            })),
          }).unwrap(),
        );
      }

      if (form.medicalConditions.length > 0) {
        safetyRequests.push(
          saveMemberMedicalConditions({
            uuid: profileUuid,
            medicalConditions: form.medicalConditions.map((item) => ({
              conditionCode: item.conditionCode,
              severity: item.severity,
              notes: item.notes.trim() || null,
            })),
          }).unwrap(),
        );
      }

      await Promise.all(safetyRequests);

      resetModal();
      onClose();
    } catch (error) {
      console.error("CREATE MEMBER PROFILE ERROR:", error);

      const message = getErrorMessage(error);

      if (profileWasCreated) {
        setErrorMessage(
          `គណនីត្រូវបានបង្កើតរួច ប៉ុន្តែមិនអាចរក្សាទុកព័ត៌មានសុវត្ថិភាពបានទេ។ ${message}`,
        );
      } else {
        setErrorMessage(message);
      }
    }
  };

  const handleStepTwoSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await submitProfile(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              បន្ថែមគណនីគ្រួសារ
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {step === 1
                ? "បញ្ចូលព័ត៌មានគណនីមូលដ្ឋាន។"
                : "ជ្រើសរើសចំណូលចិត្ត និងព័ត៌មានសុខភាព។ ផ្នែកនេះមិនចាំបាច់បំពេញទេ។"}
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            disabled={isSubmitting}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="mx-auto flex max-w-xl items-center">
            <div className="flex flex-1 items-center">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                {step === 2 ? <Check className="h-4 w-4" /> : "1"}
              </span>

              <div className="ml-3">
                <p className="text-sm font-semibold text-slate-800">
                  ព័ត៌មានគណនី
                </p>

                <p className="text-xs text-slate-400">តម្រូវឱ្យបំពេញ</p>
              </div>
            </div>

            <div className="mx-4 h-px flex-1 bg-slate-200">
              <div
                className={`h-full bg-emerald-500 transition-all ${
                  step === 2 ? "w-full" : "w-0"
                }`}
              />
            </div>

            <div className="flex flex-1 items-center">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  step === 2
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                2
              </span>

              <div className="ml-3">
                <p
                  className={`text-sm font-semibold ${
                    step === 2 ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  ចំណូលចិត្ត
                </p>

                <p className="text-xs text-slate-400">មិនចាំបាច់</p>
              </div>
            </div>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleStepOneSubmit} className="overflow-y-auto p-6">
            <div className="mx-auto max-w-2xl space-y-5">
              <div>
                <label
                  htmlFor="profileName"
                  className="mb-2 block text-sm font-medium text-slate-700"
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="relationship"
                    className="mb-2 block text-sm font-medium text-slate-700"
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
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
                    className="mb-2 block text-sm font-medium text-slate-700"
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
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {Object.entries(genderLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="dateOfBirth"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    ថ្ងៃខែឆ្នាំកំណើត
                  </label>

                  <input
                    id="dateOfBirth"
                    type="date"
                    value={form.dateOfBirth}
                    max={maxDate}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        dateOfBirth: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="preferredLanguage"
                    className="mb-2 block text-sm font-medium text-slate-700"
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
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="km">ភាសាខ្មែរ</option>

                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <label className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      isDefault: event.target.checked,
                    }))
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />

                <div>
                  <p className="text-sm font-medium text-slate-700">
                    កំណត់ជាគណនីលំនាំដើម
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    គណនីនេះនឹងត្រូវបានប្រើជាលំនាំដើម។
                  </p>
                </div>
              </label>

              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                  បន្តទៅចំណូលចិត្ត
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleStepTwoSubmit} className="overflow-y-auto p-6">
            <div className="space-y-5">
              {isLoadingSafetyOptions ? (
                <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-10 text-slate-500">
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  កំពុងទាញយកជម្រើស...
                </div>
              ) : hasSafetyOptionError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                  <p className="text-sm text-red-700">
                    មិនអាចទាញយកជម្រើសសុវត្ថិភាពបានទេ។
                  </p>

                  <button
                    type="button"
                    onClick={retrySafetyOptions}
                    className="mt-4 rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                  >
                    ព្យាយាមម្តងទៀត
                  </button>
                </div>
              ) : (
                <>
                  <PreferenceSection
                    title="ប្រតិកម្មអាឡែហ្ស៊ី"
                    description="ជ្រើសរើសអាហារ ឬសារធាតុដែលបង្កអាឡែហ្ស៊ី។ អ្នកអាចជ្រើសរើសច្រើន។"
                  >
                    {allergenOptions.length === 0 ? (
                      <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
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
                              className={`rounded-xl border p-4 transition ${
                                isSelected
                                  ? "border-emerald-300 bg-emerald-50/60"
                                  : "border-slate-200 bg-slate-50"
                              }`}
                            >
                              <label className="flex cursor-pointer items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleAllergy(option.code)}
                                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />

                                <span className="min-w-0">
                                  <span className="block font-medium text-slate-800">
                                    {option.localName ||
                                      option.name ||
                                      option.code}
                                  </span>

                                  {option.description && (
                                    <span className="mt-1 block text-sm text-slate-500">
                                      {option.description}
                                    </span>
                                  )}

                                  <span className="mt-1 block text-xs text-slate-400">
                                    Code: {option.code}
                                  </span>
                                </span>
                              </label>

                              {selectedItem && (
                                <div className="mt-4 space-y-3 border-t border-emerald-200 pt-4">
                                  <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
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
                                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
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
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                      ចំណាំអំពីប្រតិកម្ម
                                    </label>

                                    <input
                                      type="text"
                                      value={selectedItem.reactionNotes}
                                      onChange={(event) =>
                                        updateAllergy(option.code, {
                                          reactionNotes: event.target.value,
                                        })
                                      }
                                      placeholder="ឧ. ជៀសវាងសណ្តែកដីទាំងស្រុង"
                                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                                    />
                                  </div>

                                  <div className="flex flex-wrap gap-4">
                                    <label className="flex items-center gap-2 text-sm text-slate-600">
                                      <input
                                        type="checkbox"
                                        checked={selectedItem.avoidCrossContact}
                                        onChange={(event) =>
                                          updateAllergy(option.code, {
                                            avoidCrossContact:
                                              event.target.checked,
                                          })
                                        }
                                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                      />
                                      ជៀសវាងការប៉ះពាល់ឆ្លង
                                    </label>

                                    <label className="flex items-center gap-2 text-sm text-slate-600">
                                      <input
                                        type="checkbox"
                                        checked={
                                          selectedItem.medicallyDiagnosed
                                        }
                                        onChange={(event) =>
                                          updateAllergy(option.code, {
                                            medicallyDiagnosed:
                                              event.target.checked,
                                          })
                                        }
                                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                      />
                                      បានវិនិច្ឆ័យដោយវេជ្ជបណ្ឌិត
                                    </label>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </PreferenceSection>

                  <PreferenceSection
                    title="ប្រភេទរបបអាហារ"
                    description="ជ្រើសរើសរបបអាហារដែលសមាជិកត្រូវការ។ អ្នកអាចជ្រើសរើសច្រើន។"
                  >
                    {dietaryTypeOptions.length === 0 ? (
                      <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                        មិនមានជម្រើសរបបអាហារ។
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {dietaryTypeOptions.map((option) => {
                          const selectedItem = form.dietaryTypes.find(
                            (item) => item.dietaryTypeCode === option.code,
                          );

                          const isSelected = Boolean(selectedItem);

                          return (
                            <div
                              key={option.code}
                              className={`rounded-xl border p-4 transition ${
                                isSelected
                                  ? "border-emerald-300 bg-emerald-50/60"
                                  : "border-slate-200 bg-slate-50"
                              }`}
                            >
                              <label className="flex cursor-pointer items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() =>
                                    toggleDietaryType(option.code)
                                  }
                                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />

                                <span className="min-w-0">
                                  <span className="block font-medium text-slate-800">
                                    {option.localName ||
                                      option.name ||
                                      option.code}
                                  </span>

                                  {option.description && (
                                    <span className="mt-1 block text-sm text-slate-500">
                                      {option.description}
                                    </span>
                                  )}

                                  <span className="mt-1 block text-xs text-slate-400">
                                    Code: {option.code}
                                  </span>
                                </span>
                              </label>

                              {selectedItem && (
                                <div className="mt-4 grid gap-3 border-t border-emerald-200 pt-4 sm:grid-cols-2">
                                  <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
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
                                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
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
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                      ចំណាំ
                                    </label>

                                    <input
                                      type="text"
                                      value={selectedItem.notes}
                                      onChange={(event) =>
                                        updateDietaryType(option.code, {
                                          notes: event.target.value,
                                        })
                                      }
                                      placeholder="ឧ. ត្រូវតែជាអាហារហាឡាល់"
                                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
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

                  <PreferenceSection
                    title="ស្ថានភាពសុខភាព"
                    description="ជ្រើសរើសស្ថានភាពសុខភាពដែលមានឥទ្ធិពលលើការជ្រើសរើសអាហារ។"
                  >
                    {medicalConditionOptions.length === 0 ? (
                      <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                        មិនមានជម្រើសស្ថានភាពសុខភាព។
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {medicalConditionOptions.map((option) => {
                          const selectedItem = form.medicalConditions.find(
                            (item) => item.conditionCode === option.code,
                          );

                          const isSelected = Boolean(selectedItem);

                          return (
                            <div
                              key={option.code}
                              className={`rounded-xl border p-4 transition ${
                                isSelected
                                  ? "border-emerald-300 bg-emerald-50/60"
                                  : "border-slate-200 bg-slate-50"
                              }`}
                            >
                              <label className="flex cursor-pointer items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() =>
                                    toggleMedicalCondition(option.code)
                                  }
                                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />

                                <span className="min-w-0">
                                  <span className="block font-medium text-slate-800">
                                    {option.localName ||
                                      option.name ||
                                      option.code}
                                  </span>

                                  {option.description && (
                                    <span className="mt-1 block text-sm text-slate-500">
                                      {option.description}
                                    </span>
                                  )}

                                  <span className="mt-1 block text-xs text-slate-400">
                                    Code: {option.code}
                                  </span>
                                </span>
                              </label>

                              {selectedItem && (
                                <div className="mt-4 grid gap-3 border-t border-emerald-200 pt-4 sm:grid-cols-2">
                                  <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
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
                                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
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
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                      ចំណាំ
                                    </label>

                                    <input
                                      type="text"
                                      value={selectedItem.notes}
                                      onChange={(event) =>
                                        updateMedicalCondition(option.code, {
                                          notes: event.target.value,
                                        })
                                      }
                                      placeholder="ឧ. ចូលចិត្តអាហារមានជាតិស្ករទាប"
                                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
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
                </>
              )}

              {createdProfileUuid && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  គណនីមូលដ្ឋានត្រូវបានបង្កើតរួច។
                  សូមព្យាយាមរក្សាទុកព័ត៌មានសុវត្ថិភាពម្តងទៀត។
                </div>
              )}

              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setStep(1);
                  }}
                  disabled={isSubmitting || Boolean(createdProfileUuid)}
                  title={
                    createdProfileUuid
                      ? "គណនីត្រូវបានបង្កើតរួច ហើយមិនអាចកែព័ត៌មានមូលដ្ឋានក្នុងជំហាននេះបានទេ។"
                      : undefined
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  ត្រឡប់ក្រោយ
                </button>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => void submitProfile(false)}
                    disabled={isSubmitting}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    រំលង និងបង្កើត
                  </button>

                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      isLoadingSafetyOptions ||
                      hasSafetyOptionError
                    }
                    className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        កំពុងរក្សាទុក...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        បង្កើតគណនី
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
