"use client";

import { useMemo, useState } from "react";

import type { FormEvent, ReactNode } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  LoaderCircle,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { useCreateMemberProfileMutation } from "@/app/store/memberProfileApi";

import type {
  CreateMemberProfileRequest,
  MemberGender,
  MemberRelationship,
} from "@/types/member-profile/member-profile";

type ProfileSeverity = "MILD" | "MODERATE" | "SEVERE";

type DietaryEnforcementLevel = "PREFERRED" | "REQUIRED";

type IngredientAvoidLevel = "PREFERENCE" | "STRICT_BLOCK";

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

interface IngredientAvoidFormItem {
  ingredientCode: string;
  avoidLevel: IngredientAvoidLevel;
  reasonCode: string;
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
  ingredientAvoids: IngredientAvoidFormItem[];
  preferences: Record<string, unknown> | null;
}

interface CreateMemberProfileModalProps {
  open: boolean;
  onClose: () => void;
}

interface PreferenceSectionProps {
  title: string;
  description: string;
  addLabel: string;
  onAdd: () => void;
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

const avoidLevelLabels: Record<IngredientAvoidLevel, string> = {
  PREFERENCE: "ចង់ជៀសវាង",
  STRICT_BLOCK: "ហាមឃាត់ដាច់ខាត",
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
  ingredientAvoids: [],
  preferences: null,
};

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
      "មិនអាចបង្កើតគណនីបានទេ។"
    );
  }

  return "មិនអាចបង្កើតគណនីបានទេ។";
}

