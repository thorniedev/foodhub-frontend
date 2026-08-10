"use client";

import Link from "next/link";
import Image from "next/image";

import { IoMdTime } from "react-icons/io";
import { FaStar, FaStore } from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import { CiHeart } from "react-icons/ci";
import { IoLocationOutline } from "react-icons/io5";

import type { MenuItem } from "@/types/menu-item";

type Props = {
  food: MenuItem;
  onViewMap?: (storeUuid: string) => void;
  isMapSelected?: boolean;
};

export default function FooodCard({
  food,
  onViewMap,
  isMapSelected = false,
}: Props) {
  const storeUuid = food.store?.uuid;

  return (
    <div
      className="
        flex h-full w-full flex-col gap-4
        rounded-[24px]
        border border-gray-200
        bg-white
        p-2.5
        shadow-sm
        transition
        hover:shadow-md
      "
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-[14px]">
        <Link
          href={`/food/${food.uuid}`}
          className="block"
          aria-label={`View ${food.localName}`}
        >
          <Image
            width={285}
            height={170}
            src={food.thumbnail || "/Image/default-food.png"}
            alt={food.localName || food.name || "Food"}
            draggable={false}
            className="
              h-full
              w-full
              rounded-[14px]
              object-cover
              transition-transform
              duration-300
              hover:scale-[1.02]
            "
          />
        </Link>

        {/* Favorite */}
        <button
          type="button"
          aria-label="Save food"
          className="
            absolute
            right-2
            top-2
            z-10
            rounded-full
            transition
            active:scale-95
          "
        >
          <CiHeart
            className="
              rounded-full
              bg-primary-800
              p-2
              text-4xl
              text-white
            "
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2">
        {/* Store */}
        <div className="flex items-center gap-2 text-secondary-400">
          <FaStore />

          <p className="text-sm">{food.store?.localName || food.store?.localName}</p>
        </div>

        {/* Name + Price */}
        <Link href={`/food/${food.uuid}`} className="group">
          <div className="flex items-center justify-between gap-2">
            <p
              className="
                line-clamp-1
                text-[24px]
                font-medium
                text-primary-900
                transition
                group-hover:text-primary-700
              "
            >
              {food.localName || food.name}
            </p>

            <p className="shrink-0 text-[24px] font-medium text-primary-800 dark:text-primary-dark">
              ${food.price}
            </p>
          </div>
        </Link>

        {/* Rating / Time / Distance */}
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <div className="flex items-center gap-2 text-accent-400">
            <FaStar />
            <span>{food.store?.averageRating ?? 0}</span>
          </div>

          <div className="flex items-center gap-2 text-primary-400">
            <IoMdTime />
            <span>{food.preparationTimeMinutes} min</span>
          </div>

          {food.distanceKm !== undefined && (
            <div className="flex items-center gap-2 text-primary-400">
              <MdDeliveryDining className="text-xl" />
              <span>{food.distanceKm} km</span>
            </div>
          )}
        </div>

        {/* Dietary tags */}
        {food.dietaryTypes && food.dietaryTypes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {food.dietaryTypes.map((diet) => (
              <span
                key={diet.code}
                className="
                  rounded-full
                  bg-primary-800
                  px-3
                  py-1
                  text-sm
                  text-gray-100
                "
              >
                {diet.name}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-2">
          <Link
            href={`/food/${food.uuid}`}
            className="
              flex min-h-11 flex-1
              items-center
              justify-center
              rounded-xl
              border border-gray-200
              px-4
              text-[15px]
              font-medium
              text-primary-900
              transition
              hover:bg-gray-50
            "
          >
            មើលមុខម្ហូប
          </Link>

          {storeUuid && onViewMap && (
            <button
              type="button"
              onClick={() => onViewMap(storeUuid)}
              className={`
                flex min-h-11 flex-1
                items-center
                justify-center
                gap-2
                rounded-xl
                px-4
                text-[15px]
                font-semibold
                transition
                active:scale-[0.98]
                ${
                  isMapSelected
                    ? "bg-primary-800 text-white"
                    : "bg-primary-50 text-primary-900 hover:bg-primary-100"
                }
              `}
            >
              <IoLocationOutline className="shrink-0 text-[19px]" />

              <span className="line-clamp-1">
                {isMapSelected ? "កំពុងបង្ហាញ" : "មើលលើផែនទី"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
