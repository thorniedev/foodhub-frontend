"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagToggleProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  /** "default" = green when active (health goals, preferences); "warning" = orange when active (allergies) */
  variant?: "default" | "warning";
}

export default function TagToggle({
  label,
  selected,
  onToggle,
  variant = "default",
}: TagToggleProps) {
  const activeClasses =
    variant === "warning"
      ? "bg-orange-500 border-orange-500 text-white"
      : "bg-emerald-600 border-emerald-600 text-white";

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        selected
          ? activeClasses
          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
      )}
    >
      {selected && <Check className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}