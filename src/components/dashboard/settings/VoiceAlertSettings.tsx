"use client";

import { useState } from "react";
import { Loader2, Play, Square, Volume2, VolumeX, Sparkles } from "lucide-react";
import { useKhmerVoiceNotification } from "@/hooks/useKhmerVoiceNotification";

export default function VoiceAlertSettings() {
  const {
    autoVoiceAlertEnabled,
    setAutoVoiceAlertEnabled,
    playNotificationSpeech,
    stopNotificationSpeech,
    currentlyPlayingId,
    isLoadingId,
  } = useKhmerVoiceNotification();

  const [testSuccess, setTestSuccess] = useState(false);
  const isTesting = currentlyPlayingId === "settings-voice-test" || isLoadingId === "settings-voice-test";

  const handleToggle = (next: boolean) => {
    setAutoVoiceAlertEnabled(next);

    // Provide auditory feedback when turning ON
    if (next && !currentlyPlayingId) {
      playNotificationSpeech({
        id: "voice-feedback-on",
        text: "សំឡេងប្រកាសត្រូវបានបើក។",
      });
    }
  };

  const handleTestVoice = async () => {
    if (isTesting) {
      stopNotificationSpeech();
      return;
    }

    setTestSuccess(false);
    try {
      await playNotificationSpeech({
        id: "settings-voice-test",
        title: "ការជូនដំណឹង FoodHub",
        message: "សួស្តី! នេះជាសំឡេងប្រកាសការជូនដំណឹងរបស់ FoodHub។ សូមរីករាយជាមួយមុខម្ហូបឆ្ងាញ់ៗ!",
        playChime: true,
      });
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to play test voice", err);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 shadow-sm dark:bg-violet-950/50 dark:text-violet-400">
            {autoVoiceAlertEnabled ? (
              <Volume2 className="h-6 w-6" />
            ) : (
              <VolumeX className="h-6 w-6" />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                ការជូនដំណឹងជាសំឡេង (Voice Alerts)
              </h3>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  autoVoiceAlertEnabled
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {autoVoiceAlertEnabled ? "សកម្ម (Enabled)" : "បានបិទ (Disabled)"}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              ប្រកាស និងអានការជូនដំណឹងជាសំឡេងខ្មែរ (Khmer Text-to-Speech) ដោយស្វ័យប្រវត្តិនៅពេលមានដំណឹងថ្មី
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {autoVoiceAlertEnabled ? "បើក" : "បិទ"}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={autoVoiceAlertEnabled}
            aria-label="បើក ឬបិទសំឡេងប្រកាសការជូនដំណឹង"
            onClick={() => handleToggle(!autoVoiceAlertEnabled)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
              autoVoiceAlertEnabled
                ? "bg-violet-600"
                : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                autoVoiceAlertEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Description and Test Voice Box */}
      <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
            <p className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
              <Sparkles className="h-4 w-4 text-violet-500 shrink-0" />
              មុខងារសំឡេងប្រកាសរួមមាន៖
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              • បន្លឺសំឡេងកណ្ដឹងពីរតង់ (Pleasant Chime) មុនពេលប្រកាស
              <br />
              • អានខ្លឹមសារនៃការជូនដំណឹង (រំលឹកម៉ោងបាយ, Meetup, ប្រូម៉ូសិន) ជាភាសាខ្មែរ
            </p>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => void handleTestVoice()}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold shadow-xs transition-all active:scale-98 ${
                isTesting
                  ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
                  : testSuccess
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-violet-200 bg-white text-violet-700 hover:bg-violet-50 dark:border-violet-800 dark:bg-slate-900 dark:text-violet-300 dark:hover:bg-slate-800"
              }`}
            >
              {isTesting ? (
                <>
                  <Square className="h-3.5 w-3.5 fill-current" />
                  <span>បញ្ឈប់សំឡេង</span>
                </>
              ) : isLoadingId === "settings-voice-test" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>កំពុងទាញយកសំឡេង...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>សាកល្បងសំឡេង (Test Voice)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
