import type { UserListSummary } from "@cineroll/types";
import { ListCard } from "@/components/lists-manager/list-card";

/** The "Collections" heading with count, and the responsive grid of list cards. */
export function ListGrid({
  lists,
  atLimit,
  maxLists,
  onRename,
  onDelete,
}: {
  lists: UserListSummary[];
  atLimit: boolean;
  maxLists: number;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <>
      <div className="mt-8 flex items-baseline gap-2 border-b border-[#1a1a24] pb-3">
        <h2 className="font-[family-name:var(--font-geist-sans)] text-[13px] font-semibold text-[#c2c2ce]">
          Collections
        </h2>
        <span className="font-[family-name:var(--font-geist-sans)] text-[13px] text-[#7a7a8c]">
          · {lists.length}
          {atLimit && ` of ${maxLists}`}
        </span>
      </div>
      <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => (
          <ListCard key={list.id} list={list} onRename={onRename} onDelete={onDelete} />
        ))}
      </ul>
    </>
  );
}
