import type { Metadata } from "next";
import StoreDetailPage from "@/components/store-detail/StoreDetailPage";
import JsonLd from "@/components/common/JsonLd";
import {
  fetchStoreForSeo,
  generateStoreMetadata,
  generateStoreJsonLd,
} from "@/lib/seo";

type StorePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: StorePageProps): Promise<Metadata> {
  const { id } = await params;
  const store = await fetchStoreForSeo(id);

  if (!store) {
    return {
      title: "ហាងអាហារ - FoodHub",
    };
  }

  return generateStoreMetadata(store, id);
}

export default async function StorePage({ params }: StorePageProps) {
  const { id } = await params;
  const store = await fetchStoreForSeo(id);

  return (
    <>
      {store && <JsonLd data={generateStoreJsonLd(store, id)} />}
      <div className="pt-20 max-w-7xl container mx-auto">
        <StoreDetailPage storeUuid={id} />
      </div>
    </>
  );
}
