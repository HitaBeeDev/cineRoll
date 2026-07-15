export const EXAMPLE_PROMPTS = [
  "Something sad but beautiful",
  "A dark French thriller from the 80s",
  "Something uplifting that won Best Picture",
  "The most obscure Cannes winner you have",
  "Hidden gem sci-fi from the 90s",
  "A film my dad would love",
] as const;

export const PROMPT_PLACEHOLDER = [
  "Describe the film you want tonight...",
  "Try: Something sad but beautiful",
  "Or: Une comedie francaise des annees 90",
  "Or: Ein ruhiger Oscar-Gewinner mit Drama",
].join("\n");

export const PROMPT_MAX_LENGTH = 500;
