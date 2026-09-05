import { baseApi } from "./baseApi";
import { normalizeArrayPayload, normalizePayload } from "./utils/normalize";

/** One meal slot's reminder configuration for the signed-in user. */
export interface MealReminderSetting {
  mealReminderCode: "MORNING" | "LUNCH" | "DINNER" | string;
  /** "HH:mm" or "HH:mm:ss" as serialized by the backend LocalTime. */
  remindAt: string;
  isEnabled: boolean;
  /**
   * True while the user has not chosen a time and is still on the built-in
   * schedule, so the UI can show the default without implying it was set.
   */
  isDefault: boolean;
}

export interface UpdateMealReminderSettingRequest {
  remindAt: string;
  isEnabled?: boolean;
}

/**
 * Per-user meal reminder times. Always scoped to the authenticated user by
 * the backend; no user id is ever sent.
 */
export const mealReminderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMealReminderSettings: builder.query<MealReminderSetting[], void>({
      query: () => ({ url: "/meal-reminder-settings", method: "GET" }),
      transformResponse: (response: unknown) =>
        normalizeArrayPayload<MealReminderSetting>(response),
      providesTags: [{ type: "MealReminderSetting", id: "LIST" }],
    }),

    updateMealReminderSetting: builder.mutation<
      MealReminderSetting,
      { mealReminderCode: string; body: UpdateMealReminderSettingRequest }
    >({
      query: ({ mealReminderCode, body }) => ({
        url: `/meal-reminder-settings/${mealReminderCode}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: unknown) =>
        normalizePayload<MealReminderSetting>(
          response,
          {} as MealReminderSetting,
        ),
      invalidatesTags: [{ type: "MealReminderSetting", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMealReminderSettingsQuery,
  useUpdateMealReminderSettingMutation,
} = mealReminderApi;
