// "use client";

// import { useEffect, useMemo, useState, type ReactNode } from "react";

// import Link from "next/link";
// import { useRouter } from "next/navigation";

// import { AnimatePresence, motion } from "framer-motion";

// import {
//   FaArrowLeft,
//   FaCheckCircle,
//   FaMapMarkerAlt,
//   FaRegHeart,
//   FaShareAlt,
//   FaStar,
//   FaStore,
// } from "react-icons/fa";

// import { IoMdTime } from "react-icons/io";

// import {
//   IoAlertCircleOutline,
//   IoChevronForward,
//   IoNutritionOutline,
//   IoRefresh,
//   IoRestaurantOutline,
// } from "react-icons/io5";

// import { MdDeliveryDining, MdOutlineInventory2 } from "react-icons/md";
// import { TbFlame } from "react-icons/tb";

// import {
//   useGetMenuItemByUuidQuery,
//   useGetMenuItemsQuery,
// } from "@/app/store/menuApi";

// import { DEFAULT_FOOD_IMAGE, toFrontendApiAssetUrl } from "@/lib/catalog-media";

// import type {
//   CatalogMenuItem,
//   CatalogRecommendationScoreBreakdown,
// } from "@/types/catalog-menu-item";

// import FoodCard from "../dynamic-card/FoodCard";

// type FoodDetailPageProps = {
//   uuid: string;
// };

// type ScoreBarProps = {
//   label: string;
//   value: number;
// };

// type ApiImageProps = {
//   src: string | null | undefined;
//   alt: string;
//   className?: string;
// };

// function isFiniteNumber(value: unknown): value is number {
//   return typeof value === "number" && Number.isFinite(value);
// }

// function formatPrice(value: number, currencyCode: string) {
//   try {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: currencyCode || "USD",
//       minimumFractionDigits: 2,
//     }).format(value);
//   } catch {
//     return `$${value.toFixed(2)}`;
//   }
// }

// function formatDistance(value: number | null) {
//   if (!isFiniteNumber(value)) {
//     return "N/A";
//   }

//   return `${value.toFixed(1)} km`;
// }

// function getSpiceLabel(spiceLevel: number) {
//   if (spiceLevel <= 0) {
//     return "មិនហឹរ";
//   }

//   if (spiceLevel === 1) {
//     return "ហឹរតិច";
//   }

//   if (spiceLevel === 2) {
//     return "ហឹរមធ្យម";
//   }

//   return "ហឹរខ្លាំង";
// }

// function getUnknownLabel(value: unknown, index: number) {
//   if (typeof value === "string") {
//     return value;
//   }

//   if (typeof value === "number" || typeof value === "boolean") {
//     return String(value);
//   }

//   if (typeof value === "object" && value !== null) {
//     const record = value as Record<string, unknown>;

//     const possibleLabel =
//       record.name ??
//       record.localName ??
//       record.code ??
//       record.label ??
//       record.title;

//     if (
//       typeof possibleLabel === "string" ||
//       typeof possibleLabel === "number"
//     ) {
//       return String(possibleLabel);
//     }

//     try {
//       return JSON.stringify(value);
//     } catch {
//       return `Item ${index + 1}`;
//     }
//   }

//   return `Item ${index + 1}`;
// }

// function getStoreAddress(food: CatalogMenuItem) {
//   return [food.store.addressLine, food.store.district, food.store.city]
//     .filter((value): value is string => Boolean(value?.trim()))
//     .join(", ");
// }

// function ApiImage({ src, alt, className }: ApiImageProps) {
//   const normalizedSrc = useMemo(() => toFrontendApiAssetUrl(src), [src]);

//   const [currentSrc, setCurrentSrc] = useState(normalizedSrc);

//   useEffect(() => {
//     setCurrentSrc(normalizedSrc);
//   }, [normalizedSrc]);

//   return (
//     <img
//       src={currentSrc}
//       alt={alt}
//       draggable={false}
//       onError={() => {
//         if (currentSrc !== DEFAULT_FOOD_IMAGE) {
//           setCurrentSrc(DEFAULT_FOOD_IMAGE);
//         }
//       }}
//       className={className}
//     />
//   );
// }

// function ScoreBar({ label, value }: ScoreBarProps) {
//   const percentage = Math.min(100, Math.max(0, Math.round(value * 100)));

//   return (
//     <div className="grid gap-2 sm:grid-cols-[150px_1fr_52px] sm:items-center">
//       <p className="text-base font-medium text-gray-600">{label}</p>

//       <div className="h-2.5 overflow-hidden rounded-full bg-primary-50">
//         <motion.div
//           initial={{ width: 0 }}
//           whileInView={{ width: `${percentage}%` }}
//           viewport={{ once: true }}
//           transition={{
//             duration: 0.8,
//             ease: "easeOut",
//           }}
//           className="h-full rounded-full bg-gradient-to-r from-primary-700 to-secondary-500"
//         />
//       </div>

//       <p className="text-base font-semibold text-primary-800 sm:text-right">
//         {percentage}%
//       </p>
//     </div>
//   );
// }

// function InfoPill({ children }: { children: ReactNode }) {
//   return (
//     <span className="inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-base font-medium text-primary-800">
//       {children}
//     </span>
//   );
// }

// function LoadingPage() {
//   return (
//     <main className="min-h-screen bg-[#f7f9f7]">
//       <div className="mx-auto flex min-h-[600px] max-w-7xl flex-col items-center justify-center gap-5 px-4">
//         <motion.div
//           className="h-12 w-12 rounded-full border-4 border-primary-100 border-t-primary-800"
//           animate={{ rotate: 360 }}
//           transition={{
//             duration: 0.9,
//             repeat: Infinity,
//             ease: "linear",
//           }}
//         />

//         <p className="text-base text-gray-500">កំពុងផ្ទុកព័ត៌មានម្ហូប...</p>
//       </div>
//     </main>
//   );
// }

// function ErrorPage({ onRetry }: { onRetry: () => void }) {
//   return (
//     <main className="min-h-screen bg-[#f7f9f7]">
//       <div className="mx-auto flex min-h-[600px] max-w-7xl flex-col items-center justify-center gap-5 px-4 text-center">
//         <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
//           <IoAlertCircleOutline className="text-4xl text-red-500" />
//         </div>

//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">
//             មិនអាចបង្ហាញព័ត៌មានម្ហូបបានទេ
//           </h1>

//           <p className="mt-2 text-base text-gray-500">
//             សូមពិនិត្យទិន្នន័យ និងព្យាយាមម្តងទៀត។
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={onRetry}
//           className="flex items-center gap-2 rounded-full bg-primary-800 px-6 py-3 text-base font-semibold text-white transition hover:bg-primary-700 active:scale-95"
//         >
//           <IoRefresh className="text-xl" />
//           ព្យាយាមម្តងទៀត
//         </button>
//       </div>
//     </main>
//   );
// }

// function RelatedFoodCard({ food }: { food: CatalogMenuItem }) {
//   return (
//     <motion.article
//       layout
//       whileHover={{ y: -5 }}
//       transition={{
//         type: "spring",
//         stiffness: 300,
//         damping: 22,
//       }}
//     >
//       {/*
//         FoodCard already contains its own /food/{uuid} Link.
//         Do not wrap FoodCard with a second Link.
//       */}
//       <FoodCard food={food} />
//     </motion.article>
//   );
// }

// function RecommendationScoreList({
//   scoreBreakdown,
// }: {
//   scoreBreakdown: CatalogRecommendationScoreBreakdown;
// }) {
//   const scores = [
//     {
//       label: "Meal Match",
//       value: scoreBreakdown.mealMatch,
//     },
//     {
//       label: "Cuisine Match",
//       value: scoreBreakdown.cuisineMatch,
//     },
//     {
//       label: "Budget Match",
//       value: scoreBreakdown.budgetMatch,
//     },
//     {
//       label: "Distance Match",
//       value: scoreBreakdown.distanceMatch,
//     },
//     {
//       label: "Popularity",
//       value: scoreBreakdown.popularity,
//     },
//   ].filter((item): item is { label: string; value: number } =>
//     isFiniteNumber(item.value),
//   );

//   if (scores.length === 0) {
//     return null;
//   }

//   return (
//     <div className="mt-6 space-y-4">
//       {scores.map((score) => (
//         <ScoreBar key={score.label} label={score.label} value={score.value} />
//       ))}
//     </div>
//   );
// }

// export default function FoodDetailPage({ uuid }: FoodDetailPageProps) {
//   const router = useRouter();

//   const [activeImage, setActiveImage] = useState(0);
//   const [isBookmarked, setIsBookmarked] = useState(false);

//   const {
//     data: food,
//     isLoading,
//     isFetching,
//     isError,
//     refetch,
//   } = useGetMenuItemByUuidQuery(uuid);

//   const { data: allMenuItems = [] } = useGetMenuItemsQuery();

//   const relatedFoods = useMemo(() => {
//     if (!food) {
//       return [];
//     }

//     return [...allMenuItems]
//       .filter((item) => item.uuid !== food.uuid)
//       .filter((item) => item.availabilityStatus === "AVAILABLE")
//       .sort((first, second) => {
//         let firstScore = 0;
//         let secondScore = 0;

//         if (first.food.category.code === food.food.category.code) {
//           firstScore += 3;
//         }

//         if (second.food.category.code === food.food.category.code) {
//           secondScore += 3;
//         }

//         if (first.food.cuisine.code === food.food.cuisine.code) {
//           firstScore += 2;
//         }

