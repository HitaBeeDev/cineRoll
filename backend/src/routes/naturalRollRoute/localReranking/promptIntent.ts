export type PromptIntent = {
  rejectsGore: boolean;
  wantsUnderrated: boolean;
};

export const detectPromptIntent = (prompt: string): PromptIntent => ({
  rejectsGore: /\b(rather than gore|not gore|no gore|less gore)\b/i.test(prompt),
  wantsUnderrated: /\b(underrated|hidden gem|obscure|overlooked)\b/i.test(prompt),
});
