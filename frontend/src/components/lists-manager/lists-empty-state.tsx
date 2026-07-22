import { Plus } from "lucide-react";

/** Shown when the user has no collections yet and the create form is closed. */
export function ListsEmptyState({ onNewList }: { onNewList: () => void }) {
  return (
    <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#26262f] bg-[#0d0d14] px-6 py-16 text-center">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#F7F7F2]">
        Start your first collection
      </h2>
      <p className="mx-auto max-w-md font-[family-name:var(--font-geist-sans)] text-[14px] leading-relaxed text-[#9a9aac]">
        Group films any way you like — a director retrospective, a weekend
        watchlist, or your all-time favorites.
      </p>
      <button
        type="button"
        onClick={onNewList}
        className="mt-2 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#e8453c] px-5 font-[family-name:var(--font-geist-sans)] text-[14px] font-semibold text-white transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
      >
        <Plus className="h-[18px] w-[18px]" aria-hidden />
        New list
      </button>
    </div>
  );
}
