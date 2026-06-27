"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function VerifyForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") ?? "";
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const submitted = useRef(false);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  function submitCode(code: string) {
    const callbackUrl = "/";
    router.push(
      `/api/auth/callback/resend?token=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`,
    );
  }

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError(null);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (digit && next.every((d) => d !== "") && !submitted.current) {
      submitted.current = true;
      submitCode(next.join(""));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      e.preventDefault();
      setDigits(pasted.split(""));
      inputRefs.current[5]?.focus();
      if (!submitted.current) {
        submitted.current = true;
        submitCode(pasted);
      }
    }
  }

  async function handleResend() {
    if (countdown > 0 || !email) return;
    setIsResending(true);
    setError(null);
    try {
      const { signIn } = await import("next-auth/react");
      await signIn("resend", { email, redirect: false });
      setCountdown(60);
      setDigits(["", "", "", "", "", ""]);
      submitted.current = false;
      inputRefs.current[0]?.focus();
    } catch {
      setError("Could not resend. Please try again.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#09090f] text-[#F5F5F0]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(232,69,60,0.12),transparent_40%)]" />

      <header className="relative z-10 flex h-16 shrink-0 items-center px-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-geist-mono)] text-base font-bold uppercase tracking-[0.16em] text-[#e8453c] transition-colors hover:text-[#ff7068]"
        >
          Cine·Roll
        </Link>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-sm">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-tight">
            Check your
            <br />
            <span className="text-[#e8453c]">email.</span>
          </h1>
          <p className="mt-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#888899]">
            We sent a 6-digit code to
          </p>
          {email !== "" && (
            <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-sm text-[#F5F5F0]">
              {email}
            </p>
          )}

          <div className="mt-8 flex gap-2" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                aria-label={`Digit ${i + 1}`}
                className={cn(
                  "h-14 w-full rounded-xl border bg-[#0d0d1a] text-center",
                  "font-[family-name:var(--font-geist-mono)] text-xl font-bold text-[#F5F5F0]",
                  "transition-colors focus:outline-none",
                  digit !== ""
                    ? "border-[#e8453c]/60"
                    : "border-[#1e1e2a] focus:border-[#e8453c]/40",
                )}
              />
            ))}
          </div>

          {error !== null && (
            <p className="mt-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#e8453c]">
              {error}
            </p>
          )}

          <div className="mt-6 text-center">
            {countdown > 0 ? (
              <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#444458]">
                Resend code in {countdown}s
              </p>
            ) : (
              <button
                type="button"
                onClick={() => void handleResend()}
                disabled={isResending}
                className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899] underline-offset-4 transition hover:text-[#F5F5F0] hover:underline disabled:opacity-50 focus-visible:outline-none"
              >
                {isResending ? "Sending…" : "Resend code"}
              </button>
            )}
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/auth/signin"
              className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#444458] underline-offset-4 transition hover:text-[#888899] hover:underline"
            >
              ← Use a different email
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
