import { baseApi } from "../baseApi";

export interface Profile {
  uuid: string;
  name: string;
  age?: number;
  gender?: string;
  imageUrl?: string;
  relationship?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProfileRequest {
  name: string;
  age?: number;
  gender?: string;
  imageUrl?: string;
  relationship?: string;
}

export interface UpdateProfileRequest {
  uuid: string;
  body: Partial<CreateProfileRequest>;
}

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/profiles
    getProfiles: builder.query<Profile[], void>({
      query: () => ({
        url: "/api/v1/profiles",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((profile) => ({
                type: "Profile" as const,
                id: profile.uuid,
              })),
              { type: "Profile", id: "LIST" },
            ]
          : [{ type: "Profile", id: "LIST" }],
    }),

    // GET /api/v1/profiles/{uuid}
    getProfileById: builder.query<Profile, string>({
      query: (uuid) => ({
        url: `/api/v1/profiles/${uuid}`,
        method: "GET",
      }),
      providesTags: (_result, _error, uuid) => [
        {
          type: "Profile",
          id: uuid,
        },
      ],
    }),

    // POST /api/v1/profiles
    createProfile: builder.mutation<Profile, CreateProfileRequest>({
      query: (body) => ({
        url: "/api/v1/profiles",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Profile", id: "LIST" }],
    }),

    // PATCH /api/v1/profiles/{uuid}
    updateProfile: builder.mutation<Profile, UpdateProfileRequest>({
      query: ({ uuid, body }) => ({
        url: `/api/v1/profiles/${uuid}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [
        { type: "Profile", id: uuid },
        { type: "Profile", id: "LIST" },
      ],
    }),

    // DELETE /api/v1/profiles/{uuid}
    deleteProfile: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/api/v1/profiles/${uuid}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, uuid) => [
        { type: "Profile", id: uuid },
        { type: "Profile", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetProfilesQuery,
  useGetProfileByIdQuery,
  useCreateProfileMutation,
  useUpdateProfileMutation,
  useDeleteProfileMutation,
} = profileApi;
