// import React from "react";
// import { motion } from "framer-motion";
// import { group, riseReveal, VIEWPORT } from "@/lib/reveal";
// export default function EventSection() {
//   return (
//     <div className="py-12.5">
//       {/* =========================================
//           SECTION HEADER
//       ========================================== */}
//       <section className="  flex flex-col lg:pb-12.5 items-center justify-center md:gap-12.5 max-md:gap-6 container  max-7-xl mx-auto   relative z-20   w-full">
//         <p className="lg:text-6xl  py-2 md:text-4xl max-md:text-2xl text-center dark:text-[#22a447] font-semibold text-primary-800 dark:text-primary-dark">
//           បទពិសោធន៍ថ្មីក្នុង
//           <span className="text-secondary-500">ការស្វែងរកអាហារ</span>
//         </p>
//         <p className="lg:text-[24px] md:text-[20px] text-center  font-light text-gray-700 dark:text-gray-100 max-md:text-[16px]">
//           ស្វែងរកមុខម្ហូប និងហាងអាហារដែលសមនឹងអ្នក តាមរយៈ <br />
//           ប្រព័ន្ធណែនាំឆ្លាតវៃ ដែលគិតគូរពីចំណូលចិត្ត អាឡែស៊ី របបអាហារ ជំនឿសាសនា
//           និងទីតាំងរបស់អ្នក
//         </p>
//       </section>

//       {/* =========================================
//           SEASONAL FOOD GRID
//       ========================================== */}
//       <div
//         data-aos="fade-up"
//         data-aos-delay="150"
//         className="
//           container
//           mx-auto
//           grid
//           max-w-7xl
//           grid-cols-2
//           items-center
//           gap-4
//           px-4
//           sm:grid-cols-2
//           md:grid-cols-5
//           lg:px-0

//         "
//       >
//         {/* ======================================
//             LEFT CONTENT
//         ======================================= */}
//         <div
//           data-aos="fade-right"
//           data-aos-delay="150"
//           className="flex h-full flex-col justify-between"
//         >
//           <div className="mb-6 pl-0.5">
//             <p className="mb-4 text-[26px] font-bold leading-tight text-primary-800 dark:text-primary-dark md:text-[22px] lg:text-[36px]">
//               ចំណីអាហារស្រប <br />
//               <span className="text-secondary-500">តាមរដូវកាលខ្មែរ</span>
//             </p>

//             <p className="text-xl text-gray-500 dark:text-white max-lg:text-[16px]">
//               ស្វែងរកមុខម្ហូបដែលសមស្របនឹងរដូវកាលនីមួយៗ
//             </p>
//           </div>

//           {/* FOOD 1 */}
//           <div
//             className="
//               group
//               relative
//               overflow-hidden
//               rounded-2xl
//               shadow-md
//             "
//           >
//             <img
//               src="/Image/food-picture/food-21.webp"
//               alt="Fish Amok"
//               className="
//                 h-40
//                 w-full
//                 object-cover
//                 transition-transform
//                 duration-700
//                 ease-out
//                 group-hover:scale-110
//               "
//             />

//             {/* Gradient */}
//             <div
//               className="
//                 pointer-events-none
//                 absolute
//                 inset-0
//                 bg-gradient-to-t
//                 from-black/80
//                 via-black/20
//                 to-transparent
//                 opacity-0
//                 transition-opacity
//                 duration-500
//                 group-hover:opacity-100
//               "
//             />

//             {/* Food Name */}
//             <div
//               className="
//                 pointer-events-none
//                 absolute
//                 inset-x-0
//                 bottom-0
//                 z-10
//                 translate-y-5
//                 p-4
//                 opacity-0
//                 transition-all
//                 duration-500
//                 ease-out
//                 group-hover:translate-y-0
//                 group-hover:opacity-100
//               "
//             >
//               <p className="text-lg font-semibold text-white">
//                 បុណ្យភ្ជុំបិណ្ឌ
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* ======================================
//             COLUMN 2
//         ======================================= */}
//         <div data-aos="fade-up" data-aos-delay="250">
//           <div className="flex flex-col justify-between gap-4 overflow-hidden rounded-2xl">
//             {/* FOOD 2 */}
//             <div className="group relative overflow-hidden rounded-2xl">
//               <img
//                 src="/Image/food-picture/food-20.jpg"
//                 alt="Khmer Seasonal Dish"
//                 className="
//                   h-40
//                   w-full
//                   object-cover
//                   transition-transform
//                   duration-700
//                   ease-out
//                   group-hover:scale-110
//                 "
//               />

