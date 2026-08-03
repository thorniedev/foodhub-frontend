// components/ContactSection.tsx
"use client";

import { useState } from "react";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

const faqData: FaqItem[] = [
  {
    id: 1,
    question: "១. តើកម្មវិធីនេះជួយណែនាំម្ហូបអាហារដល់ខ្ញុំដោយរបៀបណា?",
    answer:
      "កម្មវិធីប្រើប្រាស់ប្រព័ន្ធណែនាំឆ្លាតវៃ ដើម្បីវិភាគចំណូលចិត្ត និងបង្ហាញជម្រើសអាហារដែលសមស្របបំផុតសម្រាប់អ្នក។",
  },
  {
    id: 2,
    question: "២. តើធ្វើម៉េចទើបកម្មវិធីដឹងថា ខ្ញុំចូលចិត្តញ៉ាំអ្វី? ?",
    answer:
      "តាមរយៈការជ្រើសរើសប្រភេទអាហារដែលអ្នកចូលចិត្ត និងប្រវត្តិស្វែងរករបស់អ្នកនៅក្នុងកម្មវិធី។",
  },
  {
    id: 3,
    question: "៣. តើខ្ញុំប្រើប្រាស់កូដបញ្ចុះតម្លៃ (Promo Code) របៀបណា?",
    answer:
      "អ្នកអាចបញ្ចូល Promo Code នៅក្នុងទំព័រទូទាត់ប្រាក់ មុនពេលបញ្ជាក់ការកុម្មង់។",
  },
  {
    id: 4,
    question: "៤. តើកម្មវិធីមានគិតថ្លៃសេវាដឹកជញ្ជូនយ៉ាងដូចម្តេចដែរ?",
    answer:
      "ថ្លៃសេវាដឹកជញ្ជូនគណនាផ្អែកលើចម្ងាយផ្លូវពីហាងអាហារទៅកាន់ទីតាំងរបស់អ្នក។",
  },
];

export default function ContactSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <section className="relative w-full bg-[#fafbfc] py-16 px-4 sm:px-6 lg:px-8 font-['Kantumruy_Pro',sans-serif]">
      <div className="max-w-7xl container mx-auto px-4">
        {/* Header Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight">
            <span className="text-[#136C34]">ទំនាក់ទំនង </span>
            <span className="text-[#e2722b]">មកយើង</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg font-medium text-[#e2722b]">
            មានសំណួរ ឬចង់ធ្វើជាដៃគូជាមួយយើង?{" "}
            <span className="text-[#3b7c52]">យើងរីករាយនឹងទទួលសារពីអ្នក។</span>
          </p>
        </div>

        {/* Main Outer Card Container */}
        <div className="relative bg-[#fbf3eb] rounded-[36px] p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Side: FAQ Accordion */}
            <div className="lg:col-span-6 flex flex-col justify-between h-full">
              <div>
                {/* Title with decorative underline */}
                <div className="relative inline-block mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#136C34]">
                    សំណួរដែលពួកយើងតែងទទួលបាន ៖
                  </h3>
                  {/* Decorative underline path matching image */}
                  <svg
                    className="absolute -bottom-3 left-0 w-full h-3 text-[#e2722b]"
                    viewBox="0 0 200 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 8C50 2 150 2 190 8"
                      stroke="#e2722b"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <circle cx="195" cy="8" r="4" fill="#3b7c52" />
                  </svg>
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                  {faqData.map((item) => {
                    const isOpen = openFaq === item.id;
                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl shadow-sm border border-slate-100/80 overflow-hidden transition-all duration-200"
                      >
                        <button
                          onClick={() => toggleFaq(item.id)}
                          className="w-full flex items-center justify-between p-4 sm:p-5 text-left gap-3 focus:outline-none"
                        >
                          <span className="text-sm sm:text-base font-bold text-[#1f2937] leading-relaxed">
                            {item.question}
                          </span>
                          <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-500">
                            <svg
                              className={`w-4 h-4 transition-transform duration-200 ${
                                isOpen ? "rotate-180" : ""
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </span>
                        </button>

                        {/* Accordion Answer Content */}
                        {isOpen && (
                          <div className="px-5 pb-5 pt-1 text-sm sm:text-base text-slate-600 border-t border-slate-50 leading-relaxed">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Side: Contact Form Card */}
            <div className="lg:col-span-6 bg-white rounded-[28px] p-6 sm:p-8 shadow-sm">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                {/* Input 1: Name */}
                <div>
                  <label className="block text-sm sm:text-base font-bold text-slate-600 mb-2">
                    ឈ្មោះរបស់អ្នក
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. លឹម តារា"
                    className="w-full bg-[#f8fafc] border border-slate-100 rounded-xl px-4 py-3.5 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e2722b]/50 text-sm sm:text-base transition-all"
                  />
                </div>

                {/* Input 2: Email */}
                <div>
                  <label className="block text-sm sm:text-base font-bold text-slate-600 mb-2">
                    អាសយដ្ឋានអ៊ីមែល
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full bg-[#f8fafc] border border-slate-100 rounded-xl px-4 py-3.5 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e2722b]/50 text-sm sm:text-base transition-all"
                  />
                </div>

                {/* Input 3: Message */}
                <div>
                  <label className="block text-sm sm:text-base font-bold text-slate-600 mb-2">
                    សរសេរសារនៅទីនេះ...
                  </label>
                  <textarea
                    rows={4}
                    placeholder="តើយើងអាចជួយអ្នកដោយរបៀបណា?"
                    className="w-full bg-[#f8fafc] border border-slate-100 rounded-xl px-4 py-3.5 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e2722b]/50 text-sm sm:text-base transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-[#e2722b] hover:bg-[#d0631f] text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md active:scale-[0.99]"
                >
                  <span>ផ្ញើសារជូនពួកយើង</span>
                  {/* Paper Plane Send Icon */}
                  <svg
                    className="w-5 h-5 -rotate-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          {/* Circular Badge at Bottom Left */}
          <div className="absolute -bottom-8 -left-6 sm:-left-8 hidden md:block">
            <div className="relative w-28 h-28 bg-[#5bb06e] rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              {/* Circular Curved Text SVG */}
              <svg
                className="w-full h-full absolute inset-0 animate-spin-slow"
                viewBox="0 0 100 100"
              >
                <path
                  id="textPath"
                  d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                  fill="none"
                />
                <text className="text-[9.5px] font-bold fill-white tracking-widest uppercase">
                  <textPath href="#textPath">
                    ទីតាំងហាងដែលនៅជិតអ្នក • ទីតាំងហាងដែលនៅជិតអ្នក •
                  </textPath>
                </text>
              </svg>

              {/* Arrow in the center */}
              <svg
                className="w-8 h-8 text-white -rotate-45"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
