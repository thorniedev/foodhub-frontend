import React from "react";

import { motion } from "motion/react";
import Link from "next/link";
export const CircularBadge = () => (
  <div className="relative w-28 h-28 md:w-36 md:h-36 text-white bg-primary-400 rounded-full flex items-center justify-center shadow-xl rotate-12 hover:scale-105 transition-transform cursor-pointer border-[3px] border-black/5">
    <div className="absolute  inset-1 animate-[spin_10s_linear_infinite_reverse]">
      <svg
        fill="ffffff"
        viewBox="0 0 100 100"
        className="w-full fill-white h-full"
      >
        <path
          id="circlePath"
          d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
          fill="none"
        />
        <text
          className="text-[11px] font-black tracking-[0.11em] uppercase"
          fill="white"
        >
          <textPath className="text-white" href="#circlePath" startOffset="0%">
            •ស្វែងរកអាហារជាមួយទីតាំងហាងដែលនៅជិតអ្នក
          </textPath>
        </text>
      </svg>
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className="w-10 h-10 text-white stroke-current overflow-visible"
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20,80 Q 40,50 30,30 T 80,20" />
        <path d="M60,10 L80,20 L70,40" />
      </svg>
    </div>
  </div>
);
export default function LocationSection() {
  return (
    <section className="container md:pb-30 max-md:pb-60 flex  max-md:flex-col  max-md:gap-y-40  md:justify-between  md:items-center lg:pt-6 mx-auto max-w-7xl">
      <div className="flex  relative  flex-col gap-12.5">
        <p className="lg:text-7xl md:text-[38px] max-md:text-[30px] font-bold  text-primary-800 dark:text-primary-dark">
          ស្វែងរកមុខម្ហូបនៅ
          <span className="text-secondary-400">ជិតអ្នកបំផុត</span>
        </p>
        <p className="md:text-[24px]  text-gray-700 dark:text-gray-100">
          ទទួលបានការណែនាំអំពីមុខម្ហូប និងហាងអាហារនៅជិតទីតាំងរបស់អ្នក
          <br className="md:block max-md:hidden" />
          ដើម្បីសន្សំពេលវេលា និងរីករាយជាមួយអាហារដែលអ្នកចូលចិត្ត។
        </p>
        <Link
          href={"/food"}
          className="bg-primary-800 w-fit text-accent-400 px-8 py-3 rounded-full texxt-[20px]"
        >
          ទីតាំងនៅជិតនេះ
        </Link>
        <motion.div
          className="absolute md:-right-45 max-md:rotate-90 max-md:-bottom-10 max-md:self-end  md:top-35"
          animate={{
            y: [0, -10, 0],
            rotate: [5, -5, 5],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <img src="/Image/location-vector.png" alt="Location" />
        </motion.div>
      </div>

      <div className="relative max-md:self-center  ">
        <div className="absolute -top-30 -left-10 md:right-[10%] z-40 pointer-events-auto">
          <CircularBadge />
        </div>
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className=" -mb-50  self-end pointer-events-auto"
        >
          <div className="w-40 md:w-52  ab aspect-3/3.5 bg-white lg:backdrop-blur-xs  rounded-[2rem] p-5 flex flex-col items-center justify-center rotate-[12deg] shadow-md border border-gray-100 hover:rotate-0 transition-transform duration-500">
            <div className="w-16 h-16  md:w-24 md:h-24 bg-[#2C3E50] rounded-full flex items-center justify-center mb-4 shadow-inner border-[3px] border-white/50 overflow-hidden">
              <img
                src="/Image/icon map.png"
                alt="Avatar"
                className="w-full h-full object-cover scale-150"
              />
            </div>
            <div className="text-center text-primary-500 mt-2">
              <p className="font-bold text-sm md:text-lg  ">
                1.ម្ហូបគ្រប់ប្រភេទ
              </p>
              <p className="text-[10px] md:text-base  /80 mt-1">
                23 422 មុខសម្រាប់ជ្រើសរើស
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
