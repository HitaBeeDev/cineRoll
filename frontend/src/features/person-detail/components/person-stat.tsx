import type { PersonStatProps } from "../component-props";

export function PersonStat({ value, label, accent }: PersonStatProps) {
  return (
    <div>
      <span
        className="block font-[family-name:var(--font-display)] font-bold leading-none tabular-nums"
        style={{
          fontSize: "clamp(2.2rem,4.5vw,3.5rem)",
          color: accent ? "#e8453c" : "#f8f8f4",
        }}
      >
        {value}
      </span>
      <p className="mt-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.5em] text-[#555570]">
        {label}
      </p>
    </div>
  );
}
