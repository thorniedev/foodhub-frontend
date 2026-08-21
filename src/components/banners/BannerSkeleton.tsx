import React from "react";

export function HeroBannerSkeleton() {
  return (
    <section className="relative w-full overflow-hidden pt-8 lg:pt-12.5">
      <div
        role="status"
        aria-label="Loading hero promotions"
        className="
          container mx-auto max-w-7xl
          h-[220px] sm:h-[300px] md:h-[400px] lg:h-[500px] xl:h-[70vh]
          animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800
          md:rounded-3xl
        "
      />
    </section>
  );
}

export function LocationBannerSkeleton() {
  return (
    <section className="container mx-auto max-w-7xl py-8" role="status" aria-label="Loading location highlights">
      <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
      <div className="flex gap-4 overflow-hidden pb-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-48 w-64 shrink-0 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </section>
  );
}

export function SeasonalBannerSkeleton() {
  return (
    <section className="container mx-auto max-w-7xl py-8" role="status" aria-label="Loading seasonal promotions">
      <div className="mb-6 h-8 w-44 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="aspect-16/9 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </section>
  );
}

export function PopularBannerSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section className="container mx-auto max-w-7xl py-8" role="status" aria-label="Loading popular picks">
      <div className="mb-6 h-8 w-40 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="aspect-4/3 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </section>
  );
}

export function BannerGridSkeleton({ count = 4 }: { count?: number }) {
  return <PopularBannerSkeleton count={count} />;
}

export function BannerSkeleton({
  className = "h-48 w-full",
}: {
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label="Loading banner"
      className={`animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800 ${className}`}
    />
  );
}
