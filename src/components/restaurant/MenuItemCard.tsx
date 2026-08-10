"use client";

import { MenuItem } from "@/types/restaurant";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import { PiClockBold } from "react-icons/pi";

type Props = {
  item: MenuItem;
};

/** A single dish card inside a menu section — mirrors FoodCardComponent's
 *  visual language (rounded-[24px], primary/secondary/accent tokens) so
 *  it looks native next to the rest of the app rather than bolted on. */
export default function MenuItemCard({ item }: Props) {
  const hasDiscount =
    item.originalPrice !== undefined && item.originalPrice > item.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - item.price / item.originalPrice!) * 100)
    : null;

  return (
    <div className="flex w-full flex-col gap-3 rounded-[24px] border border-gray-100 bg-white p-2.5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative">
        <Image
          src={item.image}
          alt={item.name}
          width={285}
          height={190}
          className="h-40 w-full rounded-[14px] object-cover sm:h-44"
        />
        {discountPercent !== null && (
          <span className="absolute left-2 top-2 rounded-full bg-secondary-500 px-2.5 py-1 text-xs font-bold text-white">
            -{discountPercent}%
          </span>
        )}
        {item.isHalal && (
          <span className="absolute right-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-primary-800 dark:text-primary-dark">
            Halal
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 px-1 pb-1">
        <p className="line-clamp-1 text-base font-semibold text-primary-900">
          {item.name}
        </p>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1 text-accent-500">
            <FaStar />
            {item.rating}
          </span>
          <span className="flex items-center gap-1">
            <PiClockBold />
            {item.etaMinutes} min
          </span>
          <span>{item.distanceKm}km</span>
        </div>

        <div className="mt-1 flex items-center gap-2">
          <span className="text-lg font-bold text-primary-800 dark:text-primary-dark">
            ${item.price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              ${item.originalPrice!.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
