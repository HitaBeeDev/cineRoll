export function LoadingState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#e8453c]/30 border-t-[#e8453c]" />
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#555568]">
        Loading blind roll...
      </p>
    </div>
  );
}
