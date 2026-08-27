"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  Compass,
  Flame,
  HeartPulse,
  Languages,
  LoaderCircle,
  Plus,
  RefreshCw,
  Salad,
  Save,
  ShieldAlert,
  Sliders,
  Sparkles,
  Trash2,
  UserRound,
  UsersRound,
  Utensils,
  Wallet,
} from "lucide-react";
import { IoCameraOutline } from "react-icons/io5";

import {
  useGetAllergenOptionsQuery,
  useGetDietaryTypeOptionsQuery,
  useGetMedicalConditionOptionsQuery,
  useGetMemberProfileByIdQuery,
  useSaveMemberAllergiesMutation,
  useSaveMemberDietaryTypesMutation,
  useSaveMemberMedicalConditionsMutation,
  useSaveMemberPreferencesMutation,
  useSaveMemberCuisinesMutation,
  useUpdateMemberProfileMutation,
  useUploadMediaMutation,
  useGetMediaAccessUrlQuery,
} from "@/app/store/memberProfileApi";

import type {
  DietaryEnforcementLevel,
  MemberGender,
  MemberRelationship,
  ProfileSeverity,
} from "@/types/member-profile/member-profile";

import type {
  CuisinePreferenceLevel,
  CuisinePreferenceItem,
  UpdatePreferencesPayload,
} from "@/types/foodhub";

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

interface CuisineFormItem {
  cuisineCode: string;
  preferenceLevel: CuisinePreferenceLevel;
  priority: number;
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

  // General Preferences
  spiceTolerance: number; // 0 - 10
  minimumPrice: number | "";
  maximumPrice: number | "";
  currencyCode: "USD" | "KHR";
  defaultSearchRadiusKm: number;
  tastePreferences: Record<string, boolean>;
  texturePreferences: Record<string, boolean>;

  // Cuisine Preferences
  cuisinePreferences: CuisineFormItem[];
}

export const TASTE_OPTIONS = [
  { key: "spicy", labelKm: "ហឹរ (Spicy)", emoji: "🌶️" },
  { key: "savory", labelKm: "ប្រៃ / ឈ្ងុយ (Savory)", emoji: "🧂" },
  { key: "soup", labelKm: "ស៊ុប / ទឹកសម្ល (Soup)", emoji: "🍲" },
  { key: "sweet", labelKm: "ផ្អែម (Sweet)", emoji: "🍯" },
  { key: "sour", labelKm: "ជូរ (Sour)", emoji: "🍋" },
  { key: "bitter", labelKm: "ល្វីង (Bitter)", emoji: "☕" },
];

export const TEXTURE_OPTIONS = [
  { key: "crispy", labelKm: "ស្រួយ (Crispy)", emoji: "🍗" },
  { key: "chewy", labelKm: "ស្វិត (Chewy)", emoji: "🍡" },
  { key: "creamy", labelKm: "ទន់ម៉ត់ / ក្រែម (Creamy)", emoji: "🍦" },
  { key: "tender", labelKm: "ផុយទន់ (Tender)", emoji: "🥩" },
  { key: "crunchy", labelKm: "ស្រួយក្រុប (Crunchy)", emoji: "🥨" },
];

export const CUISINE_OPTIONS = [
  { code: "KHMER", labelKm: "ខ្មែរ (Khmer)", flag: "🇰🇭" },
  { code: "JAPANESE", labelKm: "ជប៉ុន (Japanese)", flag: "🇯🇵" },
  { code: "CHINESE", labelKm: "ចិន (Chinese)", flag: "🇨🇳" },
  { code: "KOREAN", labelKm: "កូរ៉េ (Korean)", flag: "🇰🇷" },
  { code: "THAI", labelKm: "ថៃ (Thai)", flag: "🇹🇭" },
  { code: "VIETNAMESE", labelKm: "វៀតណាម (Vietnamese)", flag: "🇻🇳" },
  { code: "WESTERN", labelKm: "បស្ចិមប្រទេស (Western)", flag: "🍔" },
  { code: "INDIAN", labelKm: "ឥណ្ឌា (Indian)", flag: "🇮🇳" },
  { code: "ITALIAN", labelKm: "អ៊ីតាលី (Italian)", flag: "🍕" },
  { code: "FRENCH", labelKm: "បារាំង (French)", flag: "🥐" },
];

export const PREFERENCE_LEVELS: {
  value: CuisinePreferenceLevel;
  labelKm: string;
  badgeClass: string;
}[] = [
  {
    value: "LOVE",
    labelKm: "❤️ ចូលចិត្តខ្លាំង (LOVE)",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
  },
  {
    value: "LIKE",
    labelKm: "👍 ចូលចិត្ត (LIKE)",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    value: "NEUTRAL",
    labelKm: "😐 ធម្មតា (NEUTRAL)",
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
  },
  {
    value: "DISLIKE",
    labelKm: "👎 មិនសូវចូលចិត្ត (DISLIKE)",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    value: "AVOID",
    labelKm: "🚫 ជៀសវាង (AVOID)",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-300",
  },
];

