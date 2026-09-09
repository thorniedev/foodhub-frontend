"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badgeClass?: string;
  description?: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  dropdownClassName?: string;
  optionClassName?: string;
  leftIcon?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  size?: "sm" | "md" | "lg";
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className,
  dropdownClassName = "",
  optionClassName = "",
  leftIcon,
  disabled = false,
  id,
  size = "md",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Default button styles based on size if className not provided
  const defaultSizeClass =
    size === "sm"
      ? "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 px-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-700/20"
      : size === "lg"
        ? "w-full min-h-13 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 py-3 px-4 text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 transition hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:border-primary-800 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary-800/10 dark:focus:ring-emerald-500/10"
        : "w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-[15px] font-medium text-gray-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-700 dark:focus:ring-emerald-500";

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${open ? "z-40" : "z-0"}`}
    >
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((prev) => !prev);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center justify-between gap-2.5 text-left transition ${
          className ? className : defaultSizeClass
        } ${disabled ? "cursor-not-allowed opacity-60 bg-slate-100 dark:bg-slate-800" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <span className="shrink-0">{selectedOption.icon}</span>
              )}
              {selectedOption.badgeClass ? (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold border ${selectedOption.badgeClass}`}
                >
                  {selectedOption.label}
                </span>
              ) : (
                <span className="truncate">{selectedOption.label}</span>
              )}
            </>
          ) : (
            <span className="text-gray-400 dark:text-slate-500 truncate">
              {placeholder}
            </span>
          )}
        </div>
        <ChevronDown
          className={`shrink-0 transition-transform duration-200 ${
            size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"
          } ${
            open
              ? "rotate-180 text-primary-700 dark:text-emerald-400"
              : "text-gray-400 dark:text-slate-500"
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-[0_18px_50px_rgba(15,23,42,0.14)] dark:border-slate-700 dark:bg-slate-800 dark:shadow-[0_18px_50px_rgba(0,0,0,0.5)] max-h-64 overflow-y-auto [scrollbar-width:thin] ${dropdownClassName}`}
          >
            {options.map((option) => {
              const isSelected = value === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl text-left transition duration-150 ${
                    size === "sm"
                      ? "px-2.5 py-1.5 text-xs"
                      : "px-3.5 py-2.5 text-sm"
                  } ${optionClassName} ${
                    isSelected
                      ? "bg-primary-50 text-primary-900 font-semibold dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "text-slate-700 hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-slate-700/60 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    {option.icon && (
                      <span className="shrink-0">{option.icon}</span>
                    )}
                    {option.badgeClass ? (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold border ${option.badgeClass}`}
                      >
                        {option.label}
                      </span>
                    ) : (
                      <span
                        className={`truncate ${
                          isSelected ? "font-semibold" : "font-medium"
                        }`}
                      >
                        {option.label}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <Check
                      className={`shrink-0 text-primary-700 dark:text-emerald-400 ${
                        size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
