// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { motion } from "framer-motion";

// import { CiHeart } from "react-icons/ci";
// import { FaHeart, FaStore } from "react-icons/fa";
// import { IoMdTime } from "react-icons/io";

// import { DEFAULT_FOOD_IMAGE, toFrontendApiAssetUrl } from "@/lib/catalog-media";

// import SafetyStatusBadge from "@/components/discovery/SafetyStatusBadge";
// import { useBookmarks } from "@/hooks/useBookmarks";
// import { useTrackInteraction } from "@/hooks/useTrackInteraction";
// import type { CatalogMenuItem } from "@/types/catalog-menu-item";
// import type { SafetyStatusType } from "@/types/search";

// /* =========================================================
//    TYPES
// ========================================================= */

// type FoodCardProps = {
//   food: CatalogMenuItem & {
//     safetyStatus?: SafetyStatusType;
//     safetyReasonCodes?: string[];
//   };
//   safetyStatus?: SafetyStatusType;
//   safetyReasonCodes?: string[];
// };

// /* =========================================================
//    CONSTANTS
// ========================================================= */

// const FAVORITES_STORAGE_KEY = "foodhub-favorite-menu-items";

// /* =========================================================
//    FAVORITES
// ========================================================= */

// function getStoredFavoriteIds(): string[] {
//   if (typeof window === "undefined") {
//     return [];
//   }

//   try {
//     const value = window.localStorage.getItem(FAVORITES_STORAGE_KEY);

//     if (!value) {
//       return [];
//     }

//     const parsed: unknown = JSON.parse(value);

//     if (!Array.isArray(parsed)) {
//       return [];
//     }

//     return parsed.filter((item): item is string => typeof item === "string");
//   } catch {
//     return [];
//   }
// }

// function cleanKhmerLabel(label: string): string {
//   if (!label) return "";
//   return label.replace(/\s*\([A-Za-z0-9\s&,/-]+\)/g, "").trim();
// }

// /* =========================================================
//    COMPONENT
// ========================================================= */

// export default function FoodCard({
//   food,
//   safetyStatus,
//   safetyReasonCodes,
// }: FoodCardProps) {
//   const {
//     bookmarks,
//     addBookmark,
//     removeBookmark,
//     findBookmark,
//     activeProfileUuid,
//   } = useBookmarks();
//   const { track } = useTrackInteraction();

//   const [isFavorite, setIsFavorite] = useState(false);

//   const effectiveThumbnail =
//     food.thumbnail ||
//     (food.gallery && food.gallery.length > 0 ? food.gallery[0] : null) ||
//     (food.uuid ? `/api/v1/catalog/menu-items/${food.uuid}/images/1` : null);

//   const [thumbnailUrl, setThumbnailUrl] = useState<string>(
//     toFrontendApiAssetUrl(effectiveThumbnail),
//   );

//   /* =======================================================
//      FAVORITE INITIAL STATE
//   ======================================================= */

//   useEffect(() => {
//     const favoriteIds = getStoredFavoriteIds();
//     const serverBookmark = findBookmark({
//       menuItemUuid: food.uuid,
//       foodUuid: food.food?.uuid,
//     });

//     setIsFavorite(Boolean(serverBookmark) || favoriteIds.includes(food.uuid));
//   }, [food.uuid, food.food?.uuid, findBookmark, bookmarks]);

//   /* =======================================================
//      THUMBNAIL
//   ======================================================= */

//   useEffect(() => {
//     const nextThumbnail =
//       food.thumbnail ||
//       (food.gallery && food.gallery.length > 0 ? food.gallery[0] : null) ||
//       (food.uuid ? `/api/v1/catalog/menu-items/${food.uuid}/images/1` : null);

//     setThumbnailUrl(toFrontendApiAssetUrl(nextThumbnail));
//   }, [food.thumbnail, food.gallery, food.uuid]);

//   /* =======================================================
//      FAVORITE TOGGLE
//   ======================================================= */

//   const toggleFavorite = async () => {
//     const currentIds = getStoredFavoriteIds();
//     const serverBookmark = findBookmark({
//       menuItemUuid: food.uuid,
//       foodUuid: food.food?.uuid,
//     });

