type FilterChipListProps = {
  chips: string[];
  compact?: boolean;
};

export function FilterChipList({ chips, compact = false }: FilterChipListProps) {
  return (
    <div className="flex min-w-0 flex-wrap gap-1.5">
      {chips.map((chip) => (
        <span
          key={chip}
          className={
            compact
              ? "rounded-full border border-[#2a2a3e] bg-[#09090f]/70 px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-widest text-[#F5F5F0]"
              : "max-w-full break-words rounded-full border border-[#2a2a3e] bg-[#09090f]/70 px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.12em] text-[#F5F5F0] sm:text-[11px] sm:tracking-widest"
          }
        >
          {chip}
        </span>
      ))}
    </div>
  );
}
