"use client";

import { ShieldCheck, AlertTriangle, ShieldAlert, HelpCircle } from "lucide-react";
import type { SafetyStatusType } from "@/types/search";

interface SafetyStatusBadgeProps {
  status?: SafetyStatusType;
  reasonCodes?: string[];
  size?: "sm" | "md";
  showLabel?: boolean;
}

export default function SafetyStatusBadge({
  status = "NOT_EVALUATED",
  reasonCodes = [],
  size = "sm",
  showLabel = true,
}: SafetyStatusBadgeProps) {
  if (status === "NOT_EVALUATED") {
    return null; // Don't clutter cards if no profile safety was evaluated
  }

  const isSmall = size === "sm";

  switch (status) {
    case "SAFE":
      return (
        <div
          title="សុវត្ថិភាពសម្រាប់ប្រវត្តិរូបរបស់អ្នក"
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold ${
            isSmall ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
          }`}
        >
          <ShieldCheck className={isSmall ? "h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" : "h-4 w-4 text-emerald-600 dark:text-emerald-400"} />
          {showLabel && <span>សុវត្ថិភាព</span>}
        </div>
      );

    case "WARNING":
      return (
        <div
          title={
            reasonCodes.length > 0
              ? `ការប្រុងប្រយ័ត្ន: ${reasonCodes.join(", ")}`
              : "មានធាតុផ្សំដែលអាចប៉ះពាល់"
          }
          className={`inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-semibold ${
            isSmall ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
          }`}
        >
          <AlertTriangle className={isSmall ? "h-3.5 w-3.5 text-amber-600 dark:text-amber-400" : "h-4 w-4 text-amber-600 dark:text-amber-400"} />
          {showLabel && <span>ប្រុងប្រយ័ត្ន</span>}
        </div>
      );

    case "BLOCKED":
      return (
        <div
          title={
            reasonCodes.length > 0
              ? `ហាមឃាត់: ${reasonCodes.join(", ")}`
              : "មានអាលែហ្ស៊ី ឬធាតុផ្សំហាមឃាត់"
          }
          className={`inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-800 dark:text-rose-300 font-semibold ${
            isSmall ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
          }`}
        >
          <ShieldAlert className={isSmall ? "h-3.5 w-3.5 text-rose-600 dark:text-rose-400" : "h-4 w-4 text-rose-600 dark:text-rose-400"} />
          {showLabel && <span>ហាមឃាត់</span>}
        </div>
      );

    default:
      return null;
  }
}
