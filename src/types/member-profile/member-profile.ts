export type MemberRelationship =
  | "SELF"
  | "PARENT"
  | "SPOUSE"
  | "CHILD"
  | "SIBLING"
  | "GRANDPARENT"
  | "OTHER";

export type MemberGender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export interface MemberAgeGroup {
  uuid: string;
  code: string;
  name: string;
  minAge: number | null;
  maxAge: number | null;
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

  /*
   * Replace unknown with exact interfaces when you have
   * the response structures for these properties.
   */
  allergies: unknown[];
  dietaryTypes: unknown[];
  medicalConditions: unknown[];
  ingredientAvoids: unknown[];
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

export interface CreateMemberProfileRequest {
  profileName: string;
  relationship: MemberRelationship;
  gender: MemberGender;
  dateOfBirth: string;
  preferredLanguage: string;
  avatarMediaUuid: string | null;
  isDefault: boolean;
  allergies: unknown[];
  dietaryTypes: unknown[];
  medicalConditions: unknown[];
  ingredientAvoids: unknown[];
  preferences: Record<string, unknown> | null;
}
export interface DeleteMemberProfileParams {
  uuid: string;
}
