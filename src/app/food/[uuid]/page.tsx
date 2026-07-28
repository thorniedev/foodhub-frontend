"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FaArrowLeft,
  FaBookmark,
  FaMapMarkerAlt,
  FaStar,
  FaStore,
} from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import { MdDeliveryDining, MdRestaurantMenu } from "react-icons/md";
import { useGetFoodByIdQuery, useGetFoodsQuery } from "@/redux/api/foodApi";

export default function FoodDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const { data: food, isLoading, isError } = useGetFoodByIdQuery(id);
  const { data: allFoods = [] } = useGetFoodsQuery();

  if (isLoading) {
    return <p className="text-center py-20">កំពុងផ្ទុក...</p>;
  }

  if (isError || !food) {
    return <p className="text-center py-20">រកមិនឃើញមុខម្ហូបនេះទេ</p>;
  }

  const relatedFoods = allFoods
    .filter(
      (item) =>
        item.id !== food.id &&
        item.foodTypes.some((type) => food.foodTypes.includes(type)),
    )
    .slice(0, 3);

  return (
    <main className="bg-zinc-50 min-h-screen">
      <section className="max-w-7xl mt-20 mx-auto px-5 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary-800 hover:text-primary-600 font-medium mb-8"
        >
          <FaArrowLeft />
          ត្រឡប់ក្រោយ
        </Link>

        <div className="grid lg:grid-cols-2 gap-14">
          <div>
            <div className="relative overflow-hidden rounded-[40px] shadow-xl">
              <Image
                src={food.image}
                alt={food.name}
                width={700}
                height={600}
                className="w-full h-[520px] object-cover"
                priority
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between">
              <div>
                <div className="flex items-center gap-2 text-secondary-500">
                  <FaStore />
                  <span>{food.store}</span>
                </div>
                <h1 className="text-5xl font-bold text-primary-900 mt-3">
                  {food.name}
                </h1>
              </div>
              <button className="w-14 h-14 rounded-full bg-primary-800 text-white flex items-center justify-center hover:scale-110 transition">
                <FaBookmark />
              </button>
            </div>

            <div className="flex flex-wrap gap-6 mt-8">
              <div className="flex items-center gap-2">
                <FaStar className="text-yellow-400" />
                <span>{food.rating}</span>
              </div>
              <div className="flex items-center gap-2">
                <IoMdTime />
                <span>{food.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MdDeliveryDining />
                <span>{food.distance}</span>
              </div>
            </div>

            <h2 className="text-5xl font-bold text-primary-800 mt-8">
              {food.price}$
            </h2>

            <div className="flex flex-wrap gap-3 mt-8">
              {food.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 rounded-full bg-primary-800 text-white text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-10">
              <h3 className="text-2xl font-bold text-primary-900">
                អំពីមុខម្ហូប
              </h3>
              <p className="text-gray-600 leading-8 mt-4">{food.description}</p>
            </div>

            <div className="mt-10">
              <h3 className="text-2xl font-bold text-primary-900 mb-4">
                ប្រភេទម្ហូប
              </h3>
              <div className="flex flex-wrap gap-3">
                {food.foodTypes.map((item) => (
                  <span
                    key={item}
                    className="bg-secondary-100 text-secondary-700 px-4 py-2 rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-2xl font-bold text-primary-900 mb-4">
                ភេសជ្ជៈដែលណែនាំ
              </h3>
              <div className="flex gap-3 flex-wrap">
                {food.drinkTypes.map((item) => (
                  <span
                    key={item}
                    className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-2xl font-bold text-primary-900 mb-4">
                សាកសមសម្រាប់
              </h3>
              <div className="flex gap-3 flex-wrap">
                {food.ageGroups.map((item) => (
                  <span
                    key={item}
                    className="bg-green-50 text-green-700 px-4 py-2 rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mt-12">
              <button className="bg-primary-800 hover:bg-primary-700 transition text-white px-8 py-4 rounded-full font-semibold">
                រក្សាទុក
              </button>
              <button className="border border-primary-800 text-primary-800 hover:bg-primary-800 hover:text-white transition px-8 py-4 rounded-full font-semibold flex items-center gap-2">
                <FaMapMarkerAlt />
                ទីតាំងហាង
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 py-8">
        <div className="bg-white rounded-[32px] shadow-sm p-8">
          <h2 className="text-3xl font-bold text-primary-900 mb-8">
            ព័ត៌មានអាហារូបត្ថម្ភ
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="rounded-3xl bg-orange-50 p-6">
              <p className="text-gray-500">Calories</p>
              <h3 className="text-3xl font-bold mt-2">420 kcal</h3>
            </div>
            <div className="rounded-3xl bg-green-50 p-6">
              <p className="text-gray-500">Protein</p>
              <h3 className="text-3xl font-bold mt-2">24 g</h3>
            </div>
            <div className="rounded-3xl bg-blue-50 p-6">
              <p className="text-gray-500">Carbs</p>
              <h3 className="text-3xl font-bold mt-2">48 g</h3>
            </div>
            <div className="rounded-3xl bg-yellow-50 p-6">
              <p className="text-gray-500">Fat</p>
              <h3 className="text-3xl font-bold mt-2">13 g</h3>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 py-12">
        <div className="flex items-center gap-3 mb-8">
          <MdRestaurantMenu className="text-3xl text-primary-800" />
          <h2 className="text-3xl font-bold text-primary-900">
            មុខម្ហូបដែលអ្នកប្រហែលជាចូលចិត្ត
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {relatedFoods.map((item) => (
            <Link
              key={item.id}
              href={`/food/${item.id}`}
              className="bg-white rounded-[28px] overflow-hidden shadow hover:-translate-y-2 transition"
            >
              <Image
                src={item.image}
                alt={item.name}
                width={500}
                height={350}
                className="w-full h-60 object-cover"
              />
              <div className="p-5">
                <h3 className="font-bold text-xl text-primary-900">
                  {item.name}
                </h3>
                <p className="text-gray-500 mt-2">{item.store}</p>
                <div className="flex justify-between mt-5">
                  <span className="text-primary-800 font-bold">
                    {item.price}$
                  </span>
                  <span className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    {item.rating}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
