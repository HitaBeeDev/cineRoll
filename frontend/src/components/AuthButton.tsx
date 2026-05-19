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
      <div className="flex items-center gap-2">
        <Link
          href="/auth/signin"
          className={cn(
            "rounded-full border border-white/10 px-4 py-2",
            "font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.13em]",
            "text-[#d8d4e6] transition-colors duration-150",
            "hover:border-white/20 hover:text-white",
            "focus-visible:outline-none focus-visible:ring-2",
            focusRingClassName,
          )}
        >
          Sign In
        </Link>
        <Link
          href="/auth/signin"
          className={cn(
            "rounded-full px-4 py-2",
            "font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.13em]",
            "bg-[#e8453c] text-[#F5F5F0] transition-colors duration-150",
            "hover:bg-[#d5342b]",
            "focus-visible:outline-none focus-visible:ring-2",
            focusRingClassName,
          )}
        >
          Sign Up
        </Link>
      </div>
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
          "flex h-8 w-8 items-center justify-center rounded-full",
          "bg-[#e8453c] font-[family-name:var(--font-geist-mono)] text-xs font-bold text-white",
          "transition hover:bg-[#d5342b]",
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
              <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#444458]">
                Signed in as
              </p>
              <p className="mt-0.5 truncate font-[family-name:var(--font-geist-mono)] text-[11px] text-[#888899]">
                {session.user.email}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: "/" })}
            className="flex w-full items-center px-4 py-3 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest text-[#888899] transition hover:bg-[#111120] hover:text-[#F5F5F0]"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
