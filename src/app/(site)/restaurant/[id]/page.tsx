"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

import RestaurantHero from "@/components/restaurant/RestaurantHero";
import RestaurantCategorySidebar from "@/components/restaurant/RestaurantCategorySidebar";
// import RestaurantLocationMap from "@/components/restaurant/RestaurantLocationMap";
import RestaurantMenuSection from "@/components/restaurant/RestaurantMenuSection";
import VoucherCard from "@/components/restaurant/VoucherCard";
import { useGetRestaurantByIdQuery } from "@/app/store/restaurantApi";

export default function RestaurantDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const {
    data: restaurant,
    isLoading,
    isError,
  } = useGetRestaurantByIdQuery(id, { skip: Number.isNaN(id) });

  if (isLoading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-zinc-50">
        <p className="text-gray-400">កំពុងផ្ទុកព័ត៌មានហាង...</p>
      </main>
    );
  }

  if (isError || !restaurant) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-zinc-50 px-4 text-center">
        <p className="text-lg font-semibold text-gray-600">រកមិនឃើញហាងនេះទេ</p>
        <Link
          href="/"
          className="rounded-full bg-primary-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition"
        >
          ត្រឡប់ទៅទំព័រដើម
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 pt-14">
      <div className="mx-auto max-w-360 px-4 py-6 sm:px-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary-800 hover:text-primary-600"
        >
        <FaArrowLeft />
          ត្រឡប់ក្រោយ
        </Link>

        <div className="grid gap-6 lg:grid-cols-[224px_1fr_1fr] lg:items-start lg:gap-8">
          {/* Category nav: horizontal chip row on mobile/tablet, sticky
              vertical rail on desktop — RestaurantCategorySidebar renders
              the right variant itself based on breakpoint. */}
          <RestaurantCategorySidebar categories={restaurant.categories} />

          {/* Center: hero + vouchers + menu sections */}
          <div className="flex min-w-0 flex-col gap-8">
            <RestaurantHero restaurant={restaurant} />

            {restaurant.vouchers.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-primary-900">
                    បញ្ចុះតម្លៃពិសេសសម្រាប់អ្នក
                  </h2>
                  <Link
                    href="#"
                    className="text-sm font-medium text-secondary-500 hover:underline"
                  >
                    មើលទាំងអស់
                  </Link>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {restaurant.vouchers.map((voucher) => (
                    <VoucherCard key={voucher.id} voucher={voucher} />
                  ))}
                </div>
              </section>
            )}

            <div className="flex flex-col gap-10">
              {restaurant.categories.map((category) => (
                <RestaurantMenuSection key={category.key} category={category} />
              ))}
            </div>
          </div>
          {/* Right: sticky location map (desktop), toggled panel (mobile)
          {/* <div className="lg:sticky lg:top-6 h-fit self-start"> */}
          {/* <div className="h-fit self-start">
            <RestaurantLocationMap
              name={restaurant.name}
              address={restaurant.address}
              latitude={restaurant.latitude}
              longitude={restaurant.longitude}
            />
          </div> */}
        </div>
      </div>
    </main>
  );
}
