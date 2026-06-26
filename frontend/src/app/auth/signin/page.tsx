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
    <div className="relative flex min-h-screen flex-col bg-[#09090f] text-[#F5F5F0]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(232,69,60,0.12),transparent_40%)]" />

      <header className="relative z-10 flex h-16 shrink-0 items-center px-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-geist-mono)] text-base font-bold uppercase tracking-[0.16em] text-[#e8453c] transition-colors hover:text-[#ff7068]"
        >
          Cine·Roll
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-tight">
            Welcome
            <br />
            <span className="text-[#e8453c]">back.</span>
          </h1>
          <p className="mt-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.22em] text-[#888899]">
            Sign in or create an account
          </p>

          <div className="mt-8">
            <SignInOptions callbackUrl={callbackUrl} />
          </div>
        </div>
      </main>
    </div>
  );
}
