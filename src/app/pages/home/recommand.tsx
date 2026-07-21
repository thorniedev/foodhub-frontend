import React from "react";
import { IoMdTime } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { MdBookmarkBorder } from "react-icons/md";
import { FaStore } from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import { CiHeart } from "react-icons/ci";
const recommendedFoods = [
  {
    id: 1,
    store: "Kongfou Kitchen",
    name: "នំ Tacos",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    price: "2",
    tag: "Halal",
    image: "/Image/card-img.png",
  },
  {
    id: 2,
    store: "Kongfou Kitchen",
    name: "នំ Tacos",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    price: "2",
    tag: "Halal",
    image: "/Image/card-img.png",
  },
  {
    id: 3,
    store: "Kongfou Kitchen",
    name: "នំ Tacos",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    price: "2",
    tag: "Halal",
    image: "/Image/card-img.png",
  },
  {
    id: 4,
    store: "Kongfou Kitchen",
    name: "នំ Tacos",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    price: "2",
    tag: "Halal",
    image: "/Image/card-img.png",
  },
  {
    id: 5,
    store: "Kongfou Kitchen",
    name: "នំ Tacos",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    price: "2",
    tag: "Halal",
    image: "/Image/card-img.png",
  },
  {
    id: 6,
    store: "Kongfou Kitchen",
    name: "នំ Tacos",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    price: "2",
    tag: "Halal",
    image: "/Image/card-img.png",
  },
  {
    id: 7,
    store: "Kongfou Kitchen",
    name: "នំ Tacos",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    price: "2",
    tag: "Halal",
    image: "/Image/card-img.png",
  },
  {
    id: 8,
    store: "Kongfou Kitchen",
    name: "នំ Tacos",
    description: "សូមរីករាយជាមួយមុខម្ហូបដ៏ឈ្ងុយឆ្ងាញ់",
    rating: 4.3,
    time: "10min",
    price: "2",
    tag: "Halal",
    image: "/Image/card-img.png",
  },
];

export default function RecommandSection() {
  return (
    <div className="my-15 flex flex-col gap-12.5">
      <section className="flex flex-col items-center justify-center md:gap-12.5 max-md:gap-6 container max-w-7xl mx-auto">
        <p className="lg:text-5xl md:text-4xl max-md:text-2xl text-center font-semibold text-primary-800">
          បទពិសោធន៍ថ្មីក្នុង
          <span className="text-secondary-500">ការស្វែងរកអាហារ</span>
        </p>

        <p className="lg:text-[24px] md:text-[20px] text-center font-light text-gray-700 max-md:text-[16px]">
          ស្វែងរកមុខម្ហូប និងហាងអាហារដែលសមនឹងអ្នក តាមរយៈ
          <br />
          ប្រព័ន្ធណែនាំឆ្លាតវៃ ដែលគិតគូរពីចំណូលចិត្ត អាឡែស៊ី របបអាហារ ជំនឿសាសនា
          និងទីតាំងរបស់អ្នក
        </p>
      </section>

      <div className="lg:max-w-7xl md:max-w-3xl md:gap-4 container items-center place-items-center mx-auto grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 md:gap-4 max-md:gap-4 lg:gap-6">
        {recommendedFoods.map((food) => (
          <div
            key={food.id}
            className="flex flex-col  w-fit gap-4 bg-white border border-gray-100 shadow-sm rounded-[24px] p-2.5"
          >
            <div className="relative">
              <img
                src={food.image}
                alt={food.name}
                className="rounded-[14px] w-[350px] object-cover"
              />
              <CiHeart className="text-4xl p-2 t  bg-primary-600 font-bold rounded-full top-0 right-0 absolute text-white" />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex text-secondary-400 items-center  gap-2">
                <FaStore />
                <p className=" mt-1 text-[14px]">{food.store}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[24px] font-medium text-primary-800">
                  {food.name}
                </p>
                <p className="text-[24px] font-medium text-secondary-500">
                  {`${food?.price}$`}
                </p>
              </div>

              <p className="text-gray-500 text-[16px]">{food.description}</p>

              <div className="flex gap-4">
                <div className="flex gap-2 items-center text-accent-400">
                  <FaStar />
                  <p className="mt-1">{food.rating}</p>
                </div>
                <div className="flex gap-2 items-center text-primary-400">
                  <IoMdTime />
                  <p>{food.time}</p>
                </div>{" "}
                <div className="flex gap-2 items-center text-primary-400">
                  <MdDeliveryDining className="text-xl" />

                  <p>1.3km</p>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <span className="bg-primary-600 text-gray-100 w-fit px-3 py-1 rounded-full text-sm">
                  ហាឡាល់
                </span>{" "}
                <span className="bg-primary-600 text-gray-100 w-fit px-3 py-1 rounded-full text-sm">
                  អាហារបួស
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