//     const isCurrentlyFavorite =
//       isFavorite || Boolean(serverBookmark) || currentIds.includes(food.uuid);

//     if (isCurrentlyFavorite) {
//       // Unfavorite
//       const nextIds = currentIds.filter((id) => id !== food.uuid);
//       try {
//         window.localStorage.setItem(
//           FAVORITES_STORAGE_KEY,
//           JSON.stringify(nextIds),
//         );
//       } catch {}

//       setIsFavorite(false);

//       if (serverBookmark) {
//         try {
//           await removeBookmark(serverBookmark.uuid);
//         } catch (err) {
//           console.warn("[BOOKMARK REMOVE ERROR]", err);
//         }
//       }

//       track({
//         eventType: "UNBOOKMARK",
//         menuItemUuid: food.uuid,
//         foodUuid: food.food?.uuid,
//         storeUuid: food.store?.uuid,
//       });
//     } else {
//       // Favorite
//       const nextIds = [
//         ...currentIds.filter((id) => id !== food.uuid),
//         food.uuid,
//       ];
//       try {
//         window.localStorage.setItem(
//           FAVORITES_STORAGE_KEY,
//           JSON.stringify(nextIds),
//         );
//       } catch {}

//       setIsFavorite(true);

//       if (activeProfileUuid) {
//         try {
//           await addBookmark({
//             menuItemUuid: food.uuid,
//             foodUuid: food.food?.uuid,
//             storeUuid: food.store?.uuid,
//           });
//         } catch (err) {
//           console.warn("[BOOKMARK ADD ERROR]", err);
//         }
//       }

//       track({
//         eventType: "BOOKMARK",
//         menuItemUuid: food.uuid,
//         foodUuid: food.food?.uuid,
//         storeUuid: food.store?.uuid,
//       });
//     }

//     window.dispatchEvent(new Event("foodhub-favorites-updated"));
//   };

//   /* =======================================================
//      DISPLAY VALUES
//   ======================================================= */

//   const displayName =
//     food.localName?.trim() || food.name?.trim() || "Unnamed food";

//   /**
//    * IMPORTANT:
//    * dietaryTypes is inside food.food in your current response.
//    */
//   const dietaryTypes = food.food?.dietaryTypes ?? [];

//   /* =======================================================
//      UI
//   ======================================================= */

//   return (
//     <motion.article
//       layout
//       initial={{
//         opacity: 0,
//         y: 12,
//       }}
//       animate={{
//         opacity: 1,
//         y: 0,
//       }}
//       transition={{
//         duration: 0.25,
//       }}
//       className="relative h-full w-full"
//     >
//       {/* ==========================================
//           CARD LINK
//       ========================================== */}

//       <Link
//         href={`/menu-items/${food.uuid}`}
//         className="
//           flex
//           h-full
//           w-full
//           min-w-0
//           flex-col
//           rounded-[24px]
//           border
//           border-gray-200
//           bg-white
//           p-3.5
//           shadow-sm
//           transition
//           duration-200
//           hover:-translate-y-1
//           hover:shadow-md
//           dark:border-gray-800
//           dark:bg-gray-950
//         "
//       >
//         {/* ========================================
//             IMAGE
//         ======================================== */}

//         <div className="relative min-h-0 flex-1">
//           <img
//             src={thumbnailUrl}
//             alt={displayName}
//             width={485}
//             height={370}
//             onError={() => {
//               if (thumbnailUrl !== DEFAULT_FOOD_IMAGE) {
//                 setThumbnailUrl(DEFAULT_FOOD_IMAGE);
//               }
//             }}
//             className="
//               h-[190px]
//               w-full
//               rounded-[10px]
//               border border-gray-100
//               object-cover
//               pointer-events-none
//             "
//           />
//           {(safetyStatus || food.safetyStatus) && (
//             <div className="absolute top-2 left-2 z-10">
//               <SafetyStatusBadge
//                 status={safetyStatus || food.safetyStatus}
//                 reasonCodes={safetyReasonCodes || food.safetyReasonCodes}
//               />
//             </div>
//           )}
//         </div>

//         {/* ========================================
//             CONTENT
//         ======================================== */}

