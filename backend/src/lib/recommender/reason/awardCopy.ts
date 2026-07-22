export const AWARD_LABELS = {
  oscar: "Oscar",
  cannes: "Cannes",
  gg: "Golden Globe",
  berlin: "Berlinale",
} as const;

export const AWARD_REASON_PHRASES: Readonly<Record<string, string>> = {
  berlin_nominee: "follow the Berlinale",
  berlin_winner: "favor Berlinale winners",
  cannes_nominee: "follow Cannes",
  cannes_winner: "favor Cannes winners",
  gg_nominee: "follow the Golden Globes",
  gg_winner: "favor Golden Globe winners",
  oscar_nominee: "follow the Oscars",
  oscar_winner: "favor Oscar winners",
};
