"use client";
import React from "react";
import { IconCloudDemoWithImageLogo } from "../ui/icon-cloud-demo-3";
import { motion } from "motion/react";
export default function TechnologiesSection() {
  return (
    <div>
      <div className=" container py-12.5 mx-auto max-w-7xl flex lg:flex-row   max-lg:flex-col max-lg:items-center max-lg:justify-center lg:items-center justify-between ">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex lg:text-start max-lg:items-center max-lg:text-center flex-col gap-12.5"
        >
          <motion.p
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:text-7xl text-start md:text-[38px] max-md:text-[30px] font-bold dark:text-primary-dark text-primary-800"
          >
            បច្ចេកវិទ្យា
            <span className="text-secondary-400">ដែលពួកយើងប្រើ</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="md:text-[20px] text-gray-700 dark:text-gray-100"
          >
            ប្រើប្រាស់បច្ចេកវិទ្យាទំនើប
            និងប្រព័ន្ធឆ្លាតវៃដើម្បីផ្តល់បទពិសោធន៍លឿន
            <br className="md:block max-md:hidden" />
            ងាយស្រួល និងមានសុវត្ថិភាពសម្រាប់អ្នកប្រើប្រាស់។
          </motion.p>

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-primary-800 w-fit text-accent-400 px-8 py-3 rounded-full text-[20px]"
          >
            See More
          </motion.button>
        </motion.div>
        <IconCloudDemoWithImageLogo />
      </div>
    </div>
  );
}
