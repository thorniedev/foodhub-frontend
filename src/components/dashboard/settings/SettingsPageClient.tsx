"use client";

import MealReminderSettings from "@/components/dashboard/settings/MealReminderSettings";
import PushNotificationManager from "@/components/dashboard/notifications/PushNotificationManager";

export default function SettingsPageClient() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 sm:p-8 lg:p-10">
      <div className="pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#F97316] sm:text-4xl">
          ការកំណត់
        </h1>
        <p className="mt-2 text-base text-slate-500 sm:text-lg">
          គ្រប់គ្រងការជូនដំណឹង និងចំណូលចិត្តគណនីរបស់អ្នក
        </p>
      </div>

      <MealReminderSettings />

      <PushNotificationManager />
    </div>
  );
}
