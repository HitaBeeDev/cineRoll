"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthButton } from "@/components/AuthButton";

// Core discovery — the only links that stay in the top bar. Home is reached via
// the logo, so it isn't repeated here.
const primaryNavItems = [
  { href: "/browse", label: "Browse" },
  { href: "/picks", label: "Daily Picks" },
  { href: "/describe", label: "Mood Match" },
];

// Everything secondary (stats + the play modes) collapses behind a single
// "More" entry, so the bar reads as ~4 items instead of nine competing links.
const moreNavItems = [
  { href: "/stats", label: "Stats" },
  { href: "/snob-test", label: "Snob Test" },
  { href: "/roll-battle", label: "Versus" },
  { href: "/blind-roll", label: "Guess the Film" },
];

type SiteNavigationProps = {
  focusRingClassName?: string;
};

export function SiteNavigation({
  focusRingClassName = "focus-visible:ring-[#e8453c]",
}: SiteNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  // Routes are flat (/browse, /picks, …) — compare the pathname directly. The
  // home link matches only the exact root; every other link also matches its
  // sub-routes (e.g. /film detail pages under a section).
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
  const moreActive = moreNavItems.some((item) => isActive(item.href));

  // Mobile overlay: lock scroll + close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  // Desktop "More" dropdown: close on outside click, Escape, or route change.
  useEffect(() => {
    if (!moreOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [moreOpen]);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden flex-1 items-center justify-end gap-2 md:flex" aria-label="Primary navigation">
        <div className="flex items-center gap-1">
          {primaryNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3.5 py-2",
                "font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.13em]",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2",
                focusRingClassName,
                isActive(item.href)
                  ? "text-[#ff554c]"
                  : "text-[#9b96aa] hover:text-[#F5F5F0]",
              )}
            >
              {item.label}
            </Link>
          ))}

          {/* "More" dropdown — collapses stats + the play modes */}
          <div ref={moreRef} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((open) => !open)}
              className={cn(
                "flex items-center gap-1 px-3.5 py-2",
                "font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.13em]",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2",
                focusRingClassName,
                moreActive || moreOpen ? "text-[#ff554c]" : "text-[#9b96aa] hover:text-[#F5F5F0]",
              )}
            >
              More
              <ChevronDown
                className={cn("h-3 w-3 transition-transform duration-150", moreOpen && "rotate-180")}
                aria-hidden
              />
            </button>

            {moreOpen && (
              <div
                role="menu"
                aria-label="More"
                className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[11rem] overflow-hidden rounded-xl border border-white/10 bg-[#0d0d15]/95 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl"
              >
                {moreNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "block px-4 py-2.5",
                      "font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.13em]",
                      "transition-colors duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset",
                      focusRingClassName,
                      isActive(item.href)
                        ? "bg-white/[0.04] text-[#ff554c]"
                        : "text-[#9b96aa] hover:bg-white/[0.04] hover:text-[#F5F5F0]",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <span className="select-none px-1 text-[#2a2a3e]" aria-hidden>|</span>

        <AuthButton focusRingClassName={focusRingClassName} />
      </nav>

      {/* Mobile hamburger */}
      <button
        type="button"
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-full",
          "border border-[#222232] text-[#888899]",
          "transition-colors hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 md:hidden",
          focusRingClassName,
        )}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-4 w-4" aria-hidden />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-[#050508]/96 backdrop-blur-[20px] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Primary navigation"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="flex min-h-screen flex-col px-6 py-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-geist-mono)] text-lg font-bold tracking-[0.15em] text-[#e8453c] uppercase">
                Cine·Roll
              </span>
              <button
                type="button"
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-full",
                  "border border-[#222232] text-[#888899]",
                  "transition-colors hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2",
                  focusRingClassName,
                )}
                aria-label="Close navigation menu"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <nav className="flex flex-1 flex-col justify-center gap-5" aria-label="Mobile navigation">
              {primaryNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "font-[family-name:var(--font-geist-mono)] text-2xl font-bold uppercase tracking-widest",
                    isActive(item.href)
                      ? "text-[#F5F5F0]"
                      : "text-[#555568] transition-colors hover:text-[#F5F5F0]",
                    "focus-visible:outline-none focus-visible:ring-2",
                    focusRingClassName,
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-4 border-t border-[#222232] pt-5">
                <span className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.24em] text-[#e8453c]">
                  More
                </span>
                {moreNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "font-[family-name:var(--font-geist-mono)] text-2xl font-bold uppercase tracking-widest",
                      isActive(item.href)
                        ? "text-[#F5F5F0]"
                        : "text-[#555568] transition-colors hover:text-[#F5F5F0]",
                      "focus-visible:outline-none focus-visible:ring-2",
                      focusRingClassName,
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-4" onClick={() => setIsOpen(false)}>
                <AuthButton focusRingClassName={focusRingClassName} />
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
