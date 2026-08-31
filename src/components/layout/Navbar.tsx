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

          ${active ? "w-7 opacity-100" : "w-0 opacity-0"}
        `}
      />

      {/* Icon */}
      <span
        className={`
          relative
          z-10
          flex
          h-7
          items-center
          justify-center
          transition-all
          duration-200

          ${
            active
              ? `
                -translate-y-[1px]
                text-primary-800
                dark:text-primary-400
              `
              : `
                text-slate-500
                group-hover:text-primary-800
                dark:text-slate-400
                dark:group-hover:text-primary-400
              `
          }
        `}
      >
        <Icon
          className={active ? "h-[23px] w-[23px]" : "h-[21px] w-[21px]"}
          strokeWidth={active ? 2.5 : 2}
        />
      </span>

      {/* Label */}
      <span
        className={`
          relative
          z-10
          max-w-full
          truncate
          text-[10px]
          leading-none
          transition-colors
          duration-200

          ${
            active
              ? `
                font-semibold
                text-primary-800
                dark:text-primary-400
              `
              : `
                font-medium
                text-slate-500
                dark:text-slate-400
              `
          }
        `}
      >
        {label}
      </span>
    </Link>
  );
}

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

      {/* =====================================================
          MOBILE FLOATING BOTTOM NAVIGATION

          Inspired by mobile banking/app navigation.

          Scroll down:
          Slides down and disappears.

          Scroll up:
          Slides back.

          The right side is left available for Model.
      ===================================================== */}

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
    </>
  );
}

// "use client";

// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import {
//   CircleUserRound,
//   House,
//   Info,
//   LogIn,
//   UtensilsCrossed,
//   type LucideIcon,
// } from "lucide-react";
// import { useEffect, useRef, useState } from "react";

// import FluidTabs from "../../../components/animata/tabs/fluid-tabs";
// import ThemeToggle from "../theme-toggle";
// import DashboardUserProfile from "../DashboardUserProfile";
// import NotificationBellLink from "@/components/notifications/NotificationBellLink";
// import { useGetCurrentUserQuery } from "@/app/store/auth/currentUserApi";

// /* =========================================================
//    NAVIGATION
// ========================================================= */

// const NAV_LINKS = [
//   {
//     href: "/",
//     label: "ទំព័រដើម",
//     mobileLabel: "ទំព័រដើម",
//     icon: House,
//   },
//   {
//     href: "/food-page",
//     label: "ម្ហូបអាហារ",
//     mobileLabel: "ម្ហូប",
//     icon: UtensilsCrossed,
//   },
//   {
//     href: "/about",
//     label: "អំពីយើង",
//     mobileLabel: "អំពីយើង",
//     icon: Info,
//   },
// ];

// /* =========================================================
//    ACTIVE ROUTE
// ========================================================= */

// function checkActiveRoute(pathname: string, href: string): boolean {
//   if (href === "/") {
//     return pathname === "/";
//   }

//   return pathname === href || pathname.startsWith(`${href}/`);
// }

// /* =========================================================
//    MOBILE NAV ITEM
// ========================================================= */

// interface MobileNavItemProps {
//   href: string;
//   label: string;
//   icon: LucideIcon;
//   active: boolean;
// }

// function MobileNavItem({
//   href,
//   label,
//   icon: Icon,
//   active,
// }: MobileNavItemProps) {
//   return (
//     <Link
//       href={href}
//       scroll
//       aria-current={active ? "page" : undefined}
//       className="
//         group
//         relative
//         flex
//         h-full
//         min-w-0
//         flex-1
//         flex-col
//         items-center
//         justify-center
//         gap-1
//         rounded-[20px]
//         px-1
//         py-1.5
//         outline-none
//         transition-all
//         duration-200
//         active:scale-95
//         focus-visible:ring-2
//         focus-visible:ring-primary-700
//         focus-visible:ring-offset-1
//         dark:focus-visible:ring-offset-slate-900
//       "
//     >
//       {/* Active background */}
//       <span
//         className={`
//           absolute
//           inset-1
//           rounded-[18px]
//           transition-all
//           duration-300

//           ${
//             active
//               ? `
//                 scale-100
//                 bg-primary-800/10
//                 opacity-100
//                 dark:bg-primary-500/15
//               `
//               : `
//                 scale-90
//                 opacity-0
//               `
//           }
//         `}
//       />

//       {/* Active indicator */}
//       <span
//         className={`
//           absolute
//           top-0
//           h-[3px]
//           rounded-full
//           bg-primary-800
//           transition-all
//           duration-300

//           dark:bg-primary-400

//           ${active ? "w-7 opacity-100" : "w-0 opacity-0"}
//         `}
//       />

//       {/* Icon */}
//       <span
//         className={`
//           relative
//           z-10
//           flex
//           h-7
//           items-center
//           justify-center
//           transition-all
//           duration-200

//           ${
//             active
//               ? `
//                 -translate-y-[1px]
//                 text-primary-800
//                 dark:text-primary-400
//               `
//               : `
//                 text-slate-500
//                 group-hover:text-primary-800
//                 dark:text-slate-400
//                 dark:group-hover:text-primary-400
//               `
//           }
//         `}
//       >
//         <Icon
//           className={active ? "h-[23px] w-[23px]" : "h-[21px] w-[21px]"}
//           strokeWidth={active ? 2.5 : 2}
//         />
//       </span>

//       {/* Label */}
//       <span
//         className={`
//           relative
//           z-10
//           max-w-full
//           truncate
//           text-[10px]
//           leading-none
//           transition-colors
//           duration-200

//           ${
//             active
//               ? `
//                 font-semibold
//                 text-primary-800
//                 dark:text-primary-400
//               `
//               : `
//                 font-medium
//                 text-slate-500
//                 dark:text-slate-400
//               `
//           }
//         `}
//       >
//         {label}
//       </span>
//     </Link>
//   );
// }

// /* =========================================================
//    NAVBAR
// ========================================================= */

// export default function Navbar() {
//   const pathname = usePathname();
//   const router = useRouter();

//   const [showBottomNavigation, setShowBottomNavigation] = useState(true);

//   const lastScrollY = useRef(0);
//   const ticking = useRef(false);

//   const { data: user, isLoading: isLoadingUser } = useGetCurrentUserQuery(
//     undefined,
//     {
//       refetchOnMountOrArgChange: true,
//     },
//   );

//   const isAuthenticated = Boolean(user);

//   /* =======================================================
//      DESKTOP ACTIVE TAB
//   ======================================================= */

//   const foundActiveIndex = NAV_LINKS.findIndex((link) =>
//     checkActiveRoute(pathname, link.href),
//   );

//   const activeIndex = foundActiveIndex >= 0 ? foundActiveIndex : 0;

//   /* =======================================================
//      DESKTOP TAB NAVIGATION
//   ======================================================= */

//   const handleDesktopTabChange = (index: number) => {
//     const selectedLink = NAV_LINKS[index];

//     if (!selectedLink) {
//       return;
//     }

//     if (checkActiveRoute(pathname, selectedLink.href)) {
//       return;
//     }

//     router.push(selectedLink.href, {
//       scroll: true,
//     });
//   };

//   /* =======================================================
//      SHOW BOTTOM NAV AFTER PAGE CHANGE
//   ======================================================= */

//   useEffect(() => {
//     queueMicrotask(() => {
//       setShowBottomNavigation(true);
//     });
//   }, [pathname]);

//   /* =======================================================
//      MOBILE SCROLL BEHAVIOR

//      TOP NAVBAR:
//      Always visible.

//      BOTTOM NAV:
//      Scroll down = hide
//      Scroll up = show

