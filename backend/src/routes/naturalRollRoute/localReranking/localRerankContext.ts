import type { PromptIntent } from "./promptIntent";

export type LocalRerankContext = {
  promptTokens: Set<string>;
  expandedTerms: Set<string>;
  promptIntent: PromptIntent;
};
