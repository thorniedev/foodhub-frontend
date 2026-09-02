"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import LocationPageWrapper from "@/components/food-page/location/LocationPageWrapper";
import type { RecommendationMode } from "@/types/location";

export default function LocationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const segment = useSelectedLayoutSegment();

  let mode: RecommendationMode = "me";
  if (segment === "friends") {
    mode = "single";
  } else if (segment === "group") {
    mode = "group";
  }

  return (
    <>
      <LocationPageWrapper mode={mode} />
      {children}
    </>
  );
}