//      MODEL:
//      Not controlled here.
//      It stays visible.
//   ======================================================= */

//   useEffect(() => {
//     lastScrollY.current = window.scrollY;

//     const handleScroll = () => {
//       if (window.innerWidth >= 768) {
//         return;
//       }

//       if (ticking.current) {
//         return;
//       }

//       ticking.current = true;

//       window.requestAnimationFrame(() => {
//         const currentScrollY = window.scrollY;

//         const difference = currentScrollY - lastScrollY.current;

//         /*
//          * Always show bottom nav near the
//          * beginning of the page.
//          */
//         if (currentScrollY <= 80) {
//           setShowBottomNavigation(true);
//         } else if (difference > 6) {
//           /*
//            * Scrolling DOWN
//            */
//           setShowBottomNavigation(false);
//         } else if (difference < -6) {
//           /*
//            * Scrolling UP
//            */
//           setShowBottomNavigation(true);
//         }

//         lastScrollY.current = currentScrollY;
//         ticking.current = false;
//       });
//     };

//     window.addEventListener("scroll", handleScroll, {
//       passive: true,
//     });

//     return () => {
//       window.removeEventListener("scroll", handleScroll);
//     };
//   }, []);

//   return (
//     <>
//       {/* =====================================================
//           TOP NAVBAR

//           ALWAYS VISIBLE
//       ===================================================== */}

//       <nav
//         className="
//           fixed
//           left-0
//           top-0
//           z-50
//           w-full

//           border-b
//           border-slate-100/70

//           bg-white/90
//           shadow-sm
//           backdrop-blur-xl

//           dark:border-white/5
//           dark:bg-gray-950/90

//           md:border-b-0
//           md:bg-white/5
//           md:shadow-2xs
//           md:backdrop-blur-[4px]
//           md:dark:bg-gray-950/1
//         "
//       >
//         <div
//           className="
//             mx-auto
//             flex
//             h-16
//             w-full
//             max-w-7xl
//             items-center
//             justify-between
//             px-4

//             sm:px-5

//             md:min-h-16
//             md:h-auto
//             md:gap-4
//             md:px-3
//           "
//         >
//           {/* =================================================
//               LOGO
//           ================================================= */}

//           <Link
//             href="/"
//             aria-label="ទៅកាន់ទំព័រដើម"
//             className="
//               flex
//               shrink-0
//               items-center
//             "
//           >
//             {/* Light mode */}
//             <img
//               src="/Image/foodHub-logo.png"
//               alt="FoodHub logo"
//               className="
//                 block
//                 h-[43px]
//                 w-auto
//                 object-contain
//                 transition-all

//                 dark:hidden

//                 sm:h-[48px]

//                 md:h-[68px]
//               "
//             />

//             {/* Dark mode */}
//             <img
//               src="/Image/foodHub-logo-dark1.png"
//               alt="FoodHub logo"
//               className="
//                 hidden
//                 h-[43px]
//                 w-auto
//                 object-contain
//                 transition-all

//                 dark:block

//                 sm:h-[48px]

//                 md:h-[68px]
//               "
//             />
//           </Link>

//           {/* =================================================
//               DESKTOP NAVIGATION
//           ================================================= */}

//           <div className="hidden md:block">
//             <FluidTabs
//               activeIndex={activeIndex}
//               onActiveIndexChange={handleDesktopTabChange}
//             >
//               <FluidTabs.List aria-label="Main navigation">
//                 {NAV_LINKS.map((link) => (
//                   <FluidTabs.Tab key={link.href} label={link.label}>
//                     <FluidTabs.Label>{link.label}</FluidTabs.Label>
//                   </FluidTabs.Tab>
//                 ))}
//               </FluidTabs.List>
//             </FluidTabs>
//           </div>

//           {/* =================================================
//               DESKTOP ACTIONS
//           ================================================= */}

//           <div
//             className="
//               hidden
//               min-w-0
//               items-center
//               justify-center
//               gap-3

//               md:flex
//             "
//           >
//             <ThemeToggle />

//             {isLoadingUser ? (
//               <div className="flex items-center gap-2">
//                 <div
//                   className="
//                     h-10
//                     w-10
//                     animate-pulse
//                     rounded-full
//                     bg-slate-200
//                     dark:bg-slate-700
//                   "
//                 />

//                 <div className="space-y-1">
//                   <div
//                     className="
//                       h-4
//                       w-24
//                       animate-pulse
//                       rounded
//                       bg-slate-200
//                       dark:bg-slate-700
//                     "
//                   />

//                   <div
//                     className="
//                       h-3
//                       w-28
//                       animate-pulse
//                       rounded
//                       bg-slate-100
//                       dark:bg-slate-800
//                     "
//                   />
//                 </div>
//               </div>
//             ) : isAuthenticated ? (
//               <>
//                 <NotificationBellLink href="/notifications" />

//                 <DashboardUserProfile />
//               </>
//             ) : (
//               <Link
//                 href="/api/auth/login"
//                 className="
//                   inline-flex
//                   items-center
//                   gap-2
//                   rounded-full
//                   bg-primary-800
//                   px-4
//                   py-2
//                   font-medium
//                   text-white
//                   transition
//                   hover:bg-primary-900
//                 "
//               >
//                 <LogIn className="h-4 w-4" />
//                 ចូលគណនី
//               </Link>
//             )}
//           </div>

//           {/* =================================================
//               MOBILE TOP ACTIONS

//               No hamburger.
//               Top bar remains visible when scrolling.
//           ================================================= */}

//           <div
//             className="
//               flex
//               shrink-0
//               items-center
//               gap-0.5

//               md:hidden
//             "
//           >
//             {/* Theme */}
//             <div
//               className="
//                 flex
//                 h-10
//                 w-10
//                 shrink-0
//                 items-center
//                 justify-center
//                 rounded-full
//               "
//             >
//               <ThemeToggle />
//             </div>

//             {/* Notification */}
//             {!isLoadingUser && isAuthenticated && (
//               <div
//                 className="
//                   flex
//                   h-10
//                   w-10
//                   shrink-0
//                   items-center
//                   justify-center
//                 "
//               >
//                 <NotificationBellLink href="/notifications" />
//               </div>
//             )}

//             {/* Loading */}
//             {isLoadingUser ? (
//               <div
//                 className="
//                   h-10
//                   w-10
//                   shrink-0
//                   animate-pulse
//                   rounded-full
//                   bg-slate-200
//                   dark:bg-slate-700
//                 "
//               />
//             ) : isAuthenticated ? (
//               /* Profile */
//               <div className="shrink-0">
//                 <DashboardUserProfile />
//               </div>
//             ) : (
//               /* Login */
//               <Link
//                 href="/api/auth/login"
//                 aria-label="ចូលគណនី"
//                 className="
//                   flex
//                   h-10
//                   w-10
//                   shrink-0
//                   items-center
//                   justify-center
//                   rounded-full
//                   bg-primary-800
//                   text-white
//                   shadow-sm
//                   transition
//                   active:scale-95
//                 "
//               >
//                 <LogIn className="h-5 w-5" />
//               </Link>
//             )}
//           </div>
//         </div>
//       </nav>

//       {/* =====================================================
//           MOBILE FLOATING BOTTOM NAVIGATION

//           Scroll DOWN:
//           moves down and disappears.

//           Scroll UP:
//           comes back.

//           Model remains separate on the right.
//       ===================================================== */}

//       <nav
//         aria-label="ការរុករកលើទូរស័ព្ទ"
//         className={`
//           fixed

//           bottom-[calc(10px+env(safe-area-inset-bottom))]
//           left-3
//           right-[84px]

//           z-50

//           h-[66px]

//           rounded-[26px]

//           border
//           border-white/80

