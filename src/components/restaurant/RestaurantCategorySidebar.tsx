"use client";

import { useEffect, useState } from "react";
import { CategoryIcon } from "./categoryIcons";
import { RestaurantMenuCategory } from "@/types/restaurant";

type Props = {
  categories: RestaurantMenuCategory[];
};

/** The sticky "ប្រភេទ" (categories) rail from the reference design.
 *  Desktop: sticky column pinned under the sticky site navbar.
 *  Tablet/mobile: collapses into a horizontal, swipeable chip row so the
 *  page never needs a second scroll container on small screens. */
export default function RestaurantCategorySidebar({ categories }: Props) {
  const [activeKey, setActiveKey] = useState(categories[0]?.key);

  // Highlight whichever menu section is currently most visible.
  useEffect(() => {
    const sections = categories
      .map((c) => document.getElementById(`menu-${c.key}`))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveKey(visible.target.id.replace("menu-", ""));
        }
      },
      { rootMargin: "-140px 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [categories]);

  const handleClick = (key: string) => {
    setActiveKey(key);
    document
      .getElementById(`menu-${key}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Desktop / tablet-landscape: sticky vertical rail */}
      <nav
        aria-label="ប្រភេទម្ហូប"
        className="hidden lg:block sticky top-24 h-max w-56 shrink-0 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm"
      >
        <h2 className="px-2 pb-3 text-lg font-bold text-primary-900">
          ប្រភេទ
        </h2>
        <ul className="flex flex-col gap-1">
          {categories.map((category) => {
            const active = category.key === activeKey;
            return (
              <li key={category.key}>
                <button
                  type="button"
                  onClick={() => handleClick(category.key)}
                  aria-current={active}
                  className={`flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition-colors cursor-pointer ${
                    active
                      ? "bg-primary-800 text-white"
                      : "text-gray-600 hover:bg-primary-50 hover:text-primary-800"
                  }`}
                >
                  <CategoryIcon
                    icon={category.icon}
                    className={`text-base shrink-0 ${active ? "text-white" : "text-primary-700"}`}
                  />
                  <span className="line-clamp-1">{category.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile / tablet-portrait: horizontal chip row */}
      <nav
        aria-label="ប្រភេទម្ហូប"
        className="lg:hidden -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar"
      >
        {categories.map((category) => {
          const active = category.key === activeKey;
          return (
            <button
              key={category.key}
              type="button"
              onClick={() => handleClick(category.key)}
              aria-current={active}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
                active
                  ? "border-primary-800 bg-primary-800 text-white"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              <CategoryIcon icon={category.icon} className="text-sm" />
              {category.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}
