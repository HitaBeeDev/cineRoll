"use client";

import { useState } from "react";
import Link from "next/link";
import { SignInOptions } from "@/components/auth/sign-in-options";

export default function SignInPage() {
  // Read ?callbackUrl= once at init (no effect, no Suspense boundary). Server
  // render falls back to home; callbackUrl is never rendered to the DOM, so
  // there's no hydration mismatch.
  const [callbackUrl] = useState(() => {
    if (typeof window === "undefined") return "/";
    const raw = new URLSearchParams(window.location.search).get("callbackUrl");
    return raw && raw.startsWith("/") ? raw : "/";
  });

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-[#09090f] text-[#F5F5F0]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(232,69,60,0.12),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-20 mx-auto h-[520px] w-[min(720px,90vw)] bg-[radial-gradient(circle,rgba(232,69,60,0.08),transparent_62%)]" />

      <header className="relative z-10 flex h-16 shrink-0 items-center px-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-geist-mono)] text-base font-bold uppercase tracking-[0.16em] text-[#e8453c] transition-colors hover:text-[#ff7068]"
        >
          Cine·Roll
        </Link>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 py-6 sm:py-10">
        <div className="w-full min-w-0 max-w-sm">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d16]/72 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.36)] backdrop-blur sm:p-6">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight">
                Welcome <span className="text-[#e8453c]">back</span>
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#c8c8d4]">
                Sign in to save your rolls, picks, watchlist, and film history.
              </p>
            </div>

            <div className="mt-5">
              <SignInOptions callbackUrl={callbackUrl} />
            </div>

            <p className="mt-4 border-t border-white/10 pt-3 text-center text-xs leading-5 text-[#8f8fa0]">
              By continuing, you agree to CineRoll&apos;s{" "}
              <Link href="/terms" className="text-[#c8c8d4] underline-offset-2 transition-colors hover:text-[#F5F5F0] hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#c8c8d4] underline-offset-2 transition-colors hover:text-[#F5F5F0] hover:underline">
                Privacy
              </Link>
              .{" "}
              <Link href="/help" className="text-[#c8c8d4] underline-offset-2 transition-colors hover:text-[#F5F5F0] hover:underline">
                Need help?
              </Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
