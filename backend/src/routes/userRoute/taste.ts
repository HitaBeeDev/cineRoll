import { markTasteProfileStale } from "../../lib/tasteProfile";

export function staleTasteProfile(userId: string): Promise<void> {
  return markTasteProfileStale(userId);
}