//         if (second.food.cuisine.code === food.food.cuisine.code) {
//           secondScore += 2;
//         }

//         if (first.isFeatured) {
//           firstScore += 0.5;
//         }

//         if (second.isFeatured) {
//           secondScore += 0.5;
//         }

//         firstScore += Math.max(0, first.store.averageRating) / 10;
//         secondScore += Math.max(0, second.store.averageRating) / 10;

//         return secondScore - firstScore;
//       })
//       .slice(0, 8);
//   }, [allMenuItems, food]);

//   const gallery = useMemo(() => {
//     if (!food) {
//       return [DEFAULT_FOOD_IMAGE];
//     }

//     const images = [food.thumbnail, ...food.gallery]
//       .filter((image): image is string => Boolean(image?.trim()))
//       .map((image) => toFrontendApiAssetUrl(image));

//     const uniqueImages = Array.from(new Set(images));

//     return uniqueImages.length > 0 ? uniqueImages : [DEFAULT_FOOD_IMAGE];
//   }, [food]);

//   useEffect(() => {
//     setActiveImage(0);
//   }, [uuid]);

//   if (isLoading || isFetching) {
//     return <LoadingPage />;
//   }

//   if (isError) {
//     return <ErrorPage onRetry={refetch} />;
//   }

//   if (!food) {
//     return (
//       <main className="min-h-screen bg-[#f7f9f7]">
//         <div className="mx-auto flex min-h-[600px] max-w-7xl flex-col items-center justify-center gap-4 px-4 text-center">
//           <h1 className="text-3xl font-semibold text-primary-900">
//             រកមិនឃើញមុខម្ហូប
//           </h1>

//           <p className="text-base text-gray-500">
//             មុខម្ហូបដែលអ្នកកំពុងស្វែងរកប្រហែលជាមិនមាន។
//           </p>

//           <Link
//             href="/"
//             className="rounded-full bg-primary-800 px-6 py-3 text-base font-semibold text-white"
//           >
//             ត្រឡប់ទៅទំព័រដើម
//           </Link>
//         </div>
//       </main>
//     );
//   }

//   const displayName =
//     food.localName?.trim() || food.name?.trim() || "Unnamed food";

//   const storeDisplayName =
//     food.store.localName?.trim() || food.store.name?.trim() || "Unknown store";

//   const storeAddress = getStoreAddress(food);

//   const recommendation = food.recommendation;

//   const matchPercentage =
//     recommendation && isFiniteNumber(recommendation.finalScore)
//       ? Math.round(recommendation.finalScore * 100)
//       : null;

//   const locationUrl = `https://www.google.com/maps?q=${food.store.latitude},${food.store.longitude}`;

//   const pairingLabels = (food.beveragePairings ?? []).map(getUnknownLabel);
//   const allergenLabels = (food.allergenDeclarations ?? []).map(getUnknownLabel);

//   return (
//     <main className="min-h-screen bg-[#f7f9f7] pt-15">
//       <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
//         {/* Back button */}
//         <button
//           type="button"
//           onClick={() => router.back()}
//           className="mb-8 flex items-center gap-2 text-base font-semibold text-primary-800 transition hover:text-primary-600"
//         >
//           <FaArrowLeft />
//           ត្រឡប់ក្រោយ
//         </button>

//         {/* Main information */}
//         <section className="grid gap-10 lg:grid-cols-[1.12fr_0.88fr]">
//           {/* Gallery */}
//           <div className="space-y-4">
//             <AnimatePresence mode="wait">
//               <motion.div
//                 key={gallery[activeImage]}
//                 initial={{
//                   opacity: 0,
//                   scale: 0.98,
//                 }}
//                 animate={{
//                   opacity: 1,
//                   scale: 1,
//                 }}
//                 exit={{
//                   opacity: 0,
//                   scale: 0.98,
//                 }}
//                 transition={{
//                   duration: 0.25,
//                 }}
//                 className="relative aspect-[16/10] overflow-hidden rounded-[26px] bg-gray-100 shadow-sm"
//               >
//                 <ApiImage
//                   src={gallery[activeImage]}
//                   alt={displayName}
//                   className="h-full w-full object-cover"
//                 />

//                 <div className="absolute left-4 top-4 flex flex-wrap gap-2">
//                   {food.isFeatured && (
//                     <span className="rounded-full bg-secondary-500 px-4 py-2 text-base font-semibold text-white shadow-md">
//                       មុខម្ហូបពេញនិយម
//                     </span>
//                   )}

//                   {matchPercentage !== null && (
//                     <span className="rounded-full bg-primary-800/95 px-4 py-2 text-base font-semibold text-white shadow-md">
//                       {matchPercentage}% Match
//                     </span>
//                   )}
//                 </div>
//               </motion.div>
//             </AnimatePresence>

//             {gallery.length > 1 && (
//               <div className="grid grid-cols-3 gap-4">
//                 {gallery.slice(0, 3).map((image, index) => (
//                   <button
//                     key={`${image}-${index}`}
//                     type="button"
//                     onClick={() => setActiveImage(index)}
//                     className={`relative aspect-[4/3] overflow-hidden rounded-[20px] border-2 transition ${
//                       activeImage === index
//                         ? "border-primary-700 ring-1 ring-primary-600"
//                         : "border-transparent hover:border-primary-300"
//                     }`}
//                   >
//                     <ApiImage
//                       src={image}
//                       alt={`${displayName} image ${index + 1}`}
//                       className="h-full w-full object-cover"
//                     />
//                   </button>
//                 ))}
//               </div>
//             )}
//             <div className="mt-auto grid gap-3 pt-7 sm:grid-cols-2">
//               <button
//                 type="button"
//                 onClick={() => setIsBookmarked((previous) => !previous)}
//                 className={`flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold transition active:scale-95 ${
//                   isBookmarked
//                     ? "bg-secondary-500 text-white"
//                     : "bg-primary-800 text-white hover:bg-primary-700"
//                 }`}
//               >
//                 <FaRegHeart />

//                 {isBookmarked ? "បានរក្សាទុក" : "រក្សាទុកមុខម្ហូប"}
//               </button>

//               <a
//                 href={locationUrl}
//                 target="_blank"
//                 rel="noreferrer"
//                 className="flex items-center justify-center gap-2 rounded-full bg-secondary-500 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-secondary-400 active:scale-95"
//               >
//                 <FaMapMarkerAlt />
//                 មើលទីតាំង
//               </a>
//             </div>
//           </div>

//           {/* Food overview */}
//           <div className="flex flex-col">
//             <div className="flex items-center justify-between">
//               <p className="text-3xl text-primary-800 font-bold leading-tight  sm:text-4xl">
//                 {displayName}
//               </p>
//               <div className=" flex justify-center">
//                 <button
//                   type="button"
//                   onClick={async () => {
//                     const shareData = {
//                       title: displayName,
//                       text:
//                         food.localDescription ??
//                         food.description ??
//                         displayName,
//                       url: window.location.href,
//                     };

//                     if (navigator.share) {
//                       await navigator.share(shareData);
//                       return;
//                     }

//                     await navigator.clipboard.writeText(window.location.href);
//                   }}
//                   className="flex items-center gap-2 rounded-full border border-primary-200 bg-white px-6 py-3 text-base font-semibold text-primary-800 shadow-sm transition hover:bg-primary-50 active:scale-95"
//                 >
//                   <FaShareAlt />
//                   ចែករំលែកមុខម្ហូប
//                 </button>
//               </div>
//             </div>
//             {food.localDescription && (
//               <p className="mt-6 text-base leading-8 text-gray-600">
//                 {food.localDescription}
//               </p>
//             )}

//             {food.description && (
//               <p className="mt-3 text-base leading-8 text-gray-500">
//                 {food.description}
//               </p>
//             )}

//             {/* =====================================================
//                 STORE PROFILE
//             ===================================================== */}

//             <Link
//               href={`/store/${food.store.uuid}`}
//               aria-label={`View ${storeDisplayName} store profile`}
//               className="
//                 group
//                 mt-6
//                 block
//                 overflow-hidden
//                 rounded-[24px]
//                 border
//                 border-gray-200
//                 bg-white
//                 shadow-sm
//                 transition
//                 duration-200
//                 hover:-translate-y-0.5
//                 hover:border-primary-200
//                 hover:shadow-md
//               "
//             >
//               {/* COVER */}

//               <div className="relative h-28 overflow-hidden bg-gradient-to-r from-primary-800 to-primary-600 sm:h-32">
//                 {food.store.coverImageUrl ? (
//                   <ApiImage
//                     src={food.store.coverImageUrl}
//                     alt={`${storeDisplayName} cover`}
//                     className="
//                       h-full
//                       w-full
//                       object-cover
//                       transition-transform
//                       duration-300
//                       group-hover:scale-[1.02]
//                     "
//                   />
//                 ) : (
//                   <div
//                     className="
//                       flex
//                       h-full
//                       w-full
//                       items-center
//                       justify-center
//                       bg-gradient-to-r
//                       from-primary-800
//                       via-primary-700
//                       to-secondary-500
//                     "
//                   >
//                     <FaStore className="text-5xl text-white/30" />
//                   </div>
//                 )}

//                 <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

//                 {/* STATUS */}

//                 <span
//                   className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-[14px] font-semibold shadow-sm ${
//                     food.store.operatingStatus === "OPEN"
//                       ? "bg-emerald-500 text-white"
//                       : "bg-red-500 text-white"
//                   }`}
//                 >
//                   {food.store.operatingStatus === "OPEN"
//                     ? "បើក"
//                     : "បិទ"}
//                 </span>
//               </div>

