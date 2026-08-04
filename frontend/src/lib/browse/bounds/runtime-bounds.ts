/**
 * The non-year min/max pair — runtime in minutes.
 *
 * Picking "≥ 2h" while a "≤ 90m" cap is set has to do something with the cap:
 * kept, it is a filter that can only ever return nothing.
 *
 * It used to be dragged up to meet the floor, which reads as helpful and is not.
 * "≥ 2h" with the cap pulled to 2h asks for films of exactly 120 minutes — a
 * narrower answer than the click asked for, and a strange one to explain. So the
 * contradicting bound is dropped instead: the click is taken at face value, and
 * the other end goes back to unset, the one state that cannot argue with it.
 *
 * Either way something the user chose disappears, which is the part that was
 * actually wrong before — it happened in silence, so the chip looked like it had
 * deselected itself. film-band now says which bound went and why.
 */

export type RuntimeBounds = { runtimeMin: number | null; runtimeMax: number | null };
