"use client";

import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

export function AvatarTile({
  id,
  label,
  name,
  email,
  active,
  disabled,
  onSelect,
}: {
  id: string;
  label: string;
  name: string | null;
  email: string | null;
  active: boolean;
  disabled: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      disabled={disabled}
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
}
