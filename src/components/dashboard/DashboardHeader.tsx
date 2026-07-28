// "use client";

// import Image from "next/image";
// import { Bell, Search } from "lucide-react";

// interface DashboardHeaderProps {
//   userName?: string;
//   avatarInitial?: string;
//   avatarUrl?: string;
//   notificationCount?: number;
//   onSearch?: (value: string) => void;
// }

// export default function DashboardHeader({
//   userName = "លីតា",
//   avatarInitial = "A",
//   avatarUrl,
//   notificationCount = 0,
//   onSearch,
// }: DashboardHeaderProps) {
//   return (
//     <header className="sticky top-0 z-40 flex h-16 items-center gap-6 border-b border-slate-100 bg-white px-6">
//       {/* Logo — swap src for your real logo in /public/Image */}
//       <div className="flex shrink-0 items-center">
//         <Image
//           src="/Image/logo.png"
//           alt="FoodHub"
//           width={140}
//           height={48}
//           priority
//           className="h-10 w-auto object-contain"
//         />
//       </div>

//       {/* Search */}
//       <div className="mx-auto w-full max-w-2xl">
//         <div className="relative">
//           <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#136C34]" />
//           <input
//             type="text"
//             placeholder="ស្វែងរកម្ហូបអាហារ និង ភោជនីយដ្ឋាន..."
//             onChange={(e) => onSearch?.(e.target.value)}
//             className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-12 pr-5 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-[#136C34] focus:ring-2 focus:ring-[#136C34]/20"
//           />
//         </div>
//       </div>

//       {/* Right: bell + user */}
//       <div className="flex shrink-0 items-center gap-4">
//         <button
//           type="button"
//           aria-label="ការជូនដំណឹង"
//           className="relative rounded-full p-1.5 text-[#136C34] transition hover:bg-emerald-50"
//         >
//           <Bell className="h-6 w-6" />
//           {notificationCount > 0 && (
//             <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E36914] px-1 text-[10px] font-bold text-white">
//               {notificationCount > 9 ? "9+" : notificationCount}
//             </span>
//           )}
//         </button>

//         <div className="flex items-center gap-2">
//           {avatarUrl ? (
//             <Image
//               src={avatarUrl}
//               alt={userName}
//               width={36}
//               height={36}
//               className="h-9 w-9 rounded-full object-cover"
//             />
//           ) : (
//             <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E36914] text-sm font-bold text-white">
//               {avatarInitial}
//             </div>
//           )}
//           <span className="text-sm font-medium text-slate-700">{userName}</span>
//         </div>
//       </div>
//     </header>
//   );
// }


"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { getActiveLabel } from "@/components/layout/NavItem";
import Link from "next/link";

interface DashboardHeaderProps {
  userName?: string;
  avatarInitial?: string;
  avatarUrl?: string;
  notificationCount?: number;
  onSearch?: (value: string) => void;
}

export default function DashboardHeader({
  userName = "លីតា",
  avatarInitial = "A",
  avatarUrl,
  notificationCount = 0,
  onSearch,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const pageTitle = getActiveLabel(pathname);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-6 border-b border-slate-100 bg-white px-6">
      {/* Logo — swap src for your real logo in /public/Image */}
      <Link href={"/"} className="flex shrink-0 items-center">
        <Image
          src="/Image/logo.png"
          alt="FoodHub"
          width={140}
          height={48}
          priority
          className="h-10 w-auto object-contain"
        />
      </Link>

      {/* Dynamic page title — reflects the active Aside page */}
      <span className="shrink-0 text-lg font-semibold text-[#136C34]">
        {pageTitle}
      </span>

      {/* Search */}
      <div className="mx-auto w-full max-w-2xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#136C34]" />
          <input
            type="text"
            placeholder="ស្វែងរកម្ហូបអាហារ និង ភោជនីយដ្ឋាន..."
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-12 pr-5 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-[#136C34] focus:ring-2 focus:ring-[#136C34]/20"
          />
        </div>
      </div>

      {/* Right: bell + user */}
      <div className="flex shrink-0 items-center gap-4">
        <button
          type="button"
          aria-label="ការជូនដំណឹង"
          className="relative rounded-full p-1.5 text-[#136C34] transition hover:bg-emerald-50"
        >
          <Bell className="h-6 w-6" />
          {notificationCount > 0 && (
            <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E36914] px-1 text-[10px] font-bold text-white">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={userName}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E36914] text-sm font-bold text-white">
              {avatarInitial}
            </div>
          )}
          <span className="text-sm font-medium text-slate-700">{userName}</span>
        </div>
      </div>
    </header>
  );
}