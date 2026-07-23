/** Shown when the taste cards fail to load; offers a retry. */
export function TasteCardsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="col-span-2 flex min-h-[420px] items-center justify-center border border-dashed border-[#2a2a3e] bg-[#080810]/80 sm:col-span-4">
      <div className="text-center">
        <p className="text-sm text-[#F5F5F0]">Could not load taste cards.</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-widest text-[#e8453c] transition hover:text-[#F5F5F0]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
