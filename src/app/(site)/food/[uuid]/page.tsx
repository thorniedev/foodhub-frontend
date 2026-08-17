import FoodDetailPage from "@/components/food-detail/FoodDetailPage";

type FoodDetailRouteProps = {
  params: Promise<{
    uuid: string;
  }>;
};

export default async function FoodDetailRoute({
  params,
}: FoodDetailRouteProps) {
  const { uuid } = await params;

  return <FoodDetailPage uuid={uuid} />;
}
