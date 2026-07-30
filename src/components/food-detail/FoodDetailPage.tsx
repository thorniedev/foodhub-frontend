"use client";

import { useMemo, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AnimatePresence, motion } from "framer-motion";

import {
  FaArrowLeft,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaRegHeart,
  FaShareAlt,
  FaStar,
  FaStore,
} from "react-icons/fa";

import { IoMdTime } from "react-icons/io";

import {
  IoAlertCircleOutline,
  IoChevronForward,
  IoNutritionOutline,
  IoRefresh,
  IoRestaurantOutline,
} from "react-icons/io5";

import { MdDeliveryDining, MdOutlinePayments } from "react-icons/md";

import { TbFlame, TbLeaf } from "react-icons/tb";

import {
  useGetMenuItemByUuidQuery,
  useGetMenuItemsQuery,
} from "@/app/store/menuApi";

import type { MenuItem } from "@/types/manu";
import FoodCard from "../dynamic-card/FoodCard";

type FoodDetailPageProps = {
  uuid: string;
};

type ScoreBarProps = {
  label: string;
  value: number;
};

function formatPrice(value: number, currencyCode: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode || "USD",
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

function getSpiceLabel(spiceLevel: number) {
  if (spiceLevel <= 0) {
    return "មិនហឹរ";
  }

  if (spiceLevel === 1) {
    return "ហឹរតិច";
  }

  if (spiceLevel === 2) {
    return "ហឹរមធ្យម";
  }

  return "ហឹរខ្លាំង";
}

function ScoreBar({ label, value }: ScoreBarProps) {
  const percentage = Math.round(value * 100);

  return (
    <div className="grid gap-2 sm:grid-cols-[150px_1fr_52px] sm:items-center">
      <p className="text-base font-medium text-gray-600">{label}</p>

      <div className="h-2.5 overflow-hidden rounded-full bg-primary-50">
        <motion.div
          initial={{
            width: 0,
          }}
          whileInView={{
            width: `${percentage}%`,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          className="h-full rounded-full bg-gradient-to-r from-primary-700 to-secondary-500"
        />
      </div>

      <p className="text-base font-semibold text-primary-800 sm:text-right">
        {percentage}%
      </p>
    </div>
  );
}

function InfoPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-base font-medium text-primary-800">
      {children}
    </span>
  );
}

function LoadingPage() {
  return (
    <main className="min-h-screen bg-[#f7f9f7]">
      <div className="mx-auto flex min-h-[600px] max-w-7xl flex-col items-center justify-center gap-5 px-4">
        <motion.div
          className="h-12 w-12 rounded-full border-4 border-primary-100 border-t-primary-800"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <p className="text-base text-gray-500">កំពុងផ្ទុកព័ត៌មានម្ហូប...</p>
      </div>
    </main>
  );
}

function ErrorPage({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="min-h-screen bg-[#f7f9f7]">
      <div className="mx-auto flex min-h-[600px] max-w-7xl flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <IoAlertCircleOutline className="text-4xl text-red-500" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            មិនអាចបង្ហាញព័ត៌មានម្ហូបបានទេ
          </h1>

          <p className="mt-2 text-base text-gray-500">
            សូមពិនិត្យទិន្នន័យ និងព្យាយាមម្តងទៀត។
          </p>
        </div>

        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 rounded-full bg-primary-800 px-6 py-3 text-base font-semibold text-white transition hover:bg-primary-700 active:scale-95"
        >
          <IoRefresh className="text-xl" />
          ព្យាយាមម្តងទៀត
        </button>
      </div>
    </main>
  );
}

function RelatedFoodCard({ food }: { food: MenuItem }) {
  return (
    <motion.article
      layout
      whileHover={{
        y: -5,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 22,
      }}
    >
      <Link href={`/food/${food.uuid}`} className="block">
        <FoodCard food={food} />
      </Link>
    </motion.article>
  );
}

export default function FoodDetailPage({ uuid }: FoodDetailPageProps) {
  const router = useRouter();

  const [activeImage, setActiveImage] = useState(0);

  const [isBookmarked, setIsBookmarked] = useState(false);

  const {
    data: food,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetMenuItemByUuidQuery(uuid);

  const { data: allMenuItems = [] } = useGetMenuItemsQuery();

  const relatedFoods = useMemo(() => {
    if (!food) {
      return [];
    }

    return allMenuItems
      .filter((item) => item.uuid !== food.uuid)
      .filter((item) => item.availabilityStatus === "AVAILABLE")
      .sort((first, second) => {
        let firstScore = 0;
        let secondScore = 0;

        if (first.food.category.code === food.food.category.code) {
          firstScore += 3;
        }

        if (second.food.category.code === food.food.category.code) {
          secondScore += 3;
        }

        if (first.food.cuisine.code === food.food.cuisine.code) {
          firstScore += 2;
        }

        if (second.food.cuisine.code === food.food.cuisine.code) {
          secondScore += 2;
        }

        firstScore += first.recommendation.finalScore;

        secondScore += second.recommendation.finalScore;

        return secondScore - firstScore;
      })
      .slice(0, 8);
  }, [allMenuItems, food]);

  const gallery = useMemo(() => {
    if (!food) {
      return [];
    }

    const images = [food.thumbnail, ...food.gallery];

    return Array.from(new Set(images.filter(Boolean)));
  }, [food]);

  if (isLoading || isFetching) {
    return <LoadingPage />;
  }

  if (isError) {
    return <ErrorPage onRetry={refetch} />;
  }

  if (!food) {
    return (
      <main className="min-h-screen bg-[#f7f9f7]">
        <div className="mx-auto flex min-h-[600px] max-w-7xl flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-3xl font-semibold text-primary-900">
            រកមិនឃើញមុខម្ហូប
          </h1>

          <p className="text-base text-gray-500">
            មុខម្ហូបដែលអ្នកកំពុងស្វែងរកប្រហែលជាមិនមាន។
          </p>

          <Link
            href="/"
            className="rounded-full bg-primary-800 px-6 py-3 text-base font-semibold text-white"
          >
            ត្រឡប់ទៅទំព័រដើម
          </Link>
        </div>
      </main>
    );
  }

  const matchPercentage = Math.round(food.recommendation.finalScore * 100);

  const locationUrl = `https://www.google.com/maps?q=${food.store.latitude},${food.store.longitude}`;

  return (
    <main className="min-h-screen bg-[#f7f9f7] pt-15">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-base font-semibold text-primary-800 transition hover:text-primary-600"
        >
          <FaArrowLeft />
          ត្រឡប់ក្រោយ
        </button>

        {/* Main information */}
        <section className="grid gap-10 lg:grid-cols-[1.12fr_0.88fr]">
          {/* Gallery */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={gallery[activeImage]}
                initial={{
                  opacity: 0,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.98,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="relative aspect-[16/10] overflow-hidden rounded-[26px] bg-gray-100 shadow-sm"
              >
                <Image
                  fill
                  priority
                  src={gallery[activeImage] || food.thumbnail}
                  alt={food.localName || food.name}
                  sizes="(max-width: 1024px) 100vw, 650px"
                  className="object-cover"
                />

                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  {food.isFeatured && (
                    <span className="rounded-full bg-secondary-500 px-4 py-2 text-base font-semibold text-white shadow-md">
                      មុខម្ហូបពេញនិយម
                    </span>
                  )}

                  <span className="rounded-full bg-primary-800/95 px-4 py-2 text-base font-semibold text-white shadow-md">
                    {matchPercentage}% Match
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="grid grid-cols-3 gap-4">
              {gallery.slice(0, 3).map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`relative aspect-[4/3] overflow-hidden rounded-[20px] border-2 transition ${
                    activeImage === index
                      ? "border-primary-700 ring-1 ring-primary-600"
                      : "border-transparent hover:border-primary-300"
                  }`}
                >
                  <Image
                    fill
                    src={image}
                    alt={`${food.localName} image ${index + 1}`}
                    sizes="220px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Food overview */}
          <div className="flex flex-col">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  <InfoPill>{food.food.category.name}</InfoPill>

                  <InfoPill>{food.food.cuisine.name}</InfoPill>

                  <InfoPill>
                    {food.availabilityStatus === "AVAILABLE"
                      ? "មានលក់"
                      : "អស់ពីស្តុក"}
                  </InfoPill>
                </div>

                <h3 className="mt-5 text-3xl font-bold leading-tight text-primary-950 sm:text-4xl">
                  {food.localName}
                </h3>

                <p className="mt-2 text-lg text-gray-500">{food.name}</p>
              </div>

              <p className="text-3xl font-bold text-primary-800">
                {formatPrice(food.price, food.currencyCode)}
              </p>
            </div>

            <p className="mt-6 text-base leading-8 text-gray-600">
              {food.localDescription}
            </p>

            <p className="mt-3 text-base leading-8 text-gray-500">
              {food.description}
            </p>

            {/* Store */}
            <div className="mt-6 rounded-[22px] border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-primary-50">
                  {food.store.logoUrl ? (
                    <Image
                      fill
                      src={food.store.logoUrl}
                      alt={food.store.localName}
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <FaStore className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-primary-700" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-semibold text-primary-900">
                    {food.store.localName}
                  </p>

                  <p className="truncate text-base text-gray-500">
                    {food.store.name}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-base font-semibold ${
                    food.store.operatingStatus === "OPEN"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {food.store.operatingStatus === "OPEN" ? "បើក" : "បិទ"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 border-t border-gray-100 pt-4 sm:grid-cols-2">
                <div className="flex items-start gap-2 text-base text-gray-600">
                  <FaMapMarkerAlt className="mt-1 shrink-0 text-primary-700" />

                  <span>
                    {food.store.addressLine}, {food.store.district},{" "}
                    {food.store.city}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-base text-gray-600">
                  <FaStar className="text-yellow-500" />

                  <span>
                    {food.store.averageRating} ({food.store.totalReviews}{" "}
                    ការវាយតម្លៃ)
                  </span>
                </div>
              </div>
            </div>

            {/* Main stats */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-[18px] border border-gray-200 bg-white p-4 text-center">
                <IoMdTime className="mx-auto text-2xl text-primary-700" />

                <p className="mt-2 text-lg font-semibold text-primary-900">
                  {food.preparationTimeMinutes} min
                </p>

                <p className="mt-1 text-base text-gray-500">ពេលរៀបចំ</p>
              </div>

              <div className="rounded-[18px] border border-gray-200 bg-white p-4 text-center">
                <MdDeliveryDining className="mx-auto text-2xl text-primary-700" />

                <p className="mt-2 text-lg font-semibold text-primary-900">
                  {food.distanceKm} km
                </p>

                <p className="mt-1 text-base text-gray-500">ចម្ងាយ</p>
              </div>

              <div className="rounded-[18px] border border-gray-200 bg-white p-4 text-center">
                <MdOutlinePayments className="mx-auto text-2xl text-primary-700" />

                <p className="mt-2 text-lg font-semibold text-primary-900">
                  {formatPrice(food.deliveryFee, food.currencyCode)}
                </p>

                <p className="mt-1 text-base text-gray-500">ថ្លៃដឹក</p>
              </div>

              <div className="rounded-[18px] border border-gray-200 bg-white p-4 text-center">
                <TbFlame className="mx-auto text-2xl text-secondary-500" />

                <p className="mt-2 text-lg font-semibold text-primary-900">
                  {getSpiceLabel(food.food.spiceLevel)}
                </p>

                <p className="mt-1 text-base text-gray-500">កម្រិតហឹរ</p>
              </div>
            </div>

            {/* Dietary tags */}
            <div className="mt-6">
              <p className="text-lg font-semibold text-primary-900">របបអាហារ</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {food.dietaryTypes.map((dietaryType) => (
                  <span
                    key={dietaryType.code}
                    className="flex items-center gap-2 rounded-full bg-primary-800 px-4 py-2 text-base text-white"
                  >
                    {dietaryType.verificationStatus === "VERIFIED" && (
                      <FaCheckCircle className="text-green-300" />
                    )}

                    {dietaryType.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto grid gap-3 pt-7 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setIsBookmarked((previous) => !previous)}
                className={`flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold transition active:scale-95 ${
                  isBookmarked
                    ? "bg-secondary-500 text-white"
                    : "bg-primary-800 text-white hover:bg-primary-700"
                }`}
              >
                <FaRegHeart />

                {isBookmarked ? "បានរក្សាទុក" : "រក្សាទុកមុខម្ហូប"}
              </button>

              <a
                href={locationUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-secondary-500 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-secondary-400 active:scale-95"
              >
                <FaMapMarkerAlt />
                មើលទីតាំង
              </a>
            </div>
          </div>
        </section>

        {/* Score and detailed information */}
        <section className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* AI recommendation */}
          <article className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <p className="text-base font-medium text-secondary-500">
                  FoodHub AI
                </p>

                <h2 className="mt-1 text-2xl font-semibold text-primary-900">
                  កម្រិតសមស្របសម្រាប់អ្នក
                </h2>
              </div>

              <div className="text-right">
                <p className="text-4xl font-bold text-primary-800">
                  {matchPercentage}%
                </p>

                <p className="mt-1 text-base text-gray-500">Match Score</p>
              </div>
            </div>

            <p className="mt-5 text-base leading-8 text-gray-600">
              {food.recommendation.reasonText}
            </p>

            <div className="mt-6 space-y-4">
              <ScoreBar
                label="Meal Match"
                value={food.recommendation.scoreBreakdown.mealMatch}
              />

              <ScoreBar
                label="Cuisine Match"
                value={food.recommendation.scoreBreakdown.cuisineMatch}
              />

              <ScoreBar
                label="Budget Match"
                value={food.recommendation.scoreBreakdown.budgetMatch}
              />

              <ScoreBar
                label="Distance Match"
                value={food.recommendation.scoreBreakdown.distanceMatch}
              />

              <ScoreBar
                label="Popularity"
                value={food.recommendation.scoreBreakdown.popularity}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {food.recommendation.reasonCodes.map((reasonCode) => (
                <span
                  key={reasonCode}
                  className="rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-base font-medium text-primary-700"
                >
                  {reasonCode.replaceAll("_", " ")}
                </span>
              ))}
            </div>
          </article>

          {/* Rating card */}
          <article className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-2xl font-semibold text-primary-900">
              ការវាយតម្លៃភោជនីយដ្ឋាន
            </h2>

            <div className="mt-6 flex items-center gap-6">
              <div>
                <p className="text-5xl font-bold text-primary-950">
                  {food.store.averageRating}
                </p>

                <div className="mt-2 flex gap-1 text-yellow-400">
                  {Array.from({
                    length: 5,
                  }).map((_, index) => (
                    <FaStar key={index} />
                  ))}
                </div>

                <p className="mt-2 text-base text-gray-500">
                  {food.store.totalReviews} ការវាយតម្លៃ
                </p>
              </div>

              <div className="h-24 w-px bg-gray-200" />

              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex justify-between text-base text-gray-500">
                    <span>គុណភាពម្ហូប</span>
                    <span>{Math.round(food.store.averageRating * 20)}%</span>
                  </div>

                  <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      style={{
                        width: `${food.store.averageRating * 20}%`,
                      }}
                      className="h-full rounded-full bg-primary-700"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-base text-gray-500">
                    <span>ប្រជាប្រិយភាព</span>

                    <span>
                      {Math.round(
                        food.recommendation.scoreBreakdown.popularity * 100,
                      )}
                      %
                    </span>
                  </div>

                  <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      style={{
                        width: `${food.recommendation.scoreBreakdown.popularity * 100}%`,
                      }}
                      className="h-full rounded-full bg-secondary-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>

        {/* Food information */}
        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Ingredients */}
          <article className="rounded-[26px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50">
                <IoRestaurantOutline className="text-2xl text-primary-700" />
              </div>

              <h2 className="text-xl font-semibold text-primary-900">
                គ្រឿងផ្សំ
              </h2>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {food.ingredients.map((ingredient) => (
                <span
                  key={ingredient}
                  className="rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-base text-gray-600"
                >
                  {ingredient}
                </span>
              ))}
            </div>

            {food.beveragePairings.length > 0 && (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <p className="text-base font-semibold text-primary-900">
                  ភេសជ្ជៈដែលសម
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {food.beveragePairings.map((beverage) => (
                    <InfoPill key={beverage}>{beverage}</InfoPill>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Nutrition */}
          <article className="rounded-[26px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
                <IoNutritionOutline className="text-2xl text-green-700" />
              </div>

              <h2 className="text-xl font-semibold text-primary-900">
                តម្លៃអាហារូបត្ថម្ភ
              </h2>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                {
                  label: "Calories",
                  value: `${food.nutrition.calories} kcal`,
                },
                {
                  label: "Protein",
                  value: `${food.nutrition.protein} g`,
                },
                {
                  label: "Carbohydrate",
                  value: `${food.nutrition.carbohydrate} g`,
                },
                {
                  label: "Fat",
                  value: `${food.nutrition.fat} g`,
                },
                {
                  label: "Fiber",
                  value: `${food.nutrition.fiber} g`,
                },
                {
                  label: "Sodium",
                  value: `${food.nutrition.sodium} mg`,
                },
              ].map((nutrition) => (
                <div
                  key={nutrition.label}
                  className="rounded-[16px] bg-primary-50 p-3"
                >
                  <p className="text-base text-gray-500">{nutrition.label}</p>

                  <p className="mt-1 text-lg font-semibold text-primary-900">
                    {nutrition.value}
                  </p>
                </div>
              ))}
            </div>
          </article>

          {/* Allergens */}
          <article className="rounded-[26px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
                <IoAlertCircleOutline className="text-2xl text-orange-500" />
              </div>

              <h2 className="text-xl font-semibold text-primary-900">
                អាឡែស៊ី និងសុវត្ថិភាព
              </h2>
            </div>

            {food.allergenDeclarations.length === 0 ? (
              <div className="mt-5 flex items-start gap-3 rounded-[18px] bg-green-50 p-4">
                <FaCheckCircle className="mt-1 shrink-0 text-xl text-green-600" />

                <p className="text-base leading-7 text-green-700">
                  មិនមានការប្រកាសអាឡែស៊ីនៅក្នុងទិន្នន័យនេះទេ។
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {food.allergenDeclarations.map((allergen) => (
                  <div
                    key={allergen.code}
                    className="rounded-[18px] border border-orange-100 bg-orange-50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-base font-semibold text-orange-800">
                        {allergen.name}
                      </p>

                      <span className="rounded-full bg-orange-100 px-3 py-1 text-base font-medium text-orange-700">
                        {allergen.riskLevel}
                      </span>
                    </div>

                    <p className="mt-2 text-base text-orange-700">
                      {allergen.declarationType} · {allergen.verificationStatus}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 border-t border-gray-100 pt-5">
              <p className="text-base font-semibold text-primary-900">
                អាយុសមស្រប
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {food.food.ageGroups.map((ageGroup) => (
                  <InfoPill key={ageGroup.code}>{ageGroup.name}</InfoPill>
                ))}
              </div>
            </div>
          </article>
        </section>

        {/* Meal types */}
        <section className="mt-8 rounded-[26px] border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-base text-gray-500">ពេលអាហារ</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {food.mealTypes.map((mealType) => (
                  <InfoPill key={mealType.code}>{mealType.name}</InfoPill>
                ))}
              </div>
            </div>

            <div>
              <p className="text-base text-gray-500">ប្រភេទម្ហូប</p>

              <p className="mt-3 text-lg font-semibold text-primary-900">
                {food.food.category.name}
              </p>
            </div>

            <div>
              <p className="text-base text-gray-500">ប្រភពទិន្នន័យ</p>

              <p className="mt-3 text-lg font-semibold text-primary-900">
                {food.source}
              </p>
            </div>
          </div>
        </section>

        {/* Related items */}
        {relatedFoods.length > 0 && (
          <section className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-secondary-500">
                  អ្នកប្រហែលជាចូលចិត្ត
                </p>

                <h2 className="mt-2 text-3xl font-bold text-primary-900">
                  មុខម្ហូបស្រដៀងគ្នា
                </h2>
              </div>

              <Link
                href="/"
                className="flex items-center gap-2 text-base font-semibold text-primary-800"
              >
                មើលទាំងអស់
                <IoChevronForward />
              </Link>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedFoods.map((relatedFood) => (
                <RelatedFoodCard key={relatedFood.uuid} food={relatedFood} />
              ))}
            </div>
          </section>
        )}

        {/* Share button */}
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={async () => {
              const shareData = {
                title: food.localName,
                text: food.localDescription,
                url: window.location.href,
              };

              if (navigator.share) {
                await navigator.share(shareData);

                return;
              }

              await navigator.clipboard.writeText(window.location.href);
            }}
            className="flex items-center gap-2 rounded-full border border-primary-200 bg-white px-6 py-3 text-base font-semibold text-primary-800 shadow-sm transition hover:bg-primary-50 active:scale-95"
          >
            <FaShareAlt />
            ចែករំលែកមុខម្ហូប
          </button>
        </div>
      </div>
    </main>
  );
}
