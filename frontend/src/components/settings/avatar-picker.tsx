"use client";

import { useState } from "react";
import { AVATAR_OPTIONS, AVATAR_PREVIEW_COUNT } from "@/lib/avatars";
import { AvatarTile } from "./avatar-tile";
import { useAvatarPicker } from "./use-avatar-picker";

export function AvatarPicker({
  initialImage,
  name,
  email,
}: {
  initialImage: string | null;
  name: string | null;
  email: string | null;
}) {
  const { selected, pending, choose } = useAvatarPicker(initialImage);

  const selectedIndex = AVATAR_OPTIONS.findIndex((o) => o.id === selected);
  // Start expanded when the current pick lives past the preview, so its ring is
  // always visible.
  const [showAll, setShowAll] = useState(selectedIndex >= AVATAR_PREVIEW_COUNT);

  const head = AVATAR_OPTIONS.slice(0, AVATAR_PREVIEW_COUNT);
  const rest = AVATAR_OPTIONS.slice(AVATAR_PREVIEW_COUNT);

  const renderTile = (option: { id: string; label: string }) => (
    <AvatarTile
      key={option.id}
      id={option.id}
      label={option.label}
      name={name}
      email={email}
      active={selected === option.id}
      disabled={pending}
      onSelect={choose}
    />
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">{head.map(renderTile)}</div>

      {rest.length > 0 && (
        <>
          <div
            className="grid transition-[grid-template-rows] duration-500 ease-out"
            style={{ gridTemplateRows: showAll ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <div className="flex flex-wrap gap-3 pt-3">{rest.map(renderTile)}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            aria-expanded={showAll}
            className="mt-1 self-start text-[13px] font-medium text-[#9a9aae] underline-offset-4 transition-colors hover:text-[#F5F5F0] hover:underline focus-visible:outline-none focus-visible:underline"
          >
            {showAll ? "Show fewer" : `Show all avatars (${rest.length} more)`}
          </button>
        </>
      )}
    </div>
  );
}
