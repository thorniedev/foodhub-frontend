import type { Metadata } from "next";
import { notFound } from "next/navigation";

import FoodDetailPage from "@/components/food-detail/FoodDetailPage";
import JsonLd from "@/components/common/JsonLd";

import {
  fetchFoodForSeo,
  generateFoodJsonLd,
  generateFoodMetadata,
} from "@/lib/seo";

type FoodDetailRouteProps = {
  params: Promise<{
    uuid: string;
  }>;
};

/* =========================================================
   DYNAMIC METADATA
========================================================= */

export async function generateMetadata({
  params,
}: FoodDetailRouteProps): Promise<Metadata> {
  const { uuid } =
    await params;

  const food =
    await fetchFoodForSeo(uuid);

  if (!food) {
    return {
      title:
        "រកមិនឃើញមុខម្ហូប",

      description:
        "មិនអាចរកឃើញព័ត៌មានមុខម្ហូបនេះនៅ FoodHub បានទេ។",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return generateFoodMetadata(
    food,
    uuid,
  );
}

/* =========================================================
   FOOD DETAIL PAGE
========================================================= */

export default async function FoodDetailRoute({
  params,
}: FoodDetailRouteProps) {
  const { uuid } =
    await params;

  const food =
    await fetchFoodForSeo(uuid);

  if (!food) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={generateFoodJsonLd(
          food,
          uuid,
        )}
      />

      <FoodDetailPage
        uuid={uuid}
      />
    </>
  );
}

// import type { Metadata } from "next";
// import { notFound } from "next/navigation";

// import FoodDetailPage from "@/components/food-detail/FoodDetailPage";
// import JsonLd from "@/components/common/JsonLd";

// import {
//   fetchFoodForSeo,
//   generateFoodMetadata,
//   generateFoodJsonLd,
// } from "@/lib/seo";

// type FoodDetailRouteProps = {
//   params: Promise<{
//     uuid: string;
//   }>;
// };

// /* =========================================================
//    DYNAMIC SEO
// ========================================================= */

// export async function generateMetadata({
//   params,
// }: FoodDetailRouteProps): Promise<Metadata> {
//   const { uuid } = await params;

//   const food = await fetchFoodForSeo(uuid);

//   if (!food) {
//     return {
//       title: "រកមិនឃើញមុខម្ហូប",

//       description: "មិនអាចរកឃើញព័ត៌មានមុខម្ហូបនេះនៅ FoodHub បានទេ។",

//       robots: {
//         index: false,
//         follow: false,
//       },
//     };
//   }

//   return generateFoodMetadata(food, uuid);
// }

// /* =========================================================
//    PAGE
// ========================================================= */

// export default async function FoodDetailRoute({
//   params,
// }: FoodDetailRouteProps) {
//   const { uuid } = await params;

//   const food = await fetchFoodForSeo(uuid);

//   if (!food) {
//     notFound();
//   }

//   return (
//     <>
//       <JsonLd data={generateFoodJsonLd(food, uuid)} />

//       <FoodDetailPage uuid={uuid} />
//     </>
//   );
// }

// // import type { Metadata } from "next";
// // import FoodDetailPage from "@/components/food-detail/FoodDetailPage";
// // import JsonLd from "@/components/common/JsonLd";
// // import {
// //   fetchFoodForSeo,
// //   generateFoodMetadata,
// //   generateFoodJsonLd,
// // } from "@/lib/seo";

// // type FoodDetailRouteProps = {
// //   params: Promise<{
// //     uuid: string;
// //   }>;
// // };

// // export async function generateMetadata({
// //   params,
// // }: FoodDetailRouteProps): Promise<Metadata> {
// //   const { uuid } = await params;
// //   const food = await fetchFoodForSeo(uuid);

// //   if (!food) {
// //     return {
// //       title: "ព័ត៌មានមុខម្ហូប - FoodHub",
// //       description: "ស្វែងរកមុខម្ហូបឆ្ងាញ់ៗ និងការណែនាំពិសេសនៅ FoodHub Cambodia.",
// //     };
// //   }

// //   return generateFoodMetadata(food, uuid);
// // }

// // export default async function FoodDetailRoute({
// //   params,
// // }: FoodDetailRouteProps) {
// //   const { uuid } = await params;
// //   const food = await fetchFoodForSeo(uuid);

// //   return (
// //     <>
// //       {food && <JsonLd data={generateFoodJsonLd(food, uuid)} />}
// //       <FoodDetailPage uuid={uuid} />
// //     </>
// //   );
// // }
