export function StatsUnavailable() {
  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex min-h-[50vh] items-center justify-center rounded-lg border border-white/10 bg-white/[0.025] p-8 text-center">
        <p className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.22em] text-[#9e9ab0]">Stats unavailable. Make sure the backend is running.</p>
      </div>
    </main>
  );
}
