"use client";

import { useState } from "react";
import { fetchAccountExport } from "@/lib/api";
import { useToast } from "@/components/ui/toast/use-toast";

/**
 * Fetches the account export and hands it to the browser as a file.
 *
 * The download is built client-side from the JSON rather than served as an
 * attachment, because the export route goes through the app's own proxy — which
 * attaches the session's bridge token — and a plain `<a download>` to the API
 * would arrive unauthenticated.
 */
export function useDownloadMyData() {
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  async function download() {
    if (pending) return;
    setPending(true);
    try {
      const data = await fetchAccountExport();
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `cineroll-data-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({
        variant: "error",
        title: "Download failed",
        description: "Please try again in a moment.",
      });
    } finally {
      setPending(false);
    }
  }

  return { pending, download };
}
