export type Relationship =
  | "SELF"
  | "SPOUSE"
  | "CHILD"
  | "PARENT"
  | "SIBLING"
  | "OTHER";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type PreferredLanguage = "km" | "en";

export type AllergySeverity = "MILD" | "MODERATE" | "SEVERE";

export type EnforcementLevel = "OPTIONAL" | "PREFERRED" | "REQUIRED";

export type MedicalConditionSeverity = "MILD" | "MODERATE" | "SEVERE";

export type AvoidLevel = "PREFER_AVOID" | "STRICT_BLOCK";

export type AvoidReasonCode =
  | "PERSONAL_PREFERENCE"
  | "ALLERGY"
  | "MEDICAL"
  | "RELIGIOUS"
  | "DIETARY";

export interface UserProfileAllergy {
  allergenCode: string;
  severity: AllergySeverity;
  reactionNotes: string | null;
  avoidCrossContact: boolean;
  medicallyDiagnosed: boolean;
}

export interface UserProfileDietaryType {
  dietaryTypeCode: string;
  enforcementLevel: EnforcementLevel;
  priority: number;
  notes: string | null;
}

export interface UserProfileMedicalCondition {
  conditionCode: string;
  severity: MedicalConditionSeverity;
  notes: string | null;
}

export interface UserProfileIngredientAvoid {
  ingredientCode: string;
  avoidLevel: AvoidLevel;
  reasonCode: AvoidReasonCode;
  notes: string | null;
}

export interface UserProfile {
  profileName: string;
  relationship: Relationship;
  gender: Gender;

  /**
   * ISO date format: YYYY-MM-DD
   * Example: 2003-05-14
   */
  dateOfBirth: string;

  preferredLanguage: PreferredLanguage;
  avatarMediaUuid: string | null;
  isDefault: boolean;

  allergies: UserProfileAllergy[];
  dietaryTypes: UserProfileDietaryType[];
  medicalConditions: UserProfileMedicalCondition[];
  ingredientAvoids: UserProfileIngredientAvoid[];
}
