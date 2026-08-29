import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  fetchFoodForSeo,
  generateFoodMetadata,
} from "@/lib/seo";

type FoodRedirectProps = {
  params: Promise<{
    uuid: string;
  }>;
};

export async function generateMetadata({
  params,
}: FoodRedirectProps): Promise<Metadata> {
  const { uuid } = await params;
  const food = await fetchFoodForSeo(uuid);

  if (!food) {
    return {
      title: "ព័ត៌មានមុខម្ហូប - FoodHub",
    };
  }

  return generateFoodMetadata(food, uuid);
}

export default async function FoodDetailRedirect({
  params,
}: FoodRedirectProps) {
  const { uuid } = await params;
  redirect(`/menu/${uuid}`);
}
