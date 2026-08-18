import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The heading every Settings card shares.
 *
 * The page used to title each card with the same 11px uppercase mono kicker, so
 * a whole password form and a row of avatars announced themselves at identical
 * weight and the page scanned as one flat list. The kicker is demoted to an
 * eyebrow — a category label above the title, which is what that treatment is
 * good at — and the real heading carries the size.
 */
export function SectionHeading({
  eyebrow,
  title,
  aside,
  tone = "default",
}: {
  eyebrow?: string;
  title: string;
  /** Right-aligned meta on the title line, e.g. "saves instantly". */
  aside?: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <div>
      {eyebrow && (
        <p
          className={cn(
            "font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em]",
            tone === "danger" ? "text-accent-soft" : "text-fg-faint",
          )}
        >
          {eyebrow}
        </p>
      )}
      <div className={cn("flex items-baseline justify-between gap-3", eyebrow && "mt-1.5")}>
        <h2 className="text-[15px] font-semibold text-fg-hi">{title}</h2>
        {aside}
      </div>
    </div>
  );
}
