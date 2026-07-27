import svgPaths from "@/lib/scv";

const marqueeItems = [
  "ជុំគ្នាញ៉ាំអាហារឆ្ងាញ់ៗ ប្រកបដោយសុវត្ថិភាព",
  "ស្អាត ឆ្ងាញ់ សុវត្ថិភាព—ស័ក្តិសមបំផុតសម្រាប់គ្រួសារ និងមិត្តភក្តិ",
  "សុវត្ថិភាព និងរស់ជាតិឆ្ងាញ់ សម្រាប់មនុស្សជិតស្និទ្ធ",
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

export default function MarqueeSectionOrangeLtr() {
  return (
    <div className="bg-[#e36914] w-full overflow-hidden py-3">
      <div className="flex animate-marquee-ltr whitespace-nowrap">
        {/* Tripled array to ensure continuous coverage for LTR movement */}
        {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
          <div key={i} className="flex items-center gap-8 shrink-0 mx-4">
            <span className="font-['Kantumruy_Pro',sans-serif] text-white text-xl">
              {item}
            </span>
            <DiamondIcon />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee-ltr {
          0% { transform: translateX(-33.33%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee-ltr {
          animation: marquee-ltr 28s linear infinite;
        }
      `}</style>
    </div>
  );
}