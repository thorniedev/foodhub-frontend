import StoreDetailPage from "@/components/store-detail/StoreDetailPage";

type StorePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StorePage({ params }: StorePageProps) {
  const { id } = await params;

  return (
    <div className="pt-20 max-w-7xl container mx-auto">
      <StoreDetailPage storeUuid={id} />
    </div>
  );
}