//         <div className="flex shrink-0 flex-col gap-2 pt-2">
//           {/* STORE */}

//           <div className="flex items-center gap-2 text-secondary-400">
//             <FaStore />

//             <p className="line-clamp-1 text-lg">
//               {food.store?.name || "Unknown store"}
//             </p>
//           </div>

//           {/* ======================================
//               NAME + PRICE
//           ====================================== */}

//           <div className="flex items-center justify-between gap-2">
//             <p
//               className="
//                 min-w-0
//                 line-clamp-1
//                 text-[24px]
//                 font-medium
//                 text-primary-900
//                 dark:text-white
//               "
//             >
//               {displayName}
//             </p>

//             <p
//               className="
//                 shrink-0
//                 text-[24px]
//                 font-medium
//                 text-primary-800 dark:text-primary-dark
//                 dark:text-primary-300
//               "
//             >
//               {food.currencyCode === "USD"
//                 ? `$${food.price}`
//                 : `${food.price} ${food.currencyCode ?? ""}`}
//             </p>
//           </div>

//           {/* ======================================
//               PREPARATION TIME
//           ====================================== */}

//           {food.preparationTimeMinutes !== null &&
//             food.preparationTimeMinutes !== undefined && (
//               <div className="flex flex-wrap gap-4">
//                 <div className="flex items-center gap-2 text-primary-400">
//                   <IoMdTime />

//                   <span>{food.preparationTimeMinutes} min</span>
//                 </div>
//               </div>
//             )}

//           {/* ======================================
//               DIETARY TAGS (Blank if no dietaryTypes)
//           ====================================== */}

//           {dietaryTypes.length > 0 && (
//             <div className="flex items-center gap-2 overflow-hidden">
//               {dietaryTypes.slice(0, 2).map((diet) => (
//                 <span
//                   key={diet.code}
//                   title={cleanKhmerLabel(diet.name)}
//                   className="
//                     shrink-0
//                     truncate
//                     rounded-full
//                     bg-primary-800
//                     px-2
//                     py-1
//                     text-center
//                     text-sm
//                     text-gray-100
//                   "
//                 >
//                   {cleanKhmerLabel(diet.name)}
//                 </span>
//               ))}

//               {dietaryTypes.length > 2 && (
//                 <span
//                   className="
//                     w-8 h-8 justify-center
//                     shrink-0
//                     rounded-full
//                     bg-gray-100
//                     py-1
//                     text-center
//                     text-sm
//                     font-medium
//                     text-gray-600
//                     dark:bg-gray-800
//                     dark:text-gray-300
//                   "
//                 >
//                   +{dietaryTypes.length - 2}
//                 </span>
//               )}
//             </div>
//           )}
//         </div>
//       </Link>

//       {/* ==========================================
//           FAVORITE BUTTON

//           Must stay OUTSIDE <Link>.
//       ========================================== */}

//       <button
//         type="button"
//         aria-label={
//           isFavorite
//             ? `Remove ${displayName} from favorites`
//             : `Add ${displayName} to favorites`
//         }
//         onClick={(event) => {
//           event.preventDefault();
//           event.stopPropagation();

//           toggleFavorite();
//         }}
//         className="
//           absolute
//           right-[18px]
//           top-[18px]
//           z-20
//           cursor-pointer
//         "
//       >
//         {isFavorite ? (
//           <FaHeart
//             className="
//               rounded-full
//               bg-primary-800
//               p-2
//               text-4xl
//               text-accent-400
//               shadow
//             "
//           />
//         ) : (
//           <CiHeart
//             className="
//               rounded-full
//               bg-primary-800
//               p-2
//               text-4xl
//               text-white
//               shadow
//             "
//           />
//         )}
//       </button>
//     </motion.article>
//   );
// }

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { CiHeart } from "react-icons/ci";
import {
  FaClock,
  FaHeart,
  FaMotorcycle,
  FaStar,
  FaStore,
} from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";

import { DEFAULT_FOOD_IMAGE, toFrontendApiAssetUrl } from "@/lib/catalog-media";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useUserLocation } from "@/hooks/useUserLocation";
import { calculateDistanceKm, isValidCoordinates } from "@/lib/location/geo";

