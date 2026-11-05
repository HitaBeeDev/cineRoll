import { LastUpdated } from "@/components/last-updated";

export function MethodologyHero({ updatedAt }: { updatedAt: string | null }) {
  return (
    <section className="border-b border-white/10 bg-[#0b0b12]">
      <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.45em] text-accent">
          Methodology
        </p>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[#f8f8f4] sm:text-5xl">
          How the data is built
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#a8a8bd]">
          Where CineRoll&apos;s award records come from, how each nomination is tied to the right
          film, what is checked, and what is still missing.
        </p>
        <LastUpdated iso={updatedAt} className="mt-6" />
      </div>
    </section>
  );
}
