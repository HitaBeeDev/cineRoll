import { GOLD } from "@/components/hero-headline-accolade/constants";

/** A single count + label pair (e.g. "3 Wins") in the totals row. */
export function Total({
  value,
  label,
  gold,
}: {
  value: number;
  label: string;
  gold?: boolean;
}) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span
        className="font-[family-name:var(--font-display)] text-2xl font-bold leading-none tabular-nums"
        style={{ color: gold ? GOLD : "#c8c8e0" }}
      >
        {value}
      </span>
      <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.24em] text-white/45">
        {label}
      </span>
    </span>
  );
}
