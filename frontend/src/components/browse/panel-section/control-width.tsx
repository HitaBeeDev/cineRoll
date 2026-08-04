"use client";

/**
 * Width every boxed control in the panel snaps to.
 *
 * A band's cell is wide enough that no chip row wraps, which would otherwise
 * stretch a select to twice the width its "1994" options need. Capping them
 * keeps one field width across all three bands, so the eye reads a column of
 * controls instead of boxes of arbitrary size.
 */
export const CONTROL_WIDTH = "w-full max-w-[22rem]";