//               {/* STORE PROFILE CONTENT */}

//               <div className="relative px-4 pb-4 sm:px-5 sm:pb-5">
//                 {/* LOGO / PROFILE IMAGE */}

//                 <div
//                   className="
//                     -mt-9
//                     flex
//                     items-end
//                     justify-between
//                     gap-3
//                   "
//                 >
//                   <div
//                     className="
//                       relative
//                       flex
//                       h-[76px]
//                       w-[76px]
//                       shrink-0
//                       items-center
//                       justify-center
//                       overflow-hidden
//                       rounded-full
//                       border-4
//                       border-white
//                       bg-primary-50
//                       shadow-md
//                     "
//                   >
//                     {food.store.logoUrl ? (
//                       <ApiImage
//                         src={food.store.logoUrl}
//                         alt={`${storeDisplayName} logo`}
//                         className="h-full w-full object-cover"
//                       />
//                     ) : (
//                       <FaStore className="text-[30px] text-primary-700" />
//                     )}
//                   </div>

//                   <div
//                     className="
//                       mb-1
//                       flex
//                       items-center
//                       gap-1
//                       text-[15px]
//                       font-semibold
//                       text-primary-700
//                       transition
//                       group-hover:translate-x-1
//                     "
//                   >
//                     <span>មើលហាង</span>
//                     <IoChevronForward className="text-[18px]" />
//                   </div>
//                 </div>

//                 {/* NAME */}

//                 <div className="mt-3">
//                   <p
//                     className="
//                       line-clamp-1
//                       text-[22px]
//                       font-bold
//                       text-primary-900
//                       transition
//                       group-hover:text-primary-700
//                     "
//                   >
//                     {storeDisplayName}
//                   </p>

//                   {food.store.localName &&
//                     food.store.name &&
//                     food.store.localName.trim() !==
//                       food.store.name.trim() && (
//                       <p className="mt-0.5 line-clamp-1 text-[16px] text-gray-500">
//                         {food.store.name}
//                       </p>
//                     )}
//                 </div>

//                 {/* ADDRESS */}

//                 <div className="mt-3 flex items-start gap-2 text-[16px] leading-6 text-gray-600">
//                   <FaMapMarkerAlt className="mt-1 shrink-0 text-primary-700" />

//                   <span className="line-clamp-2">
//                     {storeAddress ||
//                       "មិនមានអាសយដ្ឋាន"}
//                   </span>
//                 </div>

//                 {/* STORE STATS */}

//                 <div
//                   className="
//                     mt-4
//                     grid
//                     grid-cols-2
//                     gap-3
//                     border-t
//                     border-gray-100
//                     pt-4
//                   "
//                 >
//                   <div
//                     className="
//                       flex
//                       items-center
//                       gap-3
//                       rounded-2xl
//                       bg-amber-50
//                       px-3
//                       py-3
//                     "
//                   >
//                     <div
//                       className="
//                         flex
//                         h-9
//                         w-9
//                         shrink-0
//                         items-center
//                         justify-center
//                         rounded-full
//                         bg-white
//                         text-amber-500
//                         shadow-sm
//                       "
//                     >
//                       <FaStar />
//                     </div>

//                     <div className="min-w-0">
//                       <p className="text-[18px] font-bold text-gray-900">
//                         {Number(
//                           food.store.averageRating ?? 0,
//                         ).toFixed(1)}
//                       </p>

//                       <p className="text-[13px] text-gray-500">
//                         ការវាយតម្លៃ
//                       </p>
//                     </div>
//                   </div>

//                   <div
//                     className="
//                       flex
//                       items-center
//                       gap-3
//                       rounded-2xl
//                       bg-primary-50
//                       px-3
//                       py-3
//                     "
//                   >
//                     <div
//                       className="
//                         flex
//                         h-9
//                         w-9
//                         shrink-0
//                         items-center
//                         justify-center
//                         rounded-full
//                         bg-white
//                         text-primary-700
//                         shadow-sm
//                       "
//                     >
//                       <FaStore />
//                     </div>

//                     <div className="min-w-0">
//                       <p className="text-[18px] font-bold text-gray-900">
//                         {food.store.totalReviews ?? 0}
//                       </p>

//                       <p className="text-[13px] text-gray-500">
//                         មតិវាយតម្លៃ
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </Link>
//             <div className="flex mt-6 flex-wrap items-start justify-between gap-4">
//               <div>
//                 <div className="flex flex-wrap gap-2">
//                   {/* <InfoPill>{food.food.category.name}</InfoPill>
//                   <InfoPill>{food.food.cuisine.name}</InfoPill> */}

//                   <InfoPill>
//                     {food.availabilityStatus === "AVAILABLE"
//                       ? "មានលក់"
//                       : "មិនមានលក់"}
//                   </InfoPill>
//                 </div>

//                 {/* {food.localName && food.name && (
//                   <p className="mt-2 text-lg text-gray-500">{food.name}</p>
//                 )} */}
//               </div>

//               <p className="text-3xl font-bold text-primary-800">
//                 {formatPrice(food.price, food.currencyCode)}
//               </p>
//             </div>
//             {/* Main stats */}
//             <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
//               <div className="rounded-[18px] border border-gray-200 bg-white p-4 text-center">
//                 <IoMdTime className="mx-auto text-2xl text-primary-700" />

//                 <p className="mt-2 text-lg font-semibold text-primary-900">
//                   {food.preparationTimeMinutes !== null
//                     ? `${food.preparationTimeMinutes} min`
//                     : "N/A"}
//                 </p>

//                 <p className="mt-1 text-base text-gray-500">ពេលរៀបចំ</p>
//               </div>

//               <div className="rounded-[18px] border border-gray-200 bg-white p-4 text-center">
//                 <MdDeliveryDining className="mx-auto text-2xl text-primary-700" />

//                 <p className="mt-2 text-lg font-semibold text-primary-900">
//                   {formatDistance(food.distanceKm)}
//                 </p>

//                 <p className="mt-1 text-base text-gray-500">ចម្ងាយ</p>
//               </div>

//               <div className="rounded-[18px] border border-gray-200 bg-white p-4 text-center">
//                 <MdOutlineInventory2 className="mx-auto text-2xl text-primary-700" />

//                 <p className="mt-2 text-lg font-semibold text-primary-900">
//                   {food.availabilityStatus === "AVAILABLE"
//                     ? "មានលក់"
//                     : "មិនមានលក់"}
//                 </p>

//                 <p className="mt-1 text-base text-gray-500">ស្ថានភាព</p>
//               </div>

//               <div className="rounded-[18px] border border-gray-200 bg-white p-4 text-center">
//                 <TbFlame className="mx-auto text-2xl text-secondary-500" />

//                 <p className="mt-2 text-lg font-semibold text-primary-900">
//                   {getSpiceLabel(food.food.spiceLevel)}
//                 </p>

//                 <p className="mt-1 text-base text-gray-500">កម្រិតហឹរ</p>
//               </div>
//             </div>

//             {/* Dietary tags */}
//             <div className="mt-6">
//               <p className="text-lg font-semibold text-primary-900">របបអាហារ</p>

//               {food.food.dietaryTypes.length > 0 ? (
//                 <div className="mt-3 flex flex-wrap gap-2">
//                   {food.food.dietaryTypes.map((dietaryType) => (
//                     <span
//                       key={dietaryType.code}
//                       className="flex items-center gap-2 rounded-full bg-primary-800 px-4 py-2 text-base text-white"
//                     >
//                       {dietaryType.verificationStatus === "VERIFIED" && (
//                         <FaCheckCircle className="text-green-300" />
//                       )}

//                       {dietaryType.name}
//                     </span>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="mt-3 text-base text-gray-500">
//                   មិនមានទិន្នន័យរបបអាហារ។
//                 </p>
//               )}
//             </div>
//             {/* Actions */}
//           </div>
//         </section>
//         <section></section>
//         {/* Recommendation and rating */}
//         <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
//           {/* AI recommendation */}
//           <article className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
//             <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-5">
//               <div>
//                 <p className="text-base font-medium text-secondary-500">
//                   FoodHub AI
//                 </p>

//                 <p className="mt-1 text-2xl font-semibold text-primary-900">
//                   កម្រិតសមស្របសម្រាប់អ្នក
//                 </p>
//               </div>

//               {matchPercentage !== null && (
//                 <div className="text-right">
//                   <p className="text-4xl font-bold text-primary-800">
//                     {matchPercentage}%
//                   </p>

//                   <p className="mt-1 text-base text-gray-500">Match Score</p>
//                 </div>
//               )}
//             </div>

//             {recommendation ? (
//               <>
//                 {recommendation.reasonText && (
//                   <p className="mt-5 text-base leading-8 text-gray-600">
//                     {recommendation.reasonText}
//                   </p>
//                 )}

//                 {recommendation.scoreBreakdown && (
//                   <RecommendationScoreList
//                     scoreBreakdown={recommendation.scoreBreakdown}
//                   />
//                 )}

