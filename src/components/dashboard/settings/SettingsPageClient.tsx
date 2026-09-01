"use client";

import Link from "next/link";
import { BellRing, ChevronRight } from "lucide-react";

import NotificationAlertSettings from "@/components/dashboard/settings/NotificationAlertSettings";

export default function SettingsPageClient() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-4xl font-semibold text-[#F97316]">ការកំណត់</p>
        <p className="mt-1 text-md text-slate-500">
          គ្រប់គ្រងការជូនដំណឹង និងចំណូលចិត្តគណនីរបស់អ្នក
        </p>
      </div>

      <NotificationAlertSettings />

      <Link
        href="/dashboard/notifications"
        className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#136C34]/40 hover:bg-emerald-50/40 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#136C34] dark:bg-emerald-950/40">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-medium text-slate-800 dark:text-slate-100">
              ការជូនដំណឹង Push និងហាងក្បែរខ្លួន
            </p>
            <p className="mt-0.5 text-sm text-slate-400">
              ដំណើរការឧបករណ៍ Push និងទីតាំងសម្រាប់ការជូនដំណឹងហាងក្បែរខ្លួន
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
      </Link>
    </div>
  );
}
