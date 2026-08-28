import type { Metadata } from "next";
import StoreDetailPage from "@/components/store-detail/StoreDetailPage";
import JsonLd from "@/components/common/JsonLd";
import {
  fetchStoreForSeo,
  generateStoreMetadata,
  generateStoreJsonLd,
} from "@/lib/seo";

type StoreDetailRouteProps = {
  params: Promise<{
    uuid: string;
  }>;
};

export async function generateMetadata({
  params,
}: StoreDetailRouteProps): Promise<Metadata> {
  const { uuid } = await params;
  const store = await fetchStoreForSeo(uuid);

  if (!store) {
    return {
      title: "ហាងអាហារ - FoodHub",
      description: "ស្វែងរកហាងអាហារឆ្ងាញ់ៗនៅកម្ពុជាជាមួយ FoodHub.",
    };
  }

  return generateStoreMetadata(store, uuid);
}

export default async function StoreDetailRoute({
  params,
}: StoreDetailRouteProps) {
  const { uuid } = await params;
  const store = await fetchStoreForSeo(uuid);

  return (
    <>
      {store && <JsonLd data={generateStoreJsonLd(store, uuid)} />}
      <div className="pt-20 max-w-7xl container mx-auto">
        <StoreDetailPage storeUuid={uuid} />
      </div>
    </>
  );
}
