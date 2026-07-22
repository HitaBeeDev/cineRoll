"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Per-card overflow menu (Rename / Delete). Delete asks for confirmation inside
 * the menu so the destructive action is never a single tap. Closes on outside
 * click or Escape.
 */
export function CardMenu({
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
