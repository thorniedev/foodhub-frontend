import Image from "next/image";
import Link from "next/link";

const COLUMNS: {
  images: string[];
  heights: string[];
  offset: string;
  visibility?: string;
}[] = [
  {
    // far left — two stacked photos, sits lowest
    images: ["/about/sweet.png", "/about/food100.jpg"],
    heights: ["h-32 sm:h-36 md:h-40", "h-36 sm:h-44 md:h-48"],
    offset: "mt-6 sm:mt-8 md:mt-9",
  },
  {
    // mango sticky rice — tall single, sits highest
    images: ["/about/food01.jpg"],
    heights: ["h-44 sm:h-52 md:h-56"],
    offset: "mt-0",
  },
  {
    // fried chicken rice poster
    images: ["/about/food02.jpg"],
    heights: ["h-48 sm:h-56 md:h-64"],
    offset: "mt-0",
    visibility: "hidden sm:block", // Hide on mobile, show from sm up
  },
  {
    // iced coffee glasses
    images: ["/about/food9.webp"],
    heights: ["h-44 sm:h-52 md:h-56"],
    offset: "mt-0",
    visibility: "hidden md:block", // Show on medium+ screens
  },
  {
    // kuih / nom ansom
    images: ["/about/food5.jpg"],
    heights: ["h-44 sm:h-52 md:h-56"],
    offset: "mt-6 sm:mt-10 md:mt-12",
    visibility: "hidden lg:block", // Show on large+ screens
  },
  {
    // far right — dumplings + soup, sits lowest
    images: ["/about/food03.jpg", "/about/food4.jpg"],
    heights: ["h-32 sm:h-36 md:h-40", "h-32 sm:h-40 md:h-44"],
    offset: "mt-4",
    visibility: "hidden md:block", // Show on medium+ screens
  },
];

function FoodColumn({
  images,
  heights,
  offset,
  visibility = "",
}: {
  images: string[];
  heights: string[];
  offset: string;
  visibility?: string;
}) {
  return (
    <div className={`flex w-full flex-col gap-2.5 sm:gap-3 ${offset} ${visibility}`}>
      {images.map((src, i) => (
        <div
          key={src}
          className={`relative ${heights[i]} w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-lg shadow-black/10`}
        >
          <Image
            src={src}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ))}
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#f8fafc] pt-8 sm:pt-12 md:pt-18 pb-10 sm:pb-12">
      <div className="relative mx-auto max-w-7xl px-3 sm:px-4 md:px-6">
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3 md:gap-4">
          {COLUMNS.map((col, i) => (
            <FoodColumn key={i} {...col} />
          ))}
        </div>

        {/* Headline + CTA */}
        <div className="pointer-events-none relative z-10 mx-auto -mt-8 sm:-mt-14 md:-mt-20 flex max-w-3xl flex-col items-center gap-3 sm:gap-4 px-2 text-center">
          <h1 className="text-3xl font-bold leading-tight drop-shadow-sm [font-family:'Kantumruy_Pro',sans-serif] sm:text-5xl md:text-6xl">
            <span className="text-[#136c34]">ធ្វើឱ្យការស្វែងរកម្ហូប</span>
            <br />
            <span className="text-[#f97316]">លឿន និង ឆ្លាតវៃ</span>
          </h1>

          <div className="relative mt-1 sm:mt-2">
            <Link
              href="/food"
              className="pointer-events-auto inline-flex items-center gap-2.5 sm:gap-3 rounded-full bg-[#136c34] px-6 sm:px-9 py-2.5 sm:py-3.5 text-base sm:text-lg font-semibold text-white shadow-lg transition-colors hover:bg-[#0e5327] [font-family:'Kantumruy_Pro',sans-serif]"
            >
              ណែនាំមុខម្ហូប
              <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full border-2 border-white text-[10px] sm:text-xs">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}