//           bg-white/90

//           px-1.5
//           py-1.5

//           shadow-[0_12px_35px_rgba(15,23,42,0.18)]

//           backdrop-blur-2xl

//           transition-all
//           duration-300
//           ease-out

//           dark:border-white/10
//           dark:bg-slate-900/90

//           md:hidden

//           ${
//             showBottomNavigation
//               ? `
//                 translate-y-0
//                 scale-100
//                 opacity-100
//               `
//               : `
//                 pointer-events-none
//                 translate-y-[110px]
//                 scale-[0.96]
//                 opacity-0
//               `
//           }
//         `}
//       >
//         <div
//           className="
//             flex
//             h-full
//             w-full
//             items-center
//           "
//         >
//           {/* HOME */}
//           <MobileNavItem
//             href="/"
//             label="ទំព័រដើម"
//             icon={House}
//             active={pathname === "/"}
//           />

//           {/* FOOD */}
//           <MobileNavItem
//             href="/food-page"
//             label="ម្ហូប"
//             icon={UtensilsCrossed}
//             active={pathname.startsWith("/food-page")}
//           />

//           {/* ABOUT */}
//           <MobileNavItem
//             href="/about"
//             label="អំពីយើង"
//             icon={Info}
//             active={pathname.startsWith("/about")}
//           />

//           {/* ACCOUNT */}
//           {isAuthenticated ? (
//             <MobileNavItem
//               href="/dashboard"
//               label="គណនី"
//               icon={CircleUserRound}
//               active={pathname.startsWith("/dashboard")}
//             />
//           ) : (
//             <Link
//               href="/api/auth/login"
//               className="
//                 group
//                 relative
//                 flex
//                 h-full
//                 min-w-0
//                 flex-1
//                 flex-col
//                 items-center
//                 justify-center
//                 gap-1
//                 rounded-[20px]
//                 px-1
//                 py-1.5
//                 text-slate-500
//                 outline-none
//                 transition-all
//                 duration-200

//                 active:scale-95

//                 dark:text-slate-400
//               "
//             >
//               <span
//                 className="
//                   flex
//                   h-7
//                   items-center
//                   justify-center
//                   transition-colors

//                   group-hover:text-primary-800

//                   dark:group-hover:text-primary-400
//                 "
//               >
//                 <CircleUserRound
//                   className="h-[21px] w-[21px]"
//                   strokeWidth={2}
//                 />
//               </span>

//               <span
//                 className="
//                   max-w-full
//                   truncate
//                   text-[10px]
//                   font-medium
//                   leading-none
//                 "
//               >
//                 ចូលគណនី
//               </span>
//             </Link>
//           )}
//         </div>
//       </nav>
//     </>
//   );
// }

// // "use client";

// // import Link from "next/link";
// // import { usePathname, useRouter } from "next/navigation";
// // import {
// //   House,
// //   UtensilsCrossed,
// //   Info,
// //   CircleUserRound,
// //   LogIn,
// //   type LucideIcon,
// // } from "lucide-react";
// // import { useEffect, useRef, useState } from "react";

// // import FluidTabs from "../../../components/animata/tabs/fluid-tabs";
// // import ThemeToggle from "../theme-toggle";
// // import DashboardUserProfile from "../DashboardUserProfile";
// // import NotificationBellLink from "@/components/notifications/NotificationBellLink";
// // import { useGetCurrentUserQuery } from "@/app/store/auth/currentUserApi";

// // /* =========================================================
// //    NAVIGATION DATA
// // ========================================================= */

// // const NAV_LINKS = [
// //   {
// //     href: "/",
// //     label: "ទំព័រដើម",
// //     mobileLabel: "ទំព័រដើម",
// //     icon: House,
// //   },
// //   {
// //     href: "/menu",
// //     label: "ម្ហូបអាហារ",
// //     mobileLabel: "ម្ហូប",
// //     icon: UtensilsCrossed,
// //   },
// //   {
// //     href: "/about",
// //     label: "អំពីយើង",
// //     mobileLabel: "អំពីយើង",
// //     icon: Info,
// //   },
// // ];

// // function checkActiveRoute(pathname: string, href: string): boolean {
// //   if (href === "/") {
// //     return pathname === "/";
// //   }

// //   return pathname === href || pathname.startsWith(`${href}/`);
// // }

// // /* =========================================================
// //    MOBILE NAV ITEM
// // ========================================================= */

// // interface MobileNavItemProps {
// //   href: string;
// //   label: string;
// //   icon: LucideIcon;
// //   active: boolean;
// // }

// // function MobileNavItem({
// //   href,
// //   label,
// //   icon: Icon,
// //   active,
// // }: MobileNavItemProps) {
// //   return (
// //     <Link
// //       href={href}
// //       scroll
// //       aria-current={active ? "page" : undefined}
// //       className="
// //         group
// //         relative
// //         flex
// //         min-w-0
// //         flex-1
// //         flex-col
// //         items-center
// //         justify-center
// //         gap-1
// //         rounded-[20px]
// //         px-1
// //         py-2
// //         transition-all
// //         duration-200
// //         active:scale-95
// //       "
// //     >
// //       {/* Active background */}
// //       {active && (
// //         <span
// //           className="
// //             absolute
// //             inset-1
// //             rounded-[18px]
// //             bg-primary-800/10
// //             dark:bg-primary-500/15
// //           "
// //         />
// //       )}

// //       {/* Icon */}
// //       <span
// //         className={`
// //           relative
// //           z-10
// //           flex
// //           h-7
// //           items-center
// //           justify-center
// //           transition-all
// //           duration-200

// //           ${
// //             active
// //               ? "text-primary-800 dark:text-primary-400"
// //               : "text-slate-500 dark:text-slate-400"
// //           }
// //         `}
// //       >
// //         <Icon
// //           className={active ? "h-[23px] w-[23px]" : "h-[21px] w-[21px]"}
// //           strokeWidth={active ? 2.5 : 2}
// //         />
// //       </span>

// //       {/* Label */}
// //       <span
// //         className={`
// //           relative
// //           z-10
// //           max-w-full
// //           truncate
// //           text-[10px]
// //           leading-none

// //           ${
// //             active
// //               ? `
// //                 font-semibold
// //                 text-primary-800
// //                 dark:text-primary-400
// //               `
// //               : `
// //                 font-medium
// //                 text-slate-500
// //                 dark:text-slate-400
// //               `
// //           }
// //         `}
// //       >
// //         {label}
// //       </span>
// //     </Link>
// //   );
// // }

// // /* =========================================================
// //    NAVBAR
// // ========================================================= */

// // export default function Navbar() {
// //   const pathname = usePathname();
// //   const router = useRouter();

// //   const lastScrollY = useRef(0);
// //   const ticking = useRef(false);

// //   /*
// //    * true:
// //    * mobile top header + bottom nav visible
// //    *
// //    * false:
// //    * they slide away while scrolling down.
// //    *
// //    * Model is NOT affected because Model is outside Navbar.
// //    */
// //   const [showMobileNavigation, setShowMobileNavigation] = useState(true);

// //   const { data: user, isLoading: isLoadingUser } = useGetCurrentUserQuery(
// //     undefined,
// //     {
// //       refetchOnMountOrArgChange: true,
// //     },
// //   );

// //   const isAuthenticated = Boolean(user);

// //   const foundActiveIndex = NAV_LINKS.findIndex((link) =>
// //     checkActiveRoute(pathname, link.href),
// //   );

// //   const activeIndex = foundActiveIndex >= 0 ? foundActiveIndex : 0;

// //   /* =======================================================
// //      DESKTOP NAVIGATION
// //   ======================================================= */

