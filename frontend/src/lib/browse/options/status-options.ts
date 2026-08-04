import type { AwardStatus } from "./award-status";

export const STATUS_OPTIONS: { value: AwardStatus; label: string }[] = [
  { value: "any", label: "All"       },
  { value: "won", label: "Winner"    },
  { value: "nom", label: "Nominated" },
];