export function getSpiceDescriptor(level: number): {
  labelKm: string;
  colorClass: string;
  emoji: string;
} {
  if (level === 0)
    return {
      labelKm: "មិនហឹរទាល់តែសោះ (Mild / 0)",
      colorClass: "text-slate-500",
      emoji: "🟢",
    };
  if (level <= 3)
    return {
      labelKm: "ហឹរតិចតួច (Mild)",
      colorClass: "text-emerald-600",
      emoji: "🌶️",
    };
  if (level <= 6)
    return {
      labelKm: "ហឹរមធ្យម (Medium)",
      colorClass: "text-amber-600",
      emoji: "🌶️🌶️",
    };
  if (level <= 8)
    return {
      labelKm: "ហឹរខ្លាំង (Hot)",
      colorClass: "text-orange-600",
      emoji: "🌶️🌶️🌶️",
    };
  return {
    labelKm: "ហឹរខ្លាំងបំផុត (Extremely Spicy)",
    colorClass: "text-red-600 font-black",
    emoji: "🔥🌶️🔥",
  };
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

  spiceTolerance: 5,
  minimumPrice: 2.0,
  maximumPrice: 15.0,
  currencyCode: "USD",
  defaultSearchRadiusKm: 5.0,
  tastePreferences: {
    spicy: true,
    savory: true,
    soup: false,
    sweet: false,
    sour: false,
    bitter: false,
  },
  texturePreferences: {
    crispy: false,
    chewy: false,
    creamy: false,
    tender: false,
    crunchy: false,
  },
  cuisinePreferences: [
    { cuisineCode: "KHMER", preferenceLevel: "LOVE", priority: 1 },
  ],
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

function parsePreferencesFromProfile(prefs: unknown): {
  spiceTolerance: number;
  minimumPrice: number | "";
  maximumPrice: number | "";
  currencyCode: "USD" | "KHR";
  defaultSearchRadiusKm: number;
  tastePreferences: Record<string, boolean>;
  texturePreferences: Record<string, boolean>;
  cuisinePreferences: CuisineFormItem[];
} {
  const result = {
    spiceTolerance: 5,
    minimumPrice: 2.0 as number | "",
    maximumPrice: 15.0 as number | "",
    currencyCode: "USD" as "USD" | "KHR",
    defaultSearchRadiusKm: 5.0,
    tastePreferences: {
      spicy: false,
      savory: false,
      soup: false,
      sweet: false,
      sour: false,
      bitter: false,
    } as Record<string, boolean>,
    texturePreferences: {
      crispy: false,
      chewy: false,
      creamy: false,
      tender: false,
      crunchy: false,
    } as Record<string, boolean>,
    cuisinePreferences: [
      {
        cuisineCode: "KHMER",
        preferenceLevel: "LOVE" as CuisinePreferenceLevel,
        priority: 1,
      },
    ],
  };

  if (!prefs || typeof prefs !== "object") return result;

  const record = prefs as Record<string, unknown>;

  // Spice
  if (typeof record.spiceTolerance === "number") {
    result.spiceTolerance = Math.min(10, Math.max(0, record.spiceTolerance));
  } else if (
    typeof record.spiceLevel === "string" ||
    typeof record.spiceLevel === "number"
  ) {
    const parsed = parseInt(String(record.spiceLevel), 10);
    if (!Number.isNaN(parsed))
      result.spiceTolerance = Math.min(10, Math.max(0, parsed));
  }

  // Budget
  if (typeof record.minimumPrice === "number") {
    result.minimumPrice = record.minimumPrice;
  } else if (typeof record.minimumBudget === "number") {
    result.minimumPrice = record.minimumBudget;
  }

  if (typeof record.maximumPrice === "number") {
    result.maximumPrice = record.maximumPrice;
  } else if (typeof record.maximumBudget === "number") {
    result.maximumPrice = record.maximumBudget;
  }

  if (record.currencyCode === "KHR" || record.currencyCode === "USD") {
    result.currencyCode = record.currencyCode;
  }

  // Radius
  if (typeof record.defaultSearchRadiusKm === "number") {
    result.defaultSearchRadiusKm = record.defaultSearchRadiusKm;
  } else if (typeof record.radiusMeters === "number") {
    result.defaultSearchRadiusKm = record.radiusMeters / 1000;
  }

  // Tastes
  if (Array.isArray(record.tasteCodes)) {
    record.tasteCodes.forEach((code) => {
      if (
        typeof code === "string" &&
        code.toLowerCase() in result.tastePreferences
      ) {
        result.tastePreferences[code.toLowerCase()] = true;
      }
    });
  }
  if (
    typeof record.tastePreferences === "object" &&
    record.tastePreferences !== null
  ) {
    Object.entries(record.tastePreferences as Record<string, boolean>).forEach(
      ([k, v]) => {
        if (k.toLowerCase() in result.tastePreferences) {
          result.tastePreferences[k.toLowerCase()] = Boolean(v);
        }
      },
    );
  }

  // Textures
  if (Array.isArray(record.textureCodes)) {
    record.textureCodes.forEach((code) => {
      if (
        typeof code === "string" &&
        code.toLowerCase() in result.texturePreferences
      ) {
        result.texturePreferences[code.toLowerCase()] = true;
      }
    });
  }
  if (
    typeof record.texturePreferences === "object" &&
    record.texturePreferences !== null
  ) {
    Object.entries(
      record.texturePreferences as Record<string, boolean>,
    ).forEach(([k, v]) => {
      if (k.toLowerCase() in result.texturePreferences) {
        result.texturePreferences[k.toLowerCase()] = Boolean(v);
      }
    });
  }

  // Cuisines
  if (Array.isArray(record.cuisines) && record.cuisines.length > 0) {
    result.cuisinePreferences = record.cuisines.map(
      (c: any, idx: number) => ({
        cuisineCode: String(c.cuisineCode || c.code).toUpperCase(),
        preferenceLevel: (c.preferenceLevel || "LOVE") as CuisinePreferenceLevel,
        priority: c.priority || idx + 1,
      }),
    );
  } else if (
    Array.isArray(record.cuisineCodes) &&
    record.cuisineCodes.length > 0
  ) {
    result.cuisinePreferences = record.cuisineCodes.map((code, idx) => ({
      cuisineCode: String(code).toUpperCase(),
      preferenceLevel: "LOVE" as CuisinePreferenceLevel,
      priority: idx + 1,
    }));
  }

  return result;
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
          <p className="text-4xl font-bold text-primary-800">{title}</p>

          <p className=" text-lg pt-6  text-slate-500">{description}</p>
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

  /* ---- Avatar upload state ---- */
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [pendingAvatarUuid, setPendingAvatarUuid] = useState<string | null>(
    null,
  );
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [uploadMedia, { isLoading: isUploadingAvatar }] =
    useUploadMediaMutation();

  const { data: avatarAccessUrlData } = useGetMediaAccessUrlQuery(
    pendingAvatarUuid ?? "",
    { skip: !pendingAvatarUuid || Boolean(avatarPreviewUrl) },
  );

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

  const [saveMemberPreferences, savePreferencesState] =
    useSaveMemberPreferencesMutation();

  const [saveMemberCuisines, saveCuisinesState] =
    useSaveMemberCuisinesMutation();

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
    saveMedicalState.isLoading ||
    savePreferencesState.isLoading ||
    saveCuisinesState.isLoading ||
    isUploadingAvatar;

  useEffect(() => {
    if (!profile || initializedProfileUuid === profile.uuid) {
      return;
    }

    const parsedPrefs = parsePreferencesFromProfile(profile.preferences);

    setForm({
      profileName: profile.profileName,

      relationship: profile.relationship,

      gender: profile.gender,

      dateOfBirth: profile.dateOfBirth ?? "",

      preferredLanguage: profile.preferredLanguage || "km",

      allergies: normalizeAllergies(profile.allergies),

      dietaryTypes: normalizeDietaryTypes(profile.dietaryTypes),

      medicalConditions: normalizeMedicalConditions(profile.medicalConditions),

      spiceTolerance: parsedPrefs.spiceTolerance,
      minimumPrice: parsedPrefs.minimumPrice,
      maximumPrice: parsedPrefs.maximumPrice,
      currencyCode: parsedPrefs.currencyCode,
      defaultSearchRadiusKm: parsedPrefs.defaultSearchRadiusKm,
      tastePreferences: parsedPrefs.tastePreferences,
      texturePreferences: parsedPrefs.texturePreferences,
      cuisinePreferences: parsedPrefs.cuisinePreferences,
    });

    if (profile.avatarMediaUuid) {
      setPendingAvatarUuid(profile.avatarMediaUuid);
    }

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

  const handleSpiceChange = (spiceTolerance: number) => {
    setForm((previous) => ({ ...previous, spiceTolerance }));
  };

  const handlePriceChange = (
    field: "minimumPrice" | "maximumPrice",
    value: string,
  ) => {
    const num = value === "" ? "" : parseFloat(value);
    setForm((previous) => ({
      ...previous,
      [field]: Number.isNaN(num) ? "" : num,
    }));
  };

  const handleCurrencyChange = (currencyCode: "USD" | "KHR") => {
    setForm((previous) => ({ ...previous, currencyCode }));
  };

  const handleRadiusChange = (defaultSearchRadiusKm: number) => {
    setForm((previous) => ({ ...previous, defaultSearchRadiusKm }));
  };

  const toggleTaste = (key: string) => {
    setForm((previous) => ({
      ...previous,
      tastePreferences: {
        ...previous.tastePreferences,
        [key]: !previous.tastePreferences[key],
      },
    }));
  };

  const toggleTexture = (key: string) => {
    setForm((previous) => ({
      ...previous,
      texturePreferences: {
        ...previous.texturePreferences,
        [key]: !previous.texturePreferences[key],
      },
    }));
  };

  const toggleCuisine = (cuisineCode: string) => {
    setForm((previous) => {
      const exists = previous.cuisinePreferences.some(
        (c) => c.cuisineCode === cuisineCode,
      );
      if (exists) {
        return {
          ...previous,
          cuisinePreferences: previous.cuisinePreferences.filter(
            (c) => c.cuisineCode !== cuisineCode,
          ),
        };
      }
      return {
        ...previous,
        cuisinePreferences: [
          ...previous.cuisinePreferences,
          {
            cuisineCode,
            preferenceLevel: "LOVE",
            priority: previous.cuisinePreferences.length + 1,
          },
        ],
      };
    });
  };

  const updateCuisineLevel = (
    cuisineCode: string,
    preferenceLevel: CuisinePreferenceLevel,
  ) => {
    setForm((previous) => ({
      ...previous,
      cuisinePreferences: previous.cuisinePreferences.map((c) =>
        c.cuisineCode === cuisineCode ? { ...c, preferenceLevel } : c,
      ),
    }));
  };

  const removeCuisine = (cuisineCode: string) => {
    setForm((previous) => ({
      ...previous,
      cuisinePreferences: previous.cuisinePreferences.filter(
        (c) => c.cuisineCode !== cuisineCode,
      ),
    }));
  };

  const retrySafetyOptions = () => {
    void refetchAllergens();
    void refetchDietary();
    void refetchMedical();
  };

  /* ---- Avatar file pick handler ---- */
  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("សូមជ្រើសរើសរូបភាព JPG, PNG ឬ WebP");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("ទំហំឯកសារមិនត្រូវលើសពី 5 MB");
      return;
    }

    setAvatarError(null);

    /* Show an instant local preview while we upload */
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl(objectUrl);

    try {
      const mediaResult = await uploadMedia({
        file,
        purpose: "PROFILE_AVATAR",
      }).unwrap();

      setPendingAvatarUuid(mediaResult.uuid);
    } catch (err) {
      /* Revert preview on failure */
      URL.revokeObjectURL(objectUrl);
      setAvatarPreviewUrl(null);
      setAvatarError(getErrorMessage(err));
    }
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


    if (hasSafetyOptionError) {
      setErrorMessage("សូមទាញយកជម្រើសសុវត្ថិភាពឡើងវិញ មុនពេលរក្សាទុក។");
      return;
    }

    try {
      const basicPatch: {
        profileName?: string;
        relationship?: MemberRelationship;
        gender?: MemberGender;
        dateOfBirth?: string;
        preferredLanguage?: string;
        avatarMediaUuid?: string | null;
      } = {};

      if (form.profileName.trim() !== profile.profileName) {
        basicPatch.profileName = form.profileName.trim();
      }

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

      if (pendingAvatarUuid !== profile.avatarMediaUuid) {
        basicPatch.avatarMediaUuid = pendingAvatarUuid;
      }

      if (Object.keys(basicPatch).length > 0) {
        await updateMemberProfile({
          uuid,
          body: basicPatch,
        }).unwrap();
      }

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
       * ==================================================
       * 5. GENERAL PREFERENCES (SPICE, BUDGET, RADIUS, TASTES)
       * ==================================================
       */
      const minPrice =
        typeof form.minimumPrice === "number" ? form.minimumPrice : undefined;
      const maxPrice =
        typeof form.maximumPrice === "number" ? form.maximumPrice : undefined;

      await saveMemberPreferences({
        uuid,
        preferences: {
          spiceTolerance: form.spiceTolerance,
          minimumPrice: minPrice,
          maximumPrice: maxPrice,
          currencyCode: form.currencyCode,
          defaultSearchRadiusKm: form.defaultSearchRadiusKm,
          tastePreferences: form.tastePreferences,
          texturePreferences: form.texturePreferences,
        },
      }).unwrap();

      /*
       * ==================================================
       * 6. CUISINE PREFERENCES
       * ==================================================
       */
      if (form.cuisinePreferences.length > 0) {
        await saveMemberCuisines({
          uuid,
          cuisines: form.cuisinePreferences.map((item, index) => ({
            cuisineCode: item.cuisineCode,
            preferenceLevel: item.preferenceLevel,
            priority: item.priority || index + 1,
          })),
        }).unwrap();
      }

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

          <p className="mt-4 text-lg text-slate-500">
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
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-lg font-medium text-white"
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

      {/* Header */}

      {/* Header */}
      <div className=" fixed top-18 w-full container  max-w-6xl z-40 mb-8">
        <div className="flex w-full p-1 items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/90  shadow-lg shadow-slate-200/40 backdrop-blur-xl sm:rounded-full">
          {/* Back */}
          <Link
            href={`/dashboard/family-profile/${uuid}`}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-slate-600 transition bg-slate-100 hover:text-primary-800"
            aria-label="ត្រឡប់ក្រោយ"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          {/* Title */}
          {/* <div className="min-w-0 flex-1 px-1">
            <p className="truncate text-[17px] font-bold text-primary-800 sm:text-[20px]">
              កែប្រែគណនី
            </p>

            <p className="hidden truncate text-lg  text-slate-500 sm:block">
              កំពុងកែប្រែព័ត៌មានរបស់{" "}
              <span className="font-semibold text-slate-700">
                {profile.profileName}
              </span>
            </p>
          </div> */}

          {/* Save */}
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={
              isSaving || isLoadingSafetyOptions || hasSafetyOptionError
            }
            className="inline-flex h-12 cursor-pointer   shrink-0 items-center justify-center gap-2 rounded-full bg-primary-800 px-4 text-[16px] font-semibold text-white transition hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:text-[17px]"
          >
            {isSaving ? (
              <>
                <LoaderCircle className="h-5 w-5 animate-spin" />

                <span className="hidden sm:inline">កំពុងរក្សាទុក...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />

                <span className="hidden sm:inline">រក្សាទុក</span>
              </>
            )}
          </button>
        </div>
      </div>
      {/* Basic info */}

      <section className="mt-7 rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
        {/* Header */}
        <div className="border-b border-slate-100 pb-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-800/10 text-primary-800">
              <UserRound className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-[24px] font-bold text-primary-800 sm:text-[28px]">
                ព័ត៌មានគណនី
              </h2>

              <p className="mt-2 text-lg leading-7 text-slate-500">
                កែប្រែព័ត៌មានមូលដ្ឋានរបស់សមាជិក។
              </p>
            </div>
          </div>
        </div>

        {/* ---- Avatar upload ---- */}
        <div className="mt-6 flex flex-col items-center gap-3 border-b border-slate-100 pb-6 sm:flex-row sm:gap-5">
          {/* Hidden file input */}
          <input
            ref={avatarInputRef}
            id="edit-avatar-input"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => void handleAvatarChange(e)}
            disabled={isUploadingAvatar}
          />

          {/* Avatar preview */}
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={isUploadingAvatar}
            title="ផ្លាស់ប្ដូររូបតំណាង"
            aria-label="ផ្លាស់ប្ដូររូបតំណាង"
            className="group relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[22px] ring-4 ring-primary-800/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {/* Photo, preview, or initials */}
            {avatarPreviewUrl ? (
              <Image
                src={avatarPreviewUrl}
                alt="Preview"
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : avatarAccessUrlData?.url ? (
              <Image
                src={avatarAccessUrlData.url}
                alt={form.profileName}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-primary-800/10 text-[34px] font-bold text-primary-800">
                {form.profileName.trim().charAt(0).toUpperCase() || "?"}
              </span>
            )}

            {/* Spinner while uploading */}
            {isUploadingAvatar && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/50">
                <LoaderCircle className="h-7 w-7 animate-spin text-white" />
              </span>
            )}

            {/* Camera hover overlay */}
            {!isUploadingAvatar && (
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <IoCameraOutline className="text-[26px] text-white" />
                <span className="text-[11px] font-semibold text-white">
                  ផ្លាស់ប្ដូរ
                </span>
              </span>
            )}
          </button>

          <div className="text-center sm:text-left">
            <p className="text-lg font-semibold text-slate-700">
              រូបតំណាង
            </p>
            <p className="mt-1 text-[15px] leading-6 text-slate-500">
              ចុចលើរូបភាពដើម្បីផ្ទុករូបថ្មី។
              <br />
              JPG, PNG ឬ WebP · អតិបរមា 5 MB
            </p>
            {avatarError && (
              <p className="mt-2 text-[15px] text-red-600">{avatarError}</p>
            )}
          </div>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
          {/* Name */}
          <div className="md:col-span-2">
            <label
              htmlFor="edit-profile-name"
              className="mb-2.5 block text-lg font-semibold text-slate-700"
            >
              ឈ្មោះគណនី
            </label>

            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                id="edit-profile-name"
                value={form.profileName}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    profileName: event.target.value,
                  }))
                }
                className="min-h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3 pl-12 pr-4 text-lg text-primary-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-primary-800 focus:bg-white focus:ring-4 focus:ring-primary-800/10"
              />
            </div>
          </div>

          {/* Relationship */}
          <div>
            <label
              htmlFor="edit-relationship"
              className="mb-2.5 block text-lg font-semibold text-slate-700"
            >
              ទំនាក់ទំនង
            </label>

            <div className="relative">
              <UsersRound className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400" />

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
                className="min-h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/60 py-3 pl-12 pr-12 text-lg font-medium text-primary-800 outline-none transition hover:border-slate-300 hover:bg-white focus:border-primary-800 focus:bg-white focus:ring-4 focus:ring-primary-800/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              >
                {Object.entries(relationshipLabels).map(([value, label]) => (
                  <option key={value} value={value} className="text-lg">
                    {label}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            </div>

            {profile.relationship === "SELF" && (
              <p className="mt-2.5 text-lg leading-7 text-slate-500">
                គណនីខ្លួនឯងមិនអាចប្តូរទំនាក់ទំនងទៅជាសមាជិកផ្សេងបានទេ។
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label
              htmlFor="edit-gender"
              className="mb-2.5 block text-lg font-semibold text-slate-700"
            >
              ភេទ
            </label>

            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <select
                id="edit-gender"
                value={form.gender}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    gender: event.target.value as MemberGender,
                  }))
                }
                className="min-h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/60 py-3 pl-12 pr-12 text-lg font-medium text-primary-800 outline-none transition hover:border-slate-300 hover:bg-white focus:border-primary-800 focus:bg-white focus:ring-4 focus:ring-primary-800/10"
              >
                {Object.entries(genderLabels).map(([value, label]) => (
                  <option key={value} value={value} className="text-lg">
                    {label}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          {/* Date of birth */}
          <div>
            <label
              htmlFor="edit-dob"
              className="mb-2.5 block text-lg font-semibold text-slate-700"
            >
              ថ្ងៃខែឆ្នាំកំណើត
            </label>

            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400" />

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
                className="min-h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3 pl-12 pr-4 text-lg font-medium text-primary-800 outline-none transition hover:border-slate-300 hover:bg-white focus:border-primary-800 focus:bg-white focus:ring-4 focus:ring-primary-800/10"
              />
            </div>
          </div>

          {/* Language */}
          <div>
            <label
              htmlFor="edit-language"
              className="mb-2.5 block text-lg font-semibold text-slate-700"
            >
              ភាសាដែលពេញចិត្ត
            </label>

            <div className="relative">
              <Languages className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <select
                id="edit-language"
                value={form.preferredLanguage}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    preferredLanguage: event.target.value,
                  }))
                }
                className="min-h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/60 py-3 pl-12 pr-12 text-lg font-medium text-primary-800 outline-none transition hover:border-slate-300 hover:bg-white focus:border-primary-800 focus:bg-white focus:ring-4 focus:ring-primary-800/10"
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
        </div>
      </section>

      {/* 2. General Food & Taste Preferences */}
      <section className="mt-7 rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
        <div className="border-b border-slate-100 pb-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-[24px] font-bold text-primary-800 sm:text-[28px]">
                ចំណូលចិត្តទូទៅ និងរសជាតិ
              </h2>
              <p className="mt-2 text-lg leading-7 text-slate-500">
                កំណត់កម្រិតហឹរ ថវិកាអាហារ ចម្ងាយរុករក និងចំណូលចិត្តរសជាតិ។
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 space-y-8">
          {/* Spice Tolerance Slider */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-lg font-bold text-slate-800">
                  កម្រិតហឹរដែលចូលចិត្ត (Spice Tolerance)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary-800 px-3.5 py-1 text-sm font-black text-white shadow-xs">
                  {form.spiceTolerance} / 10
                </span>
                <span
                  className={`text-base font-bold ${
                    getSpiceDescriptor(form.spiceTolerance).colorClass
                  }`}
                >
                  {getSpiceDescriptor(form.spiceTolerance).emoji}{" "}
                  {getSpiceDescriptor(form.spiceTolerance).labelKm}
                </span>
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={form.spiceTolerance}
              onChange={(e) =>
                handleSpiceChange(parseInt(e.target.value, 10))
              }
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-800"
            />

            <div className="mt-3 flex justify-between text-xs sm:text-sm font-medium text-slate-400">
              <span>0 (មិនហឹរ)</span>
              <span>3 (ស្រាល)</span>
              <span>5 (មធ្យម)</span>
              <span>8 (ខ្លាំង)</span>
              <span>10 (ខ្លាំងបំផុត)</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[0, 3, 5, 7, 10].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSpiceChange(preset)}
                  className={`rounded-xl px-3 py-1.5 text-sm font-bold transition ${
                    form.spiceTolerance === preset
                      ? "bg-primary-800 text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:border-primary-800"
                  }`}
                >
                  កម្រិត {preset}{" "}
                  {preset === 0
                    ? "(មិនហឹរ)"
                    : preset === 5
                    ? "(មធ្យម)"
                    : preset === 10
                    ? "(ខ្លាំង)"
                    : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Budget and Discovery Radius */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Budget */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-emerald-600" />
                  <span className="text-lg font-bold text-slate-800">
                    ថវិកាអាហារ (Budget)
                  </span>
                </div>
                {/* Currency toggle */}
                <div className="flex rounded-xl border border-slate-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => handleCurrencyChange("USD")}
                    className={`rounded-lg px-3 py-1 text-xs font-black transition ${
                      form.currencyCode === "USD"
                        ? "bg-primary-800 text-white"
                        : "text-slate-600 hover:text-primary-800"
                    }`}
                  >
                    USD ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCurrencyChange("KHR")}
                    className={`rounded-lg px-3 py-1 text-xs font-black transition ${
                      form.currencyCode === "KHR"
                        ? "bg-primary-800 text-white"
                        : "text-slate-600 hover:text-primary-800"
                    }`}
                  >
                    KHR (៛)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    តម្លៃទាបបំផុត (Min)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={form.currencyCode === "USD" ? "0.5" : "500"}
                      placeholder="0"
                      value={form.minimumPrice}
                      onChange={(e) =>
                        handlePriceChange("minimumPrice", e.target.value)
                      }
                      className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-base font-bold text-slate-800 outline-none transition focus:border-primary-800 focus:ring-2 focus:ring-primary-800/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    តម្លៃខ្ពស់បំផុត (Max)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={form.currencyCode === "USD" ? "0.5" : "500"}
                      placeholder="20"
                      value={form.maximumPrice}
                      onChange={(e) =>
                        handlePriceChange("maximumPrice", e.target.value)
                      }
                      className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-base font-bold text-slate-800 outline-none transition focus:border-primary-800 focus:ring-2 focus:ring-primary-800/10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Default Search Radius */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-blue-600" />
                  <span className="text-lg font-bold text-slate-800">
                    ចម្ងាយរុករក (Search Radius)
                  </span>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-blue-700">
                  {form.defaultSearchRadiusKm.toFixed(1)} km
                </span>
              </div>

              <input
                type="range"
                min={1}
                max={20}
                step={0.5}
                value={form.defaultSearchRadiusKm}
                onChange={(e) =>
                  handleRadiusChange(parseFloat(e.target.value))
                }
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                {[1, 3, 5, 10, 15, 20].map((radius) => (
                  <button
                    key={radius}
                    type="button"
                    onClick={() => handleRadiusChange(radius)}
                    className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                      form.defaultSearchRadiusKm === radius
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-blue-600"
                    }`}
                  >
                    {radius} km
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Taste Preferences */}
          <div>
            <div className="mb-3">
              <label className="block text-lg font-bold text-slate-800">
                ចំណូលចិត្តរសជាតិ (Taste Preferences)
              </label>
              <p className="text-sm text-slate-500">
                ជ្រើសរើសរសជាតិដែលអ្នកចង់ឱ្យប្រព័ន្ធណែនាំផ្តល់អាទិភាព។
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {TASTE_OPTIONS.map((taste) => {
                const isSelected = Boolean(
                  form.tastePreferences[taste.key],
                );
                return (
                  <button
                    key={taste.key}
                    type="button"
                    onClick={() => toggleTaste(taste.key)}
                    className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-base font-bold transition ${
                      isSelected
                        ? "border-primary-800 bg-primary-800 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-primary-800 hover:bg-primary-50/50"
                    }`}
                  >
                    <span>{taste.emoji}</span>
                    <span>{taste.labelKm}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Texture Preferences */}
          <div>
            <div className="mb-3">
              <label className="block text-lg font-bold text-slate-800">
                ទម្រង់អាហារដែលចូលចិត្ត (Texture Preferences)
              </label>
              <p className="text-sm text-slate-500">
                ជ្រើសរើសប្រភេទសាច់ ឬទម្រង់អាហារដែលអ្នកចូលចិត្តញ៉ាំ។
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {TEXTURE_OPTIONS.map((texture) => {
                const isSelected = Boolean(
                  form.texturePreferences[texture.key],
                );
                return (
                  <button
                    key={texture.key}
                    type="button"
                    onClick={() => toggleTexture(texture.key)}
                    className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-base font-bold transition ${
                      isSelected
                        ? "border-amber-600 bg-amber-600 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-amber-600 hover:bg-amber-50/50"
                    }`}
                  >
                    <span>{texture.emoji}</span>
                    <span>{texture.labelKm}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Cuisine Preferences Section */}
      <section className="mt-7 rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
        <div className="border-b border-slate-100 pb-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600">
              <Utensils className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-[24px] font-bold text-primary-800 sm:text-[28px]">
                ចំណូលចិត្តប្រភេទម្ហូប (Cuisine Preferences)
              </h2>
              <p className="mt-2 text-lg leading-7 text-slate-500">
                ជ្រើសរើសម្ហូបតាមជាតិសាសន៍ និងកំណត់កម្រិតចូលចិត្ត ឬជៀសវាង។
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 space-y-6">
          {/* Quick select buttons */}
          <div>
            <label className="block text-base font-bold text-slate-700 mb-2">
              បន្ថែម ឬជ្រើសរើសម្ហូបជាតិសាសន៍
            </label>
            <div className="flex flex-wrap gap-2.5">
              {CUISINE_OPTIONS.map((cuisine) => {
                const isSelected = form.cuisinePreferences.some(
                  (c) => c.cuisineCode === cuisine.code,
                );
                return (
                  <button
                    key={cuisine.code}
                    type="button"
                    onClick={() => toggleCuisine(cuisine.code)}
                    className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-base font-bold transition ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-indigo-600 hover:bg-indigo-50/50"
                    }`}
                  >
                    <span>{cuisine.flag}</span>
                    <span>{cuisine.labelKm}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configured cuisines list */}
          {form.cuisinePreferences.length > 0 && (
            <div className="space-y-3 pt-2">
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider">
                ម្ហូបដែលបានកំណត់កម្រិត ({form.cuisinePreferences.length})
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {form.cuisinePreferences.map((item, index) => {
                  const cuisineMeta = CUISINE_OPTIONS.find(
                    (c) => c.code === item.cuisineCode,
                  );
                  return (
                    <div
                      key={item.cuisineCode}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {cuisineMeta?.flag ?? "🍽️"}
                          </span>
                          <span className="font-bold text-slate-900 text-base">
                            {cuisineMeta?.labelKm ?? item.cuisineCode}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCuisine(item.cuisineCode)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="លុប"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div>
                          <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                            កម្រិតចំណូលចិត្ត
                          </label>
                          <select
                            value={item.preferenceLevel}
                            onChange={(e) =>
                              updateCuisineLevel(
                                item.cuisineCode,
                                e.target.value as CuisinePreferenceLevel,
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 px-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600"
                          >
                            {PREFERENCE_LEVELS.map((level) => (
                              <option key={level.value} value={level.value}>
                                {level.labelKm}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                            អាទិភាព (1-10)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={item.priority || index + 1}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setForm((prev) => ({
                                ...prev,
                                cuisinePreferences:
                                  prev.cuisinePreferences.map((c) =>
                                    c.cuisineCode === item.cuisineCode
                                      ? {
                                          ...c,
                                          priority: Number.isNaN(val)
                                            ? 1
                                            : val,
                                        }
                                      : c,
                                  ),
                              }));
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 px-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-600"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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

              <p className="mt-2 text-lg leading-7 text-red-600">
                សូមព្យាយាមទាញយកឡើងវិញ មុនពេលរក្សាទុកការផ្លាស់ប្តូរ។
              </p>

              <button
                type="button"
                onClick={retrySafetyOptions}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-lg font-semibold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100"
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

            <p className="mt-3 text-lg text-slate-500">
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
              <p className="rounded-xl bg-slate-50 p-4 text-lg text-slate-500">
                មិនមានជម្រើសអាឡែហ្ស៊ី។
              </p>
            ) : (
              <div className="space-y-5">
                {/* Allergy tags */}
                <div className="flex flex-wrap gap-3">
                  {allergenOptions.map((option) => {
                    const isSelected = form.allergies.some(
                      (item) => item.allergenCode === option.code,
                    );

                    return (
                      <button
                        key={option.code}
                        type="button"
                        onClick={() => toggleAllergy(option.code)}
                        className={`rounded-full border px-5 py-2.5 text-[17px] font-medium transition-all duration-200 ${
                          isSelected
                            ? "border-primary-800 bg-primary-800 text-white shadow-sm"
                            : "border-slate-300 bg-white text-slate-700 hover:border-primary-800 hover:bg-primary-50 hover:text-primary-800"
                        }`}
                      >
                        {option.localName || option.name || option.code}
                      </button>
                    );
                  })}
                </div>

                {/* Selected allergies */}
                {/* {form.allergies.map((selectedItem) => {
                  const option = allergenOptions.find(
                    (item) => item.code === selectedItem.allergenCode,
                  );

                  if (!option) return null;

                  return (
                    <div
                      key={selectedItem.allergenCode}
                      className="grid gap-4 rounded-2xl border border-primary-800/20 bg-primary-50/50 p-5 md:grid-cols-2"
                    >
                      <div className="flex items-start justify-between gap-4 md:col-span-2">
                        <div>
                          <p className="text-[18px] font-semibold text-primary-800">
                            {option.localName || option.name || option.code}
                          </p>

                          {option.description && (
                            <p className="mt-1 text-base leading-7 text-slate-500">
                              {option.description}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleAllergy(option.code)}
                          className="shrink-0 text-sm font-medium text-red-500 transition hover:text-red-600"
                        >
                          លុប
                        </button>
                      </div>

                      <div>
                        <label className="mb-2 block text-lg font-semibold text-slate-700">
                          កម្រិតធ្ងន់ធ្ងរ
                        </label>

                        <select
                          value={selectedItem.severity}
                          onChange={(event) =>
                            updateAllergy(option.code, {
                              severity: event.target.value as ProfileSeverity,
                            })
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg outline-none transition focus:border-primary-800 focus:ring-2 focus:ring-primary-800/10"
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
                        <label className="mb-2 block text-lg font-semibold text-slate-700">
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
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg outline-none transition focus:border-primary-800 focus:ring-2 focus:ring-primary-800/10"
                        />
                      </div>

                      <label className="flex cursor-pointer items-center gap-3 text-lg text-slate-700">
                        <input
                          type="checkbox"
                          checked={selectedItem.avoidCrossContact}
                          onChange={(event) =>
                            updateAllergy(option.code, {
                              avoidCrossContact: event.target.checked,
                            })
                          }
                          className="h-5 w-5 rounded border-slate-300"
                        />
                        ជៀសវាងការប៉ះពាល់ឆ្លង
                      </label>

                      <label className="flex cursor-pointer items-center gap-3 text-lg text-slate-700">
                        <input
                          type="checkbox"
                          checked={selectedItem.medicallyDiagnosed}
                          onChange={(event) =>
                            updateAllergy(option.code, {
                              medicallyDiagnosed: event.target.checked,
                            })
                          }
                          className="h-5 w-5 rounded border-slate-300"
                        />
                        បានវិនិច្ឆ័យដោយវេជ្ជបណ្ឌិត
                      </label>
                    </div>
                  );
                })} */}
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
              <p className="rounded-xl bg-slate-50 p-4 text-lg text-slate-500">
                មិនមានជម្រើសរបបអាហារ។
              </p>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap gap-3">
                  {dietaryOptions.map((option) => {
                    const isSelected = form.dietaryTypes.some(
                      (item) => item.dietaryTypeCode === option.code,
                    );

                    return (
                      <button
                        key={option.code}
                        type="button"
                        onClick={() => toggleDietaryType(option.code)}
                        className={`rounded-full border px-5 py-2.5 text-[17px] font-medium transition-all duration-200 ${
                          isSelected
                            ? "border-primary-800 bg-primary-800 text-white shadow-sm"
                            : "border-slate-300 bg-white text-slate-700 hover:border-primary-800 hover:bg-primary-50 hover:text-primary-800"
                        }`}
                      >
                        {option.localName || option.name || option.code}
                      </button>
                    );
                  })}
                </div>

                {/* {form.dietaryTypes.map((selectedItem) => {
                  const option = dietaryOptions.find(
                    (item) => item.code === selectedItem.dietaryTypeCode,
                  );

                  if (!option) return null;

                  return (
                    <div
                      key={selectedItem.dietaryTypeCode}
                      className="grid gap-4 rounded-2xl border border-primary-800/20 bg-primary-50/50 p-5 md:grid-cols-2"
                    >
                      <div className="flex items-start justify-between gap-4 md:col-span-2">
                        <div>
                          <p className="text-[18px] font-semibold text-primary-800">
                            {option.localName || option.name || option.code}
                          </p>

                          {option.description && (
                            <p className="mt-1 text-base leading-7 text-slate-500">
                              {option.description}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleDietaryType(option.code)}
                          className="shrink-0 text-sm font-medium text-red-500 transition hover:text-red-600"
                        >
                          លុប
                        </button>
                      </div>

                      <div>
                        <label className="mb-2 block text-lg font-semibold text-slate-700">
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
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg outline-none transition focus:border-primary-800 focus:ring-2 focus:ring-primary-800/10"
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
                        <label className="mb-2 block text-lg font-semibold text-slate-700">
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
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg outline-none transition focus:border-primary-800 focus:ring-2 focus:ring-primary-800/10"
                        />
                      </div>
                    </div>
                  );
                })} */}
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
              <p className="rounded-xl bg-slate-50 p-4 text-lg text-slate-500">
                មិនមានជម្រើសសុខភាព។
              </p>
            ) : (
              <div className="space-y-5">
                {/* Medical condition tags */}
                <div className="flex flex-wrap gap-3">
                  {medicalOptions.map((option) => {
                    const isSelected = form.medicalConditions.some(
                      (item) => item.conditionCode === option.code,
                    );

                    return (
                      <button
                        key={option.code}
                        type="button"
                        onClick={() => toggleMedicalCondition(option.code)}
                        className={`rounded-full border px-5 py-2.5 text-[17px] font-medium transition-all duration-200 ${
                          isSelected
                            ? "border-primary-800 bg-primary-800 text-white shadow-sm"
                            : "border-slate-300 bg-white text-slate-700 hover:border-primary-800 hover:bg-primary-50 hover:text-primary-800"
                        }`}
                      >
                        {option.localName || option.name || option.code}
                      </button>
                    );
                  })}
                </div>

                {/* Selected medical conditions */}
                {form.medicalConditions.map((selectedItem) => {
                  const option = medicalOptions.find(
                    (item) => item.code === selectedItem.conditionCode,
                  );

                  if (!option) return null;

                  return (
                    <div
                      key={selectedItem.conditionCode}
                      className="grid gap-4 rounded-2xl border border-primary-800/20 bg-primary-50/50 p-5 md:grid-cols-2"
                    >
                      <div className="flex items-center justify-between md:col-span-2">
                        <div>
                          <p className="text-[18px] font-semibold text-primary-800">
                            {option.localName || option.name || option.code}
                          </p>

                          {option.description && (
                            <p className="mt-1 text-base leading-7 text-slate-500">
                              {option.description}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleMedicalCondition(option.code)}
                          className="shrink-0 text-sm font-medium text-red-500 transition hover:text-red-600"
                        >
                          លុប
                        </button>
                      </div>

                      <div>
                        <label className="mb-2 block text-lg font-semibold text-slate-700">
                          កម្រិតធ្ងន់ធ្ងរ
                        </label>

                        <select
                          value={selectedItem.severity}
                          onChange={(event) =>
                            updateMedicalCondition(option.code, {
                              severity: event.target.value as ProfileSeverity,
                            })
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg outline-none transition focus:border-primary-800 focus:ring-2 focus:ring-primary-800/10"
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
                        <label className="mb-2 block text-lg font-semibold text-slate-700">
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
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg outline-none transition focus:border-primary-800 focus:ring-2 focus:ring-primary-800/10"
                        />
                      </div>
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

          <p className="text-lg leading-7 text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Bottom actions */}

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
        <Link
          href={`/dashboard/family-profile/${uuid}`}
          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-lg font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          បោះបង់
        </Link>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving || isLoadingSafetyOptions || hasSafetyOptionError}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-lg font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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
