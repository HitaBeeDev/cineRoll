import Link from "next/link";
import { cn } from "@/lib/utils";

/** Shown when signed out: a prominent "Sign In" link, styled for header or sheet. */
export function SignInLink({
  isInline,
  focusRingClassName,
  onNavigate,
}: {
  isInline: boolean;
  focusRingClassName: string;
  onNavigate?: (() => void) | undefined;
}) {
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
