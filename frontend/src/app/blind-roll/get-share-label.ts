import type { ShareStatus } from "./types";

export function getShareLabel(shareStatus: ShareStatus): string {
  if (shareStatus === "copied") return "Link Copied";
  if (shareStatus === "failed") return "Could Not Share";
  return "Challenge A Friend";
}
