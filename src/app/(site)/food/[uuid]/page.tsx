import FoodDetailPage from "@/components/food-detail/FoodDetailPage";

type PageProps = {
  params: Promise<{
    uuid: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { uuid } = await params;

  return <FoodDetailPage uuid={uuid} />;
}
