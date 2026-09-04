"use client";

import React from "react";
import {
  FaFacebook,
  FaTelegram,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaGlobe,
  FaXTwitter,
  FaWhatsapp,
  FaLine,
} from "react-icons/fa6";
import { SiFoodpanda } from "react-icons/si";
import {
  IoShareSocialOutline,
  IoOpenOutline,
  IoCallOutline,
  IoMailOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";

import type { FoodStoreDetail, StoreSocialLink } from "@/types/store-page";

export type SocialPlatformType =
  | "FACEBOOK"
  | "TELEGRAM"
  | "INSTAGRAM"
  | "TIKTOK"
  | "YOUTUBE"
  | "FOODPANDA"
  | "GRAB"
  | "WHATSAPP"
  | "LINE"
  | "X"
  | "WEBSITE"
  | "OTHER";

export interface PlatformVisualConfig {
  name: string;
  khmerLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  brandColor: string;
  pillBadgeClass: string;
  cardIconBgClass: string;
  cardIconColorClass: string;
  cardHoverBorderClass: string;
  visitText: string;
}

export function resolvePlatformType(
  rawPlatform: string,
  url: string = "",
): SocialPlatformType {
  const norm = (rawPlatform || "").trim().toUpperCase();
  const lowerUrl = (url || "").toLowerCase();

  if (
    norm === "FACEBOOK" ||
    norm === "FB" ||
    lowerUrl.includes("facebook.com") ||
    lowerUrl.includes("fb.me") ||
    lowerUrl.includes("fb.com")
  ) {
    return "FACEBOOK";
  }

  if (
    norm === "TELEGRAM" ||
    norm === "TG" ||
    lowerUrl.includes("t.me") ||
    lowerUrl.includes("telegram.me") ||
    lowerUrl.includes("telegram.org")
  ) {
    return "TELEGRAM";
  }

  if (
    norm === "INSTAGRAM" ||
    norm === "IG" ||
    lowerUrl.includes("instagram.com") ||
    lowerUrl.includes("instagr.am")
  ) {
    return "INSTAGRAM";
  }

  if (norm === "TIKTOK" || lowerUrl.includes("tiktok.com")) {
    return "TIKTOK";
  }

  if (
    norm === "YOUTUBE" ||
    norm === "YT" ||
    lowerUrl.includes("youtube.com") ||
    lowerUrl.includes("youtu.be")
  ) {
    return "YOUTUBE";
  }

  if (norm === "FOODPANDA" || lowerUrl.includes("foodpanda")) {
    return "FOODPANDA";
  }

  if (norm === "GRAB" || norm === "GRABFOOD" || lowerUrl.includes("grab.com")) {
    return "GRAB";
  }

  if (
    norm === "WHATSAPP" ||
    lowerUrl.includes("whatsapp.com") ||
    lowerUrl.includes("wa.me")
  ) {
    return "WHATSAPP";
  }

  if (norm === "LINE" || lowerUrl.includes("line.me")) {
    return "LINE";
  }

  if (
    norm === "X" ||
    norm === "TWITTER" ||
    lowerUrl.includes("twitter.com") ||
    lowerUrl.includes("x.com")
  ) {
    return "X";
  }

  return "WEBSITE";
}

export function getPlatformVisualConfig(
  platform: SocialPlatformType,
): PlatformVisualConfig {
  switch (platform) {
    case "FACEBOOK":
      return {
        name: "Facebook",
        khmerLabel: "ទំព័រ Facebook",
        icon: FaFacebook,
        brandColor: "#1877F2",
        pillBadgeClass:
          "border-[#1877F2]/25 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]",
        cardIconBgClass: "bg-[#1877F2]/10 text-[#1877F2]",
        cardIconColorClass: "text-[#1877F2]",
        cardHoverBorderClass: "hover:border-[#1877F2]/40 hover:bg-[#1877F2]/5",
        visitText: "ចូលមើល Facebook",
      };

    case "TELEGRAM":
      return {
        name: "Telegram",
        khmerLabel: "ឆានែល / ឆាត Telegram",
        icon: FaTelegram,
        brandColor: "#229ED9",
        pillBadgeClass:
          "border-[#229ED9]/25 bg-[#229ED9]/10 text-[#229ED9] hover:bg-[#229ED9] hover:text-white hover:border-[#229ED9]",
        cardIconBgClass: "bg-[#229ED9]/10 text-[#229ED9]",
        cardIconColorClass: "text-[#229ED9]",
        cardHoverBorderClass: "hover:border-[#229ED9]/40 hover:bg-[#229ED9]/5",
        visitText: "ចូលមើល Telegram",
      };

    case "INSTAGRAM":
      return {
        name: "Instagram",
        khmerLabel: "គណនី Instagram",
        icon: FaInstagram,
        brandColor: "#E4405F",
        pillBadgeClass:
          "border-[#E4405F]/25 bg-[#E4405F]/10 text-[#E4405F] hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white hover:border-transparent",
        cardIconBgClass: "bg-[#E4405F]/10 text-[#E4405F]",
        cardIconColorClass: "text-[#E4405F]",
        cardHoverBorderClass: "hover:border-[#E4405F]/40 hover:bg-[#E4405F]/5",
        visitText: "ចូលមើល Instagram",
      };

    case "TIKTOK":
      return {
        name: "TikTok",
        khmerLabel: "វីដេអូ TikTok",
        icon: FaTiktok,
        brandColor: "#010101",
        pillBadgeClass:
          "border-slate-300 bg-slate-100 text-slate-800 hover:bg-black hover:text-white hover:border-black",
        cardIconBgClass: "bg-black/10 text-slate-900",
        cardIconColorClass: "text-slate-900",
        cardHoverBorderClass: "hover:border-black/40 hover:bg-black/5",
        visitText: "ចូលមើល TikTok",
      };

    case "YOUTUBE":
      return {
        name: "YouTube",
        khmerLabel: "ឆានែល YouTube",
        icon: FaYoutube,
        brandColor: "#FF0000",
        pillBadgeClass:
          "border-[#FF0000]/25 bg-[#FF0000]/10 text-[#FF0000] hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000]",
        cardIconBgClass: "bg-[#FF0000]/10 text-[#FF0000]",
        cardIconColorClass: "text-[#FF0000]",
        cardHoverBorderClass: "hover:border-[#FF0000]/40 hover:bg-[#FF0000]/5",
        visitText: "ចូលមើល YouTube",
      };

    case "FOODPANDA":
      return {
        name: "Foodpanda",
        khmerLabel: "កម្ម៉ង់លើ Foodpanda",
        icon: SiFoodpanda,
        brandColor: "#D70F64",
        pillBadgeClass:
          "border-[#D70F64]/25 bg-[#D70F64]/10 text-[#D70F64] hover:bg-[#D70F64] hover:text-white hover:border-[#D70F64]",
        cardIconBgClass: "bg-[#D70F64]/10 text-[#D70F64]",
        cardIconColorClass: "text-[#D70F64]",
        cardHoverBorderClass: "hover:border-[#D70F64]/40 hover:bg-[#D70F64]/5",
        visitText: "កម្ម៉ង់ Foodpanda",
      };

    case "GRAB":
      return {
        name: "GrabFood",
        khmerLabel: "កម្ម៉ង់លើ Grab",
        icon: FaGlobe,
        brandColor: "#00B14F",
        pillBadgeClass:
          "border-[#00B14F]/25 bg-[#00B14F]/10 text-[#00B14F] hover:bg-[#00B14F] hover:text-white hover:border-[#00B14F]",
        cardIconBgClass: "bg-[#00B14F]/10 text-[#00B14F]",
        cardIconColorClass: "text-[#00B14F]",
        cardHoverBorderClass: "hover:border-[#00B14F]/40 hover:bg-[#00B14F]/5",
        visitText: "កម្ម៉ង់ Grab",
      };

    case "WHATSAPP":
      return {
        name: "WhatsApp",
        khmerLabel: "ផ្ញើសារ WhatsApp",
        icon: FaWhatsapp,
        brandColor: "#25D366",
        pillBadgeClass:
          "border-[#25D366]/25 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white hover:border-[#25D366]",
        cardIconBgClass: "bg-[#25D366]/10 text-[#25D366]",
        cardIconColorClass: "text-[#25D366]",
        cardHoverBorderClass: "hover:border-[#25D366]/40 hover:bg-[#25D366]/5",
        visitText: "ផ្ញើសារ WhatsApp",
      };

    case "LINE":
      return {
        name: "Line",
        khmerLabel: "ផ្ញើសារ Line",
        icon: FaLine,
        brandColor: "#06C755",
        pillBadgeClass:
          "border-[#06C755]/25 bg-[#06C755]/10 text-[#06C755] hover:bg-[#06C755] hover:text-white hover:border-[#06C755]",
        cardIconBgClass: "bg-[#06C755]/10 text-[#06C755]",
        cardIconColorClass: "text-[#06C755]",
        cardHoverBorderClass: "hover:border-[#06C755]/40 hover:bg-[#06C755]/5",
        visitText: "ផ្ញើសារ Line",
      };

    case "X":
      return {
        name: "X",
        khmerLabel: "គណនី X",
        icon: FaXTwitter,
        brandColor: "#000000",
        pillBadgeClass:
          "border-slate-300 bg-slate-100 text-slate-800 hover:bg-black hover:text-white hover:border-black",
        cardIconBgClass: "bg-black/10 text-slate-900",
        cardIconColorClass: "text-slate-900",
        cardHoverBorderClass: "hover:border-black/40 hover:bg-black/5",
        visitText: "ចូលមើល X",
      };

    case "WEBSITE":
    default:
      return {
        name: "គេហទំព័រ",
        khmerLabel: "គេហទំព័រផ្លូវការ",
        icon: FaGlobe,
        brandColor: "#059669",
        pillBadgeClass:
          "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600",
        cardIconBgClass: "bg-emerald-50 text-emerald-700",
        cardIconColorClass: "text-emerald-700",
        cardHoverBorderClass: "hover:border-emerald-300 hover:bg-emerald-50/50",
        visitText: "ទស្សនាគេហទំព័រ",
      };
  }
}

export function formatCleanDisplayUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./i, "");
    const path = parsed.pathname.replace(/\/$/, "");

    if (host.includes("facebook.com")) {
      if (path && path !== "/") {
        const segments = path.split("/").filter(Boolean);
        if (segments[0] === "profile.php") {
          return "Facebook Page";
        }
        return `@${segments[0]}`;
      }
      return "facebook.com";
    }

    if (host.includes("t.me")) {
      const segments = path.split("/").filter(Boolean);
      return segments[0] ? `@${segments[0]}` : "t.me";
    }

    if (host.includes("instagram.com")) {
      const segments = path.split("/").filter(Boolean);
      return segments[0] ? `@${segments[0]}` : "instagram.com";
    }

    if (host.includes("tiktok.com")) {
      const segments = path.split("/").filter(Boolean);
      return segments[0] ? `${segments[0]}` : "tiktok.com";
    }

    if (path && path !== "/" && path.length < 24) {
      return `${host}${path}`;
    }

    return host;
  } catch {
    return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  }
}

