import { Metadata } from "next";
import Link from "next/link";
import { Users, Sparkles, Link2, QrCode, Shield, Utensils, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Group Meetup & Dining | FoodHub",
  description: "Organize group dining sessions with friends, auto-match dietary preferences, and vote on what to eat.",
};

export default function MeetupHubPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 px-4 pt-24 pb-16 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        {/* Hero Section */}
        <div className="rounded-3xl bg-linear-to-r from-emerald-800 to-teal-900 p-8 text-white shadow-xl sm:p-12">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-emerald-200 backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" /> Dual-Mode Group Dining
            </span>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Never Argue Over &ldquo;What to Eat&rdquo; Again.
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              FoodHub calculates the centroid meeting point between all members, matches everyone&apos;s dietary restrictions and allergies, and runs a quick live vote to find the perfect restaurant.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/meetup/create"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-extrabold text-emerald-950 shadow-lg hover:bg-slate-100 active:scale-95 transition"
              >
                <Utensils className="h-4 w-4 text-emerald-700" />
                Create New Meetup
              </Link>
              <Link
                href="/friends"
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-3.5 text-sm font-extrabold text-white backdrop-blur-sm hover:bg-white/20 active:scale-95 transition"
              >
                <Users className="h-4 w-4" />
                Manage Friends
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Mode 1: FoodHub Friends
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Select verified friends with attached default safety profiles (Halal, Gluten-Free, Vegan). Dietary restrictions are automatically accounted for in recommendations.
            </p>
            <Link
              href="/meetup/create"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
            >
              Start Friends Meetup <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400">
              <Link2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Mode 2: Casual Team / Guest Link
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              No accounts required! Drop a central location pin, share a public link to your Telegram or WhatsApp group chat, and let members pick quick dietary chips in 5 seconds.
            </p>
            <Link
              href="/meetup/create"
              className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 dark:text-teal-400"
            >
              Generate Guest Link <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