//                 {recommendation.reasonCodes &&
//                   recommendation.reasonCodes.length > 0 && (
//                     <div className="mt-6 flex flex-wrap gap-2">
//                       {recommendation.reasonCodes.map((reasonCode) => (
//                         <span
//                           key={reasonCode}
//                           className="rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-base font-medium text-primary-700"
//                         >
//                           {reasonCode.replaceAll("_", " ")}
//                         </span>
//                       ))}
//                     </div>
//                   )}
//               </>
//             ) : (
//               <div className="mt-5 rounded-[18px] bg-primary-50 p-4">
//                 <p className="text-base leading-7 text-gray-600">
//                   មិនទាន់មានទិន្នន័យ recommendation សម្រាប់ request នេះទេ។ API
//                   response បច្ចុប្បន្នផ្ញើ
//                   <span className="font-semibold"> recommendation: null</span>។
//                 </p>
//               </div>
//             )}
//           </article>

//           {/* Rating card */}
//           <article className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
//             <p className="text-2xl font-semibold text-primary-900">
//               ការវាយតម្លៃភោជនីយដ្ឋាន
//             </p>

//             <div className="mt-6 flex items-center gap-6">
//               <div>
//                 <p className="text-5xl font-bold text-primary-950">
//                   {food.store.averageRating.toFixed(1)}
//                 </p>

//                 <div className="mt-2 flex gap-1 text-yellow-400">
//                   {Array.from({ length: 5 }).map((_, index) => (
//                     <FaStar key={index} />
//                   ))}
//                 </div>

//                 <p className="mt-2 text-base text-gray-500">
//                   {food.store.totalReviews} ការវាយតម្លៃ
//                 </p>
//               </div>

//               <div className="h-24 w-px bg-gray-200" />

//               <div className="flex-1 space-y-3">
//                 <div>
//                   <div className="flex justify-between text-base text-gray-500">
//                     <span>Rating</span>
//                     <span>
//                       {Math.round(
//                         Math.min(
//                           100,
//                           Math.max(0, food.store.averageRating * 20),
//                         ),
//                       )}
//                       %
//                     </span>
//                   </div>

//                   <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-gray-100">
//                     <div
//                       style={{
//                         width: `${Math.min(
//                           100,
//                           Math.max(0, food.store.averageRating * 20),
//                         )}%`,
//                       }}
//                       className="h-full rounded-full bg-primary-700"
//                     />
//                   </div>
//                 </div>

//                 <div className="rounded-[16px] bg-gray-50 p-3">
//                   <p className="text-base text-gray-500">ស្ថានភាពហាង</p>

//                   <p className="mt-1 text-lg font-semibold text-primary-900">
//                     {food.store.operatingStatus === "OPEN" ? "បើក" : "បិទ"}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </article>
//         </section>

//         {/* Food information */}
//         <section className="mt-8 grid gap-6 lg:grid-cols-3">
//           {/* Ingredients */}
//           <article className="rounded-[26px] border border-gray-200 bg-white p-6 shadow-sm">
//             <div className="flex items-center gap-3">
//               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50">
//                 <IoRestaurantOutline className="text-2xl text-primary-700" />
//               </div>

//               <p className="text-xl font-semibold text-primary-900">
//                 គ្រឿងផ្សំ
//               </p>
//             </div>

//             {food.ingredients.length > 0 ? (
//               <div className="mt-5 flex flex-wrap gap-2">
//                 {food.ingredients.map((ingredient, index) => (
//                   <span
//                     key={`${ingredient}-${index}`}
//                     className="rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-base text-gray-600"
//                   >
//                     {ingredient}
//                   </span>
//                 ))}
//               </div>
//             ) : (
//               <p className="mt-5 text-base text-gray-500">
//                 មិនមានទិន្នន័យគ្រឿងផ្សំ។
//               </p>
//             )}

//             {pairingLabels.length > 0 && (
//               <div className="mt-6 border-t border-gray-100 pt-5">
//                 <p className="text-base font-semibold text-primary-900">
//                   ភេសជ្ជៈដែលសម
//                 </p>

//                 <div className="mt-3 flex flex-wrap gap-2">
//                   {pairingLabels.map((beverage, index) => (
//                     <InfoPill key={`${beverage}-${index}`}>{beverage}</InfoPill>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </article>

//           {/* Nutrition */}
//           <article className="rounded-[26px] border border-gray-200 bg-white p-6 shadow-sm">
//             <div className="flex items-center gap-3">
//               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
//                 <IoNutritionOutline className="text-2xl text-green-700" />
//               </div>

//               <p className="text-xl font-semibold text-primary-900">
//                 តម្លៃអាហារូបត្ថម្ភ
//               </p>
//             </div>

//             <div className="mt-5 grid grid-cols-2 gap-3">
//               {[
//                 {
//                   label: "Calories",
//                   value: `${food.nutrition.calories} kcal`,
//                 },
//                 {
//                   label: "Protein",
//                   value: `${food.nutrition.proteinGrams} g`,
//                 },
//                 {
//                   label: "Carbohydrate",
//                   value: `${food.nutrition.carbsGrams} g`,
//                 },
//                 {
//                   label: "Fat",
//                   value: `${food.nutrition.fatGrams} g`,
//                 },
//               ].map((nutrition) => (
//                 <div
//                   key={nutrition.label}
//                   className="rounded-[16px] bg-primary-50 p-3"
//                 >
//                   <p className="text-base text-gray-500">{nutrition.label}</p>

//                   <p className="mt-1 text-lg font-semibold text-primary-900">
//                     {nutrition.value}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </article>

//           {/* Allergens */}
//           <article className="rounded-[26px] border border-gray-200 bg-white p-6 shadow-sm">
//             <div className="flex items-center gap-3">
//               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
//                 <IoAlertCircleOutline className="text-2xl text-orange-500" />
//               </div>

//               <p className="text-xl font-semibold text-primary-900">
//                 អាឡែស៊ី និងសុវត្ថិភាព
//               </p>
//             </div>

//             {allergenLabels.length === 0 ? (
//               <div className="mt-5 flex items-start gap-3 rounded-[18px] bg-green-50 p-4">
//                 <FaCheckCircle className="mt-1 shrink-0 text-xl text-green-600" />

//                 <p className="text-base leading-7 text-green-700">
//                   មិនមានការប្រកាសអាឡែស៊ីនៅក្នុងទិន្នន័យនេះទេ។
//                 </p>
//               </div>
//             ) : (
//               <div className="mt-5 space-y-3">
//                 {allergenLabels.map((allergen, index) => (
//                   <div
//                     key={`${allergen}-${index}`}
//                     className="rounded-[18px] border border-orange-100 bg-orange-50 p-4"
//                   >
//                     <p className="break-words text-base font-semibold text-orange-800">
//                       {allergen}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             )}

//             <div className="mt-6 border-t border-gray-100 pt-5">
//               <p className="text-base font-semibold text-primary-900">
//                 អាយុសមស្រប
//               </p>

//               {food.food.ageGroups.length > 0 ? (
//                 <div className="mt-3 flex flex-wrap gap-2">
//                   {food.food.ageGroups.map((ageGroup) => (
//                     <InfoPill key={ageGroup.code}>{ageGroup.name}</InfoPill>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="mt-3 text-base text-gray-500">
//                   មិនមានទិន្នន័យក្រុមអាយុ។
//                 </p>
//               )}
//             </div>
//           </article>
//         </section>

//         {/* Context information */}
//         <section className="mt-8 rounded-[26px] border border-gray-200 bg-white p-6 shadow-sm">
//           <div className="grid gap-6 lg:grid-cols-4">
//             <div>
//               <p className="text-base text-gray-500">ពេលអាហារ</p>

//               {food.food.mealTypes.length > 0 ? (
//                 <div className="mt-3 flex flex-wrap gap-2">
//                   {food.food.mealTypes.map((mealType) => (
//                     <InfoPill key={mealType.code}>{mealType.name}</InfoPill>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="mt-3 text-base text-gray-500">មិនមានទិន្នន័យ</p>
//               )}
//             </div>

//             <div>
//               <p className="text-base text-gray-500">ប្រភេទម្ហូប</p>

//               <p className="mt-3 text-lg font-semibold text-primary-900">
//                 {food.food.category.name}
//               </p>
//             </div>

//             <div>
//               <p className="text-base text-gray-500">Cuisine</p>

//               <p className="mt-3 text-lg font-semibold text-primary-900">
//                 {food.food.cuisine.name}
//               </p>
//             </div>

//             <div>
//               <p className="text-base text-gray-500">ប្រភពដើម</p>

//               <p className="mt-3 text-lg font-semibold text-primary-900">
//                 {food.origin.countryName}
//               </p>

//               {food.origin.isTraditional && (
//                 <span className="mt-2 inline-flex rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-800">
//                   Traditional
//                 </span>
//               )}
//             </div>
//           </div>

//           {(food.food.seasons.length > 0 ||
//             food.food.events.length > 0 ||
//             food.food.suitableWeather.length > 0) && (
//             <div className="mt-6 grid gap-6 border-t border-gray-100 pt-6 lg:grid-cols-3">
//               <div>
//                 <p className="text-base font-semibold text-primary-900">
//                   រដូវសមស្រប
//                 </p>

//                 <div className="mt-3 space-y-3">
//                   {food.food.seasons.map((season) => (
//                     <div
//                       key={season.code}
//                       className="rounded-[16px] bg-primary-50 p-3"
//                     >
//                       <p className="font-semibold text-primary-900">
//                         {season.localName || season.name}
//                       </p>

//                       {season.reasonText && (
//                         <p className="mt-1 text-sm leading-6 text-gray-600">
//                           {season.reasonText}
//                         </p>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <p className="text-base font-semibold text-primary-900">
//                   ព្រឹត្តិការណ៍
//                 </p>

