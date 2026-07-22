import { Globe, PawPrint, TreePalm } from "lucide-react";
import type { AwardBodyFilter } from "@cineroll/types";

function OscarIcon() {
  return (
    <svg
      viewBox="0 0 14 14"
      width="14"
      height="14"
      fill="currentColor"
      aria-hidden
      className="shrink-0"
    >
      <circle cx="7" cy="1.8" r="1.4" />
      <path d="M5.5 3.2 L5 8.5 L9 8.5 L8.5 3.2 Z" />
      <rect x="4" y="8.5" width="6" height="1.5" rx="0.3" />
      <rect x="3" y="10" width="8" height="1.8" rx="0.3" />
      <rect x="2" y="11.8" width="10" height="1.5" rx="0.3" />
    </svg>
  );
}

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
