"use client";

import NotificationAlertSettings from "@/components/dashboard/settings/NotificationAlertSettings";
import MealReminderSettings from "@/components/dashboard/settings/MealReminderSettings";
import PushNotificationManager from "@/components/dashboard/notifications/PushNotificationManager";

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
      <MealReminderSettings />

      <PushNotificationManager />
    </div>
  );
}
