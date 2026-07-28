// "use client";

// import { FoodItem } from "@/types/food";
// import { motion } from "framer-motion";
// import Image from "next/image";
// import { CiHeart } from "react-icons/ci";
// import { FaStore, FaStar } from "react-icons/fa";
// import { IoMdTime } from "react-icons/io";
// import { MdDeliveryDining } from "react-icons/md";


// type Props = {
//   food: FoodItem;
// };

// export default function FoodCardComponent({ food }: Props) {
//   const { image, name, store, price, rating, time, distance, tags } = food;

//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, y: 16 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -16 }}
//       transition={{ duration: 0.3 }}
//       className="flex flex-col w-fit gap-4 bg-white border border-gray-100 shadow-sm rounded-[24px] p-2.5"
//     >
//       <div className="relative">
//         <Image
//           width={285}
//           height={370}
//           src={image}
//           alt={name}
//           className="rounded-[14px] md:w-67.5  md:h-37.5 lg:h-46.25 lg:w-71.25 object-cover"
//         />

//         <button className="absolute top-2 right-2">
//           <CiHeart className="text-4xl p-2 bg-primary-800 rounded-full text-white" />
//         </button>
//       </div>

//       <div className="flex flex-col gap-2">
//         <div className="flex items-center gap-2 text-secondary-400">
//           <FaStore />
//           <p>{store}</p>
//         </div>

//         <div className="flex justify-between items-center">
//           <p className="text-[24px] font-medium text-primary-900 line-clamp-1">
//             {name}
//           </p>

//           <p className="text-[24px] font-medium text-primary-800">${price}</p>
//         </div>

//         <div className="flex gap-4">
//           <div className="flex items-center gap-2 text-accent-400">
//             <FaStar />
//             <span>{rating}</span>
//           </div>

//           <div className="flex items-center gap-2 text-primary-400">
//             <IoMdTime />
//             <span>{time}</span>
//           </div>

//           <div className="flex items-center gap-2 text-primary-400">
//             <MdDeliveryDining />
//             <span>{distance}</span>
//           </div>
//         </div>

//         <div className="flex gap-2 flex-wrap">
//           {tags.map((tag) => (
//             <span
//               key={tag}
//               className="bg-primary-800 text-white px-3 py-1 rounded-full text-sm"
//             >
//               {tag}
//             </span>
//           ))}
//         </div>
//       </div>
//     </motion.div>
//   );
// }
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FaStore,
  FaStar,
  FaRegClock,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import type { FoodRecommendation } from "@/types/family-profile";

interface FoodRecommendationCardProps {
  item: FoodRecommendation;
  onToggleFavorite?: (id: string) => void;
}

export default function FoodRecommendationCard({
  item,
  onToggleFavorite,
}: FoodRecommendationCardProps) {
  const [favorite, setFavorite] = useState(item.isFavorite);

  const handleFavoriteClick = () => {
    setFavorite((f) => !f);
    onToggleFavorite?.(item.id);
  };

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-44 w-full overflow-hidden">
        {/* local image from /public — `fill` needs the relative parent above */}
        <Image
          src={item.imageUrl}
          alt={item.dishName}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label="ចំណូលចិត្ត"
          aria-pressed={favorite}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-transform hover:bg-white active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          {favorite ? (
            <FaHeart className="h-4 w-4 text-emerald-600" />
          ) : (
            <FaRegHeart className="h-4 w-4 text-slate-400" />
          )}
        </button>
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-center gap-1.5 text-sm font-medium text-orange-500">
          <FaStore className="h-3.5 w-3.5" />
          {item.restaurantName}
        </div>

        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-semibold text-slate-800">
            {item.dishName}
          </h3>
          <span className="shrink-0 font-semibold text-emerald-600">
            {item.priceLabel}
          </span>
        </div>

        <p className="mt-1 line-clamp-1 text-sm text-slate-400">
          {item.description}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="flex items-center gap-1 text-amber-500">
            <FaStar className="h-3.5 w-3.5" />
            {item.rating}
          </span>
          <span className="flex items-center gap-1">
            <FaRegClock className="h-3.5 w-3.5" />
            {item.etaMinutes} min
          </span>
          <span className="flex items-center gap-1 text-emerald-600">
            <MdDeliveryDining className="h-4 w-4" />
            {item.distanceKm}km
          </span>
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
          <FaRegClock className="h-3.5 w-3.5" />
          {item.openHours}
        </p>

        <span className="mt-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          {item.badgeLabel}
        </span>
      </div>
    </div>
  );
}