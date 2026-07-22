"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { MAX_NAME } from "@/components/lists-manager/constants";

/** The "new collection" form. Owns the name draft; delegates the create call to
 *  `onCreate` and closes itself once the create succeeds. */
export function CreateListForm({
  creating,
  atLimit,
  onCreate,
  onClose,
}: {
  creating: boolean;
  atLimit: boolean;
  onCreate: (name: string) => Promise<boolean>;
  onClose: () => void;
}) {
  const [newName, setNewName] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const created = await onCreate(name);
    if (created) {
      setNewName("");
      onClose();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 flex flex-col gap-2.5 rounded-2xl border border-[#26262f] bg-[#101019] p-4 sm:max-w-xl"
    >
      <label
        htmlFor="new-list-name"
        className="font-[family-name:var(--font-geist-sans)] text-[13px] font-medium text-[#c2c2ce]"
      >
        Name your collection
      </label>
      <div className="flex items-center gap-2.5">
        <input
          ref={inputRef}
          id="new-list-name"
          value={newName}
          onChange={(e) => setNewName(e.target.value.slice(0, MAX_NAME))}
          disabled={atLimit || creating}
          maxLength={MAX_NAME}
          placeholder="e.g. Weekend classics"
          className="min-h-[48px] min-w-0 flex-1 rounded-xl border border-[#2a2a35] bg-[#16161f] px-3.5 font-[family-name:var(--font-geist-sans)] text-[15px] text-[#F7F7F2] placeholder:text-[#6f6f82] focus:border-[#e8453c]/60 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!newName.trim() || atLimit || creating}
          className="inline-flex min-h-[48px] shrink-0 items-center gap-1.5 rounded-xl bg-[#e8453c] px-5 font-[family-name:var(--font-geist-sans)] text-[15px] font-semibold text-white transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] disabled:cursor-not-allowed disabled:bg-[#26262f] disabled:text-[#7a7a8c]"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          Create list
        </button>
        <button
          type="button"
          onClick={() => {
            setNewName("");
            onClose();
          }}
          className="inline-flex min-h-[48px] shrink-0 items-center rounded-xl px-3 font-[family-name:var(--font-geist-sans)] text-[14px] text-[#9a9aac] transition-colors hover:text-[#F7F7F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