// //   const handleDesktopTabChange = (index: number) => {
// //     const selectedLink = NAV_LINKS[index];

// //     if (!selectedLink) {
// //       return;
// //     }

// //     if (checkActiveRoute(pathname, selectedLink.href)) {
// //       return;
// //     }

// //     router.push(selectedLink.href, {
// //       scroll: true,
// //     });
// //   };

// //   /* =======================================================
// //      SHOW NAV AGAIN AFTER PAGE CHANGE
// //   ======================================================= */

// //   useEffect(() => {
// //     queueMicrotask(() => {
// //       setShowMobileNavigation(true);
// //     });
// //   }, [pathname]);

// //   /* =======================================================
// //      MOBILE SCROLL BEHAVIOR

// //      Scroll down:
// //        hide Navbar + Bottom Navigation

// //      Scroll up:
// //        reveal them again

// //      Model stays visible
// //   ======================================================= */

// //   useEffect(() => {
// //     lastScrollY.current = window.scrollY;

// //     const handleScroll = () => {
// //       if (ticking.current) {
// //         return;
// //       }

// //       ticking.current = true;

// //       window.requestAnimationFrame(() => {
// //         const currentScrollY = window.scrollY;
// //         const difference = currentScrollY - lastScrollY.current;

// //         /*
// //          * Always show navigation near top of page.
// //          */
// //         if (currentScrollY <= 70) {
// //           setShowMobileNavigation(true);
// //         } else if (difference > 7) {
// //           /*
// //            * Scrolling DOWN
// //            */
// //           setShowMobileNavigation(false);
// //         } else if (difference < -7) {
// //           /*
// //            * Scrolling UP
// //            */
// //           setShowMobileNavigation(true);
// //         }

// //         lastScrollY.current = currentScrollY;
// //         ticking.current = false;
// //       });
// //     };

// //     window.addEventListener("scroll", handleScroll, {
// //       passive: true,
// //     });

// //     return () => {
// //       window.removeEventListener("scroll", handleScroll);
// //     };
// //   }, []);

// //   return (
// //     <>
// //       {/* =====================================================
// //           TOP HEADER
// //       ===================================================== */}

// //       <nav
// //         className={`
// //           fixed
// //           left-0
// //           top-0
// //           z-50
// //           w-full

// //           border-b
// //           border-slate-100/70

// //           bg-white/90
// //           shadow-sm
// //           backdrop-blur-xl

// //           transition-transform
// //           duration-300
// //           ease-out

// //           dark:border-white/5
// //           dark:bg-gray-950/90

// //           md:translate-y-0
// //           md:border-b-0
// //           md:bg-white/5
// //           md:shadow-2xs
// //           md:backdrop-blur-[4px]
// //           md:dark:bg-gray-950/1

// //           ${showMobileNavigation ? "translate-y-0" : "-translate-y-full"}
// //         `}
// //       >
// //         <div
// //           className="
// //             mx-auto
// //             flex
// //             h-16
// //             w-full
// //             max-w-7xl
// //             items-center
// //             justify-between
// //             px-4

// //             sm:px-5

// //             md:min-h-16
// //             md:gap-4
// //             md:px-3
// //           "
// //         >
// //           {/* =================================================
// //               LOGO
// //           ================================================= */}

// //           <Link
// //             href="/"
// //             aria-label="ទៅកាន់ទំព័រដើម"
// //             className="flex shrink-0 items-center"
// //           >
// //             <img
// //               src="/Image/foodHub-logo.png"
// //               alt="FoodHub logo"
// //               className="
// //                 block
// //                 h-[43px]
// //                 w-auto
// //                 object-contain
// //                 dark:hidden

// //                 sm:h-[48px]

// //                 md:h-[68px]
// //               "
// //             />

// //             <img
// //               src="/Image/foodHub-logo-dark1.png"
// //               alt="FoodHub logo"
// //               className="
// //                 hidden
// //                 h-[43px]
// //                 w-auto
// //                 object-contain
// //                 dark:block

// //                 sm:h-[48px]

// //                 md:h-[68px]
// //               "
// //             />
// //           </Link>

// //           {/* =================================================
// //               DESKTOP NAVIGATION
// //           ================================================= */}

// //           <div className="hidden md:block">
// //             <FluidTabs
// //               activeIndex={activeIndex}
// //               onActiveIndexChange={handleDesktopTabChange}
// //             >
// //               <FluidTabs.List aria-label="Main navigation">
// //                 {NAV_LINKS.map((link) => (
// //                   <FluidTabs.Tab key={link.href} label={link.label}>
// //                     <FluidTabs.Label>{link.label}</FluidTabs.Label>
// //                   </FluidTabs.Tab>
// //                 ))}
// //               </FluidTabs.List>
// //             </FluidTabs>
// //           </div>

// //           {/* =================================================
// //               DESKTOP ACTIONS
// //           ================================================= */}

// //           <div className="hidden min-w-0 items-center gap-3 md:flex">
// //             <ThemeToggle />

// //             {isLoadingUser ? (
// //               <div className="flex items-center gap-2">
// //                 <div
// //                   className="
// //                     h-10
// //                     w-10
// //                     animate-pulse
// //                     rounded-full
// //                     bg-slate-200
// //                     dark:bg-slate-700
// //                   "
// //                 />

// //                 <div className="space-y-1">
// //                   <div
// //                     className="
// //                       h-4
// //                       w-24
// //                       animate-pulse
// //                       rounded
// //                       bg-slate-200
// //                       dark:bg-slate-700
// //                     "
// //                   />

// //                   <div
// //                     className="
// //                       h-3
// //                       w-28
// //                       animate-pulse
// //                       rounded
// //                       bg-slate-100
// //                       dark:bg-slate-800
// //                     "
// //                   />
// //                 </div>
// //               </div>
// //             ) : isAuthenticated ? (
// //               <>
// //                 <NotificationBellLink href="/notifications" />

// //                 <DashboardUserProfile />
// //               </>
// //             ) : (
// //               <Link
// //                 href="/api/auth/login"
// //                 className="
// //                   inline-flex
// //                   items-center
// //                   gap-2
// //                   rounded-full
// //                   bg-primary-800
// //                   px-4
// //                   py-2
// //                   font-medium
// //                   text-white
// //                   transition
// //                   hover:bg-primary-900
// //                 "
// //               >
// //                 <LogIn className="h-4 w-4" />
// //                 ចូលគណនី
// //               </Link>
// //             )}
// //           </div>

// //           {/* =================================================
// //               MOBILE TOP ACTIONS
// //           ================================================= */}

// //           <div className="flex items-center gap-1 md:hidden">
// //             {/* Theme */}
// //             <div
// //               className="
// //                 flex
// //                 h-10
// //                 w-10
// //                 items-center
// //                 justify-center
// //                 rounded-full
// //               "
// //             >
// //               <ThemeToggle />
// //             </div>

// //             {/* Notification */}
// //             {!isLoadingUser && isAuthenticated && (
// //               <div
// //                 className="
// //                   flex
// //                   h-10
// //                   w-10
// //                   items-center
// //                   justify-center
// //                 "
// //               >
// //                 <NotificationBellLink href="/notifications" />
// //               </div>
// //             )}

// //             {/* Profile */}
// //             {isLoadingUser ? (
// //               <div
// //                 className="
// //                   h-10
// //                   w-10
// //                   animate-pulse
// //                   rounded-full
// //                   bg-slate-200
// //                   dark:bg-slate-700
// //                 "
// //               />
// //             ) : isAuthenticated ? (
// //               <div className="shrink-0">
// //                 <DashboardUserProfile />
// //               </div>
// //             ) : (
// //               <Link
// //                 href="/api/auth/login"
// //                 aria-label="ចូលគណនី"
// //                 className="
// //                   flex
// //                   h-10
// //                   w-10
// //                   items-center
// //                   justify-center
// //                   rounded-full
// //                   bg-primary-800
// //                   text-white
// //                   transition
// //                   active:scale-95
// //                 "
// //               >
// //                 <LogIn className="h-5 w-5" />
// //               </Link>
// //             )}
// //           </div>
// //         </div>
// //       </nav>

