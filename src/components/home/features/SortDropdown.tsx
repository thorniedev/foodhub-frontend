"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownUp, Check, ChevronDown } from "lucide-react";

export type SortOption =
  | "default"
  | "price-asc"
  | "price-desc"
  | "preparation-asc"
  | "preparation-desc"
  | "rating-desc"
  | "name-asc";

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const SORT_OPTIONS: {
  value: SortOption;
  label: string;
}[] = [
  {
    value: "default",
    label: "តម្រៀបតាមលំនាំដើម",
  },
  {
    value: "price-asc",
    label: "តម្លៃ: ទាប → ខ្ពស់",
  },
  {
    value: "price-desc",
    label: "តម្លៃ: ខ្ពស់ → ទាប",
  },
  {
    value: "preparation-asc",
    label: "ពេលរៀបចំ: លឿន → យូរ",
  },
  {
    value: "preparation-desc",
    label: "ពេលរៀបចំ: យូរ → លឿន",
  },
  {
    value: "rating-desc",
    label: "Rating ខ្ពស់មុន",
  },
  {
    value: "name-asc",
    label: "ឈ្មោះ A → Z",
  },
];

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    SORT_OPTIONS.find((option) => option.value === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full min-w-0 sm:w-auto sm:min-w-[270px] flex-1 sm:flex-none">
      {/* TRIGGER */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`
          flex h-[60px] w-full items-center gap-3
          rounded-full border bg-white
          px-[22px]
          text-[18px]
          transition-all duration-200
          ${
            isOpen
              ? "border-primary-800 ring-4 ring-primary-50"
              : "border-[#e4e4e7] hover:border-primary-300"
          }
        `}
      >
        <ArrowDownUp
          size={21}
          strokeWidth={2}
          className="shrink-0 text-primary-800"
        />

        <span className="min-w-0 flex-1 truncate text-left font-medium text-[#3d3d3a]">
          {selectedOption.label}
        </span>

        {value !== "default" && (
          <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-primary-800 px-2 text-[16px] font-semibold text-white">
            1
          </span>
        )}

        <ChevronDown
          size={20}
          strokeWidth={2}
          className={`shrink-0 text-primary-800 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* MENU */}
      <div
        className={`
          absolute right-0 top-[calc(100%+10px)]
          z-[70]
          w-[370px] max-w-[90vw]
          rounded-[20px]
          border border-[#e4e4e7]
          bg-white
          p-3
          shadow-sm
          transition-all duration-200
          ${
            isOpen
              ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
              : "pointer-events-none -translate-y-2 scale-[0.98] opacity-0"
          }
        `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#e4e4e7] px-2 pb-3">
          <div>
            <p className="text-[20px] font-semibold text-primary-900">
              តម្រៀបលទ្ធផល
            </p>

            <p className="mt-1 text-[18px] text-gray-400">ជ្រើសរបៀបតម្រៀប</p>
          </div>

          {value !== "default" && (
            <button
              type="button"
              onClick={() => onChange("default")}
              className="
                rounded-full
                bg-secondary-50
                px-3 py-1.5
                text-[18px]
                font-medium
                text-secondary-600
                transition-colors
                hover:bg-secondary-100
                hover:text-secondary-700
              "
            >
              សម្អាត
            </button>
          )}
        </div>

        {/* OPTIONS */}
        <div className="mt-3 flex flex-col gap-1.5">
          {SORT_OPTIONS.map((option) => {
            const selected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  flex min-h-[54px] w-full items-center gap-3
                  rounded-[14px]
                  px-4
                  text-left
                  text-[18px]
                  transition-colors duration-150
                  ${
                    selected
                      ? "bg-primary-50 font-semibold text-primary-800"
                      : "text-[#3d3d3a] hover:bg-primary-50"
                  }
                `}
              >
                {/* RADIO STYLE */}
                <span
                  className={`
                    flex h-5 w-5 shrink-0
                    items-center justify-center
                    rounded-full border-2
                    ${selected ? "border-primary-700" : "border-gray-300"}
                  `}
                >
                  {selected && (
                    <span className="h-2.5 w-2.5 rounded-full bg-primary-700" />
                  )}
                </span>

                <span className="flex-1">{option.label}</span>

                {selected && (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                    <Check size={18} strokeWidth={2.5} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
