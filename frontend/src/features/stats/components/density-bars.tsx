type DensityBarsProps = { value: number; max: number };

export function DensityBars({ value, max }: DensityBarsProps) {
  const barCount = 8;
  const litCount = Math.round((Math.min(value, max) / max) * barCount);
  return (
    <div className="flex h-16 w-16 items-end gap-1" aria-hidden="true">
      {Array.from({ length: barCount }).map((_, index) => (
        <span key={index} className="flex-1 rounded-sm" style={{ height: `${30 + (index / (barCount - 1)) * 70}%`, backgroundColor: index < litCount ? "#e8453c" : "rgba(255,255,255,0.08)" }} />
      ))}
    </div>
  );
}
