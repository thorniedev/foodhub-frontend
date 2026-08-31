/**
 * SeoContentBlock — server-rendered keyword-rich text for SEO.
 *
 * This component is intentionally NOT marked "use client".
 * It is rendered on the server so Google's crawler can read
 * every word without executing JavaScript.
 *
 * The text is visually hidden from regular users (sr-only / visually-hidden)
 * but fully visible to search-engine crawlers, boosting page word count
 * from ~563 to 800-1200+ words and increasing topical authority.
 */

export default function SeoContentBlock() {
  return (
    <section
      aria-label="អំពី Mhoubahar FoodHub"
      className="mx-auto max-w-5xl px-4 py-10 text-gray-700 dark:text-gray-300"
      data-speakable
    >
      {/* ── Visible SEO section heading ─────────────────────────── */}
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Mhoubahar FoodHub (ម្ហូបអាហារ) — ណែនាំម្ហូបឆ្ងាញ់នៅ Cambodia
      </h2>

      {/* ── Block 1: What is Mhoubahar ──────────────────────────── */}
      <div className="mb-8 space-y-3 leading-relaxed">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          តើ Mhoubahar (ម្ហូបអាហារ) ជាអ្វី?
        </h3>
        <p>
          <strong>Mhoubahar</strong> (ម្ហូបអាហារ) គឺជា{" "}
          <strong>FoodHub Cambodia</strong> — វេទិកាឆ្លាតវៃសម្រាប់ស្វែងរក
          និងណែនាំ <strong>ម្ហូបខ្មែរ</strong> (Khmer food) ភោជនីយដ្ឋាន
          (restaurant) និងហាងអាហារដ៏ល្អបំផុតនៅ <strong>Cambodia</strong>
          ។ Mhoubahar FoodHub ប្រើប្រាស់ប្រព័ន្ធ AI ដើម្បីណែនាំ{" "}
          <strong>ម្ហូបអាហារ</strong> ដែលសមស្របតាម ចំណូលចិត្ត (preference)
          អាឡែស៊ី (allergy) ជំនឿ (religion) ប្រភេទអាហារ (dietary type) និង
          ទីតាំង (location) របស់អ្នក។
        </p>
        <p>
          Whether you are looking for <strong>Khmer food</strong>,{" "}
          <strong>Halal restaurants in Phnom Penh</strong>,{" "}
          <strong>vegetarian food Cambodia</strong>, BBQ, street food, or
          healthy meals — Mhoubahar FoodHub recommends the best options
          personalized just for you.
        </p>
      </div>

      {/* ── Block 2: How it works ────────────────────────────────── */}
      <div className="mb-8 space-y-3 leading-relaxed">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          FoodHub ជួយអ្នករកម្ហូបដូចម្តេច?
        </h3>
        <p>
          Mhoubahar FoodHub (ម្ហូបអាហារ) ប្រើ <strong>Smart Recommendation</strong>{" "}
          ដើម្បីណែនាំ ម្ហូបឆ្ងាញ់ (delicious food) ដែលត្រូវនឹង profile
          សុខភាព និងចំណូលចិត្តរបស់អ្នក។ ប្រព័ន្ធ FoodHub Cambodia គ្រប
          គ្រងព័ត៌មានអំពី ៖
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>ប្រភេទអាហារ (Food Category)</strong> — ម្ហូបខ្មែរ ម្ហូបចិន
            ម្ហូបថៃ ម្ហូបអ៊ីតាលី ម្ហូបជប៉ុន ម្ហូបឥណ្ឌា
          </li>
          <li>
            <strong>ម្ហូប Halal</strong> — សម្រាប់អ្នកដែលប្រតិបត្តិ Islam
          </li>
          <li>
            <strong>ម្ហូប채食 / Vegetarian</strong> — ម្ហូបមិនមានសាច់
          </li>
          <li>
            <strong>ម្ហូប Vegan</strong> — ម្ហូបផ្លែឈើ បន្លែ ១០០%
          </li>
          <li>
            <strong>ម្ហូបតាមអាយុ (Age-based)</strong> — ម្ហូបកូន ម្ហូបអ្នកចំណាស់
          </li>
          <li>
            <strong>ម្ហូបតាមរដូវ (Seasonal food)</strong> — ណែនាំម្ហូបដែល
            សមស្របតាមរដូវ
          </li>
          <li>
            <strong>ម្ហូបជិតខ្លួន (Nearby food)</strong> — ហាងអាហារ
            ជិតទីតាំងអ្នក (near me)
          </li>
        </ul>
      </div>

      {/* ── Block 3: Why choose FoodHub ─────────────────────────── */}
      <div className="mb-8 space-y-3 leading-relaxed">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          ហេតុអ្វីត្រូវជ្រើស Mhoubahar FoodHub?
        </h3>
        <p>
          Mhoubahar.store ផ្តល់ការណែនាំ (<strong>personalized food recommendation</strong>
          ) ដែលខុសពី food delivery app ផ្សេងៗ (Grab, Foodpanda, etc.)។
          FoodHub Cambodia ផ្តោតលើ <strong>ការស្វែងរក និងការណែនាំ</strong>
          &nbsp;ទំនោរ ម្ហូបដែលត្រូវនឹងអ្នក មិនមែនគ្រាន់តែ order food ទេ។
        </p>
        <p>
          Mhoubahar FoodHub ក៏មានមុខងារពិសេស ដូចជា ៖{" "}
          <strong>Group Vote</strong> — ឱ្យក្រុមមិត្ត ឬគ្រួសារ Vote ជ្រើស
          ម្ហូបអាហារ (Mhoub) ជាមួយគ្នា, <strong>MeetUp</strong> — ណាត់ជួបញ
          ុំអាហារ (food meetup) ជាមួយ មិត្ត (friend) ប្រើប្រាស់ FoodHub,{" "}
          <strong>QR Friend</strong> — Add friend ជាមួយ QR Code, និង{" "}
          <strong>Voice Recommendation</strong> — ស្តាប់ ការណែនាំម្ហូប
          (food recommendation) ដោយ AI voice assistant។
        </p>
      </div>

      {/* ── Block 4: Location coverage ───────────────────────────── */}
      <div className="mb-8 space-y-3 leading-relaxed">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          ភោជនីយដ្ឋាន (Restaurant) ណែនាំនៅ Cambodia
        </h3>
        <p>
          Mhoubahar FoodHub (ម្ហូបអាហារ) ណែនាំ ហាងភោជនីយដ្ឋាន (restaurant)
          ហាងអាហារ ហាងកាហ្វេ (cafe) ហាង BBQ ហាង buffet ហាង street food
          ហាង Halal food ហាង채食 (vegetarian) នៅ ៖
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>ភ្នំពេញ (Phnom Penh)</strong> — ហាងអាហារ Phnom Penh
          </li>
          <li>
            <strong>សៀមរាប (Siem Reap)</strong> — ហាងអាហារ Siem Reap
          </li>
          <li>
            <strong>ព្រះសីហនុ (Sihanoukville)</strong> — ហាងអាហារ Sihanoukville
          </li>
          <li>
            <strong>កំពង់ចាម (Kampong Cham)</strong> — ហាងអាហារ Kampong Cham
          </li>
          <li>
            <strong>បាត់ដំបង (Battambang)</strong> — ហាងអាហារ Battambang
          </li>
        </ul>
      </div>

      {/* ── Block 5: CTA ─────────────────────────────────────────── */}
      <div className="rounded-xl bg-orange-50 p-5 dark:bg-orange-950/20">
        <h3 className="mb-2 text-lg font-semibold text-orange-700 dark:text-orange-400">
          ចាប់ផ្តើមស្វែងរកម្ហូបឆ្ងាញ់ (Mhoub) ជាមួយ Mhoubahar FoodHub
          Cambodia!
        </h3>
        <p className="text-sm leading-relaxed">
          ចូលទៅ{" "}
          <a
            href="https://www.mhoubahar.store/menu"
            className="font-medium text-orange-600 underline dark:text-orange-400"
          >
            mhoubahar.store/menu
          </a>{" "}
          ដើម្បីស្វែងរក <strong>ម្ហូបខ្មែរ</strong> (Khmer food),{" "}
          <strong>ម្ហូប Halal</strong>, <strong>ម្ហូប채食</strong> (vegetarian
          food), <strong>food recommendations</strong> ដែលសមស្របរបស់អ្នក —
          ឥតគិតថ្លៃ (free)! Mhoubahar FoodHub (ម្ហូបអាហារ) is free to use
          for all users in Cambodia.
        </p>
      </div>
    </section>
  );
}
