"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/snob-test", label: "Snob Test" },
  { href: "/stats", label: "Stats" },
];

type SiteNavigationProps = {
  focusRingClassName?: string;
};

export function SiteNavigation({
  focusRingClassName = "focus-visible:ring-[#D4AF37]",
}: SiteNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

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
      <nav className="hidden items-center gap-4 md:flex" aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded text-sm font-medium text-[#A0A0B0] transition-colors hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2",
              focusRingClassName,
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded text-[#A0A0B0] transition-colors hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 md:hidden",
          focusRingClassName,
        )}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" aria-hidden />
      </button>

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
              <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[0.08em] text-[#D4AF37]">
                CineRoll
              </span>
              <button
                type="button"
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded text-[#A0A0B0] transition-colors hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2",
                  focusRingClassName,
                )}
                aria-label="Close navigation menu"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-6 w-6" aria-hidden />
              </button>
            </div>

            <nav className="flex flex-1 flex-col justify-center gap-3" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded py-4 text-3xl font-semibold text-[#A0A0B0] transition-colors hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2",
                    focusRingClassName,
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
