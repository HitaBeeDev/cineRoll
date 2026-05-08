"use client";

import { CalendarCheck, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type WatchTonightButtonProps = {
  title: string;
  year: number;
};

export function WatchTonightButton({ title, year }: WatchTonightButtonProps) {
  const { toast } = useToast();

  async function handleShare() {
    const url = new URL(window.location.href);
    url.searchParams.set("from", "watch-tonight");
    const shareText = `Watching ${title} (${year}) tonight via CineRoll`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${title} (${year}) | CineRoll`,
          text: shareText,
          url: url.toString(),
        });
        return;
      }

      await navigator.clipboard.writeText(url.toString());
      toast({
        variant: "success",
        title: "Link copied",
        description: "Watch Tonight link copied to clipboard.",
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;

      toast({
        variant: "error",
        title: "Could not share",
        description: "Try copying the page URL manually.",
      });
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:inset-x-auto md:bottom-6 md:right-6 md:px-0 md:pb-0">
      <button
        type="button"
        className={cn(
          "mx-auto flex h-13 w-full max-w-sm items-center justify-center gap-3 rounded-lg border",
          "border-[color:color-mix(in_srgb,var(--film-accent,#D4AF37)_48%,rgb(63_63_70))]",
          "bg-[#09090f]/92 px-5 text-sm font-semibold text-[#F5F5F0] shadow-2xl shadow-black/50 backdrop-blur-[20px]",
          "transition-colors hover:text-[var(--film-accent,#D4AF37)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--film-accent,#D4AF37)]",
          "md:h-12 md:w-auto md:max-w-none"
        )}
        onClick={handleShare}
      >
        <CalendarCheck className="h-4 w-4 text-[var(--film-accent,#D4AF37)]" aria-hidden />
        <span>Watch Tonight</span>
        <Share2 className="h-4 w-4 text-zinc-500" aria-hidden />
      </button>
    </div>
  );
}
