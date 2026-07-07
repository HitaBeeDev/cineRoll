"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import type { UserListSummary } from "@cineroll/types";
import { createUserList, deleteUserList, renameUserList } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { tmdbImageUrl } from "@/lib/images";

const MAX_NAME = 50;

/**
 * The lists overview: create a list, and see / rename / delete existing ones.
 * Each card links through to the list's own page. State is optimistic with
 * server-error rollback, mirroring the watchlist grid's behaviour.
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

  const atLimit = lists.length >= maxLists;

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
    <div className="mt-8">
      <form onSubmit={handleCreate} className="flex items-center gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value.slice(0, MAX_NAME))}
          disabled={atLimit || creating}
          maxLength={MAX_NAME}
          placeholder={atLimit ? `List limit reached (${maxLists})` : "Create a new list…"}
          aria-label="New list name"
          className="min-w-0 flex-1 rounded-xl border border-[#1e1e2a] bg-[#0d0d16] px-4 py-3 text-[14px] text-[#F5F5F0] placeholder:text-[#5a5a6c] focus:border-[#e8453c]/50 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!newName.trim() || atLimit || creating}
          className="inline-flex h-[50px] shrink-0 items-center gap-2 rounded-xl bg-[#e8453c] px-5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
          Create
        </button>
      </form>

      {lists.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#1e1e2a] bg-[#0d0d1a] px-6 py-16 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#F5F5F0]">
            No lists yet
          </h2>
          <p className="mx-auto max-w-md font-[family-name:var(--font-geist-mono)] text-[13px] leading-relaxed text-[#9a9aac]">
            Create a list above, then add films to it from any roll or film page.
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))}
        </ul>
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
  const [confirmDelete, setConfirmDelete] = useState(false);

  function commitRename(e: React.FormEvent) {
    e.preventDefault();
    const name = draft.trim();
    setEditing(false);
    if (name && name !== list.name) onRename(list.id, name);
    else setDraft(list.name);
  }

  return (
    <li className="group relative overflow-hidden rounded-xl border border-[#1e1e2a] bg-[#0d0d16] transition-colors hover:border-[#2a2a3c]">
      <Link href={`/profile/lists/${list.id}`} className="block focus:outline-none">
        {/* Cover: up to four recent posters, or a placeholder band. */}
        <div className="flex h-28 gap-px overflow-hidden bg-[#08080d]">
          {list.previewPosters.length > 0 ? (
            list.previewPosters.slice(0, 4).map((poster, i) => (
              <div key={i} className="relative h-full flex-1">
                <Image
                  src={tmdbImageUrl(poster, "w185") ?? poster}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>
            ))
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.3em] text-[#4a4a5c]">
                Empty list
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2 px-4 py-3">
        {editing ? (
          <form onSubmit={commitRename} className="flex flex-1 items-center gap-1.5">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MAX_NAME))}
              onBlur={commitRename}
              maxLength={MAX_NAME}
              aria-label="List name"
              className="min-w-0 flex-1 rounded border border-[#2a2a3c] bg-[#08080d] px-2 py-1 text-[14px] text-[#F5F5F0] focus:border-[#e8453c]/60 focus:outline-none"
            />
            <button type="submit" aria-label="Save name" className="shrink-0 text-[#7ee787] hover:text-[#3fb950]">
              <Check className="h-4 w-4" aria-hidden />
            </button>
          </form>
        ) : (
          <Link href={`/profile/lists/${list.id}`} className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-semibold text-[#F5F5F0]">{list.name}</h3>
            <p className="mt-0.5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-[#7a7a8c]">
              {list.filmCount} {list.filmCount === 1 ? "film" : "films"}
            </p>
          </Link>
        )}

        {!editing && (
          <div className="flex shrink-0 items-center gap-1">
            {confirmDelete ? (
              <>
                <button
                  type="button"
                  aria-label="Confirm delete list"
                  onClick={() => onDelete(list.id, list.name)}
                  className="inline-flex h-7 items-center rounded px-2 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.14em] text-[#e8453c] hover:bg-[#e8453c]/10"
                >
                  Delete
                </button>
                <button
                  type="button"
                  aria-label="Cancel delete"
                  onClick={() => setConfirmDelete(false)}
                  className="text-[#7a7a8c] hover:text-[#F5F5F0]"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  aria-label={`Rename ${list.name}`}
                  onClick={() => {
                    setDraft(list.name);
                    setEditing(true);
                  }}
                  className="inline-flex h-7 w-7 items-center justify-center rounded text-[#7a7a8c] transition-colors hover:bg-[#11111c] hover:text-[#F5F5F0]"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${list.name}`}
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded text-[#7a7a8c] transition-colors hover:bg-[#11111c] hover:text-[#e8453c]"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
