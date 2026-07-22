"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import type { UserListSummary } from "@cineroll/types";
import { tmdbImageUrl } from "@/lib/images";
import { CardMenu } from "@/components/lists-manager/card-menu";
import { MAX_NAME } from "@/components/lists-manager/constants";

/** A single collection card: poster-collage cover, name/count, inline rename,
 *  overflow menu, and a stretched link that opens the list. */
export function ListCard({
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
