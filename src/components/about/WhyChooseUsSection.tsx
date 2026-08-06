// components/about/WhyChooseUsSection.tsx
import Image from "next/image";

export default function WhyChooseUsSection() {
  return (
    <section className="relative w-full    overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 items-center gap-29 lg:grid-cols-12">
          
          {/* Left Text Content Area */}
          <div className="relative z-10 flex flex-col justify-center lg:col-span-6">
            
            {/* Green accent lines (sparkle / hand-drawn feel) */}
            <div className="mb-2 flex items-center gap-1.5 pl-1">
              <span className="h-6 w-1 -rotate-45 rounded-full bg-[#136c34]"></span>
              <span className="h-8 w-1 -rotate-12 rounded-full bg-[#136c34]"></span>
              <span className="h-6 w-1 rotate-12 rounded-full bg-[#136c34]"></span>
            </div>

            {/* Main Headline */}
            <h2 className="[font-family:'Kantumruy_Pro',sans-serif] text-6xl font-extrabold leading-tight tracking-wide sm:text-5xl md:text-6xl">
              <span className="text-[#136c34]">ហេតុអ្វីត្រូវជ្រើសរើស</span>
              <br />
              <span className="text-[#f97316]">ហ្វូតហាប់?</span>
            </h2>

            {/* Description Text */}
            <p className="mt-6 max-w-xl [font-family:'Kantumruy_Pro',sans-serif] text-base leading-relaxed text-slate-600 sm:text-lg">
              ស្វែងរកម្ហូបអាហារ និងភេសជ្ជៈបានយ៉ាងរហ័ស ទាន់ចិត្តនិងត្រូវតាមចំណង់ចំណូលចិត្តរបស់អ្នកជាមួយជម្រើសដ៏សម្បូរបែបពីហាងជាច្រើនតម្រូវមុខម្ហូបពិសេសៗដែលអ្នកពេញចិត្តបំផុតដោយឥតធុញទ្រាន់ ។
            </p>
          </div>

          {/* Right Illustration Area */}
          <div className="relative flex justify-center lg:col-span-6 lg:justify-end">
            <div className="relative w-full max-w-[580px]">
              <Image
                src="/about/us.png" // replace with your image path
                alt="People dining at round table illustration"
                width={850}
                height={600}
                className="w-full h-auto object-contain mix-blend-multiply"
                priority
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}