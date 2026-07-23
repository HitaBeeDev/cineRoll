/** Perforated film-strip decoration for the drawer's top and bottom edges. */
export function FilmStripEdge() {
  return (
    <div
      className="relative z-20 flex shrink-0 items-center gap-[3px] bg-[#020206] px-3 py-[6px]"
      aria-hidden
    >
      {Array.from({ length: 34 }).map((_, i) => (
        <div
          key={i}
          className="h-[7px] w-[6px] shrink-0 rounded-[1.5px] bg-[#0e0e18]"
        />
      ))}
    </div>
  );
}
