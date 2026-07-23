import { Globe, PawPrint, TreePalm } from "lucide-react";
import type { AwardBodyFilter } from "@cineroll/types";
import { OscarIcon } from "@/components/filter-bar/oscar-icon";

/** The glyph that precedes each award-body pill label. */
export function AwardBodyIcon({ body }: { body: AwardBodyFilter }) {
  switch (body) {
    case "oscar":
      return <OscarIcon />;
    case "goldenglobe":
      return <Globe className="h-[14px] w-[14px] shrink-0" aria-hidden />;
    case "cannes":
      return <TreePalm className="h-[14px] w-[14px] shrink-0" aria-hidden />;
    case "berlin":
      return <PawPrint className="h-[14px] w-[14px] shrink-0" aria-hidden />;
    default:
      return null;
  }
}
