"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dices } from "lucide-react";
import { fetchRandom } from "@/lib/api";
import { cn } from "@/lib/utils";

export function RollAgainButton() {
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
        "inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5",
        "text-sm font-semibold text-zinc-950 transition-colors",
        "hover:bg-amber-300 disabled:opacity-60 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      )}
    >
      <Dices className="h-4 w-4" aria-hidden />
      {loading ? "Rolling…" : "Roll Again"}
    </button>
  );
}
