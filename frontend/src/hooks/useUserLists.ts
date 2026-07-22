"use client";

import { useState } from "react";
import type { UserListSummary } from "@cineroll/types";
import { createUserList, deleteUserList, renameUserList } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

/**
 * Owns the user's collection list and its create/rename/delete mutations.
 * Renames and deletes are optimistic with server-error rollback; creates prepend
 * on success. Every path surfaces a toast, so components stay presentational.
 */
export function useUserLists(initialLists: UserListSummary[], maxLists: number) {
  const { toast } = useToast();
  const [lists, setLists] = useState(initialLists);
  const [creating, setCreating] = useState(false);

  const atLimit = lists.length >= maxLists;

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

  async function deleteList(id: string, name: string) {
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

  return { lists, atLimit, creating, createList, renameList, deleteList };
}
