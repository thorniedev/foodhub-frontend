"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { motion } from "framer-motion";

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
    icon: <IoFastFoodOutline className="text-[23px]" />,
  },
  {
    id: "location",
    label: "ទីតាំង",
    href: "/menu/location",
    icon: <IoLocationOutline className="text-[23px]" />,
  },
  // {
  //   id: "store",
  //   label: "ហាងអាហារ",
  //   href: "/menu/store",
  //   icon: <IoStorefrontOutline className="text-[23px]" />,
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

  return (
    <nav className="mx-auto flex w-full max-w-7xl px-4 py-2 sm:px-6">
      <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`relative flex shrink-0 cursor-pointer items-center gap-2.5 rounded-full px-5 py-1.5 text-[16px] font-semibold transition-colors ${
                isActive
                  ? "text-white"
                  : "text-primary-800 dark:text-primary-dark hover:bg-primary-50"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="food-page-active-tab"
                  className="absolute inset-0 rounded-full bg-primary-800 shadow-md"
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 32,
                  }}
                />
              )}

              <span className="relative z-10">{tab.icon}</span>

              <span className="relative z-10">{tab.label}</span>
            </Link>
          );
        })}
      </div>
      {/* <FoodSearch menuItems={[]} value={""} onChange={function (value: string): void {
        throw new Error("Function not implemented.");
      } } /> */}
    </nav>
  );
}