//               <div
//                 className="
//                   pointer-events-none
//                   absolute
//                   inset-0
//                   bg-gradient-to-t
//                   from-black/80
//                   via-black/20
//                   to-transparent
//                   opacity-0
//                   transition-opacity
//                   duration-500
//                   group-hover:opacity-100
//                 "
//               />

//               <div
//                 className="
//                   pointer-events-none
//                   absolute
//                   inset-x-0
//                   bottom-0
//                   z-10
//                   translate-y-5
//                   p-4
//                   opacity-0
//                   transition-all
//                   duration-500
//                   group-hover:translate-y-0
//                   group-hover:opacity-100
//                 "
//               >
//                 <p className="text-lg font-semibold text-white">
//                   បុណ្យចូលឆ្នាំខ្មែរ
//                 </p>
//               </div>
//             </div>

//             {/* FOOD 3 */}
//             <div className="group relative overflow-hidden rounded-2xl">
//               <img
//                 src="/Image/food-picture/food-19.jpg"
//                 alt="Khmer Snack"
//                 className="
//                   h-[160px]
//                   w-full
//                   object-cover
//                   transition-transform
//                   duration-700
//                   ease-out
//                   group-hover:scale-110
//                 "
//               />

//               <div
//                 className="
//                   pointer-events-none
//                   absolute
//                   inset-0
//                   bg-gradient-to-t
//                   from-black/80
//                   via-black/20
//                   to-transparent
//                   opacity-0
//                   transition-opacity
//                   duration-500
//                   group-hover:opacity-100
//                 "
//               />

//               <div
//                 className="
//                   pointer-events-none
//                   absolute
//                   inset-x-0
//                   bottom-0
//                   z-10
//                   translate-y-5
//                   p-4
//                   opacity-0
//                   transition-all
//                   duration-500
//                   group-hover:translate-y-0
//                   group-hover:opacity-100
//                 "
//               >
//                 <p className="text-lg font-semibold text-white">បុណ្យអុំទូក</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ======================================
//             COLUMN 3
//         ======================================= */}
//         <div data-aos="zoom-in" data-aos-delay="300" className="h-full">
//           <div className="group relative  h-[340px] overflow-hidden rounded-2xl shadow-md">
//             <img
//               src="/Image/food-picture/food-22.jpg"
//               alt="Khmer Dumpling"
//               className="
//                 h-[340px]
//                 w-full
//                 object-cover
//                 transition-transform
//                 duration-700
//                 ease-out
//                 group-hover:scale-110
//               "
//             />

//             <div
//               className="
//                 pointer-events-none
//                 absolute
//                 inset-0
//                 bg-gradient-to-t
//                 from-black/80
//                 via-black/20
//                 to-transparent
//                 opacity-0
//                 transition-opacity
//                 duration-500
//                 group-hover:opacity-100
//               "
//             />

//             <div
//               className="
//                 pointer-events-none
//                 absolute
//                 inset-x-0
//                 bottom-0
//                 z-10
//                 translate-y-6
//                 p-5
//                 opacity-0
//                 transition-all
//                 duration-500
//                 ease-out
//                 group-hover:translate-y-0
//                 group-hover:opacity-100
//               "
//             >
//               <p className="text-xl font-semibold text-white">រដូវវស្សា</p>
//             </div>
//           </div>
//         </div>

//         {/* ======================================
//             COLUMN 4
//         ======================================= */}
//         <div data-aos="zoom-in" data-aos-delay="400" className="h-full">
//           <div className="group relative h-[340px] overflow-hidden rounded-2xl shadow-md">
//             <img
//               src="/Image/food-picture/food-25.jpg"
//               alt="Seasonal Pasta"
//               className="
//                 h-[340px]
//                 w-full
//                 object-cover
//                 transition-transform
//                 duration-700
//                 ease-out
//                 group-hover:scale-110
//               "
//             />

//             <div
//               className="
//                 pointer-events-none
//                 absolute
//                 inset-0
//                 bg-gradient-to-t
//                 from-black/80
//                 via-black/20
//                 to-transparent
//                 opacity-0
//                 transition-opacity
//                 duration-500
//                 group-hover:opacity-100
//               "
//             />

