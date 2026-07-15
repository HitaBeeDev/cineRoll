"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Loader2, MoreHorizontal, Plus } from "lucide-react";
import type { UserListSummary } from "@cineroll/types";
import { createUserList, deleteUserList, renameUserList } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { tmdbImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

const MAX_NAME = 50;

/**
 * The lists overview: a heading with a primary "New list" action, the current
 * collection count, and a responsive grid of collection cards. Creating,
 * renaming and deleting are optimistic with server-error rollback, mirroring
 * the watchlist grid's behaviour.
 */
export function ListsManager({
  initialLists,
  maxLists,
}: {
  initialLists: UserListSummary[];
  maxLists: number;
}) {
  const { toast } = useToast();
  const [lists, setLists] = useState(initialLists);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const atLimit = lists.length >= maxLists;

  function openForm() {
    setFormOpen(true);
    // Focus after the field mounts.
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name || creating || atLimit) return;
    setCreating(true);
    try {
      const list = await createUserList(name);
      setLists((prev) => [
        { ...list, previewPosters: [], containsFilm: false },
        ...prev,
      ]);
      setNewName("");
      setFormOpen(false);
      toast({ variant: "success", title: "List created", description: name });
    } catch (error) {
      const code = (error as { code?: string })?.code;
      toast({
        variant: "error",
        title: code === "LIST_LIMIT_REACHED" ? "List limit reached" : "Couldn't create list",
        description: code === "LIST_LIMIT_REACHED" ? `Keep up to ${maxLists} lists.` : name,
      });
    } finally {
      setCreating(false);
    }
  }

  async function handleRename(id: string, name: string) {
    const previous = lists;
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, name } : l)));
    try {
      await renameUserList(id, name);
      toast({ variant: "success", title: "List renamed", description: name });
    } catch {
      setLists(previous);
      toast({ variant: "error", title: "Couldn't rename list", description: name });
    }
  }

  async function handleDelete(id: string, name: string) {
    const previous = lists;
    setLists((prev) => prev.filter((l) => l.id !== id));
    try {
      await deleteUserList(id);
      toast({ title: "List deleted", description: name });
    } catch {
      setLists(previous);
      toast({ variant: "error", title: "Couldn't delete list", description: name });
    }
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-tight text-[#F7F7F2]">
            Your lists
          </h1>
          <p className="mt-2 font-[family-name:var(--font-geist-sans)] text-[15px] text-[#b4b4c4]">
            Organize award-winning films into personal collections.
          </p>
        </div>

        {!formOpen && (
          <button
            type="button"
            onClick={openForm}
            disabled={atLimit}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl bg-[#e8453c] px-5 font-[family-name:var(--font-geist-sans)] text-[15px] font-semibold text-white transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07070b] disabled:cursor-not-allowed disabled:bg-[#26262f] disabled:text-[#7a7a8c]"
          >
            <Plus className="h-[18px] w-[18px]" aria-hidden />
            New list
          </button>
        )}
      </div>

      {formOpen && (
        <form
          onSubmit={handleCreate}
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
                setFormOpen(false);
                setNewName("");
              }}
              className="inline-flex min-h-[48px] shrink-0 items-center rounded-xl px-3 font-[family-name:var(--font-geist-sans)] text-[14px] text-[#9a9aac] transition-colors hover:text-[#F7F7F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {lists.length === 0 && !formOpen ? (
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
            onClick={openForm}
            className="mt-2 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#e8453c] px-5 font-[family-name:var(--font-geist-sans)] text-[14px] font-semibold text-white transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
          >
            <Plus className="h-[18px] w-[18px]" aria-hidden />
            New list
          </button>
        </div>
      ) : (
        lists.length > 0 && (
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
              <ListCard
                key={list.id}
                list={list}
                onRename={handleRename}
                onDelete={handleDelete}
              />
            ))}
            </ul>
          </>
        )
      )}
    </div>
  );
}

