import { avatarInitials, resolveAvatar } from "@/lib/avatars";
import { cn } from "@/lib/utils";

/**
 * Renders a user's chosen avatar: a static same-origin SVG (from /public/avatars)
 * when they've picked one, or an initials monogram on a dark disc otherwise.
 * Presentational and hook-free, so it works in both server and client components.
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

  if (option) {
    return (
      <div
        role="img"
        aria-label={option.label}
        className={cn("shrink-0 rounded-full bg-cover bg-center", className)}
        style={{ width: size, height: size, backgroundImage: `url(${option.file})` }}
      />
    );
  }

  // No avatar chosen yet → calm initials monogram.
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border bg-[#12121c]",
        className,
      )}
      style={{ width: size, height: size, borderColor: "#e8453c59" }}
    >
      <span
        className="font-[family-name:var(--font-geist-mono)] font-bold tracking-wide"
        style={{ color: "#e8453c", fontSize: Math.round(size * 0.32) }}
      >
        {avatarInitials(name, email)}
      </span>
    </div>
  );
}