//                 <div className="mt-3 space-y-3">
//                   {food.food.events.map((eventItem) => (
//                     <div
//                       key={eventItem.code}
//                       className="rounded-[16px] bg-primary-50 p-3"
//                     >
//                       <p className="font-semibold text-primary-900">
//                         {eventItem.localName || eventItem.name}
//                       </p>

//                       {eventItem.reasonText && (
//                         <p className="mt-1 text-sm leading-6 text-gray-600">
//                           {eventItem.reasonText}
//                         </p>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <p className="text-base font-semibold text-primary-900">
//                   អាកាសធាតុសមស្រប
//                 </p>

//                 <div className="mt-3 space-y-3">
//                   {food.food.suitableWeather.map((weather) => (
//                     <div
//                       key={weather.code}
//                       className="rounded-[16px] bg-primary-50 p-3"
//                     >
//                       <p className="font-semibold text-primary-900">
//                         {weather.localName || weather.name}
//                       </p>

//                       {weather.reasonText && (
//                         <p className="mt-1 text-sm leading-6 text-gray-600">
//                           {weather.reasonText}
//                         </p>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//         </section>

//         {/* Related items */}
//         {relatedFoods.length > 0 && (
//           <section className="mt-16">
//             <div className="flex flex-wrap items-end justify-between gap-4">
//               <div>
//                 <p className="text-base font-semibold text-secondary-500">
//                   អ្នកប្រហែលជាចូលចិត្ត
//                 </p>

//                 <p className="mt-2 text-3xl font-bold text-primary-900">
//                   មុខម្ហូបស្រដៀងគ្នា
//                 </p>
//               </div>

//               <Link
//                 href="/food"
//                 className="flex items-center gap-2 text-base font-semibold text-primary-800"
//               >
//                 មើលទាំងអស់
//                 <IoChevronForward />
//               </Link>
//             </div>

//             <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
//               {relatedFoods.map((relatedFood) => (
//                 <RelatedFoodCard key={relatedFood.uuid} food={relatedFood} />
//               ))}
//             </div>
//           </section>
//         )}

//         {/* Share button */}
//       </div>
//     </main>
//   );
// }

"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AnimatePresence, motion } from "framer-motion";

import {
  FaArrowLeft,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaRegHeart,
  FaShareAlt,
  FaStar,
  FaStore,
} from "react-icons/fa";

import { IoMdTime } from "react-icons/io";

import {
  IoAlertCircleOutline,
  IoChevronForward,
  IoNutritionOutline,
  IoPeopleOutline,
  IoRefresh,
  IoRestaurantOutline,
} from "react-icons/io5";

import { MdDeliveryDining, MdOutlineInventory2 } from "react-icons/md";
import { TbFlame } from "react-icons/tb";

import {
  useGetMenuItemByUuidQuery,
  useGetMenuItemsQuery,
  useGetFoodCatalogByUuidQuery,
} from "@/app/store/menuApi";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useTrackInteraction } from "@/hooks/useTrackInteraction";
import { useUserLocation } from "@/hooks/useUserLocation";
import { calculateDistanceKm, isValidCoordinates } from "@/lib/location/geo";

import { DEFAULT_FOOD_IMAGE, toFrontendApiAssetUrl } from "@/lib/catalog-media";

import type {
  CatalogMenuItem,
  CatalogRecommendationScoreBreakdown,
} from "@/types/catalog-menu-item";

import FoodCard from "../dynamic-card/FoodCard";

/* ==================================================================
   PAGE DESIGN TOKENS

   Color — 60 / 30 / 10
     60%  neutral    page #f7f9f7, white surfaces, gray-200 borders,
                     gray-600 body copy
     30%  primary    primary-900 titles, primary-800 actions,
                     primary-50 tiles, primary-100 pill borders
     10%  secondary  match badge, rating star, score-bar tip,
                     allergen cards, eyebrow labels
                     -> at most ONE secondary element per section

   Type — never below text-base, never below text-lg on lg screens.
     TEXT_BODY   text-base lg:text-lg    labels, captions, body
     TEXT_VALUE  text-lg   lg:text-xl    numbers and short values
     TEXT_TITLE  text-xl   lg:text-2xl   section titles
     page title  text-3xl  lg:text-4xl
     All titles are <p>, not headings.

   Surface — 1px border, no shadow.
   Radius  — rounded-3xl cards / rounded-2xl tiles / rounded-full pills.
   Rhythm  — sections mt-12, card padding p-6, grid gap-6.
================================================================== */

const TEXT_BODY = "text-base lg:text-lg";
const TEXT_LABEL = "text-base lg:text-lg text-gray-500";
const TEXT_VALUE = "text-lg lg:text-xl font-semibold text-primary-900";
const TEXT_TITLE = "text-xl lg:text-2xl font-semibold text-primary-900";
const TEXT_EYEBROW =
  "text-base lg:text-lg font-semibold uppercase tracking-wide text-secondary-500";

const CARD = "rounded-3xl border border-gray-200 bg-white p-6";
const TILE = "rounded-2xl bg-primary-50 p-4";
const SECTION = "mt-6";

type FoodDetailPageProps = {
  uuid: string;
};

type ScoreBarProps = {
  label: string;
  value: number;
};

type ApiImageProps = {
  src: string | null | undefined;
  alt: string;
  className?: string;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function formatPrice(value: number, currencyCode: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode || "USD",
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

function formatDistance(value: number | null | undefined) {
  if (!isFiniteNumber(value)) {
    return "N/A";
  }

  if (value < 1) {
    return `${Math.round(value * 1000)} m`;
  }

  return `${value.toFixed(1)} km`;
}

function getSpiceLabel(spiceLevel: number) {
  if (spiceLevel <= 0) {
    return "មិនហឹរ";
  }

  if (spiceLevel === 1) {
    return "ហឹរតិច";
  }

  if (spiceLevel === 2) {
    return "ហឹរមធ្យម";
  }

  return "ហឹរខ្លាំង";
}

function getUnknownLabel(value: unknown, index: number) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;

    const possibleLabel =
      record.name ??
      record.localName ??
      record.code ??
      record.label ??
      record.title;

    if (
      typeof possibleLabel === "string" ||
      typeof possibleLabel === "number"
    ) {
      return String(possibleLabel);
    }

    try {
      return JSON.stringify(value);
    } catch {
      return `Item ${index + 1}`;
    }
  }

  return `Item ${index + 1}`;
}

function getStoreAddress(food: CatalogMenuItem) {
  return [food.store.addressLine, food.store.district, food.store.city]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(", ");
}

function ApiImage({ src, alt, className }: ApiImageProps) {
  const normalizedSrc = useMemo(() => toFrontendApiAssetUrl(src), [src]);

  const [currentSrc, setCurrentSrc] = useState(normalizedSrc);

  useEffect(() => {
    setCurrentSrc(normalizedSrc);
  }, [normalizedSrc]);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
      draggable={false}
      onError={() => {
        if (currentSrc !== DEFAULT_FOOD_IMAGE) {
          setCurrentSrc(DEFAULT_FOOD_IMAGE);
        }
      }}
      className={className}
    />
  );
}

/* ---------- shared building blocks ---------- */

function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className={TEXT_EYEBROW}>{eyebrow}</p>}
        <p className={`${eyebrow ? "mt-2" : ""} ${TEXT_TITLE}`}>{title}</p>
      </div>

      {action}
    </div>
  );
}

function CardHeader({
  icon,
  title,
  tone = "primary",
}: {
  icon: ReactNode;
  title: string;
  tone?: "primary" | "secondary";
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
          tone === "secondary"
            ? "bg-secondary-50 text-secondary-500"
            : "bg-primary-50 text-primary-700"
        }`}
      >
        {icon}
      </div>

      <p className={TEXT_TITLE}>{title}</p>
    </div>
  );
}

function InfoPill({ children }: { children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-2 font-medium text-primary-800 ${TEXT_BODY}`}
    >
      {children}
    </span>
  );
}

