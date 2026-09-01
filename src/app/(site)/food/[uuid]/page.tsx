import type { Metadata } from "next";

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

export async function generateMetadata({
  params,
}: FoodDetailRouteProps): Promise<Metadata> {
  const { uuid } = await params;
  const food = await fetchFoodForSeo(uuid);

  if (!food) {
    return {
      title: "ព័ត៌មានមុខម្ហូប - FoodHub",
      description: "ស្វែងរកមុខម្ហូបឆ្ងាញ់ៗ និងការណែនាំពិសេសនៅ FoodHub Cambodia.",
      openGraph: {
        title: "ព័ត៌មានមុខម្ហូប - FoodHub",
        description: "ស្វែងរកមុខម្ហូបឆ្ងាញ់ៗ និងការណែនាំពិសេសនៅ FoodHub Cambodia.",
        images: ["https://www.mhoubahar.store/og-image.jpeg"],
      },
      twitter: {
        card: "summary_large_image",
        title: "ព័ត៌មានមុខម្ហូប - FoodHub",
        description: "ស្វែងរកមុខម្ហូបឆ្ងាញ់ៗ និងការណែនាំពិសេសនៅ FoodHub Cambodia.",
        images: ["https://www.mhoubahar.store/og-image.jpeg"],
      },
    };
  }

  return generateFoodMetadata(food, uuid);
}

export default async function FoodDetailRoute({
  params,
}: FoodDetailRouteProps) {
  const { uuid } = await params;
  const food = await fetchFoodForSeo(uuid);

  return (
    <>
      {food && <JsonLd data={generateFoodJsonLd(food, uuid)} />}
      <FoodDetailPage uuid={uuid} />
    </>
  );
}
