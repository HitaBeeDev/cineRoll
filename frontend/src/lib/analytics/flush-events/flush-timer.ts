/**
 * The pending flush timeout, boxed so the scheduler can both read and replace
 * it: an imported binding cannot be assigned, only a property of one can.
 */
export const flushTimer: { id: number | null } = { id: null };
