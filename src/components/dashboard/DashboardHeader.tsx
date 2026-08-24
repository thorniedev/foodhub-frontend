"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";

import { getActiveLabel } from "@/components/layout/NavItem";
import { useSidebar } from "@/components/layout/SidebarContext";
import DashboardUserProfile from "../DashboardUserProfile";
import NotificationBellLink from "@/components/notifications/NotificationBellLink";

interface DashboardHeaderProps {
  onSearch?: (value: string) => void;
}

export default function DashboardHeader({
  onSearch,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const pageTitle = getActiveLabel(pathname);
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-100 bg-white px-3 sm:gap-6 sm:px-6">
      {/* Mobile menu */}
      <button
        type="button"
        aria-label="បើកម៉ឺនុយ"
        onClick={toggle}
        className="flex shrink-0 items-center justify-center rounded-full p-2 text-[#136C34] transition hover:bg-emerald-50 lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Logo */}
      <Link href="/" className="flex shrink-0 items-center">
        <Image
          src="/Image/foodHub-logo.png"
          alt="FoodHub"
          width={140}
          height={48}
          priority
          className="h-8 w-auto object-contain sm:h-10"
        />
      </Link>

      {/* Page title */}
      <span className="hidden shrink-0 text-lg font-semibold text-[#136C34] sm:block">
        {pageTitle}
      </span>

      {/* Desktop search */}
      <div className="mx-auto hidden w-full max-w-2xl md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#136C34]" />

          <input
            type="text"
            placeholder="ស្វែងរកម្ហូបអាហារ និង ភោជនីយដ្ឋាន..."
            onChange={(event) => onSearch?.(event.target.value)}
            className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-12 pr-5 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-[#136C34] focus:ring-2 focus:ring-[#136C34]/20"
          />
        </div>
      </div>

      {/* Mobile search */}
      <button
        type="button"
        aria-label="ស្វែងរក"
        className="ml-auto flex shrink-0 items-center justify-center rounded-full p-2 text-[#136C34] transition hover:bg-emerald-50 md:hidden"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Notifications and user */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <NotificationBellLink href="/dashboard/notifications" />

        <DashboardUserProfile />
      </div>
    </header>
  );
}
