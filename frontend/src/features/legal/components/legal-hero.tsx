import type { LegalHeroProps } from "../component-props";

export function LegalHero({ title, updatedAt }: LegalHeroProps) {
  return (
    <section className="border-b border-white/10 bg-[#0b0b12]">
      <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.45em] text-[#e8453c]">
          Legal
        </p>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[#f8f8f4] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#a8a8bd]">Last updated: {updatedAt}</p>
      </div>
    </section>
  );
}
