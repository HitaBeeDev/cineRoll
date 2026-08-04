import { Award } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatAwardHighlight } from "@/components/home/film-card/awards/format-award-highlight";
import type { AwardHighlight } from "@/components/home/film-card/awards/award-highlight";

/**
 * Why this film is in CineRoll, in one line.
 *
 * It replaces a bordered gold panel that stated the same thing in about six
 * times the height: a heading, a ruled row per body, and a large number beside
 * an abbreviation. The card said recognition twice — once up here at full
 * volume, once again as "Recognized for" below — so this half is now the
 * summary and that half is the record: which categories, which years, won or
 * nominated. Wins read bright, nominations recede, and neither needs a box.
 */
export function RecognitionSummary({ highlights }: { highlights: AwardHighlight[] }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] leading-[1.5]">
      <Award className="h-4 w-4 shrink-0 text-[#D4AF37]" aria-hidden />
      {highlights.map((highlight, index) => (
        <span key={highlight.label} className="flex items-center gap-2">
          {index > 0 && (
            <span aria-hidden className="text-[#6e6e80]">
              ·
            </span>
          )}
          <span
            className={cn(
              highlight.wins > 0 || highlight.rank != null ? "text-[#ECE7D6]" : "text-[#b6b6c4]",
            )}
          >
            {formatAwardHighlight(highlight)}
          </span>
        </span>
      ))}
    </p>
  );
}
