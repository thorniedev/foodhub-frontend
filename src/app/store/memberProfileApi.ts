import { baseApi } from "@/app/store/baseApi";
import { normalizePageResponse, normalizePayload } from "@/app/store/utils/normalize";

import type {
  CreateMemberProfileRequest,
  GetMemberProfilesParams,
  MemberAllergyRequest,
  MemberDietaryTypeRequest,
  MemberGender,
  MemberIngredientAvoidRequest,
  MemberMedicalConditionRequest,
  MemberProfile,
  MemberProfileResponse,
  MemberRelationship,
  SafetyOption,
  SafetyOptionResponse,
} from "@/types/member-profile/member-profile";

import type {
  CuisinePreferenceItem,
  UpdatePreferencesPayload,
} from "@/types/foodhub";

export interface SaveMemberPreferencesRequest {
  uuid: string;
  preferences: UpdatePreferencesPayload;
}

export interface SaveMemberCuisinesRequest {
  uuid: string;
  cuisines: CuisinePreferenceItem[];
}

/* -------------------------------------------------------------------------- */
/*                                   PROFILE                                  */
/* -------------------------------------------------------------------------- */

interface DeleteMemberProfileRequest {
  uuid: string;
}

interface UpdateMemberProfileBody {
  profileName?: string;
  relationship?: MemberRelationship;
  gender?: MemberGender;
  dateOfBirth?: string;
  preferredLanguage?: string;
  avatarMediaUuid?: string | null;
}

interface UpdateMemberProfileRequest {
  uuid: string;
  body: UpdateMemberProfileBody;
}

/* -------------------------------------------------------------------------- */
/*                                    MEDIA                                   */
/* -------------------------------------------------------------------------- */

export type MediaPurpose =
  | "PROFILE_AVATAR"
  | "CATALOG_ALLERGEN_ICON"
  | "CATALOG_DIETARY_TYPE_ICON"
  | "CATALOG_FOOD_PRIMARY"
  | "STORE_LOGO"
  | "STORE_COVER"
  | "STORE_GALLERY"
  | "REPORT_PDF"
  | "REPORT_XLSX"
  | "REPORT_CSV";

export interface MediaUploadResponse {
  uuid: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  widthPx?: number | null;
  heightPx?: number | null;
  createdAt: string;
}

interface UploadMediaRequest {
  file: File;
  purpose: MediaPurpose;
}

interface GetMediaAccessUrlResponse {
  url: string;
}

/* -------------------------------------------------------------------------- */
/*                               PROFILE SAFETY                               */
/* -------------------------------------------------------------------------- */

interface SaveMemberAllergiesRequest {
  uuid: string;
  allergies: MemberAllergyRequest[];
}

interface SaveMemberDietaryTypesRequest {
  uuid: string;
  dietaryTypes: MemberDietaryTypeRequest[];
}

interface SaveMemberMedicalConditionsRequest {
  uuid: string;
  medicalConditions: MemberMedicalConditionRequest[];
}

interface SaveMemberIngredientAvoidsRequest {
  uuid: string;
  ingredientAvoids: MemberIngredientAvoidRequest[];
}

/* -------------------------------------------------------------------------- */
/*                                    API                                     */
/* -------------------------------------------------------------------------- */

