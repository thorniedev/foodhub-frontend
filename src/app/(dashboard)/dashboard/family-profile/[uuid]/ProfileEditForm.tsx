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
  Crown,
  Flame,
  HeartPulse,
  IdCard,
  ImageIcon,
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
import { FiAlertTriangle } from "react-icons/fi";

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
import { CustomSelect } from "@/components/shared/CustomSelect";

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
  { key: "spicy", labelKm: "ហឹរ (Spicy)" },
  { key: "savory", labelKm: "ប្រៃ / ឈ្ងុយ (Savory)" },
  { key: "soup", labelKm: "ស៊ុប / ទឹកសម្ល (Soup)" },
  { key: "sweet", labelKm: "ផ្អែម (Sweet)" },
  { key: "sour", labelKm: "ជូរ (Sour)" },
  { key: "bitter", labelKm: "ល្វីង (Bitter)" },
];

export const TEXTURE_OPTIONS = [
  { key: "crispy", labelKm: "ស្រួយ (Crispy)" },
  { key: "chewy", labelKm: "ស្វិត (Chewy)" },
  { key: "creamy", labelKm: "ទន់ម៉ត់ / ក្រែម (Creamy)" },
  { key: "tender", labelKm: "ផុយទន់ (Tender)" },
  { key: "crunchy", labelKm: "ស្រួយក្រុប (Crunchy)" },
];

export const CUISINE_OPTIONS = [
  { code: "KHMER", labelKm: "ខ្មែរ (Khmer)" },
  { code: "JAPANESE", labelKm: "ជប៉ុន (Japanese)" },
  { code: "CHINESE", labelKm: "ចិន (Chinese)" },
  { code: "KOREAN", labelKm: "កូរ៉េ (Korean)" },
  { code: "VIETNAMESE", labelKm: "វៀតណាម (Vietnamese)" },
  { code: "WESTERN", labelKm: "បស្ចិមប្រទេស (Western)" },
  { code: "INDIAN", labelKm: "ឥណ្ឌា (Indian)" },
  { code: "ITALIAN", labelKm: "អ៊ីតាលី (Italian)" },
  { code: "FRENCH", labelKm: "បារាំង (French)" },
];

export const PREFERENCE_LEVELS: {
  value: CuisinePreferenceLevel;
  labelKm: string;
  badgeClass: string;
}[] = [
  {
    value: "LOVE",
    labelKm: " ចូលចិត្តខ្លាំង (LOVE)",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
  },
  {
    value: "LIKE",
    labelKm: " ចូលចិត្ត (LIKE)",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    value: "NEUTRAL",
    labelKm: " ធម្មតា (NEUTRAL)",
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
  },
  {
    value: "DISLIKE",
    labelKm: " មិនសូវចូលចិត្ត (DISLIKE)",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    value: "AVOID",
    labelKm: " ជៀសវាង (AVOID)",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-300",
  },
];

