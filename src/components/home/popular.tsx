// import React from "react";
// import Image from "next/image";
// import FireflyButton from "@/components/ui/firefly-button";
// import CurvedLoop from "../CurvedLoop";
// export default function PopularSection() {
//   return (
//     <div className="my-15 ">
//       
//       <section className="  flex flex-col items-center justify-center md:gap-12.5 max-md:gap-6 container  max-7-xl mx-auto   relative z-20   w-full">
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
//       {/* <CurvedLoop
//         marqueeText="ស្វែងរកមុខម្ហូបនៅជិតអ្នកបំផុត"
//         speed={2}
//         curveAmount={-170}
//         direction="left"
//         interactive
//         className="custom-text-style"
//       /> */}
//       <div className="flex  pt-20 justify-center lg:max-w-7xl  mx-auto">
//         <Image
//           width={235}
//           height={285}
//           className="border-6 object-cover z-7 lg:w-[235px]  lg:h-[285px] md:w-[170px] md:h-[220px] max-md:h-[110px] max-md:w-[85px] max-md:h-[130px] max-md:w-[100px] mt-6 -rotate-[10deg] border-white shadow-md rounded-[24px]"
//           src="/Image/food-picture/card 4.jpg"
//           alt="Popular"
//         />
//         <Image
//           width={235}
//           height={285}
//           className="border-6 object-cover z-6 lg:w-[235px] lg:h-[285px] md:w-[170px] md:h-[220px] max-md:h-[110px] max-md:w-[85px] max-md:h-[130px] max-md:w-[100px] -rotate-3 -mt-6 -ml-10 border-white shadow-md rounded-[24px]"
//           src="/Image/food-picture/drink 1.jpg"
//           alt="Popular"
//         />
//         <Image
//           width={235}
//           height={285}
//           className="border-6 object-fill z-5 lg:w-[235px] lg:h-[285px] md:w-[170px] md:h-[220px] max-md:h-[110px] max-md:w-[85px] max-md:h-[130px] max-md:w-[100px] -rotate-1 -ml-10 border-white shadow-md rounded-[24px]"
//           src="/Image/food-picture/card 2.jpg"
//           alt="Popular"
//         />
//         <Image
//           width={235}
//           height={285}
//           className="border-6 object-cover z-4 lg:w-[235px] lg:h-[285px] md:w-[170px] md:h-[220px] max-md:h-[110px] max-md:w-[85px] max-md:h-[130px] max-md:w-[100px]  rotate-2 -mt-6 -ml-10 border-white shadow-md rounded-[24px]"
//           src="/Image/food-picture/card 3.jpg"
//           alt="Popular"
//         />
//         <Image
//           width={235}
//           height={285}
//           className="border-6 object-cover z-2 lg:w-[235px] lg:h-[285px] md:w-[170px] md:h-[220px] max-md:h-[110px] max-md:w-[85px] max-md:h-[130px] max-md:w-[100px] rotate-5 mt-4  -ml-10 border-white shadow-md rounded-[24px]"
//           src="/Image/food-picture/drink 2.jpg"
//           alt="Popular"
//         />
//         <Image
//           width={235}
//           height={285}
//           className="border-6 object-cover z-1 lg:w-[235px] lg:h-[285px] md:w-[170px] md:h-[220px] max-md:h-[110px] max-md:w-[85px] max-md:h-[130px] max-md:w-[100px] -ml-10 rotate-10 border-white shadow-md rounded-[24px]"
//           src="/Image/food-picture/card 6.jpg"
//           alt="Popular"
//         />
//       </div>
//       {/* <div className="container max-w-7xl mx-auto">
//         <FireflyButton
//           text="ណែនាំមុខម្ហូប "
//           backgroundColor="#ffa500"
//           textColor="#ffffff"
//           glowColor="#ff4500"
//           fireflyCount={40}
//           className="cursor-pointer mx-auto  mt-8 "
//           onClick={() => alert("Glowing button clicked!")}
//         />
//       </div> */}
//     </div>
//   );
// }
"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import FireflyButton from "@/components/ui/firefly-button";
import CurvedLoop from "../CurvedLoop";
import { EASE_SOFT, VIEWPORT, group, riseReveal } from "@/lib/reveal";

/* =========================================================
   THE STACK

   Rotation used to live in a Tailwind class, but framer writes
   its own inline transform and would wipe it out. So the angle
   is data now — which is what lets the cards fan OUT from a
   gathered stack instead of just sliding up already fanned.
========================================================= */

