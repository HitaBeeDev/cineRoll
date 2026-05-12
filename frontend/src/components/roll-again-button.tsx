"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { fetchRandom } from "@/lib/api";
import { cn } from "@/lib/utils";

export function RollAgainButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRoll() {
    if (loading) return;
    setLoading(true);
    try {
      const { film } = await fetchRandom();
      router.push(`/film/${film.slug}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleRoll}
      disabled={loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded bg-[#ef3347] px-5 py-2.5",
        "text-sm font-semibold text-white transition-colors",
        "hover:bg-[#ff4558] disabled:cursor-not-allowed disabled:opacity-60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4558]",
        className,
      )}
    >
      <Play className="h-4 w-4" aria-hidden />
      {loading ? "Rolling…" : "Roll Again"}
    </button>
  );
}
