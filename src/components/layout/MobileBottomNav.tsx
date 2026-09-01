"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  UtensilsCrossed,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* =========================================================
   MOBILE NAVIGATION ITEM
========================================================= */

interface MobileNavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}

function MobileNavItem({
  href,
  label,
  icon: Icon,
  active,
}: MobileNavItemProps) {
  return (
    <Link
      href={href}
      scroll
      aria-current={active ? "page" : undefined}
      className="
        group
        relative
        flex
        h-full
        min-w-0
        flex-1
        flex-col
        items-center
        justify-center
        gap-1
        rounded-[20px]
        px-1
        py-1.5
        outline-none
        transition-all
        duration-200
        active:scale-95
        focus-visible:ring-2
        focus-visible:ring-primary-700
        focus-visible:ring-offset-1
        dark:focus-visible:ring-offset-slate-900
      "
    >
      {/* Active background */}
      <span
        className={`
          absolute
          inset-y-1
          inset-x-3
          rounded-[18px]
          transition-all
          duration-300

          ${
            active
              ? `
                scale-100
                bg-primary-800/10
                opacity-100
                dark:bg-primary-500/15
              `
              : `
                scale-90
                opacity-0
              `
          }
        `}
      />

      {/* Top active indicator */}
      <span
        className={`
          absolute
          top-0
          h-[3px]
          rounded-full
          bg-primary-800
          transition-all
          duration-300

          dark:bg-primary-400

          ${
            active
              ? `
                w-5
                opacity-100
              `
              : `
                w-0
                opacity-0
              `
          }
        `}
      />

      {/* Icon */}
      <Icon
        className={`
          relative
          h-[22px]
          w-[22px]
          transition-all
          duration-300

          ${
            active
              ? "scale-110 text-primary-800 dark:text-primary-400"
              : "text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200"
          }
        `}
        strokeWidth={active ? 2.5 : 2}
      />

      {/* Label */}
      <span
        className={`
          relative
          text-[10px]
          font-semibold
          transition-all
          duration-300

          ${
            active
              ? "text-primary-800 dark:text-primary-400"
              : "text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200"
          }
        `}
      >
        {label}
      </span>
    </Link>
  );
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [showScrollNavigation, setShowScrollNavigation] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // Only run on mobile
    if (window.innerWidth >= 768) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current + 10) {
        // Scrolling DOWN
        setShowScrollNavigation(false);
        lastScrollY.current = currentScrollY;
      } else if (currentScrollY < lastScrollY.current - 10) {
        // Scrolling UP
        setShowScrollNavigation(true);
        lastScrollY.current = currentScrollY;
      }

      // Always show at top
      if (currentScrollY < 50) {
        setShowScrollNavigation(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      aria-label="ការរុករកលើទូរស័ព្ទ"
      className={`
        fixed

        bottom-[calc(10px+env(safe-area-inset-bottom))]
        left-3
        right-[84px]

        z-50

        h-[66px]

        rounded-[26px]

        border
        border-white/80

        bg-white/90

        px-1.5
        py-1.5

        shadow-[0_12px_35px_rgba(15,23,42,0.18)]

        backdrop-blur-2xl

        transition-all
        duration-300
        ease-out

        dark:border-white/10
        dark:bg-slate-900/90

        md:hidden

        ${
          showScrollNavigation
            ? `
              translate-y-0
              scale-100
              opacity-100
            `
            : `
              pointer-events-none
              translate-y-[110px]
              scale-[0.96]
              opacity-0
            `
        }
      `}
    >
      <div
        className="
          flex
          h-full
          w-full
          items-center
        "
      >
        {/* HOME */}
        <MobileNavItem
          href="/"
          label="ទំព័រដើម"
          icon={House}
          active={pathname === "/"}
        />

        {/* FOOD */}
        <MobileNavItem
          href="/food-page"
          label="ម្ហូប"
          icon={UtensilsCrossed}
          active={pathname.startsWith("/food-page")}
        />

        {/* STORE */}
        <MobileNavItem
          href="/store"
          label="ហាង"
          icon={Store}
          active={pathname.startsWith("/store")}
        />

        {/* ABOUT */}
        <MobileNavItem
          href="/about"
          label="អំពីយើង"
          icon={Users}
          active={pathname.startsWith("/about")}
        />
      </div>
    </nav>
  );
}
