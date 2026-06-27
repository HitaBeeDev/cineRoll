"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { PasswordInput } from "@/components/auth/password-input";

export function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;
    setError(null);

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Could not reset your password. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight sm:text-4xl">
          Invalid <span className="text-[#e8453c]">link</span>
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#c8c8d4]">
          This reset link is missing or malformed. Request a new one to continue.
        </p>
        <Link
          href="/auth/forgot-password"
          className="mt-6 inline-block text-xs text-[#8f8fa0] underline-offset-2 transition-colors hover:text-[#c8c8d4] hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight sm:text-4xl">
          Password <span className="text-[#e8453c]">updated</span>
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#c8c8d4]">
          Your password has been changed. You can now sign in with it.
        </p>
        <Link
          href="/auth/signin"
          className={cn(
            "mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[#e8453c]",
            "text-sm font-semibold text-[#F5F5F0] transition hover:bg-[#f2554c]",
          )}
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight sm:text-4xl">
        Set a new <span className="text-[#e8453c]">password</span>
      </h1>
      <p className="mt-3 text-sm leading-6 text-[#c8c8d4]">
        Choose a new password for your CineRoll account.
      </p>

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="reset-password" className="text-xs font-medium text-[#b8b8c6]">
            New password
          </label>
          <PasswordInput
            id="reset-password"
            value={password}
            onChange={setPassword}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="reset-confirm" className="text-xs font-medium text-[#b8b8c6]">
            Confirm new password
          </label>
          <PasswordInput
            id="reset-confirm"
            value={confirm}
            onChange={setConfirm}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            required
          />
        </div>

        {error !== null && <p className="text-xs text-[#ff7068]">{error}</p>}

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
          {isLoading ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
