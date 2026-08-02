import React from "react";
import FoodSearchBar from "./FoodSearchBar";

export default function FilterByCategory() {
  return (
    <div>
      {" "}
      <section className="flex flex-col items-center justify-center md:gap-12.5 max-md:gap-6 container max-w-7xl mx-auto">
        <p className="lg:text-5xl md:text-4xl max-md:text-2xl text-center dark:text-emerald-400 font-semibold text-primary-800">
          បទពិសោធន៍ថ្មីក្នុង
          <span className="text-secondary-500">ការស្វែងរកអាហារ</span>
        </p>

        <p className="lg:text-[24px] md:text-[20px] text-center font-light text-gray-700 dark:text-gray-100 max-md:text-[16px]">
          ស្វែងរកមុខម្ហូប និងហាងអាហារដែលសមនឹងអ្នក តាមរយៈ
          <br />
          ប្រព័ន្ធណែនាំឆ្លាតវៃ ដែលគិតគូរពីចំណូលចិត្ត អាឡែស៊ី របបអាហារ ជំនឿសាសនា
          និងទីតាំងរបស់អ្នក
        </p>
        <FoodSearchBar />
      </section>
    </div>
  );
}
