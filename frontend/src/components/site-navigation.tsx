"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/picks", label: "Picks" },
  { href: "/discover", label: "Discover" },
  { href: "/snob-test", label: "Snob Test" },
  { href: "/battle", label: "Battle" },
  { href: "/stats", label: "Stats" },
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
      <nav className="hidden items-center gap-1.5 md:flex" aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full border px-3.5 py-1.5",
              "font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2",
              focusRingClassName,
              isActive(item.href)
                ? "border-[#e8453c]/70 text-[#e8453c]"
                : "border-[#222232] text-[#888899] hover:border-[#e8453c]/40 hover:text-[#F5F5F0]",
            )}
          >
            {item.label}
          </Link>
        ))}
        <div className="ml-2 flex items-center gap-1.5">
          <Link
            href="/sign-in"
            className={cn(
              "rounded-full border border-[#2e2e42] px-3.5 py-1.5",
              "font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest",
              "text-[#F5F5F0] transition-colors duration-150",
              "hover:border-[#F5F5F0]/30",
              "focus-visible:outline-none focus-visible:ring-2",
              focusRingClassName,
            )}
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className={cn(
              "rounded-full px-3.5 py-1.5",
              "font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest",
              "bg-[#e8453c] text-white transition-colors duration-150",
              "hover:bg-[#d5342b]",
              "focus-visible:outline-none focus-visible:ring-2",
              focusRingClassName,
            )}
          >
            Sign Up
          </Link>
        </div>
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
              {navItems.map((item) => (
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
              <div className="mt-4 flex gap-3">
                <Link
                  href="/sign-in"
                  className="rounded-full border border-[#2e2e42] px-5 py-2.5 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[#F5F5F0]"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-full bg-[#e8453c] px-5 py-2.5 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-white"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
