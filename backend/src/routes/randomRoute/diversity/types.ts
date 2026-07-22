export type RecentRoll = {
  genre: string | null;
  contentType: string;
  decade: number | null;
  director: string | null;
};

export type PinnedDimensions = {
  genre: boolean;
  contentType: boolean;
  decade: boolean;
  director: boolean;
};

export type RerollPenalty = {
  genre: Record<string, number>;
  contentType: Record<string, number>;
};
