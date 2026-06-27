"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type AuthButtonProps = {
  focusRingClassName?: string;
};

export function AuthButton({
  focusRingClassName = "focus-visible:ring-[#e8453c]",
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

  if (status === "loading") {
    return <div className="h-8 w-20 animate-pulse rounded-full bg-[#1e1e2a]" />;
  }

  if (status === "unauthenticated") {
    return (
      <Link
        href="/auth/signin"
        className={cn(
          "rounded-full px-4 py-2",
          "font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.13em]",
          "bg-[#e8453c] text-white shadow-[0_4px_14px_-4px_rgba(232,69,60,0.6)] transition-colors duration-150",
          "hover:bg-[#ff5247]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a14]",
          focusRingClassName,
        )}
      >
        Sign In
      </Link>
    );
  }

  const initials =
    session?.user?.name?.slice(0, 1).toUpperCase() ??
    session?.user?.email?.slice(0, 1).toUpperCase() ??
    "?";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={menuOpen}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full",
          "bg-gradient-to-br from-[#ff6a5c] to-[#e8453c] ring-1 ring-white/15",
          "font-[family-name:var(--font-geist-mono)] text-sm font-bold text-white",
          "shadow-[0_4px_14px_-3px_rgba(232,69,60,0.65)] transition hover:brightness-110 hover:ring-white/30",
          "focus-visible:outline-none focus-visible:ring-2",
          focusRingClassName,
        )}
      >
        {initials}
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
          <Link
            href="/profile"
            onClick={() => setMenuOpen(false)}
            className="flex w-full items-center px-4 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899] transition hover:bg-[#111120] hover:text-[#F5F5F0]"
          >
            Profile
          </Link>
          <Link
            href="/profile/watchlist"
            onClick={() => setMenuOpen(false)}
            className="flex w-full items-center px-4 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899] transition hover:bg-[#111120] hover:text-[#F5F5F0]"
          >
            Watchlist
          </Link>
          <Link
            href="/profile/history"
            onClick={() => setMenuOpen(false)}
            className="flex w-full items-center border-b border-[#1e1e2a] px-4 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899] transition hover:bg-[#111120] hover:text-[#F5F5F0]"
          >
            Watch History
          </Link>
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
