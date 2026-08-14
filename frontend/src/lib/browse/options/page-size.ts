// Sized to the poster grid in FILM_GRID_CLASS, which runs 2 / 3 / 4 / 5 / 6
// columns. 24 divides by 2, 3, 4 and 6, so every breakpoint but the 5-column one
// ends on a full row — and 25 was the one number that ended a row short on all
// of them except 5. Change this only alongside the grid's column steps.
export const PAGE_SIZE = 24;