function PreferenceSection({
  title,
  description,
  addLabel,
  onAdd,
  children,
}: PreferenceSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </button>
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

  const [createMemberProfile, { isLoading: isCreating }] =
    useCreateMemberProfileMutation();

  const maxDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  if (!open) {
    return null;
  }

  const resetModal = () => {
    setStep(1);
    setForm(initialFormState);
    setErrorMessage(null);
  };

  const closeModal = () => {
    if (isCreating) {
      return;
    }

    resetModal();
    onClose();
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

  const buildPayload = (
    includePreferences: boolean,
  ): CreateMemberProfileRequest => {
    const allergies = includePreferences
      ? form.allergies
          .filter((item) => item.allergenCode.trim().length > 0)
          .map((item) => ({
            allergenCode: item.allergenCode.trim(),
            severity: item.severity,
            reactionNotes: item.reactionNotes.trim() || null,
            avoidCrossContact: item.avoidCrossContact,
            medicallyDiagnosed: item.medicallyDiagnosed,
          }))
      : [];

    const dietaryTypes = includePreferences
      ? form.dietaryTypes
          .filter((item) => item.dietaryTypeCode.trim().length > 0)
          .map((item) => ({
            dietaryTypeCode: item.dietaryTypeCode.trim(),
            enforcementLevel: item.enforcementLevel,
            priority: Math.max(1, Number(item.priority) || 1),
            notes: item.notes.trim() || null,
          }))
      : [];

    const medicalConditions = includePreferences
      ? form.medicalConditions
          .filter((item) => item.conditionCode.trim().length > 0)
          .map((item) => ({
            conditionCode: item.conditionCode.trim(),
            severity: item.severity,
            notes: item.notes.trim() || null,
          }))
      : [];

    const ingredientAvoids = includePreferences
      ? form.ingredientAvoids
          .filter((item) => item.ingredientCode.trim().length > 0)
          .map((item) => ({
            ingredientCode: item.ingredientCode.trim(),
            avoidLevel: item.avoidLevel,
            reasonCode: item.reasonCode.trim() || "PERSONAL_PREFERENCE",
            notes: item.notes.trim() || null,
          }))
      : [];

    return {
      profileName: form.profileName.trim(),
      relationship: form.relationship,
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      preferredLanguage: form.preferredLanguage,
      avatarMediaUuid: form.avatarMediaUuid,
      isDefault: form.isDefault,
      allergies,
      dietaryTypes,
      medicalConditions,
      ingredientAvoids,
      preferences: null,
    };
  };

  const submitProfile = async (includePreferences: boolean) => {
    if (!validateStepOne()) {
      setStep(1);
      return;
    }

    setErrorMessage(null);

    try {
      await createMemberProfile(buildPayload(includePreferences)).unwrap();

      resetModal();
      onClose();
    } catch (error) {
      console.error("CREATE MEMBER PROFILE ERROR:", error);
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleStepTwoSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitProfile(true);
  };

  const addAllergy = () => {
    setForm((previous) => ({
      ...previous,
      allergies: [
        ...previous.allergies,
        {
          allergenCode: "",
          severity: "MODERATE",
          reactionNotes: "",
          avoidCrossContact: false,
          medicallyDiagnosed: false,
        },
      ],
    }));
  };

  const updateAllergy = (index: number, patch: Partial<AllergyFormItem>) => {
    setForm((previous) => ({
      ...previous,
      allergies: previous.allergies.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  };

  const removeAllergy = (index: number) => {
    setForm((previous) => ({
      ...previous,
      allergies: previous.allergies.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));
  };

  const addDietaryType = () => {
    setForm((previous) => ({
      ...previous,
      dietaryTypes: [
        ...previous.dietaryTypes,
        {
          dietaryTypeCode: "",
          enforcementLevel: "PREFERRED",
          priority: 1,
          notes: "",
        },
      ],
    }));
  };

  const updateDietaryType = (
    index: number,
    patch: Partial<DietaryTypeFormItem>,
  ) => {
    setForm((previous) => ({
      ...previous,
      dietaryTypes: previous.dietaryTypes.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  };

  const removeDietaryType = (index: number) => {
    setForm((previous) => ({
      ...previous,
      dietaryTypes: previous.dietaryTypes.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));
  };

  const addMedicalCondition = () => {
    setForm((previous) => ({
      ...previous,
      medicalConditions: [
        ...previous.medicalConditions,
        {
          conditionCode: "",
          severity: "MODERATE",
          notes: "",
        },
      ],
    }));
  };

  const updateMedicalCondition = (
    index: number,
    patch: Partial<MedicalConditionFormItem>,
  ) => {
    setForm((previous) => ({
      ...previous,
      medicalConditions: previous.medicalConditions.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  };

  const removeMedicalCondition = (index: number) => {
    setForm((previous) => ({
      ...previous,
      medicalConditions: previous.medicalConditions.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));
  };

  const addIngredientAvoid = () => {
    setForm((previous) => ({
      ...previous,
      ingredientAvoids: [
        ...previous.ingredientAvoids,
        {
          ingredientCode: "",
          avoidLevel: "PREFERENCE",
          reasonCode: "PERSONAL_PREFERENCE",
          notes: "",
        },
      ],
    }));
  };

  const updateIngredientAvoid = (
    index: number,
    patch: Partial<IngredientAvoidFormItem>,
  ) => {
    setForm((previous) => ({
      ...previous,
      ingredientAvoids: previous.ingredientAvoids.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  };

  const removeIngredientAvoid = (index: number) => {
    setForm((previous) => ({
      ...previous,
      ingredientAvoids: previous.ingredientAvoids.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));
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
                : "បន្ថែមចំណូលចិត្ត និងព័ត៌មានសុខភាព។ ផ្នែកនេះមិនចាំបាច់បំពេញទេ។"}
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            disabled={isCreating}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
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
              <PreferenceSection
                title="ប្រតិកម្មអាឡែហ្ស៊ី"
                description="បន្ថែមអាហារ ឬសារធាតុដែលបង្កអាឡែហ្ស៊ី។"
                addLabel="បន្ថែមអាឡែហ្ស៊ី"
                onAdd={addAllergy}
              >
                {form.allergies.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    មិនទាន់មានព័ត៌មានអាឡែហ្ស៊ី។
                  </p>
                ) : (
                  <div className="space-y-4">
                    {form.allergies.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <input
                            type="text"
                            value={item.allergenCode}
                            onChange={(event) =>
                              updateAllergy(index, {
                                allergenCode: event.target.value,
                              })
                            }
                            placeholder="Allergen code ឧ. PEANUT"
                            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                          />

                          <select
                            value={item.severity}
                            onChange={(event) =>
                              updateAllergy(index, {
                                severity: event.target.value as ProfileSeverity,
                              })
                            }
                            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
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

                        <input
                          type="text"
                          value={item.reactionNotes}
                          onChange={(event) =>
                            updateAllergy(index, {
                              reactionNotes: event.target.value,
                            })
                          }
                          placeholder="ចំណាំអំពីប្រតិកម្ម"
                          className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                        />

                        <div className="mt-3 flex flex-wrap items-center gap-4">
                          <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                              type="checkbox"
                              checked={item.avoidCrossContact}
                              onChange={(event) =>
                                updateAllergy(index, {
                                  avoidCrossContact: event.target.checked,
                                })
                              }
                            />
                            ជៀសវាងការប៉ះពាល់
                          </label>

                          <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                              type="checkbox"
                              checked={item.medicallyDiagnosed}
                              onChange={(event) =>
                                updateAllergy(index, {
                                  medicallyDiagnosed: event.target.checked,
                                })
                              }
                            />
                            បានវិនិច្ឆ័យដោយវេជ្ជបណ្ឌិត
                          </label>

                          <button
                            type="button"
                            onClick={() => removeAllergy(index)}
                            className="ml-auto inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            លុប
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </PreferenceSection>

              <PreferenceSection
                title="ប្រភេទរបបអាហារ"
                description="បន្ថែមរបបអាហារដែលសមាជិកត្រូវការ។"
                addLabel="បន្ថែមរបបអាហារ"
                onAdd={addDietaryType}
              >
                {form.dietaryTypes.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    មិនទាន់មានរបបអាហារ។
                  </p>
                ) : (
                  <div className="space-y-4">
                    {form.dietaryTypes.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <input
                            value={item.dietaryTypeCode}
                            onChange={(event) =>
                              updateDietaryType(index, {
                                dietaryTypeCode: event.target.value,
                              })
                            }
                            placeholder="ឧ. HALAL"
                            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                          />

                          <select
                            value={item.enforcementLevel}
                            onChange={(event) =>
                              updateDietaryType(index, {
                                enforcementLevel: event.target
                                  .value as DietaryEnforcementLevel,
                              })
                            }
                            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                          >
                            {Object.entries(enforcementLabels).map(
                              ([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ),
                            )}
                          </select>

                          <input
                            type="number"
                            min={1}
                            value={item.priority}
                            onChange={(event) =>
                              updateDietaryType(index, {
                                priority: Number(event.target.value),
                              })
                            }
                            placeholder="Priority"
                            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="mt-3 flex gap-3">
                          <input
                            value={item.notes}
                            onChange={(event) =>
                              updateDietaryType(index, {
                                notes: event.target.value,
                              })
                            }
                            placeholder="ចំណាំ"
                            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                          />

                          <button
                            type="button"
                            onClick={() => removeDietaryType(index)}
                            className="rounded-xl px-3 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </PreferenceSection>

              <PreferenceSection
                title="ស្ថានភាពសុខភាព"
                description="បន្ថែមស្ថានភាពសុខភាពដែលមានឥទ្ធិពលលើការជ្រើសរើសអាហារ។"
                addLabel="បន្ថែមសុខភាព"
                onAdd={addMedicalCondition}
              >
                {form.medicalConditions.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    មិនទាន់មានព័ត៌មានសុខភាព។
                  </p>
                ) : (
                  <div className="space-y-4">
                    {form.medicalConditions.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <input
                            value={item.conditionCode}
                            onChange={(event) =>
                              updateMedicalCondition(index, {
                                conditionCode: event.target.value,
                              })
                            }
                            placeholder="ឧ. DIABETES"
                            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                          />

                          <select
                            value={item.severity}
                            onChange={(event) =>
                              updateMedicalCondition(index, {
                                severity: event.target.value as ProfileSeverity,
                              })
                            }
                            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
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

                        <div className="mt-3 flex gap-3">
                          <input
                            value={item.notes}
                            onChange={(event) =>
                              updateMedicalCondition(index, {
                                notes: event.target.value,
                              })
                            }
                            placeholder="ចំណាំ"
                            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                          />

                          <button
                            type="button"
                            onClick={() => removeMedicalCondition(index)}
                            className="rounded-xl px-3 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </PreferenceSection>

              <PreferenceSection
                title="គ្រឿងផ្សំដែលត្រូវជៀសវាង"
                description="បន្ថែមគ្រឿងផ្សំដែលសមាជិកមិនចង់ ឬមិនអាចទទួលទាន។"
                addLabel="បន្ថែមគ្រឿងផ្សំ"
                onAdd={addIngredientAvoid}
              >
                {form.ingredientAvoids.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    មិនទាន់មានគ្រឿងផ្សំដែលត្រូវជៀសវាង។
                  </p>
                ) : (
                  <div className="space-y-4">
                    {form.ingredientAvoids.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <input
                            value={item.ingredientCode}
                            onChange={(event) =>
                              updateIngredientAvoid(index, {
                                ingredientCode: event.target.value,
                              })
                            }
                            placeholder="ឧ. MSG"
                            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                          />

                          <select
                            value={item.avoidLevel}
                            onChange={(event) =>
                              updateIngredientAvoid(index, {
                                avoidLevel: event.target
                                  .value as IngredientAvoidLevel,
                              })
                            }
                            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                          >
                            {Object.entries(avoidLevelLabels).map(
                              ([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ),
                            )}
                          </select>

                          <input
                            value={item.reasonCode}
                            onChange={(event) =>
                              updateIngredientAvoid(index, {
                                reasonCode: event.target.value,
                              })
                            }
                            placeholder="ឧ. PERSONAL_PREFERENCE"
                            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="mt-3 flex gap-3">
                          <input
                            value={item.notes}
                            onChange={(event) =>
                              updateIngredientAvoid(index, {
                                notes: event.target.value,
                              })
                            }
                            placeholder="ចំណាំ"
                            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                          />

                          <button
                            type="button"
                            onClick={() => removeIngredientAvoid(index)}
                            className="rounded-xl px-3 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </PreferenceSection>

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
                  disabled={isCreating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  ត្រឡប់ក្រោយ
                </button>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => submitProfile(false)}
                    disabled={isCreating}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    រំលង និងបង្កើត
                  </button>

                  <button
                    type="submit"
                    disabled={isCreating}
                    className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isCreating ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        កំពុងបង្កើត...
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
