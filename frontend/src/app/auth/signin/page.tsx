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
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#09090f] text-[#F5F5F0]">
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

      <main className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <section className="border border-white/10 bg-[#0d0d16]/72 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.36),0_0_80px_rgba(232,69,60,0.06)] backdrop-blur sm:p-7">
            <div>
              <p className="font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.26em] text-[#e8453c]">
                CineRoll account
              </p>
              <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold leading-tight sm:text-5xl">
                Welcome
                <br />
                <span className="text-[#e8453c]">back.</span>
              </h1>
              <p className="mt-4 text-sm leading-6 text-[#c8c8d4]">
                Sign in to save your rolls, picks, watchlist, and film history.
              </p>
            </div>

            <div className="mt-6">
              <SignInOptions callbackUrl={callbackUrl} />
            </div>

            <p className="mt-4 text-center font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-[#8f8fa0]">
              No password needed. We&apos;ll email you a one-time code.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-5">
              {["Save picks", "Track taste", "Keep history"].map((benefit) => (
                <div
                  key={benefit}
                  className="border border-white/8 bg-white/[0.03] px-2 py-2 text-center font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-[0.12em] text-[#a9a9b8]"
                >
                  {benefit}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
