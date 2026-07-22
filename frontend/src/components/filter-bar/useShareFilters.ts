"use client";

import { useState } from "react";
import type { FilterState } from "@cineroll/types";
import { filtersToParams } from "@/lib/api";

/**
 * Shares the current filter set as a /browse deep link — via the native share
 * sheet when available, falling back to copying the URL to the clipboard (with
 * a brief `isCopied` acknowledgement).
 */
export function useShareFilters(filters: FilterState, recipe: string) {
  const [isCopied, setIsCopied] = useState(false);

  async function share() {
    const params = filtersToParams(filters);
    const url = `${window.location.origin}/browse?${params.toString()}`;
    const captionText = recipe ? `Rolling from: ${recipe}` : "My CineRoll filters";

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: "CineRoll — My Roll Recipe", text: captionText, url });
        return;
      } catch { /* user cancelled or API unavailable */ }
    }

    try {
      await navigator.clipboard.writeText(`${captionText}\n${url}`);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2500);
    } catch { /* ignore */ }
  }

  return { isCopied, share };
}
