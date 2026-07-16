const ARCHIVE_DECADES = [1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

export function DecadeTicks({ covered }: { covered: number[] }) {
  const coveredDecades = new Set(covered);
  return (
    <div className="flex h-16 w-16 flex-col justify-center gap-1.5" aria-hidden="true">
      <div className="flex items-center gap-[3px]">
        {ARCHIVE_DECADES.map((decade) => <span key={decade} className="h-6 flex-1 rounded-sm" style={{ backgroundColor: coveredDecades.has(decade) ? "#e8453c" : "rgba(255,255,255,0.08)" }} />)}
      </div>
    </div>
  );
}
