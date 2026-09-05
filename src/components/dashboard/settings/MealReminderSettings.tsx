"use client";

import { Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import {
  useGetMealReminderSettingsQuery,
  useUpdateMealReminderSettingMutation,
  type MealReminderSetting,
} from "@/app/store/mealReminderApi";

/** Khmer labels for the three scheduled meal slots the backend defines. */
const MEAL_LABELS: Record<string, string> = {
  MORNING: "អាហារពេលព្រឹក",
  LUNCH: "អាហារពេលថ្ងៃត្រង់",
  DINNER: "អាហារពេលល្ងាច",
};

/**
 * The backend serializes LocalTime as "HH:mm" or "HH:mm:ss"; <input type=time>
 * needs exactly "HH:mm".
 */
function toInputTime(value: string): string {
  return (value ?? "").slice(0, 5);
}

function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50 ${
        checked ? "bg-[#136C34]" : "bg-slate-300 dark:bg-slate-700"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function MealRow({ setting }: { setting: MealReminderSetting }) {
  const [updateSetting, { isLoading: isSaving }] =
    useUpdateMealReminderSettingMutation();

  // Local copy so typing in the time field stays responsive; the server value
  // wins whenever it changes underneath us (e.g. after a save).
  const [time, setTime] = useState(toInputTime(setting.remindAt));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTime(toInputTime(setting.remindAt));
  }, [setting.remindAt]);

  const save = async (nextTime: string, nextEnabled: boolean) => {
    setError(null);
    try {
      await updateSetting({
        mealReminderCode: setting.mealReminderCode,
        body: { remindAt: nextTime, isEnabled: nextEnabled },
      }).unwrap();
    } catch {
      // Put the field back to the stored value so the UI never shows a time
      // that was not actually saved.
      setTime(toInputTime(setting.remindAt));
      setError("មិនអាចរក្សាទុកបានទេ។ សូមព្យាយាមម្តងទៀត។");
    }
  };

  const label = MEAL_LABELS[setting.mealReminderCode] ?? setting.mealReminderCode;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-4 last:border-b-0 dark:border-slate-800">
      <div className="min-w-[180px]">
        <p className="text-base font-semibold text-slate-900 dark:text-white">
          {label}
        </p>
        <p className="mt-0.5 text-sm text-slate-500">
          {setting.isDefault
            ? "កំពុងប្រើម៉ោងលំនាំដើម"
            : "ម៉ោងដែលអ្នកបានកំណត់"}
        </p>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="time"
          value={time}
          disabled={!setting.isEnabled || isSaving}
          onChange={(event) => setTime(event.target.value)}
          onBlur={() => {
            if (time && time !== toInputTime(setting.remindAt)) {
              void save(time, setting.isEnabled);
            }
          }}
          className="rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          aria-label={`${label} ម៉ោង`}
        />

        {isSaving && (
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        )}

        <Toggle
          checked={setting.isEnabled}
          disabled={isSaving}
          label={`${label} បើក/បិទ`}
          onChange={(next) => void save(time || toInputTime(setting.remindAt), next)}
        />
      </div>
    </div>
  );
}

/**
 * Lets each user choose their own meal reminder times.
 *
 * Users eat at different times, so the schedule is per user rather than the
 * one fixed schedule the backend used to send to everyone. A slot the user has
 * never configured reports the built-in default with isDefault = true.
 */
export default function MealReminderSettings() {
  const { data: settings, isLoading, isError } =
    useGetMealReminderSettingsQuery();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#136C34] dark:bg-emerald-950/40">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            ម៉ោងរំលឹកអាហារ
          </h2>
          <p className="text-base text-slate-500">
            កំណត់ម៉ោងរំលឹកអាហាររបស់អ្នកដោយខ្លួនឯង
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="mt-6 flex items-center justify-center gap-2 py-8 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-base">កំពុងផ្ទុក...</span>
        </div>
      )}

      {isError && !isLoading && (
        <p className="mt-6 text-base text-red-500">
          មិនអាចផ្ទុកម៉ោងរំលឹកអាហារបានទេ។
        </p>
      )}

      {!isLoading && !isError && (
        <div className="mt-2">
          {(settings ?? []).map((setting) => (
            <MealRow key={setting.mealReminderCode} setting={setting} />
          ))}
        </div>
      )}
    </div>
  );
}
