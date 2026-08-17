import StoreDetailPage from "@/components/store-detail/StoreDetailPage";

type StoreDetailRouteProps = {
  params: Promise<{
    uuid: string;
  }>;
};

export default async function StoreDetailRoute({ params }: StoreDetailRouteProps) {
  const { uuid } = await params;

  return (
    <div className="pt-20 max-w-7xl container mx-auto">
      <StoreDetailPage storeUuid={uuid} />
    </div>
  );
}
