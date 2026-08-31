import React from "react";

export default function AboutStorySection() {
  return (
    <section
      aria-label="រឿងរ៉ាវ និងបេសកកម្មរបស់ Mhoubahar FoodHub"
      className="mx-auto max-w-5xl px-4 py-12 text-slate-700 dark:text-slate-300"
    >
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-12">
        {/* Header */}
        <div className="mb-8 border-b border-slate-100 pb-6 dark:border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            About Mhoubahar Platform
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            រឿងរ៉ាវ និងបេសកកម្មរបស់ Mhoubahar FoodHub
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Cambodia’s leading personalized food discovery and meal recommendation platform.
          </p>
        </div>

        {/* Section 1: Vision & Mission */}
        <div className="space-y-6 text-base leading-relaxed">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              ១. បេសកកម្ម និងទស្សនវិស័យ (Vision & Mission)
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              <strong>Mhoubahar FoodHub (ម្ហូបអាហារ)</strong> ត្រូវបានបង្កើតឡើងក្នុងគោលបំណងដោះស្រាយបញ្ហាប្រចាំថ្ងៃរបស់ប្រជាជនកម្ពុជា គឺសំណួរថា <em>&ldquo;តើថ្ងៃនេះញ៉ាំអ្វី?&rdquo;</em>។ យើងផ្តល់ជូននូវប្រព័ន្ធស្វែងរក និងណែនាំមុខម្ហូបឆ្លាតវៃដែលផ្អែកលើទិន្នន័យជាក់ស្តែង ចំណង់ចំណូលចិត្ត សុខភាព អាឡែស៊ី (Allergy) ជំនឿសាសនា (Halal / Buddhism) និងទីតាំងភូមិសាស្ត្ររបស់អ្នកប្រើប្រាស់នៅទូទាំងប្រទេសកម្ពុជា។
            </p>
          </div>

          {/* Section 2: Smart Recommendation Engine */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              ២. បច្ចេកវិទ្យាណែនាំមុខម្ហូបឆ្លាតវៃ (Smart AI Food Recommendation)
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              ប្រព័ន្ធរបស់ <strong>FoodHub</strong> ប្រើប្រាស់ក្បួនដោះស្រាយឆ្លាតវៃ (Intelligent Scoring Algorithm) ដើម្បីគណនាកម្រិតភាពត្រូវគ្នា (Match Percentage) រវាងអ្នកប្រើប្រាស់ និងមុខម្ហូបនីមួយៗ។ ប្រព័ន្ធនេះវិភាគលើកត្តាសំខាន់ៗជាច្រើន រួមមាន ៖
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-6 text-slate-600 dark:text-slate-300">
              <li>
                <strong>ការការពារអាឡែស៊ី (Allergy Safety)</strong> ៖ ជៀសវាងមុខម្ហូបដែលមានគ្រឿងផ្សំដែលអ្នកប្រើប្រាស់មានប្រតិកម្មអាឡែស៊ី ដូចជា សណ្តែកដី គ្រឿងសមុទ្រ ទឹកដោះគោ ឬ gluten។
              </li>
              <li>
                <strong>របបអាហារ និងជំនឿ (Dietary & Religion)</strong> ៖ ត្រួតពិនិត្យ និងណែនាំមុខម្ហូប Halal ម្ហូបបួស (Vegetarian) និងម្ហូប Vegan យ៉ាងត្រឹមត្រូវ។
              </li>
              <li>
                <strong>ពេលវេលាទទួលទាន (Meal Time Journey)</strong> ៖ ណែនាំម្ហូបពេលព្រឹក (Breakfast) ពេលថ្ងៃត្រង់ (Lunch) ពេលល្ងាច (Dinner) និងពេលយប់ (Late Night) ឱ្យសមស្របតាមកាលវេលា។
              </li>
              <li>
                <strong>ទីតាំង និងចម្ងាយ (Location & Proximity)</strong> ៖ ស្វែងរកហាងអាហារ និងភោជនីយដ្ឋានដែលនៅជិតលោកអ្នកបំផុតក្នុងរាជធានីភ្នំពេញ និងតាមបណ្តាខេត្ត។
              </li>
            </ul>
          </div>

          {/* Section 3: Features */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              ៣. មុខងារពិសេសសម្រាប់សហគមន៍ (Community & Social Features)
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Mhoubahar FoodHub មិនត្រឹមតែជាកាតាឡុកម្ហូបអាហារប៉ុណ្ណោះទេ ប៉ុន្តែថែមទាំងជាបណ្តាញទំនាក់ទំនងសង្គមសម្រាប់អ្នកស្រឡាញ់អាហារ (Food Lovers) ៖
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                  🗳️ Group Vote (បោះឆ្នោតជ្រើសម្ហូបជាក្រុម)
                </h4>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  បង្កើតបន្ទប់បោះឆ្នោតដើម្បីឱ្យសមាជិកគ្រួសារ ឬមិត្តភក្តិបោះឆ្នោតសម្រេចចិត្តជ្រើសរើសមុខម្ហូបរួមគ្នាដោយយុត្តិធម៌ និងរហ័ស។
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                  🤝 MeetUp (ណាត់ជួបញ៉ាំអាហារ)
                </h4>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  រៀបចំការណាត់ជួបញ៉ាំអាហារនៅភោជនីយដ្ឋានដែលបានណែនាំ រួមជាមួយការចែករំលែកទីតាំង និងម៉ោងណាត់ជួបយ៉ាងងាយស្រួល។
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                  📱 QR Add Friend (ភ្ជាប់ទំនាក់ទំនងរហ័ស)
                </h4>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  ស្កេន QR Code ដើម្បី Add មិត្តភក្តិ ចែករំលែកមុខម្ហូបដែលចូលចិត្ត និងមើលការវាយតម្លៃអាហារពីមិត្តភក្តិជិតស្និទ្ធ។
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                  🗣️ Voice Alert (ការជូនដំណឹងជាសំឡេង)
                </h4>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  ប្រព័ន្ធជូនដំណឹងជាសំឡេងដោយស្វ័យប្រវត្តិនៅពេលលោកអ្នកធ្វើដំណើរឆ្លងកាត់ហាងអាហារដែលត្រូវនឹងចំណូលចិត្តរបស់អ្នក។
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Empowering Local Khmer Restaurants */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              ៤. ការលើកកម្ពស់ម្ហូបខ្មែរ និងហាងអាហារក្នុងស្រុក (Empowering Local Food)
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              យើងប្តេជ្ញាចិត្តជួយផ្សព្វផ្សាយម្ហូបខ្មែរប្រពៃណី ម្ហូបតាមតំបន់ ព្រមទាំងគាំទ្រអាជីវកម្មភោជនីយដ្ឋានខ្នាតតូច និងមធ្យមនៅកម្ពុជា ឱ្យមានវត្តមានលើប្រព័ន្ធឌីជីថល (Digital Presence) និងអាចទៅដល់អតិថិជនគោលដៅបានកាន់តែទូលំទូលាយ។
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
