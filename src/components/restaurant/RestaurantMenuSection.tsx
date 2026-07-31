// import Link from "next/link";
// import { PiArrowRightBold } from "react-icons/pi";
// import { CategoryIcon } from "./categoryIcons";
// import MenuItemCard from "./MenuItemCard";
// import { RestaurantMenuCategory } from "@/types/restaurant";

// type Props = {
//   category: RestaurantMenuCategory;
// };

// /** One "អាហារពេលព្រឹក / កាហ្វេ និង តែ / ..." section. The `id` here is the
//  *  scroll target that RestaurantCategorySidebar links + observes. */
// export default function RestaurantMenuSection({ category }: Props) {
//   if (category.items.length === 0) return null;

//   return (
//     <section
//       id={`menu-${category.key}`}
//       className="scroll-mt-28 border-t border-gray-100 pt-8 first:border-t-0 first:pt-0"
//     >
//       <div className="mb-5 flex items-center justify-between">
//         <h2 className="flex items-center gap-2 text-xl font-bold text-primary-900 sm:text-2xl">
//           <CategoryIcon icon={category.icon} className="text-primary-700" />
//           {category.label}
//         </h2>
//         <Link
//           href="#"
//           className="flex shrink-0 items-center gap-1 text-sm font-medium text-secondary-500 hover:underline"
//         >
//           មើលទាំងអស់
//           <PiArrowRightBold />
//         </Link>
//       </div>

//       <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
//         {category.items.map((item) => (
//           <MenuItemCard key={item.id} item={item} />
//         ))}
//       </div>
//     </section>
//   );
// }

"use client";

import Link from "next/link";
import { useRef } from "react";
import { PiArrowRightBold } from "react-icons/pi";
import { FaChevronRight } from "react-icons/fa";
import { CategoryIcon } from "./categoryIcons";
import MenuItemCard from "./MenuItemCard";
import { RestaurantMenuCategory } from "@/types/restaurant";

type Props = {
  category: RestaurantMenuCategory;
};

/** One "អាហារពេញនិយម / កាហ្វេ និង តែ / ..." section. Cards lay out in a
 *  single horizontal, swipeable row (like the reference design) with a green
 *  arrow button that scrolls the row forward. The `id` is the scroll target
 *  that RestaurantCategorySidebar links + observes. */
export default function RestaurantMenuSection({ category }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);

  if (category.items.length === 0) return null;

  const scrollForward = () => {
    // Scroll by roughly one card width so the next item snaps into view.
    rowRef.current?.scrollBy({ left: 260, behavior: "smooth" });
  };

  return (
    <section
      id={`menu-${category.key}`}
      className="scroll-mt-28 border-t border-gray-100 pt-8 first:border-t-0 first:pt-0"
    >
      <div className="mb-4 flex items-center justify-between">
        {/* Image shows an orange title. `orange-500` is a plain Tailwind color;
            swap it for your own brand-orange token if you have one. */}
        <h2 className="flex items-center gap-2 text-xl font-bold text-orange-500 sm:text-2xl">
          <CategoryIcon icon={category.icon} className="text-orange-500" />
          {category.label}
        </h2>
        <Link
          href="#"
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-secondary-500 hover:underline"
        >
          មើលទាំងអស់
          <PiArrowRightBold />
        </Link>
      </div>

      {/* Horizontal card row + forward arrow */}
      <div className="relative">
        <div
          ref={rowRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-1 pb-2 pr-10 no-scrollbar"
        >
          {category.items.map((item) => (
            <div
              key={item.id}
              className="w-[210px] shrink-0 snap-start sm:w-[230px]"
            >
              <MenuItemCard item={item} />
            </div>
          ))}
        </div>

        {/* Forward scroll arrow (hidden if a single row already fits) */}
        {category.items.length > 2 && (
          <button
            type="button"
            aria-label="មើលបន្ថែម"
            onClick={scrollForward}
            className="absolute right-0 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-primary-700 text-white shadow-md transition hover:bg-primary-800 sm:flex cursor-pointer"
          >
            <FaChevronRight />
          </button>
        )}
      </div>
    </section>
  );
}

