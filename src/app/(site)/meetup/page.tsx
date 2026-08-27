import { Metadata } from "next";
import Link from "next/link";
import { Users, Sparkles, Link2, Utensils, ArrowRight } from "lucide-react";

import MyMeetupsList from "@/components/meetup/MyMeetupsList";

export const metadata: Metadata = {
  title: "ការណាត់ញ៉ាំអាហារជាក្រុម | FoodHub",
  description: "Organize group dining sessions with friends, auto-match dietary preferences, and vote on what to eat.",
};

export default function MeetupHubPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 px-4 pt-24 pb-16 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        {/* Hero Section */}
        <div className="rounded-3xl bg-linear-to-r from-primary-800 to-primary-950 p-8 text-white shadow-xl sm:p-12">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-sm font-bold text-primary-200 backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary-300" /> ញ៉ាំជាមួយគ្នាពីរបៀបពីរ
            </span>
            <p className="text-3xl font-black tracking-tight sm:text-4xl">
              លែងឈ្លោះគ្នាថា​ &ldquo;ញ៉ាំអ្វី&rdquo; ទៀតហើយ
            </p>
            <p className="text-sm sm:text-base text-primary-100/90 leading-relaxed">
              FoodHub គណនាចំណុចជួបកណ្ដាលរវាងសមាជិកទាំងអស់ ផ្គូផ្គងរបបអាហារ និងអាឡែស៊ីរបស់អ្នករាល់គ្នា រួចបើកការបោះឆ្នោតរហ័សដើម្បីរកហាងដ៏ល្អបំផុត។
            </p>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
              <Link
                href="/meetup/create"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-extrabold text-primary-950 shadow-lg transition hover:bg-slate-100 active:scale-95"
              >
                <Utensils className="h-4 w-4 text-primary-700" />
                បង្កើតការណាត់ជួប
              </Link>
              <Link
                href="/friends"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white/10 px-6 py-3.5 text-sm font-extrabold text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
              >
                <Users className="h-4 w-4" />
                គ្រប់គ្រងមិត្តភក្តិ
              </Link>
            </div>
          </div>
        </div>

        <MyMeetupsList />

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-400">
              <Users className="h-6 w-6" />
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              របៀបទី១៖ មិត្តភក្តិ FoodHub
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              ជ្រើសរើសមិត្តភក្តិដែលមានប្រវត្តិរូបសុវត្ថិភាព (ហាឡាល់ គ្មានស្រូវសាលី បួស)។ របបអាហារត្រូវបានគិតបញ្ចូលដោយស្វ័យប្រវត្តិក្នុងការណែនាំ។
            </p>
            <Link
              href="/meetup/create"
              className="inline-flex items-center gap-1 text-sm font-bold text-primary-700 hover:text-primary-800 dark:text-primary-400"
            >
              ចាប់ផ្ដើមជាមួយមិត្តភក្តិ <ArrowRight className="h-3 w-3 shrink-0" />
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-400">
              <Link2 className="h-6 w-6" />
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              របៀបទី២៖ តំណអញ្ជើញភ្ញៀវ
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              មិនត្រូវការគណនីទេ! កំណត់ចំណុចជួប ចែករំលែកតំណសាធារណៈទៅ Telegram ឬក្រុមឆាត រួចឲ្យសមាជិកជ្រើសរើសរបបអាហាររបស់ខ្លួនក្នុងរយៈពេល ៥ វិនាទី។
            </p>
            <Link
              href="/meetup/create"
              className="inline-flex items-center gap-1 text-sm font-bold text-primary-700 hover:text-primary-800 dark:text-primary-400"
            >
              បង្កើតតំណភ្ញៀវ <ArrowRight className="h-3 w-3 shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
