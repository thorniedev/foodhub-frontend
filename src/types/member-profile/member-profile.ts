export type MemberRelationship =
  | "SELF"
  | "PARENT"
  | "SPOUSE"
  | "CHILD"
  | "SIBLING"
  | "GRANDPARENT"
  | "OTHER";

export type MemberGender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export type ProfileSeverity = "MILD" | "MODERATE" | "SEVERE";

export type DietaryEnforcementLevel = "PREFERRED" | "REQUIRED";

export type IngredientAvoidLevel = "PREFERENCE" | "STRICT_BLOCK";

export interface MemberAgeGroup {
  uuid: string;
  code: string;
  name: string;
  minAge: number | null;
  maxAge: number | null;
}

export interface MemberAllergyRequest {
  allergenCode: string;
  severity: ProfileSeverity;
  reactionNotes: string | null;
  avoidCrossContact: boolean;
  medicallyDiagnosed: boolean;
}

export interface MemberDietaryTypeRequest {
  dietaryTypeCode: string;
  enforcementLevel: DietaryEnforcementLevel;
  priority: number;
  notes: string | null;
}

export interface MemberMedicalConditionRequest {
  conditionCode: string;
  severity: ProfileSeverity;
  notes: string | null;
}

export interface MemberIngredientAvoidRequest {
  ingredientCode: string;
  avoidLevel: IngredientAvoidLevel;
  reasonCode: string;
  notes: string | null;
}

export interface MemberProfile {
  uuid: string;
  profileName: string;
  relationship: MemberRelationship;
  gender: MemberGender;
  dateOfBirth: string;
  preferredLanguage: string;
  avatarMediaUuid: string | null;
  ageGroup: MemberAgeGroup | null;
  isDefault: boolean;
  isActive: boolean;

  allergies: MemberAllergyRequest[];
  dietaryTypes: MemberDietaryTypeRequest[];
  medicalConditions: MemberMedicalConditionRequest[];
  ingredientAvoids: MemberIngredientAvoidRequest[];

  preferences: Record<string, unknown> | null;

  createdAt: string;
  updatedAt: string;
}

export interface MemberProfileResponse {
  contents: MemberProfile[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface GetMemberProfilesParams {
  page?: number;
  size?: number;
}

/**
 * POST /profiles only creates the basic profile.
 */
export interface CreateMemberProfileRequest {
  profileName: string;
  relationship: MemberRelationship;
  gender: MemberGender;
  dateOfBirth: string;
  preferredLanguage: string;
  avatarMediaUuid: string | null;
  isDefault: boolean;
}

/**
 * Option returned from safety endpoints.
 *
 * The user sees name/localName, but the frontend sends code.
 */
export interface SafetyOption {
  uuid: string;
  code: string;
  name: string;
  localName?: string | null;
  description?: string | null;
  active?: boolean;
  isActive?: boolean;
}

export interface SafetyOptionResponse {
  contents: SafetyOption[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ReplaceMemberAllergiesRequest {
  allergies: MemberAllergyRequest[];
}

export interface ReplaceMemberDietaryTypesRequest {
  dietaryTypes: MemberDietaryTypeRequest[];
}

export interface ReplaceMemberMedicalConditionsRequest {
  medicalConditions: MemberMedicalConditionRequest[];
}

export interface ReplaceMemberIngredientAvoidsRequest {
  ingredientAvoids: MemberIngredientAvoidRequest[];
}
