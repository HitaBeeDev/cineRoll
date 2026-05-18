"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export function ShareBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="relative z-50 flex items-center justify-between gap-4 border-b border-[#e8453c]/20 bg-[#e8453c]/8 px-4 py-2.5 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-3">
        <span className="text-[#e8453c]" aria-hidden>◆</span>
        <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.3em] text-[#c8c8e0]">
          Someone shared this film with you
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <Link
          href="/"
          className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.3em] text-[#e8453c] transition-opacity hover:opacity-75"
        >
          Discover more →
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="text-white/30 transition-colors hover:text-white/60"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
