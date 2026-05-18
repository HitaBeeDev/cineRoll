"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Check, Share2 } from "lucide-react";

interface ShareButtonProps {
  url: string;
  title: string;
  caption?: string | undefined;
  label?: string | undefined;
  className?: string | undefined;
  iconClassName?: string | undefined;
}

export function ShareButton({
  url,
  title,
  caption,
  label = "Share Tonight's Pick",
  className,
  iconClassName = "h-3.5 w-3.5",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        const shareData: ShareData = { url, title };
        if (caption) shareData.text = caption;
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled or API unavailable — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  }

  return (
    <>
      <button type="button" onClick={handleShare} className={className}>
        {copied ? (
          <Check className={iconClassName} aria-hidden />
        ) : (
          <Share2 className={iconClassName} aria-hidden />
        )}
        {copied ? "Copied!" : label}
      </button>

      {copied &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-2.5 rounded-full border border-white/12 bg-[#18182a] px-5 py-3 shadow-2xl shadow-black/60 backdrop-blur-md">
              <Check className="h-3.5 w-3.5 shrink-0 text-[#e8453c]" aria-hidden />
              <span className="font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f0f0f8]">
                Link copied!
              </span>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
