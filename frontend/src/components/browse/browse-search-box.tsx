import { Clapperboard, Search } from "lucide-react";
import { formatFilmYear } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BrowseAutocomplete } from "@/hooks/useBrowseAutocomplete";

/**
 * The browse search field with its film/person autocomplete listbox. Owns only
 * presentation — all suggestion state and keyboard handling come from the
 * `autocomplete` hook object; `value`/`onValueChange` drive the free-text input.
 */
export function BrowseSearchBox({
  value,
  onValueChange,
  autocomplete,
}: {
  value: string;
  onValueChange: (value: string) => void;
  autocomplete: BrowseAutocomplete;
}) {
  const { results, open, activeIndex, listboxId, containerRef, select, onKeyDown, onFocus, setActiveIndex } = autocomplete;
  const hasSuggestions = !!results && results.films.length + results.people.length > 0;

  return (
    <div ref={containerRef} className="relative w-full min-w-0 sm:grow sm:basis-[180px]">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6f6b80]" />
      <input
        type="text"
        role="combobox"
        placeholder="Search films or people…"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        className="h-10 w-full rounded-md border border-white/10 bg-white/[0.045] pl-9 pr-3 text-[13px] text-[#f1eff8] outline-none transition-colors placeholder:text-[#857f95] hover:border-white/18 focus:border-[#e8453c]/70 focus:ring-2 focus:ring-[#e8453c]/15"
      />
      {open && results && hasSuggestions && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-white/12 bg-[#0e0d18] shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
        >
          {results.films.length > 0 && (
            <>
              <div className="px-3 pt-2.5 pb-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.28em] text-[#555064]">
                Films
              </div>
              {results.films.map((film, i) => (
                <button
                  key={film.slug}
                  id={`${listboxId}-option-${i}`}
                  role="option"
                  aria-selected={activeIndex === i}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); select(i); }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
                    activeIndex === i ? "bg-white/[0.08]" : "hover:bg-white/[0.05]",
                  )}
                >
                  <Clapperboard className="h-3 w-3 shrink-0 text-[#555064]" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-[#e8e5f4]">
                    {film.title}
                  </span>
                  <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] text-[#555064]">
                    {formatFilmYear(film)}
                  </span>
                </button>
              ))}
            </>
          )}
          {results.people.length > 0 && (
            <>
              <div className={cn(
                "px-3 pb-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.28em] text-[#555064]",
                results.films.length > 0 ? "mt-2 border-t border-white/[0.06] pt-2.5" : "pt-2.5",
              )}>
                People
              </div>
              {results.people.map((person, j) => {
                const flatIdx = results.films.length + j;
                return (
                  <button
                    key={person.name}
                    id={`${listboxId}-option-${flatIdx}`}
                    role="option"
                    aria-selected={activeIndex === flatIdx}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); select(flatIdx); }}
                    onMouseEnter={() => setActiveIndex(flatIdx)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
                      activeIndex === flatIdx ? "bg-white/[0.08]" : "hover:bg-white/[0.05]",
                    )}
                  >
                    <Search className="h-3 w-3 shrink-0 text-[#555064]" aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-[13px] text-[#e8e5f4]">
                      {person.name}
                    </span>
                    <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] capitalize text-[#555064]">
                      {person.roles.join(" · ")}
                    </span>
                  </button>
                );
              })}
            </>
          )}
          <div className="h-1" />
        </div>
      )}
    </div>
  );
}
