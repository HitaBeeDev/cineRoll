"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { MAX_NAME } from "@/components/save-to-list-dialog/constants";

/**
 * The inline "create a new list" control: a collapsed full-width button that
 * reveals a name form on demand. Owns its own draft + disclosure state, which
 * reset when the dialog closes (its content unmounts). Creating also adds the
 * film, via `onCreate`; a successful create collapses the form again.
 */
export function CreateListInline({
  hasLists,
  onCreate,
  creating,
  atLimit,
  maxLists,
}: {
  hasLists: boolean;
  onCreate: (name: string) => Promise<boolean>;
  creating: boolean;
  atLimit: boolean;
  maxLists: number;
}) {
  const [newName, setNewName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const showForm = showCreate || !hasLists;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const created = await onCreate(name);
    if (created) {
      setNewName("");
      setShowCreate(false);
    }
  }

  return (
    <div className="mt-5 border-t border-[#22222e] pt-5">
      {!showForm ? (
        <button
          type="button"
          disabled={atLimit}
          onClick={() => setShowCreate(true)}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-[#2a2a35] bg-[#14141c] font-[family-name:var(--font-geist-sans)] text-[14px] font-medium text-[#d0d0da] transition-colors hover:border-[#e8453c]/45 hover:text-[#F7F7F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/60 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-[18px] w-[18px]" aria-hidden />
          Create a new list
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <label
            htmlFor="new-list-name"
            className="font-[family-name:var(--font-geist-sans)] text-[13px] font-medium text-[#c2c2ce]"
          >
            Create a new list
          </label>
          <div className="flex items-center gap-2.5">
            <input
              id="new-list-name"
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value.slice(0, MAX_NAME))}
              disabled={atLimit || creating}
              maxLength={MAX_NAME}
              placeholder="e.g. Weekend watchlist"
              className="min-h-[48px] min-w-0 flex-1 rounded-xl border border-[#2a2a35] bg-[#16161f] px-3.5 font-[family-name:var(--font-geist-sans)] text-[14px] text-[#F7F7F2] placeholder:text-[#6f6f82] focus:border-[#e8453c]/60 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!newName.trim() || atLimit || creating}
              className="inline-flex min-h-[48px] shrink-0 items-center gap-1.5 rounded-xl bg-[#e8453c] px-5 font-[family-name:var(--font-geist-sans)] text-[14px] font-semibold text-white transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] disabled:cursor-not-allowed disabled:bg-[#26262f] disabled:text-[#7a7a8c]"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Creating…
                </>
              ) : (
                "Create"
              )}
            </button>
          </div>
          {atLimit && (
            <p className="font-[family-name:var(--font-geist-sans)] text-[12px] text-[#9a9aac]">
              List limit reached ({maxLists}). Delete one to add more.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
