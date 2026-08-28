"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { X } from "lucide-react";
import { IoSettingsOutline } from "react-icons/io5";

import { useGetUnreadCountQuery } from "@/app/store/notificationApi";
import { useBookmarks } from "@/hooks/useBookmarks";
import { cn } from "@/lib/utils";

import LogoutButton from "../LogOutButton";
import { navItems } from "./NavItem";
import { useSidebar } from "./SidebarContext";

export default function Aside() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  const { totalElements: bookmarkCount } = useBookmarks();

  const { data: unreadNotificationCount = 0 } = useGetUnreadCountQuery(
    undefined,
    {
      pollingInterval: 60_000,
      skipPollingIfUnfocused: true,
    },
  );

  return (
    <>
      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}
      {isOpen && (
        <div
          onClick={close}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}
      <aside
        className={cn(
          /*
           * Shared
           */
          "flex w-[280px] shrink-0 flex-col border-r border-slate-200 bg-white",
          "transition-transform duration-300 ease-in-out",

          /*
           * Mobile
           */
          "fixed inset-y-0 left-0 z-50 h-screen",

          isOpen ? "translate-x-0" : "-translate-x-full",

          /*
           * Desktop
           */
          "lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0",
        )}
      >
        {/* =====================================================
            LOGO AREA
        ====================================================== */}
        <div className="relative flex h-[64px] shrink-0 items-center border-b border-slate-100 px-5">
          <Link
            href="/"
            onClick={close}
            className="flex items-center "
            aria-label="FoodHub"
          >
            <Image
              src="/Image/foodHub-logo.png"
              alt="FoodHub"
              width={145}
              height={52}
              priority
              className="h-auto  max-sm:p-2 p-3 max-sm:-ml-4 w-[135px] object-contain"
            />
          </Link>

          {/* Mobile Close Button */}
          <button
            type="button"
            aria-label="បិទម៉ឺនុយ"
            onClick={close}
            className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* =====================================================
            SCROLLABLE CONTENT
        ====================================================== */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4">
          {/* ===================================================
              NAVIGATION
          ==================================================== */}
          <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              const dynamicBadge =
                item.href === "/dashboard/favorites"
                  ? bookmarkCount > 0
                    ? bookmarkCount
                    : undefined
                  : item.href === "/dashboard/notifications"
                    ? unreadNotificationCount > 0
                      ? unreadNotificationCount
                      : undefined
                    : item.badge;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className={cn(
                    "flex min-h-[48px] w-full items-center justify-between rounded-full px-4 py-3",
                    "text-base font-medium",
                    "transition-colors duration-200",

                    active
                      ? "bg-primary-700 text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center text-xl",
                        active ? "text-white" : "text-slate-500",
                      )}
                    >
                      {item.icon}
                    </span>

                    <span className="truncate">{item.label}</span>
                  </span>

                  {dynamicBadge !== undefined && (
                    <span
                      className={cn(
                        "ml-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                        active
                          ? "bg-white/20 text-white"
                          : "bg-emerald-100 text-primary-700",
                      )}
                    >
                      {dynamicBadge > 99 ? "99+" : dynamicBadge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ===================================================
              BOTTOM ACTIONS
          ==================================================== */}
          <div className="mt-6 shrink-0 border-t border-slate-100 pt-3">
            {/* Settings */}
            <button
              type="button"
              className="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-base font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <span className="flex h-6 w-6 items-center justify-center">
                <IoSettingsOutline className="text-xl" />
              </span>

              <span>ការកំណត់</span>
            </button>

            {/* Logout */}
            {/* <LogoutButton /> */}
          </div>
        </div>
      </aside>
    </>
  );
}

// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { IoSettingsOutline } from "react-icons/io5";
// import { X } from "lucide-react";

// import { cn } from "@/lib/utils";
// import { navItems } from "./NavItem";
// import { useSidebar } from "./SidebarContext";
// import LogoutButton from "../LogOutButton";
// import { useBookmarks } from "@/hooks/useBookmarks";
// import { useGetUnreadCountQuery } from "@/app/store/notificationApi";

// export default function Aside() {
//   const pathname = usePathname();
//   const { isOpen, close } = useSidebar();
//   const { totalElements: bookmarkCount } = useBookmarks();
//   const { data: unreadNotificationCount = 0 } = useGetUnreadCountQuery(
//     undefined,
//     {
//       pollingInterval: 60_000,
//       skipPollingIfUnfocused: true,
//     },
//   );

//   return (
//     <>
//       {/* Overlay — mobile only, shown when drawer is open */}
//       {isOpen && (
//         <div
//           onClick={close}
//           aria-hidden="true"
//           className="fixed inset-0 z-40 bg-black/40 lg:hidden"
//         />
//       )}

//       <aside
//         className={cn(
//           // Shared styles
//           "flex w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white px-3 py-4 transition-transform duration-300 ease-in-out",
//           // Mobile: fixed off-canvas drawer, full height, slides in/out
//           "fixed inset-y-0 left-0 z-50 h-screen",
//           isOpen ? "translate-x-0" : "-translate-x-full",
//           // Desktop: back to normal sticky in-flow sidebar, always visible
//           "lg:sticky lg:top-16 lg:z-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0",
//         )}
//       >
//         {/* Close button — mobile only */}
//         <button
//           type="button"
//           aria-label="បិទម៉ឺនុយ"
//           onClick={close}
//           className="mb-2 flex items-center justify-center self-end rounded-full p-2 text-slate-500 hover:bg-slate-50 lg:hidden"
//         >
//           <X className="h-5 w-5" />
//         </button>

//         <nav className="flex-1 space-y-1.5">
//           {navItems.map((item) => {
//             const active =
//               item.href === "/dashboard"
//                 ? pathname === "/dashboard"
//                 : pathname.startsWith(item.href);

//             const dynamicBadge =
//               item.href === "/dashboard/favorites"
//                 ? bookmarkCount > 0
//                   ? bookmarkCount
//                   : undefined
//                 : item.href === "/dashboard/notifications"
//                   ? unreadNotificationCount > 0
//                     ? unreadNotificationCount
//                     : undefined
//                   : item.badge;

//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className={cn(
//                   "flex items-center justify-between rounded-full px-3 py-3 text-base font-medium transition-colors",
//                   active
//                     ? "bg-[#136C34] text-white"
//                     : "text-slate-600 hover:bg-slate-50",
//                 )}
//               >
//                 <span className="flex items-center gap-3">
//                   <span className="text-xl">{item.icon}</span>
//                   {item.label}
//                 </span>
//                 {dynamicBadge !== undefined ? (
//                   <span
//                     className={cn(
//                       "flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold",
//                       active
//                         ? "bg-white/20 text-white"
//                         : "bg-emerald-100 text-[#136C34]",
//                     )}
//                   >
//                     {dynamicBadge}
//                   </span>
//                 ) : null}
//               </Link>
//             );
//           })}
//         </nav>

//         <button
//           type="button"
//           className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-slate-600 hover:bg-slate-50"
//         >
//           <IoSettingsOutline className="text-xl" />
//           ការកំណត់
//         </button>

//         {/* <button
//           type="button"
//           className="mt-2 flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-red-500 hover:bg-red-50"
//         >
//           <FiLogOut className="text-xl" />
//           ចាកចេញ
//         </button> */}
//         <LogoutButton />
//       </aside>
//     </>
//   );
// }
