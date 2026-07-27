import Image from "next/image";
import React from "react";

interface StatItem {
  value: string;
  valueColor?: string;
  highlightText?: string;
  normalText?: string;
  subText?: string;
  subTextHighlight?: string;
}

const statsData: StatItem[] = [
  {
    value: "800k",
    highlightText: "អាហារ",
    normalText: "និង ភេសជ្ជៈ",
    subText: "ជាច្រើនដែលត្រូវនឹងអ្នក",
  },
  {
    value: "4.9",
    highlightText: "Google",
    subText: "Score",
  },
  {
    value: "6500 +",
    valueColor: "text-[#E58348]",
    normalText: "ប្រភេទនៃ",
    subTextHighlight: "អាហារ",
    subText: "និង ភេសជ្ជៈ",
  },
  {
    value: "120k",
    highlightText: "ហាងអាហារដែលមាន",
    subTextHighlight: "លក់អាហារ",
    subText: "ឆ្ងាញ់ៗ",
  },
];

export default function StatsSection() {
  return (
    <section className="relative w-full bg-[#E58348] pt-10 sm:pt-14 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16 md:mt-20 overflow-visible">
      <div className="max-w-7xl mx-auto relative flex flex-col lg:flex-row items-center justify-end">
        
        {/* Sushi Image - Hidden on small screens (below lg) */}
        <div className="hidden lg:block absolute lg:-left-4 xl:-left-6 lg:-bottom-16 z-20 lg:w-[340px] xl:w-[390px] pointer-events-none">
          <Image
            src="/about/su.png"
            alt="Sushi with chopsticks"
            width={480}
            height={580}
            className="w-full h-auto object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* Stats Card */}
        <div className="w-full lg:w-auto flex-1 lg:ml-[310px] xl:ml-[360px] bg-[#FFF5EE] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-4 sm:gap-x-6 lg:gap-0 divide-y-0 lg:divide-x divide-orange-200/60">
            {statsData.map((stat, index) => (
              <div
                key={index}
                className={`flex flex-col justify-start ${
                  index !== 0 ? "lg:pl-5 xl:pl-6" : ""
                } ${
                  index % 2 !== 0 ? "pl-2 sm:pl-4 lg:pl-5 xl:pl-6" : ""
                }`}
              >
                {/* Stat Value */}
                <h3
                  className={`text-2xl sm:text-3xl xl:text-4xl font-black tracking-tight mb-1 ${
                    stat.valueColor || "text-slate-900"
                  }`}
                >
                  {stat.value}
                </h3>

                {/* Main Label */}
                <div className="text-xs sm:text-sm leading-relaxed font-medium">
                  <p>
                    {stat.highlightText && (
                      <span className="text-[#E58348]">
                        {stat.highlightText}{" "}
                      </span>
                    )}
                    {stat.normalText && (
                      <span className="text-slate-500">{stat.normalText}</span>
                    )}
                  </p>

                  {/* Secondary Label */}
                  {(stat.subText || stat.subTextHighlight) && (
                    <p>
                      {stat.subTextHighlight && (
                        <span className="text-[#E58348]">
                          {stat.subTextHighlight}{" "}
                        </span>
                      )}
                      {stat.subText && (
                        <span className="text-slate-500">{stat.subText}</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}