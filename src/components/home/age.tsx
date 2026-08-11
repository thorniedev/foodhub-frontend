"use client";

import { motion } from "framer-motion";

type AgeGroup = {
  id: string;
  label: string;
  dishCount: number;
  icon: React.ReactNode;
};

const ageGroups: AgeGroup[] = [
  {
    id: "children",
    label: "កុមារ",
    dishCount: 236,
    icon: <BabyIcon />,
  },
  {
    id: "adults",
    label: "យុវវ័យ និងមនុស្សពេញវ័យ",
    dishCount: 496,
    icon: <AdultIcon />,
  },
  {
    id: "elderly",
    label: "មនុស្សវ័យចំណាស់",
    dishCount: 386,
    icon: <ElderlyIcon />,
  },
];

export default function MealsByAgeSection() {
  return (
    <section className="relative w-full  ">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Decorative arrow - top left */}

        {/* Heading */}
        <section className="flex flex-col items-center justify-center md:gap-12.5 max-md:gap-6 container max-w-7xl mx-auto">
          <p className="lg:text-6xl  py-2 md:text-4xl max-md:text-2xl text-center dark:text-[#22a447] font-semibold text-primary-800 dark:text-primary-dark">
            ចំណីអាហារ
            <span className="text-secondary-500">ទៅតាមវ័យ</span>
          </p>

          <p className="lg:text-[24px] md:text-[20px] text-center font-light text-gray-700 dark:text-gray-100 max-md:text-[16px]">
            ណែនាំមុខម្ហូបដែលសាកសមនឹងតម្រូវការអាហារូបត្ថម្ភ
            <br className="lg:block max-md:hidden" />
            និងរបៀបរស់នៅរបស់មនុស្សគ្រប់វ័យ ចាប់ពីកុមារ មនុស្សពេញវ័យ
            រហូតដល់មនុស្សវ័យចំណាស់
          </p>
        </section>

        {/* Cards grid */}
        <div className="mt-12 py-0.5 sm:mt-14 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {ageGroups.map((group, i) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
              whileHover={{ y: -4 }}
              className="group flex flex-col items-center text-center rounded-3xl border border-slate-200/80
                         bg-white px-6 py-10 sm:py-12 shadow-sm hover:shadow-lg
                         transition-shadow duration-300 cursor-pointer
                         sm:[&:last-child]:col-span-2 lg:[&:last-child]:col-span-1"
            >
              <div
                className="flex h-32 w-32 sm:h-36 sm:w-36 items-center justify-center rounded-full
                           bg-emerald-100/80 transition-transform duration-300
                           group-hover:scale-105"
              >
                {/* {group.icon} */}
              </div>

              <h3 className="mt-6 text-lg sm:text-xl font-bold text-primary-800 dark:text-primary-dark">
                {group.label}
              </h3>

              <p className="mt-2 text-[18px]  text-slate-500">
                ({group.dishCount} dishes)
              </p>
            </motion.div>
          ))}
        </div>

        {/* Decorative arrow - bottom right */}
      </div>
    </section>
  );
}

/* ---------------- Icons (line-art style, matching the reference) ---------------- */

function BabyIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-16 w-16 sm:h-20 sm:w-20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="32" cy="34" r="18" />
      <path d="M22 30c1.5-6 6-10 10-12" />
      <path d="M32 18c3-3 8-3 8 2" />
      <circle cx="26" cy="32" r="0.8" fill="currentColor" />
      <path d="M23 35a4 4 0 0 0 6 0" />
      <path d="M35 35a4 4 0 0 0 6 0" />
      <path d="M28 41a5 5 0 0 0 8 0" />
      <path d="M14 32c-2 0-3.5 1.5-3.5 3.5S12 39 14 39" />
      <path d="M50 32c2 0 3.5 1.5 3.5 3.5S52 39 50 39" />
    </svg>
  );
}

function AdultIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-16 w-16 sm:h-20 sm:w-20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="32" cy="20" r="9" />
      <path d="M20 22c0-4 2-9 5-11" />
      <path d="M39 22c1-3 1-8-1-11" />
      <path d="M24 15a10 10 0 0 1 16 0" />
      <circle cx="28" cy="20" r="0.8" fill="currentColor" />
      <circle cx="36" cy="20" r="0.8" fill="currentColor" />
      <path d="M28 24a6 6 0 0 0 8 0" />
      <path d="M14 52c0-9 8-16 18-16s18 7 18 16" />
      <path d="M26 36l6 6 6-6" />
    </svg>
  );
}

function ElderlyIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-16 w-16 sm:h-20 sm:w-20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="32" cy="21" r="9" />
      <path d="M23 18c0-6 4-10 9-10s9 4 9 10" />
      <path d="M23 20c3 1 15 1 18 0" />
      <rect x="25" y="22" width="6" height="3" rx="1.5" />
      <rect x="33" y="22" width="6" height="3" rx="1.5" />
      <path d="M31 23h2" />
      <path d="M28 27a6 6 0 0 0 8 0" />
      <path d="M14 52c0-9 8-16 18-16s18 7 18 16" />
      <path d="M42 40c3 2 5 6 4 10" />
    </svg>
  );
}
