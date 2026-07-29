import { baseApi } from "./baseApi";
import type { FamilyMember } from "@/types/family-profile";

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfiles: builder.query<FamilyMember[], void>({
      query: () => "/profile/profile.json",
    }),

    switchProfile: builder.mutation<FamilyMember, string>({
      queryFn: async (id) => {
        const response = await fetch("/profile/profile.json");

        const profiles: FamilyMember[] = await response.json();

        const selected = profiles.find((profile) => profile.id === id);

        if (!selected) {
          return {
            error: {
              status: 404,
              data: "Profile not found",
            },
          };
        }

        return {
          data: {
            ...selected,

            // temporary active state
            isActive: true,
          },
        };
      },
    }),
  }),
});

export const { useGetProfilesQuery, useSwitchProfileMutation } = profileApi;
