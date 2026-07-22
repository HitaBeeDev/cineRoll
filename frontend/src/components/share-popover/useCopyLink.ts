"use client";

import { useCallback, useState } from "react";

/** Copies `url` to the clipboard and flags `copied` for a brief acknowledgement. */
export function useCopyLink(url: string) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — leave the link selectable below
    }
  }, [url]);

  return { copied, copy };
}