const CARDS = [
  {
    src: "/Image/food-picture/card 4.jpg",
    rotate: -10,
    fit: "object-cover",
    layout: "z-7 mt-6",
  },
  {
    src: "/Image/food-picture/drink 1.jpg",
    rotate: -3,
    fit: "object-cover",
    layout: "z-6 -mt-6 -ml-10",
  },
  {
    src: "/Image/food-picture/card 2.jpg",
    rotate: -1,
    fit: "object-fill",
    layout: "z-5 -ml-10",
  },
  {
    src: "/Image/food-picture/card 3.jpg",
    rotate: 2,
    fit: "object-cover",
    layout: "z-4 -mt-6 -ml-10",
  },
  {
    src: "/Image/food-picture/drink 2.jpg",
    rotate: 5,
    fit: "object-cover",
    layout: "z-2 mt-4 -ml-10",
  },
  {
    src: "/Image/food-picture/card 6.jpg",
    rotate: 10,
    fit: "object-cover",
    layout: "z-1 -ml-10",
  },
];

/** how far each card is pulled toward the centre before it deals out */
const gather = (index: number) => ((CARDS.length - 1) / 2 - index) * 26;

type CardCustom = { rotate: number; from: number };

/*
 * Transform only. The card is fully visible the whole time —
 * it travels and rotates into place, it never fades up.
 */
const cardReveal: Variants = {
  hidden: (card: CardCustom) => ({
    y: 80,
    x: card.from,
    rotate: 0,
    scale: 0.9,
  }),
  show: (card: CardCustom) => ({
    y: 0,
    x: 0,
    rotate: card.rotate,
    scale: 1,
    transition: { duration: 0.9, ease: EASE_SOFT },
  }),
};

export default function PopularSection() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="my-15 ">
      
      <motion.section
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={VIEWPORT}
        variants={group()}
        className="  flex flex-col items-center justify-center md:gap-12.5 max-md:gap-6 container  max-7-xl mx-auto   relative z-20   w-full"
      >
        <motion.p
          variants={riseReveal}
          className="lg:text-6xl  py-6 md:text-4xl max-md:text-2xl text-center dark:text-[#22a447] font-semibold text-primary-800 dark:text-primary-dark"
        >
          បទពិសោធន៍ថ្មីក្នុង
          <span className="text-secondary-500">ការស្វែងរកអាហារ</span>
        </motion.p>
        <motion.p
          variants={riseReveal}
          className="lg:text-[24px] md:text-[20px] text-center  font-light text-gray-700 dark:text-gray-100 max-md:text-[16px]"
        >
          ស្វែងរកមុខម្ហូប និងហាងអាហារដែលសមនឹងអ្នក តាមរយៈ <br />
          ប្រព័ន្ធណែនាំឆ្លាតវៃ ដែលគិតគូរពីចំណូលចិត្ត អាឡែស៊ី របបអាហារ ជំនឿសាសនា
          និងទីតាំងរបស់អ្នក
        </motion.p>
      </motion.section>
      {/* <CurvedLoop
        marqueeText="ស្វែងរកមុខម្ហូបនៅជិតអ្នកបំផុត"
        speed={2}
        curveAmount={-170}
        direction="left"
        interactive
        className="custom-text-style"
      /> */}
      <motion.div
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={VIEWPORT}
        variants={group(0.09, 0.06)}
        className="flex pt-12 md:pt-20 justify-center lg:max-w-7xl mx-auto overflow-hidden px-2 sm:px-4"
      >
        {CARDS.map((card, index) => (
          <motion.div
            key={card.src}
            custom={{ rotate: card.rotate, from: gather(index) }}
            variants={cardReveal}
            whileHover={
              reduceMotion
                ? undefined
                : {
                    y: -14,
                    scale: 1.04,
                    transition: { duration: 0.35, ease: EASE_SOFT },
                  }
            }
            style={{ willChange: "transform" }}
            className={`shrink-0 ${card.layout}`}
          >
            <Image
              width={235}
              height={285}
              className={`border-4 sm:border-6 ${card.fit} lg:w-[235px] lg:h-[285px] md:w-[170px] md:h-[220px] max-md:h-[110px] max-md:w-[78px] sm:max-md:h-[130px] sm:max-md:w-[100px] border-white shadow-md rounded-[16px] sm:rounded-[24px]`}
              src={card.src}
              alt="Popular"
            />
          </motion.div>
        ))}
      </motion.div>
      {/* <div className="container max-w-7xl mx-auto">
        <FireflyButton
          text="ណែនាំមុខម្ហូប "
          backgroundColor="#ffa500"
          textColor="#ffffff"
          glowColor="#ff4500"
          fireflyCount={40}
          className="cursor-pointer mx-auto  mt-8 "
          onClick={() => alert("Glowing button clicked!")}
        />
      </div> */}
    </div>
  );
}