/**
 * Renders pill buttons in StoreHero alongside directions, phone, and address.
 */
export function StoreSocialMediaPills({
  socialLinks,
  phoneNumber,
  className = "",
}: {
  socialLinks: StoreSocialLink[];
  phoneNumber?: string | null;
  className?: string;
}) {
  const validLinks = Array.isArray(socialLinks)
    ? socialLinks.filter((s) => Boolean(s?.url?.trim()))
    : [];

  const hasExplicitTelegram = validLinks.some(
    (s) => resolvePlatformType(s.platform, s.url) === "TELEGRAM",
  );

  const cleanPhone = phoneNumber ? phoneNumber.trim() : "";
  const telegramPhoneUrl =
    cleanPhone && !hasExplicitTelegram
      ? `https://t.me/${cleanPhone.replace(/[^0-9+]/g, "")}`
      : null;

  if (validLinks.length === 0 && !telegramPhoneUrl) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {validLinks.map((social, index) => {
        const platform = resolvePlatformType(social.platform, social.url);
        const config = getPlatformVisualConfig(platform);
        const IconComponent = config.icon;

        return (
          <a
            key={social.uuid || `${social.platform}-${index}`}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95 shadow-sm ${config.pillBadgeClass}`}
            title={`${config.name}: ${social.url}`}
          >
            <IconComponent className="text-base shrink-0" />
            <span>{config.name}</span>
            <IoOpenOutline className="text-xs opacity-75 shrink-0" />
          </a>
        );
      })}

      {/* If store has a phone number but no explicit Telegram link, offer quick Telegram reach */}
      {telegramPhoneUrl && (
        <a
          href={telegramPhoneUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-[#229ED9]/25 bg-[#229ED9]/10 px-4 py-2.5 text-sm font-semibold text-[#229ED9] transition-all duration-200 hover:bg-[#229ED9] hover:text-white active:scale-95 shadow-sm"
          title={`Telegram: ${cleanPhone}`}
        >
          <FaTelegram className="text-base shrink-0" />
          <span>Telegram</span>
          <IoOpenOutline className="text-xs opacity-75 shrink-0" />
        </a>
      )}
    </div>
  );
}

/**
 * Dedicated Social Media Card in the right sidebar.
 */
export function StoreSocialMediaCard({
  store,
  className = "",
}: {
  store: FoodStoreDetail;
  className?: string;
}) {
  const validLinks = Array.isArray(store.socialLinks)
    ? store.socialLinks.filter((s) => Boolean(s?.url?.trim()))
    : [];

  const hasExplicitTelegram = validLinks.some(
    (s) => resolvePlatformType(s.platform, s.url) === "TELEGRAM",
  );

  const cleanPhone = store.phoneNumber ? store.phoneNumber.trim() : "";
  const telegramPhoneUrl =
    cleanPhone && !hasExplicitTelegram
      ? `https://t.me/${cleanPhone.replace(/[^0-9+]/g, "")}`
      : null;

  return (
    <section
      className={`rounded-[32px] border border-gray-100/50 bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-7 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <IoShareSocialOutline className="text-[23px]" />
          </span>

          <div>
            <p className="text-[20px] font-bold text-primary-900">បណ្ដាញសង្គម</p>
            <p className="text-[15px] text-gray-400">ភ្ជាប់ទំនាក់ទំនងជាមួយហាង</p>
          </div>
        </div>

        {validLinks.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-800 ring-1 ring-primary-200">
            <IoCheckmarkCircleOutline className="text-sm" />
            {validLinks.length} បណ្ដាញ
          </span>
        )}
      </div>

      {/* Social Links List */}
      {validLinks.length > 0 ? (
        <div className="mt-5 flex flex-col gap-3">
          {validLinks.map((social, index) => {
            const platform = resolvePlatformType(social.platform, social.url);
            const config = getPlatformVisualConfig(platform);
            const IconComponent = config.icon;
            const displayHandle = formatCleanDisplayUrl(social.url);

            return (
              <a
                key={social.uuid || `${social.platform}-${index}`}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center justify-between gap-3.5 rounded-2xl border border-gray-100 bg-slate-50/70 p-3.5 transition-all duration-200 hover:shadow-md hover:bg-white ${config.cardHoverBorderClass}`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-xs transition-transform duration-200 group-hover:scale-105 ${config.cardIconBgClass}`}
                  >
                    <IconComponent className="text-xl" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-bold text-slate-900 group-hover:text-primary-800 transition-colors">
                      {config.name}
                    </p>
                    <p className="truncate text-xs text-slate-500 font-medium">
                      {displayHandle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200/80 transition-all group-hover:bg-primary-50 group-hover:text-primary-700 group-hover:ring-primary-200 shadow-2xs">
                  <span>ចូលមើល</span>
                  <IoOpenOutline className="text-sm" />
                </div>
              </a>
            );
          })}

          {/* Optional Telegram from phone number */}
          {telegramPhoneUrl && (
            <a
              href={telegramPhoneUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-3.5 rounded-2xl border border-gray-100 bg-slate-50/70 p-3.5 transition-all duration-200 hover:shadow-md hover:bg-white hover:border-[#229ED9]/40 hover:bg-[#229ED9]/5"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#229ED9]/10 text-[#229ED9] shadow-xs transition-transform duration-200 group-hover:scale-105">
                  <FaTelegram className="text-xl" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-slate-900 group-hover:text-primary-800 transition-colors">
                    Telegram
                  </p>
                  <p className="truncate text-xs text-slate-500 font-medium">
                    {cleanPhone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200/80 transition-all group-hover:bg-primary-50 group-hover:text-primary-700 group-hover:ring-primary-200 shadow-2xs">
                <span>ផ្ញើសារ</span>
                <IoOpenOutline className="text-sm" />
              </div>
            </a>
          )}
        </div>
      ) : (
        /* Empty State with Contact Options */
        <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 p-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <IoShareSocialOutline className="text-2xl" />
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-700">
            មិនទាន់មានតំណភ្ជាប់បណ្ដាញសង្គមផ្លូវការនៅឡើយទេ
          </p>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            លោកអ្នកអាចទាក់ទងមកហាងដោយផ្ទាល់តាមរយៈព័ត៌មានខាងក្រោម
          </p>

          <div className="mt-4 flex flex-col gap-2">
            {cleanPhone && (
              <div className="flex items-center justify-between rounded-xl bg-white p-2.5 text-xs ring-1 ring-gray-200/70 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <IoCallOutline className="text-sm text-primary-600" />
                  <span className="font-semibold">{cleanPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="rounded-md bg-primary-50 px-2 py-1 font-semibold text-primary-700 hover:bg-primary-100 transition-colors"
                  >
                    ហៅទូរស័ព្ទ
                  </a>
                  {telegramPhoneUrl && (
                    <a
                      href={telegramPhoneUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md bg-[#229ED9]/10 px-2 py-1 font-semibold text-[#229ED9] hover:bg-[#229ED9]/20 transition-colors flex items-center gap-1"
                    >
                      <FaTelegram className="text-xs" />
                      <span>Telegram</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {store.email && (
              <div className="flex items-center justify-between rounded-xl bg-white p-2.5 text-xs ring-1 ring-gray-200/70 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-600 truncate mr-2">
                  <IoMailOutline className="text-sm text-primary-600 shrink-0" />
                  <span className="font-medium truncate">{store.email}</span>
                </div>
                <a
                  href={`mailto:${store.email}`}
                  className="rounded-md bg-primary-50 px-2 py-1 font-semibold text-primary-700 hover:bg-primary-100 transition-colors shrink-0"
                >
                  ផ្ញើអ៊ីមែល
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
