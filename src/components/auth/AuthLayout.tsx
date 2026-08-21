"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import AuthHero from "./AuthHero";
import {
  SunIcon,
  MoonIcon,
  LeafWatermarkTopRight,
  LeafWatermarkBottomRight,
} from "./icons";
import "./auth.css";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDocDark =
      document.documentElement.classList.contains("dark") ||
      document.documentElement.classList.contains("kc-dark");

    const activeDark = isDocDark || prefersDark;
    setIsDark(activeDark);

    if (activeDark) {
      document.documentElement.classList.add("kc-dark");
    } else {
      document.documentElement.classList.remove("kc-dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("kc-dark");
    } else {
      document.documentElement.classList.remove("kc-dark");
    }
  };

  return (
    <div className={`kc-auth-root ${isDark ? "kc-dark" : ""}`}>
      <div className="kc-split-layout">
        {/* Left Visual Hero Section */}
        <AuthHero />

        {/* Right Form Container Section */}
        <div className="kc-form-panel">
          {/* Top Right Corner Spinach Leaf Watermark */}
          <div className="kc-watermark-top-right" aria-hidden="true">
            <LeafWatermarkTopRight />
          </div>

          {/* Bottom Right Corner Lettuce Leaf Watermark */}
          <div className="kc-watermark-bottom-right" aria-hidden="true">
            <LeafWatermarkBottomRight />
          </div>

          {/* Top Controls Header */}
          <div className="kc-top-controls">
            <button
              type="button"
              className="kc-theme-toggle"
              aria-label="Toggle Theme"
              onClick={toggleTheme}
            >
              {mounted && isDark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

          {/* Centered Form Wrapper */}
          <div className="kc-form-wrapper">
            {/* Logo shown here only on mobile (hero is hidden below 960px) */}
            <div className="kc-form-logo-mobile">
              <Image
                src="/auth/mhoubahar-brand.png"
                alt="FoodHub"
                width={280}
                height={140}
                priority
                className="h-[140px] w-auto object-contain"
              />
            </div>

            <div className="kc-card">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
