"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "cineroll-theme";
type Theme = "dark" | "light";

function currentTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(STORAGE_KEY, theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => currentTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      aria-label={`Switch to ${nextTheme} theme`}
      aria-pressed={theme === "light"}
      onClick={() => {
        applyTheme(nextTheme);
        setTheme(nextTheme);
      }}
      className={cn(
        "hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#222232] bg-[#101019]",
        "text-[#9b96aa] transition-colors hover:border-[#e8453c]/60 hover:text-[#F5F5F0]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] md:inline-flex",
      )}
    >
      {theme === "dark" ? (
        <Moon className="h-4 w-4" aria-hidden />
      ) : (
        <Sun className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
