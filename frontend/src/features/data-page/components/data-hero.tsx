import { LastUpdated } from "@/components/last-updated";

export function DataHero({ updatedAt }: { updatedAt: string | null }) {
  return (
    <section className="border-b border-white/10 bg-[#0b0b12]">
      <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.45em] text-accent">
          Data
        </p>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[#f8f8f4] sm:text-5xl">
          The catalogue in numbers
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#a8a8bd]">
          How many films, nominations and wins CineRoll holds, which ceremonies are on record for
          each award, decade by decade, and where the gaps are. Read from the live data every day.
        </p>
        <LastUpdated iso={updatedAt} className="mt-6" />
      </div>
    </section>
  );
}