// //       {/* =====================================================
// //           MOBILE FLOATING BOTTOM NAVIGATION

// //           Right side is intentionally empty.
// //           That space belongs to <Model />.
// //       ===================================================== */}

// //       <nav
// //         aria-label="ការរុករកលើទូរស័ព្ទ"
// //         className={`
// //           fixed
// //           bottom-[calc(10px+env(safe-area-inset-bottom))]
// //           left-3
// //           right-[82px]
// //           z-50

// //           h-[66px]

// //           rounded-[26px]
// //           border
// //           border-white/70

// //           bg-white/90

// //           px-1.5
// //           py-1.5

// //           shadow-[0_12px_35px_rgba(15,23,42,0.20)]

// //           backdrop-blur-2xl

// //           transition-all
// //           duration-300
// //           ease-out

// //           dark:border-white/10
// //           dark:bg-slate-900/90

// //           md:hidden

// //           ${
// //             showMobileNavigation
// //               ? "translate-y-0 opacity-100"
// //               : "pointer-events-none translate-y-[120px] opacity-0"
// //           }
// //         `}
// //       >
// //         <div className="flex h-full items-center">
// //           {/* HOME */}
// //           <MobileNavItem
// //             href="/"
// //             label="ទំព័រដើម"
// //             icon={House}
// //             active={pathname === "/"}
// //           />

// //           {/* FOOD */}
// //           <MobileNavItem
// //             href="/menu"
// //             label="ម្ហូប"
// //             icon={UtensilsCrossed}
// //             active={pathname.startsWith("/menu")}
// //           />

// //           {/* ABOUT */}
// //           <MobileNavItem
// //             href="/about"
// //             label="អំពីយើង"
// //             icon={Info}
// //             active={pathname.startsWith("/about")}
// //           />

// //           {/* ACCOUNT */}
// //           {isAuthenticated ? (
// //             <MobileNavItem
// //               href="/dashboard"
// //               label="គណនី"
// //               icon={CircleUserRound}
// //               active={pathname.startsWith("/dashboard")}
// //             />
// //           ) : (
// //             <MobileNavItem
// //               href="/api/auth/login"
// //               label="ចូលគណនី"
// //               icon={CircleUserRound}
// //               active={false}
// //             />
// //           )}
// //         </div>
// //       </nav>
// //     </>
// //   );
// // }

// // // // "use client";

// // // // import Link from "next/link";
// // // // import Image from "next/image";
// // // // import { usePathname, useRouter } from "next/navigation";
// // // // import { LayoutDashboard, LogIn, LogOut, Search } from "lucide-react";
// // // // import { useEffect, useRef, useState } from "react";

// // // // import FluidTabs from "../../../components/animata/tabs/fluid-tabs";
// // // // import ThemeToggle from "../theme-toggle";
// // // // import DashboardUserProfile from "../DashboardUserProfile";
// // // // import GlobalSearchModal from "../search/GlobalSearchModal";
// // // // import { useGetCurrentUserQuery } from "@/app/store/auth/currentUserApi";
// // // // import NotificationBellLink from "@/components/notifications/NotificationBellLink";

// // // // const NAV_LINKS = [
// // // //   {
// // // //     href: "/",
// // // //     label: "ទំព័រដើម",
// // // //   },
// // // //   {
// // // //     href: "/menu",
// // // //     label: "ម្ហូបអាហារ",
// // // //   },
// // // //   {
// // // //     href: "/about",
// // // //     label: "អំពីយើង",
// // // //   },
// // // // ];

// // // // function checkActiveRoute(pathname: string, href: string): boolean {
// // // //   if (href === "/") {
// // // //     return pathname === "/";
// // // //   }

// // // //   return pathname === href || pathname.startsWith(`${href}/`);
// // // // }

// // // // export default function Navbar() {
// // // //   const [open, setOpen] = useState(false);
// // // //   const [isSearchOpen, setIsSearchOpen] = useState(false);

// // // //   const pathname = usePathname();
// // // //   const router = useRouter();

// // // //   const navRef = useRef<HTMLElement | null>(null);

// // // //   const { data: user, isLoading: isLoadingUser } = useGetCurrentUserQuery(
// // // //     undefined,
// // // //     {
// // // //       refetchOnMountOrArgChange: true,
// // // //     },
// // // //   );

// // // //   const isAuthenticated = Boolean(user);

// // // //   const foundActiveIndex = NAV_LINKS.findIndex((link) =>
// // // //     checkActiveRoute(pathname, link.href),
// // // //   );

// // // //   const activeIndex = foundActiveIndex >= 0 ? foundActiveIndex : 0;

// // // //   // Global Cmd+K or Ctrl+K or custom event listener
// // // //   useEffect(() => {
// // // //     const handleOpenSearch = () => setIsSearchOpen(true);
// // // //     const handleCmdK = (e: KeyboardEvent) => {
// // // //       if ((e.metaKey || e.ctrlKey) && e.key === "k") {
// // // //         e.preventDefault();
// // // //         setIsSearchOpen(true);
// // // //       }
// // // //     };
// // // //     window.addEventListener("open-global-search", handleOpenSearch);
// // // //     window.addEventListener("keydown", handleCmdK);
// // // //     return () => {
// // // //       window.removeEventListener("open-global-search", handleOpenSearch);
// // // //       window.removeEventListener("keydown", handleCmdK);
// // // //     };
// // // //   }, []);

// // // //   useEffect(() => {
// // // //     queueMicrotask(() => {
// // // //       setOpen(false);
// // // //     });
// // // //   }, [pathname]);

// // // //   useEffect(() => {
// // // //     if (!open) {
// // // //       return;
// // // //     }

// // // //     const handleKeyDown = (event: KeyboardEvent) => {
// // // //       if (event.key === "Escape") {
// // // //         setOpen(false);
// // // //       }
// // // //     };

// // // //     const handlePointerDown = (event: PointerEvent) => {
// // // //       const navbar = navRef.current;

// // // //       if (navbar && !navbar.contains(event.target as Node)) {
// // // //         setOpen(false);
// // // //       }
// // // //     };

// // // //     const handleResize = () => {
// // // //       if (window.innerWidth >= 768) {
// // // //         setOpen(false);
// // // //       }
// // // //     };

// // // //     window.addEventListener("keydown", handleKeyDown);

// // // //     window.addEventListener("pointerdown", handlePointerDown);

// // // //     window.addEventListener("resize", handleResize);

// // // //     return () => {
// // // //       window.removeEventListener("keydown", handleKeyDown);

// // // //       window.removeEventListener("pointerdown", handlePointerDown);

// // // //       window.removeEventListener("resize", handleResize);
// // // //     };
// // // //   }, [open]);

// // // //   const handleDesktopTabChange = (index: number) => {
// // // //     const selectedLink = NAV_LINKS[index];

// // // //     if (!selectedLink) {
// // // //       return;
// // // //     }

// // // //     if (checkActiveRoute(pathname, selectedLink.href)) {
// // // //       return;
// // // //     }

// // // //     router.push(selectedLink.href, {
// // // //       scroll: true,
// // // //     });
// // // //   };

// // // //   const handleLogout = () => {
// // // //     setOpen(false);
// // // //     window.location.assign("/api/auth/logout");
// // // //   };

