import React from "react";
import Image from "next/image";
import { BoltIcon, FoodLineArt } from "./icons";

export default function AuthHero() {
  return (
    <div className="kc-visual-hero">
      {/* Brand logo, top-center of the orange panel */}
      <div className="kc-hero-logo">
        <Image
          src="/auth/mhoubahar-brand.png"
          alt="FoodHub"
          width={300}
          height={150}
          priority
          className="h-[150px] w-auto object-contain"
        />
      </div>

      {/* Decorative zig-zag lightning bolts */}
      <BoltIcon className="kc-bolt kc-bolt-1" />
      <BoltIcon className="kc-bolt kc-bolt-2" />
      <BoltIcon className="kc-bolt kc-bolt-3" />
      <BoltIcon className="kc-bolt kc-bolt-4" />
      <BoltIcon className="kc-bolt kc-bolt-5" />

      {/* Faint food line-art: salad bowl with crossed fork & spoon */}
      <div className="kc-hero-lineart" aria-hidden="true">
        <FoodLineArt />
      </div>

      {/* Dark vertical band attached to left edge with stacked salad imagery */}
      <div className="kc-food-showcase-band">
        <div className="kc-salad-dish kc-dish-top">
          <Image
            src="/auth/anh-nguyen.jpg"
            alt="Fresh Salad Bowl"
            width={300}
            height={300}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="kc-salad-dish kc-dish-middle">
          <Image
            src="/auth/hanninphotography.jpg"
            alt="Healthy Green Salad"
            width={210}
            height={210}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="kc-salad-dish kc-dish-bottom">
          <Image
            src="/auth/imad.jpg"
            alt="Delicious Bowl"
            width={170}
            height={170}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
