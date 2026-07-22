/** The "REEL // …" channel tag that sits above the verdict header. */
export function ChannelPill({ title }: { title: string }) {
  const label = `REEL // ${title.toUpperCase().slice(0, 11)}`;
  return (
    <div className="flex items-center -mx-1 -mt-1 mb-2">
      <span className="inline-flex items-center rounded-full border border-[#2a2a3e] bg-[#11111b] px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]">
        {label}
      </span>
    </div>
  );
}
