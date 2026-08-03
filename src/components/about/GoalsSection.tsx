// components/about/GoalsSection.tsx
import Image from "next/image";

interface GoalCardProps {
  number: number;
  badgeBg: string;
  badgeColor: string;
  title: string;
  description: string;
  cardBg: string;
  imageSrc?: string;
}

const goalsData: GoalCardProps[] = [
  {
    number: 1,
    badgeBg: "bg-[#22c55e]",
    badgeColor: "bg-[#e8f5e9] text-[#136c34]",
    title: "បេសកកម្ម",
    description:
      "ស្វែងរកម្ហូបនិងភេសជ្ជៈដែលអ្នកចូលចិត្តបានយ៉ាងលឿន និងងាយស្រួលបំផុត! ជាមួយសេវាកម្មរហ័សទាន់ចិត្តជម្រើសសម្បូរបែប ៖",
    cardBg: "bg-[#E9F9EF]",
    imageSrc: "/about/mee.png",
  },
  {
    number: 2,
    badgeBg: "bg-[#22c55e]",
    badgeColor: "bg-[#e8f5e9] text-[#136c34]",
    title: "ចក្ខុវិស័យ",
    description: "វេទិកាស្វែងរកនិងណែនាំអាហារឈានមុខគេ ជាមួយបទពិសោធន៍ល្អបំផុត!",
    cardBg: "bg-[#f8fafc]",
  },
  {
    number: 3,
    badgeBg: "bg-[#f97316]",
    badgeColor: "bg-[#fff3eb] text-[#f97316]",
    title: "តម្លៃស្នូល",
    description:
      "យើងផ្ដោតលើគុណភាពភាពងាយស្រួល ការច្នៃប្រឌិត និងការដាក់អ្នកប្រើប្រាស់ជាចម្បងក្នុងការអភិវឌ្ឍសេវាកម្មរបស់យើង ៖",
    cardBg: "bg-[#fff7ed]",
  },
];

export default function GoalsSection() {
  return (
    <section className="relative w-full bg-[#f8fafc] py-8 sm:py-12 md:py-12.5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-4">
        {/* Section Header */}
        <h2 className="mb-8 sm:mb-12 text-center font-['Kantumruy_Pro',sans-serif] text-2xl font-extrabold sm:text-4xl md:text-5xl">
          <span className="text-[#f97316]">គោលបំណង</span>
          <span className="text-[#136c34]">របស់យើង</span>
        </h2>

        {/* Responsive Grid Layout: 1 col (mobile) -> 2 cols (tablet) -> 12 cols (desktop) */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-12 lg:items-stretch">
          {/* Card 1: Mission */}
          <div className="relative flex min-h-[380px] sm:min-h-[440px] flex-col justify-between overflow-hidden sm:overflow-visible rounded-3xl sm:rounded-[2.5rem] bg-[#E9F9EF] p-5 sm:p-6 lg:p-8 md:col-span-1 lg:col-span-4">
            <div>
              {/* Badge Header */}
              <div className="inline-flex items-center gap-2 rounded-full bg-[#6dbf82] py-1.5 pl-2 pr-4">
                <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-[#4ba361] text-base font-extrabold text-white">
                  1
                </span>
                <span className="font-['Kantumruy_Pro',sans-serif] text-base font-bold text-[#1a4427] sm:text-lg lg:text-xl">
                  {goalsData[0].title}
                </span>
              </div>

              {/* Description */}
              <p className="mt-3 sm:mt-4 font-['Kantumruy_Pro',sans-serif] text-sm font-medium leading-relaxed text-[#1d4629] sm:text-base lg:text-lg">
                {goalsData[0].description}
              </p>
            </div>

            {/* Bottom Soup Bowl */}
            <div className="relative -mb-6 sm:-mb-10 flex h-36 sm:h-44 w-full items-end justify-end">
              <div className="absolute -bottom-8 sm:-bottom-12 h-[300px] sm:h-[440px] w-[120%] sm:w-[135%]">
                <Image
                  src={goalsData[0].imageSrc!}
                  alt="Tom yum soup bowl"
                  fill
                  className="object-contain object-bottom"
                  priority
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* Middle Column (Cards 2 & 3 Stacked) */}
          <div className="flex flex-col gap-4 sm:gap-6 md:col-span-1 lg:col-span-4">
            {/* Card 2: Vision */}
            <div className="flex min-h-[200px] sm:min-h-[220px] flex-1 flex-col justify-start rounded-3xl border border-slate-100 bg-[#f8fafc] p-5 sm:p-6 lg:p-8 shadow-sm">
              <div>
                <div className="inline-flex items-center gap-2.5 self-start rounded-full bg-[#d8f3e1] py-1.5 pl-2 pr-4">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-[#34a853] text-base font-bold text-white">
                    2
                  </span>
                  <span className="font-['Kantumruy_Pro',sans-serif] text-base font-extrabold text-[#136c34] sm:text-lg lg:text-xl">
                    {goalsData[1].title}
                  </span>
                </div>

                <p className="mt-3 sm:mt-4 font-['Kantumruy_Pro',sans-serif] text-sm font-medium leading-relaxed text-slate-600 sm:text-base lg:text-lg">
                  {goalsData[1].description}
                </p>
              </div>
            </div>

            {/* Card 3: Core Values */}
            <div className="flex min-h-[200px] sm:min-h-[220px] flex-1 flex-col justify-start rounded-3xl border border-orange-100/50 bg-[#fff7ed] p-5 sm:p-6 lg:p-8">
              <div>
                <div className="inline-flex items-center gap-2.5 self-start rounded-full bg-[#ffedd5] py-1.5 pl-2 pr-4">
                  <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-[#f97316] text-base font-bold text-white">
                    3
                  </span>
                  <span className="font-['Kantumruy_Pro',sans-serif] text-base font-extrabold text-[#f97316] sm:text-lg lg:text-xl">
                    {goalsData[2].title}
                  </span>
                </div>

                <p className="mt-3 sm:mt-4 font-['Kantumruy_Pro',sans-serif] text-sm font-medium leading-relaxed text-slate-600 sm:text-base lg:text-lg">
                  {goalsData[2].description}
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Poster Banner Card */}
          <div className="relative min-h-[300px] sm:min-h-[380px] w-full overflow-hidden rounded-3xl md:col-span-2 lg:col-span-4">
            <Image
              src="/about/food10.webp"
              alt="Good Food Good Vibes Poster"
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  );
}
