"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { updateAvatar } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { DEFAULT_AVATAR } from "@/lib/avatars";

/**
 * Tracks the selected avatar and persists a new pick optimistically, refreshing
 * the session so the header/profile avatar updates immediately.
 */
export function useAvatarPicker(initialImage: string | null) {
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
      await updateAvatar(id);
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

  return { selected, pending, choose };
}
