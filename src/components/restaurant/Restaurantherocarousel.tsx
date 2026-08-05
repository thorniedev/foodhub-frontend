"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { RestaurantDetail } from "@/types/restaurant";

type Props = {
  slides: RestaurantDetail["heroSlides"];
};

/** The rotating dish photos under the search bar. Shows two rounded photos
 *  side by side on tablet/desktop (one per view on phones), with dot
 *  pagination. Guards against empty image URLs so it never throws while the
 *  real assets are being wired up. */
export default function RestaurantHeroCarousel({ slides }: Props) {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  if (!slides || slides.length === 0) return null;

  return (
    <div className="relative">
      <Carousel
        setApi={setApi}
        opts={{ loop: true, align: "start" }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {slides.map((slide) => (
            <CarouselItem
              key={slide.id}
              className="basis-full pl-3 md:basis-1/2"
            >
              <div className="relative h-56 w-full overflow-hidden rounded-3xl bg-gray-100 sm:h-64 lg:h-72">
                {slide.image ? (
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 45vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {slides.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`ទៅរូបភាព ${i + 1}`}
              onClick={() => api?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                i === selected ? "w-5 bg-primary-700" : "w-1.5 bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}