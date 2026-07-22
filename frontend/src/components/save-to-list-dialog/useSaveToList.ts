"use client";

import { useEffect, useState } from "react";
import type { UserListSummary } from "@cineroll/types";
import {
  addFilmToList,
  createUserList,
  fetchUserLists,
  removeFilmFromList,
} from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import type { LoadState } from "@/components/save-to-list-dialog/types";

/**
 * Data + mutations for the "Save to list" dialog. (Re)loads the user's lists
 * (with per-film membership) whenever the dialog opens, toggles the film in/out
 * of a list optimistically, and creates a new list that the film is added to.
 */
export function useSaveToList(filmId: string, filmTitle: string, open: boolean) {
  const { toast } = useToast();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [creating, setCreating] = useState(false);
  // Lists mid-toggle, so their rows disable without freezing the whole modal.
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  // (Re)load whenever the dialog opens, so membership reflects any change made
  // since it was last viewed.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      setState({ status: "loading" });
      try {
        const res = await fetchUserLists(filmId);
        if (!cancelled) setState({ status: "ready", lists: res.lists, maxLists: res.maxLists });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [open, filmId]);

  function setBusy(id: string, busy: boolean) {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function patchList(id: string, fn: (l: UserListSummary) => UserListSummary) {
    setState((prev) =>
      prev.status === "ready"
        ? { ...prev, lists: prev.lists.map((l) => (l.id === id ? fn(l) : l)) }
        : prev,
    );
  }

  async function toggleList(list: UserListSummary) {
    if (state.status !== "ready" || busyIds.has(list.id)) return;
    const adding = !list.containsFilm;
    setBusy(list.id, true);

    // Optimistic membership + count flip; revert on failure.
    patchList(list.id, (l) => ({
      ...l,
      containsFilm: adding,
      filmCount: l.filmCount + (adding ? 1 : -1),
    }));

    try {
      if (adding) await addFilmToList(list.id, filmId);
      else await removeFilmFromList(list.id, filmId);
      toast({
        variant: adding ? "success" : "default",
        title: adding ? `Added to ${list.name}` : `Removed from ${list.name}`,
        description: filmTitle,
      });
    } catch (error) {
      const code = (error as { code?: string })?.code;
      // Already-present (adding) / already-gone (removing) are benign — keep the
      // optimistic state; anything else reverts.
      if (code !== "LIST_ENTRY_ALREADY_EXISTS" && code !== "LIST_ENTRY_NOT_FOUND") {
        patchList(list.id, (l) => ({
          ...l,
          containsFilm: !adding,
          filmCount: l.filmCount + (adding ? -1 : 1),
        }));
        toast({ variant: "error", title: "Couldn't update list", description: list.name });
      }
    } finally {
      setBusy(list.id, false);
    }
  }

  async function createAndAdd(name: string): Promise<boolean> {
    if (!name || creating || state.status !== "ready") return false;
    setCreating(true);
    try {
      const list = await createUserList(name);
      // A brand-new list starts empty; immediately add this film to it.
      await addFilmToList(list.id, filmId);
      setState((prev) =>
        prev.status === "ready"
          ? {
              ...prev,
              lists: [
                { ...list, previewPosters: [], containsFilm: true, filmCount: 1 },
                ...prev.lists,
              ],
            }
          : prev,
      );
      toast({ variant: "success", title: `Saved to ${name}`, description: filmTitle });
      return true;
    } catch (error) {
      const code = (error as { code?: string })?.code;
      toast({
        variant: "error",
        title: code === "LIST_LIMIT_REACHED" ? "List limit reached" : "Couldn't create list",
        description:
          code === "LIST_LIMIT_REACHED"
            ? "Delete a list to make room for a new one."
            : name,
      });
      return false;
    } finally {
      setCreating(false);
    }
  }

  const atLimit = state.status === "ready" && state.lists.length >= state.maxLists;

  return { state, busyIds, creating, atLimit, toggleList, createAndAdd };
}
