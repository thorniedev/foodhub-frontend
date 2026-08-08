import { baseApi } from "@/app/store/baseApi";

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
  SafetyOptionResponse,
} from "@/types/member-profile/member-profile";

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

  /* Safety options */
  useGetAllergenOptionsQuery,
  useGetDietaryTypeOptionsQuery,
  useGetMedicalConditionOptionsQuery,

  /* Safety update */
  useSaveMemberAllergiesMutation,
  useSaveMemberDietaryTypesMutation,
  useSaveMemberMedicalConditionsMutation,
  useSaveMemberIngredientAvoidsMutation,
} = memberProfileApi;
