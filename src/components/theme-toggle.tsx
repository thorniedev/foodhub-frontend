"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className="size-10 rounded-full border border-border bg-background"
      />
    );
  }

  return (
    <AnimatedThemeToggler
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      onThemeChange={(theme) => setTheme(theme)}
      variant="circle"
      duration={500}
      className="
        inline-flex size-10 items-center justify-center
        rounded-full border border-border
        bg-background text-foreground
        transition-colors
        hover:bg-accent hover:text-accent-foreground
        [&_svg]:size-5
      "
    />
  );
}
