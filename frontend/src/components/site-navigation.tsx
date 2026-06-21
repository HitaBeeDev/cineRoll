"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthButton } from "@/components/AuthButton";

const primaryNavItems = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/picks", label: "Daily Picks" },
  { href: "/describe", label: "Mood Match" },
  { href: "/stats", label: "Stats" },
];

const gameModeItems = [
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
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const currentPath = segments.length <= 1 ? "/" : "/" + segments.slice(1).join("/");
  const isActive = (href: string) =>
    href === "/" ? currentPath === "/" : currentPath === href || currentPath.startsWith(href + "/");

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
                  Game Modes
                </span>
                {gameModeItems.map((item) => (
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
