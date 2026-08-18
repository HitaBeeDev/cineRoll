"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AVATAR_OPTIONS } from "@/lib/avatars/avatar-options";
import { AVATAR_PREVIEW_COUNT } from "@/lib/avatars/avatar-preview-count";
import { orderAvatarsForPicker } from "@/lib/avatars/order-avatars-for-picker";
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

  // Always starts collapsed. The selected tile is rotated into the head row
  // instead, so one row is enough to show what you currently have.
  const [showAll, setShowAll] = useState(false);
  const [ordered, setOrdered] = useState(() =>
    orderAvatarsForPicker(AVATAR_OPTIONS, selected, AVATAR_PREVIEW_COUNT),
  );

  // Re-rotate only on collapse, never while the grid is open: reordering tiles
  // under the cursor mid-choice would make the next click land on a different
  // avatar than the one being aimed at.
  function toggle() {
    setShowAll((open) => {
      if (open) setOrdered(orderAvatarsForPicker(AVATAR_OPTIONS, selected, AVATAR_PREVIEW_COUNT));
      return !open;
    });
  }

  const head = ordered.slice(0, AVATAR_PREVIEW_COUNT);
  const rest = ordered.slice(AVATAR_PREVIEW_COUNT);

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
            onClick={toggle}
            aria-expanded={showAll}
            className="mt-1 inline-flex min-h-10 items-center gap-2 self-start rounded-lg border border-edge px-3 text-[13px] font-semibold text-fg-dim transition-colors hover:border-edge-strong hover:bg-white/[0.04] hover:text-fg-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          >
            {showAll ? "Show fewer" : `Show all avatars (${rest.length} more)`}
            {showAll ? <ChevronUp className="h-4 w-4" aria-hidden /> : <ChevronDown className="h-4 w-4" aria-hidden />}
          </button>
        </>
      )}
    </div>
  );
}
