const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/**
 * Browse is a utility page — the title earns one compact line, not a full band,
 * so the filters and first row of posters sit higher up.
 */
export function BrowseHero() {
  return (
    <section className="relative overflow-hidden border-b border-[#24202a] bg-[#0a0a10]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{ backgroundImage: GRAIN_SVG, backgroundSize: "256px 256px" }}
      />

      <div className="relative mx-auto w-full max-w-[100vw] px-4 sm:max-w-screen-2xl sm:px-6 lg:px-8 xl:px-12">
        <div className="py-5">
          <div className="mb-2.5 h-px w-10 bg-[#e8453c]" aria-hidden />
          <h1
            className="font-[family-name:var(--font-display)] font-bold leading-none tracking-tight text-[#f4f0f7]"
            style={{ fontSize: "clamp(1.9rem, 3.6vw, 3.25rem)" }}
          >
            Browse Films
          </h1>
        </div>
      </div>

      <div
        className="h-px w-full"
        style={{ background: "linear-gradient(to right, #e8453c99 0%, rgba(212,175,55,0.45) 36%, transparent 78%)" }}
      />
    </section>
  );
}
