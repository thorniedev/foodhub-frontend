"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FoodChipInputProps {
  label: string;
  chips: string[];
  onChange: (chips: string[]) => void;
  chipColor?: "green" | "red";
  placeholder?: string;
}

export default function FoodChipInput({
  label,
  chips,
  onChange,
  chipColor = "green",
  placeholder = "បន្ថែមឈ្មោះ...",
}: FoodChipInputProps) {
  const [draft, setDraft] = useState("");

  const addChip = () => {
    const value = draft.trim();
    if (value && !chips.includes(value)) {
      onChange([...chips, value]);
    }
    setDraft("");
  };

  const removeChip = (chip: string) => {
    onChange(chips.filter((c) => c !== chip));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addChip();
    }
  };

  const chipClasses =
    chipColor === "green"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-red-50 text-red-700 border-red-200";

  return (
    <div>
      <p className="mb-2.5 text-base font-semibold text-slate-800 sm:mb-3 sm:text-xl">
        {label}
      </p>
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 sm:p-3">
        <div className="mb-2 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm",
                chipClasses
              )}
            >
              {chip}
              <button
                type="button"
                onClick={() => removeChip(chip)}
                aria-label={`ដកចេញ ${chip}`}
                className="rounded-full p-0.5 hover:bg-black/5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addChip}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
        <p className="mt-1 text-base text-slate-400">ចុច Enter ដើម្បីបន្ថែម</p>
      </div>
    </div>
  );
}