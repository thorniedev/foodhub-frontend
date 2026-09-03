"use client";

import { useMemo, useState } from "react";

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

/**
 * Leftover dev/API-testing notification types (e.g. timestamp-suffixed
 * "TEST_PUSH_1787..." rows created while testing push delivery) that
 * shouldn't be presented to end users as real preference options. Hides
 * them here rather than deleting the underlying NotificationType rows,
 * since that's a data cleanup the team owns, not a UI concern.
 */
const HIDDEN_TEST_TYPE_CODES = new Set(["NOTIFICATION"]);

function isTestArtifactType(code: string): boolean {
  return HIDDEN_TEST_TYPE_CODES.has(code) || code.startsWith("TEST_PUSH_");
}

/**
 * The backend stores notification type names in English. The rest of this page
 * is Khmer, so translate the codes we know and fall back to the stored name for
 * any type added later.
 */
const TYPE_LABELS: Record<string, string> = {
  GROUP_MEETUP_INVITE: "ការអញ្ជើញជួបជុំក្រុម",
  MEAL_REMINDER: "ការរំលឹកអាហារ",
  NEARBY_STORE_RECOMMENDATION: "ការណែនាំហាងនៅជិត",
};

function Toggle({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-[#136C34] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60 dark:focus-visible:ring-offset-slate-900 ${
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

  const [updatePreference] = useUpdateNotificationPreferenceMutation();

  /**
   * The value a toggle is currently being saved with, per type. Rendering this
   * over the server value moves the switch on the first tap instead of waiting
   * for the refetch, and lets a failure put it back exactly where it was.
   */
  const [pending, setPending] = useState<Record<number, boolean>>({});
  const [failedTypeId, setFailedTypeId] = useState<number | null>(null);

  const rows = useMemo(() => {
    const preferenceByTypeId = new Map(
      (preferences ?? [])
        .filter((preference) => preference.channelType === IN_APP_CHANNEL)
        .map((preference) => [preference.notificationTypeId, preference]),
    );

    return (types ?? [])
      .filter(
        (type) =>
          type.isActive &&
          type.isConfigurable &&
          !isTestArtifactType(type.code),
      )
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

  const handleToggle = async (typeId: number, nextEnabled: boolean) => {
    setFailedTypeId(null);
    setPending((current) => ({ ...current, [typeId]: nextEnabled }));

    try {
      await updatePreference({
        notificationTypeId: typeId,
        channelType: IN_APP_CHANNEL,
        body: { isEnabled: nextEnabled },
      }).unwrap();
    } catch {
      // In case of a temporary 409 unique constraint race on first toggle, retry once
      try {
        await new Promise((resolve) => setTimeout(resolve, 250));
        await updatePreference({
          notificationTypeId: typeId,
          channelType: IN_APP_CHANNEL,
          body: { isEnabled: nextEnabled },
        }).unwrap();
      } catch {
        // Saving failed, so the switch must not keep showing the new position as
        // though it had been stored. Dropping the pending value falls back to the
        // server value, which is still the old one.
        setFailedTypeId(typeId);
      }
    } finally {
      setPending((current) => {
        const next = { ...current };
        delete next[typeId];
        return next;
      });
    }
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
          {rows.map(({ type, isEnabled }) => {
            const pendingValue = pending[type.id];
            const isSaving = pendingValue !== undefined;
            const label = TYPE_LABELS[type.code] ?? type.name;

            return (
              <div
                key={type.id}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-base font-medium text-slate-800 dark:text-slate-100">
                    {label}
                  </p>
                  {POPUP_ALERT_TYPE_CODES.has(type.code) && (
                    <p className="mt-0.5 text-sm text-slate-400">
                      អាចលេចឡើងជាការជូនដំណឹងភ្លាមៗនៅលើអេក្រង់
                    </p>
                  )}
                  {failedTypeId === type.id && (
                    <p
                      role="alert"
                      className="mt-1 text-sm text-red-500"
                    >
                      មិនអាចរក្សាទុកបានទេ។ សូមព្យាយាមម្តងទៀត។
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isSaving && (
                    <Loader2
                      aria-hidden
                      className="h-4 w-4 animate-spin text-slate-400"
                    />
                  )}
                  <Toggle
                    checked={pendingValue ?? isEnabled}
                    disabled={isSaving}
                    label={label}
                    onChange={(next) => void handleToggle(type.id, next)}
                  />
                </div>
              </div>
            );
          })}

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
