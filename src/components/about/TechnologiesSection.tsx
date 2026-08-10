import React from "react";
import { IconCloudDemoWithImageLogo } from "../ui/icon-cloud-demo-3";

export default function TechnologiesSection() {
  return (
    <div>
      <div className=" container py-12.5 mx-auto max-w-7xl flex lg:flex-row   max-lg:flex-col max-lg:items-center max-lg:justify-center lg:items-center justify-between ">
        <div className="flex lg:text-start max-lg:items-center max-lg:text-center  flex-col gap-12.5">
          <p className="lg:text-7xl  text-start md:text-[38px] max-md:text-[30px] font-bold  dark:text-primary-dark text-primary-800 dark:text-primary-dark">
            បច្ចេកវិទ្យា
            <span className="text-secondary-400">ដែលពួកយើងប្រើ</span>
          </p>
          <p className="md:text-[20px]  text-gray-700 dark:text-gray-100">
            ប្រើប្រាស់បច្ចេកវិទ្យាទំនើប
            និងប្រព័ន្ធឆ្លាតវៃដើម្បីផ្តល់បទពិសោធន៍លឿន
            <br className="md:block max-md:hidden" />
            ងាយស្រួល និងមានសុវត្ថិភាពសម្រាប់អ្នកប្រើប្រាស់។
          </p>
          <button className="bg-primary-800 w-fit text-accent-400 px-8 py-3 rounded-full texxt-[20px]">
            See More
          </button>{" "}
          {/*  */}
        </div>
        <IconCloudDemoWithImageLogo />
      </div>
    </div>
  );
}
