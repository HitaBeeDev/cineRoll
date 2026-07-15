"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Film, ListPlus, Loader2, Plus } from "lucide-react";
import type { UserListSummary } from "@cineroll/types";
import {
  addFilmToList,
  createUserList,
  fetchUserLists,
  removeFilmFromList,
} from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { tmdbImageUrl } from "@/lib/images";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const MAX_NAME = 50;

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; lists: UserListSummary[]; maxLists: number };

/**
 * The "Save to list" modal shared by the film detail hero and the post-roll
 * card. Fetches the user's lists (with per-list membership for this film),
 * lets them toggle the film in/out of each, and create a new list inline —
 * which also drops the film into it. Controlled: the caller owns `open`.
 */
export function SaveToListDialog({
  filmId,
  filmTitle,
  open,
  onOpenChange,
}: {
  filmId: string;
  filmTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  // Create form stays collapsed behind a link until the user wants it, keeping
  // the modal focused on picking an existing list.
  const [showCreate, setShowCreate] = useState(false);
  // Lists mid-toggle, so their rows disable without freezing the whole modal.
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement | null>(null);

  // (Re)load whenever the dialog opens, so membership reflects any change made
  // since it was last viewed.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setNewName("");
    setShowCreate(false);
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

  function patchList(id: string, fn: (l: UserListSummary) => UserListSummary) {
    setState((prev) =>
      prev.status === "ready"
        ? { ...prev, lists: prev.lists.map((l) => (l.id === id ? fn(l) : l)) }
        : prev,
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name || creating || state.status !== "ready") return;
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
      setNewName("");
      setShowCreate(false);
      toast({ variant: "success", title: `Saved to ${name}`, description: filmTitle });
    } catch (error) {
      const code = (error as { code?: string })?.code;
      toast({
        variant: "error",
        title:
          code === "LIST_LIMIT_REACHED"
            ? "List limit reached"
            : "Couldn't create list",
        description:
          code === "LIST_LIMIT_REACHED"
            ? "Delete a list to make room for a new one."
            : name,
      });
    } finally {
      setCreating(false);
    }
  }

  const atLimit = state.status === "ready" && state.lists.length >= state.maxLists;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm border-[#1e1e2a] bg-[#09090f]">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#F5F5F0]">
            Add to a list
          </DialogTitle>
          <DialogDescription className="truncate font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#b4b4c4]">
            {filmTitle}
          </DialogDescription>
        </DialogHeader>

        {state.status === "loading" && (
          <div className="flex items-center justify-center py-10 text-[#888899]">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          </div>
        )}

        {state.status === "error" && (
          <p className="py-8 text-center font-[family-name:var(--font-geist-mono)] text-[12px] text-[#9a9aac]">
            Couldn’t load your lists. Close this and try again.
          </p>
        )}

        {state.status === "ready" && (
          <div className="flex flex-col gap-4">
            {state.lists.length > 0 ? (
              <ul className="flex max-h-64 flex-col gap-2.5 overflow-y-auto pr-1">
                {state.lists.map((list) => {
                  const busy = busyIds.has(list.id);
                  const cover = list.previewPosters[0];
                  return (
                    <li key={list.id} className="flex flex-col">
                      <button
                        type="button"
                        disabled={busy}
                        aria-pressed={list.containsFilm}
                        onClick={() => void toggleList(list)}
                        className={cn(
                          "flex min-h-[44px] w-full items-center gap-3 rounded-lg border px-2.5 py-2 text-left transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] disabled:opacity-60",
                          list.containsFilm
                            ? "border-[#e8453c]/40 bg-[#e8453c]/[0.07]"
                            : "border-[#1e1e2a] bg-[#0d0d16] hover:border-[#2a2a3c] hover:bg-[#11111c]",
                        )}
                      >
                        <span className="relative flex h-11 w-8 shrink-0 items-center justify-center overflow-hidden rounded bg-[#08080d] ring-1 ring-black/50">
                          {cover ? (
                            <Image
                              src={tmdbImageUrl(cover, "w185") ?? cover}
                              alt=""
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          ) : (
                            <Film className="h-4 w-4 text-[#4a4a5c]" aria-hidden />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-[#F5F5F0]">
                            {list.name}
                          </span>
                          <span className="block font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-[#9a9aac]">
                            {list.filmCount} {list.filmCount === 1 ? "film" : "films"}
                            {list.containsFilm && (
                              <> · <span className="text-[#f0857d]">Saved</span></>
                            )}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                            list.containsFilm
                              ? "border-[#e8453c] bg-[#e8453c] text-white"
                              : "border-[#3a3a4c] text-transparent",
                          )}
                          aria-hidden
                        >
                          {busy ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#9a9aac]" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                        </span>
                      </button>
                      <Link
                        href={`/profile/lists/${list.id}`}
                        className="mt-1 inline-flex w-fit items-center gap-1 self-start rounded pl-[3px] font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-[#9a9aac] underline-offset-2 transition-colors hover:text-[#e8453c] hover:underline focus-visible:text-[#e8453c] focus-visible:underline focus-visible:outline-none"
                      >
                        Open list <ArrowUpRight className="h-3 w-3" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="rounded-lg border border-dashed border-[#22222e] bg-[#0b0b12] px-4 py-6 text-center">
                <p className="font-[family-name:var(--font-geist-mono)] text-[12px] leading-relaxed text-[#b4b4c4]">
                  You don’t have any lists yet.
                </p>
                <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[11px] leading-relaxed text-[#9a9aac]">
                  Create your first list to save this film.
                </p>
              </div>
            )}

            {/* Create — collapsed behind a link, revealed on demand. Creating a
                list also drops this film into it. */}
            <div className="border-t border-[#1e1e2a] pt-4">
              {!showCreate && state.lists.length > 0 ? (
                <button
                  type="button"
                  disabled={atLimit}
                  onClick={() => setShowCreate(true)}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-1 font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c8c8d4] transition-colors hover:text-[#e8453c] focus-visible:text-[#e8453c] focus-visible:outline-none disabled:cursor-not-allowed disabled:text-[#5a5a6c]"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  Create a new list
                </button>
              ) : (
                <form onSubmit={handleCreate} className="flex flex-col gap-2">
                  <label
                    htmlFor="new-list-name"
                    className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.18em] text-[#9a9aac]"
                  >
                    Create a new list
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      id="new-list-name"
                      autoFocus
                      value={newName}
                      onChange={(e) => setNewName(e.target.value.slice(0, MAX_NAME))}
                      disabled={atLimit || creating}
                      maxLength={MAX_NAME}
                      placeholder="e.g. Weekend watchlist"
                      className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-[#1e1e2a] bg-[#0d0d16] px-3 py-2.5 text-[13px] text-[#F5F5F0] placeholder:text-[#6f6f82] focus:border-[#e8453c]/60 focus:outline-none disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!newName.trim() || atLimit || creating}
                      className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-lg bg-[#e8453c] px-4 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#d5342b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] disabled:cursor-not-allowed disabled:bg-[#2a2a3c] disabled:text-[#7a7a8c]"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                          Creating…
                        </>
                      ) : (
                        "Create"
                      )}
                    </button>
                  </div>
                  {atLimit && (
                    <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.14em] text-[#9a9aac]">
                      List limit reached ({state.maxLists}). Delete one to add more.
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * The trigger button + dialog wired together. Guests get a sign-in nudge toast
 * instead of the modal (lists need an account to persist).
 */
export function SaveToListButton({
  filmId,
  filmTitle,
  isAuthenticated,
  className,
  label = "Add to list",
  iconOnly = false,
}: {
  filmId: string;
  filmTitle: string;
  isAuthenticated: boolean;
  className?: string;
  label?: string;
  iconOnly?: boolean;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={iconOnly ? label : undefined}
        onClick={() => {
          if (!isAuthenticated) {
            toast({
              variant: "signin",
              title: "Sign in to save to lists",
              description: "Create a profile to build your own lists.",
              action: { label: "Sign in", href: "/auth/signin" },
              duration: 10000,
            });
            return;
          }
          setOpen(true);
        }}
        className={className}
      >
        <ListPlus className="h-4 w-4" aria-hidden />
        {!iconOnly && label}
      </button>
      {isAuthenticated && (
        <SaveToListDialog
          filmId={filmId}
          filmTitle={filmTitle}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
  );
}
