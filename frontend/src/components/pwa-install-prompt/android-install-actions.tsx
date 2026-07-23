/** Android/Chromium install controls: trigger the native dialog, or snooze. */
export function AndroidInstallActions({
  onInstall,
  onDismiss,
}: {
  onInstall: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="mt-5 flex items-center gap-2">
      <button
        type="button"
        onClick={onInstall}
        className="flex-1 rounded-xl bg-[#e8453c] px-4 py-3 text-center font-[family-name:var(--font-geist-mono)] text-[12px] font-bold uppercase tracking-[0.14em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b]"
      >
        Add to home screen
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-xl border border-[#2a2a3e] px-4 py-3 font-[family-name:var(--font-geist-mono)] text-[12px] font-bold uppercase tracking-[0.14em] text-[#a0a0b5] transition-colors hover:text-[#F5F5F0]"
      >
        Not now
      </button>
    </div>
  );
}
