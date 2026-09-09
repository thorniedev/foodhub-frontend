"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_VOICE_ALERT_KEY = "foodhub-voice-alerts-enabled";

// Global in-memory cache to prevent re-fetching audio for identical notifications
const audioBlobUrlCache = new Map<string, string>();
let currentAudioElement: HTMLAudioElement | null = null;

/**
 * Synthesizes a subtle, pleasant notification chime using the Web Audio API
 * (Zero external mp3 file dependency).
 */
function playNotificationChime(): void {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Pleasant two-tone chime (F5 -> A5)
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    };

    playTone(698.46, now, 0.25); // F5
    playTone(880.0, now + 0.12, 0.35); // A5
  } catch {
    // Ignore audio context autoplay restriction or failure
  }
}

/**
 * Fallback to device-installed Khmer speech synthesizer if available
 */
function speakDeviceFallback(text: string): boolean {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    !("SpeechSynthesisUtterance" in window)
  ) {
    return false;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const khmerVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().includes("km") ||
        v.name.toLowerCase().includes("khmer"),
    );

    if (khmerVoice) {
      utterance.voice = khmerVoice;
      utterance.lang = khmerVoice.lang;
    }

    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function useKhmerVoiceNotification() {
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(
    null,
  );
  const [isLoadingId, setIsLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoVoiceAlertEnabled, setAutoVoiceAlertEnabledState] = useState(
    () => {
      if (typeof window === "undefined") return false;
      try {
        return localStorage.getItem(STORAGE_VOICE_ALERT_KEY) === "true";
      } catch {
        return false;
      }
    },
  );

  const setAutoVoiceAlertEnabled = useCallback((enabled: boolean) => {
    setAutoVoiceAlertEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_VOICE_ALERT_KEY, enabled ? "true" : "false");
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const stopNotificationSpeech = useCallback(() => {
    if (currentAudioElement) {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
      currentAudioElement = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setCurrentlyPlayingId(null);
    setIsLoadingId(null);
  }, []);

  const playNotificationSpeech = useCallback(
    async ({
      id,
      title,
      message,
      text,
      playChime = true,
    }: {
      id: string;
      title?: string;
      message?: string;
      text?: string;
      playChime?: boolean;
    }) => {
      // If clicking on the currently playing notification, toggle it off
      if (currentlyPlayingId === id) {
        stopNotificationSpeech();
        return;
      }

      stopNotificationSpeech();
      setError(null);
      setIsLoadingId(id);

      const cleanText = (text || `${title || ""}. ${message || ""}`).trim();

      if (!cleanText) {
        setIsLoadingId(null);
        return;
      }

      // Play gentle chime before speech
      if (playChime) {
        playNotificationChime();
      }

      // 1. Check in-memory audio cache
      let audioUrl = audioBlobUrlCache.get(cleanText);

      if (!audioUrl) {
        try {
          const response = await fetch("/api/tts/khmer", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: cleanText }),
          });

          if (!response.ok) {
            const errJson = await response.json().catch(() => null);
            throw new Error(
              errJson?.message || `TTS server error: HTTP ${response.status}`,
            );
          }

          const blob = await response.blob();
          if (blob.size === 0) {
            throw new Error("Empty audio received from TTS service.");
          }

          audioUrl = URL.createObjectURL(blob);
          audioBlobUrlCache.set(cleanText, audioUrl);
        } catch (fetchErr) {
          console.warn(
            "Cloud Khmer TTS unavailable, falling back to device:",
            fetchErr,
          );

          // Fallback to device speech synthesis
          const spoke = speakDeviceFallback(cleanText);
          setIsLoadingId(null);

          if (spoke) {
            setCurrentlyPlayingId(id);
            return;
          }

          setError(
            fetchErr instanceof Error
              ? fetchErr.message
              : "Could not play voice alert.",
          );
          return;
        }
      }

      // 2. Play Audio Stream
      try {
        const audio = new Audio(audioUrl);
        currentAudioElement = audio;

        audio.onplay = () => {
          setIsLoadingId(null);
          setCurrentlyPlayingId(id);
        };

        audio.onended = () => {
          if (currentAudioElement === audio) {
            currentAudioElement = null;
          }
          setCurrentlyPlayingId(null);
        };

        audio.onerror = () => {
          if (currentAudioElement === audio) {
            currentAudioElement = null;
          }
          setCurrentlyPlayingId(null);
          setIsLoadingId(null);
          speakDeviceFallback(cleanText);
        };

        await audio.play();
      } catch (playErr) {
        console.error("Audio playback error:", playErr);
        setIsLoadingId(null);
        setCurrentlyPlayingId(null);
        speakDeviceFallback(cleanText);
      }
    },
    [currentlyPlayingId, stopNotificationSpeech],
  );

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (currentAudioElement) {
        currentAudioElement.pause();
        currentAudioElement = null;
      }
    };
  }, []);

  return {
    playNotificationSpeech,
    stopNotificationSpeech,
    currentlyPlayingId,
    isLoadingId,
    error,
    autoVoiceAlertEnabled,
    setAutoVoiceAlertEnabled,
  };
}