// // // //   return (
// // // //     <nav
// // // //       ref={navRef}
// // // //       className="fixed top-0 z-99 w-full   bg-white/5 shadow-2xs backdrop-blur-[4px] dark:border-white/1 dark:bg-gray-950/1"
// // // //     >
// // // //       <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-3 sm:px-2">
// // // //         {/* Logo */}
// // // //         <Link href="/" aria-label="ទៅកាន់ទំព័រដើម" className="shrink-0">
// // // //           <Image
// // // //             src="/Image/logo.png"
// // // //             alt="FoodHub logo"
// // // //             width={198}
// // // //             height={100}
// // // //             priority
// // // //             className="block h-[40px] w-auto object-contain py-1 sm:h-[45px] md:h-[65px]"
// // // //           />
// // // //         </Link>

// // // //         {/* Desktop navigation */}
// // // //         <div className="hidden md:block">
// // // //           <FluidTabs
// // // //             activeIndex={activeIndex}
// // // //             onActiveIndexChange={handleDesktopTabChange}
// // // //           >
// // // //             <FluidTabs.List aria-label="Main navigation">
// // // //               {NAV_LINKS.map((link) => (
// // // //                 <FluidTabs.Tab key={link.href} label={link.label}>
// // // //                   <FluidTabs.Label>{link.label}</FluidTabs.Label>
// // // //                 </FluidTabs.Tab>
// // // //               ))}
// // // //             </FluidTabs.List>
// // // //           </FluidTabs>
// // // //         </div>

// // // //         {/* Desktop actions */}
// // // //         <div className="hidden min-w-0 items-center justify-center gap-3 md:flex">
// // // //           <ThemeToggle />

// // // //           {isLoadingUser ? (
// // // //             <div className="flex items-center gap-2">
// // // //               <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />

// // // //               <div className="space-y-1">
// // // //                 <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
// // // //                 <div className="h-3 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
// // // //               </div>
// // // //             </div>
// // // //           ) : isAuthenticated ? (
// // // //             <>
// // // //               <NotificationBellLink href="/notifications" />
// // // //               <DashboardUserProfile />
// // // //             </>
// // // //           ) : (
// // // //             <>
// // // //               <Link
// // // //                 href="/api/auth/login"
// // // //                 className="inline-flex text-white items-center gap-2 rounded-full px-4 py-2 font-medium bg-primary-800 transition hover:bg-primary-900 dark:text-white"
// // // //               >
// // // //                 <LogIn className="h-4 w-4" />
// // // //                 ចូលគណនី
// // // //               </Link>

// // // //               <Link
// // // //                 href="/register"
// // // //                 className="rounded-full bg-primary-800 px-4 py-2 font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-primary"
// // // //               >
// // // //                 បង្កើតគណនី
// // // //               </Link>
// // // //             </>
// // // //           )}
// // // //         </div>

// // // //         {/* Mobile controls */}
// // // //         <div className="flex items-center gap-1.5 sm:gap-2 md:hidden">
// // // //           <ThemeToggle />

// // // //           {/* Mobile hamburger */}
// // // //           <button
// // // //             type="button"
// // // //             onClick={() => setOpen((current) => !current)}
// // // //             aria-expanded={open}
// // // //             aria-controls="mobile-menu"
// // // //             aria-label={open ? "បិទម៉ឺនុយ" : "បើកម៉ឺនុយ"}
// // // //             className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full text-primary-900 transition-colors duration-200 hover:bg-primary-800/10 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-800 dark:text-white"
// // // //           >
// // // //             <span
// // // //               className={`absolute h-[2px] w-5 rounded-full bg-current transition-all duration-300 ease-out motion-reduce:transition-none ${
// // // //                 open ? "rotate-45" : "-translate-y-[6px]"
// // // //               }`}
// // // //             />

// // // //             <span
// // // //               className={`absolute h-[2px] w-5 rounded-full bg-current transition-all duration-200 ease-out motion-reduce:transition-none ${
// // // //                 open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
// // // //               }`}
// // // //             />

// // // //             <span
// // // //               className={`absolute h-[2px] w-5 rounded-full bg-current transition-all duration-300 ease-out motion-reduce:transition-none ${
// // // //                 open ? "-rotate-45" : "translate-y-[6px]"
// // // //               }`}
// // // //             />
// // // //           </button>
// // // //         </div>
// // // //       </div>

// // // //       {/* Mobile menu */}
// // // //       <div
// // // //         id="mobile-menu"
// // // //         aria-hidden={!open}
// // // //         className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none md:hidden ${
// // // //           open
// // // //             ? "grid-rows-[1fr] opacity-100"
// // // //             : "pointer-events-none grid-rows-[0fr] opacity-0"
// // // //         }`}
// // // //       >
// // // //         <div className="overflow-hidden">
// // // //           <div className="border-t border-black/5 px-3 pb-4 pt-3 dark:border-white/10">
// // // //             {/* Mobile authenticated user */}
// // // //             {isLoadingUser ? (
// // // //               <div className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
// // // //                 <div className="h-11 w-11 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />

// // // //                 <div className="space-y-2">
// // // //                   <div className="h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
// // // //                   <div className="h-3 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
// // // //                 </div>
// // // //               </div>
// // // //             ) : isAuthenticated ? (
// // // //               <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
// // // //                 <DashboardUserProfile showEmail alwaysShowText />
// // // //               </div>
// // // //             ) : null}

// // // //             <ul className="flex flex-col gap-1">
// // // //               {NAV_LINKS.map((link, index) => {
// // // //                 const isActive = checkActiveRoute(pathname, link.href);

// // // //                 return (
// // // //                   <li
// // // //                     key={link.href}
// // // //                     style={{
// // // //                       transitionDelay: open ? `${80 + index * 60}ms` : "0ms",
// // // //                     }}
// // // //                     className={`transition-all duration-300 ease-out motion-reduce:transition-none ${
// // // //                       open
// // // //                         ? "translate-y-0 opacity-100"
// // // //                         : "-translate-y-2 opacity-0"
// // // //                     }`}
// // // //                   >
// // // //                     <Link
// // // //                       href={link.href}
// // // //                       scroll
// // // //                       tabIndex={open ? 0 : -1}
// // // //                       onClick={() => setOpen(false)}
// // // //                       className={`block rounded-2xl px-4 py-3 text-[16px] font-medium transition-colors duration-200 ${
// // // //                         isActive
// // // //                           ? "bg-primary-800 text-white"
// // // //                           : "text-primary-900 hover:bg-primary-800/10 dark:text-white"
// // // //                       }`}
// // // //                     >
// // // //                       {link.label}
// // // //                     </Link>
// // // //                   </li>
// // // //                 );
// // // //               })}

// // // //               {/* Logged-in mobile actions */}
// // // //               {isAuthenticated ? (
// // // //                 <>
// // // //                   <li className="mt-2">
// // // //                     <Link
// // // //                       href="/notifications"
// // // //                       tabIndex={open ? 0 : -1}
// // // //                       onClick={() => setOpen(false)}
// // // //                       className="flex items-center justify-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-3 text-[16px] font-semibold text-primary-900 transition active:scale-[0.98]"
// // // //                     >
// // // //                       ការជូនដំណឹង
// // // //                     </Link>
// // // //                   </li>

// // // //                   <li>
// // // //                     <Link
// // // //                       href="/dashboard"
// // // //                       tabIndex={open ? 0 : -1}
// // // //                       onClick={() => setOpen(false)}
// // // //                       className="flex items-center justify-center gap-2 rounded-full bg-primary-800 px-4 py-3 text-[16px] font-semibold text-white transition active:scale-[0.98]"
// // // //                     >
// // // //                       <LayoutDashboard className="h-5 w-5" />
// // // //                       ចូលទៅផ្ទាំងគ្រប់គ្រង
// // // //                     </Link>
// // // //                   </li>

