export function HeroBannerSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading promotions"
      className="
        container mx-auto max-w-7xl
        h-[220px] sm:h-[300px] md:h-[400px] lg:h-[500px] xl:h-[85vh]
        animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800
        md:rounded-3xl
      "
    />
  );
}

export function BannerGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading banners"
      className="container mx-auto grid max-w-7xl grid-cols-2 gap-4 md:grid-cols-4"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="aspect-4/3 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800"
        />
      ))}
    </div>
  );
}
