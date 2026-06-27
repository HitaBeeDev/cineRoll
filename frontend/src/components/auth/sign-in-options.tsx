"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";

type SignInOptionsProps = {
  /**
   * Relative path to return to after auth. Honoured by both Google (redirect)
   * and the email magic link, so flows like "rate → sign in → land back on the
   * film" resume where they started.
   */
  callbackUrl: string;
};

/** Shared sign-in controls (Google + email magic link). Used by the full
 *  sign-in page and the inline auth modal so both stay in sync. */
export function SignInOptions({ callbackUrl }: SignInOptionsProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only relative paths, to avoid an open-redirect.
  const safeCallbackUrl = callbackUrl.startsWith("/") ? callbackUrl : "/";

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn("resend", {
        email,
        callbackUrl: safeCallbackUrl,
        redirect: false,
      });
      if (result?.error) {
        setError("Something went wrong. Please try again.");
      } else {
        window.location.href = `/auth/verify?email=${encodeURIComponent(email)}`;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    await signIn("google", { callbackUrl: safeCallbackUrl });
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => void handleGoogleSignIn()}
        disabled={isGoogleLoading || isLoading}
        className={cn(
          "flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/10",
          "text-sm font-semibold text-[#F5F5F0]",
          "transition hover:border-white/20 hover:bg-white/5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#1e1e2a]" />
        <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#444458]">
          or
        </span>
        <div className="h-px flex-1 bg-[#1e1e2a]" />
      </div>

      <form onSubmit={(e) => void handleEmailSubmit(e)} className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="signin-email"
            className="text-xs font-medium text-[#b8b8c6]"
          >
            Email address
          </label>
          <input
            id="signin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className={cn(
              "h-12 w-full rounded-xl border border-[#2b2b3d] bg-[#10101d] px-4",
              "font-[family-name:var(--font-geist-mono)] text-sm text-[#F5F5F0]",
              "placeholder:text-[#777789]",
              "transition-colors focus:border-[#e8453c]/70 focus:outline-none focus:ring-2 focus:ring-[#e8453c]/15",
            )}
          />
        </div>
        {error !== null && (
          <p className="text-xs text-[#ff7068]">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isLoading || isGoogleLoading || !email.trim()}
          className={cn(
            "h-12 w-full rounded-xl bg-[#e8453c]",
            "text-sm font-semibold text-[#F5F5F0]",
            "shadow-[0_10px_28px_rgba(232,69,60,0.16)] transition hover:bg-[#f2554c]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
            "disabled:cursor-not-allowed disabled:bg-[#8f302b] disabled:text-[#c9a1a0] disabled:shadow-none",
          )}
        >
          {isLoading ? "Sending…" : "Continue with email"}
        </button>
      </form>
    </div>
  );
}
