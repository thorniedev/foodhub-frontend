"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CircleUserRound,
  House,
  Info,
  LogIn,
  UtensilsCrossed,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import FluidTabs from "../../../components/animata/tabs/fluid-tabs";
import ThemeToggle from "../theme-toggle";
import DashboardUserProfile from "../DashboardUserProfile";
import NotificationBellLink from "@/components/notifications/NotificationBellLink";
import { useGetCurrentUserQuery } from "@/app/store/auth/currentUserApi";
import Image from "next/image";

/* =========================================================
   NAVIGATION DATA
========================================================= */

const NAV_LINKS = [
  {
    href: "/",
    label: "ទំព័រដើម",
    mobileLabel: "ទំព័រដើម",
    icon: House,
  },
  {
    href: "/menu",
    label: "ម្ហូបអាហារ",
    mobileLabel: "ម្ហូប",
    icon: UtensilsCrossed,
  },
  {
    href: "/store",
    label: "ហាងអាហារ",
    mobileLabel: "ហាង",
    icon: Store,
  },
  {
    href: "/about",
    label: "អំពីយើង",
    mobileLabel: "អំពីយើង",
    icon: Info,
  },
];

/* =========================================================
   ACTIVE ROUTE
========================================================= */

function checkActiveRoute(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

/* =========================================================

/* =========================================================
   NAVBAR
========================================================= */

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  /*
   * One scroll state controls:
   *
   * Mobile:
   * Bottom navigation
   *
   * Desktop:
   * Top navigation
   */
  const [showScrollNavigation, setShowScrollNavigation] = useState(true);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  /* =======================================================
     CURRENT USER
  ======================================================= */

  const { data: user, isLoading: isLoadingUser } = useGetCurrentUserQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const isAuthenticated = Boolean(user);

  /* =======================================================
     DESKTOP ACTIVE TAB
  ======================================================= */

  const foundActiveIndex = NAV_LINKS.findIndex((link) =>
    checkActiveRoute(pathname, link.href),
  );

  const activeIndex = foundActiveIndex >= 0 ? foundActiveIndex : 0;

  /* =======================================================
     DESKTOP TAB CHANGE
  ======================================================= */

  const handleDesktopTabChange = (index: number) => {
    const selectedLink = NAV_LINKS[index];

    if (!selectedLink) {
      return;
    }

    if (checkActiveRoute(pathname, selectedLink.href)) {
      return;
    }

    router.push(selectedLink.href, {
      scroll: true,
    });
  };

  /* =======================================================
     SHOW NAVIGATION AFTER ROUTE CHANGE
  ======================================================= */

  useEffect(() => {
    queueMicrotask(() => {
      setShowScrollNavigation(true);
    });
  }, [pathname]);

  /* =======================================================
     SCROLL NAVIGATION

     MOBILE
     ---------------------------
     Top navbar = always visible
     Bottom navbar ↓ = hide
     Bottom navbar ↑ = show

     DESKTOP
     ---------------------------
     Top navbar ↓ = hide
     Top navbar ↑ = show

     MODEL
     ---------------------------
     Not controlled here
     Always visible
  ======================================================= */

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      if (ticking.current) {
        return;
      }

      ticking.current = true;

      window.requestAnimationFrame(() => {
        const currentScrollY = Math.max(window.scrollY, 0);

        const difference = currentScrollY - lastScrollY.current;

        /*
         * Always reveal navigation
         * near the top of the page.
         */
        if (currentScrollY <= 80) {
          setShowScrollNavigation(true);
        } else if (difference > 6) {
          /*
           * Scrolling DOWN
           */
          setShowScrollNavigation(false);
        } else if (difference < -6) {
          /*
           * Scrolling UP
           */
          setShowScrollNavigation(true);
        }

        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {/* =====================================================
          TOP NAVBAR

          MOBILE:
          Always visible

          DESKTOP:
          Hide/show based on scroll
      ===================================================== */}

      <nav
        className={`
          fixed
          left-0
          top-0
          z-50
          w-full

          translate-y-0

          border-b
          border-slate-100/70

          bg-white/90

          shadow-sm
          backdrop-blur-xl

          transition-transform
          duration-300
          ease-out

          dark:border-white/5
          dark:bg-gray-950/90

          md:border-b-0
          md:bg-white/5
          md:shadow-2xs
          md:backdrop-blur-[4px]
          md:dark:bg-gray-950/1

          ${showScrollNavigation ? "md:translate-y-0" : "md:-translate-y-full lg:translate-y-0"}
        `}
      >
        <div
          className="
            mx-auto
            flex
            h-16
            w-full
            max-w-7xl
            items-center
            justify-between
            px-4

            sm:px-5

            md:h-auto
            md:min-h-16
            md:gap-4
            md:px-3
          "
        >
          {/* =================================================
              LOGO
          ================================================= */}

          <Link
            href="/"
            aria-label="ទៅកាន់ទំព័រដើម"
            className="
              flex
              shrink-0
              items-center 
            "
          >
            {/* Light logo */}
            <Image
              src="/Image/foodHub-logo.png"
              alt="FoodHub logo"
              width={300}
              height={300}
              className="
                block
                h-[43px]
                w-auto
                object-contain
                transition-all
p-1
                dark:hidden

                sm:h-[48px]

                md:h-[68px]
              "
            />

            {/* Dark logo */}
            <Image
              src="/Image/foodHub-logo-dark1.png"
              alt="FoodHub logo"
              width={300}
              height={300}
              className="
                hidden
                h-[43px]
                w-auto
                object-contain
                transition-all
 
                dark:block
p-1
                sm:h-[48px]

                md:h-[68px]
              "
            />
          </Link>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <div className="hidden md:block">
            <FluidTabs
              activeIndex={activeIndex}
              onActiveIndexChange={handleDesktopTabChange}
            >
              <FluidTabs.List aria-label="Main navigation">
                {NAV_LINKS.map((link) => (
                  <FluidTabs.Tab key={link.href} label={link.label}>
                    <FluidTabs.Label>{link.label}</FluidTabs.Label>
                  </FluidTabs.Tab>
                ))}
              </FluidTabs.List>
            </FluidTabs>
          </div>

          {/* =================================================
              DESKTOP ACTIONS
          ================================================= */}

          <div
            className="
              hidden
              min-w-0
              items-center
              justify-center
              gap-3

              md:flex
            "
          >
            <ThemeToggle />

            {isLoadingUser ? (
              <div className="flex items-center gap-2">
                <div
                  className="
                    h-10
                    w-10
                    animate-pulse
                    rounded-full
                    bg-slate-200
                    dark:bg-slate-700
                  "
                />

                <div className="space-y-1">
                  <div
                    className="
                      h-4
                      w-24
                      animate-pulse
                      rounded
                      bg-slate-200
                      dark:bg-slate-700
                    "
                  />

                  <div
                    className="
                      h-3
                      w-28
                      animate-pulse
                      rounded
                      bg-slate-100
                      dark:bg-slate-800
                    "
                  />
                </div>
              </div>
            ) : isAuthenticated ? (
              <>
                <NotificationBellLink href="/notifications" />

                <DashboardUserProfile />
              </>
            ) : (
              <Link
                href="/api/auth/login"
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-primary-800
                  px-4
                  py-2
                  font-medium
                  text-white
                  transition
                  hover:bg-primary-900
                  active:scale-[0.98]
                "
              >
                <LogIn className="h-4 w-4" />
                ចូលគណនី
              </Link>
            )}
          </div>

          {/* =================================================
              MOBILE TOP ACTIONS

              This remains visible even when scrolling.
          ================================================= */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-1.5

              md:hidden
            "
          >
            {/* Theme */}
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
              "
            >
              <ThemeToggle />
            </div>

            {/* Notification */}
            {!isLoadingUser && isAuthenticated && (
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                "
              >
                <NotificationBellLink href="/notifications" />
              </div>
            )}

            {/* Loading profile */}
            {isLoadingUser ? (
              <div
                className="
                  h-10
                  w-10
                  shrink-0
                  animate-pulse
                  rounded-full
                  bg-slate-200
                  dark:bg-slate-700
                "
              />
            ) : isAuthenticated ? (
              /* User profile */
              <div className="shrink-0">
                <DashboardUserProfile />
              </div>
            ) : (
              /* Login */
              <Link
                href="/api/auth/login"
                aria-label="ចូលគណនី"
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-primary-800
                  text-white
                  shadow-sm
                  transition-all
                  active:scale-95
                "
              >
                <LogIn className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </nav>

    </>
  );
}
