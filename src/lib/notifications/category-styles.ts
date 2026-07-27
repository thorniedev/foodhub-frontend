// components/dashboard/notifications/category-styles.ts
import {
  Sparkles,
  Heart,
  UtensilsCrossed,
  Star,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { NotificationCategory } from "@/types/notifications";

interface CategoryStyle {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  border: string; // left border color used on the card when urgent/unread
  dot: string;
}

export const categoryStyles: Record<NotificationCategory, CategoryStyle> = {
  recommendations: {
    icon: Sparkles,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    border: "border-l-emerald-400",
    dot: "bg-emerald-500",
  },
  health: {
    icon: Heart,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    border: "border-l-rose-400",
    dot: "bg-rose-500",
  },
  meal: {
    icon: UtensilsCrossed,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    border: "border-l-amber-400",
    dot: "bg-amber-500",
  },
  favorites: {
    icon: Star,
    iconBg: "bg-yellow-50",
    iconColor: "text-yellow-600",
    border: "border-l-yellow-400",
    dot: "bg-yellow-500",
  },
  family: {
    icon: Users,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    border: "border-l-violet-400",
    dot: "bg-violet-500",
  },
  account: {
    icon: Settings,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    border: "border-l-slate-300",
    dot: "bg-slate-400",
  },
};

export const groupLabels: Record<"today" | "yesterday" | "earlier", string> = {
  today: "ថ្ងៃនេះ",
  yesterday: "ម្សិលមិញ",
  earlier: "មុននេះ",
};
