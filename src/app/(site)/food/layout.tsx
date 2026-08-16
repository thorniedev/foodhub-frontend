"use client";

import FoodNavTabs from "@/components/food-page/FoodNavTabs";

export default function FoodLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[#fafaf8] dark:bg-black">
      <div className="pt-15" />

      {/* NAV TABS */}
      <div className="sticky top-16 z-30 w-full border-b border-gray-100 bg-white/85 backdrop-blur-md">
        <FoodNavTabs />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6">
        {children}
      </div>
    </div>
  );
}
