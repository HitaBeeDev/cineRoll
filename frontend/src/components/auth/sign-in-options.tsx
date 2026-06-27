"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";
import { PasswordInput } from "@/components/auth/password-input";

type SignInOptionsProps = {
  /**
   * Relative path to return to after auth. Honoured by both Google (redirect)
   * and credentials sign-in, so flows like "rate → sign in → land back on the
   * film" resume where they started.
   */
  callbackUrl: string;
};

type Mode = "signin" | "signup";

const inputClass = cn(
  "h-12 w-full rounded-xl border border-[#2b2b3d] bg-[#10101d] px-4",
  "text-sm text-[#F5F5F0] placeholder:text-[#777789]",
  "transition-colors focus:border-[#e8453c]/70 focus:outline-none focus:ring-2 focus:ring-[#e8453c]/15",
);

const labelClass = "text-xs font-medium text-[#b8b8c6]";

/** Shared sign-in / create-account controls (Google + email & password). Used
 *  by the full sign-in page and the inline auth modal so both stay in sync. */
export function SignInOptions({ callbackUrl }: SignInOptionsProps) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only relative paths, to avoid an open-redirect.
  const safeCallbackUrl = callbackUrl.startsWith("/") ? callbackUrl : "/";
  const busy = isLoading || isGoogleLoading;

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setConfirm("");
  }

  async function completeSignIn() {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setError("Incorrect email or password.");
      return;
    }
    window.location.href = safeCallbackUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);

    if (mode === "signup" && password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          setError(data?.error ?? "Could not create your account. Please try again.");
          return;
        }
      }
      await completeSignIn();
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
        disabled={busy}
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
        <span className="text-xs text-[#5a5a6e]">or</span>
        <div className="h-px flex-1 bg-[#1e1e2a]" />
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="signin-email" className={labelClass}>
            Email address
          </label>
          <input
            id="signin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="signin-password" className={labelClass}>
            Password
          </label>
          <PasswordInput
            id="signin-password"
            value={password}
            onChange={setPassword}
            placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
          />
          {mode === "signin" && (
            <Link
              href="/auth/forgot-password"
              className="self-end text-xs text-[#8f8fa0] underline-offset-2 transition-colors hover:text-[#c8c8d4] hover:underline"
            >
              Forgot password?
            </Link>
          )}
        </div>

        {mode === "signup" && (
          <div className="flex flex-col gap-2">
            <label htmlFor="signin-confirm" className={labelClass}>
              Confirm password
            </label>
            <PasswordInput
              id="signin-confirm"
              value={confirm}
              onChange={setConfirm}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              required
            />
          </div>
        )}

        {error !== null && <p className="text-xs text-[#ff7068]">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className={cn(
            "h-12 w-full rounded-xl bg-[#e8453c]",
            "text-sm font-semibold text-[#F5F5F0]",
            "shadow-[0_10px_28px_rgba(232,69,60,0.16)] transition hover:bg-[#f2554c]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
            "disabled:cursor-not-allowed disabled:bg-[#8f302b] disabled:text-[#c9a1a0] disabled:shadow-none",
          )}
        >
          {isLoading
            ? mode === "signup"
              ? "Creating account…"
              : "Signing in…"
            : mode === "signup"
              ? "Create account"
              : "Sign in"}
        </button>
      </form>

      <p className="text-center text-xs text-[#8f8fa0]">
        {mode === "signin" ? (
          <>
            New to CineRoll?{" "}
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className="font-medium text-[#c8c8d4] underline-offset-2 transition-colors hover:text-[#F5F5F0] hover:underline"
            >
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className="font-medium text-[#c8c8d4] underline-offset-2 transition-colors hover:text-[#F5F5F0] hover:underline"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}
