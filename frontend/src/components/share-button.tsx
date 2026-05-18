"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string | undefined;
  label?: string | undefined;
  className?: string | undefined;
  iconClassName?: string | undefined;
}

export function ShareButton({
  url,
  title,
  text,
  label = "Share Tonight's Pick",
  className,
  iconClassName = "h-3.5 w-3.5",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        const shareData: ShareData = { url, title };
        if (text) shareData.text = text;
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled or API unavailable — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors silently
    }
  }

  return (
    <button type="button" onClick={handleShare} className={className}>
      {copied ? (
        <Check className={iconClassName} aria-hidden />
      ) : (
        <Share2 className={iconClassName} aria-hidden />
      )}
      {copied ? "Copied!" : label}
    </button>
  );
}
