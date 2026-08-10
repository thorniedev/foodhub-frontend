// components/ContactSection.tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/** Shared "expo out" curve — fast start, soft landing. Feels premium, not bouncy. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

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

/* =========================================================
   MOTION HELPERS

   Same idiom as MentorSection: each element declares its own
   entrance with an index-based delay.
========================================================= */

/** ENTRANCE: lifts + un-blurs a panel on scroll-in. */
const panelEntrance = (index: number, reduceMotion: boolean | null) =>
  ({
    initial: reduceMotion
      ? false
      : { opacity: 0, y: 48, scale: 0.95, filter: "blur(8px)" },
    whileInView: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.95, ease: EASE_OUT, delay: index * 0.16 },
  }) as const;

/** Rows inside a panel: quick fade-up, tightly staggered. */
const rowEntrance = (delay: number, reduceMotion: boolean | null) =>
  ({
    initial: reduceMotion ? false : { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.55, ease: EASE_OUT, delay },
  }) as const;

export default function ContactSection() {
  const reduceMotion = useReducedMotion();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <section className="relative w-full  py-16 px-4 sm:px-6 lg:px-8 font-['Kantumruy_Pro',sans-serif]">
      <div className="max-w-7xl container mx-auto px-4">
        {/* Header Title — letter-spacing tightens as it settles */}
        <div className="text-center mb-12">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight"
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: 30, letterSpacing: "0.18em" }
            }
            whileInView={{ opacity: 1, y: 0, letterSpacing: "-0.025em" }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.85, ease: EASE_OUT }}
          >
            <span className="text-[#136C34] dark:text-primary-dark">
              ទំនាក់ទំនង
            </span>
            <span className="text-[#e2722b]">មកយើង</span>
          </motion.h2>
          <motion.p
            {...rowEntrance(0.22, reduceMotion)}
            className="mt-4 text-base sm:text-lg md:text-xl font-medium "
          >
            មានសំណួរ ឬចង់ធ្វើជាដៃគូជាមួយយើង?{" "}
            <span className="">យើងរីករាយនឹងទទួលសារពីអ្នក។</span>
          </motion.p>
        </div>

        {/* Main Outer Card Container */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="relative bg-[#fbf3eb]  rounded-[36px] p-6 sm:p-10 lg:p-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Side: FAQ Accordion */}
            <motion.div
              {...panelEntrance(0, reduceMotion)}
              className="lg:col-span-6 flex flex-col justify-between h-full"
            >
              <div>
                {/* Title with decorative underline */}
                <div className="relative inline-block mb-8">
                  <motion.h3
                    {...rowEntrance(0.28, reduceMotion)}
                    className="text-xl sm:text-2xl font-bold dark:text-primary-dark text-[#136C34]"
                  >
                    សំណួរដែលពួកយើងតែងទទួលបាន ៖
                  </motion.h3>
                  {/* Decorative underline — draws itself, then the dot lands */}
                  <svg
                    className="absolute -bottom-3 left-0 w-full h-3 text-[#e2722b]"
                    viewBox="0 0 200 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <motion.path
                      d="M2 8C50 2 150 2 190 8"
                      stroke="#e2722b"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      initial={reduceMotion ? false : { pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{
                        duration: 0.9,
                        ease: EASE_OUT,
                        delay: 0.45,
                      }}
                    />
                    <motion.circle
                      cx="195"
                      cy="8"
                      r="4"
                      fill="#3b7c52"
                      style={{
                        transformBox: "fill-box",
                        transformOrigin: "center",
                      }}
                      initial={reduceMotion ? false : { scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 14,
                        delay: 1.25,
                      }}
                    />
                  </svg>
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                  {faqData.map((item, faqIndex) => {
                    const isOpen = openFaq === item.id;
                    return (
                      <motion.div
                        key={item.id}
                        {...rowEntrance(0.42 + faqIndex * 0.09, reduceMotion)}
                        className="bg-white rounded-2xl shadow-sm border border-slate-100/80 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFaq(item.id)}
                          className="w-full flex items-center justify-between p-4 sm:p-5 text-left gap-3 focus:outline-none"
                        >
                          <span className="text-sm sm:text-base font-bold text-[#1f2937] leading-relaxed">
                            {item.question}
                          </span>
                          <motion.span
                            className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-500"
                            animate={
                              reduceMotion
                                ? undefined
                                : {
                                    rotate: isOpen ? 180 : 0,
                                    backgroundColor: isOpen
                                      ? "#fdece0"
                                      : "#f1f5f9",
                                    color: isOpen ? "#e2722b" : "#64748b",
                                  }
                            }
                            transition={{
                              type: "spring",
                              stiffness: 320,
                              damping: 22,
                            }}
                            whileHover={
                              reduceMotion ? undefined : { scale: 1.12 }
                            }
                          >
                            <svg
                              className="w-4 h-4"
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
                          </motion.span>
                        </button>

                        {/*
                          Accordion Answer Content

                          AnimatePresence + height:auto, so closing
                          animates too. Mounting/unmounting the div
                          made it snap open and vanish on close.
                        */}
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              key="answer"
                              initial={
                                reduceMotion ? false : { height: 0, opacity: 0 }
                              }
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{
                                height: { duration: 0.38, ease: EASE_OUT },
                                opacity: { duration: 0.25 },
                              }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5 pt-1 text-sm sm:text-base text-slate-600 border-t border-slate-50 leading-relaxed">
                                {item.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Right Side: Contact Form Card */}
            <motion.div
              {...panelEntrance(1, reduceMotion)}
              className="lg:col-span-6 bg-white rounded-[28px] p-6 sm:p-8 shadow-sm"
            >
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                {/* Input 1: Name */}
                <motion.div {...rowEntrance(0.46, reduceMotion)}>
                  <label className="block text-sm sm:text-base font-bold text-slate-600 mb-2">
                    ឈ្មោះរបស់អ្នក
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. លឹម តារា"
                    className="w-full  border border-slate-100 rounded-xl px-4 py-3.5 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e2722b]/50 text-sm sm:text-base transition-all"
                  />
                </motion.div>

                {/* Input 2: Email */}
                <motion.div {...rowEntrance(0.55, reduceMotion)}>
                  <label className="block text-sm sm:text-base font-bold text-slate-600 mb-2">
                    អាសយដ្ឋានអ៊ីមែល
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full  border border-slate-100 rounded-xl px-4 py-3.5 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e2722b]/50 text-sm sm:text-base transition-all"
                  />
                </motion.div>

                {/* Input 3: Message */}
                <motion.div {...rowEntrance(0.64, reduceMotion)}>
                  <label className="block text-sm sm:text-base font-bold text-slate-600 mb-2">
                    សរសេរសារនៅទីនេះ...
                  </label>
                  <textarea
                    rows={4}
                    placeholder="តើយើងអាចជួយអ្នកដោយរបៀបណា?"
                    className="w-full  border border-slate-100 rounded-xl px-4 py-3.5 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e2722b]/50 text-sm sm:text-base transition-all resize-none"
                  />
                </motion.div>

                {/* Submit Button — the plane takes off on hover */}
                <motion.button
                  type="submit"
                  {...rowEntrance(0.73, reduceMotion)}
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                  className="group w-full bg-[#e2722b] hover:bg-[#d0631f] text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-colors duration-200 shadow-md"
                >
                  <span>ផ្ញើសារជូនពួកយើង</span>
                  {/* Paper Plane Send Icon */}
                  <motion.svg
                    className="w-5 h-5 -rotate-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    variants={{
                      rest: { x: 0, y: 0 },
                      hover: { x: 4, y: -4 },
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 15,
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </motion.svg>
                </motion.button>
              </form>
            </motion.div>
          </div>

          {/* Circular Badge at Bottom Left */}
          <motion.div
            initial={
              reduceMotion ? false : { scale: 0, rotate: -60, opacity: 0 }
            }
            whileInView={{ scale: 1, rotate: 12, opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 18,
              delay: 0.7,
            }}
            whileHover={reduceMotion ? undefined : { scale: 1.05, rotate: 12 }}
            className="
    absolute  
    w-28 h-28
    md:w-36 md:h-36
    text-white
    bg-primary-400
    rounded-full
    flex items-center justify-center
    shadow-xl
    cursor-pointer
    border-[3px]
    -left-10 -bottom-5
    border-black/5
  "
          >
            {/* Infinite rotating circular text */}
            <motion.div
              className="absolute inset-1"
              animate={reduceMotion ? undefined : { rotate: -360 }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            >
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full overflow-visible"
              >
                <defs>
                  <path
                    id="circlePath"
                    d="
            M 50,50
            m -36,0
            a 36,36 0 1,1 72,0
            a 36,36 0 1,1 -72,0
          "
                  />
                </defs>

                <text
                  fill="white"
                  className="
          text-[11px]
          font-black
          tracking-[0.11em]
        "
                >
                  <textPath href="#circlePath" startOffset="0%">
                    • ស្វែងរកអាហារជាមួយទីតាំងហាងដែលនៅជិតអ្នក •
                  </textPath>
                </text>
              </svg>
            </motion.div>

            {/* Center arrow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.svg
                className="
        w-8 h-8
        md:w-10 md:h-10
        text-white
        -rotate-45
      "
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                animate={reduceMotion ? undefined : { x: [0, 4, 0] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </motion.svg>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
  