"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { UserAvatar } from "@/components/user-avatar";
import { AVATAR_OPTIONS, DEFAULT_AVATAR } from "@/lib/avatars";
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
    <div className="flex flex-wrap gap-3">
      {AVATAR_OPTIONS.map((option) => {
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
  );
}
