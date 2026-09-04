"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Coordinates = {
  latitude: number;
  longitude: number;
};

export type VoiceAlertStore = {
  uuid?: string;
  id?: string;
  name?: string;
  storeName?: string;
  localName?: string;
  latitude: number;
  longitude: number;
  matchPercentage?: number;
};

export type VoiceSpeechMode = "idle" | "device" | "cloud" | "error";

type UseNearbyStoreVoiceAlertOptions = {
  coordinates: Coordinates | null;
  stores: VoiceAlertStore[];
  radiusMeters?: number;
  cooldownMilliseconds?: number;
};

export type NearbyStoreResult = {
  store: VoiceAlertStore;
  distanceMeters: number;
};

/*
 * Keep cloud audio outside the React component.
 * This allows the same audio element to survive re-renders.
 */
let currentCloudAudio: HTMLAudioElement | null = null;
let currentCloudAudioUrl: string | null = null;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function calculateDistanceMeters(
  first: Coordinates,
  second: Coordinates,
): number {
  const earthRadiusMeters = 6_371_000;

  const latitudeDifference = toRadians(second.latitude - first.latitude);

  const longitudeDifference = toRadians(second.longitude - first.longitude);

  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);

  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  const angularDistance =
    2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return earthRadiusMeters * angularDistance;
}

function getStoreId(store: VoiceAlertStore): string {
  return (
    store.uuid ??
    store.id ??
    `${store.latitude}-${store.longitude}-${
      store.storeName ?? store.localName ?? store.name ?? "store"
    }`
  );
}

function getStoreName(store: VoiceAlertStore): string {
  return (
    store.localName ?? store.storeName ?? store.name ?? "ហាងអាហារនៅជិតអ្នក"
  );
}

function getRoundedDistance(distanceMeters: number): number {
  if (distanceMeters < 20) {
    return Math.max(1, Math.round(distanceMeters));
  }

  return Math.round(distanceMeters / 10) * 10;
}

function formatKhmerNumber(value: number): string {
  try {
    return new Intl.NumberFormat("km-KH-u-nu-khmr", {
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return String(Math.round(value));
  }
}

function getKhmerVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return undefined;
  }

  return window.speechSynthesis.getVoices().find((voice) => {
    const language = voice.lang.toLowerCase();

    return (
      language === "km" || language === "km-kh" || language.startsWith("km-")
    );
  });
}

function cancelCurrentSpeech(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  if (currentCloudAudio) {
    currentCloudAudio.pause();
    currentCloudAudio.currentTime = 0;
    currentCloudAudio.removeAttribute("src");
    currentCloudAudio.load();
    currentCloudAudio = null;
  }

  if (currentCloudAudioUrl && typeof URL !== "undefined") {
    URL.revokeObjectURL(currentCloudAudioUrl);

    currentCloudAudioUrl = null;
  }
}

async function playCloudKhmerSpeech(message: string): Promise<void> {
  if (typeof window === "undefined" || typeof Audio === "undefined") {
    throw new Error("Audio playback is not supported.");
  }

  const response = await fetch("/api/tts/khmer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: message,
    }),
  });

  if (!response.ok) {
    const responseBody = await response.json().catch(() => null);

    throw new Error(responseBody?.message ?? "Cloud Khmer speech failed.");
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);

  cancelCurrentSpeech();

  const audio = new Audio();

  currentCloudAudio = audio;
  currentCloudAudioUrl = audioUrl;

  audio.src = audioUrl;
  audio.preload = "auto";
  audio.volume = 1;

  function releaseAudioUrl() {
    if (currentCloudAudioUrl === audioUrl) {
      URL.revokeObjectURL(audioUrl);
      currentCloudAudioUrl = null;
    }

    if (currentCloudAudio === audio) {
      currentCloudAudio = null;
    }
  }

  audio.addEventListener("ended", releaseAudioUrl, {
    once: true,
  });

  audio.addEventListener("error", releaseAudioUrl, {
    once: true,
  });

  await audio.play();
}

async function speakKhmerText(message: string): Promise<VoiceSpeechMode> {
  if (typeof window === "undefined") {
    throw new Error("Speech is only available in the browser.");
  }

  const khmerVoice = getKhmerVoice();

  /*
   * First choice: Khmer voice installed
   * on the user's device.
   */
  if (
    khmerVoice &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  ) {
    cancelCurrentSpeech();

    const utterance = new SpeechSynthesisUtterance(message);

    utterance.voice = khmerVoice;
    utterance.lang = khmerVoice.lang;
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);

    return "device";
  }

  /*
   * Second choice: Azure Khmer voice
   * through the Next.js server route.
   */
  await playCloudKhmerSpeech(message);

  return "cloud";
}

function buildNearbyStoreMessage(
  store: VoiceAlertStore,
  distanceMeters: number,
): string {
  const storeName = getStoreName(store);

  const roundedDistance = getRoundedDistance(distanceMeters);

  const distanceText = formatKhmerNumber(roundedDistance);

  const matchPercentage =
    typeof store.matchPercentage === "number"
      ? Math.round(store.matchPercentage)
      : null;

  const matchText =
    matchPercentage !== null
      ? `ហាងនេះត្រូវនឹងចំណូលចិត្តរបស់អ្នក ${formatKhmerNumber(
          matchPercentage,
        )} ភាគរយ។`
      : "ហាងនេះស្ថិតនៅជិតទីតាំងរបស់អ្នក។";

  return (
    `សូមជូនដំណឹង។ នៅចម្ងាយប្រហែល ${distanceText} ម៉ែត្រ ` +
    `មានហាង ${storeName}។ ${matchText}`
  );
}