//             <div
//               className="
//                 pointer-events-none
//                 absolute
//                 inset-x-0
//                 bottom-0
//                 z-10
//                 translate-y-6
//                 p-5
//                 opacity-0
//                 transition-all
//                 duration-500
//                 ease-out
//                 group-hover:translate-y-0
//                 group-hover:opacity-100
//               "
//             >
//               <p className="text-xl font-semibold text-white">រដូវក្តៅ</p>
//             </div>
//           </div>
//         </div>

//         {/* ======================================
//             COLUMN 5
//         ======================================= */}
//         <div
//           data-aos="zoom-in"
//           data-aos-delay="400"
//           className=" h-[340px] max-sm:col-span-2"
//         >
//           <div className="group relative h-full overflow-hidden rounded-2xl shadow-md">
//             <img
//               src="/Image/food-picture/food-24.jpg"
//               alt="Seasonal Penne"
//               className="
//                 h-[340px]
//                 w-full
//                 object-cover
//                 transition-transform
//                 duration-700
//                 ease-out
//                 group-hover:scale-110
//               "
//             />

//             <div
//               className="
//                 pointer-events-none
//                 absolute
//                 inset-0
//                 bg-gradient-to-t
//                 from-black/80
//                 via-black/20
//                 to-transparent
//                 opacity-0
//                 transition-opacity
//                 duration-500
//                 group-hover:opacity-100
//               "
//             />

//             <div
//               className="
//                 pointer-events-none
//                 absolute
//                 inset-x-0
//                 bottom-0
//                 z-10
//                 translate-y-6
//                 p-5
//                 opacity-0
//                 transition-all
//                 duration-500
//                 ease-out
//                 group-hover:translate-y-0
//                 group-hover:opacity-100
//               "
//             >
//               <p className="text-xl font-semibold text-white">រដូវរងា</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useGetSeasonBannersQuery } from "@/app/store/bannerApi";
import { resolveBannerImageUrl } from "@/lib/banner-media";

const DEFAULT_SEASON_CARDS = [
  {
    title: "បុណ្យភ្ជុំបិណ្ឌ",
    image: "/Image/food-picture/food-21.webp",
    link: "/food-page?event=pchum-ben",
    alt: "Fish Amok",
  },
  {
    title: "បុណ្យចូលឆ្នាំខ្មែរ",
    image: "/Image/food-picture/food-20.jpg",
    link: "/food-page?event=khmer-new-year",
    alt: "Khmer Seasonal Dish",
  },
  {
    title: "បុណ្យអុំទូក",
    image: "/Image/food-picture/food-19.jpg",
    link: "/food-page?event=water-festival",
    alt: "Khmer Snack",
  },
  {
    title: "រដូវវស្សា",
    image: "/Image/food-picture/food-22.jpg",
    link: "/food-page?season=rainy",
    alt: "Khmer Dumpling",
  },
  {
    title: "រដូវក្តៅ",
    image: "/Image/food-picture/food-25.jpg",
    link: "/food-page?season=dry",
    alt: "Seasonal Pasta",
  },
  {
    title: "រដូវរងា",
    image: "/Image/food-picture/food-24.jpg",
    link: "/food-page?season=cool",
    alt: "Seasonal Penne",
  },
];

