export type AwardHighlight = {
  /** Plural, as the body is named in a list: "Oscars", "Golden Globes". */
  label: string;
  /** Singular, for counting sentences: "1 Oscar win, 3 nominations". */
  singular: string;
  wins: number;
  nominations: number;
  rank?: number;
};