export const memberProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ---------------------------------------------------------------------- */
    /*                            GET ALL PROFILES                            */
    /* ---------------------------------------------------------------------- */

    getMemberProfiles: builder.query<
      MemberProfileResponse,
      GetMemberProfilesParams | void
    >({
      query: (params) => ({
        url: "/profiles",
        method: "GET",

        params: params ?? {
          page: 0,
          size: 20,
        },
      }),

      transformResponse: (response: unknown): MemberProfileResponse => {
        return normalizePageResponse<MemberProfile>(response);
      },

      providesTags: ["MemberProfile"],
    }),

    /* ---------------------------------------------------------------------- */
    /*                             GET ONE PROFILE                            */
    /* ---------------------------------------------------------------------- */

    getMemberProfileById: builder.query<MemberProfile, string>({
      query: (uuid) => ({
        url: `/profiles/${encodeURIComponent(uuid)}`,
        method: "GET",
      }),

      transformResponse: (response: unknown): MemberProfile => {
        return normalizePayload<MemberProfile>(response, {} as MemberProfile);
      },

      providesTags: ["MemberProfile"],
    }),

    /* ---------------------------------------------------------------------- */
    /*                              CREATE PROFILE                            */
    /* ---------------------------------------------------------------------- */

    createMemberProfile: builder.mutation<
      MemberProfile,
      CreateMemberProfileRequest
    >({
      query: (body) => ({
        url: "/profiles",
        method: "POST",
        body,
      }),

      transformResponse: (response: unknown): MemberProfile => {
        return normalizePayload<MemberProfile>(response, {} as MemberProfile);
      },

      invalidatesTags: ["MemberProfile"],
    }),

    /* ---------------------------------------------------------------------- */
    /*                              UPDATE PROFILE                            */
    /* ---------------------------------------------------------------------- */

    updateMemberProfile: builder.mutation<
      MemberProfile,
      UpdateMemberProfileRequest
    >({
      query: ({ uuid, body }) => ({
        url: `/profiles/${encodeURIComponent(uuid)}`,
        method: "PATCH",
        body,
      }),

      transformResponse: (response: unknown): MemberProfile => {
        return normalizePayload<MemberProfile>(response, {} as MemberProfile);
      },

      invalidatesTags: ["MemberProfile"],
    }),

    /* ---------------------------------------------------------------------- */
    /*                              DELETE PROFILE                            */
    /* ---------------------------------------------------------------------- */

    deleteMemberProfile: builder.mutation<void, DeleteMemberProfileRequest>({
      query: ({ uuid }) => ({
        url: `/profiles/${encodeURIComponent(uuid)}`,
        method: "DELETE",
      }),

      invalidatesTags: ["MemberProfile"],
    }),

    /* ---------------------------------------------------------------------- */
    /*                            UPLOAD MEDIA FILE                           */
    /* ---------------------------------------------------------------------- */

    uploadMedia: builder.mutation<MediaUploadResponse, UploadMediaRequest>({
      query: ({ file, purpose }) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: `/media?purpose=${encodeURIComponent(purpose)}`,
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: unknown): MediaUploadResponse => {
        return normalizePayload<MediaUploadResponse>(response, {} as MediaUploadResponse);
      },
    }),

    /* ---------------------------------------------------------------------- */
    /*                          GET MEDIA ACCESS URL                          */
    /* ---------------------------------------------------------------------- */

    getMediaAccessUrl: builder.query<GetMediaAccessUrlResponse, string>({
      query: (mediaUuid) => ({
        url: `/media/${encodeURIComponent(mediaUuid)}/access-url`,
        method: "GET",
      }),
      transformResponse: (response: unknown): GetMediaAccessUrlResponse => {
        return normalizePayload<GetMediaAccessUrlResponse>(response, {} as GetMediaAccessUrlResponse);
      },
    }),

    /* ====================================================================== */
    /*                           SAFETY DICTIONARIES                           */
    /* ====================================================================== */

    /* ---------------------------------------------------------------------- */
    /*                              ALLERGEN OPTIONS                          */
    /* ---------------------------------------------------------------------- */

    getAllergenOptions: builder.query<SafetyOptionResponse, void>({
      query: () => ({
        url: "/safety/allergens",
        method: "GET",

        params: {
          page: 0,
          size: 100,
        },
      }),
      transformResponse: (response: unknown): SafetyOptionResponse => {
        return normalizePageResponse<SafetyOption>(response, 100);
      },
    }),

    /* ---------------------------------------------------------------------- */
    /*                           DIETARY TYPE OPTIONS                         */
    /* ---------------------------------------------------------------------- */

    getDietaryTypeOptions: builder.query<SafetyOptionResponse, void>({
      query: () => ({
        url: "/safety/dietary-types",
        method: "GET",

        params: {
          page: 0,
          size: 100,
        },
      }),
      transformResponse: (response: unknown): SafetyOptionResponse => {
        return normalizePageResponse<SafetyOption>(response, 100);
      },
    }),

    /* ---------------------------------------------------------------------- */
    /*                        MEDICAL CONDITION OPTIONS                       */
    /* ---------------------------------------------------------------------- */

    getMedicalConditionOptions: builder.query<SafetyOptionResponse, void>({
      query: () => ({
        url: "/safety/medical-conditions",
        method: "GET",

        params: {
          page: 0,
          size: 100,
        },
      }),
      transformResponse: (response: unknown): SafetyOptionResponse => {
        return normalizePageResponse<SafetyOption>(response, 100);
      },
    }),

    /* ====================================================================== */
    /*                              SAVE SAFETY                               */
    /* ====================================================================== */

    /* ---------------------------------------------------------------------- */
    /*                            REPLACE ALLERGIES                           */
    /* ---------------------------------------------------------------------- */

    saveMemberAllergies: builder.mutation<void, SaveMemberAllergiesRequest>({
      query: ({ uuid, allergies }) => ({
        url: `/profiles/${encodeURIComponent(uuid)}/safety/allergies`,
        method: "PUT",

        body: {
          allergies,
        },
      }),

      invalidatesTags: ["MemberProfile"],
    }),

    /* ---------------------------------------------------------------------- */
    /*                         REPLACE DIETARY TYPES                          */
    /* ---------------------------------------------------------------------- */

    saveMemberDietaryTypes: builder.mutation<
      void,
      SaveMemberDietaryTypesRequest
    >({
      query: ({ uuid, dietaryTypes }) => ({
        url: `/profiles/${encodeURIComponent(uuid)}/safety/dietary-types`,

        method: "PUT",

        body: {
          dietaryTypes,
        },
      }),

      invalidatesTags: ["MemberProfile"],
    }),

    /* ---------------------------------------------------------------------- */
    /*                      REPLACE MEDICAL CONDITIONS                        */
    /* ---------------------------------------------------------------------- */

    saveMemberMedicalConditions: builder.mutation<
      void,
      SaveMemberMedicalConditionsRequest
    >({
      query: ({ uuid, medicalConditions }) => ({
        url: `/profiles/${encodeURIComponent(uuid)}/safety/medical-conditions`,

        method: "PUT",

        body: {
          medicalConditions,
        },
      }),

      invalidatesTags: ["MemberProfile"],
    }),

    /* ---------------------------------------------------------------------- */
    /*                       REPLACE INGREDIENT AVOIDS                        */
    /* ---------------------------------------------------------------------- */

    saveMemberIngredientAvoids: builder.mutation<
      void,
      SaveMemberIngredientAvoidsRequest
    >({
      query: ({ uuid, ingredientAvoids }) => ({
        url: `/profiles/${encodeURIComponent(uuid)}/safety/ingredient-avoids`,

        method: "PUT",

        body: {
          ingredientAvoids,
        },
      }),

      invalidatesTags: ["MemberProfile"],
    }),

    /* ---------------------------------------------------------------------- */
    /*                         UPDATE GENERAL PREFERENCES                     */
    /* ---------------------------------------------------------------------- */

    saveMemberPreferences: builder.mutation<
      void,
      SaveMemberPreferencesRequest
    >({
      query: ({ uuid, preferences }) => ({
        url: `/profiles/${encodeURIComponent(uuid)}/preferences`,
        method: "PUT",
        body: preferences,
      }),

      invalidatesTags: ["MemberProfile"],
    }),

    /* ---------------------------------------------------------------------- */
    /*                         UPDATE CUISINE PREFERENCES                     */
    /* ---------------------------------------------------------------------- */

    saveMemberCuisines: builder.mutation<
      void,
      SaveMemberCuisinesRequest
    >({
      query: ({ uuid, cuisines }) => ({
        url: `/profiles/${encodeURIComponent(uuid)}/cuisines`,
        method: "PUT",
        body: cuisines,
      }),

      invalidatesTags: ["MemberProfile"],
    }),
  }),

  overrideExisting: false,
});

/* -------------------------------------------------------------------------- */
/*                                  EXPORTS                                   */
/* -------------------------------------------------------------------------- */

export const {
  /* Profile */
  useGetMemberProfilesQuery,
  useGetMemberProfileByIdQuery,
  useCreateMemberProfileMutation,
  useUpdateMemberProfileMutation,
  useDeleteMemberProfileMutation,

  /* Media */
  useUploadMediaMutation,
  useGetMediaAccessUrlQuery,

  /* Safety options */
  useGetAllergenOptionsQuery,
  useGetDietaryTypeOptionsQuery,
  useGetMedicalConditionOptionsQuery,

  /* Safety update */
  useSaveMemberAllergiesMutation,
  useSaveMemberDietaryTypesMutation,
  useSaveMemberMedicalConditionsMutation,
  useSaveMemberIngredientAvoidsMutation,

  /* Preference update */
  useSaveMemberPreferencesMutation,
  useSaveMemberCuisinesMutation,
} = memberProfileApi;