export default function EventSection() {
  const { data: seasonBanners } = useGetSeasonBannersQuery();

  const items = useMemo(() => {
    if (seasonBanners && seasonBanners.length > 0) {
      return seasonBanners.map((b, idx) => ({
        id: b.id || `season-b-${idx}`,
        title: b.title || `រដូវកាល ${idx + 1}`,
        image: resolveBannerImageUrl(
          b,
          DEFAULT_SEASON_CARDS[idx % DEFAULT_SEASON_CARDS.length].image,
        ),
        link: "/food-page",
        alt: b.title || "Seasonal Banner",
      }));
    }
    return DEFAULT_SEASON_CARDS.map((c, idx) => ({
      ...c,
      id: `default-season-${idx}`,
    }));
  }, [seasonBanners]);

  return (
    <div className="py-12.5 max-sm:py-6">
      {/* =========================================
          SECTION HEADER
      ========================================== */}
      <section className="container max-sm:px-3 relative z-20 mx-auto flex w-full max-w-7xl flex-col items-center justify-center max-md:gap-6 md:gap-12.5 md:pb-12.5">
        <p className="lg:text-6xl  py-2 py-2 md:text-4xl max-md:text-2xl text-center dark:text-[#22a447] font-semibold text-primary-800 dark:text-primary-dark">
          ចំណីអាហារ
          <span className="text-secondary-500">ប្រចាំតំបន់</span>
        </p>
        <p className="lg:text-[24px] md:text-[20px] text-center  font-light text-gray-700 dark:text-gray-100 max-md:text-[16px]">
          ស្វែងរកមុខម្ហូប និងភេសជ្ជៈល្បីៗពីភ្នំពេញ សៀមរាប និងតំបន់ផ្សេងៗ
          <br className="md:block max-md:hidden" />
          ដើម្បីស្វែងយល់ពីរសជាតិពេញនិយមដែលអ្នកមិនគួររំលង។
        </p>
      </section>

      {/* =========================================
          SEASONAL FOOD GRID
      ========================================== */}
      <div
        data-aos="fade-up"
        data-aos-delay="150"
        className="
          container
          mx-auto
          grid
          max-w-7xl
          grid-cols-2
          items-center
          gap-4
          px-4
          sm:grid-cols-2
          md:grid-cols-5
          lg:px-0 max-sm:pt-8
        "
      >
        {/* ======================================
            LEFT CONTENT (COLUMN 1)
        ======================================= */}
        <div
          data-aos="fade-right"
          data-aos-delay="150"
          className="flex h-full flex-col justify-between"
        >
          <div className="mb-6 pl-0.5">
            <p className="mb-4 text-[26px] font-bold leading-tight text-primary-800 dark:text-primary-dark md:text-[22px] lg:text-[36px]">
              ចំណីអាហារស្រប <br />
              <span className="text-secondary-500">តាមរដូវកាលខ្មែរ</span>
            </p>

            <p className="text-xl text-gray-500 dark:text-white max-lg:text-[16px]">
              ស្វែងរកមុខម្ហូបដែលសមស្របនឹងរដូវកាលនីមួយៗ
            </p>
          </div>

          {/* ITEM 0 */}
          <Link
            href={items[0]?.link || "/food-page"}
            className="
              group
              relative
              block
              cursor-pointer
              overflow-hidden
              rounded-2xl
              shadow-md
              transition
              hover:shadow-xl
            "
          >
            <img
              src={items[0]?.image || "/Image/food-picture/food-21.webp"}
              alt={items[0]?.alt || "Fish Amok"}
              className="
                h-40
                w-full
                object-cover
                transition-transform
                duration-700
                ease-out
                group-hover:scale-110
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-t
                from-black/85
                via-black/30
                to-transparent
                opacity-0
                transition-opacity
                duration-500
                group-hover:opacity-100
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                bottom-0
                z-10
                translate-y-4
                p-4
                opacity-0
                transition-all
                duration-500
                ease-out
                group-hover:translate-y-0
                group-hover:opacity-100
              "
            >
              <p className="text-lg font-bold text-white">{items[0]?.title}</p>
            </div>
          </Link>
        </div>

        {/* ======================================
            COLUMN 2 (ITEMS 1 & 2)
        ======================================= */}
        <div data-aos="fade-up" data-aos-delay="250">
          <div className="flex flex-col justify-between gap-4 overflow-hidden rounded-2xl">
            {/* ITEM 1 */}
            <Link
              href={items[1]?.link || "/food-page"}
              className="group relative block cursor-pointer overflow-hidden rounded-2xl shadow-md transition hover:shadow-xl"
            >
              <img
                src={items[1]?.image || "/Image/food-picture/food-20.jpg"}
                alt={items[1]?.alt || "Khmer Seasonal Dish"}
                className="
                  h-40
                  w-full
                  object-cover
                  transition-transform
                  duration-700
                  ease-out
                  group-hover:scale-110
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/85
                  via-black/30
                  to-transparent
                  opacity-0
                  transition-opacity
                  duration-500
                  group-hover:opacity-100
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-x-0
                  bottom-0
                  z-10
                  translate-y-4
                  p-4
                  opacity-0
                  transition-all
                  duration-500
                  ease-out
                  group-hover:translate-y-0
                  group-hover:opacity-100
                "
              >
                <p className="text-lg font-bold text-white">
                  {items[1]?.title}
                </p>
              </div>
            </Link>

            {/* ITEM 2 */}
            <Link
              href={items[2]?.link || "/food-page"}
              className="group relative block cursor-pointer overflow-hidden rounded-2xl shadow-md transition hover:shadow-xl"
            >
              <img
                src={items[2]?.image || "/Image/food-picture/food-19.jpg"}
                alt={items[2]?.alt || "Khmer Snack"}
                className="
                  h-[160px]
                  w-full
                  object-cover
                  transition-transform
                  duration-700
                  ease-out
                  group-hover:scale-110
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/85
                  via-black/30
                  to-transparent
                  opacity-0
                  transition-opacity
                  duration-500
                  group-hover:opacity-100
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-x-0
                  bottom-0
                  z-10
                  translate-y-4
                  p-4
                  opacity-0
                  transition-all
                  duration-500
                  ease-out
                  group-hover:translate-y-0
                  group-hover:opacity-100
                "
              >
                <p className="text-lg font-bold text-white">
                  {items[2]?.title}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* ======================================
            COLUMN 3 (ITEM 3)
        ======================================= */}
        <div data-aos="zoom-in" data-aos-delay="300" className="h-full">
          <Link
            href={items[3]?.link || "/food-page"}
            className="group relative block cursor-pointer overflow-hidden rounded-2xl shadow-md transition hover:shadow-xl"
          >
            <img
              src={items[3]?.image || "/Image/food-picture/food-22.jpg"}
              alt={items[3]?.alt || "Khmer Dumpling"}
              className="
             sm:h-[340px] max-sm:h-40 
                  w-full
                  object-cover
                  transition-transform
                  duration-700
                  ease-out
                  group-hover:scale-110
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-t
                from-black/85
                via-black/30
                to-transparent
                opacity-0
                transition-opacity
                duration-500
                group-hover:opacity-100
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                bottom-0
                z-10
                translate-y-5
                p-5
                opacity-0
                transition-all
                duration-500
                ease-out
                group-hover:translate-y-0
                group-hover:opacity-100
              "
            >
              <p className="text-xl font-bold text-white">{items[3]?.title}</p>
            </div>
          </Link>
        </div>

        {/* ======================================
            COLUMN 4 (ITEM 4)
        ======================================= */}
        <div data-aos="zoom-in" data-aos-delay="400" className="h-full">
          <Link
            href={items[4]?.link || "/food-page"}
            className="group relative block cursor-pointer overflow-hidden rounded-2xl shadow-md transition hover:shadow-xl"
          >
            <img
              src={items[4]?.image || "/Image/food-picture/food-25.jpg"}
              alt={items[4]?.alt || "Seasonal Pasta"}
              className="
                  sm:h-[340px] max-sm:h-40 
                  w-full
                  object-cover
                  transition-transform
                  duration-700
                  ease-out
                  group-hover:scale-110
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-t
                from-black/85
                via-black/30
                to-transparent
                opacity-0
                transition-opacity
                duration-500
                group-hover:opacity-100
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                bottom-0
                z-10
                translate-y-5
                p-5
                opacity-0
                transition-all
                duration-500
                ease-out
                group-hover:translate-y-0
                group-hover:opacity-100
              "
            >
              <p className="text-xl font-bold text-white">{items[4]?.title}</p>
            </div>
          </Link>
        </div>

        {/* ======================================
            COLUMN 5 (ITEM 5)
        ======================================= */}
        <div
          data-aos="zoom-in"
          data-aos-delay="400"
          className="md:h-[340px] max-sm:col-span-2"
        >
          <Link
            href={items[5]?.link || "/food-page"}
            className="group relative block cursor-pointer overflow-hidden rounded-2xl shadow-md transition hover:shadow-xl"
          >
            <img
              src={items[5]?.image || "/Image/food-picture/food-24.jpg"}
              alt={items[5]?.alt || "Seasonal Penne"}
              className="
                sm:h-[340px] max-sm:h-40 
                w-full
                object-cover
                transition-transform
                duration-700
                ease-out
                group-hover:scale-110
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-t
                from-black/85
                via-black/30
                to-transparent
                opacity-0
                transition-opacity
                duration-500
                group-hover:opacity-100
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                bottom-0
                z-10
                translate-y-5
                p-5
                opacity-0
                transition-all
                duration-500
                ease-out
                group-hover:translate-y-0
                group-hover:opacity-100
              "
            >
              <p className="text-xl font-bold text-white">{items[5]?.title}</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
