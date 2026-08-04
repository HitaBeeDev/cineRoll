import type { QueuedEvent } from "../types";

/**
 * The pending-event buffer — a box holding the array, rather than the array
 * itself.
 *
 * Five modules read and replace this queue, and an ES module binding cannot be
 * assigned from outside the file that declares it: `events = []` in another file
 * is a compile error, not a stale write. So the mutable part has to be a
 * property of something exported instead of the export itself.
 */
export const events: { queued: QueuedEvent[] } = { queued: [] };
