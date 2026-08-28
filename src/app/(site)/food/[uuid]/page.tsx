import { redirect } from "next/navigation";

type FoodRedirectProps = {
  params: Promise<{
    uuid: string;
  }>;
};

export default async function FoodDetailRedirect({
  params,
}: FoodRedirectProps) {
  const { uuid } = await params;
  redirect(`/menu/${uuid}`);
}