import type { CatalogMenuItem } from "@/types/catalog-menu-item";
import Image from "next/image";

/* =========================================================
   TYPES
========================================================= */

type FoodCardProps = {
  food: CatalogMenuItem;
};

/* =========================================================
   CONSTANTS
========================================================= */

const FAVORITES_STORAGE_KEY = "foodhub-favorite-menu-items";

/* =========================================================
   FAVORITES
========================================================= */

function getStoredFavoriteIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(FAVORITES_STORAGE_KEY);

    if (!value) {
      return [];
    }

    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

/* =========================================================
   COMPONENT
========================================================= */

export default function FoodCard({ food }: FoodCardProps) {
  /* =======================================================
     DISPLAY VALUES
  ======================================================= */

  const displayName =
    food.localName?.trim() || food.name?.trim() || "Unnamed food";

  /**
   * Catalog menu items keep dietaryTypes inside `food.food`.
   * Discovery currently does not return dietaryTypes, so this becomes [] there.
   * If backend adds a root dietaryTypes field later, this also supports it.
   */
  const rootDietaryTypes = (
    food as unknown as {
      dietaryTypes?: {
        code: string;
        name: string;
      }[];
    }
  ).dietaryTypes;

  const dietaryTypes = food.food?.dietaryTypes ?? rootDietaryTypes ?? [];

  /**
   * Catalog responses keep category/cuisine inside `food.food`,
   * while discovery search returns category/cuisine at the menu-item root.
   * Support both response shapes without changing the card UI.
   */
  const foodAny = food as unknown as {
    cuisine?: { code?: string; name: string } | null;
    category?: { code?: string; name: string } | null;
    imageUrl?: string | null;
    primaryMediaUuid?: string | null;
  };
  const cuisine = food.food?.cuisine ?? foodAny.cuisine ?? null;
  const category = food.food?.category ?? foodAny.category ?? null;

  /* =======================================================
     STATE
  ======================================================= */

  const [isFavorite, setIsFavorite] = useState(false);

  /* =======================================================
     DISTANCE & TRAVEL TIME
  ======================================================= */

  const { coordinates: userCoordinates } = useUserLocation();

  let travelTimeMin: number | null = null;
  let computedDistanceKm: number | null = food.distanceKm ?? null;

  if (userCoordinates && food.store?.latitude && food.store?.longitude) {
    const storeCoordinates = {
      latitude: food.store.latitude,
      longitude: food.store.longitude,
    };
    if (isValidCoordinates(storeCoordinates)) {
      if (computedDistanceKm === null) {
        computedDistanceKm = calculateDistanceKm(
          userCoordinates,
          storeCoordinates,
        );
      }

      // Assume 2 minutes per kilometer (30 km/h) plus 5 min base preparation/pickup time.
      travelTimeMin = Math.ceil(computedDistanceKm * 2 + 5);
    }
  }

  const itemUuid =
    food.uuid ||
    (food as unknown as { menuItemUuid?: string }).menuItemUuid ||
    "";

  const rawImage =
    food.thumbnail ||
    foodAny.imageUrl ||
    (foodAny.primaryMediaUuid
      ? `/api/v1/media/${foodAny.primaryMediaUuid}`
      : undefined);

  const [thumbnailUrl, setThumbnailUrl] = useState<string>(
    toFrontendApiAssetUrl(rawImage),
  );

  /* =======================================================
     DIETARY TAG WIDTH
  ======================================================= */

  const dietaryContainerRef = useRef<HTMLDivElement>(null);

  const dietaryMeasureRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [visibleDietaryCount, setVisibleDietaryCount] = useState(
    dietaryTypes.length,
  );

  /* =======================================================
     BOOKMARKS & FAVORITES
  ======================================================= */

  const { bookmarks, addBookmark, removeBookmark, findBookmark } =
    useBookmarks();

  useEffect(() => {
    const favoriteIds = getStoredFavoriteIds();
    const serverBookmark = findBookmark({
      menuItemUuid: food.uuid,
      foodUuid: food.food?.uuid,
    });

    setIsFavorite(Boolean(serverBookmark) || favoriteIds.includes(food.uuid));
  }, [food.uuid, food.food?.uuid, findBookmark, bookmarks]);

  /* =======================================================
     THUMBNAIL
  ======================================================= */

  useEffect(() => {
    setThumbnailUrl(toFrontendApiAssetUrl(rawImage));
  }, [rawImage]);

  /* =======================================================
     FAVORITE / BOOKMARK TOGGLE
  ======================================================= */

  const toggleFavorite = async () => {
    const currentIds = getStoredFavoriteIds();
    const serverBookmark = findBookmark({
      menuItemUuid: food.uuid,
      foodUuid: food.food?.uuid,
    });

    const isAlreadyFavorite =
      isFavorite || Boolean(serverBookmark) || currentIds.includes(food.uuid);

    const nextIds = isAlreadyFavorite
      ? currentIds.filter((id) => id !== food.uuid)
      : [...currentIds, food.uuid];

    try {
      window.localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(nextIds),
      );
    } catch (error) {
      console.warn(
        "[FOOD FAVORITE STORAGE]",
        error instanceof Error ? error.message : String(error),
      );
    }

    setIsFavorite(!isAlreadyFavorite);
    window.dispatchEvent(new Event("foodhub-favorites-updated"));

    try {
      if (isAlreadyFavorite) {
        if (serverBookmark) {
          await removeBookmark(serverBookmark.uuid);
        }
      } else {
        await addBookmark({
          menuItemUuid: food.uuid,
          foodUuid: food.food?.uuid,
          storeUuid: food.store?.uuid,
        });
      }
    } catch (err) {
      console.warn("[BOOKMARK SYNC ERROR]", err);
    }
  };

  /* =======================================================
     CALCULATE DIETARY TAGS THAT FIT
  ======================================================= */

  useLayoutEffect(() => {
    const container = dietaryContainerRef.current;

    if (!container || dietaryTypes.length === 0) {
      return;
    }

    const calculateVisibleDietaryTypes = () => {
      const containerWidth = container.clientWidth;

      if (containerWidth <= 0) {
        return;
      }

      const gap = 8; // gap-2 = 8px
      const counterWidth = 32; // w-8 = 32px

      let usedWidth = 0;
      let visibleCount = 0;

      for (let index = 0; index < dietaryTypes.length; index++) {
        const element = dietaryMeasureRefs.current[index];

        if (!element) {
          continue;
        }

        const itemWidth = element.offsetWidth;

        const widthWithTag =
          visibleCount === 0 ? itemWidth : usedWidth + gap + itemWidth;

        const hiddenCount = dietaryTypes.length - (index + 1);

        /*
         * If there are still hidden dietary types,
         * reserve space for the +N counter.
         */
        const widthWithCounter =
          hiddenCount > 0 ? widthWithTag + gap + counterWidth : widthWithTag;

        if (widthWithCounter <= containerWidth) {
          usedWidth = widthWithTag;
          visibleCount++;
        } else {
          break;
        }
      }

      setVisibleDietaryCount(visibleCount);
    };

    calculateVisibleDietaryTypes();

    const resizeObserver = new ResizeObserver(calculateVisibleDietaryTypes);

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [dietaryTypes]);

  /* =======================================================
     RATING
  ======================================================= */

  const averageRating = Number(food.store?.averageRating ?? 0);

  const displayedRating = Number.isFinite(averageRating)
    ? averageRating.toFixed(1)
    : "0.0";

  /* =======================================================
     UI
  ======================================================= */

  return (
    <motion.article
      layout
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.25,
      }}
      className="relative h-full w-full"
    >
      {/* ==========================================
          CARD LINK
      ========================================== */}

      <Link
        href={`/menu/${itemUuid}`}
        className="
          flex
          h-full
          w-full
          flex-col
          rounded-[18px]
          sm:rounded-[24px]
          border
          border-gray-200
          bg-white
          p-2.5
          sm:p-3.5
          shadow-xs
          transition
          duration-200
          hover:-translate-y-1
          hover:shadow-md
          dark:border-gray-800
          dark:bg-gray-950
        "
      >
        {/* ========================================
            IMAGE
        ======================================== */}

        <div className="relative min-h-0 flex-1">
          <Image
            src={thumbnailUrl}
            alt={displayName}
            width={485}
            height={370}
            unoptimized={true}
            draggable={false}
            onError={() => {
              if (thumbnailUrl !== DEFAULT_FOOD_IMAGE) {
                setThumbnailUrl(DEFAULT_FOOD_IMAGE);
              }
            }}
            className="
              h-[115px]
              sm:h-[180px]
              w-fullff
              rounded-[12px] max-sm:rounded-[8px]
              sm:rounded-[10px]
              border
              border-gray-100
              dark:border-gray-800
              object-cover
              pointer-events-none
            "
          />

          {/* Top-Right Bookmark Button */}
          <button
            type="button"
            aria-label={
              isFavorite
                ? "ដកចេញពីបញ្ជីចំណូលចិត្ត"
                : "រក្សាទុកក្នុងបញ្ជីចំណូលចិត្ត"
            }
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite();
            }}
            className={`
              absolute right-1 top-1 z-10
              flex h-7 w-7 sm:h-8 sm:w-8
              items-center justify-center
              rounded-full
              backdrop-blur-md transition-all duration-200
              shadow-sm hover:scale-110 active:scale-95
              ${
                isFavorite
                  ? "bg-secondary-500 text-white shadow-secondary-500/30"
                  : "bg-white/85 text-gray-700 hover:bg-white hover:text-secondary-500 dark:bg-black/60 dark:text-gray-200 dark:hover:bg-black/80 dark:hover:text-secondary-400"
              }
            `}
          >
            {isFavorite ? (
              <IoBookmark className="text-sm sm:text-base text-white" />
            ) : (
              <IoBookmarkOutline className="text-sm sm:text-base" />
            )}
          </button>
        </div>

        {/* ========================================
            CONTENT
        ======================================== */}

        <div className="flex shrink-0 flex-col gap-1.5 sm:gap-2 pt-2">
          {/* STORE */}

          <div className="flex items-center justify-between gap-1 sm:gap-6 text-secondary-500 dark:text-secondary-400 w-full overflow-hidden text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-1 flex-1 min-w-0">
              <FaStore className="shrink-0 text-xs sm:text-lg" />
              <p className="truncate pt-[2px] text-xs sm:text-lg ">
                {food.store?.name || "Unknown store"}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <FaClock className="text-[10px] sm:text-lg" />
              <p className="whitespace-nowrap mt-[2px] text-[10px] sm:text-sm">
                {food.store?.operatingStatus === "OPEN" ? "Open" : "Closed"}
              </p>
            </div>
          </div>

          {/* ======================================
              NAME + PRICE
          ====================================== */}

          <div className="flex items-center justify-between gap-1 sm:gap-2">
            <p
              className="
                min-w-0
                line-clamp-1
                text-sm
                sm:text-2xl
                font-medium
                text-primary-900
                dark:text-white
              "
            >
              {displayName}
            </p>

            <p
              className="
                shrink-0
                text-sm
                sm:text-xl
                font-bold
                text-primary-800
                dark:text-emerald-400
              "
            >
              {food.currencyCode === "USD"
                ? `$${food.price}`
                : `${food.price} ${food.currencyCode ?? ""}`}
            </p>
          </div>

          {/* ======================================
              RATING + PREPARATION TIME
          ====================================== */}

          <div className="flex flex-wrap gap-4">
            {/* RATING */}

            {/* 
            <div className="flex items-center gap-2 text-accent-400">
              <FaStar />

              <span>{displayedRating}</span>
            </div>
            */}

            {/* PREPARATION TIME */}

            {/* {food.preparationTimeMinutes !== null &&
              food.preparationTimeMinutes !== undefined && (
                <div className="flex items-center gap-2 text-primary-400">
                  <IoMdTime />

                  <span>{food.preparationTimeMinutes} min</span>
                </div>
              )} */}

            {travelTimeMin !== null ? (
              <div className="flex items-center gap-2 text-primary-400">
                <FaMotorcycle />

                <span>{travelTimeMin} min</span>
              </div>
            ) : food.preparationTimeMinutes !== null &&
              food.preparationTimeMinutes !== undefined ? (
              <div className="flex items-center gap-2 text-primary-400">
                <FaMotorcycle />

                <span className="mt-1">{food.preparationTimeMinutes} min</span>
              </div>
            ) : null}
          </div>

          {/* ======================================
              DIETARY TAGS
          ====================================== */}

          {dietaryTypes.length > 0 && (
            <div
              ref={dietaryContainerRef}
              className="
                relative
                flex
                items-center
                gap-2
                overflow-hidden
              "
            >
              {/* ==================================
                  HIDDEN MEASUREMENT TAGS

                  These are invisible tags used only
                  to calculate their real width.
              ================================== */}

              <div
                className="
                  pointer-events-none
                  absolute
                  left-0
                  top-0
                  flex
                  items-center
                  gap-2
                  opacity-0
                "
                aria-hidden="true"
              >
                {dietaryTypes.map((diet, index) => (
                  <span
                    key={`measure-${diet.code}`}
                    ref={(element) => {
                      dietaryMeasureRefs.current[index] = element;
                    }}
                    className="
                        shrink-0
                        truncate
                        whitespace-nowrap
                        rounded-full
                        bg-primary-800
                        px-2
                        py-1
                        text-center
                        text-sm max-sm:text-[12px]
                        text-gray-100
                      "
                  >
                    {diet.name}
                  </span>
                ))}
              </div>

              {/* ==================================
                  ACTUAL VISIBLE DIETARY TAGS
              ================================== */}

              {dietaryTypes.slice(0, visibleDietaryCount).map((diet) => (
                <span
                  key={diet.code}
                  title={diet.name}
                  className="
                      shrink-0
                      truncate
                      whitespace-nowrap
                      rounded-full
                      bg-primary-800
                      px-2 
                      py-1
                      text-center
                      text-sm max-sm:text-[8px]
                      text-gray-100
                    "
                >
                  {diet.name}
                </span>
              ))}

              {/* ==================================
                  +N COUNTER
              ================================== */}

              {visibleDietaryCount < dietaryTypes.length && (
                <span
                  className="
                    h-8
                    w-8
                    shrink-0
                    justify-center
                    rounded-full
                    bg-gray-100
                    py-1
                    text-center
                    text-sm max-sm:text-[8px]
                    font-medium
                    text-gray-600
                    dark:bg-gray-800
                    dark:text-gray-300
                  "
                >
                  +{dietaryTypes.length - visibleDietaryCount}
                </span>
              )}
            </div>
          )}

          {/* ======================================
              FALLBACK TAGS

              When dietaryTypes is empty,
              use cuisine first, then category.
              Supports both catalog and discovery response shapes.
          ====================================== */}

          {dietaryTypes.length === 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {cuisine ? (
                <span
                  className="
                    shrink-0
                    truncate
                    rounded-full
                    bg-primary-800
                    px-2
                    py-1
                    text-center
                    text-sm max-sm:text-[12px]
                    text-gray-100
                  "
                >
                  {cuisine.name}
                </span>
              ) : category ? (
                <span
                  className="
                    shrink-0
                    truncate
                    rounded-full
                    bg-primary-800
                    px-2
                    py-1
                    text-center
                    text-sm
                    text-gray-100
                  "
                >
                  {category.name}
                </span>
              ) : null}
            </div>
          )}
        </div>
      </Link>

      {/* ==========================================
          FAVORITE BUTTON

          Must stay OUTSIDE <Link>.
      ========================================== */}

      {/*
      <button
        type="button"
        aria-label={
          isFavorite
            ? `Remove ${displayName} from favorites`
            : `Add ${displayName} to favorites`
        }
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();

          toggleFavorite();
        }}
        className="
          absolute
          right-[18px]
          top-[18px]
          z-20
          cursor-pointer
        "
      >
        {isFavorite ? (
          <FaHeart
            className="
              rounded-full
              bg-primary-800
              p-2
              text-4xl
              text-accent-400
              shadow
            "
          />
        ) : (
          <CiHeart
            className="
              rounded-full
              bg-primary-800
              p-2
              text-4xl
              text-white
              shadow
            "
          />
        )}
      </button>
      */}
    </motion.article>
  );
}
