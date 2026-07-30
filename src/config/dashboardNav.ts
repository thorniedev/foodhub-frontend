import type { ReactNode } from "react";
import {
  LayoutGrid,
  History,
  Users,
  Heart,
  Bell,
  Settings,
} from "lucide-react";
import { createElement } from "react";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

export const dashboardNavItems: DashboardNavItem[] = [
  {
    href: "/dashboard",
    label: "ផ្ទាំងព័ត៌មាន",
    icon: createElement(LayoutGrid, { className: "h-5 w-5" }),
  },
  {
    href: "/dashboard/review",
    label: "ប្រវត្តិការវាយតម្លៃអាហារ",
    icon: createElement(History, { className: "h-5 w-5" }),
  },
  {
    href: "/dashboard/family-profile",
    label: "គណនីសមាជិកគ្រួសារ",
    icon: createElement(Users, { className: "h-5 w-5" }),
  },
  {
    href: "/dashboard/favorites",
    label: "ចំណូលចិត្ត",
    icon: createElement(Heart, { className: "h-5 w-5" }),
  },
  {
    href: "/dashboard/notifications",
    label: "ការជូនដំណឹង",
    icon: createElement(Bell, { className: "h-5 w-5" }),
    badge: 2,
  },
  {
    href: "/dashboard/settings",
    label: "ការកំណត់",
    icon: createElement(Settings, { className: "h-5 w-5" }),
    badge: 2,
  },
];
