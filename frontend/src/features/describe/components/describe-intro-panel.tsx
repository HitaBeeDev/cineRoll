import { FilterChipList } from "./filter-chip-list";

const EXAMPLE_FILTERS = ["French", "Thriller", "1980s"];

export function DescribeIntroPanel() {
  return (
    <div className="flex h-full min-w-0 flex-col p-5 sm:p-6">
      <div>
        <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-[#e8453c]/70 sm:text-[11px] sm:tracking-[0.24em]">
          Channel 04 · Ask AI
        </p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-2xl leading-tight text-[#b6b6c6]">
          A sentence is enough.
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-4 py-6">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.24em] text-[#888899]">
          For example, you type
        </p>
        <p className="break-words font-[family-name:var(--font-geist-mono)] text-sm leading-6 text-[#b6b6c6]">
          “A dark French thriller from the 80s”
        </p>
        <div className="flex min-w-0 items-center gap-3">
          <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#888899] sm:tracking-[0.24em]">
            We read
          </span>
          <span className="h-px flex-1 bg-[#1e1e2a]" />
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <FilterChipList chips={EXAMPLE_FILTERS} />
          <span className="max-w-full break-words font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.12em] text-[#888899] sm:text-[11px] sm:tracking-widest">
            → films rolled
          </span>
        </div>
      </div>
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase leading-5 tracking-[0.18em] text-[#7a7a8c]">
        Reads mood, era, awards, genre, director &amp; how many picks you want — in any language.
      </p>
    </div>
  );
}
