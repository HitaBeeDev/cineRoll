"use client";

import { UserAvatar } from "@/components/user-avatar";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

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
        "relative rounded-full p-0.5 ring-2 transition-all duration-150 ease-out",
        "hover:-translate-y-0.5 hover:scale-[1.08] active:scale-95",
        "disabled:cursor-not-allowed disabled:opacity-70",
        "focus-visible:outline-none focus-visible:ring-accent",
        active
          ? "ring-white/70"
          : "ring-transparent hover:ring-white/20",
      )}
    >
      <UserAvatar image={id} name={name} email={email} size={44} />
      {active && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink-850 bg-accent text-white">
          <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
        </span>
      )}
    </button>
  );
}
