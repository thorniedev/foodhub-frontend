import React from "react";

export default function EventSection() {
  return (
    <div className="my-15 flex flex-col gap-12.5">
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
      </section>

      <div
        data-aos="fade-up"
        data-aos-delay="150"
        className="grid grid-cols-2 container lg:px-0 md:px-4 mx-auto max-w-7xl sm:grid-cols-2 md:grid-cols-5 gap-4 items-center place-content-center"
      >
        {/* Left Content */}
        <div
          data-aos="fade-right"
          data-aos-delay="150"
          className="flex flex-col justify-between h-full"
        >
          <div className="mb-6 pl-0.5">
            <p className="lg:text-[36px]  md:text-[22px] max-md:text-[26px] font-bold text-primary-800 dark:text-emerald-400 leading-tight mb-4">
              ចំណីអាហារស្រប <br />
              <span className="text-secondary-500">តាមរដូវកាលខ្មែរ</span>
            </p>

            <p className="text-gray-500 dark:text-white max-lg:text-[16px] text-xl">
              ស្វែងរកមុខម្ហូបដែលសមស្របនឹងរដូវកាលនីមួយៗ
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-md">
            <img
              src="/Image/food-picture/food-21.webp"
              alt="New Dish"
              className="w-full h-40 object-cover"
            />
          </div>
        </div>

        {/* Column 2 */}
        <div data-aos="fade-up" data-aos-delay="250">
          <div className="rounded-2xl flex flex-col justify-between gap-4 overflow-hidden">
            <img
              src="/Image/food-picture/food-20.jpg"
              alt="Dishes"
              className="w-full h-40 rounded-2xl object-cover"
            />

            <img
              src="/Image/food-picture/food-19.jpg"
              alt="Snack"
              className="w-full h-40 rounded-2xl object-cover"
            />
          </div>
        </div>

        {/* Column 3 */}
        <div data-aos="zoom-in" data-aos-delay="300" className="h-full">
          <img
            src="/Image/food-picture/food-22.jpg"
            alt="Gyoza"
            className="w-full h-[340px] object-cover rounded-2xl shadow-md"
          />
        </div>

        {/* Column 4 */}
        <div data-aos="zoom-in" data-aos-delay="400" className="h-full">
          <img
            src="/Image/food-picture/food-25.jpg"
            alt="Pasta"
            className="w-full h-[340px] object-cover rounded-2xl shadow-md"
          />
        </div>

        {/* Column 5 */}
        <div
          data-aos="zoom-in"
          data-aos-delay="400"
          className="h-full max-sm:col-span-2"
        >
          <img
            src="/Image/food-picture/food-24.jpg"
            alt="Penne"
            className="w-full h-[340px] object-cover rounded-2xl shadow-md"
          />
        </div>
      </div>
    </div>
  );
}
