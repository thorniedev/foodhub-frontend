"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoSettingsOutline } from "react-icons/io5";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { navItems } from "./NavItem";
import { useSidebar } from "./SidebarContext";
import LogoutButton from "../LogOutButton";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useGetUnreadCountQuery } from "@/app/store/notificationApi";

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
      {/* Overlay — mobile only, shown when drawer is open */}
      {isOpen && (
        <div
          onClick={close}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={cn(
          // Shared styles
          "flex w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white px-3 py-4 transition-transform duration-300 ease-in-out",
          // Mobile: fixed off-canvas drawer, full height, slides in/out
          "fixed inset-y-0 left-0 z-50 h-screen",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: back to normal sticky in-flow sidebar, always visible
          "lg:sticky lg:top-16 lg:z-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0",
        )}
      >
        {/* Close button — mobile only */}
        <button
          type="button"
          aria-label="បិទម៉ឺនុយ"
          onClick={close}
          className="mb-2 flex items-center justify-center self-end rounded-full p-2 text-slate-500 hover:bg-slate-50 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            const dynamicBadge =
              item.href === "/dashboard/favorites"
                ? (bookmarkCount > 0 ? bookmarkCount : undefined)
                : item.href === "/dashboard/notifications"
                  ? (unreadNotificationCount > 0
                      ? unreadNotificationCount
                      : undefined)
                : item.badge;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-full px-3 py-3 text-base font-medium transition-colors",
                  active
                    ? "bg-[#136C34] text-white"
                    : "text-slate-600 hover:bg-slate-50",
                )}
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </span>
                {dynamicBadge !== undefined ? (
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold",
                      active
                        ? "bg-white/20 text-white"
                        : "bg-emerald-100 text-[#136C34]",
                    )}
                  >
                    {dynamicBadge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-slate-600 hover:bg-slate-50"
        >
          <IoSettingsOutline className="text-xl" />
          ការកំណត់
        </button>

        {/* <button
          type="button"
          className="mt-2 flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-red-500 hover:bg-red-50"
        >
          <FiLogOut className="text-xl" />
          ចាកចេញ
        </button> */}
        <LogoutButton />
      </aside>
    </>
  );
}
