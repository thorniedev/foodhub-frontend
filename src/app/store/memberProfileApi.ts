import { baseApi } from "@/app/store/baseApi";

import type {
  CreateMemberProfileRequest,
  GetMemberProfilesParams,
  MemberAllergyRequest,
  MemberDietaryTypeRequest,
  MemberIngredientAvoidRequest,
  MemberMedicalConditionRequest,
  MemberProfile,
  MemberProfileResponse,
  SafetyOptionResponse,
} from "@/types/member-profile/member-profile";

interface DeleteMemberProfileRequest {
  uuid: string;
}

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

export const memberProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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

    getMemberProfileById: builder.query<MemberProfile, string>({
      query: (uuid) => ({
        url: `/profiles/${encodeURIComponent(uuid)}`,
        method: "GET",
      }),

      providesTags: ["MemberProfile"],
    }),

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

    deleteMemberProfile: builder.mutation<void, DeleteMemberProfileRequest>({
      query: ({ uuid }) => ({
        url: `/profiles/${encodeURIComponent(uuid)}`,
        method: "DELETE",
      }),

      invalidatesTags: ["MemberProfile"],
    }),

    // GET /safety/allergens?page=0&size=100
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

    // GET /safety/dietary-types?page=0&size=100
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

    // GET /safety/medical-conditions?page=0&size=100
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

export const {
  useGetMemberProfilesQuery,
  useGetMemberProfileByIdQuery,
  useCreateMemberProfileMutation,
  useDeleteMemberProfileMutation,

  useGetAllergenOptionsQuery,
  useGetDietaryTypeOptionsQuery,
  useGetMedicalConditionOptionsQuery,

  useSaveMemberAllergiesMutation,
  useSaveMemberDietaryTypesMutation,
  useSaveMemberMedicalConditionsMutation,
  useSaveMemberIngredientAvoidsMutation,
} = memberProfileApi;
