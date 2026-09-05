import {
  LuLayoutDashboard,
  LuUsers,
  LuCalendarClock,
  LuHistory,
  LuHeart,
  LuBell,
} from "react-icons/lu";
import { TbUsersGroup } from "react-icons/tb";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "ផ្ទាំងព័ត៌មាន", icon: <LuLayoutDashboard /> },
  {
    href: "/dashboard/family-profile",
    label: "គណនីសមាជិកគ្រួសារ",
    icon: <TbUsersGroup />,
  },
  {
    href: "/dashboard/friends",
    label: "មិត្តភក្តិ",
    icon: <LuUsers />,
  },
  {
    href: "/dashboard/meetup",
    label: "ប្រវត្តិនៃការណាត់ញ៉ាំ",
    icon: <LuCalendarClock />,
  },
  {
    href: "/dashboard/history",
    label: "ប្រវត្តិដែលបានមើលអាហារ",
    icon: <LuHistory />,
  },
  { href: "/dashboard/favorites", label: "ចំណូលចិត្ត", icon: <LuHeart /> },
  {
    href: "/dashboard/notifications",
    label: "ការជូនដំណឹង",
    icon: <LuBell />,
  },
];

export function getActiveLabel(pathname: string): string {
  if (pathname.startsWith("/dashboard/settings")) {
    return "ការកំណត់";
  }

  const match = [...navItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) =>
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(item.href),
    );
  return match?.label ?? "";
}