// // // //                   <li>
// // // //                     <button
// // // //                       type="button"
// // // //                       tabIndex={open ? 0 : -1}
// // // //                       onClick={handleLogout}
// // // //                       className="flex w-full items-center justify-center gap-2 rounded-full bg-red-50 px-4 py-3 text-[16px] font-semibold text-red-600 transition hover:bg-red-100 active:scale-[0.98] dark:bg-red-950/40 dark:text-red-400"
// // // //                     >
// // // //                       <LogOut className="h-5 w-5" />
// // // //                       ចាកចេញ
// // // //                     </button>
// // // //                   </li>
// // // //                 </>
// // // //               ) : (
// // // //                 <>
// // // //                   <li className="mt-2">
// // // //                     <Link
// // // //                       href="/api/auth/login"
// // // //                       tabIndex={open ? 0 : -1}
// // // //                       onClick={() => setOpen(false)}
// // // //                       className="flex items-center justify-center gap-2 rounded-full border border-primary-800 px-4 py-3 text-[16px] font-semibold text-primary-900 transition hover:bg-primary-800/10 active:scale-[0.98] dark:border-white dark:text-white"
// // // //                     >
// // // //                       <LogIn className="h-5 w-5" />
// // // //                       ចូលគណនី
// // // //                     </Link>
// // // //                   </li>

// // // //                   <li>
// // // //                     <Link
// // // //                       href="/register"
// // // //                       tabIndex={open ? 0 : -1}
// // // //                       onClick={() => setOpen(false)}
// // // //                       className="block rounded-full bg-primary-800 px-4 py-3 text-center text-[16px] font-semibold text-white transition-transform duration-200 active:scale-[0.98] dark:bg-white dark:text-primary"
// // // //                     >
// // // //                       បង្កើតគណនី
// // // //                     </Link>
// // // //                   </li>
// // // //                   <li className="mt-1">
// // // //                     <button
// // // //                       type="button"
// // // //                       tabIndex={open ? 0 : -1}
// // // //                       onClick={() => {
// // // //                         setOpen(false);
// // // //                         setIsSearchOpen(true);
// // // //                       }}
// // // //                       className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 px-4 py-3 text-[16px] font-semibold text-slate-800 dark:text-white transition active:scale-[0.98]"
// // // //                     >
// // // //                       <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
// // // //                       ស្វែងរក
// // // //                     </button>
// // // //                   </li>
// // // //                 </>
// // // //               )}
// // // //             </ul>
// // // //           </div>
// // // //         </div>
// // // //       </div>

// // // //       <GlobalSearchModal
// // // //         isOpen={isSearchOpen}
// // // //         onClose={() => setIsSearchOpen(false)}
// // // //       />
// // // //     </nav>
// // // //   );
// // // // }

// // // "use client";

// // // import Link from "next/link";
// // // import { usePathname, useRouter } from "next/navigation";
// // // import { LayoutDashboard, LogIn, LogOut } from "lucide-react";
// // // import { useEffect, useRef, useState } from "react";

// // // import FluidTabs from "../../../components/animata/tabs/fluid-tabs";
// // // import ThemeToggle from "../theme-toggle";
// // // import DashboardUserProfile from "../DashboardUserProfile";
// // // import { useGetCurrentUserQuery } from "@/app/store/auth/currentUserApi";

// // // const NAV_LINKS = [
// // //   {
// // //     href: "/",
// // //     label: "ទំព័រដើម",
// // //   },
// // //   {
// // //     href: "/food-page",
// // //     label: "ម្ហូបអាហារ",
// // //   },
// // //   {
// // //     href: "/about",
// // //     label: "អំពីយើង",
// // //   },
// // // ];

// // // function checkActiveRoute(pathname: string, href: string): boolean {
// // //   if (href === "/") {
// // //     return pathname === "/";
// // //   }

// // //   return pathname === href || pathname.startsWith(`${href}/`);
// // // }

// // // export default function Navbar() {
// // //   const [open, setOpen] = useState(false);

// // //   const pathname = usePathname();
// // //   const router = useRouter();

// // //   const navRef = useRef<HTMLElement | null>(null);

// // //   const { data: user, isLoading: isLoadingUser } = useGetCurrentUserQuery(
// // //     undefined,
// // //     {
// // //       refetchOnMountOrArgChange: true,
// // //     },
// // //   );

// // //   const isAuthenticated = Boolean(user);

// // //   const foundActiveIndex = NAV_LINKS.findIndex((link) =>
// // //     checkActiveRoute(pathname, link.href),
// // //   );

// // //   const activeIndex = foundActiveIndex >= 0 ? foundActiveIndex : 0;

// // //   useEffect(() => {
// // //     setOpen(false);
// // //   }, [pathname]);

// // //   useEffect(() => {
// // //     if (!open) {
// // //       return;
// // //     }

// // //     const handleKeyDown = (event: KeyboardEvent) => {
// // //       if (event.key === "Escape") {
// // //         setOpen(false);
// // //       }
// // //     };

// // //     const handlePointerDown = (event: PointerEvent) => {
// // //       const navbar = navRef.current;

// // //       if (navbar && !navbar.contains(event.target as Node)) {
// // //         setOpen(false);
// // //       }
// // //     };

// // //     const handleResize = () => {
// // //       if (window.innerWidth >= 768) {
// // //         setOpen(false);
// // //       }
// // //     };

// // //     window.addEventListener("keydown", handleKeyDown);

// // //     window.addEventListener("pointerdown", handlePointerDown);

// // //     window.addEventListener("resize", handleResize);

// // //     return () => {
// // //       window.removeEventListener("keydown", handleKeyDown);

// // //       window.removeEventListener("pointerdown", handlePointerDown);

// // //       window.removeEventListener("resize", handleResize);
// // //     };
// // //   }, [open]);

// // //   const handleDesktopTabChange = (index: number) => {
// // //     const selectedLink = NAV_LINKS[index];

// // //     if (!selectedLink) {
// // //       return;
// // //     }

// // //     if (checkActiveRoute(pathname, selectedLink.href)) {
// // //       return;
// // //     }

// // //     router.push(selectedLink.href, {
// // //       scroll: true,
// // //     });
// // //   };

// // //   const handleLogout = () => {
// // //     setOpen(false);
// // //     window.location.assign("/api/auth/logout");
// // //   };

// // //   return (
// // //     <nav
// // //       ref={navRef}
// // //       className="fixed top-0 z-99 w-full   bg-white/5 shadow-2xs backdrop-blur-[4px] dark:border-white/1 dark:bg-gray-950/1"
// // //     >
// // //       <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-3 sm:px-2">
// // //         {/* Logo */}
// // //         <Link
// // //           href="/"
// // //           aria-label="ទៅកាន់ទំព័រដើម"
// // //           className="shrink-0 flex items-center"
// // //         >
// // //           <img
// // //             src="/Image/foodHub-logo.png"
// // //             alt="FoodHub logo"
// // //             className="block dark:hidden h-[46px] sm:h-[56px] md:h-[68px] w-auto object-contain transition-all"
// // //           />
// // //           <img
// // //             src="/Image/foodHub-logo-dark1.png"
// // //             alt="FoodHub logo"
// // //             className="hidden dark:block h-[46px] sm:h-[56px] md:h-[68px] w-auto object-contain transition-all"
// // //           />
// // //         </Link>

