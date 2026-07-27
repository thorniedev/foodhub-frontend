// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { GrAppsRounded } from "react-icons/gr";
// import { FaHistory } from "react-icons/fa";
// import { LuUsersRound } from "react-icons/lu";
// import { FaRegHeart } from "react-icons/fa";
// import { FaRegBell } from "react-icons/fa6";
// import { IoSettingsOutline } from "react-icons/io5";
// import { FiLogOut } from "react-icons/fi";

// import { cn } from "@/lib/utils";

// interface NavItem {
//   href: string;
//   label: string;
//   icon: React.ReactNode;
//   badge?: number;
// }

// const navItems: NavItem[] = [
//   {
//     href: "/dashboard",
//     label: "ផ្ទាំងព័ត៌មាន",
//     icon: <GrAppsRounded />,
//   },
//   {
//     href: "/dashboard/review",
//     label: "ប្រវត្តិការវាយតម្លៃអាហារ",
//     icon: <FaHistory />,
//   },
//   {
//     href: "/dashboard/family-profile",
//     label: "គណនីសមាជិកគ្រួសារ",
//     icon: <LuUsersRound />,
//   },
//   {
//     href: "/dashboard/favorites",
//     label: "ចំណូលចិត្ត",
//     icon: <FaRegHeart />,
//   },
//   {
//     href: "/dashboard/notifications",
//     label: "ការជូនដំណឹង",
//     icon: <FaRegBell />,
//     badge: 2,
//   },
// ];

// export default function Aside() {
//   const pathname = usePathname();

//   return (
//     <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-4">
//       <nav className="flex-1 space-y-1">
//         {navItems.map((item) => {
//           const active = pathname === item.href;
//           return (
//             <Link
//               key={item.href}
//               href={item.href}
//               className={cn(
//                 "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
//                 active
//                   ? "bg-emerald-600 text-white"
//                   : "text-slate-600 hover:bg-slate-50",
//               )}
//             >
//               <span className="flex items-center gap-3">
//                 {item.icon}
//                 {item.label}
//               </span>
//               {item.badge ? (
//                 <span
//                   className={cn(
//                     "flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold",
//                     active
//                       ? "bg-white/20 text-white"
//                       : "bg-emerald-100 text-emerald-700",
//                   )}
//                 >
//                   {item.badge}
//                 </span>
//               ) : null}
//             </Link>
//           );
//         })}
//       </nav>

//       <button
//         type="button"
//         className=" flex items-center gap-3  px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"
//       >
//         <IoSettingsOutline />
//         ការកំណត់
//       </button>

//       <button
//         type="button"
//         className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"
//       >
//         <FiLogOut />
//         ចាកចេញ
//       </button>
//     </aside>
//   );
// }
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GrAppsRounded } from "react-icons/gr";
import { FaHistory } from "react-icons/fa";
import { LuUsersRound } from "react-icons/lu";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBell } from "react-icons/fa6";
import { IoSettingsOutline } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";

import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "ផ្ទាំងព័ត៌មាន",
    icon: <GrAppsRounded />,
  },
  {
    href: "/dashboard/review",
    label: "ប្រវត្តិការវាយតម្លៃអាហារ",
    icon: <FaHistory />,
  },
  {
    href: "/dashboard/family-profile",
    label: "គណនីសមាជិកគ្រួសារ",
    icon: <LuUsersRound />,
  },
  {
    href: "/dashboard/favorites",
    label: "ចំណូលចិត្ត",
    icon: <FaRegHeart />,
  },
  {
    href: "/dashboard/notifications",
    label: "ការជូនដំណឹង",
    icon: <FaRegBell />,
    badge: 2,
  },
];

export default function Aside() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white px-3 py-4">
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
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