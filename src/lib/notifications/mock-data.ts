// components/dashboard/notifications/mock-data.ts
import type {
  AppNotification,
  NotificationFilterTab,
  NotificationSummaryCard,
} from "@/types/notifications";

/** ស្លាកសង្ខេបខាងលើ (Recommendations / Health / Meal / Favorites / Family / Account) */
export const summaryCards: NotificationSummaryCard[] = [
  {
    category: "recommendations",
    label: "ការណែនាំ",
    count: 3,
    icon: "sparkles",
    accent: "emerald",
  },
  {
    category: "health",
    label: "សុខភាព",
    count: 3,
    icon: "heart",
    accent: "rose",
  },
  {
    category: "meal",
    label: "អាហារ",
    count: 3,
    icon: "utensils",
    accent: "amber",
  },
  {
    category: "favorites",
    label: "ចំណូលចិត្ត",
    count: 3,
    icon: "star",
    accent: "yellow",
  },
  {
    category: "family",
    label: "គ្រួសារ",
    count: 3,
    icon: "users",
    accent: "violet",
  },
  {
    category: "account",
    label: "គណនី",
    count: 3,
    icon: "settings",
    accent: "slate",
  },
];

/** តម្រង tab ជួរទីពីរ */
export const filterTabs: NotificationFilterTab[] = [
  { key: "all", label: "ទាំងអស់", count: 7 },
  {
    key: "recommendations",
    label: "ការជ្រើសរើសដោយ AI",
    count: 3,
    dotColor: "bg-emerald-500",
  },
  { key: "health", label: "សុខភាព", count: 3, dotColor: "bg-rose-500" },
  { key: "reminders", label: "ការរំលឹក", count: 1, dotColor: "bg-orange-500" },
  {
    key: "favorites",
    label: "ចំណូលចិត្ត",
    count: 1,
    dotColor: "bg-yellow-500",
  },
  { key: "family", label: "គ្រួសារ", count: 1, dotColor: "bg-violet-500" },
  { key: "account", label: "ប្រព័ន្ធ", dotColor: "bg-slate-400" },
];

