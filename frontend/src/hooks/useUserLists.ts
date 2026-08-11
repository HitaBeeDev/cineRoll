"use client";

import { useState } from "react";
import type { UserListSummary } from "@cineroll/types";
import { createUserList, deleteUserList, renameUserList } from "@/lib/api";
import { useToast } from "@/components/ui/toast/use-toast";

/**
 * Owns the user's collection list and its create/rename/delete mutations.
 * Renames and deletes are optimistic with server-error rollback; creates prepend
 * on success. Every path surfaces a toast, so components stay presentational.
 */
export function useUserLists(initialLists: UserListSummary[], maxLists: number) {
  const { toast } = useToast();
  const [lists, setLists] = useState(initialLists);
  const [creating, setCreating] = useState(false);
  // Lists with a rename/delete in flight. Only a second edit to the SAME list is
  // refused; edits to other lists stay free, which is why every rollback below
  // has to be a targeted inverse rather than a restored snapshot.
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const atLimit = lists.length >= maxLists;

  function setBusy(id: string, busy: boolean) {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function createList(name: string): Promise<boolean> {
    if (!name || creating || atLimit) return false;
    setCreating(true);
    try {
      const list = await createUserList(name);
      setLists((prev) => [{ ...list, previewPosters: [], containsFilm: false }, ...prev]);
      toast({ variant: "success", title: "List created", description: name });
      return true;
    } catch (error) {
      const code = (error as { code?: string })?.code;
      toast({
        variant: "error",
        title: code === "LIST_LIMIT_REACHED" ? "List limit reached" : "Couldn't create list",
        description: code === "LIST_LIMIT_REACHED" ? `Keep up to ${maxLists} lists.` : name,
      });
      return false;
    } finally {
      setCreating(false);
    }
  }

  async function renameList(id: string, name: string) {
    if (busyIds.has(id)) return;
    const previousName = lists.find((l) => l.id === id)?.name;
    if (previousName === undefined) return;

    setBusy(id, true);
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, name } : l)));
    try {
      await renameUserList(id, name);
      toast({ variant: "success", title: "List renamed", description: name });
    } catch {
      // Put back only this list's name. Restoring a whole pre-rename snapshot
      // would silently undo any other list edited while this request was open.
      setLists((prev) =>
        prev.map((l) => (l.id === id ? { ...l, name: previousName } : l)),
      );
      toast({ variant: "error", title: "Couldn't rename list", description: name });
    } finally {
      setBusy(id, false);
    }
  }

  async function deleteList(id: string, name: string) {
    if (busyIds.has(id)) return;
    const index = lists.findIndex((l) => l.id === id);
    const removed = lists[index];
    if (!removed) return;

    setBusy(id, true);
    setLists((prev) => prev.filter((l) => l.id !== id));
    try {
      await deleteUserList(id);
      toast({ title: "List deleted", description: name });
    } catch {
      // Re-insert just this list, at the position it held. Splicing into the
      // current array keeps any concurrent rename or delete of another list.
      setLists((prev) => {
        const next = [...prev];
        next.splice(Math.min(index, next.length), 0, removed);
        return next;
      });
      toast({ variant: "error", title: "Couldn't delete list", description: name });
    } finally {
      setBusy(id, false);
    }
  }

  return { lists, atLimit, creating, createList, renameList, deleteList };
}
