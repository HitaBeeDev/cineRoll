"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // The endpoint always succeeds (it won't disclose whether the email is
      // registered), so we show the same confirmation either way.
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight sm:text-4xl">
          Check your <span className="text-[#e8453c]">email</span>
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#c8c8d4]">
          If an account exists for{" "}
          <span className="text-[#F5F5F0]">{email}</span>, we&apos;ve sent a link to
          reset your password. It expires in 30 minutes.
        </p>
        <Link
          href="/auth/signin"
          className="mt-6 inline-block text-xs text-[#8f8fa0] underline-offset-2 transition-colors hover:text-[#c8c8d4] hover:underline"
        >
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight sm:text-4xl">
        Reset your <span className="text-[#e8453c]">password</span>
      </h1>
      <p className="mt-3 text-sm leading-6 text-[#c8c8d4]">
        Enter your email and we&apos;ll send you a link to set a new password.
      </p>

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="forgot-email" className="text-xs font-medium text-[#b8b8c6]">
            Email address
          </label>
          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            className={cn(
              "h-12 w-full rounded-xl border border-[#2b2b3d] bg-[#10101d] px-4",
              "text-sm text-[#F5F5F0] placeholder:text-[#777789]",
              "transition-colors focus:border-[#e8453c]/70 focus:outline-none focus:ring-2 focus:ring-[#e8453c]/15",
              // Repaint Chrome's pale autofill background to match the dark field.
              "autofill:[-webkit-box-shadow:0_0_0_1000px_#10101d_inset] autofill:[-webkit-text-fill-color:#F5F5F0] autofill:[caret-color:#F5F5F0]",
            )}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "h-12 w-full rounded-xl bg-[#e8453c]",
            "text-sm font-semibold text-[#F5F5F0]",
            "shadow-[0_10px_28px_rgba(232,69,60,0.16)] transition hover:bg-[#f2554c]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
            "disabled:cursor-not-allowed disabled:bg-[#8f302b] disabled:text-[#c9a1a0] disabled:shadow-none",
          )}
        >
          {isLoading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <Link
        href="/auth/signin"
        className="mt-5 inline-block text-xs text-[#8f8fa0] underline-offset-2 transition-colors hover:text-[#c8c8d4] hover:underline"
      >
        ← Back to sign in
      </Link>
    </div>
  );
}
