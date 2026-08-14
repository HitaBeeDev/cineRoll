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
        className="flex-1 rounded-xl bg-accent px-4 py-3 text-center font-[family-name:var(--font-geist-mono)] text-[12px] font-bold uppercase tracking-[0.14em] text-fg-hi transition-colors hover:bg-[#d5342b]"
      >
        Add to home screen
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-xl border border-edge-strong px-4 py-3 font-[family-name:var(--font-geist-mono)] text-[12px] font-bold uppercase tracking-[0.14em] text-[#a0a0b5] transition-colors hover:text-fg-hi"
      >
        Not now
      </button>
    </div>
  );
}
