import { Clapperboard, Film, Star, Ticket, type LucideIcon } from "lucide-react";
import { avatarInitials, resolveAvatar } from "@/lib/avatars";
import { cn } from "@/lib/utils";

const GLYPH_ICONS: Record<string, LucideIcon> = {
  "glyph:reel": Film,
  "glyph:clap": Clapperboard,
  "glyph:ticket": Ticket,
  "glyph:star": Star,
};

/**
 * Renders a user's chosen avatar: a calm dark disc with a thin accent ring,
 * holding either a colored initials monogram or a film-motif glyph. Presentational
 * and hook-free, so it works in both server and client components. Sizing (and
 * the accent color) are inline because they're per-instance/runtime values.
 */
export function UserAvatar({
  image,
  name,
  email,
  size = 56,
  className,
}: {
  image?: string | null | undefined;
  name?: string | null | undefined;
  email?: string | null | undefined;
  size?: number;
  className?: string;
}) {
  const option = resolveAvatar(image);
  const Icon = GLYPH_ICONS[option.id];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border bg-[#12121c]",
        className,
      )}
      style={{ width: size, height: size, borderColor: `${option.accent}59` }}
    >
      {option.kind === "glyph" && Icon ? (
        <Icon size={Math.round(size * 0.42)} style={{ color: option.accent }} aria-hidden />
      ) : (
        <span
          className="font-[family-name:var(--font-geist-mono)] font-bold tracking-wide"
          style={{ color: option.accent, fontSize: Math.round(size * 0.32) }}
        >
          {avatarInitials(name, email)}
        </span>
      )}
    </div>
  );
}
