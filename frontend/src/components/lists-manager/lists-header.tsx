import { Plus } from "lucide-react";

/** Page heading with the primary "New list" action (hidden while the form is open). */
export function ListsHeader({
  showNewList,
  atLimit,
  onNewList,
}: {
  showNewList: boolean;
  atLimit: boolean;
  onNewList: () => void;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-tight text-[#F7F7F2]">
          Your lists
        </h1>
        <p className="mt-2 font-[family-name:var(--font-geist-sans)] text-[15px] text-[#b4b4c4]">
          Organize award-winning films into personal collections.
        </p>
      </div>

      {showNewList && (
        <button
          type="button"
          onClick={onNewList}
          disabled={atLimit}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl bg-[#e8453c] px-5 font-[family-name:var(--font-geist-sans)] text-[15px] font-semibold text-white transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07070b] disabled:cursor-not-allowed disabled:bg-[#26262f] disabled:text-[#7a7a8c]"
        >
          <Plus className="h-[18px] w-[18px]" aria-hidden />
          New list
        </button>
      )}
    </div>
  );
}
