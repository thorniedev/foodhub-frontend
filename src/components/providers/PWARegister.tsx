"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      console.warn(
        "[FoodHub PWA] Service workers are not supported by this browser.",
      );
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        console.log(
          "[FoodHub PWA] Service Worker registered:",
          registration.scope,
        );
      } catch (error) {
        console.error(
          "[FoodHub PWA] Service Worker registration failed:",
          error,
        );
      }
    };

    registerServiceWorker();
  }, []);

  return null;
}