function ListCard({
  list,
  onRename,
  onDelete,
}: {
  list: UserListSummary;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(list.name);
  const posters = list.previewPosters.slice(0, 3);

  function commitRename(e: React.FormEvent) {
    e.preventDefault();
    const name = draft.trim();
    setEditing(false);
    if (name && name !== list.name) onRename(list.id, name);
    else setDraft(list.name);
  }

  return (
    <li className="group relative flex flex-col rounded-2xl border border-[#26262f] bg-[#101019] transition-colors hover:border-[#3a3a4c] hover:bg-[#14141c]">
      {/* Cover: up to three recent posters filling the card width, with a
          gradient base to unify the artwork against the dark card. */}
      <div className="relative flex aspect-[16/10] gap-px overflow-hidden rounded-t-2xl bg-[#08080d]">
        {posters.length > 0 ? (
          posters.map((poster, i) => (
            <div key={i} className="relative h-full flex-1 overflow-hidden">
              <Image
                src={tmdbImageUrl(poster, "w342") ?? poster}
                alt=""
                fill
                sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </div>
          ))
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-[family-name:var(--font-geist-sans)] text-[13px] text-[#5a5a6c]">
              No films yet
            </span>
          </div>
        )}
        {/* One overlay + one gradient across the whole collage, so mixed poster
            brightness reads as a single cover rather than three images. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/20" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#101019] to-transparent"
        />
      </div>

      <div className="flex items-start justify-between gap-2 px-5 pb-5 pt-4">
        {editing ? (
          <form onSubmit={commitRename} className="relative z-20 flex flex-1 items-center gap-2">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MAX_NAME))}
              onBlur={commitRename}
              maxLength={MAX_NAME}
              aria-label="List name"
              className="min-h-[40px] min-w-0 flex-1 rounded-lg border border-[#2a2a35] bg-[#16161f] px-3 font-[family-name:var(--font-geist-sans)] text-[15px] text-[#F7F7F2] focus:border-[#e8453c]/60 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Save name"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#7ee787] hover:bg-white/5"
            >
              <Check className="h-4 w-4" aria-hidden />
            </button>
          </form>
        ) : (
          <div className="min-w-0">
            <h3 className="truncate font-[family-name:var(--font-geist-sans)] text-[16px] font-semibold text-[#F7F7F2]">
              {list.name}
            </h3>
            <p className="mt-1.5 font-[family-name:var(--font-geist-sans)] text-[13px] text-[#9a9aac]">
              {list.filmCount} {list.filmCount === 1 ? "film" : "films"}
            </p>
          </div>
        )}

        {!editing && (
          <CardMenu
            listName={list.name}
            onRename={() => {
              setDraft(list.name);
              setEditing(true);
            }}
            onDelete={() => onDelete(list.id, list.name)}
          />
        )}
      </div>

      {/* Stretched link makes the whole card open the list. Sits below the
          overflow menu (z-20) so the menu stays clickable; hidden while renaming. */}
      {!editing && (
        <Link
          href={`/profile/lists/${list.id}`}
          aria-label={`Open ${list.name}`}
          className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#e8453c]"
        />
      )}
    </li>
  );
}

/**
 * Per-card overflow menu (Rename / Delete). Delete asks for confirmation inside
 * the menu so the destructive action is never a single tap. Closes on outside
 * click or Escape.
 */
function CardMenu({
  listName,
  onRename,
  onDelete,
}: {
  listName: string;
  onRename: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function close() {
    setOpen(false);
    setConfirming(false);
  }

  return (
    <div ref={ref} className="relative z-20 shrink-0">
      <button
        type="button"
        aria-label={`Options for ${listName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg border border-[#2a2a35] bg-white/[0.03] text-[#b4b4c4] transition-colors",
          "hover:border-[#3a3a4c] hover:bg-white/[0.08] hover:text-[#F7F7F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
          open && "border-[#3a3a4c] bg-white/[0.08] text-[#F7F7F2]",
        )}
      >
        <MoreHorizontal className="h-[18px] w-[18px]" aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full right-0 z-30 mb-1.5 w-44 overflow-hidden rounded-xl border border-[#2a2a35] bg-[#15151d] p-1 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8)]"
        >
          {confirming ? (
            <>
              <p className="px-2.5 py-2 font-[family-name:var(--font-geist-sans)] text-[13px] text-[#c2c2ce]">
                Delete this list?
              </p>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  close();
                  onDelete();
                }}
                className="flex w-full items-center rounded-lg px-2.5 py-2 text-left font-[family-name:var(--font-geist-sans)] text-[14px] font-medium text-[#f0857d] transition-colors hover:bg-[#e8453c]/12"
              >
                Delete list
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => setConfirming(false)}
                className="flex w-full items-center rounded-lg px-2.5 py-2 text-left font-[family-name:var(--font-geist-sans)] text-[14px] text-[#9a9aac] transition-colors hover:bg-white/5 hover:text-[#F7F7F2]"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  close();
                  onRename();
                }}
                className="flex w-full items-center rounded-lg px-2.5 py-2 text-left font-[family-name:var(--font-geist-sans)] text-[14px] text-[#e6e6ee] transition-colors hover:bg-white/5"
              >
                Rename
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => setConfirming(true)}
                className="flex w-full items-center rounded-lg px-2.5 py-2 text-left font-[family-name:var(--font-geist-sans)] text-[14px] text-[#e6e6ee] transition-colors hover:bg-[#e8453c]/12 hover:text-[#f0857d]"
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
