import { AppHeader } from "@/components/app-header";

export function BlindRollFallback() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#09090f] text-[#F5F5F0]">
      <AppHeader />
      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-4 px-4 py-20 sm:px-6">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#e8453c]/30 border-t-[#e8453c]" />
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#a0a0b5]">
          Loading blind roll...
        </p>
      </main>
    </div>
  );
}
