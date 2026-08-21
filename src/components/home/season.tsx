"use client";

import React from "react";
import LocationBannerRow from "@/components/banners/LocationBannerRow";

/**
 * Regional Food Section ("ចំណីអាហារប្រចាំតំបន់")
 * Powered by backend LOCATION banners (/api/v1/banners/public/locations).
 */
export default function SeasonSection() {
  return <LocationBannerRow />;
}
