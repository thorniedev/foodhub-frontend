import type { Metadata } from "next";

import FoodDetailPage from "@/components/food-detail/FoodDetailPage";
import menuData from "../../../../../public/api/data/manuItem.json";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type PageProps = {
  params: Promise<{
    uuid: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { uuid } = await params;
  const food = menuData.menuItems.find((item) => item.uuid === uuid);

  if (!food) {
    return {
      title: "Food not found | FoodHub",
      description: "The requested food item could not be found on FoodHub.",
      robots: { index: false, follow: false },
    };
  }

  const foodName = food.localName || food.name;
  const restaurantName = food.store?.localName || food.store?.name || "FoodHub";
  const description =
    food.localDescription ||
    food.description ||
    `${foodName} from ${restaurantName}. Discover delicious food on FoodHub.`;
  const imageUrl = food.thumbnail.startsWith("http")
    ? food.thumbnail
    : `${siteUrl}${food.thumbnail}`;
  const pageUrl = `${siteUrl}/food/${food.uuid}`;

  return {
    title: `${foodName} | ${restaurantName} | FoodHub`,
    description,
    alternates: { canonical: pageUrl },
    keywords: [food.name, food.localName, restaurantName, "FoodHub", "food"],
    openGraph: {
      type: "website",
      url: pageUrl,
      title: `${foodName} | FoodHub`,
      description,
      siteName: "FoodHub",
      images: [
        {
          url: imageUrl,
          alt: `${foodName} from ${restaurantName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${foodName} | FoodHub`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { uuid } = await params;

  return <FoodDetailPage uuid={uuid} />;
}
