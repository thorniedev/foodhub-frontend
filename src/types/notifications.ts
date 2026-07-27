// types/notifications.ts

/** ប្រភេទសំខាន់ៗនៃការជូនដំណឹង (ត្រូវនឹង tab តម្រង) */
export type NotificationCategory =
  | "recommendations"
  | "health"
  | "meal"
  | "favorites"
  | "family"
  | "account";

/** ស្លាកញែកបន្ថែមលើកាតនីមួយៗ (ពណ៌ + អត្ថបទខ្លី) */
export interface NotificationTag {
  label: string;
  tone?: "default" | "urgent";
}

/** អ្នកនាំសារ/សមាជិកគ្រួសារ ដែលភ្ជាប់ជាមួយការជូនដំណឹង (ប្រើសម្រាប់ avatar) */
export interface NotificationActor {
  name: string;
  initials: string;
  color?: string; // e.g. "bg-emerald-500"
}

/** តំណភ្ជាប់សកម្មភាព ដែលបង្ហាញនៅចុងកាត (ឧ. "មើលមុខម្ហូប") */
export interface NotificationAction {
  label: string;
  href: string;
}

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  /** ស្លាកតូចៗនៅក្រោមសារ ឧ. "ការណែនាំ · អាហារថ្ងៃត្រង់" */
  tags: NotificationTag[];
  createdAt: string; // ISO date string
  isUnread: boolean;
  isUrgent?: boolean;
  actor?: NotificationActor;
  action: NotificationAction;
  /** ក្រុមកាលបរិច្ឆេទសម្រាប់ចំណងជើងផ្នែក ("ថ្ងៃនេះ", "ម្សិលមិញ", "មុននេះ") */
  group: "today" | "yesterday" | "earlier";
}

/** សង្ខេបចំនួននីមួយៗសម្រាប់ស្លាកខាងលើទំព័រ (Recommendations, Health...) */
export interface NotificationSummaryCard {
  category: NotificationCategory;
  label: string;
  count: number;
  icon: "sparkles" | "heart" | "utensils" | "star" | "users" | "settings";
  accent: string; // tailwind text/bg accent class root, e.g. "emerald"
}

/** តម្រង tab នៅជួរទី ២ */
export interface NotificationFilterTab {
  key: "all" | NotificationCategory | "reminders" | "system";
  label: string;
  count?: number;
  dotColor?: string;
}