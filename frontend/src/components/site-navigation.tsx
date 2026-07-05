"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthButton } from "@/components/AuthButton";

const primaryNavItems = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/picks", label: "Daily Picks" },
  { href: "/describe", label: "Describe" },
  { href: "/stats", label: "Stats" },
];

const gameModeItems = [
  { href: "/snob-test", label: "Snob Test" },
  { href: "/roll-battle", label: "Versus" },
  // Temporarily removed: "Guess the Film" (/blind-roll) — route kept, hidden from nav.
];

type SiteNavigationProps = {
  focusRingClassName?: string;
};

export function SiteNavigation({
  focusRingClassName = "focus-visible:ring-[#e8453c]",
}: SiteNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  // Routes are flat (/browse, /picks, …) — compare the pathname directly. The
  // home link matches only the exact root; every other link also matches its
  // sub-routes (e.g. /film detail pages under a section).
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const mobileMenu = (
    <div
      className="fixed inset-0 z-[9999] bg-[#050508] text-[#F5F5F0] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Primary navigation"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="flex h-dvh min-h-0 flex-col overflow-y-auto px-5 py-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#1c1c2a] pb-4">
          <span className="font-[family-name:var(--font-geist-mono)] text-base font-bold uppercase tracking-[0.15em] text-[#e8453c]">
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

        <nav className="flex min-h-0 flex-1 flex-col gap-6 py-6" aria-label="Mobile navigation">
          <div className="flex flex-col gap-1">
            {primaryNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-3 font-[family-name:var(--font-geist-mono)] text-lg font-bold uppercase tracking-[0.16em]",
                  isActive(item.href)
                    ? "bg-[#141421] text-[#F5F5F0]"
                    : "text-[#9b96aa] transition-colors hover:bg-[#10101a] hover:text-[#F5F5F0]",
                  "focus-visible:outline-none focus-visible:ring-2",
                  focusRingClassName,
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-1 border-t border-[#222232] pt-5">
            <span className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.24em] text-[#e8453c]">
              Game Modes
            </span>
            {gameModeItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-3 font-[family-name:var(--font-geist-mono)] text-lg font-bold uppercase tracking-[0.16em]",
                  isActive(item.href)
                    ? "bg-[#141421] text-[#F5F5F0]"
                    : "text-[#9b96aa] transition-colors hover:bg-[#10101a] hover:text-[#F5F5F0]",
                  "focus-visible:outline-none focus-visible:ring-2",
                  focusRingClassName,
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-auto border-t border-[#222232] pt-5" onClick={() => setIsOpen(false)}>
            <AuthButton focusRingClassName={focusRingClassName} />
          </div>
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden flex-1 items-center justify-end gap-4 md:flex" aria-label="Primary navigation">
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
        </div>

        <span className="select-none text-[#2a2a3e]" aria-hidden>|</span>

        <div className="hidden items-center gap-1 xl:flex" aria-label="Game modes">
          {gameModeItems.map((item) => (
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
                  ? "text-[#ff625a]"
                  : "text-[#8b86a0] hover:text-[#F5F5F0]",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

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

      {isOpen && mounted ? createPortal(mobileMenu, document.body) : null}
    </>
  );
}
