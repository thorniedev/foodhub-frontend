"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  IoFastFoodOutline,
  IoLocationOutline,
  IoStorefrontOutline,
} from "react-icons/io5";

export type FoodPageTab = "food" | "location" | "store";

const TABS: {
  id: FoodPageTab;
  label: string;
  href: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "food",
    label: "ចំណីអាហារ",
    href: "/menu",
    icon: <IoFastFoodOutline className="text-[20px]" />,
  },
  {
    id: "location",
    label: "ទីតាំង",
    href: "/menu/location",
    icon: <IoLocationOutline className="text-[20px]" />,
  },
  // {
  //   id: "store",
  //   label: "ហាងអាហារ",
  //   href: "/menu/store",
  //   icon: <IoStorefrontOutline className="text-[20px]" />,
  // },
];

function getActiveTab(pathname: string): FoodPageTab {
  if (pathname.startsWith("/menu/location")) return "location";
  if (pathname.startsWith("/menu/store")) return "store";
  return "food";
}

export default function FoodNavTabs() {
  const pathname = usePathname();
  const activeTab = getActiveTab(pathname);
  
  // For the active indicator math
  const activeIndex = Math.max(0, TABS.findIndex((t) => t.id === activeTab));
  const activeTabsCount = TABS.length;

  return (
    <div
      className="relative grid bg-gray-100 dark:bg-slate-800 p-1 rounded-full ring-1 ring-black/5 dark:ring-white/10 shrink-0"
      style={{
        gridTemplateColumns: `repeat(${activeTabsCount}, minmax(0, 1fr))`,
      }}
    >
      {/* CSS-only Sliding Indicator */}
      <div
        className="absolute left-1 top-1 bottom-1 rounded-full bg-primary-800 dark:bg-emerald-500 shadow-sm transition-transform duration-300 ease-out"
        style={{
          width: `calc((100% - 8px) / ${activeTabsCount})`,
          transform: `translateX(calc(${activeIndex * 100}%))`,
        }}
      />

      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`relative z-10 flex cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-2 text-[15px] font-semibold transition-colors duration-300 ${
              isActive
                ? "text-white"
                : "text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <span className="flex-shrink-0">{tab.icon}</span>
            <span className="mb-[1px] whitespace-nowrap">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
