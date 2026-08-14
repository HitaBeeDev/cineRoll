"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { UserAvatar } from "@/components/user-avatar";
import type { AuthUser } from "@/components/auth-button/types";
import { ACCOUNT_LINKS } from "@/components/auth-button/account-links";
import { signOutToHome } from "@/components/auth-button/sign-out";
import { useAccountMenu } from "@/components/auth-button/useAccountMenu";
import { WHATS_NEW_LINK } from "@/features/notifications/whats-new-link";

/** Desktop: compact avatar trigger with an outside-click dropdown. */
export function AccountMenu({
  user,
  focusRingClassName,
  unreadCount,
}: {
  user: AuthUser | undefined;
  focusRingClassName: string;
  unreadCount: number;
}) {
  const { open, setOpen, menuRef } = useAccountMenu();

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        className={cn(
          "group flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2",
          "border bg-[#101019]",
          "font-[family-name:var(--font-geist-mono)] text-[12px] font-semibold uppercase tracking-[0.08em] text-[#c9c9d4]",
          "transition-colors duration-200",
          "hover:border-accent/60 hover:text-fg-hi",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a14]",
          open ? "border-accent/60 text-fg-hi" : "border-[#22222e]",
          focusRingClassName,
        )}
      >
        <UserAvatar image={user?.image} name={user?.name} email={user?.email} size={26} />
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className={cn(
            "h-2.5 w-2.5 text-[#666676] transition-transform duration-200 group-hover:text-accent",
            open && "rotate-180 text-accent",
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

      {open && (
        <div className="absolute right-0 top-10 z-50 min-w-[180px] overflow-hidden rounded-xl border border-edge bg-[#0d0d1a] shadow-xl">
          {user?.email != null && (
            <div className="border-b border-edge px-4 py-3">
              <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#444458]">
                Signed in as
              </p>
              <p className="mt-0.5 truncate font-[family-name:var(--font-geist-mono)] text-[11px] text-[#888899]">
                {user.email}
              </p>
            </div>
          )}
          <Link
            href={WHATS_NEW_LINK.href}
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 border-b border-edge px-4 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899] transition hover:bg-[#111120] hover:text-fg-hi"
          >
            {WHATS_NEW_LINK.label}
            {unreadCount > 0 && (
              <span className="ml-auto rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold leading-none tracking-normal text-[#0a0a14]">
                {unreadCount}
              </span>
            )}
          </Link>
          {ACCOUNT_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex w-full items-center px-4 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899] transition hover:bg-[#111120] hover:text-fg-hi",
                i === ACCOUNT_LINKS.length - 1 && "border-b border-edge",
              )}
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={signOutToHome}
            className="flex w-full items-center px-4 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899] transition hover:bg-[#111120] hover:text-fg-hi"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
