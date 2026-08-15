"use client";

import Carousel, { slides } from "@/components/ui/Carosel";
import React from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { EASE_SOFT, VIEWPORT, group, riseReveal } from "@/lib/reveal";

/*
 * The carousel gets a plain rise — no clip-path here.
 * Clipping an ancestor would cut the arrows that sit at
 * -left-5 / -right-5 on wide screens.
 */
const carouselReveal: Variants = {
  hidden: { y: 56, scale: 0.97 },
  show: {
    y: 0,
    scale: 1,
    transition: { duration: 0.9, ease: EASE_SOFT },
  },
};

export default function SeasonSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="lg:pt-8">
      <motion.div
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={VIEWPORT}
        variants={group()}
        className=" z-0 flex pt-8  flex-col items-center justify-center md:gap-12.5 max-md:gap-6 container  max-7-xl mx-auto   relative z-20   w-full"
      >
        <motion.p
          variants={riseReveal}
          className="lg:text-6xl  py-2 py-2 md:text-4xl max-md:text-2xl text-center dark:text-[#22a447] font-semibold text-primary-800 dark:text-primary-dark"
        >
          ចំណីអាហារ
          <span className="text-secondary-500">ប្រចាំតំបន់</span>
        </motion.p>
        <motion.p
          variants={riseReveal}
          className="lg:text-[24px] md:text-[20px] text-center  font-light text-gray-700 dark:text-gray-100 max-md:text-[16px]"
        >
          ស្វែងរកមុខម្ហូប និងភេសជ្ជៈល្បីៗពីភ្នំពេញ សៀមរាប និងតំបន់ផ្សេងៗ
          <br className="lg:block max-lg:hidden" />
          ដើម្បីស្វែងយល់ពីរសជាតិពេញនិយមដែលអ្នកមិនគួររំលង។
        </motion.p>
        <motion.div
          variants={carouselReveal}
          style={{ willChange: "transform" }}
          className="w-full"
        >
          <Carousel
            items={slides}
            autoPlay
            autoPlayInterval={3000}
            autoPlayResumeDelay={1000}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
