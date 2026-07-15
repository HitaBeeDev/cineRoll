import type { ProfileCollectionLoadMoreProps } from "./profile-collection-props";

export function ProfileCollectionLoadMore({
  isLoading,
  onClick,
}: ProfileCollectionLoadMoreProps) {
  return (
    <div className="mt-10 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className="inline-flex items-center rounded-xl border border-white/15 bg-[#0d0d1a] px-6 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#cfcadb] transition-colors hover:border-[#e8453c]/60 hover:text-[#e8453c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Loading…" : "Load more"}
      </button>
    </div>
  );
}
