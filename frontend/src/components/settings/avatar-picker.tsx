"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { UserAvatar } from "@/components/user-avatar";
import { AVATAR_OPTIONS, AVATAR_PREVIEW_COUNT, DEFAULT_AVATAR } from "@/lib/avatars";
import { cn } from "@/lib/utils";

export function AvatarPicker({
  initialImage,
  name,
  email,
}: {
  initialImage: string | null;
  name: string | null;
  email: string | null;
}) {
  const { update } = useSession();
  const { toast } = useToast();
  const [selected, setSelected] = useState(initialImage ?? DEFAULT_AVATAR.id);
  const [pending, setPending] = useState(false);

  const selectedIndex = AVATAR_OPTIONS.findIndex((o) => o.id === selected);
  // Start expanded when the current pick lives past the preview, so its ring is
  // always visible.
  const [showAll, setShowAll] = useState(selectedIndex >= AVATAR_PREVIEW_COUNT);

  const head = AVATAR_OPTIONS.slice(0, AVATAR_PREVIEW_COUNT);
  const rest = AVATAR_OPTIONS.slice(AVATAR_PREVIEW_COUNT);

  async function choose(id: string) {
    if (id === selected || pending) return;
    const previous = selected;
    setSelected(id); // optimistic
    setPending(true);
    try {
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: id }),
      });
      if (!res.ok) throw new Error();
      // Refresh the session so the header/profile avatar update immediately.
      await update({ image: id });
      toast({ variant: "success", title: "Avatar updated" });
    } catch {
      setSelected(previous);
      toast({
        variant: "error",
        title: "Couldn’t update avatar",
        description: "Please try again.",
      });
    } finally {
      setPending(false);
    }
  }

  const tile = (id: string, label: string) => {
    const active = selected === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => void choose(id)}
        disabled={pending}
        aria-pressed={active}
        aria-label={label}
        title={label}
        className={cn(
          "rounded-full p-0.5 ring-2 transition-all duration-150 ease-out",
          "hover:-translate-y-0.5 hover:scale-[1.08] active:scale-95",
          "disabled:cursor-not-allowed disabled:opacity-70",
          "focus-visible:outline-none focus-visible:ring-[#e8453c]",
          active
            ? "ring-[#e8453c] shadow-[0_0_0_4px_rgba(232,69,60,0.12)]"
            : "ring-transparent hover:ring-white/20",
        )}
      >
        <UserAvatar image={id} name={name} email={email} size={44} />
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {head.map((o) => tile(o.id, o.label))}
      </div>

      {rest.length > 0 && (
        <>
          <div
            className="grid transition-[grid-template-rows] duration-500 ease-out"
            style={{ gridTemplateRows: showAll ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <div className="flex flex-wrap gap-3 pt-3">
                {rest.map((o) => tile(o.id, o.label))}
              </div>
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
