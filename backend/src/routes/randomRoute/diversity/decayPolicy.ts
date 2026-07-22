// Index zero is the most recent roll. Each table's length defines its window.
export const GENRE_DECAY = [0.15, 0.4, 0.7] as const;
export const CONTENT_TYPE_DECAY = [0.3, 0.6] as const;
export const DECADE_DECAY = [0.4, 0.7] as const;
export const DIRECTOR_DECAY = [0.5, 0.6, 0.7, 0.8, 0.9] as const;

export const RECENT_ROLL_WINDOW = DIRECTOR_DECAY.length;
