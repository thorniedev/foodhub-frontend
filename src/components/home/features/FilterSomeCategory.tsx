import React from "react";
import FoodSearchBar from "./FoodSearchBarComponent";
import { TypingAnimation } from "@/components/ui/typing-animation";

export default function FilterSomeCategory() {
  return (
    <div>
      {" "}
      <section className="mb-10">
        <p
          className="
    text-center
    font-semibold
    text-primary-800
    lg:text-6xl
    py-2
    md:text-5xl
    max-md:text-3xl
    leading-tight
    dark:text-primary-dark
  "
        >
          កំណត់តម្រង
          <br className="sm:hidden max-sm:block" />
          <TypingAnimation
            words={["អាហារសម្រាប់អ្នក", "តាមចំណូលចិត្ត"]}
            blinkCursor
            pauseDelay={2000}
            loop
            className="text-secondary-500 dark:text-orange-400"
          >
            អាហាររបស់អ្នក
          </TypingAnimation>
        </p>

        <p className="mt-5 max-sm:px-2 text-center text-[16px] font-light text-gray-700 dark:text-gray-100 md:text-[20px] lg:text-[24px]">
          ស្វែងរកមុខម្ហូប និងហាងអាហារដែលសមនឹងអ្នក តាមរយៈ
          <br />
          ប្រព័ន្ធណែនាំឆ្លាតវៃ ដែលគិតគូរពីចំណូលចិត្ត អាឡែស៊ី របបអាហារ ជំនឿសាសនា
          និងទីតាំងរបស់អ្នក
        </p>
      </section>
      <FoodSearchBar />
    </div>
  );
}