export function useNearbyStoreVoiceAlert({
  coordinates,
  stores,
  radiusMeters = 100,
  cooldownMilliseconds = 10 * 60 * 1000,
}: UseNearbyStoreVoiceAlertOptions) {
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const [voiceSupported, setVoiceSupported] = useState(() => {
    if (typeof window === "undefined") return false;
    const supportsDeviceSpeech =
      "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    const supportsCloudAudio =
      typeof Audio !== "undefined" && typeof fetch !== "undefined";
    return supportsDeviceSpeech || supportsCloudAudio;
  });

  const [khmerVoiceAvailable, setKhmerVoiceAvailable] = useState(false);

  const [speechMode, setSpeechMode] = useState<VoiceSpeechMode>("idle");

  const [speechError, setSpeechError] = useState<string | null>(null);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const [lastAlertedStore, setLastAlertedStore] =
    useState<NearbyStoreResult | null>(null);

  const storesInsideRadiusRef = useRef<Set<string>>(new Set());

  const lastAnnouncedAtRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const supportsDeviceSpeech =
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      "SpeechSynthesisUtterance" in window;

    if (!supportsDeviceSpeech) {
      return;
    }

    const speechSynthesis = window.speechSynthesis;

    function updateVoices() {
      setKhmerVoiceAvailable(Boolean(getKhmerVoice()));
    }

    updateVoices();

    speechSynthesis.addEventListener("voiceschanged", updateVoices);

    speechSynthesis.getVoices();

    return () => {
      speechSynthesis.removeEventListener("voiceschanged", updateVoices);
    };
  }, []);

  useEffect(() => {
    return () => {
      cancelCurrentSpeech();
    };
  }, []);

  const playMessage = useCallback(async (message: string) => {
    setSpeechError(null);
    setIsSpeaking(true);

    try {
      const mode = await speakKhmerText(message);

      setSpeechMode(mode);
    } catch (error) {
      console.error("Khmer voice alert failed:", error);

      setSpeechMode("error");

      setSpeechError(
        error instanceof Error ? error.message : "មិនអាចបញ្ចេញសំឡេងបានទេ។",
      );
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const enableVoiceAlerts = useCallback(() => {
    if (!voiceSupported) {
      return;
    }

    setVoiceEnabled(true);

    void playMessage("ការជូនដំណឹងអំពីហាងអាហារនៅជិតអ្នក ត្រូវបានបើក។");
  }, [playMessage, voiceSupported]);

  const disableVoiceAlerts = useCallback(() => {
    setVoiceEnabled(false);
    setSpeechMode("idle");
    setSpeechError(null);
    setIsSpeaking(false);
    setLastAlertedStore(null);

    storesInsideRadiusRef.current.clear();

    cancelCurrentSpeech();
  }, []);

  const repeatLastAlert = useCallback(() => {
    if (!lastAlertedStore) {
      return;
    }

    const message = buildNearbyStoreMessage(
      lastAlertedStore.store,
      lastAlertedStore.distanceMeters,
    );

    void playMessage(message);
  }, [lastAlertedStore, playMessage]);

  useEffect(() => {
    if (!voiceEnabled) {
      return;
    }

    if (!coordinates || stores.length === 0) {
      storesInsideRadiusRef.current.clear();
      return;
    }

    const nearbyStores: NearbyStoreResult[] = stores
      .filter(
        (store) =>
          Number.isFinite(store.latitude) && Number.isFinite(store.longitude),
      )
      .map((store) => ({
        store,
        distanceMeters: calculateDistanceMeters(coordinates, {
          latitude: store.latitude,
          longitude: store.longitude,
        }),
      }))
      .filter(({ distanceMeters }) => distanceMeters <= radiusMeters)
      .sort(
        (firstStore, secondStore) =>
          firstStore.distanceMeters - secondStore.distanceMeters,
      );

    const currentStoreIds = new Set(
      nearbyStores.map(({ store }) => getStoreId(store)),
    );

    const currentTime = Date.now();

    const newlyEnteredStores = nearbyStores.filter(({ store }) => {
      const storeId = getStoreId(store);

      if (storesInsideRadiusRef.current.has(storeId)) {
        return false;
      }

      const lastAnnouncedTime = lastAnnouncedAtRef.current.get(storeId) ?? 0;

      return currentTime - lastAnnouncedTime >= cooldownMilliseconds;
    });

    storesInsideRadiusRef.current = currentStoreIds;

    const nearestNewStore = newlyEnteredStores[0];

    if (!nearestNewStore) {
      return;
    }

    const storeId = getStoreId(nearestNewStore.store);

    lastAnnouncedAtRef.current.set(storeId, currentTime);

    setLastAlertedStore(nearestNewStore);

    const message = buildNearbyStoreMessage(
      nearestNewStore.store,
      nearestNewStore.distanceMeters,
    );

    void playMessage(message);
  }, [
    coordinates,
    stores,
    voiceEnabled,
    radiusMeters,
    cooldownMilliseconds,
    playMessage,
  ]);

  return {
    voiceEnabled,
    voiceSupported,
    khmerVoiceAvailable,
    speechMode,
    speechError,
    isSpeaking,
    lastAlertedStore,
    enableVoiceAlerts,
    disableVoiceAlerts,
    repeatLastAlert,
  };
}
