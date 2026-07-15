export function RollErrorPanel({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col justify-center p-6">
      <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.24em] text-[#e8453c]/70">
        Roll interrupted
      </p>
      <p className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[#F5F5F0]">
        {message}
      </p>
    </div>
  );
}
