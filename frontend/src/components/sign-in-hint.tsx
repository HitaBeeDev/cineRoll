"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SignInHintProps = {
  /** Only arm the hint while this is true (e.g. user is signed out). */
  enabled: boolean;
  /** Text shown in the anchored bubble. */
  message: string;
  /** Where the embedded "Sign in" link points. */
  signInHref: string;
  children: ReactNode;
  className?: string;
};

/**
 * Wraps an interactive area and, while `enabled`, reveals a small anchored
 * bubble on hover OR keyboard focus explaining that the action needs sign-in.
 * No toast, no permanent line of text. The bubble carries a clickable "Sign in"
 * link so intent converts in place. CSS-driven — no per-frame state.
 */
export function SignInHint({ enabled, message, signInHref, children, className }: SignInHintProps) {
  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("group/signin relative", className)}>
      {children}
      <div
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 w-max max-w-[16rem] translate-y-1 border border-[#2a2a42] bg-[#0c0c14]/95 px-3 py-2 opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-[opacity,transform] duration-150 group-hover/signin:pointer-events-auto group-hover/signin:translate-y-0 group-hover/signin:opacity-100 group-focus-within/signin:pointer-events-auto group-focus-within/signin:translate-y-0 group-focus-within/signin:opacity-100"
      >
        <p className="font-[family-name:var(--font-geist-mono)] text-[10px] leading-relaxed tracking-[0.04em] text-[#c8c8e0]">
          {message}{" "}
          <Link
            href={signInHref}
            className="whitespace-nowrap font-semibold text-[#e8453c] underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
