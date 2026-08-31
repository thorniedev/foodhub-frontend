"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const cardEntrance = (index: number, reduceMotion: boolean | null) =>
  ({
    initial: reduceMotion ? false : { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.7, ease: EASE_OUT, delay: index * 0.15 },
  }) as const;

export default function AboutStorySection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      aria-label="រឿងរ៉ាវ និងបេសកកម្មរបស់ Mhoubahar FoodHub"
      className="mx-auto max-w-7xl px-4 py-16 text-slate-700 dark:text-slate-300 md:py-24 lg:px-8"
    >
      <div className="flex flex-col gap-10 lg:gap-14">
        {/* Header */}
        <div className="mb-10 text-center md:mb-14">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="mb-4"
          >
            <span className="inline-block rounded-full bg-[#E9F9EF] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#136c34] dark:bg-emerald-900/40 dark:text-emerald-400">
              About Mhoubahar Platform
            </span>
          </motion.div>
          <motion.h2
            className="text-center font-semibold text-primary-800 lg:text-6xl py-2 md:text-5xl max-md:text-3xl dark:text-[#22a447] dark:text-primary-dark"
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: 30, letterSpacing: "0.18em" }
            }
            whileInView={{ opacity: 1, y: 0, letterSpacing: "0.025em" }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.85, ease: EASE_OUT }}
          >
            <span className="text-[#f97316]">រឿងរ៉ាវ និងបេសកកម្មរបស់ </span>{" "}
            <br />
            <span className="text-[#136c34] dark:text-primary-dark">
              Mhoubahar FoodHub
            </span>
          </motion.h2>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.2 }}
            className="mx-auto mt-4 text-lg leading-relaxed text-slate-500 dark:text-slate-400"
          >
            Cambodia’s leading personalized food discovery and meal
            recommendation platform.
          </motion.p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Card 1: Vision & Mission (Half Width) */}
          <motion.div
            {...cardEntrance(1, reduceMotion)}
            className="flex flex-col justify-center rounded-3xl bg-[#E9F9EF] p-8 dark:bg-emerald-900/20 sm:p-10"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-200 text-emerald-700 dark:bg-emerald-800/50 dark:text-emerald-300">
              <svg
                className="size-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-primary-800 dark:text-white sm:text-2xl">
              ១. បេសកកម្ម និងទស្សនវិស័យ
            </h3>
            <p className="mt-4 text-lg leading-relaxed text-slate-700 dark:text-slate-300">
              <strong>Mhoubahar FoodHub</strong>{" "}
              ត្រូវបានបង្កើតឡើងក្នុងគោលបំណងដោះស្រាយបញ្ហាប្រចាំថ្ងៃរបស់ប្រជាជនកម្ពុជា
              គឺសំណួរថា <em>&ldquo;តើថ្ងៃនេះញ៉ាំអ្វី?&rdquo;</em>{" "}
              យើងផ្តល់ជូននូវប្រព័ន្ធស្វែងរក
              និងណែនាំមុខម្ហូបឆ្លាតវៃដែលផ្អែកលើទិន្នន័យជាក់ស្តែង ចំណង់ចំណូលចិត្ត
              សុខភាព និងទីតាំងរបស់អ្នកប្រើប្រាស់។
            </p>
          </motion.div>

          {/* Card 2: Empowering Local Food (Half Width) */}
          <motion.div
            {...cardEntrance(2, reduceMotion)}
            className="flex flex-col justify-center rounded-3xl bg-[#fff7ed] p-8 dark:bg-orange-900/20 sm:p-10"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-200 text-orange-700 dark:bg-orange-800/50 dark:text-orange-300">
              <svg
                className="size-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-primary-800 dark:text-white sm:text-2xl">
              ៤. ការលើកកម្ពស់ម្ហូបខ្មែរ
            </h3>
            <p className="mt-4 text-lg leading-relaxed text-slate-700 dark:text-slate-300">
              យើងប្តេជ្ញាចិត្តជួយផ្សព្វផ្សាយម្ហូបខ្មែរប្រពៃណី
              ព្រមទាំងគាំទ្រអាជីវកម្មភោជនីយដ្ឋានខ្នាតតូច និងមធ្យមនៅកម្ពុជា
              ឱ្យមានវត្តមានលើប្រព័ន្ធឌីជីថល
              និងអាចទៅដល់អតិថិជនគោលដៅបានកាន់តែទូលំទូលាយ។
            </p>
          </motion.div>

          {/* Card 3: Smart AI Recommendation (Full Width) */}
          <motion.div
            {...cardEntrance(3, reduceMotion)}
            className="flex flex-col rounded-3xl bg-slate-50 p-8 dark:bg-slate-800/30 sm:p-10 lg:col-span-2 border border-slate-100 dark:border-slate-800/60"
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-800/50 dark:text-emerald-300">
                <svg
                  className="size-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary-800 dark:text-white sm:text-2xl">
                ២. បច្ចេកវិទ្យាណែនាំមុខម្ហូបឆ្លាតវៃ (Smart AI)
              </h3>
            </div>

            <p className="mb-8 text-lg leading-relaxed text-slate-700 dark:text-slate-300">
              ប្រព័ន្ធរបស់ប្រើប្រាស់ក្បួនដោះស្រាយឆ្លាតវៃ (Intelligent Scoring
              Algorithm) ដើម្បីគណនាកម្រិតភាពត្រូវគ្នារវាងអ្នកប្រើប្រាស់
              និងមុខម្ហូបនីមួយៗ ៖
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <h4 className="font-semibold text-lg text-slate-800 dark:text-slate-200">
                  ការការពារអាឡែស៊ី (Allergy Safety)
                </h4>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                  ជៀសវាងមុខម្ហូបដែលមានគ្រឿងផ្សំដែលអ្នកមានប្រតិកម្មអាឡែស៊ី ដូចជា
                  សណ្តែកដី គ្រឿងសមុទ្រ ទឹកដោះគោ ឬ gluten។
                </p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <h4 className="font-semibold text-lg text-slate-800 dark:text-slate-200">
                  របបអាហារ & ជំនឿ (Dietary & Religion)
                </h4>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                  ត្រួតពិនិត្យ និងណែនាំមុខម្ហូប Halal ម្ហូបបួស (Vegetarian)
                  និងម្ហូប Vegan យ៉ាងត្រឹមត្រូវ។
                </p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <h4 className="font-semibold text-lg text-slate-800 dark:text-slate-200">
                  ពេលវេលាទទួលទាន (Meal Time)
                </h4>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                  ណែនាំម្ហូបពេលព្រឹក ពេលថ្ងៃត្រង់ ពេលល្ងាច និងពេលយប់
                  ឱ្យសមស្របតាមកាលវេលា។
                </p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <h4 className="font-semibold text-lg text-slate-800 dark:text-slate-200">
                  ទីតាំង និងចម្ងាយ (Location)
                </h4>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                  ស្វែងរកហាងអាហារ
                  និងភោជនីយដ្ឋានដែលនៅជិតលោកអ្នកបំផុតក្នុងរាជធានីភ្នំពេញ
                  និងតាមបណ្តាខេត្ត។
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Community Features (Full Width) */}
          <motion.div
            {...cardEntrance(4, reduceMotion)}
            className="flex flex-col rounded-3xl bg-slate-50 p-8 dark:bg-slate-800/30 sm:p-10 lg:col-span-2 border border-slate-100 dark:border-slate-800/60"
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700 dark:bg-orange-800/50 dark:text-orange-300">
                <svg
                  className="size-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary-800 dark:text-white sm:text-2xl">
                ៣. មុខងារពិសេសសម្រាប់សហគមន៍
              </h3>
            </div>

            <p className="mb-8 text-lg leading-relaxed text-slate-700 dark:text-slate-300">
              Mhoubahar FoodHub ជាបណ្តាញទំនាក់ទំនងសង្គមសម្រាប់អ្នកស្រឡាញ់អាហារ
              (Food Lovers) ៖
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[20px] bg-white p-5 shadow-sm dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Group Vote
                </h4>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                  បោះឆ្នោតសម្រេចចិត្តជ្រើសរើសមុខម្ហូបរួមគ្នាជាមួយមិត្តភក្តិ។
                </p>
              </div>
              <div className="rounded-[20px] bg-white p-5 shadow-sm dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  MeetUp
                </h4>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                  រៀបចំការណាត់ជួបញ៉ាំអាហារ និងចែករំលែកទីតាំងងាយស្រួល។
                </p>
              </div>
              <div className="rounded-[20px] bg-white p-5 shadow-sm dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  QR Add Friend
                </h4>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                  ស្កេន QR Code ដើម្បី Add មិត្តភក្តិ
                  និងមើលការវាយតម្លៃរបស់ពួកគេ។
                </p>
              </div>
              <div className="rounded-[20px] bg-white p-5 shadow-sm dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Voice Alert
                </h4>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                  ប្រព័ន្ធជូនដំណឹងជាសំឡេងនៅពេលឆ្លងកាត់ហាងត្រូវចំណូលចិត្ត។
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
