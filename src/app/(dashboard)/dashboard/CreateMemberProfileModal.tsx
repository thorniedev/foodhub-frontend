"use client";

import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  HeartPulse,
  Languages,
  LoaderCircle,
  Salad,
  ShieldAlert,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

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
  icon: ReactNode;
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
  relationship: "SELF",
  gender: "MALE",
  dateOfBirth: "",
  preferredLanguage: "km",
  avatarMediaUuid: null,
  isDefault: true,
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
  icon,
  children,
}: PreferenceSectionProps) {
  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-start gap-4 border-b border-slate-100 pb-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-800/10 text-primary-800">
          {icon}
        </div>

        <div className="min-w-0">
          <h3 className="text-2xl font-bold text-primary-800">{title}</h3>
          <p className="mt-2 text-lg leading-7 text-slate-500">{description}</p>
        </div>
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
    isDefault: form.relationship === "SELF" ? true : form.isDefault,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] border border-white/70 bg-slate-50 shadow-[0_30px_100px_rgba(15,23,42,0.25)]">
        {/* Header */}
        <header className="flex shrink-0 items-start justify-between gap-5 border-b border-slate-200/80 bg-white px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex min-w-0 items-start gap-4">
            <div className="hidden h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-primary-800 text-white shadow-sm sm:flex">
              <UserRound className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-primary-800 sm:text-[28px]">
                  បន្ថែមគណនីគ្រួសារ
                </h2>

                <span className="rounded-full bg-primary-800/10 px-3 py-1 text-lg font-semibold text-primary-800">
                  ជំហាន {step}/2
                </span>
              </div>

              <p className="mt-2 text-lg leading-7 text-slate-500">
                {step === 1
                  ? "បញ្ចូលព័ត៌មានមូលដ្ឋានរបស់សមាជិក។"
                  : "ជ្រើសរើសចំណូលចិត្តអាហារ និងព័ត៌មានសុខភាព។ ផ្នែកនេះអាចរំលងបាន។"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            disabled={isSubmitting}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Steps */}
        <div className="shrink-0 border-b border-slate-200/80 bg-white px-5 py-4 sm:px-7">
          <div className="mx-auto grid max-w-3xl grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-800 text-lg font-bold text-white shadow-sm">
                {step === 2 ? <Check className="h-5 w-5" /> : "1"}
              </span>

              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-lg font-bold text-slate-800">
                  ព័ត៌មានគណនី
                </p>
                <p className="text-lg text-slate-400">តម្រូវឱ្យបំពេញ</p>
              </div>
            </div>

            <div className="h-1 w-12 overflow-hidden rounded-full bg-slate-200 sm:w-28">
              <div
                className={`h-full rounded-full bg-primary-800 transition-all duration-300 ${
                  step === 2 ? "w-full" : "w-0"
                }`}
              />
            </div>

            <div className="flex min-w-0 items-center justify-end gap-3">
              <div className="hidden min-w-0 text-right sm:block">
                <p
                  className={`truncate text-lg font-bold ${
                    step === 2 ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  ចំណូលចិត្ត
                </p>
                <p className="text-lg text-slate-400">មិនចាំបាច់</p>
              </div>

              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-bold transition ${
                  step === 2
                    ? "bg-primary-800 text-white shadow-sm"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                2
              </span>
            </div>
          </div>
        </div>

        {step === 1 ? (
          <form
            onSubmit={handleStepOneSubmit}
            className="overflow-y-auto px-4 py-6 sm:px-7 sm:py-7"
          >
            <div className="mx-auto max-w-3xl">
              <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-7 flex items-start gap-4 border-b border-slate-100 pb-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-800/10 text-primary-800">
                    <UserRound className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-primary-800">
                      ព័ត៌មានគណនី
                    </h3>
                    <p className="mt-2 text-lg leading-7 text-slate-500">
                      បញ្ចូលព័ត៌មានមូលដ្ឋានសម្រាប់សមាជិកគ្រួសារ។
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                  {/* Name */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="profileName"
                      className="mb-2.5 block text-lg font-semibold text-slate-700"
                    >
                      ឈ្មោះគណនី
                    </label>

                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

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
                        className="min-h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-4 text-lg font-medium text-primary-800 outline-none transition-all duration-200 placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-primary-800 focus:bg-white focus:ring-4 focus:ring-primary-800/10"
                        required
                      />
                    </div>
                  </div>

                  {/* Relationship */}
                  <div>
                    <label
                      htmlFor="relationship"
                      className="mb-2.5 block text-lg font-semibold text-slate-700"
                    >
                      ទំនាក់ទំនង
                    </label>

                    <div className="relative">
                      <UsersRound className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <select
                        id="relationship"
                        value={form.relationship}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            relationship: event.target
                              .value as MemberRelationship,
                          }))
                        }
                        className="min-h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-12 text-lg font-medium text-primary-800 outline-none transition-all duration-200 hover:border-slate-300 hover:bg-white focus:border-primary-800 focus:bg-white focus:ring-4 focus:ring-primary-800/10"
                      >
                        {Object.entries(relationshipLabels).map(
                          ([value, label]) => (
                            <option
                              key={value}
                              value={value}
                              className="bg-white text-lg text-slate-700"
                            >
                              {label}
                            </option>
                          ),
                        )}
                      </select>

                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label
                      htmlFor="gender"
                      className="mb-2.5 block text-lg font-semibold text-slate-700"
                    >
                      ភេទ
                    </label>

                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <select
                        id="gender"
                        value={form.gender}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            gender: event.target.value as MemberGender,
                          }))
                        }
                        className="min-h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-12 text-lg font-medium text-primary-800 outline-none transition-all duration-200 hover:border-slate-300 hover:bg-white focus:border-primary-800 focus:bg-white focus:ring-4 focus:ring-primary-800/10"
                      >
                        {Object.entries(genderLabels).map(([value, label]) => (
                          <option
                            key={value}
                            value={value}
                            className="bg-white text-lg text-slate-700"
                          >
                            {label}
                          </option>
                        ))}
                      </select>

                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    </div>
                  </div>

                  {/* DOB */}
                  <div>
                    <label
                      htmlFor="dateOfBirth"
                      className="mb-2.5 block text-lg font-semibold text-slate-700"
                    >
                      ថ្ងៃខែឆ្នាំកំណើត
                    </label>

                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400" />

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
                        className="min-h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-4 text-lg font-medium text-primary-800 outline-none transition-all duration-200 hover:border-slate-300 hover:bg-white focus:border-primary-800 focus:bg-white focus:ring-4 focus:ring-primary-800/10"
                        required
                      />
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <label
                      htmlFor="preferredLanguage"
                      className="mb-2.5 block text-lg font-semibold text-slate-700"
                    >
                      ភាសាដែលពេញចិត្ត
                    </label>

                    <div className="relative">
                      <Languages className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <select
                        id="preferredLanguage"
                        value={form.preferredLanguage}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            preferredLanguage: event.target.value,
                          }))
                        }
                        className="min-h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-12 text-lg font-medium text-primary-800 outline-none transition-all duration-200 hover:border-slate-300 hover:bg-white focus:border-primary-800 focus:bg-white focus:ring-4 focus:ring-primary-800/10"
                      >
                        <option value="km" className="text-lg">
                          ភាសាខ្មែរ
                        </option>
                        <option value="en" className="text-lg">
                          English
                        </option>
                      </select>

                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    </div>
                  </div>

                  {/* Default profile */}
                  <label className="flex cursor-pointer items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-slate-300 hover:bg-white sm:col-span-2">
                    <div>
                      <p className="text-lg font-semibold text-slate-700">
                        កំណត់ជាគណនីលំនាំដើម
                      </p>
                      <p className="mt-1 text-lg leading-7 text-slate-500">
                        គណនីនេះនឹងត្រូវបានប្រើជាលំនាំដើមសម្រាប់ការណែនាំអាហារ។
                      </p>
                    </div>

                    <div className="relative shrink-0">
                      <input
                        type="checkbox"
                        checked={form.isDefault}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            isDefault: event.target.checked,
                          }))
                        }
                        className="peer sr-only"
                      />
                      <div className="h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-primary-800 peer-focus-visible:ring-4 peer-focus-visible:ring-primary-800/20 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:content-[''] peer-checked:after:translate-x-5" />
                    </div>
                  </label>
                </div>
              </section>

              {errorMessage && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-lg leading-7 text-red-700">
                  {errorMessage}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-primary-800 px-7 py-3 text-lg font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-900 hover:shadow-md"
                >
                  បន្តទៅចំណូលចិត្ត
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleStepTwoSubmit}
            className="overflow-y-auto px-4 py-6 sm:px-7 sm:py-7"
          >
            <div className="mx-auto max-w-4xl space-y-6">
              {isLoadingSafetyOptions ? (
                <div className="flex min-h-52 items-center justify-center gap-3 rounded-[28px] border border-slate-200 bg-white p-10 text-lg text-slate-500 shadow-sm">
                  <LoaderCircle className="h-6 w-6 animate-spin text-primary-800" />
                  កំពុងទាញយកជម្រើស...
                </div>
              ) : hasSafetyOptionError ? (
                <div className="rounded-[28px] border border-red-200 bg-red-50 p-6">
                  <p className="text-lg font-semibold text-red-700">
                    មិនអាចទាញយកជម្រើសសុវត្ថិភាពបានទេ។
                  </p>

                  <button
                    type="button"
                    onClick={retrySafetyOptions}
                    className="mt-4 rounded-full border border-red-300 bg-white px-5 py-3 text-lg font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    ព្យាយាមម្តងទៀត
                  </button>
                </div>
              ) : (
                <>
                  {/* Allergies */}
                  <PreferenceSection
                    title="ប្រតិកម្មអាឡែហ្ស៊ី"
                    description="ជ្រើសរើសអាហារ ឬសារធាតុដែលបង្កអាឡែហ្ស៊ី។ អ្នកអាចជ្រើសរើសច្រើន។"
                    icon={<ShieldAlert className="h-6 w-6" />}
                  >
                    {allergenOptions.length === 0 ? (
                      <p className="rounded-2xl bg-slate-50 px-4 py-4 text-lg text-slate-500">
                        មិនមានជម្រើសអាឡែហ្ស៊ី។
                      </p>
                    ) : (
                      <div className="space-y-5">
                        <div className="flex flex-wrap gap-3">
                          {allergenOptions.map((option) => {
                            const isSelected = form.allergies.some(
                              (item) => item.allergenCode === option.code,
                            );

                            return (
                              <button
                                key={option.code}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => toggleAllergy(option.code)}
                                className={`rounded-full border px-5 py-2.5 text-lg font-semibold transition-all duration-200 ${
                                  isSelected
                                    ? "border-primary-800 bg-primary-800 text-white shadow-sm"
                                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-primary-800 hover:bg-primary-800/5 hover:text-primary-800"
                                }`}
                              >
                                {option.localName || option.name || option.code}
                              </button>
                            );
                          })}
                        </div>

                        {form.allergies.map((selectedItem) => {
                          const option = allergenOptions.find(
                            (item) => item.code === selectedItem.allergenCode,
                          );

                          if (!option) return null;

                          return (
                            <div
                              key={selectedItem.allergenCode}
                              className="rounded-2xl border border-primary-800/15 bg-primary-800/[0.03] p-5"
                            >
                              <div className="mb-5 flex items-start justify-between gap-4 border-b border-primary-800/10 pb-4">
                                <div>
                                  <p className="text-lg font-bold text-primary-800">
                                    {option.localName ||
                                      option.name ||
                                      option.code}
                                  </p>
                                  {option.description && (
                                    <p className="mt-1 text-lg leading-7 text-slate-500">
                                      {option.description}
                                    </p>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => toggleAllergy(option.code)}
                                  className="shrink-0 rounded-full px-3 py-1.5 text-lg font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600"
                                >
                                  លុប
                                </button>
                              </div>

                              <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                  <label className="mb-2.5 block text-lg font-semibold text-slate-700">
                                    កម្រិតធ្ងន់ធ្ងរ
                                  </label>

                                  <div className="relative">
                                    <select
                                      value={selectedItem.severity}
                                      onChange={(event) =>
                                        updateAllergy(option.code, {
                                          severity: event.target
                                            .value as ProfileSeverity,
                                        })
                                      }
                                      className="min-h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-lg font-medium text-primary-800 outline-none transition-all duration-200 hover:border-slate-300 focus:border-primary-800 focus:ring-4 focus:ring-primary-800/10"
                                    >
                                      {Object.entries(severityLabels).map(
                                        ([value, label]) => (
                                          <option
                                            key={value}
                                            value={value}
                                            className="text-lg"
                                          >
                                            {label}
                                          </option>
                                        ),
                                      )}
                                    </select>

                                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                                  </div>
                                </div>

                                <div>
                                  <label className="mb-2.5 block text-lg font-semibold text-slate-700">
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
                                    className="min-h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg text-primary-800 outline-none transition focus:border-primary-800 focus:ring-4 focus:ring-primary-800/10"
                                  />
                                </div>
                              </div>

                              <div className="mt-5 flex flex-wrap gap-3">
                                <label className="flex cursor-pointer items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-lg text-slate-700 transition hover:border-slate-300">
                                  <input
                                    type="checkbox"
                                    checked={selectedItem.avoidCrossContact}
                                    onChange={(event) =>
                                      updateAllergy(option.code, {
                                        avoidCrossContact: event.target.checked,
                                      })
                                    }
                                    className="h-5 w-5 rounded border-slate-300 text-primary-800 focus:ring-primary-800"
                                  />
                                  ជៀសវាងការប៉ះពាល់ឆ្លង
                                </label>

                                <label className="flex cursor-pointer items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-lg text-slate-700 transition hover:border-slate-300">
                                  <input
                                    type="checkbox"
                                    checked={selectedItem.medicallyDiagnosed}
                                    onChange={(event) =>
                                      updateAllergy(option.code, {
                                        medicallyDiagnosed:
                                          event.target.checked,
                                      })
                                    }
                                    className="h-5 w-5 rounded border-slate-300 text-primary-800 focus:ring-primary-800"
                                  />
                                  បានវិនិច្ឆ័យដោយវេជ្ជបណ្ឌិត
                                </label>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </PreferenceSection>

                  {/* Dietary */}
                  <PreferenceSection
                    title="ប្រភេទរបបអាហារ"
                    description="ជ្រើសរើសរបបអាហារដែលសមាជិកត្រូវការ។ អ្នកអាចជ្រើសរើសច្រើន។"
                    icon={<Salad className="h-6 w-6" />}
                  >
                    {dietaryTypeOptions.length === 0 ? (
                      <p className="rounded-2xl bg-slate-50 px-4 py-4 text-lg text-slate-500">
                        មិនមានជម្រើសរបបអាហារ។
                      </p>
                    ) : (
                      <div className="space-y-5">
                        <div className="flex flex-wrap gap-3">
                          {dietaryTypeOptions.map((option) => {
                            const isSelected = form.dietaryTypes.some(
                              (item) => item.dietaryTypeCode === option.code,
                            );

                            return (
                              <button
                                key={option.code}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => toggleDietaryType(option.code)}
                                className={`rounded-full border px-5 py-2.5 text-lg font-semibold transition-all duration-200 ${
                                  isSelected
                                    ? "border-primary-800 bg-primary-800 text-white shadow-sm"
                                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-primary-800 hover:bg-primary-800/5 hover:text-primary-800"
                                }`}
                              >
                                {option.localName || option.name || option.code}
                              </button>
                            );
                          })}
                        </div>

                        {form.dietaryTypes.map((selectedItem) => {
                          const option = dietaryTypeOptions.find(
                            (item) =>
                              item.code === selectedItem.dietaryTypeCode,
                          );

                          if (!option) return null;

                          return (
                            <div
                              key={selectedItem.dietaryTypeCode}
                              className="rounded-2xl border border-primary-800/15 bg-primary-800/[0.03] p-5"
                            >
                              <div className="mb-5 flex items-start justify-between gap-4 border-b border-primary-800/10 pb-4">
                                <div>
                                  <p className="text-lg font-bold text-primary-800">
                                    {option.localName ||
                                      option.name ||
                                      option.code}
                                  </p>
                                  {option.description && (
                                    <p className="mt-1 text-lg leading-7 text-slate-500">
                                      {option.description}
                                    </p>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => toggleDietaryType(option.code)}
                                  className="shrink-0 rounded-full px-3 py-1.5 text-lg font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600"
                                >
                                  លុប
                                </button>
                              </div>

                              <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                  <label className="mb-2.5 block text-lg font-semibold text-slate-700">
                                    កម្រិតតម្រូវការ
                                  </label>

                                  <div className="relative">
                                    <select
                                      value={selectedItem.enforcementLevel}
                                      onChange={(event) =>
                                        updateDietaryType(option.code, {
                                          enforcementLevel: event.target
                                            .value as DietaryEnforcementLevel,
                                        })
                                      }
                                      className="min-h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-lg font-medium text-primary-800 outline-none transition-all duration-200 hover:border-slate-300 focus:border-primary-800 focus:ring-4 focus:ring-primary-800/10"
                                    >
                                      {Object.entries(enforcementLabels).map(
                                        ([value, label]) => (
                                          <option
                                            key={value}
                                            value={value}
                                            className="text-lg"
                                          >
                                            {label}
                                          </option>
                                        ),
                                      )}
                                    </select>

                                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                                  </div>
                                </div>

                                <div>
                                  <label className="mb-2.5 block text-lg font-semibold text-slate-700">
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
                                    className="min-h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg text-primary-800 outline-none transition focus:border-primary-800 focus:ring-4 focus:ring-primary-800/10"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </PreferenceSection>

                  {/* Medical */}
                  <PreferenceSection
                    title="ស្ថានភាពសុខភាព"
                    description="ជ្រើសរើសស្ថានភាពសុខភាពដែលមានឥទ្ធិពលលើការជ្រើសរើសអាហារ។"
                    icon={<HeartPulse className="h-6 w-6" />}
                  >
                    {medicalConditionOptions.length === 0 ? (
                      <p className="rounded-2xl bg-slate-50 px-4 py-4 text-lg text-slate-500">
                        មិនមានជម្រើសស្ថានភាពសុខភាព។
                      </p>
                    ) : (
                      <div className="space-y-5">
                        <div className="flex flex-wrap gap-3">
                          {medicalConditionOptions.map((option) => {
                            const isSelected = form.medicalConditions.some(
                              (item) => item.conditionCode === option.code,
                            );

                            return (
                              <button
                                key={option.code}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() =>
                                  toggleMedicalCondition(option.code)
                                }
                                className={`rounded-full border px-5 py-2.5 text-lg font-semibold transition-all duration-200 ${
                                  isSelected
                                    ? "border-primary-800 bg-primary-800 text-white shadow-sm"
                                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-primary-800 hover:bg-primary-800/5 hover:text-primary-800"
                                }`}
                              >
                                {option.localName || option.name || option.code}
                              </button>
                            );
                          })}
                        </div>

                        {form.medicalConditions.map((selectedItem) => {
                          const option = medicalConditionOptions.find(
                            (item) => item.code === selectedItem.conditionCode,
                          );

                          if (!option) return null;

                          return (
                            <div
                              key={selectedItem.conditionCode}
                              className="rounded-2xl border border-primary-800/15 bg-primary-800/[0.03] p-5"
                            >
                              <div className="mb-5 flex items-start justify-between gap-4 border-b border-primary-800/10 pb-4">
                                <div>
                                  <p className="text-lg font-bold text-primary-800">
                                    {option.localName ||
                                      option.name ||
                                      option.code}
                                  </p>
                                  {option.description && (
                                    <p className="mt-1 text-lg leading-7 text-slate-500">
                                      {option.description}
                                    </p>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleMedicalCondition(option.code)
                                  }
                                  className="shrink-0 rounded-full px-3 py-1.5 text-lg font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600"
                                >
                                  លុប
                                </button>
                              </div>

                              <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                  <label className="mb-2.5 block text-lg font-semibold text-slate-700">
                                    កម្រិតធ្ងន់ធ្ងរ
                                  </label>

                                  <div className="relative">
                                    <select
                                      value={selectedItem.severity}
                                      onChange={(event) =>
                                        updateMedicalCondition(option.code, {
                                          severity: event.target
                                            .value as ProfileSeverity,
                                        })
                                      }
                                      className="min-h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-lg font-medium text-primary-800 outline-none transition-all duration-200 hover:border-slate-300 focus:border-primary-800 focus:ring-4 focus:ring-primary-800/10"
                                    >
                                      {Object.entries(severityLabels).map(
                                        ([value, label]) => (
                                          <option
                                            key={value}
                                            value={value}
                                            className="text-lg"
                                          >
                                            {label}
                                          </option>
                                        ),
                                      )}
                                    </select>

                                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                                  </div>
                                </div>

                                <div>
                                  <label className="mb-2.5 block text-lg font-semibold text-slate-700">
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
                                    className="min-h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg text-primary-800 outline-none transition focus:border-primary-800 focus:ring-4 focus:ring-primary-800/10"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </PreferenceSection>
                </>
              )}

              {createdProfileUuid && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-lg leading-7 text-amber-700">
                  គណនីមូលដ្ឋានត្រូវបានបង្កើតរួច។
                  សូមព្យាយាមរក្សាទុកព័ត៌មានសុវត្ថិភាពម្តងទៀត។
                </div>
              )}

              {errorMessage && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-lg leading-7 text-red-700">
                  {errorMessage}
                </div>
              )}

              <div className="sticky bottom-0 -mx-1 flex flex-col-reverse gap-3 rounded-[24px] border border-slate-200/80 bg-white/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
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
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-lg font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowLeft className="h-5 w-5" />
                  ត្រឡប់ក្រោយ
                </button>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => void submitProfile(false)}
                    disabled={isSubmitting}
                    className="min-h-12 rounded-full border border-slate-200 bg-white px-5 py-3 text-lg font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                    className="inline-flex min-h-12 min-w-44 items-center justify-center gap-2 rounded-full bg-primary-800 px-6 py-3 text-lg font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-900 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                        កំពុងរក្សាទុក...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
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