// // //         {/* Desktop navigation */}
// // //         <div className="hidden md:block">
// // //           <FluidTabs
// // //             activeIndex={activeIndex}
// // //             onActiveIndexChange={handleDesktopTabChange}
// // //           >
// // //             <FluidTabs.List aria-label="Main navigation">
// // //               {NAV_LINKS.map((link) => (
// // //                 <FluidTabs.Tab key={link.href} label={link.label}>
// // //                   <FluidTabs.Label>{link.label}</FluidTabs.Label>
// // //                 </FluidTabs.Tab>
// // //               ))}
// // //             </FluidTabs.List>
// // //           </FluidTabs>
// // //         </div>

// // //         {/* Desktop actions */}
// // //         <div className="hidden min-w-0 items-center justify-center gap-3 md:flex">
// // //           <ThemeToggle />

// // //           {isLoadingUser ? (
// // //             <div className="flex items-center gap-2">
// // //               <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />

// // //               <div className="space-y-1">
// // //                 <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
// // //                 <div className="h-3 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
// // //               </div>
// // //             </div>
// // //           ) : isAuthenticated ? (
// // //             <DashboardUserProfile />
// // //           ) : (
// // //             <>
// // //               <a
// // //                 href="/api/auth/login"
// // //                 className="inline-flex text-white items-center gap-2 rounded-full px-4 py-2 font-medium bg-primary-800 transition hover:bg-primary-900 dark:text-white"
// // //               >
// // //                 <LogIn className="h-4 w-4" />
// // //                 ចូលគណនី
// // //               </a>

// // //               {/* <Link
// // //                 href="/register"
// // //                 className="rounded-full bg-primary-800 px-4 py-2 font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-primary"
// // //               >
// // //                 បង្កើតគណនី
// // //               </Link> */}
// // //             </>
// // //           )}
// // //         </div>

// // //         {/* Mobile controls */}
// // //         <div className="flex items-center gap-2 md:hidden">
// // //           <ThemeToggle />

// // //           {/* Mobile hamburger */}
// // //           <button
// // //             type="button"
// // //             onClick={() => setOpen((current) => !current)}
// // //             aria-expanded={open}
// // //             aria-controls="mobile-menu"
// // //             aria-label={open ? "បិទម៉ឺនុយ" : "បើកម៉ឺនុយ"}
// // //             className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full text-primary-900 transition-colors duration-200 hover:bg-primary-800/10 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-800 dark:text-white"
// // //           >
// // //             <span
// // //               className={`absolute h-[2px] w-5 rounded-full bg-current transition-all duration-300 ease-out motion-reduce:transition-none ${
// // //                 open ? "rotate-45" : "-translate-y-[6px]"
// // //               }`}
// // //             />

// // //             <span
// // //               className={`absolute h-[2px] w-5 rounded-full bg-current transition-all duration-200 ease-out motion-reduce:transition-none ${
// // //                 open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
// // //               }`}
// // //             />

// // //             <span
// // //               className={`absolute h-[2px] w-5 rounded-full bg-current transition-all duration-300 ease-out motion-reduce:transition-none ${
// // //                 open ? "-rotate-45" : "translate-y-[6px]"
// // //               }`}
// // //             />
// // //           </button>
// // //         </div>
// // //       </div>

// // //       {/* Mobile menu */}
// // //       <div
// // //         id="mobile-menu"
// // //         aria-hidden={!open}
// // //         className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none md:hidden ${
// // //           open
// // //             ? "grid-rows-[1fr] opacity-100"
// // //             : "pointer-events-none grid-rows-[0fr] opacity-0"
// // //         }`}
// // //       >
// // //         <div className="overflow-hidden">
// // //           <div className="border-t border-black/5 px-3 pb-4 pt-3 dark:border-white/10">
// // //             {/* Mobile authenticated user */}
// // //             {isLoadingUser ? (
// // //               <div className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
// // //                 <div className="h-11 w-11 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />

// // //                 <div className="space-y-2">
// // //                   <div className="h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
// // //                   <div className="h-3 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
// // //                 </div>
// // //               </div>
// // //             ) : isAuthenticated ? (
// // //               <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
// // //                 <DashboardUserProfile showEmail alwaysShowText />
// // //               </div>
// // //             ) : null}

// // //             <ul className="flex flex-col gap-1">
// // //               {NAV_LINKS.map((link, index) => {
// // //                 const isActive = checkActiveRoute(pathname, link.href);

// // //                 return (
// // //                   <li
// // //                     key={link.href}
// // //                     style={{
// // //                       transitionDelay: open ? `${80 + index * 60}ms` : "0ms",
// // //                     }}
// // //                     className={`transition-all duration-300 ease-out motion-reduce:transition-none ${
// // //                       open
// // //                         ? "translate-y-0 opacity-100"
// // //                         : "-translate-y-2 opacity-0"
// // //                     }`}
// // //                   >
// // //                     <Link
// // //                       href={link.href}
// // //                       scroll
// // //                       tabIndex={open ? 0 : -1}
// // //                       onClick={() => setOpen(false)}
// // //                       className={`block rounded-2xl px-4 py-3 text-[16px] font-medium transition-colors duration-200 ${
// // //                         isActive
// // //                           ? "bg-primary-800 text-white"
// // //                           : "text-primary-900 hover:bg-primary-800/10 dark:text-white"
// // //                       }`}
// // //                     >
// // //                       {link.label}
// // //                     </Link>
// // //                   </li>
// // //                 );
// // //               })}

// // //               {/* Theme toggle row */}
// // //               <li className="mt-2 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
// // //                 <span className="text-[15px] font-medium text-slate-700 dark:text-slate-300">
// // //                   ប្តូរទម្រង់ពន្លឺ/ងងឹត
// // //                 </span>
// // //                 <ThemeToggle />
// // //               </li>

// // //               {/* Logged-in mobile actions */}
// // //               {isAuthenticated ? (
// // //                 <>
// // //                   <li className="mt-1">
// // //                     <Link
// // //                       href="/dashboard"
// // //                       tabIndex={open ? 0 : -1}
// // //                       onClick={() => setOpen(false)}
// // //                       className="flex items-center justify-center gap-2 rounded-full bg-primary-800 px-4 py-3 text-[16px] font-semibold text-white transition active:scale-[0.98]"
// // //                     >
// // //                       <LayoutDashboard className="h-5 w-5" />
// // //                       ចូលទៅផ្ទាំងគ្រប់គ្រង
// // //                     </Link>
// // //                   </li>

// // //                   <li>
// // //                     <button
// // //                       type="button"
// // //                       tabIndex={open ? 0 : -1}
// // //                       onClick={handleLogout}
// // //                       className="flex w-full items-center justify-center gap-2 rounded-full bg-red-50 px-4 py-3 text-[16px] font-semibold text-red-600 transition hover:bg-red-100 active:scale-[0.98] dark:bg-red-950/40 dark:text-red-400"
// // //                     >
// // //                       <LogOut className="h-5 w-5" />
// // //                       ចាកចេញ
// // //                     </button>
// // //                   </li>
// // //                 </>
// // //               ) : (
// // //                 <>
// // //                   <li className="mt-1">
// // //                     <Link
// // //                       href="/api/auth/login"
// // //                       tabIndex={open ? 0 : -1}
// // //                       onClick={() => setOpen(false)}
// // //                       className="flex items-center justify-center gap-2 rounded-full border border-primary-800 px-4 py-3 text-[16px] font-semibold text-primary-900 transition hover:bg-primary-800/10 active:scale-[0.98] dark:border-white dark:text-white"
// // //                     >
// // //                       <LogIn className="h-5 w-5" />
// // //                       ចូលគណនី
// // //                     </Link>
// // //                   </li>
// // //                 </>
// // //               )}
// // //             </ul>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </nav>
// // //   );
// // // }
