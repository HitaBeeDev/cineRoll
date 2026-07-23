import Link from "next/link";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import type { AuthUser } from "@/components/auth-button/types";
import { ACCOUNT_LINKS } from "@/components/auth-button/account-links";
import { signOutToHome } from "@/components/auth-button/sign-out";

/** Mobile: account links laid out directly (no dropdown to open off-screen). */
export function InlineAccountList({
  user,
  focusRingClassName,
  onNavigate,
}: {
  user: AuthUser | undefined;
  focusRingClassName: string;
  onNavigate?: (() => void) | undefined;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="mb-1 flex items-center gap-3 px-3">
        <UserAvatar image={user?.image} name={user?.name} email={user?.email} size={34} />
        <div className="min-w-0">
          <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.22em] text-[#5a5a6c]">
            Signed in as
          </p>
          <p className="truncate font-[family-name:var(--font-geist-mono)] text-[12px] text-[#c9c9d4]">
            {user?.email ?? user?.name ?? "Your account"}
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
          signOutToHome();
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
