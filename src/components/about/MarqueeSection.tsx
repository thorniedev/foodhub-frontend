import svgPaths from "@/lib/scv";

const marqueeItems = [
  "ព្រួយបារម្ភពីសុខភាពគ្រួសារអ្នក ដូចជាគ្រួសារយើងផ្ទាល់",
  "ចែករំលែកក្តីស្រឡាញ់ និងសុវត្ថិភាព តាមរយៈអាហារល្អៗ",
  "ជួបជុំគ្នាយ៉ាងរីករាយ ជាមួយអាហារមានសុវត្ថិភាព ១០០%",
  "សុវត្ថិភាពក្នុងការញ៉ាំ",
];

function DiamondIcon() {
  return (
    <div className="flex items-center justify-center size-[26px] shrink-0">
      <div className="rotate-45 size-[18px]">
        <svg className="size-full" fill="none" viewBox="0 0 18.4737 18.4737">
          <path d={svgPaths.p1244f600} fill="#D9D9D9" />
        </svg>
      </div>
    </div>
  );
}

export default function MarqueeSection() {
  return (
    <div className="bg-[#1fb356] w-full overflow-hidden py-3">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...marqueeItems, ...marqueeItems].map((item, i) => (
          <div key={i} className="flex items-center gap-8 shrink-0 mx-4">
            <span className="font-['Kantumruy_Pro',sans-serif] text-white text-xl">
              {item}
            </span>
            <DiamondIcon />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}

export function MarqueeSectionOrange() {
  const items = [
    "ជុំគ្នាញ៉ាំអាហារឆ្ងាញ់ៗ ប្រកបដោយសុវត្ថិភាព",
    "ស្អាត ឆ្ងាញ់ សុវត្ថិភាព—ស័ក្តិសមបំផុតសម្រាប់គ្រួសារ និងមិត្តភក្តិ",
    "វត្ថិភាព និងរស់ជាតិឆ្ងាញ់ សម្រាប់មនុស្សជិតស្និទ្ធ",
    "សុវត្ថិភាពក្នុងការញ៉ាំ",
  ];

  return (
    <div className="bg-[#e36914] w-full overflow-hidden py-3">
      <div className="flex animate-marquee-orange whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-8 shrink-0 mx-4">
            <span className="font-['Kantumruy_Pro',sans-serif] text-white text-xl">
              {item}
            </span>
            <DiamondIcon />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee-orange {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-orange {
          animation: marquee-orange 28s linear infinite;
        }
      `}</style>
    </div>
  );
}