function StatusPill({
  isOn,
  onLabel,
  offLabel,
}: {
  isOn: boolean;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-4 py-2 font-semibold ${TEXT_BODY} ${
        isOn ? "bg-primary-100 text-primary-800" : "bg-gray-100 text-gray-500"
      }`}
    >
      {isOn ? onLabel : offLabel}
    </span>
  );
}

function StatTile({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
      <div className="flex justify-center text-2xl text-primary-700">
        {icon}
      </div>

      <p className={`mt-2 ${TEXT_VALUE}`}>{value}</p>

      <p className={`mt-1 ${TEXT_LABEL}`}>{label}</p>
    </div>
  );
}

function DetailBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className={TEXT_LABEL}>{label}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ScoreBar({ label, value }: ScoreBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round(value * 100)));

  return (
    <div className="grid gap-2 sm:grid-cols-[160px_1fr_56px] sm:items-center">
      <p className={`font-medium text-gray-600 ${TEXT_BODY}`}>{label}</p>

      <div className="h-2 overflow-hidden rounded-full bg-primary-50">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-primary-700 to-secondary-500"
        />
      </div>

      <p
        className={`font-semibold text-primary-800 sm:text-right ${TEXT_BODY}`}
      >
        {percentage}%
      </p>
    </div>
  );
}

/* ---------- page states ---------- */

function LoadingPage() {
  return (
    <main className="min-h-screen bg-[#f7f9f7]">
      <div className="mx-auto flex min-h-[600px] max-w-7xl flex-col items-center justify-center gap-5 px-4">
        <motion.div
          className="h-12 w-12 rounded-full border-4 border-primary-100 border-t-primary-800"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />

        <p className={TEXT_LABEL}>កំពុងផ្ទុកព័ត៌មានម្ហូប...</p>
      </div>
    </main>
  );
}

function ErrorPage({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="min-h-screen bg-[#f7f9f7]">
      <div className="mx-auto flex min-h-[600px] max-w-7xl flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary-50">
          <IoAlertCircleOutline className="text-4xl text-secondary-500" />
        </div>

        <div>
          <p className="text-2xl font-semibold text-primary-900 lg:text-3xl">
            មិនអាចបង្ហាញព័ត៌មានម្ហូបបានទេ
          </p>

          <p className={`mt-2 ${TEXT_LABEL}`}>
            សូមពិនិត្យការតភ្ជាប់ រួចព្យាយាមម្តងទៀត។
          </p>
        </div>

        <button
          type="button"
          onClick={onRetry}
          className={`flex items-center gap-2 rounded-full bg-primary-800 px-6 py-3 font-semibold text-white transition hover:bg-primary-700 active:scale-95 ${TEXT_BODY}`}
        >
          <IoRefresh className="text-xl" />
          ព្យាយាមម្តងទៀត
        </button>
      </div>
    </main>
  );
}

function RelatedFoodCard({ food }: { food: CatalogMenuItem }) {
  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      {/*
        FoodCard already contains its own /food/{uuid} Link.
        Do not wrap FoodCard with a second Link.
      */}
      <FoodCard food={food} />
    </motion.article>
  );
}

function RecommendationScoreList({
  scoreBreakdown,
}: {
  scoreBreakdown: CatalogRecommendationScoreBreakdown;
}) {
  const scores = [
    { label: "Meal Match", value: scoreBreakdown.mealMatch },
    { label: "Cuisine Match", value: scoreBreakdown.cuisineMatch },
    { label: "Budget Match", value: scoreBreakdown.budgetMatch },
    { label: "Distance Match", value: scoreBreakdown.distanceMatch },
    { label: "Popularity", value: scoreBreakdown.popularity },
  ].filter((item): item is { label: string; value: number } =>
    isFiniteNumber(item.value),
  );

  if (scores.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-4">
      {scores.map((score) => (
        <ScoreBar key={score.label} label={score.label} value={score.value} />
      ))}
    </div>
  );
}

/* ================================================================== */

export default function FoodDetailPage({ uuid }: FoodDetailPageProps) {
  const router = useRouter();

  const {
    bookmarks,
    addBookmark,
    removeBookmark,
    findBookmark,
    activeProfileUuid,
  } = useBookmarks();
  const { track } = useTrackInteraction();
  const { coordinates: userCoordinates } = useUserLocation();

  const [activeImage, setActiveImage] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const {
    data: foodDetail,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetMenuItemByUuidQuery(uuid);

  useEffect(() => {
    const serverBookmark = findBookmark({
      menuItemUuid: uuid,
      foodUuid: foodDetail?.food?.uuid,
    });
    setIsBookmarked(Boolean(serverBookmark));
  }, [uuid, foodDetail?.food?.uuid, findBookmark, bookmarks]);

  const { data: allMenuItems = [] } = useGetMenuItemsQuery();

  const fallbackFood = useMemo(() => {
    return allMenuItems.find((item) => item.uuid === uuid) ?? null;
  }, [allMenuItems, uuid]);

  const food = foodDetail ?? fallbackFood;

  const masterFoodUuid = foodDetail?.food?.uuid || fallbackFood?.food?.uuid;

  const { data: foodCatalog } = useGetFoodCatalogByUuidQuery(
    masterFoodUuid ?? "",
    {
      skip: !masterFoodUuid,
    },
  );

  const relatedFoods = useMemo(() => {
    if (!food) {
      return [];
    }

    return [...allMenuItems]
      .filter((item) => item.uuid !== food.uuid)
      .filter((item) => item.availabilityStatus === "AVAILABLE")
      .sort((first, second) => {
        let firstScore = 0;
        let secondScore = 0;
        const foodCategoryCode = food?.food?.category?.code;
        const foodCuisineCode = food?.food?.cuisine?.code;

        if (
          foodCategoryCode &&
          first.food?.category?.code === foodCategoryCode
        ) {
          firstScore += 3;
        }

        if (
          foodCategoryCode &&
          second.food?.category?.code === foodCategoryCode
        ) {
          secondScore += 3;
        }

        if (foodCuisineCode && first.food?.cuisine?.code === foodCuisineCode) {
          firstScore += 2;
        }

        if (foodCuisineCode && second.food?.cuisine?.code === foodCuisineCode) {
          secondScore += 2;
        }

        if (first.isFeatured) {
          firstScore += 0.5;
        }

        if (second.isFeatured) {
          secondScore += 0.5;
        }

        firstScore += Math.max(0, Number(first.store?.averageRating ?? 0)) / 10;
        secondScore +=
          Math.max(0, Number(second.store?.averageRating ?? 0)) / 10;

        return secondScore - firstScore;
      })
      .slice(0, 8);
  }, [allMenuItems, food]);

  const gallery = useMemo(() => {
    if (!food) {
      return [DEFAULT_FOOD_IMAGE];
    }

    const images = [food.thumbnail, ...food.gallery]
      .filter((image): image is string => Boolean(image?.trim()))
      .map((image) => toFrontendApiAssetUrl(image));

    const uniqueImages = Array.from(new Set(images));

    return uniqueImages.length > 0 ? uniqueImages : [DEFAULT_FOOD_IMAGE];
  }, [food]);

  useEffect(() => {
    setActiveImage(0);
  }, [uuid]);

  if ((isLoading || isFetching) && !food) {
    return <LoadingPage />;
  }

  if (isError && !food) {
    return <ErrorPage onRetry={refetch} />;
  }

  if (!food) {
    return (
      <main className="min-h-screen bg-[#f7f9f7]">
        <div className="mx-auto flex min-h-[600px] max-w-7xl flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-2xl font-semibold text-primary-900 lg:text-3xl">
            រកមិនឃើញមុខម្ហូប
          </p>

          <p className={TEXT_LABEL}>
            មុខម្ហូបនេះប្រហែលត្រូវបានដកចេញ ឬផ្លាស់ប្តូរតំណ។
          </p>

          <Link
            href="/"
            className={`rounded-full bg-primary-800 px-6 py-3 font-semibold text-white transition hover:bg-primary-700 ${TEXT_BODY}`}
          >
            ត្រឡប់ទៅទំព័រដើម
          </Link>
        </div>
      </main>
    );
  }

  const displayName =
    food.localName?.trim() ||
    food.name?.trim() ||
    foodCatalog?.localName?.trim() ||
    "Unnamed food";

  const englishOrCanonicalName =
    food.food?.canonicalName?.trim() ||
    foodCatalog?.canonicalName?.trim() ||
    (food.name && food.name.trim() !== displayName ? food.name.trim() : null);

  const storeDisplayName =
    food.store.localName?.trim() || food.store.name?.trim() || "Unknown store";

  const storeAddress = getStoreAddress(food);

  const recommendation = food.recommendation;

  const matchPercentage =
    recommendation && isFiniteNumber(recommendation.finalScore)
      ? Math.round(recommendation.finalScore * 100)
      : null;

  const locationUrl =
    food.store.latitude && food.store.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${food.store.latitude},${food.store.longitude}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          storeAddress || storeDisplayName,
        )}`;

  let computedDistanceKm: number | null = food.distanceKm ?? null;

  if (
    userCoordinates &&
    food.store?.latitude !== undefined &&
    food.store?.latitude !== null &&
    food.store?.longitude !== undefined &&
    food.store?.longitude !== null
  ) {
    const storeCoordinates = {
      latitude: Number(food.store.latitude),
      longitude: Number(food.store.longitude),
    };

    if (isValidCoordinates(storeCoordinates)) {
      computedDistanceKm = calculateDistanceKm(
        userCoordinates,
        storeCoordinates,
      );
    }
  }

  const pairingLabels = (food.beveragePairings ?? []).map(getUnknownLabel);
  const allergenLabels = (food.allergenDeclarations ?? []).map(getUnknownLabel);

  const isAvailable = food.availabilityStatus === "AVAILABLE";
  const isStoreOpen = food.store.operatingStatus === "OPEN";

  const calories =
    food.nutrition?.calories !== undefined &&
    food.nutrition.calories !== null &&
    food.nutrition.calories > 0
      ? food.nutrition.calories
      : (foodCatalog?.nutritionData?.calories ?? 0);

  const proteinGrams =
    food.nutrition?.proteinGrams !== undefined &&
    food.nutrition.proteinGrams !== null &&
    food.nutrition.proteinGrams > 0
      ? food.nutrition.proteinGrams
      : (foodCatalog?.nutritionData?.proteinGrams ?? 0);

  const carbsGrams =
    food.nutrition?.carbsGrams !== undefined &&
    food.nutrition.carbsGrams !== null &&
    food.nutrition.carbsGrams > 0
      ? food.nutrition.carbsGrams
      : (foodCatalog?.nutritionData?.carbohydrateGrams ?? 0);

  const fatGrams =
    food.nutrition?.fatGrams !== undefined &&
    food.nutrition.fatGrams !== null &&
    food.nutrition.fatGrams > 0
      ? food.nutrition.fatGrams
      : (foodCatalog?.nutritionData?.fatGrams ?? 0);

  const spiceLevel =
    food.food?.spiceLevel !== undefined &&
    food.food?.spiceLevel !== null &&
    food.food?.spiceLevel > 0
      ? food.food.spiceLevel
      : (foodCatalog?.defaultSpiceLevel ?? 0);

  const dietaryTypes =
    food.food?.dietaryTypes && food.food.dietaryTypes.length > 0
      ? food.food.dietaryTypes
      : (foodCatalog?.dietaryTypes ?? []).map((d) => ({
          code: d.code,
          name: d.name,
          verificationStatus: d.verificationStatus || "UNVERIFIED",
        }));

  const seasons =
    food.food?.seasons && food.food.seasons.length > 0
      ? food.food.seasons
      : (foodCatalog?.seasons ?? []).map((s) => ({
          code: s.code || s.uuid || "",
          name: s.name || "",
          localName: s.localName || null,
          suitabilityScore: s.suitabilityScore || 1,
          reasonText: s.reasonText || null,
        }));

  const events =
    food.food?.events && food.food.events.length > 0
      ? food.food.events
      : (foodCatalog?.events ?? []).map((e) => ({
          code: e.code || e.uuid || "",
          name: e.name || "",
          localName: e.localName || null,
          relevanceScore: e.relevanceScore || 1,
          reasonText: e.reasonText || null,
        }));

  const suitableWeather =
    food.food?.suitableWeather && food.food.suitableWeather.length > 0
      ? food.food.suitableWeather
      : (foodCatalog?.suitableWeather ?? []).map((w) => ({
          code: w.code || w.uuid || "",
          name: w.name || "",
          localName: w.localName || null,
          suitabilityScore: w.suitabilityScore || 1,
          reasonText: w.reasonText || null,
        }));

  const mealTypes =
    food.food?.mealTypes && food.food.mealTypes.length > 0
      ? food.food.mealTypes
      : (foodCatalog?.mealTypes ?? []).map((m) => ({
          code: m.code || m.uuid || "",
          name: m.name || "",
        }));

  const ageGroups =
    food.food?.ageGroups && food.food.ageGroups.length > 0
      ? food.food.ageGroups
      : (foodCatalog?.ageRules ?? []).map((a) => ({
          code: a.code || a.uuid || "",
          name: a.name || "",
        }));

  const hasContextRows =
    seasons.length > 0 || events.length > 0 || suitableWeather.length > 0;

  const handleShare = async () => {
    const shareData = {
      title: displayName,
      text: food.localDescription ?? food.description ?? displayName,
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
  };

  return (
    <main className="min-h-screen bg-[#f7f9f7] pt-15">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 ">
        {/* ============================================================
            BACK
        ============================================================ */}
        <button
          type="button"
          onClick={() => router.back()}
          className={`flex items-center gap-2 font-semibold text-primary-800 transition hover:text-primary-600 ${TEXT_BODY}`}
        >
          <FaArrowLeft />
          ត្រឡប់ក្រោយ
        </button>

        {/* ============================================================
            1. HERO — gallery + food summary
            Both columns now hold comparable content, so the row no
            longer leaves a tall gap under the gallery.
        ============================================================ */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Gallery */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={gallery[activeImage]}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-gray-200 bg-gray-100"
              >
                <ApiImage
                  src={gallery[activeImage]}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />

                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  {matchPercentage !== null && (
                    <span
                      className={`rounded-full bg-secondary-500 px-4 py-2 font-semibold text-white ${TEXT_BODY}`}
                    >
                      {matchPercentage}% Match
                    </span>
                  )}

                  {food.isFeatured && (
                    <span
                      className={`rounded-full bg-white/95 px-4 py-2 font-semibold text-primary-900 ${TEXT_BODY}`}
                    >
                      មុខម្ហូបពេញនិយម
                    </span>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {gallery.slice(0, 4).map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`relative aspect-[4/3] overflow-hidden rounded-2xl border-2 transition ${
                      activeImage === index
                        ? "border-primary-700"
                        : "border-gray-200 hover:border-primary-300"
                    }`}
                  >
                    <ApiImage
                      src={image}
                      alt={`${displayName} image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="flex flex-col">
            {/* Title + price */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-3xl font-bold leading-tight text-primary-900 lg:text-4xl">
                  {displayName}
                </p>

                {englishOrCanonicalName && (
                  <p className={`mt-2 ${TEXT_LABEL}`}>
                    {englishOrCanonicalName}
                  </p>
                )}
              </div>

              <p className="shrink-0 text-3xl font-bold text-primary-800 lg:text-4xl">
                {formatPrice(food.price, food.currencyCode)}
              </p>
            </div>

            {/* Status row */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusPill
                isOn={isAvailable}
                onLabel="មានលក់"
                offLabel="មិនមានលក់"
              />

              <InfoPill>{food.food.category.name}</InfoPill>
              <InfoPill>{food.food.cuisine.name}</InfoPill>
            </div>

            {/* Description */}
            {(food.localDescription || food.description) && (
              <div className="mt-5 space-y-3">
                {food.localDescription && (
                  <p className={`leading-8 text-gray-600 ${TEXT_BODY}`}>
                    {food.localDescription}
                  </p>
                )}

                {food.description && (
                  <p className={`leading-8 text-gray-500 ${TEXT_BODY}`}>
                    {food.description}
                  </p>
                )}
              </div>
            )}

            {/* Quick stats */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile
                icon={<IoMdTime />}
                value={
                  food.preparationTimeMinutes !== null
                    ? `${food.preparationTimeMinutes} min`
                    : "N/A"
                }
                label="ពេលរៀបចំ"
              />

              <StatTile
                icon={<MdDeliveryDining />}
                value={formatDistance(computedDistanceKm)}
                label="ចម្ងាយ"
              />

              <StatTile
                icon={<TbFlame />}
                value={getSpiceLabel(spiceLevel)}
                label="កម្រិតហឹរ"
              />

              <StatTile
                icon={<MdOutlineInventory2 />}
                value={`${calories} kcal`}
                label="កាឡូរី"
              />
            </div>

            {/* Dietary */}
            <div className="mt-6">
              <p className={TEXT_LABEL}>របបអាហារ</p>

              {dietaryTypes.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {dietaryTypes.map((dietaryType) => (
                    <span
                      key={dietaryType.code}
                      className={`flex items-center gap-2 rounded-full bg-primary-800 px-4 py-2 text-white ${TEXT_BODY}`}
                    >
                      {dietaryType.verificationStatus === "VERIFIED" && (
                        <FaCheckCircle className="text-primary-300" />
                      )}

                      {dietaryType.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className={`mt-3 ${TEXT_LABEL}`}>មិនមានទិន្នន័យរបបអាហារ។</p>
              )}
            </div>

            {/* Actions — pinned to the bottom of this column */}
            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:mt-auto lg:pt-8">
              <button
                type="button"
                onClick={async () => {
                  const serverBookmark = findBookmark({
                    menuItemUuid: uuid,
                    foodUuid: food?.food?.uuid,
                  });

                  if (isBookmarked || serverBookmark) {
                    setIsBookmarked(false);
                    if (serverBookmark) {
                      try {
                        await removeBookmark(serverBookmark.uuid);
                      } catch (err) {
                        console.warn("[FOOD DETAIL UNBOOKMARK ERROR]", err);
                      }
                    }
                    track({
                      eventType: "UNBOOKMARK",
                      menuItemUuid: uuid,
                      foodUuid: food?.food?.uuid,
                      storeUuid: food?.store?.uuid,
                    });
                  } else {
                    setIsBookmarked(true);
                    if (activeProfileUuid) {
                      try {
                        await addBookmark({
                          menuItemUuid: uuid,
                          foodUuid: food?.food?.uuid,
                          storeUuid: food?.store?.uuid,
                        });
                      } catch (err) {
                        console.warn("[FOOD DETAIL BOOKMARK ERROR]", err);
                      }
                    }
                    track({
                      eventType: "BOOKMARK",
                      menuItemUuid: uuid,
                      foodUuid: food?.food?.uuid,
                      storeUuid: food?.store?.uuid,
                    });
                  }
                  window.dispatchEvent(new Event("foodhub-favorites-updated"));
                }}
                className={`flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-semibold transition active:scale-95 ${TEXT_BODY} ${
                  isBookmarked
                    ? "bg-secondary-500 text-white hover:bg-secondary-400"
                    : "bg-primary-800 text-white hover:bg-primary-700"
                }`}
              >
                <FaRegHeart />
                {isBookmarked ? "បានរក្សាទុក" : "រក្សាទុក"}
              </button>

              <a
                href={locationUrl}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center justify-center gap-2 rounded-full border border-primary-200 bg-white px-6 py-3.5 font-semibold text-primary-800 transition hover:bg-primary-50 active:scale-95 ${TEXT_BODY}`}
              >
                <FaMapMarkerAlt />
                មើលទីតាំង
              </a>

              <button
                type="button"
                onClick={handleShare}
                className={`flex items-center justify-center gap-2 rounded-full border border-primary-200 bg-white px-6 py-3.5 font-semibold text-primary-800 transition hover:bg-primary-50 active:scale-95 ${TEXT_BODY}`}
              >
                <FaShareAlt />
                ចែករំលែក
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================
            2. STORE — moved out of the summary column and laid out
            as one full-width row, which also absorbs the old
            standalone rating card (rating lived in two places before).
        ============================================================ */}
        <section className={SECTION}>
          <Link
            href={`/store/${food.store.uuid}`}
            aria-label={`View ${storeDisplayName} store profile`}
            className="group block rounded-3xl border border-gray-200 bg-white p-6 transition hover:border-primary-200 hover:bg-primary-50/40"
          >
            <div className="grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
              {/* Logo */}
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-primary-50">
                {food.store.logoUrl ? (
                  <ApiImage
                    src={food.store.logoUrl}
                    alt={`${storeDisplayName} logo`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FaStore className="text-3xl text-primary-700" />
                )}
              </div>

              {/* Name + address */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p
                    className={`line-clamp-1 ${TEXT_TITLE} transition group-hover:text-primary-700`}
                  >
                    {storeDisplayName}
                  </p>

                  <StatusPill isOn={isStoreOpen} onLabel="បើក" offLabel="បិទ" />
                </div>

                <div
                  className={`mt-3 flex items-start gap-2 leading-7 text-gray-600 ${TEXT_BODY}`}
                >
                  <FaMapMarkerAlt className="mt-1 shrink-0 text-primary-700" />

                  <span className="line-clamp-2">
                    {storeAddress || "មិនមានអាសយដ្ឋាន"}
                  </span>
                </div>
              </div>

              {/* Store link */}
              <div className="flex items-center">
                <span
                  className={`flex items-center gap-1 font-semibold text-primary-700 transition group-hover:translate-x-1 ${TEXT_BODY}`}
                >
                  មើលហាង
                  <IoChevronForward className="text-xl" />
                </span>
              </div>
            </div>
          </Link>
        </section>

        {/* ============================================================
            3. RECOMMENDATION + NUTRITION
        ============================================================ */}
        <section className={`${SECTION} grid gap-6 lg:grid-cols-[1.2fr_0.8fr]`}>
          <article className={CARD}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <p className={TEXT_EYEBROW}>FoodHub AI</p>
                <p className={`mt-2 ${TEXT_TITLE}`}>កម្រិតសមស្របសម្រាប់អ្នក</p>
              </div>

              {matchPercentage !== null && (
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary-800 lg:text-4xl">
                    {matchPercentage}%
                  </p>

                  <p className={`mt-1 ${TEXT_LABEL}`}>Match score</p>
                </div>
              )}
            </div>

            {recommendation ? (
              <>
                {recommendation.reasonText && (
                  <p className={`mt-5 leading-8 text-gray-600 ${TEXT_BODY}`}>
                    {recommendation.reasonText}
                  </p>
                )}

                {recommendation.scoreBreakdown && (
                  <RecommendationScoreList
                    scoreBreakdown={recommendation.scoreBreakdown}
                  />
                )}

                {recommendation.reasonCodes &&
                  recommendation.reasonCodes.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {recommendation.reasonCodes.map((reasonCode) => (
                        <InfoPill key={reasonCode}>
                          {reasonCode.replaceAll("_", " ")}
                        </InfoPill>
                      ))}
                    </div>
                  )}
              </>
            ) : (
              <div className={`mt-5 ${TILE}`}>
                <p className={`leading-7 text-gray-600 ${TEXT_BODY}`}>
                  មិនទាន់មានទិន្នន័យណែនាំសម្រាប់មុខម្ហូបនេះទេ។ សូមចូលគណនី
                  ឬកំណត់ចំណូលចិត្តរបស់អ្នក ដើម្បីទទួលការណែនាំ។
                </p>
              </div>
            )}
          </article>

          <article className={CARD}>
            <CardHeader
              icon={<IoNutritionOutline className="text-2xl" />}
              title="តម្លៃអាហារូបត្ថម្ភ"
            />

            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                {
                  label: "Calories",
                  value: `${calories} kcal`,
                },
                {
                  label: "Protein",
                  value: `${proteinGrams} g`,
                },
                {
                  label: "Carbs",
                  value: `${carbsGrams} g`,
                },
                {
                  label: "Fat",
                  value: `${fatGrams} g`,
                },
              ].map((nutrition) => (
                <div key={nutrition.label} className={TILE}>
                  <p className={TEXT_LABEL}>{nutrition.label}</p>
                  <p className={`mt-1 ${TEXT_VALUE}`}>{nutrition.value}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* ============================================================
            4. INGREDIENTS + ALLERGENS
        ============================================================ */}
        <section className={`${SECTION} grid gap-6 lg:grid-cols-2`}>
          <article className={CARD}>
            <CardHeader
              icon={<IoRestaurantOutline className="text-2xl" />}
              title="គ្រឿងផ្សំ"
            />

            {food.ingredients.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {food.ingredients.map((ingredient, index) => (
                  <span
                    key={`${ingredient}-${index}`}
                    className={`rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-gray-600 ${TEXT_BODY}`}
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            ) : (
              <p className={`mt-5 ${TEXT_LABEL}`}>មិនមានទិន្នន័យគ្រឿងផ្សំ។</p>
            )}

            {pairingLabels.length > 0 && (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <p className={TEXT_LABEL}>ភេសជ្ជៈដែលសម</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {pairingLabels.map((beverage, index) => (
                    <InfoPill key={`${beverage}-${index}`}>{beverage}</InfoPill>
                  ))}
                </div>
              </div>
            )}
          </article>

          <article className={CARD}>
            <CardHeader
              icon={<IoPeopleOutline className="text-2xl" />}
              title="អាយុសមស្រប"
              tone="secondary"
            />

            {ageGroups.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {ageGroups.map((ageGroup) => (
                  <InfoPill key={ageGroup.code}>{ageGroup.name}</InfoPill>
                ))}
              </div>
            ) : (
              <p className={`mt-5 ${TEXT_LABEL}`}>មិនមានទិន្នន័យក្រុមអាយុ។</p>
            )}

            {allergenLabels.length > 0 && (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <p className={TEXT_LABEL}>អាឡែស៊ី</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {allergenLabels.map((allergen, index) => (
                    <span
                      key={`${allergen}-${index}`}
                      className={`rounded-full border border-secondary-100 bg-secondary-50 px-4 py-2 font-medium text-secondary-700 ${TEXT_BODY}`}
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>
        </section>

        {/* ============================================================
            5. CONTEXT
        ============================================================ */}
        <section className={`${SECTION} ${CARD}`}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <DetailBlock label="ពេលអាហារ">
              {mealTypes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {mealTypes.map((mealType) => (
                    <InfoPill key={mealType.code}>{mealType.name}</InfoPill>
                  ))}
                </div>
              ) : (
                <p className={TEXT_LABEL}>មិនមានទិន្នន័យ</p>
              )}
            </DetailBlock>

            <DetailBlock label="ប្រភេទម្ហូប">
              <p className={TEXT_VALUE}>{food.food.category.name}</p>
            </DetailBlock>

            <DetailBlock label="Cuisine">
              <p className={TEXT_VALUE}>{food.food.cuisine.name}</p>
            </DetailBlock>

            <DetailBlock label="ប្រភពដើម">
              <p className={TEXT_VALUE}>{food.origin.countryName}</p>

              {food.origin.isTraditional && (
                <span
                  className={`mt-2 inline-flex rounded-full bg-primary-50 px-3 py-1 font-medium text-primary-800 ${TEXT_BODY}`}
                >
                  Traditional
                </span>
              )}
            </DetailBlock>
          </div>

          {hasContextRows && (
            <div className="mt-6 grid gap-6 border-t border-gray-100 pt-6 lg:grid-cols-3">
              {seasons.length > 0 && (
                <DetailBlock label="រដូវសមស្រប">
                  <div className="space-y-3">
                    {seasons.map((season) => (
                      <div key={season.code} className={TILE}>
                        <p className="font-semibold text-primary-900">
                          {season.localName || season.name}
                        </p>

                        {season.reasonText && (
                          <p
                            className={`mt-1 leading-7 text-gray-600 ${TEXT_BODY}`}
                          >
                            {season.reasonText}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </DetailBlock>
              )}

              {events.length > 0 && (
                <DetailBlock label="ព្រឹត្តិការណ៍">
                  <div className="space-y-3">
                    {events.map((eventItem) => (
                      <div key={eventItem.code} className={TILE}>
                        <p className="font-semibold text-primary-900">
                          {eventItem.localName || eventItem.name}
                        </p>

                        {eventItem.reasonText && (
                          <p
                            className={`mt-1 leading-7 text-gray-600 ${TEXT_BODY}`}
                          >
                            {eventItem.reasonText}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </DetailBlock>
              )}

              {suitableWeather.length > 0 && (
                <DetailBlock label="អាកាសធាតុសមស្រប">
                  <div className="space-y-3">
                    {suitableWeather.map((weather) => (
                      <div key={weather.code} className={TILE}>
                        <p className="font-semibold text-primary-900">
                          {weather.localName || weather.name}
                        </p>

                        {weather.reasonText && (
                          <p
                            className={`mt-1 leading-7 text-gray-600 ${TEXT_BODY}`}
                          >
                            {weather.reasonText}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </DetailBlock>
              )}
            </div>
          )}
        </section>

        {/* ============================================================
            6. RELATED
        ============================================================ */}
        {relatedFoods.length > 0 && (
          <section className={SECTION}>
            <SectionHeader
              eyebrow="អ្នកប្រហែលជាចូលចិត្ត"
              title="មុខម្ហូបស្រដៀងគ្នា"
              action={
                <Link
                  href="/food"
                  className={`flex items-center gap-2 font-semibold text-primary-800 transition hover:text-primary-600 ${TEXT_BODY}`}
                >
                  មើលទាំងអស់
                  <IoChevronForward />
                </Link>
              }
            />

            <div className="mt-6 container mx-auto max-w-7xl grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {relatedFoods.map((relatedFood) => (
                <RelatedFoodCard key={relatedFood.uuid} food={relatedFood} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
