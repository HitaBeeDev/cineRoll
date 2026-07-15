import type { HistoryCountProps } from "../component-props";

export function HistoryCount({ total }: HistoryCountProps) {
  if (total === 0) return null;

  return (
    <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#9a9aac]">
      {total} {total === 1 ? "film" : "films"} watched
    </p>
  );
}
