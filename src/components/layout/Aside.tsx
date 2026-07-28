"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoSettingsOutline } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";

import { cn } from "@/lib/utils";
import { navItems } from "./NavItem";

export default function Aside() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-16 flex h-[calc(100vh-4rem)] w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white px-3 py-4">
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
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
              {item.badge ? (
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold",
                    active
                      ? "bg-white/20 text-white"
                      : "bg-emerald-100 text-[#136C34]",
                  )}
                >
                  {item.badge}
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

      <button
        type="button"
        className="mt-2 flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-red-500 hover:bg-red-50"
      >
        <FiLogOut className="text-xl" />
        ចាកចេញ
      </button>
    </aside>
  );
}