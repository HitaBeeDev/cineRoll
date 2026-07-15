"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

type AuthButtonProps = {
  focusRingClassName?: string;
  // "menu" (default) → compact avatar + dropdown, for the desktop header.
  // "inline" → account links rendered directly in a list, for the mobile menu
  // (a dropdown anchored to the bottom of a full-screen sheet opens off-screen).
  variant?: "menu" | "inline";
  // Called when a link/sign-out is tapped, so the host can close the mobile menu.
  onNavigate?: () => void;
};

const ACCOUNT_LINKS = [
  { href: "/profile", label: "Profile" },
  { href: "/profile/watchlist", label: "Watchlist" },
  { href: "/profile/lists", label: "My Lists" },
  { href: "/profile/history", label: "Watch History" },
  { href: "/profile/settings", label: "Settings" },
];

export function AuthButton({
  focusRingClassName = "focus-visible:ring-[#e8453c]",
  variant = "menu",
  onNavigate,
}: AuthButtonProps) {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const isInline = variant === "inline";

  if (status === "loading") {
    return isInline ? (
      <div className="h-10 w-full animate-pulse rounded-xl bg-[#141421]" />
    ) : (
      <div className="h-8 w-20 animate-pulse rounded-full bg-[#1e1e2a]" />
    );
  }

  if (status === "unauthenticated") {
    return (
      <Link
        href="/auth/signin"
        onClick={() => onNavigate?.()}
        className={cn(
          "font-[family-name:var(--font-geist-mono)] font-bold uppercase tracking-[0.13em]",
          "bg-[#e8453c] text-white transition-colors duration-150 hover:bg-[#ff5247]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a14]",
          isInline
            ? "flex items-center justify-center rounded-xl px-4 py-3 text-sm shadow-none"
            : "rounded-full px-4 py-2 text-[11px] shadow-[0_4px_14px_-4px_rgba(232,69,60,0.6)]",
          focusRingClassName,
        )}
      >
        Sign In
      </Link>
    );
  }

  // ── Mobile: account links laid out directly (no dropdown to open off-screen)
  if (isInline) {
    return (
      <div className="flex flex-col gap-1">
        <div className="mb-1 flex items-center gap-3 px-3">
          <UserAvatar
            image={session?.user?.image}
            name={session?.user?.name}
            email={session?.user?.email}
            size={34}
          />
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.22em] text-[#5a5a6c]">
              Signed in as
            </p>
            <p className="truncate font-[family-name:var(--font-geist-mono)] text-[12px] text-[#c9c9d4]">
              {session?.user?.email ?? session?.user?.name ?? "Your account"}
            </p>
          </div>
        </div>
        {ACCOUNT_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => onNavigate?.()}
            className={cn(
              "rounded-xl px-3 py-3 font-[family-name:var(--font-geist-mono)] text-base font-bold uppercase tracking-[0.16em]",
              "text-[#9b96aa] transition-colors hover:bg-[#10101a] hover:text-[#F5F5F0]",
              "focus-visible:outline-none focus-visible:ring-2",
              focusRingClassName,
            )}
          >
            {link.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            void signOut({ callbackUrl: "/" });
          }}
          className={cn(
            "rounded-xl px-3 py-3 text-left font-[family-name:var(--font-geist-mono)] text-base font-bold uppercase tracking-[0.16em]",
            "text-[#e8453c]/80 transition-colors hover:bg-[#1a1013] hover:text-[#ff5247]",
            "focus-visible:outline-none focus-visible:ring-2",
            focusRingClassName,
          )}
        >
          Sign Out
        </button>
      </div>
    );
  }

  // ── Desktop: compact avatar with a dropdown
  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={menuOpen}
        className={cn(
          "group flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2",
          "border bg-[#101019]",
          "font-[family-name:var(--font-geist-mono)] text-[12px] font-semibold uppercase tracking-[0.08em] text-[#c9c9d4]",
          "transition-colors duration-200",
          "hover:border-[#e8453c]/60 hover:text-[#F5F5F0]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a14]",
          menuOpen ? "border-[#e8453c]/60 text-[#F5F5F0]" : "border-[#22222e]",
          focusRingClassName,
        )}
      >
        <UserAvatar
          image={session?.user?.image}
          name={session?.user?.name}
          email={session?.user?.email}
          size={26}
        />
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className={cn(
            "h-2.5 w-2.5 text-[#666676] transition-transform duration-200 group-hover:text-[#e8453c]",
            menuOpen && "rotate-180 text-[#e8453c]",
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2.5 4.5 6 8l3.5-3.5" />
        </svg>
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-10 z-50 min-w-[180px] overflow-hidden rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] shadow-xl">
          {session?.user?.email !== undefined && session.user.email !== null && (
            <div className="border-b border-[#1e1e2a] px-4 py-3">
              <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#444458]">
                Signed in as
              </p>
              <p className="mt-0.5 truncate font-[family-name:var(--font-geist-mono)] text-[11px] text-[#888899]">
                {session.user.email}
              </p>
            </div>
          )}
          {ACCOUNT_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "flex w-full items-center px-4 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899] transition hover:bg-[#111120] hover:text-[#F5F5F0]",
                i === ACCOUNT_LINKS.length - 1 && "border-b border-[#1e1e2a]",
              )}
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: "/" })}
            className="flex w-full items-center px-4 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899] transition hover:bg-[#111120] hover:text-[#F5F5F0]"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
