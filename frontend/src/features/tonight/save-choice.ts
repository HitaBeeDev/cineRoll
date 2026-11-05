import type { SavedChoice } from "./saved-choice-type";
import { TONIGHT_STORAGE_KEY } from "./tonight-storage-key";

/** Remember the choice in this browser; storage blocked just means it is forgotten. */
export function saveChoice(choice: SavedChoice): void {
  try {
    window.localStorage.setItem(TONIGHT_STORAGE_KEY, JSON.stringify(choice));
  } catch {
    // Private window or blocked storage — the picker still works.
  }
}
