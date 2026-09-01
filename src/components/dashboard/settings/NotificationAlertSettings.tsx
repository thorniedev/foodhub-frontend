"use client";

import { useMemo } from "react";

import { Bell, Loader2 } from "lucide-react";

import {
  useGetNotificationPreferencesQuery,
  useGetNotificationTypesQuery,
  useUpdateNotificationPreferenceMutation,
} from "@/app/store/notificationApi";

const IN_APP_CHANNEL = "IN_APP";

/**
 * Types the FoodHub in-app alert popup (see MealTopPickAlert) proactively
 * pops for, vs. types that only ever sit in the notification list/badge.
 * Kept in sync with ALERT_TYPE_CODES there — surfaced here so the toggle
 * label can say which behavior it actually controls.
 */
const POPUP_ALERT_TYPE_CODES = new Set([
  "MEAL_REMINDER",
  "NEARBY_STORE_RECOMMENDATION",
  "GROUP_MEETUP_INVITE",
]);

function Toggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:cursor-wait disabled:opacity-60 ${
        checked ? "bg-[#136C34]" : "bg-slate-300 dark:bg-slate-700"
      }`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function NotificationAlertSettings() {
  const {
    data: types,
    isLoading: isLoadingTypes,
    isError: isTypesError,
  } = useGetNotificationTypesQuery();

  const { data: preferences, isLoading: isLoadingPreferences } =
    useGetNotificationPreferencesQuery();

  const [updatePreference, { isLoading: isUpdating }] =
    useUpdateNotificationPreferenceMutation();

  const rows = useMemo(() => {
    const preferenceByTypeId = new Map(
      (preferences ?? [])
        .filter((preference) => preference.channelType === IN_APP_CHANNEL)
        .map((preference) => [preference.notificationTypeId, preference]),
    );

    return (types ?? [])
      .filter((type) => type.isActive && type.isConfigurable)
      .map((type) => {
        const existing = preferenceByTypeId.get(type.id);
        // No saved row yet means "never touched" — the backend's own
        // default (NotificationPreferenceServiceImpl#canDeliver) is
        // enabled, so mirror that here rather than defaulting to off.
        const isEnabled = existing ? existing.isEnabled : true;
        return { type, isEnabled };
      });
  }, [types, preferences]);

  const isLoading = isLoadingTypes || isLoadingPreferences;

  const handleToggle = (typeId: number, nextEnabled: boolean) => {
    void updatePreference({
      notificationTypeId: typeId,
      channelType: IN_APP_CHANNEL,
      body: { isEnabled: nextEnabled },
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#136C34] dark:bg-emerald-950/40">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            ការជូនដំណឹង
          </h2>
          <p className="text-base text-slate-500">
            ជ្រើសរើសប្រភេទការជូនដំណឹងដែលអ្នកចង់ទទួល
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="mt-6 flex items-center justify-center gap-2 py-8 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-base">កំពុងផ្ទុក...</span>
        </div>
      )}

      {isTypesError && !isLoading && (
        <p className="mt-6 text-base text-red-500">
          មិនអាចផ្ទុកការកំណត់ការជូនដំណឹងបានទេ។
        </p>
      )}

      {!isLoading && !isTypesError && (
        <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map(({ type, isEnabled }) => (
            <div
              key={type.id}
              className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="text-base font-medium text-slate-800 dark:text-slate-100">
                  {type.name}
                </p>
                {POPUP_ALERT_TYPE_CODES.has(type.code) && (
                  <p className="mt-0.5 text-sm text-slate-400">
                    អាចលេចឡើងជាការជូនដំណឹងភ្លាមៗនៅលើអេក្រង់
                  </p>
                )}
              </div>

              <Toggle
                checked={isEnabled}
                disabled={isUpdating}
                onChange={(next) => handleToggle(type.id, next)}
              />
            </div>
          ))}

          {rows.length === 0 && (
            <p className="py-6 text-center text-base text-slate-400">
              មិនមានប្រភេទការជូនដំណឹងសម្រាប់កំណត់ទេ
            </p>
          )}
        </div>
      )}
    </div>
  );
}
