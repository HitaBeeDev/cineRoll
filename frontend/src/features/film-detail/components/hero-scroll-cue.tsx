import { ChevronDown } from "lucide-react";

export function HeroScrollCue() {
  return (
    <div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
      <div
        className="pointer-events-none absolute -inset-x-6 -inset-y-3 -z-10 blur-md"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(7,7,11,0.55), transparent 72%)",
        }}
      />
      <span
        className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.4em] text-white/80"
        style={{ textShadow: "0 1px 12px rgba(0,0,0,0.85)" }}
      >
        Scroll
      </span>
      <ChevronDown
        className="h-4 w-4 animate-bounce text-white/90 [animation-duration:2s]"
        style={{ filter: "drop-shadow(0 1px 6px rgba(0,0,0,0.85))" }}
        aria-hidden
      />
    </div>
  );
}
