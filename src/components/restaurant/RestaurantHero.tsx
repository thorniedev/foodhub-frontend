// "use client";

// import Image from "next/image";
// import { useEffect, useState } from "react";
// import { FaBookmark, FaStar } from "react-icons/fa";
// import { PiClockBold } from "react-icons/pi";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   type CarouselApi,
// } from "@/components/ui/carousel";
// import { RestaurantDetail } from "@/types/restaurant";

// type Props = {
//   restaurant: RestaurantDetail;
// };

// /** The red "Lucky Express" brand card + rotating dish photos from the
//  *  reference design, rebuilt as two panels inside one rounded card:
//  *   - left: brand identity + live status + rating (fixed, on brandColor)
//  *   - right: swipeable photo carousel with dot pagination
//  *  Stacks to a single column on mobile. */
// export default function RestaurantHero({ restaurant }: Props) {
//   const [api, setApi] = useState<CarouselApi>();
//   const [selected, setSelected] = useState(0);

//   useEffect(() => {
//     if (!api) return;
//     const onSelect = () => setSelected(api.selectedScrollSnap());
//     onSelect();
//     api.on("select", onSelect);
//     return () => {
//       api.off("select", onSelect);
//     };
//   }, [api]);

//   return (
//     <div
//       className="relative overflow-hidden bg-red-600 lg:w-285 lg:h-50 rounded-[32px] shadow-lg"
//       // style={{ backgroundColor: restaurant.brandColor }}
//     >
//       {/* <div className="grid lg:grid-cols-[minmax(0,1.1fr w-full)_minmax(0,1.4fr)]"> */}
//       <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] min-w-0">
//         {/* Brand panel */}
//         <div className="min-w-0 flex flex-col justify-between gap-6 p-6 lg:p-8 text-white">
//           <div className="flex items-start justify-between gap-4">
//             <div className="flex items-center gap-3">
//               {/* <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-red-600 sm:h-14 sm:w-14">
//                  <Image
//                   src={restaurant.logo}
//                   alt={`${restaurant.name} logo`}
//                   fill
//                   sizes="56px"
//                   className="object-contain p-1.5"
//                 /> 
//               </div> */}
//               {/* <div>
//                 <p className="text-2xl font-bold leading-tight sm:text-3xl">
//                   {restaurant.name}
//                 </p>
//                 <p className="mt-1 text-sm text-white/80 line-clamp-2">
//                   {restaurant.tagline}
//                 </p>
//               </div> */}
//               <div className="flex flex-1 flex-col items-center justify-center text-center min-w-0">
//                 <p className="truncate text-2xl font-bold sm:text-3xl">
//                   {restaurant.name}{/*  text center */}
//                 </p>
//                 <p className="mt-2 text-sm text-white/80">
//                   {restaurant.tagline} {/*  text center */}
//                 </p>
//               </div>
//             </div>

//             <button
//               type="button"
//               aria-label="រក្សាទុកហាងនេះ"
//               className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 cursor-pointer"
//             >
//               <FaBookmark />
//             </button>
//           </div>

//           <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
//             <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
//               <FaStar className="text-accent-400" />
//               {restaurant.rating.toFixed(1)}
//               <span className="text-white/70">({restaurant.reviewCount})</span>
//             </span>
//             <span className="flex items-center gap-1.5">
//               <PiClockBold />
//               {restaurant.etaMinutes} min · {restaurant.distanceKm}km
//             </span>
//             <span
//               className={`rounded-full px-3 py-1 text-xs font-semibold ${
//                 restaurant.isOpen
//                   ? "bg-white text-primary-800 dark:text-primary-dark"
//                   : "bg-black/25 text-white"
//               }`}
//             >
//               {restaurant.isOpen
//                 ? "កំពុងបើក"
//                 : `បិទ · បើកម្ដងទៀត ${restaurant.openingHours.opensAt}`}
//             </span>
//           </div>
//         </div>

//         {/* Photo carousel panel */}
//         {/* <div className="relative min-w-0 min-h-[220px] lg:min-h-[320px]"> */}
//         <div className="relative min-w-0 min-h-[220px] sm:min-h-[280px] lg:min-h-[360px]">
//           <Carousel setApi={setApi} opts={{ loop: true }} className="h-full">
//             <CarouselContent className="h-full ml-0">
//               {restaurant.heroSlides.map((slide) => (
//                 <CarouselItem
//                   key={slide.id}
//                   className="relative h-[220px] pl-0 sm:h-[280px] lg:h-[360px]"
//                 >
//                   {/* <Image
//                     src={slide.image}
//                     alt={slide.alt}
//                     fill
//                     priority
//                     sizes="(max-width: 768px) 100vw, 55vw"
//                     className="object-cover"
//                   /> */}
//                 </CarouselItem>
//               ))}
//             </CarouselContent>
//           </Carousel>

//           {restaurant.heroSlides.length > 1 && (
//             <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
//               {restaurant.heroSlides.map((slide, i) => (
//                 <span
//                   key={slide.id}
//                   className={`h-1.5 rounded-full transition-all ${
//                     i === selected ? "w-5 bg-white" : "w-1.5 bg-white/50"
//                   }`}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
 
import { FaBookmark, FaStar } from "react-icons/fa";
import { PiClockBold } from "react-icons/pi";
import { RestaurantDetail } from "@/types/restaurant";
 
type Props = {
  restaurant: RestaurantDetail;
};
 
/** Wide red brand banner ("Lucky Express" in the reference design).
 *  Full-width rounded card: a thin white arch frame, the brand name +
 *  tagline centered, a bookmark button top-right, and a small meta strip
 *  (rating · eta · distance · open status) along the bottom so none of the
 *  useful info is lost. Stacks cleanly on mobile. */
export default function RestaurantHero({ restaurant }: Props) {
  return (
    <div
      className="relative h-52 w-full overflow-hidden rounded-[32px] bg-red-600 shadow-lg sm:h-56"
      // style={{ backgroundColor: restaurant.brandColor }}
    >
      {/* Decorative white arch frame */}
      <div className="pointer-events-none absolute inset-x-8 top-10 bottom-16 rounded-t-[50px] border-5 border-white/70 sm:inset-x-85" />
 
      {/* Bookmark
      <button
        type="button"
        aria-label="រក្សាទុកហាងនេះ"
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 cursor-pointer"
      >
        <FaBookmark />
      </button>
  */}
      {/* Brand identity, centered */}
      <div className="flex h-full flex-col items-center justify-center px-6 text-center text-white">
        <p className="truncate text-3xl font-bold leading-tight sm:text-4xl">
          {restaurant.name}
        </p>
        {restaurant.tagline && (
          <p className="mt-2 text-sm tracking-[0.35em] text-white/85 uppercase">
            {restaurant.tagline}
          </p>
        )}
      </div>
 
      {/* Meta strip
      <div className="absolute inset-x-5 bottom-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-white sm:inset-x-8">
        <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1">
          <FaStar className="text-accent-400" />
          {restaurant.rating.toFixed(1)}
          <span className="text-white/70">({restaurant.reviewCount})</span>
        </span>
        <span className="flex items-center gap-1.5">
          <PiClockBold />
          {restaurant.etaMinutes} min · {restaurant.distanceKm}km
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            restaurant.isOpen
              ? "bg-white text-primary-800 dark:text-primary-dark"
              : "bg-black/25 text-white"
          }`}
        >
          {restaurant.isOpen
            ? "កំពុងបើក"
            : `បិទ · បើកម្ដងទៀត ${restaurant.openingHours.opensAt}`}
        </span>
      </div> */}
    </div>
  );
}

