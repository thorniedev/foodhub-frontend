"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useKhmerVoiceNotification } from "@/hooks/useKhmerVoiceNotification";

export default function VoiceAlertToggle() {
  const {
    autoVoiceAlertEnabled,
    setAutoVoiceAlertEnabled,
    playNotificationSpeech,
    currentlyPlayingId,
  } = useKhmerVoiceNotification();

  function handleToggle() {
    const nextState = !autoVoiceAlertEnabled;
    setAutoVoiceAlertEnabled(nextState);

    // Provide immediate auditory feedback when turning ON
    if (nextState && !currentlyPlayingId) {
      playNotificationSpeech({
        id: "voice-feedback",
        text: "សំឡេងប្រកាសត្រូវបានបើក។",
      });
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition shadow-sm ring-1 ${
        autoVoiceAlertEnabled
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800"
          : "bg-slate-50 text-slate-600 ring-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
      }`}
      title={
        autoVoiceAlertEnabled
          ? "សំឡេងប្រកាស៖ បើក (Voice Alerts: ON)"
          : "សំឡេងប្រកាស៖ បិទ (Voice Alerts: OFF)"
      }
      aria-pressed={autoVoiceAlertEnabled}
    >
      {autoVoiceAlertEnabled ? (
        <>
          <Volume2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 animate-pulse" />
          <span>សំឡេងប្រកាស៖ បើក</span>
        </>
      ) : (
        <>
          <VolumeX className="h-4 w-4 shrink-0 text-slate-400" />
          <span>សំឡេងប្រកាស៖ បិទ</span>
        </>
      )}
    </button>
  );
}