export function getSpiceDescriptor(level: number): {
  labelKm: string;
  colorClass: string;
} {
  if (level === 0)
    return {
      labelKm: "មិនហឹរទាល់តែសោះ (Mild / 0)",
      colorClass: "text-slate-500",
    };
  if (level <= 3)
    return {
      labelKm: "ហឹរតិចតួច (Mild)",
      colorClass: "text-emerald-600",
    };
  if (level <= 6)
    return {
      labelKm: "ហឹរមធ្យម (Medium)",
      colorClass: "text-amber-600",
    };
  if (level <= 8)
    return {
      labelKm: "ហឹរខ្លាំង (Hot)",
      colorClass: "text-orange-600",
    };
  return {
    labelKm: "ហឹរខ្លាំងបំផុត (Extremely Spicy)",
    colorClass: "text-red-600 font-black",
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

const severityBadges: Record<ProfileSeverity, string> = {
  MILD: "bg-emerald-50 text-emerald-700 border-emerald-200",
  MODERATE: "bg-amber-50 text-amber-700 border-amber-200",
  SEVERE: "bg-red-50 text-red-700 border-red-200",
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

function deduplicateByCode<T>(items: T[], getCode: (item: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const raw = getCode(item);
    const code = raw ? raw.trim().toUpperCase() : "";
    if (code && !seen.has(code)) {
      seen.add(code);
      result.push(item);
    }
  }
  return result;
}

function normalizeAllergies(value: unknown): AllergyFormItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const items = value.flatMap((item) => {
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

  return deduplicateByCode(items, (i) => i.allergenCode);
}

function normalizeDietaryTypes(value: unknown): DietaryFormItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const items = value.flatMap((item, index) => {
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

  return deduplicateByCode(items, (i) => i.dietaryTypeCode);
}

function normalizeMedicalConditions(value: unknown): MedicalFormItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const items = value.flatMap((item) => {
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

  return deduplicateByCode(items, (i) => i.conditionCode);
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
    result.cuisinePreferences = record.cuisines.map((c: any, idx: number) => ({
      cuisineCode: String(c.cuisineCode || c.code).toUpperCase(),
      preferenceLevel: (c.preferenceLevel || "LOVE") as CuisinePreferenceLevel,
      priority: c.priority || idx + 1,
    }));
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

function calculateAge(dateOfBirth?: string | null): number {
  if (!dateOfBirth || typeof dateOfBirth !== "string") {
    return 0;
  }
  const parts = dateOfBirth.split("-").map(Number);
  if (parts.length < 3) return 0;
  const [year, month, day] = parts;
  if (!year || !month || !day || Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return 0;
  const today = new Date();
  let age = today.getFullYear() - year;
  const birthdayPassed =
    today.getMonth() + 1 > month ||
    (today.getMonth() + 1 === month && today.getDate() >= day);
  if (!birthdayPassed) age -= 1;
  return Math.max(age, 0);
}

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
        <span className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
          {value}
        </span>
        {suffix && (
          <span className="text-sm font-medium text-slate-400 dark:text-slate-500 lg:text-lg">
            {suffix}
          </span>
        )}
      </div>
      <span className="mt-1 truncate text-sm font-semibold text-slate-500 dark:text-slate-400 sm:text-base lg:text-lg">
        {label}
      </span>
    </div>
  );
}

function ProfileAnchor({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="shrink-0 rounded-xl px-4 py-2 text-sm sm:text-base lg:text-lg font-bold text-slate-600 transition hover:bg-slate-100 hover:text-primary-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-400 lg:px-5 lg:py-2.5"
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
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-28 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:bg-slate-900 sm:p-7 lg:p-8 ${className}`}
    >
      <div className="mb-5 flex items-start gap-3.5 lg:mb-6 lg:gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 dark:bg-emerald-950/60 dark:text-emerald-400 lg:h-13 lg:w-13">
          {icon}
        </span>

        <div className="min-w-0">
          <p className="text-xl font-bold text-primary-800 dark:text-emerald-400 sm:text-2xl lg:text-[26px]">
            {title}
          </p>
          {description && (
            <p className="mt-1 text-sm sm:text-base lg:text-[17px] leading-6 sm:leading-7 text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
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

      // 2. Allergies
      const activeAllergenCodes = new Set(
        allergenOptions.map((opt) => opt.code.toUpperCase()),
      );
      const validAllergies =
        allergenOptions.length > 0
          ? form.allergies.filter((item) =>
              activeAllergenCodes.has(item.allergenCode.toUpperCase()),
            )
          : form.allergies;

      const uniqueAllergies = deduplicateByCode(
        validAllergies,
        (item) => item.allergenCode,
      );
      const originalAllergyCount = profile.allergies?.length ?? 0;

      if (uniqueAllergies.length > 0) {
        await saveMemberAllergies({
          uuid,
          allergies: uniqueAllergies.map((item) => ({
            allergenCode: item.allergenCode.toUpperCase(),
            severity: item.severity,
            reactionNotes: item.reactionNotes.trim() || null,
            avoidCrossContact: item.avoidCrossContact,
            medicallyDiagnosed: item.medicallyDiagnosed,
          })),
        }).unwrap();
      } else if (originalAllergyCount > 0) {
        try {
          await saveMemberAllergies({ uuid, allergies: [] }).unwrap();
        } catch {
          await clearSafetySection(uuid, "allergies").catch(() => {});
        }
      }

      // 3. Dietary Types
      const activeDietaryCodes = new Set(
        dietaryOptions.map((opt) => opt.code.toUpperCase()),
      );
      const validDietaryTypes =
        dietaryOptions.length > 0
          ? form.dietaryTypes.filter((item) =>
              activeDietaryCodes.has(item.dietaryTypeCode.toUpperCase()),
            )
          : form.dietaryTypes;

      const uniqueDietaryTypes = deduplicateByCode(
        validDietaryTypes,
        (item) => item.dietaryTypeCode,
      );
      const originalDietaryCount = profile.dietaryTypes?.length ?? 0;

      if (uniqueDietaryTypes.length > 0) {
        await saveMemberDietaryTypes({
          uuid,
          dietaryTypes: uniqueDietaryTypes.map((item, index) => ({
            dietaryTypeCode: item.dietaryTypeCode.toUpperCase(),
            enforcementLevel: item.enforcementLevel,
            priority: index + 1,
            notes: item.notes.trim() || null,
          })),
        }).unwrap();
      } else if (originalDietaryCount > 0) {
        try {
          await saveMemberDietaryTypes({ uuid, dietaryTypes: [] }).unwrap();
        } catch {
          await clearSafetySection(uuid, "dietary-types").catch(() => {});
        }
      }

      // 4. Medical Conditions
      const activeMedicalCodes = new Set(
        medicalOptions.map((opt) => opt.code.toUpperCase()),
      );
      const validMedicalConditions =
        medicalOptions.length > 0
          ? form.medicalConditions.filter((item) =>
              activeMedicalCodes.has(item.conditionCode.toUpperCase()),
            )
          : form.medicalConditions;

      const uniqueMedicalConditions = deduplicateByCode(
        validMedicalConditions,
        (item) => item.conditionCode,
      );
      const originalMedicalCount = profile.medicalConditions?.length ?? 0;

      if (uniqueMedicalConditions.length > 0) {
        await saveMemberMedicalConditions({
          uuid,
          medicalConditions: uniqueMedicalConditions.map((item) => ({
            conditionCode: item.conditionCode.toUpperCase(),
            severity: item.severity,
            notes: item.notes.trim() || null,
          })),
        }).unwrap();
      } else if (originalMedicalCount > 0) {
        try {
          await saveMemberMedicalConditions({
            uuid,
            medicalConditions: [],
          }).unwrap();
        } catch {
          await clearSafetySection(uuid, "medical-conditions").catch(() => {});
        }
      }

      // 5. General Preferences
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

      // 6. Cuisine Preferences
      const uniqueCuisines = deduplicateByCode(
        form.cuisinePreferences,
        (item) => item.cuisineCode,
      );

      try {
        await saveMemberCuisines({
          uuid,
          cuisines: uniqueCuisines.map((item, index) => ({
            cuisineCode: item.cuisineCode.toUpperCase(),
            preferenceLevel: item.preferenceLevel,
            priority: item.priority || index + 1,
          })),
        }).unwrap();
      } catch (cuisineErr) {
        console.warn(
          "Non-fatal cuisine preferences update warning:",
          cuisineErr,
        );
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

  const age = calculateAge(form.dateOfBirth || profile.dateOfBirth);

  const preferenceCount =
    form.allergies.length +
    form.dietaryTypes.length +
    form.medicalConditions.length +
    Object.values(form.tastePreferences).filter(Boolean).length +
    Object.values(form.texturePreferences).filter(Boolean).length +
    form.cuisinePreferences.length;

  return (
    <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-4 lg:px-5 lg:py-5 xl:px-6">
      {/* ------------------------------------------------------------------ */}
      {/* Sticky top action bar matching dashboard layout                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="sticky top-16 lg:top-[72px] z-30 mb-5 -mx-3 sm:-mx-4 lg:-mx-5 xl:-mx-6 px-3 sm:px-4 lg:px-5 xl:px-6 py-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <Link
              href={`/dashboard/family-profile/${uuid}`}
              className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-500/40 dark:hover:bg-slate-700 dark:hover:text-emerald-400 shadow-xs"
              aria-label="ត្រឡប់ក្រោយ"
            >
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </Link>

            <div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-800 dark:text-emerald-400">
                កែប្រែប្រវត្តិរូប
              </p>
              <p className="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400 truncate max-w-[180px] sm:max-w-sm">
                {form.profileName || profile.profileName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <Link
              href={`/dashboard/family-profile/${uuid}`}
              className="hidden sm:inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 sm:px-6 py-2.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              បោះបង់
            </Link>

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={
                isSaving || isLoadingSafetyOptions || hasSafetyOptionError
              }
              className="inline-flex min-h-11 sm:min-h-12 items-center justify-center gap-2 rounded-full bg-primary-800 px-6 sm:px-8 py-2.5 text-base sm:text-lg font-bold text-white shadow-sm transition hover:bg-primary-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              {isSaving ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  <span>កំពុងរក្សាទុក...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>រក្សាទុក</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Profile hero header (matches UserDashboard)                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="rounded-3xl border border-slate-200/80 bg-white px-4 pb-0 pt-5 shadow-[0_8px_28px_rgba(15,23,42,0.045)] dark:border-slate-800 dark:bg-slate-900 sm:px-6 sm:pt-6 lg:px-7 lg:pt-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between lg:gap-6">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5 lg:gap-6">
            {/* Avatar with upload */}
            <div className="shrink-0">
              <input
                ref={avatarInputRef}
                id="edit-avatar-input"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => void handleAvatarChange(e)}
                disabled={isUploadingAvatar}
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                title="ផ្លាស់ប្ដូររូបតំណាង"
                aria-label="ផ្លាស់ប្ដូររូបតំណាង"
                className="group relative flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white shadow-sm ring-4 ring-primary-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 dark:ring-emerald-950/40"
              >
                {avatarPreviewUrl ? (
                  <Image
                    src={avatarPreviewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                ) : avatarAccessUrlData?.url ||
                  (pendingAvatarUuid
                    ? `/api/media/${encodeURIComponent(pendingAvatarUuid)}/file`
                    : null) ? (
                  <Image
                    src={
                      avatarAccessUrlData?.url ||
                      `/api/media/${encodeURIComponent(pendingAvatarUuid!)}/file`
                    }
                    alt={form.profileName || profile.profileName}
                    fill
                    className="object-cover"
                    sizes="112px"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = pendingAvatarUuid
                        ? `/api/media/${encodeURIComponent(pendingAvatarUuid)}/file`
                        : "";
                      if (fallback && !target.src.includes(fallback)) {
                        target.src = fallback;
                      } else {
                        target.style.display = "none";
                      }
                    }}
                  />
                ) : form.profileName.trim() ? (
                  <span className="flex h-full w-full items-center justify-center bg-[#136C34] text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                    {form.profileName.trim().slice(0, 2).toUpperCase()}
                  </span>
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-[#136C34] text-white">
                    <ImageIcon className="h-8 w-8 text-white/80" />
                  </span>
                )}

                {isUploadingAvatar && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <LoaderCircle className="h-7 w-7 animate-spin text-white" />
                  </span>
                )}

                {!isUploadingAvatar && (
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <IoCameraOutline className="text-[22px] text-white" />
                    <span className="text-[11px] font-semibold text-white">
                      ផ្លាស់ប្ដូរ
                    </span>
                  </span>
                )}
              </button>
              {avatarError && (
                <p className="mt-1.5 max-w-[140px] text-center text-xs text-red-600 dark:text-red-400">
                  {avatarError}
                </p>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                <p className="truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
                  {form.profileName || profile.profileName}
                </p>

                {profile.isDefault && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary-200 bg-secondary-50 px-3 py-1.5 text-sm sm:text-base font-semibold text-secondary-600 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-400">
                    <Crown className="h-4 w-4" />
                    លំនាំដើម
                  </span>
                )}
              </div>

              <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-base sm:text-lg text-slate-500 dark:text-slate-400">
                <span>
                  {relationshipLabels[form.relationship] ?? form.relationship}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span>{genderLabels[form.gender] ?? form.gender}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-6 grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-100 py-4 dark:divide-slate-800 dark:border-slate-800 lg:mt-7 lg:py-5">
          <SocialStat value={age} label="អាយុ" suffix="ឆ្នាំ" />
          <SocialStat value={preferenceCount} label="ការកំណត់" />
          <SocialStat value={4} label="ផ្នែកព័ត៌មាន" />
        </div>

        {/* Anchors row */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 lg:gap-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ProfileAnchor href="#section-basic" label="អំពីខ្ញុំ" />
          <ProfileAnchor href="#section-health" label="សុខភាព" />
          <ProfileAnchor href="#section-preferences" label="ចំណូលចិត្តទូទៅ" />
          <ProfileAnchor href="#section-cuisines" label="ប្រភេទម្ហូប" />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 1. About / Basic Info section                                      */}
      {/* ------------------------------------------------------------------ */}
      <SectionCard
        id="section-basic"
        icon={<IdCard className="h-6 w-6" />}
        title="អំពីខ្ញុំ"
        description="ព័ត៌មានមូលដ្ឋានរបស់ប្រវត្តិរូបនេះ"
        className="mt-4 lg:mt-5"
      >
        <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Profile Name */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label
              htmlFor="edit-profile-name"
              className="mb-2.5 block text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200"
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
                placeholder="បញ្ចូលឈ្មោះគណនី"
                className="min-h-13 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 py-3 pl-12 pr-4 text-base sm:text-lg font-semibold text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 focus:border-primary-800 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary-800/10 dark:focus:ring-emerald-500/10"
              />
            </div>
          </div>

          {/* Relationship */}
          <div>
            <label
              htmlFor="edit-relationship"
              className="mb-2.5 block text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200"
            >
              ទំនាក់ទំនង
            </label>
            <CustomSelect
              id="edit-relationship"
              value={form.relationship}
              disabled={profile.relationship === "SELF"}
              onChange={(val) =>
                setForm((previous) => ({
                  ...previous,
                  relationship: val as MemberRelationship,
                }))
              }
              leftIcon={
                <UsersRound className="h-5 w-5 text-slate-400 shrink-0" />
              }
              size="lg"
              options={Object.entries(relationshipLabels).map(
                ([value, label]) => ({
                  value,
                  label,
                }),
              )}
            />
            {profile.relationship === "SELF" && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                គណនីខ្លួនឯងមិនអាចប្តូរទំនាក់ទំនងបានទេ។
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label
              htmlFor="edit-gender"
              className="mb-2.5 block text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200"
            >
              ភេទ
            </label>
            <CustomSelect
              id="edit-gender"
              value={form.gender}
              onChange={(val) =>
                setForm((previous) => ({
                  ...previous,
                  gender: val as MemberGender,
                }))
              }
              leftIcon={
                <UserRound className="h-5 w-5 text-slate-400 shrink-0" />
              }
              size="lg"
              options={Object.entries(genderLabels).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label
              htmlFor="edit-dob"
              className="mb-2.5 block text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200"
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
                className="min-h-13 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 py-3 pl-12 pr-4 text-base sm:text-lg font-semibold text-slate-900 dark:text-white outline-none transition hover:border-slate-300 dark:hover:border-slate-600 focus:border-primary-800 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary-800/10 dark:focus:ring-emerald-500/10"
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Health & Safety section (2-column layout like dashboard)       */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-4 grid gap-4 lg:mt-5 lg:grid-cols-2 lg:gap-5">
        {/* Medical Conditions */}
        <SectionCard
          id="section-health"
          icon={<HeartPulse className="h-5 w-5" />}
          title="ស្ថានភាពសុខភាព"
          description="ជ្រើសរើសស្ថានភាពសុខភាពដែលអាចមានឥទ្ធិពលលើការណែនាំអាហារ"
          className="lg:col-span-2"
        >
          {isLoadingSafetyOptions ? (
            <div className="flex min-h-[140px] items-center justify-center">
              <LoaderCircle className="h-7 w-7 animate-spin text-emerald-600" />
            </div>
          ) : medicalOptions.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 text-base text-slate-500 dark:text-slate-400">
              មិនមានជម្រើសសុខភាព។
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {medicalOptions.map((option) => {
                  const isSelected = form.medicalConditions.some(
                    (item) => item.conditionCode === option.code,
                  );

                  return (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => toggleMedicalCondition(option.code)}
                      className={`rounded-full border px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base font-semibold transition-all duration-200 ${
                        isSelected
                          ? "border-primary-800 bg-primary-800 text-white shadow-xs dark:border-emerald-600 dark:bg-emerald-600"
                          : "border-slate-200 bg-white text-slate-700 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-500/40 dark:hover:bg-slate-700 dark:hover:text-emerald-400"
                      }`}
                    >
                      {option.localName || option.name || option.code}
                    </button>
                  );
                })}
              </div>

              {/* Selected medical conditions config list */}
              {form.medicalConditions.length > 0 && (
                <div className="grid gap-3 pt-2 sm:grid-cols-2">
                  {form.medicalConditions.map((selectedItem) => {
                    const option = medicalOptions.find(
                      (item) => item.code === selectedItem.conditionCode,
                    );

                    if (!option) return null;

                    return (
                      <div
                        key={selectedItem.conditionCode}
                        className="flex flex-col gap-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-4 sm:p-5"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-base sm:text-lg font-bold text-primary-800 dark:text-emerald-400">
                              {option.localName || option.name || option.code}
                            </p>
                            {option.description && (
                              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                                {option.description}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleMedicalCondition(option.code)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition"
                            title="លុប"
                          >
                            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs sm:text-sm font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                              កម្រិតធ្ងន់ធ្ងរ
                            </label>
                            <CustomSelect
                              value={selectedItem.severity}
                              onChange={(val) =>
                                updateMedicalCondition(option.code, {
                                  severity: val as ProfileSeverity,
                                })
                              }
                              options={Object.entries(severityLabels).map(
                                ([value, label]) => ({
                                  value,
                                  label,
                                  badgeClass:
                                    severityBadges[value as ProfileSeverity],
                                }),
                              )}
                              size="sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
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
                              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3.5 text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-primary-800 dark:focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* Dietary Types */}
        <SectionCard
          id="section-food"
          icon={<Salad className="h-5 w-5" />}
          title="ប្រភេទរបបអាហារ"
          description="ជ្រើសរើសរបបអាហារ ឬច្បាប់អាហារដែលគណនីនេះត្រូវការ"
        >
          {isLoadingSafetyOptions ? (
            <div className="flex min-h-[140px] items-center justify-center">
              <LoaderCircle className="h-7 w-7 animate-spin text-emerald-600" />
            </div>
          ) : dietaryOptions.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 text-base text-slate-500 dark:text-slate-400">
              មិនមានជម្រើសរបបអាហារ។
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {dietaryOptions.map((option) => {
                const isSelected = form.dietaryTypes.some(
                  (item) => item.dietaryTypeCode === option.code,
                );

                return (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => toggleDietaryType(option.code)}
                    className={`rounded-full border px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base font-semibold transition-all duration-200 ${
                      isSelected
                        ? "border-primary-800 bg-primary-800 text-white shadow-xs dark:border-emerald-600 dark:bg-emerald-600"
                        : "border-slate-200 bg-white text-slate-700 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-500/40 dark:hover:bg-slate-700 dark:hover:text-emerald-400"
                    }`}
                  >
                    {option.localName || option.name || option.code}
                  </button>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Allergies */}
        <SectionCard
          icon={<FiAlertTriangle className="text-[19px]" />}
          title="ប្រតិកម្មអាឡែហ្ស៊ី"
          description="សារធាតុដែល FoodHub ត្រូវប្រុងប្រយ័ត្ន"
        >
          {isLoadingSafetyOptions ? (
            <div className="flex min-h-[140px] items-center justify-center">
              <LoaderCircle className="h-7 w-7 animate-spin text-emerald-600" />
            </div>
          ) : allergenOptions.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 text-base text-slate-500 dark:text-slate-400">
              មិនមានជម្រើសអាឡែហ្ស៊ី។
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {allergenOptions.map((option) => {
                const isSelected = form.allergies.some(
                  (item) => item.allergenCode === option.code,
                );

                return (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => toggleAllergy(option.code)}
                    className={`rounded-full border px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base font-semibold transition-all duration-200 ${
                      isSelected
                        ? "border-primary-800 bg-primary-800 text-white shadow-xs dark:border-emerald-600 dark:bg-emerald-600"
                        : "border-slate-200 bg-white text-slate-700 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-500/40 dark:hover:bg-slate-700 dark:hover:text-emerald-400"
                    }`}
                  >
                    {option.localName || option.name || option.code}
                  </button>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Safety load error */}
      {hasSafetyOptionError && (
        <div className="mt-4 rounded-3xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-base sm:text-lg font-bold text-red-700 dark:text-red-300">
                មិនអាចទាញយកជម្រើសសុវត្ថិភាពបានទេ។
              </p>
              <p className="mt-1 text-sm sm:text-base text-red-600 dark:text-red-400">
                សូមព្យាយាមទាញយកឡើងវិញ មុនពេលរក្សាទុកការផ្លាស់ប្តូរ។
              </p>
              <button
                type="button"
                onClick={retrySafetyOptions}
                className="mt-3.5 inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 px-5 py-2.5 text-base font-bold text-red-700 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-800 transition hover:bg-red-50 dark:hover:bg-slate-800"
              >
                <RefreshCw className="h-4 w-4" />
                ព្យាយាមម្តងទៀត
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 3. General Preferences & Tastes                                    */}
      {/* ------------------------------------------------------------------ */}
      <SectionCard
        id="section-preferences"
        icon={<Flame className="h-5 w-5" />}
        title="ចំណូលចិត្តទូទៅ និងរសជាតិ"
        description="កំណត់កម្រិតហឹរ ថវិកាអាហារ ចម្ងាយរុករក និងចំណូលចិត្តរសជាតិ"
        className="mt-4 lg:mt-5"
      >
        <div className="space-y-6">
          {/* Spice Tolerance */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
              <div className="flex items-center gap-2.5">
                <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                <span className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                  កម្រិតហឹរដែលចូលចិត្ត (Spice Tolerance)
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="rounded-full bg-primary-800 dark:bg-emerald-600 px-3.5 py-1 text-xs sm:text-sm font-black text-white shadow-xs">
                  {form.spiceTolerance} / 10
                </span>
                <span
                  className={`text-sm sm:text-base font-bold ${
                    getSpiceDescriptor(form.spiceTolerance).colorClass
                  }`}
                >
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
              onChange={(e) => handleSpiceChange(parseInt(e.target.value, 10))}
              className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-800 dark:accent-emerald-500"
            />

            <div className="mt-2.5 flex justify-between text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500">
              <span>0 (មិនហឹរ)</span>
              <span>3 (ស្រាល)</span>
              <span>5 (មធ្យម)</span>
              <span>8 (ខ្លាំង)</span>
              <span>10 (ខ្លាំងបំផុត)</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 sm:gap-2.5">
              {[0, 3, 5, 7, 10].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSpiceChange(preset)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-bold transition ${
                    form.spiceTolerance === preset
                      ? "bg-primary-800 text-white shadow-xs dark:bg-emerald-600"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-primary-800 dark:hover:border-emerald-500"
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Budget */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 sm:p-6">
              <div className="flex items-center justify-between gap-2 mb-3.5">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                    ថវិកាអាហារ (Budget)
                  </span>
                </div>
                {/* Currency toggle */}
                <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5">
                  <button
                    type="button"
                    onClick={() => handleCurrencyChange("USD")}
                    className={`rounded-lg px-3 py-1 text-xs sm:text-sm font-bold transition ${
                      form.currencyCode === "USD"
                        ? "bg-primary-800 text-white dark:bg-emerald-600"
                        : "text-slate-600 dark:text-slate-400 hover:text-primary-800 dark:hover:text-emerald-400"
                    }`}
                  >
                    USD ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCurrencyChange("KHR")}
                    className={`rounded-lg px-3 py-1 text-xs sm:text-sm font-bold transition ${
                      form.currencyCode === "KHR"
                        ? "bg-primary-800 text-white dark:bg-emerald-600"
                        : "text-slate-600 dark:text-slate-400 hover:text-primary-800 dark:hover:text-emerald-400"
                    }`}
                  >
                    KHR (៛)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    តម្លៃទាបបំផុត (Min)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={form.currencyCode === "USD" ? "0.5" : "500"}
                    placeholder="0"
                    value={form.minimumPrice}
                    onChange={(e) =>
                      handlePriceChange("minimumPrice", e.target.value)
                    }
                    className="min-h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 text-base font-bold text-slate-800 dark:text-slate-100 outline-none transition focus:border-primary-800 dark:focus:border-emerald-500 focus:ring-2 focus:ring-primary-800/10 dark:focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    តម្លៃខ្ពស់បំផុត (Max)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={form.currencyCode === "USD" ? "0.5" : "500"}
                    placeholder="20"
                    value={form.maximumPrice}
                    onChange={(e) =>
                      handlePriceChange("maximumPrice", e.target.value)
                    }
                    className="min-h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 text-base font-bold text-slate-800 dark:text-slate-100 outline-none transition focus:border-primary-800 dark:focus:border-emerald-500 focus:ring-2 focus:ring-primary-800/10 dark:focus:ring-emerald-500/10"
                  />
                </div>
              </div>
            </div>

            {/* Default Search Radius */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 sm:p-6">
              <div className="flex items-center justify-between gap-2 mb-3.5">
                <div className="flex items-center gap-2">
                  <Compass className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                  <span className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                    ចម្ងាយរុករក (Search Radius)
                  </span>
                </div>
                <span className="rounded-full bg-blue-50 dark:bg-blue-950/50 px-3 py-1 text-xs sm:text-sm font-black text-blue-700 dark:text-blue-300">
                  {form.defaultSearchRadiusKm.toFixed(1)} km
                </span>
              </div>

              <input
                type="range"
                min={1}
                max={20}
                step={0.5}
                value={form.defaultSearchRadiusKm}
                onChange={(e) => handleRadiusChange(parseFloat(e.target.value))}
                className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-400"
              />

              <div className="mt-3.5 flex flex-wrap gap-2">
                {[1, 3, 5, 10, 15, 20].map((radius) => (
                  <button
                    key={radius}
                    type="button"
                    onClick={() => handleRadiusChange(radius)}
                    className={`rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold transition ${
                      form.defaultSearchRadiusKm === radius
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-blue-600"
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
            <label className="block text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mb-1.5">
              ចំណូលចិត្តរសជាតិ (Taste Preferences)
            </label>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-3">
              ជ្រើសរើសរសជាតិដែលអ្នកចង់ឱ្យប្រព័ន្ធណែនាំផ្តល់អាទិភាព។
            </p>
            <div className="flex flex-wrap gap-2.5">
              {TASTE_OPTIONS.map((taste) => {
                const isSelected = Boolean(form.tastePreferences[taste.key]);
                return (
                  <button
                    key={taste.key}
                    type="button"
                    onClick={() => toggleTaste(taste.key)}
                    className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm sm:text-base font-bold transition ${
                      isSelected
                        ? "border-primary-800 bg-primary-800 text-white shadow-xs dark:border-emerald-600 dark:bg-emerald-600"
                        : "border-slate-200 bg-white text-slate-700 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-500/40 dark:hover:bg-slate-700 dark:hover:text-emerald-400"
                    }`}
                  >
                    <span>{taste.labelKm}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Texture Preferences */}
          <div>
            <label className="block text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mb-1.5">
              ទម្រង់អាហារដែលចូលចិត្ត (Texture Preferences)
            </label>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-3">
              ជ្រើសរើសប្រភេទសាច់ ឬទម្រង់អាហារដែលអ្នកចូលចិត្តញ៉ាំ។
            </p>
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
                    className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm sm:text-base font-bold transition ${
                      isSelected
                        ? "border-primary-800 bg-primary-800 text-white shadow-xs dark:border-emerald-600 dark:bg-emerald-600"
                        : "border-slate-200 bg-white text-slate-700 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-500/40 dark:hover:bg-slate-700 dark:hover:text-emerald-400"
                    }`}
                  >
                    <span>{texture.labelKm}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ------------------------------------------------------------------ */}
      {/* 4. Cuisine Preferences section                                     */}
      {/* ------------------------------------------------------------------ */}
      <SectionCard
        id="section-cuisines"
        icon={<Utensils className="h-5 w-5" />}
        title="ចំណូលចិត្តប្រភេទម្ហូប"
        description="ជ្រើសរើសម្ហូបតាមជាតិសាសន៍ និងកំណត់កម្រិតចូលចិត្ត"
        className="mt-4 lg:mt-5"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 mb-2.5">
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
                    className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm sm:text-base font-bold transition ${
                      isSelected
                        ? "border-primary-800 bg-primary-800 text-white shadow-xs dark:border-emerald-600 dark:bg-emerald-600"
                        : "border-slate-200 bg-white text-slate-700 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-500/40 dark:hover:bg-slate-700 dark:hover:text-emerald-400"
                    }`}
                  >
                    <span>{cuisine.labelKm}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configured cuisines list */}
          {form.cuisinePreferences.length > 0 && (
            <div className="space-y-3.5 pt-2">
              <label className="block text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                ម្ហូបដែលបានកំណត់ ({form.cuisinePreferences.length})
              </label>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {form.cuisinePreferences.map((item, index) => {
                  const cuisineMeta = CUISINE_OPTIONS.find(
                    (c) => c.code === item.cuisineCode,
                  );
                  return (
                    <div
                      key={item.cuisineCode}
                      className="flex flex-col gap-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-4 sm:p-5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                          {cuisineMeta?.labelKm ?? item.cuisineCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCuisine(item.cuisineCode)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition"
                          title="លុប"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs sm:text-sm font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                            កម្រិតចំណូលចិត្ត
                          </label>
                          <CustomSelect
                            value={item.preferenceLevel}
                            onChange={(val) =>
                              updateCuisineLevel(
                                item.cuisineCode,
                                val as CuisinePreferenceLevel,
                              )
                            }
                            size="sm"
                            options={PREFERENCE_LEVELS.map((level) => ({
                              value: level.value,
                              label: level.labelKm,
                              badgeClass: level.badgeClass,
                            }))}
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
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
                                cuisinePreferences: prev.cuisinePreferences.map(
                                  (c) =>
                                    c.cuisineCode === item.cuisineCode
                                      ? {
                                          ...c,
                                          priority: Number.isNaN(val) ? 1 : val,
                                        }
                                      : c,
                                ),
                              }));
                            }}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3.5 text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-primary-800 dark:focus:border-emerald-500"
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
      </SectionCard>

      {/* Error banner */}
      {errorMessage && (
        <div className="mt-5 flex items-start gap-3.5 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-4 sm:p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          <p className="text-base font-medium text-red-700 dark:text-red-300">{errorMessage}</p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Bottom actions                                                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-8 flex flex-col-reverse gap-3.5 border-t border-slate-200 dark:border-slate-800 pt-6 sm:flex-row sm:justify-end">
        <Link
          href={`/dashboard/family-profile/${uuid}`}
          className="inline-flex min-h-12 sm:min-h-13 items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-3 text-base sm:text-lg font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          បោះបង់
        </Link>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving || isLoadingSafetyOptions || hasSafetyOptionError}
          className="inline-flex min-h-12 sm:min-h-13 items-center justify-center gap-2 rounded-full bg-primary-800 px-8 py-3 text-base sm:text-lg font-bold text-white shadow-sm transition hover:bg-primary-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
        >
          {isSaving ? (
            <>
              <LoaderCircle className="h-5 w-5 animate-spin" />
              <span>កំពុងរក្សាទុក...</span>
            </>
          ) : (
            <>
              <Check className="h-5 w-5" />
              <span>រក្សាទុកការផ្លាស់ប្តូរ</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
