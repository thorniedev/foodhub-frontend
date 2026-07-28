import Carousel, { slides } from "@/components/ui/Carosel";
import React from "react";

export default function SeasonSection() {
  return (
    <section>
      {" "}
      <div className="  flex pt-8 flex-col items-center justify-center md:gap-12.5 max-md:gap-6 container  max-7-xl mx-auto   relative z-20   w-full">
        <p className="lg:text-5xl md:text-4xl max-md:text-2xl text-center font-semibold text-primary-800">
          ចំណីអាហារ
          <span className="text-secondary-500">ប្រចាំតំបន់</span>{" "}
        </p>
        <p className="lg:text-[24px] md:text-[20px] text-center  font-light text-gray-700 max-md:text-[16px]">
          ស្វែងរកមុខម្ហូប និងភេសជ្ជៈល្បីៗពីភ្នំពេញ សៀមរាប និងតំបន់ផ្សេងៗ
          <br className="lg:block max-lg:hidden" />{" "}
          ដើម្បីស្វែងយល់ពីរសជាតិពេញនិយមដែលអ្នកមិនគួររំលង។
        </p>
        <Carousel
          items={slides}
          autoPlay
          autoPlayInterval={3000}
          autoPlayResumeDelay={1000}
        />
      </div>
    </section>
  );
}
