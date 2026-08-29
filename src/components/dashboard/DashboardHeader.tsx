"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";

import { getActiveLabel } from "@/components/layout/NavItem";
import { useSidebar } from "@/components/layout/SidebarContext";
import DashboardUserProfile from "../DashboardUserProfile";
import NotificationBellLink from "@/components/notifications/NotificationBellLink";
import ThemeToggle from "../theme-toggle";

interface DashboardHeaderProps {
  onSearch?: (value: string) => void;
}

export default function DashboardHeader({ onSearch }: DashboardHeaderProps) {
  const pathname = usePathname();
  const pageTitle = getActiveLabel(pathname);
  const { toggle } = useSidebar();

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md">
      {/* Main header row */}
      <div className="flex h-16 items-center gap-2 px-3 sm:gap-4 sm:px-5 lg:h-[72px] lg:gap-6 lg:px-6">
        {/* Mobile menu */}
        <button
          type="button"
          aria-label="បើកម៉ឺនុយ"
          onClick={toggle}
          className="
            flex h-10 w-10 shrink-0 items-center justify-center
            rounded-full text-primary-700
            transition-colors
            hover:bg-primary-50
            active:scale-95
            lg:hidden
          "
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Page title */}
        <div className="min-w-0 flex-1 sm:flex-none">
          <p
            className="
              truncate text-base font-semibold text-primary-800
              sm:text-lg
              lg:text-xl
            "
          >
            {pageTitle}
          </p>
        </div>

        {/* Desktop search */}
        <div className="mx-auto hidden w-full max-w-2xl md:block">
          <div className="relative">
            <Search
              className="
                pointer-events-none absolute left-4 top-1/2
                h-5 w-5 -translate-y-1/2
                text-primary-700
              "
            />

            <input
              type="text"
              value={searchValue}
              placeholder="ស្វែងរកម្ហូបអាហារ និង ភោជនីយដ្ឋាន..."
              onChange={(event) => handleSearchChange(event.target.value)}
              className="
                w-full rounded-full
                border border-slate-200
                bg-slate-50/70
                py-2.5 pl-12 pr-5
                text-base text-slate-700
                outline-none
                transition-all
                placeholder:text-slate-400
                hover:border-slate-300
                hover:bg-white
                focus:border-primary-600
                focus:bg-white
                focus:ring-2
                focus:ring-primary-600/10
              "
            />
          </div>
        </div>

        {/* Mobile actions */}
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          {/* Mobile search button */}
          <button
            type="button"
            aria-label="ស្វែងរក"
            onClick={() => setMobileSearchOpen((prev) => !prev)}
            className="
              flex h-10 w-10 shrink-0 items-center justify-center
              rounded-full text-primary-700
              transition-colors
              hover:bg-primary-50
              active:scale-95
              md:hidden
            "
          >
            {mobileSearchOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>

          {/* Theme */}
          <div className="hidden xs:block sm:block">
            <ThemeToggle />
          </div>

          {/* Notification */}
          <NotificationBellLink href="/dashboard/notifications" />

          {/* User profile */}
          <DashboardUserProfile />
        </div>
      </div>

      {/* Mobile search bar */}
      <div
        className={`
          overflow-hidden border-t border-slate-100
          transition-all duration-300
          md:hidden
          ${
            mobileSearchOpen
              ? "max-h-24 opacity-100"
              : "max-h-0 border-t-0 opacity-0"
          }
        `}
      >
        <div className="px-3 pb-3 pt-2 sm:px-5">
          <div className="relative">
            <Search
              className="
                pointer-events-none absolute left-4 top-1/2
                h-5 w-5 -translate-y-1/2
                text-primary-700
              "
            />

            <input
              type="text"
              value={searchValue}
              autoFocus={mobileSearchOpen}
              placeholder="ស្វែងរកម្ហូបអាហារ..."
              onChange={(event) => handleSearchChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  closeMobileSearch();
                }
              }}
              className="
                w-full rounded-full
                border border-slate-200
                bg-slate-50
                py-2.5 pl-12 pr-4
                text-base text-slate-700
                outline-none
                transition-all
                placeholder:text-slate-400
                focus:border-primary-600
                focus:bg-white
                focus:ring-2
                focus:ring-primary-600/10
              "
            />
          </div>
        </div>
      </div>
    </header>
  );
}

// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { Menu, Search } from "lucide-react";

// import { getActiveLabel } from "@/components/layout/NavItem";
// import { useSidebar } from "@/components/layout/SidebarContext";
// import DashboardUserProfile from "../DashboardUserProfile";
// import NotificationBellLink from "@/components/notifications/NotificationBellLink";
// import ThemeToggle from "../theme-toggle";

// interface DashboardHeaderProps {
//   onSearch?: (value: string) => void;
// }

// export default function DashboardHeader({ onSearch }: DashboardHeaderProps) {
//   const pathname = usePathname();
//   const pageTitle = getActiveLabel(pathname);
//   const { toggle } = useSidebar();

//   return (
//     <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-100 bg-white px-3 sm:gap-6 sm:px-6">
//       {/* Mobile menu */}
//       <button
//         type="button"
//         aria-label="បើកម៉ឺនុយ"
//         onClick={toggle}
//         className="flex shrink-0 items-center justify-center rounded-full p-2 text-[#136C34] transition hover:bg-emerald-50 lg:hidden"
//       >
//         <Menu className="h-6 w-6" />
//       </button>

//       {/* Logo */}
//       {/* <Link href="/" className="flex shrink-0 items-center">
//         <Image
//           src="/Image/foodHub-logo.png"
//           alt="FoodHub"
//           width={140}
//           height={48}
//           priority
//           className="h-8 w-auto object-contain sm:h-10"
//         />
//       </Link> */}

//       {/* Page title */}
//       <span className="hidden shrink-0 text-lg font-semibold text-[#136C34] sm:block">
//         {pageTitle}
//       </span>

//       {/* Desktop search */}
//       <div className="mx-auto hidden w-full max-w-2xl md:block">
//         <div className="relative">
//           <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#136C34]" />

//           <input
//             type="text"
//             placeholder="ស្វែងរកម្ហូបអាហារ និង ភោជនីយដ្ឋាន..."
//             onChange={(event) => onSearch?.(event.target.value)}
//             className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-12 pr-5 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-[#136C34] focus:ring-2 focus:ring-[#136C34]/20"
//           />
//         </div>
//       </div>

//       {/* Mobile search */}
//       <button
//         type="button"
//         aria-label="ស្វែងរក"
//         className="ml-auto flex shrink-0 items-center justify-center rounded-full p-2 text-[#136C34] transition hover:bg-emerald-50 md:hidden"
//       >
//         <Search className="h-5 w-5" />
//       </button>

//       {/* Notifications and user */}
//       <div className="flex shrink-0 items-center gap-2 sm:gap-4">
//         <ThemeToggle />
//         <NotificationBellLink href="/dashboard/notifications" />

//         <DashboardUserProfile />
//       </div>
//     </header>
//   );
// }
