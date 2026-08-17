import FoodDetailPage from "@/components/food-detail/FoodDetailPage";

type MenuItemDetailRouteProps = {
  params: Promise<{
    uuid: string;
  }>;
};

export default async function MenuItemDetailRoute({
  params,
}: MenuItemDetailRouteProps) {
  const { uuid } = await params;

  return <FoodDetailPage uuid={uuid} />;
}
