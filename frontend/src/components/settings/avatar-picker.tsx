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
  const [showAll, setShowAll] = useState(false);

  // Collapsed = one row (AVATAR_PREVIEW_COUNT). If the current pick falls beyond
  // that, swap it into the last visible slot so it still shows — without adding
  // a second row.
  const selectedIndex = AVATAR_OPTIONS.findIndex((o) => o.id === selected);
  let visible: readonly (typeof AVATAR_OPTIONS)[number][];
  if (showAll) {
    visible = AVATAR_OPTIONS;
  } else {
    const head = AVATAR_OPTIONS.slice(0, AVATAR_PREVIEW_COUNT);
    if (selectedIndex >= AVATAR_PREVIEW_COUNT) {
      visible = [...head.slice(0, AVATAR_PREVIEW_COUNT - 1), AVATAR_OPTIONS[selectedIndex]!];
    } else {
      visible = head;
    }
  }
  const hiddenCount = AVATAR_OPTIONS.length - (showAll ? AVATAR_OPTIONS.length : AVATAR_PREVIEW_COUNT);

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {visible.map((option) => {
          const active = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => void choose(option.id)}
              disabled={pending}
              aria-pressed={active}
              aria-label={option.label}
              title={option.label}
              className={cn(
                "rounded-full p-0.5 ring-2 transition disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-[#e8453c]",
                active ? "ring-[#e8453c]" : "ring-transparent hover:ring-white/20",
              )}
            >
              <UserAvatar image={option.id} name={name} email={email} size={44} />
            </button>
          );
        })}
      </div>

      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="self-start rounded-full border border-white/15 px-4 py-1.5 text-sm font-medium text-white/80 transition hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
        >
          View more ({hiddenCount})
        </button>
      )}
      {showAll && AVATAR_OPTIONS.length > AVATAR_PREVIEW_COUNT && (
        <button
          type="button"
          onClick={() => setShowAll(false)}
          className="self-start text-sm font-medium text-white/50 transition hover:text-white/80 focus-visible:outline-none focus-visible:underline"
        >
          Show less
        </button>
      )}
    </div>
  );
}
