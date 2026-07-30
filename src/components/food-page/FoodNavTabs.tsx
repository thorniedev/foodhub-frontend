"use client";

import { motion } from "framer-motion";

import {
  IoFastFoodOutline,
  IoLocationOutline,
  IoStorefrontOutline,
} from "react-icons/io5";

export type FoodPageTab =
  | "food"
  | "location"
  | "store";

type FoodNavTabsProps = {
  activeTab: FoodPageTab;
  onTabChange: (
    tab: FoodPageTab,
  ) => void;
};

const TABS: {
  id: FoodPageTab;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "food",
    label: "ចំណីអាហារ",
    icon: (
      <IoFastFoodOutline className="text-[23px]" />
    ),
  },
  {
    id: "location",
    label: "ទីតាំង",
    icon: (
      <IoLocationOutline className="text-[23px]" />
    ),
  },
  {
    id: "store",
    label: "ហាងអាហារ",
    icon: (
      <IoStorefrontOutline className="text-[23px]" />
    ),
  },
];

export default function FoodNavTabs({
  activeTab,
  onTabChange,
}: FoodNavTabsProps) {
  return (
    <nav className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
      <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive =
            activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                onTabChange(tab.id)
              }
              className={`relative flex shrink-0 cursor-pointer items-center gap-2.5 rounded-full px-5 py-3 text-[16px] font-semibold transition-colors ${
                isActive
                  ? "text-white"
                  : "text-primary-800 hover:bg-primary-50"
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

              <span className="relative z-10">
                {tab.icon}
              </span>

              <span className="relative z-10">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}