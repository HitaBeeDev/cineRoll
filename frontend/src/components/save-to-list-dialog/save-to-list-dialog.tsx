"use client";

import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSaveToList } from "@/components/save-to-list-dialog/useSaveToList";
import { ListRow } from "@/components/save-to-list-dialog/list-row";
import { CreateListInline } from "@/components/save-to-list-dialog/create-list-inline";

/**
 * The "Save to list" modal shared by the film detail hero and the post-roll
 * card. Data and mutations live in `useSaveToList`; this component renders the
 * loading/error/ready states and composes the list rows and inline create form.
 * Controlled: the caller owns `open`.
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
  const { state, busyIds, creating, atLimit, toggleList, createAndAdd } = useSaveToList(
    filmId,
    filmTitle,
    open,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[500px] rounded-[20px] border-[#2a2a35] bg-[#0f0f16] p-[30px] shadow-[0_32px_80px_-24px_rgba(0,0,0,0.85)]">
        <DialogHeader className="mb-6">
          <DialogTitle className="font-[family-name:var(--font-display)] text-[26px] font-bold leading-tight text-[#F7F7F2]">
            Add to a list
          </DialogTitle>
          <DialogDescription className="mt-1.5 truncate font-[family-name:var(--font-geist-sans)] text-[14px] text-[#c2c2ce]">
            {filmTitle}
          </DialogDescription>
        </DialogHeader>

        {state.status === "loading" && (
          <div className="flex items-center justify-center py-12 text-[#9a9aac]">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          </div>
        )}

        {state.status === "error" && (
          <p className="py-10 text-center font-[family-name:var(--font-geist-sans)] text-[14px] text-[#c2c2ce]">
            We couldn’t load your lists. Close this and try again.
          </p>
        )}

        {state.status === "ready" && (
          <div className="flex flex-col">
            {state.lists.length > 0 ? (
              <>
                <p className="mb-3 font-[family-name:var(--font-geist-sans)] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a8a9c]">
                  Your lists
                </p>
                <ul className="flex max-h-[300px] flex-col gap-2.5 overflow-y-auto">
                  {state.lists.map((list) => (
                    <ListRow
                      key={list.id}
                      list={list}
                      busy={busyIds.has(list.id)}
                      onToggle={() => void toggleList(list)}
                    />
                  ))}
                </ul>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-[#2a2a35] bg-[#14141c] px-5 py-7 text-center">
                <p className="font-[family-name:var(--font-geist-sans)] text-[15px] font-medium text-[#F7F7F2]">
                  No lists yet
                </p>
                <p className="mt-1.5 font-[family-name:var(--font-geist-sans)] text-[13px] leading-relaxed text-[#9a9aac]">
                  Create your first list to save this film.
                </p>
              </div>
            )}

            <CreateListInline
              hasLists={state.lists.length > 0}
              onCreate={createAndAdd}
              creating={creating}
              atLimit={atLimit}
              maxLists={state.maxLists}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
