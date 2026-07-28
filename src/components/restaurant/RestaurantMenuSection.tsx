import Link from "next/link";
import { PiArrowRightBold } from "react-icons/pi";
import { CategoryIcon } from "./categoryIcons";
import MenuItemCard from "./MenuItemCard";
import { RestaurantMenuCategory } from "@/types/restaurant";

type Props = {
  category: RestaurantMenuCategory;
};

/** One "អាហារពេលព្រឹក / កាហ្វេ និង តែ / ..." section. The `id` here is the
 *  scroll target that RestaurantCategorySidebar links + observes. */
export default function RestaurantMenuSection({ category }: Props) {
  if (category.items.length === 0) return null;

  return (
    <section
      id={`menu-${category.key}`}
      className="scroll-mt-28 border-t border-gray-100 pt-8 first:border-t-0 first:pt-0"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-primary-900 sm:text-2xl">
          <CategoryIcon icon={category.icon} className="text-primary-700" />
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {category.items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