/** ទិន្នន័យគំរូ ត្រូវនឹងអេក្រង់ដើម — ជំនួសដោយ API ពិតនៅពេលភ្ជាប់ backend */
export const notifications: AppNotification[] = [
  {
    id: "n1",
    category: "recommendations",
    title: "អាហារថ្មី ៥ មុខរួចរាល់សម្រាប់អ្នក",
    message:
      "ដោយផ្អែកលើសកម្មភាពថ្មីៗ និងចំណូលចិត្តកាបូអ៊ីដ្រាតទាបរបស់អ្នក យើងបានរៀបចំមុខម្ហូបអាហារថ្ងៃត្រង់ជាច្រើន — រួមទាំង Grilled Salmon Bowl ដែលអ្នកមិនទាន់សាកល្បង។",
    tags: [
      { label: "ការណែនាំ" },
      { label: "ផ្ទាល់ខ្លួន" },
      { label: "អាហារថ្ងៃត្រង់" },
    ],
    createdAt: "2026-07-27T09:48:00",
    isUnread: true,
    action: { label: "មើលការណែនាំ", href: "/dashboard/recommendations" },
    group: "today",
  },
  {
    id: "n2",
    category: "meal",
    title: "ផែនការអាហារពេលល្ងាចរបស់អ្នកត្រូវបានធ្វើបច្ចុប្បន្នភាព",
    message:
      "យើងបានប្តូរម្ហូបប៉ាស្តា ហើយបន្ថែម Lemon Herb Baked Cod ដែលសមស្របនឹងគោលដៅកាឡូរីរបស់អ្នកសម្រាប់ថ្ងៃនេះ។ រយៈពេលចម្អិន៖ ៣០ នាទី។",
    tags: [
      { label: "ការណែនាំ" },
      { label: "រៀបចំដោយស្វ័យប្រវត្តិ" },
      { label: "អាហារពេលល្ងាច" },
    ],
    createdAt: "2026-07-27T06:50:00",
    isUnread: true,
    action: { label: "មើលផែនការអាហារ", href: "/dashboard/meal-plan" },
    group: "today",
  },
  {
    id: "n3",
    category: "health",
    title: "រកឃើញអាហារសមុទ្រនៅក្នុងម្ហូបដែលបានរក្សាទុក",
    message:
      'រូបមន្ត "Spicy Shrimp Tacos" ដែលអ្នករក្សាទុកកាលពីសប្តាហ៍មុន មានបង្គាដែលអាចបង្កហានិភ័យសម្រាប់ Alex Chen ។ យើងណែនាំឱ្យដកវាចេញពីផែនការរបស់អ្នក។',
    tags: [
      { label: "សុខភាព និងអាឡែស៊ី" },
      { label: "ការជូនដំណឹងអាឡែស៊ី" },
      { label: "Alex Chen" },
    ],
    createdAt: "2026-07-27T05:03:00",
    isUnread: true,
    isUrgent: true,
    action: { label: "ពិនិត្យរូបមន្ត", href: "/dashboard/favorites" },
    group: "today",
  },
  {
    id: "n4",
    category: "health",
    title: "មានជម្រើសដ៏ល្អសុខភាពជាង",
    message:
      "អ្នកបានកត់ត្រាបាយសនៅជាមួយអាហារពេលល្ងាច ៤ ដងក្នុងសប្តាហ៍នេះ។ សាកល្បងបាយផ្កាខ្ញីជំនួសដើម្បីទទួលបានវាយនភាពស្រដៀងគ្នា ជាមួយកាបូអ៊ីដ្រាតតិចជាង ៧០% — សមស្របនឹងគោលដៅកាបូអ៊ីដ្រាតទាបរបស់អ្នកបំផុត។",
    tags: [{ label: "សុខភាព និងអាឡែស៊ី" }, { label: "គន្លឹះអាហារូបត្ថម្ភ" }],
    createdAt: "2026-07-27T05:00:00",
    isUnread: true,
    isUrgent: true,
    action: { label: "មើលជម្រើសផ្លាស់ប្តូរ", href: "/dashboard/health" },
    group: "today",
  },
  {
    id: "n5",
    category: "meal",
    title: "ដល់ពេលអាហារថ្ងៃត្រង់ហើយ — អាហាររបស់អ្នករង់ចាំ",
    message:
      "វេលា ១២:០០ ។ អាហារថ្ងៃត្រង់ដែលបានគ្រោងទុករបស់អ្នកគឺ Quinoa Mediterranean Bowl — ចំណាយពេលរៀបចំត្រឹមតែ ២៥ នាទី។ ចាប់ផ្តើមឥឡូវនេះដើម្បីញ៉ាំតាមកាលវិភាគ។",
    tags: [{ label: "ការរំលឹកអាហារ" }, { label: "អាហារថ្ងៃត្រង់ · ២៥ នាទី" }],
    createdAt: "2026-07-27T12:00:00",
    isUnread: true,
    action: { label: "មើលរូបមន្ត", href: "/dashboard/meal-plan" },
    group: "today",
  },
  {
    id: "n6",
    category: "favorites",
    title: "មុខម្ហូបថ្មីស្រដៀងនឹងចំណូលចិត្តរបស់អ្នក",
    message:
      "អ្នកចូលចិត្ត Mushroom Risotto ។ យើងបានរកឃើញ Truffle & Porcini Risotto នៅ Osteria Verde ជិតៗ — វាយតម្លៃ ៤.៩ និងស្ថិតក្នុងកម្រិតកាឡូរីរបស់អ្នក។",
    tags: [{ label: "ចំណូលចិត្ត" }, { label: "ជិតៗ · ០.៨ គីឡូម៉ែត្រ" }],
    createdAt: "2026-07-27T08:30:00",
    isUnread: true,
    action: { label: "រកមើលបន្ថែម", href: "/dashboard/favorites" },
    group: "today",
  },
  {
    id: "n7",
    category: "family",
    title: "ផែនការមិនប្រើគ្រាប់ស្វិតរបស់ Mia ត្រូវបានធ្វើបច្ចុប្បន្នភាព",
    message:
      "យើងបានធ្វើបច្ចុប្បន្នភាពការណែនាំអាហារថ្ងៃត្រង់សាលារបស់ Mia សម្រាប់សប្តាហ៍នេះ ដោយដកគ្រាប់ស្វិតគ្រប់ប្រភេទចេញ។ ជម្រើសថ្មី ៥ បន្ថែម រួមទាំង Sunflower Seed Butter Wrap ។",
    tags: [
      { label: "ព័ត៌មានគ្រួសារ" },
      { label: "Mia Chen · គ្មានគ្រាប់ស្វិត" },
    ],
    createdAt: "2026-07-27T04:45:00",
    isUnread: true,
    actor: { name: "Mia Chen", initials: "MC", color: "bg-amber-500" },
    action: { label: "មើលផែនការរបស់ Mia", href: "/dashboard/family-profile" },
    group: "today",
  },
  {
    id: "n8",
    category: "recommendations",
    title: "ការចម្រុះអាហារប្រចាំសប្តាហ៍ត្រូវបានដោះសោ",
    message:
      "អ្នកបានស្មោះត្រង់នឹងគោលដៅរបស់អ្នកអស់រយៈពេល ១២ ថ្ងៃជាប់គ្នា! យើងបានបន្ថែមមុខម្ហូបអន្តរជាតិថ្មីៗ — ជប៉ុន លីបង់ និងម៉ិកស៊ិក — ទៅក្នុងការណែនាំចុងសប្តាហ៍របស់អ្នក។",
    tags: [{ label: "ការណែនាំ" }, { label: "រង្វាន់សម្រេចគោលដៅ" }],
    createdAt: "2026-07-26T09:00:00",
    isUnread: false,
    action: { label: "រកមើលមុខម្ហូបថ្មី", href: "/dashboard/recommendations" },
    group: "yesterday",
  },
  {
    id: "n9",
    category: "meal",
    title: "កុំរំលងអាហារពេលព្រឹកថ្ងៃស្អែក",
    message:
      "អ្នកបានរំលងអាហារពេលព្រឹក ៣ ក្នុងចំណោម ៧ ថ្ងៃចុងក្រោយ។ អាហារពេលព្រឹកជាទៀងទាត់ជួយរក្សាតុល្យភាពកាឡូរីប្រចាំថ្ងៃ។ យើងបានកំណត់ការរំលឹកសម្រាប់វេលា ៨:០០ ព្រឹក។",
    tags: [{ label: "ការរំលឹកអាហារ" }, { label: "ការយល់ដឹងអំពីទម្លាប់" }],
    createdAt: "2026-07-26T07:00:00",
    isUnread: false,
    action: { label: "កំណត់ការរំលឹក", href: "/dashboard/meal-plan" },
    group: "yesterday",
  },
  {
    id: "n10",
    category: "favorites",
    title: "នំបុ័ង Avocado Toast កំពុងពេញនិយម",
    message:
      "Avocado Toast & Poached Eggs ដែលអ្នករក្សាទុក កំពុងពេញនិយមក្នុងតំបន់របស់អ្នកសប្តាហ៍នេះ។ ហាងកាហ្វេ ៣ ក្នុងតំបន់ផ្តល់ជូនម្ហូបនេះឥឡូវនេះ — ពិនិត្យវាយតម្លៃ និងម៉ឺនុយ។",
    tags: [{ label: "ចំណូលចិត្ត" }, { label: "កំពុងពេញនិយម · ក្នុងតំបន់" }],
    createdAt: "2026-07-26T10:00:00",
    isUnread: false,
    action: { label: "រកមើលជម្រើស", href: "/dashboard/favorites" },
    group: "yesterday",
  },
  {
    id: "n11",
    category: "family",
    title: "Leo សម្រេចគោលដៅប្រូតេអ៊ីនរបស់គាត់!",
    message:
      "Leo សម្រេចបាន ១០០% នៃគោលដៅប្រូតេអ៊ីនប្រចាំថ្ងៃ សម្រាប់ថ្ងៃទី ៥ ជាប់គ្នា។ ផែនការប្រូតេអ៊ីនខ្ពស់របស់គាត់កំពុងដំណើរការល្អ — យើងបានស្នើ Smoothie ក្រោយហាត់ប្រាណថ្មីមួយ។",
    tags: [{ label: "ព័ត៌មានគ្រួសារ" }, { label: "Leo Chen · សមិទ្ធផល" }],
    createdAt: "2026-07-26T18:00:00",
    isUnread: false,
    actor: { name: "Leo Chen", initials: "LC", color: "bg-emerald-500" },
    action: { label: "មើលដំណើរការរបស់ Leo", href: "/dashboard/family-profile" },
    group: "yesterday",
  },
  {
    id: "n12",
    category: "health",
    title: "របាយការណ៍អាហារូបត្ថម្ភប្រចាំសប្តាហ៍រួចរាល់ហើយ",
    message:
      "អ្នកសម្រេចបាន ៩៤% នៃគោលដៅប្រចាំសប្តាហ៍។ ប្រូតេអ៊ីនស្ថិតក្នុងផែនការល្អ ប៉ុន្តែជាតិសរស៊ើបទាបបន្តិច។ បន្ថែមបន្លែស្លឹកបៃតងបន្ថែមទៀតនឹងជួយបំពេញចន្លោះនេះ។",
    tags: [{ label: "សុខភាព និងអាឡែស៊ី" }, { label: "សង្ខេបប្រចាំសប្តាហ៍" }],
    createdAt: "2026-07-25T09:00:00",
    isUnread: false,
    action: { label: "មើលរបាយការណ៍ពេញលេញ", href: "/dashboard/health" },
    group: "earlier",
  },
  {
    id: "n13",
    category: "meal",
    title: "ការរំលឹករៀបចំអាហារនៅថ្ងៃអាទិត្យ",
    message:
      "ជាធម្មតាអ្នករៀបចំអាហារជាមុននៅថ្ងៃអាទិត្យ។ សប្តាហ៍នេះយើងណែនាំឱ្យចម្អិន Spiced Lentil Curry ជាបាច់ — គ្រប់គ្រាន់សម្រាប់អាហារ ៣ ពេល ហើយអាចកកទុកបាន។",
    tags: [{ label: "ការរំលឹកអាហារ" }, { label: "រៀបចំអាហារជាមុន" }],
    createdAt: "2026-07-24T09:00:00",
    isUnread: false,
    action: { label: "បើកផែនការ", href: "/dashboard/meal-plan" },
    group: "earlier",
  },
  {
    id: "n14",
    category: "favorites",
    title: "ការជូនដំណឹងគ្រឿងផ្សំតាមរដូវ",
    message:
      "ប៊្លូបឺរីស្រស់ — គ្រឿងផ្សំសំខាន់ក្នុងរូបមន្ត Smoothie Bowl ដែលអ្នករក្សាទុក — កំពុងចេញផ្លែច្រើនបំផុតសប្តាហ៍នេះ។ ជាឱកាសល្អដើម្បីទិញស្តុកទុក និងរីករាយនឹងរសជាតិល្អបំផុត។",
    tags: [{ label: "ចំណូលចិត្ត" }, { label: "គ្រឿងផ្សំតាមរដូវ" }],
    createdAt: "2026-07-25T09:00:00",
    isUnread: false,
    action: { label: "បន្ថែមទៅបញ្ជីទិញឥវ៉ាន់", href: "/dashboard/favorites" },
    group: "earlier",
  },
  {
    id: "n15",
    category: "family",
    title: "ជម្រើសម្ហូបគ្មានឡាក់តូសសម្រាប់ Sarah",
    message:
      "Sarah មានរូបមន្តគ្មានឡាក់តូសថ្មី ៤ បន្ថែមក្នុងសប្តាហ៍នេះ ដោយផ្អែកលើចំណូលចិត្តថ្មីៗរបស់គាត់ — ទាំងអស់ជាបួស និងតិចជាង ៥០០ កាឡូរី។",
    tags: [{ label: "ព័ត៌មានគ្រួសារ" }, { label: "Sarah Chen · បួស" }],
    createdAt: "2026-07-25T09:00:00",
    isUnread: false,
    actor: { name: "Sarah Chen", initials: "SC", color: "bg-rose-500" },
    action: {
      label: "មើលមុខម្ហូបរបស់ Sarah",
      href: "/dashboard/family-profile",
    },
    group: "earlier",
  },
  {
    id: "n16",
    category: "account",
    title: "ចំណូលចិត្តអាហារបានធ្វើបច្ចុប្បន្នភាព",
    message:
      'ចំណូលចិត្តអាហារូបត្ថម្ភរបស់អ្នកត្រូវបានប្តូរទៅ "កាបូអ៊ីដ្រាតទាប" ហើយគោលដៅកាឡូរីប្រចាំថ្ងៃត្រូវបានកំណត់ត្រឹម ២,១០០ ។ ការផ្លាស់ប្តូរនេះមានប្រសិទ្ធភាពលើគ្រប់ការណែនាំរបស់អ្នក។',
    tags: [{ label: "គណនី និងប្រព័ន្ធ" }, { label: "ព័ត៌មានគណនី" }],
    createdAt: "2026-07-20T09:00:00",
    isUnread: false,
    action: { label: "ពិនិត្យការកំណត់", href: "/dashboard/account" },
    group: "earlier",
  },
  {
    id: "n17",
    category: "account",
    title: "ពាក្យសម្ងាត់ត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ",
    message:
      "ពាក្យសម្ងាត់គណនី FoodHub របស់អ្នកត្រូវបានធ្វើបច្ចុប្បន្នភាពនៅថ្ងៃច័ន្ទ ថ្ងៃទី ២០ កក្កដា។ ប្រសិនបើនេះមិនមែនអ្នកទេ សូមទាក់ទងផ្នែកជំនួយភ្លាមៗ។",
    tags: [{ label: "គណនី និងប្រព័ន្ធ" }, { label: "សុវត្ថិភាព" }],
    createdAt: "2026-07-20T09:00:00",
    isUnread: false,
    action: { label: "ទាក់ទងផ្នែកជំនួយ", href: "/dashboard/account" },
    group: "earlier",
  },
  {
    id: "n18",
    category: "account",
    title: "FoodHub Premium ត្រូវបន្តក្នុងរយៈពេល ៧ ថ្ងៃទៀត",
    message:
      "គម្រោង Premium របស់អ្នកនឹងបន្តដោយស្វ័យប្រវត្តិនៅថ្ងៃទី ២៤ កក្កដា ២០២៦ ក្នុងតម្លៃ ៩.៩៩ ដុល្លារ/ខែ។ អ្នកអាចគ្រប់គ្រងការជាវបានគ្រប់ពេលពីការកំណត់គណនី។",
    tags: [{ label: "គណនី និងប្រព័ន្ធ" }, { label: "វិក្កយបត្រ" }],
    createdAt: "2026-07-18T09:00:00",
    isUnread: false,
    action: { label: "គ្រប់គ្រងការជាវ", href: "/dashboard/account" },
    group: "earlier",
  },
];

export function timeAgo(
  iso: string,
  now: Date = new Date("2026-07-27T13:00:00"),
): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "ទើបតែឥឡូវនេះ";
  if (minutes < 60) return `${minutes} នាទីមុន`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ម៉ោងមុន`;
  const days = Math.floor(hours / 24);
  return `${days} ថ្ងៃមុន`;
}
