import { GrAppsRounded } from "react-icons/gr";
import { FaHistory } from "react-icons/fa";
import { LuUsersRound } from "react-icons/lu";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBell } from "react-icons/fa6";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "ផ្ទាំងព័ត៌មាន", icon: <GrAppsRounded /> },
  {
    href: "/dashboard/family-profile",
    label: "គណនីសមាជិកគ្រួសារ",
    icon: <LuUsersRound />,
  },
  {
    href: "/dashboard/friends",
    label: "មិត្តភក្តិ",
    icon: <LuUsersRound />,
  },
  {
    href: "/dashboard/meetup",
    label: "ប្រវត្តិនៃការណាត់ញ៉ាំ (Meetup)",
    icon: <FaHistory />,
  },
  {
    href: "/dashboard/history",
    label: "ប្រវត្តិដែលបានមើលអាហារ",
    icon: <FaHistory />,
  },
  { href: "/dashboard/favorites", label: "ចំណូលចិត្ត", icon: <FaRegHeart /> },
  {
    href: "/dashboard/notifications",
    label: "ការជូនដំណឹង",
    icon: <FaRegBell />,
  },
];

// Finds the label for the current route. Longest matching href wins,
// so /dashboard/review beats /dashboard.
export function getActiveLabel(pathname: string): string {
  const match = [...navItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) =>
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(item.href),
    );
  return match?.label ?? "";
}
