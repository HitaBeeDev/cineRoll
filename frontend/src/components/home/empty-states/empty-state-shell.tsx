import { FilmStrip } from "@/components/home/empty-states/film-strip";

/** Shared empty-state scaffolding: scanline overlay, film-strip edges, and a
 *  centered main area with a radial glow. Callers supply the inner content and
 *  the glow intensity. */
export function EmptyStateShell({
  glowOpacity = 0.08,
  children,
}: {
  glowOpacity?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-full flex-1 flex-col overflow-hidden">
      {/* Scanlines */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,#F5F5F0,#F5F5F0 1px,transparent 1px,transparent 3px)",
        }}
      />

      <FilmStrip edge="top" />

      {/* Main area */}
      <div className="relative flex flex-1 flex-col items-center justify-center gap-5 px-8 py-10 text-center">
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(ellipse at center,rgba(232,69,60,${glowOpacity}) 0%,transparent 70%)`,
          }}
        />
        {children}
      </div>

      <FilmStrip edge="bottom" />
    </div>
  );
}
